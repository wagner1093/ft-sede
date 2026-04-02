'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import toast from 'react-hot-toast';
import { Search, Plus, MessageCircle, Users, UserCheck, UserX, ChevronRight, Trash2, Filter, XCircle } from 'lucide-react';

const SETOR_COLORS: Record<string, string> = {
  'Sede':      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Fortaleza': 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  'Garcia':    'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function TabelaMembros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const fetchMembros = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('membros').select('*').order('nome');
    if (statusFilter !== 'todos') query = query.eq('status', statusFilter);
    if (search.trim()) query = query.ilike('nome', `%${search.trim()}%`);
    const { data, error } = await query;
    if (error) toast.error('Erro ao carregar membros.');
    else setMembros(data ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchMembros(); }, [fetchMembros]);

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(id);
    const { error } = await supabase.from('membros').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir.');
    else { toast.success('Membro excluído.'); fetchMembros(); }
    setDeleting(null);
  }

  const total = membros.length;
  const ativos = membros.filter(m => m.status === 'ativo').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: total,         icon: Users,     color: 'text-primary-600 bg-primary-500/10' },
          { label: 'Ativos',   value: ativos,        icon: UserCheck, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Inativos', value: total - ativos, icon: UserX,     color: 'text-slate-500 bg-slate-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight font-display">{value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px] font-sans">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome..."
            className="w-full h-11 pl-12 pr-6 rounded-full bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all shadow-sm font-sans" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 h-11 bg-white border border-slate-200 rounded-full px-4 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400 ml-1" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-transparent h-full pr-8 pl-1 text-sm text-slate-900 focus:outline-none transition-all cursor-pointer font-bold font-sans appearance-none">
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <Link to="/membros/novo"
            className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-[#b3f516] hover:bg-[#a3e114] text-black px-6 rounded-full text-sm font-bold shadow-md shadow-[#b3f516]/5 hover:scale-[1.03] active:scale-95 transition-all font-sans whitespace-nowrap">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Membro</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse font-sans">Buscando membros...</p>
          </div>
        ) : membros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Nenhum membro encontrado</h3>
            <p className="text-slate-500 max-w-xs font-sans">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {membros.map((m) => (
              <li key={m.id} className="group relative">
                <Link to={`/membros/${m.id}`} className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-all">
                  <div className="relative group cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); m.foto_url && setModalImg(m.foto_url); }}>
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all shadow-sm">
                      {m.foto_url
                        ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        : <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-600 font-bold text-lg">
                            {m.nome.charAt(0).toUpperCase()}
                          </div>
                      }
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-3 border-white shadow-sm ${
                      m.status === 'ativo' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0 font-sans">
                    <p className="text-base font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                      {m.nome}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {m.whatsapp && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MessageCircle className="w-3.5 h-3.5 text-primary-500" /> {m.whatsapp}
                        </span>
                      )}
                      {m.setor && (
                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-lg border font-black ${SETOR_COLORS[m.setor] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {m.setor}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 relative z-10">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(m.id, m.nome); }} disabled={deleting === m.id}
                        className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Excluir">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                    </div>
                    
                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-500/10 transition-all shadow-sm group-hover:scale-110 active:scale-95">
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de Visualização */}
      {modalImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setModalImg(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-lg">
            <XCircle className="w-6 h-6" />
          </button>
          <img 
            src={modalImg} 
            alt="Visualização" 
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
