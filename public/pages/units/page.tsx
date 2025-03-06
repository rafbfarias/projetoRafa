'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '@/components/layouts/DashboardView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, CreditCard, Users, Shield, PlusCircle } from 'lucide-react';
import { unitService } from '@/services/unitService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import type { Unit } from '@/types/unit';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Weather } from '@/components/ui/weather';

export default function UnitsPage() {
  const router = useRouter();
  const { user, isSuperAdmin } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(false); // Começa com visualização em cards

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await unitService.getAll();
      setUnits(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as unidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const searchLower = searchTerm.toLowerCase();
    
    // Obter os nomes usando as funções auxiliares
    const responsavelName = getResponsavelName(unit.responsavel);
    const chefName = getChefName(unit.chefCozinha);
    
    return (
      unit.sigla.toLowerCase().includes(searchLower) ||
      unit.nome.toLowerCase().includes(searchLower) ||
      (unit.morada?.toLowerCase() || '').includes(searchLower) ||
      responsavelName.toLowerCase().includes(searchLower) ||
      chefName.toLowerCase().includes(searchLower) ||
      (unit.cidade?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Função auxiliar para obter o nome do responsável
  const getResponsavelName = (responsavel: any): string => {
    if (!responsavel) return 'Não definido';
    if (typeof responsavel === 'string') return responsavel;
    if (typeof responsavel === 'object' && responsavel.nome) return responsavel.nome;
    return 'Não definido';
  };

  // Função auxiliar para obter o nome do chef
  const getChefName = (chef: any): string => {
    if (!chef) return 'Não definido';
    if (typeof chef === 'string') return chef;
    if (typeof chef === 'object' && chef.nome) return chef.nome;
    return 'Não definido';
  };

  // Função auxiliar para obter a primeira letra do nome
  const getInitial = (name: string): string => {
    return name && name !== 'Não definido' ? name.charAt(0) : '?';
  };

  return (
    <DashboardView
      title="Unidades"
      searchProps={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Pesquisar por sigla, nome, cidade, responsável ou chef..."
      }}
      viewOptions={{
        isListView,
        onViewChange: setIsListView
      }}
      actions={
        isSuperAdmin && (
          <Button onClick={() => router.push('/dashboard/units/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Unidade
          </Button>
        )
      }
      headerCard={isSuperAdmin ? {
        title: "Gestão de Unidades",
        description: "Gerencie suas unidades e permissões",
        stats: [
          { label: "Total", value: `${units.length} / 3 Unidades` },
          { label: "Usuários", value: "10 Usuários Disponíveis" }
        ]
      } : undefined}
      isLoading={loading}
      emptyState={
        units.length === 0 ? {
          icon: <Building2 className="w-12 h-12 mx-auto text-zinc-400" />,
          title: "Nenhuma unidade encontrada",
          description: "Comece adicionando sua primeira unidade",
          action: (
            <Button 
              onClick={() => router.push('/dashboard/units/new')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeira Unidade
            </Button>
          )
        } : undefined
      }
    >
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
                    <th className="p-2">Sigla</th>
                    <th className="p-2">Nome</th>
                    <th className="p-2">Responsável</th>
                    <th className="p-2">Chef de Cozinha</th>
                    <th className="p-2">Cidade</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr 
                      key={unit._id}
                      onClick={() => router.push(`/dashboard/units/${unit._id}`)}
                      className="hover:bg-zinc-700/50 transition-colors duration-200 cursor-pointer border-b border-zinc-700/50"
                    >
                      <td className="p-2">{unit.sigla}</td>
                      <td className="p-2">{unit.nome}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={unit.imageUrl} />
                            <AvatarFallback>
                              {getInitial(getResponsavelName(unit.responsavel))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {getResponsavelName(unit.responsavel)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={unit.imageUrl} />
                            <AvatarFallback>
                              {getInitial(getChefName(unit.chefCozinha))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {getChefName(unit.chefCozinha)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">{unit.cidade}</td>
                      <td className="p-2">
                        <Badge variant={unit.active ? "default" : "secondary"}>
                          {unit.active ? "Ativo" : "Inativo"}
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
          {filteredUnits.map((unit) => (
            <Card 
              key={unit._id}
              className="hover:bg-zinc-800 transition-colors cursor-pointer relative overflow-hidden"
              onClick={() => router.push(`/dashboard/units/${unit._id}`)}
            >
              <div className="relative h-32 w-full">
                <Image
                  src={unit.imageUrl || '/placeholder.jpg'}
                  alt={unit.nome}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="text-2xl font-bold">{unit.sigla} - {unit.nome}</div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Responsável</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={unit.imageUrl} />
                          <AvatarFallback>
                            {getInitial(getResponsavelName(unit.responsavel))}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {getResponsavelName(unit.responsavel)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Chef de Cozinha</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={unit.imageUrl} />
                          <AvatarFallback>
                            {getInitial(getChefName(unit.chefCozinha))}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {getChefName(unit.chefCozinha)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <Weather city={unit.cidade} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">0 usuários</span>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-zinc-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Gerenciar Acessos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Card de Adicionar Nova Unidade */}
          {isSuperAdmin && units.length < 3 && (
            <Card 
              className="border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer bg-transparent"
              onClick={() => router.push('/dashboard/units/new')}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-400 hover:text-orange-500">
                <PlusCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Adicionar Nova Unidade</p>
                <p className="text-sm opacity-70">€99/mês por unidade</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardView>
  );
}