"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Clock, Users, ChevronRight } from "lucide-react";
import { api } from "@/services/api";

interface Agenda {
  id: number;
  dtAgenda: string;
  itensAgenda: any[];
}

export default function AgendaPage() {
  const router = useRouter();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgendas();
  }, []);

  async function fetchAgendas() {
    try {
      const response = await api.get("/agendas/ListAll");
      setAgendas(response.data);
    } catch (error) {
      console.error("Erro ao carregar agendas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
            Agenda
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os horários de atendimento</p>
        </div>
        
        <button
          onClick={() => router.push("/dashboard/agenda/gerar")}
          className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] hover:from-[#1C4468] hover:to-[#0B1F3A] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Agenda
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : agendas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma agenda encontrada</h3>
          <p className="text-gray-500 mb-4">Clique no botão acima para gerar uma nova agenda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendas.map((agenda) => (
            <div
              key={agenda.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => router.push(`/dashboard/agenda/${agenda.id}`)}
            >
              <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] p-4 text-white">
                <div className="flex items-center justify-between">
                  <Calendar className="w-6 h-6 opacity-90" />
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
                <p className="text-2xl font-bold mt-3">
                  {new Date(agenda.dtAgenda).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{agenda.itensAgenda?.length || 0} horários disponíveis</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {agenda.itensAgenda?.filter((i: any) => i.status === "DISPONIVEL").length || 0} vagas livres
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}