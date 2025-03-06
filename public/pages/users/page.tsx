import { UserManagement } from "@/modules/business/components/UserManagement";
import { UserList } from "@/modules/business/components/UserList";

export default function UsersPage() {
  return (
    <>
      <UserManagement />
      <UserList />
    </>
  );
}