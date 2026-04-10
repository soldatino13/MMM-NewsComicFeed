# MMM-NewsComicFeed

Ein MagicMirror²-Modul, das RSS-Newsfeeds als rotierenden Ticker anzeigt – typischerweise oben und unten am Bildschirm. Jede angezeigte Headline wird per `sendNotification` an andere Module weitergegeben, damit **MMM-ComicButton** immer die aktuell sichtbare Meldung für die Comic-Generierung verwenden kann.

---

## Vorschau

```
┌──────────────────────────────────────────────────────────────────────┐
│  [TA]  Bundesrat beschliesst neue Energiemassnahmen – Details unklar  1/18│
└──────────────────────────────────────────────────────────────────────┘

     ... (MagicMirror-Inhalte) ...

┌──────────────────────────────────────────────────────────────────────┐
│  [F1]  FIA findet Ersatz für Bahrain & Saudi-Arabien – in der F2    3/14│
└──────────────────────────────────────────────────────────────────────┘
```

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

Das Modul wird **zweimal** in der `config.js` eingetragen – einmal für den oberen, einmal für den unteren Ticker:

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
| `rotateInterval` | `8000` | Millisekunden zwischen Headline-Wechseln |
| `updateInterval` | `600000` | Millisekunden zwischen RSS-Abrufen (10 Min.) |
| `maxItemsPerFeed` | `10` | Maximale Artikel pro Feed |
| `animationSpeed` | `600` | Überblend-Dauer beim Wechsel in ms |

### Feed-Objekt

| Feld | Pflicht | Beschreibung |
|---|---|---|
| `name` | ✅ | Anzeigename – muss eindeutig sein (wird für Headline-Pool verwendet) |
| `url` | ✅ | RSS/Atom-Feed-URL |
| `category` | – | Farbschema des Text-Badges (Fallback wenn kein Logo): `news` / `juve` / `f1` / `sport` |
| `logo` | – | URL zu einem Logo/Favicon – wird als `<img>` anstelle des Text-Badges angezeigt |

### Kategoriefarben (Text-Badge Fallback)

| `category` | Farbe |
|---|---|
| `news` | Blau |
| `juve` | Schwarz/Weiss |
| `f1` | Rot |
| `sport` | Grün |

---

## Logos

Wenn `logo` gesetzt ist, wird ein `<img>`-Element anstelle des farbigen Text-Badges angezeigt. Favicons funktionieren zuverlässig. Für bessere Qualität ein lokales Bild verwenden:

```bash
mkdir ~/MagicMirror/modules/MMM-NewsComicFeed/logos
# Logo-Datei dort ablegen
```

```javascript
logo: "modules/MMM-NewsComicFeed/logos/tagi.png"
```

Grösse wird via CSS gesteuert (Standard: Höhe 22px).

---

## Notification-Schnittstelle

### Sendet

Bei jedem Headline-Wechsel und beim initialen Laden:

```javascript
sendNotification("NEWS_CURRENT_HEADLINE", {
  source:   "TuttoJuve",
  category: "juve",
  title:    "Vlahovic verlängert bis 2028",
  link:     "https://...",
  pubDate:  "2025-04-07T10:30:00Z",
});
```

### Empfängt

```javascript
// Anfrage von MMM-ComicButton beim Start
"REQUEST_CURRENT_HEADLINE"
// → Antwortet sofort mit der aktuell angezeigten Headline
```

---

## Zusammenspiel mit MMM-ComicButton

MMM-ComicButton baut intern einen **Headline-Pool** auf – eine Headline pro Feed-Quelle. Bei jedem Tastendruck wird zufällig eine Headline aus dem Pool gewählt. Damit beide Feed-Instanzen (oben/unten) im Pool landen, müssen die `name`-Felder der Feeds **eindeutig** sein.

---

## Fehlerbehebung

**Feed lädt nicht**
```bash
curl -A "MagicMirror" "https://www.tuttojuve.com/feed" | head -30
```

**Formel1.de funktioniert nicht**
→ Alternativ: `https://www.motorsport-total.com/rss/f1` oder `https://www.formel1.de/rss`

**Nur Feeds aus einer Instanz erscheinen im ComicButton**
→ Prüfen ob `name`-Felder aller Feeds eindeutig sind – doppelte Namen werden im Pool überschrieben.

---

## Lizenz

MIT
