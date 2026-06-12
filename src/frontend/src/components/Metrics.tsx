import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import StatCard from './StatCard';
import type { StatCardProps } from './StatCard';
import ShapBarChart from './ShapBarChart';
import Topoplot from './Topoplot';

import performanceMetrics from '../data/performance_metrics.json';
import shapGlobale from '../data/shap_GLOBALE.json';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import { descrizioniCanali, descrizioniFeatures, descrizioniWindows } from '../data/shapDescriptions';

export default function Metrics() {
  // 1. Inizializziamo Lingua e Dizionario
  const { language } = useSettings();
  const t = translations[language];

  // =====================================================================
  // 2. PREPARAZIONE DEI DATI PER LE CARDS (Performance Globali)
  // =====================================================================
  const userNames = Object.keys(performanceMetrics.per_user_metrics);
  const numeroUtenti = userNames.length;

  const f1Scores = userNames.map(user => 
    Number(performanceMetrics.per_user_metrics[user as keyof typeof performanceMetrics.per_user_metrics].f1_score.toFixed(3))
  );
  const aucScores = userNames.map(user => 
    Number(performanceMetrics.per_user_metrics[user as keyof typeof performanceMetrics.per_user_metrics].auc_score.toFixed(3))
  );

  const f1Mean = performanceMetrics.global_metrics.f1_mean;
  const f1Std = performanceMetrics.global_metrics.f1_std;
  const aucMean = performanceMetrics.global_metrics.auc_mean;
  const aucStd = performanceMetrics.global_metrics.auc_std;

  // Costruiamo l'array delle Card integrando i testi tradotti
  const statCardsData: StatCardProps[] = [
    {
      title: t.titolof1,
      value: f1Mean.toFixed(3),
      interval: t.titolof1desc,
      trend: f1Mean >= 0.5 ? 'up' : 'down',
      data: f1Scores,
      xAxisLabels: userNames,
      chipText: '± ' + (f1Std.toFixed(3)),
    },
    {
      title: t.titoloAuc,
      value: aucMean.toFixed(3),
      interval: t.titoloAucdesc,
      trend: aucMean >= 0.5 ? 'up' : 'down',
      data: aucScores,
      xAxisLabels: userNames,
      chipText: '± ' + (aucStd.toFixed(3)),
    }
  ];

  // =====================================================================
  // 3. PREPARAZIONE DATI SHAP (La Magia per il Bar Chart)
  // =====================================================================

  // A. Feature (Prendiamo le prime 10 dal Globale)
  const topShapFeatures = [...shapGlobale.features]
    .sort((a: any, b: any) => b.shap_absolute - a.shap_absolute)
    .slice(0, 10); 

  const shapLabels = topShapFeatures.map(f => f.id);
  const shapValues = topShapFeatures.map(f => f.shap_absolute);
  const shapDescriptions = topShapFeatures.map(f => 
    descrizioniFeatures[f.id]?.[language] || "Descrizione non disponibile"
  );

  // B. Finestre Temporali (Windows)
  const topShapWindows = [...shapGlobale.windows]
    .sort((a: any, b: any) => b.shap_absolute - a.shap_absolute); 

  const shapWindowLabels = topShapWindows.map(w => w.id);
  const shapWindowValues = topShapWindows.map(w => w.shap_absolute);
  const shapWindowDescriptions = topShapWindows.map(w => 
    descrizioniWindows[w.id]?.[language] || "Descrizione non disponibile"
  );

  // C. Topoplot
  const topoplotData = shapGlobale.channels.map((ch: any) => ({
    id: ch.id,
    shap_absolute: ch.shap_absolute,
    shap_directional: ch.shap_directional,
    description: descrizioniCanali[ch.id]?.[language] || "Descrizione non disponibile"
  }));


  // =====================================================================
  // RENDER DELLA PAGINA
  // =====================================================================
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      
      {/* SEZIONE 1: CARDS */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t.titoloGlobale || 'Overview'}
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {statCardsData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}

      </Grid>

      {/* SEZIONE 2: EXPLAINABLE AI (SHAP) */}
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 4 }}>
        {t.explAiGlobale}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>

        {/* GRAFICO 1: FINESTRE TEMPORALI */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{height: '100%' }}>
            <ShapBarChart 
              title={t.titoloFinTemp}
              subtitle={t.descrFinTemp}
              labels={shapWindowLabels}
              values={shapWindowValues}
              descriptions={shapWindowDescriptions}
            />
          </Box>
        </Grid>

        {/* GRAFICO 2: FEATURE */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ height: '100%' }}>
            <ShapBarChart 
              title={t.titoloFeat}
              subtitle={t.descrFeat }
              labels={shapLabels}
              values={shapValues}
              descriptions={shapDescriptions}
            />
          </Box>
        </Grid>       
      </Grid>

      {/* SEZIONE 3: TOPOPLOT */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t.topoglobale}
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 6 }}>
            <Topoplot 
              title={t.titoloTopoplot}
              subtitle={t.descrTopoplot}
              channelsData={topoplotData} 
              userId="globale" // <-- Aggiunto un ID fittizio per evitare conflitti SVG!
            />
        </Grid>
      </Grid>
      
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}