'use client';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { CurrentPlan } from '@/components/account/CurrentPlan';
import { BillingHistory } from '@/components/account/BillingHistory';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useAccountPermissions } from '@/hooks/useAccountPermissions';

export default function BillingPage() {
  const { currentAccount, loading } = useCurrentAccount();
  const { can } = useAccountPermissions();

  if (loading) {
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

  if (!can.viewFinancials) {
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
      title="Faturamento"
      subtitle="Gerencie seu plano e visualize o histórico de faturamento"
    >
      <div className="space-y-8">
        <CurrentPlan />
        <BillingHistory />
      </div>
    </DashboardView>
  );
} 