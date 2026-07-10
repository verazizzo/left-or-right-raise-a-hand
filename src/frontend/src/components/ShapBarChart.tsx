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

  const [featureLimit, setFeatureLimit] = React.useState<number>(10);

  const displayedLabels = featureLimit === -1 ? labels : labels.slice(0, featureLimit);
  const displayedValues = featureLimit === -1 ? values : values.slice(0, featureLimit);
  const displayedDescriptions = descriptions 
    ? (featureLimit === -1 ? descriptions : descriptions.slice(0, featureLimit)) 
    : undefined;

  const [isRightHalf, setIsRightHalf] = React.useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    const percentage = x / rect.width;
    setIsRightHalf(percentage > 0.5);
  };

  const featurePalette = [
    '#0072B2', 
    '#D55E00',
    '#009E73',
    '#E69F00', 
    '#CC79A7',
    '#56B4E9', 
    '#F0E442',
    '#332288',
    '#88CCEE', 
    '#44AA99',
    '#117733', 
    '#999933', 
    '#DDCC77',
    '#CC6677',
    '#882255', 
    '#AA4499', 
  ];

  const windowPalette = [
    '#004488', 
    '#DDAA33', 
    '#BB5566',
  ];

  const chartColors = paletteType === 'windows'
    ? windowPalette.slice(0, displayedLabels.length) 
    : displayedLabels.map((_, index) => featurePalette[index % featurePalette.length]); 

    
  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }} onMouseMove={handleMouseMove}>
      <CardContent>
        
        <Stack 
          direction="row"  
          spacing={2} 
          sx={{ mb: 2, justifyContent:"space-between", alignItems:"flex-start" }}
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