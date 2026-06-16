import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ModelTrainingRoundedIcon from '@mui/icons-material/ModelTrainingRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import Caschetto from '../assets/caschetto.svg';

export default function Methodology() {
  const { language, forceMobile } = useSettings();
  const t = translations[language];
  const steps = [
    {
      title: t.aboutSubtitle1,
      description: t.aboutContent1,
      icon: <MemoryRoundedIcon color="primary" fontSize="medium" />
    }, 
    {
      title: t.aboutSubtitle2,
      description: t.aboutContent2,
      icon: <QueryStatsRoundedIcon color="primary" fontSize="medium" />
    },
    {
      title: t.aboutSubtitle3,
      description: t.aboutContent3,
      icon: <ModelTrainingRoundedIcon color="primary" fontSize="medium" />
    },
    {
      title: t.aboutSubtitle4,
      description: t.aboutContent4,
      icon: <InsightsRoundedIcon color="primary" fontSize="medium" />
    }
  ];

  return (
    // Il maxWidth ora è "100%" per prendersi tutto lo spazio che il padre gli concede
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', p: { xs: 2, sm: 4 } }}>
      

      {/* 2. SEZIONE CENTRALE: FOTO E TESTO */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: { xs: 4, md: 8 }, // Aumentato il gap per staccare foto e testo
          mb: 8, 
          alignItems: 'center' 
        }}
      >
        {/* Sinistra: Fotografia */}
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%',
            minHeight: '350px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3,
            /*overflow: 'hidden',
            boxShadow: (theme) => 
              theme.palette.mode === 'dark' 
                ? '0 8px 24px rgba(0,0,0,0.4)' 
                : '0 8px 24px rgba(0,0,0,0.1)', */
          }}
        >
          <img 
            src={Caschetto} 
            alt="Setup dell'esperimento EEG" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '350px'}}
          />
        </Box>

        {/* Destra: Testo Descrittivo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
            {t.aboutSubtitle}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, fontSize: '1.05rem' }}>
            {t.aboutContent}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.05rem' }}>
            {t.aboutContentContinua}
          </Typography>
        </Box>
      </Box>

      {/* 3. SEZIONE INFERIORE: I 4 STEP */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: forceMobile ? '1fr' : { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: { xs: 2, md: 3 } // Gap ridotto leggermente per dare più spazio al testo dentro le card
        }}
      >
        {steps.map((step, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              textAlign: 'left', // Forza l'allineamento a sinistra
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '0 8px 16px rgba(0,0,0,0.5)' 
                    : '0 8px 16px rgba(0,0,0,0.08)'
              }
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  mb: 3,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)',
                }}
              >
                {step.icon}
              </Box>
              
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, fontSize: '1.05rem', color: 'text.primary' }}>
                {index + 1}. {step.title}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {step.description}
              </Typography>
              
            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}