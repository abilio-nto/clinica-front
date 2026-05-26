"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Calendar, Sparkles, Star, Clock, Shield, Heart,
  ArrowRight, CheckCircle, Phone, MapPin,
  ChevronDown, Menu, X
} from "lucide-react";

const SERVICOS = [
  { nome: "Limpeza de Pele", desc: "Remoção de impurezas e renovação celular profunda com produtos premium", dur: "60 min", preco: "R$ 150", cat: "Facial", emoji: "✨" },
  { nome: "Botox", desc: "Suavização de linhas de expressão com toxina botulínica certificada", dur: "30 min", preco: "R$ 450", cat: "Injetável", emoji: "💉" },
  { nome: "Preenchimento Facial", desc: "Restauração de volume e contorno com ácido hialurônico premium", dur: "45 min", preco: "R$ 800", cat: "Injetável", emoji: "✦" },
  { nome: "Drenagem Linfática", desc: "Redução de inchaço, retenção e modelagem corporal", dur: "50 min", preco: "R$ 120", cat: "Corporal", emoji: "🌿" },
  { nome: "Harmonização Facial", desc: "Equilíbrio e proporção perfeita dos traços faciais", dur: "90 min", preco: "R$ 1.200", cat: "Facial", emoji: "💎" },
  { nome: "Peeling Químico", desc: "Renovação celular intensa e uniformização do tom da pele", dur: "40 min", preco: "R$ 250", cat: "Facial", emoji: "⚗️" },
];

const DIFERENCIAIS = [
  { icon: Star, titulo: "Produtos Premium", desc: "Apenas produtos certificados ANVISA de alta performance" },
  { icon: Shield, titulo: "Profissionais Certificados", desc: "Equipe com formação especializada e atualização contínua" },
  { icon: Heart, titulo: "Atendimento Humanizado", desc: "Cada cliente é único — atendemos com carinho e atenção" },
  { icon: Clock, titulo: "Horários Flexíveis", desc: "Agendamentos que se adaptam à sua rotina" },
];

