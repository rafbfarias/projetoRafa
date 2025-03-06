'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import accountService from '@/services/accountService';
import type { CreateAccountDTO } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

type AccountPlan = 'free' | 'pro' | 'enterprise';

export default function NewAccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAccountDTO>({
    name: '',
    plan: 'free',
    settings: {
      timezone: 'UTC',
      currency: 'EUR',
      language: 'pt'
    },
    maxUsers: 5,
    maxUnits: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await accountService.create(formData);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso",
      });
      router.push('/dashboard/account');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.globalRole !== 'superadmin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você não tem permissão para acessar esta página.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Nova Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Nome</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label>Plano</label>
              <Select
                value={formData.plan}
                onValueChange={(value: AccountPlan) => setFormData({...formData, plan: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Máximo de Usuários</label>
              <Input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label>Máximo de Unidades</label>
              <Input
                type="number"
                value={formData.maxUnits}
                onChange={(e) => setFormData({...formData, maxUnits: parseInt(e.target.value)})}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 