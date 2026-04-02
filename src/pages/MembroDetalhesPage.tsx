import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import { User, MessageCircle, Instagram, Phone, Calendar, MapPin, ArrowLeft, UserCog, Droplets, Flame, CalendarCheck, Briefcase, XCircle, Trash2 } from 'lucide-react';

const TAG_STYLE = 'bg-slate-100/50 text-slate-500 border-slate-200';
const BADGE_BASE = 'px-4 py-1.5 rounded-xl border text-[10px] font-semibold uppercase tracking-widest transition-all font-sans';

export default function MembroDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [membro, setMembro] = useState<Membro | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('membros').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) navigate('/membros');
      else setMembro(data);
      setLoading(false);
    });
  }, [id, navigate]);

  async function handleDelete() {
    if (!membro) return;
    
    // Agora a exclusão acontece sem o window.confirm aqui, 
    // pois o usuário já confirmou no modal customizado.
    const { error } = await supabase.from('membros').delete().eq('id', membro.id);
    if (error) {
      toast.error('Erro ao excluir membro.');
    } else {
      toast.success('Cadastro excluído com sucesso.');
      navigate('/membros');
    }
  }

  if (loading) return (
    <><Navbar /><div className="flex justify-center flex-col items-center min-h-[80vh]"><span className="w-8 h-8 border-4 border-slate-200/50 dark:border-zinc-800 border-t-primary-500 rounded-full animate-spin" /><p className="mt-4 text-slate-500 dark:text-zinc-500 font-medium animate-pulse">Carregando dados do membro...</p></div></>
  );
  if (!membro) return null;

  const infos = [
    { icon: MessageCircle, label: 'WhatsApp',               value: membro.whatsapp },
    { icon: Instagram,     label: 'Instagram',              value: membro.instagram },
    { icon: User,          label: 'Responsável',            value: membro.responsavel_nome },
    { icon: Phone,         label: 'Número do responsável',  value: membro.responsavel_telefone },
    { icon: Calendar,      label: 'Nascimento',             value: membro.data_nascimento
        ? new Date(membro.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : null },
    { icon: Droplets,      label: 'Batismo em Águas',       value: membro.batismo_aguas ? 'Sim' : 'Não', iconClass: 'animate-float-slow text-blue-500 group-hover:text-blue-600' },
    { icon: CalendarCheck, label: 'Data do Batismo',        value: membro.batismo_aguas_data
        ? new Date(membro.batismo_aguas_data + 'T00:00:00').toLocaleDateString('pt-BR') : null },
    { icon: Flame,         label: 'Batismo no Espír. Santo', value: membro.batismo_espirito_santo ? 'Sim' : 'Não', iconClass: 'animate-flicker-slow text-orange-500 group-hover:text-orange-600' },
    { icon: Briefcase,     label: 'Departamento',           value: membro.serve_departamento && membro.departamento ? `${membro.departamento} ${membro.departamento_lider ? '(Líder)' : ''}` : 'Não atua em departamentos' },
    { icon: MapPin,        label: 'Setor',                  value: membro.setor },
  ].filter(i => i.value);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6 relative z-10 animate-fade-in">
        <Link to="/membros" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
          <ArrowLeft className="w-4.5 h-4.5 transform group-hover:-translate-x-1 transition-transform" /> Voltar para Membros
        </Link>
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden">
          
          {/* Subtle accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-50" />

          <div className="relative">
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center ring-4 ring-white shadow-xl z-10 relative cursor-pointer group"
              onClick={() => membro.foto_url && setShowModal(true)}>
              {membro.foto_url
                ? <img src={membro.foto_url} alt={membro.nome} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                : <User className="w-12 h-12 text-slate-400" />
              }
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 pt-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">{membro.nome}</h1>
            <p className="text-slate-500 font-medium font-sans">Membro desde {new Date(membro.created_at).toLocaleDateString('pt-BR')}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              {membro.setor && (
                <span className={`${BADGE_BASE} ${TAG_STYLE}`}>
                  {membro.setor}
                </span>
              )}
              {membro.serve_departamento && membro.departamento && (
                <span className={`${BADGE_BASE} ${TAG_STYLE}`}>
                   {membro.departamento}
                </span>
              )}
              {membro.departamento_lider && (
                <span className={`${BADGE_BASE} border-emerald-200 bg-emerald-50 text-emerald-600`}>
                  LÍDER
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 sm:mt-0 sm:self-center">
            <Link to={`/membros/${membro.id}/editar`}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#b3f516] hover:bg-[#a3e114] text-black rounded-2xl text-sm font-bold shadow-md shadow-[#b3f516]/5 transition-all hover:scale-[1.03] active:scale-95 group">
              <UserCog className="w-5 h-5 transition-transform group-hover:rotate-12" /> Editar Perfil
            </Link>

            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 group shadow-sm">
              <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" /> Excluir Cadastro
            </button>
          </div>
        </div>

        {infos.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4 font-display">Detalhes Cadastrais</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
              {infos.map(({ icon: Icon, label, value, iconClass }) => (
                <div key={label} className="flex items-start gap-4 p-4 rounded-full hover:bg-slate-50 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
                    <Icon className={`w-5 h-5 transition-colors ${iconClass || 'text-slate-500 group-hover:text-primary-600'}`} />
                  </div>
                  <div className="pt-1 select-text">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</dt>
                    <dd className="text-base font-medium text-slate-900 mt-1">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        )}
      </main>

      {/* Modal de Visualização da Foto */}
      {showModal && membro.foto_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-lg">
            <XCircle className="w-6 h-6" />
          </button>
          <img 
            src={membro.foto_url} 
            alt="Visualização" 
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Uiverse.io design) */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <button className="exit-button" onClick={() => setShowDeleteConfirm(false)}>
              <svg height="20" width="20" viewBox="0 0 20 20">
                <path d="M15.8333 5.34167L14.6583 4.16667L10 8.825L5.34167 4.16667L4.16667 5.34167L8.825 10L4.16667 14.6583L5.34167 15.8333L10 11.175L14.6583 15.8333L15.8333 14.6583L11.175 10L15.8333 5.34167Z" />
              </svg>
            </button>
            <div className="card-content">
              <p className="card-heading">Excluir Cadastro?</p>
              <p className="card-description">
                Tem certeza que deseja excluir o cadastro de <strong>{membro.nome}</strong>? Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="card-button-wrapper">
              <button className="card-button secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button className="card-button primary" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
