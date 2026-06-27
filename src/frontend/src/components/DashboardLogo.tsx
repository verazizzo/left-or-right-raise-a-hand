import * as React from 'react';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

// 1. IMPORTA TUTTE LE VERSIONI DEI LOGHI
import iconaChiara from '../assets/logo_sfum_3sfum.svg'; 
import iconaScura from '../assets/logo_sfum_1.svg'; 

import testoChiaro from '../assets/titolo_sfum_3sfum.svg'; 
import testoScuro from '../assets/titolo_sfum_3sfum.svg'; 

// Aggiunta la prop "redirectTo" con valore di default "/homepage"
export default function DashboardLogo({ 
  disableLink = false, 
  redirectTo = "/homepage" 
}: { 
  disableLink?: boolean;
  redirectTo?: string;
}) {
  
  const componentType = disableLink ? 'div' : Link;

  return (
    <Box
      component={componentType}
      // Se è disabilitato to è undefined, altrimenti usa la rotta personalizzata!
      to={disableLink ? undefined : redirectTo}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
        // Se non è un link, togliamo l'effetto hover e il cursore pointer
        cursor: disableLink ? 'default' : 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: disableLink ? 'none' : 'scale(1.02)',
        },

        // === LA MAGIA DELLO SWAP IMMAGINI ===
        '& .img-dark': {
          display: 'none',
        },
        ...theme.applyStyles('dark', {
          '& .img-light': {
            display: 'none',
          },
          '& .img-dark': {
            display: 'block',
          },
        }),
      })}
    >
      {/* ICONE */}
      <img src={iconaChiara} alt="Icona" className="img-light" style={{ height: '50px', width: 'auto' }} />
      <img src={iconaScura} alt="Icona" className="img-dark" style={{ height: '50px', width: 'auto' }} />

      {/* TESTI */}
      <img src={testoChiaro} alt="Nome" className="img-light" style={{ height: '20px', width: '150px' }} />
      <img src={testoScuro} alt="Nome" className="img-dark" style={{ height: '20px', width: '150px' }} />
    </Box>
  );
}