import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import MainGrid from '../components/MainGrid';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Methodology from '../components/Methodology';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function About(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

  }, [navigate]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'stretch',
              mx: 3,
              pb: 5,
              mt: { xs: 1, md: 0 },
            }}
          >
            <Header />
            <Methodology />

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
