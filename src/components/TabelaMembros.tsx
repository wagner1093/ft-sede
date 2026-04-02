'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import toast from 'react-hot-toast';
import { Search, Plus, MessageCircle, Users, UserCheck, UserX, ChevronRight, Trash2, Filter } from 'lucide-react';

const SETOR_COLORS: Record<string, string> = {
  'Sede':      'bg-blue-100 text-blue-700',
  'Fortaleça': 'bg-purple-100 text-purple-700',
  'Garcia':    'bg-emerald-100 text-emerald-700',
};

export default function TabelaMembros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [deleting, setDeleting] = useState<string | null>(null);

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
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: total,         icon: Users,     color: 'text-blue-600 bg-blue-50'  },
          { label: 'Ativos',   value: ativos,        icon: UserCheck, color: 'text-green-600 bg-green-50'},
          { label: 'Inativos', value: total - ativos, icon: UserX,    color: 'text-slate-500 bg-slate-100'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <Link to="/membros/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Novo
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : membros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum membro encontrado</p>
            <Link to="/membros/novo" className="mt-4 text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Cadastrar primeiro membro
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {membros.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {m.foto_url
                    ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-sm">
                        {m.nome.charAt(0).toUpperCase()}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {m.whatsapp && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MessageCircle className="w-3 h-3" /> {m.whatsapp}
                      </span>
                    )}
                    {m.setor && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SETOR_COLORS[m.setor] ?? 'bg-slate-100 text-slate-500'}`}>
                        {m.setor}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  m.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {m.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(m.id, m.nome)} disabled={deleting === m.id}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Link to={`/membros/${m.id}/editar`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
