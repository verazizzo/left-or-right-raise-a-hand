import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';

const drawerWidth = 240;
const closedDrawerWidth = 65;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    mt: 10,
    ...(open && {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
      },
    }),
    ...(!open && {
      width: closedDrawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      [`& .${drawerClasses.paper}`]: {
        width: closedDrawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
      },
    }),
  }),
);

export default function SideMenu() {
  const [open, setOpen] = React.useState(() => {
    const savedState = localStorage.getItem('sidebar_open');
    return savedState === null ? true : savedState === 'true';
  });

  const toggleDrawer = () => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      localStorage.setItem('sidebar_open', nextOpen.toString());
      return nextOpen;
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* SEZIONE 1: HEADER (Altezza fissa bloccata a 68px) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
          minHeight: 68, 
        }}
      >
        
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* SEZIONE 2: MENU INTERNO */}
      <Box
        sx={{
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiListItemButton-root': {
            minHeight: 48,
          },
          '& .MuiListItemIcon-root': {
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
          },
          '& .MuiListItemText-root': {
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s',
            display: open ? 'block' : 'none',
          },
        }}
      >
        <MenuContent open={open} />
      </Box>
      
      {/* SEZIONE 3: FOOTER UTENTE (Bloccato verticalmente) */}
      <Stack
        direction="row"
        sx={{
          p: 1.5, // <-- Fissato il padding costante per evitare micro-salti
          gap: 1,
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          minHeight: 64, // <-- BLOCCHIAMO L'ALTEZZA: immobile sia aperto che chiuso!
        }}
      >
        <Avatar
          sizes="small"
          alt="Riley Carter"
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        {open && (
          <>
            <Box sx={{ mr: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
                Riley Carter
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                riley@email.com
              </Typography>
            </Box>
            <OptionsMenu />
          </>
        )}
      </Stack>
    </Drawer>
  );
}