import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import TabelaMembros from '../components/TabelaMembros';
import { MessageCircleQuestion, ChevronRight } from 'lucide-react';

export default function MembrosPage() {
  const [pendentes, setPendentes] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('appft_perguntas')
      .select('id', { count: 'exact', head: true })
      .eq('respondido', false)
      .then(({ count }) => setPendentes(count ?? 0));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        <div className="mb-6 pl-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">Painel de Membros</h1>
          <p className="text-slate-600 font-medium mt-2 font-sans">Visão geral do gerenciamento da Força Teen Sede</p>
        </div>

        {/* Acesso rápido: Perguntas enviadas */}
        <Link
          to="/perguntas"
          className="group flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] p-4 sm:p-5 mb-6 shadow-md transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#b3f516] flex items-center justify-center flex-shrink-0">
            <MessageCircleQuestion className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold font-display leading-tight">Perguntas enviadas</p>
            <p className="text-white/50 text-xs sm:text-sm font-sans mt-0.5">Ver e responder as perguntas recebidas</p>
          </div>
          {pendentes !== null && pendentes > 0 && (
            <span className="bg-[#b3f516] text-black text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
              {pendentes} nova{pendentes > 1 ? 's' : ''}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </Link>

        <TabelaMembros />
      </main>
    </div>
  );
}
