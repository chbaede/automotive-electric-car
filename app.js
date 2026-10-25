// Application Logic for EV Global Hub (Supports KO/EN i18n & Normal/Night Theme)

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
  compareIds: ["tesla-model-y-juniper", "hyundai-ioniq-9", "bmw-ix3-neue-klasse", "mercedes-gle-eq"]
};

let chartInstances = {};

// Translations Dictionary
const I18N = {
  ko: {
    headerSubtitle: "전 세계 베스트셀링 & 최신 전기차 4개국 가격 · 성능 · 분기별 판매량 비교",
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
    periodShort: {
      "ALL": "24~26 누적",
      "2024 YEAR": "2024 연간",
      "2025 YEAR": "2025 연간"
    },
    currencyLabels: {
      local: "현지 통화 표기",
      krw: "원화(KRW) 환산",
      usd: "달러(USD) 환산"
    },
    currencyNote: {
      local: "현지 통화 기준",
      krw: "원화(KRW) 환산",
      usd: "달러(USD) 환산"
    },
    kpiSalesBadge: "🏆 판매 1위",
    kpiRangeTitle: "최장 1회 충전 주행거리",
    kpiRangeBadge: "🔋 주행거리 1위",
    kpiAccelTitle: "최단 제로백 (0→100km/h)",
    kpiAccelBadge: "🚀 가속력 1위",
    kpiChargeTitle: "최고 충전 속도 / 전압",
    kpiChargeBadge: "⚡ 초급속 1위",
    regionAll: "전체",
    regionKR: "한국 · 현대/기아",
    regionDE: "독일 3사+",
    regionUS: "미국 · 테슬라/GM/포드",
    regionCN: "중국 · BYD/샤오미/지리",
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
      "ALL": "모든 차종 (세단/SUV/트럭)",
      "SUV": "SUV / 크로스오버",
      " 세단": "세단 / 해치백",
      "픽업": "픽업트럭"
    },
    filter800V: "⚡ 800V+ 초급속만",
    filterNewOnly: "🆕 신차·최신형만",
    filterBestOnly: "🔥 베스트셀러만",
    resetBtn: "↺ 초기화",
    tabCards: "차량 카드 & 4개국 가격 비교",
    tabTable: "한눈에 보는 스펙·가격·판매량 표",
    tabCharts: "연도/분기별 판매 추이 & 가성비 차트",
    resultCountHtml: count => `검색 결과 <strong class="text-slate-900 dark:text-white font-mono">${count}</strong>대`,
    compareHintHtml: `💡 카드의 <strong class="text-sky-600 dark:text-sky-400">[+ 비교 담기]</strong>를 눌러 최대 4대까지 1:1 정밀 비교 가능`,
    emptyTitle: "조건에 맞는 전기차 모델이 없습니다.",
    emptySub: "지역 필터나 검색어를 초기화해 보세요.",
    modelYearSuffix: "년형",
    globalSalesLabel: period => `${period} 글로벌 판매량`,
    unitsSuffix: "대",
    preRelease: "출시 전 / 집계중",
    newLaunchBadge: "신규출시",
    qoqSuffix: "전분기비",
    recent7Q: "최근 7분기 추이",
    price4RegionTitle: "🌍 4개국 출시 가격 비교",
    marketKR: "🇰🇷 한국",
    marketUS: "🇺🇸 미국",
    marketCN: "🇨🇳 중국",
    marketEU: "🇪🇺 유럽",
    notReleased: "미출시",
    specRangeBattery: "🔋 주행거리 / 배터리",
    specPowerAccel: "🐎 최고출력 / 제로백",
    specFastCharge: "⚡ 급속충전 (10→80%)",
    curbWeight: "공차중량",
    btnCompareSelected: "✓ 비교함에 담김",
    btnCompareAdd: "+ 비교 담기",
    btnTableSelected: "✓ 선택됨",
    btnTableAdd: "+ 담기",
    tableHeaders: [
      "순위 / 모델", "국가 / 브랜드", "판매량", "🇺🇸 미국 가격", "🇨🇳 중국 가격",
      "🇰🇷 한국 가격", "🇪🇺 유럽 가격", "배터리", "주행거리", "최고출력", "제로백", "초급속(10-80%)", "비교"
    ],
    chartSalesTitle: period => `${period} 글로벌 판매 TOP 12 모델`,
    chartSalesSub: "상단 기간 선택기와 지역 필터에 맞춰 실시간으로 순위가 변경됩니다.",
    chartBrandTitle: "주요 제조사 그룹별 분기 순수전기차(BEV) 판매 추이",
    chartBrandSub: "2024 Q1 ~ 2026 Q3 글로벌 분기별 인도량 (단위: 천 대)",
    chartBrandYAxis: "판매량 (천 대)",
    chartPriceTitle: "주요 모델 4개국(미국·중국·한국·유럽) 출시 가격 비교 (USD 환산)",
    chartPriceSub: "동일 모델의 국가별 가격 정책 및 관세·보조금 전 시작가 격차 비교",
    chartScatterTitle: "가격 대비 주행거리(가성비) 포지셔닝 맵",
    chartScatterSub: "X축: 글로벌 평균 시작가(USD 환산) / Y축: 1회 충전 주행거리(km)",
    chartScatterX: "글로벌 평균 시작가 (USD 환산)",
    chartScatterY: "1회 충전 주행거리 (km)",
    clearBtn: "비우기",
    openCompareBtn: "⚡ 선택 차량 상세 비교하기",
    modalTitle: "⚔️ 전기차 1:1 스펙 · 4개국 가격 · 판매량 정밀 비교",
    modalSub: "각 항목에서 가장 우수한 스펙에 초록색 WIN 배지가 표시됩니다.",
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
      driveSpeed: "⚙️ 구동방식 / 최고속도",
      weight: "⚖️ 공차중량"
    },
    alertMax4: "최대 4대까지 동시에 비교할 수 있습니다. 기존 차량을 하나 제외한 뒤 추가해 주세요.",
    alertMin2: "2대 이상의 차량을 비교함에 담아주세요.",
    footnoteHtml: `
      <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <span>ℹ️</span> 데이터 기준 및 글로벌 시장 핵심 요약 (2024 – 2026)
      </div>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>지역별 가격 표기 기준:</strong> 미국(USD, MSRP 시작가), 중국(CNY, 현지 공식 시작가), 한국(만 원, 환경부 보조금 적용 전 친환경차 세제혜택 후 가격 기준), 유럽(EUR, 독일 부가세 포함 시작가 기준). 미출시 지역은 <code class="text-slate-700 dark:text-slate-300">미출시</code>로 표기됩니다.</li>
        <li><strong>환율 환산 기준:</strong> 통화 통합 비교 시 <code class="text-slate-700 dark:text-slate-300">1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code> 기준으로 계산됩니다.</li>
        <li><strong>주요 시장 트렌드:</strong> 2025년 연간 기준 <strong>BYD(약 226만 대)</strong>가 테슬라를 제치고 순수전기차(BEV) 제조사 1위에 등극했으며, 단일 모델로는 <strong>테슬라 모델 Y(주니퍼)</strong>와 <strong>모델 3(하이랜드)</strong>가 여전히 세계 1·2위를 유지 중입니다. 한국 현대·기아는 <strong>EV3, 아이오닉 9, EV4, 캐스퍼 일렉트릭</strong> 신차 라인업으로 유럽·북미 점유율을 확대했고, 독일 3사는 800V 차세대 아키텍처(<strong>BMW 노이어 클라쎄 iX3, 벤츠 MMA 전기 CLA 및 차세대 GLE EQ, 아우디·포르쉐 PPE Q6/마칸</strong>)로 주행거리 600~800km 시대를 열었습니다.</li>
      </ul>
    `
  },
  en: {
    headerSubtitle: "Global Best-Selling & Latest EVs: 4-Region Pricing, Specs & Quarterly Sales",
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
    periodShort: {
      "ALL": "24–26 Total",
      "2024 YEAR": "2024 FY",
      "2025 YEAR": "2025 FY"
    },
    currencyLabels: {
      local: "Local Currency",
      krw: "In KRW (₩)",
      usd: "In USD ($)"
    },
    currencyNote: {
      local: "Local Currencies",
      krw: "Converted to KRW",
      usd: "Converted to USD"
    },
    kpiSalesBadge: "🏆 #1 Sales",
    kpiRangeTitle: "Longest Driving Range",
    kpiRangeBadge: "🔋 #1 Range",
    kpiAccelTitle: "Fastest 0→100 km/h",
    kpiAccelBadge: "🚀 #1 Sprint",
    kpiChargeTitle: "Fastest 10→80% Charging",
    kpiChargeBadge: "⚡ #1 Charging",
    regionAll: "All Regions",
    regionKR: "Korea · Hyundai/Kia",
    regionDE: "Germany · BMW/MB/Audi+",
    regionUS: "USA · Tesla/GM/Ford",
    regionCN: "China · BYD/Xiaomi/Geely",
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
      "ALL": "All Segments (Sedan/SUV/Truck)",
      "SUV": "SUV / Crossover",
      " 세단": "Sedan / Hatchback",
      "픽업": "Pickup Truck"
    },
    filter800V: "⚡ 800V+ Ultra-Fast",
    filterNewOnly: "🆕 New Releases",
    filterBestOnly: "🔥 Best-Sellers",
    resetBtn: "↺ Reset",
    tabCards: "Vehicle Cards & 4-Region Prices",
    tabTable: "Full Specs, Price & Sales Table",
    tabCharts: "Quarterly Trends & Value Charts",
    resultCountHtml: count => `Showing <strong class="text-slate-900 dark:text-white font-mono">${count}</strong> models`,
    compareHintHtml: `💡 Click <strong class="text-sky-600 dark:text-sky-400">[+ Compare]</strong> on up to 4 cards for side-by-side comparison`,
    emptyTitle: "No electric vehicles match your filters.",
    emptySub: "Try resetting the region filter or search query.",
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
    specRangeBattery: "🔋 Range / Battery",
    specPowerAccel: "🐎 Power / 0–100 km/h",
    specFastCharge: "⚡ Fast Charge (10→80%)",
    curbWeight: "Weight",
    btnCompareSelected: "✓ In Compare",
    btnCompareAdd: "+ Compare",
    btnTableSelected: "✓ Added",
    btnTableAdd: "+ Add",
    tableHeaders: [
      "Rank / Model", "Origin / Brand", "Sales", "🇺🇸 USA Price", "🇨🇳 China Price",
      "🇰🇷 Korea Price", "🇪🇺 Europe Price", "Battery", "Range", "Power", "0–100", "10–80% Charge", "Compare"
    ],
    chartSalesTitle: period => `${period} Top 12 Best-Selling Global EVs`,
    chartSalesSub: "Updates dynamically based on your selected period and region filters.",
    chartBrandTitle: "Quarterly Pure BEV Deliveries by Automaker Group",
    chartBrandSub: "2024 Q1 – 2026 Q3 Global Quarterly Volume (in thousands)",
    chartBrandYAxis: "Deliveries (k units)",
    chartPriceTitle: "4-Region Starting Price Comparison (Normalized to USD)",
    chartPriceSub: "Comparing pre-incentive MSRP across US, China, Korea, and Europe",
    chartScatterTitle: "Driving Range vs. Global Average Price Positioning Map",
    chartScatterSub: "X-Axis: Global Average Starting Price (USD) / Y-Axis: Driving Range (km)",
    chartScatterX: "Global Average Starting Price (USD)",
    chartScatterY: "Driving Range (km)",
    clearBtn: "Clear",
    openCompareBtn: "⚡ Compare Selected Models",
    modalTitle: "⚔️ Head-to-Head Specs, 4-Region Prices & Sales Comparison",
    modalSub: "Green WIN badges highlight the best specification in each category.",
    modalRows: {
      metric: "Specification",
      sales: period => `📊 ${period} Sales`,
      krPrice: "🇰🇷 Korea Price",
      usPrice: "🇺🇸 USA Price",
      cnPrice: "🇨🇳 China Price",
      euPrice: "🇪🇺 Europe Price",
      range: "🔋 Driving Range",
      battery: "⚡ Battery Capacity",
      power: "🐎 Max Power",
      accel: "🚀 0→100 km/h",
      charge: "🔌 Fast Charge (10→80%)",
      driveSpeed: "⚙️ Drivetrain / Top Speed",
      weight: "⚖️ Curb Weight"
    },
    alertMax4: "You can compare up to 4 vehicles at once. Please remove a vehicle first.",
    alertMin2: "Please add at least 2 vehicles to compare.",
    footnoteHtml: `
      <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <span>ℹ️</span> Data Notes & Global EV Market Summary (2024 – 2026)
      </div>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>Regional Pricing Basis:</strong> USA (USD, base MSRP before federal tax credit), China (CNY, official domestic starting price), South Korea (KRW in 10,000s, after eco-friendly tax benefit before municipal subsidy), Europe (EUR, German base price incl. VAT). Unreleased markets show <code class="text-slate-700 dark:text-slate-300">N/A</code>.</li>
        <li><strong>Currency Normalization:</strong> Unified currency modes use <code class="text-slate-700 dark:text-slate-300">1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code>.</li>
        <li><strong>Market Highlights:</strong> In full-year 2025, <strong>BYD (~2.26M BEVs)</strong> officially surpassed Tesla in annual pure-electric volume, while the <strong>Tesla Model Y (Juniper)</strong> and <strong>Model 3 (Highland)</strong> remain the #1 and #2 best-selling individual models worldwide. Hyundai & Kia expanded global share with the <strong>EV3, IONIQ 9, EV4, and Inster</strong>, while German automakers ushered in 600–800 km WLTP ranges via 800V platforms (<strong>BMW Neue Klasse iX3, Mercedes-Benz MMA CLA & GLE with EQ Technology, Audi/Porsche PPE Q6 & Macan</strong>).</li>
      </ul>
    `
  }
};

