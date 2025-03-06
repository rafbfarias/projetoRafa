'use client';

import { useState, useEffect } from 'react';
import { DashboardView } from '@/components/layouts/DashboardView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  CreditCard,
  ArrowRight,
  Settings,
  Loader2,
  Users,
  Upload,
  Store,
  Coffee,
  Wine,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { accountService } from '@/services/accountService';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Uploader } from '@/components/common/Uploader';

interface CreateAccountDTO {
  name: string;
  businessType: 'restaurant' | 'cafe' | 'bar' | 'other';
  corporateEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  settings: {
    timezone: string;
    currency: string;
    language: string;
  };
  taxId?: string;
  expectedUnits: number;
  customBusinessType?: string;
}

export default function WelcomePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState(user?.name || '');
  const [step, setStep] = useState<'name' | 'account' | 'plan'>('account');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  
  const [accountData, setAccountData] = useState<CreateAccountDTO>({
    name: '',
    businessType: 'restaurant',
    corporateEmail: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Portugal',
    settings: {
      timezone: 'Europe/Lisbon',
      currency: 'EUR',
      language: 'pt'
    },
    expectedUnits: 1
  });

  useEffect(() => {
    if (!user) return;
    
    const emailUsername = user.email.split('@')[0];
    
    const hasCustomName = user.name && user.name !== emailUsername;
    
    setUserName(user.name || emailUsername);
    setDisplayName(getDisplayName(user.name || emailUsername));
    
    if (hasCustomName) {
      setStep('account');
    } else {
      setStep('name');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    if (!user.accountId) {
      setStep('account');
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setAccountData(prev => ({
        ...prev,
        corporateEmail: user.email
      }));
    }
  }, [user?.email]);

  const handleUpdateName = async () => {
    try {
      setLoading(true);
      await api.patch('/users/me', { name: userName });
      await refreshUser();
      setStep('account');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (file: File) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
    } catch (error) {
      console.error('Erro ao preparar foto:', error);
      toast.error("Erro ao preparar foto");
      setPreviewUrl(null);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      
      const result = await userService.uploadPhoto(selectedFile);
      console.log('Resultado do upload:', result);
      
      await refreshUser();
      
      toast.success("Foto atualizada com sucesso");
      
      setSelectedFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error("Erro ao atualizar foto");
    } finally {
      setLoading(false);
    }
  };

  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, (letter) => letter.toUpperCase());
  };

  const getDisplayName = (fullName: string) => {
    const firstPart = fullName.split(' ')[0];
    return firstPart.slice(0, 12);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedValue = capitalizeWords(e.target.value);
    setUserName(capitalizedValue);
    setDisplayName(getDisplayName(capitalizedValue));
  };

  const handleCreateAccount = async () => {
    if (!accountData.name) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    try {
      setLoading(true);
      
      const newAccount = await accountService.create(accountData);
      
      await userService.updateUserAccount(newAccount._id);
      
      await refreshUser();
      
      toast.success("Empresa criada com sucesso!");
      setStep('plan');
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      toast.error(error?.response?.data?.message || "Não foi possível criar a empresa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardView
      title=""
      subtitle=""
      headerCard={{
        title: "",
        description: ""
      }}
      hideHeader={true}
    >
      <div className="max-w-5xl mx-auto pt-12 space-y-16">
        <div 
          className={`text-center space-y-8 transition-all duration-500 ease-in-out ${
            step === 'account' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
          }`}
        >
          <div className="w-32 h-32 mx-auto bg-[#111111] rounded-2xl p-6">
            <img 
              src="/images/system/logo.png" 
              alt="dineo logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white flex items-center justify-center gap-2">
              Bem-vindo ao dineo.
              {displayName && (
                <span className="text-zinc-500">/ {displayName}</span>
              )}
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              um sistema que simplifica a gestão complexa.
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-8 transition-all duration-500 ease-in-out ${
          step === 'account' ? '-mt-32' : ''
        }`}>
          <div className={`p-4 rounded-lg border ${step === 'name' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'name' ? 'bg-orange-500' : 'bg-zinc-800'}`}>1</div>
              <h3 className="font-medium">Seu Perfil</h3>
            </div>
            <p className="text-sm text-zinc-400">Configure suas informações básicas</p>
          </div>
          
          <div className={`p-4 rounded-lg border ${step === 'account' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'account' ? 'bg-orange-500' : 'bg-zinc-800'}`}>2</div>
              <h3 className="font-medium">Sua Empresa</h3>
            </div>
            <p className="text-sm text-zinc-400">Configure sua conta empresarial</p>
          </div>
          
          <div className={`p-4 rounded-lg border ${step === 'plan' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'plan' ? 'bg-orange-500' : 'bg-zinc-800'}`}>3</div>
              <h3 className="font-medium">Seu Plano</h3>
            </div>
            <p className="text-sm text-zinc-400">Escolha o plano ideal para você</p>
          </div>
        </div>

        {step === 'name' && (
          <div className="space-y-8">
            <Card className="border-zinc-800">
              <CardContent className="p-6">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Como podemos te chamar?</h2>
                    <p className="text-zinc-400">
                      Queremos tornar sua experiência mais pessoal
                    </p>
                  </div>

                  <Input
                    placeholder="Seu nome"
                    value={userName}
                    onChange={handleNameChange}
                    className="text-lg py-6"
                  />

                  <Button
                    onClick={handleUpdateName}
                    disabled={!userName.trim() || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!user?.imageUrl && (
              <Card className="border-zinc-800">
                <CardContent className="p-6">
                  <div className="max-w-xl mx-auto space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">Foto de perfil</h3>
                      <p className="text-zinc-400">
                        Eu sei que ainda é um pouco cedo pra pedir foto, mas ninguém gosta de trabalhar com um boneco cinza.
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <Uploader
                        currentUrl={user?.imageUrl || null}
                        onUpload={handlePhotoChange}
                        type="image"
                        shape="round"
                        className="w-32 h-32"
                        hoverText="Carregar foto"
                        maxSizeMB={5}
                        isAvatar={true}
                        actions={[
                          {
                            icon: ArrowRight,
                            label: "Salvar",
                            onClick: handleSavePhoto
                          }
                        ]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'account' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {accountData.name || 'Sua Empresa'}
              </h1>
              <h2 className="text-3xl font-bold text-zinc-500">
                Que tipo de negócio você gerencia, {user?.name?.split(' ')[0]}?
              </h2>
            </div>

            <Card className="border-zinc-800">
              <CardContent className="p-8">
                <div className="max-w-3xl mx-auto space-y-12">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold">Preencha os dados da sua empresa</h3>
                    <p className="text-zinc-400">
                      Estas informações são importantes para configurarmos seu ambiente
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg">Tipo de negócio</Label>
                    <div className="grid grid-cols-4 gap-6">
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          accountData.businessType === 'restaurant' 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-zinc-800 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setAccountData({ ...accountData, businessType: 'restaurant' })}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <Store className={`w-12 h-12 mx-auto ${
                            accountData.businessType === 'restaurant' 
                              ? 'text-orange-500' 
                              : 'text-zinc-400'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium mb-2">Restaurante</h3>
                            <p className="text-sm text-zinc-400">Restaurantes e bistrôs</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          accountData.businessType === 'cafe' 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-zinc-800 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setAccountData({ ...accountData, businessType: 'cafe' })}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <Coffee className={`w-12 h-12 mx-auto ${
                            accountData.businessType === 'cafe' 
                              ? 'text-orange-500' 
                              : 'text-zinc-400'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium mb-2">Café</h3>
                            <p className="text-sm text-zinc-400">Cafeterias e padarias</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          accountData.businessType === 'bar' 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-zinc-800 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setAccountData({ ...accountData, businessType: 'bar' })}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <Wine className={`w-12 h-12 mx-auto ${
                            accountData.businessType === 'bar' 
                              ? 'text-orange-500' 
                              : 'text-zinc-400'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium mb-2">Bar</h3>
                            <p className="text-sm text-zinc-400">Bares e pubs</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          accountData.businessType === 'other' 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-zinc-800 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setAccountData({ ...accountData, businessType: 'other' })}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <Plus className={`w-12 h-12 mx-auto ${
                            accountData.businessType === 'other' 
                              ? 'text-orange-500' 
                              : 'text-zinc-400'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium mb-2">Outro tipo</h3>
                            <p className="text-sm text-zinc-400">Personalizado</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-zinc-800">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-lg">Nome da empresa</Label>
                        <Input
                          placeholder="Nome da sua empresa"
                          value={accountData.name}
                          onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                          className="text-lg py-6"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg">Número fiscal</Label>
                        <Input
                          placeholder="NIF / CNPJ / VAT"
                          value={accountData.taxId}
                          onChange={(e) => setAccountData({ ...accountData, taxId: e.target.value })}
                          className="text-lg py-6"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-lg">Email corporativo</Label>
                        <Input
                          type="email"
                          placeholder="email@suaempresa.com"
                          value={accountData.corporateEmail}
                          onChange={(e) => setAccountData({ ...accountData, corporateEmail: e.target.value })}
                          className="py-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg">Unidades Previstas</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={accountData.expectedUnits}
                          onChange={(e) => setAccountData({ 
                            ...accountData, 
                            expectedUnits: parseInt(e.target.value) || 1 
                          })}
                          className="py-6"
                        />
                      </div>
                    </div>
                  </div>

                  {accountData.businessType === 'other' && (
                    <div className="space-y-2 pt-6 border-t border-zinc-800">
                      <Label className="text-lg">Qual o tipo do seu negócio?</Label>
                      <Input
                        placeholder="Ex: Food Truck, Dark Kitchen..."
                        value={accountData.customBusinessType}
                        onChange={(e) => setAccountData({ ...accountData, customBusinessType: e.target.value })}
                        className="py-6"
                        required
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleCreateAccount}
                    disabled={!accountData.name || loading || (accountData.businessType === 'other' && !accountData.customBusinessType)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        Criar Empresa
                        <ArrowRight className="ml-2 h-6 w-6" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'plan' && (
          <div className="space-y-8">
            <Card className="border-zinc-800">
              <CardContent className="p-6">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Escolha seu plano</h2>
                    <p className="text-zinc-400">
                      Selecione o plano que melhor atende às suas necessidades
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                  >
                    Começar a usar o dineo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardView>
  );
} 