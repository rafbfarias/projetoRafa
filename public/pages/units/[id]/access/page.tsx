'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Users, ArrowLeft, UserPlus, Shield, 
  ShieldCheck, ShieldAlert, Trash2 
} from 'lucide-react';
import { useUnit } from '@/contexts/UnitContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserPicker } from '@/components/ui/user-picker';
import type { User, UnitRole } from '@/types/user';

interface UnitUser {
  _id: string;
  name: string;
  email: string;
  role: UnitRole;
}

export default function UnitAccessPage() {
  const params = useParams();
  const router = useRouter();
  const { getUnitUsers, addUserToUnit, removeUserFromUnit, updateUserRole, canManageUsers } = useUnit();
  const { isMasterAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UnitUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const unitId = params.id as string;
  const canManage = isMasterAdmin || isSuperAdmin || canManageUsers(unitId);

  useEffect(() => {
    fetchUsers();
  }, [unitId]);

  const fetchUsers = async () => {
    try {
      const data = await getUnitUsers(unitId);
      setUsers(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user: User) => {
    if (!canManage) return;
    
    try {
      await addUserToUnit(user._id, unitId, 'user');
      await fetchUsers();
      setSelectedUser(null);
      toast({
        title: "Sucesso",
        description: "Usuário adicionado à unidade",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o usuário",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!canManage) return;

    try {
      await removeUserFromUnit(userId, unitId);
      await fetchUsers();
      toast({
        title: "Sucesso",
        description: "Usuário removido da unidade",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, currentRole: UnitRole) => {
    if (!canManage) return;

    const newRole: UnitRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(userId, unitId, newRole);
      await fetchUsers();
      toast({
        title: "Sucesso",
        description: `Usuário agora é ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o role",
        variant: "destructive",
      });
    }
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você não tem permissão para gerenciar usuários desta unidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Acessos</CardTitle>
          <CardDescription>
            Adicione ou remova usuários desta unidade e gerencie suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <UserPicker
              value={selectedUser}
              onChange={handleAddUser}
              disabled={!canManage}
            />
          </div>

          {/* Lista de Usuários */}
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user._id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-800"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'outline'}
                    className="flex items-center gap-1"
                  >
                    {user.role === 'admin' ? 
                      <ShieldCheck className="h-3 w-3" /> : 
                      <Shield className="h-3 w-3" />
                    }
                    {user.role}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRoleChange(user._id, user.role)}
                    disabled={!canManage}
                  >
                    {user.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleRemoveUser(user._id)}
                    disabled={!canManage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 