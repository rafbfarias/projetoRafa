'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Wallet, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { unitService } from '@/services/unitService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FormView } from '@/components/layouts/FormView';
import type { CreateUnitDTO, UnitLocation, UnitCapacity, UnitFinancial, UnitStaff } from '@/types/unit';
import { UserPicker } from '@/components/ui/user-picker';
import { userService } from '@/services/userService';

interface FormData extends CreateUnitDTO {
  photo?: {
    url?: string;
    file?: File;
  };
}

export default function NewUnitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountId: user?.accountId || '',
    adminId: user?._id || '',
    // Identificação
    sigla: '',
    nome: '',
    // Localização
    morada: '',
    moradaFiscal: '',
    cidade: '',
    pais: 'Portugal',
    // Estrutura
    metrosQuadrados: 0,
    andares: 0,
    lugaresTotal: 0,
    // Financeiro
    valorRenda: 0,
    potencialFaturacao: 0,
    empresaId: '',
    // Pessoas
    responsavelId: '',
    chefCozinhaId: '',
    totalStaff: 0
  });

  const handlePhotoChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      photo: { url, file }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.accountId || !formData.adminId) {
        throw new Error('Dados de conta/usuário não encontrados');
      }

      const unit = await unitService.create({
        ...formData,
        photo: formData.photo?.file
      });

      toast({
        title: "Sucesso",
        description: "Unidade criada com sucesso",
      });
      router.push('/dashboard/units');
    } catch (error: any) {
      console.error('Erro ao criar unidade:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível criar a unidade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'identification',
      title: 'Identificação',
      icon: <Building2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sigla">Sigla</Label>
              <Input
                id="sigla"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                maxLength={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
          <div className="space-y-2">
            <Label htmlFor="morada">Morada</Label>
            <Input
              id="morada"
              value={formData.morada}
              onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="moradaFiscal">Morada Fiscal</Label>
            <Input
              id="moradaFiscal"
              value={formData.moradaFiscal}
              onChange={(e) => setFormData({ ...formData, moradaFiscal: e.target.value })}
            />
          </div>
        </div>
      )
    },
    {
      id: 'structure',
      title: 'Estrutura',
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metrosQuadrados">Metros Quadrados</Label>
              <Input
                id="metrosQuadrados"
                type="number"
                value={formData.metrosQuadrados}
                onChange={(e) => setFormData({ ...formData, metrosQuadrados: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="andares">Andares</Label>
              <Input
                id="andares"
                type="number"
                value={formData.andares}
                onChange={(e) => setFormData({ ...formData, andares: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugaresTotal">Total de Lugares</Label>
              <Input
                id="lugaresTotal"
                type="number"
                value={formData.lugaresTotal}
                onChange={(e) => setFormData({ ...formData, lugaresTotal: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial',
      title: 'Financeiro',
      icon: <Wallet className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorRenda">Valor da Renda</Label>
              <Input
                id="valorRenda"
                type="number"
                value={formData.valorRenda}
                onChange={(e) => setFormData({ ...formData, valorRenda: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potencialFaturacao">Potencial de Faturação</Label>
              <Input
                id="potencialFaturacao"
                type="number"
                value={formData.potencialFaturacao}
                onChange={(e) => setFormData({ ...formData, potencialFaturacao: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresaId">Empresa</Label>
            <Input
              id="empresaId"
              value={formData.empresaId}
              onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
              required
            />
          </div>
        </div>
      )
    },
    {
      id: 'people',
      title: 'Pessoas',
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Responsável</Label>
            <UserPicker
              value={formData.responsavelId}
              onChange={(id) => setFormData({ ...formData, responsavelId: id })}
              role="manager"
              accountId={user?.accountId}
              onCreateUser={async (userData) => {
                try {
                  const newUser = await userService.create({
                    ...userData,
                    accountId: user?.accountId,
                  });
                  
                  toast({
                    title: "Usuário criado com sucesso",
                    description: `${newUser.name} foi adicionado como ${newUser.role}`,
                  });
                  
                  // Atualiza automaticamente o responsável
                  setFormData(prev => ({
                    ...prev,
                    responsavelId: newUser._id
                  }));
                } catch (error: any) {
                  toast({
                    title: "Erro ao criar usuário",
                    description: error.message || "Não foi possível criar o usuário",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Chef de Cozinha</Label>
            <UserPicker
              value={formData.chefCozinhaId}
              onChange={(id) => setFormData({ ...formData, chefCozinhaId: id })}
              role="chef"
              accountId={user?.accountId}
              onCreateUser={async (userData) => {
                try {
                  const newUser = await userService.create({
                    ...userData,
                    accountId: user?.accountId,
                  });
                  
                  toast({
                    title: "Usuário criado com sucesso",
                    description: `${newUser.name} foi adicionado como ${newUser.role}`,
                  });
                  
                  // Atualiza automaticamente o chef
                  setFormData(prev => ({
                    ...prev,
                    chefCozinhaId: newUser._id
                  }));
                } catch (error: any) {
                  toast({
                    title: "Erro ao criar usuário",
                    description: error.message || "Não foi possível criar o usuário",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <FormView
      title="Nova Unidade"
      subtitle="Cadastre uma nova unidade e configure suas informações"
      onBack={() => router.push('/dashboard/units')}
      isLoading={loading}
      headerInfo={{
        title: formData.nome || 'Nome da Unidade',
        subtitle: formData.morada || 'Endereço não definido',
        photo: {
          url: formData.photo?.url,
          onPhotoChange: handlePhotoChange
        },
        badges: [
          { label: 'Sigla', value: formData.sigla || 'Não definida' },
          { label: 'Cidade', value: formData.cidade || 'Não definida' },
          { label: 'Lugares', value: formData.lugaresTotal?.toString() || '0' }
        ]
      }}
      sections={sections}
      actions={
        <>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/units')}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Unidade'}
          </Button>
        </>
      }
    />
  );
} 