'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import toast from 'react-hot-toast';
import { Search, Plus, MessageCircle, Users, ChevronRight, Trash2, Filter, XCircle, Droplets, Flame, HandHelping, Camera, Heart, Music, Zap, Star, MapPin, Smile, Calendar, SlidersHorizontal } from 'lucide-react';

const TAG_STYLE = 'bg-slate-100 text-slate-500 border-slate-200';
const BADGE_BASE = 'text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all font-sans';

const DEPT_INFO: Record<string, { icon: any, color: string }> = {
  'Intercessão': { icon: HandHelping, color: 'text-emerald-500' },
  'Mídia':       { icon: Camera,      color: 'text-indigo-500' },
  'Acolhimento': { icon: Heart,       color: 'text-rose-500' },
  'Banda':       { icon: Music,       color: 'text-purple-500' },
  'Líder ft Sede': { icon: Zap,         color: 'text-amber-500' },
  'PGs':         { icon: Users,       color: 'text-blue-500' },
};

export default function TabelaMembros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [setorFilter, setSetorFilter] = useState('todos');
  const [departamentoFilter, setDepartamentoFilter] = useState('todos');
  const [liderFilter, setLiderFilter] = useState('todos'); // 'todos', 'lider', 'membro'
  const [faixaEtariaFilter, setFaixaEtariaFilter] = useState('todos'); // 'todos', 'adulto', 'adolescente'
  
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Dynamic filter options
  const [availableSetores, setAvailableSetores] = useState<string[]>([]);
  const [availableDeptos, setAvailableDeptos] = useState<string[]>([]);

  const fetchMembros = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('membros').select('*').order('nome');
    
    if (setorFilter !== 'todos') query = query.eq('setor', setorFilter);
    if (departamentoFilter !== 'todos') query = query.eq('departamento', departamentoFilter);
    
    if (liderFilter === 'lider') query = query.eq('departamento_lider', true);
    if (liderFilter === 'membro') query = query.eq('departamento_lider', false);

    if (faixaEtariaFilter !== 'todos') {
      const today = new Date();
      const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const cutoffStr = cutoff.toISOString().split('T')[0];
      
      if (faixaEtariaFilter === 'adulto') {
        query = query.lte('data_nascimento', cutoffStr);
      } else {
        query = query.gt('data_nascimento', cutoffStr);
      }
    }
    
    if (search.trim()) query = query.ilike('nome', `%${search.trim()}%`);
    
    const { data, error } = await query;
    if (error) toast.error('Erro ao carregar membros.');
    else {
      setMembros(data ?? []);
    }
    setLoading(false);
  }, [search, setorFilter, departamentoFilter, liderFilter, faixaEtariaFilter]);

  useEffect(() => { fetchMembros(); }, [fetchMembros]);

  useEffect(() => {
    async function loadFilterOptions() {
      const { data } = await supabase.from('membros').select('setor, departamento');
      if (data) {
        const toTitleCase = (str: string) => str.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        const setores = data.map(m => m.setor ? toTitleCase(m.setor) : null).filter(Boolean);
        const deptos = data.map(m => m.departamento ? toTitleCase(m.departamento) : null).filter(Boolean);
        
        setAvailableSetores(Array.from(new Set(setores)) as string[]);
        setAvailableDeptos(Array.from(new Set(deptos)) as string[]);
      }
    }
    loadFilterOptions();
  }, []);

  const clearFilters = () => {
    setSearch('');
    setSetorFilter('todos');
    setDepartamentoFilter('todos');
    setLiderFilter('todos');
    setFaixaEtariaFilter('todos');
  };

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(id);
    const { error } = await supabase.from('membros').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir.');
    else { toast.success('Membro excluído.'); fetchMembros(); }
    setDeleting(null);
  }

  const calculateAge = (birthday: string) => {
    if (!birthday) return 0;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const total = membros.length;
  const outrasIgrejas = membros.filter(m => m.setor && m.setor.trim().toLowerCase() !== 'sede').length;
  const adolescentesSede = membros.filter(m => 
    m.setor?.trim().toLowerCase() === 'sede' && 
    m.data_nascimento && 
    calculateAge(m.data_nascimento) >= 12 && 
    calculateAge(m.data_nascimento) <= 18
  ).length;
  const batizadosAguas = membros.filter(m => m.batismo_aguas).length;
  const batizadosEspirito = membros.filter(m => m.batismo_espirito_santo).length;

  return (
    <div className="space-y-6 pb-8 touch-pan-y">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total de Membros', value: total,             icon: Users,     color: 'text-primary-600 bg-primary-500/10' },
          { label: 'Adolescentes Sede', value: adolescentesSede, icon: Smile,     color: 'text-purple-600 bg-purple-500/10' },
          { label: 'Outras Igrejas',   value: outrasIgrejas,     icon: MapPin,    color: 'text-blue-600 bg-blue-500/10' },
          { label: 'Batizados Águas',  value: batizadosAguas,    icon: Droplets,  color: 'text-sky-600 bg-sky-500/10' },
          { label: 'Batizados E. Santo', value: batizadosEspirito, icon: Flame,    color: 'text-orange-600 bg-orange-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm transition-all hover:scale-[1.02]">
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

      {/* Controls Bar */}
      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 transition-all">
        <div className="flex flex-col md:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por nome..."
              className="w-full h-11 pl-12 pr-6 rounded-full bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-sans" />
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-6 rounded-full text-sm font-bold flex items-center gap-2 transition-all border ${
                showFilters 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}>
              <SlidersHorizontal className="w-4.5 h-4.5" />
              <span>{showFilters ? 'Fechar Filtros' : 'Filtrar'}</span>
            </button>

            <Link to="/membros/novo"
              className="flex h-11 items-center justify-center gap-2 bg-[#b3f516] hover:bg-[#a3e114] text-black px-6 rounded-full text-sm font-bold shadow-md shadow-[#b3f516]/10 hover:scale-[1.03] active:scale-95 transition-all font-sans">
              <Plus className="w-5 h-5" />
              <span>Novo Cadastro</span>
            </Link>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            {/* Setor Filter */}
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select value={setorFilter} onChange={e => setSetorFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer uppercase tracking-wider">
                <option value="todos">Setor: Todos</option>
                {availableSetores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Departamento Filter */}
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={departamentoFilter} onChange={e => setDepartamentoFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer uppercase tracking-wider">
                <option value="todos">Depto: Todos</option>
                {availableDeptos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Faixa Etária Filter */}
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select value={faixaEtariaFilter} onChange={e => setFaixaEtariaFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer uppercase tracking-wider">
                <option value="todos">Idade: Todos</option>
                <option value="adulto">Adultos (18+)</option>
                <option value="adolescente">Adolescentes</option>
              </select>
            </div>

            {/* Liderança Filter */}
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full">
              <Star className="w-4 h-4 text-slate-400" />
              <select value={liderFilter} onChange={e => setLiderFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer uppercase tracking-wider">
                <option value="todos">Cargo: Todos</option>
                <option value="lider">Apenas Líderes</option>
                <option value="membro">Apenas Membros</option>
              </select>
            </div>

            <button onClick={clearFilters}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"
              title="Limpar Filtros">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Highlights Section: Adolescentes Sede */}
      {adolescentesSede > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Smile className="w-4 h-4 text-purple-500" />
              Destaques: Adolescentes Sede
              <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full">{adolescentesSede}</span>
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide no-scrollbar -mx-2 sm:mx-0">
            {membros
              .filter(m => m.setor?.trim().toLowerCase() === 'sede' && m.data_nascimento && calculateAge(m.data_nascimento) >= 12 && calculateAge(m.data_nascimento) <= 18)
              .map(m => (
                <Link key={m.id} to={`/membros/${m.id}`} 
                  className="flex-none w-40 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-purple-50 ring-2 ring-transparent group-hover:ring-purple-200 transition-all shadow-inner">
                      {m.foto_url 
                        ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xl">{m.nome.charAt(0)}</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate w-full">{m.nome.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{calculateAge(m.data_nascimento ?? '')} anos</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all min-h-[400px]">
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
                  </div>

                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                        {m.nome}
                      </p>
                      
                      {/* Status Badges Row */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {m.batismo_aguas && (
                          <Droplets className="w-3.5 h-3.5 text-blue-500 animate-float-slow" />
                        )}
                        {m.batismo_espirito_santo && (
                          <Flame className="w-3.5 h-3.5 text-orange-500 animate-flicker-slow" />
                        )}
                        {m.serve_departamento && m.departamento && DEPT_INFO[m.departamento] && (
                          <div className={DEPT_INFO[m.departamento].color}>
                            {(() => {
                              const DeptIcon = DEPT_INFO[m.departamento].icon;
                              return <DeptIcon className="w-3.5 h-3.5" />;
                            })()}
                          </div>
                        )}
                        {m.departamento_lider && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {m.setor && (
                          <span className={`${BADGE_BASE} ${TAG_STYLE}`}>
                            {m.setor}
                          </span>
                        )}
                        {m.serve_departamento && m.departamento && (
                          <span className={`${BADGE_BASE} ${TAG_STYLE}`}>
                            {m.departamento}
                          </span>
                        )}
                        {m.departamento_lider && (
                          <span className={`${BADGE_BASE} border-emerald-200 bg-emerald-50 text-emerald-600`}>
                            Líder
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
