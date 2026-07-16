"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Phone, Mail, FileText, Loader2, AlertTriangle } from "lucide-react";
import { listarPacientes, type Paciente } from "@/services/prontuarioService";

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchPacientes() {
    try {
      const data = await listarPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPacientes();
  }, []);

  const formatarCpf = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const iniciais = (nome: string) =>
    nome.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Pacientes
            </h1>
            <p className="text-gray-500 mt-1">Prontuários e histórico de tratamentos</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] text-[#0B1F3A]"
        />
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Paciente</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">CPF</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Alertas</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
                  </td>
                </tr>
              ) : filteredPacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                filteredPacientes.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/pacientes/${paciente.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {iniciais(paciente.nome)}
                        </div>
                        <p className="font-medium text-gray-800">{paciente.nome}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{formatarCpf(paciente.cpf)}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {paciente.telefone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {paciente.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {(paciente.alergias.length > 0 || paciente.contraindicacoes.length > 0) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          {paciente.alergias.length + paciente.contraindicacoes.length}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/pacientes/${paciente.id}`);
                        }}
                        className="flex items-center gap-1 text-sm text-[#1C4468] hover:text-[#0B1F3A] font-medium"
                      >
                        <FileText className="w-4 h-4" /> Ver Prontuário
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