function t() {
  return I18N[state.lang];
}

// Helper: Country Flag & Styling
const ORIGIN_META = {
  KR: { flag: "🇰🇷", labelKo: "한국", labelEn: "Korea", badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  DE: { flag: "🇩🇪", labelKo: "독일", labelEn: "Germany", badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  US: { flag: "🇺🇸", labelKo: "미국", labelEn: "USA", badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" },
  CN: { flag: "🇨🇳", labelKo: "중국", labelEn: "China", badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" }
};

function getBrandLabel(ev) {
  return state.lang === "ko" ? ev.brandKo : ev.brand;
}
function getSubName(ev) {
  return state.lang === "ko" ? ev.nameKo : (ev.nameEn || ev.name);
}
function getSegmentLabel(ev) {
  return state.lang === "ko" ? ev.segment : (ev.segmentEn || ev.segment);
}
function getBadgeLabel(ev) {
  return state.lang === "ko" ? ev.badge : (ev.badgeEn || ev.badge);
}
function getHighlights(ev) {
  return state.lang === "ko" ? ev.highlights : (ev.highlightsEn || ev.highlights);
}

// Helper: Get sales volume for a vehicle in the selected period
function getSalesForPeriod(ev, period = state.period) {
  const qs = ev.quarterlySales || {};
  if (period === "ALL") {
    return Object.values(qs).reduce((sum, v) => sum + (v || 0), 0);
  }
  if (period === "2024 YEAR") {
    return (qs["2024 Q1"] || 0) + (qs["2024 Q2"] || 0) + (qs["2024 Q3"] || 0) + (qs["2024 Q4"] || 0);
  }
  if (period === "2025 YEAR") {
    return (qs["2025 Q1"] || 0) + (qs["2025 Q2"] || 0) + (qs["2025 Q3"] || 0) + (qs["2025 Q4"] || 0);
  }
  return qs[period] || 0;
}

// Helper: Get previous quarter sales to calculate QoQ change %
function getQoQChange(ev, period = state.period) {
  const idx = QUARTERS.indexOf(period);
  if (idx <= 0) return null;
  const prevPeriod = QUARTERS[idx - 1];
  const prevSales = ev.quarterlySales[prevPeriod] || 0;
  const currSales = ev.quarterlySales[period] || 0;
  if (prevSales === 0) return currSales > 0 ? "NEW" : null;
  return ((currSales - prevSales) / prevSales) * 100;
}

// Helper: Convert any regional price to USD
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
      if (state.lang === "en") {
        return `₩${(amount / 100).toFixed(1)}M`;
      }
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
    if (state.lang === "en") {
      return `~₩${(manWon / 100).toFixed(1)}M`;
    }
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

// Helper: Average global price in USD for scatter chart
function getAverageUSDPrice(ev) {
  const markets = ["us", "cn", "kr", "eu"];
  const usdList = markets.map(m => toUSD(ev.prices[m], m)).filter(v => v != null);
  if (!usdList.length) return 50000;
  return Math.round(usdList.reduce((a, b) => a + b, 0) / usdList.length);
}

// Helper: Format period human-readable label
function getPeriodLabel(period = state.period) {
  const dict = t();
  if (dict.periodShort[period]) return dict.periodShort[period];
  return period;
}

// Apply Theme (Normal Mode = light, Night Mode = dark)
function applyTheme() {
  const htmlEl = document.documentElement;
  const iconEl = document.getElementById("themeToggleIcon");
  const labelEl = document.getElementById("themeToggleLabel");

  if (state.theme === "dark") {
    htmlEl.classList.add("dark");
    iconEl.textContent = "🌙";
    labelEl.textContent = "Night Mode";
  } else {
    htmlEl.classList.remove("dark");
    iconEl.textContent = "☀️";
    labelEl.textContent = "Normal Mode";
  }
}

// Sync Static UI Texts for Selected Language
function syncStaticTexts() {
  const dict = t();
  document.documentElement.lang = state.lang;

  document.getElementById("headerSubtitle").textContent = dict.headerSubtitle;
  document.getElementById("periodLabelText").textContent = dict.periodLabel;
  document.getElementById("currencyToggleLabel").textContent = dict.currencyLabels[state.currencyMode];
  document.getElementById("langToggleLabel").textContent = state.lang === "ko" ? "English" : "한국어";

  // Period Select Options
  const periodSelect = document.getElementById("globalPeriodSelect");
  const periodOrder = [
    "2026 Q3", "2026 Q2", "2026 Q1",
    "2025 YEAR", "2025 Q4", "2025 Q3", "2025 Q2", "2025 Q1",
    "2024 YEAR", "2024 Q4", "2024 Q3", "2024 Q2", "2024 Q1",
    "ALL"
  ];
  periodSelect.innerHTML = periodOrder
    .map(p => `<option value="${p}" ${state.period === p ? "selected" : ""}>${dict.periods[p]}</option>`)
    .join("");

  // KPI Static Titles
  document.getElementById("kpiSalesBadge").textContent = dict.kpiSalesBadge;
  document.getElementById("kpiRangeTitle").textContent = dict.kpiRangeTitle;
  document.getElementById("kpiRangeBadge").textContent = dict.kpiRangeBadge;
  document.getElementById("kpiAccelTitle").textContent = dict.kpiAccelTitle;
  document.getElementById("kpiAccelBadge").textContent = dict.kpiAccelBadge;
  document.getElementById("kpiChargeTitle").textContent = dict.kpiChargeTitle;
  document.getElementById("kpiChargeBadge").textContent = dict.kpiChargeBadge;

  // Region Labels
  document.getElementById("regionLabelAll").textContent = dict.regionAll;
  document.getElementById("regionLabelKR").textContent = dict.regionKR;
  document.getElementById("regionLabelDE").textContent = dict.regionDE;
  document.getElementById("regionLabelUS").textContent = dict.regionUS;
  document.getElementById("regionLabelCN").textContent = dict.regionCN;

  // Search Input
  document.getElementById("searchInput").placeholder = dict.searchPlaceholder;

  // Sort Select Options
  const sortSelect = document.getElementById("sortSelect");
  sortSelect.innerHTML = Object.entries(dict.sortOptions)
    .map(([val, label]) => `<option value="${val}" ${state.sortBy === val ? "selected" : ""}>${label}</option>`)
    .join("");

  // Segment Filter Options
  const segSelect = document.getElementById("segmentFilter");
  segSelect.innerHTML = Object.entries(dict.segments)
    .map(([val, label]) => `<option value="${val}" ${state.segment === val ? "selected" : ""}>${label}</option>`)
    .join("");

  // Quick Filter Buttons
  document.getElementById("filter800V").textContent = dict.filter800V;
  document.getElementById("filterNewOnly").textContent = dict.filterNewOnly;
  document.getElementById("filterBestOnly").textContent = dict.filterBestOnly;
  document.getElementById("resetFiltersBtn").textContent = dict.resetBtn;

  // View Tabs
  document.getElementById("tabCardsLabel").textContent = dict.tabCards;
  document.getElementById("tabTableLabel").textContent = dict.tabTable;
  document.getElementById("tabChartsLabel").textContent = dict.tabCharts;
  document.getElementById("compareHintText").innerHTML = dict.compareHintHtml;

  // Chart Titles
  document.getElementById("chartSalesSub").textContent = dict.chartSalesSub;
  document.getElementById("chartBrandTitle").textContent = dict.chartBrandTitle;
  document.getElementById("chartBrandSub").textContent = dict.chartBrandSub;
  document.getElementById("chartPriceTitle").textContent = dict.chartPriceTitle;
  document.getElementById("chartPriceSub").textContent = dict.chartPriceSub;
  document.getElementById("chartScatterTitle").textContent = dict.chartScatterTitle;
  document.getElementById("chartScatterSub").textContent = dict.chartScatterSub;

  // Footnote & Compare Dock
  document.getElementById("footnoteSection").innerHTML = dict.footnoteHtml;
  document.getElementById("clearCompareBtn").textContent = dict.clearBtn;
  document.getElementById("openCompareBtnText").textContent = dict.openCompareBtn;
  document.getElementById("modalTitle").textContent = dict.modalTitle;
  document.getElementById("modalSub").textContent = dict.modalSub;
}

// Filter & Sort dataset
function getFilteredAndSortedEVs() {
  const filtered = EV_DATA.filter(ev => {
    if (state.region !== "ALL" && ev.origin !== state.region) return false;
    if (state.selectedBrands.size > 0 && !state.selectedBrands.has(ev.brand)) return false;
    if (state.segment !== "ALL") {
      if (state.segment === " 세단" && !(ev.segment.includes("세단") || ev.segment.includes("해치백"))) return false;
      if (state.segment === "SUV" && !(ev.segment.includes("SUV") || ev.segment.includes("크로스오버"))) return false;
      if (state.segment === "픽업" && !ev.segment.includes("픽업")) return false;
    }
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
      case "sales-desc":
        return getSalesForPeriod(b) - getSalesForPeriod(a);
      case "range-desc":
        return b.specs.rangeKm - a.specs.rangeKm;
      case "power-desc":
        return b.specs.powerHp - a.specs.powerHp;
      case "accel-asc":
        return a.specs.zeroToHundred - b.specs.zeroToHundred;
      case "charge-asc":
        return a.specs.chargeTimeMin - b.specs.chargeTimeMin;
      case "price-kr-asc":
        return (a.prices.kr ?? 999999) - (b.prices.kr ?? 999999);
      case "price-us-asc":
        return (a.prices.us ?? 999999) - (b.prices.us ?? 999999);
      case "price-cn-asc":
        return (a.prices.cn ?? 9999999) - (b.prices.cn ?? 9999999);
      case "price-eu-asc":
        return (a.prices.eu ?? 999999) - (b.prices.eu ?? 999999);
      case "year-desc":
        return b.releaseYear - a.releaseYear || getSalesForPeriod(b) - getSalesForPeriod(a);
      default:
        return 0;
    }
  });

  return filtered;
}

// Render Region Counts & Brand Chips
function renderFilterMeta() {
  document.getElementById("count-ALL").textContent = EV_DATA.length;
  ["KR", "DE", "US", "CN"].forEach(origin => {
    const cnt = EV_DATA.filter(e => e.origin === origin).length;
    const el = document.getElementById(`count-${origin}`);
    if (el) el.textContent = cnt;
  });

  const brandContainer = document.getElementById("brandFilterGroup");
  const relevantEVs = state.region === "ALL" ? EV_DATA : EV_DATA.filter(e => e.origin === state.region);
  const uniqueBrands = [];
  const seen = new Set();
  relevantEVs.forEach(e => {
    if (!seen.has(e.brand)) {
      seen.add(e.brand);
      uniqueBrands.push({ brand: e.brand, brandKo: e.brandKo, origin: e.origin });
    }
  });

  brandContainer.innerHTML = uniqueBrands
    .map(b => {
      const isActive = state.selectedBrands.has(b.brand);
      const flag = ORIGIN_META[b.origin]?.flag || "";
      const label = state.lang === "ko" ? b.brandKo : b.brand;
      return `
        <button data-brand="${b.brand}" class="brand-chip ${isActive ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1">
          <span>${flag}</span>
          <span>${label}</span>
        </button>
      `;
    })
    .join("");

  brandContainer.querySelectorAll("[data-brand]").forEach(btn => {
    btn.addEventListener("click", () => {
      const br = btn.getAttribute("data-brand");
      if (state.selectedBrands.has(br)) {
        state.selectedBrands.delete(br);
      } else {
        state.selectedBrands.add(br);
      }
      renderAll();
    });
  });
}

// Render KPI Top Summary Cards
function renderKPIs(list) {
  const pool = list.length > 0 ? list : EV_DATA;
  const periodLabel = getPeriodLabel();
  document.getElementById("kpiSalesTitle").textContent =
    state.lang === "ko" ? `${periodLabel} 최다 판매 모델` : `Top Seller (${periodLabel})`;

  // Top Seller
  const bySales = [...pool].sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a));
  const topSeller = bySales[0];
  document.getElementById("kpiTopSellerName").textContent = `${getBrandLabel(topSeller)} ${topSeller.name}`;
  document.getElementById("kpiTopSellerVal").textContent =
    state.lang === "ko"
      ? `${getSalesForPeriod(topSeller).toLocaleString()}대 판매 (${periodLabel})`
      : `${getSalesForPeriod(topSeller).toLocaleString()} units (${periodLabel})`;

  // Top Range
  const byRange = [...pool].sort((a, b) => b.specs.rangeKm - a.specs.rangeKm);
  const topRange = byRange[0];
  document.getElementById("kpiTopRangeName").textContent = `${getBrandLabel(topRange)} ${topRange.name}`;
  document.getElementById("kpiTopRangeVal").textContent = `${topRange.specs.rangeKm} km (${topRange.specs.batteryKwh} kWh)`;

  // Top Accel
  const byAccel = [...pool].sort((a, b) => a.specs.zeroToHundred - b.specs.zeroToHundred);
  const topAccel = byAccel[0];
  document.getElementById("kpiTopAccelName").textContent = `${getBrandLabel(topAccel)} ${topAccel.name}`;
  document.getElementById("kpiTopAccelVal").textContent =
    state.lang === "ko"
      ? `0→100km/h ${topAccel.specs.zeroToHundred}초 (${topAccel.specs.powerHp}마력)`
      : `0→100km/h in ${topAccel.specs.zeroToHundred}s (${topAccel.specs.powerHp} hp)`;

  // Top Charge
  const byCharge = [...pool].sort((a, b) => a.specs.chargeTimeMin - b.specs.chargeTimeMin);
  const topCharge = byCharge[0];
  document.getElementById("kpiTopChargeName").textContent = `${getBrandLabel(topCharge)} ${topCharge.name}`;
  document.getElementById("kpiTopChargeVal").textContent =
    state.lang === "ko"
      ? `10→80% ${topCharge.specs.chargeTimeMin}분 (${topCharge.specs.architectureV}V / ${topCharge.specs.chargingKw}kW)`
      : `10→80% in ${topCharge.specs.chargeTimeMin}m (${topCharge.specs.architectureV}V / ${topCharge.specs.chargingKw}kW)`;
}

// Render Mini Sparkline Bars for a vehicle's quarterly trend
function buildSparklineHTML(ev) {
  const dict = t();
  const recentQuarters = QUARTERS.slice(-7); // 2025 Q1 ~ 2026 Q3
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
      const originMeta = ORIGIN_META[ev.origin];
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
            <!-- Top Row: Rank + Country + Badges -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  ${index + 1}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-medium border ${originMeta.badgeClass}">
                  ${originMeta.flag} ${getBrandLabel(ev)}
                </span>
                <span class="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                  ${getSegmentLabel(ev)}
                </span>
              </div>

              <div class="flex items-center gap-1">
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
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">${ev.releaseYear}${dict.modelYearSuffix}</span>
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
                  <span class="font-mono text-slate-900 dark:text-white font-semibold">${ev.specs.rangeKm} km <span class="text-slate-500 dark:text-slate-400 font-normal">(${ev.specs.batteryKwh} kWh)</span></span>
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
            <span class="text-[11px] text-slate-500 font-mono">${dict.curbWeight} ${ev.specs.weightKg.toLocaleString()}kg</span>
            <button
              data-compare-id="${ev.id}"
              class="compare-toggle-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
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
    btn.addEventListener("click", () => {
      toggleCompareItem(btn.getAttribute("data-compare-id"));
    });
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
      const originMeta = ORIGIN_META[ev.origin];
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
          <td class="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">${ev.specs.rangeKm} km</td>
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
    btn.addEventListener("click", () => {
      toggleCompareItem(btn.getAttribute("data-compare-id"));
    });
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

  // 1. Top 12 Models Horizontal Bar Chart
  const top12 = [...(list.length ? list : EV_DATA)]
    .sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a))
    .slice(0, 12);

  const ctxBar = document.getElementById("topModelsBarChart").getContext("2d");
  if (chartInstances.topBar) chartInstances.topBar.destroy();

  const originColors = {
    US: "rgba(56, 189, 248, 0.85)",
    CN: "rgba(244, 63, 94, 0.85)",
    KR: "rgba(16, 185, 129, 0.85)",
    DE: "rgba(245, 158, 11, 0.85)"
  };

  chartInstances.topBar = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: top12.map(e => `${ORIGIN_META[e.origin].flag} ${getBrandLabel(e)} ${e.name}`),
      datasets: [
        {
          label: `${periodLabel}`,
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
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: tickColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: labelColor, font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });

  // 2. Manufacturer Quarterly Sales Trend Line Chart
  const ctxLine = document.getElementById("brandTrendLineChart").getContext("2d");
  if (chartInstances.brandLine) chartInstances.brandLine.destroy();

  const brandDatasets = Object.values(BRAND_QUARTERLY_SUMMARY).map(info => ({
    label: state.lang === "ko" ? info.labelKo : info.labelEn,
    data: QUARTERS.map(q => info.sales[q]),
    borderColor: info.color,
    backgroundColor: info.color,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 2.5
  }));

  chartInstances.brandLine = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: QUARTERS,
      datasets: brandDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: labelColor, boxWidth: 10, font: { size: 10 } }
        }
      },
      scales: {
        x: {
          ticks: { color: tickColor, font: { size: 10 } },
          grid: { color: gridColor }
        },
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
  ).slice(0, 9);

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
        legend: {
          position: "bottom",
          labels: { color: labelColor, boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: labelColor, font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: tickColor,
            callback: val => `$${(val / 1000).toFixed(0)}k`
          },
          grid: { color: gridColor }
        }
      }
    }
  });

  // 4. Price vs Range Scatter Chart
  const ctxScatter = document.getElementById("priceRangeScatterChart").getContext("2d");
  if (chartInstances.scatter) chartInstances.scatter.destroy();

  const origins = ["KR", "DE", "US", "CN"];
  const scatterDatasets = origins.map(orig => {
    const models = EV_DATA.filter(e => e.origin === orig);
    const regionLabel = state.lang === "ko" ? ORIGIN_META[orig].labelKo : ORIGIN_META[orig].labelEn;
    return {
      label: `${ORIGIN_META[orig].flag} ${regionLabel}`,
      data: models.map(m => ({
        x: getAverageUSDPrice(m),
        y: m.specs.rangeKm,
        name: `${getBrandLabel(m)} ${m.name}`
      })),
      backgroundColor: originColors[orig],
      pointRadius: 6,
      pointHoverRadius: 9
    };
  });

  chartInstances.scatter = new Chart(ctxScatter, {
    type: "scatter",
    data: { datasets: scatterDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: labelColor, boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pt = ctx.raw;
              return `${pt.name}: ~$${pt.x.toLocaleString()} / ${pt.y} km`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: dict.chartScatterX, color: tickColor },
          ticks: {
            color: tickColor,
            callback: v => `$${(v / 1000).toFixed(0)}k`
          },
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

// Manage Floating Compare Tray
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
  const countBadge = document.getElementById("compareCountBadge");

  countBadge.textContent = state.compareIds.length;

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
          <span>${ORIGIN_META[ev.origin].flag}</span>
          <span class="font-semibold text-slate-900 dark:text-white">${getBrandLabel(ev)} ${ev.name}</span>
          <button data-remove-compare="${ev.id}" class="text-slate-400 hover:text-rose-500 font-bold ml-1">✕</button>
        </div>
      `;
    })
    .join("");

  slotList.querySelectorAll("[data-remove-compare]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleCompareItem(btn.getAttribute("data-remove-compare"));
    });
  });
}

// Render Head-to-Head Comparison Modal
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
            <th class="py-3 px-4 text-slate-500 dark:text-slate-400 w-40">${dict.modalRows.metric}</th>
            ${models
              .map(
                m => `
              <th class="py-3 px-4 min-w-[180px]">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>${ORIGIN_META[m.origin].flag} ${getBrandLabel(m)}</span>
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
                  `<td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${m.specs.rangeKm} km ${
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

// Initialize Event Listeners
function initEvents() {
  // Period Selector
  document.getElementById("globalPeriodSelect").addEventListener("change", e => {
    state.period = e.target.value;
    renderAll();
  });

  // Currency Mode Cycle Button
  document.getElementById("currencyToggleBtn").addEventListener("click", () => {
    const order = ["local", "krw", "usd"];
    const nextIdx = (order.indexOf(state.currencyMode) + 1) % order.length;
    state.currencyMode = order[nextIdx];
    renderAll();
  });

  // Language Toggle (KO <-> EN)
  document.getElementById("langToggleBtn").addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    renderAll();
  });

  // Normal Mode / Night Mode Toggle
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    renderAll();
  });

  // Region Tabs
  document.querySelectorAll("#regionFilterGroup [data-region]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.region = btn.getAttribute("data-region");
      state.selectedBrands.clear();
      document.querySelectorAll("#regionFilterGroup [data-region]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderAll();
    });
  });

  // Search Input
  document.getElementById("searchInput").addEventListener("input", e => {
    state.searchQuery = e.target.value;
    renderAll();
  });

  // Sort Select
  document.getElementById("sortSelect").addEventListener("change", e => {
    state.sortBy = e.target.value;
    renderAll();
  });

  // Segment Select
  document.getElementById("segmentFilter").addEventListener("change", e => {
    state.segment = e.target.value;
    renderAll();
  });

  // Quick Feature Toggles
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

  // Reset Filters
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    state.region = "ALL";
    state.selectedBrands.clear();
    state.segment = "ALL";
    state.searchQuery = "";
    state.only800V = false;
    state.onlyNew = false;
    state.onlyBestSeller = false;
    document.getElementById("searchInput").value = "";
    document.querySelectorAll("#regionFilterGroup [data-region]").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-region") === "ALL");
    });
    toggleBtnMap.forEach(({ id }) => document.getElementById(id).classList.remove("quick-toggle-active"));
    renderAll();
  });

  // View Switcher Tabs
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

  // Compare Modal Actions
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
