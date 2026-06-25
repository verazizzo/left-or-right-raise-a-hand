import Box from '@mui/material/Box'; // <-- Importa Box
import Loader from './Loader';

interface LoadingOverlayProps {
  active: boolean;
  message?: string;
}

export default function LoadingOverlay({ active, message }: LoadingOverlayProps) {

  if (!active) return null;

  return (
    // Sostituito il div esterno con Box
    <Box sx={(theme) => ({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
      // Variante DARK per lo sfondo oscurato
      ...theme.applyStyles('dark', {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }),
    })}>
      {/* Sostituito il div interno (il quadratino) con Box */}
      <Box sx={(theme) => ({
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center',
        border: '3px solid #000000',
        maxWidth: '400px',
        width: '80%',
        // Variante DARK per il quadratino del loader
        ...theme.applyStyles('dark', {
          backgroundColor: '#575757', // Il grigio scuro che preferisci
          border: '3px solid #333333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        }),
      })}>
        <Loader message={message}/>
      </Box>
    </Box>
  );
}