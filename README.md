# MMM-NewsComicFeed

Ein MagicMirror²-Modul, das RSS-Newsfeeds als rotierenden Ticker anzeigt – oben und unten am Bildschirm. Jede angezeigte Headline wird per `sendNotification` an andere Module weitergegeben, damit **MMM-ComicButton** immer die aktuell sichtbare Meldung für die Comic-Generierung verwenden kann.

---

## Vorschau

```
┌──────────────────────────────────────────────────────────────────┐
│  [TAGESANZEIGER]  Bundesrat beschliesst neue Energiemassnahmen  1/8│
└──────────────────────────────────────────────────────────────────┘

     ... (MagicMirror-Inhalte) ...

┌──────────────────────────────────────────────────────────────────┐
│  [TUTTOJUVE]  Vlahovic verlängert bis 2028 – offiziell        3/12│
└──────────────────────────────────────────────────────────────────┘
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
    rotateInterval:  8000,      // Headline alle 8s wechseln
    updateInterval:  600000,    // RSS alle 10 Min. neu laden
    maxItemsPerFeed: 10,
    feeds: [
      {
        name:     "Tagesanzeiger",
        url:      "https://www.tagesanzeiger.ch/rss",
        category: "news",
      },
      {
        name:     "20min",
        url:      "https://www.20min.ch/rss/rss.tmpl",
        category: "news",
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
      },
      {
        name:     "Formel1.de",
        url:      "https://www.formel1.de/rss/news",
        category: "f1",
      },
    ],
  },
},
```

### Alle Optionen

| Option | Standard | Beschreibung |
|---|---|---|
| `feeds` | `[]` | Liste der RSS-Quellen (Pflicht, siehe unten) |
| `displayPosition` | `"top"` | `"top"` oder `"bottom"` – beeinflusst CSS-Trennlinie |
| `rotateInterval` | `8000` | Millisekunden zwischen Headline-Wechseln |
| `updateInterval` | `600000` | Millisekunden zwischen RSS-Abrufen (10 Min.) |
| `maxItemsPerFeed` | `10` | Maximale Artikel pro Feed |
| `animationSpeed` | `600` | Überblend-Dauer beim Wechsel in ms |

### Feed-Objekt

```javascript
{
  name:     "Anzeigename",   // erscheint als Badge im Ticker
  url:      "https://...",   // RSS/Atom-Feed-URL
  category: "news",          // Farbschema: "news" | "juve" | "f1" | "sport"
}
```

### Kategoriefarben

| `category` | Farbe |
|---|---|
| `news` | Blau |
| `juve` | Schwarz/Weiss |
| `f1` | Rot |
| `sport` | Grün |

---

## Notification-Schnittstelle

Das Modul sendet bei jedem Headline-Wechsel:

```javascript
this.sendNotification("NEWS_CURRENT_HEADLINE", {
  source:   "TuttoJuve",
  category: "juve",
  title:    "Vlahovic verlängert bis 2028",
  link:     "https://...",
  pubDate:  "2025-04-07T10:30:00Z",
});
```

**MMM-ComicButton** lauscht auf diese Notification und verwendet die aktuell angezeigte Headline beim nächsten Tastendruck.

---

## RSS-URLs prüfen

Falls ein Feed nicht lädt, URL direkt testen:

```bash
curl -s "https://www.tuttojuve.com/feed" | head -50
curl -s "https://www.formel1.de/rss/news" | head -50
```

Manche Feeds erfordern einen `User-Agent` – das Modul sendet bereits `MagicMirror/MMM-NewsComicFeed`.

---

## Fehlerbehebung

**Feed lädt nicht**
→ URL in der Konsole testen (siehe oben). Einige Newsseiten blockieren RSS-Anfragen aus dem Ausland oder ohne Browser-User-Agent.

**Formel1.de URL funktioniert nicht**
→ Alternativ versuchen: `https://www.formel1.de/rss` oder einen anderen F1-Feed wie `https://www.motorsport-total.com/rss/f1`.

**Beide Ticker zeigen dieselben Nachrichten**
→ Prüfen, ob `feeds` in beiden Modul-Instanzen unterschiedlich konfiguriert sind.

---

## Lizenz

MIT
