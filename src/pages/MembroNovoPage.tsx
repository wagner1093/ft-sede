import Navbar from '../components/Navbar';
import FormMembro from '../components/FormMembro';

export default function MembroNovoPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[50%] h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-8 relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">Novo Membro</h1>
          <p className="text-slate-900 font-medium mt-2 font-sans">Preencha os dados para cadastrar</p>
        </div>
        <FormMembro />
      </main>
    </div>
  );
}
