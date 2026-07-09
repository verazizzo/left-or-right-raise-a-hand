import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import Tooltip from '@mui/material/Tooltip';


export type TopoplotProps = {
  userId: string;
  isReal: boolean; // Serve per costruire il percorso del file (real vs imm)
  targetClass: 'left' | 'right'; // Serve per distinguere tra Left e Right
  channelsData: any[];
};

export default function Topoplot({ userId, isReal, targetClass, channelsData }: TopoplotProps) {
  const { language, forceMobile } = useSettings();
  const t = translations[language];

  const uniqueId = userId || Math.random().toString(36).substring(7);

  const datiSicuri = channelsData || [];

  const coordinateCanali: { [key: string]: { cx: number; cy: number } } = {
    'AF3': { cx: 195, cy: 60 },  'AF4': { cx: 305, cy: 60 },
    'F7':  { cx: 125, cy: 100 },  'F8':  { cx: 375, cy: 100 },
    'F3':  { cx: 175, cy: 105 },  'F4':  { cx: 330, cy: 105 },
    'FC5': { cx: 130, cy: 155 },  'FC6': { cx: 375, cy: 155 },
    'T7':  { cx: 105, cy: 210 },  'T8':  { cx: 390, cy: 210 },
    'P7':  { cx: 130, cy: 300 },  'P8':  { cx: 365, cy: 300 },
    'O1':  { cx: 200, cy: 360 },  'O2':  { cx: 295, cy: 360 },
    'C3':  { cx: 175, cy: 255 },  'Cz':  { cx: 250, cy: 255 },  'C4':  { cx: 315, cy: 255 },
  };

  // Utilizziamo un import dinamico (import.meta.glob è perfetto per Vite)
  // Questo carica tutte le immagini della cartella e le mette in un oggetto
  const images = import.meta.glob('./topoplot/*.png', { eager: true, import: 'default' });

  const taskPath = isReal ? 'real' : 'imm';
  // Costruisci il nome del file come lo hai salvato
  const fileName = `./topoplot/topoplot_${userId}_${targetClass === 'left' ? 'Left' : 'Right'}.png`;

  // Recupera l'immagine dall'oggetto importato
  const imageSrc = images[fileName];

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        <Stack sx={{ mb: 2 }}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
            {targetClass === 'left' ? t.titoloTopoplotLeft : t.titoloTopoplotRight}
          </Typography>
          
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem', display: 'block', lineHeight: 1.5 }}>
            <strong>
              {targetClass === 'left' ? t.descrTopoplotLeft : t.descrTopoplotRight}
            </strong>
            <br />
            <span style={{ fontSize: '0.9em', color: 'gray' }}>
              {targetClass === 'left' ? t.descrTopoplotLeft2 : t.descrTopoplotRight2}
            </span>
          </Typography>
        </Stack>


        {/* NUOVO CONTENITORE BIANCO CON BORDI ARROTONDATI */}
        <Box 
          sx={{ 
            bgcolor: '#ffffff',     // Sfondo forzatamente bianco (ignora il tema dark)
            borderRadius: '16px',   // Bordi ben arrotondati
            p: 2,                   // Padding interno (spazio tra il bordo bianco e il cervello)
            mx: 'auto',             // Centra il blocco orizzontalmente
            width: '100%', 
            maxWidth: 450,          // Leggermente più largo per includere il padding
            boxShadow: 3            // (Opzionale) Aggiunge una leggera ombra per staccarlo dallo sfondo scuro
          }}
        >

          <Box sx={{ 
            position: 'relative', // FONDAMENTALE: definisce il sistema di coordinate
            width: '100%', 
            maxWidth: 400, 
            aspectRatio: '1/1',
            margin: '0 auto',
            // Se la lingua è araba, specchiamo l'intero contenitore
            transform: language === 'ar' ? 'scaleX(-1)' : 'none' 
          }}>
            
            {/* LIVELLO 1: Immagine */}
            <Box 
              component="img"
              src={imageSrc as string}
              alt={`Topoplot ${targetClass}`}
              onError={(e: any) => { e.target.src = '/placeholder-image.png'; }} // Opzionale: gestione errore caricamento
              sx={{ 
                position: 'absolute',
                width: '100%', 
                maxWidth: 400, 
                height: 'auto',
                display: 'block' ,
                zIndex: 1 // Livello base
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
                        <circle cx={coords.cx} cy={coords.cy} r={forceMobile ? "25" : "25"} fill="transparent" />
                        <circle cx={coords.cx} cy={coords.cy} r={forceMobile ? "7" : "7"} fill="#0f172a" stroke="#ffffff" strokeWidth={forceMobile ? "3" : "2"} />
                        
                        <text
                          x={coords.cx}
                          y={coords.cy - (forceMobile ? 14 : 14)} 
                          textAnchor="middle"
                          // Se arabo, ri-specchiamo il testo per renderlo leggibile
                          transform={language === 'ar' ? `scale(-1, 1) translate(${-2 * coords.cx}, 0)` : 'none'}
                          fill="#000000" 
                          fontWeight="900"
                          fontSize={forceMobile ? "16px" : "16px"}
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

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>

          {/* LABEL PER LE ESTREMITÀ DELLA BARRA PRESENTE NELL'IMMAGINE */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: 400, // Deve coincidere con il maxWidth dell'immagine
                mt: 0.5,      // Regola questo valore per avvicinare/allontanare le scritte dalla barra
                px: 1.5         // Padding per far rientrare le scritte rispetto ai bordi dell'immagine
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgb(33, 102, 172)' }}>
                {t.labelsotto}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgb(178, 24, 43)' }}>
                {t.labelsopra}
              </Typography>
            </Box>
          </Box>

        </Box> {/* FINE DEL CONTENITORE BIANCO */}


      </CardContent>
    </Card>
  );
}