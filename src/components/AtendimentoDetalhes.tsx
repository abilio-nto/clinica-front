// components/AtendimentoDetalhes.tsx
"use client";

import { useState } from "react";
import { X, Play, CheckCircle, Clock, User, Phone, Calendar, DollarSign, FileText, AlertCircle,Mail } from "lucide-react";
import { api } from "@/services/api";

interface AtendimentoDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  atendimento: {
    id: number;
    hrAgendamento: string;
    procedimento: string;
    valorProcedimento: number;
    status: string;
    nomeCliente?: string;
    nomeProfissional?: string;
    emailCliente?: string;
    telefoneCliente?: string;
  };
  onStatusChange: () => void;
}

export function AtendimentoDetalhes({ isOpen, onClose, atendimento, onStatusChange }: AtendimentoDetalhesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"iniciar" | "finalizar" | null>(null);

  if (!isOpen) return null;

  const handleIniciarAtendimento = async () => {
    setIsLoading(true);
    try {
      await api.put(`/atendimento/iniciar-atendimento/${atendimento.id}`);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
      alert("Erro ao iniciar atendimento. Tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleFinalizarAtendimento = async () => {
    setIsLoading(true);
    try {
      await api.put(`/atendimento/finalizar-atendimento/${atendimento.id}`, {
        observacoes: observacoes,
        dataHoraFim: new Date().toISOString()
      });
      onStatusChange();
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      alert("Erro ao finalizar atendimento. Tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-700';
      case 'CANCELADO':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'Agendado';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'FINALIZADO':
        return 'Finalizado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A]">Detalhes do Atendimento</h2>
              <p className="text-gray-500 text-sm mt-1">Gerencie o andamento do atendimento</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(atendimento.status)}`}>
                {getStatusText(atendimento.status)}
              </span>
              <span className="text-sm text-gray-500">
                ID: #{atendimento.id}
              </span>
            </div>

            {/* Horário */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-semibold text-[#0B1F3A]">{atendimento.hrAgendamento}</p>
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-[#0B1F3A]" />
                <p className="font-semibold text-[#0B1F3A]">Cliente</p>
              </div>
              <div className="ml-8 space-y-2">
                <p className="text-gray-800 font-medium">{atendimento.nomeCliente || 'Não informado'}</p>
                {atendimento.telefoneCliente && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{atendimento.telefoneCliente}</span>
                  </div>
                )}
                {atendimento.emailCliente && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{atendimento.emailCliente}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Procedimento */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-[#0B1F3A]" />
                <p className="font-semibold text-[#0B1F3A]">Procedimento</p>
              </div>
              <div className="ml-8">
                <p className="text-gray-800">{atendimento.procedimento || 'Não especificado'}</p>
                {atendimento.valorProcedimento > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Valor: R$ {atendimento.valorProcedimento.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-[#0B1F3A]" />
                <p className="font-semibold text-[#0B1F3A]">Observações</p>
              </div>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre o atendimento..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] text-gray-800"
                rows={4}
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              {atendimento.status === 'AGENDADO' && (
                <button
                  onClick={() => {
                    setActionType("iniciar");
                    setShowConfirmDialog(true);
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Atendimento
                </button>
              )}

              {atendimento.status === 'EM_ANDAMENTO' && (
                <button
                  onClick={() => {
                    setActionType("finalizar");
                    setShowConfirmDialog(true);
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Finalizar Atendimento
                </button>
              )}

              {(atendimento.status === 'FINALIZADO' || atendimento.status === 'CANCELADO') && (
                <div className="flex-1 text-center py-3 bg-gray-100 rounded-lg text-gray-500">
                  Atendimento já foi {getStatusText(atendimento.status).toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-800">
                {actionType === "iniciar" ? "Iniciar Atendimento" : "Finalizar Atendimento"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {actionType === "iniciar" 
                ? "Tem certeza que deseja iniciar este atendimento?" 
                : "Tem certeza que deseja finalizar este atendimento? Esta ação não poderá ser desfeita."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={actionType === "iniciar" ? handleIniciarAtendimento : handleFinalizarAtendimento}
                disabled={isLoading}
                className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg hover:bg-[#1C4468] transition disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}