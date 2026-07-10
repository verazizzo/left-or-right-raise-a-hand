# 🧠 CortX - Spiegabilità AI per Motor Imagery​

**CortX** è una web application progettata per i neuroscienziati, sviluppata per visualizzare e analizzare i dati derivanti da tracciati EEG (Elettroencefalogramma). L'obiettivo principale del sistema è prevedere, tramite un modello di Machine Learning, se un paziente ha immaginato di alzare il braccio destro o il braccio sinistro, fornendo al contempo spiegazioni chiare sulle decisioni prese dall'Intelligenza Artificiale.

🔗 **Live Demo:** [Esplora CortX su Render](https://cortx-frontend.onrender.com)

---

## 🎯 Panoramica del Progetto

Il cuore analitico di CortX si basa su un modello predittivo **SVM (Support Vector Machine)**. Per garantire la robustezza e l'affidabilità del modello, la fase di validazione è stata condotta utilizzando l'approccio **LOGO (Leave One Group Out)**. 

Per rendere il modello interpretabile ("scatola bianca") e supportare il lavoro dei neuroscienziati, CortX integra metodologie di **Explainable AI (XAI)** tramite **SHAP**. Questo permette agli utenti di comprendere esattamente il *perché* il modello ha effettuato una specifica previsione, evidenziando l'impatto delle singole feature:
*   Finestre temporali
*   Feature entropiche
*   Canali del caschetto EEG

---

## ✨ Funzionalità Principali

### 🔐 Autenticazione e Sicurezza
*   **Registrazione e Login:** Accesso sicuro con validazione lato client e server.
*   **Recupero Password:** Flusso sicuro per il ripristino delle credenziali dimenticate senza esporre vulnerabilità di User Enumeration.
*   **Gestione Profilo:** Modifica dei dati anagrafici, aggiornamento della password (con verifica di quella attuale) ed eliminazione definitiva dell'account.

### 📊 Visualizzazione Dati & XAI
*   **Dashboard SHAP:** Visualizzazione interattiva dei grafici SHAP per analizzare l'impatto delle feature.
*   **Analisi Individuale vs Popolazione:** Possibilità di esplorare i dati del singolo paziente o di visualizzare le tendenze dell'intera popolazione studiata.
*   **Sistema di Confronto:** Sezione dedicata per confrontare direttamente le performance e i grafici tra due pazienti diversi o tra un singolo paziente e il resto della popolazione.

### ⚙️ Personalizzazione dell'Esperienza Utente (UX/UI)
*   **Multilingua:** Supporto completo per l'internazionalizzazione (Italiano, Inglese, Spagnolo, Arabo).
*   **Temi Visivi:** Switch integrato tra modalità *Light* e *Dark*.
*   **Accessibilità:** Regolazione dinamica delle dimensioni del testo.
*   **Visualizzazione Flessibile:** Switch per forzare la vista "Mobile" anche su schermi desktop, utile in fase di analisi rapida.

---

## 🛠️ Stack Tecnologico

Il progetto è costruito su un'architettura moderna a tre livelli:

*   **Frontend:** React / Vite, interamente stilizzato tramite Material-UI (MUI) per una UI reattiva e accessibile.
*   **Backend:** NestJS, un framework Node.js progressivo per costruire applicazioni lato server efficienti e scalabili.
*   **Database & Auth:** Supabase, utilizzato per l'autenticazione sicura (JWT) e come database PostgreSQL per i profili utente.
*   **Machine Learning:** Python (SVM, SHAP) - *i cui risultati sono serviti alla piattaforma.*

---

## 🤝 Supporto e Aiuto
All'interno della web app è presente una sezione **Aiuto** dedicata, progettata per guidare i neuroscienziati nella comprensione dei grafici SHAP e nell'utilizzo di tutte le funzionalità della dashboard.

---
*Progetto accademico sviluppato per l'esame del corso di Human-Machine Interaction & Data Visualization.*