const DEPOIMENTOS = [
  { nome: "Mariana S.", texto: "Resultados incríveis com o Botox! Me sinto mais jovem e confiante. Atendimento impecável.", nota: 5 },
  { nome: "Patricia A.", texto: "Fiz a harmonização facial e fiquei apaixonada. Equipe super profissional e acolhedora.", nota: 5 },
  { nome: "Juliana R.", texto: "A drenagem linfática mudou minha vida. Já são 8 sessões e os resultados são visíveis!", nota: 5 },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] overflow-x-hidden font-sans">

      {/* ── NAV ─────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/topoSite3.png" alt="Nayane Pimentel" className="h-10 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[["Início","home"],["Serviços","servicos"],["Por que nós","diferenciais"],["Depoimentos","depoimentos"],["Contato","contato"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#0B1F3A]" : "text-white/80 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${scrolled ? "text-[#0B1F3A] hover:bg-[#0B1F3A]/5" : "text-white/80 hover:text-white"}`}>
              Área restrita
            </Link>
            <Link href="/agendamento" className="text-sm font-semibold px-5 py-2.5 bg-[#0B1F3A] text-white rounded-full hover:bg-[#1C4468] transition-all shadow-lg shadow-[#0B1F3A]/20 hover:shadow-[#0B1F3A]/30 hover:-translate-y-0.5">
              Agendar agora
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(v => !v)}>
            {mobileMenu ? <X className={`w-5 h-5 ${scrolled ? "text-gray-800" : "text-white"}`} /> : <Menu className={`w-5 h-5 ${scrolled ? "text-gray-800" : "text-white"}`} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 shadow-xl">
            {[["Início","home"],["Serviços","servicos"],["Por que nós","diferenciais"],["Depoimentos","depoimentos"],["Contato","contato"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm font-medium text-gray-700 py-2">
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/login" className="text-center text-sm font-medium text-gray-600 py-2.5 border border-gray-200 rounded-full">Área restrita</Link>
              <Link href="/agendamento" className="text-center text-sm font-semibold text-white bg-[#0B1F3A] py-2.5 rounded-full">Agendar agora</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────── */}
      <section ref={heroRef} id="home" className="relative min-h-screen flex items-center bg-[#0B1F3A] overflow-hidden">
        {/* Fundo com pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#1C4468,transparent)]" />
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#0d2a4e]/60 to-transparent" />
          {/* Grid decorativo */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-xs font-medium tracking-wider uppercase">Clínica de Estética Avançada · Recife</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Sua melhor<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F7FAE] to-[#7fb3d3]">versão</span><br />
                começa aqui
              </h1>

              <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed">
                Tratamentos estéticos de excelência com tecnologia de ponta e profissionais especializados. Realce sua beleza com segurança e sofisticação.
              </p>

              <div className="flex flex-wrap gap-3 mt-10">
                <Link href="/agendamento" className="flex items-center gap-2 px-7 py-3.5 bg-white text-[#0B1F3A] rounded-full font-semibold text-sm hover:bg-gray-50 transition-all shadow-xl shadow-black/20 hover:-translate-y-0.5">
                  Agendar consulta <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => scrollTo("servicos")} className="flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/5 transition-all">
                  Ver tratamentos
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                {[["500+","Clientes satisfeitas"],["10+","Anos de experiência"],["98%","Satisfação"]].map(([v,l]) => (
                  <div key={l}>
                    <p className="text-2xl font-bold text-white">{v}</p>
                    <p className="text-xs text-white/50 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagem + cards flutuantes */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-[#1C4468] to-[#4F7FAE] rounded-3xl blur-3xl opacity-30" />
                <img
                  src="/esteticaSite.png"
                  alt="Nayane Pimentel Estética"
                  className="relative rounded-3xl w-full h-[520px] object-cover shadow-2xl"
                  onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=80"; }}
                />
                {/* Overlay degradê inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0B1F3A]/60 to-transparent rounded-b-3xl" />
              </div>

              {/* Card flutuante — avaliação */}
              <div className="absolute -left-10 top-1/3 bg-white rounded-2xl shadow-2xl px-5 py-4 w-48">
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs font-semibold text-gray-800">"Resultado incrível!"</p>
                <p className="text-xs text-gray-400 mt-0.5">Mariana S. — cliente fiel</p>
              </div>

              {/* Card flutuante — próxima vaga */}
              <div className="absolute -right-8 bottom-24 bg-[#0B1F3A] rounded-2xl shadow-2xl px-5 py-4 text-white w-44">
                <p className="text-xs text-white/60 mb-1">Próxima vaga</p>
                <p className="text-lg font-bold">Hoje, 15h</p>
                <Link href="/agendamento" className="mt-2 flex items-center gap-1 text-xs text-[#4F7FAE] font-medium hover:underline">
                  Reservar <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo("servicos")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* ── SERVIÇOS ─────────────────────────────────── */}
      <section id="servicos" className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            {/* Sidebar esquerda */}
            <div className="lg:sticky lg:top-28">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4F7FAE] mb-3">Tratamentos</span>
              <h2 className="text-4xl font-bold text-[#0B1F3A] leading-tight mb-4">
                O que podemos<br />fazer por você
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Protocolos personalizados com os melhores produtos e tecnologias do mercado.
              </p>
              <Link href="/agendamento" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B1F3A] text-white rounded-full text-sm font-semibold hover:bg-[#1C4468] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#0B1F3A]/20">
                Agendar agora <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid de cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {SERVICOS.map((s, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveService(i)}
                  className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-default overflow-hidden ${activeService === i ? "border-[#0B1F3A] shadow-xl shadow-[#0B1F3A]/10 -translate-y-1" : "border-transparent shadow-sm hover:-translate-y-1"}`}
                >
                  {/* Fundo decorativo */}
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-3xl transition-all duration-300 ${activeService === i ? "bg-[#0B1F3A]/5" : "bg-gray-50"}`} />

                  <div className="relative">
                    <span className="text-2xl mb-3 block">{s.emoji}</span>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-[#0B1F3A] text-base">{s.nome}</h3>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${activeService === i ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-500"}`}>{s.cat}</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">{s.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5" /> {s.dur}
                      </div>
                      <p className="text-[#0B1F3A] font-bold text-base">{s.preco}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ─────────────────────────────── */}
      <section id="diferenciais" className="py-24 bg-[#0B1F3A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"32px 32px"}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4F7FAE] mb-3">Nossos diferenciais</span>
            <h2 className="text-4xl font-bold text-white">Por que escolher a Nayane Pimentel?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#4F7FAE]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4F7FAE]/30 transition-colors">
                  <d.icon className="w-5 h-5 text-[#4F7FAE]" />
                </div>
                <h3 className="font-bold text-white mb-2">{d.titulo}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Banner CTA */}
          <div className="mt-16 bg-gradient-to-r from-[#1C4468] to-[#4F7FAE]/40 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white font-bold text-2xl">Primeira avaliação gratuita</p>
              <p className="text-white/60 mt-1 text-sm">Agende agora e descubra o tratamento ideal para você</p>
            </div>
            <Link href="/agendamento" className="shrink-0 flex items-center gap-2 px-8 py-3.5 bg-white text-[#0B1F3A] rounded-full font-semibold text-sm hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-xl">
              Garantir vaga <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ──────────────────────────────── */}
      <section id="depoimentos" className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4F7FAE] mb-3">Depoimentos</span>
            <h2 className="text-4xl font-bold text-[#0B1F3A]">O que dizem nossas clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({length: d.nota}).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{d.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {d.nome.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{d.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE + IMAGEM ───────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#0B1F3A]/10 to-[#4F7FAE]/10 rounded-3xl blur-2xl" />
              <img
                src="/logo2.png"
                alt="Nayane Pimentel"
                className="relative w-full max-w-sm mx-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4F7FAE] mb-4">Sobre a clínica</span>
              <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6 leading-tight">
                Excelência e cuidado<br />em cada detalhe
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                A clínica Nayane Pimentel nasceu da paixão pelo cuidado estético de qualidade. Com mais de 10 anos de experiência, oferecemos tratamentos personalizados que respeitam a individualidade de cada cliente.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Todos os nossos protocolos seguem os mais rígidos padrões de biossegurança, utilizando produtos certificados e tecnologia de última geração.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agendamento" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0B1F3A] text-white rounded-full text-sm font-semibold hover:bg-[#1C4468] transition-all shadow-lg shadow-[#0B1F3A]/20">
                  Agendar consulta <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="tel:+5581999999999" className="flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#0B1F3A] text-[#0B1F3A] rounded-full text-sm font-semibold hover:bg-[#0B1F3A]/5 transition-all">
                  <Phone className="w-4 h-4" /> Ligar agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer id="contato" className="bg-[#071428] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Marca */}
            <div className="lg:col-span-2">
              <img src="/topoSite3.png" alt="Nayane Pimentel" className="h-10 object-contain mb-4" />
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Estética avançada com cuidado humanizado. Realçamos sua beleza com segurança, tecnologia e muita dedicação.
              </p>
              <p className="text-white/30 text-xs mt-4">Coren/PE 488.389</p>
              <div className="flex gap-3 mt-5">
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">Contato</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> (81) 99999-9999
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> Recife — PE
                </li>
              </ul>
            </div>

            {/* Horários */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">Horário</h4>
              <ul className="space-y-2.5 text-white/50 text-sm">
                <li>Seg — Sex: <span className="text-white/70 font-medium">8h às 19h</span></li>
                <li>Sábado: <span className="text-white/70 font-medium">8h às 14h</span></li>
              </ul>
              <Link href="/agendamento" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#1C4468] text-white rounded-full text-xs font-semibold hover:bg-[#2d5a8a] transition-all">
                Agendar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-white/30 text-xs">© 2026 Nayane Pimentel Estética Avançada. Todos os direitos reservados.</p>
            <Link href="/login" className="text-white/30 text-xs hover:text-white/50 transition">Acesso interno</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
