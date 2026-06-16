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
                {t.helpTitle}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.helpDesc}
              </Typography>
            </Box>

            {/* SEZIONE 1: FAQ E TUTORIAL */}
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Card variant="outlined" sx={{ mb: 4, maxWidth: 1000, width: '100%', mx: 'auto' }}>
                <CardContent sx={{ p: 0 }}>
                  
                  {/* Domanda 1: Pagine dell'App */}
                  <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DashboardIcon color="primary" />
                        <Typography sx={{ fontWeight: 600 }}>{t.helpDomanda1}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                      {t.helpRisposta1_1}
                      </Typography>
                      <Typography component="div" variant="body2">
                        <ul>
                          <li>
                            <Box sx={{ mb: 1 }}>
                              <strong>{t.helpRisposta1_2_titolo}</strong> {t.helpRisposta1_2_desc}
                            </Box>
                          </li>
                          <li>
                            <Box sx={{ mb: 1 }}>
                              <strong>{t.helpRisposta1_3_titolo}</strong> {t.helpRisposta1_3_desc}
                            </Box>
                          </li>
                          <li>
                            <Box>
                              <strong>{t.helpRisposta1_4_titolo}</strong> {t.helpRisposta1_4_desc}
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
                        <Typography sx={{ fontWeight: 600 }}>{t.helpDomanda2}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {t.helpRisposta2_1}
                      </Typography>
                      <Typography component="div" variant="body2">
                        <ul>
                          <li>
                            <Box sx={{ mb: 1 }}>
                              <strong>{t.helpRisposta2_2_titolo}</strong> {t.helpRisposta2_2_desc}
                            </Box>
                          </li>
                          <li>
                            <Box>
                              <strong>{t.helpRisposta2_3_titolo}</strong> {t.helpRisposta2_3_desc}
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
                        <Typography sx={{ fontWeight: 600 }}>{t.helpDomanda3}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {t.helpRisposta3_1}
                      </Typography>
                      <Typography variant="body2">
                        {t.helpRisposta3_2}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  {/* Domanda 4: Topoplot */}
                  <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PsychologyIcon color="primary" />
                        <Typography sx={{ fontWeight: 600 }}>{t.helpDomanda4}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {t.helpRisposta4}
                      </Typography>
                      <Typography component="div" variant="body2">
                        <ul>
                          <li>
                            <Box sx={{ mb: 1 }}>
                              <strong>{t.helpRisposta4_1_titolo}</strong> {t.helpRisposta4_1_desc}
                            </Box>
                          </li>
                          <li>
                            <Box>
                              <strong>{t.helpRisposta4_2_titolo}</strong> {t.helpRisposta4_2_desc}
                            </Box>
                          </li>
                        </ul>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}