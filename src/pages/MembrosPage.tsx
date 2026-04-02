import Navbar from '../components/Navbar';
import TabelaMembros from '../components/TabelaMembros';

export default function MembrosPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-8 relative z-10 animate-fade-in">
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">Painel de Membros</h1>
          <p className="text-slate-600 font-medium mt-2 font-sans">Visão geral do gerenciamento da Força Teen Sede</p>
        </div>
        <TabelaMembros />
      </main>
    </div>
  );
}
