# SchoolSync - Deployment Guide

## 🚀 Vercel Deployment (Empfohlen)

### Prerequisites
- GitHub Account
- Vercel Account (kostenlos bei vercel.com)
- Git installiert

### Schritt-für-Schritt Anleitung

#### 1. GitHub Repository erstellen

```bash
# Im schoolsync-Ordner:
cd /workspaces/Account-Allocation/schoolsync

# Git initialisieren (falls noch nicht geschehen)
git init

# Alle Dateien hinzufügen
git add .

# Erster Commit
git commit -m "Initial commit - SchoolSync PWA ready for deployment"

# GitHub Repo erstellen (via GitHub Website), dann:
git remote add origin https://github.com/DEIN-USERNAME/schoolsync.git
git branch -M main
git push -u origin main
```

#### 2. Vercel Deployment

1. Gehe zu https://vercel.com
2. **Login mit GitHub**
3. Klicke **"New Project"**
4. **Importiere** dein `schoolsync` Repository
5. Vercel erkennt automatisch:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Klicke **"Deploy"**
7. Warte ~2 Minuten ⏳

#### 3. Nach dem Deployment

Du bekommst eine URL wie:
```
https://schoolsync-xyz.vercel.app
```

**Teste die App:**
1. Öffne die URL auf deinem Android Tablet
2. Prüfe ob das Install-Banner erscheint
3. Installiere die App
4. Teste Offline-Modus (Flugmodus aktivieren)

---

## 🔄 Updates deployen

```bash
# Änderungen machen (z.B. Bug-Fix)
git add .
git commit -m "Fix: Validierung bei Subtraktion verbessert"
git push

# Vercel deployed automatisch!
# Nach ~2 Minuten ist das Update live
```

**Users bekommen Updates automatisch:**
- Service Worker cached neue Version
- Beim nächsten App-Start wird Update geladen
- Kein manuelles Update nötig

---

## 🌐 Custom Domain (Optional)

Falls du eine eigene Domain möchtest (z.B. `schoolsync.app`):

1. **Domain kaufen** (z.B. bei Namecheap, ~$10/Jahr)
2. In Vercel: **Settings → Domains → Add Domain**
3. **DNS-Einträge** bei deinem Domain-Provider setzen:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Warten** (~5-10 Minuten für DNS-Propagation)
5. Fertig: https://schoolsync.app

**Für den Anfang:** Die Vercel-URL reicht vollkommen!

---

## 📊 Build lokal testen

Vor dem Deployment solltest du den Build lokal testen:

```bash
cd schoolsync

# Build erstellen
npm run build

# Build-Ergebnis testen
npm run preview
```

Öffne: http://localhost:4173

**Prüfe:**
- ✅ Alle Features funktionieren
- ✅ PWA Manifest lädt
- ✅ Service Worker registriert sich
- ✅ Keine Console-Errors
- ✅ Icons werden korrekt angezeigt

---

## 📱 PWA Icons erstellen (WICHTIG!)

**Aktuell fehlen noch die Icon-Dateien!**

Du brauchst:
- `public/favicon.ico` (32×32px)
- `public/icon-192.png` (192×192px)
- `public/icon-512.png` (512×512px)

### Option 1: Online Tool (Schnell)
1. Gehe zu https://realfavicongenerator.net/
2. Lade ein Logo hoch (mindestens 512×512px)
3. Generiere alle benötigten Formate
4. Lade die Dateien herunter
5. Kopiere sie nach `schoolsync/public/`

### Option 2: Designer beauftragen
- Fiverr oder 99designs
- Brief: "Schulheft-Icon mit 'S' Logo, blauer Rand links"
- ~$20-50

### Option 3: Placeholder nutzen (Temporär)
```bash
# Einfache farbige Quadrate als Platzhalter
# Für Production solltest du echte Icons haben!
```

---

## ✅ Production Checklist

Vor dem finalen Deployment prüfen:

### Features
- [ ] Schriftlich Rechnen funktioniert (Addition, Subtraktion)
- [ ] 1×1 Training funktioniert (Zufällig, Fokus-Reihe)
- [ ] Wortarten funktioniert (Pinsel-System, Validierung)
- [ ] Streak-System funktioniert
- [ ] localStorage persistiert über Reload
- [ ] Konfetti-Effekte bei 10 richtigen hintereinander

### PWA
- [ ] Manifest lädt korrekt
- [ ] Service Worker registriert sich
- [ ] Icons vorhanden (192px, 512px)
- [ ] Install-Banner erscheint (Android Chrome)
- [ ] Offline-Modus funktioniert

### Performance
- [ ] Build ohne Warnings: `npm run build`
- [ ] Keine Console-Errors
- [ ] Responsive auf Tablet
- [ ] Touch-Targets min. 44×44px
- [ ] Smooth Animationen (Konfetti)

### Sicherheit
- [ ] Keine sensiblen Daten im Code
- [ ] Keine API-Keys committed
- [ ] HTTPS aktiviert (automatisch bei Vercel)

---

## 🐛 Troubleshooting

### Build schlägt fehl
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Service Worker lädt nicht
- Browser-Cache leeren
- DevTools → Application → Service Workers → Unregister
- Seite neu laden

### Icons werden nicht angezeigt
- Prüfe ob Dateien in `public/` liegen
- Prüfe Dateinamen (exakt: `icon-192.png`, `icon-512.png`)
- Hard-Refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### App wird nicht angeboten zur Installation
- Nur über HTTPS möglich (localhost ist OK für Tests)
- Manifest muss valide sein
- Service Worker muss registriert sein
- Nur in Chrome/Edge (nicht Firefox Mobile)

---

## 📈 Monitoring (Optional)

### Vercel Analytics (Kostenlos)
```bash
npm install @vercel/analytics
```

```javascript
// In src/main.jsx:
import { Analytics } from '@vercel/analytics/react';

// Am Ende von <App>:
<Analytics />
```

**⚠️ Datenschutz:** Für eine Kinder-App würde ich auf Analytics verzichten!

---

## 💾 Backup & Wartung

### Backup
- GitHub ist dein Backup
- Regelmäßig pushen!

### Updates
- Dependencies updaten: `npm update`
- Sicherheits-Updates prüfen: `npm audit`
- React/Vite Updates: Dokumentation lesen!

---

## 📞 Support

Bei Fragen:
- GitHub Issues
- Vercel Docs: https://vercel.com/docs
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/

---

**Viel Erfolg mit dem Deployment! 🚀**
