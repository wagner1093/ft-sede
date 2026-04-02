import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import toast from 'react-hot-toast';
import { ImagePlus, Save, ArrowLeft, User, X, Droplets, Flame } from 'lucide-react';

const SETORES = ['Sede', 'Fortaleça', 'Garcia'];

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  responsavel_nome: z.string().optional(),
  responsavel_telefone: z.string().optional(),
  setor: z.string().optional(),
  data_nascimento: z.string().optional(),
  batismo_aguas: z.boolean().default(false),
  batismo_aguas_data: z.string().optional(),
  batismo_espirito_santo: z.boolean().default(false),
  serve_departamento: z.boolean().default(false),
  departamento: z.string().optional(),
  departamento_lider: z.boolean().default(false),
  status: z.enum(['ativo', 'inativo']),
});

type FormData = z.infer<typeof schema>;

interface Props { membro?: Membro }

export default function FormMembro({ membro }: Props) {
  const navigate = useNavigate();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(membro?.foto_url ?? null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const maskDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d+?)$/, '$1');
  };

  const formatDateToBR = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateToISO = (date: string) => {
    if (!date) return null;
    const [day, month, year] = date.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: membro?.nome ?? '',
      whatsapp: membro?.whatsapp ?? '',
      instagram: membro?.instagram ?? '',
      responsavel_nome: membro?.responsavel_nome ?? '',
      responsavel_telefone: membro?.responsavel_telefone ?? '',
      setor: membro?.setor ?? '',
      data_nascimento: membro?.data_nascimento ? formatDateToBR(membro.data_nascimento) : '',
      batismo_aguas: membro?.batismo_aguas ?? false,
      batismo_aguas_data: membro?.batismo_aguas_data ? formatDateToBR(membro.batismo_aguas_data) : '',
      batismo_espirito_santo: membro?.batismo_espirito_santo ?? false,
      serve_departamento: membro?.serve_departamento ?? false,
      departamento: membro?.departamento ?? '',
      departamento_lider: membro?.departamento_lider ?? false,
      status: membro?.status ?? 'ativo',
    },
  });

  const isBatizadoAguas = watch('batismo_aguas');
  const isServing = watch('serve_departamento');

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      let foto_url = membro?.foto_url ?? null;
      if (fotoFile) {
        const ext = fotoFile.name.split('.').pop();
        const path = `membros/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('fotos-membros').upload(path, fotoFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('fotos-membros').getPublicUrl(path);
        foto_url = urlData.publicUrl;
      }
      
      const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };

      const payload = { 
        ...data, 
        nome: toTitleCase(data.nome?.trim() || ''),
        setor: toTitleCase(data.setor?.trim() || ''),
        foto_url, 
        data_nascimento: formatDateToISO(data.data_nascimento || ''),
        batismo_aguas_data: data.batismo_aguas ? formatDateToISO(data.batismo_aguas_data || '') : null,
        departamento: data.serve_departamento ? data.departamento : null,
        departamento_lider: data.serve_departamento ? data.departamento_lider : false,
      };

      if (membro) {
        const { error } = await supabase.from('membros').update(payload).eq('id', membro.id);
        if (error) throw error;
        toast.success('Membro atualizado!');
      } else {
        const { error } = await supabase.from('membros').insert(payload);
        if (error) throw error;
        toast.success('Membro cadastrado!');
      }
      navigate('/membros');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in pb-10">
      {/* Foto */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight font-display">Foto do Membro</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 flex-shrink-0 relative group cursor-pointer"
            onClick={() => fotoPreview && setShowModal(true)}>
            {fotoPreview
              ? <><img src={fotoPreview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFotoFile(null); setFotoPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors z-10">
                    <X className="w-4 h-4 text-white" />
                  </button></>
              : <User className="w-12 h-12 text-slate-300" />
            }
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <label className="flex items-center gap-2.5 px-6 py-2 bg-[#b3f516] hover:bg-[#a3e114] text-black rounded-full text-sm font-bold shadow-md shadow-[#b3f516]/5 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 group font-sans">
              <ImagePlus className="w-4 h-4 transition-transform group-hover:rotate-12" />
              {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
            </label>
            <p className="text-xs text-slate-400 font-sans">Formatos aceitos: JPG, PNG. Máx 5MB.</p>
          </div>
        </div>
      </div>

      {/* Dados Principais */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
          
          {/* 1. Nome completo */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Nome completo *</label>
            <input {...register('nome')} type="text" placeholder="João da Silva"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
            {errors.nome && <p className="text-[10px] font-bold text-red-500 mt-1 ml-4">{errors.nome.message}</p>}
          </div>

          {/* 2. Data de nascimento */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Data de Nascimento</label>
            <input 
              type="text" 
              {...register('data_nascimento')}
              onChange={(e) => setValue('data_nascimento', maskDate(e.target.value))}
              placeholder="Ex: 14/08/1998"
              maxLength={10}
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" 
            />
          </div>

          {/* 3. Batismo em águas */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">
              <Droplets className="w-3.5 h-3.5 text-blue-500/70 animate-float-slow" />
              Batismo em Águas
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-full w-fit">
              <button type="button" onClick={() => setValue('batismo_aguas', true)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${isBatizadoAguas ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Sim
              </button>
              <button type="button" onClick={() => setValue('batismo_aguas', false)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${!isBatizadoAguas ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Não
              </button>
            </div>
          </div>

          {/* 4. Data do Batismo (Condicional) */}
          {isBatizadoAguas && (
            <div className="space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Data do Batismo em Águas</label>
              <input 
                type="text" 
                {...register('batismo_aguas_data')}
                onChange={(e) => setValue('batismo_aguas_data', maskDate(e.target.value))}
                placeholder="Ex: 20/05/2023"
                maxLength={10}
                className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" 
              />
            </div>
          )}

          {/* 5. Batismo no espirito Santo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">
              <Flame className="w-3.5 h-3.5 text-orange-500/70 animate-flicker-slow" />
              Batismo no Espírito Santo
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-full w-fit">
              <button type="button" onClick={() => setValue('batismo_espirito_santo', true)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${watch('batismo_espirito_santo') ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Sim
              </button>
              <button type="button" onClick={() => setValue('batismo_espirito_santo', false)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${!watch('batismo_espirito_santo') ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Não
              </button>
            </div>
          </div>

          {/* 6. WhatsApp */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">WhatsApp</label>
            <input type="text" {...register('whatsapp')} placeholder="(00) 00000-0000"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
          </div>

          {/* 7. Instagram */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Instagram</label>
            <input type="text" {...register('instagram')} placeholder="@usuario"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
          </div>

          {/* 8. Responsável (nome) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Responsável (nome)</label>
            <input type="text" {...register('responsavel_nome')} placeholder="Nome do pai/mãe/responsável"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
          </div>

          {/* 9. Número do responsável */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Número do responsável</label>
            <input type="text" {...register('responsavel_telefone')} placeholder="(00) 00000-0000"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
          </div>

          {/* 10. Setor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Setor</label>
            <input type="text" {...register('setor')} placeholder="Ex: Sede, Fortaleza, Garcia"
              className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm font-sans" />
          </div>

          {/* 11. Serve em um Departamento */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Serve em um Departamento?</label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-full w-fit">
              <button type="button" onClick={() => setValue('serve_departamento', true)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${isServing ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Sim
              </button>
              <button type="button" onClick={() => setValue('serve_departamento', false)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${!isServing ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                Não
              </button>
            </div>
          </div>

          {/* 12. Qual Departamento (Condicional) */}
          {isServing && (
            <>
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans">Selecione o Departamento</label>
                <div className="relative">
                  <select {...register('departamento')}
                    className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm appearance-none cursor-pointer font-sans">
                    <option value="" disabled className="bg-white font-sans text-slate-400">Selecione...</option>
                    <option value="Intercessão" className="bg-white font-sans">Intercessão</option>
                    <option value="Mídia" className="bg-white font-sans">Mídia</option>
                    <option value="Acolhimento" className="bg-white font-sans">Acolhimento</option>
                    <option value="Banda" className="bg-white font-sans">Banda</option>
                    <option value="Líder ft Sede" className="bg-white font-sans">Líder ft Sede</option>
                    <option value="PGs" className="bg-white font-sans">PGs</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              {/* 13. É líder? (Condicional) */}
              <div className="space-y-2 animate-fade-in flex flex-col justify-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 font-sans mb-1">É Líder do Departamento?</label>
                <label className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors shadow-sm">
                  <input type="checkbox" {...register('departamento_lider')} className="w-5 h-5 rounded border-slate-300 text-black/80 focus:ring-black accent-black cursor-pointer" />
                  <span className="text-sm font-medium text-slate-700 font-sans">Sim, atua como líder</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-sm font-bold text-slate-600 transition-all active:scale-95 font-sans">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2.5 bg-[#b3f516] hover:bg-[#a3e114] text-black font-bold py-2.5 rounded-full shadow-md shadow-[#b3f516]/5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed font-sans">
          {saving
            ? <span className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
            : <Save className="w-5 h-5" />}
          {saving ? 'Processando...' : membro ? 'Salvar Alterações' : 'Finalizar Cadastro'}
        </button>
      </div>
    </form>

    {/* Modal de Visualização */}
    {showModal && fotoPreview && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowModal(false)}>
        <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
          <X className="w-6 h-6" />
        </button>
        <img 
          src={fotoPreview} 
          alt="Visualização" 
          className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-zoom-in"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    )}
    </>
  );
}
