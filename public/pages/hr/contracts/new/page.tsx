'use client';

// Importando as ferramentas necessárias
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserIcon, PlusCircle, FileText, Users, Calendar, Euro, Building2 } from 'lucide-react';
import { contractService } from '@/services/contractService';
import { useToast } from '@/components/ui/use-toast';
import { Contract } from '@/types/contract';
import Image from 'next/image';
import { MultiSelect } from '@/components/ui/multi-select';
import { unitService } from '@/services/unitService';
import { Badge } from '@/components/ui/badge';
import { FormView } from '@/components/layouts/FormView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutList } from 'lucide-react';

// Define a estrutura dos dados de um contrato
interface StaffContract {
  // Informações de Identificação
  idContrato: string;        // Número único do contrato
  timestamp: string;         // Data e hora do registro
  id: string;               // ID do funcionário
  activo: boolean;          // Status do contrato (ativo/inativo)
  
  // Informações do Funcionário
  unidadeZenith: string;    // Unidade onde trabalha
  nomeCompleto: string;     // Nome completo do funcionário
  funcao: string;           // Função que irá exercer
  cargo: string;            // Cargo que irá assumir
  
  // Detalhes do Contrato
  tipoContrato: string;     // Tipo do contrato
  regimeContratacao: string; // Regime de contratação
  horasSemana: number;      // Horas por semana
  tempoContratoMeses: number; // Duração do contrato em meses
  
  // Datas Importantes
  dataInicio: string;       // Data de início
  dataRenovacao1: string;   // Data da primeira renovação
  dataRenovacao2: string;   // Data da segunda renovação
  dataFim: string;         // Data de término
  iniciativaDesligamento: string; // Quem iniciou o desligamento
  
  // Informações Financeiras
  valorTotalBruto: number;  // Valor total bruto anual (x12)
  ordenadoBase: number;     // Salário base
  subsidioAlimentacao: number; // Subsídio de alimentação
  subsidioFerias: number;   // Subsídio de férias
  subsidioNatal: number;    // Subsídio de natal
  auxilioTransporte: number; // Auxílio transporte
  ajudaCusto: number;      // Ajuda de custo
  bonificacaoFixa: number;  // Bonificação fixa
  bonificacaoVarMax: number; // Bonificação variável máxima
  regrasBonificacaoVar: string; // Regras da bonificação variável
  valorHora: number;       // Valor por hora
  
  // Férias
  diasDireito: number;     // Dias por direito até a data atual
  feriasGozadas: number;   // Férias já gozadas
  feriasPorGozar: number;  // Férias pendentes
  feriasAnoVigente: number; // Férias até fim do ano vigente
  
  // Outros
  empresa: string;         // Empresa contratante
  contratoDigital: boolean; // Se tem contrato digital
  transport: boolean;      // Se tem transporte
  observacoes: string;     // Observações gerais
  foto?: {
    url: string;
    alt: string;
    lastUpdated: string;
  };
  unidades: string[]; // Array de IDs das unidades
  isAssigned?: boolean; // Virtual field
} 

interface Unit {
  _id: string;
  nome: string;
  sigla: string;
}

