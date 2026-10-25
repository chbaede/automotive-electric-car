# ⚡ EV Global Hub (글로벌 전기차 판매량·4개국 가격·성능 비교 대시보드)

전 세계에서 가장 많이 팔리는 베스트셀러 전기차들과 최신 출시 전기차(2024~2026)를 한눈에 비교할 수 있는 정적 웹 애플리케이션입니다. 별도의 빌드 과정 없이 **GitHub Pages**에 즉시 호스팅할 수 있도록 설계되었습니다.

## ✨ 주요 기능

1. **글로벌 4대 권역 & 23개 핵심 모델 수록**
   - 🇰🇷 **한국 (현대·기아)**: 아이오닉 9, 더 뉴 아이오닉 5, 캐스퍼 일렉트릭(인스터), 기아 EV3, EV4, 더 뉴 EV6, EV9
   - 🇩🇪 **독일 3사 + 포르쉐·폭스바겐**: BMW 신형 iX3(노이어 클라쎄), i4, iX1 / 벤츠 디 올 뉴 전기 CLA(MMA), EQE SUV / 아우디 Q6 e-트론, Q4 e-트론 / 포르쉐 마칸 일렉트릭 / 폭스바겐 ID.4
   - 🇺🇸 **미국**: 테슬라 모델 Y 주니퍼, 모델 3 하이랜드, 사이버트럭 / 쉐보레 이쿼녹스 EV / 포드 머스탱 마하-E / 리비안 R1S Gen 2 / 루시드 그래비티
   - 🇨🇳 **중국**: BYD 시걸(돌핀 미니), 아토 3(한국 출시), 씰(Seal) / 샤오미 SU7 Max, YU7 / 지리 싱위안 / 지커(Zeekr) 7X

2. **4개국 출시 가격 동시 비교 & 실시간 통화 환산**
   - 각 모델의 **미국(USD), 중국(CNY), 한국(만 원), 유럽(EUR)** 현지 출시 시작가를 한눈에 나열
   - 상단 `[💱 현지 통화 표기]` 버튼을 클릭하면 **원화(KRW) 일괄 환산** 또는 **달러(USD) 일괄 환산** 모드로 즉시 전환되어 국가별 가격 차이를 직관적으로 비교 가능

3. **2024 Q1 ~ 2026 Q3 연도/분기별 판매량 순위 정렬**
   - 상단 기준 기간 드롭다운에서 특정 분기(`2024 Q1` ~ `2026 Q3`), 연간 합계(`2024 연간`, `2025 연간`), 또는 누적 전체를 선택하면 해당 기간의 글로벌 판매량 순서대로 자동 정렬 및 전분기 대비 증감률 표시

4. **다중 필터 및 1:1 정밀 비교함 (최대 4대)**
   - 국가/지역별 탭, 브랜드 멀티 칩, 차종(SUV/세단/픽업), `800V+ 초급속`, `신차·최신형`, `베스트셀러` 필터 지원
   - 원하는 차량을 최대 4대까지 비교함에 담아 스펙·4개국 가격·판매량 우위 항목(`WIN` 배지)을 1:1로 대조 가능

---

## 🚀 GitHub Pages 배포 방법

이 폴더에는 GitHub Actions 자동 배포 워크플로우([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))가 포함되어 있습니다.

```bash
cd /Users/CHANBAE/.gemini/antigravity/scratch/ev-global-hub
git init
git add .
git commit -m "Initial commit: EV Global Hub dashboard"
git branch -M main
git remote add origin https://github.com/chbaede/automotive-electric-car.git
git push -u origin main
```

1. GitHub 저장소 생성 후 위 명령어로 푸시합니다.
2. GitHub 저장소의 **Settings → Pages** 메뉴로 이동합니다.
3. **Build and deployment > Source**를 `GitHub Actions`로 선택(또는 `Deploy from a branch` → `main` / `/ (root)` 선택)하면 수십 초 내에 배포가 완료됩니다.

