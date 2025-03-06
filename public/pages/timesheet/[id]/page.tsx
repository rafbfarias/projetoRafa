'use client';

import { DetailView, Field } from '@/components/DetailView';
import { useParams } from 'next/navigation';

export default function TimesheetDetail() {
  const params = useParams();

  const timesheetFields: Field[] = [
    // Informações do Funcionário
    { label: 'Nome do Funcionário', key: 'employeeName', type: 'text' },
    
    // Horários
    { label: 'Entrada', key: 'checkInTime', type: 'date' },
    { label: 'Saída', key: 'checkOutTime', type: 'date' },
    
    // Status e Detalhes
    { label: 'Status', key: 'status', type: 'text' },
    { label: 'Observações', key: 'observacoes', type: 'text' }
  ];

  return (
    <DetailView
      id={params.id as string}
      endpoint="timesheet"
      fields={timesheetFields}
      title="Detalhes do Registro de Ponto"
    />
  );
} 