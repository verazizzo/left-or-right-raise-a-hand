import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { BarChart } from '@mui/x-charts/BarChart';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export type ShapBarChartProps = {
  title: string;
  subtitle?: React.ReactNode;
  labels: string[];         
  values: number[];         
  descriptions?: string[];
  showLimitSelector?: boolean;  
  paletteType?: 'features' | 'windows';
};

export default function ShapBarChart({
  title,
  subtitle,
  labels,
  values,
  descriptions,
  showLimitSelector = false,
  paletteType = 'features'
}: ShapBarChartProps) {

  const { language, forceMobile } = useSettings();
  const t = translations[language];
  const isRtl = language === 'ar';

  // 1. STATO PER IL SELETTORE DELLE FEATURE (-1 significa "Tutte")
  // Di default impostiamo "Tutte", ma puoi cambiare il default a 5 o 10 se preferisci.
  const [featureLimit, setFeatureLimit] = React.useState<number>(10);

  // 2. TAGLIAMO GLI ARRAY IN BASE AL LIMITE SCELTO
  const displayedLabels = featureLimit === -1 ? labels : labels.slice(0, featureLimit);
  const displayedValues = featureLimit === -1 ? values : values.slice(0, featureLimit);
  const displayedDescriptions = descriptions 
    ? (featureLimit === -1 ? descriptions : descriptions.slice(0, featureLimit)) 
    : undefined;

  // IL SENSORE DEL MOUSE (rimane invariato)
  const [isRightHalf, setIsRightHalf] = React.useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    const percentage = x / rect.width;
    setIsRightHalf(percentage > 0.5);
  };

  // 2. LE NUOVE PALETTE COLORBLIND-SAFE
  // 16 Colori per le Feature (Incrocio tra Okabe-Ito e Paul Tol Muted/Bright)
  const featurePalette = [
    '#0072B2', // Blu scuro
    '#D55E00', // Vermiglio (Rosso/Arancio scuro)
    '#009E73', // Verde smeraldo
    '#E69F00', // Arancione
    '#CC79A7', // Rosa
    '#56B4E9', // Azzurro
    '#F0E442', // Giallo
    '#332288', // Indaco
    '#88CCEE', // Ciano
    '#44AA99', // Verde acqua
    '#117733', // Verde foresta scuro
    '#999933', // Verde oliva
    '#DDCC77', // Sabbia
    '#CC6677', // Rosa antico/Vino
    '#882255', // Prugna
    '#AA4499', // Viola
  ];

  // 3 Colori completamente diversi per le Finestre Temporali (Paul Tol High-Contrast)
  const windowPalette = [
    '#004488', // Blu notte
    '#DDAA33', // Senape
    '#BB5566', // Rosso scuro
  ];

  // 3. ASSEGNAZIONE DINAMICA DEI COLORI IN BASE ALLA PROP
  const chartColors = paletteType === 'windows'
    ? windowPalette.slice(0, displayedLabels.length) // Se è la finestra temporale, usa i 3 colori
    : displayedLabels.map((_, index) => featurePalette[index % featurePalette.length]); // Altrimenti ricicla i 16 colori

    
  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }} onMouseMove={handleMouseMove}>
      <CardContent>
        
        {/* INTESTAZIONE: Titolo a sinistra e Selettore a destra */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="flex-start" 
          spacing={2} 
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* NUOVO SELETTORE */}
          {/* 2. NASCONDI IL SELETTORE SE LA PROP È FALSE */}
          {showLimitSelector && (
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={featureLimit}
                onChange={(e) => setFeatureLimit(Number(e.target.value))}
                displayEmpty
                inputProps={{ 'aria-label': 'Numero di feature' }}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value={3}>Top 3</MenuItem>
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={-1}>{t.tutte || 'Tutte'}</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>

        <Box dir={isRtl ? 'rtl' : 'ltr'} sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            borderRadius={4}
            yAxis={[
              {
                scaleType: 'band',
                // USIAMO GLI ARRAY TAGLIATI QUI:
                data: displayedLabels,
                categoryGapRatio: 0.3,
                width: 90,
                colorMap: {
                  type: 'ordinal',
                  colors: chartColors,
                },
                position: isRtl ? 'right' : 'left',
                tickLabelStyle: {
                  textAnchor: 'end',
                  transform: 'none',
                },
              },
            ]}
            
            xAxis={[
              {
                label: t.labelShapBar,
                reverse: isRtl,
                labelStyle: {
                  transform: `${isRtl ? 'translateX(30px)' : 'translateX(-30px)'} translateY(10px)`,
                },
              },              
            ]}
            
            series={[
              {
                id: 'shap-values',
                label: '', 
                // USIAMO GLI ARRAY TAGLIATI QUI:
                data: displayedValues,
                valueFormatter: (value, context) => {
                  if (value === null) return '';
                  const formattedValue = value.toFixed(4);
                  if (displayedDescriptions && context && context.dataIndex !== undefined) {
                    return `${t.valore}: ${formattedValue}\n\n${displayedDescriptions[context.dataIndex]}`;
                  }
                  return formattedValue;
                },
              },
            ]}
            // (Il resto del grafico rimane identico)
            height={350}
            margin={{ left: isRtl ? 10 : -10, right: isRtl ? -10: 10, top: 10, bottom: 20 }} 
            grid={{ vertical: true }} 
            hideLegend 
            sx={{              
              '& .MuiChartsTooltip-markCell': { display: 'none !important' },
              '& .MuiChartsTooltip-labelCell': { display: 'none !important' },
              ...(forceMobile && {
                '& .MuiChartsLayerContainer-root': { overflow: 'visible !important' },
                '& .MuiChartsWrapper-root': { overflow: 'visible !important' },
                '& .MuiChartsTooltip-root': {
                  position: 'absolute !important',
                  zIndex: '9999 !important',
                  transform: isRightHalf ? 'translateX(-110%)' : 'translateX(10px)',
                }
              }),
              '& .MuiChartsTooltip-valueCell': {
                whiteSpace: 'pre-wrap !important', 
                maxWidth: forceMobile ? '180px !important' : '300px !important', 
                padding: forceMobile ? '6px 8px !important' : '12px !important', 
                fontSize: forceMobile ? '0.80rem !important' : '0.875rem !important',
                lineHeight: '1.4 !important', 
                textAlign: 'left !important',
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}