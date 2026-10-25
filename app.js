/**
 * EV Global Hub — Clean Data-Driven Application Architecture
 * - Automatically adapts to any new vehicle or region added to `data.js`
 * - Zero redundant flags/text in filter UI
 * - Supports Korean / English i18n and Normal (Light) / Night (Dark) modes
 */

const state = {
  lang: "ko",        // 'ko' | 'en'
  theme: "dark",     // 'dark' (Night Mode) | 'light' (Normal Mode)
  period: "2026 Q3",
  region: "ALL",
  selectedBrands: new Set(),
  segment: "ALL",
  searchQuery: "",
  sortBy: "sales-desc",
  only800V: false,
  onlyNew: false,
  onlyBestSeller: false,
  currencyMode: "local", // 'local' | 'krw' | 'usd'
  activeView: "cards",
  compareIds: ["tesla-model-y-juniper", "hyundai-ioniq-9", "bmw-ix3-neue-klasse", "toyota-bz4x"]
};

const chartInstances = {};

// Localization Dictionary
const I18N = {
  ko: {
    headerSubtitle: "전 세계 베스트셀링 & 최신 순수전기차(BEV) 4개국 가격 · 성능 · 분기별 판매량 비교",
    periodLabel: "📅 기준 기간:",
    periods: {
      "2026 Q3": "2026년 3분기 (최신)",
      "2026 Q2": "2026년 2분기",
      "2026 Q1": "2026년 1분기",
      "2025 YEAR": "2025년 연간 합계",
      "2025 Q4": "2025년 4분기",
      "2025 Q3": "2025년 3분기",
      "2025 Q2": "2025년 2분기",
      "2025 Q1": "2025년 1분기",
      "2024 YEAR": "2024년 연간 합계",
      "2024 Q4": "2024년 4분기",
      "2024 Q3": "2024년 3분기",
      "2024 Q2": "2024년 2분기",
      "2024 Q1": "2024년 1분기",
      "ALL": "2024~2026 누적 전체"
    },
    periodShort: { "ALL": "24~26 누적", "2024 YEAR": "2024 연간", "2025 YEAR": "2025 연간" },
    currencyLabels: { local: "현지 통화 표기", krw: "원화(KRW) 환산", usd: "달러(USD) 환산" },
    currencyNote: { local: "현지 통화 기준", krw: "원화(KRW) 환산", usd: "달러(USD) 환산" },
    brandRowLabel: "브랜드",
    allBrandsChip: "전체 브랜드",
    specRowLabel: "세부 조건",
    searchPlaceholder: "모델명, 브랜드, 키워드 검색...",
    sortOptions: {
      "sales-desc": "📊 선택 기간 판매량 많은 순",
      "range-desc": "🔋 주행거리 긴 순 (km)",
      "power-desc": "🐎 최고출력 높은 순 (마력)",
      "accel-asc": "🚀 제로백 빠른 순 (0→100km/h)",
      "charge-asc": "⚡ 10→80% 충전 시간 짧은 순",
      "price-kr-asc": "🇰🇷 한국 출시가 낮은 순",
      "price-us-asc": "🇺🇸 미국 출시가 낮은 순",
      "price-cn-asc": "🇨🇳 중국 출시가 낮은 순",
      "price-eu-asc": "🇪🇺 유럽 출시가 낮은 순",
      "year-desc": "🆕 최신 출시 연도 순"
    },
    segments: {
      "ALL": "모든 차종 (SUV/세단/트럭)",
      "SUV": "SUV / 크로스오버",
      "SEDAN": "세단 / 해치백",
      "TRUCK": "픽업트럭"
    },
    filter800V: "⚡ 800V+ 초급속",
    filterNewOnly: "🆕 신차·최신형",
    filterBestOnly: "🔥 베스트셀러",
    resetBtn: "↺ 필터 초기화",
    tabCards: "차량 카드 & 4개국 가격 비교",
    tabTable: "전체 스펙·가격·판매량 일람표",
    tabCharts: "분기별 판매 추이 & 포지셔닝 차트",
    resultCountHtml: count => `총 <strong class="text-slate-900 dark:text-white font-mono">${count}</strong>개 순수전기차(BEV)`,
    compareHintHtml: `💡 카드 우측 하단 <strong class="text-sky-600 dark:text-sky-400">[+ 비교 담기]</strong>로 최대 4대까지 1:1 대조`,
    emptyTitle: "선택한 필터 조건에 맞는 순수전기차가 없습니다.",
    emptySub: "상단의 [↺ 필터 초기화] 버튼을 눌러 조건을 해제해 보세요.",
    modelYearSuffix: "년형",
    globalSalesLabel: period => `${period} 글로벌 판매량`,
    unitsSuffix: "대",
    preRelease: "출시 초기 / 집계중",
    newLaunchBadge: "신규",
    qoqSuffix: "전분기비",
    recent7Q: "최근 7분기 추이",
    price4RegionTitle: "🌍 4개국 출시 가격",
    marketKR: "🇰🇷 한국",
    marketUS: "🇺🇸 미국",
    marketCN: "🇨🇳 중국",
    marketEU: "🇪🇺 유럽",
    notReleased: "미출시",
    specRangeBattery: "🔋 주행거리 · 배터리",
    specPowerAccel: "🐎 최고출력 · 제로백",
    specFastCharge: "⚡ 10→80% 급속충전",
    curbWeight: "공차중량",
    btnCompareSelected: "✓ 비교함 담김",
    btnCompareAdd: "+ 비교 담기",
    btnTableSelected: "✓ 선택됨",
    btnTableAdd: "+ 담기",
    tableHeaders: [
      "순위 / 모델", "국가 · 브랜드", "판매량", "🇺🇸 미국 가격", "🇨🇳 중국 가격",
      "🇰🇷 한국 가격", "🇪🇺 유럽 가격", "배터리", "주행거리", "최고출력", "제로백", "초급속(10-80%)", "비교"
    ],
    chartSalesTitle: period => `${period} 글로벌 판매 TOP 12 순수전기차`,
    chartSalesSub: "상단 기간 선택기와 국가·브랜드 필터에 맞춰 실시간으로 순위가 반영됩니다.",
    chartBrandTitle: "주요 제조사 그룹별 분기 순수전기차(BEV) 판매 추이",
    chartBrandSub: "2024 Q1 ~ 2026 Q3 글로벌 분기별 인도량 (플러그인 하이브리드 제외 순수 BEV, 단위: 천 대)",
    chartBrandYAxis: "판매량 (천 대)",
    chartPriceTitle: "주요 글로벌 모델 4개국(미국·중국·한국·유럽) 시작가 비교 (USD 환산)",
    chartPriceSub: "동일 모델의 국가별 공식 MSRP 시작가 격차 비교",
    chartScatterTitle: "가격 대비 주행거리(가성비) 포지셔닝 맵",
    chartScatterSub: "X축: 글로벌 평균 시작가(USD 환산) / Y축: 1회 충전 주행거리(km)",
    chartScatterX: "글로벌 평균 시작가 (USD 환산)",
    chartScatterY: "1회 충전 주행거리 (km)",
    clearBtn: "비우기",
    openCompareBtn: "⚡ 선택 차량 상세 비교하기",
    modalTitle: "⚔️ 순수전기차 1:1 스펙 · 4개국 가격 · 판매량 정밀 비교",
    modalSub: "비교 차량 중 각 항목 최고 스펙에 초록색 WIN 배지가 표시됩니다.",
    modalRows: {
      metric: "비교 항목",
      sales: period => `📊 ${period} 판매량`,
      krPrice: "🇰🇷 한국 출시가",
      usPrice: "🇺🇸 미국 출시가",
      cnPrice: "🇨🇳 중국 출시가",
      euPrice: "🇪🇺 유럽 출시가",
      range: "🔋 1회 충전 주행거리",
      battery: "⚡ 배터리 용량",
      power: "🐎 최고 출력",
      accel: "🚀 제로백 (0→100km/h)",
      charge: "🔌 초급속 충전 (10→80%)",
      driveSpeed: "⚙️ 구동방식 · 최고속도",
      weight: "⚖️ 공차중량",
      source: "📌 제원 기준 출처"
    },
    alertMax4: "최대 4대까지 동시에 비교할 수 있습니다. 기존 차량을 하나 제외한 뒤 추가해 주세요.",
    alertMin2: "2대 이상의 차량을 비교함에 담아주세요.",
    footnoteHtml: `
      <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <span>✅</span> 데이터 검증 원칙 및 공식 출처 안내 (100% Pure BEV Only)
      </div>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>하이브리드(HEV/PHEV/EREV) 완전 배제:</strong> 본 대시보드의 모든 차량과 제조사 판매량은 플러그인 하이브리드(PHEV)를 제외한 <strong>100% 순수 배터리 전기차(BEV)</strong>만 수록했습니다.</li>
        <li><strong>제원 및 인증 기준 출처:</strong> 각 제조사 공식 미디어룸(Hyundai/Kia, Tesla, BMW Group, Mercedes-Benz, VW/Audi/Porsche, BYD, Xiaomi, Geely/Zeekr, Toyota, Honda, Nissan), 유럽 WLTP, 미국 EPA, 한국 산업통상자원부·환경부 무공해차 통합누리집, EV-Database 공식 제원을 교차 검증했습니다. 각 카드에 인증 주행거리 기준(<code class="text-slate-700 dark:text-slate-300">WLTP</code> / <code class="text-slate-700 dark:text-slate-300">EPA</code> / <code class="text-slate-700 dark:text-slate-300">CLTC</code>)이 명시되어 있습니다.</li>
        <li><strong>지역별 가격 및 환율 기준:</strong> 미국(USD, 보조금 전 MSRP), 중국(CNY, 공식 시작가), 한국(만 원, 친환경차 세제혜택 후·보조금 전 공식 가격), 유럽(EUR, 독일 부가세 19% 포함 시작가). 통화 환산 모드는 <code class="text-slate-700 dark:text-slate-300">1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code> 기준입니다.</li>
      </ul>
    `
  },
  en: {
    headerSubtitle: "Global Best-Selling & Latest Pure BEVs: 4-Region Pricing, Verified Specs & Quarterly Sales",
    periodLabel: "📅 Period:",
    periods: {
      "2026 Q3": "2026 Q3 (Latest)",
      "2026 Q2": "2026 Q2",
      "2026 Q1": "2026 Q1",
      "2025 YEAR": "2025 Full Year",
      "2025 Q4": "2025 Q4",
      "2025 Q3": "2025 Q3",
      "2025 Q2": "2025 Q2",
      "2025 Q1": "2025 Q1",
      "2024 YEAR": "2024 Full Year",
      "2024 Q4": "2024 Q4",
      "2024 Q3": "2024 Q3",
      "2024 Q2": "2024 Q2",
      "2024 Q1": "2024 Q1",
      "ALL": "2024–2026 Cumulative"
    },
    periodShort: { "ALL": "24–26 Total", "2024 YEAR": "2024 FY", "2025 YEAR": "2025 FY" },
    currencyLabels: { local: "Local Currency", krw: "In KRW (₩)", usd: "In USD ($)" },
    currencyNote: { local: "Local Currencies", krw: "Converted to KRW", usd: "Converted to USD" },
    brandRowLabel: "Brand",
    allBrandsChip: "All Brands",
    specRowLabel: "Filters",
    searchPlaceholder: "Search model, brand, keywords...",
    sortOptions: {
      "sales-desc": "📊 Highest Sales (Selected Period)",
      "range-desc": "🔋 Longest Driving Range (km)",
      "power-desc": "🐎 Highest Horsepower (hp)",
      "accel-asc": "🚀 Fastest 0→100 km/h (sec)",
      "charge-asc": "⚡ Shortest 10→80% Charge (min)",
      "price-kr-asc": "🇰🇷 Lowest Price in Korea",
      "price-us-asc": "🇺🇸 Lowest Price in USA",
      "price-cn-asc": "🇨🇳 Lowest Price in China",
      "price-eu-asc": "🇪🇺 Lowest Price in Europe",
      "year-desc": "🆕 Newest Model Year First"
    },
    segments: {
      "ALL": "All Segments (SUV/Sedan/Truck)",
      "SUV": "SUV / Crossover",
      "SEDAN": "Sedan / Hatchback",
      "TRUCK": "Pickup Truck"
    },
    filter800V: "⚡ 800V+ Ultra-Fast",
    filterNewOnly: "🆕 New Releases",
    filterBestOnly: "🔥 Best-Sellers",
    resetBtn: "↺ Reset Filters",
    tabCards: "Vehicle Cards & 4-Region Prices",
    tabTable: "Full Specs, Price & Sales Table",
    tabCharts: "Quarterly Trends & Value Charts",
    resultCountHtml: count => `Showing <strong class="text-slate-900 dark:text-white font-mono">${count}</strong> Pure BEVs`,
    compareHintHtml: `💡 Click <strong class="text-sky-600 dark:text-sky-400">[+ Compare]</strong> on up to 4 cards for side-by-side comparison`,
    emptyTitle: "No pure electric vehicles match your filter criteria.",
    emptySub: "Click [↺ Reset Filters] above to clear active filters.",
    modelYearSuffix: " MY",
    globalSalesLabel: period => `${period} Global Sales`,
    unitsSuffix: " units",
    preRelease: "Pre-launch / N/A",
    newLaunchBadge: "NEW",
    qoqSuffix: "QoQ",
    recent7Q: "Last 7 Quarters",
    price4RegionTitle: "🌍 4-Region Starting Prices",
    marketKR: "🇰🇷 Korea",
    marketUS: "🇺🇸 USA",
    marketCN: "🇨🇳 China",
    marketEU: "🇪🇺 Europe",
    notReleased: "N/A",
    specRangeBattery: "🔋 Range · Battery",
    specPowerAccel: "🐎 Power · 0–100 km/h",
    specFastCharge: "⚡ 10→80% Fast Charge",
    curbWeight: "Weight",
    btnCompareSelected: "✓ In Compare",
    btnCompareAdd: "+ Compare",
    btnTableSelected: "✓ Added",
    btnTableAdd: "+ Add",
    tableHeaders: [
      "Rank / Model", "Origin · Brand", "Sales", "🇺🇸 USA Price", "🇨🇳 China Price",
      "🇰🇷 Korea Price", "🇪🇺 Europe Price", "Battery", "Range", "Power", "0–100", "10–80% Charge", "Compare"
    ],
    chartSalesTitle: period => `${period} Top 12 Best-Selling Global BEVs`,
    chartSalesSub: "Updates dynamically based on your selected period, country, and brand filters.",
    chartBrandTitle: "Quarterly Pure BEV Deliveries by Automaker Group",
    chartBrandSub: "2024 Q1 – 2026 Q3 Global Quarterly Pure BEV Volume (excluding PHEVs, in thousands)",
    chartBrandYAxis: "Deliveries (k units)",
    chartPriceTitle: "4-Region Starting Price Comparison (Normalized to USD)",
    chartPriceSub: "Comparing official base prices across USA, China, South Korea, and Europe",
    chartScatterTitle: "Driving Range vs. Global Average Price Positioning Map",
    chartScatterSub: "X-Axis: Global Average Starting Price (USD) / Y-Axis: Driving Range (km)",
    chartScatterX: "Global Average Starting Price (USD)",
    chartScatterY: "Driving Range (km)",
    clearBtn: "Clear",
    openCompareBtn: "⚡ Compare Selected Models",
    modalTitle: "⚔️ Pure BEV Head-to-Head Specs, 4-Region Prices & Sales Comparison",
    modalSub: "Green WIN badges highlight the leading specification in each category.",
    modalRows: {
      metric: "Specification",
      sales: period => `📊 ${period} Sales`,
      krPrice: "🇰🇷 Korea Price",
      usPrice: "🇺🇸 USA Price",
      cnPrice: "🇨🇳 China Price",
      euPrice: "🇪🇺 Europe Price",
      range: "🔋 Certified Range",
      battery: "⚡ Battery Capacity",
      power: "🐎 Max Power",
      accel: "🚀 0→100 km/h",
      charge: "🔌 Fast Charge (10→80%)",
      driveSpeed: "⚙️ Drivetrain · Top Speed",
      weight: "⚖️ Curb Weight",
      source: "📌 Verified Spec Source"
    },
    alertMax4: "You can compare up to 4 vehicles at once. Please remove a vehicle first.",
    alertMin2: "Please add at least 2 vehicles to compare.",
    footnoteHtml: `
      <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <span>✅</span> Data Verification & Official Sources (100% Pure BEV Only)
      </div>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>Strictly Pure BEVs Only (No Hybrids):</strong> Every vehicle and automaker sales figure in this dashboard represents <strong>100% pure Battery Electric Vehicles (BEVs)</strong>. All HEVs, PHEVs, and EREVs are excluded.</li>
        <li><strong>Verified Sources:</strong> Specifications and quarterly volumes are cross-checked against official OEM pressrooms (Hyundai/Kia, Tesla, BMW Group, Mercedes-Benz, VW/Audi/Porsche, BYD, Xiaomi, Geely/Zeekr, Toyota, Honda, Nissan), WLTP, US EPA, Korea MOTIE, and EV-Database. Each card displays its range certification standard (<code class="text-slate-700 dark:text-slate-300">WLTP</code> / <code class="text-slate-700 dark:text-slate-300">EPA</code> / <code class="text-slate-700 dark:text-slate-300">CLTC</code>).</li>
        <li><strong>Regional Pricing & FX Basis:</strong> USA (USD base MSRP), China (CNY official starting price), South Korea (KRW after eco-tax benefit before subsidy), Europe (EUR German price incl. 19% VAT). Currency conversion uses <code class="text-slate-700 dark:text-slate-300">1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code>.</li>
      </ul>
    `
  }
};

