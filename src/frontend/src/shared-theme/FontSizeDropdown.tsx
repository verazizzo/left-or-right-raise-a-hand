import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormatSizeIcon from '@mui/icons-material/FormatSize'; // Icona "Aa"
import { useSettings } from '../context/SettingsContext';
import type { FontSizeOption } from '../context/SettingsContext';
import { translations } from '../data/translations';

export default function FontSizeDropdown() {
  const { fontSize, setFontSize, language } = useSettings();
  const t = translations[language];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (size: FontSizeOption) => {
    setFontSize(size);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small" sx={{ border: '1px solid', borderColor: 'divider', width: '2.25rem', height: '2.25rem' }}>
        <FormatSizeIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { variant: 'outlined', sx: { my: 1 } } }}
      >
        <MenuItem selected={fontSize === 'small'} onClick={() => handleSelect('small')}>
          <Typography variant="body2">{t.textSmall}</Typography>
        </MenuItem>
        <MenuItem selected={fontSize === 'medium'} onClick={() => handleSelect('medium')}>
          <Typography variant="body2">{t.textMedium}</Typography>
        </MenuItem>
        <MenuItem selected={fontSize === 'large'} onClick={() => handleSelect('large')}>
          <Typography variant="body2">{t.textLarge}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}