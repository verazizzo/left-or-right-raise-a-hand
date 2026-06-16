import * as React from 'react'; // Aggiunto React per usare useState
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { lineClasses } from '@mui/x-charts/LineChart';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
  xAxisLabels?: string[];
  chipText?: string;
};

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  xAxisLabels,
  chipText,
}: StatCardProps) {
  const theme = useTheme();

  const { language, forceMobile } = useSettings();
  const t = translations[language];

  const [isHovered, setIsHovered] = React.useState(false);
  const [isRightHalf, setIsRightHalf] = React.useState(false);

  // --- 1. IL SENSORE ORA GUARDA IL TELEFONO, NON LA SCHEDA ---
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // Andiamo a cercare il finto telefono (il div #root)
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      const rootRect = rootElement.getBoundingClientRect();
      // Calcoliamo la coordinata X del mouse partendo dal bordo sinistro del telefono
      const xRelativeToPhone = event.clientX - rootRect.left; 
      
      // Controlliamo se abbiamo superato la metà del TELEFONO (non della card!)
      setIsRightHalf(xRelativeToPhone > rootRect.width / 2);
    }
  };

  const fallbackDays = getDaysInMonth(4, 2024);
  const chartLabels = xAxisLabels || fallbackDays.slice(0, data.length);

  // Se l'etichetta inizia per "user_", prendiamo solo il numero e aggiungiamo la traduzione
  const formattedChartLabels = chartLabels.map((label) => {
    if (typeof label === 'string' && label.startsWith('user_')) {
      const userNumber = label.replace('user_', '');
      return `${t.utenteElenco} ${userNumber}`;
    }
    return label;
  });

  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendValues = { up: '+25%', down: '-25%', neutral: '+5%' };

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}>

      {/* --- 3. IL "CSS CECCHINO" ---
          Questo blocco viene iniettato nella pagina SOLO quando hai il mouse
          sopra QUESTA specifica StatCard ed è attiva la modalità mobile.
          Ignora i blocchi di MUI e costringe il tooltip a obbedire. */}
      {isHovered && forceMobile && (
        <style>
          {`
            .MuiChartsTooltip-root {
              /* Scatto istantaneo a sinistra di 110px o a destra di 10px */
              margin-left: ${isRightHalf ? '-110px' : '10px'} !important;
            }
            .MuiChartsTooltip-valueCell {
              white-space: pre-wrap !important;
              max-width: 120px !important;
              padding: 4px 6px !important;
              font-size: 0.70rem !important;
              line-height: 1.2 !important;
            }
          `}
        </style>
      )}


      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              <Chip size="small" color="default" label={chipText || trendValues[trend]} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: 'band',
                data: formattedChartLabels, // Use the correct property 'data' for xAxis
              }}
              sx={{
                [`& .${lineClasses.area}`]: {
                  fill: `url(#area-gradient-${value})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
