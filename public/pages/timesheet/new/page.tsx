'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUnit } from '@/contexts/UnitContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, User, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { timesheetService } from '@/services/timesheetService';
import { FormView } from '@/components/layouts/FormView';
import type { Timesheet } from '@/types/timesheet';

interface FormData extends Omit<Timesheet, '_id' | 'createdAt' | 'updatedAt' | 'checkInTime'> {
  checkInTime: string;
  photo?: {
    url?: string;
    file?: File;
  };
}

export default function NewTimesheetRecord() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedUnit } = useUnit();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    employeeName: '',
    checkInTime: new Date().toISOString().slice(0, 16),
    location: {
      lat: 0,
      lng: 0
    },
    status: 'active',
    accountId: user?.accountId || '',
    unit: selectedUnit?._id || '',
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

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setLoadingLocation(false);
        },
        (error) => {
          toast({
            title: "Erro",
            description: "Não foi possível obter sua localização",
            variant: "destructive",
          });
          setLoadingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { photo, ...submitData } = formData;
      const dataToSubmit = {
        ...submitData,
        checkInTime: new Date(submitData.checkInTime)
      };
      await timesheetService.create(dataToSubmit);
      
      toast({
        title: "Sucesso",
        description: "Registro criado com sucesso",
      });
      router.push('/dashboard/timesheet');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar registro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'employee-info',
      title: 'Informações do Funcionário',
      icon: <User className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nome do Funcionário</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Horário de Entrada</Label>
              <Input
                id="checkInTime"
                type="datetime-local"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                required
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'location',
      title: 'Localização',
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Button 
            type="button" 
            onClick={getCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? 'Obtendo localização...' : 'Obter Localização Atual'}
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.location.lat}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    lat: Number(e.target.value)
                  }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.location.lng}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    lng: Number(e.target.value)
                  }
                })}
                required
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'task',
      title: 'Tarefa Atual',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tarefa</Label>
            <Input
              value={formData.currentTask}
              onChange={(e) => setFormData({
                ...formData,
                currentTask: e.target.value
              })}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <FormView
      title="Novo Registro de Ponto"
      subtitle="Registre a entrada de um funcionário"
      onBack={() => router.push('/dashboard/timesheet')}
      isLoading={loading}
      headerInfo={{
        title: formData.employeeName || 'Nome do Funcionário',
        subtitle: new Date(formData.checkInTime).toLocaleString() || 'Horário não definido',
        photo: {
          url: formData.photo?.url,
          onPhotoChange: handlePhotoChange
        },
        badges: [
          { label: 'Status', value: formData.status === 'active' ? 'Ativo' : 'Inativo' },
          { label: 'Tarefa', value: formData.currentTask || 'Não definida' },
          { label: 'Localização', value: formData.location.lat ? 'Registrada' : 'Pendente' },
          { label: 'Unidade', value: selectedUnit?.nome || 'Não selecionada' }
        ]
      }}
      sections={sections}
      actions={
        <>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/timesheet')}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Ponto'}
          </Button>
        </>
      }
    />
  );
} 