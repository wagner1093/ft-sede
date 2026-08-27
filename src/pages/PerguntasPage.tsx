import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Pergunta } from '../lib/types';
import toast from 'react-hot-toast';
import {
  MessageCircleQuestion, CheckCircle2, Circle, Trash2, RotateCcw,
  Inbox, Clock, ListChecks,
} from 'lucide-react';

type Filtro = 'todas' | 'pendentes' | 'respondidas';

function formatData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PerguntasPage() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPerguntas = useCallback(async () => {
    const { data, error } = await supabase
      .from('appft_perguntas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Erro ao carregar perguntas.');
    else setPerguntas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPerguntas(); }, [fetchPerguntas]);

  // Atualização em tempo real (nova pergunta chega sozinha na tela)
  useEffect(() => {
    const canal = supabase
      .channel('perguntas-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appft_perguntas' },
        () => fetchPerguntas())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [fetchPerguntas]);

  async function toggleRespondido(p: Pergunta) {
    setUpdating(p.id);
    const novoValor = !p.respondido;
    const { error } = await supabase
      .from('appft_perguntas')
      .update({
        respondido: novoValor,
        respondido_at: novoValor ? new Date().toISOString() : null,
      })
      .eq('id', p.id);
    if (error) toast.error('Erro ao atualizar.');
    else {
      setPerguntas(prev => prev.map(x =>
        x.id === p.id ? { ...x, respondido: novoValor, respondido_at: novoValor ? new Date().toISOString() : null } : x
      ));
      toast.success(novoValor ? 'Marcada como respondida.' : 'Reaberta.');
    }
    setUpdating(null);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta pergunta? Esta ação não pode ser desfeita.')) return;
    setUpdating(id);
    const { error } = await supabase.from('appft_perguntas').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir.');
    else {
      setPerguntas(prev => prev.filter(x => x.id !== id));
      toast.success('Pergunta excluída.');
    }
    setUpdating(null);
  }

  const total = perguntas.length;
  const pendentes = perguntas.filter(p => !p.respondido).length;
  const respondidas = total - pendentes;

  const lista = perguntas.filter(p =>
    filtro === 'todas' ? true : filtro === 'pendentes' ? !p.respondido : p.respondido
  );

  const TABS: { key: Filtro; label: string; count: number }[] = [
    { key: 'todas', label: 'Todas', count: total },
    { key: 'pendentes', label: 'Pendentes', count: pendentes },
    { key: 'respondidas', label: 'Respondidas', count: respondidas },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">Caixa de Perguntas</h1>
          <p className="text-slate-600 font-medium mt-2 font-sans">Perguntas recebidas pelo formulário público</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', value: total, icon: Inbox, color: 'text-primary-600 bg-primary-500/10' },
            { label: 'Pendentes', value: pendentes, icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
            { label: 'Respondidas', value: respondidas, icon: ListChecks, color: 'text-emerald-600 bg-emerald-500/10' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight font-display">{value}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setFiltro(t.key)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                filtro === t.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filtro === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse font-sans">Carregando perguntas...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <MessageCircleQuestion className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Nenhuma pergunta aqui</h3>
            <p className="text-slate-500 max-w-xs font-sans">
              {filtro === 'todas'
                ? 'Assim que alguém enviar uma pergunta pelo formulário, ela aparece aqui.'
                : 'Nenhuma pergunta neste filtro no momento.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lista.map(p => (
              <div key={p.id}
                className={`bg-white rounded-[2rem] border p-6 shadow-sm transition-all animate-fade-in ${
                  p.respondido ? 'border-emerald-100' : 'border-slate-200'
                }`}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleRespondido(p)}
                    disabled={updating === p.id}
                    title={p.respondido ? 'Marcar como pendente' : 'Marcar como respondida'}
                    className="mt-0.5 flex-shrink-0 transition-transform active:scale-90 disabled:opacity-50"
                  >
                    {p.respondido
                      ? <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      : <Circle className="w-7 h-7 text-slate-300 hover:text-slate-400" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] leading-relaxed font-sans whitespace-pre-wrap break-words ${
                      p.respondido ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
                    }`}>
                      {p.pergunta}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-[11px] text-slate-400 font-medium font-sans">
                        {formatData(p.created_at)}
                      </span>
                      {p.respondido && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
                          Respondida
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.respondido && (
                      <button onClick={() => toggleRespondido(p)} disabled={updating === p.id}
                        className="p-2.5 rounded-xl text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-all"
                        title="Reabrir">
                        <RotateCcw className="w-4.5 h-4.5" />
                      </button>
                    )}
                    <button onClick={() => excluir(p.id)} disabled={updating === p.id}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Excluir">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
