// src/data/shapDescriptions.ts

type QuadLangString = { it: string; en: string; es: string; ar: string };

export const descrizioniCanali: Record<string, QuadLangString> = {
    'AF3': { 
        'it': "Canale Antero-Frontale Sinistro. Rileva la pianificazione cognitiva superiore e l'attenzione.", 
        'en': "Left Antero-Frontal Channel. Detects higher cognitive planning and attention.",
        'es': "Canal Antero-Frontal Izquierdo. Detecta la planificación cognitiva superior y la atención.",
        'ar': "القناة الجبهية الأمامية اليسرى. تكتشف التخطيط الإدراكي العالي والانتباه."
    },
    'F7': { 
        'it': "Canale Frontale Inferiore Sinistro. Posizionato vicino all'area di Broca, utile per task motori ed espressivi.", 
        'en': "Left Inferior Frontal Channel. Located near Broca's area, useful for motor and expressive tasks.",
        'es': "Canal Frontal Inferior Izquierdo. Situado cerca del área de Broca, útil para tareas motoras y expresivas.",
        'ar': "القناة الجبهية السفلية اليسرى. تقع بالقرب من منطقة بروكا، مفيدة للمهام الحركية والتعبيرية."
    },
    'F3': { 
        'it': "Canale Frontale Sinistro. Fondamentale per la corteccia premotoria e la pianificazione dei movimenti intenzionali.", 
        'en': "Left Frontal Channel. Crucial for the premotor cortex and intentional movement planning.",
        'es': "Canal Frontal Izquierdo. Fundamental para la corteza premotora y la planificación de movimientos intencionales.",
        'ar': "القناة الجبهية اليسرى. حاسمة للقشرة الحركية الأولية وتخطيط الحركة المتعمدة."
    },
    'FC5': { 
        'it': "Canale Fronto-Centrale Sinistro. Localizzato sopra la corteccia motoria del braccio destro (lateralizzazione motoria).", 
        'en': "Left Fronto-Central Channel. Located over the motor cortex of the right arm (motor lateralization).",
        'es': "Canal Fronto-Central Izquierdo. Localizado sobre la corteza motora del brazo derecho (lateralización motora).",
        'ar': "القناة الجبهية المركزية اليسرى. تقع فوق القشرة الحركية للذراع الأيمن (الجانبية الحركية)."
    },
    'T7': { 
        'it': "Canale Temporale Sinistro. Rileva l'elaborazione uditiva, la memoria e l'integrazione sensomotoria laterale.", 
        'en': "Left Temporal Channel. Detects auditory processing, memory, and lateral sensorimotor integration.",
        'es': "Canal Temporal Izquierdo. Detecta el procesamiento auditivo, la memoria y la integración sensoriomotora lateral.",
        'ar': "القناة الصدغية اليسرى. تكتشف المعالجة السمعية، الذاكرة، والتكامل الحسي الحركي الجانبي."
    },
    'P7': { 
        'it': "Canale Parietale Sinistro. Coinvolto nell'orientamento spaziale e nella coordinazione visuo-motoria.", 
        'en': "Left Parietal Channel. Involved in spatial orientation and visuo-motor coordination.",
        'es': "Canal Parietal Izquierdo. Involucrado en la orientación espacial y la coordinación visomotora.",
        'ar': "القناة الجدارية اليسرى. تشارك في التوجيه المكاني والتنسيق البصري الحركي."
    },
    'O1': { 
        'it': "Canale Occipitale Sinistro. Area visiva primaria, utile per monitorare lo stato di riposo ad occhi aperti/chiusi.", 
        'en': "Left Occipital Channel. Primary visual area, useful for monitoring rest state with open/closed eyes.",
        'es': "Canal Occipital Izquierdo. Área visual primaria, útil para monitorear el estado de reposo con ojos abiertos/cerrados.",
        'ar': "القناة القذالية اليسرى. منطقة بصرية أولية، مفيدة لمراقبة حالة الراحة مع فتح/إغلاق العينين."
    },
    'O2': { 
        'it': "Canale Occipitale Destro. Speculare a O1, cattura i ritmi Alfa visivi della corteccia posteriore.", 
        'en': "Right Occipital Channel. Specular to O1, captures visual Alpha rhythms of the posterior cortex.",
        'es': "Canal Occipital Derecho. Especular a O1, captura los ritmos Alfa visuales de la corteza posterior.",
        'ar': "القناة القذالية اليمنى. مرآة لـ O1، تلتقط إيقاعات ألفا البصرية للقشرة الخلفية."
    },
    'P8': { 
        'it': "Canale Parietale Destro. Coinvolto nell'attenzione spaziale e nei processi di elaborazione della forma corporea.", 
        'en': "Right Parietal Channel. Involved in spatial attention and body shape processing.",
        'es': "Canal Parietal Derecho. Involucrado en la atención espacial y en los procesos de elaboración de la forma corporal.",
        'ar': "القناة الجدارية اليمنى. تشارك في الانتباه المكاني ومعالجة شكل الجسم."
    },
    'T8': { 
        'it': "Canale Temporale Destro. Elaborazione delle informazioni verbali latenti e della coordinazione sensoriale destra.", 
        'en': "Right Temporal Channel. Processing of latent verbal information and right sensory coordination.",
        'es': "Canal Temporal Derecho. Procesamiento de información verbal latente y coordinación sensorial derecha.",
        'ar': "القناة الصدغية اليمنى. معالجة المعلومات اللفظية الكامنة والتنسيق الحسي الأيمن."
    },
    'FC6': { 
        'it': "Canale Fronto-Centrale Destro. Posizionato sopra la corteccia motoria responsabile del braccio sinistro.", 
        'en': "Right Fronto-Central Channel. Located over the motor cortex responsible for the left arm.",
        'es': "Canal Fronto-Central Derecho. Posicionado sobre la corteza motora responsable del brazo izquierdo.",
        'ar': "القناة الجبهية المركزية اليمنى. تقع فوق القشرة الحركية المسؤولة عن الذراع الأيسر."
    },
    'F4': { 
        'it': "Canale Frontale Destro. Speculare a F3, monitora la corteccia motoria integrativa destra.", 
        'en': "Right Frontal Channel. Specular to F3, monitors the right integrative motor cortex.",
        'es': "Canal Frontal Derecho. Especular a F3, monitorea la corteza motora integrativa derecha.",
        'ar': "القناة الجبهية اليمنى. مرآة لـ F3، تراقب القشرة الحركية التكاملية اليمنى."
    },
    'F8': { 
        'it': "Canale Frontale Inferiore Destro. Coinvolto nel controllo degli impulsi e nella regolazione dei task attentivi.", 
        'en': "Right Inferior Frontal Channel. Involved in impulse control and regulation of attentional tasks.",
        'es': "Canal Frontal Inferior Derecho. Involucrado en el control de impulsos y en la regulación de tareas de atención.",
        'ar': "القناة الجبهية السفلية اليمنى. تشارك في التحكم في الاندفاع وتنظيم مهام الانتباه."
    },
    'AF4': { 
        'it': "Canale Antero-Frontale Destro. Speculare ad AF3, associato al carico cognitivo e decisionale superiore.", 
        'en': "Right Antero-Frontal Channel. Specular to AF3, associated with higher cognitive and decision-making load.",
        'es': "Canal Antero-Front-Frontal Derecho. Especular a AF3, asociado a la carga cognitiva y de toma de decisiones superior.",
        'ar': "القناة الجبهية الأمامية اليمنى. مرآة لـ AF3، مرتبطة بالحمل المعرفي العالي واتخاذ القرار."
    }
};

