'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import type { Membro, Grupo } from '@/lib/types';
import toast from 'react-hot-toast';
import CameraModal from './CameraModal';
import { Camera, Save, ArrowLeft, User } from 'lucide-react';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().optional(),
  telefone2: z.string().optional(),
  setor: z.string().optional(),
  grupo_id: z.string().optional(),
  data_nascimento: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
});

type FormData = z.infer<typeof schema>;

interface Props { membro?: Membro }

export default function FormMembro({ membro }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(membro?.foto_url ?? null);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: membro?.nome ?? '',
      telefone: membro?.telefone ?? '',
      telefone2: membro?.telefone2 ?? '',
      setor: membro?.setor ?? '',
      grupo_id: membro?.grupo_id ?? '',
      data_nascimento: membro?.data_nascimento ?? '',
      email: membro?.email ?? '',
      endereco: membro?.endereco ?? '',
      status: membro?.status ?? 'ativo',
    },
  });

  useEffect(() => {
    supabase.from('grupos').select('*').order('nome').then(({ data }) => {
      if (data) setGrupos(data);
    });
  }, []);

  function handleCameraCapture(file: File) {
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
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

      const payload = { ...data, foto_url, grupo_id: data.grupo_id || null, email: data.email || null };

      if (membro) {
        const { error } = await supabase.from('membros').update(payload).eq('id', membro.id);
        if (error) throw error;
        toast.success('Membro atualizado!');
      } else {
        const { error } = await supabase.from('membros').insert(payload);
        if (error) throw error;
        toast.success('Membro cadastrado!');
      }
      router.push('/membros');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { id: 'nome', label: 'Nome completo *', type: 'text', placeholder: 'João da Silva' },
    { id: 'telefone', label: 'Telefone', type: 'text', placeholder: '(11) 99999-9999' },
    { id: 'telefone2', label: 'Telefone 2', type: 'text', placeholder: '(11) 99999-9999' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'joao@email.com' },
    { id: 'setor', label: 'Setor da Igreja', type: 'text', placeholder: 'Louvor, Diaconia...' },
    { id: 'data_nascimento', label: 'Data de Nascimento', type: 'date', placeholder: '' },
    { id: 'endereco', label: 'Endereço', type: 'text', placeholder: 'Rua, número, bairro...' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fadeIn">

      {/* Foto */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Foto</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
            {fotoPreview
              ? <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-slate-300" />
            }
          </div>
          <button type="button" onClick={() => setShowCamera(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
            <Camera className="w-4 h-4" />
            {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
          </button>
        </div>
      </div>

      {/* Dados */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Dados do Membro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ id, label, type, placeholder }) => (
            <div key={id} className={id === 'nome' || id === 'endereco' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                {...register(id)}
                type={type}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]?.message}</p>}
            </div>
          ))}

          {/* Grupo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Grupo / Célula</label>
            <select {...register('grupo_id')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              <option value="">Sem grupo</option>
              {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </div>

          {/* Status */}
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={() => router.back()}
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

      {showCamera && (
        <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </form>
  );
}
