/* Home Media website: interactive demos. No dependencies, no tracking. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );

  const icon = (id, cls = "icon") =>
    `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ------------------------------------------------------------------
     Sample shelf. Labels mirror the options seeded by the real app.
     ------------------------------------------------------------------ */

  const LANGS = {
    en: ["🇺🇸", "English"],
    de: ["🇩🇪", "German"],
    pl: ["🇵🇱", "Polish"],
    fr: ["🇫🇷", "French"],
    es: ["🇪🇸", "Spanish"],
    it: ["🇮🇹", "Italian"],
    sv: ["🇸🇪", "Swedish"],
    fi: ["🇫🇮", "Finnish"],
    uk: ["🇺🇦", "Ukrainian"],
    da: ["🇩🇰", "Danish"],
    cs: ["🇨🇿", "Czech"],
    no: ["🇳🇴", "Norwegian"],
    is: ["🇮🇸", "Icelandic"],
    pt: ["🇵🇹", "Portuguese"],
    xx: ["🏳️", "Other"],
  };

  const FORMATS = {
    dvd: { label: "DVD", band: "DVD", order: 0 },
    bluray: { label: "Blu-ray", band: "Blu-ray", order: 1 },
    uhd: { label: "Blu-ray 4K", band: "4K UHD", order: 2 },
  };

  const AVAIL = {
    available: "Available",
    delivery: "On delivery",
    borrowed: "Borrowed out",
    gave: "Gave to friend",
    lost: "Lost or missing",
    damaged: "Damaged",
  };

  // t: title, f: format, c: content type, e: edition, au/su: audio/subtitles,
  // av: availability, w: watched, r: rating, ean: first 12 digits,
  // col/ink: spine colors, steel: steelbook, box: season box set
  const DISCS = [
    {
      t: "Paper Harbor",
      f: "bluray",
      c: "Movie",
      e: "Standard Edition",
      au: ["en", "fr"],
      su: ["en", "de", "pl"],
      av: "available",
      w: false,
      ean: "505189223114",
      col: "#f2c14e",
      ink: "#000",
    },
    {
      t: "The Quiet Orbit",
      f: "uhd",
      c: "Movie",
      e: "Steelbook",
      au: ["en", "de"],
      su: ["en", "de", "pl"],
      av: "borrowed",
      w: true,
      r: 4,
      ean: "505308326201",
      steel: true,
    },
    {
      t: "Saltwater Kings",
      f: "dvd",
      c: "Movie",
      e: "Standard Edition",
      au: ["en"],
      su: ["en", "es"],
      av: "available",
      w: true,
      r: 3,
      ean: "503935906512",
      col: "#1d3557",
      ink: "#fff",
    },
    {
      t: "Night Shift at the Lighthouse",
      f: "bluray",
      c: "Movie",
      e: "Collector’s Edition",
      au: ["en", "it"],
      su: ["en", "it", "fr"],
      av: "available",
      w: false,
      ean: "505090014288",
      col: "#e4572e",
      ink: "#000",
    },
    {
      t: "Moth & Lantern",
      f: "uhd",
      c: "Movie",
      e: "Limited Edition",
      au: ["en"],
      su: ["en", "fr", "es"],
      av: "available",
      w: false,
      ean: "405227413360",
      col: "#24243a",
      ink: "#ffd23f",
    },
    {
      t: "Ninety Winters",
      f: "bluray",
      c: "Documentary",
      e: "Standard Edition",
      au: ["en", "sv"],
      su: ["en", "sv", "fi", "da"],
      av: "available",
      w: true,
      r: 5,
      ean: "735004811937",
      col: "#eceae6",
      ink: "#000",
    },
    {
      t: "Concrete Choir: Live in Oslo",
      f: "bluray",
      c: "Concert",
      e: "Standard Edition",
      au: ["no", "en"],
      su: ["en"],
      av: "available",
      w: false,
      ean: "703212450066",
      col: "#ff7d9c",
      ink: "#000",
    },
    {
      t: "Little Comet",
      f: "dvd",
      c: "Cartoon",
      e: "Standard Edition",
      au: ["en", "pl", "uk"],
      su: ["en", "pl"],
      av: "gave",
      w: true,
      r: 4,
      ean: "590231770412",
      col: "#4cc9f0",
      ink: "#000",
    },
    {
      t: "Wind Town",
      f: "bluray",
      c: "Anime",
      e: "Collector’s Edition",
      au: ["xx", "en"],
      su: ["en"],
      av: "available",
      w: false,
      ean: "505037720941",
      col: "#8ac926",
      ink: "#000",
    },
    {
      t: "The Long Weekend: Season 1",
      f: "dvd",
      c: "TV Series",
      e: "Standard Edition",
      au: ["en", "de"],
      su: ["en", "de", "fr"],
      av: "available",
      w: false,
      ean: "503936904417",
      col: "#6a4c93",
      ink: "#fff",
      box: true,
    },
    {
      t: "Static Bloom",
      f: "uhd",
      c: "Movie",
      e: "Director’s Cut",
      au: ["en", "fr"],
      su: ["en", "fr"],
      av: "available",
      w: false,
      ean: "505189224557",
      col: "#ff595e",
      ink: "#000",
    },
    {
      t: "Red Line Express",
      f: "bluray",
      c: "Movie",
      e: "Extended Edition",
      au: ["en", "es", "pt"],
      su: ["en", "es", "pt"],
      av: "available",
      w: true,
      r: 4,
      ean: "841231805993",
      col: "#f4a261",
      ink: "#000",
    },
    {
      t: "Fjord",
      f: "uhd",
      c: "Documentary",
      e: "Standard Edition",
      au: ["no", "en", "is"],
      su: ["en", "no", "is"],
      av: "delivery",
      w: false,
      ean: "703212450981",
      col: "#2a9d8f",
      ink: "#000",
    },
    {
      t: "Ghost Kitchen",
      f: "dvd",
      c: "Movie",
      e: "Standard Edition",
      au: ["en", "cs"],
      su: ["cs", "en"],
      av: "damaged",
      w: true,
      r: 2,
      ean: "859411203347",
      col: "#3a3a3a",
      ink: "#fff",
    },
    {
      t: "Second Sunrise",
      f: "bluray",
      c: "Movie",
      e: "Standard Edition",
      au: ["en", "fr"],
      su: ["en", "fr", "de"],
      av: "available",
      w: false,
      ean: "505308327045",
      col: "#ffd6a5",
      ink: "#000",
    },
    {
      t: "Brass Tacks: Season 2",
      f: "dvd",
      c: "TV Series",
      e: "Standard Edition",
      au: ["en"],
      su: ["en", "da"],
      av: "lost",
      w: true,
      r: 3,
      ean: "501020442210",
      col: "#bc6c25",
      ink: "#000",
      box: true,
    },
    {
      t: "Half Moon Diner",
      f: "bluray",
      c: "Movie",
      e: "Standard Edition",
      au: ["en", "it"],
      su: ["en", "it"],
      av: "available",
      w: false,
      ean: "805647800311",
      col: "#a0c4ff",
      ink: "#000",
    },
    {
      t: "Vela",
      f: "uhd",
      c: "Movie",
      e: "Steelbook",
      au: ["en", "de", "pl"],
      su: ["en", "de", "pl", "uk"],
      av: "available",
      w: false,
      ean: "590231771068",
      steel: true,
    },
  ];

  /* ------------------------------------------------------------------
     EAN-13 barcodes, drawn for real from the digits
     ------------------------------------------------------------------ */

  const EAN_L = [
    "0001101",
    "0011001",
    "0010011",
    "0111101",
    "0100011",
    "0110001",
    "0101111",
    "0111011",
    "0110111",
    "0001011",
  ];
  const EAN_R = EAN_L.map((code) =>
    code.replace(/./g, (b) => (b === "0" ? "1" : "0")),
  );
  const EAN_G = EAN_R.map((code) => code.split("").reverse().join(""));
  const EAN_PARITY = [
    "LLLLLL",
    "LLGLGG",
    "LLGGLG",
    "LLGGGL",
    "LGLLGG",
    "LGGLLG",
    "LGGGLL",
    "LGLGLG",
    "LGLGGL",
    "LGGLGL",
  ];

  function ean13(first12) {
    const digits = first12.split("").map(Number);
    const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0);
    return first12 + ((10 - (sum % 10)) % 10);
  }

  function eanBars(code) {
    const d = code.split("").map(Number);
    const parity = EAN_PARITY[d[0]];
    let bits = "101";
    for (let i = 1; i <= 6; i++)
      bits += (parity[i - 1] === "L" ? EAN_L : EAN_G)[d[i]];
    bits += "01010";
    for (let i = 7; i <= 12; i++) bits += EAN_R[d[i]];
    bits += "101";
    return bits;
  }

  function drawBarcode(host) {
    const svg = $(".barcode__bars", host);
    if (!svg) return;
    const code = ean13(host.dataset.ean);
    const bits = eanBars(code);
    const guards = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);
    const quiet = 9;
    let path = "";
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] !== "1") continue;
      const h = guards.has(i) ? 50 : 44;
      path += `M${quiet + i} 0h1v${h}h-1z`;
    }
    svg.setAttribute("viewBox", `0 0 ${bits.length + quiet * 2} 50`);
    svg.innerHTML = `<path d="${path}" fill="#000"/>`;
    const digits = $(".barcode__digits", host);
    if (digits) digits.textContent = code;
  }

  $$(".barcode[data-ean]").forEach(drawBarcode);
  DISCS.forEach((d) => {
    d.code = ean13(d.ean);
  });

  /* ------------------------------------------------------------------
     Shelf and "Pick for me"
     ------------------------------------------------------------------ */

  const shelf = $("#shelf");
  const shelfRow = $("#shelf-row");
  const pickBody = $("#pick-body");
  const pickActions = $("#pick-actions");
  const pickStatus = $("#pick-status");
  const listeners = new Set();
  const state = { current: null, mode: "idle", busy: false, note: "" };

  const onChange = (fn) => listeners.add(fn);
  const emit = () => listeners.forEach((fn) => fn());

  const flags = (codes) =>
    codes
      .map(
        (c) =>
          `<span class="flag" role="img" aria-label="${LANGS[c][1]}" title="${LANGS[c][1]}">${LANGS[c][0]}</span>`,
      )
      .join("");

  function spineLabel(d) {
    return `${d.t}, ${FORMATS[d.f].label}${d.w ? ", watched" : ""}`;
  }

  function buildShelf() {
    if (!shelfRow) return;
    const items = DISCS.map((d, i) => {
      const classes = ["spine", `spine--${d.f}`];
      if (d.steel) classes.push("spine--steel");
      if (d.box) classes.push("spine--box");
      if (d.w) classes.push("is-watched");
      const colors = d.steel ? "" : ` style="--c:${d.col};--t:${d.ink}"`;
      return `<li><button type="button" class="${classes.join(" ")}" data-i="${i}"${colors} aria-label="${esc(spineLabel(d))}">
        <span class="spine__band" aria-hidden="true">${FORMATS[d.f].band}</span>
        <span class="spine__title" aria-hidden="true">${esc(d.t)}</span>
        <span class="spine__seen" aria-hidden="true">${icon("check")}</span>
      </button></li>`;
    });
    items.push('<li aria-hidden="true"><span class="shelf__end"></span></li>');
    shelfRow.innerHTML = items.join("");
  }

  const spineEl = (i) => $(`.spine[data-i="${i}"]`, shelfRow);

  function syncSpines() {
    $$(".spine", shelfRow).forEach((el) => {
      const i = Number(el.dataset.i);
      const d = DISCS[i];
      el.classList.toggle("is-watched", d.w);
      el.classList.toggle("is-picked", state.current === i);
      el.setAttribute("aria-label", spineLabel(d));
      if (state.current === i) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    shelf.classList.toggle("has-pick", state.current !== null);
  }

  function centerSpine(i) {
    const el = spineEl(i);
    if (!el || shelfRow.scrollWidth <= shelfRow.clientWidth) return;
    const li = el.parentElement;
    const left = li.offsetLeft - shelfRow.clientWidth / 2 + li.offsetWidth / 2;
    shelfRow.scrollTo({
      left,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  const unwatchedCount = () => DISCS.filter((d) => !d.w).length;

  function renderPick() {
    if (!pickBody) return;
    const focusedAction = document.activeElement?.closest?.(
      "#pick [data-action]",
    )?.dataset.action;
    const left = unwatchedCount();

    if (state.current === null) {
      if (left === 0) {
        pickBody.innerHTML = `
          <h2 class="pick__title">That’s the whole shelf.</h2>
          <p class="pick__text">Every disc here is marked as watched. In the app, this is where you go and buy more.</p>`;
        pickActions.innerHTML = `<button class="btn btn--primary" type="button" data-action="reset">${icon("refresh")}<span>Reset the shelf</span></button>`;
      } else {
        pickBody.innerHTML = `
          <h2 class="pick__title">Can’t decide?</h2>
          <p class="pick__text">${state.note ? esc(state.note) + " " : ""}${left} of these ${DISCS.length} discs are still unwatched. Home Media picks one at random, just like the app does.</p>`;
        pickActions.innerHTML = `<button class="btn btn--primary" type="button" data-action="pick">${icon("dice")}<span>Pick for me</span></button>`;
      }
    } else {
      const d = DISCS[state.current];
      const kicker =
        state.mode === "pick"
          ? `${icon("dice")}Tonight’s pick`
          : "From the shelf";
      const watched = d.w
        ? `Yes${d.r ? `, ${d.r} of 5 stars` : ""}`
        : "Not yet";
      pickBody.innerHTML = `
        <p class="pick__kicker">${kicker}</p>
        <h2 class="pick__title">${esc(d.t)}</h2>
        <div class="tags">
          <span class="tag tag--${d.f}">${FORMATS[d.f].label}</span>
          <span class="tag">${esc(d.c)}</span>
          <span class="tag">${esc(d.e)}</span>
        </div>
        <dl class="pick__meta">
          <div><dt>Audio</dt><dd>${flags(d.au)}</dd></div>
          <div><dt>Subtitles</dt><dd>${flags(d.su)}</dd></div>
          <div><dt>Shelf</dt><dd><span class="tag tag--${d.av}">${AVAIL[d.av]}</span></dd></div>
          <div><dt>Watched</dt><dd>${watched}</dd></div>
        </dl>`;
      const pickLabel =
        left === 0
          ? "Nothing left to pick"
          : state.mode === "pick"
            ? "Pick again"
            : "Pick for me";
      pickActions.innerHTML = `
        <button class="btn btn--primary" type="button" data-action="pick"${left === 0 ? " disabled" : ""}>${icon("dice")}<span>${pickLabel}</span></button>
        <button class="btn" type="button" data-action="toggle">${d.w ? "Mark as unwatched" : "Mark as watched"}</button>`;
    }

    if (state.busy) {
      const btn = $('[data-action="pick"]', pickActions);
      if (btn) {
        // aria-disabled rather than disabled, so keyboard focus stays put
        btn.setAttribute("aria-disabled", "true");
        $("span", btn).textContent = "Picking…";
      }
    }

    if (focusedAction) {
      const target =
        $(`[data-action="${focusedAction}"]:not([disabled])`, pickActions) ||
        $("[data-action]:not([disabled])", pickActions);
      target?.focus();
    }
  }

  async function pick() {
    if (state.busy) return;
    const pool = DISCS.map((d, i) => (d.w ? -1 : i)).filter((i) => i >= 0);
    if (!pool.length) return;

    state.busy = true;
    state.current = null;
    state.note = "";
    syncSpines();
    renderPick();

    const target = pool[Math.floor(Math.random() * pool.length)];

    if (!reducedMotion.matches && pool.length > 1) {
      const steps = 15;
      let prev = -1;
      for (let s = 0; s < steps; s++) {
        let i;
        do {
          i = pool[Math.floor(Math.random() * pool.length)];
        } while (i === prev);
        prev = i;
        $$(".spine.is-lit", shelfRow).forEach((el) =>
          el.classList.remove("is-lit"),
        );
        spineEl(i)?.classList.add("is-lit");
        await wait(45 + Math.pow(s / steps, 2.4) * 260);
      }
      $$(".spine.is-lit", shelfRow).forEach((el) =>
        el.classList.remove("is-lit"),
      );
    }

    state.busy = false;
    state.current = target;
    state.mode = "pick";
    emit();
    centerSpine(target);
    pickStatus.textContent = `Tonight’s pick: ${DISCS[target].t}`;
  }

  function toggleWatched() {
    if (state.current === null) return;
    const d = DISCS[state.current];
    d.w = !d.w;
    if (!d.w) delete d.r;
    pickStatus.textContent = d.w
      ? `Marked ${d.t} as watched`
      : `Marked ${d.t} as unwatched`;
    emit();
  }

  function reset() {
    DISCS.forEach((d) => {
      d.w = d.initial.w;
      d.r = d.initial.r;
    });
    state.current = null;
    state.note = "";
    emit();
    pickStatus.textContent = "Shelf reset";
  }

  DISCS.forEach((d) => {
    d.initial = { w: d.w, r: d.r };
  });

  if (shelfRow && pickActions) {
    buildShelf();

    shelfRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".spine");
      if (!btn || state.busy) return;
      const i = Number(btn.dataset.i);
      if (state.current === i) {
        state.current = null;
      } else {
        state.current = i;
        state.mode = "view";
      }
      emit();
    });

    pickActions.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "pick") pick();
      else if (action === "toggle") toggleWatched();
      else if (action === "reset") reset();
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        state.current !== null &&
        !state.busy &&
        shelf.contains(document.activeElement)
      ) {
        state.current = null;
        emit();
      }
    });

    onChange(syncSpines);
    onChange(renderPick);
    renderPick();
  }

  /* ------------------------------------------------------------------
     Catalog demo: search, filters and sorting
     ------------------------------------------------------------------ */

  const catBody = $("#cat-body");
  const cat = { q: "", f: "all", av: "", lang: "", sort: "t", dir: 1 };

  function initCatalog() {
    if (!catBody) return;
    const availSelect = $("#cat-avail");
    const langSelect = $("#cat-lang");

    Object.entries(AVAIL).forEach(([k, label]) =>
      availSelect.add(new Option(label, k)),
    );
    Object.entries(LANGS)
      .filter(([k]) => DISCS.some((d) => d.au.includes(k) || d.su.includes(k)))
      .forEach(([k, [flag, label]]) =>
        langSelect.add(new Option(`${flag} ${label}`, k)),
      );

    $("#cat-q").addEventListener("input", (e) => {
      cat.q = e.target.value.trim().toLowerCase();
      renderCatalog();
    });

    $("#cat-format").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-f]");
      if (!btn) return;
      cat.f = btn.dataset.f;
      $$("#cat-format button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
      renderCatalog();
    });

    availSelect.addEventListener("change", (e) => {
      cat.av = e.target.value;
      renderCatalog();
    });

    langSelect.addEventListener("change", (e) => {
      cat.lang = e.target.value;
      renderCatalog();
    });

    $$(".catalog__table th button[data-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.sort;
        cat.dir = cat.sort === key ? -cat.dir : 1;
        cat.sort = key;
        $$(".catalog__table th").forEach((th) =>
          th.removeAttribute("aria-sort"),
        );
        btn
          .closest("th")
          .setAttribute(
            "aria-sort",
            cat.dir === 1 ? "ascending" : "descending",
          );
        renderCatalog();
      });
    });

    $("#cat-clear").addEventListener("click", () => {
      cat.q = "";
      cat.f = "all";
      cat.av = "";
      cat.lang = "";
      $("#cat-q").value = "";
      availSelect.value = "";
      langSelect.value = "";
      $$("#cat-format button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.f === "all")),
      );
      renderCatalog();
      $("#cat-q").focus();
    });

    onChange(renderCatalog);
    renderCatalog();
  }

  function sortValue(d, key) {
    if (key === "f") return FORMATS[d.f].order;
    if (key === "av") return AVAIL[d.av];
    if (key === "ean") return d.code;
    return d.t.replace(/^The /, "");
  }

  function renderCatalog() {
    if (!catBody) return;
    const q = cat.q;
    const rows = DISCS.filter((d) => {
      if (
        q &&
        !d.t.toLowerCase().includes(q) &&
        !d.code.includes(q.replace(/\s+/g, ""))
      )
        return false;
      if (cat.f !== "all" && d.f !== cat.f) return false;
      if (cat.av && d.av !== cat.av) return false;
      if (cat.lang && !d.au.includes(cat.lang) && !d.su.includes(cat.lang))
        return false;
      return true;
    }).sort((a, b) => {
      const va = sortValue(a, cat.sort);
      const vb = sortValue(b, cat.sort);
      const cmp =
        typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return cmp * cat.dir || a.t.localeCompare(b.t);
    });

    if (!rows.length) {
      const what = q ? `“${esc(cat.q)}”` : "these filters";
      catBody.innerHTML = `<tr><td colspan="6" class="catalog__empty">No disc matches ${what}. Try part of a title or a barcode, or clear the filters.</td></tr>`;
    } else {
      catBody.innerHTML = rows
        .map(
          (d) => `<tr>
          <td><span class="cell-title">${esc(d.t)}</span><span class="cell-sub">${esc(d.c)}, ${esc(d.e)}</span><span class="tag tag--${d.f} cell-fmt" aria-hidden="true">${FORMATS[d.f].label}</span></td>
          <td class="col-format"><span class="tag tag--${d.f}">${FORMATS[d.f].label}</span></td>
          <td class="col-ean"><span class="cell-ean">${d.code}</span></td>
          <td class="col-lang"><span class="cell-flags">${flags(d.au)}</span></td>
          <td><span class="tag tag--${d.av}">${AVAIL[d.av]}</span></td>
          <td class="col-seen">${
            d.w
              ? `<span class="cell-seen is-on" role="img" aria-label="Watched">${icon("check")}</span>`
              : '<span class="cell-seen" role="img" aria-label="Not watched"></span>'
          }</td>
        </tr>`,
        )
        .join("");
    }

    const filtered = q || cat.f !== "all" || cat.av || cat.lang;
    $("#cat-count").textContent =
      `Showing ${rows.length} of ${DISCS.length} discs`;
    $("#cat-clear").hidden = !filtered;
  }

  initCatalog();

  /* ------------------------------------------------------------------
     Statistics panel follows the shelf
     ------------------------------------------------------------------ */

  function renderStats() {
    const set = (key, value) => {
      const el = $(`[data-stat="${key}"]`);
      if (el) el.textContent = value;
    };
    set("total", DISCS.length);
    set("watched", DISCS.filter((d) => d.w).length);
    Object.keys(FORMATS).forEach((f) =>
      set(f, DISCS.filter((d) => d.f === f).length),
    );
  }

  onChange(renderStats);
  renderStats();

  /* ------------------------------------------------------------------
     Theme preview: the app's eight palettes
     ------------------------------------------------------------------ */

  const THEMES = [
    {
      id: "midnight",
      name: "Midnight",
      desc: "Cyan and magenta neon glow on near-black.",
      bg: "#0a0a0a",
      s1: "#111827",
      s2: "#1f2937",
      line: "#374151",
      text: "#ffffff",
      muted: "#9ca3af",
      a1: "#22d3ee",
      a2: "#c084fc",
    },
    {
      id: "nord",
      name: "Nord",
      desc: "Cool slate blues, calm and easy on the eyes.",
      bg: "#2e3440",
      s1: "#3b4252",
      s2: "#434c5e",
      line: "#4c566a",
      text: "#eceff4",
      muted: "#b9c0cc",
      a1: "#88c0d0",
      a2: "#b48ead",
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      desc: "Magenta and cyan neon on deep purple-black.",
      bg: "#0a0014",
      s1: "#15001f",
      s2: "#2a0033",
      line: "#3d004a",
      text: "#f3e0ff",
      muted: "#d8c8e8",
      a1: "#66ffff",
      a2: "#ff66b3",
    },
    {
      id: "linen",
      name: "Linen",
      desc: "Warm cream paper with rust and teal accents.",
      bg: "#faf3e7",
      s1: "#f5ecd9",
      s2: "#ede2c8",
      line: "#d4c5a8",
      text: "#2a2218",
      muted: "#6e5f46",
      a1: "#0e7490",
      a2: "#b45309",
    },
    {
      id: "snow",
      name: "Snow",
      desc: "Crisp white with vivid blue accents.",
      bg: "#ffffff",
      s1: "#f8fafc",
      s2: "#f1f5f9",
      line: "#cbd5e1",
      text: "#0f172a",
      muted: "#475569",
      a1: "#2563eb",
      a2: "#6d28d9",
    },
    {
      id: "steampunk",
      name: "Steampunk",
      desc: "Brass and copper on dark leather.",
      bg: "#1a1209",
      s1: "#2a1f0e",
      s2: "#3d2e16",
      line: "#5a4523",
      text: "#f4e6c8",
      muted: "#c8a875",
      a1: "#d4a85a",
      a2: "#87bdb6",
    },
    {
      id: "homelab",
      name: "HomeLab",
      desc: "LED green on server-rack black.",
      bg: "#0c1410",
      s1: "#131c17",
      s2: "#1f2a23",
      line: "#2c3b31",
      text: "#e8f0e9",
      muted: "#8a9d90",
      a1: "#84cc16",
      a2: "#22d3ee",
    },
    {
      id: "arch",
      name: "Arch",
      desc: "Vivid Arch blue on saturated navy.",
      bg: "#0a1929",
      s1: "#102a43",
      s2: "#1d3557",
      line: "#24466e",
      text: "#e8eef5",
      muted: "#7fa8d3",
      a1: "#1793d1",
      a2: "#5ec6ec",
    },
  ];

  const tp = $("#tp");
  const themePick = $("#theme-pick");

  function renderPreviewRows() {
    const rows = $("#tp-rows");
    if (!rows) return;
    const sample = [0, 3, 1, 6, 10].map((i) => DISCS[i]);
    rows.innerHTML =
      '<div class="tp__row"><span>Title</span><span>Format</span><span>Audio</span><span>Availability</span></div>' +
      sample
        .map(
          (d) => `<div class="tp__row">
            <span class="tp__title">${esc(d.t)}</span>
            <span class="tp__chip tp__chip--a1">${FORMATS[d.f].label}</span>
            <span class="tp__flags">${d.au.map((c) => LANGS[c][0]).join(" ")}</span>
            <span class="tp__chip tp__chip--a2">${AVAIL[d.av]}</span>
          </div>`,
        )
        .join("");
  }

  function applyTheme(theme) {
    const map = {
      bg: "--tp-bg",
      s1: "--tp-s1",
      s2: "--tp-s2",
      line: "--tp-line",
      text: "--tp-text",
      muted: "--tp-muted",
      a1: "--tp-a1",
      a2: "--tp-a2",
    };
    Object.entries(map).forEach(([k, v]) => tp.style.setProperty(v, theme[k]));
    $$(".theme-chip", themePick).forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.theme === theme.id)),
    );
    $("#theme-desc").textContent =
      `${theme.name}: ${theme.desc.charAt(0).toLowerCase()}${theme.desc.slice(1)}`;
  }

  if (tp && themePick) {
    themePick.innerHTML = THEMES.map(
      (
        t,
      ) => `<button type="button" class="theme-chip" data-theme="${t.id}" aria-pressed="false">
        <span class="theme-chip__sw" style="background:linear-gradient(135deg, ${t.bg} 0 50%, ${t.a1} 50% 100%)" aria-hidden="true"></span>${t.name}
      </button>`,
    ).join("");
    themePick.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-chip");
      if (btn) applyTheme(THEMES.find((t) => t.id === btn.dataset.theme));
    });
    $("#density")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-d]");
      if (!btn) return;
      tp.dataset.density = btn.dataset.d;
      $$("#density button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
    });
    renderPreviewRows();
    applyTheme(THEMES[0]);
  }

  /* ------------------------------------------------------------------
     Compose file generator
     ------------------------------------------------------------------ */

  const compose = $("#compose");
  const opts = $("#opts");

  function newSecret() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  let secret = window.crypto?.getRandomValues
    ? newSecret()
    : "replace-with-a-long-random-string";

  function readOptions() {
    const mode = $('input[name="mode"]:checked', opts).value;
    const portRaw = parseInt($("#opt-port").value, 10);
    const port =
      Number.isInteger(portRaw) && portRaw > 0 && portRaw < 65536
        ? portRaw
        : 9812;
    const domain =
      $("#opt-domain")
        .value.trim()
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "") || "media.example.com";
    const path =
      $("#opt-path")
        .value.replace(/[\r\n'"]/g, "")
        .trim() || "./homemedia-data";
    return {
      mode,
      port,
      domain,
      path,
      guest: $("#opt-guest").checked,
      requests: $("#opt-requests").checked,
    };
  }

  function composeText(o) {
    const lines = [
      "services:",
      "  homemedia:",
      "    image: rustydaemon/homemedia:latest",
      "    container_name: homemedia",
      "    restart: unless-stopped",
    ];
    if (o.mode === "ports") {
      lines.push("    ports:", `      - '${o.port}:8080' # host:container`);
    }
    lines.push(
      "    environment:",
      `      - JWT_SECRET=${secret}`,
      `      - ENABLE_GUEST_MODE=${o.guest}`,
      `      - ENABLE_REQUESTS=${o.requests}`,
      "    volumes:",
      `      - ${o.path}:/app/data`,
    );
    if (o.mode === "traefik") {
      lines.push(
        "    networks:",
        "      - proxy",
        "    labels:",
        "      - traefik.enable=true",
        `      - traefik.http.routers.homemedia.rule=Host(\`${o.domain}\`)`,
        "      - traefik.http.services.homemedia.loadbalancer.server.port=8080",
        "      - traefik.http.routers.homemedia.entrypoints=web",
        "",
        "networks:",
        "  proxy:",
        "    external: true",
      );
    }
    return lines.join("\n");
  }

  function highlightLine(line) {
    let comment = "";
    const hashAt = line.indexOf(" #");
    if (hashAt > -1) {
      comment = `<span class="y-c">${esc(line.slice(hashAt))}</span>`;
      line = line.slice(0, hashAt);
    }
    let m = line.match(/^(\s*)([A-Za-z_][\w.-]*):(.*)$/);
    if (m)
      return `${m[1]}<span class="y-k">${esc(m[2])}</span>:${esc(m[3])}${comment}`;
    m = line.match(/^(\s*- )([A-Z_]+)=(.*)$/);
    if (m) {
      const value =
        m[2] === "JWT_SECRET"
          ? `<span class="y-hot">${esc(m[3])}</span>`
          : `<span class="y-s">${esc(m[3])}</span>`;
      return `${esc(m[1])}<span class="y-e">${esc(m[2])}</span>=${value}${comment}`;
    }
    m = line.match(/^(\s*- )(.*)$/);
    if (m) return `${esc(m[1])}<span class="y-s">${esc(m[2])}</span>${comment}`;
    return esc(line) + comment;
  }

  function renderCompose() {
    const o = readOptions();
    const text = composeText(o);
    compose.dataset.text = text;
    compose.innerHTML = `<code>${text.split("\n").map(highlightLine).join("\n")}</code>`;
    $$("[data-show]", opts).forEach((el) => {
      el.hidden = el.dataset.show !== o.mode;
    });
    const url =
      o.mode === "ports"
        ? `http://your-server:${o.port}`
        : `http://${o.domain}`;
    $("#open-url").textContent = url;
  }

  async function copyCompose() {
    const text = compose.dataset.text || compose.textContent;
    const btn = $("#copy-btn");
    const label = $("span", btn);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    label.textContent = ok ? "Copied" : "Select and copy";
    $("#copy-status").textContent = ok
      ? "Compose file copied to clipboard"
      : "Copy failed. Select the text and copy it manually.";
    if (!ok) {
      const range = document.createRange();
      range.selectNodeContents(compose);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    clearTimeout(copyCompose.timer);
    copyCompose.timer = setTimeout(() => {
      label.textContent = "Copy";
    }, 2200);
  }

  if (compose && opts) {
    opts.addEventListener("input", renderCompose);
    opts.addEventListener("change", renderCompose);
    opts.addEventListener("submit", (e) => e.preventDefault());
    $("#opt-regen").addEventListener("click", () => {
      secret = newSecret();
      renderCompose();
    });
    $("#copy-btn").addEventListener("click", copyCompose);
    renderCompose();
  }
})();
