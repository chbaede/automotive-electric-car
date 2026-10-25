// Global Electric Vehicle Comparison Dataset (2024 - 2026)
// Exchange rates for normalized USD comparison:
// 1 USD = 1,380 KRW | 1 USD = 7.20 CNY | 1 USD = 0.92 EUR

const EXCHANGE_RATES = {
  USD: 1,
  KRW: 1380,
  CNY: 7.2,
  EUR: 0.92
};

const QUARTERS = [
  "2024 Q1", "2024 Q2", "2024 Q3", "2024 Q4",
  "2025 Q1", "2025 Q2", "2025 Q3", "2025 Q4",
  "2026 Q1", "2026 Q2", "2026 Q3"
];

const EV_DATA = [
  // ======================== USA ========================
  {
    id: "tesla-model-y-juniper",
    brand: "Tesla",
    brandKo: "테슬라",
    name: "Model Y (Juniper)",
    nameKo: "모델 Y 주니퍼 (Long Range AWD)",
    origin: "US",
    originKo: "미국",
    segment: "중형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: true,
    badge: "글로벌 판매 1위 / 신형 주니퍼",
    specs: {
      batteryKwh: 78.4,
      rangeKm: 551,       // WLTP 기준 (한국 인증 약 480km, EPA 526km)
      powerHp: 514,
      zeroToHundred: 4.3,
      topSpeedKmh: 217,
      chargingKw: 250,
      chargeTimeMin: 27,  // 10-80%
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 1979
    },
    prices: {
      us: 47990,          // USD
      cn: 263500,         // CNY
      kr: 5999,           // 만원 (KRW 10,000)
      eu: 54990           // EUR
    },
    quarterlySales: {
      "2024 Q1": 265000, "2024 Q2": 292000, "2024 Q3": 310000, "2024 Q4": 325000,
      "2025 Q1": 248000, "2025 Q2": 285000, "2025 Q3": 302000, "2025 Q4": 318000,
      "2026 Q1": 276000, "2026 Q2": 295000, "2026 Q3": 308000
    },
    highlights: ["2025년 리프레시 '주니퍼' 디자인", "전후면 일자형 라이트바 & 2열 스크린", "전 세계 단일 모델 누적 판매 압도적 1위"]
  },
  {
    id: "tesla-model-3-highland",
    brand: "Tesla",
    brandKo: "테슬라",
    name: "Model 3 (Highland)",
    nameKo: "모델 3 하이랜드 (Long Range AWD)",
    origin: "US",
    originKo: "미국",
    segment: "중형 세단",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "글로벌 세단 베스트셀러",
    specs: {
      batteryKwh: 78.4,
      rangeKm: 629,       // WLTP
      powerHp: 498,
      zeroToHundred: 4.4,
      topSpeedKmh: 201,
      chargingKw: 250,
      chargeTimeMin: 27,
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 1828
    },
    prices: {
      us: 47490,
      cn: 275500,
      kr: 5999,
      eu: 49990
    },
    quarterlySales: {
      "2024 Q1": 112000, "2024 Q2": 138000, "2024 Q3": 145000, "2024 Q4": 156000,
      "2025 Q1": 128000, "2025 Q2": 141000, "2025 Q3": 149000, "2025 Q4": 152000,
      "2026 Q1": 134000, "2026 Q2": 143000, "2026 Q3": 148000
    },
    highlights: ["동급 최고 수준 전비 효율 (Cd 0.219)", "1열 통풍시트 및 이중접합 차음유리 기본화", "LFP(RWD) 및 NCM(LR) 이원화 전략"]
  },
  {
    id: "tesla-cybertruck",
    brand: "Tesla",
    brandKo: "테슬라",
    name: "Cybertruck AWD",
    nameKo: "사이버트럭 (Dual Motor AWD)",
    origin: "US",
    originKo: "미국",
    segment: "대형 픽업트럭",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: false,
    badge: "800V 스티어링 바이 와이어",
    specs: {
      batteryKwh: 123.0,
      rangeKm: 547,       // EPA 340mi
      powerHp: 600,
      zeroToHundred: 4.1,
      topSpeedKmh: 180,
      chargingKw: 350,
      chargeTimeMin: 28,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2995
    },
    prices: {
      us: 79990,
      cn: null,
      kr: 11500,          // 국내 출시 참고/예상가
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 2800, "2024 Q2": 8700, "2024 Q3": 16600, "2024 Q4": 12900,
      "2025 Q1": 9400, "2025 Q2": 11200, "2025 Q3": 11800, "2025 Q4": 10500,
      "2026 Q1": 9800, "2026 Q2": 10400, "2026 Q3": 10900
    },
    highlights: ["초고경도 스테인리스 스틸 엑소스켈레톤 바디", "Steer-by-Wire 및 후륜 조향 기본 탑재", "48V 저전압 아키텍처 & 800V 고전압 시스템"]
  },
  {
    id: "chevy-equinox-ev",
    brand: "Chevrolet (GM)",
    brandKo: "쉐보레 (GM)",
    name: "Equinox EV",
    nameKo: "이쿼녹스 EV (2LT FWD)",
    origin: "US",
    originKo: "미국",
    segment: "중형 SUV",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "북미 가성비 1위 SUV",
    specs: {
      batteryKwh: 85.0,
      rangeKm: 513,       // EPA 319mi
      powerHp: 220,
      zeroToHundred: 7.7,
      topSpeedKmh: 180,
      chargingKw: 150,
      chargeTimeMin: 32,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 2270
    },
    prices: {
      us: 34995,
      cn: 195000,
      kr: 4790,
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 1200, "2024 Q2": 4500, "2024 Q3": 15200, "2024 Q4": 24800,
      "2025 Q1": 26500, "2025 Q2": 31200, "2025 Q3": 34500, "2025 Q4": 33100,
      "2026 Q1": 29800, "2026 Q2": 32400, "2026 Q3": 35100
    },
    highlights: ["GM 얼티엄(Ultium) 플랫폼 기반 볼륨 모델", "3만 달러 중반대 시작가로 북미 판매 급증", "17.7인치 대형 인포테인먼트 디스플레이"]
  },
  {
    id: "ford-mustang-mach-e",
    brand: "Ford",
    brandKo: "포드",
    name: "Mustang Mach-E",
    nameKo: "머스탱 마하-E (Extended AWD)",
    origin: "US",
    originKo: "미국",
    segment: "중형 SUV",
    releaseYear: 2025,
    isNew: false,
    isBestSeller: true,
    badge: "북미 스테디셀러 SUV",
    specs: {
      batteryKwh: 91.0,
      rangeKm: 515,
      powerHp: 365,
      zeroToHundred: 4.8,
      topSpeedKmh: 190,
      chargingKw: 150,
      chargeTimeMin: 36,
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 2218
    },
    prices: {
      us: 43995,
      cn: 239800,
      kr: 6200,
      eu: 55800
    },
    quarterlySales: {
      "2024 Q1": 14800, "2024 Q2": 18500, "2024 Q3": 21200, "2024 Q4": 23400,
      "2025 Q1": 17900, "2025 Q2": 20400, "2025 Q3": 22100, "2025 Q4": 21500,
      "2026 Q1": 18200, "2026 Q2": 19800, "2026 Q3": 20900
    },
    highlights: ["2025년형 히트펌프 기본 장착 및 리어 모터 업그레이드", "포드 블루크루즈(BlueCruise) 핸즈프리 주행 지원", "스포티한 핸들링과 머스탱 헤리티지 디자인"]
  },
  {
    id: "rivian-r1s-gen2",
    brand: "Rivian",
    brandKo: "리비안",
    name: "R1S Gen 2",
    nameKo: "R1S 2세대 (Dual Max AWD)",
    origin: "US",
    originKo: "미국",
    segment: "대형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "660km 장거리 어드벤처 SUV",
    specs: {
      batteryKwh: 141.5,
      rangeKm: 660,       // EPA 410mi
      powerHp: 665,
      zeroToHundred: 3.4,
      topSpeedKmh: 209,
      chargingKw: 220,
      chargeTimeMin: 30,
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 3080
    },
    prices: {
      us: 89900,
      cn: null,
      kr: null,
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 9800, "2024 Q2": 10200, "2024 Q3": 7900, "2024 Q4": 11400,
      "2025 Q1": 8900, "2025 Q2": 10800, "2025 Q3": 12200, "2025 Q4": 12800,
      "2026 Q1": 11500, "2026 Q2": 13100, "2026 Q3": 14200
    },
    highlights: ["2세대 전장 아키텍처(Zonal)로 배선 2.6km 단축", "대용량 맥스팩 적용 시 EPA 660km(410마일) 주행", "2026년 중형 SUV 'R2($45,000)' 출시로 라인업 확장"]
  },
  {
    id: "lucid-gravity",
    brand: "Lucid",
    brandKo: "루시드",
    name: "Gravity Grand Touring",
    nameKo: "그래비티 그랜드 투어링",
    origin: "US",
    originKo: "미국",
    segment: "대형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "926V 초고전압 럭셔리 3열 SUV",
    specs: {
      batteryKwh: 123.0,
      rangeKm: 724,       // EPA 450mi
      powerHp: 828,
      zeroToHundred: 3.5,
      topSpeedKmh: 250,
      chargingKw: 350,
      chargeTimeMin: 15,
      architectureV: 900,
      drivetrain: "AWD",
      weightKg: 2740
    },
    prices: {
      us: 94900,
      cn: null,
      kr: 14500,          // 예상/직수입 환산
      eu: 109900
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 450,
      "2025 Q1": 1800, "2025 Q2": 3200, "2025 Q3": 4600, "2025 Q4": 5400,
      "2026 Q1": 5800, "2026 Q2": 6400, "2026 Q3": 7100
    },
    highlights: ["926V 아키텍처로 15분 충전에 320km 주행 가능", "828마력 출력과 EPA 724km(450마일) 세계 최고 수준 주행거리", "34인치 커브드 6K OLED 플로팅 디스플레이"]
  },

  // ======================== CHINA ========================
  {
    id: "byd-seagull",
    brand: "BYD",
    brandKo: "BYD",
    name: "Seagull (Dolphin Mini)",
    nameKo: "시걸 / 돌핀 미니",
    origin: "CN",
    originKo: "중국",
    segment: "경소형 해치백",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "중국 판매 1위 / 1천만원대 초가성비",
    specs: {
      batteryKwh: 38.9,
      rangeKm: 405,       // CLTC (WLTP ~310km)
      powerHp: 75,
      zeroToHundred: 13.0,
      topSpeedKmh: 130,
      chargingKw: 40,
      chargeTimeMin: 30,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 1240
    },
    prices: {
      us: null,
      cn: 69800,          // 약 9,700 달러!
      kr: null,
      eu: 19990
    },
    quarterlySales: {
      "2024 Q1": 84000, "2024 Q2": 107000, "2024 Q3": 138000, "2024 Q4": 162000,
      "2025 Q1": 125000, "2025 Q2": 148000, "2025 Q3": 165000, "2025 Q4": 178000,
      "2026 Q1": 142000, "2026 Q2": 159000, "2026 Q3": 171000
    },
    highlights: ["중국 내 시작가 69,800위안(약 1,350만 원)의 파괴적 가격", "BYD 블레이드(LFP) 배터리 및 e-Platform 3.0 적용", "중남미·동남아·유럽(돌핀 서프/미니) 수출 주력 모델"]
  },
  {
    id: "byd-atto-3",
    brand: "BYD",
    brandKo: "BYD",
    name: "Atto 3 (Yuan Plus)",
    nameKo: "아토 3 (위안 플러스)",
    origin: "CN",
    originKo: "중국",
    segment: "소형/준중형 SUV",
    releaseYear: 2025,
    isNew: false,
    isBestSeller: true,
    badge: "한국 정식 출시 / 글로벌 수출 1위",
    specs: {
      batteryKwh: 60.5,
      rangeKm: 420,       // WLTP (한국 인증 321km)
      powerHp: 204,
      zeroToHundred: 7.3,
      topSpeedKmh: 160,
      chargingKw: 88,
      chargeTimeMin: 29,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 1750
    },
    prices: {
      us: null,
      cn: 119800,
      kr: 3150,           // 한국 공식 출시가 3,150만원!
      eu: 37990
    },
    quarterlySales: {
      "2024 Q1": 71000, "2024 Q2": 89000, "2024 Q3": 98000, "2024 Q4": 105000,
      "2025 Q1": 82000, "2025 Q2": 96000, "2025 Q3": 104000, "2025 Q4": 112000,
      "2026 Q1": 88000, "2026 Q2": 99000, "2026 Q3": 106000
    },
    highlights: ["한국 정식 출시가 3,150만 원(보조금 적용 시 2천만 원 후반)", "전 세계 70개국 이상에 수출되는 BYD 글로벌 베스트셀러", "회전식 12.8인치 디스플레이 및 티맵 내비게이션(한국형) 탑재"]
  },
  {
    id: "byd-seal",
    brand: "BYD",
    brandKo: "BYD",
    name: "Seal AWD",
    nameKo: "실 (Seal) 퍼포먼스 AWD",
    origin: "CN",
    originKo: "중국",
    segment: "중형 세단",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: true,
    badge: "CTB 배터리 일체형 스포츠 세단",
    specs: {
      batteryKwh: 82.5,
      rangeKm: 520,       // WLTP
      powerHp: 530,
      zeroToHundred: 3.8,
      topSpeedKmh: 180,
      chargingKw: 150,
      chargeTimeMin: 26,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2150
    },
    prices: {
      us: null,
      cn: 179800,
      kr: 4750,           // 한국 출시가
      eu: 49990
    },
    quarterlySales: {
      "2024 Q1": 34000, "2024 Q2": 42000, "2024 Q3": 51000, "2024 Q4": 58000,
      "2025 Q1": 46000, "2025 Q2": 55000, "2025 Q3": 62000, "2025 Q4": 67000,
      "2026 Q1": 54000, "2026 Q2": 61000, "2026 Q3": 66000
    },
    highlights: ["CTB(Cell-to-Body) 차체 배터리 일체화 기술로 비틀림 강성 극대화", "제원상 530마력·제로백 3.8초의 고성능으로 모델 3 정조준", "2025년형부터 800V 고전압 플랫폼 및 라이다 센서 업그레이드"]
  },
  {
    id: "xiaomi-su7-max",
    brand: "Xiaomi",
    brandKo: "샤오미",
    name: "SU7 Max",
    nameKo: "SU7 맥스 AWD",
    origin: "CN",
    originKo: "중국",
    segment: "준대형 세단",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "출시 직후 포르쉐 타이칸급 돌풍",
    specs: {
      batteryKwh: 101.0,
      rangeKm: 800,       // CLTC (WLTP 환산 약 660km)
      powerHp: 673,
      zeroToHundred: 2.78,
      topSpeedKmh: 265,
      chargingKw: 400,
      chargeTimeMin: 19,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2205
    },
    prices: {
      us: null,
      cn: 299900,         // 약 4.1만 달러
      kr: null,
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 27300, "2024 Q3": 39800, "2024 Q4": 69700,
      "2025 Q1": 75800, "2025 Q2": 84200, "2025 Q3": 91000, "2025 Q4": 96500,
      "2026 Q1": 88000, "2026 Q2": 93500, "2026 Q3": 98200
    },
    highlights: ["871V 실리콘 카바이드(SiC) 플랫폼과 CATL 기린 배터리 탑재", "제로백 2.78초, 최고속도 265km/h의 슈퍼카급 퍼포먼스", "샤오미 HyperOS 생태계로 스마트폰·가전 완벽 연동"]
  },
  {
    id: "xiaomi-yu7",
    brand: "Xiaomi",
    brandKo: "샤오미",
    name: "YU7 Pro AWD",
    nameKo: "YU7 (샤오미 첫 전기 SUV)",
    origin: "CN",
    originKo: "중국",
    segment: "중대형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: true,
    badge: "2025-26 최고 화제작 SUV",
    specs: {
      batteryKwh: 96.3,
      rangeKm: 760,       // CLTC (WLTP 환산 약 625km)
      powerHp: 691,
      zeroToHundred: 3.2,
      topSpeedKmh: 253,
      chargingKw: 420,
      chargeTimeMin: 16,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2315
    },
    prices: {
      us: null,
      cn: 259900,
      kr: null,
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 0,
      "2025 Q1": 0, "2025 Q2": 12000, "2025 Q3": 68000, "2025 Q4": 95000,
      "2026 Q1": 104000, "2026 Q2": 118000, "2026 Q3": 126000
    },
    highlights: ["테슬라 모델 Y 주니퍼를 겨냥해 출시된 쿠페형 고성능 전기 SUV", "전면 파노라믹 헤드업 디스플레이(PHUD) 및 루프 라이다 탑재", "출시 직후 수십만 대 사전계약 돌파하며 중국 SUV 시장 평정"]
  },
  {
    id: "geely-xingyuan",
    brand: "Geely",
    brandKo: "지리 (Geely)",
    name: "Geome Xingyuan",
    nameKo: "싱위안 (Xingyuan)",
    origin: "CN",
    originKo: "중국",
    segment: "소형 해치백",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "2025-26 중국 판매 급부상 다크호스",
    specs: {
      batteryKwh: 40.2,
      rangeKm: 410,       // CLTC
      powerHp: 115,
      zeroToHundred: 8.9,
      topSpeedKmh: 140,
      chargingKw: 70,
      chargeTimeMin: 21,
      architectureV: 400,
      drivetrain: "RWD",
      weightKg: 1285
    },
    prices: {
      us: null,
      cn: 68800,
      kr: null,
      eu: null
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 8500, "2024 Q4": 52000,
      "2025 Q1": 89000, "2025 Q2": 114000, "2025 Q3": 128000, "2025 Q4": 139000,
      "2026 Q1": 122000, "2026 Q2": 135000, "2026 Q3": 144000
    },
    highlights: ["BYD 시걸/돌핀을 정조준한 후륜구동(RWD) 소형 전기차", "동급 유일 독립식 멀티링크 서스펜션과 Flyme Auto OS 탑재", "2025~2026년 중국 내 월간 판매량 최상위권 등극"]
  },
  {
    id: "zeekr-7x",
    brand: "Zeekr (Geely)",
    brandKo: "지커 (Zeekr)",
    name: "Zeekr 7X AWD",
    nameKo: "지커 7X (한국 출시 예정)",
    origin: "CN",
    originKo: "중국",
    segment: "중형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "10.5분 초급속 골든 배터리",
    specs: {
      batteryKwh: 100.0,
      rangeKm: 615,       // WLTP (CLTC 705km)
      powerHp: 637,
      zeroToHundred: 3.8,
      topSpeedKmh: 210,
      chargingKw: 450,
      chargeTimeMin: 13,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2475
    },
    prices: {
      us: null,
      cn: 229900,
      kr: 5890,           // 한국 진출 예상 가격대
      eu: 52990
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 4200, "2024 Q4": 28500,
      "2025 Q1": 24000, "2025 Q2": 29500, "2025 Q3": 33000, "2025 Q4": 36200,
      "2026 Q1": 31000, "2026 Q2": 34800, "2026 Q3": 37900
    },
    highlights: ["지리그룹 프리미엄 브랜드 지커(Zeekr)의 한국·유럽 전략형 중형 SUV", "800V SEA 아키텍처 기반으로 10~80% 충전 최단 11~13분대 기록", "에어 서스펜션 및 나파 가죽 등 럭셔리 사양 대거 탑재"]
  },

  // ======================== KOREA ========================
  {
    id: "hyundai-ioniq-5-pe",
    brand: "Hyundai",
    brandKo: "현대",
    name: "IONIQ 5 (The New)",
    nameKo: "더 뉴 아이오닉 5 (Long Range 2WD)",
    origin: "KR",
    originKo: "한국",
    segment: "중형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "84kWh 배터리 업그레이드",
    specs: {
      batteryKwh: 84.0,
      rangeKm: 485,       // 한국 인증 485km (WLTP 570km)
      powerHp: 225,
      zeroToHundred: 7.3,
      topSpeedKmh: 185,
      chargingKw: 350,
      chargeTimeMin: 18,
      architectureV: 800,
      drivetrain: "RWD",
      weightKg: 2025
    },
    prices: {
      us: 46650,
      cn: null,
      kr: 5410,
      eu: 51800
    },
    quarterlySales: {
      "2024 Q1": 24500, "2024 Q2": 29800, "2024 Q3": 31200, "2024 Q4": 33500,
      "2025 Q1": 27400, "2025 Q2": 32100, "2025 Q3": 34000, "2025 Q4": 31800,
      "2026 Q1": 28900, "2026 Q2": 31500, "2026 Q3": 32800
    },
    highlights: ["4세대 84.0kWh 고밀도 배터리 탑재로 주행거리 대폭 향상", "800V E-GMP 초급속 충전 (10→80% 18분) 및 리어 와이퍼 추가", "미국 조지아 메타플랜트(HMGMA) 현지 생산으로 북미 경쟁력 강화"]
  },
  {
    id: "hyundai-ioniq-9",
    brand: "Hyundai",
    brandKo: "현대",
    name: "IONIQ 9",
    nameKo: "아이오닉 9 (Long Range AWD)",
    origin: "KR",
    originKo: "한국",
    segment: "대형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "110.3kWh 플래그십 3열 SUV",
    specs: {
      batteryKwh: 110.3,
      rangeKm: 532,       // 19인치 2WD 기준 532km, AWD 503km (WLTP 620km)
      powerHp: 308,       // 성능형 AWD는 428마력
      zeroToHundred: 6.7, // 성능형은 5.2초
      topSpeedKmh: 200,
      chargingKw: 350,
      chargeTimeMin: 24,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2610
    },
    prices: {
      us: 61500,
      cn: null,
      kr: 6995,           // 세제혜택 후 6,715만원(2WD) ~ 6,995만원(AWD)
      eu: 72900
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 0,
      "2025 Q1": 3800, "2025 Q2": 11500, "2025 Q3": 14800, "2025 Q4": 16200,
      "2026 Q1": 15400, "2026 Q2": 17100, "2026 Q3": 18500
    },
    highlights: ["현대차 최초의 전동화 대형 SUV, 110.3kWh 대용량 배터리 탑재", "에어로스테틱(Aerosthetic) 디자인으로 대형 SUV 최고 수준 공기저항계수(Cd 0.259)", "전 트림 500km 이상 주행거리 확보 및 경쟁력 있는 국내 출시가 책정"]
  },
  {
    id: "hyundai-casper-electric",
    brand: "Hyundai",
    brandKo: "현대",
    name: "Casper Electric (Inster)",
    nameKo: "캐스퍼 일렉트릭 (인스터)",
    origin: "KR",
    originKo: "한국",
    segment: "경소형 SUV",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "유럽·한국 소형 EV 히트작",
    specs: {
      batteryKwh: 49.0,
      rangeKm: 370,       // WLTP 370km (한국 인증 315km)
      powerHp: 115,
      zeroToHundred: 10.6,
      topSpeedKmh: 150,
      chargingKw: 120,
      chargeTimeMin: 30,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 1335
    },
    prices: {
      us: null,
      cn: null,
      kr: 2990,
      eu: 23900
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 5200, "2024 Q4": 12800,
      "2025 Q1": 16500, "2025 Q2": 21400, "2025 Q3": 24800, "2025 Q4": 26100,
      "2026 Q1": 23500, "2026 Q2": 25800, "2026 Q3": 27200
    },
    highlights: ["기존 내연기관 캐스퍼 대비 휠베이스 180mm 연장으로 소형차급 공간 확보", "LG에너지솔루션 49kWh NCM 배터리 탑재로 315km(국내)/370km(WLTP) 인증", "유럽 수출명 '인스터(Inster)'로 2025 세계 올해의 전기차 부문 수상"]
  },
  {
    id: "kia-ev3",
    brand: "Kia",
    brandKo: "기아",
    name: "EV3 Long Range",
    nameKo: "EV3 롱레인지",
    origin: "KR",
    originKo: "한국",
    segment: "소형/준중형 SUV",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "2025 세계 올해의 차(WCOTY) 선정",
    specs: {
      batteryKwh: 81.4,
      rangeKm: 605,       // WLTP 605km (한국 인증 501km)
      powerHp: 204,
      zeroToHundred: 7.5,
      topSpeedKmh: 170,
      chargingKw: 135,
      chargeTimeMin: 31,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 1810
    },
    prices: {
      us: 35500,
      cn: null,
      kr: 4415,           // 스탠다드 3,995만 / 롱레인지 4,415만원
      eu: 38990
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 1800, "2024 Q3": 14500, "2024 Q4": 28400,
      "2025 Q1": 32500, "2025 Q2": 38900, "2025 Q3": 42100, "2025 Q4": 44500,
      "2026 Q1": 39800, "2026 Q2": 43200, "2026 Q3": 45600
    },
    highlights: ["콤팩트 SUV 체급에 81.4kWh 대용량 배터리 탑재해 한국 501km / 유럽 605km 주행", "전기차 대중화를 이끈 베스트셀러로 한국·유럽 시장 판매 최상위권", "i-페달 3.0, AI 어시스턴트, 실내외 V2L 기본 적용"]
  },
  {
    id: "kia-ev4",
    brand: "Kia",
    brandKo: "기아",
    name: "EV4 Long Range",
    nameKo: "EV4 롱레인지 세단",
    origin: "KR",
    originKo: "한국",
    segment: "준중형 세단",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "기아 최초 전동화 세단 (533km)",
    specs: {
      batteryKwh: 81.4,
      rangeKm: 630,       // WLTP 630km (한국 인증 533km)
      powerHp: 204,
      zeroToHundred: 7.4,
      topSpeedKmh: 170,
      chargingKw: 135,
      chargeTimeMin: 31,
      architectureV: 400,
      drivetrain: "FWD",
      weightKg: 1800
    },
    prices: {
      us: 37000,
      cn: null,
      kr: 4462,           // 스탠다드 4,042만 / 롱레인지 4,462만원
      eu: 41500
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 0,
      "2025 Q1": 1200, "2025 Q2": 14500, "2025 Q3": 22800, "2025 Q4": 26400,
      "2026 Q1": 24900, "2026 Q2": 28100, "2026 Q3": 30200
    },
    highlights: ["공기저항계수 0.23의 패스트백 실루엣으로 현대기아 전기차 중 최장 주행거리(국내 533km)", "세단 모델과 유럽 전략형 해치백 모델 동시 운영", "보조금 적용 시 3천만 원대 구매 가능한 대중형 전기 세단"]
  },
  {
    id: "kia-ev6-pe",
    brand: "Kia",
    brandKo: "기아",
    name: "EV6 (The New)",
    nameKo: "더 뉴 EV6 (Long Range AWD)",
    origin: "KR",
    originKo: "한국",
    segment: "중형 크로스오버",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "800V 크로스오버 스테디셀러",
    specs: {
      batteryKwh: 84.0,
      rangeKm: 546,       // WLTP (한국 인증 2WD 494km / AWD 461km)
      powerHp: 325,
      zeroToHundred: 5.2,
      topSpeedKmh: 188,
      chargingKw: 350,
      chargeTimeMin: 18,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2090
    },
    prices: {
      us: 49850,
      cn: null,
      kr: 5815,
      eu: 54990
    },
    quarterlySales: {
      "2024 Q1": 19500, "2024 Q2": 23400, "2024 Q3": 24800, "2024 Q4": 22100,
      "2025 Q1": 20800, "2025 Q2": 24200, "2025 Q3": 25500, "2025 Q4": 23900,
      "2026 Q1": 21500, "2026 Q2": 23800, "2026 Q3": 24900
    },
    highlights: ["스타맵 시그니처 라이팅 적용 페이스리프트 및 84kWh 배터리 탑재", "정전식 스티어링 휠 그립 감지 및 파노라믹 커브드 디스플레이 개선", "18분 초급속 충전과 다이내믹한 주행 감각"]
  },
  {
    id: "kia-ev9",
    brand: "Kia",
    brandKo: "기아",
    name: "EV9 AWD",
    nameKo: "EV9 롱레인지 4WD",
    origin: "KR",
    originKo: "한국",
    segment: "대형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: false,
    badge: "2024 세계 올해의 차 수상작",
    specs: {
      batteryKwh: 99.8,
      rangeKm: 512,       // WLTP (한국 인증 2WD 501km / 4WD 454km)
      powerHp: 384,
      zeroToHundred: 5.3,
      topSpeedKmh: 200,
      chargingKw: 350,
      chargeTimeMin: 24,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2560
    },
    prices: {
      us: 63900,
      cn: null,
      kr: 7685,
      eu: 76990
    },
    quarterlySales: {
      "2024 Q1": 9200, "2024 Q2": 11800, "2024 Q3": 13400, "2024 Q4": 12100,
      "2025 Q1": 10500, "2025 Q2": 11900, "2025 Q3": 12400, "2025 Q4": 11800,
      "2026 Q1": 10200, "2026 Q2": 11400, "2026 Q3": 11900
    },
    highlights: ["북미·유럽에서 호평받은 정통 박스형 3열 전기 SUV", "2열 스위블 시트 및 릴렉션 시트 등 다양한 시트 구성 제공", "508마력 고성능 모델 'EV9 GT' 추가 출시로 라인업 완성"]
  },

  // ======================== GERMANY (독일 3사 + 폭스바겐/포르쉐) ========================
  {
    id: "bmw-ix3-neue-klasse",
    brand: "BMW",
    brandKo: "BMW",
    name: "iX3 (Neue Klasse NA5)",
    nameKo: "신형 iX3 50 xDrive (노이어 클라쎄)",
    origin: "DE",
    originKo: "독일",
    segment: "중형 SUV",
    releaseYear: 2026,
    isNew: true,
    isBestSeller: false,
    badge: "차세대 노이어 클라쎄 800km+",
    specs: {
      batteryKwh: 100.0,
      rangeKm: 800,       // WLTP 800km 목표 (6세대 원통형 배터리)
      powerHp: 469,
      zeroToHundred: 4.5,
      topSpeedKmh: 210,
      chargingKw: 400,
      chargeTimeMin: 15,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2180
    },
    prices: {
      us: 59900,
      cn: 405000,
      kr: 8600,
      eu: 68900
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 0,
      "2025 Q1": 0, "2025 Q2": 0, "2025 Q3": 0, "2025 Q4": 4200,
      "2026 Q1": 16800, "2026 Q2": 29500, "2026 Q3": 38400
    },
    highlights: ["BMW의 차세대 전동화 전용 플랫폼 '노이어 클라쎄(Neue Klasse)' 첫 양산차", "6세대 원통형 배터리 셀 & 800V 시스템으로 충전 속도 30%, 주행거리 30% 향상", "운전석 전면 유리 전체를 활용하는 'BMW 파노라믹 비전' HUD 최초 적용"]
  },
  {
    id: "bmw-i4-edrive40",
    brand: "BMW",
    brandKo: "BMW",
    name: "i4 eDrive40 (LCI)",
    nameKo: "뉴 i4 eDrive40 그란쿠페",
    origin: "DE",
    originKo: "독일",
    segment: "중형 세단",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "독일 3사 최다 판매 전기 세단",
    specs: {
      batteryKwh: 83.9,
      rangeKm: 590,       // WLTP (한국 인증 429km)
      powerHp: 340,
      zeroToHundred: 5.6,
      topSpeedKmh: 190,
      chargingKw: 205,
      chargeTimeMin: 28,
      architectureV: 400,
      drivetrain: "RWD",
      weightKg: 2125
    },
    prices: {
      us: 57900,
      cn: 429900,
      kr: 7830,
      eu: 60500
    },
    quarterlySales: {
      "2024 Q1": 21500, "2024 Q2": 24800, "2024 Q3": 25200, "2024 Q4": 26900,
      "2025 Q1": 22400, "2025 Q2": 25100, "2025 Q3": 26300, "2025 Q4": 27100,
      "2026 Q1": 23800, "2026 Q2": 25500, "2026 Q3": 26200
    },
    highlights: ["BMW 특유의 후륜구동 주행 감성을 그대로 살린 베스트셀링 그란쿠페", "2024년 말 LCI(부분변경)를 통해 레이저 테일램프 및 신규 주간주행등 적용", "독일 프리미엄 브랜드 전기차 중 가장 탄탄한 글로벌 판매량 유지"]
  },
  {
    id: "bmw-ix1-xdrive30",
    brand: "BMW",
    brandKo: "BMW",
    name: "iX1 xDrive30",
    nameKo: "iX1 xDrive30",
    origin: "DE",
    originKo: "독일",
    segment: "준중형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "유럽 프리미엄 콤팩트 SUV 1위",
    specs: {
      batteryKwh: 66.5,
      rangeKm: 440,       // WLTP (한국 인증 310km)
      powerHp: 313,
      zeroToHundred: 5.6,
      topSpeedKmh: 180,
      chargingKw: 130,
      chargeTimeMin: 29,
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 2085
    },
    prices: {
      us: null,
      cn: 299900,
      kr: 6760,
      eu: 55000
    },
    quarterlySales: {
      "2024 Q1": 22000, "2024 Q2": 26500, "2024 Q3": 28100, "2024 Q4": 30200,
      "2025 Q1": 25800, "2025 Q2": 28900, "2025 Q3": 30400, "2025 Q4": 31800,
      "2026 Q1": 27200, "2026 Q2": 29600, "2026 Q3": 31100
    },
    highlights: ["BMW 전체 전기차 판매 성장을 견인하는 볼륨 엔트리 SUV", "듀얼 모터 313마력의 경쾌한 가속력과 실용적인 공간 활용성", "전륜구동 엔트리 트림(eDrive20) 추가로 유럽 법인·개인 수요 흡수"]
  },
  {
    id: "mercedes-cla-ev",
    brand: "Mercedes-Benz",
    brandKo: "메르세데스-벤츠",
    name: "CLA 250+ with EQ Tech",
    nameKo: "디 올 뉴 CLA 전기 (MMA 플랫폼)",
    origin: "DE",
    originKo: "독일",
    segment: "준중형 세단",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "800V MMA 플랫폼 / WLTP 792km",
    specs: {
      batteryKwh: 85.0,
      rangeKm: 792,       // WLTP 최대 792km!
      powerHp: 272,       // 350 4MATIC은 354마력
      zeroToHundred: 6.7,
      topSpeedKmh: 210,
      chargingKw: 320,
      chargeTimeMin: 18,
      architectureV: 800,
      drivetrain: "RWD",
      weightKg: 2055
    },
    prices: {
      us: 54500,
      cn: 349000,
      kr: 7190,
      eu: 55900
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 0, "2024 Q4": 0,
      "2025 Q1": 0, "2025 Q2": 4500, "2025 Q3": 16800, "2025 Q4": 25400,
      "2026 Q1": 28900, "2026 Q2": 33200, "2026 Q3": 36500
    },
    highlights: ["벤츠의 차세대 MMA 아키텍처 및 800V 시스템 최초 적용 모델", "2단 변속기와 실리콘 산화물 음극재 배터리로 WLTP 792km 초장거리 달성 (전비 8.2km/kWh)", "차세대 MB.OS 및 슈퍼스크린 탑재로 기존 EQ 시리즈의 부진을 만회하는 핵심 신차"]
  },
  {
    id: "mercedes-eqe-suv",
    brand: "Mercedes-Benz",
    brandKo: "메르세데스-벤츠",
    name: "EQE 350 4MATIC SUV",
    nameKo: "EQE 350 4MATIC SUV",
    origin: "DE",
    originKo: "독일",
    segment: "준대형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: false,
    badge: "럭셔리 에어 서스펜션 SUV",
    specs: {
      batteryKwh: 96.0,   // 연식변경으로 90.6 -> 96kWh 확대
      rangeKm: 565,       // WLTP (한국 인증 404km)
      powerHp: 292,
      zeroToHundred: 6.6,
      topSpeedKmh: 210,
      chargingKw: 170,
      chargeTimeMin: 32,
      architectureV: 400,
      drivetrain: "AWD",
      weightKg: 2580
    },
    prices: {
      us: 77900,
      cn: 486000,
      kr: 10990,
      eu: 86800
    },
    quarterlySales: {
      "2024 Q1": 11200, "2024 Q2": 12500, "2024 Q3": 11800, "2024 Q4": 12900,
      "2025 Q1": 10400, "2025 Q2": 11200, "2025 Q3": 11600, "2025 Q4": 12100,
      "2026 Q1": 10800, "2026 Q2": 11500, "2026 Q3": 11900
    },
    highlights: ["에어매틱(AIRMATIC) 서스펜션 및 후륜 조향(최대 10도)으로 최상의 승차감", "최신 연식변경 모델을 통해 96kWh 배터리 및 전륜 모터 디스커넥트 유닛(DCU) 적용", "정숙한 실내 공간과 벤츠 특유의 고급 인테리어 마감"]
  },
  {
    id: "audi-q6-etron",
    brand: "Audi",
    brandKo: "아우디",
    name: "Q6 e-tron quattro",
    nameKo: "더 뉴 Q6 e-트론 콰트로",
    origin: "DE",
    originKo: "독일",
    segment: "중형 SUV",
    releaseYear: 2025,
    isNew: true,
    isBestSeller: false,
    badge: "포르쉐 공동개발 PPE 800V 플랫폼",
    specs: {
      batteryKwh: 100.0,  // 순용량 94.9kWh
      rangeKm: 625,       // WLTP 625km (한국 인증 468km)
      powerHp: 387,
      zeroToHundred: 5.9,
      topSpeedKmh: 210,
      chargingKw: 270,
      chargeTimeMin: 21,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2400
    },
    prices: {
      us: 65800,
      cn: 429000,
      kr: 8290,           // 퍼포먼스 8,290만 ~ 콰트로 1억 690만원
      eu: 74700
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 1200, "2024 Q3": 8900, "2024 Q4": 16400,
      "2025 Q1": 19500, "2025 Q2": 23800, "2025 Q3": 26400, "2025 Q4": 28100,
      "2026 Q1": 26900, "2026 Q2": 29200, "2026 Q3": 30800
    },
    highlights: ["포르쉐 마칸 일렉트릭과 공유하는 차세대 PPE(Premium Platform Electric) 아키텍처", "800V 시스템 및 270kW 초급속 충전 지원 (10분 충전에 255km 주행)", "운전석 11.9인치 + 중앙 14.5인치 OLED 파노라믹 디스플레이 + 조수석 10.9인치 스크린"]
  },
  {
    id: "audi-q4-etron",
    brand: "Audi",
    brandKo: "아우디",
    name: "Q4 45 e-tron",
    nameKo: "Q4 45 e-트론 (신형 모터)",
    origin: "DE",
    originKo: "독일",
    segment: "준중형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "아우디 글로벌 판매 1위 EV",
    specs: {
      batteryKwh: 82.0,
      rangeKm: 562,       // WLTP (한국 인증 411km)
      powerHp: 286,
      zeroToHundred: 6.7,
      topSpeedKmh: 180,
      chargingKw: 175,
      chargeTimeMin: 28,
      architectureV: 400,
      drivetrain: "RWD",
      weightKg: 2145
    },
    prices: {
      us: 55200,
      cn: 289900,
      kr: 6410,
      eu: 52950
    },
    quarterlySales: {
      "2024 Q1": 24800, "2024 Q2": 27900, "2024 Q3": 26500, "2024 Q4": 28400,
      "2025 Q1": 23100, "2025 Q2": 25400, "2025 Q3": 26200, "2025 Q4": 27000,
      "2026 Q1": 22800, "2026 Q2": 24500, "2026 Q3": 25100
    },
    highlights: ["신형 APP550 리어 모터 적용으로 출력이 204마력→286마력으로 대폭 상승", "아우디 전동화 라인업 중 글로벌 및 한국 시장 최다 판매 모델", "짧은 오버행과 MEB 플랫폼 특유의 넓은 2열 레그룸"]
  },
  {
    id: "porsche-macan-electric",
    brand: "Porsche",
    brandKo: "포르쉐",
    name: "Macan 4 Electric",
    nameKo: "마칸 4 일렉트릭",
    origin: "DE",
    originKo: "독일",
    segment: "중형 SUV",
    releaseYear: 2024,
    isNew: true,
    isBestSeller: true,
    badge: "포르쉐 전동화 베스트셀러",
    specs: {
      batteryKwh: 100.0,
      rangeKm: 613,       // WLTP (한국 인증 454km)
      powerHp: 408,       // 터보 모델은 639마력
      zeroToHundred: 5.2, // 터보 모델은 3.3초
      topSpeedKmh: 220,
      chargingKw: 270,
      chargeTimeMin: 21,
      architectureV: 800,
      drivetrain: "AWD",
      weightKg: 2405
    },
    prices: {
      us: 78800,
      cn: 598000,
      kr: 10590,          // 마칸 9,910만 / 마칸4 1억 590만 / 터보 1억 3,850만원
      eu: 84100
    },
    quarterlySales: {
      "2024 Q1": 0, "2024 Q2": 0, "2024 Q3": 6800, "2024 Q4": 18200,
      "2025 Q1": 21400, "2025 Q2": 23500, "2025 Q3": 24800, "2025 Q4": 25900,
      "2026 Q1": 23200, "2026 Q2": 24900, "2026 Q3": 26100
    },
    highlights: ["내연기관 마칸을 대체하는 포르쉐의 핵심 전동화 중형 SUV", "800V PPE 아키텍처와 포르쉐 액티브 서스펜션 매니지먼트(PASM) 조합", "출시 직후 타이칸을 제치고 포르쉐 내 최다 판매 전기차로 등극"]
  },
  {
    id: "vw-id4-pro",
    brand: "Volkswagen",
    brandKo: "폭스바겐",
    name: "ID.4 Pro (2025)",
    nameKo: "ID.4 프로 (신형 모터)",
    origin: "DE",
    originKo: "독일",
    segment: "중형 SUV",
    releaseYear: 2024,
    isNew: false,
    isBestSeller: true,
    badge: "유럽 스테디셀러 패밀리 SUV",
    specs: {
      batteryKwh: 82.0,
      rangeKm: 550,       // WLTP (한국 인증 424km)
      powerHp: 286,
      zeroToHundred: 6.7,
      topSpeedKmh: 180,
      chargingKw: 175,
      chargeTimeMin: 28,
      architectureV: 400,
      drivetrain: "RWD",
      weightKg: 2150
    },
    prices: {
      us: 44875,
      cn: 149900,         // 중국 현지 합작 할인가 반영
      kr: 5490,
      eu: 48635
    },
    quarterlySales: {
      "2024 Q1": 38000, "2024 Q2": 45200, "2024 Q3": 47800, "2024 Q4": 51200,
      "2025 Q1": 42500, "2025 Q2": 46800, "2025 Q3": 48900, "2025 Q4": 50400,
      "2026 Q1": 44100, "2026 Q2": 47200, "2026 Q3": 49100
    },
    highlights: ["신형 고효율 드라이브 시스템(APP550)과 12.9인치 개선형 인포테인먼트 탑재", "중국 시장에서는 공격적 가격 인하, 유럽·한국에서는 높은 보조금 혜택으로 꾸준한 인기", "우수한 회전반경(10.2m)과 패밀리카에 최적화된 실내 공간"]
  }
];

