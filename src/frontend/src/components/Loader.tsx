import Box from '@mui/material/Box';                 // <-- Importa Box
import Typography from '@mui/material/Typography'; // <-- Importa Typography
import brainGif from '../assets/brain_loader.gif';
import brainDarkGif from '../assets/brain_loader_dark.gif'

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "L'attore sta avviando il caso d'uso..." }: LoaderProps) {
  const containerSize = '160px'; 
  const brainSize = '100px'; 
  
  const brainOffset = (parseInt(containerSize) - parseInt(brainSize)) / 2 + 'px'; 

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',    
      justifyContent: 'center',
      width: '100%',           
      padding: '20px'
    }}>
      
      <style>{`
        @keyframes spin-loader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ position: 'relative', width: containerSize, height: containerSize }}>
        
        {/* Sostituito div con Box per gestire i colori della rotellina */}
        <Box sx={(theme) => ({ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: containerSize, 
          height: containerSize, 
          borderRadius: '50%',
          border: '8px solid #f3f3f3',        
          borderTop: '8px solid #0070e0',     
          borderRight: '8px solid #0070e0',   
          boxSizing: 'border-box',
          animation: 'spin-loader 1.2s linear infinite', 
          zIndex: 0,
          // Variante DARK per la rotellina
          ...theme.applyStyles('dark', {
            border: '8px solid rgba(255, 255, 255, 0.1)', 
            borderTop: '8px solid #4fc3f7',     
            borderRight: '8px solid #4fc3f7',   
          }),
        })} />
        
        <Box 
          component="img"
          src={brainGif} 
          alt="Brain animation light" 
          sx={(theme) => ({ 
            position: 'absolute', 
            top: brainOffset, 
            left: brainOffset, 
            width: brainSize, 
            height: 'auto', 
            zIndex: 1,
            display: 'block',
            ...theme.applyStyles('dark', {
              display: 'none',
            }),
          })} 
        />

        {/* 4. CERVELLO DARK (Compare SOLO in Dark Mode) */}
        <Box 
          component="img"
          src={brainDarkGif} 
          alt="Brain animation dark" 
          sx={(theme) => ({ 
            position: 'absolute', 
            top: brainOffset, 
            left: brainOffset, 
            width: brainSize, 
            height: 'auto', 
            zIndex: 1,
            display: 'none',
            ...theme.applyStyles('dark', {
              display: 'block',
            }),
          })} 
        />
      
      </div>
      
      <Typography sx={(theme) => ({ 
        marginTop: '24px', 
        color: '#555', 
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'sans-serif',
        ...theme.applyStyles('dark', {
          color: '#e0e0e0',
        }),
      })}>
        {message}
      </Typography>
      
    </Box>
  );
}