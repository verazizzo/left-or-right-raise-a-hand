// src/data/shapDescriptions.ts

// Aggiorniamo il tipo per supportare le tre lingue
type TriLangString = { it: string; en: string; es: string };

export const descrizioniCanali: Record<string, TriLangString> = {
    'AF3': { 
        'it': "Canale Antero-Frontale Sinistro. Rileva la pianificazione cognitiva superiore e l'attenzione.", 
        'en': "Left Antero-Frontal Channel. Detects higher cognitive planning and attention.",
        'es': "Canal Antero-Frontal Izquierdo. Detecta la planificación cognitiva superior y la atención."
    },
    'F7': { 
        'it': "Canale Frontale Inferiore Sinistro. Posizionato vicino all'area di Broca, utile per task motori ed espressivi.", 
        'en': "Left Inferior Frontal Channel. Located near Broca's area, useful for motor and expressive tasks.",
        'es': "Canal Frontal Inferior Izquierdo. Situado cerca del área de Broca, útil para tareas motoras y expresivas."
    },
    'F3': { 
        'it': "Canale Frontale Sinistro. Fondamentale per la corteccia premotoria e la pianificazione dei movimenti intenzionali.", 
        'en': "Left Frontal Channel. Crucial for the premotor cortex and intentional movement planning.",
        'es': "Canal Frontal Izquierdo. Fundamental para la corteza premotora y la planificación de movimientos intencionales."
    },
    'FC5': { 
        'it': "Canale Fronto-Centrale Sinistro. Localizzato sopra la corteccia motoria del braccio destro (lateralizzazione motoria).", 
        'en': "Left Fronto-Central Channel. Located over the motor cortex of the right arm (motor lateralization).",
        'es': "Canal Fronto-Central Izquierdo. Localizado sobre la corteza motora del brazo derecho (lateralización motora)."
    },
    'T7': { 
        'it': "Canale Temporale Sinistro. Rileva l'elaborazione uditiva, la memoria e l'integrazione sensomotoria laterale.", 
        'en': "Left Temporal Channel. Detects auditory processing, memory, and lateral sensorimotor integration.",
        'es': "Canal Temporal Izquierdo. Detecta el procesamiento auditivo, la memoria y la integración sensoriomotora lateral."
    },
    'P7': { 
        'it': "Canale Parietale Sinistro. Coinvolto nell'orientamento spaziale e nella coordinazione visuo-motoria.", 
        'en': "Left Parietal Channel. Involved in spatial orientation and visuo-motor coordination.",
        'es': "Canal Parietal Izquierdo. Involucrado en la orientación espacial y la coordinación visomotora."
    },
    'O1': { 
        'it': "Canale Occipitale Sinistro. Area visiva primaria, utile per monitorare lo stato di riposo ad occhi aperti/chiusi.", 
        'en': "Left Occipital Channel. Primary visual area, useful for monitoring rest state with open/closed eyes.",
        'es': "Canal Occipital Izquierdo. Área visual primaria, útil para monitorear el estado de reposo con ojos abiertos/cerrados."
    },
    'O2': { 
        'it': "Canale Occipitale Destro. Speculare a O1, cattura i ritmi Alfa visivi della corteccia posteriore.", 
        'en': "Right Occipital Channel. Specular to O1, captures visual Alpha rhythms of the posterior cortex.",
        'es': "Canal Occipital Derecho. Especular a O1, captura los ritmos Alfa visuales de la corteza posterior."
    },
    'P8': { 
        'it': "Canale Parietale Destro. Coinvolto nell'attenzione spaziale e nei processi di elaborazione della forma corporea.", 
        'en': "Right Parietal Channel. Involved in spatial attention and body shape processing.",
        'es': "Canal Parietal Derecho. Involucrado en la atención espacial y en los procesos de elaboración de la forma corporal."
    },
    'T8': { 
        'it': "Canale Temporale Destro. Elaborazione delle informazioni verbali latenti e della coordinazione sensoriale destra.", 
        'en': "Right Temporal Channel. Processing of latent verbal information and right sensory coordination.",
        'es': "Canal Temporal Derecho. Procesamiento de información verbal latente y coordinación sensorial derecha."
    },
    'FC6': { 
        'it': "Canale Fronto-Centrale Destro. Posizionato sopra la corteccia motoria responsabile del braccio sinistro.", 
        'en': "Right Fronto-Central Channel. Located over the motor cortex responsible for the left arm.",
        'es': "Canal Fronto-Central Derecho. Posicionado sobre la corteza motora responsable del brazo izquierdo."
    },
    'F4': { 
        'it': "Canale Frontale Destro. Speculare a F3, monitora la corteccia motoria integrativa destra.", 
        'en': "Right Frontal Channel. Specular to F3, monitors the right integrative motor cortex.",
        'es': "Canal Frontal Derecho. Especular a F3, monitorea la corteza motora integrativa derecha."
    },
    'F8': { 
        'it': "Canale Frontale Inferiore Destro. Coinvolto nel controllo degli impulsi e nella regolazione dei task attentivi.", 
        'en': "Right Inferior Frontal Channel. Involved in impulse control and regulation of attentional tasks.",
        'es': "Canal Frontal Inferior Derecho. Involucrado en el control de impulsos y en la regulación de tareas de atención."
    },
    'AF4': { 
        'it': "Canale Antero-Frontale Destro. Speculare ad AF3, associato al carico cognitivo e decisionale superiore.", 
        'en': "Right Antero-Frontal Channel. Specular to AF3, associated with higher cognitive and decision-making load.",
        'es': "Canal Antero-Frontal Derecho. Especular a AF3, asociado a la carga cognitiva y de toma de decisiones superior."
    }
};

