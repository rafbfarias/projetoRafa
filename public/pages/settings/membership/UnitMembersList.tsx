import { useEffect, useState } from 'react';
import { useUnit } from '@/contexts/UnitContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface UnitMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: string;
}

interface UnitMembersListProps {
  unitId: string;
  onMemberUpdate?: () => void;
}

export function UnitMembersList({ unitId, onMemberUpdate }: UnitMembersListProps) {
  const [members, setMembers] = useState<UnitMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Usando o Context para operações de API
  const { getUnitUsers, updateUserRole, removeUserFromUnit } = useUnit();
  
  // Usando o hook de permissões para verificações
  const { canManageUnitMembers } = usePermissions();
  const canManage = canManageUnitMembers(unitId);

  useEffect(() => {
    loadMembers();
  }, [unitId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getUnitUsers(unitId);
      
      // Mapear os dados da API para o formato esperado pelo componente
      const mappedMembers: UnitMember[] = data.map(user => ({
        id: user._id || user._id?.toString(),
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl || undefined,
        role: user.unitAccess?.find(access => 
          access.unit && 
          (typeof access.unit === 'string' 
            ? access.unit === unitId 
            : access.unit._id === unitId)
        )?.role || 'viewer'
      }));
      
      setMembers(mappedMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da unidade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!canManage) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para alterar papéis de membros",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateUserRole(memberId, unitId, newRole as any);
      
      // Atualiza o estado local para refletir a mudança imediatamente
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Papel atualizado com sucesso",
      });
      
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do membro",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManage) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para remover membros",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("Tem certeza que deseja remover este membro?")) {
      return;
    }
    
    try {
      await removeUserFromUnit(memberId, unitId);
      
      // Atualiza o estado local para refletir a remoção imediatamente
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso",
      });
      
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando membros...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Membros da Unidade</h2>
      
      {members.length === 0 ? (
        <p>Nenhum membro encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Avatar>
                  <img 
                    src={member.imageUrl || '/placeholder-avatar.png'} 
                    alt={member.name} 
                  />
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {canManage ? (
                  <>
                    <Select 
                      defaultValue={member.role} 
                      onValueChange={(value) => handleRoleChange(member.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Selecionar papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="employee">Funcionário</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remover
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">{member.role}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 