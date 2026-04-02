import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente utilitário que força o scroll para o topo em cada mudança de rota.
 * Essencial para mobile para evitar que a nova página carregue em uma posição de scroll antiga.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
