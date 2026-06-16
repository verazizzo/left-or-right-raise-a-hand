import * as React from 'react';
import { useEffect } from 'react';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem'; // Usiamo quello nativo!
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Box, IconButton } from '@mui/material';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export default function OptionsMenu({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const { language, forceMobile } = useSettings();
  const t = translations[language];

  // --- RADAR PER LO SCHERMO ---
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 
  const isMobileLayout = forceMobile || isSmallScreen;

  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    handleClose();
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = React.useMemo(() => [
    { text: t.profilo, path: '/profile' },
  ], [t.profilo, t.impostazioni]);

  return (
    <React.Fragment>
      {customTrigger ? (
        <Box onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex' }}>
          {customTrigger}
        </Box>
      ) : (
        <IconButton onClick={handleClick} size="small" sx={{ ml: -1 }}>
          <MoreVertRoundedIcon />
        </IconButton>
      )}
      
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        // LA LOGICA DEFINITIVA:
        // PC (isMobileLayout falso): Si aggancia SOPRA l'icona (vertical: 'top')
        // Mobile (isMobileLayout vero): Si aggancia SOTTO l'icona (vertical: 'bottom')
        anchorOrigin={{ 
          horizontal: 'right', 
          vertical: isMobileLayout ? 'bottom' : 'top' 
        }}
        
        // PC: Nasce dal basso verso l'alto
        // Mobile: Nasce dall'alto verso il basso
        transformOrigin={{ 
          horizontal: 'right', 
          vertical: isMobileLayout ? 'top' : 'bottom' 
        }}
        slotProps={{
          paper: {
            sx: {
              // ECCO LA MAGIA PER LA LARGHEZZA PRECISA
              width: '120px', // Cambia questo valore con i pixel che preferisci!
            }
          }
        }}
        sx={{
          // --- ECCO LA MAGIA DELLO STACCO! ---
          // Se mobile (scende), lo spingiamo in giù di 8px (1 in scala MUI)
          // Se PC (sale), lo spingiamo in su di -8px (-1 in scala MUI)
          mt: isMobileLayout ? 0 : -1,

          [`& .${listClasses.root}`]: {
            padding: '4px',
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px',
          },
        }}
      >
        {menuItems.map((item, index) => (
          <Box key={index}>
            <MenuItem 
              component={Link} 
              to={item.path}
              onClick={handleClose}
              selected={location.pathname === item.path}
              // Aggiunto il margine qui al posto dello styled
              sx={{ margin: '2px 0', color: 'inherit', textDecoration: 'none' }} 
            >
              {item.text}
            </MenuItem>
            <Divider />
          </Box>
        ))}

        <MenuItem
          onClick={handleLogout}
          sx={{
            margin: '2px 0', // Aggiunto anche qui per coerenza
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText>{t.esci}</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}