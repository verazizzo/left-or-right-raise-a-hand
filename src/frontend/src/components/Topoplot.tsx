import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// Assicurati che l'importazione abbia ?url alla fine!
import Testa from '../assets/solo_testa.png';
import Cervello from '../assets/solo_cervello2.png';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';


export type TopoplotProps = {
  title: string;
  subtitle?: string;
  channelsData: { id: string; shap_absolute: number; shap_directional?: number; description: string }[];
};

export default function Topoplot({ title, subtitle, channelsData, userId }: any) {
  const { language, forceMobile } = useSettings();
  const t = translations[language];

  const datiSicuri = channelsData || [];
  const uniqueId = userId || Math.random().toString(36).substring(7);

  const coordinateCanali: { [key: string]: { cx: number; cy: number } } = {
    'AF3': { cx: 215, cy: 115 },  'AF4': { cx: 285, cy: 115 },
    'F7':  { cx: 145, cy: 165 },  'F8':  { cx: 355, cy: 165 },
    'F3':  { cx: 210, cy: 185 },  'F4':  { cx: 290, cy: 185 },
    'FC5': { cx: 160, cy: 235 },  'FC6': { cx: 340, cy: 235 },
    'T7':  { cx: 130, cy: 275 },  'T8':  { cx: 370, cy: 275 },
    'P7':  { cx: 165, cy: 355 },  'P8':  { cx: 335, cy: 355 },
    'O1':  { cx: 215, cy: 405 },  'O2':  { cx: 285, cy: 405 },
    'C3':  { cx: 185, cy: 255 },  'Cz':  { cx: 250, cy: 255 },  'C4':  { cx: 315, cy: 255 },
  };

  // Calcoliamo il massimo basandoci sullo shap_absolute per scalare correttamente le sfumature
  const valoriAssoluti = datiSicuri.map(c => c.shap_absolute || 0);
  const maxVal = Math.max(...valoriAssoluti, 0.01);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
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
        
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          
          {/* CONTAINER PRINCIPALE (Senza padding interno per non disallineare le maschere) */}
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

            {/* LIVELLO 1: HEATMAPS MASCHERATE AL MILLIMETRO */}
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
                // LA VERA MAGIA: Usiamo l'SVG del cervello come "stampino" invisibile!
                // Tutto ciò che fuoriesce dalla forma del cervello viene tagliato via.
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
                    const shapDir = ch.shap_directional || 0;
                    const absVal = Math.abs(ch.shap_absolute);
                    
                    // 1. Calcoliamo un valore di "chiarezza" (0 = scuro, 1 = chiaro)
                    // Più il valore è alto, più la 'chiarezza' deve essere bassa (vicino a 0)
                    const ratio = Math.min(absVal / maxVal, 1);
                    const lightness = 0.7 - ratio; // 1 (chiaro) quando ratio è 0, 0 (scuro) quando ratio è 1

                    // 2. Definiamo i colori base
                    // Rosso scuro: 178, 24, 43 / Blu scuro: 33, 102, 172
                    const baseR = shapDir >= 0 ? 178 : 33;
                    const baseG = shapDir >= 0 ? 24 : 102;
                    const baseB = shapDir >= 0 ? 43 : 172;

                    // 3. Interpoliamo linearmente verso il bianco (255) in base alla "chiarezza"
                    // Quando 'lightness' è alta (poco importante), il colore si sposta verso il bianco
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
                        
                        // 1. Definisci il raggio basato su SHAP_ABSOLUTE (importanza totale)
                        // Il raggio ora varia tra 40 (minimo) e 120 (massimo per i più importanti)
                        const val = Math.abs(ch.shap_absolute); 
                        const radius = 40 + (val / maxVal) * 80; 

                        // 2. Definisci l'opacità basata su SHAP_ABSOLUTE
                        // I canali poco importanti (basso SHAP) svaniranno quasi del tutto
                        const opacity = 0.2 + (val / maxVal) * 0.9;

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

            {/* LIVELLO 3: PUNTINI E TESTI - FIX DARK MODE AUTOMATICO */}
            <Box
              component="svg"
              viewBox="0 0 500 500"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}
            >
              <g id={`nodi-e-testi-${uniqueId}`}>
                {datiSicuri.map((ch: any) => {
                  const coords = coordinateCanali[ch.id];
                  if (!coords) return null;
                  
                  const displayValue = ch.shap_absolute !== undefined ? ch.shap_absolute : ch.shap_directional;

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
                            // 'divider' è il bordo standard di MUI che si schiarisce o scurisce col tema
                            borderColor: 'divider',
                            p: 0,
                            borderRadius: 1.5,
                            // 2. LA TUA INTUIZIONE: Limitiamo la larghezza dinamicamente
                            maxWidth: forceMobile ? 160 : 300,
                          }
                        },
                        arrow: {
                          sx: {
                            color: 'background.paper',
                            "&::before": { 
                              border: '1px solid', 
                              borderColor: 'divider' 
                            }
                          }
                        }
                      }}
                      title={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          {/* Intestazione del Tooltip (Usa 'background.default' che è il grigio di sfondo dei pannelli) */}
                          <Box 
                            sx={{ 
                              px: forceMobile ? 1 : 1.5, 
                              py: forceMobile ? 0.4 : 0.6,
                              borderBottom: '1px solid', 
                              borderColor: 'divider', 
                              bgcolor: 'background.paper', 
                              borderTopLeftRadius: '6px', 
                              borderTopRightRadius: '6px' 
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: forceMobile ? '0.65rem' : 400 }}>
                              {ch.id}
                            </Typography>
                          </Box>
                          
                          {/* Corpo del Tooltip */}
                          <Box sx={{ p: forceMobile ? 1 : 1.5 }}>
                            <Typography variant="body2" sx={{mb: forceMobile ? 0.5 : 1, fontWeight: 400, fontSize: forceMobile ? '0.65rem' : '0.875rem' }}>
                              {t.valore}: {displayValue?.toFixed(4)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: forceMobile ? '0.65rem' : '0.875rem', lineHeight: 1.2 }}>
                              {ch.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {/* Trigger del tooltip con hitbox espansa */}
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

          {/* =======================================================
              NUOVA BARRA LATERALE (LEGENDA SHAP) - LAYOUT AGGIORNATO
          ======================================================= */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', // Mette scritte e barra in verticale
              alignItems: 'center', // Centra la barra rispetto alle scritte
              height: '100%', 
              maxHeight: 380, // Stessa altezza massima del cervello
              p: 1,
              ml: 5
            }}
          >
            
            {/* ETICHETTA DESCRITTIVA SOPRA LA BARRA */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 600, 
                mb: 0, // Spazio sotto la scritta
                textAlign: 'center',
                letterSpacing: 0.5
              }}
            >
              {t.labelsopra}
            </Typography>

            {/* CONTENITORE INTERNO (ORIZZONTALE) PER BARRA E NUMERI */}
            {/* flexGrow: 1 permette alla barra di occupare lo spazio centrale */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, width: '100%', justifyContent: 'center' }}>
                
                {/* 1. Sfumatura Colori (Rosso -> Bianco -> Blu) - BARRA ACCORCIATA */}
                <Box 
                sx={{ 
                    width: 24, 
                    // Altezza ridotta per lasciare spazio alle scritte sopra e sotto
                    height: '95%', 
                    background: 'linear-gradient(to bottom, rgb(178, 24, 43) 0%, #ffffff 50%, rgb(33, 102, 172) 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                }} 
                />
                
                {/* 2. Valori Numerici - ALLINEATI CON L'ALTEZZA DELLA BARRA */}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '95%', ml: 1.5, py: 0.5 }}>
                
                {/* TOP: Positivo */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    +{maxVal.toFixed(3)}
                </Typography>

                {/* MIDDLE: Zero */}
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    
                </Typography>

                {/* BOTTOM: Negativo */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    -{maxVal.toFixed(3)}
                </Typography>

                </Box>
            </Box>

            {/* ETICHETTA DESCRITTIVA SOTTO LA BARRA */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 600, 
                mt: 0, // Spazio sopra la scritta
                textAlign: 'center',
                letterSpacing: 0.5
              }}
            >
              {t.labelsotto}
            </Typography>

          </Box>




        </Box>
      </CardContent>
    </Card>
  );
}