'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';
import type { CreateUserDTO, GlobalRole } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { FormView } from '@/components/layouts/FormView';

interface FormData extends CreateUserDTO {
  photo?: {
    url?: string;
    file?: File;
  };
}

export default function NewUserPage() {
  const router = useRouter();
  const { user, isMasterAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    globalRole: 'user',
    accountId: user?.accountId || '',
    photo: undefined
  });

  // Verifica permissões de acesso
  if (!isMasterAdmin && !isSuperAdmin) {
    router.push('/dashboard');
    return null;
  }

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
      const { photo, ...submitData } = formData;
      await userService.create(submitData);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      router.push('/dashboard/users');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'basic-info',
      title: 'Informações do Usuário',
      icon: <UserPlus className="h-5 w-5" />,
      content: (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="globalRole">Função Global</Label>
              <Select
                value={formData.globalRole}
                onValueChange={(value: GlobalRole) => setFormData({ ...formData, globalRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isMasterAdmin && <SelectItem value="superadmin">Superadmin</SelectItem>}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Superadmins podem criar e gerenciar unidades e outros usuários
              </p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-orange-500 mb-2">Importante</h4>
            <ul className="text-sm space-y-1 text-orange-500/80">
              <li>• Superadmins têm acesso total ao sistema</li>
              <li>• Admins podem ser designados como responsáveis por unidades</li>
              <li>• A senha inicial pode ser alterada pelo usuário após o primeiro acesso</li>
            </ul>
          </div>
        </form>
      )
    }
  ];

  return (
    <FormView
      title="Novo Usuário"
      subtitle="Cadastre um novo usuário e defina suas permissões"
      onBack={() => router.push('/dashboard/users')}
      isLoading={loading}
      headerInfo={{
        title: formData.name || 'Nome do Usuário',
        subtitle: formData.email || 'Email não definido',
        photo: {
          url: formData.photo?.url,
          onPhotoChange: handlePhotoChange
        },
        badges: [
          { label: 'Função', value: formData.globalRole === 'superadmin' ? 'Super Admin' : 'Admin' },
          { label: 'Status', value: 'Pendente' },
          { label: 'Conta', value: user?.accountId || 'Não definida' }
        ]
      }}
      sections={sections}
      actions={
        <>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </>
      }
    />
  );
} 