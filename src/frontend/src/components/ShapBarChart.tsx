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
  subtitle?: React.ReactNode;
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

  // 1. IL SENSORE DEL MOUSE
  const [isRightHalf, setIsRightHalf] = React.useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    
    const percentage = x / rect.width;
    

    setIsRightHalf(percentage > 0.5);
  };

// Palette "Colorblind-Safe" (basata su Okabe-Ito e Paul Tol)

  const accessiblePalette = [
    '#0072B2', 
    '#D55E00', 
    '#009E73', 
    '#E69F00',
    '#CC79A7',
    '#56B4E9',
    '#F0E442', 
    '#44AA99',
    '#332288', 
    '#999999', 
  ];

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
              '& .MuiChartsTooltip-markCell': {
                display: 'none !important',
              },

              '& .MuiChartsTooltip-labelCell': {
                display: 'none !important',
              },

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