'use client'; // Indica que este código roda no navegador do usuário, não no servidor

// Importando as ferramentas que vamos precisar
// useState: para criar variáveis que podem mudar e atualizar a tela automaticamente
// useEffect: para executar código quando a página carrega
import { useState, useEffect, useRef } from 'react';
// useRouter: para navegar entre páginas diferentes
// usePathname: para saber em qual página estamos atualmente
import { useRouter, usePathname } from 'next/navigation';
// Link: para criar links que não recarregam a página inteira
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UnitProvider } from '@/contexts/UnitContext';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

// Importando os ícones que vamos usar no menu
import { 
  LayoutDashboard,  // Ícone de grade para o Dashboard
  DollarSign,       // Ícone de cifrão para Rendimentos
  Users,            // Ícone de pessoas para Funcionários
  Clock,            // Ícone de relógio para Relatórios
  Settings,         // Ícone de engrenagem para Configurações
  LogOut,           // Ícone de porta para Sair
  Building2,        // Adicionando o ícone de prédio
  ShoppingCart,     // Adicionando o ícone de carrinho
  Calendar,         // Novo ícone para Timesheet
  TrendingUp,       // Novo ícone para Incomes
  FileText,         // Novo ícone para Contracts
  ClipboardList,     // Novo ícone para Orders
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building,         // Novo ícone para Account
  Sparkles,
  Lock,
  Upload,
  Trash2,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Tag,
  GraduationCap,
  Heart,
  Briefcase,
  Target,
  Wrench,          // Para manutenção
  Hammer,          // Para equipamentos
  Utensils,        // Para cozinha/produção
  ShieldAlert,     // Para segurança alimentar
  Truck,           // Para entregas
  Package,         // Para estoque
  Store,           // Para loja
  Home,
  BarChart,
  Bell,         // Para notificações
  Mail,         // Para email
  Webhook,      // Para webhooks
  CreditCard,   // Para faturamento
  Database,     // Para backup
} from 'lucide-react';

// Importar o componente
import { TimeTracker } from '@/components/common/TimeTracker';
import { Uploader } from '@/components/common/Uploader';

import type { LucideIcon } from 'lucide-react';

