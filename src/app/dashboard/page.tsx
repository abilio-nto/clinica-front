"use client";

import { useAuth } from "@/context/AuthContext.tsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "./admin/page";
import RecepcaoDashboard from "./recepcao/page";
import FinanceiroDashboard from "./financeiro/page";
import ProfissionalDashboard from "./profissional/page";
import ClienteDashboard from "./cliente/page";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case "ADMIN":    return <AdminDashboard />;
    case "RECEPCAO": return <RecepcaoDashboard />;
    case "FINANCEIRO": return <FinanceiroDashboard />;
    case "PROFISSIONAL": return <ProfissionalDashboard />;
    case "USER":     return <ClienteDashboard />;
    default:         return <AdminDashboard />;
  }
}
