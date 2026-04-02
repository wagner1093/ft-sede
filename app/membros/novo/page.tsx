import FormMembro from '@/components/membros/FormMembro';
import { UserPlus } from 'lucide-react';

export const metadata = { title: 'Novo Membro | FT-SEDE' };

export default function NovoMembroPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Novo Membro
        </h1>
        <p className="text-sm text-slate-500 mt-1">Preencha os dados para cadastrar</p>
      </div>
      <FormMembro />
    </div>
  );
}
