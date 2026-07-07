import Stack from '@mui/material/Stack';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CustomDatePicker from './inutili/CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import DashboardLogo from './DashboardLogo';

import Search from './Search';

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      {/*<NavbarBreadcrumbs />*/}
      <DashboardLogo />
    </Stack>
  );
}