// Definição do componente NewContractPage
export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null);
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    idContrato: '',
    id: '',
    activo: true,
    unidadeZenith: '',
    nomeCompleto: '',
    funcao: '',
    cargo: '',
    tipoContrato: '',
    regimeContratacao: '',
    horasSemana: 0,
    tempoContratoMeses: 0,
    dataInicio: new Date().toISOString().split('T')[0],
    dataRenovacao1: '',
    dataRenovacao2: '',
    dataFim: '',
    iniciativaDesligamento: '',
    valorTotalBruto: 0,
    ordenadoBase: 0,
    subsidioAlimentacao: 0,
    subsidioFerias: 0,
    subsidioNatal: 0,
    auxilioTransporte: 0,
    ajudaCusto: 0,
    bonificacaoFixa: 0,
    bonificacaoVarMax: 0,
    valorHora: 0,
    diasDireito: 0,
    feriasGozadas: 0,
    feriasPorGozar: 0,
    feriasAnoVigente: 0,
    empresa: '',
    contratoDigital: false,
    transport: false,
    observacoes: '',
    foto: undefined as { 
      url: string; 
      alt: string; 
      lastUpdated: Date; 
    } | undefined,
    unidades: [] as Unit[]
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const units = await unitService.getAll();
        const validUnits = units.filter(unit => unit._id) as Unit[];
        setAvailableUnits(validUnits);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
      }
    };

    loadUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractData: Partial<Contract> = {
        ...formData,
        dataInicio: new Date(formData.dataInicio),
        dataRenovacao1: formData.dataRenovacao1 ? new Date(formData.dataRenovacao1) : undefined,
        dataRenovacao2: formData.dataRenovacao2 ? new Date(formData.dataRenovacao2) : undefined,
        dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
        foto: formData.foto ? {
          ...formData.foto,
          lastUpdated: new Date()
        } : undefined,
        unidades: formData.unidades.map(unit => unit._id)
      };

      await contractService.createContract(contractData);
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso",
      });
      router.push('/dashboard/contracts');
    } catch (error: any) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro!",
        description: error.message || "Erro ao criar contrato. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCancel = () => {
    router.push('/dashboard/contracts');
  }

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      foto: {
        url: URL.createObjectURL(file),
        alt: file.name,
        lastUpdated: new Date()
      }
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, unit: Unit) => {
    setDraggedUnit(unit);
  };

  const handleDrop = (e: React.DragEvent, target: 'available' | 'assigned') => {
    e.preventDefault();
    if (!draggedUnit) return;

    if (target === 'assigned' && !formData.unidades.find(u => u._id === draggedUnit._id)) {
      // Adicionar à lista de unidades atribuídas
      setFormData(prev => ({
        ...prev,
        unidades: [...prev.unidades, draggedUnit]
      }));
      // Remover da lista de unidades disponíveis
      setAvailableUnits(prev => prev.filter(u => u._id !== draggedUnit._id));
    } else if (target === 'available' && formData.unidades.find(u => u._id === draggedUnit._id)) {
      // Remover da lista de unidades atribuídas
      setFormData(prev => ({
        ...prev,
        unidades: prev.unidades.filter(u => u._id !== draggedUnit._id)
      }));
      // Adicionar de volta à lista de unidades disponíveis
      setAvailableUnits(prev => [...prev, draggedUnit]);
    }

    setDraggedUnit(null);
  };

  const formSections = [
    {
      id: "identification",
      title: "Identificação",
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Identificação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID Contrato</label>
              <Input
                name="idContrato"
                value={formData.idContrato}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID Funcionário</label>
              <Input
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Ativo</label>
              <Switch
                checked={formData.activo}
                onCheckedChange={handleSwitchChange('activo')}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "employee",
      title: "Funcionário",
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Informações do Funcionário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <Input
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unidade Zenith</label>
              <Input
                name="unidadeZenith"
                value={formData.unidadeZenith}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Empresa</label>
              <Input
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Função</label>
              <Input
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cargo</label>
              <Input
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "contract",
      title: "Contrato",
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Detalhes do Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Contrato</label>
              <Input
                name="tipoContrato"
                value={formData.tipoContrato}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Regime de Contratação</label>
              <Input
                name="regimeContratacao"
                value={formData.regimeContratacao}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horas/Semana</label>
              <Input
                type="number"
                name="horasSemana"
                value={formData.horasSemana}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dates",
      title: "Datas",
      icon: <Calendar className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Datas do Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <Input
                type="date"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">1ª Renovação</label>
              <Input
                type="date"
                name="dataRenovacao1"
                value={formData.dataRenovacao1}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">2ª Renovação</label>
              <Input
                type="date"
                name="dataRenovacao2"
                value={formData.dataRenovacao2}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <Input
                type="date"
                name="dataFim"
                value={formData.dataFim}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "financial",
      title: "Financeiro",
      icon: <Euro className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Informações Financeiras</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor Total Bruto (x12)</label>
              <Input
                type="number"
                name="valorTotalBruto"
                value={formData.valorTotalBruto}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordenado Base</label>
              <Input
                type="number"
                name="ordenadoBase"
                value={formData.ordenadoBase}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subsídio Alimentação</label>
              <Input
                type="number"
                name="subsidioAlimentacao"
                value={formData.subsidioAlimentacao}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "vacation",
      title: "Férias",
      icon: <Calendar className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Férias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dias por Direito</label>
              <Input
                type="number"
                name="diasDireito"
                value={formData.diasDireito}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Férias Gozadas</label>
              <Input
                type="number"
                name="feriasGozadas"
                value={formData.feriasGozadas}
                onChange={handleNumberChange}
                className="bg-zinc-700 border-zinc-600"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "other",
      title: "Outros",
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Outras Informações</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className="bg-zinc-700 border-zinc-600"
                rows={4}
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Contrato Digital</label>
                <Switch
                  checked={formData.contratoDigital}
                  onCheckedChange={handleSwitchChange('contratoDigital')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Transport</label>
                <Switch
                  checked={formData.transport}
                  onCheckedChange={handleSwitchChange('transport')}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "units",
      title: "Unidades",
      icon: <Building2 className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Atribuição de Unidades</h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Pool de Unidades Disponíveis */}
            <Card className="bg-zinc-800 border-none">
              <CardHeader>
                <CardTitle className="text-lg">Unidades Disponíveis</CardTitle>
                <CardDescription>
                  Arraste as unidades para associar ao contrato
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-zinc-700/30 rounded-lg min-h-[300px] p-4"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, 'available')}>
                {availableUnits.map((unit) => (
                  <div
                    key={unit._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, unit)}
                    className="p-4 mb-2 bg-zinc-800 rounded-lg cursor-move hover:bg-zinc-700 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-2 h-2 rounded-full bg-zinc-400 group-hover:bg-zinc-300" />
                    <div>
                      <div className="font-medium">{unit.nome}</div>
                      <div className="text-sm text-zinc-400">Arraste para associar</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Unidades Selecionadas */}
            <Card className="bg-zinc-800 border-none">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Unidades Atribuídas</CardTitle>
                    <CardDescription>
                      {formData.unidades.length} unidade(s) associada(s)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                    {formData.unidades.length} / {availableUnits.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="bg-zinc-700/30 rounded-lg min-h-[300px] p-4"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, 'assigned')}>
                {formData.unidades.map((unit) => (
                  <div
                    key={unit._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, unit)}
                    className="p-4 mb-2 bg-orange-500/10 rounded-lg cursor-move hover:bg-orange-500/20 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div>
                      <div className="font-medium">{unit.nome}</div>
                      <div className="text-sm text-orange-300/60">Arraste para remover</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  return (
    <FormView
      title="Novo Contrato"
      subtitle="Criar novo contrato"
      onBack={() => router.push('/dashboard/contracts')}
      isLoading={loading}
      headerInfo={{
        title: formData.nomeCompleto || 'Nome do Funcionário',
        subtitle: formData.cargo || 'Cargo não definido',
        photo: {
          url: formData.foto?.url,
          onPhotoChange: handlePhotoChange
        },
        badges: [
          { label: 'Status', value: formData.activo ? 'Ativo' : 'Inativo' },
          { 
            label: 'Unidades', 
            value: `${formData.unidades.length} atribuída${formData.unidades.length !== 1 ? 's' : ''}`
          }
        ]
      }}
      sections={formSections}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="contract-form"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Contrato'
            )}
          </Button>
        </div>
      }
    />
  );
}