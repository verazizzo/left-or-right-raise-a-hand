import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export type ShapBarChartProps = {
  title: string;
  subtitle?: string;
  labels: string[];         
  values: number[];         
  descriptions?: string[];  
};

export default function ShapBarChart({
  title,
  subtitle,
  labels,
  values,
  descriptions,
}: ShapBarChartProps) {

  const { language, forceMobile } = useSettings();
  const t = translations[language];
  const isRtl = language === 'ar';

  // --- 1. IL SENSORE DEL MOUSE (Tornato alla divisione a metà) ---
  const [isRightHalf, setIsRightHalf] = React.useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    
    const percentage = x / rect.width;
    
    // Se siamo oltre il 50% della larghezza, il tooltip deve stare a sinistra.
    // Questo è vero in qualsiasi lingua.
    setIsRightHalf(percentage > 0.5);
  };

// Palette "Colorblind-Safe" (basata su Okabe-Ito e Paul Tol)
  // Colori studiati scientificamente per essere distinguibili in ogni forma di daltonismo
  const accessiblePalette = [
    '#0072B2', // 1. Blu scuro
    '#D55E00', // 2. Rosso/Vermiglio (Molto contrastato col blu)
    '#009E73', // 3. Verde acqua scuro
    '#E69F00', // 4. Arancione chiaro
    '#CC79A7', // 5. Rosa/Prugna
    '#56B4E9', // 6. Azzurro cielo (Diverso dal blu scuro)
    '#F0E442', // 7. Giallo (Usare con cautela su sfondi bianchi, ma ok nei grafici)
    '#44AA99', // 8. Ottanio/Teal
    '#332288', // 9. Indaco scuro
    '#999999', // 10. Grigio neutro (Perfetto per le baseline)
  ];

  // Se ci sono SOLO 3 barre peschiamo il 1°, il 6° e il 10° colore per staccarli bene.
  // Altrimenti prendiamo i colori di fila.
  const chartColors = labels.length === 3 
    ? [accessiblePalette[0], accessiblePalette[1], accessiblePalette[2]] 
    : accessiblePalette.slice(0, labels.length);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }} onMouseMove={handleMouseMove}>
      <CardContent>
        
        <Stack sx={{ mb: 2 }}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {subtitle}
            </Typography>
          )}
        </Stack>

        <Box dir={isRtl ? 'rtl' : 'ltr'} sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            borderRadius={4}
            yAxis={[
              {
                scaleType: 'band',
                data: labels,
                categoryGapRatio: 0.3,
                width: 90,
                colorMap: {
                  type: 'ordinal',
                  colors: chartColors,
                },
                // In Arabo, sposta l'asse a destra
                position: isRtl ? 'right' : 'left',
                tickLabelStyle: {
                  textAnchor: 'end', // Allinea il testo correttamente
                  // Usiamo un transform per traslare il testo lontano dall'asse
                  // In RTL trasliamo verso SINISTRA per allontanarlo dall'asse di destra
                  transform: 'none',
                },
              },
            ]}
            
            xAxis={[
              {
                label: t.labelShapBar,
                reverse: isRtl,
                labelStyle: {
                  // In RTL (asse a destra), trasliamo leggermente l'etichetta verso sinistra 
                  // per compensare visivamente la larghezza della colonna Y (90px)
                  transform: `${isRtl ? 'translateX(30px)' : 'translateX(-30px)'} translateY(10px)`,
                
                },
              },              
            ]}
            
            series={[
              {
                id: 'shap-values',
                // Nascondiamo completamente la label sinistra di default ("Page Views" / "Valore SHAP")
                // perché ce la ricreiamo noi a destra esattamente come la vuoi
                label: '', 
                data: values,
                valueFormatter: (value, context) => {
                  if (value === null) return '';
                  const formattedValue = value.toFixed(4);
                  if (descriptions && context && context.dataIndex !== undefined) {
                    // Creiamo l'intera stringa nella colonna di destra:
                    // 1. Valore SHAP: 0.1113
                    // 2. A capo (\n)
                    // 3. Descrizione: Onde Beta...
                    return `${t.valore}: ${formattedValue}\n\n${descriptions[context.dataIndex]}`;
                  }
                  return formattedValue;
                },
              },
            ]}
            height={350}
            
            margin={{ left: isRtl ? 10 : -10, right: isRtl ? -10: 10, top: 10, bottom: 20 }} 
            grid={{ vertical: true }} 
            hideLegend 
            
            sx={{              
              // 1. ELIMINIAMO IL QUADRATINO COLORATO
              '& .MuiChartsTooltip-markCell': {
                display: 'none !important',
              },

              // 2. ELIMINIAMO LA COLONNA SINISTRA (Quella grigia)
              // L'abbiamo svuotata mettendo label: '', ma ora la cancelliamo proprio
              // così la nostra colonna destra prende tutto lo spazio!
              '& .MuiChartsTooltip-labelCell': {
                display: 'none !important',
              },

              // SE SIAMO IN MODALITà TELEFONO
              // I Tooltip deli grafici a barre rimangono vincolati dentro la box del grafico
              ...(forceMobile && {
                '& .MuiChartsLayerContainer-root': {
                  overflow: 'visible !important',
                },
                '& .MuiChartsWrapper-root': {
                  overflow: 'visible !important',
                },
                '& .MuiChartsTooltip-root': {
                  position: 'absolute !important',
                  zIndex: '9999 !important',
                  transform: isRightHalf ? 'translateX(-110%)' : 'translateX(10px)',
                }
              }),

              // 2. DIMENSIONI DINAMICHE: Si rimpicciolisce solo quando serve!
              '& .MuiChartsTooltip-valueCell': {
                whiteSpace: 'pre-wrap !important', 
                
                // Se siamo nel telefono limite a 160px, altrimenti liberi a 300px
                maxWidth: forceMobile ? '180px !important' : '300px !important', 
                
                // Riduciamo margini e font solo sul telefono per compattarlo
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