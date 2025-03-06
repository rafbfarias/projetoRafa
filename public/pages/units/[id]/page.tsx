'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Wallet, Building } from 'lucide-react';
import { DetailView } from '@/components/layouts/DetailView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Save } from 'lucide-react';
import { unitService } from '@/services/unitService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Unit } from '@/types/unit';

interface FormData extends Partial<Unit> {
  photo?: {
    url?: string;
    file?: File;
  };
}

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    loadUnit();
  }, [params.id]);

  const loadUnit = async () => {
    try {
      const data = await unitService.getById(params.id);
      setUnit(data);
      setFormData({
        sigla: data.sigla,
        nome: data.nome,
        morada: data.morada,
        moradaFiscal: data.moradaFiscal,
        cidade: data.cidade,
        pais: data.pais,
        metrosQuadrados: data.metrosQuadrados,
        andares: data.andares,
        lugaresTotal: data.lugaresTotal,
        valorRenda: data.valorRenda,
        potencialFaturacao: data.potencialFaturacao,
        empresaId: data.empresaId,
        responsavelId: data.responsavelId,
        chefCozinhaId: data.chefCozinhaId,
        imageUrl: data.imageUrl
      });
    } catch (error) {
      console.error('Erro ao carregar unidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da unidade",
        variant: "destructive",
      });
      router.push('/dashboard/units');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      photo: { url, file }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await unitService.update(params.id, {
        ...formData,
        photo: formData.photo?.file
      });

      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso",
      });
      setEditing(false);
      loadUnit();
    } catch (error: any) {
      console.error('Erro ao atualizar unidade:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível atualizar a unidade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja desativar esta unidade?')) return;

    setLoading(true);
    try {
      await unitService.delete(params.id);
      toast({
        title: "Sucesso",
        description: "Unidade desativada com sucesso",
      });
      router.push('/dashboard/units');
    } catch (error) {
      console.error('Erro ao desativar unidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar a unidade",
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
                onChange={(e) => setFormData(prev => ({ ...prev, sigla: e.target.value.toUpperCase() }))}
                disabled={!editing}
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                disabled={!editing}
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
              onChange={(e) => setFormData(prev => ({ ...prev, morada: e.target.value }))}
              disabled={!editing}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="moradaFiscal">Morada Fiscal</Label>
            <Input
              id="moradaFiscal"
              value={formData.moradaFiscal}
              onChange={(e) => setFormData(prev => ({ ...prev, moradaFiscal: e.target.value }))}
              disabled={!editing}
            />
          </div>
        </div>
      )
    },
    {
      id: 'structure',
      title: 'Estrutura',
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metrosQuadrados">Metros Quadrados</Label>
            <Input
              id="metrosQuadrados"
              type="number"
              value={formData.metrosQuadrados}
              onChange={(e) => setFormData(prev => ({ ...prev, metrosQuadrados: Number(e.target.value) }))}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="andares">Número de Andares</Label>
            <Input
              id="andares"
              type="number"
              value={formData.andares}
              onChange={(e) => setFormData(prev => ({ ...prev, andares: Number(e.target.value) }))}
              disabled={!editing}
            />
          </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: 'Financeiro',
      icon: <Wallet className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valorRenda">Valor da Renda</Label>
            <Input
              id="valorRenda"
              type="number"
              value={formData.valorRenda}
              onChange={(e) => setFormData(prev => ({ ...prev, valorRenda: Number(e.target.value) }))}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lugaresTotal">Total de Lugares</Label>
            <Input
              id="lugaresTotal"
              type="number"
              value={formData.lugaresTotal}
              onChange={(e) => setFormData(prev => ({ ...prev, lugaresTotal: Number(e.target.value) }))}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="potencialFaturacao">Potencial de Faturação</Label>
            <Input
              id="potencialFaturacao"
              type="number"
              value={formData.potencialFaturacao}
              onChange={(e) => setFormData(prev => ({ ...prev, potencialFaturacao: Number(e.target.value) }))}
              disabled={!editing}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <DetailView
      title="Detalhes da Unidade"
      subtitle="Visualize e edite as informações da unidade"
      onBack={() => router.push('/dashboard/units')}
      isLoading={loading}
      headerInfo={unit ? {
        title: unit.nome,
        subtitle: unit.morada,
        photo: {
          url: formData.photo?.url || unit.imageUrl,
          onPhotoChange: handlePhotoChange,
          editable: editing
        },
        badges: [
          { label: 'Sigla', value: unit.sigla },
          { label: 'Cidade', value: unit.cidade },
          { label: 'Staff', value: unit.totalStaff?.toString() || '0' },
          { label: 'Lugares', value: unit.lugaresTotal?.toString() || '0' }
        ]
      } : undefined}
      sections={sections}
      actions={
        <>
          {!editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                disabled={loading}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  loadUnit();
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          )}
        </>
      }
    />
  );
} 