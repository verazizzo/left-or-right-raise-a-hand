import Stack from '@mui/material/Stack';

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
      {/* <DashboardLogo /> */}
    </Stack>
  );
}
