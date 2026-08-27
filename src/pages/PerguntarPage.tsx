import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import logo from '../assets/logo-ftsede.png';

const MAX_LEN = 2000;

export default function PerguntarPage() {
  const [pergunta, setPergunta] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const texto = pergunta.trim();
    if (!texto) {
      setError('Escreva sua pergunta antes de enviar.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('appft_perguntas')
        .insert({ pergunta: texto });
      if (error) throw error;
      setSent(true);
      setPergunta('');
    } catch (err: any) {
      setError('Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  function enviarOutra() {
    setSent(false);
    setError(null);
    setPergunta('');
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#050505] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-64 bg-[#b3f516]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Logo FT SEDE" className="w-20 h-20 object-contain mb-4" />
          <h1 className="text-2xl font-black text-white tracking-tighter italic font-display">FT SEDE</h1>
        </div>

        {sent ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-[2rem] p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#b3f516]/10 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#b3f516]" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight font-display mb-2">
              Pergunta enviada!
            </h2>
            <p className="text-zinc-400 text-sm font-sans mb-6">
              Obrigado pela sua participação. Sua pergunta foi recebida.
            </p>
            <button
              onClick={enviarOutra}
              className="w-full bg-[#b3f516] hover:bg-[#a3e114] text-black font-bold py-3.5 rounded-full transition-all active:scale-[0.98]"
            >
              Enviar outra pergunta
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-[2rem] p-7 sm:p-8">
            <div className="flex items-center gap-2 mb-2 text-[#b3f516]">
              <MessageCircleQuestion className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] font-sans">Faça sua pergunta</span>
            </div>
            <p className="text-zinc-400 text-sm font-sans mb-6">
              Escreva sua pergunta abaixo. O envio é anônimo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={pergunta}
                  onChange={e => { setPergunta(e.target.value.slice(0, MAX_LEN)); setError(null); }}
                  placeholder="Digite sua pergunta aqui..."
                  rows={6}
                  autoFocus
                  className="w-full px-5 py-4 rounded-3xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#b3f516]/40 focus:border-[#b3f516]/40 transition-all resize-none font-sans text-[15px] leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 px-2">
                  {error
                    ? <span className="text-[11px] font-bold text-red-400">{error}</span>
                    : <span className="text-[11px] text-zinc-600">Seja claro e objetivo.</span>}
                  <span className="text-[11px] text-zinc-600 tabular-nums">{pergunta.length}/{MAX_LEN}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-[#b3f516] hover:bg-[#a3e114] text-black font-bold py-3.5 rounded-full transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#b3f516]/5"
              >
                {sending
                  ? <><span className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" /> Enviando...</>
                  : <><Send className="w-4.5 h-4.5" /> Enviar pergunta</>}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-zinc-700 text-[10px] mt-10 font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} FT SEDE • Sede Digital
        </p>
      </div>
    </div>
  );
}
