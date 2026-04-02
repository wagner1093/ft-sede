import Navbar from '../components/Navbar';
import TabelaMembros from '../components/TabelaMembros';

export default function MembrosPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Membros</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os membros da sua célula</p>
        </div>
        <TabelaMembros />
      </main>
    </>
  );
}
