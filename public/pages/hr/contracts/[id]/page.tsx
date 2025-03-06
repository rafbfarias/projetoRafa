'use client';

import { useState, useEffect } from 'react';
import { DetailView } from '@/components/layouts/DetailView';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contractService } from '@/services/contractService';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, Download, Pencil, Trash2, 
  Building2, Calendar, Euro, Users 
} from 'lucide-react';
import type { Contract } from '@/types/contract';
import type { Unit } from '@/types/unit';

export default function ContractDetail() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContract();
  }, [params.id]);

  const loadContract = async () => {
    try {
      const data = await contractService.getContractById(params.id as string);
      setContract(data);
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do contrato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Implementar lógica de delete
  };

  if (!contract && !loading) return null;

  return (
    <DetailView
      title="Detalhes do Contrato"
      subtitle={contract?.nomeCompleto}
      onBack={() => router.push('/dashboard/contracts')}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/contracts/${params.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      }
      isLoading={loading}
      sections={[
        {
          title: "Informações do Contrato",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">ID do Contrato</p>
                  <p className="font-medium">{contract?.idContrato}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Unidade</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    <p className="font-medium">
                      {contract?.unidades?.[0] && typeof contract.unidades[0] !== 'string' 
                        ? (contract.unidades[0] as Unit).nome 
                        : 'Não definida'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Status</p>
                  <Badge 
                    className={contract?.activo 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                    }
                  >
                    {contract?.activo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Função</p>
                  <p className="font-medium">{contract?.funcao}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Cargo</p>
                  <p className="font-medium">{contract?.cargo}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Regime</p>
                  <p className="font-medium">{contract?.regimeContratacao}</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Informações Financeiras",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Valor Total Bruto</p>
                  <p className="text-lg font-medium text-orange-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(contract?.valorTotalBruto || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Ordenado Base</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(contract?.ordenadoBase || 0)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Subsídios</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Alimentação: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(contract?.subsidioAlimentacao || 0)}
                    </p>
                    <p className="text-sm">
                      Férias: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(contract?.subsidioFerias || 0)}
                    </p>
                    <p className="text-sm">
                      Natal: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(contract?.subsidioNatal || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Datas e Períodos",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Data de Início</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <p className="font-medium">
                      {new Date(contract?.dataInicio || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {contract?.dataFim && (
                  <div>
                    <p className="text-sm text-zinc-400">Data de Término</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <p className="font-medium">
                        {new Date(contract.dataFim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Horas por Semana</p>
                  <p className="font-medium">{contract?.horasSemana} horas</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Tempo de Contrato</p>
                  <p className="font-medium">{contract?.tempoContratoMeses} meses</p>
                </div>
              </div>
            </div>
          )
        }
      ]}
    />
  );
} 