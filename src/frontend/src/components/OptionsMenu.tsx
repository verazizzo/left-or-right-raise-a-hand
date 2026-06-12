import * as React from 'react';
import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MenuButton from './MenuButton';
import { Box, IconButton } from '@mui/material';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import { useNavigate } from 'react-router-dom';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { language } = useSettings();
  const t = translations[language];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <React.Fragment>
      {customTrigger ? (
        <Box onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex' }}>
                  {customTrigger}
        </Box>
              ) : (
        <IconButton onClick={handleClick} size="small" sx={{ ml: -1 }}>
        <MoreVertRoundedIcon /> {/* O qualsiasi icona tu stia usando */}
        </IconButton>
      )}
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
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
        <MenuItem onClick={handleClose}>{t.profilo}</MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>{t.impostazioni}</MenuItem>
        <Divider />
        <MenuItem
          onClick={handleClose}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText onClick={handleLogout}>{t.esci}</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