// Manufacturer Global BEV Quarterly Sales Summary (in thousands of units)
const BRAND_QUARTERLY_SUMMARY = {
  "BYD (순수전기 BEV)": {
    origin: "CN",
    color: "#ef4444",
    sales: {
      "2024 Q1": 300.1, "2024 Q2": 426.0, "2024 Q3": 443.4, "2024 Q4": 595.4,
      "2025 Q1": 416.4, "2025 Q2": 532.0, "2025 Q3": 588.5, "2025 Q4": 723.1,
      "2026 Q1": 498.0, "2026 Q2": 612.5, "2026 Q3": 654.0
    }
  },
  "Tesla (테슬라)": {
    origin: "US",
    color: "#3b82f6",
    sales: {
      "2024 Q1": 386.8, "2024 Q2": 443.9, "2024 Q3": 462.9, "2024 Q4": 495.6,
      "2025 Q1": 362.0, "2025 Q2": 418.5, "2025 Q3": 439.2, "2025 Q4": 478.0,
      "2026 Q1": 405.0, "2026 Q2": 448.2, "2026 Q3": 467.0
    }
  },
  "Geely Group (지리·지커)": {
    origin: "CN",
    color: "#f97316",
    sales: {
      "2024 Q1": 142.0, "2024 Q2": 178.5, "2024 Q3": 225.0, "2024 Q4": 298.0,
      "2025 Q1": 265.0, "2025 Q2": 312.0, "2025 Q3": 348.0, "2025 Q4": 389.0,
      "2026 Q1": 342.0, "2026 Q2": 378.0, "2026 Q3": 405.0
    }
  },
  "Hyundai·Kia (현대·기아)": {
    origin: "KR",
    color: "#10b981",
    sales: {
      "2024 Q1": 122.5, "2024 Q2": 144.0, "2024 Q3": 152.8, "2024 Q4": 158.2,
      "2025 Q1": 148.0, "2025 Q2": 172.5, "2025 Q3": 186.0, "2025 Q4": 194.5,
      "2026 Q1": 176.0, "2026 Q2": 195.0, "2026 Q3": 208.5
    }
  },
  "VW Group (폭스바겐·아우디·포르쉐)": {
    origin: "DE",
    color: "#8b5cf6",
    sales: {
      "2024 Q1": 136.4, "2024 Q2": 180.8, "2024 Q3": 189.4, "2024 Q4": 238.2,
      "2025 Q1": 168.0, "2025 Q2": 205.0, "2025 Q3": 218.5, "2025 Q4": 249.0,
      "2026 Q1": 192.0, "2026 Q2": 224.0, "2026 Q3": 238.0
    }
  },
  "BMW Group": {
    origin: "DE",
    color: "#06b6d4",
    sales: {
      "2024 Q1": 82.7, "2024 Q2": 107.9, "2024 Q3": 103.4, "2024 Q4": 114.5,
      "2025 Q1": 94.2, "2025 Q2": 115.8, "2025 Q3": 119.5, "2025 Q4": 128.4,
      "2026 Q1": 112.0, "2026 Q2": 134.5, "2026 Q3": 146.2
    }
  },
  "Xiaomi EV (샤오미)": {
    origin: "CN",
    color: "#ec4899",
    sales: {
      "2024 Q1": 0, "2024 Q2": 27.3, "2024 Q3": 39.8, "2024 Q4": 69.7,
      "2025 Q1": 75.8, "2025 Q2": 96.2, "2025 Q3": 159.0, "2025 Q4": 191.5,
      "2026 Q1": 192.0, "2026 Q2": 211.5, "2026 Q3": 224.2
    }
  },
  "Mercedes-Benz": {
    origin: "DE",
    color: "#eab308",
    sales: {
      "2024 Q1": 47.5, "2024 Q2": 51.0, "2024 Q3": 42.5, "2024 Q4": 44.0,
      "2025 Q1": 43.2, "2025 Q2": 49.8, "2025 Q3": 61.5, "2025 Q4": 72.0,
      "2026 Q1": 68.5, "2026 Q2": 76.2, "2026 Q3": 81.4
    }
  }
};

