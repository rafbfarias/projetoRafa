'use client';

import { DetailView, Field } from '@/components/DetailView';
import { useParams } from 'next/navigation';

export default function OrderDetail() {
  const params = useParams();

  const orderFields: Field[] = [
    // Informações Básicas
    { label: 'Data', key: 'data', type: 'date' },
    { label: 'Fornecedor', key: 'fornecedor', type: 'text' },
    { label: 'Número da Fatura', key: 'numeroFatura', type: 'text' },
    
    // Detalhes do Produto
    { label: 'Categoria', key: 'categoria', type: 'text' },
    { label: 'Produto', key: 'produto', type: 'text' },
    { label: 'Quantidade', key: 'quantidade', type: 'number' },
    { label: 'Unidade de Medida', key: 'unidadeMedida', type: 'text' },
    
    // Valores
    { label: 'Preço Unitário', key: 'precoUnitario', type: 'currency' },
    { label: 'Valor Total', key: 'valorTotal', type: 'currency' },
    
    // Pagamento
    { label: 'Método de Pagamento', key: 'metodoPagamento', type: 'text' },
    { label: 'Status do Pagamento', key: 'statusPagamento', type: 'text' },
    { label: 'Data do Pagamento', key: 'dataPagamento', type: 'date' },
    
    // Observações
    { label: 'Observações', key: 'observacoes', type: 'text' }
  ];

  return (
    <DetailView
      id={params.id as string}
      endpoint="orders"
      fields={orderFields}
      title="Detalhes da Compra"
    />
  );
} 