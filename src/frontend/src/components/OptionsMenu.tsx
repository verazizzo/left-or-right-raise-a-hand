import * as React from 'react';
import { useEffect } from 'react';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem'; 
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  const menuItems = React.useMemo(() => [
    { text: t.menuSettings, path: '/profile' },
  ], [t.profilo, t.menuSettings]);

  return (
    <React.Fragment>
      {customTrigger ? (
        <Box onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex' }}>
          {customTrigger}
        </Box>
      ) : (
        <Tooltip 
          title={t.menuSettings}
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
              timeout: 300 
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
        disableScrollLock={!isMobileLayout}

        anchorOrigin={{ 
          horizontal: isMobileLayout 
            ? (isRtl ? 'left' : 'right') 
            : (isRtl ? 'right' : 'left'), 
          vertical: 'top' 
        }}
        

        transformOrigin={{ 
          horizontal: isMobileLayout 
            ? (isRtl ? 'left' : 'right') 
            : (isRtl ? 'right' : 'left'),
          vertical: 'bottom' 
        }}
        slotProps={{
          paper: {
            sx: {
              width: 'auto',
              minWidth: '120px',

              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0px 6px 18px rgba(0, 0, 0, 0.6)' 
                  : '0px 6px 18px rgba(0, 0, 0, 0.15)', 
            }
          }
        }}
        sx={{

          mt: isMobileLayout ? -1 : -1,

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
            margin: '2px 0', 
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