import Navbar from '../components/Navbar';
import FormMembro from '../components/FormMembro';

export default function MembroNovoPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Novo Membro</h1>
          <p className="text-slate-500 text-sm mt-1">Cadastre um novo membro</p>
        </div>
        <FormMembro />
      </main>
    </>
  );
}
