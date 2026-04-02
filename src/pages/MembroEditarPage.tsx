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
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Editar Membro</h1>
          <p className="text-slate-500 text-sm mt-1">{membro?.nome}</p>
        </div>
        {loading
          ? <div className="flex justify-center py-16">
              <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          : membro && <FormMembro membro={membro} />
        }
      </main>
    </>
  );
}
