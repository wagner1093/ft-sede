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
  serve_departamento: boolean;
  departamento?: string;
  departamento_lider: boolean;
  foto_url?: string;
  data_nascimento?: string;
  batismo_aguas: boolean;
  batismo_aguas_data?: string;
  batismo_espirito_santo: boolean;
  grupo_id?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at?: string;
}
