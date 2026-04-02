import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  UserCog, ArrowLeft, Phone, Mail, MapPin, Calendar,
  Users, CheckCircle2, XCircle, User
} from 'lucide-react';

export const metadata = { title: 'Detalhes do Membro | FT-SEDE' };

export default async function MembroDetalhesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: membro } = await supabase
    .from('membros')
    .select('*, grupos(nome)')
    .eq('id', params.id)
    .single();

  if (!membro) notFound();

  const infos = [
    { icon: Phone, label: 'Telefone', value: membro.telefone },
    { icon: Phone, label: 'Telefone 2', value: membro.telefone2 },
    { icon: Mail, label: 'Email', value: membro.email },
    { icon: MapPin, label: 'Endereço', value: membro.endereco },
    { icon: Calendar, label: 'Nascimento', value: membro.data_nascimento
        ? new Date(membro.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
        : null },
    { icon: Users, label: 'Grupo / Célula', value: membro.grupos?.nome },
    { icon: Users, label: 'Setor', value: membro.setor },
  ].filter(i => i.value);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back */}
      <Link href="/membros"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para lista
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
          {membro.foto_url
            ? <img src={membro.foto_url} alt={membro.nome} className="w-full h-full object-cover" />
            : <User className="w-10 h-10 text-slate-300" />
          }
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{membro.nome}</h1>
          {membro.setor && <p className="text-slate-500 text-sm mt-1">{membro.setor}</p>}
          <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
            membro.status === 'ativo'
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {membro.status === 'ativo'
              ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <XCircle className="w-3.5 h-3.5" />}
            {membro.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <Link href={`/membros/${membro.id}/editar`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
          <UserCog className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* Info grid */}
      {infos.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Informações</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm text-slate-800 mt-0.5">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