export const descrizioniFeatures: Record<string, TriLangString> = {
    'Alpha': { 
        'it': "Onde Alpha (8-12 Hz). Ritmo legato al rilassamento vigile. Una sua riduzione indica attivazione corticale.", 
        'en': "Alpha Waves (8-12 Hz). Rhythm linked to wakeful relaxation. Its reduction indicates cortical activation.",
        'es': "Ondas Alfa (8-12 Hz). Ritmo ligado a la relajación despierta. Su reducción indica activación cortical."
    },
    'Beta1': { 
        'it': "Onde Beta Basse (13-16 Hz). Ritmo legato all'attenzione focalizzata e ai primi stadi di attivazione motoria.", 
        'en': "Low Beta Waves (13-16 Hz). Rhythm linked to focused attention and early stages of motor activation.",
        'es': "Ondas Beta Bajas (13-16 Hz). Ritmo ligado a la atención focalizada y a las primeras etapas de activación motora."
    },
    'Beta2': { 
        'it': "Onde Beta Medie (16-20 Hz). Fortemente associate alla concentrazione attiva e al controllo motorio in corso.", 
        'en': "Medium Beta Waves (16-20 Hz). Strongly associated with active concentration and ongoing motor control.",
        'es': "Ondas Beta Medias (16-20 Hz). Fuertemente asociadas a la concentración activa y al control motor en curso."
    },
    'Beta3': { 
        'it': "Onde Beta Alte (20-30 Hz). Segnale di forte attivazione corticale, tensione muscolare o elaborazione motoria complessa.", 
        'en': "High Beta Waves (20-30 Hz). Signal of strong cortical activation, muscle tension, or complex motor processing.",
        'es': "Ondas Beta Altas (20-30 Hz). Señal de fuerte activación cortical, tensión muscular o procesamiento motor complejo."
    },
    'HjorthMob': { 
        'it': "Mobilità di Hjorth. Parametro statistico che stima la frequenza media del segnale EEG nel tempo.", 
        'en': "Hjorth Mobility. Statistical parameter estimating the mean frequency of the EEG signal over time.",
        'es': "Movilidad de Hjorth. Parámetro estadístico que estima la frecuencia media de la señal EEG en el tiempo."
    },
    'HjorthComp': { 
        'it': "Complessità di Hjorth. Misura quanto il segnale EEG assomiglia a un'onda sinusoidale pura.", 
        'en': "Hjorth Complexity. Measures how closely the EEG signal resembles a pure sine wave.",
        'es': "Complejidad de Hjorth. Mide cuánto se asemeja la señal EEG a una onda sinusoidal pura."
    },
    'SpecEn': { 
        'it': "Spectral Entropy. Misura l'uniformità della distribuzione di potenza spettrale delle frequenze cerebrali.", 
        'en': "Spectral Entropy. Measures the uniformity of the spectral power distribution of brain frequencies.",
        'es': "Entropía Espectral. Mide la uniformidad de la distribución de potencia espectral de las frecuencias cerebrales."
    },
    'PermEn': { 
        'it': "Permutation Entropy. Analizza la complessià e la regolarità delle serie temporali dell'EEG.", 
        'en': "Permutation Entropy. Analyzes the complexity and regularity of EEG time series.",
        'es': "Entropía de Permutación. Analiza la complejidad y regularidad de las series temporales del EEG."
    },
    'SampEn': { 
        'it': "Sample Entropy. Indica la prevedibilità del segnale cerebrale.", 
        'en': "Sample Entropy. Indicates brain signal predictability.",
        'es': "Entropía Muestral. Indica la previsibilidad de la señal cerebral."
    },
    'ApEn': { 
        'it': "Approximate Entropy. Quantifica la regolarità e la fluttuazione delle oscillazioni neuronali nel tempo.", 
        'en': "Approximate Entropy. Quantifies the regularity and fluctuation of neuronal oscillations over time.",
        'es': "Entropía Aproximada. Cuantifica la regularidad y fluctuación de las oscilaciones neuronales a lo largo del tiempo."
    },
    'SVDEn': { 
        'it': "SVD Entropy. Misura la complessità del segnale calcolando la scomposizione a valori singolari.", 
        'en': "SVD Entropy. Measures signal complexity by calculating singular value decomposition.",
        'es': "Entropía SVD. Mide la complejidad de la señal calculando la descomposición en valores singulares."
    },
    'LZV': { 
        'it': "Complessità di Lempel-Ziv. Misura il tasso di generazione di nuovi pattern nel segnale.", 
        'en': "Lempel-Ziv Complexity. Measures the rate of generation of new patterns in the signal.",
        'es': "Complejidad de Lempel-Ziv. Mide la tasa de generación de nuevos patrones en la señal."
    },
    'DFA': { 
        'it': "Detrended Fluctuation Analysis. Quantifica le correlazioni a lungo termine e le proprietà frattali.", 
        'en': "Detrended Fluctuation Analysis. Quantifies long-term correlations and fractal properties.",
        'es': "Análisis de Fluctuación Sin Tendencia (DFA). Cuantifica las correlaciones a largo plazo y las propiedades fractales."
    },
    'KFD': { 
        'it': "Katz Fractal Dimension. Algoritmo geometrico che calcola la dimensione frattale del tracciato.", 
        'en': "Katz Fractal Dimension. Geometric algorithm calculating the fractal dimension of the trace.",
        'es': "Dimensión Fractal de Katz. Algoritmo geométrico que calcula la dimensión fractal del trazado."
    },
    'HFD': { 
        'it': "Higuchi Fractal Dimension. Stima la complessità strutturale non lineare.", 
        'en': "Higuchi Fractal Dimension. Estimates nonlinear structural complexity.",
        'es': "Dimensión Fractal de Higuchi. Estima la complejidad estructural no lineal."
    },
    'PFD': { 
        'it': "Petrosian Fractal Dimension. Stima la dimensione frattale del segnale tramite i cambi di segno.", 
        'en': "Petrosian Fractal Dimension. Estimates fractal dimension via sign changes in the time series.",
        'es': "Dimensión Fractal de Petrosian. Estima la dimensión fractal de la señal mediante los cambios de signo en la serie temporal."
    }
};

export const descrizioniWindows: Record<string, TriLangString> = {
    '0-5s': { 
        it: "Finestra Iniziale (0-5s). Transizione dal riposo all'immaginazione.", 
        en: "Initial Window (0-5s). Transition from rest to motor imagery.",
        es: "Ventana Inicial (0-5s). Transición del reposo a la imaginería motora."
    },
    '6-10s': { 
        it: "Finestra Centrale (6-10s). Stabilità del task.", 
        en: "Central Window (6-10s). Task stability.",
        es: "Ventana Central (6-10s). Estabilidad de la tarea."
    },
    '11-15s': { 
        it: "Finestra Finale (11-15s). Coda del task e rilassamento.", 
        en: "Final Window (11-15s). Task tail and relaxation.",
        es: "Ventana Final (11-15s). Cola de la tarea y relajación."
    }
};