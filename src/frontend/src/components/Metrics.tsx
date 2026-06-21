import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StatCard from './StatCard';
import type { StatCardProps } from './StatCard';
import ShapBarChart from './ShapBarChart';
import Topoplot from './Topoplot';

import performanceMetrics from '../data/performance_metrics.json';
import { descrizioniCanali, descrizioniFeatures, descrizioniWindows } from '../data/shapDescriptions';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

// Definiamo le props per il componente unificato
interface MetricsProps {
  userData: any; // Il JSON dell'utente (o quello globale)
  stacked?: boolean; // Opzione per grafici impilati o affiancati (default: false)
}

export default function Metrics({ userData, stacked = false }: MetricsProps) {
  if (!userData) return null;

  const { language } = useSettings();
  const t = translations[language];

  // 1. CAPIAMO SE È IL GLOBALE O UN UTENTE SPECIFICO
  const isGlobal = userData.user_id === 'global' || userData.user_id === 'globale';
  
  let displayName = '';
  if (!isGlobal) {
    const userNumber = userData.user_id.replace('user_', '');
    displayName = `${t.utenteElenco} ${userNumber}`;
  }

  // =====================================================================
  // 2. PREPARAZIONE DATI SHAP (Identica per entrambi)
  // =====================================================================

  // A. Feature
  const topShapFeatures = [...userData.features]
    .sort((a: any, b: any) => b.shap_absolute - a.shap_absolute)
    .slice(0, 10); 

  const shapLabels = topShapFeatures.map(f => f.id);
  const shapValues = topShapFeatures.map(f => f.shap_absolute);
  const shapDescriptions = topShapFeatures.map(f => 
    descrizioniFeatures[f.id]?.[language] || "Descrizione non disponibile"
  );

  // B. Finestre Temporali (Windows)
  const topShapWindows = [...userData.windows]
    .sort((a: any, b: any) => b.shap_absolute - a.shap_absolute); 

  const shapWindowLabels = topShapWindows.map(w => w.id);
  const shapWindowValues = topShapWindows.map(w => w.shap_absolute);
  const shapWindowDescriptions = topShapWindows.map(w => 
    descrizioniWindows[w.id]?.[language] || "Descrizione non disponibile"
  );

  // C. Topoplot
  const topoplotData = userData.channels.map((ch: any) => ({
    id: ch.id,
    shap_left: ch.shap_left,     // Nuovo!
    shap_right: ch.shap_right,   // Nuovo!
    description: descrizioniCanali[ch.id]?.[language] || "Descrizione non disponibile"
  }));

  // =====================================================================
  // 3. PREPARAZIONE DATI PERFORMANCE (StatCards Dinamiche)
  // =====================================================================
  let statCardsData: StatCardProps[] = [];

  if (isGlobal) {
    // --- LOGICA GLOBALE (Con grafici a linea) ---
    const userNames = Object.keys(performanceMetrics.per_user_metrics);
    const f1Scores = userNames.map(user => Number(performanceMetrics.per_user_metrics[user as keyof typeof performanceMetrics.per_user_metrics].f1_score.toFixed(3)));
    const aucScores = userNames.map(user => Number(performanceMetrics.per_user_metrics[user as keyof typeof performanceMetrics.per_user_metrics].auc_score.toFixed(3)));
    
    const { f1_mean, f1_std, auc_mean, auc_std } = performanceMetrics.global_metrics;

    statCardsData = [
      {
        title: t.titolof1 || "F1 Score",
        value: f1_mean.toFixed(3),
        interval: t.titolof1desc || "Andamento Globale",
        trend: f1_mean >= 0.5 ? 'up' : 'down',
        data: f1Scores, // <--- Grafico visibile
        xAxisLabels: userNames,
        chipText: '± ' + f1_std.toFixed(3),
      },
      {
        title: t.titoloAuc || "AUC Score",
        value: auc_mean.toFixed(3),
        interval: t.titoloAucdesc || "Andamento Globale",
        trend: auc_mean >= 0.5 ? 'up' : 'down',
        data: aucScores, // <--- Grafico visibile
        xAxisLabels: userNames,
        chipText: '± ' + auc_std.toFixed(3),
      }
    ];
  } else {
    // --- LOGICA SINGOLO UTENTE (Senza grafici a linea) ---
    const userPerf = performanceMetrics.per_user_metrics[userData.user_id as keyof typeof performanceMetrics.per_user_metrics];
    if (userPerf) {
      statCardsData = [
        {
          title: `F1 Score`,
          value: userPerf.f1_score.toFixed(3),
          interval: t.performance || "Performance",
          trend: userPerf.f1_score >= performanceMetrics.global_metrics.f1_mean ? 'up' : 'down',
          data: [], // <--- Grafico invisibile
          xAxisLabels: [],
          chipText: 'Vs Global: ' + performanceMetrics.global_metrics.f1_mean.toFixed(2),
        },
        {
          title: `AUC Score`,
          value: userPerf.auc_score.toFixed(3),
          interval: t.performance || "Performance",
          trend: userPerf.auc_score >= performanceMetrics.global_metrics.auc_mean ? 'up' : 'down',
          data: [], // <--- Grafico invisibile
          xAxisLabels: [],
          chipText: 'Vs Global: ' + performanceMetrics.global_metrics.auc_mean.toFixed(2),
        }
      ];
    }
  }

  // =====================================================================
  // RENDER DELLA PAGINA
  // =====================================================================
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      
      {/* SEZIONE 1: CARDS */}
      {statCardsData.length > 0 && (
        <>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            {isGlobal ? t.titoloGlobale : `${t.overviewUtente} ${displayName}`}
          </Typography>
          <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
            {statCardsData.map((card, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: stacked ? 6 : 3 }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* SEZIONE 2: EXPLAINABLE AI (SHAP) */}
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 4 }}>
        {isGlobal ? t.explAiGlobale : `${t.explAi} ${displayName}`}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>

        {/* GRAFICO 1: FINESTRE TEMPORALI */}
        <Grid size={{ xs: 12, md: stacked ? 12 : 6 }}>
          <Box sx={{ height: '100%' }}>
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
        <Grid size={{ xs: 12, md: stacked ? 12 : 6 }}>
          <Box sx={{ height: '100%' }}>
            <ShapBarChart 
              title={t.titoloFeat}
              subtitle={t.descrFeat}
              labels={shapLabels}
              values={shapValues}
              descriptions={shapDescriptions}
            />
          </Box>
        </Grid>       
      </Grid>

      {/* SEZIONE 3: TOPOPLOT */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {isGlobal ? t.topoglobale : `${t.topo} ${displayName}`}
      </Typography>
      <Grid container spacing={2} columns={12}>

        {/* TOPOPLOT TASK LEFT */}
        <Grid size={{ xs: 12, md: stacked ? 12 : 6 }}>
            <Topoplot 
              title={`${t.titoloTopoplot} (Left)`}
              subtitle={t.descrTopoplot || "Mappa attivazione per la mano sinistra"}
              channelsData={topoplotData} 
              userId={userData.user_id}
              targetClass="left" // <--- PASSATO COME PROP
            />
        </Grid>

        {/* TOPOPLOT TASK RIGHT */}
        <Grid size={{ xs: 12, md: stacked ? 12 : 6 }}>
            <Topoplot 
              title={`${t.titoloTopoplot} (Right)`}
              subtitle={t.descrTopoplot || "Mappa attivazione per la mano destra"}
              channelsData={topoplotData} 
              userId={userData.user_id}
              targetClass="right" // <--- PASSATO COME PROP
            />
        </Grid>

      </Grid>
    </Box>
  );
}