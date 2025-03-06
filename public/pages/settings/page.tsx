'use client';

import { useState } from 'react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountIntegrations } from '@/components/account/AccountIntegrations';
import { ApiKeys } from '@/components/account/ApiKeys';
import { NotificationSettings } from '@/components/account/NotificationSettings';
import { SecuritySettings } from '@/components/account/SecuritySettings';
import { EmailSettings } from '@/components/account/EmailSettings';
import { AppearanceSettings } from '@/components/account/AppearanceSettings';
import { Webhooks } from '@/components/account/Webhooks';
import { AuditLog } from '@/components/account/AuditLog';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useAccountPermissions } from '@/hooks/useAccountPermissions';
import {
  Settings,
  Link,
  Key,
  Bell,
  Shield,
  Mail,
  Palette,
  Webhook,
  History,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentAccount, loading: accountLoading } = useCurrentAccount();
  const { can } = useAccountPermissions();
  const [activeTab, setActiveTab] = useState('integrations');

  if (accountLoading) {
    return <DashboardView isLoading={true} />;
  }

  if (!currentAccount) {
    return (
      <DashboardView>
        <div className="text-center py-8">
          <p>Nenhuma empresa selecionada</p>
        </div>
      </DashboardView>
    );
  }

  if (!can.viewSettings) {
    return (
      <DashboardView>
        <div className="text-center py-8">
          <p>Você não tem permissão para acessar esta página</p>
        </div>
      </DashboardView>
    );
  }

  return (
    <DashboardView
      title="Configurações"
      subtitle="Gerencie as configurações da sua empresa"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-8">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <div className="space-y-8">
          <TabsContent value="integrations">
            <AccountIntegrations />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeys />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="email">
            <EmailSettings />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="webhooks">
            <Webhooks />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>
        </div>
      </Tabs>
    </DashboardView>
  );
} 