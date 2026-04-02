import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  useEffect(() => {
    // Só subir ao topo se o pathname realmente mudou (navegação de página)
    // Isso evita o 'salto' para cima em eventos de resize de mobile (como ocultar a barra de endereços)
    if (lastPath.current !== pathname) {
      window.scrollTo(0, 0);
      lastPath.current = pathname;
    }
  }, [pathname]);

  return null;
}
