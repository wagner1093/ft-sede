import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Sessão encerrada.');
  }

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all font-sans">
      <div className="max-w-5xl mx-auto flex items-center justify-between overflow-hidden">
        <Link to="/membros" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-black text-slate-900 tracking-tighter font-display uppercase">FT SEDE</span>
        </Link>

        <nav className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-2 pr-2 border-r border-slate-200">
            <Link to="/membros" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Users className="w-4 h-4" /> Membros
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-bold shadow-md active:scale-95 transition-all group">
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
