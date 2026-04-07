"use strict";

const NodeHelper = require("node_helper");
const Parser     = require("rss-parser");

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "MagicMirror/MMM-NewsComicFeed" },
  customFields: { item: ["media:content", "enclosure"] },
});

module.exports = NodeHelper.create({

  async socketNotificationReceived(notification, payload) {
    if (notification === "NEWS_FETCH") {
      await this._fetchFeeds(payload);
    }
  },

  async _fetchFeeds({ identifier, feeds, maxItemsPerFeed }) {
    const all = [];

    for (const feed of feeds) {
      try {
        const result = await parser.parseURL(feed.url);
        const items  = (result.items || []).slice(0, maxItemsPerFeed);

        for (const item of items) {
          if (!item.title) continue;
          all.push({
            source:    feed.name,
            category:  feed.category || "news",
            title:     this._clean(item.title),
            link:      item.link || "",
            pubDate:   item.pubDate || item.isoDate || "",
          });
        }
      } catch (err) {
        console.warn(`[MMM-NewsComicFeed] Feed error (${feed.name}):`, err.message);
      }
    }

    // Sort newest first
    all.sort((a, b) => (new Date(b.pubDate) - new Date(a.pubDate)) || 0);

    this.sendSocketNotification("NEWS_DATA_" + identifier, all);
  },

  _clean(str) {
    return str
      .replace(/<[^>]+>/g, "")       // strip HTML
      .replace(/&amp;/g,  "&")
      .replace(/&lt;/g,   "<")
      .replace(/&gt;/g,   ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
  },
});
