export interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
}

export interface Membro {
  id: string;
  nome: string;
  whatsapp?: string;
  instagram?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  setor?: string;
  foto_url?: string;
  data_nascimento?: string;
  grupo_id?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at?: string;
}
