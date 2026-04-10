"use strict";

Module.register("MMM-NewsComicFeed", {
  defaults: {
    feeds: [],
    displayPosition: "top",
    updateInterval:  10 * 60 * 1000,
    rotateInterval:  8 * 1000,
    maxItemsPerFeed: 10,
    animationSpeed:  600,
  },

  start() {
    this.headlines      = [];
    this.currentIndex   = 0;
    this.loaded         = false;
    this.selectedTitle  = null; // merken welche gerade ausgewählt ist

    this._fetch();
    this._fetchTimer  = setInterval(() => this._fetch(), this.config.updateInterval);
    this._rotateTimer = setInterval(() => this._rotate(), this.config.rotateInterval);
  },

  stop() {
    clearInterval(this._fetchTimer);
    clearInterval(this._rotateTimer);
  },

  notificationReceived(notification, payload) {
    // Wenn eine andere Headline ausgewählt wurde (z.B. vom anderen Feed),
    // Markierung zurücksetzen falls sie nicht von uns kommt
    if (notification === "COMIC_HEADLINE_SELECTED") {
      if (payload._feedId !== this.identifier) {
        this.selectedTitle = null;
        this.updateDom(200);
      }
    }
  },

  _fetch() {
    this.sendSocketNotification("NEWS_FETCH", {
      identifier:      this.identifier,
      feeds:           this.config.feeds,
      maxItemsPerFeed: this.config.maxItemsPerFeed,
    });
  },

  _rotate() {
    if (!this.headlines.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.headlines.length;
    this.updateDom(this.config.animationSpeed);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "NEWS_DATA_" + this.identifier) {
      this.headlines    = payload;
      this.currentIndex = 0;
      this.loaded       = true;
      this.updateDom(this.config.animationSpeed);
    }
  },

  _onHeadlineClick(item) {
    this.selectedTitle = item.title;
    // Rotation pausieren für 30s damit die gewählte Headline sichtbar bleibt
    clearInterval(this._rotateTimer);
    this._rotateTimer = setInterval(() => this._rotate(), 30 * 1000);
    this.updateDom(150);

    // Anderen Feed-Instanzen bescheid geben (damit sie Markierung zurücksetzen)
    this.sendNotification("COMIC_HEADLINE_SELECTED", {
      ...item,
      _feedId: this.identifier,
    });
  },

  getDom() {
    const w = document.createElement("div");
    w.className = `news-ticker news-ticker-${this.config.displayPosition}`;

    if (!this.loaded) {
      w.innerHTML = `<span class="news-loading">⌛ Lade News…</span>`;
      return w;
    }
    if (!this.headlines.length) {
      w.innerHTML = `<span class="news-loading">Keine Meldungen</span>`;
      return w;
    }

    const item     = this.headlines[this.currentIndex];
    const selected = this.selectedTitle === item.title;
    const feed     = this.config.feeds.find(f => f.name === item.source);

    const logoEl = feed?.logo
      ? `<img class="news-source-logo" src="${feed.logo}" alt="${item.source}" title="${item.source}">`
      : `<span class="news-source-tag news-cat-${(item.category || "news").toLowerCase()}">${item.source}</span>`;

    w.innerHTML = `
      ${logoEl}
      <span class="news-headline-text ${selected ? "news-headline-selected" : ""}">${item.title}</span>
      <span class="news-tap-hint ${selected ? "news-tap-selected" : ""}">
        ${selected ? "✅" : "🎨"}
      </span>
      <span class="news-counter">${this.currentIndex + 1}/${this.headlines.length}</span>
    `;

    // Klick-Handler auf den Text
    const textEl = w.querySelector(".news-headline-text");
    textEl.addEventListener("click", () => this._onHeadlineClick(item));
    textEl.style.cursor = "pointer";

    return w;
  },

  getStyles() { return ["MMM-NewsComicFeed.css"]; },
});
