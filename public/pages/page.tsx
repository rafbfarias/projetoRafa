'use client'; // Indica que este código roda no navegador do usuário

import { useState, useEffect } from 'react';
import { DashboardView } from '@/components/layouts/DashboardView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  BarChart,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <DashboardView
      title="Dashboard"
      subtitle="Bem-vindo de volta! Aqui está o resumo das suas atividades"
      headerCard={{
        title: "Visão Geral do Sistema",
        description: "Monitore todas as atividades e métricas importantes",
        stats: [
          { label: "Faturamento", value: "R$ 125.430,00" },
          { label: "Despesas", value: "R$ 84.230,00" },
          { label: "Lucro", value: "R$ 41.200,00" }
        ],
        action: (
          <Button 
            variant="outline" 
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            onClick={() => router.push('/dashboard/reports')}
          >
            <BarChart className="w-4 h-4 mr-2" />
            Relatório Completo
          </Button>
        )
      }}
      isLoading={loading}
    >
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card de Faturamento */}
        <Card className="bg-gradient-to-br from-green-500/20 to-green-700/20 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Faturamento Total</p>
                <h3 className="text-2xl font-bold mt-2">R$ 125.430,00</h3>
                <p className="text-sm text-green-500 mt-2">+12% em relação ao mês anterior</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Card de Despesas */}
        <Card className="bg-gradient-to-br from-red-500/20 to-red-700/20 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Despesas Totais</p>
                <h3 className="text-2xl font-bold mt-2">R$ 84.230,00</h3>
                <p className="text-sm text-red-500 mt-2">+5% em relação ao mês anterior</p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Card de Pedidos */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Pedidos do Mês</p>
                <h3 className="text-2xl font-bold mt-2">847</h3>
                <p className="text-sm text-blue-500 mt-2">+23% em relação ao mês anterior</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Card de Lucro */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Lucro Líquido</p>
                <h3 className="text-2xl font-bold mt-2">R$ 41.200,00</h3>
                <p className="text-sm text-purple-500 mt-2">+8% em relação ao mês anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Últimas Transações */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Últimas Transações</h2>
              <Button variant="ghost" size="sm">Ver todas</Button>
            </div>
            <div className="space-y-4">
              {[
                { tipo: 'entrada', valor: 'R$ 2.400,00', desc: 'Pagamento Cliente A', data: 'Hoje, 14:30' },
                { tipo: 'saida', valor: 'R$ 1.200,00', desc: 'Fornecedor XYZ', data: 'Hoje, 12:15' },
                { tipo: 'entrada', valor: 'R$ 3.800,00', desc: 'Pagamento Cliente B', data: 'Ontem, 16:45' },
              ].map((trans, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    {trans.tipo === 'entrada' ? 
                      <ArrowDownCircle className="w-5 h-5 text-green-500" /> :
                      <ArrowUpCircle className="w-5 h-5 text-red-500" />
                    }
                    <div>
                      <p className="font-medium">{trans.desc}</p>
                      <p className="text-sm text-zinc-400">{trans.data}</p>
                    </div>
                  </div>
                  <span className={trans.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'}>
                    {trans.valor}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades Recentes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Atividades Recentes</h2>
              <Button variant="ghost" size="sm">Ver todas</Button>
            </div>
            <div className="space-y-4">
              {[
                { icon: FileText, desc: 'Novo contrato criado', tempo: 'Há 2 horas' },
                { icon: Users, desc: 'Novo funcionário cadastrado', tempo: 'Há 3 horas' },
                { icon: Building2, desc: 'Atualização de unidade', tempo: 'Há 5 horas' },
              ].map((ativ, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-zinc-800 rounded-lg transition-colors">
                  <ativ.icon className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="font-medium">{ativ.desc}</p>
                    <p className="text-sm text-zinc-400">{ativ.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardView>
  );
}