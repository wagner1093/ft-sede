import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Users, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo-ftsede.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      setShowSuccessLoader(true);
      setTimeout(() => {
        navigate('/membros');
      }, 4000);
    } catch (error: any) {
      toast.error('Email ou senha incorretos.');
      setLoading(false);
    }
  }

  if (showSuccessLoader) {
    return (
      <div className="logo-loader-overlay">
        <div className="relative">
          <img 
            src={logo} 
            alt="Logo FT SEDE" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain animate-spin-slow"
          />
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
              Carregando Ecossistema
            </p>
            <div className="h-0.5 w-24 bg-white/5 overflow-hidden rounded-full relative">
              <div className="absolute inset-0 bg-[#b3f516] animate-progress-fast" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#050505] transition-all overflow-hidden">
      <div className="w-full max-w-[400px] relative">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="Logo" className="w-28 h-28 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic font-display">FT SEDE</h1>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="E-mail ou usuário"
                required
                className="w-full px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
              />
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full px-6 py-3 pr-14 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <button type="submit" id="btn-entrar" disabled={loading}
              className="w-full bg-[#b3f516] hover:bg-[#a3e114] text-black font-bold py-3.5 rounded-full transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-md shadow-[#b3f516]/5">
              {loading
                ? <><span className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin inline-block mr-2 align-middle" /> Entrando...</>
                : 'FAZER LOGIN'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-700 text-[10px] mt-20 font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} FT SEDE • Sede Digital
        </p>
      </div>
    </div>
  );
}
