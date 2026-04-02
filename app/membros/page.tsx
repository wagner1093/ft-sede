import TabelaMembros from '@/components/membros/TabelaMembros';
import { Users } from 'lucide-react';

export const metadata = { title: 'Membros | FT-SEDE' };

export default function MembrosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Membros
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie os membros da sua célula</p>
      </div>
      <TabelaMembros />
    </div>
  );
}
