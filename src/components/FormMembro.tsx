import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import type { Membro } from '../lib/types';
import toast from 'react-hot-toast';
import { ImagePlus, Save, ArrowLeft, User, X } from 'lucide-react';

const SETORES = ['Sede', 'Fortaleça', 'Garcia'];

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  responsavel_nome: z.string().optional(),
  responsavel_telefone: z.string().optional(),
  setor: z.string().optional(),
  data_nascimento: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
});

type FormData = z.infer<typeof schema>;

interface Props { membro?: Membro }

export default function FormMembro({ membro }: Props) {
  const navigate = useNavigate();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(membro?.foto_url ?? null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: membro?.nome ?? '',
      whatsapp: membro?.whatsapp ?? '',
      instagram: membro?.instagram ?? '',
      responsavel_nome: membro?.responsavel_nome ?? '',
      responsavel_telefone: membro?.responsavel_telefone ?? '',
      setor: membro?.setor ?? '',
      data_nascimento: membro?.data_nascimento ?? '',
      status: membro?.status ?? 'ativo',
    },
  });

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
      const payload = { ...data, foto_url, data_nascimento: data.data_nascimento || null };

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

  const textFields = [
    { id: 'nome',                  label: 'Nome completo *',        type: 'text', placeholder: 'João da Silva',       span2: true  },
    { id: 'whatsapp',              label: 'WhatsApp',               type: 'text', placeholder: '(11) 99999-9999',     span2: false },
    { id: 'instagram',             label: 'Instagram',              type: 'text', placeholder: '@usuario',            span2: false },
    { id: 'responsavel_nome',      label: 'Responsável (nome)',     type: 'text', placeholder: 'Nome do responsável', span2: false },
    { id: 'responsavel_telefone',  label: 'Número do responsável',  type: 'text', placeholder: '(11) 99999-9999',     span2: false },
    { id: 'data_nascimento',       label: 'Data de Nascimento',     type: 'date', placeholder: '',                    span2: false },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Foto */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Foto</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0 relative">
            {fotoPreview
              ? <><img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button></>
              : <User className="w-8 h-8 text-slate-300" />
            }
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer">
            <ImagePlus className="w-4 h-4" />
            {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </label>
        </div>
      </div>

      {/* Dados */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Dados do Membro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map(({ id, label, type, placeholder, span2 }) => (
            <div key={id} className={span2 ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input {...register(id)} type={type} placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]?.message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Setor</label>
            <select {...register('setor')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              <option value="">Selecione o setor</option>
              {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select {...register('status')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {saving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : membro ? 'Atualizar Membro' : 'Cadastrar Membro'}
        </button>
      </div>
    </form>
  );
}
