/**
 * UI translation strings (Korean / English).
 * Vehicle-specific text lives in data.js (nameKo/nameEn, badge/badgeEn, ...).
 */
const I18N = {
  ko: {
    meta: {
      title: "전기차 비교 2026 | 글로벌 순수전기차 가격·주행거리·판매량 순위 - EV Global Hub",
      description:
        "테슬라 모델 Y, 아이오닉 9, 기아 EV3, BYD, 샤오미 YU7, BMW iX3, 벤츠 CLA, 토요타 bZ4X 등 34종 순수전기차(BEV)의 한국·미국·중국·유럽 가격, 주행거리, 충전 속도, 2024~2026 분기별 판매량을 한눈에 비교하세요."
    },
    heroTitle: "글로벌 전기차 가격 · 성능 · 판매량 비교",
    heroSub: "한국·독일·미국·중국·일본 34종 순수전기차(BEV)의 4개국 출시가, 제원, 2024~2026 분기별 판매량",
    periodLabel: "기준 기간",
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
      ALL: "2024~2026 누적 전체"
    },
    periodShort: { ALL: "24~26 누적", "2024 YEAR": "2024 연간", "2025 YEAR": "2025 연간" },
    currencyLabels: { local: "현지 통화", krw: "원화 환산", usd: "달러 환산" },
    currencyNote: { local: "현지 통화 기준", krw: "원화(KRW) 환산", usd: "달러(USD) 환산" },
    langToggle: "English",
    themeLabels: { dark: "Night Mode", light: "Normal Mode" },
    brandRowLabel: "브랜드",
    allBrandsChip: "전체 브랜드",
    specRowLabel: "세부 조건",
    searchPlaceholder: "모델명, 브랜드, 키워드 검색...",
    sortLabel: "정렬 기준",
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
    segments: { ALL: "모든 차종 (SUV/세단/트럭)", SUV: "SUV / 크로스오버", SEDAN: "세단 / 해치백", TRUCK: "픽업트럭" },
    excludeCNChip: "🚫 중국 제외 (KR·DE·US·JP)",
    multiRegionHint: "복수 국가 선택 가능",
    filter800V: "⚡ 800V+ 초급속",
    filterNewOnly: "🆕 신차·최신형",
    filterBestOnly: "🔥 베스트셀러",
    resetBtn: "↺ 필터 초기화",
    tabCards: "차량 카드 & 4개국 가격 비교",
    tabTable: "전체 스펙·가격·판매량 일람표",
    tabCharts: "분기별 판매 추이 & 포지셔닝 차트",
    resultCountHtml: count => `총 <strong class="text-slate-900 dark:text-white font-mono">${count}</strong>개 순수전기차(BEV)`,
    compareHintHtml: `💡 카드의 <strong class="text-sky-600 dark:text-sky-400">[+ 비교 담기]</strong>로 최대 4대까지 1:1 대조`,
    emptyTitle: "선택한 필터 조건에 맞는 순수전기차가 없습니다.",
    emptySub: "[↺ 필터 초기화] 버튼을 눌러 조건을 해제해 보세요.",
    kpi: {
      salesTitle: p => `${p} 최다 판매 모델`,
      salesBadge: "🏆 판매 1위",
      salesVal: (n, p) => `${n}대 판매 (${p})`,
      rangeTitle: "최장 1회 충전 주행거리",
      rangeBadge: "🔋 주행거리 1위",
      accelTitle: "최단 제로백 (0→100km/h)",
      accelBadge: "🚀 가속력 1위",
      accelVal: (s, hp) => `0→100km/h ${s}초 (${hp}마력)`,
      chargeTitle: "최단 급속충전 (10→80%)",
      chargeBadge: "⚡ 충전 1위",
      chargeVal: (m, v, kw) => `10→80% ${m}분 (${v}V · ${kw}kW)`
    },
    modelYearSuffix: "년형",
    globalSalesLabel: p => `${p} 글로벌 판매량 (추정)`,
    unitsSuffix: "대",
    preRelease: "출시 전 / 집계중",
    newLaunchBadge: "신규",
    qoqSuffix: "전분기비",
    recent7Q: "최근 7분기",
    price4RegionTitle: "🌍 4개국 출시 가격",
    marketKR: "🇰🇷 한국",
    marketUS: "🇺🇸 미국",
    marketCN: "🇨🇳 중국",
    marketEU: "🇪🇺 유럽",
    notReleased: "미출시",
    specRangeBattery: "🔋 주행거리 · 배터리",
    specPowerAccel: "🐎 최고출력 · 제로백",
    specFastCharge: "⚡ 10→80% 급속충전",
    btnCompareSelected: "✓ 비교함 담김",
    btnCompareAdd: "+ 비교 담기",
    btnTableSelected: "✓ 선택됨",
    btnTableAdd: "+ 담기",
    tableHeaders: [
      "순위 / 모델", "국가 · 브랜드", "판매량", "🇺🇸 미국 가격", "🇨🇳 중국 가격",
      "🇰🇷 한국 가격", "🇪🇺 유럽 가격", "배터리", "주행거리", "최고출력", "제로백", "초급속(10-80%)", "비교"
    ],
    chartLoading: "차트를 불러오는 중...",
    chartSalesTitle: p => `${p} 글로벌 판매 TOP 12 순수전기차`,
    chartSalesSub: "기간 선택과 국가·브랜드 필터에 맞춰 실시간으로 순위가 반영됩니다.",
    chartBrandTitle: "주요 제조사 그룹별 분기 순수전기차(BEV) 판매 추이",
    chartBrandSub: "2024 Q1 ~ 2026 Q3 글로벌 분기별 인도량 (PHEV 제외, 단위: 천 대)",
    chartBrandYAxis: "판매량 (천 대)",
    chartPriceTitle: "주요 모델 4개국 시작가 비교 (USD 환산)",
    chartPriceSub: "동일 모델의 국가별 공식 시작가 격차",
    chartScatterTitle: "가격 대비 주행거리 포지셔닝 맵",
    chartScatterSub: "X축: 출시 국가 평균 시작가(USD 환산) / Y축: 1회 충전 주행거리(km)",
    chartScatterX: "평균 시작가 (USD 환산)",
    chartScatterY: "1회 충전 주행거리 (km)",
    clearBtn: "비우기",
    openCompareBtn: "⚡ 선택 차량 상세 비교",
    removeCompare: "비교함에서 제거",
    modalTitle: "⚔️ 순수전기차 1:1 스펙 · 4개국 가격 · 판매량 비교",
    modalSub: "각 항목의 최고 스펙에 초록색 WIN 배지가 표시됩니다.",
    closeModal: "비교 창 닫기",
    modalRows: {
      metric: "비교 항목",
      sales: p => `📊 ${p} 판매량`,
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
      source: "📌 제원 출처"
    },
    alertMax4: "최대 4대까지 동시에 비교할 수 있습니다. 기존 차량을 하나 제외한 뒤 추가해 주세요.",
    alertMin2: "2대 이상의 차량을 비교함에 담아주세요.",
    sponsored: "Sponsored",
    aboutHtml: null, // Korean version is the static HTML in index.html (crawlable)
    footnoteHtml: `
      <h2 class="font-semibold text-slate-800 dark:text-slate-200">ℹ️ 데이터 기준 및 출처</h2>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>순수전기차(BEV)만 수록:</strong> 하이브리드(HEV·PHEV·EREV)는 차량 목록과 제조사 판매량 집계에서 모두 제외했습니다.</li>
        <li><strong>제원:</strong> 각 제조사 공식 제원표 기준이며, 카드마다 주행거리 인증 기준(<code>WLTP</code> / <code>EPA</code> / <code>CLTC</code>)과 출처를 표기했습니다. 인증 기준이 다르면 주행거리를 직접 비교하기 어렵습니다 (CLTC &gt; WLTP &gt; EPA 순으로 수치가 높게 나오는 경향).</li>
        <li><strong>판매량:</strong> 모델별 분기 판매량은 제조사 실적 발표와 시장조사 보도를 바탕으로 한 <strong>추정치</strong>이며, 최근 분기는 잠정치입니다. 구매·투자 판단 전에는 공식 자료를 확인하세요.</li>
        <li><strong>가격·환율:</strong> 미국(USD, 보조금 전 MSRP), 중국(CNY, 공식 시작가), 한국(만 원, 세제혜택 후·보조금 전), 유럽(EUR, 독일 부가세 포함). 환산 기준 <code>1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code>.</li>
        <li>최종 업데이트: <time datetime="2026-10-25">2026년 10월 25일</time></li>
      </ul>
    `
  },

  en: {
    meta: {
      title: "EV Comparison 2026 | Global Electric Car Prices, Range & Sales Rankings - EV Global Hub",
      description:
        "Compare 34 pure electric vehicles (BEVs) including Tesla Model Y, Hyundai IONIQ 9, Kia EV3, BYD, Xiaomi YU7, BMW iX3, Mercedes CLA and Toyota bZ4X: prices in the US, China, Korea and Europe, range, charging speed and 2024–2026 quarterly sales."
    },
    heroTitle: "Global EV Price, Spec & Sales Comparison",
    heroSub: "4-region prices, specs and 2024–2026 quarterly sales of 34 pure BEVs from Korea, Germany, the US, China and Japan",
    periodLabel: "Period",
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
      ALL: "2024–2026 Cumulative"
    },
    periodShort: { ALL: "24–26 Total", "2024 YEAR": "2024 FY", "2025 YEAR": "2025 FY" },
    currencyLabels: { local: "Local Currency", krw: "In KRW (₩)", usd: "In USD ($)" },
    currencyNote: { local: "Local currencies", krw: "Converted to KRW", usd: "Converted to USD" },
    langToggle: "한국어",
    themeLabels: { dark: "Night Mode", light: "Normal Mode" },
    brandRowLabel: "Brand",
    allBrandsChip: "All Brands",
    specRowLabel: "Filters",
    searchPlaceholder: "Search model, brand, keywords...",
    sortLabel: "Sort by",
    sortOptions: {
      "sales-desc": "📊 Highest Sales (Selected Period)",
      "range-desc": "🔋 Longest Range (km)",
      "power-desc": "🐎 Highest Power (hp)",
      "accel-asc": "🚀 Fastest 0→100 km/h",
      "charge-asc": "⚡ Shortest 10→80% Charge",
      "price-kr-asc": "🇰🇷 Lowest Price in Korea",
      "price-us-asc": "🇺🇸 Lowest Price in USA",
      "price-cn-asc": "🇨🇳 Lowest Price in China",
      "price-eu-asc": "🇪🇺 Lowest Price in Europe",
      "year-desc": "🆕 Newest Model Year First"
    },
    segments: { ALL: "All Segments (SUV/Sedan/Truck)", SUV: "SUV / Crossover", SEDAN: "Sedan / Hatchback", TRUCK: "Pickup Truck" },
    excludeCNChip: "🚫 Exclude China (KR·DE·US·JP)",
    multiRegionHint: "Multi-select enabled",
    filter800V: "⚡ 800V+ Ultra-Fast",
    filterNewOnly: "🆕 New Releases",
    filterBestOnly: "🔥 Best-Sellers",
    resetBtn: "↺ Reset Filters",
    tabCards: "Vehicle Cards & 4-Region Prices",
    tabTable: "Full Specs, Price & Sales Table",
    tabCharts: "Quarterly Trends & Value Charts",
    resultCountHtml: count => `Showing <strong class="text-slate-900 dark:text-white font-mono">${count}</strong> pure BEVs`,
    compareHintHtml: `💡 Click <strong class="text-sky-600 dark:text-sky-400">[+ Compare]</strong> on up to 4 cards for side-by-side comparison`,
    emptyTitle: "No pure electric vehicles match your filters.",
    emptySub: "Click [↺ Reset Filters] to clear active filters.",
    kpi: {
      salesTitle: p => `Top Seller (${p})`,
      salesBadge: "🏆 #1 Sales",
      salesVal: (n, p) => `${n} units (${p})`,
      rangeTitle: "Longest Driving Range",
      rangeBadge: "🔋 #1 Range",
      accelTitle: "Fastest 0→100 km/h",
      accelBadge: "🚀 #1 Sprint",
      accelVal: (s, hp) => `0→100 km/h in ${s}s (${hp} hp)`,
      chargeTitle: "Fastest 10→80% Charging",
      chargeBadge: "⚡ #1 Charging",
      chargeVal: (m, v, kw) => `10→80% in ${m} min (${v}V · ${kw}kW)`
    },
    modelYearSuffix: " MY",
    globalSalesLabel: p => `${p} Global Sales (est.)`,
    unitsSuffix: " units",
    preRelease: "Pre-launch / N/A",
    newLaunchBadge: "NEW",
    qoqSuffix: "QoQ",
    recent7Q: "Last 7 quarters",
    price4RegionTitle: "🌍 4-Region Starting Prices",
    marketKR: "🇰🇷 Korea",
    marketUS: "🇺🇸 USA",
    marketCN: "🇨🇳 China",
    marketEU: "🇪🇺 Europe",
    notReleased: "N/A",
    specRangeBattery: "🔋 Range · Battery",
    specPowerAccel: "🐎 Power · 0–100 km/h",
    specFastCharge: "⚡ 10→80% Fast Charge",
    btnCompareSelected: "✓ In Compare",
    btnCompareAdd: "+ Compare",
    btnTableSelected: "✓ Added",
    btnTableAdd: "+ Add",
    tableHeaders: [
      "Rank / Model", "Origin · Brand", "Sales", "🇺🇸 USA Price", "🇨🇳 China Price",
      "🇰🇷 Korea Price", "🇪🇺 Europe Price", "Battery", "Range", "Power", "0–100", "10–80% Charge", "Compare"
    ],
    chartLoading: "Loading charts...",
    chartSalesTitle: p => `${p} Top 12 Best-Selling BEVs`,
    chartSalesSub: "Updates with your selected period, country and brand filters.",
    chartBrandTitle: "Quarterly Pure BEV Deliveries by Automaker Group",
    chartBrandSub: "2024 Q1 – 2026 Q3 global quarterly volume (excl. PHEVs, thousands)",
    chartBrandYAxis: "Deliveries (k units)",
    chartPriceTitle: "4-Region Starting Price Comparison (USD)",
    chartPriceSub: "Official base prices across USA, China, South Korea and Europe",
    chartScatterTitle: "Driving Range vs. Average Price",
    chartScatterSub: "X: average starting price across launched markets (USD) / Y: driving range (km)",
    chartScatterX: "Average Starting Price (USD)",
    chartScatterY: "Driving Range (km)",
    clearBtn: "Clear",
    openCompareBtn: "⚡ Compare Selected",
    removeCompare: "Remove from comparison",
    modalTitle: "⚔️ Head-to-Head: Specs, 4-Region Prices & Sales",
    modalSub: "Green WIN badges highlight the best value in each row.",
    closeModal: "Close comparison",
    modalRows: {
      metric: "Specification",
      sales: p => `📊 ${p} Sales`,
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
      source: "📌 Spec Source"
    },
    alertMax4: "You can compare up to 4 vehicles at once. Please remove one first.",
    alertMin2: "Please add at least 2 vehicles to compare.",
    sponsored: "Sponsored",
    aboutHtml: `
      <h2 class="text-base font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">Which electric car sells the most worldwide?</h3>
          <p>The Tesla Model Y remains the best-selling single EV model globally, while BYD became the largest pure-BEV maker by annual volume in 2025.</p>
        </div>
        <div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">Why do prices differ so much by country?</h3>
          <p>Tariffs, local production, taxes (e.g. 19% VAT in Germany) and subsidy schemes vary by market. Toggle KRW/USD conversion to compare on one currency.</p>
        </div>
        <div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">Can I compare WLTP, EPA and CLTC ranges directly?</h3>
          <p>Not exactly. For the same car, CLTC usually reads highest, then WLTP, then EPA. Each card shows which cycle its range figure uses.</p>
        </div>
      </div>
    `,
    footnoteHtml: `
      <h2 class="font-semibold text-slate-800 dark:text-slate-200">ℹ️ Data Notes & Sources</h2>
      <ul class="list-disc list-inside space-y-1 leading-relaxed">
        <li><strong>Pure BEVs only:</strong> HEVs, PHEVs and EREVs are excluded from both the vehicle list and automaker sales totals.</li>
        <li><strong>Specs:</strong> Based on official manufacturer specifications. Each card states its range cycle (<code>WLTP</code> / <code>EPA</code> / <code>CLTC</code>) and source; ranges from different cycles are not directly comparable.</li>
        <li><strong>Sales:</strong> Per-model quarterly sales are <strong>estimates</strong> derived from manufacturer reports and market research coverage; the latest quarters are preliminary. Check official sources before making purchase or investment decisions.</li>
        <li><strong>Prices & FX:</strong> USA (USD MSRP before incentives), China (CNY official starting price), South Korea (KRW after tax benefit, before subsidy), Europe (EUR, German price incl. VAT). Conversion: <code>1 USD = 1,380 KRW = 7.20 CNY = 0.92 EUR</code>.</li>
        <li>Last updated: <time datetime="2026-10-25">October 25, 2026</time></li>
      </ul>
    `
  }
};