const t = () => I18N[state.lang];
const getBrandLabel = ev => (state.lang === "ko" ? ev.brandKo : ev.brand);
const getSubName = ev => (state.lang === "ko" ? ev.nameKo : ev.nameEn || ev.name);
const getSegmentLabel = ev => (state.lang === "ko" ? ev.segment : ev.segmentEn || ev.segment);
const getBadgeLabel = ev => (state.lang === "ko" ? ev.badge : ev.badgeEn || ev.badge);
const getHighlights = ev => (state.lang === "ko" ? ev.highlights : ev.highlightsEn || ev.highlights);
const getRegionLabel = code => (state.lang === "ko" ? REGIONS[code]?.labelKo : REGIONS[code]?.labelEn);

// Sales & Price Helpers
function getSalesForPeriod(ev, period = state.period) {
  const qs = ev.quarterlySales || {};
  if (period === "ALL") return Object.values(qs).reduce((sum, v) => sum + (v || 0), 0);
  if (period === "2024 YEAR") return (qs["2024 Q1"] || 0) + (qs["2024 Q2"] || 0) + (qs["2024 Q3"] || 0) + (qs["2024 Q4"] || 0);
  if (period === "2025 YEAR") return (qs["2025 Q1"] || 0) + (qs["2025 Q2"] || 0) + (qs["2025 Q3"] || 0) + (qs["2025 Q4"] || 0);
  return qs[period] || 0;
}

