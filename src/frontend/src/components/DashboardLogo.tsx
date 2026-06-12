import * as React from 'react';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

// 1. IMPORTA ENTRAMBI I TUOI FILE SVG REALI
import mioLogoIcona from '../assets/logo_sfum.svg'; 
import mioLogoTesto from '../assets/titolo_sfum.svg'; 

export default function DashboardLogo() {
  return (
    <Box
      component={Link}
      to="/homepage"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5, // Distanza di 12px tra il disegno e la scritta
        textDecoration: 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)', // Un micro-effetto piacevole al passaggio del mouse
        },
      }}
    >
      {/* 2. IL TUO DISEGNO/ICONA */}
      <img 
        src={mioLogoIcona} 
        alt="Icona Interfaccia" 
        style={{ 
          height: '50px', // Altezza del disegno
          width: 'auto' 
        }} 
      />

      {/* 3. IL NOME DELLA TUA INTERFACCIA */}
      <img 
        src={mioLogoTesto} 
        alt="Nome Interfaccia" 
        style={{ 
          height: '20px', // Di solito il testo sta meglio leggermente più basso dell'icona, ma puoi regolarlo
          width: '150px'
        }} 
      />
    </Box>
  );
}