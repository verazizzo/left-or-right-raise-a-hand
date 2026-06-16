import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // useLocation ci dice in quale pagina ci troviamo attualmente
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Prova a scorrere la finestra principale
    window.scrollTo(0, 0);

    // 2. TRUCCO PER LE DASHBOARD: Se hai un contenitore interno che scorre 
    // (come il tuo <Box component="main" sx={{ overflow: 'auto' }}>)
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, [pathname]); // Questo useEffect scatta ogni volta che 'pathname' cambia

  // Questo componente non disegna nulla sullo schermo
  return null; 
}