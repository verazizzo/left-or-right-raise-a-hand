import * as React from 'react';
import { useState } from 'react';
import { forgotPassword } from '../api/auth';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import Alert from '@mui/material/Alert';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = () => {
    setEmail('');
    setMessage('');
    setError('');
    handleClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      handleCloseModal();
      
      navigate('/update-password', { state: { email: email } });

    } catch (err: any) {
      setError(err.response?.data?.message || "Errore durante l'invio. Riprova.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
    >
      <form onSubmit={handleSubmit}>
        
        <DialogTitle>Reimposta password</DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <DialogContentText>
            Inserisci l'indirizzo email del tuo account e ti invieremo un codice da inserire per reimpostare la password.
          </DialogContentText>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Indirizzo Email"
            placeholder="nome@email.com"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !!message}
          />
        </DialogContent>
        
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleCloseModal} disabled={isLoading}>
            Annulla
          </Button>
          <Button 
            variant="contained" 
            type="submit" 
            disabled={isLoading || !!message || !email.trim()}
          >
            {isLoading ? 'Invio in corso...' : 'Continua'}
          </Button>
        </DialogActions>

      </form>
    </Dialog>
  );
}