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

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import LoadingOverlay from './LoadingOverlay';
import TextField from '@mui/material/TextField';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');

  const [loading, setLoading] = React.useState(false);

  const handleCloseModal = () => {
    setEmail('');
    setEmailError(false);
    setEmailErrorMessage('');
    handleClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(false);
    setEmailErrorMessage('');
    setLoading(true);

    try {
      await forgotPassword(email);
      handleCloseModal();
      
      navigate('/update-password', { state: { email: email } });

    } catch (err: any) {
      setEmailError(true);
      setEmailErrorMessage(t.errEmailValida);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'background.default',
          backgroundImage: 'none',              
          border: '2px solid',
          borderColor: 'divider'               
        }
      }}
    >
      <LoadingOverlay active={loading} message={t.caricamentoCambioPassword} />
      <form onSubmit={handleSubmit} noValidate>
        
        <DialogTitle>{t.finestraTitolo}</DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <DialogContentText>
            {t.finestraDesc}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            placeholder={t.esempioEmail}
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) {
                setEmailError(false);
                setEmailErrorMessage('');
              }
            }}
            disabled={loading}
            error={emailError}
            helperText={emailError ? emailErrorMessage : ''} 
          />
        </DialogContent>
        
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleCloseModal} disabled={loading}>
            {t.annulla}
          </Button>
          <Button 
            variant="contained" 
            type="submit" 
            disabled={loading || !!emailError || !email.trim()}
          >
            {t.continua}
          </Button>
        </DialogActions>

      </form>
    </Dialog>
  );
}