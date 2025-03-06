'use client';

import { useState, useEffect } from 'react';
import { DashboardView } from '@/components/layouts/DashboardView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Upload, FileText, Building2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { Input } from '@/components/ui/input';
import { contractService } from '@/services/contractService';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import type { Contract } from '@/types/contract';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Funções auxiliares
const parseNumber = (value: any): number | null => {
  if (!value) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'sim' || value.toLowerCase() === 'ok';
  }
  return false;
};

export default function ContractsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await contractService.getAllContracts();
      setContracts(data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contratos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Iniciando leitura do arquivo...');
      const data = await readExcelFile(file);
      console.log('Dados lidos:', data?.length || 0, 'registros');

      const formattedData = formatExcelData(data);
      console.log('Dados formatados:', formattedData?.length || 0, 'registros válidos');

      if (!formattedData?.length) {
        throw new Error('Nenhum registro válido encontrado no arquivo');
      }

      // Buscar contratos existentes para separar entre criar e atualizar
      const existingContracts = await contractService.getAllContracts();
      const existingIds = new Set(existingContracts.map(c => c.idContrato));

      const toCreate = formattedData.filter(c => !existingIds.has(c.idContrato));
      const toUpdate = formattedData.filter(c => existingIds.has(c.idContrato));

      console.log('Contratos para criar:', toCreate.length);
      console.log('Contratos para atualizar:', toUpdate.length);

      const result = await contractService.createBulkContracts({
        create: toCreate,
        update: toUpdate
      });

      setSuccess(`Importação concluída! ${result.results.created.length} contratos criados e ${result.results.updated.length} contratos atualizados.`);
      toast({
        title: "Sucesso!",
        description: `${result.results.created.length} contratos criados e ${result.results.updated.length} atualizados.`,
      });
      
      await fetchContracts();
    } catch (error: any) {
      console.error('Erro na importação:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao importar dados';
      setError(errorMessage);
      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  const readExcelFile = async (file: File) => {
    try {
      console.log('Lendo arquivo:', file.name);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Dados lidos:', jsonData.length, 'linhas');
      console.log('Primeira linha:', jsonData[0]);
      
      return jsonData;
    } catch (error) {
      console.error('Erro ao ler arquivo Excel:', error);
      throw new Error('Erro ao ler arquivo: ' + (error as Error).message);
    }
  };

  const formatExcelData = (data: any[]): Omit<Contract, '_id' | 'createdAt' | 'updatedAt'>[] => {
    return data
      .map(row => {
        const idContrato = row['ID Contrato']?.toString().trim();
        if (!idContrato) return null;

        // Função auxiliar para formatar datas
        const formatDate = (date: any): Date | undefined => {
          if (!date) return undefined;
          try {
            return new Date(date);
          } catch {
            return undefined;
          }
        };

        const unidadeZenith = row['Unidade Zenith']?.toString().trim() || '';

        return {
          idContrato,
          id: idContrato,
          accountId: user?.accountId || '',
          unidades: [unidadeZenith],
          isAssigned: true,
          timestamp: new Date(),
          nomeCompleto: row['Nome Completo']?.toString().trim() || '',
          funcao: row['Função']?.toString().trim() || '',
          cargo: row['Cargo']?.toString().trim() || '',
          tipoContrato: row['Tipo Contrato']?.toString().trim() || '',
          regimeContratacao: row['Regime Contratação']?.toString().trim() || '',
          horasSemana: parseNumber(row['Horas Semana']) || 0,
          tempoContratoMeses: parseNumber(row['Tempo Contrato Meses']) || 0,
          dataInicio: formatDate(row['Data Início']) || new Date(),
          dataRenovacao1: formatDate(row['Data Renovação 1']),
          dataRenovacao2: formatDate(row['Data Renovação 2']),
          dataFim: formatDate(row['Data Fim']),
          iniciativaDesligamento: row['Iniciativa Desligamento']?.toString() || '',
          valorTotalBruto: parseNumber(row['Valor Total Bruto']) || 0,
          ordenadoBase: parseNumber(row['Ordenado Base']) || 0,
          subsidioAlimentacao: parseNumber(row['Subsídio Alimentação']) || 0,
          subsidioFerias: parseNumber(row['Subsídio Férias']) || 0,
          subsidioNatal: parseNumber(row['Subsídio Natal']) || 0,
          auxilioTransporte: parseNumber(row['Auxílio Transporte']) || 0,
          ajudaCusto: parseNumber(row['Ajuda Custo']) || 0,
          bonificacaoFixa: parseNumber(row['Bonificação Fixa']) || 0,
          bonificacaoVarMax: parseNumber(row['Bonificação Variável Máx']) || 0,
          regrasBonificacaoVar: row['Regras Bonificação Var']?.toString() || '',
          valorHora: parseNumber(row['Valor Hora']) || 0,
          diasDireito: parseNumber(row['Dias Direito']) || 0,
          feriasGozadas: parseNumber(row['Férias Gozadas']) || 0,
          feriasPorGozar: parseNumber(row['Férias Por Gozar']) || 0,
          feriasAnoVigente: parseNumber(row['Férias Ano Vigente']) || 0,
          empresa: row['Empresa']?.toString().trim() || '',
          contratoDigital: parseBoolean(row['Contrato Digital']),
          transport: parseBoolean(row['Transporte']),
          observacoes: row['Observações']?.toString() || '',
          activo: parseBoolean(row['Ativo'])
        };
      })
      .filter((contract): contract is NonNullable<typeof contract> => 
        contract !== null && 
        contract.idContrato !== '' &&
        contract.nomeCompleto.trim() !== '' &&
        contract.unidades.length > 0 &&
        contract.funcao.trim() !== '' &&
        contract.cargo.trim() !== '' &&
        contract.tipoContrato.trim() !== '' &&
        contract.regimeContratacao.trim() !== '' &&
        contract.horasSemana > 0 &&
        contract.empresa.trim() !== ''
      );
  };

  const handleDownloadTemplate = () => {
    try {
      const template = [
        {
          // ID e Chaves
          'ID Contrato': 'CONT001', // Exemplo de ID
          
          // Informações do Funcionário
          'Nome Completo': 'João Silva Santos',
          'Unidade Zenith': 'Unidade Centro',
          'Função': 'Cozinheiro',
          'Cargo': 'Cozinheiro Chefe',
          
          // Detalhes do Contrato
          'Tipo Contrato': 'CLT',
          'Regime Contratação': 'Integral',
          'Horas Semana': '44',
          'Tempo Contrato Meses': '12',
          
          // Datas
          'Data Início': '2024-01-15',
          'Data Renovação 1': '2025-01-15',
          'Data Renovação 2': '2026-01-15',
          'Data Fim': '2027-01-15',
          'Iniciativa Desligamento': 'N/A',
          
          // Informações Financeiras
          'Valor Total Bruto': '4500.00',
          'Ordenado Base': '3500.00',
          'Subsídio Alimentação': '500.00',
          'Subsídio Férias': '3500.00',
          'Subsídio Natal': '3500.00',
          'Auxílio Transporte': '200.00',
          'Ajuda Custo': '300.00',
          'Bonificação Fixa': '200.00',
          'Bonificação Variável Máx': '1000.00',
          'Regras Bonificação Var': 'Meta de vendas mensal',
          'Valor Hora': '15.91',
          
          // Férias
          'Dias Direito': '30',
          'Férias Gozadas': '0',
          'Férias Por Gozar': '30',
          'Férias Ano Vigente': '30',
          
          // Outros
          'Empresa': 'Restaurante Zenith LTDA',
          'Contrato Digital': 'Sim',
          'Transporte': 'Vale Transporte',
          'Observações': 'Experiência em cozinha italiana',
          'Ativo': 'Sim'
        },
        {
          // Segunda linha vazia com todos os campos
          'ID Contrato': '',
          'Nome Completo': '',
          'Unidade Zenith': '',
          'Função': '',
          'Cargo': '',
          'Tipo Contrato': '',
          'Regime Contratação': '',
          'Horas Semana': '',
          'Tempo Contrato Meses': '',
          'Data Início': '',
          'Data Renovação 1': '',
          'Data Renovação 2': '',
          'Data Fim': '',
          'Iniciativa Desligamento': '',
          'Valor Total Bruto': '',
          'Ordenado Base': '',
          'Subsídio Alimentação': '',
          'Subsídio Férias': '',
          'Subsídio Natal': '',
          'Auxílio Transporte': '',
          'Ajuda Custo': '',
          'Bonificação Fixa': '',
          'Bonificação Variável Máx': '',
          'Regras Bonificação Var': '',
          'Valor Hora': '',
          'Dias Direito': '',
          'Férias Gozadas': '',
          'Férias Por Gozar': '',
          'Férias Ano Vigente': '',
          'Empresa': '',
          'Contrato Digital': '',
          'Transporte': '',
          'Observações': '',
          'Ativo': ''
        }
      ];

      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "template_contratos.xlsx");

      toast({
        title: "Sucesso!",
        description: "Template baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      toast({
        title: "Erro!",
        description: "Erro ao baixar o template.",
        variant: "destructive",
      });
    }
  };

  // Adicionar estas funções de processamento de dados para os gráficos
  const prepareChartData = () => {
    // Dados para gráfico de contratos por unidade
    const contractsByUnit = contracts.reduce((acc: any[], contract) => {
      const unidade = contract.unidades[0] || 'Sem unidade';
      const existing = acc.find(item => item.unidade === unidade);
      if (existing) {
        existing.quantidade += 1;
      } else {
        acc.push({ unidade, quantidade: 1 });
      }
      return acc;
    }, []);

    // Dados para gráfico de status (ativo/inativo)
    const contractsByStatus = [
      { status: 'Ativos', value: contracts.filter(c => c.activo).length },
      { status: 'Inativos', value: contracts.filter(c => !c.activo).length }
    ];

    // Dados para gráfico de contratos por mês
    const contractsByMonth = contracts.reduce((acc: any[], contract) => {
      const month = new Date(contract.dataInicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.mes === month);
      if (existing) {
        existing.quantidade += 1;
      } else {
        acc.push({ mes: month, quantidade: 1 });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());

    return { contractsByUnit, contractsByStatus, contractsByMonth };
  };

  const filteredContracts = contracts.filter(contract => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contract.nomeCompleto.toLowerCase().includes(searchLower) ||
      contract.funcao.toLowerCase().includes(searchLower) ||
      contract.cargo.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <div>Carregando...</div>;

  const chartData = prepareChartData();

  return (
    <DashboardView
      title="Contratos"
      searchProps={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Pesquisar por nome, função ou cargo..."
      }}
      viewOptions={{
        isListView,
        onViewChange: setIsListView
      }}
      actions={
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Template XLS
          </Button>
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Processando...' : 'Importar XLS'}
            </Button>
          </div>
          <Button onClick={() => router.push('/dashboard/contracts/new')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      }
      headerCard={{
        title: "Gestão de Contratos",
        description: "Gerencie todos os contratos do sistema",
        stats: [
          { label: "Total", value: `${contracts.length} Contratos` },
          { label: "Ativos", value: `${contracts.filter(c => c.activo).length} Contratos` }
        ]
      }}
      isLoading={loading}
      emptyState={
        contracts.length === 0 ? {
          icon: <FileText className="w-12 h-12 mx-auto text-zinc-400" />,
          title: "Nenhum contrato encontrado",
          description: "Comece registrando seu primeiro contrato",
          action: (
            <Button 
              onClick={() => router.push('/dashboard/contracts/new')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Primeiro Contrato
            </Button>
          )
        } : undefined
      }
    >
      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded">
          {success}
        </div>
      )}

      {isListView ? (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle>Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Nome</th>
                    <th className="p-2">Função</th>
                    <th className="p-2">Cargo</th>
                    <th className="p-2">Unidade</th>
                    <th className="p-2">Data Início</th>
                    <th className="p-2 text-right">Valor</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr 
                      key={contract._id}
                      onClick={() => router.push(`/dashboard/contracts/${contract._id}`)}
                      className="hover:bg-zinc-700/50 transition-colors duration-200 cursor-pointer border-b border-zinc-700/50"
                    >
                      <td className="p-2">{contract.nomeCompleto}</td>
                      <td className="p-2">{contract.funcao}</td>
                      <td className="p-2">{contract.cargo}</td>
                      <td className="p-2">
                        {typeof contract.unidades[0] === 'string' 
                          ? contract.unidades[0] 
                          : (contract.unidades[0] as any)?.nome || 'Sem unidade'}
                      </td>
                      <td className="p-2">{new Date(contract.dataInicio).toLocaleDateString()}</td>
                      <td className="p-2 text-right">€{contract.valorTotalBruto.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <Badge variant={contract.activo ? "default" : "secondary"}>
                          {contract.activo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <Card 
              key={contract._id}
              className="hover:bg-zinc-800 transition-colors cursor-pointer relative overflow-hidden"
              onClick={() => router.push(`/dashboard/contracts/${contract._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {contract.nomeCompleto}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {typeof contract.unidades[0] === 'string' 
                        ? contract.unidades[0] 
                        : (contract.unidades[0] as any)?.nome || 'Sem unidade'}
                    </CardDescription>
                  </div>
                  <Badge variant={contract.activo ? "default" : "secondary"}>
                    {contract.activo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Função</p>
                    <p className="text-sm font-medium">{contract.funcao}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Cargo</p>
                    <p className="text-sm font-medium">{contract.cargo}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(contract.dataInicio).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-orange-500">
                    €{contract.valorTotalBruto.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Card para Adicionar Novo Contrato */}
          <Card 
            className="border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer bg-transparent"
            onClick={() => router.push('/dashboard/contracts/new')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-400 hover:text-orange-500">
              <PlusCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Adicionar Novo Contrato</p>
              <p className="text-sm opacity-70">Gerencie contratos e documentos</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardView>
  );
}