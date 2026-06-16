import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import MuiToolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SideMenuMobile from './SideMenuMobile';
import Box from '@mui/material/Box';

export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed" elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' }, // Visibile solo su mobile
        boxShadow: 'none',
        bgcolor: 'transparent !important',
        backgroundImage: 'none !important',
        // Abbiamo tolto i vecchi left/right perché ora la larghezza è gestita da AppTheme
        // === IL TRUCCO DI MAGIA ===
        // Rende la barra trasparente "immateriale": i click la trapassano 
        // e colpiscono il tuo DashboardLogo che sta sotto!
        pointerEvents: 'none',
      }}
    >
      {/* LA SOLUZIONE È QUI: justifyContent: 'flex-end' spinge l'IconButton tutto a destra! */}
      <MuiToolbar sx={{ p: 2, justifyContent: 'flex-end' }}>
        <IconButton
          aria-label="Menu"
          onClick={toggleDrawer(true)}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            // IMPORTANTE: Il bottone del menu deve invece continuare a rispondere ai click!
            pointerEvents: 'auto',
            '&:hover': {
              bgcolor: 'background.default',
            }
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
        
        {/* Avvolgiamo il menu mobile per assicurarci che riceva i click quando si apre */}
        <Box sx={{ pointerEvents: 'auto' }}>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Box>
      </MuiToolbar>
    </AppBar>
  );
}