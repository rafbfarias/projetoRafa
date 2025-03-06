import { CompanyManagement } from "@/modules/business/components/CompanyManagement";
import { CompanyList } from "@/modules/business/components/CompanyList";

export default function CompaniesPage() {
  return (
    <>
      <CompanyManagement />
      <CompanyList />
    </>
  );
} 