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
import Tooltip from '@mui/material/Tooltip';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Fade from '@mui/material/Fade';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export default function OptionsMenu({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const { language, forceMobile } = useSettings();
  const t = translations[language];
  const isRtl = language === 'ar';

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
      // SOSTITUITO .clear() CON LA RIMOZIONE MIRATA in modo da passare informazioni come lingua e tema
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    handleClose();
    // SOSTITUITO .clear() CON LA RIMOZIONE MIRATA PER SALVARE IL TEMA E LA LINGUA
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  const menuItems = React.useMemo(() => [
    { text: t.impostazioni, path: '/profile' },
  ], [t.profilo, t.impostazioni]);

  return (
    <React.Fragment>
      {customTrigger ? (
        <Box onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex' }}>
          {customTrigger}
        </Box>
      ) : (
        <Tooltip 
          title={t.impostazioni}
          placement={
            isMobileLayout 
              ? (isRtl ? 'right' : 'left') 
              : (isRtl ? 'left' : 'right')
          }
          arrow
          slots={{
            transition: Fade
          }}
          slotProps={{
            transition: { 
              timeout: 300 // Animazione rapida e pulita
            },
            popper: {

              sx: { direction: 'ltr' }
            },
            tooltip: {
              sx: { direction: isRtl ? 'rtl' : 'ltr' }
            }
          }}
        >
          <IconButton onClick={handleClick} size="small" sx={{ ml: -1 }}>
            <MoreVertRoundedIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}

        anchorOrigin={{ 
          horizontal: isMobileLayout 
            ? (isRtl ? 'left' : 'right') 
            : (isRtl ? 'right' : 'left'), 
          vertical: isMobileLayout ? 'bottom' : 'top' 
        }}
        

        transformOrigin={{ 
          horizontal: isMobileLayout 
            ? (isRtl ? 'left' : 'right') 
            : (isRtl ? 'right' : 'left'),
          vertical: isMobileLayout ? 'top' : 'bottom' 
        }}
        slotProps={{
          paper: {
            sx: {
              width: 'auto',
              minWidth: '120px',

              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0px 6px 18px rgba(0, 0, 0, 0.6)' // Ombra forte per il tema scuro
                  : '0px 6px 18px rgba(0, 0, 0, 0.15)', // Ombra morbida ma visibile per il chiaro
            }
          }
        }}
        sx={{

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
            gap: 1,
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