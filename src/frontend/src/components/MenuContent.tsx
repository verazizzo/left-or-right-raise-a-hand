import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded'; 
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

interface MenuContentProps {
  open?: boolean;
}

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import { Link, useLocation } from 'react-router-dom';
import React, { useMemo } from 'react';

interface MenuContentProps {
  open?: boolean;
}


export default function MenuContent({ open = true }: MenuContentProps) {
  const location = useLocation();
  const { language } = useSettings();
  const t = translations[language];
  const isRtl = language === 'ar';
  React.useEffect(() => {
    console.log("L'URL letto da React è esattamente:", location.pathname);
  }, [location]);

  const mainListItems = useMemo(() => [
    { text: t.menuHome , icon: <HomeRoundedIcon />, path: '/homepage' },
    { text: t.menuPopulation , icon: <PublicRoundedIcon />, path: '/global-analysis' },
    { text: t.menuPatients , icon: <PeopleRoundedIcon />, path: '/patients' },
    { text: t.menuComparison , icon: <BalanceRoundedIcon />, path: '/comparison' },
  ], [t]);

  const secondaryListItems = useMemo(() => [
    { text: t.menuAbout , icon: <InfoRoundedIcon />, path: '/about' },
    { text: t.menuAiuto , icon: <HelpRoundedIcon />, path: '/help' },
  ], [t]);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            
            <Tooltip 
              title={item.text} 
              placement="right" 
              arrow 
              disableHoverListener={open} 

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
              <ListItemButton 
                component={Link} 
                to={item.path || '/'} 
                selected={location.pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Tooltip>

          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <Tooltip 
              title={item.text} 
              placement="right" 
              arrow 
              disableHoverListener={open}
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
              <ListItemButton
                component={Link}
                to={item.path || '/'}
                selected={location.pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
