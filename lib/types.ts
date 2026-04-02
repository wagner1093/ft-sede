export interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
}

export interface Membro {
  id: string;
  nome: string;
  telefone?: string;
  telefone2?: string;
  setor?: string;
  grupo_id?: string;
  foto_url?: string;
  data_nascimento?: string;
  email?: string;
  endereco?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at?: string;
  grupos?: Grupo;
}

export interface MembroFormData {
  nome: string;
  telefone?: string;
  telefone2?: string;
  setor?: string;
  grupo_id?: string;
  data_nascimento?: string;
  email?: string;
  endereco?: string;
  status: 'ativo' | 'inativo';
}
