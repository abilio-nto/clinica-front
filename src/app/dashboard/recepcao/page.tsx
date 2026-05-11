"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Eye, Plus, Search } from "lucide-react";
import { api } from "@/services/api";

interface Agendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string;
  status: string;
  nomeCliente: string;
  telefoneCliente: string;
  emailCliente: string;
}

export default function RecepcaoDashboard() {
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAgendamentosHoje();
  }, []);

  async function fetchAgendamentosHoje() {
    try {
      const response = await api.get("/agendas/AgendaHoje");
      setAgendamentosHoje(response.data.itensAgenda || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAgendamentos = agendamentosHoje.filter(apt => 
    apt.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.procedimento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AGENDADO': return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZADO': return 'bg-green-100 text-green-700';
      case 'CANCELADO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'AGENDADO': return 'Agendado';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'FINALIZADO': return 'Finalizado';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Recepção
            </h1>
            <p className="text-gray-500 mt-1">Gerencie os atendimentos do dia</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Hoje</p>
              <p className="text-2xl font-bold text-[#0B1F3A]">{agendamentosHoje.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-[#0B1F3A] opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-yellow-600">
                {agendamentosHoje.filter(a => a.status === 'EM_ANDAMENTO').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Finalizados</p>
              <p className="text-2xl font-bold text-green-600">
                {agendamentosHoje.filter(a => a.status === 'FINALIZADO').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente ou procedimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
        />
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Horário</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Procedimento</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
                  </td>
                </tr>
              ) : filteredAgendamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                filteredAgendamentos.map((apt) => (
                  <tr key={apt.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-[#1C4468]">{apt.hrAgendamento.substring(0, 5)}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{apt.nomeCliente || 'Horário livre'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{apt.procedimento || '—'}</td>
                    <td className="p-4">
                      {apt.telefoneCliente && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{apt.telefoneCliente}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão Novo Agendamento */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}