"use client";

import Link from "next/link";
import { CheckCircle, Calendar, ArrowLeft, Sparkles } from "lucide-react";

export default function SucessoAgendamento() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] via-[#0d2444] to-[#0B1F3A] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1C4468]/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#4F7FAE]/20 rounded-full blur-3xl" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-700">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-50" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500 [animation-delay:200ms] fill-mode-both">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1F3A]/5 text-[#1C4468] text-xs font-semibold uppercase tracking-wide mb-3 animate-in fade-in duration-500 [animation-delay:300ms] fill-mode-both">
          <Sparkles className="w-3 h-3" /> Tudo certo
        </div>

        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:350ms] fill-mode-both">
          Agendamento Confirmado!
        </h1>

        <p className="text-gray-600 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:400ms] fill-mode-both">
          Seu horário foi reservado com sucesso. Em breve você receberá uma confirmação por e-mail.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:450ms] fill-mode-both">
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Informações do agendamento
          </p>
          <p className="font-semibold mt-1.5 text-[#0B1F3A]">{new Date().toLocaleDateString('pt-BR')}</p>
          <p className="text-sm text-gray-600 mt-2">
            Qualquer dúvida, entre em contato pelo telefone (81) 99999-9999
          </p>
        </div>

        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:500ms] fill-mode-both">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Voltar para o Site
          </Link>
          <Link
            href="/agendamento"
            className="text-[#1C4468] hover:text-[#0B1F3A] hover:underline flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Novo agendamento
          </Link>
        </div>
      </div>
    </div>
  );
}
