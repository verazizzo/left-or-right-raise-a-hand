import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import MuiToolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SideMenuMobile from './SideMenuMobile';

export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'block', md: 'none' }, // Visibile solo su mobile
        boxShadow: 'none',
        bgcolor: 'transparent',
        backgroundImage: 'none',
        // Abbiamo tolto i vecchi left/right perché ora la larghezza è gestita da AppTheme
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
            '&:hover': {
              bgcolor: 'background.default',
            }
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
        
        <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
      </MuiToolbar>
    </AppBar>
  );
}