import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import { User, MessageCircle, Instagram, Phone, Calendar, MapPin, CheckCircle2, XCircle, ArrowLeft, UserCog } from 'lucide-react';

const SETOR_COLORS: Record<string, string> = {
  'Sede':      'bg-blue-100 text-blue-700',
  'Fortaleça': 'bg-purple-100 text-purple-700',
  'Garcia':    'bg-emerald-100 text-emerald-700',
};

export default function MembroDetalhesPage() {
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

  if (loading) return (
    <><Navbar /><div className="flex justify-center py-24"><span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div></>
  );
  if (!membro) return null;

  const infos = [
    { icon: MessageCircle, label: 'WhatsApp',              value: membro.whatsapp },
    { icon: Instagram,     label: 'Instagram',             value: membro.instagram },
    { icon: User,          label: 'Responsável',           value: membro.responsavel_nome },
    { icon: Phone,         label: 'Número do responsável', value: membro.responsavel_telefone },
    { icon: Calendar,      label: 'Nascimento',            value: membro.data_nascimento
        ? new Date(membro.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : null },
    { icon: MapPin,        label: 'Setor',                 value: membro.setor },
  ].filter(i => i.value);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Link to="/membros" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para lista
        </Link>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
            {membro.foto_url
              ? <img src={membro.foto_url} alt={membro.nome} className="w-full h-full object-cover" />
              : <User className="w-10 h-10 text-slate-300" />
            }
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{membro.nome}</h1>
            {membro.setor && (
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${SETOR_COLORS[membro.setor] ?? 'bg-slate-100 text-slate-600'}`}>
                {membro.setor}
              </span>
            )}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                membro.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {membro.status === 'ativo' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {membro.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <Link to={`/membros/${membro.id}/editar`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <UserCog className="w-4 h-4" /> Editar
          </Link>
        </div>
        {infos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Informações</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infos.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
                    <dd className="text-sm text-slate-800 mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        )}
      </main>
    </>
  );
}