function getQoQChange(ev, period = state.period) {
  const idx = QUARTERS.indexOf(period);
  if (idx <= 0) return null;
  const prevSales = ev.quarterlySales[QUARTERS[idx - 1]] || 0;
  const currSales = ev.quarterlySales[period] || 0;
  if (prevSales === 0) return currSales > 0 ? "NEW" : null;
  return ((currSales - prevSales) / prevSales) * 100;
}

function toUSD(amount, market) {
  if (amount == null) return null;
  if (market === "us") return amount;
  if (market === "cn") return amount / EXCHANGE_RATES.CNY;
  if (market === "kr") return (amount * 10000) / EXCHANGE_RATES.KRW;
  if (market === "eu") return amount / EXCHANGE_RATES.EUR;
  return null;
}

function formatMarketPrice(amount, market, mode = state.currencyMode) {
  const dict = t();
  if (amount == null) return `<span class="text-slate-400 dark:text-slate-600 text-[11px]">${dict.notReleased}</span>`;
  const usd = toUSD(amount, market);

  if (mode === "local") {
    if (market === "us") return `$${amount.toLocaleString()}`;
    if (market === "cn") return `¥${amount.toLocaleString()}`;
    if (market === "kr") {
      if (state.lang === "en") return `₩${(amount / 100).toFixed(1)}M`;
      if (amount >= 10000) {
        const eok = Math.floor(amount / 10000);
        const man = amount % 10000;
        return man > 0 ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억 원`;
      }
      return `${amount.toLocaleString()}만 원`;
    }
    if (market === "eu") return `€${amount.toLocaleString()}`;
  } else if (mode === "krw") {
    const manWon = Math.round((usd * EXCHANGE_RATES.KRW) / 10000);
    if (state.lang === "en") return `~₩${(manWon / 100).toFixed(1)}M`;
    if (manWon >= 10000) {
      const eok = Math.floor(manWon / 10000);
      const man = manWon % 10000;
      return `약 ${eok}억 ${man.toLocaleString()}만`;
    }
    return `약 ${manWon.toLocaleString()}만 원`;
  } else if (mode === "usd") {
    return `~$${Math.round(usd).toLocaleString()}`;
  }
  return "-";
}

function getAverageUSDPrice(ev) {
  const usdList = ["us", "cn", "kr", "eu"].map(m => toUSD(ev.prices[m], m)).filter(v => v != null);
  return usdList.length ? Math.round(usdList.reduce((a, b) => a + b, 0) / usdList.length) : 50000;
}

function getPeriodLabel(period = state.period) {
  return t().periodShort[period] || period;
}

// Theme Management
function applyTheme() {
  const isDark = state.theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.getElementById("themeToggleIcon").textContent = isDark ? "🌙" : "☀️";
  document.getElementById("themeToggleLabel").textContent = isDark ? "Night Mode" : "Normal Mode";
}

// Sync Static Controls
function syncStaticTexts() {
  const dict = t();
  document.documentElement.lang = state.lang;

  document.getElementById("headerSubtitle").textContent = dict.headerSubtitle;
  document.getElementById("periodLabelText").textContent = dict.periodLabel;
  document.getElementById("currencyToggleLabel").textContent = dict.currencyLabels[state.currencyMode];
  document.getElementById("langToggleLabel").textContent = state.lang === "ko" ? "English" : "한국어";
  document.getElementById("brandRowLabel").textContent = dict.brandRowLabel;
  document.getElementById("specRowLabel").textContent = dict.specRowLabel;

  // Period Select
  const periodOrder = [
    "2026 Q3", "2026 Q2", "2026 Q1",
    "2025 YEAR", "2025 Q4", "2025 Q3", "2025 Q2", "2025 Q1",
    "2024 YEAR", "2024 Q4", "2024 Q3", "2024 Q2", "2024 Q1", "ALL"
  ];
  document.getElementById("globalPeriodSelect").innerHTML = periodOrder
    .map(p => `<option value="${p}" ${state.period === p ? "selected" : ""}>${dict.periods[p]}</option>`)
    .join("");

  // Search, Sort, Segment
  document.getElementById("searchInput").placeholder = dict.searchPlaceholder;
  document.getElementById("sortSelect").innerHTML = Object.entries(dict.sortOptions)
    .map(([val, label]) => `<option value="${val}" ${state.sortBy === val ? "selected" : ""}>${label}</option>`)
    .join("");
  document.getElementById("segmentFilter").innerHTML = Object.entries(dict.segments)
    .map(([val, label]) => `<option value="${val}" ${state.segment === val ? "selected" : ""}>${label}</option>`)
    .join("");

  // Quick Feature Toggles
  document.getElementById("filter800V").textContent = dict.filter800V;
  document.getElementById("filterNewOnly").textContent = dict.filterNewOnly;
  document.getElementById("filterBestOnly").textContent = dict.filterBestOnly;
  document.getElementById("resetFiltersBtn").textContent = dict.resetBtn;

  // View Tabs & Hints
  document.getElementById("tabCardsLabel").textContent = dict.tabCards;
  document.getElementById("tabTableLabel").textContent = dict.tabTable;
  document.getElementById("tabChartsLabel").textContent = dict.tabCharts;
  document.getElementById("compareHintText").innerHTML = dict.compareHintHtml;

  // Charts & Footnotes
  document.getElementById("chartSalesSub").textContent = dict.chartSalesSub;
  document.getElementById("chartBrandTitle").textContent = dict.chartBrandTitle;
  document.getElementById("chartBrandSub").textContent = dict.chartBrandSub;
  document.getElementById("chartPriceTitle").textContent = dict.chartPriceTitle;
  document.getElementById("chartPriceSub").textContent = dict.chartPriceSub;
  document.getElementById("chartScatterTitle").textContent = dict.chartScatterTitle;
  document.getElementById("chartScatterSub").textContent = dict.chartScatterSub;
  document.getElementById("footnoteSection").innerHTML = dict.footnoteHtml;

  // Compare Dock & Modal
  document.getElementById("clearCompareBtn").textContent = dict.clearBtn;
  document.getElementById("openCompareBtnText").textContent = dict.openCompareBtn;
  document.getElementById("modalTitle").textContent = dict.modalTitle;
  document.getElementById("modalSub").textContent = dict.modalSub;
}

// Filter & Sort Engine
function getFilteredAndSortedEVs() {
  const filtered = EV_DATA.filter(ev => {
    if (state.region !== "ALL" && ev.origin !== state.region) return false;
    if (state.selectedBrands.size > 0 && !state.selectedBrands.has(ev.brand)) return false;
    if (state.segment !== "ALL" && ev.segmentCode !== state.segment) return false;
    if (state.only800V && ev.specs.architectureV < 800) return false;
    if (state.onlyNew && !ev.isNew) return false;
    if (state.onlyBestSeller && !ev.isBestSeller) return false;

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      const target = `${ev.brand} ${ev.brandKo} ${ev.name} ${ev.nameKo} ${ev.nameEn || ""} ${ev.segment} ${ev.segmentEn || ""} ${ev.badge} ${ev.badgeEn || ""} ${ev.highlights.join(" ")} ${(ev.highlightsEn || []).join(" ")}`.toLowerCase();
      if (!target.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case "sales-desc":   return getSalesForPeriod(b) - getSalesForPeriod(a);
      case "range-desc":   return b.specs.rangeKm - a.specs.rangeKm;
      case "power-desc":   return b.specs.powerHp - a.specs.powerHp;
      case "accel-asc":    return a.specs.zeroToHundred - b.specs.zeroToHundred;
      case "charge-asc":   return a.specs.chargeTimeMin - b.specs.chargeTimeMin;
      case "price-kr-asc": return (a.prices.kr ?? 999999) - (b.prices.kr ?? 999999);
      case "price-us-asc": return (a.prices.us ?? 999999) - (b.prices.us ?? 999999);
      case "price-cn-asc": return (a.prices.cn ?? 9999999) - (b.prices.cn ?? 9999999);
      case "price-eu-asc": return (a.prices.eu ?? 999999) - (b.prices.eu ?? 999999);
      case "year-desc":    return b.releaseYear - a.releaseYear || getSalesForPeriod(b) - getSalesForPeriod(a);
      default:             return 0;
    }
  });

  return filtered;
}

// Render Clean 3-Tier Filter Controls (Region Pills + Brand Chips)
function renderFilterMeta() {
  const dict = t();

  // 1. Region Pills (Single clean row: Flag + Country Name + Count)
  const regionGroup = document.getElementById("regionFilterGroup");
  regionGroup.innerHTML = Object.keys(REGIONS)
    .map(code => {
      const meta = REGIONS[code];
      const count = code === "ALL" ? EV_DATA.length : EV_DATA.filter(e => e.origin === code).length;
      const isActive = state.region === code;
      const label = state.lang === "ko" ? meta.labelKo : meta.labelEn;
      return `
        <button data-region="${code}" class="region-pill ${isActive ? "active" : ""} px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0">
          <span>${meta.flag}</span>
          <span>${label}</span>
          <span class="opacity-75 font-mono text-xs">(${count})</span>
        </button>
      `;
    })
    .join("");

  regionGroup.querySelectorAll("[data-region]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.region = btn.getAttribute("data-region");
      state.selectedBrands.clear();
      renderAll();
    });
  });

  // 2. Brand Chips (Clean manufacturer names with model counts, no duplicate flags)
  const brandContainer = document.getElementById("brandFilterGroup");
  const relevantEVs = state.region === "ALL" ? EV_DATA : EV_DATA.filter(e => e.origin === state.region);
  const brandMap = new Map();
  relevantEVs.forEach(e => {
    if (!brandMap.has(e.brand)) {
      brandMap.set(e.brand, { brand: e.brand, brandKo: e.brandKo, count: 0 });
    }
    brandMap.get(e.brand).count += 1;
  });

  const allBrandsActive = state.selectedBrands.size === 0;
  const allChipHtml = `
    <button data-brand="__ALL__" class="brand-chip ${allBrandsActive ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-semibold transition">
      ${dict.allBrandsChip}
    </button>
  `;

  const brandChipsHtml = Array.from(brandMap.values())
    .map(b => {
      const isActive = state.selectedBrands.has(b.brand);
      const label = state.lang === "ko" ? b.brandKo : b.brand;
      return `
        <button data-brand="${b.brand}" class="brand-chip ${isActive ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1">
          <span>${label}</span>
          <span class="opacity-60 font-mono text-[11px]">${b.count}</span>
        </button>
      `;
    })
    .join("");

  brandContainer.innerHTML = allChipHtml + brandChipsHtml;

  brandContainer.querySelectorAll("[data-brand]").forEach(btn => {
    btn.addEventListener("click", () => {
      const br = btn.getAttribute("data-brand");
      if (br === "__ALL__") {
        state.selectedBrands.clear();
      } else if (state.selectedBrands.has(br)) {
        state.selectedBrands.delete(br);
      } else {
        state.selectedBrands.add(br);
      }
      renderAll();
    });
  });
}

// Render KPI Top Summary Cards (Data-Driven Loop)
function renderKPIs(list) {
  const pool = list.length > 0 ? list : EV_DATA;
  const periodLabel = getPeriodLabel();
  const isKo = state.lang === "ko";

  const topSeller = [...pool].sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a))[0];
  const topRange = [...pool].sort((a, b) => b.specs.rangeKm - a.specs.rangeKm)[0];
  const topAccel = [...pool].sort((a, b) => a.specs.zeroToHundred - b.specs.zeroToHundred)[0];
  const topCharge = [...pool].sort((a, b) => a.specs.chargeTimeMin - b.specs.chargeTimeMin)[0];

  const kpiCards = [
    {
      title: isKo ? `${periodLabel} 최다 판매 모델` : `Top Seller (${periodLabel})`,
      badge: isKo ? "🏆 판매 1위" : "🏆 #1 Sales",
      colorClass: "text-sky-600 dark:text-sky-400",
      name: `${getBrandLabel(topSeller)} ${topSeller.name}`,
      val: isKo
        ? `${getSalesForPeriod(topSeller).toLocaleString()}대 판매 (${periodLabel})`
        : `${getSalesForPeriod(topSeller).toLocaleString()} units (${periodLabel})`
    },
    {
      title: isKo ? "최장 1회 충전 주행거리" : "Longest Driving Range",
      badge: isKo ? "🔋 주행거리 1위" : "🔋 #1 Range",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      name: `${getBrandLabel(topRange)} ${topRange.name}`,
      val: `${topRange.specs.rangeKm} km (${topRange.rangeCycle} · ${topRange.specs.batteryKwh} kWh)`
    },
    {
      title: isKo ? "최단 제로백 (0→100km/h)" : "Fastest 0→100 km/h",
      badge: isKo ? "🚀 가속력 1위" : "🚀 #1 Sprint",
      colorClass: "text-rose-600 dark:text-rose-400",
      name: `${getBrandLabel(topAccel)} ${topAccel.name}`,
      val: isKo
        ? `0→100km/h ${topAccel.specs.zeroToHundred}초 (${topAccel.specs.powerHp}마력)`
        : `0→100km/h in ${topAccel.specs.zeroToHundred}s (${topAccel.specs.powerHp} hp)`
    },
    {
      title: isKo ? "최고 충전 속도 / 전압" : "Fastest 10→80% Charging",
      badge: isKo ? "⚡ 초급속 1위" : "⚡ #1 Charging",
      colorClass: "text-amber-600 dark:text-amber-400",
      name: `${getBrandLabel(topCharge)} ${topCharge.name}`,
      val: isKo
        ? `10→80% ${topCharge.specs.chargeTimeMin}분 (${topCharge.specs.architectureV}V · ${topCharge.specs.chargingKw}kW)`
        : `10→80% in ${topCharge.specs.chargeTimeMin}m (${topCharge.specs.architectureV}V · ${topCharge.specs.chargingKw}kW)`
    }
  ];

  document.getElementById("kpiSection").innerHTML = kpiCards
    .map(
      c => `
      <div class="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>${c.title}</span>
          <span class="${c.colorClass} font-semibold">${c.badge}</span>
        </div>
        <div class="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">${c.name}</div>
        <div class="text-xs ${c.colorClass} font-mono mt-1">${c.val}</div>
      </div>
    `
    )
    .join("");
}

// Sparkline Builder
function buildSparklineHTML(ev) {
  const dict = t();
  const recentQuarters = QUARTERS.slice(-7);
  const vals = recentQuarters.map(q => ev.quarterlySales[q] || 0);
  const maxVal = Math.max(...vals, 1);

  return `
    <div class="flex items-end gap-1 h-8 pt-1">
      ${recentQuarters
        .map((q, i) => {
          const v = vals[i];
          const heightPct = Math.max(12, Math.round((v / maxVal) * 100));
          const isCurrent = q === state.period;
          const barColor = isCurrent
            ? "bg-sky-500 dark:bg-sky-400"
            : "bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600";
          return `
            <div class="flex-1 flex flex-col items-center h-full justify-end" title="${q}: ${v.toLocaleString()}${dict.unitsSuffix}">
              <div class="w-full rounded-t ${barColor} transition-all" style="height: ${heightPct}%"></div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// Render Vehicle Cards Grid
function renderCards(list) {
  const dict = t();
  const container = document.getElementById("view-cards");
  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <div class="text-3xl mb-2">🔍</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">${dict.emptyTitle}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${dict.emptySub}</p>
      </div>
    `;
    return;
  }

  const periodLabel = getPeriodLabel();

  container.innerHTML = list
    .map((ev, index) => {
      const originMeta = REGIONS[ev.origin];
      const sales = getSalesForPeriod(ev);
      const qoq = getQoQChange(ev);
      const isSelected = state.compareIds.includes(ev.id);

      let qoqBadge = "";
      if (qoq === "NEW") {
        qoqBadge = `<span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">${dict.newLaunchBadge}</span>`;
      } else if (typeof qoq === "number") {
        const sign = qoq >= 0 ? "+" : "";
        const cls = qoq >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
        qoqBadge = `<span class="text-[11px] font-mono ${cls}">(${sign}${qoq.toFixed(1)}% ${dict.qoqSuffix})</span>`;
      }

      const rangePct = Math.min(100, Math.round((ev.specs.rangeKm / 800) * 100));
      const powerPct = Math.min(100, Math.round((ev.specs.powerHp / 850) * 100));

      return `
        <article class="ev-card glass-card rounded-2xl border ${
          isSelected ? "border-sky-500/80 ring-1 ring-sky-500/40" : "border-slate-200 dark:border-slate-800/90"
        } p-5 flex flex-col justify-between group">
          <div>
            <!-- Top Row: Rank + Country/Brand + Segment + Architecture -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  ${index + 1}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold border ${originMeta.badgeClass}">
                  ${originMeta.flag} ${getBrandLabel(ev)}
                </span>
                <span class="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                  ${getSegmentLabel(ev)}
                </span>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                ${
                  ev.specs.architectureV >= 800
                    ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">${ev.specs.architectureV}V</span>`
                    : ""
                }
                ${
                  ev.isNew
                    ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">NEW</span>`
                    : ""
                }
              </div>
            </div>

            <!-- Vehicle Title & Subtitle -->
            <div class="mb-3">
              <div class="flex items-baseline justify-between gap-2">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition">
                  ${ev.name}
                </h2>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">${ev.releaseYear}${dict.modelYearSuffix}</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${getSubName(ev)}</p>
              <div class="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-sky-50 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 text-[11px] text-sky-700 dark:text-sky-300 font-medium">
                ✨ ${getBadgeLabel(ev)}
              </div>
            </div>

            <!-- Quarterly Sales Banner + Sparkline -->
            <div class="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 mb-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">${dict.globalSalesLabel(periodLabel)}</div>
                  <div class="flex items-baseline gap-1.5 mt-0.5">
                    <span class="text-base font-bold font-mono text-slate-900 dark:text-white">
                      ${sales > 0 ? `${sales.toLocaleString()}${dict.unitsSuffix}` : dict.preRelease}
                    </span>
                    ${qoqBadge}
                  </div>
                </div>
                <div class="w-24">
                  <div class="text-[10px] text-slate-500 text-right mb-0.5">${dict.recent7Q}</div>
                  ${buildSparklineHTML(ev)}
                </div>
              </div>
            </div>

            <!-- 4-Market Price Grid (US / CN / KR / EU) -->
            <div class="mb-3.5">
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>${dict.price4RegionTitle}</span>
                <span class="text-[10px] text-slate-500">${dict.currencyNote[state.currencyMode]}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div class="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400 font-sans text-[11px]">${dict.marketKR}</span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-semibold">${formatMarketPrice(ev.prices.kr, "kr")}</span>
                </div>
                <div class="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400 font-sans text-[11px]">${dict.marketUS}</span>
                  <span class="text-slate-800 dark:text-slate-200">${formatMarketPrice(ev.prices.us, "us")}</span>
                </div>
                <div class="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400 font-sans text-[11px]">${dict.marketCN}</span>
                  <span class="text-rose-600 dark:text-rose-300">${formatMarketPrice(ev.prices.cn, "cn")}</span>
                </div>
                <div class="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400 font-sans text-[11px]">${dict.marketEU}</span>
                  <span class="text-slate-800 dark:text-slate-200">${formatMarketPrice(ev.prices.eu, "eu")}</span>
                </div>
              </div>
            </div>

            <!-- Performance Specs Summary -->
            <div class="space-y-2 mb-3.5 text-xs">
              <div>
                <div class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-500 dark:text-slate-400">${dict.specRangeBattery}</span>
                  <span class="font-mono text-slate-900 dark:text-white font-semibold">${ev.specs.rangeKm} km <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">[${ev.rangeCycle}]</span> <span class="text-slate-500 dark:text-slate-400 font-normal">· ${ev.specs.batteryKwh} kWh</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style="width: ${rangePct}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-500 dark:text-slate-400">${dict.specPowerAccel}</span>
                  <span class="font-mono text-slate-900 dark:text-white font-semibold">${ev.specs.powerHp} hp <span class="text-slate-500 dark:text-slate-400 font-normal">(${ev.specs.zeroToHundred}s · ${ev.specs.drivetrain})</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full" style="width: ${powerPct}%"></div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-1 text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/60">
                <span>${dict.specFastCharge}</span>
                <span class="font-mono text-amber-600 dark:text-amber-300 font-semibold">${ev.specs.chargeTimeMin}m (Max ${ev.specs.chargingKw}kW)</span>
              </div>
            </div>

            <!-- Highlights Bullet Points -->
            <ul class="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
              ${getHighlights(ev)
                .map(
                  h => `
                <li class="flex items-start gap-1.5">
                  <span class="text-sky-500 dark:text-sky-400 mt-0.5">•</span>
                  <span class="leading-snug">${h}</span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>

          <!-- Action Footer -->
          <div class="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <span class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[60%]" title="${ev.sourceNote}">
              📌 ${ev.sourceNote}
            </span>
            <button
              data-compare-id="${ev.id}"
              class="compare-toggle-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                isSelected
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              }"
            >
              ${isSelected ? dict.btnCompareSelected : dict.btnCompareAdd}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll(".compare-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleCompareItem(btn.getAttribute("data-compare-id")));
  });
}

// Render Table View
function renderTable(list) {
  const dict = t();
  const theadRow = document.getElementById("tableHeadRow");
  const tbody = document.getElementById("evTableBody");
  const periodLabel = getPeriodLabel();

  const headers = [...dict.tableHeaders];
  headers[2] = `${periodLabel} ${headers[2]}`;

  theadRow.innerHTML = headers
    .map((h, i) => {
      if (i === 0) return `<th class="py-3.5 px-4 sticky left-0 bg-slate-100 dark:bg-slate-900 z-10">${h}</th>`;
      if (i === 1) return `<th class="py-3.5 px-3">${h}</th>`;
      if (i === 2) return `<th class="py-3.5 px-3 text-right text-sky-600 dark:text-sky-400">${h}</th>`;
      if (i === headers.length - 1) return `<th class="py-3.5 px-3 text-center">${h}</th>`;
      return `<th class="py-3.5 px-3 text-right">${h}</th>`;
    })
    .join("");

  tbody.innerHTML = list
    .map((ev, idx) => {
      const originMeta = REGIONS[ev.origin];
      const sales = getSalesForPeriod(ev);
      const isSelected = state.compareIds.includes(ev.id);

      return `
        <tr class="hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition">
          <td class="py-3 px-4 sticky left-0 bg-white/95 dark:bg-slate-950/95 z-10 font-sans">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center">${idx + 1}</span>
              <div>
                <div class="font-bold text-slate-900 dark:text-white whitespace-nowrap">${ev.name}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">${getSubName(ev)}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-3 font-sans whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[11px] border ${originMeta.badgeClass}">${originMeta.flag} ${getBrandLabel(ev)}</span>
          </td>
          <td class="py-3 px-3 text-right font-bold text-sky-600 dark:text-sky-300 whitespace-nowrap">
            ${sales > 0 ? `${sales.toLocaleString()}${dict.unitsSuffix}` : "-"}
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${formatMarketPrice(ev.prices.us, "us")}</td>
          <td class="py-3 px-3 text-right text-rose-600 dark:text-rose-300 whitespace-nowrap">${formatMarketPrice(ev.prices.cn, "cn")}</td>
          <td class="py-3 px-3 text-right text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">${formatMarketPrice(ev.prices.kr, "kr")}</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${formatMarketPrice(ev.prices.eu, "eu")}</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.batteryKwh} kWh</td>
          <td class="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">${ev.specs.rangeKm} km <span class="text-[10px] text-slate-400">(${ev.rangeCycle})</span></td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.powerHp} hp</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.zeroToHundred}s</td>
          <td class="py-3 px-3 text-right text-amber-600 dark:text-amber-300 whitespace-nowrap">${ev.specs.chargeTimeMin}m (${ev.specs.architectureV}V)</td>
          <td class="py-3 px-3 text-center font-sans">
            <button data-compare-id="${ev.id}" class="table-compare-btn px-2 py-1 rounded text-[11px] font-semibold ${
              isSelected ? "bg-sky-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
            }">
              ${isSelected ? dict.btnTableSelected : dict.btnTableAdd}
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll(".table-compare-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleCompareItem(btn.getAttribute("data-compare-id")));
  });
}

// Render Analytics Charts
function renderCharts(list) {
  if (state.activeView !== "charts") return;

  const dict = t();
  const isDark = state.theme === "dark";
  const tickColor = isDark ? "#94a3b8" : "#475569";
  const labelColor = isDark ? "#e2e8f0" : "#0f172a";
  const gridColor = isDark ? "rgba(51, 65, 85, 0.35)" : "rgba(203, 213, 225, 0.6)";

  const periodLabel = getPeriodLabel();
  document.getElementById("chartSalesTitle").textContent = dict.chartSalesTitle(periodLabel);

  const originColors = {
    US: "rgba(56, 189, 248, 0.85)",
    CN: "rgba(244, 63, 94, 0.85)",
    KR: "rgba(16, 185, 129, 0.85)",
    DE: "rgba(245, 158, 11, 0.85)",
    JP: "rgba(99, 102, 241, 0.85)"
  };

  // 1. Top 12 Models Horizontal Bar Chart
  const top12 = [...(list.length ? list : EV_DATA)]
    .sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a))
    .slice(0, 12);

  const ctxBar = document.getElementById("topModelsBarChart").getContext("2d");
  if (chartInstances.topBar) chartInstances.topBar.destroy();

  chartInstances.topBar = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: top12.map(e => `${REGIONS[e.origin].flag} ${getBrandLabel(e)} ${e.name}`),
      datasets: [
        {
          label: periodLabel,
          data: top12.map(e => getSalesForPeriod(e)),
          backgroundColor: top12.map(e => originColors[e.origin]),
          borderRadius: 6
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: labelColor, font: { size: 11 } }, grid: { display: false } }
      }
    }
  });

  // 2. Manufacturer Quarterly Sales Trend Line Chart
  const ctxLine = document.getElementById("brandTrendLineChart").getContext("2d");
  if (chartInstances.brandLine) chartInstances.brandLine.destroy();

  chartInstances.brandLine = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: QUARTERS,
      datasets: Object.values(BRAND_QUARTERLY_SUMMARY).map(info => ({
        label: state.lang === "ko" ? info.labelKo : info.labelEn,
        data: QUARTERS.map(q => info.sales[q]),
        borderColor: info.color,
        backgroundColor: info.color,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2.5
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { color: labelColor, boxWidth: 10, font: { size: 10 } } }
      },
      scales: {
        x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
        y: {
          ticks: { color: tickColor },
          grid: { color: gridColor },
          title: { display: true, text: dict.chartBrandYAxis, color: tickColor }
        }
      }
    }
  });

  // 3. 4-Region Price Comparison Grouped Bar Chart
  const multiRegionModels = EV_DATA.filter(
    e => [e.prices.us, e.prices.cn, e.prices.kr, e.prices.eu].filter(v => v != null).length >= 3
  ).slice(0, 10);

  const ctxPrice = document.getElementById("regionalPriceBarChart").getContext("2d");
  if (chartInstances.regionalPrice) chartInstances.regionalPrice.destroy();

  chartInstances.regionalPrice = new Chart(ctxPrice, {
    type: "bar",
    data: {
      labels: multiRegionModels.map(e => `${getBrandLabel(e)} ${e.name.split(" ")[0]}`),
      datasets: [
        {
          label: `${dict.marketUS} (USD)`,
          data: multiRegionModels.map(e => (e.prices.us ? Math.round(toUSD(e.prices.us, "us")) : null)),
          backgroundColor: "rgba(56, 189, 248, 0.85)"
        },
        {
          label: `${dict.marketCN} (USD)`,
          data: multiRegionModels.map(e => (e.prices.cn ? Math.round(toUSD(e.prices.cn, "cn")) : null)),
          backgroundColor: "rgba(244, 63, 94, 0.85)"
        },
        {
          label: `${dict.marketKR} (USD)`,
          data: multiRegionModels.map(e => (e.prices.kr ? Math.round(toUSD(e.prices.kr, "kr")) : null)),
          backgroundColor: "rgba(16, 185, 129, 0.85)"
        },
        {
          label: `${dict.marketEU} (USD)`,
          data: multiRegionModels.map(e => (e.prices.eu ? Math.round(toUSD(e.prices.eu, "eu")) : null)),
          backgroundColor: "rgba(245, 158, 11, 0.85)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: labelColor, boxWidth: 12, font: { size: 11 } } }
      },
      scales: {
        x: { ticks: { color: labelColor, font: { size: 10 } }, grid: { display: false } },
        y: {
          ticks: { color: tickColor, callback: val => `$${(val / 1000).toFixed(0)}k` },
          grid: { color: gridColor }
        }
      }
    }
  });

  // 4. Price vs Range Scatter Chart (Dynamically iterates over all active origins including JP)
  const ctxScatter = document.getElementById("priceRangeScatterChart").getContext("2d");
  if (chartInstances.scatter) chartInstances.scatter.destroy();

  const origins = Object.keys(REGIONS).filter(k => k !== "ALL");
  const scatterDatasets = origins.map(orig => ({
    label: `${REGIONS[orig].flag} ${getRegionLabel(orig)}`,
    data: EV_DATA.filter(e => e.origin === orig).map(m => ({
      x: getAverageUSDPrice(m),
      y: m.specs.rangeKm,
      name: `${getBrandLabel(m)} ${m.name} (${m.rangeCycle})`
    })),
    backgroundColor: originColors[orig],
    pointRadius: 6,
    pointHoverRadius: 9
  }));

  chartInstances.scatter = new Chart(ctxScatter, {
    type: "scatter",
    data: { datasets: scatterDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: labelColor, boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw.name}: ~$${ctx.raw.x.toLocaleString()} / ${ctx.raw.y} km`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: dict.chartScatterX, color: tickColor },
          ticks: { color: tickColor, callback: v => `$${(v / 1000).toFixed(0)}k` },
          grid: { color: gridColor }
        },
        y: {
          title: { display: true, text: dict.chartScatterY, color: tickColor },
          ticks: { color: tickColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

// Compare Dock & Modal
function toggleCompareItem(id) {
  const dict = t();
  const idx = state.compareIds.indexOf(id);
  if (idx >= 0) {
    state.compareIds.splice(idx, 1);
  } else {
    if (state.compareIds.length >= 4) {
      alert(dict.alertMax4);
      return;
    }
    state.compareIds.push(id);
  }
  renderAll();
}

function renderCompareDock() {
  const dock = document.getElementById("compareDock");
  const slotList = document.getElementById("compareSlotList");
  document.getElementById("compareCountBadge").textContent = state.compareIds.length;

  if (state.compareIds.length === 0) {
    dock.classList.add("translate-y-full");
    return;
  }
  dock.classList.remove("translate-y-full");

  slotList.innerHTML = state.compareIds
    .map(id => {
      const ev = EV_DATA.find(e => e.id === id);
      if (!ev) return "";
      return `
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs shrink-0">
          <span>${REGIONS[ev.origin].flag}</span>
          <span class="font-semibold text-slate-900 dark:text-white">${getBrandLabel(ev)} ${ev.name}</span>
          <button data-remove-compare="${ev.id}" class="text-slate-400 hover:text-rose-500 font-bold ml-1">✕</button>
        </div>
      `;
    })
    .join("");

  slotList.querySelectorAll("[data-remove-compare]").forEach(btn => {
    btn.addEventListener("click", () => toggleCompareItem(btn.getAttribute("data-remove-compare")));
  });
}

function openCompareModal() {
  const dict = t();
  if (state.compareIds.length < 2) {
    alert(dict.alertMin2);
    return;
  }

  const modal = document.getElementById("compareModal");
  const body = document.getElementById("compareModalBody");
  const models = state.compareIds.map(id => EV_DATA.find(e => e.id === id)).filter(Boolean);

  const maxRange = Math.max(...models.map(m => m.specs.rangeKm));
  const maxBattery = Math.max(...models.map(m => m.specs.batteryKwh));
  const maxPower = Math.max(...models.map(m => m.specs.powerHp));
  const minAccel = Math.min(...models.map(m => m.specs.zeroToHundred));
  const minCharge = Math.min(...models.map(m => m.specs.chargeTimeMin));
  const maxSales = Math.max(...models.map(m => getSalesForPeriod(m)));

  const winBadge = `<span class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">WIN</span>`;

  body.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800">
            <th class="py-3 px-4 text-slate-500 dark:text-slate-400 w-44">${dict.modalRows.metric}</th>
            ${models
              .map(
                m => `
              <th class="py-3 px-4 min-w-[180px]">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>${REGIONS[m.origin].flag} ${getBrandLabel(m)}</span>
                  <span>·</span>
                  <span>${getSegmentLabel(m)}</span>
                </div>
                <div class="text-base font-bold text-slate-900 dark:text-white">${m.name}</div>
                <div class="text-xs text-sky-600 dark:text-sky-400 font-normal mt-0.5">${getSubName(m)}</div>
              </th>
            `
              )
              .join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono text-xs">
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.sales(getPeriodLabel())}</td>
            ${models
              .map(m => {
                const s = getSalesForPeriod(m);
                return `<td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${s.toLocaleString()}${dict.unitsSuffix} ${
                  s === maxSales && s > 0 ? winBadge : ""
                }</td>`;
              })
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.krPrice}</td>
            ${models.map(m => `<td class="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">${formatMarketPrice(m.prices.kr, "kr")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.usPrice}</td>
            ${models.map(m => `<td class="py-3 px-4">${formatMarketPrice(m.prices.us, "us")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.cnPrice}</td>
            ${models.map(m => `<td class="py-3 px-4 text-rose-600 dark:text-rose-300">${formatMarketPrice(m.prices.cn, "cn")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.euPrice}</td>
            ${models.map(m => `<td class="py-3 px-4">${formatMarketPrice(m.prices.eu, "eu")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.range}</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${m.specs.rangeKm} km <span class="text-[10px] text-slate-400">[${m.rangeCycle}]</span> ${
                    m.specs.rangeKm === maxRange ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.battery}</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4">${m.specs.batteryKwh} kWh ${
                    m.specs.batteryKwh === maxBattery ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.power}</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${m.specs.powerHp} hp ${
                    m.specs.powerHp === maxPower ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.accel}</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${m.specs.zeroToHundred}s ${
                    m.specs.zeroToHundred === minAccel ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.charge}</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 text-amber-600 dark:text-amber-300 font-semibold">${m.specs.chargeTimeMin}m (${m.specs.chargingKw}kW / ${m.specs.architectureV}V) ${
                    m.specs.chargeTimeMin === minCharge ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.driveSpeed}</td>
            ${models.map(m => `<td class="py-3 px-4">${m.specs.drivetrain} · ${m.specs.topSpeedKmh} km/h</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.weight}</td>
            ${models.map(m => `<td class="py-3 px-4">${m.specs.weightKg.toLocaleString()} kg</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">${dict.modalRows.source}</td>
            ${models.map(m => `<td class="py-3 px-4 font-sans text-[11px] text-slate-500">${m.sourceNote}</td>`).join("")}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Master Render Function
function renderAll() {
  applyTheme();
  syncStaticTexts();
  renderFilterMeta();

  const list = getFilteredAndSortedEVs();
  document.getElementById("resultCountWrapper").innerHTML = t().resultCountHtml(list.length);

  renderKPIs(list);
  renderCards(list);
  renderTable(list);
  renderCharts(list);
  renderCompareDock();
}

// Event Bindings
function initEvents() {
  document.getElementById("globalPeriodSelect").addEventListener("change", e => {
    state.period = e.target.value;
    renderAll();
  });

  document.getElementById("currencyToggleBtn").addEventListener("click", () => {
    const order = ["local", "krw", "usd"];
    state.currencyMode = order[(order.indexOf(state.currencyMode) + 1) % order.length];
    renderAll();
  });

  document.getElementById("langToggleBtn").addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    renderAll();
  });

  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    renderAll();
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    state.searchQuery = e.target.value;
    renderAll();
  });

  document.getElementById("sortSelect").addEventListener("change", e => {
    state.sortBy = e.target.value;
    renderAll();
  });

  document.getElementById("segmentFilter").addEventListener("change", e => {
    state.segment = e.target.value;
    renderAll();
  });

  const toggleBtnMap = [
    { id: "filter800V", key: "only800V" },
    { id: "filterNewOnly", key: "onlyNew" },
    { id: "filterBestOnly", key: "onlyBestSeller" }
  ];
  toggleBtnMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    el.addEventListener("click", () => {
      state[key] = !state[key];
      el.classList.toggle("quick-toggle-active", state[key]);
      renderAll();
    });
  });

  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    state.region = "ALL";
    state.selectedBrands.clear();
    state.segment = "ALL";
    state.searchQuery = "";
    state.only800V = false;
    state.onlyNew = false;
    state.onlyBestSeller = false;
    document.getElementById("searchInput").value = "";
    toggleBtnMap.forEach(({ id }) => document.getElementById(id).classList.remove("quick-toggle-active"));
    renderAll();
  });

  document.querySelectorAll("#viewTabs [data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      state.activeView = view;
      document.querySelectorAll("#viewTabs [data-view]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      ["cards", "table", "charts"].forEach(v => {
        document.getElementById(`view-${v}`).classList.toggle("hidden", v !== view);
      });
      renderAll();
    });
  });

  document.getElementById("clearCompareBtn").addEventListener("click", () => {
    state.compareIds = [];
    renderAll();
  });
  document.getElementById("openCompareModalBtn").addEventListener("click", openCompareModal);
  document.getElementById("closeCompareModalBtn").addEventListener("click", () => {
    const modal = document.getElementById("compareModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });
  document.getElementById("compareModal").addEventListener("click", e => {
    if (e.target.id === "compareModal") {
      e.target.classList.add("hidden");
      e.target.classList.remove("flex");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  renderAll();
});
