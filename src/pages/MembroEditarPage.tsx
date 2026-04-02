import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormMembro from '../components/FormMembro';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';

export default function MembroEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [membro, setMembro] = useState<Membro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('membros').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) navigate('/membros');
      else setMembro(data);
      setLoading(false);
    });
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-8 relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">Editar Membro</h1>
          <p className="text-slate-500 font-medium mt-2 font-sans">{membro?.nome}</p>
        </div>
        {loading
          ? <div className="flex justify-center flex-col items-center py-24"><span className="w-8 h-8 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin" /><p className="mt-4 text-slate-400 font-medium animate-pulse font-sans">Carregando dados...</p></div>
          : membro && <FormMembro membro={membro} />
        }
      </main>
    </div>
  );
}
