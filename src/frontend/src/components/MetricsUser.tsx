import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import HighlightedCard from './HighlightedCard';
import StatCard from './StatCard';
import type { StatCardProps } from './StatCard';
import ShapBarChart from './ShapBarChart';
import Topoplot from './Topoplot';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

// Se vuoi mantenere le performance globali per confrontarle con l'utente,
// puoi importarle qui, oppure passarle come prop.
import performanceMetrics from '../data/performance_metrics.json';

import { descrizioniCanali, descrizioniFeatures, descrizioniWindows } from '../data/shapDescriptions';

// 1. Definiamo le props che questo componente si aspetta di ricevere dal padre
interface UserMetricsProps {
  userData: any; // Il JSON dell'utente selezionato
  stacked?: boolean; // Opzione per grafici impilati o affiancati (default: false)
}

export default function UserMetrics({ userData, stacked = false }: UserMetricsProps) {
  // Se i dati non sono ancora arrivati, non renderizziamo nulla
  if (!userData) return null;

  const { language } = useSettings();
  const t = translations[language];

  // Estraiamo il numero (es. da "user_1" diventa "1")
  const userNumber = userData.user_id.replace('user_', '');
  // Creiamo la stringa pulita combinando la traduzione e il numero (es. "Usuario 1")
  // Se per caso il file è quello globale, mostriamo la scritta "Globale"
  const displayName = `${t.utenteElenco} ${userNumber}`;

  // =====================================================================
  // 2. PREPARAZIONE DATI SHAP (Basati su userData)
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
    shap_absolute: ch.shap_absolute,
    shap_directional: ch.shap_directional,
    description: descrizioniCanali[ch.id]?.[language] || "Descrizione non disponibile"
  }));

  // =====================================================================
  // 3. PREPARAZIONE DATI PERFORMANCE (Specifici per questo utente)
  // =====================================================================
  
  // Estraiamo i dati specifici dell'utente dal file delle performance, se esiste
  const userPerf = performanceMetrics.per_user_metrics[userData.user_id as keyof typeof performanceMetrics.per_user_metrics];
  
  // Creiamo le card: se l'utente ha dei dati specifici mostriamo i suoi, 
  // altrimenti mostriamo un fallback o la media globale
  // Creiamo le card: rimuoviamo 'data' e 'xAxisLabels' in modo che 
  // la StatCard non provi a renderizzare il mini-grafico
  const statCardsData: StatCardProps[] = userPerf ? [
    {
      title: `F1 Score`,
      value: userPerf.f1_score.toFixed(3),
      interval: t.performance,
      trend: userPerf.f1_score >= performanceMetrics.global_metrics.f1_mean ? 'up' : 'down',
      
      // Passiamo array vuoti per far sparire il grafico
      data: [], 
      xAxisLabels: [], 
      
      chipText: 'Vs Global: ' + performanceMetrics.global_metrics.f1_mean.toFixed(2),
    },
    {
      title: `AUC Score`,
      value: userPerf.auc_score.toFixed(3),
      interval: t.performance,
      trend: userPerf.auc_score >= performanceMetrics.global_metrics.auc_mean ? 'up' : 'down',
      
      // Passiamo array vuoti anche qui
      data: [],
      xAxisLabels: [],
      
      chipText: 'Vs Global: ' + performanceMetrics.global_metrics.auc_mean.toFixed(2),
    }
  ] : [];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      
      {/* SEZIONE 1: CARDS DI PERFORMANCE */}
      {statCardsData.length > 0 && (
        <>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            {t.overviewUtente} {displayName}
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
        {t.explAi} {displayName}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>

        {/* GRAFICO 1: FINESTRE TEMPORALI */}
        {/* LA MAGIA È QUI: Se stacked è true, occupa 12 colonne (tutto lo spazio), altrimenti 6 (metà) */}
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
        {t.topo} {displayName}
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: stacked ? 12 : 6 }}>
            <Topoplot 
              title={t.titoloTopoplot}
              subtitle={t.descrTopoplot}
              channelsData={topoplotData}
              userId={userData.user_id}
            />
        </Grid>
      </Grid>
      
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}