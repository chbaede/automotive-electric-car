// Application Logic for EV Global Hub

const state = {
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
  compareIds: ["tesla-model-y-juniper", "hyundai-ioniq-9", "bmw-ix3-neue-klasse", "xiaomi-yu7"]
};

let chartInstances = {};

// Helper: Country Flag & Styling
const ORIGIN_META = {
  KR: { flag: "🇰🇷", label: "한국", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  DE: { flag: "🇩🇪", label: "독일", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  US: { flag: "🇺🇸", label: "미국", badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  CN: { flag: "🇨🇳", label: "중국", badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30" }
};

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
  const pct = ((currSales - prevSales) / prevSales) * 100;
  return pct;
}

// Helper: Convert any regional price to USD or KRW (만원)
function toUSD(amount, market) {
  if (amount == null) return null;
  if (market === "us") return amount;
  if (market === "cn") return amount / EXCHANGE_RATES.CNY;
  if (market === "kr") return (amount * 10000) / EXCHANGE_RATES.KRW;
  if (market === "eu") return amount / EXCHANGE_RATES.EUR;
  return null;
}

function formatMarketPrice(amount, market, mode = state.currencyMode) {
  if (amount == null) return `<span class="text-slate-600 text-[11px]">미출시</span>`;
  const usd = toUSD(amount, market);

  if (mode === "local") {
    if (market === "us") return `$${amount.toLocaleString()}`;
    if (market === "cn") return `¥${amount.toLocaleString()}`;
    if (market === "kr") {
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
  if (period === "ALL") return "24~26 누적";
  if (period === "2024 YEAR") return "2024 연간";
  if (period === "2025 YEAR") return "2025 연간";
  return period;
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
      const target = `${ev.brand} ${ev.brandKo} ${ev.name} ${ev.nameKo} ${ev.segment} ${ev.badge} ${ev.highlights.join(" ")}`.toLowerCase();
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

  // Populate Brand Chips based on current region
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
      return `
        <button data-brand="${b.brand}" class="brand-chip ${isActive ? "active" : ""} px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1">
          <span>${flag}</span>
          <span>${b.brandKo}</span>
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
  document.getElementById("kpiSalesTitle").textContent = `${periodLabel} 최다 판매 모델`;

  // Top Seller
  const bySales = [...pool].sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a));
  const topSeller = bySales[0];
  document.getElementById("kpiTopSellerName").textContent = `${topSeller.brandKo} ${topSeller.name}`;
  document.getElementById("kpiTopSellerVal").textContent = `${getSalesForPeriod(topSeller).toLocaleString()}대 판매 (${periodLabel})`;

  // Top Range
  const byRange = [...pool].sort((a, b) => b.specs.rangeKm - a.specs.rangeKm);
  const topRange = byRange[0];
  document.getElementById("kpiTopRangeName").textContent = `${topRange.brandKo} ${topRange.name}`;
  document.getElementById("kpiTopRangeVal").textContent = `1회 충전 ${topRange.specs.rangeKm} km (${topRange.specs.batteryKwh} kWh)`;

  // Top Accel
  const byAccel = [...pool].sort((a, b) => a.specs.zeroToHundred - b.specs.zeroToHundred);
  const topAccel = byAccel[0];
  document.getElementById("kpiTopAccelName").textContent = `${topAccel.brandKo} ${topAccel.name}`;
  document.getElementById("kpiTopAccelVal").textContent = `0→100km/h ${topAccel.specs.zeroToHundred}초 (${topAccel.specs.powerHp}마력)`;

  // Top Charge
  const byCharge = [...pool].sort((a, b) => a.specs.chargeTimeMin - b.specs.chargeTimeMin);
  const topCharge = byCharge[0];
  document.getElementById("kpiTopChargeName").textContent = `${topCharge.brandKo} ${topCharge.name}`;
  document.getElementById("kpiTopChargeVal").textContent = `10→80% ${topCharge.specs.chargeTimeMin}분 (${topCharge.specs.architectureV}V / ${topCharge.specs.chargingKw}kW)`;
}

// Render Mini Sparkline Bars for a vehicle's quarterly trend
function buildSparklineHTML(ev) {
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
          const barColor = isCurrent ? "bg-sky-400" : "bg-slate-700 group-hover:bg-slate-600";
          return `
            <div class="flex-1 flex flex-col items-center h-full justify-end" title="${q}: ${v.toLocaleString()}대">
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
  const container = document.getElementById("view-cards");
  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full glass-card rounded-2xl p-12 text-center border border-slate-800">
        <div class="text-3xl mb-2">🔍</div>
        <h3 class="text-base font-bold text-white">조건에 맞는 전기차 모델이 없습니다.</h3>
        <p class="text-xs text-slate-400 mt-1">지역 필터나 검색어를 초기화해 보세요.</p>
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
        qoqBadge = `<span class="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">신규출시</span>`;
      } else if (typeof qoq === "number") {
        const sign = qoq >= 0 ? "+" : "";
        const cls = qoq >= 0 ? "text-emerald-400" : "text-rose-400";
        qoqBadge = `<span class="text-[11px] font-mono ${cls}">(${sign}${qoq.toFixed(1)}% 전분기비)</span>`;
      }

      // Percentage bars for specs
      const rangePct = Math.min(100, Math.round((ev.specs.rangeKm / 800) * 100));
      const powerPct = Math.min(100, Math.round((ev.specs.powerHp / 850) * 100));

      return `
        <article class="ev-card glass-card rounded-2xl border ${isSelected ? "border-sky-500/80 ring-1 ring-sky-500/40" : "border-slate-800/90"} p-5 flex flex-col justify-between group">
          <div>
            <!-- Top Row: Rank + Country + Badges -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-sky-400 flex items-center justify-center">
                  ${index + 1}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-medium border ${originMeta.badgeClass}">
                  ${originMeta.flag} ${ev.brandKo}
                </span>
                <span class="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  ${ev.segment}
                </span>
              </div>

              <div class="flex items-center gap-1">
                ${ev.specs.architectureV >= 800 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">${ev.specs.architectureV}V</span>` : ""}
                ${ev.isNew ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">NEW</span>` : ""}
              </div>
            </div>

            <!-- Vehicle Title & Subtitle -->
            <div class="mb-3">
              <div class="flex items-baseline justify-between gap-2">
                <h2 class="text-lg font-bold text-white group-hover:text-sky-300 transition">
                  ${ev.name}
                </h2>
                <span class="text-[11px] text-slate-400 font-mono">${ev.releaseYear}년형</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${ev.nameKo}</p>
              <div class="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] text-sky-300 font-medium">
                ✨ ${ev.badge}
              </div>
            </div>

            <!-- Quarterly Sales Banner + Sparkline -->
            <div class="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 mb-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[11px] text-slate-400">${periodLabel} 글로벌 판매량</div>
                  <div class="flex items-baseline gap-1.5 mt-0.5">
                    <span class="text-base font-bold font-mono text-white">
                      ${sales > 0 ? `${sales.toLocaleString()}대` : "출시 전 / 집계중"}
                    </span>
                    ${qoqBadge}
                  </div>
                </div>
                <div class="w-24">
                  <div class="text-[10px] text-slate-500 text-right mb-0.5">최근 7분기 추이</div>
                  ${buildSparklineHTML(ev)}
                </div>
              </div>
            </div>

            <!-- 4-Market Price Grid (US / CN / KR / EU) -->
            <div class="mb-3.5">
              <div class="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>🌍 4개국 출시 가격 비교</span>
                <span class="text-[10px] text-slate-500">${state.currencyMode === "local" ? "현지 통화 기준" : state.currencyMode === "krw" ? "원화(KRW) 환산" : "달러(USD) 환산"}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-400 font-sans text-[11px]">🇰🇷 한국</span>
                  <span class="text-emerald-300 font-semibold">${formatMarketPrice(ev.prices.kr, "kr")}</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-400 font-sans text-[11px]">🇺🇸 미국</span>
                  <span class="text-slate-200">${formatMarketPrice(ev.prices.us, "us")}</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-400 font-sans text-[11px]">🇨🇳 중국</span>
                  <span class="text-rose-300">${formatMarketPrice(ev.prices.cn, "cn")}</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span class="text-slate-400 font-sans text-[11px]">🇪🇺 유럽</span>
                  <span class="text-slate-200">${formatMarketPrice(ev.prices.eu, "eu")}</span>
                </div>
              </div>
            </div>

            <!-- Performance Specs Summary -->
            <div class="space-y-2 mb-3.5 text-xs">
              <div>
                <div class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-400">🔋 주행거리 / 배터리</span>
                  <span class="font-mono text-white font-semibold">${ev.specs.rangeKm} km <span class="text-slate-400 font-normal">(${ev.specs.batteryKwh} kWh)</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style="width: ${rangePct}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-400">🐎 최고출력 / 제로백</span>
                  <span class="font-mono text-white font-semibold">${ev.specs.powerHp} hp <span class="text-slate-400 font-normal">(${ev.specs.zeroToHundred}초 · ${ev.specs.drivetrain})</span></span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full" style="width: ${powerPct}%"></div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-1 text-[11px] text-slate-300 border-t border-slate-800/60">
                <span>⚡ 급속충전 (10→80%)</span>
                <span class="font-mono text-amber-300 font-semibold">${ev.specs.chargeTimeMin}분 (최대 ${ev.specs.chargingKw}kW)</span>
              </div>
            </div>

            <!-- Highlights Bullet Points -->
            <ul class="space-y-1 text-[11px] text-slate-400 mb-4">
              ${ev.highlights
                .map(
                  h => `
                <li class="flex items-start gap-1.5">
                  <span class="text-sky-400 mt-0.5">•</span>
                  <span class="leading-snug">${h}</span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>

          <!-- Action Footer -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-500 font-mono">공차중량 ${ev.specs.weightKg.toLocaleString()}kg</span>
            <button
              data-compare-id="${ev.id}"
              class="compare-toggle-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                isSelected
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }"
            >
              ${isSelected ? "✓ 비교함에 담김" : "+ 비교 담기"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach Compare Button Events
  container.querySelectorAll(".compare-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleCompareItem(btn.getAttribute("data-compare-id"));
    });
  });
}

// Render Table View
function renderTable(list) {
  const tbody = document.getElementById("evTableBody");
  const periodLabel = getPeriodLabel();
  document.getElementById("tablePeriodHeader").textContent = `${periodLabel} 판매량`;

  tbody.innerHTML = list
    .map((ev, idx) => {
      const originMeta = ORIGIN_META[ev.origin];
      const sales = getSalesForPeriod(ev);
      const isSelected = state.compareIds.includes(ev.id);

      return `
        <tr class="hover:bg-slate-900/70 transition">
          <td class="py-3 px-4 sticky left-0 bg-slate-950/95 z-10 font-sans">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-slate-800 text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center">${idx + 1}</span>
              <div>
                <div class="font-bold text-white whitespace-nowrap">${ev.name}</div>
                <div class="text-[11px] text-slate-400 whitespace-nowrap">${ev.nameKo}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-3 font-sans whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[11px] border ${originMeta.badgeClass}">${originMeta.flag} ${ev.brandKo}</span>
          </td>
          <td class="py-3 px-3 text-right font-bold text-sky-300 whitespace-nowrap">
            ${sales > 0 ? `${sales.toLocaleString()}대` : "-"}
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${formatMarketPrice(ev.prices.us, "us")}</td>
          <td class="py-3 px-3 text-right text-rose-300 whitespace-nowrap">${formatMarketPrice(ev.prices.cn, "cn")}</td>
          <td class="py-3 px-3 text-right text-emerald-300 font-semibold whitespace-nowrap">${formatMarketPrice(ev.prices.kr, "kr")}</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${formatMarketPrice(ev.prices.eu, "eu")}</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.batteryKwh} kWh</td>
          <td class="py-3 px-3 text-right font-semibold text-white whitespace-nowrap">${ev.specs.rangeKm} km</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.powerHp} hp</td>
          <td class="py-3 px-3 text-right whitespace-nowrap">${ev.specs.zeroToHundred}초</td>
          <td class="py-3 px-3 text-right text-amber-300 whitespace-nowrap">${ev.specs.chargeTimeMin}분 (${ev.specs.architectureV}V)</td>
          <td class="py-3 px-3 text-center font-sans">
            <button data-compare-id="${ev.id}" class="table-compare-btn px-2 py-1 rounded text-[11px] font-semibold ${
              isSelected ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }">
              ${isSelected ? "✓ 선택됨" : "+ 담기"}
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

  const periodLabel = getPeriodLabel();
  document.getElementById("chartSalesTitle").textContent = `${periodLabel} 글로벌 판매 TOP 12 모델`;

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
      labels: top12.map(e => `${ORIGIN_META[e.origin].flag} ${e.brandKo} ${e.name}`),
      datasets: [
        {
          label: `${periodLabel} 판매량 (대)`,
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
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.35)" }
        },
        y: {
          ticks: { color: "#e2e8f0", font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });

  // 2. Manufacturer Quarterly Sales Trend Line Chart
  const ctxLine = document.getElementById("brandTrendLineChart").getContext("2d");
  if (chartInstances.brandLine) chartInstances.brandLine.destroy();

  const brandDatasets = Object.entries(BRAND_QUARTERLY_SUMMARY).map(([brandName, info]) => ({
    label: brandName,
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
          labels: { color: "#cbd5e1", boxWidth: 10, font: { size: 10 } }
        }
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { size: 10 } },
          grid: { color: "rgba(51, 65, 85, 0.3)" }
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.35)" },
          title: { display: true, text: "판매량 (천 대)", color: "#94a3b8" }
        }
      }
    }
  });

  // 3. 4-Region Price Comparison Grouped Bar Chart (for models available in multiple regions)
  const multiRegionModels = EV_DATA.filter(
    e => [e.prices.us, e.prices.cn, e.prices.kr, e.prices.eu].filter(v => v != null).length >= 3
  ).slice(0, 8);

  const ctxPrice = document.getElementById("regionalPriceBarChart").getContext("2d");
  if (chartInstances.regionalPrice) chartInstances.regionalPrice.destroy();

  chartInstances.regionalPrice = new Chart(ctxPrice, {
    type: "bar",
    data: {
      labels: multiRegionModels.map(e => `${e.brandKo} ${e.name.split(" ")[0]}`),
      datasets: [
        {
          label: "🇺🇸 미국 (USD)",
          data: multiRegionModels.map(e => (e.prices.us ? Math.round(toUSD(e.prices.us, "us")) : null)),
          backgroundColor: "rgba(56, 189, 248, 0.85)"
        },
        {
          label: "🇨🇳 중국 (USD환산)",
          data: multiRegionModels.map(e => (e.prices.cn ? Math.round(toUSD(e.prices.cn, "cn")) : null)),
          backgroundColor: "rgba(244, 63, 94, 0.85)"
        },
        {
          label: "🇰🇷 한국 (USD환산)",
          data: multiRegionModels.map(e => (e.prices.kr ? Math.round(toUSD(e.prices.kr, "kr")) : null)),
          backgroundColor: "rgba(16, 185, 129, 0.85)"
        },
        {
          label: "🇪🇺 유럽 (USD환산)",
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
          labels: { color: "#cbd5e1", boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: "#e2e8f0", font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: "#94a3b8",
            callback: val => `$${(val / 1000).toFixed(0)}k`
          },
          grid: { color: "rgba(51, 65, 85, 0.35)" }
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
    return {
      label: `${ORIGIN_META[orig].flag} ${ORIGIN_META[orig].label}`,
      data: models.map(m => ({
        x: getAverageUSDPrice(m),
        y: m.specs.rangeKm,
        name: `${m.brandKo} ${m.name}`
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
          labels: { color: "#cbd5e1", boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pt = ctx.raw;
              return `${pt.name}: 약 $${pt.x.toLocaleString()} / 주행거리 ${pt.y}km`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "글로벌 평균 시작가 (USD 환산)", color: "#94a3b8" },
          ticks: {
            color: "#94a3b8",
            callback: v => `$${(v / 1000).toFixed(0)}k`
          },
          grid: { color: "rgba(51, 65, 85, 0.35)" }
        },
        y: {
          title: { display: true, text: "1회 충전 주행거리 (km)", color: "#94a3b8" },
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.35)" }
        }
      }
    }
  });
}

// Manage Floating Compare Tray
function toggleCompareItem(id) {
  const idx = state.compareIds.indexOf(id);
  if (idx >= 0) {
    state.compareIds.splice(idx, 1);
  } else {
    if (state.compareIds.length >= 4) {
      alert("최대 4대까지 동시에 비교할 수 있습니다. 기존 차량을 하나 제외한 뒤 추가해 주세요.");
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
        <div class="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs shrink-0">
          <span>${ORIGIN_META[ev.origin].flag}</span>
          <span class="font-semibold text-white">${ev.brandKo} ${ev.name}</span>
          <button data-remove-compare="${ev.id}" class="text-slate-400 hover:text-rose-400 font-bold ml-1">✕</button>
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
  if (state.compareIds.length < 2) {
    alert("2대 이상의 차량을 비교함에 담아주세요.");
    return;
  }

  const modal = document.getElementById("compareModal");
  const body = document.getElementById("compareModalBody");
  const models = state.compareIds.map(id => EV_DATA.find(e => e.id === id)).filter(Boolean);

  // Best metrics calculation
  const maxRange = Math.max(...models.map(m => m.specs.rangeKm));
  const maxBattery = Math.max(...models.map(m => m.specs.batteryKwh));
  const maxPower = Math.max(...models.map(m => m.specs.powerHp));
  const minAccel = Math.min(...models.map(m => m.specs.zeroToHundred));
  const minCharge = Math.min(...models.map(m => m.specs.chargeTimeMin));
  const maxSales = Math.max(...models.map(m => getSalesForPeriod(m)));

  const winBadge = `<span class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">WIN</span>`;

  body.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="py-3 px-4 text-slate-400 w-40">비교 항목</th>
            ${models
              .map(
                m => `
              <th class="py-3 px-4 min-w-[180px]">
                <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <span>${ORIGIN_META[m.origin].flag} ${m.brandKo}</span>
                  <span>·</span>
                  <span>${m.segment}</span>
                </div>
                <div class="text-base font-bold text-white">${m.name}</div>
                <div class="text-xs text-sky-400 font-normal mt-0.5">${m.nameKo}</div>
              </th>
            `
              )
              .join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/70 font-mono text-xs">
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">📊 ${getPeriodLabel()} 판매량</td>
            ${models
              .map(m => {
                const s = getSalesForPeriod(m);
                return `<td class="py-3 px-4 font-bold text-white">${s.toLocaleString()}대 ${s === maxSales && s > 0 ? winBadge : ""}</td>`;
              })
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🇰🇷 한국 출시가</td>
            ${models.map(m => `<td class="py-3 px-4 text-emerald-300 font-semibold">${formatMarketPrice(m.prices.kr, "kr")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🇺🇸 미국 출시가</td>
            ${models.map(m => `<td class="py-3 px-4">${formatMarketPrice(m.prices.us, "us")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🇨🇳 중국 출시가</td>
            ${models.map(m => `<td class="py-3 px-4 text-rose-300">${formatMarketPrice(m.prices.cn, "cn")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🇪🇺 유럽 출시가</td>
            ${models.map(m => `<td class="py-3 px-4">${formatMarketPrice(m.prices.eu, "eu")}</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🔋 1회 충전 주행거리</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-white">${m.specs.rangeKm} km ${
                    m.specs.rangeKm === maxRange ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">⚡ 배터리 용량</td>
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
            <td class="py-3 px-4 font-sans text-slate-400">🐎 최고 출력</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-white">${m.specs.powerHp} 마력 ${
                    m.specs.powerHp === maxPower ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🚀 제로백 (0→100km/h)</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 font-bold text-white">${m.specs.zeroToHundred}초 ${
                    m.specs.zeroToHundred === minAccel ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">🔌 초급속 충전 (10→80%)</td>
            ${models
              .map(
                m =>
                  `<td class="py-3 px-4 text-amber-300 font-semibold">${m.specs.chargeTimeMin}분 (${m.specs.chargingKw}kW / ${m.specs.architectureV}V) ${
                    m.specs.chargeTimeMin === minCharge ? winBadge : ""
                  }</td>`
              )
              .join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">⚙️ 구동방식 / 최고속도</td>
            ${models.map(m => `<td class="py-3 px-4">${m.specs.drivetrain} · ${m.specs.topSpeedKmh} km/h</td>`).join("")}
          </tr>
          <tr>
            <td class="py-3 px-4 font-sans text-slate-400">⚖️ 공차중량</td>
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
  renderFilterMeta();
  const list = getFilteredAndSortedEVs();
  document.getElementById("resultCount").textContent = list.length;

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
    const labels = {
      local: "현지 통화 표기",
      krw: "원화(KRW) 환산 표기",
      usd: "달러(USD) 환산 표기"
    };
    const nextIdx = (order.indexOf(state.currencyMode) + 1) % order.length;
    state.currencyMode = order[nextIdx];
    document.getElementById("currencyToggleLabel").textContent = labels[state.currencyMode];
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
    document.getElementById("segmentFilter").value = "ALL";
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

