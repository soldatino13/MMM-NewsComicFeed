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
    this.headlines    = [];
    this.currentIndex = 0;
    this.loaded       = false;

    this._fetch();
    this._fetchTimer  = setInterval(() => this._fetch(), this.config.updateInterval);
    this._rotateTimer = setInterval(() => this._rotate(), this.config.rotateInterval);
  },

  stop() {
    clearInterval(this._fetchTimer);
    clearInterval(this._rotateTimer);
  },

  // MMM-ComicButton fragt beim Start nach der aktuellen Headline
  notificationReceived(notification) {
    if (notification === "REQUEST_CURRENT_HEADLINE" && this.headlines.length) {
      this.sendNotification("NEWS_CURRENT_HEADLINE", this.headlines[this.currentIndex]);
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
    this.sendNotification("NEWS_CURRENT_HEADLINE", this.headlines[this.currentIndex]);
    this.updateDom(this.config.animationSpeed);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "NEWS_DATA_" + this.identifier) {
      this.headlines    = payload;
      this.currentIndex = 0;
      this.loaded       = true;
      if (this.headlines.length) {
        this.sendNotification("NEWS_CURRENT_HEADLINE", this.headlines[0]);
      }
      this.updateDom(this.config.animationSpeed);
    }
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

    const item = this.headlines[this.currentIndex];
    const feed = this.config.feeds.find(f => f.name === item.source);
    const logoEl = feed?.logo
      ? `<img class="news-source-logo" src="${feed.logo}" alt="${item.source}" title="${item.source}">`
      : `<span class="news-source-tag news-cat-${(item.category || "news").toLowerCase()}">${item.source}</span>`;

    w.innerHTML = `
      ${logoEl}
      <span class="news-headline-text">${item.title}</span>
      <span class="news-counter">${this.currentIndex + 1}/${this.headlines.length}</span>
    `;

    return w;
  },

  getStyles() { return ["MMM-NewsComicFeed.css"]; },
});
