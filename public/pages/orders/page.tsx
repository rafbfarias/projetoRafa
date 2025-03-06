'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Upload, Download, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types/order';
import { toast } from '@/components/ui/use-toast';
import { DashboardView } from '@/components/layouts/DashboardView';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { read, utils } from 'xlsx';

// Função auxiliar para converter valores em números
const parseNumber = (value: any): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export default function OrdersDashboard() {
  const router = useRouter();
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let data: Order[];
      
      if (dateStart || dateEnd) {
        data = await orderService.getOrders(dateStart, dateEnd);
      } else {
        data = await orderService.getAllOrders();
      }
      
      setOrders(data);
      
      const chartData = data.map(order => ({
        data: new Date(order.data).toLocaleDateString(),
        value: order.valorTotal
      }));
      
      setChartData(chartData);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar compras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateStart, dateEnd]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.fornecedor.toLowerCase().includes(searchLower) ||
      order.produto.toLowerCase().includes(searchLower) ||
      order.unit.toLowerCase().includes(searchLower)
    );
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet);

          const formattedData = jsonData.map((row: any) => ({
            data: row['Data'] || '',
            unit: row['Unidade'] || '',
            week: row['Semana'] || '',
            fornecedor: row['Fornecedor'] || '',
            numeroFatura: row['Número Fatura'] || '',
            categoria: row['Categoria'] || '',
            produto: row['Produto'] || '',
            quantidade: parseNumber(row['Quantidade']),
            unidadeMedida: row['Unidade Medida'] || '',
            precoUnitario: parseNumber(row['Preço Unitário']),
            valorTotal: parseNumber(row['Valor Total']),
            metodoPagamento: row['Método Pagamento'] || '',
            statusPagamento: row['Status Pagamento'] || '',
            dataPagamento: row['Data Pagamento'] || '',
            observacoes: row['Observações'] || ''
          }));

          const response = await orderService.createBulkOrders(formattedData);
          console.log('Resposta da importação:', response);
          
          setSuccess(`Importação concluída! ${response.results.created.length} registros criados e ${response.results.updated.length} atualizados.`);
          toast({
            title: "Sucesso",
            description: `Importação concluída! ${response.results.created.length} registros criados e ${response.results.updated.length} atualizados.`,
          });
          
          fetchOrders();
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setError('Erro ao processar arquivo. Verifique o formato e tente novamente.');
          toast({
            title: "Erro",
            description: "Erro ao processar arquivo. Verifique o formato e tente novamente.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      setError('Erro ao ler arquivo. Tente novamente.');
      toast({
        title: "Erro",
        description: "Erro ao ler arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardView
      title="Compras"
      searchProps={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Pesquisar por fornecedor, produto ou unidade..."
      }}
      viewOptions={{
        isListView,
        onViewChange: setIsListView
      }}
      actions={
        <Button onClick={() => router.push('/dashboard/orders/new')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Compra
        </Button>
      }
      headerCard={{
        title: "Gestão de Compras",
        description: "Gerencie todas as compras do sistema",
        stats: [
          { label: "Total", value: `${orders.length} Compras` },
          { label: "Valor Total", value: `€ ${orders.reduce((acc, order) => acc + order.valorTotal, 0).toFixed(2)}` }
        ]
      }}
      isLoading={loading}
      emptyState={
        orders.length === 0 ? {
          icon: <Building2 className="w-12 h-12 mx-auto text-zinc-400" />,
          title: "Nenhuma compra encontrada",
          description: "Comece registrando sua primeira compra",
          action: (
            <Button 
              onClick={() => router.push('/dashboard/orders/new')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Primeira Compra
            </Button>
          )
        } : undefined
      }
    >
      {/* Gráfico */}
      <Card className="bg-zinc-800 border-zinc-700 mb-6">
        <CardHeader>
          <CardTitle>Evolução das Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" stroke="#fff" tick={{ fill: '#fff' }} />
                  <YAxis stroke="#fff" tick={{ fill: '#fff' }} tickFormatter={(value) => `€${value.toLocaleString()}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#f97316" name="Compras" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

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
                    <th className="p-2">Data</th>
                    <th className="p-2">Unidade</th>
                    <th className="p-2">Fornecedor</th>
                    <th className="p-2">Produto</th>
                    <th className="p-2 text-right">Valor Total</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order._id}
                      onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                      className="hover:bg-zinc-700/50 transition-colors duration-200 cursor-pointer border-b border-zinc-700/50"
                    >
                      <td className="p-2">{new Date(order.data).toLocaleDateString()}</td>
                      <td className="p-2">{order.unit}</td>
                      <td className="p-2">{order.fornecedor}</td>
                      <td className="p-2">{order.produto}</td>
                      <td className="p-2 text-right">€{order.valorTotal.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <Badge variant={order.statusPagamento === 'Pago' ? "default" : "secondary"}>
                          {order.statusPagamento}
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
          {filteredOrders.map((order) => (
            <Card 
              key={order._id}
              className="hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{order.fornecedor}</CardTitle>
                    <p className="text-sm text-zinc-400">{order.unit}</p>
                  </div>
                  <Badge variant={order.statusPagamento === 'Pago' ? "default" : "secondary"}>
                    {order.statusPagamento}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Produto</p>
                    <p className="font-medium">{order.produto}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                    <span className="text-sm text-zinc-400">
                      {new Date(order.data).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-orange-500">
                      €{order.valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Card para Adicionar Nova Compra */}
          <Card 
            className="border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer bg-transparent"
            onClick={() => router.push('/dashboard/orders/new')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-400 hover:text-orange-500">
              <PlusCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Adicionar Nova Compra</p>
              <p className="text-sm opacity-70">Registre suas compras</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardView>
  );
} 