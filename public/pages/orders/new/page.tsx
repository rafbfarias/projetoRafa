'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Building2, CreditCard, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderService } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';
import { FormView } from '@/components/layouts/FormView';
import type { Order } from '@/types/order';
import { useAuth } from '@/contexts/AuthContext';
import { useUnit } from '@/contexts/UnitContext';

interface FormData extends Omit<Order, '_id' | 'createdAt' | 'updatedAt'> {
  photo?: {
    url?: string;
    file?: File;
  };
}

export default function NewOrder() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedUnit } = useUnit();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountId: user?.accountId || '',
    data: new Date().toISOString().slice(0, 10),
    unit: selectedUnit?._id || '',
    week: '',
    fornecedor: '',
    numeroFatura: '',
    categoria: '',
    produto: '',
    quantidade: 0,
    unidadeMedida: '',
    precoUnitario: 0,
    valorTotal: 0,
    metodoPagamento: '',
    statusPagamento: '',
    dataPagamento: '',
    observacoes: ''
  });

  const handlePhotoChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      photo: {
        url,
        file
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { photo, ...submitData } = formData;
      await orderService.createOrder(submitData);
      toast({
        title: "Sucesso",
        description: "Compra registrada com sucesso",
      });
      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar compra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'basic-info',
      title: 'Informações da Compra',
      icon: <ShoppingCart className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Número da Fatura</Label>
              <Input
                value={formData.numeroFatura}
                onChange={(e) => setFormData({ ...formData, numeroFatura: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit1">Unidade 1</SelectItem>
                  <SelectItem value="unit2">Unidade 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semana</Label>
              <Input
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'product-info',
      title: 'Detalhes do Produto',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Produto</Label>
              <Input
                value={formData.produto}
                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade de Medida</Label>
              <Input
                value={formData.unidadeMedida}
                onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Unitário</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.precoUnitario}
                onChange={(e) => setFormData({ ...formData, precoUnitario: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      title: 'Pagamento',
      icon: <CreditCard className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select
                value={formData.metodoPagamento}
                onValueChange={(value) => setFormData({ ...formData, metodoPagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select
                value={formData.statusPagamento}
                onValueChange={(value) => setFormData({ ...formData, statusPagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <textarea
              className="w-full h-32 p-2 bg-zinc-900 rounded-md border border-zinc-700 text-white"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>
        </div>
      )
    }
  ];

  const valorTotal = formData.quantidade * formData.precoUnitario;

  return (
    <FormView
      title="Nova Ordem de Compra"
      subtitle="Registre uma nova ordem de compra para sua unidade"
      onBack={() => router.push('/dashboard/orders')}
      isLoading={loading}
      headerInfo={{
        title: `€ ${formData.valorTotal.toFixed(2)}`,
        subtitle: new Date(formData.data).toLocaleDateString('pt-PT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        photo: {
          url: formData.photo?.url,
          onPhotoChange: handlePhotoChange
        },
        badges: [
          { label: 'Fornecedor', value: formData.fornecedor || 'Não definido' },
          { label: 'Fatura', value: formData.numeroFatura || 'Não definido' },
          { label: 'Unidade', value: selectedUnit?.nome || 'Não selecionada' },
          { label: 'Status', value: formData.statusPagamento || 'Pendente' }
        ]
      }}
      sections={sections}
      actions={
        <>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/orders')}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    />
  );
} 