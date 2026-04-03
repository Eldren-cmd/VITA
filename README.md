 VITA — Emergency First Aid PWA

Your pocket-sized emergency guide. Works offline. Always ready.

[![Live App](https://img.shields.io/badge/Live%20App-vita--sage.vercel.app-C9A84C?style=flat-square&logo=vercel&logoColor=white)](https://vita-sage.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://vita-sage.vercel.app)

---

## What is VITA?

VITA is an offline-first Progressive Web App that delivers step-by-step emergency first aid guidance — no internet connection required. In a medical emergency, seconds matter. VITA is designed to work when your network doesn't.

Install it once, and it's there whenever you need it — whether you have signal or not.

---

## Core Features

### 🧠 VITAEngine — Guided Emergency Response
Step-by-step first aid instructions for common emergencies. Clear, calm, and actionable — built for high-stress situations where you can't afford confusion.

### 🚦 TriageEngine — Severity Scoring
Quickly assess how serious a situation is. TriageEngine asks targeted questions and returns a severity level so you know whether to act immediately or monitor.

### 🗄️ VaultEngine — Offline Data Sync
All emergency content is cached locally via service workers. VaultEngine manages offline data so the app remains fully functional with zero connectivity.

### 📋 ReportEngine — Incident Logging
Log incidents as they happen. ReportEngine captures key details — time, type, actions taken — useful for handoff to medical professionals when they arrive.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| PWA | Service Workers, Web App Manifest |
| Offline Storage | Cache API + IndexedDB |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Why Offline-First?

Most first aid apps require an internet connection. In Nigeria and across Africa, network reliability during emergencies cannot be guaranteed. VITA is built with an offline-first architecture — the app loads and functions fully from cache, with zero dependency on live network calls during use.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Eldren-cmd/vita-sage.git
cd vita-sage

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To test offline functionality, open DevTools → Application → Service Workers → check "Offline".

---

## Installing as a PWA

1. Visit [vita-sage.vercel.app](https://vita-sage.vercel.app) on your phone
2. Tap the browser menu → **"Add to Home Screen"**
3. Open from your home screen like a native app
4. Works fully offline after first load

---

## Project Structure

```
vita-sage/
├── app/                  # Next.js App Router pages
├── components/           # UI components
│   ├── VITAEngine/       # Guided response flows
│   ├── TriageEngine/     # Severity assessment
│   ├── VaultEngine/      # Offline sync logic
│   └── ReportEngine/     # Incident logging
├── public/
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
└── lib/                  # Utilities and data
```

---

## Roadmap

- [ ] Multilingual support (Yoruba, Igbo, Hausa)
- [ ] GPS location sharing for emergency contacts
- [ ] Nearest hospital finder (offline map tiles)
- [ ] Audio-guided instructions for hands-free use

---

## Author

Gabriel Adegboyega Adenrele
Full Stack Developer · Lagos, Nigeria

[![Portfolio](https://img.shields.io/badge/Portfolio-ga--royal--portfolio.vercel.app-C9A84C?style=flat-square)](https://ga-royal-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adenrele--gabriel-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/adenrele-gabriel)
[![GitHub](https://img.shields.io/badge/GitHub-Eldren--cmd-1A0A2E?style=flat-square&logo=github)](https://github.com/Eldren-cmd)

---

> Built because emergencies don't wait for signal.
