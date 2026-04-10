# MMM-NewsComicFeed

Ein MagicMirror²-Modul, das RSS-Newsfeeds als rotierenden Ticker anzeigt – oben und unten am Bildschirm. Durch Antippen einer Headline wird diese für **MMM-ComicButton** ausgewählt, der daraus per KI einen Comic generiert und auf Mastodon postet.

---

## Vorschau

```
┌──────────────────────────────────────────────────────────────────────┐
│  [TA]  Bundesrat beschliesst neue Energiemassnahmen       🎨  1/18  │
└──────────────────────────────────────────────────────────────────────┘

     ... (MagicMirror-Inhalte) ...

┌──────────────────────────────────────────────────────────────────────┐
│  [F1]  FIA findet Ersatz für Bahrain & Saudi-Arabien      ✅  3/14  │
└──────────────────────────────────────────────────────────────────────┘
```

Angetippte Headline erscheint **gold** markiert mit ✅ – der Ticker pausiert 30 Sekunden damit die Auswahl sichtbar bleibt.

---

## Voraussetzungen

- MagicMirror² v2.15 oder neuer
- Node.js 18+

---

## Installation

```bash
cd ~/MagicMirror/modules
cp -r ~/MMM-NewsComicFeed .
cd MMM-NewsComicFeed
npm install
```

---

## Konfiguration

Das Modul wird **zweimal** in der `config.js` eingetragen – oben und unten:

```javascript
// ── Ticker OBEN: Schweizer Nachrichten ──
{
  module:   "MMM-NewsComicFeed",
  position: "top_bar",
  config: {
    displayPosition: "top",
    rotateInterval:  8000,
    updateInterval:  600000,
    maxItemsPerFeed: 10,
    feeds: [
      {
        name:     "Tagesanzeiger",
        url:      "https://www.tagesanzeiger.ch/rss",
        category: "news",
        logo:     "https://www.tagesanzeiger.ch/favicon.ico",
      },
      {
        name:     "20min",
        url:      "https://www.20min.ch/rss/rss.tmpl",
        category: "news",
        logo:     "https://www.20min.ch/favicon.ico",
      },
    ],
  },
},

// ── Ticker UNTEN: Sport ──
{
  module:   "MMM-NewsComicFeed",
  position: "bottom_bar",
  config: {
    displayPosition: "bottom",
    rotateInterval:  8000,
    updateInterval:  600000,
    maxItemsPerFeed: 10,
    feeds: [
      {
        name:     "TuttoJuve",
        url:      "https://www.tuttojuve.com/feed",
        category: "juve",
        logo:     "https://www.tuttojuve.com/favicon.ico",
      },
      {
        name:     "Formel1.de",
        url:      "https://www.formel1.de/rss/news",
        category: "f1",
        logo:     "https://www.formel1.de/favicon.ico",
      },
    ],
  },
},
```

---

## Alle Optionen

| Option | Standard | Beschreibung |
|---|---|---|
| `feeds` | `[]` | Liste der RSS-Quellen (Pflicht) |
| `displayPosition` | `"top"` | `"top"` oder `"bottom"` – steuert CSS-Trennlinie |
| `rotateInterval` | `8000` | ms zwischen Headline-Wechseln (pausiert 30s nach Auswahl) |
| `updateInterval` | `600000` | ms zwischen RSS-Abrufen (Standard: 10 Min.) |
| `maxItemsPerFeed` | `10` | Maximale Artikel pro Feed |
| `animationSpeed` | `600` | Überblend-Dauer in ms |

### Feed-Objekt

| Feld | Pflicht | Beschreibung |
|---|---|---|
| `name` | ✅ | Anzeigename – muss über alle Feeds eindeutig sein |
| `url` | ✅ | RSS/Atom-Feed-URL |
| `category` | – | Badge-Farbe (Fallback wenn kein Logo): `news` / `juve` / `f1` / `sport` |
| `logo` | – | Logo-URL – wird als `<img>` statt Text-Badge angezeigt |

### Kategoriefarben (Text-Badge Fallback)

| `category` | Farbe |
|---|---|
| `news` | Blau |
| `juve` | Schwarz/Weiss |
| `f1` | Rot |
| `sport` | Grün |

---

## Logos

Favicons funktionieren zuverlässig. Für bessere Qualität lokale Bilder verwenden:

```bash
mkdir ~/MagicMirror/modules/MMM-NewsComicFeed/logos
# Logo-Datei dort ablegen
```

```javascript
logo: "modules/MMM-NewsComicFeed/logos/tagi.png"
```

---

## Interaktion – Headline auswählen

1. Ticker läuft automatisch (alle `rotateInterval` ms)
2. Gewünschte Headline **antippen**
3. Headline wird **gold** markiert, ✅ erscheint rechts
4. Ticker pausiert **30 Sekunden** damit die Auswahl sichtbar bleibt
5. Die andere Feed-Instanz verliert ihre Markierung automatisch
6. **MMM-ComicButton** zeigt die gewählte Headline und wartet auf Tastendruck

---

## Notification-Schnittstelle

### Sendet

```javascript
// Beim Antippen einer Headline:
sendNotification("COMIC_HEADLINE_SELECTED", {
  source:   "TuttoJuve",
  category: "juve",
  title:    "Vlahovic verlängert bis 2028",
  link:     "https://...",
  pubDate:  "2025-04-07T10:30:00Z",
  _feedId:  "MMM-NewsComicFeed_0", // intern, zur Markierungssteuerung
});
```

### Empfängt

```javascript
// Von der anderen Feed-Instanz – damit Markierung zurückgesetzt wird:
"COMIC_HEADLINE_SELECTED"  →  wenn _feedId !== eigene identifier
```

---

## Fehlerbehebung

**Feed lädt nicht**
```bash
curl -A "MagicMirror" "https://www.tuttojuve.com/feed" | head -30
```

**Formel1.de funktioniert nicht**
→ Alternativ: `https://www.motorsport-total.com/rss/f1`

**Antippen funktioniert nicht**
→ Prüfen ob Touchscreen-Events in Electron aktiv sind. Im `config.js` ggf. ergänzen:
```javascript
electronOptions: { webPreferences: { touchEvents: true } }
```

---

## Lizenz

MIT
