"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Calendar, Clock, Users, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

type GerarAgendaData = {
  dataInicial: string;
  dataFinal: string;
  quantidadeVagas: number;
  horaInicial: string;
};

export default function GerarAgenda() {
  const { register, handleSubmit, formState: { errors } } = useForm<GerarAgendaData>();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(data: GerarAgendaData) {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.post("/agendas/gerar", {
        dataInicial: data.dataInicial,
        dataFinal: data.dataFinal,
        quantidadeVagas: data.quantidadeVagas,
        horaInicial: data.horaInicial
      });
      
      setSuccessMessage(response.data || "Agendas geradas com sucesso!");
      
      // Limpa mensagem após 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erro ao gerar agendas");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
            Gerar Agenda
          </h1>
        </div>
        <p className="text-gray-500 ml-12">
          Crie horários disponíveis para atendimento em um período específico
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] px-6 py-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Configuração da Agenda
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  {...register("dataInicial", { required: "Data inicial é obrigatória" })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] transition-all
                    ${errors.dataInicial ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0B1F3A]'}`}
                />
              </div>
              {errors.dataInicial && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.dataInicial.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  {...register("dataFinal", { required: "Data final é obrigatória" })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] transition-all
                    ${errors.dataFinal ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0B1F3A]'}`}
                />
              </div>
              {errors.dataFinal && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.dataFinal.message}
                </p>
              )}
            </div>
          </div>

          {/* Quantidade de Vagas e Hora Inicial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Vagas por Dia *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  {...register("quantidadeVagas", { 
                    required: "Quantidade é obrigatória",
                    min: { value: 1, message: "Mínimo 1 vaga" },
                    max: { value: 20, message: "Máximo 20 vagas por dia" }
                  })}
                  placeholder="Ex: 8"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] transition-all
                    ${errors.quantidadeVagas ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0B1F3A]'}`}
                />
              </div>
              {errors.quantidadeVagas && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.quantidadeVagas.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Inicial *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  {...register("horaInicial", { required: "Horário inicial é obrigatório" })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] transition-all
                    ${errors.horaInicial ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0B1F3A]'}`}
                />
              </div>
              {errors.horaInicial && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.horaInicial.message}
                </p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Como funciona a geração?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Serão geradas {"> "}vagas com intervalos de 60 minutos entre cada horário</li>
                  <li>• Apenas dias sem agenda pré-existente serão processados</li>
                  <li>• Vagas serão marcadas como "DISPONÍVEL" inicialmente</li>
                  <li>• O sistema ignora automaticamente dias já agendados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] hover:from-[#1C4468] hover:to-[#0B1F3A] text-white py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando Agenda...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Gerar Agenda
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Preview Card (Opcional) */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Exemplo de geração
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong className="text-[#0B1F3A]">Data:</strong> 25/12/2024
          </p>
          <p className="text-sm text-gray-600">
            <strong className="text-[#0B1F3A]">Horários gerados:</strong> 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[1,2,3,4,5,6,7,8].map((_, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Disponível
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}