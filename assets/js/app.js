/**
 * EV Global Hub — application logic.
 *
 * Architecture
 * - data.js  : EV_DATA, REGIONS, QUARTERS, BRAND_QUARTERLY_SUMMARY, EXCHANGE_RATES (pure data)
 * - i18n.js  : I18N UI strings (ko / en)
 * - app.js   : state + rendering. All clicks go through one delegated handler ([data-action]).
 *
 * Adding a vehicle or region only requires editing data.js.
 */
(() => {
  "use strict";

  const CHART_JS_SRC = "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js";
  const PREFS_KEY = "evhub:prefs";
  const MAX_COMPARE = 4;
  const PERIOD_ORDER = [
    "2026 Q3", "2026 Q2", "2026 Q1",
    "2025 YEAR", "2025 Q4", "2025 Q3", "2025 Q2", "2025 Q1",
    "2024 YEAR", "2024 Q4", "2024 Q3", "2024 Q2", "2024 Q1", "ALL"
  ];
  const CURRENCY_ORDER = ["local", "krw", "usd"];
  const ORIGIN_COLORS = {
    US: "rgba(56, 189, 248, 0.85)",
    CN: "rgba(244, 63, 94, 0.85)",
    KR: "rgba(16, 185, 129, 0.85)",
    DE: "rgba(245, 158, 11, 0.85)",
    JP: "rgba(99, 102, 241, 0.85)"
  };
  const SORTERS = {
    "sales-desc": (a, b) => salesFor(b) - salesFor(a),
    "range-desc": (a, b) => b.specs.rangeKm - a.specs.rangeKm,
    "power-desc": (a, b) => b.specs.powerHp - a.specs.powerHp,
    "accel-asc": (a, b) => a.specs.zeroToHundred - b.specs.zeroToHundred,
    "charge-asc": (a, b) => a.specs.chargeTimeMin - b.specs.chargeTimeMin,
    "price-kr-asc": byPrice("kr"),
    "price-us-asc": byPrice("us"),
    "price-cn-asc": byPrice("cn"),
    "price-eu-asc": byPrice("eu"),
    "year-desc": (a, b) => b.releaseYear - a.releaseYear || salesFor(b) - salesFor(a)
  };
  const QUICK_FILTERS = { "800v": "only800V", new: "onlyNew", best: "onlyBestSeller" };

  // Inline SVG silhouette fallback if a vehicle photo fails to load
  const FALLBACK_PATHS = {
    SUV: "M55 128 L82 84 C90 72 104 66 125 66 L235 66 C255 66 272 75 284 90 L318 98 C332 102 342 112 344 128 Z",
    SEDAN: "M50 128 L88 90 C102 76 120 72 145 72 L225 72 C248 72 268 82 285 96 L325 104 C338 108 345 116 346 128 Z",
    TRUCK: "M48 128 L68 78 L195 78 L212 100 L338 100 L344 128 Z"
  };
  window.__evFallbackSvg = (seg = "SUV") => {
    const body = FALLBACK_PATHS[seg] || FALLBACK_PATHS.SUV;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="400" height="180" fill="url(#g)"/><path d="${body}" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round"/><circle cx="115" cy="130" r="20" fill="#0f172a" stroke="#94a3b8" stroke-width="4"/><circle cx="285" cy="130" r="20" fill="#0f172a" stroke="#94a3b8" stroke-width="4"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const EV_BY_ID = new Map(EV_DATA.map(ev => [ev.id, ev]));
  const $ = id => document.getElementById(id);

  // ---------------------------------------------------------------- state
  const prefs = loadPrefs();
  const urlLang = new URLSearchParams(location.search).get("lang");

  const ALL_ORIGIN_CODES = Object.keys(REGIONS).filter(k => k !== "ALL");
  const NON_CN_CODES = ALL_ORIGIN_CODES.filter(k => k !== "CN");

  const state = {
    lang: urlLang === "en" || urlLang === "ko" ? urlLang : prefs.lang || "ko",
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    period: "2026 Q3",
    selectedRegions: new Set(), // empty Set = ALL regions selected
    selectedBrands: new Set(),
    segment: "ALL",
    searchQuery: "",
    sortBy: "sales-desc",
    only800V: false,
    onlyNew: false,
    onlyBestSeller: false,
    currencyMode: CURRENCY_ORDER.includes(prefs.currencyMode) ? prefs.currencyMode : "local",
    activeView: "cards",
    compareIds: ["tesla-model-y-juniper", "hyundai-ioniq-9", "bmw-ix3-neue-klasse", "vw-id5-pro"]
  };

  const charts = {};
  let chartJsPromise = null;
  let staticKoAbout = null;

  // ---------------------------------------------------------------- helpers
  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ lang: state.lang, theme: state.theme, currencyMode: state.currencyMode })
      );
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  }

  const t = () => I18N[state.lang];
  const isKo = () => state.lang === "ko";
  const brandLabel = ev => (isKo() ? ev.brandKo : ev.brand);
  const subName = ev => (isKo() ? ev.nameKo : ev.nameEn || ev.name);
  const segmentLabel = ev => (isKo() ? ev.segment : ev.segmentEn || ev.segment);
  const badgeLabel = ev => (isKo() ? ev.badge : ev.badgeEn || ev.badge);
  const highlights = ev => (isKo() ? ev.highlights : ev.highlightsEn || ev.highlights);
  const officialLink = ev => (isKo() ? ev.officialUrlKo || ev.officialUrl : ev.officialUrl || ev.officialUrlKo);
  const regionLabel = code => (isKo() ? REGIONS[code].labelKo : REGIONS[code].labelEn);
  const periodLabel = (p = state.period) => t().periodShort[p] || p;
  const fmt = n => n.toLocaleString("en-US");

  function byPrice(market) {
    return (a, b) => (a.prices[market] ?? Infinity) - (b.prices[market] ?? Infinity);
  }

  function salesFor(ev, period = state.period) {
    const qs = ev.quarterlySales;
    if (period === "ALL") return QUARTERS.reduce((sum, q) => sum + (qs[q] || 0), 0);
    if (period.endsWith("YEAR")) {
      const year = period.slice(0, 4);
      return QUARTERS.filter(q => q.startsWith(year)).reduce((sum, q) => sum + (qs[q] || 0), 0);
    }
    return qs[period] || 0;
  }

  function qoqChange(ev, period = state.period) {
    const idx = QUARTERS.indexOf(period);
    if (idx <= 0) return null;
    const prev = ev.quarterlySales[QUARTERS[idx - 1]] || 0;
    const curr = ev.quarterlySales[period] || 0;
    if (prev === 0) return curr > 0 ? "NEW" : null;
    return ((curr - prev) / prev) * 100;
  }

  function toUSD(amount, market) {
    if (amount == null) return null;
    switch (market) {
      case "us": return amount;
      case "cn": return amount / EXCHANGE_RATES.CNY;
      case "kr": return (amount * 10000) / EXCHANGE_RATES.KRW; // stored in 만원
      case "eu": return amount / EXCHANGE_RATES.EUR;
      default: return null;
    }
  }

  function formatManWon(manWon, approx) {
    const prefix = approx ? "약 " : "";
    if (manWon >= 10000) {
      const eok = Math.floor(manWon / 10000);
      const man = manWon % 10000;
      return `${prefix}${eok}억${man ? ` ${fmt(man)}만` : " 원"}`;
    }
    return `${prefix}${fmt(manWon)}만 원`;
  }

  function formatPrice(amount, market) {
    if (amount == null) return `<span class="text-slate-400 dark:text-slate-600 text-[11px]">${t().notReleased}</span>`;
    const mode = state.currencyMode;

    if (mode === "usd") return `~$${fmt(Math.round(toUSD(amount, market)))}`;
    if (mode === "krw") {
      const manWon = market === "kr" ? amount : Math.round((toUSD(amount, market) * EXCHANGE_RATES.KRW) / 10000);
      const approx = market !== "kr";
      return isKo() ? formatManWon(manWon, approx) : `${approx ? "~" : ""}₩${(manWon / 100).toFixed(1)}M`;
    }
    // local
    if (market === "us") return `$${fmt(amount)}`;
    if (market === "cn") return `¥${fmt(amount)}`;
    if (market === "eu") return `€${fmt(amount)}`;
    return isKo() ? formatManWon(amount, false) : `₩${(amount / 100).toFixed(1)}M`;
  }

  function avgUSDPrice(ev) {
    const list = ["us", "cn", "kr", "eu"].map(m => toUSD(ev.prices[m], m)).filter(v => v != null);
    return list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function optionsHtml(entries, selected) {
    return entries.map(([v, l]) => `<option value="${v}"${v === selected ? " selected" : ""}>${l}</option>`).join("");
  }

  // ---------------------------------------------------------------- data selection
  function isRegionMatch(origin) {
    return state.selectedRegions.size === 0 || state.selectedRegions.has(origin);
  }

  function isExcludeChinaPresetActive() {
    return (
      state.selectedRegions.size === NON_CN_CODES.length &&
      NON_CN_CODES.every(code => state.selectedRegions.has(code)) &&
      !state.selectedRegions.has("CN")
    );
  }

  function getFilteredEVs() {
    const q = state.searchQuery.trim().toLowerCase();
    return EV_DATA.filter(ev => {
      if (!isRegionMatch(ev.origin)) return false;
      if (state.selectedBrands.size && !state.selectedBrands.has(ev.brand)) return false;
      if (state.segment !== "ALL" && ev.segmentCode !== state.segment) return false;
      if (state.only800V && ev.specs.architectureV < 800) return false;
      if (state.onlyNew && !ev.isNew) return false;
      if (state.onlyBestSeller && !ev.isBestSeller) return false;
      if (q && !searchIndex.get(ev.id).includes(q)) return false;
      return true;
    }).sort(SORTERS[state.sortBy] || SORTERS["sales-desc"]);
  }

  // Pre-computed lowercase search text per vehicle (built once)
  const searchIndex = new Map(
    EV_DATA.map(ev => [
      ev.id,
      [
        ev.brand, ev.brandKo, ev.name, ev.nameKo, ev.nameEn, ev.segment, ev.segmentEn,
        ev.badge, ev.badgeEn, ...(ev.highlights || []), ...(ev.highlightsEn || [])
      ].filter(Boolean).join(" ").toLowerCase()
    ])
  );

  // ---------------------------------------------------------------- static / language-dependent UI
  function renderLanguage() {
    const d = t();
    const html = document.documentElement;
    html.lang = state.lang;
    document.title = d.meta.title;
    document.querySelector('meta[name="description"]').setAttribute("content", d.meta.description);

    $("heroTitle").textContent = d.heroTitle;
    $("heroSub").textContent = d.heroSub;
    $("periodLabelText").textContent = d.periodLabel;
    $("globalPeriodSelect").setAttribute("aria-label", d.periodLabel);
    $("langToggleLabel").textContent = d.langToggle;
    $("brandRowLabel").textContent = d.brandRowLabel;
    $("specRowLabel").textContent = d.specRowLabel;
    $("searchInput").placeholder = d.searchPlaceholder;
    $("searchInput").setAttribute("aria-label", d.searchPlaceholder);
    $("sortSelect").setAttribute("aria-label", d.sortLabel);

    $("globalPeriodSelect").innerHTML = optionsHtml(PERIOD_ORDER.map(p => [p, d.periods[p]]), state.period);
    $("sortSelect").innerHTML = optionsHtml(Object.entries(d.sortOptions), state.sortBy);
    $("segmentFilter").innerHTML = optionsHtml(Object.entries(d.segments), state.segment);

    $("filter800V").textContent = d.filter800V;
    $("filterNewOnly").textContent = d.filterNewOnly;
    $("filterBestOnly").textContent = d.filterBestOnly;
    $("resetFiltersBtn").textContent = d.resetBtn;

    $("tabCardsLabel").textContent = d.tabCards;
    $("tabTableLabel").textContent = d.tabTable;
    $("tabChartsLabel").textContent = d.tabCharts;
    $("compareHintText").innerHTML = d.compareHintHtml;

    $("chartSalesSub").textContent = d.chartSalesSub;
    $("chartBrandTitle").textContent = d.chartBrandTitle;
    $("chartBrandSub").textContent = d.chartBrandSub;
    $("chartPriceTitle").textContent = d.chartPriceTitle;
    $("chartPriceSub").textContent = d.chartPriceSub;
    $("chartScatterTitle").textContent = d.chartScatterTitle;
    $("chartScatterSub").textContent = d.chartScatterSub;

    $("sponsoredLabel").textContent = d.sponsored;
    $("aboutSection").innerHTML = d.aboutHtml || staticKoAbout;
    $("footnoteSection").innerHTML = d.footnoteHtml;

    $("clearCompareBtn").textContent = d.clearBtn;
    $("openCompareBtnText").textContent = d.openCompareBtn;
    $("modalTitle").textContent = d.modalTitle;
    $("modalSub").textContent = d.modalSub;
    $("closeCompareModalBtn").setAttribute("aria-label", d.closeModal);
  }

  function renderToolbarState() {
    const d = t();
    const dark = state.theme === "dark";
    $("themeToggleIcon").textContent = dark ? "🌙" : "☀️";
    $("themeToggleLabel").textContent = d.themeLabels[state.theme];
    $("currencyToggleLabel").textContent = d.currencyLabels[state.currencyMode];
    if ($("currencyToggleShortLabel")) {
      $("currencyToggleShortLabel").textContent = d.currencyShortLabels[state.currencyMode];
    }
    document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#020617" : "#f8fafc");

    Object.entries(QUICK_FILTERS).forEach(([key, prop]) => {
      const btn = document.querySelector(`[data-action="quick"][data-key="${key}"]`);
      btn.classList.toggle("active", state[prop]);
      btn.setAttribute("aria-pressed", String(state[prop]));
    });

    document.querySelectorAll('[data-action="view"]').forEach(btn => {
      const active = btn.dataset.view === state.activeView;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    ["cards", "table", "charts"].forEach(v => $(`view-${v}`).classList.toggle("hidden", v !== state.activeView));
  }

  // ---------------------------------------------------------------- filters
  function renderRegionPills() {
    const d = t();
    const allActive = state.selectedRegions.size === 0;
    const noCnActive = isExcludeChinaPresetActive();
    const noCnCount = EV_DATA.filter(e => e.origin !== "CN").length;

    const allBtnHtml = `
      <button type="button" data-action="region" data-region="ALL" aria-pressed="${allActive}"
        class="region-pill ${allActive ? "active" : ""} px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 shrink-0">
        <span aria-hidden="true">${REGIONS.ALL.flag}</span><span>${regionLabel("ALL")}</span>
        <span class="opacity-75 font-mono text-[11px] sm:text-xs">(${EV_DATA.length})</span>
      </button>`;

    const noCnBtnHtml = `
      <button type="button" data-action="region-preset" data-preset="NO_CN" aria-pressed="${noCnActive}"
        class="region-pill ${noCnActive ? "active" : ""} px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1 shrink-0"
        title="${d.multiRegionHint}">
        <span>${d.excludeCNChip}</span>
        <span class="opacity-75 font-mono text-[11px] sm:text-xs">(${noCnCount})</span>
      </button>`;

    const countryBtnsHtml = ALL_ORIGIN_CODES.map(code => {
      const meta = REGIONS[code];
      const count = EV_DATA.filter(e => e.origin === code).length;
      const active = state.selectedRegions.has(code);
      return `
        <button type="button" data-action="region" data-region="${code}" aria-pressed="${active}"
          class="region-pill ${active ? "active" : ""} px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 shrink-0"
          title="${d.multiRegionHint}">
          <span aria-hidden="true">${meta.flag}</span><span>${regionLabel(code)}</span>
          <span class="opacity-75 font-mono text-[11px] sm:text-xs">(${count})</span>
        </button>`;
    }).join("");

    $("regionFilterGroup").innerHTML = allBtnHtml + noCnBtnHtml + countryBtnsHtml;
  }

  function renderBrandChips() {
    const pool = EV_DATA.filter(e => isRegionMatch(e.origin));
    const brands = new Map();
    pool.forEach(e => {
      const entry = brands.get(e.brand) || { brand: e.brand, brandKo: e.brandKo, count: 0 };
      entry.count += 1;
      brands.set(e.brand, entry);
    });

    const allActive = state.selectedBrands.size === 0;
    $("brandFilterGroup").innerHTML =
      `<button type="button" data-action="brand" data-brand="" aria-pressed="${allActive}"
        class="brand-chip ${allActive ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-semibold transition">${t().allBrandsChip}</button>` +
      [...brands.values()]
        .map(b => {
          const active = state.selectedBrands.has(b.brand);
          return `
            <button type="button" data-action="brand" data-brand="${b.brand}" aria-pressed="${active}"
              class="brand-chip ${active ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1">
              <span>${isKo() ? b.brandKo : b.brand}</span><span class="opacity-60 font-mono text-[11px]">${b.count}</span>
            </button>`;
        })
        .join("");
  }

  // ---------------------------------------------------------------- KPIs
  function renderKPIs(list) {
    const d = t().kpi;
    const pool = list.length ? list : EV_DATA;
    const best = cmp => pool.reduce((a, b) => (cmp(a, b) <= 0 ? a : b));
    const p = periodLabel();

    const seller = best(SORTERS["sales-desc"]);
    const range = best(SORTERS["range-desc"]);
    const accel = best(SORTERS["accel-asc"]);
    const charge = best(SORTERS["charge-asc"]);

    const cards = [
      { title: d.salesTitle(p), badge: d.salesBadge, color: "text-sky-600 dark:text-sky-400", ev: seller,
        val: d.salesVal(fmt(salesFor(seller)), p) },
      { title: d.rangeTitle, badge: d.rangeBadge, color: "text-emerald-600 dark:text-emerald-400", ev: range,
        val: `${range.specs.rangeKm} km (${range.rangeCycle} · ${range.specs.batteryKwh} kWh)` },
      { title: d.accelTitle, badge: d.accelBadge, color: "text-rose-600 dark:text-rose-400", ev: accel,
        val: d.accelVal(accel.specs.zeroToHundred, accel.specs.powerHp) },
      { title: d.chargeTitle, badge: d.chargeBadge, color: "text-amber-600 dark:text-amber-400", ev: charge,
        val: d.chargeVal(charge.specs.chargeTimeMin, charge.specs.architectureV, charge.specs.chargingKw) }
    ];

    $("kpiSection").innerHTML = cards
      .map(c => `
        <div class="glass-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <div class="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span class="truncate">${c.title}</span><span class="${c.color} font-semibold shrink-0">${c.badge}</span>
          </div>
          <div class="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">${brandLabel(c.ev)} ${c.ev.name}</div>
          <div class="text-[11px] sm:text-xs ${c.color} font-mono mt-0.5 sm:mt-1 truncate">${c.val}</div>
        </div>`)
      .join("");
  }

  // ---------------------------------------------------------------- cards view
  function sparkline(ev) {
    const quarters = QUARTERS.slice(-7);
    const vals = quarters.map(q => ev.quarterlySales[q] || 0);
    const max = Math.max(...vals, 1);
    return `<div class="flex items-end gap-1 h-8 pt-1" aria-hidden="true">${quarters
      .map((q, i) => {
        const h = Math.max(12, Math.round((vals[i] / max) * 100));
        const color = q === state.period ? "bg-sky-500 dark:bg-sky-400" : "bg-slate-300 dark:bg-slate-700";
        return `<div class="flex-1 h-full flex items-end" title="${q}: ${fmt(vals[i])}"><div class="w-full rounded-t ${color}" style="height:${h}%"></div></div>`;
      })
      .join("")}</div>`;
  }

  function priceCell(label, amount, market, valueClass) {
    return `
      <div class="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1">
        <span class="text-slate-500 dark:text-slate-400 font-sans text-[11px] shrink-0">${label}</span>
        <span class="${valueClass} truncate">${formatPrice(amount, market)}</span>
      </div>`;
  }

  function cardHtml(ev, index) {
    const d = t();
    const origin = REGIONS[ev.origin];
    const sales = salesFor(ev);
    const qoq = qoqChange(ev);
    const selected = state.compareIds.includes(ev.id);
    const rangePct = Math.min(100, Math.round((ev.specs.rangeKm / 800) * 100));
    const powerPct = Math.min(100, Math.round((ev.specs.powerHp / 850) * 100));
    const url = officialLink(ev);
    const imgSrc = ev.imageUrl || window.__evFallbackSvg(ev.segmentCode);

    let qoqBadge = "";
    if (qoq === "NEW") {
      qoqBadge = `<span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">${d.newLaunchBadge}</span>`;
    } else if (typeof qoq === "number") {
      const cls = qoq >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
      qoqBadge = `<span class="text-[11px] font-mono ${cls}">(${qoq >= 0 ? "+" : ""}${qoq.toFixed(1)}% ${d.qoqSuffix})</span>`;
    }

    return `
      <article class="ev-card cv-auto glass-card rounded-2xl border ${selected ? "border-sky-500/80 ring-1 ring-sky-500/40" : "border-slate-200 dark:border-slate-800/90"} overflow-hidden flex flex-col justify-between group">
        <div>
          <!-- Vehicle Photo Banner -->
          <div class="relative h-44 sm:h-48 w-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
            <img
              src="${imgSrc}"
              alt="${brandLabel(ev)} ${ev.name}"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              onerror="this.onerror=null;this.src=window.__evFallbackSvg('${ev.segmentCode}')"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/35 pointer-events-none"></div>

            <!-- Top Overlay: Rank + Country/Brand + 800V/NEW Badges -->
            <div class="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="w-6 h-6 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 font-mono text-xs font-bold text-sky-400 flex items-center justify-center shadow">${index + 1}</span>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950/75 backdrop-blur-md text-white border border-white/20 shadow">${origin.flag} ${brandLabel(ev)}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                ${ev.specs.architectureV >= 800 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow">${ev.specs.architectureV}V</span>` : ""}
                ${ev.isNew ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/90 text-white shadow">NEW</span>` : ""}
              </div>
            </div>

            <!-- Bottom Overlay: Segment + Release Year + Official Site Quick Link -->
            <div class="absolute bottom-2.5 inset-x-3 flex items-end justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[11px] text-slate-100 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15">${segmentLabel(ev)}</span>
                <span class="text-[11px] text-slate-200 font-mono bg-slate-950/60 backdrop-blur-md px-1.5 py-0.5 rounded">${ev.releaseYear}${d.modelYearSuffix}</span>
              </div>
              ${url ? `
                <a href="${url}" target="_blank" rel="noopener noreferrer"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/90 hover:bg-white text-slate-900 shadow-md transition flex items-center gap-1 shrink-0"
                  title="${d.officialSiteBtn}">
                  <span>${d.officialSiteShort}</span>
                </a>` : ""}
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-4 sm:p-5 pb-0">
            <div class="mb-3">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition leading-snug">${ev.name}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${subName(ev)}</p>
              <div class="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-sky-50 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 text-[11px] text-sky-700 dark:text-sky-300 font-medium">✨ ${badgeLabel(ev)}</div>
            </div>

            <div class="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 mb-3 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${d.globalSalesLabel(periodLabel())}</div>
                <div class="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                  <span class="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">${sales > 0 ? `${fmt(sales)}${d.unitsSuffix}` : d.preRelease}</span>
                  ${qoqBadge}
                </div>
              </div>
              <div class="w-20 sm:w-24 shrink-0">
                <div class="text-[10px] text-slate-500 text-right mb-0.5">${d.recent7Q}</div>
                ${sparkline(ev)}
              </div>
            </div>

            <div class="mb-3.5">
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>${d.price4RegionTitle}</span><span class="text-[10px] text-slate-500 font-normal">${d.currencyNote[state.currencyMode]}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
                ${priceCell(d.marketKR, ev.prices.kr, "kr", "text-emerald-700 dark:text-emerald-300 font-semibold")}
                ${priceCell(d.marketUS, ev.prices.us, "us", "text-slate-800 dark:text-slate-200")}
                ${priceCell(d.marketCN, ev.prices.cn, "cn", "text-rose-600 dark:text-rose-300")}
                ${priceCell(d.marketEU, ev.prices.eu, "eu", "text-slate-800 dark:text-slate-200")}
              </div>
            </div>

            <div class="space-y-2 mb-3.5 text-xs">
              <div>
                <div class="flex justify-between gap-2 text-[11px] mb-0.5">
                  <span class="text-slate-500 dark:text-slate-400">${d.specRangeBattery}</span>
                  <span class="font-mono text-slate-900 dark:text-white font-semibold">${ev.specs.rangeKm} km <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">[${ev.rangeCycle}]</span> <span class="text-slate-500 dark:text-slate-400 font-normal">· ${ev.specs.batteryKwh} kWh</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style="width:${rangePct}%"></div></div>
              </div>
              <div>
                <div class="flex justify-between gap-2 text-[11px] mb-0.5">
                  <span class="text-slate-500 dark:text-slate-400">${d.specPowerAccel}</span>
                  <span class="font-mono text-slate-900 dark:text-white font-semibold">${ev.specs.powerHp} hp <span class="text-slate-500 dark:text-slate-400 font-normal">(${ev.specs.zeroToHundred}s · ${ev.specs.drivetrain})</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full" style="width:${powerPct}%"></div></div>
              </div>
              <div class="flex items-center justify-between pt-1 text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/60">
                <span>${d.specFastCharge}</span>
                <span class="font-mono text-amber-600 dark:text-amber-300 font-semibold">${ev.specs.chargeTimeMin} min (max ${ev.specs.chargingKw} kW)</span>
              </div>
            </div>

            <ul class="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
              ${highlights(ev).map(h => `<li class="flex items-start gap-1.5"><span class="text-sky-500 dark:text-sky-400 mt-0.5" aria-hidden="true">•</span><span class="leading-snug">${h}</span></li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Card Footer: Source + Official Homepage + Compare Button -->
        <div class="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/40">
          <span class="text-[10px] text-slate-500 truncate flex-1" title="${ev.sourceNote}">📌 ${ev.sourceNote}</span>
          <div class="flex items-center gap-1.5 shrink-0">
            ${url ? `
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                class="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition">
                ${d.officialSiteBtn}
              </a>` : ""}
            <button type="button" data-action="compare" data-id="${ev.id}" aria-pressed="${selected}"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selected
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"}">
              ${selected ? d.btnCompareSelected : d.btnCompareAdd}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderCards(list) {
    const d = t();
    $("view-cards").innerHTML = list.length
      ? list.map(cardHtml).join("")
      : `<div class="col-span-full glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
           <div class="text-3xl mb-2" aria-hidden="true">🔍</div>
           <h3 class="text-base font-bold text-slate-900 dark:text-white">${d.emptyTitle}</h3>
           <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${d.emptySub}</p>
         </div>`;
  }

  // ---------------------------------------------------------------- table view
  function renderTable(list) {
    const d = t();
    const headers = [...d.tableHeaders];
    headers[2] = `${periodLabel()} ${headers[2]}`;
    const last = headers.length - 1;

    $("tableHeadRow").innerHTML = headers
      .map((h, i) => {
        const cls =
          i === 0 ? "px-3 sm:px-4 sticky left-0 bg-slate-100 dark:bg-slate-900 z-10"
          : i === 1 ? "px-3"
          : i === 2 ? "px-3 text-right text-sky-600 dark:text-sky-400"
          : i === last ? "px-3 text-center"
          : "px-3 text-right";
        return `<th scope="col" class="py-3.5 ${cls}">${h}</th>`;
      })
      .join("");

    $("evTableBody").innerHTML = list
      .map((ev, idx) => {
        const origin = REGIONS[ev.origin];
        const sales = salesFor(ev);
        const selected = state.compareIds.includes(ev.id);
        const url = officialLink(ev);
        const imgSrc = ev.imageUrl || window.__evFallbackSvg(ev.segmentCode);
        return `
          <tr class="hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition whitespace-nowrap">
            <th scope="row" class="py-2.5 px-3 sm:px-4 sticky left-0 bg-white/95 dark:bg-slate-950/95 z-10 font-sans text-left font-normal">
              <div class="flex items-center gap-2.5">
                <span class="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">${idx + 1}</span>
                <img src="${imgSrc}" alt="${ev.name}" loading="lazy" decoding="async" referrerpolicy="no-referrer"
                  onerror="this.onerror=null;this.src=window.__evFallbackSvg('${ev.segmentCode}')"
                  class="w-11 h-7 rounded object-cover border border-slate-200 dark:border-slate-700 hidden sm:block shrink-0" />
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">${ev.name}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">${subName(ev)}</div>
                </div>
              </div>
            </th>
            <td class="py-2.5 px-3 font-sans"><span class="px-2 py-0.5 rounded text-[11px] border ${origin.badgeClass}">${origin.flag} ${brandLabel(ev)}</span></td>
            <td class="py-2.5 px-3 text-right font-bold text-sky-600 dark:text-sky-300">${sales > 0 ? `${fmt(sales)}${d.unitsSuffix}` : "-"}</td>
            <td class="py-2.5 px-3 text-right">${formatPrice(ev.prices.us, "us")}</td>
            <td class="py-2.5 px-3 text-right text-rose-600 dark:text-rose-300">${formatPrice(ev.prices.cn, "cn")}</td>
            <td class="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-semibold">${formatPrice(ev.prices.kr, "kr")}</td>
            <td class="py-2.5 px-3 text-right">${formatPrice(ev.prices.eu, "eu")}</td>
            <td class="py-2.5 px-3 text-right">${ev.specs.batteryKwh} kWh</td>
            <td class="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">${ev.specs.rangeKm} km <span class="text-[10px] text-slate-400">(${ev.rangeCycle})</span></td>
            <td class="py-2.5 px-3 text-right">${ev.specs.powerHp} hp</td>
            <td class="py-2.5 px-3 text-right">${ev.specs.zeroToHundred}s</td>
            <td class="py-2.5 px-3 text-right text-amber-600 dark:text-amber-300">${ev.specs.chargeTimeMin} min (${ev.specs.architectureV}V)</td>
            <td class="py-2.5 px-3 text-center font-sans">
              <div class="inline-flex items-center gap-1.5">
                ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700">${d.officialSiteShort}</a>` : ""}
                <button type="button" data-action="compare" data-id="${ev.id}" aria-pressed="${selected}"
                  class="px-2 py-1 rounded text-[11px] font-semibold ${selected ? "bg-sky-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"}">
                  ${selected ? d.btnTableSelected : d.btnTableAdd}
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
  }

  // ---------------------------------------------------------------- charts view (Chart.js lazy-loaded)
  function loadChartJs() {
    if (window.Chart) return Promise.resolve();
    if (!chartJsPromise) {
      chartJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = CHART_JS_SRC;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => {
          chartJsPromise = null;
          reject(new Error("Chart.js failed to load"));
        };
        document.head.appendChild(s);
      });
    }
    return chartJsPromise;
  }

  function drawChart(key, canvasId, config) {
    charts[key]?.destroy();
    charts[key] = new window.Chart($(canvasId), config);
  }

  async function renderCharts(list) {
    const d = t();
    $("chartSalesTitle").textContent = d.chartSalesTitle(periodLabel());
    if (!window.Chart) {
      $("chartLoading").textContent = d.chartLoading;
      $("chartLoading").classList.remove("hidden");
      try {
        await loadChartJs();
      } catch {
        return;
      }
      $("chartLoading").classList.add("hidden");
      if (state.activeView !== "charts") return;
    }

    const dark = state.theme === "dark";
    const tick = dark ? "#94a3b8" : "#475569";
    const label = dark ? "#e2e8f0" : "#0f172a";
    const grid = dark ? "rgba(51, 65, 85, 0.35)" : "rgba(203, 213, 225, 0.6)";
    const legend = size => ({ position: "bottom", labels: { color: label, boxWidth: 10, font: { size } } });
    const base = { responsive: true, maintainAspectRatio: false, animation: { duration: 300 } };

    // 1. Top 12 models
    const top12 = [...(list.length ? list : EV_DATA)].sort(SORTERS["sales-desc"]).slice(0, 12);
    drawChart("topBar", "topModelsBarChart", {
      type: "bar",
      data: {
        labels: top12.map(e => `${REGIONS[e.origin].flag} ${brandLabel(e)} ${e.name}`),
        datasets: [{ label: periodLabel(), data: top12.map(e => salesFor(e)), backgroundColor: top12.map(e => ORIGIN_COLORS[e.origin]), borderRadius: 6 }]
      },
      options: {
        ...base,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick }, grid: { color: grid } },
          y: { ticks: { color: label, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });

    // 2. Automaker quarterly trend (respects selected regions)
    const activeBrandSummaries = Object.values(BRAND_QUARTERLY_SUMMARY).filter(info => isRegionMatch(info.origin));
    drawChart("brandLine", "brandTrendLineChart", {
      type: "line",
      data: {
        labels: QUARTERS,
        datasets: activeBrandSummaries.map(info => ({
          label: isKo() ? info.labelKo : info.labelEn,
          data: QUARTERS.map(q => info.sales[q]),
          borderColor: info.color,
          backgroundColor: info.color,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2.5
        }))
      },
      options: {
        ...base,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: legend(10) },
        scales: {
          x: { ticks: { color: tick, font: { size: 10 } }, grid: { color: grid } },
          y: { ticks: { color: tick }, grid: { color: grid }, title: { display: true, text: d.chartBrandYAxis, color: tick } }
        }
      }
    });

    // 3. 4-region price comparison (models sold in >= 3 markets, filtered by selected regions)
    const markets = [
      ["us", d.marketUS, "rgba(56, 189, 248, 0.85)"],
      ["cn", d.marketCN, "rgba(244, 63, 94, 0.85)"],
      ["kr", d.marketKR, "rgba(16, 185, 129, 0.85)"],
      ["eu", d.marketEU, "rgba(245, 158, 11, 0.85)"]
    ];
    const multi = EV_DATA.filter(
      e => isRegionMatch(e.origin) && markets.filter(([m]) => e.prices[m] != null).length >= 3
    ).slice(0, 10);
    drawChart("regionalPrice", "regionalPriceBarChart", {
      type: "bar",
      data: {
        labels: multi.map(e => `${brandLabel(e)} ${e.name.split(" ")[0]}`),
        datasets: markets.map(([m, name, color]) => ({
          label: `${name} (USD)`,
          data: multi.map(e => (e.prices[m] != null ? Math.round(toUSD(e.prices[m], m)) : null)),
          backgroundColor: color
        }))
      },
      options: {
        ...base,
        plugins: { legend: legend(11) },
        scales: {
          x: { ticks: { color: label, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: tick, callback: v => `$${(v / 1000).toFixed(0)}k` }, grid: { color: grid } }
        }
      }
    });

    // 4. Price vs range scatter (respects selected regions)
    drawChart("scatter", "priceRangeScatterChart", {
      type: "scatter",
      data: {
        datasets: ALL_ORIGIN_CODES
          .filter(code => isRegionMatch(code))
          .map(code => ({
            label: `${REGIONS[code].flag} ${regionLabel(code)}`,
            data: EV_DATA.filter(e => e.origin === code && avgUSDPrice(e) != null).map(e => ({
              x: avgUSDPrice(e),
              y: e.specs.rangeKm,
              name: `${brandLabel(e)} ${e.name} (${e.rangeCycle})`
            })),
            backgroundColor: ORIGIN_COLORS[code],
            pointRadius: 6,
            pointHoverRadius: 9
          }))
      },
      options: {
        ...base,
        plugins: {
          legend: legend(11),
          tooltip: { callbacks: { label: ctx => `${ctx.raw.name}: ~$${fmt(ctx.raw.x)} / ${ctx.raw.y} km` } }
        },
        scales: {
          x: { title: { display: true, text: d.chartScatterX, color: tick }, ticks: { color: tick, callback: v => `$${(v / 1000).toFixed(0)}k` }, grid: { color: grid } },
          y: { title: { display: true, text: d.chartScatterY, color: tick }, ticks: { color: tick }, grid: { color: grid } }
        }
      }
    });
  }

  // ---------------------------------------------------------------- compare dock & modal
  function renderCompareDock() {
    const dock = $("compareDock");
    $("compareCountBadge").textContent = state.compareIds.length;
    dock.classList.toggle("translate-y-full", state.compareIds.length === 0);
    dock.toggleAttribute("inert", state.compareIds.length === 0);

    $("compareSlotList").innerHTML = state.compareIds
      .map(id => EV_BY_ID.get(id))
      .filter(Boolean)
      .map(ev => `
        <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs shrink-0">
          <span aria-hidden="true">${REGIONS[ev.origin].flag}</span>
          <span class="font-semibold text-slate-900 dark:text-white">${brandLabel(ev)} ${ev.name}</span>
          <button type="button" data-action="compare" data-id="${ev.id}" aria-label="${t().removeCompare}" class="text-slate-400 hover:text-rose-500 font-bold ml-1">✕</button>
        </div>`)
      .join("");
  }

  function toggleCompare(id) {
    const idx = state.compareIds.indexOf(id);
    if (idx >= 0) {
      state.compareIds.splice(idx, 1);
    } else if (state.compareIds.length >= MAX_COMPARE) {
      alert(t().alertMax4);
      return;
    } else {
      state.compareIds.push(id);
    }
    renderResults();
  }

  function openCompareModal() {
    const d = t();
    const models = state.compareIds.map(id => EV_BY_ID.get(id)).filter(Boolean);
    if (models.length < 2) {
      alert(d.alertMin2);
      return;
    }

    const win = `<span class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">WIN</span>`;
    const bestOf = (fn, pick) => pick(...models.map(fn));
    const rowLabel = text => `<th scope="row" class="py-3 px-3 sm:px-4 font-sans font-normal text-left text-slate-500 dark:text-slate-400">${text}</th>`;
    const row = (label, cellFn) => `<tr>${rowLabel(label)}${models.map(m => `<td class="py-3 px-3 sm:px-4">${cellFn(m)}</td>`).join("")}</tr>`;
    const winRow = (label, valueFn, pick, renderFn) => {
      const best = bestOf(valueFn, pick);
      return row(label, m => `${renderFn(m)}${valueFn(m) === best && valueFn(m) > 0 ? win : ""}`);
    };
    const r = d.modalRows;

    $("compareModalBody").innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800">
              <th scope="col" class="py-3 px-3 sm:px-4 text-slate-500 dark:text-slate-400 w-36 sm:w-44">${r.metric}</th>
              ${models.map(m => {
                const imgSrc = m.imageUrl || window.__evFallbackSvg(m.segmentCode);
                return `
                  <th scope="col" class="py-3 px-3 sm:px-4 min-w-[170px] sm:min-w-[190px] align-top">
                    <img src="${imgSrc}" alt="${m.name}" loading="lazy" decoding="async" referrerpolicy="no-referrer"
                      onerror="this.onerror=null;this.src=window.__evFallbackSvg('${m.segmentCode}')"
                      class="w-full h-24 sm:h-28 object-cover rounded-xl mb-2 border border-slate-200 dark:border-slate-800" />
                    <div class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">${REGIONS[m.origin].flag} ${brandLabel(m)} · ${segmentLabel(m)}</div>
                    <div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${m.name}</div>
                    <div class="text-xs text-sky-600 dark:text-sky-400 font-normal mt-0.5">${subName(m)}</div>
                  </th>`;
              }).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono text-xs">
            ${winRow(r.sales(periodLabel()), m => salesFor(m), Math.max, m => `<strong>${fmt(salesFor(m))}${d.unitsSuffix}</strong>`)}
            ${row(r.krPrice, m => `<span class="text-emerald-700 dark:text-emerald-300 font-semibold">${formatPrice(m.prices.kr, "kr")}</span>`)}
            ${row(r.usPrice, m => formatPrice(m.prices.us, "us"))}
            ${row(r.cnPrice, m => `<span class="text-rose-600 dark:text-rose-300">${formatPrice(m.prices.cn, "cn")}</span>`)}
            ${row(r.euPrice, m => formatPrice(m.prices.eu, "eu"))}
            ${winRow(r.range, m => m.specs.rangeKm, Math.max, m => `<strong>${m.specs.rangeKm} km</strong> <span class="text-[10px] text-slate-400">[${m.rangeCycle}]</span>`)}
            ${winRow(r.battery, m => m.specs.batteryKwh, Math.max, m => `${m.specs.batteryKwh} kWh`)}
            ${winRow(r.power, m => m.specs.powerHp, Math.max, m => `<strong>${m.specs.powerHp} hp</strong>`)}
            ${winRow(r.accel, m => m.specs.zeroToHundred, Math.min, m => `<strong>${m.specs.zeroToHundred}s</strong>`)}
            ${winRow(r.charge, m => m.specs.chargeTimeMin, Math.min, m => `<span class="text-amber-600 dark:text-amber-300 font-semibold">${m.specs.chargeTimeMin} min (${m.specs.chargingKw} kW / ${m.specs.architectureV}V)</span>`)}
            ${row(r.driveSpeed, m => `${m.specs.drivetrain} · ${m.specs.topSpeedKmh} km/h`)}
            ${row(r.weight, m => `${fmt(m.specs.weightKg)} kg`)}
            ${row(r.officialSite, m => {
              const u = officialLink(m);
              return u ? `<a href="${u}" target="_blank" rel="noopener noreferrer" class="font-sans text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">${d.officialSiteBtn}</a>` : "-";
            })}
            ${row(r.source, m => `<span class="font-sans text-[11px] text-slate-500">${m.sourceNote}</span>`)}
          </tbody>
        </table>
      </div>`;

    const modal = $("compareModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    $("closeCompareModalBtn").focus();
  }

  function closeCompareModal() {
    const modal = $("compareModal");
    if (modal.classList.contains("hidden")) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
    $("openCompareModalBtn").focus();
  }

  // ---------------------------------------------------------------- render orchestration
  function renderResults() {
    const list = getFilteredEVs();
    $("resultCountWrapper").innerHTML = t().resultCountHtml(list.length);
    renderKPIs(list);
    // Only the visible view is rendered.
    if (state.activeView === "cards") renderCards(list);
    else if (state.activeView === "table") renderTable(list);
    else renderCharts(list);
    renderCompareDock();
  }

  function renderFilters() {
    renderRegionPills();
    renderBrandChips();
    renderToolbarState();
  }

  function renderAll() {
    renderLanguage();
    renderFilters();
    renderResults();
  }

  // ---------------------------------------------------------------- actions
  const actions = {
    region: el => {
      const code = el.dataset.region;
      if (code === "ALL") {
        state.selectedRegions.clear();
      } else {
        if (state.selectedRegions.has(code)) {
          state.selectedRegions.delete(code);
        } else {
          state.selectedRegions.add(code);
        }
        // If all 5 individual countries are selected, normalize back to ALL (empty Set)
        if (state.selectedRegions.size === ALL_ORIGIN_CODES.length) {
          state.selectedRegions.clear();
        }
      }
      state.selectedBrands.clear();
      renderFilters();
      renderResults();
    },
    "region-preset": el => {
      if (el.dataset.preset === "NO_CN") {
        if (isExcludeChinaPresetActive()) {
          state.selectedRegions.clear();
        } else {
          state.selectedRegions = new Set(NON_CN_CODES);
        }
        state.selectedBrands.clear();
        renderFilters();
        renderResults();
      }
    },
    brand: el => {
      const brand = el.dataset.brand;
      if (!brand) state.selectedBrands.clear();
      else if (state.selectedBrands.has(brand)) state.selectedBrands.delete(brand);
      else state.selectedBrands.add(brand);
      renderBrandChips();
      renderResults();
    },
    quick: el => {
      const prop = QUICK_FILTERS[el.dataset.key];
      state[prop] = !state[prop];
      renderToolbarState();
      renderResults();
    },
    reset: () => {
      Object.assign(state, { segment: "ALL", searchQuery: "", only800V: false, onlyNew: false, onlyBestSeller: false });
      state.selectedRegions.clear();
      state.selectedBrands.clear();
      $("searchInput").value = "";
      $("segmentFilter").value = "ALL";
      renderFilters();
      renderResults();
    },
    view: el => {
      state.activeView = el.dataset.view;
      renderToolbarState();
      renderResults();
    },
    currency: () => {
      state.currencyMode = CURRENCY_ORDER[(CURRENCY_ORDER.indexOf(state.currencyMode) + 1) % CURRENCY_ORDER.length];
      savePrefs();
      renderToolbarState();
      renderResults();
    },
    lang: () => {
      state.lang = isKo() ? "en" : "ko";
      const url = new URL(location.href);
      if (state.lang === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      history.replaceState(null, "", url);
      savePrefs();
      renderAll();
    },
    theme: () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", state.theme === "dark");
      savePrefs();
      renderToolbarState();
      if (state.activeView === "charts") renderResults();
    },
    compare: el => toggleCompare(el.dataset.id),
    "clear-compare": () => {
      state.compareIds = [];
      renderResults();
    },
    "open-compare": openCompareModal,
    "close-compare": closeCompareModal
  };

  function initEvents() {
    document.addEventListener("click", e => {
      const el = e.target.closest("[data-action]");
      if (el && actions[el.dataset.action]) {
        actions[el.dataset.action](el);
        return;
      }
      if (e.target.id === "compareModal") closeCompareModal();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeCompareModal();
    });

    $("globalPeriodSelect").addEventListener("change", e => {
      state.period = e.target.value;
      renderResults();
    });
    $("sortSelect").addEventListener("change", e => {
      state.sortBy = e.target.value;
      renderResults();
    });
    $("segmentFilter").addEventListener("change", e => {
      state.segment = e.target.value;
      renderResults();
    });

    const onSearch = debounce(value => {
      state.searchQuery = value;
      renderResults();
    }, 150);
    $("searchInput").addEventListener("input", e => onSearch(e.target.value));
  }

  // ---------------------------------------------------------------- boot
  staticKoAbout = $("aboutSection").innerHTML;
  initEvents();
  renderAll();
})();
