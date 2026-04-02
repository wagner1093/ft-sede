import { createClient } from '@/lib/supabase-server';
import FormMembro from '@/components/membros/FormMembro';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';

export const metadata = { title: 'Editar Membro | FT-SEDE' };

export default async function EditarMembroPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: membro } = await supabase
    .from('membros')
    .select('*, grupos(nome)')
    .eq('id', params.id)
    .single();

  if (!membro) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-blue-600" />
          Editar Membro
        </h1>
        <p className="text-sm text-slate-500 mt-1">{membro.nome}</p>
      </div>
      <FormMembro membro={membro} />
    </div>
  );
}