// Esta é a estrutura principal do Dashboard que vai envolver todas as outras páginas
export default function DashboardLayout({
  children,  // children são as outras páginas que serão mostradas dentro deste layout
}: {
  children: React.ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();  // Para navegar entre páginas
  const pathname = usePathname();  // Para saber qual página está ativa
  // loading controla se estamos carregando a página ou não
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  
  interface ExpandedSections {
    finances: boolean;
    humanResources: boolean;
    procurement: boolean;
    settings: boolean;
    hr: boolean;
    infrastructure: boolean;
    kitchen: boolean;
    account: boolean;
  }

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('menuSections');
      return saved ? JSON.parse(saved) : {
        finances: false,
        humanResources: false,
        procurement: false,
        settings: false,
        hr: false,
        infrastructure: false,
        kitchen: false,
        account: false,
      };
    }
    return {
      finances: false,
      humanResources: false,
      procurement: false,
      settings: false,
      hr: false,
      infrastructure: false,
      kitchen: false,
      account: false,
    };
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('menuSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Este código roda quando a página carrega
  useEffect(() => {
    // Verifica se o usuário está logado (procura o token de acesso)
    const token = localStorage.getItem('token');
    if (!token) {
      // Se não estiver logado, volta para a página inicial
      router.push('/');
    } else {
      // Se estiver logado, para de mostrar a tela de carregamento
      setLoading(false);
    }
  }, [router]);

  // Função que verifica se um item do menu está ativo
  const isActive = (path: string) => pathname?.startsWith(path);

  const toggleSection = (section: keyof ExpandedSections) => {
    if (!isCollapsed) {
      setExpandedSections((prev: ExpandedSections) => {
        const newState = {
          ...prev,
          [section]: !prev[section]
        };
        
        setTimeout(() => {
          const sectionElement = document.getElementById(`section-${String(section)}`);
          if (sectionElement && scrollContainerRef.current) {
            const containerRect = scrollContainerRef.current.getBoundingClientRect();
            const sectionRect = sectionElement.getBoundingClientRect();
            const scrollTarget = sectionElement.offsetTop - containerRect.height/2 + sectionRect.height/2;
            scrollContainerRef.current.scrollTo({
              top: scrollTarget,
              behavior: 'smooth'
            });
          }
        }, 100);
        
        return newState;
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/'); // Atualizado para redirecionar para a página raiz
  };

  // Verifica se o usuário tem uma account
  const needsSetup = !user?.accountId;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Upload da foto usando o serviço
      await userService.uploadPhoto(file);
      
      // Atualizar o contexto do usuário para refletir a nova foto
      await refreshUser();
      
      toast.success("Foto atualizada com sucesso");
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error("Erro ao atualizar foto");
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Remover a foto usando o serviço
      await userService.removePhoto();
      
      // Atualizar o contexto do usuário para refletir a remoção da foto
      await refreshUser();
      
      toast.success("Foto removida com sucesso");
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error("Erro ao remover foto");
    }
  };

  // Se ainda estiver carregando, mostra uma mensagem de "Loading..."
  if (loading) {
    return <div>Loading...</div>;
  }

  interface MenuSectionProps {
    title: string;
    icon: LucideIcon;
    section: keyof ExpandedSections;
    children: React.ReactNode;
  }

  const MenuSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: MenuSectionProps) => (
    <div 
      id={`section-${String(section)}`}
      className="space-y-2"
    >
      <button 
        onClick={() => toggleSection(section)}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-12 text-zinc-400 hover:text-white transition-colors`}
      >
        <div className="flex items-center">
          <Icon size={28} />
          {!isCollapsed && <span className="ml-3">{title}</span>}
        </div>
        {!isCollapsed && (
          <ChevronDown 
            size={20} 
            className={`transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {(expandedSections[section] || isCollapsed) && (
        <div className={`space-y-2 ${!isCollapsed ? 'ml-4 pl-4 border-l border-zinc-800' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowTopGradient(target.scrollTop > 20);
    setShowBottomGradient(
      target.scrollHeight - target.scrollTop - target.clientHeight > 20
    );
  };

  // A estrutura visual do Dashboard
  return (
    <UnitProvider>
      <div className="flex h-screen bg-black overflow-hidden">
        <aside className={`
          ${isCollapsed ? 'w-20' : 'w-74'} 
          bg-black flex flex-col 
          transition-all duration-300 
          relative
          flex-shrink-0
          border-r border-zinc-800
        `}>
          {/* Botão de colapsar maior */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-6 z-50 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-zinc-300" />
            )}
          </button>

          <div className="flex flex-col h-full">
            <div 
              ref={scrollContainerRef}
              className="
                flex-1 overflow-y-auto
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-black
                [&::-webkit-scrollbar-thumb]:bg-zinc-800
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:border-2
                [&::-webkit-scrollbar-thumb]:border-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700
                transition-colors
                overscroll-none
                w-full
              "
              onScroll={handleScroll}
            >
              <div className="px-6 pt-8">
                {/* Logo e título com mais espaço */}
                <div className={`mb-8 ${isCollapsed ? 'flex justify-center' : ''}`}>
                  <div className="flex items-end gap-4">
                    <div className={`${isCollapsed ? 'mx-auto' : ''} w-12 h-12 bg-white/10 rounded-lg flex-shrink-0`}>
                      <img src="/images/system/logo.png" alt="dineo logo" className="w-full h-full object-contain p-2" />
                    </div>
                    {!isCollapsed && (
                      <h1 className="text-5xl font-bold text-white leading-none">dineo.</h1>
                    )}
                  </div>
                  {!isCollapsed && (
                    <p className="text-sm text-gray-400 mt-4 transition-opacity duration-300">
                      Enjoy. We handle things
                    </p>
                  )}
                </div>

                {/* Avatar e Info do Usuário */}
                <div className={`flex flex-col items-center gap-4 ${isCollapsed ? 'px-0' : 'px-4'}`}>
                  <div className={`w-full relative group/avatar hover:z-50`}>
                    <Uploader
                      key={user?.imageUrl ?? null}
                      currentUrl={user?.imageUrl ?? null}
                      onUpload={async (file) => {
                        try {
                          await userService.uploadPhoto(file);
                          await refreshUser();
                          toast.success("Foto atualizada com sucesso");
                        } catch (error) {
                          toast.error("Erro ao atualizar foto");
                        }
                      }}
                      type="image"
                      shape="square"
                      isAvatar={true}
                      isCollapsed={isCollapsed}
                      actions={[
                        {
                          icon: Upload,
                          label: 'Alterar',
                          onClick: () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
                        },
                        {
                          icon: Eye,
                          label: 'Visualizar',
                          onClick: () => {
                            const url = user?.imageUrl;
                            if (url) window.open(url, '_blank');
                          }
                        },
                        {
                          icon: Trash2,
                          label: 'Remover',
                          onClick: async () => {
                            try {
                              await userService.removePhoto();
                              await refreshUser();
                              toast.success("Foto removida com sucesso");
                            } catch (error) {
                              toast.error("Erro ao remover foto");
                            }
                          },
                          variant: 'danger'
                        }
                      ]}
                    />
                  </div>
                  
                  {/* Informações do usuário abaixo do avatar */}
                  {!isCollapsed && (
                    <div className="text-center w-full space-y-1">
                      <p className="font-medium text-white truncate">{user?.name || 'Usuário'}</p>
                      <p className="text-sm text-zinc-400 truncate">
                        {user?.accountId ? 'Account #' + user.accountId : 'Sem account'}
                      </p>
                      
                      {/* TimeTracker integrado sem gap */}
                      <div className="w-full mt-4">
                        <TimeTracker />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-zinc-800 my-6" />

              {/* Área de navegação */}
              <nav className="px-6 space-y-2 pb-24"> {/* padding-bottom extra para o gradiente */}
                {/* Link de Welcome para usuários sem account */}
                {needsSetup && (
                  <Link 
                    href="/dashboard/welcome" 
                    className={`flex items-center ${
                      isCollapsed 
                        ? 'justify-center w-full h-12 hover:bg-white/5 rounded' 
                        : 'justify-start min-h-[72px] p-4'
                    } rounded transition-colors ${
                      isActive('/dashboard/welcome') 
                        ? 'bg-orange-500/20 text-orange-500' 
                        : 'text-orange-500 hover:bg-orange-500/10'
                    }`}
                  >
                    <Sparkles size={28} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="ml-3 flex-1">
                        <span className="font-medium block">Complete seu cadastro</span>
                        <p className="text-xs text-orange-500/70 mt-0.5">Configure sua conta para começar</p>
                      </div>
                    )}
                  </Link>
                )}

                {/* Dashboard link com cadeado quando não tem account */}
                <Link 
                  href="/dashboard" 
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                    isActive('/dashboard') && !pathname?.includes('/') 
                      ? 'bg-white/10 text-white' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <LayoutDashboard size={28} />
                    {!isCollapsed && <span className="ml-3">Dashboard</span>}
                  </div>
                  {!isCollapsed && needsSetup && <Lock size={16} />}
                </Link>

                <MenuSection 
                  title="Finances" 
                  icon={DollarSign} 
                  section="finances"
                >
                  <Link 
                    href="/dashboard/financial" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <LayoutDashboard size={28} />
                      {!isCollapsed && <span className="ml-3">Dashboard</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/financial/payables" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial/payables') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <ArrowUpCircle size={28} />
                      {!isCollapsed && <span className="ml-3">Contas a Pagar</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/financial/receivables" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial/receivables') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <ArrowDownCircle size={28} />
                      {!isCollapsed && <span className="ml-3">Contas a Receber</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/financial/cost-centers" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial/cost-centers') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Building2 size={28} />
                      {!isCollapsed && <span className="ml-3">Centros de Custo</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/financial/cost-categories" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial/cost-categories') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Tag size={28} />
                      {!isCollapsed && <span className="ml-3">Categorias</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/financial/reports" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/financial/reports') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <FileText size={28} />
                      {!isCollapsed && <span className="ml-3">Relatórios</span>}
                    </div>
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Recursos Humanos" 
                  icon={Users} 
                  section="hr"
                >
                  <Link 
                    href="/dashboard/hr/recruitment" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/recruitment') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Briefcase className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Recrutamento</span>}
                  </Link>

                  <Link 
                    href="/dashboard/hr/performance" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/performance') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Target className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Desempenho</span>}
                  </Link>

                  <Link 
                    href="/dashboard/hr/training" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/training') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <GraduationCap className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Treinamentos</span>}
                  </Link>

                  <Link 
                    href="/dashboard/hr/time" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/time') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Clock className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Ponto e Frequência</span>}
                  </Link>

                  <Link 
                    href="/dashboard/hr/documents" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/documents') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ClipboardList className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Documentos</span>}
                  </Link>

                  <Link 
                    href="/dashboard/hr/benefits" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/hr/benefits') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Benefícios</span>}
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Infraestrutura" 
                  icon={Hammer} 
                  section="infrastructure"
                >
                  <Link 
                    href="/dashboard/infrastructure/equipment" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/infrastructure/equipment') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Hammer className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Equipamentos</span>}
                  </Link>

                  <Link 
                    href="/dashboard/infrastructure/maintenance" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/infrastructure/maintenance') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Wrench className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Manutenção</span>}
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Cozinha" 
                  icon={Utensils} 
                  section="kitchen"
                >
                  <Link 
                    href="/dashboard/kitchen/production" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/kitchen/production') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ClipboardList className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Ordens de Produção</span>}
                  </Link>

                  <Link 
                    href="/dashboard/kitchen/technical-sheets" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/kitchen/technical-sheets') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Fichas Técnicas</span>}
                  </Link>

                  <Link 
                    href="/dashboard/kitchen/safety" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/kitchen/safety') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ShieldAlert className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span>Segurança Alimentar</span>}
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Procurement" 
                  icon={ShoppingCart} 
                  section="procurement"
                >
                  <Link 
                    href="/dashboard/procurement/orders" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/procurement/orders') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <ClipboardList size={28} />
                      {!isCollapsed && <span className="ml-3">Pedidos</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/procurement/suppliers" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/procurement/suppliers') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Building2 size={28} />
                      {!isCollapsed && <span className="ml-3">Fornecedores</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/procurement/inventory" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/procurement/inventory') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Package size={28} />
                      {!isCollapsed && <span className="ml-3">Estoque</span>}
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/procurement/delivery" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/procurement/delivery') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Truck size={28} />
                      {!isCollapsed && <span className="ml-3">Entregas</span>}
                    </div>
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Businesses" 
                  icon={Building} 
                  section="businesses"
                >
                  <Link 
                    href="/dashboard/companies" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/companies') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Building size={28} />
                    {!isCollapsed && <span className="ml-3">Companies</span>}
                  </Link>

                  <Link 
                    href="/dashboard/branches" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/branches') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Building2 size={28} />
                    {!isCollapsed && <span className="ml-3">Branches</span>}
                  </Link>

                  <Link 
                    href="/dashboard/users" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/users') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users size={28} />
                    {!isCollapsed && <span className="ml-3">Users</span>}
                  </Link>
                </MenuSection>

                <MenuSection 
                  title="Account" 
                  icon={Building} 
                  section="account"
                >
                  <Link 
                    href="/dashboard/account" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Building size={28} />
                    {!isCollapsed && <span className="ml-3">Account</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/users" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/users') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users size={28} />
                    {!isCollapsed && <span className="ml-3">Users</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/billing" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/billing') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CreditCard size={28} />
                    {!isCollapsed && <span className="ml-3">Billing</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/security" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/security') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Lock size={28} />
                    {!isCollapsed && <span className="ml-3">Security</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/notifications" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/notifications') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Bell size={28} />
                    {!isCollapsed && <span className="ml-3">Notifications</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/email" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/email') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mail size={28} />
                    {!isCollapsed && <span className="ml-3">Email</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/webhooks" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/webhooks') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Webhook size={28} />
                    {!isCollapsed && <span className="ml-3">Webhooks</span>}
                  </Link>

                  <Link 
                    href="/dashboard/account/backup" 
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-12 rounded transition-colors ${
                      isActive('/dashboard/account/backup') 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Database size={28} />
                    {!isCollapsed && <span className="ml-3">Backup</span>}
                  </Link>
                </MenuSection>
              </nav>
            </div>

            {/* Footer fixo */}
            <div className="border-t border-zinc-800 bg-black h-[72px] flex-shrink-0">
              <div className="p-6">
                <div className="flex items-center justify-center h-12">
                  {!isCollapsed && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-zinc-400">{user?.globalRole}</p>
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center w-12 h-12 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    title="Logout"
                  >
                    <LogOut size={28} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-zinc-900 overflow-hidden">
          <div className="h-full overflow-auto overscroll-none">
            <div className="p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </UnitProvider>
  );
}
