"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Calendar, Sparkles, Star, Clock, Shield, Heart, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const servicos = [
    { nome: "Limpeza de Pele", descricao: "Remoção de impurezas e renovação celular", duracao: "60min", preco: "R$ 150" },
    { nome: "Botox", descricao: "Suavização de linhas de expressão", duracao: "30min", preco: "R$ 450" },
    { nome: "Preenchimento Facial", descricao: "Restauração de volume facial", duracao: "45min", preco: "R$ 800" },
    { nome: "Drenagem Linfática", descricao: "Redução de inchaço e retenção", duracao: "50min", preco: "R$ 120" },
    { nome: "Harmonização Facial", descricao: "Equilíbrio dos traços faciais", duracao: "90min", preco: "R$ 1.200" },
    { nome: "Peeling Químico", descricao: "Renovação da pele profunda", duracao: "40min", preco: "R$ 250" },
  ];

  const diferenciais = [
    { icone: Star, titulo: "Produtos Premium", descricao: "Utilizamos apenas produtos de alta qualidade e aprovados pela ANVISA" },
    { icone: Shield, titulo: "Profissionais Certificados", descricao: "Equipe especializada e constantemente atualizada" },
    { icone: Heart, titulo: "Atendimento Humanizado", descricao: "Cuidamos de você com carinho e respeito" },
    { icone: Clock, titulo: "Flexibilidade de Horários", descricao: "Atendemos em horários convenientes para você" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-[#0B1F3A] shadow-lg"
          : "bg-gradient-to-r from-[#0B1F3A]/95 to-[#1C4468]/95 backdrop-blur-sm"
        }`}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Nome - Lado Esquerdo */}
            <div className="flex items-center gap-3">
              {/* Container da Imagem com fundo branco/sutil */}
              <div className="">
                <img
                  src="/topoSite3.png"
                  alt="Nayane Pimentel - Estética Avançada"
                  className="h-15 w-40 rounded-lg"
                
                />
              </div>
              {/* <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Nayane Pimentel</h1>
                <p className="text-xs text-white/70">Estética Avançada</p>
              </div> */}
            </div>

            {/* Navegação Desktop - Centralizada */}
            <nav className="hidden md:flex gap-8">
              {['Início', 'Serviços', 'Sobre', 'Contato'].map((item, index) => {
                const href = `#${item.toLowerCase() === 'início' ? 'home' : item.toLowerCase()}`;
                return (
                  <a
                    key={index}
                    href={href}
                    className="text-white/80 hover:text-white transition-colors duration-200 font-medium relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                  </a>
                );
              })}
            </nav>

            {/* Botões - Lado Direito */}
            <div className="flex gap-3">
              <Link
                href="/agendamento"
                className="bg-white text-[#0B1F3A] px-5 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Agendar Horário
              </Link>
              <Link
                href="/login"
                className="border-2 border-white/80 text-white px-5 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A]/5 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1C4468]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0B1F3A]/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#0B1F3A]" />
                <span className="text-sm font-medium text-[#0B1F3A]">Excelência em Estética</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#0B1F3A] mb-6">
                Sua beleza,
                <span className="block text-[#1C4468]">nossa prioridade</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Tratamentos exclusivos com tecnologia de ponta e profissionais especializados para realçar sua beleza natural.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/agendamento" className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Agendar Agora <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#servicos" className="border-2 border-[#0B1F3A] text-[#0B1F3A] px-8 py-3 rounded-xl font-semibold hover:bg-[#0B1F3A] hover:text-white hover:-translate-y-0.5 transition-all">
                  Ver Serviços
                </a>
              </div>
              <div className="flex gap-8 mt-8 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3A]">500+</p>
                  <p className="text-sm text-gray-500">Clientes Satisfeitos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3A]">10+</p>
                  <p className="text-sm text-gray-500">Anos de Experiência</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3A]">20+</p>
                  <p className="text-sm text-gray-500">Tratamentos Especializados</p>
                </div>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-2xl blur-3xl opacity-20" />
              <div className="relative rounded-2xl shadow-2xl overflow-hidden aspect-[4/5] md:aspect-square">
                <img
                  src="/esteticaSite.png"
                  alt="Estética Avançada"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#1C4468] font-semibold text-sm uppercase tracking-wide">Nossos Serviços</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mt-2 mb-4">
              Tratamentos Exclusivos
            </h2>
            <p className="text-gray-600">
              Oferecemos os mais avançados tratamentos estéticos com resultados comprovados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico, index) => (
              <div
                key={index}
                style={{ animationDelay: `${index * 75}ms` }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">{servico.nome}</h3>
                  <p className="text-gray-500 text-sm mb-4">{servico.descricao}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Duração</p>
                      <p className="text-sm font-semibold">{servico.duracao}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">A partir de</p>
                      <p className="text-xl font-bold text-[#1C4468]">{servico.preco}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
              <span className="text-[#1C4468] font-semibold text-sm uppercase tracking-wide">Por que nos escolher</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mt-2 mb-6">
                Diferenciais que fazem a diferença
              </h2>
              <div className="space-y-6">
                {diferenciais.map((dif, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-12 h-12 bg-[#0B1F3A]/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:bg-[#0B1F3A]">
                      <dif.icone className="w-6 h-6 text-[#0B1F3A] transition-colors duration-300 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{dif.titulo}</h3>
                      <p className="text-gray-500 text-sm">{dif.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="rounded-2xl overflow-hidden shadow-xl mb-6 aspect-video">
                <img
                  src="/topoSite2.png"
                  alt="Clínica Nayane Pimentel"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Agende sua avaliação</h3>
                <p className="mb-6 opacity-90">
                  Primeira consulta gratuita para avaliação e planejamento do seu tratamento personalizado.
                </p>
                <Link href="/agendamento" className="inline-flex items-center gap-2 bg-white text-[#0B1F3A] px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Agendar Agora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de encerramento */}
      <section className="relative h-48 md:h-64 overflow-hidden">
        <img
          src="/topoBarraSite.png"
          alt="Nayane Pimentel Estética Avançada"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 via-[#0B1F3A]/60 to-transparent" />
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Pronta para se cuidar?</h3>
            <p className="text-white/80 mb-4">Marque sua avaliação e conheça nossos tratamentos.</p>
            <Link href="/agendamento" className="inline-flex items-center gap-2 bg-white text-[#0B1F3A] px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Agendar Agora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-[#0B1F3A] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-xl font-bold">Nayane Pimentel</h3>
              </div>
              <p className="text-white/70">Estética Avançada</p>
              <p className="text-white/70 text-sm mt-2">Coren/PE 488.389</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <p className="text-white/70">📞 (81) 99999-9999</p>
              <p className="text-white/70">✉️ contato@nayanepimentel.com</p>
              <p className="text-white/70">📍 Recife - PE</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horário de Funcionamento</h4>
              <p className="text-white/70">Segunda a Sexta: 8h às 19h</p>
              <p className="text-white/70">Sábado: 8h às 14h</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
            © 2024 Nayane Pimentel - Estética Avançada. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}