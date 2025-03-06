'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailView } from '@/components/layouts/DetailView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Shield, Save } from 'lucide-react';
import { userService } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';
import type { User, GlobalRole, UnitAccess } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  active: boolean;
  globalRole: GlobalRole;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    active: true,
    globalRole: 'user'
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    loadUser();
  }, [params.id, currentUser]);

  const loadUser = async () => {
    try {
      const data = await userService.getById(params.id);
      
      if (!data) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        router.push('/dashboard/users');
        return;
      }

      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        active: data.active,
        globalRole: data.globalRole
      });
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      });
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await userService.update(params.id, formData);
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      setEditing(false);
      loadUser();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await userService.delete(params.id);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <DetailView
      title="Detalhes do Usuário"
      subtitle="Visualize e edite as informações do usuário"
      onBack={() => router.push('/dashboard/users')}
      isLoading={loading}
      actions={
        editing ? (
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </>
        ) : isSuperAdmin && (
          <>
            <Button variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </>
        )
      }
      headerInfo={{
        photo: {
          url: user.imageUrl || undefined,
          editable: editing,
          onPhotoChange: (file) => {
            // Implementar upload de foto
          }
        },
        title: user.name,
        subtitle: user.email,
        badges: [
          { label: "Função", value: user.globalRole },
          { label: "Unidades", value: String(user.unitAccess?.length || 0) },
          { label: "Status", value: user.active ? "Ativo" : "Inativo" }
        ],
        action: isSuperAdmin && (
          <Button variant="outline" onClick={() => router.push(`/dashboard/users/${user._id}/permissions`)}>
            <Shield className="w-4 h-4 mr-2" />
            Gerenciar Permissões
          </Button>
        )
      }}
      sections={[
        {
          title: "Informações Básicas",
          content: (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  disabled={!editing}
                />
                <Label>Usuário Ativo</Label>
              </div>
            </div>
          )
        },
        {
          title: "Unidades Vinculadas",
          content: (
            <div className="grid gap-4">
              {user.unitAccess && user.unitAccess.length > 0 ? (
                user.unitAccess.map((access, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                    <div>
                      <p className="font-medium">{access.unit.nome}</p>
                      <p className="text-sm text-zinc-400">{access.role}</p>
                    </div>
                    {editing && (
                      <Button variant="ghost" size="sm">
                        Remover
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">Nenhuma unidade vinculada</p>
              )}
              {editing && (
                <Button variant="outline" className="w-full">
                  + Adicionar Unidade
                </Button>
              )}
            </div>
          )
        }
      ]}
    />
  );
} 