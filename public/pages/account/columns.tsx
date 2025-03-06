"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Account } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "plan",
    header: "Plano",
    cell: ({ row }) => (
      <Badge 
        variant={
          row.original.plan === "free" 
            ? "secondary" 
            : row.original.plan === "pro" 
            ? "default"
            : "outline"
        }
      >
        {row.original.plan.toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "owner.name",
    header: "Proprietário",
  },
  {
    accessorKey: "maxUsers",
    header: "Limite Usuários",
  },
  {
    accessorKey: "maxUnits",
    header: "Limite Unidades",
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "success" : "destructive"}>
        {row.original.active ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(account._id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = `/dashboard/account/${account._id}`}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (window.confirm("Tem certeza que deseja desativar esta conta?")) {
                  // Aqui você chamaria a função onDelete que é passada como prop
                  // através do meta no DataTable
                  const table = row.table as any;
                  table.options.meta?.onDelete(account._id);
                }
              }}
            >
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 