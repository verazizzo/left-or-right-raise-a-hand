import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// Assicurati che l'importazione abbia ?url alla fine se richiesto dal tuo bundler!
import Testa from '../assets/solo_testa.png';
import Cervello from '../assets/solo_cervello2.png';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

export type TopoplotProps = {
  title: string;
  subtitle?: string;
  // Aggiornato con le nuove chiavi del JSON
  channelsData: { id: string; shap_left: number; shap_right: number; description?: string }[];
  userId?: string;
  // NUOVA PROP: Indica al componente quale lato leggere
  targetClass: 'left' | 'right'; 
};

export default function Topoplot({ title, subtitle, channelsData, userId, targetClass }: TopoplotProps) {
  const { language, forceMobile } = useSettings();
  const t = translations[language];

  const datiSicuri = channelsData || [];
  const uniqueId = userId || Math.random().toString(36).substring(7);

  const coordinateCanali: { [key: string]: { cx: number; cy: number } } = {
    'AF3': { cx: 215, cy: 115 },  'AF4': { cx: 285, cy: 80 },
    'F7':  { cx: 145, cy: 165 },  'F8':  { cx: 355, cy: 165 },
    'F3':  { cx: 210, cy: 185 },  'F4':  { cx: 290, cy: 185 },
    'FC5': { cx: 160, cy: 235 },  'FC6': { cx: 340, cy: 235 },
    'T7':  { cx: 130, cy: 275 },  'T8':  { cx: 370, cy: 275 },
    'P7':  { cx: 165, cy: 355 },  'P8':  { cx: 335, cy: 355 },
    'O1':  { cx: 215, cy: 405 },  'O2':  { cx: 285, cy: 405 },
    'C3':  { cx: 185, cy: 255 },  'Cz':  { cx: 250, cy: 255 },  'C4':  { cx: 315, cy: 255 },
  };

  // IL SEGRETO DELLA COMPARABILITÀ: Troviamo il massimo assoluto tra TUTTI I VALORI (sia left che right)
  // così la scala dei colori sarà identica per entrambi i grafici.
  const tuttiIValori = datiSicuri.flatMap((c: any) => [Math.abs(c.shap_left || 0), Math.abs(c.shap_right || 0)]);
  const maxVal = Math.max(...tuttiIValori, 0.01);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        <Stack sx={{ mb: 2 }}>
          {/* TITOLO DINAMICO */}
          <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
            {targetClass === 'left' ? t.titoloTopoplotLeft || 'Task: Left' : t.titoloTopoplotRight || 'Task: Right'}
          </Typography>
          
          {/* SOTTOTITOLO DINAMICO */}
          <Typography 
            variant="caption" 
            sx={{ color: 'text.secondary', fontSize: '0.85rem', display: 'block', lineHeight: 1.5 }}
          >
            {/* 1. TITOLO PRINCIPALE IN GRASSETTO */}
            <strong>
              {targetClass === 'left' ? t.descrTopoplotLeft : t.descrTopoplotRight}
            </strong>
            
            <br />
            
            {/* 2. DESCRIZIONE TECNICA PIÙ PICCOLA E GRIGIA */}
            <span style={{ fontSize: '0.9em', color: 'gray' }}>
              {targetClass === 'left' ? t.descrTopoplotLeft2 : t.descrTopoplotRight2}
            </span>
          </Typography>
        </Stack>
        
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          
          <Box 
            sx={{ 
              position: 'relative', width: '100%', maxWidth: 380, aspectRatio: '1 / 1',
              backgroundColor: 'background.default', borderRadius: 2, border: 1,
              borderColor: 'divider', overflow: 'hidden'
            }}
          >
            
            {/* LIVELLO 0: CERVELLO INTERNO */}
            <Box
              component="img"
              src={Cervello}
              alt="Tessuto Cerebrale"
              sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'contain', opacity: 1.0, pointerEvents: 'none', zIndex: 1,
                filter: 'grayscale(100%) contrast(1.2)'
              }}
            />

            {/* LIVELLO 1: HEATMAPS MASCHERATE */}
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
                WebkitMaskImage: `url("${Cervello}")`,
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                maskImage: `url("${Cervello}")`,
                maskSize: 'contain',
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
              }}
            >
              <Box component="svg" viewBox="0 0 500 500" sx={{ width: '100%', height: '100%' }}>
                <defs>
                   {datiSicuri.map((ch: any) => {
                    // LEGGIAMO IL VALORE GIUSTO IN BASE ALLA PROP targetClass
                    const shapVal = targetClass === 'left' ? (ch.shap_left || 0) : (ch.shap_right || 0);
                    const absVal = Math.abs(shapVal);
                    
                    const ratio = Math.min(absVal / maxVal, 1);
                    const lightness = 0.7 - ratio;

                    // Colori: Rosso per positivo (Destra), Blu per negativo (Sinistra)
                    const baseR = shapVal >= 0 ? 178 : 33;
                    const baseG = shapVal >= 0 ? 24 : 102;
                    const baseB = shapVal >= 0 ? 43 : 172;

                    const r = Math.floor(baseR + (255 - baseR) * lightness);
                    const g = Math.floor(baseG + (255 - baseG) * lightness);
                    const b = Math.floor(baseB + (255 - baseB) * lightness);

                    return (
                        <radialGradient key={`grad-${ch.id}-${uniqueId}`} id={`grad-${ch.id}-${uniqueId}`}>
                        <stop offset="0%" stopColor={`rgb(${r}, ${g}, ${b})`} />
                        <stop offset="100%" stopColor={`rgba(${r}, ${g}, ${b}, 0)`} />
                        </radialGradient>
                    );
                    })}
                </defs>

                    <g filter="url(#mne-blur)">
                    {datiSicuri.map((ch: any) => {
                        const coords = coordinateCanali[ch.id];
                        if (!coords) return null;
                        
                        // LEGGIAMO DI NUOVO IL VALORE IN BASE AL TASK
                        const shapVal = targetClass === 'left' ? (ch.shap_left || 0) : (ch.shap_right || 0);
                        const absVal = Math.abs(shapVal); 
                        
                        const radius = 40 + (absVal / maxVal) * 80; 
                        const opacity = 0.2 + (absVal / maxVal) * 0.9;

                        return (
                        <circle
                            key={`heatmap-${ch.id}`}
                            cx={coords.cx}
                            cy={coords.cy}
                            r={radius}
                            fill={`url(#grad-${ch.id}-${uniqueId})`}
                            fillOpacity={opacity}
                        />
                        );
                    })}
                    </g>
              </Box>
            </Box>

            {/* LIVELLO 2: TESTA ESTERNA */}
            <Box
              component="img"
              src={Testa}
              alt="Contorno Testa"
              sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'contain', opacity: 1.0, pointerEvents: 'none', zIndex: 0
              }}
            />

            {/* LIVELLO 3: PUNTINI E TESTI TOOLTIP */}
            <Box
              component="svg"
              viewBox="0 0 500 500"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}
            >
              <g id={`nodi-e-testi-${uniqueId}`}>
                {datiSicuri.map((ch: any) => {
                  const coords = coordinateCanali[ch.id];
                  if (!coords) return null;
                  
                  // Mostriamo l'effettivo valore direzionale con il segno nel tooltip
                  const displayValue = targetClass === 'left' ? ch.shap_left : ch.shap_right;

                  return (
                    <Tooltip
                      key={`node-${ch.id}`}
                      placement="top"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'background.default',
                            color: 'text.primary',
                            boxShadow: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0,
                            borderRadius: 1.5,
                            maxWidth: forceMobile ? 160 : 300,
                          }
                        },
                        arrow: {
                          sx: {
                            color: 'background.paper',
                            "&::before": { border: '1px solid', borderColor: 'divider' }
                          }
                        }
                      }}
                      title={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box 
                            sx={{ 
                              px: forceMobile ? 1 : 1.5, 
                              py: forceMobile ? 0.4 : 0.6,
                              borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', 
                              borderTopLeftRadius: '6px', borderTopRightRadius: '6px' 
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: forceMobile ? '0.65rem' : 400 }}>
                              {ch.id}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ p: forceMobile ? 1 : 1.5 }}>
                            <Typography variant="body2" sx={{mb: forceMobile ? 0.5 : 1, fontWeight: 400, fontSize: forceMobile ? '0.8rem' : '0.875rem' }}>
                              {t.valore}: {displayValue?.toFixed(4)}
                            </Typography>
                            {ch.description && (
                                <Typography variant="body2" sx={{ fontSize: forceMobile ? '0.8rem' : '0.875rem', lineHeight: 1.2 }}>
                                  {ch.description}
                                </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    >
                      <g style={{ cursor: 'default', outline: 'none' }}>
                        <circle cx={coords.cx} cy={coords.cy} r={forceMobile ? "35" : "25"} fill="transparent" />
                        <circle cx={coords.cx} cy={coords.cy} r={forceMobile ? "9" : "6"} fill="#0f172a" stroke="#ffffff" strokeWidth={forceMobile ? "3" : "2"} />
                        
                        <text
                          x={coords.cx}
                          y={coords.cy - (forceMobile ? 17 : 14)} 
                          textAnchor="middle"
                          fill="#000000" 
                          fontWeight="900"
                          fontSize={forceMobile ? "18px" : "14px"}
                          fontFamily="sans-serif"
                          style={{ userSelect: 'none', pointerEvents: 'none' }} 
                        >
                          {ch.id}
                        </text>
                      </g>
                    </Tooltip>
                  );
                })}
              </g>
            </Box>
          </Box>

          {/* NUOVA BARRA INFERIORE ORIZZONTALE (LEGENDA SHAP) */}
          <Box 
            sx={{ 
              display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 380, mt: 4 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                {t.labelsotto || 'Sinistra'} (-{maxVal.toFixed(3)})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                {t.labelsopra || 'Destra'} (+{maxVal.toFixed(3)})
              </Typography>
            </Box>

            <Box 
              sx={{ 
                width: '100%', height: 24, 
                // Gradiente cambiato da verticale (to bottom) a orizzontale (to right)
                background: 'linear-gradient(to right, rgb(33, 102, 172) 0%, #ffffff 50%, rgb(178, 24, 43) 100%)',
                border: '1px solid', borderColor: 'divider', borderRadius: 1
              }} 
            />
          </Box>

        </Box>
      </CardContent>
    </Card>
  );
}