export const descrizioniFeatures: Record<string, QuadLangString> = {
    'Alpha': { 
        'it': "Onde Alpha (8-12 Hz). Ritmo legato al rilassamento vigile.", 
        'en': "Alpha Waves (8-12 Hz). Rhythm linked to wakeful relaxation.",
        'es': "Ondas Alfa (8-12 Hz). Ritmo ligado a la relajación despierta.",
        'ar': "موجات ألفا (8-12 هرتز). إيقاع مرتبط بالاسترخاء اليقظ."
    },
    'Beta1': { 
        'it': "Onde Beta Basse (13-16 Hz). Ritmo legato all'attenzione focalizzata.", 
        'en': "Low Beta Waves (13-16 Hz). Rhythm linked to focused attention.",
        'es': "Ondas Beta Bajas (13-16 Hz). Ritmo ligado a la atención focalizada.",
        'ar': "موجات بيتا المنخفضة (13-16 هرتز). إيقاع مرتبط بالانتباه المركز."
    },
    'Beta2': { 
        'it': "Onde Beta Medie (16-20 Hz). Associate alla concentrazione attiva.", 
        'en': "Medium Beta Waves (16-20 Hz). Associated with active concentration.",
        'es': "Ondas Beta Medias (16-20 Hz). Asociadas a la concentración activa.",
        'ar': "موجات بيتا المتوسطة (16-20 هرتز). مرتبطة بالتركيز النشط."
    },
    'Beta3': { 
        'it': "Onde Beta Alte (20-30 Hz). Segnale di forte attivazione corticale.", 
        'en': "High Beta Waves (20-30 Hz). Signal of strong cortical activation.",
        'es': "Ondas Beta Altas (20-30 Hz). Señal de fuerte activación cortical.",
        'ar': "موجات بيتا العالية (20-30 هرتز). إشارة إلى تنشيط قشري قوي."
    },
    'HjorthMob': { 
        'it': "Mobilità di Hjorth. Parametro che stima la frequenza media del segnale EEG.", 
        'en': "Hjorth Mobility. Parameter estimating mean frequency of EEG signal.",
        'es': "Movilidad de Hjorth. Parámetro que estima la frecuencia media de la señal EEG.",
        'ar': "مقياس هجورث للحركية. معامل يقدر متوسط تردد إشارة تخطيط كهربية الدماغ."
    },
    'HjorthComp': { 
        'it': "Complessità di Hjorth. Misura quanto il segnale EEG assomiglia a un'onda sinusoidale.", 
        'en': "Hjorth Complexity. Measures how closely EEG signal resembles a sine wave.",
        'es': "Complejidad de Hjorth. Mide cuánto se asemeja la señal EEG a una onda sinusoidal.",
        'ar': "مقياس هجورث للتعقيد. يقيس مدى تشابه إشارة الدماغ مع الموجة الجيبية."
    },
    'SpecEn': { 
        'it': "Spectral Entropy. Misura l'uniformità della distribuzione di potenza spettrale.", 
        'en': "Spectral Entropy. Measures uniformity of spectral power distribution.",
        'es': "Entropía Espectral. Mide la uniformidad de la distribución de potencia espectral.",
        'ar': "الإنتروبيا الطيفية. تقيس مدى انتظام توزيع القدرة الطيفية."
    },
    'PermEn': { 
        'it': "Permutation Entropy. Analizza la complessità delle serie temporali EEG.", 
        'en': "Permutation Entropy. Analyzes complexity of EEG time series.",
        'es': "Entropía de Permutación. Analiza la complejidad de las series temporales EEG.",
        'ar': "إنتروبيا التبديل. تحلل تعقيد السلاسل الزمنية لإشارات الدماغ."
    },
    'SampEn': { 
        'it': "Sample Entropy. Indica la prevedibilità del segnale cerebrale.", 
        'en': "Sample Entropy. Indicates brain signal predictability.",
        'es': "Entropía Muestral. Indica la previsibilidad de la señal cerebral.",
        'ar': "إنتروبيا العينات. تشير إلى قابلية التنبؤ بإشارة الدماغ."
    },
    'ApEn': { 
        'it': "Approximate Entropy. Quantifica la regolarità delle oscillazioni neuronali.", 
        'en': "Approximate Entropy. Quantifies regularity of neuronal oscillations.",
        'es': "Entropía Aproximada. Cuantifica la regularidad de las oscilaciones neuronales.",
        'ar': "الإنتروبيا التقريبية. تحدد مدى انتظام التذبذبات العصبية."
    },
    'SVDEn': { 
        'it': "SVD Entropy. Misura la complessità tramite scomposizione a valori singolari.", 
        'en': "SVD Entropy. Measures complexity via singular value decomposition.",
        'es': "Entropía SVD. Mide la complejidad mediante descomposición en valores singulares.",
        'ar': "إنتروبيا SVD. تقيس التعقيد عن طريق تحليل القيم المفردة."
    },
    'LZV': { 
        'it': "Complessità di Lempel-Ziv. Misura il tasso di nuovi pattern nel segnale.", 
        'en': "Lempel-Ziv Complexity. Measures rate of new patterns in the signal.",
        'es': "Complejidad de Lempel-Ziv. Mide la tasa de nuevos patrones en la señal.",
        'ar': "تعقيد ليمبل-زيف. يقيس معدل توليد أنماط جديدة في الإشارة."
    },
    'DFA': { 
        'it': "Detrended Fluctuation Analysis. Quantifica correlazioni a lungo termine.", 
        'en': "Detrended Fluctuation Analysis. Quantifies long-term correlations.",
        'es': "Análisis de Fluctuación Sin Tendencia (DFA). Cuantifica correlaciones a largo plazo.",
        'ar': "تحليل التقلبات المزال اتجاهها (DFA). يحدد الارتباطات طويلة المدى."
    },
    'KFD': { 
        'it': "Katz Fractal Dimension. Calcola la dimensione frattale del tracciato.", 
        'en': "Katz Fractal Dimension. Calculates fractal dimension of the trace.",
        'es': "Dimensión Fractal de Katz. Calcula la dimensión fractal del trazado.",
        'ar': "بعد كاتز الكسوري. يحسب البعد الكسوري للمسار."
    },
    'HFD': { 
        'it': "Higuchi Fractal Dimension. Stima la complessità strutturale non lineare.", 
        'en': "Higuchi Fractal Dimension. Estimates nonlinear structural complexity.",
        'es': "Dimensión Fractal de Higuchi. Estima la complejidad estructural no lineal.",
        'ar': "بعد هيغوشي الكسوري. يقدر التعقيد الهيكلي غير الخطي."
    },
    'PFD': { 
        'it': "Petrosian Fractal Dimension. Stima la dimensione frattale tramite cambi di segno.", 
        'en': "Petrosian Fractal Dimension. Estimates fractal dimension via sign changes.",
        'es': "Dimensión Fractal de Petrosian. Estima la dimensión fractal mediante cambios de signo.",
        'ar': "بعد بتروسيان الكسوري. يقدر البعد الكسوري من خلال تغيرات الإشارة."
    }
};

export const descrizioniWindows: Record<string, QuadLangString> = {
    '0-5s': { 
        it: "Finestra Iniziale (0-5s). Transizione dal riposo all'immaginazione.", 
        en: "Initial Window (0-5s). Transition from rest to motor imagery.",
        es: "Ventana Inicial (0-5s). Transición del reposo a la imaginería motora.",
        ar: "النافذة الأولية (0-5 ثوانٍ). الانتقال من الراحة إلى التخيل الحركي."
    },
    '6-10s': { 
        it: "Finestra Centrale (6-10s). Stabilità del task.", 
        en: "Central Window (6-10s). Task stability.",
        es: "Ventana Central (6-10s). Estabilidad de la tarea.",
        ar: "النافذة المركزية (6-10 ثوانٍ). استقرار المهمة."
    },
    '11-15s': { 
        it: "Finestra Finale (11-15s). Coda del task e rilassamento.", 
        en: "Final Window (11-15s). Task tail and relaxation.",
        es: "Ventana Final (11-15s). Cola de la tarea y relajación.",
        ar: "النافذة النهائية (11-15 ثانية). نهاية المهمة والاسترخاء."
    }
};