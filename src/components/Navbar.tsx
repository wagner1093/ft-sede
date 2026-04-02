import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Plus, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Sessão encerrada.');
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/membros" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          FT-SEDE
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/membros" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            <Users className="w-4 h-4" /> Membros
          </Link>
          <Link to="/membros/novo" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            <Plus className="w-4 h-4" /> Novo Membro
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors ml-1">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
