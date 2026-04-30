"use client";

import Link from "next/link";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";

export default function SucessoAgendamento() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">
          Agendamento Confirmado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Seu horário foi reservado com sucesso. Em breve você receberá uma confirmação por e-mail.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500">Informações do agendamento</p>
          <p className="font-semibold mt-1">📅 {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="text-sm text-gray-600 mt-2">
            Qualquer dúvida, entre em contato pelo telefone (81) 99999-9999
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Voltar para o Site
          </Link>
          <Link
            href="/agendamento"
            className="text-[#1C4468] hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Novo agendamento
          </Link>
        </div>
      </div>
    </div>
  );
}