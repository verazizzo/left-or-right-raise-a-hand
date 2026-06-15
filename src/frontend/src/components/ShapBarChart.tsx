import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';

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

  // --- 1. IL SENSORE DEL MOUSE (Tornato alla divisione a metà) ---
  const [isRightHalf, setIsRightHalf] = React.useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    
    setIsRightHalf(x > rect.width / 2);
  };

  const bluePalette = [
    '#082F6A', '#0D47A1', '#1565C0', '#1976D2', '#1E88E5', 
    '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', 
  ];

  // Se ci sono SOLO 3 barre peschiamo il 1°, il 6° e il 10° colore per staccarli bene.
  // Altrimenti prendiamo i colori di fila.
  const chartColors = labels.length === 3 
    ? [bluePalette[0], bluePalette[4], bluePalette[8]] 
    : bluePalette.slice(0, labels.length);

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
              }
            },
          ]}
          
          xAxis={[
            {
              label: t.labelShapBar,
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
          
          margin={{ left: 10, right: 20, top: 10, bottom: 20 }} 
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

            // --- 3. IL MOVIMENTO DINAMICO DEL TOOLTIP ---
            '& .MuiChartsTooltip-root': {
              // Se forceMobile è VERO: scatta a sinistra appena superi la metà
              // Se forceMobile è FALSO (PC): rimane sempre a destra
              marginLeft: forceMobile 
                ? (isRightHalf ? '-170px !important' : '10px !important') 
                : '10px !important',
              
              // ANIMAZIONE RIMOSSA: ora il cambio è brutale e istantaneo
            },

            // 2. DIMENSIONI DINAMICHE: Si rimpicciolisce solo quando serve!
            '& .MuiChartsTooltip-valueCell': {
              whiteSpace: 'pre-wrap !important', 
              
              // Se siamo nel telefono limite a 160px, altrimenti liberi a 300px
              maxWidth: forceMobile ? '160px !important' : '300px !important', 
              
              // Riduciamo margini e font solo sul telefono per compattarlo
              padding: forceMobile ? '6px 8px !important' : '12px !important', 
              fontSize: forceMobile ? '0.70rem !important' : '0.875rem !important',
              
              lineHeight: '1.4 !important', 
              textAlign: 'left !important',
            },
          }}
        />
      </CardContent>
    </Card>
  );
}