import Link from "next/link";
import { Sparkles, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] via-[#0d2444] to-[#0B1F3A] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1C4468]/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#4F7FAE]/20 rounded-full blur-3xl" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-700">
        <div className="w-16 h-16 bg-gradient-to-tr from-[#0B1F3A] to-[#2C5F8A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-6 animate-in zoom-in duration-500 [animation-delay:150ms] fill-mode-both">
          <Search className="w-7 h-7 text-white" />
        </div>

        <p className="text-6xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE] bg-clip-text text-transparent mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:250ms] fill-mode-both">
          404
        </p>

        <h1 className="text-xl font-bold text-[#0B1F3A] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:300ms] fill-mode-both">
          Página não encontrada
        </h1>

        <p className="text-gray-500 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:350ms] fill-mode-both">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>

        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:400ms] fill-mode-both">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o início
          </Link>
          <Link
            href="/agendamento"
            className="flex items-center justify-center gap-1.5 text-[#1C4468] hover:text-[#0B1F3A] text-sm font-medium hover:underline transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Agendar um horário
          </Link>
        </div>
      </div>
    </div>
  );
}
