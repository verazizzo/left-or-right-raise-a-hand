import React from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Icone per rendere l'interfaccia più intuitiva
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Importiamo i componenti classici del layout
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';


export default function Help(props: { disableCustomTheme?: boolean }) {
  const { language } = useSettings();
  const t = translations[language];


  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 }}}>
            <Header />

            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Centro di Supporto e Tutorial
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Guida all'interpretazione dei dati EEG per la classificazione dell'Immaginazione Motoria (Motor Imagery).
              </Typography>
            </Box>

            {/* SEZIONE 1: FAQ E TUTORIAL */}
            <Card variant="outlined" sx={{ mb: 4 }}>
<CardContent sx={{ p: 0 }}>
                
                {/* Domanda 1: Pagine dell'App */}
                <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DashboardIcon color="primary" />
                      <Typography sx={{ fontWeight: 600 }}>Cosa fare nelle pagine Popolazione, Paziente e Confronto?</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      La dashboard è divisa in tre sezioni di analisi principali, per offrirti una visione dal macro al micro:
                    </Typography>
                    <Typography component="div" variant="body2">
                      <ul>
                        <li>
                          <Box sx={{ mb: 1 }}>
                            <strong>Popolazione:</strong> Questa è la visione globale. Qui puoi analizzare l'andamento e le performance generali dell'algoritmo calcolate come media su <em>tutti i pazienti</em> del dataset. È ideale per valutare la stabilità generale del modello.
                          </Box>
                        </li>
                        <li>
                          <Box sx={{ mb: 1 }}>
                            <strong>Paziente:</strong> Questa è la visione individuale. Permette di selezionare un singolo utente e analizzarne nel dettaglio le performance. I dati mostrati qui sono calcolati analizzando tutte le epoche (le varie finestre temporali di registrazione) relative solo a quel paziente specifico.
                          </Box>
                        </li>
                        <li>
                          <Box>
                            <strong>Confronto:</strong> Questa è la visione analitica incrociata. Ti permette di affiancare due pazienti diversi (o due sessioni diverse) per comparare direttamente la loro attività cerebrale e capire le differenze nei loro dati SHAP e nelle performance.
                          </Box>
                        </li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Domanda 2: Precision e Recall */}
                <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AssessmentIcon color="primary" />
                      <Typography sx={{ fontWeight: 600 }}>Come si leggono i dati di Precision e Recall?</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Le metriche di Precision (Precisione) e Recall (Sensibilità) indicano quanto l'algoritmo sia stato bravo a classificare correttamente il movimento immaginato. La loro lettura dipende dalla pagina in cui ti trovi:
                    </Typography>
                    <Typography component="div" variant="body2">
                      <ul>
                        <li>
                          <Box sx={{ mb: 1 }}>
                            <strong>Nella pagina Paziente:</strong> I valori che vedi sono la media calcolata tra <em>tutte le epoche</em> (finestre temporali) registrate per quel singolo paziente. Ti dice quanto il modello è affidabile su di lui.
                          </Box>
                        </li>
                        <li>
                          <Box>
                            <strong>Nella pagina Popolazione:</strong> I valori rappresentano la media calcolata su <em>tutti i pazienti</em> e sono visibili nel grafico interattivo. Ti permettono di capire l'affidabilità generale del tuo sistema.
                          </Box>
                        </li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Domanda 3: Grafici a barre SHAP */}
                <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InsightsIcon color="primary" />
                      <Typography sx={{ fontWeight: 600 }}>Come leggere i valori SHAP dei grafici a barre?</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      I grafici a barre SHAP mostrano l'importanza di ciascun sensore EEG nell'aiutare il modello a prendere una decisione.
                    </Typography>
                    <Typography variant="body2">
                      La lunghezza della barra rappresenta il "peso" o l'impatto di quel canale. I canali posizionati in alto nel grafico (con le barre più lunghe) sono quelli che hanno fornito l'informazione più determinante per distinguere se il paziente stava immaginando il braccio destro o sinistro.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Domanda 4: Topoplot */}
                <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PsychologyIcon color="primary" />
                      <Typography sx={{ fontWeight: 600 }}>Come si leggono i Topoplot e le classi predette?</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      L'obiettivo primario dell'algoritmo è capire se la persona sta immaginando di alzare il <strong>Braccio Destro</strong> o il <strong>Braccio Sinistro</strong> (Motor Imagery). Il Topoplot ti aiuta a visualizzare su quali aree del cervello si basa questa decisione.
                    </Typography>
                    <Typography component="div" variant="body2">
                      <ul>
                        <li>
                          <Box sx={{ mb: 1 }}>
                            <strong>I Colori (Le Classi):</strong> Il colore (es. Rosso o Blu) indica in quale direzione il sensore sta spingendo la predizione, basandosi sul segno positivo o negativo del valore SHAP. Il rosso punta a una classe (es. Braccio Destro), il blu all'altra (es. Braccio Sinistro).
                          </Box>
                        </li>
                        <li>
                          <Box>
                            <strong>L'Intensità e la Dimensione:</strong> L'intensità della macchia di colore e la grandezza del cerchio disegnato sul canale indicano l'importanza assoluta di quel sensore. Più il colore è marcato (o il raggio è ampio), maggiore è l'influenza matematica che quella precisa zona del cervello ha avuto sul risultato finale dell'algoritmo.
                          </Box>
                        </li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>

              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            {/* SEZIONE 2: SUPPORTO TECNICO */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Hai ancora bisogno di assistenza?
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }}>
                  <SupportAgentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                    Contatta l'Amministratore
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Se hai riscontrato un bug critico, problemi di accesso ai dati o hai bisogno di aggiungere nuovi pazienti al database.
                  </Typography>
                  <Button variant="contained" color="primary">
                    Apri un Ticket
                  </Button>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%', p: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', mb: 2 }}>
                    Informazioni di Sistema
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Versione Dashboard:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>v1.4.2</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Stato Database:</Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>Connesso</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Task Analizzato:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Motor Imagery (Destro/Sinistro)</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}