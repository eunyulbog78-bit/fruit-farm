// ══════════════════════════════════════════════════════════════
// 🔥 Firebase 설정 (모든 기기 간 친구/거래 활성화)
// 1. https://console.firebase.google.com → 프로젝트 만들기
// 2. Realtime Database → 데이터베이스 만들기 → 테스트 모드
// 3. 데이터베이스 URL 복사 후 아래에 붙여넣기
const FIREBASE_URL = 'https://fruit-farm-f24fe-default-rtdb.firebaseio.com';
const SAVE_VERSION = 2; // 가격/확률 변경 시 이 숫자를 올리면 기존 유저 가격 자동 초기화
const APP_VERSION = '1.3'; // 업데이트 배포 시 이 숫자를 올리면 모든 기기에서 강제 새로고침
(()=>{
    const stored = localStorage.getItem('fruitFarm4_appVer');
    if (stored !== APP_VERSION) {
        localStorage.setItem('fruitFarm4_appVer', APP_VERSION);
        if (stored !== null) {
            // location.reload(true)는 현대 브라우저에서 캐시를 무시하지 않으므로
            // 쿼리스트링에 타임스탬프를 붙여 브라우저가 새 파일을 강제로 받게 함
            const base = location.href.split('?')[0];
            location.replace(base + '?v=' + APP_VERSION);
        }
    }
})();
// ══════════════════════════════════════════════════════════════

// ── 과일 정의 (새 과일은 여기에만 추가) ──────────────────────
const BASE_FRUITS = [
    { name:'사과',   emoji:'🍎', price:100, rate:5.0, rarity:'희귀' },
    { name:'복숭아', emoji:'🍑', price:150, rate:3.0, rarity:'희귀' },
    { name:'멜론',   emoji:'🍈', price:120, rate:4.0, rarity:'희귀' },
    { name:'망고',   emoji:'🥭', price:130, rate:3.5, rarity:'희귀' },
    { name:'딸기', emoji:'🍓', price:400, rate:1.0, rarity:'영웅' },
    { name:'수박', emoji:'🍉', price:500, rate:0.7, rarity:'영웅' },
    { name:'키위', emoji:'🥝', price:450, rate:0.8, rarity:'영웅' },
    { name:'포도', emoji:'🍇', price:5000,      rate:0.5,      rarity:'전설' },
    { name:'귤', emoji:'🍊', price:4500,       rate:0.6,      rarity:'전설' },
    { name:'코코넛', emoji:'🥥', price:200000,    rate:0.001,    rarity:'신화' },
    { name:'레몬', emoji:'🍋', price:200000,    rate:0.001,    rarity:'신화' },
    { name:'할머니가 숨겨둔 감', emoji:'🍅', price:10000000,  rate:0.00005,  rarity:'불멸' },
    { name:'별혼과', emoji:'🌟', price:1000000000, rate:0.000001, rarity:'비밀' },
    { name:'개척자의 열매', emoji:'🌱🏆', price:0, rate:0, rarity:'리미티드' },
    { name:'축복의 복숭아', emoji:'🍑', price:0, rate:0, rarity:'리미티드' },
];
const NO_SELL_FRUITS = ['개척자의 열매', '축복의 복숭아']; // 판매 불가 (거래만 가능)
const PIONEER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115" style="width:1em;height:1.15em;vertical-align:-0.1em;display:inline-block">
  <path d="M31,28 Q10,35 12,54 Q14,67 31,62" fill="none" stroke="#8B6010" stroke-width="9" stroke-linecap="round"/>
  <path d="M31,28 Q10,35 12,54 Q14,67 31,62" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>
  <path d="M69,28 Q90,35 88,54 Q86,67 69,62" fill="none" stroke="#8B6010" stroke-width="9" stroke-linecap="round"/>
  <path d="M69,28 Q90,35 88,54 Q86,67 69,62" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>
  <path d="M30,13 L70,13 L63,61 Q60,76 50,79 Q40,76 37,61 Z" fill="#9A6B00"/>
  <path d="M28,11 L72,11 L65,59 Q62,74 50,77 Q38,74 35,59 Z" fill="#FFD700"/>
  <path d="M33,14 L56,14 L52,37 Q43,19 33,21 Z" fill="#FFFDE7" opacity="0.5"/>
  <rect x="44" y="77" width="12" height="12" fill="#9A6B00" rx="1"/>
  <rect x="42" y="75" width="16" height="12" fill="#FFD700" rx="1"/>
  <rect x="30" y="87" width="40" height="13" rx="5" fill="#7A5000"/>
  <rect x="28" y="85" width="44" height="13" rx="5" fill="#DAA520"/>
  <rect x="30" y="86" width="40" height="4" rx="3" fill="#FFE566" opacity="0.35"/>
  <text x="51" y="96" text-anchor="middle" font-size="9" font-weight="900" fill="#6B3A00" font-family="Arial,sans-serif" letter-spacing="2" opacity="0.4">50</text>
  <text x="50" y="95.5" text-anchor="middle" font-size="9" font-weight="900" fill="#1A0A00" font-family="Arial,sans-serif" letter-spacing="2">50</text>
  <ellipse cx="50" cy="71" rx="10" ry="2.8" fill="#5D3A1A" opacity="0.55"/>
  <path d="M50,71 C50.5,58 50,46 50,34 C50,22 50,16 50,11" stroke="#1B5E20" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M50,71 C50.5,58 50,46 50,34 C50,22 50,16 50,11" stroke="#4CAF50" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M50,59 C43,53 33,51 28,42 C36,40 46,47 50,55 Z" fill="#2E7D32"/>
  <path d="M50,58 C44,52 35,50 30,42 C38,40 47,46 50,54 Z" fill="#4CAF50"/>
  <path d="M50,47 C57,40 67,37 72,28 C63,26 53,33 50,43 Z" fill="#1B5E20"/>
  <path d="M50,46 C57,39 66,36 70,28 C62,26 53,32 50,42 Z" fill="#66BB6A"/>
  <path d="M50,13 C47,8 44,2 48,0 C53,3 52,9 50,13 Z" fill="#A5D6A7"/>
  <path d="M50,13 C53,8 56,2 52,0 C47,3 48,9 50,13 Z" fill="#4CAF50"/>
  <line x1="16" y1="11" x2="16" y2="19" stroke="#FFE066" stroke-width="1.2" opacity="0.85" stroke-linecap="round"/>
  <line x1="12" y1="15" x2="20" y2="15" stroke="#FFE066" stroke-width="1.2" opacity="0.85" stroke-linecap="round"/>
  <circle cx="16" cy="15" r="1.5" fill="#FFE066" opacity="0.7"/>
  <line x1="83" y1="9" x2="83" y2="17" stroke="#FFE066" stroke-width="1.2" opacity="0.8" stroke-linecap="round"/>
  <line x1="79" y1="13" x2="87" y2="13" stroke="#FFE066" stroke-width="1.2" opacity="0.8" stroke-linecap="round"/>
  <circle cx="83" cy="13" r="1.5" fill="#FFE066" opacity="0.65"/>
  <circle cx="90" cy="50" r="1.8" fill="#FFE066" opacity="0.6"/>
  <circle cx="8" cy="46" r="1.8" fill="#FFE066" opacity="0.6"/>
</svg>`;
// 축복의 복숭아 SVG 일러스트
const BLESSED_PEACH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115" style="width:1em;height:1.15em;vertical-align:-0.1em;display:inline-block">
  <circle cx="50" cy="62" r="41" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.4" stroke-dasharray="5 3"/>
  <circle cx="50" cy="62" r="33" fill="none" stroke="#FFAA00" stroke-width="0.7" opacity="0.28" stroke-dasharray="3 5"/>
  <path d="M50,22 C28,22 14,38 14,57 C14,76 28,94 50,97 C72,94 86,76 86,57 C86,38 72,22 50,22 Z" fill="#FF8855"/>
  <path d="M50,22 C64,22 77,35 80,51 C77,71 65,90 50,94 C55,90 67,74 68,57 C69,44 63,29 50,22 Z" fill="#FFAA77"/>
  <path d="M50,22 C44,27 44,35 50,38 C56,35 56,27 50,22 Z" fill="#DD6633"/>
  <ellipse cx="36" cy="42" rx="10" ry="7" fill="white" opacity="0.18" transform="rotate(-15 36 42)"/>
  <line x1="50" y1="22" x2="54" y2="8" stroke="#5D4037" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M54,11 C63,4 76,8 72,20 C69,27 57,23 54,11 Z" fill="#2E7D32"/>
  <path d="M54,11 C63,4 75,8 72,20 C69,26 58,23 54,11 Z" fill="#4CAF50"/>
  <line x1="54" y1="11" x2="68" y2="18" stroke="#1B5E20" stroke-width="0.8" stroke-linecap="round"/>
  <circle cx="50" cy="62" r="11" fill="none" stroke="#FFD700" stroke-width="1.3" opacity="0.65"/>
  <text x="50" y="67" text-anchor="middle" font-size="13" fill="#FFD700" font-weight="bold">✦</text>
  <circle cx="22" cy="50" r="1.8" fill="#FFD700" opacity="0.55"/>
  <circle cx="78" cy="54" r="1.5" fill="#FFD700" opacity="0.5"/>
  <circle cx="28" cy="78" r="1.5" fill="#FFD700" opacity="0.45"/>
  <circle cx="72" cy="76" r="1.8" fill="#FFD700" opacity="0.55"/>
  <circle cx="50" cy="28" r="1.4" fill="#FFD700" opacity="0.5"/>
</svg>`;

// 박(조롱박) SVG
const GOURD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="96" height="125">
  <line x1="50" y1="14" x2="54" y2="3" stroke="#5D4037" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M54,7 C62,1 74,5 70,16 C67,22 55,19 54,7 Z" fill="#4CAF50"/>
  <path d="M50,14 C42,7 33,5 30,12 C28,18 36,22 50,18 Z" fill="#66BB6A"/>
  <ellipse cx="50" cy="38" rx="24" ry="22" fill="#C8A870"/>
  <ellipse cx="50" cy="38" rx="22" ry="20" fill="#D4B87E"/>
  <path d="M30,38 Q50,50 70,38" fill="none" stroke="#B8944A" stroke-width="1" opacity="0.4"/>
  <ellipse cx="42" cy="29" rx="8" ry="5.5" fill="white" opacity="0.15" transform="rotate(-15 42 29)"/>
  <rect x="43" y="57" width="14" height="9" rx="3" fill="#B8944A"/>
  <rect x="44" y="58" width="12" height="7" rx="2" fill="#C8A860"/>
  <ellipse cx="50" cy="91" rx="30" ry="31" fill="#C8A870"/>
  <ellipse cx="50" cy="91" rx="28" ry="29" fill="#D4B87E"/>
  <path d="M50,62 C50,74 50,108 50,120" stroke="#B8944A" stroke-width="1.5" opacity="0.45"/>
  <path d="M36,64 C34,76 34,107 37,119" stroke="#B8944A" stroke-width="1" opacity="0.3"/>
  <path d="M64,64 C66,76 66,107 63,119" stroke="#B8944A" stroke-width="1" opacity="0.3"/>
  <ellipse cx="38" cy="77" rx="10" ry="7" fill="white" opacity="0.15" transform="rotate(-10 38 77)"/>
  <ellipse cx="50" cy="120" rx="11" ry="4.5" fill="#9A7230"/>
</svg>`;

const GOLD = '황금 ';
const DIA  = '다이아몬드 ';
// ── 이벤트 날짜 (게임 출시 1달 후부터 이벤트 활성화) ──────────────
const GAME_CREATED_TS = new Date('2026-05-13').getTime();
const EVENT_OPEN_TS   = GAME_CREATED_TS + 30 * 24 * 60 * 60 * 1000;
const GOURD_TARGET    = 10000;

const JUICE_PRICE       = 5000;
const TITLE_GABBU_PRICE = 1000000;
const TITLE_ELON_PRICE  = 100000000;
const BLUE_POTION_PRICE   = 25000;
const RED_POTION_PRICE    = 25000;
const PURPLE_POTION_PRICE = 50000;
const BLACK_POTION_PRICE  = 100000;
const BLUE_POTION_MS      = 10 * 60 * 1000;
const PURPLE_POTION_MS    = 20 * 60 * 1000;
const BLACK_POTION_MS     = 10 * 60 * 1000;

// 등급 설정 (startPrice: 해당 등급 과일의 기본 시작 가격)
const RARITY = {
    '희귀': { label:'희귀', en:'RARE',      color:'#00c853', badgeBg:'#004d1a', cardClass:'rarity-rare',      unreleased:false, startPrice:100      },
    '영웅': { label:'영웅', en:'HERO',      color:'#ce93d8', badgeBg:'#4a0072', cardClass:'rarity-hero',      unreleased:false, startPrice:400      },
    '전설': { label:'전설', en:'LEGEND',    color:'#ffb300', badgeBg:'#5a3000', cardClass:'rarity-legend',    unreleased:false, startPrice:5000     },
    '신화': { label:'신화', en:'MYTHIC',    color:'#ef5350', badgeBg:'#5a0000', cardClass:'rarity-myth',      unreleased:false, startPrice:200000   },
    '불멸': { label:'불멸', en:'IMMORTAL',  color:'#7a0000', badgeBg:'#220000', cardClass:'rarity-immortal',  unreleased:false, startPrice:10000000  },
    '비밀': { label:'비밀', en:'SECRET',    color:'#fff',    badgeBg:'#222',    cardClass:'rarity-secret',    unreleased:false, startPrice:1000000000},
    '리미티드': { label:'리미티드', en:'LIMITED', color:'#ff69b4', badgeBg:'#3a0030', cardClass:'rarity-limited', unreleased:false, startPrice:0 },
    '신성': { label:'신성', en:'DIVINE',    color:'#ff88ff', badgeBg:'#220022', cardClass:'rarity-divine',    unreleased:true,  startPrice:2500000000},
};
// 등급별 드롭 확률 (이 확률로 등급 결정 → 그 등급 내에서 랜덤 과일 선택)
const RARITY_RATES = { // 신성은 미출시 — 드롭 확률 0
    '희귀': 1.5,
    '영웅': 0.75,
    '전설': 0.06,
    '신화': 0.001875,
    '불멸': 0.0000075,
    '비밀': 0.00000075,
};

// 과일 이름 → 등급 빠른 조회
function getFruitRarity(fruitName) {
    const baseName = fruitName.startsWith(GOLD) ? fruitName.slice(GOLD.length)
                   : fruitName.startsWith(DIA)  ? fruitName.slice(DIA.length)
                   : fruitName;
    const f = BASE_FRUITS.find(b => b.name === baseName);
    return f ? RARITY[f.rarity] : null;
}

// ── 카탈로그 자동 생성 ────────────────────────────────────────
function buildCatalog() {
    const emoji={}, prices={}, rates={}, inv={};
    for (const f of BASE_FRUITS) {
        // 기본
        emoji[f.name]=f.emoji; prices[f.name]=f.price; rates[f.name]=f.rate; inv[f.name]=0;
        // 황금: 드롭률 1/10, 가격 10배
        const g=GOLD+f.name;
        emoji[g]=f.emoji; prices[g]=f.price*10; rates[g]=f.rate/10; inv[g]=0;
        // 다이아몬드: 드롭률 1/25, 가격 25배
        const d=DIA+f.name;
        emoji[d]=f.emoji; prices[d]=f.price*25; rates[d]=f.rate/25; inv[d]=0;
    }
    return {emoji,prices,rates,inv};
}

// ── 게임 상태 ─────────────────────────────────────────────────
const cat = buildCatalog();
const G = {
    nickname:'', gold:0, day:1, clickCount:0,
    equippedFruit:null, activeBackground:'normal',
    juicePurchased:false,
    weeklyDropBonus:1, weeklyBonusDetail:null, weeklyBonusWeek:'',
    bluePotionCount:0, redPotionCount:0, purplePotionCount:0, blackPotionCount:0,
    bluePotionUntil:0, redPotionPending:0, purplePotionUntil:0, blackPotionUntil:0,
    blackPotionBoughtToday:0, blackPotionLastBuyDate:'',
    gourdClickCount:0, gourdRewardClaimed:false,
    ownedTitles:[], equippedTitle:null,
    lastDate:new Date().toDateString(),
    emoji:{...cat.emoji}, prices:{...cat.prices},
    rates:{...cat.rates}, inventory:{...cat.inv},
    sellOrders:[], buyOrders:[], priceHistory:{},
    friends:[], pendingRequests:[], tradeOffers:[],

    save() {
        localStorage.setItem('fruitFarm4', JSON.stringify({
            nickname:this.nickname, gold:this.gold, day:this.day,
            clickCount:this.clickCount, equippedFruit:this.equippedFruit,
            activeBackground:this.activeBackground,
            juicePurchased:this.juicePurchased,
            bluePotionCount:this.bluePotionCount, redPotionCount:this.redPotionCount, purplePotionCount:this.purplePotionCount, blackPotionCount:this.blackPotionCount,
            bluePotionUntil:this.bluePotionUntil, redPotionPending:this.redPotionPending, purplePotionUntil:this.purplePotionUntil, blackPotionUntil:this.blackPotionUntil,
            bluePotionRemaining:Math.max(0, this.bluePotionUntil - Date.now()),
            purplePotionRemaining:Math.max(0, this.purplePotionUntil - Date.now()),
            blackPotionRemaining:Math.max(0, this.blackPotionUntil - Date.now()),
            blackPotionBoughtToday:this.blackPotionBoughtToday, blackPotionLastBuyDate:this.blackPotionLastBuyDate,
            ownedTitles:this.ownedTitles, equippedTitle:this.equippedTitle,
            lastDate:this.lastDate,
            priceRatios: Object.fromEntries(BASE_FRUITS.filter(f=>f.price>0).map(f=>[f.name, this.prices[f.name]/f.price])),
            prices:this.prices, inventory:this.inventory,
            sellOrders:this.sellOrders, buyOrders:this.buyOrders,
            priceHistory:this.priceHistory,
            friends:this.friends, pendingRequests:this.pendingRequests, tradeOffers:this.tradeOffers,
            weeklyDropBonus:this.weeklyDropBonus, weeklyBonusDetail:this.weeklyBonusDetail, weeklyBonusWeek:this.weeklyBonusWeek,
            gourdClickCount:this.gourdClickCount, gourdRewardClaimed:this.gourdRewardClaimed,
            saveVersion: SAVE_VERSION,
        }));
        if (FB && this.nickname) {
            FB.set(`inv/${encN(this.nickname)}`, this.inventory);
            FB.set(`ranking/${encN(this.nickname)}`, { nick: this.nickname, gold: this.gold, clicks: this.clickCount, ts: Date.now() });
        }
    },
    load() {
        const d = JSON.parse(localStorage.getItem('fruitFarm4') || 'null');
        if (!d) return;
        Object.assign(this, d);
        // 버전이 다르면 가격 초기화
        if (!d.saveVersion || d.saveVersion < SAVE_VERSION) {
            this.priceHistory = {};
        }
        // 기본 가격은 항상 현재 코드 기준으로 재계산 — 코드 변경 시 즉시 반영
        // priceRatios(시세 변동 비율)가 있으면 보존, 없으면 기준가 그대로 사용
        for (const f of BASE_FRUITS) {
            const ratio = d.priceRatios?.[f.name] ?? 1;
            const clamped = Math.max(0.5, Math.min(1.5, ratio));
            this.prices[f.name]        = Math.round(f.price * clamped);
            this.prices[GOLD+f.name]   = this.prices[f.name] * 10;
            this.prices[DIA+f.name]    = this.prices[f.name] * 25;
        }
        this.inventory = Object.assign({...cat.inv}, d.inventory || {});
        if (d.sellOrders)   this.sellOrders   = d.sellOrders;
        if (d.buyOrders)    this.buyOrders    = d.buyOrders;
        if (d.priceHistory)    this.priceHistory    = d.priceHistory;
        if (d.friends)         this.friends         = d.friends;
        if (d.pendingRequests) this.pendingRequests = d.pendingRequests;
        if (d.tradeOffers)     this.tradeOffers     = d.tradeOffers;
        this.bluePotionCount = d.bluePotionCount || 0;
        this.redPotionCount = d.redPotionCount || 0;
        this.purplePotionCount = d.purplePotionCount || 0;
        this.blackPotionCount = d.blackPotionCount || 0;
        this.blackPotionBoughtToday = d.blackPotionBoughtToday || 0;
        this.blackPotionLastBuyDate = d.blackPotionLastBuyDate || '';
        // 남은 시간(Remaining)이 있으면 지금 시점부터 이어서 계산 (꺼진 동안 시간 멈춤)
        this.bluePotionUntil   = d.bluePotionRemaining   > 0 ? Date.now() + d.bluePotionRemaining   : 0;
        this.purplePotionUntil = d.purplePotionRemaining > 0 ? Date.now() + d.purplePotionRemaining : 0;
        this.blackPotionUntil  = d.blackPotionRemaining  > 0 ? Date.now() + d.blackPotionRemaining  : 0;
        this.redPotionPending = d.redPotionPending || 0;
        this.weeklyDropBonus   = d.weeklyDropBonus   || 1;
        this.weeklyBonusDetail = d.weeklyBonusDetail || null;
        this.weeklyBonusWeek   = d.weeklyBonusWeek   || '';
        this.gourdClickCount   = d.gourdClickCount   || 0;
        this.gourdRewardClaimed = d.gourdRewardClaimed || false;
    },
    processPendingOrders() {
        const now = Date.now();
        const FILL_MS = 30000;
        let changed = false;
        for (const o of this.sellOrders) {
            if (o.status==='pending' && now - o.registeredAt >= FILL_MS) {
                o.status='completed'; this.gold += o.price * o.count; changed=true;
            }
        }
        for (const o of this.buyOrders) {
            if (o.status==='pending' && now - o.registeredAt >= FILL_MS) {
                o.status='completed';
                this.inventory[o.fruit]=(this.inventory[o.fruit]||0)+o.count; changed=true;
            }
        }
        if (changed) { this.save(); refreshMain(); }
    },
    buyJuiceBg() {
        if (this.juicePurchased || this.gold < JUICE_PRICE) return false;
        this.gold -= JUICE_PRICE; this.juicePurchased = true; return true;
    },
    buyTitle(title, price) {
        if (this.ownedTitles.includes(title) || this.gold < price) return false;
        this.gold -= price; this.ownedTitles.push(title); return true;
    },
    base(fruit) {
        if (!fruit) return '';
        if (fruit.startsWith(GOLD)) return fruit.slice(GOLD.length);
        if (fruit.startsWith(DIA))  return fruit.slice(DIA.length);
        return fruit;
    },
    isGold(fruit) { return !!(fruit && fruit.startsWith(GOLD)); },
    isDia(fruit)  { return !!(fruit && fruit.startsWith(DIA)); },
    isMut(fruit)  { return this.isGold(fruit) || this.isDia(fruit); },
    get isBluePotionActive()   { return Date.now() < this.bluePotionUntil; },
    get isPurplePotionActive() { return Date.now() < this.purplePotionUntil; },
    get isBlackPotionActive()  { return Date.now() < this.blackPotionUntil; },
    get eqBase() { return this.base(this.equippedFruit); },

    registerClick() { this.clickCount += this.eqBase==='코코넛' ? 2 : 1; },

    buyBluePotion(n=1) {
        const cost = BLUE_POTION_PRICE * n;
        if (n <= 0 || this.gold < cost) return false;
        this.gold -= cost;
        this.bluePotionCount += n;
        return true;
    },
    useBluePotion(n=1) {
        if (n <= 0 || this.bluePotionCount < n) return false;
        this.bluePotionCount -= n;
        // 이미 적용 중이면 남은 시간에 누적 (2개 사용 = 20분)
        const base = Math.max(this.bluePotionUntil, Date.now());
        this.bluePotionUntil = base + BLUE_POTION_MS * n;
        return true;
    },
    buyPurplePotion(n=1) {
        const cost = PURPLE_POTION_PRICE * n;
        if (n <= 0 || this.gold < cost) return false;
        this.gold -= cost;
        this.purplePotionCount += n;
        return true;
    },
    usePurplePotion(n=1) {
        if (n <= 0 || this.purplePotionCount < n) return false;
        this.purplePotionCount -= n;
        const base = Math.max(this.purplePotionUntil, Date.now());
        this.purplePotionUntil = base + PURPLE_POTION_MS * n;
        return true;
    },
    buyRedPotion(n=1) {
        const cost = RED_POTION_PRICE * n;
        if (n <= 0 || this.gold < cost) return false;
        this.gold -= cost;
        this.redPotionCount += n;
        return true;
    },
    useRedPotion(n=1) {
        if (n <= 0 || this.redPotionCount < n) return false;
        this.redPotionCount -= n;
        this.redPotionPending = (this.redPotionPending || 0) + n;
        return true;
    },
    buyBlackPotion(n=1) {
        const today = new Date().toDateString();
        if (this.blackPotionLastBuyDate !== today) {
            this.blackPotionBoughtToday = 0;
            this.blackPotionLastBuyDate = today;
        }
        const remaining = 2 - this.blackPotionBoughtToday;
        if (n <= 0 || n > remaining) { alert(`오늘 블랙 포션은 ${remaining}개만 더 구매할 수 있습니다`); return false; }
        const cost = BLACK_POTION_PRICE * n;
        if (this.gold < cost) return false;
        this.gold -= cost;
        this.blackPotionCount += n;
        this.blackPotionBoughtToday += n;
        return true;
    },
    useBlackPotion(n=1) {
        if (n <= 0 || this.blackPotionCount < n) return false;
        this.blackPotionCount -= n;
        const base = Math.max(this.blackPotionUntil, Date.now());
        this.blackPotionUntil = base + BLACK_POTION_MS * n;
        return true;
    },

    tryGetFruit() {
        // 1. 등급 추첨 (등급별 확률)
        const equippedMult = this.eqBase==='딸기'           ? 1.1
               : this.eqBase==='코코넛'         ? 2
               : this.eqBase==='할머니가 숨겨둔 감' ? 2.5
               : this.eqBase==='별혼과'          ? 1.5 : 1;
        const mult = equippedMult * (this.weeklyDropBonus || 1);
        const rarityRates = Object.entries(RARITY_RATES).map(([rarity, rate]) => [rarity, rate * mult]);

        if (this.isBluePotionActive) {
            for (const pair of rarityRates) {
                if (['전설','신화','불멸','비밀'].includes(pair[0])) pair[1] *= 1.5;
            }
        }

        const roll = Math.random() * 100;
        let cum = 0, pickedRarity = null;
        for (const [rarity, rate] of rarityRates) {
            cum += rate;
            if (roll < cum) { pickedRarity = rarity; break; }
        }
        if (!pickedRarity) return { fruit: null, count: 1 };
        // 2. 해당 등급 내 과일 목록 (rate:0 제외 — 드롭 불가 과일)
        const candidates = BASE_FRUITS.filter(f => f.rarity === pickedRarity && f.rate > 0).map(f => f.name);
        if (candidates.length === 0) return { fruit: null, count: 1 };
        // 3. 랜덤 과일 선택
        let got = candidates[Math.floor(Math.random() * candidates.length)];
        // 4. 황금/다이아 변이 적용 (기본 과일 -> 변이 과일)
        const diaChance = (1 / 25) * (this.eqBase === '수박' ? 1.5 : 1);
        const goldChance = 1 / 10;
        if (Math.random() < diaChance) {
            got = DIA + got;
        } else if (Math.random() < goldChance) {
            got = GOLD + got;
        }
        // 포도 능력: 5% 확률로 상위 등급 과일
        if (got && this.eqBase==='포도' && Math.random()<0.05) {
            const up = upgradeRarity(got); if (up) got=up;
        }
        // 별혼과 능력: 30% 확률로 상위 등급, 성공 시 10% 추가 상위 등급
        let upgradedCount = 0;
        if (got && this.eqBase==='별혼과' && Math.random()<0.30) {
            const up = upgradeRarity(got); if (up) { got=up; upgradedCount++; }
            if (Math.random()<0.10) {
                const up2 = upgradeRarity(got); if (up2) { got=up2; upgradedCount++; }
            }
        }

        if (got && this.redPotionPending > 0) {
            got = GOLD + this.base(got);
            this.redPotionPending--;
        }

        // 키위 능력: 10% 확률로 2배 지급, 레몬 능력: 50% 확률로 2배 지급, 감 능력: 30% 확률로 2배 지급
        const count = (got && this.eqBase==='키위' && Math.random()<0.1) ? 2
            : (got && this.eqBase==='레몬' && Math.random()<0.5) ? 2
                : (got && this.eqBase==='할머니가 숨겨둔 감' && Math.random()<0.3) ? 2 : 1;
        return { fruit: got, count, upgraded: upgradedCount };
    },

    addFruit(fruit, count=1) { this.inventory[fruit]=(this.inventory[fruit]||0)+count; },

    checkDay() {
        const today = new Date().toDateString();
        if (today===this.lastDate) return false;
        const days = Math.max(1, Math.round((new Date(today)-new Date(this.lastDate))/86400000));
        for (let i=0;i<days;i++) this.advanceDay();
        this.lastDate=today; return true;
    },
    recordPrices() {
        for (const f of BASE_FRUITS) {
            for (const name of [f.name, GOLD+f.name, DIA+f.name]) {
                if (!this.priceHistory[name]) this.priceHistory[name] = [];
                this.priceHistory[name].push(this.prices[name]);
                if (this.priceHistory[name].length > 7) this.priceHistory[name].shift();
            }
        }
    },
    advanceDay() {
        this.day++;
        for (const f of BASE_FRUITS) {
            const sign = Math.random() < 0.5 ? 1 : -1;
            const ch = sign * (0.01 + Math.random() * 0.04);
            const nextPrice = Math.max(10, Math.round(this.prices[f.name] * (1 + ch)));
            const upperLimit = f.price * 1.5;
            const lowerLimit = f.price * 0.5;
            this.prices[f.name] = (nextPrice >= upperLimit || nextPrice <= lowerLimit) ? f.price : nextPrice;
            this.prices[GOLD+f.name] = this.prices[f.name]*10;
            this.prices[DIA+f.name]  = this.prices[f.name]*25;
        }
        this.recordPrices();
    },
    sellOne(f)  { if(NO_SELL_FRUITS.includes(this.base(f)))return; if(this.inventory[f]>0){this.inventory[f]--;this.gold+=this.prices[f];} },
    sellAll(f)  { if(NO_SELL_FRUITS.includes(this.base(f)))return; this.gold+=this.prices[f]*(this.inventory[f]||0); this.inventory[f]=0; },
    buyOne(f)   { if(this.gold<this.prices[f])return false; this.gold-=this.prices[f]; this.inventory[f]=(this.inventory[f]||0)+1; return true; },
};

// 포도 능력: 상위 등급 과일로 업그레이드
function upgradeRarity(fruitName) {
    const isGold = fruitName.startsWith(GOLD);
    const isDia  = fruitName.startsWith(DIA);
    const prefix = isGold ? GOLD : isDia ? DIA : '';
    const base   = isGold ? fruitName.slice(GOLD.length) : isDia ? fruitName.slice(DIA.length) : fruitName;
    const order  = ['희귀','영웅','전설','신화','불멸','비밀'];
    const cur    = BASE_FRUITS.find(f=>f.name===base);
    if (!cur) return null;
    const idx = order.indexOf(cur.rarity);
    if (idx===-1 || idx>=order.length-1) return null;
    const next = BASE_FRUITS.find(f=>f.rarity===order[idx+1]);
    return next ? prefix+next.name : null;
}

// ── Firebase REST ──────────────────────────────────────────────
function toast(msg) {
    let el = document.getElementById('toast-notif');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast-notif';
        el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 22px;border-radius:20px;font-size:14px;z-index:9999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;max-width:90vw;text-align:center';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._tid);
    el._tid = setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

function fbFetch(url, opts={}, ms=8000) {
    const ctrl = new AbortController();
    const tid = setTimeout(()=>ctrl.abort(), ms);
    return fetch(url, {...opts, signal:ctrl.signal}).finally(()=>clearTimeout(tid));
}
const FB = FIREBASE_URL ? {
    async get(p)   { try{const r=await fbFetch(`${FIREBASE_URL}/ff/${p}.json`);return await r.json();}catch{return null;} },
    async set(p,d) { try{await fbFetch(`${FIREBASE_URL}/ff/${p}.json`,{method:'PUT',body:JSON.stringify(d)});}catch{} },
    async push(p,d){ try{const r=await fbFetch(`${FIREBASE_URL}/ff/${p}.json`,{method:'POST',body:JSON.stringify(d)});return !!(r&&r.ok);}catch{return false;} },
    async del(p)   { try{await fbFetch(`${FIREBASE_URL}/ff/${p}.json`,{method:'DELETE'});}catch{} },
} : null;
function encN(s){ return s.replace(/[.#$[\]/]/g,'_'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// ── 닉네임 레지스트리 ──────────────────────────────────────────
// 기기마다 고유한 세션 ID로 "내 닉네임"을 구분
function getSessionId() {
    let id = localStorage.getItem('fruitFarm4_sid');
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('fruitFarm4_sid', id); }
    return id;
}
function getNicknameRegistry() { return JSON.parse(localStorage.getItem('fruitFarm4_registry')||'{}'); }
async function isNicknameTaken(nick) {
    if (FB) {
        const v = await FB.get(`reg/${encN(nick)}`);
        // null = 없음, 에러 객체 = Firebase 오류(점유 안 된 것으로 처리), 내 세션 = 내 닉네임
        if (v === null) return false;
        if (typeof v === 'object') return false; // {error:"..."} 등 에러 응답
        return v !== getSessionId();
    }
    const r = getNicknameRegistry();
    return nick in r && r[nick] !== getSessionId();
}
async function registerNickname(nick) {
    if (FB) {
        await FB.set(`reg/${encN(nick)}`, getSessionId());
        await FB.set(`session/${encN(nick)}`, getSessionId()); // 현재 활성 세션 등록
    }
    const r = getNicknameRegistry(); r[nick] = getSessionId(); localStorage.setItem('fruitFarm4_registry', JSON.stringify(r));
}
async function checkActiveSession() {
    if (!G.nickname || !FB) return;
    const active = await FB.get(`session/${encN(G.nickname)}`);
    if (active === null || typeof active === 'object') return; // Firebase 오류면 무시
    if (active !== getSessionId()) {
        alert('📱 다른 기기에서 로그인되어 자동 로그아웃 되었습니다.\n새 닉네임으로 처음부터 시작합니다.');
        localStorage.removeItem('fruitFarm4');
        localStorage.setItem('fruitFarm4_kicked', '1');
        location.reload();
    }
}

// ── 우편함 ─────────────────────────────────────────────────────
function getMailbox(nick)       { return JSON.parse(localStorage.getItem(`fruitFarm4_mb_${nick}`)||'[]'); }
function setMailbox(nick,msgs)  { localStorage.setItem(`fruitFarm4_mb_${nick}`,JSON.stringify(msgs)); }
function sendToMailbox(nick,msg){ const b=getMailbox(nick); b.push({...msg,ts:Date.now()}); setMailbox(nick,b); }

async function pushMsg(nick, msg) {
    if (FB) return await FB.push(`mb/${encN(nick)}`, {...msg, ts:Date.now()});
    else { sendToMailbox(nick, msg); return true; }
}
async function processMailbox() {
    if (!G.nickname) return;
    let msgs=[];
    if (FB) {
        const data=await FB.get(`mb/${encN(G.nickname)}`);
        if (data){ msgs=Object.values(data); await FB.del(`mb/${encN(G.nickname)}`); }
    } else {
        msgs=getMailbox(G.nickname); if(!msgs.length)return; setMailbox(G.nickname,[]);
    }
    const validFruits = new Set(BASE_FRUITS.map(f=>f.name));
    const isValidFruit = name => {
        const base = name.startsWith(GOLD)?name.slice(GOLD.length):name.startsWith(DIA)?name.slice(DIA.length):name;
        return validFruits.has(base);
    };
    let changed=false;
    for(const m of msgs){
        // 메시지 기본 유효성 검사
        if(!m || typeof m.type !== 'string') continue;
        if(m.from && typeof m.from !== 'string') continue;

        if(m.type==='friend_req'){
            if(typeof m.from==='string' && m.from.length<=20 && !G.pendingRequests.includes(m.from)){G.pendingRequests.push(m.from);changed=true;}
        }
        else if(m.type==='friend_accept'){
            if(typeof m.from==='string' && m.from.length<=20 && !G.friends.includes(m.from)){G.friends.push(m.from);changed=true;}
        }
        else if(m.type==='trade'){
            // 거래 메시지 검증: 비정상 금액·아이템 차단
            const g = Number(m.gold)||0, wg = Number(m.wantGold)||0;
            if(g<0||wg<0) continue;
            const items = m.items||{}, wantItems = m.wantItems||{};
            const badItem = [...Object.keys(items),...Object.keys(wantItems)].some(f=>!isValidFruit(f));
            if(badItem) continue;
            const badCount = [...Object.values(items),...Object.values(wantItems)].some(c=>Number(c)<1||Number(c)>9999);
            if(badCount) continue;
            G.tradeOffers.push(m);changed=true;
        }
        else if(m.type==='trade_return'){
            const gold = Number(m.gold)||0;
            if(gold<0) continue;
            G.gold += gold;
            for(const[f,c]of Object.entries(m.items||{})){
                if(!isValidFruit(f)) continue;
                const cnt=Number(c); if(cnt<0||cnt>9999) continue;
                G.addFruit(f,cnt);
            }
            changed=true;
        }
        else if(m.type==='auction_refund'){
            const amt=Number(m.amount)||0;
            if(amt<0) continue;
            G.gold+=amt;changed=true;toast(`🔔 경매 환불: ${amt.toLocaleString()}G (${esc(m.fruit||'')} 최고입찰자 변경)`);
        }
        else if(m.type==='auction_won'){
            if(typeof m.fruit==='string'&&isValidFruit(m.fruit)){G.addFruit(m.fruit,1);changed=true;toast(`🎉 경매 낙찰! ${G.emoji[m.fruit]||''}${esc(m.fruit)} 획득!`);}
        }
    }
    if(changed){G.save();updateFriendBadge();refreshMain();}
}

// ── 친구 기능 ──────────────────────────────────────────────────
async function sendFriendRequest(toNick) {
    if(!toNick) return;
    if(toNick===G.nickname)        return alert('자기 자신에게는 보낼 수 없습니다.');
    if(G.friends.includes(toNick)) return alert('이미 친구입니다.');
    if(FB){ const e=await FB.get(`reg/${encN(toNick)}`); if(!e)return alert(`'${toNick}' 닉네임이 존재하지 않습니다.`); }
    else  { const r=getNicknameRegistry(); if(!(toNick in r))return alert(`'${toNick}' 닉네임이 존재하지 않습니다.\n(Firebase 미설정: 같은 기기만 검색됩니다)`); }
    await pushMsg(toNick,{type:'friend_req',from:G.nickname});
    alert(`'${toNick}'에게 친구요청을 보냈습니다!`);
}
function acceptFriend(fromNick) {
    if(!G.friends.includes(fromNick)) G.friends.push(fromNick);
    G.pendingRequests=G.pendingRequests.filter(n=>n!==fromNick);
    G.save(); renderFriends(); updateFriendBadge();
    pushMsg(fromNick,{type:'friend_accept',from:G.nickname});
}
function rejectFriend(fromNick) {
    G.pendingRequests=G.pendingRequests.filter(n=>n!==fromNick);
    G.save(); renderFriends(); updateFriendBadge();
}
function removeFriend(nick) { G.friends=G.friends.filter(n=>n!==nick); G.save(); renderFriends(); }
function updateFriendBadge() {
    const total = G.pendingRequests.length + G.tradeOffers.length;
    const badge = $('friend-badge');
    if (badge) { badge.style.display = total > 0 ? 'block' : 'none'; badge.textContent = total; }
}


// ── 거래 ───────────────────────────────────────────────────────
async function sendTrade(toNick, items, gold, wantItems, wantGold) {
    if(FB){ const e=await FB.get(`reg/${encN(toNick)}`); if(!e)return alert('존재하지 않는 닉네임입니다.'); }
    else  { const r=getNicknameRegistry(); if(!(toNick in r))return alert('존재하지 않는 닉네임입니다.'); }
    G.gold -= gold;
    for(const[f,c]of Object.entries(items)) G.inventory[f]=Math.max(0,(G.inventory[f]||0)-c);
    await pushMsg(toNick,{type:'trade',from:G.nickname,items,gold,wantItems:wantItems||{},wantGold:wantGold||0});
    G.save(); refreshMain();
    alert(`'${toNick}'에게 거래 요청을 보냈습니다!`);
}
function canonicalItemKey(key) {
    // 카탈로그에 있는 키와 정확히 일치하는 것을 찾아 반환 (공백·유니코드 정규화 차이 방어)
    const trimmed = key.trim().normalize('NFC');
    const allKeys = Object.keys(G.emoji);
    return allKeys.find(k => k.trim().normalize('NFC') === trimmed) || trimmed;
}
async function acceptTrade(offer) {
    const wantItems = offer.wantItems || {};
    const wantGold  = Number(offer.wantGold)  || 0;
    // 요청된 아이템/골드 보유 확인
    for(const[f,c]of Object.entries(wantItems)){
        const key = canonicalItemKey(f);
        if((G.inventory[key]||0) < Number(c)) return alert(`'${key}'이(가) 부족합니다. (필요 ${c}개)`);
    }
    if(G.gold < wantGold) return alert(`골드가 부족합니다. (필요 ${wantGold.toLocaleString()}G)`);

    // 상대에게 줄 아이템 목록 준비
    const returnItems = {};
    for(const[f,c]of Object.entries(wantItems)){
        returnItems[canonicalItemKey(f)] = Number(c);
    }

    // Firebase 전송 먼저 — 성공해야만 내 상태를 바꿈
    const ok = await pushMsg(offer.from, {type:'trade_return', from:G.nickname, items:returnItems, gold:wantGold});
    if (!ok) return alert('거래 메시지 전송에 실패했습니다. 인터넷 연결을 확인 후 다시 시도해주세요.');

    // 전송 성공 후 내 상태 반영
    G.gold += Number(offer.gold)||0;
    for(const[f,c]of Object.entries(offer.items||{})){
        G.addFruit(canonicalItemKey(f), Number(c));
    }
    G.gold -= wantGold;
    for(const[f,c]of Object.entries(wantItems)){
        const key = canonicalItemKey(f);
        G.inventory[key] = Math.max(0,(G.inventory[key]||0)-Number(c));
    }
    G.tradeOffers = G.tradeOffers.filter(o=>o.ts!==offer.ts);
    G.save(); refreshMain(); renderFriends(); updateFriendBadge();
}
function rejectTrade(offer) {
    G.tradeOffers=G.tradeOffers.filter(o=>o.ts!==offer.ts);
    G.save(); renderFriends(); updateFriendBadge();
    pushMsg(offer.from,{type:'trade_return',from:G.nickname,items:offer.items,gold:offer.gold});
}

function renderFriends() {
    const el = $('friends-content');
    const sec = (title, color='#aaa') =>
        `<div style="color:${color};font-size:12px;font-weight:bold;letter-spacing:1px;margin:16px 0 8px">${title}</div>`;
    const divider = `<div style="border-top:1px solid #2a2a2a;margin:14px 0"></div>`;

    let html = '';

    // ── 거래 요청 ──────────────────────────────────────────────
    html += sec(`🤝 거래 요청 (${G.tradeOffers.length})`, '#ffd700');
    if (G.tradeOffers.length === 0) {
        html += `<div style="color:#555;font-size:13px;padding:8px 0">받은 거래 요청이 없습니다.</div>`;
    } else {
        for (const offer of G.tradeOffers) {
            const fmtItems = (items, gold) => {
                const parts = Object.entries(items||{}).map(([f,c])=>{ const k=canonicalItemKey(f); return `${G.emoji[k]||''} ${k} ×${c}`; });
                if((gold||0)>0) parts.push(`💰${Number(gold).toLocaleString()}G`);
                return parts.length ? parts.join(', ') : '없음';
            };
            html += `<div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px">
                <div style="color:#fff;font-size:13px;margin-bottom:8px">
                    <span style="color:#0f0;font-weight:bold">${esc(offer.from)}</span>님의 거래 요청
                </div>
                <div style="font-size:12px;margin-bottom:4px"><span style="color:#ffd700">📤 줄 것:</span> <span style="color:#aaa">${fmtItems(offer.items, offer.gold)}</span></div>
                <div style="font-size:12px;margin-bottom:8px"><span style="color:#7af">📥 받을 것:</span> <span style="color:#aaa">${fmtItems(offer.wantItems, offer.wantGold)}</span></div>
                <div style="display:flex;gap:6px">
                    <button class="btn tf-accept" data-ts="${offer.ts}"
                        style="flex:1;background:#1a4a1a;color:#0f0;font-size:13px;padding:7px">✔ 수락</button>
                    <button class="btn tf-reject" data-ts="${offer.ts}"
                        style="flex:1;background:#3a1a1a;color:#f44;font-size:13px;padding:7px">✘ 거절</button>
                </div>
            </div>`;
        }
    }

    html += divider;

    // ── 친구 요청 ──────────────────────────────────────────────
    html += sec(`📨 친구 요청 (${G.pendingRequests.length})`);
    if (G.pendingRequests.length === 0) {
        html += `<div style="color:#555;font-size:13px;padding:8px 0">받은 친구 요청이 없습니다.</div>`;
    } else {
        for (const nick of G.pendingRequests) {
            html += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#1a1a1a;border-radius:8px;margin-bottom:6px">
                <span style="flex:1;color:#fff;font-size:13px">👤 ${esc(nick)}</span>
                <button class="btn fr-accept" data-nick="${esc(nick)}"
                    style="background:#1a4a1a;color:#0f0;font-size:12px;padding:6px 12px">수락</button>
                <button class="btn fr-reject" data-nick="${esc(nick)}"
                    style="background:#3a1a1a;color:#f44;font-size:12px;padding:6px 12px">거절</button>
            </div>`;
        }
    }

    html += divider;

    // ── 친구 목록 ──────────────────────────────────────────────
    html += sec(`👥 친구 목록 (${G.friends.length})`);
    if (G.friends.length === 0) {
        html += `<div style="color:#555;font-size:13px;padding:8px 0">아직 친구가 없습니다.</div>`;
    } else {
        for (const nick of G.friends) {
            html += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#1a1a1a;border-radius:8px;margin-bottom:6px">
                <span style="flex:1;color:#fff;font-size:13px">👤 ${esc(nick)}</span>
                <button class="btn fl-trade" data-nick="${esc(nick)}"
                    style="background:#1a3a5a;color:#7af;font-size:12px;padding:6px 12px">거래</button>
                <button class="btn fl-remove" data-nick="${esc(nick)}"
                    style="background:#2a2a2a;color:#888;font-size:12px;padding:6px 12px">삭제</button>
            </div>`;
        }
    }

    html += divider;

    // ── 친구 추가 ──────────────────────────────────────────────
    html += sec('➕ 친구 추가');
    html += `<div style="display:flex;gap:8px;margin-bottom:4px">
        <input id="inp-friend-nick" type="text" placeholder="닉네임 입력"
            style="flex:1;padding:10px;font-size:13px;background:#222;color:#fff;border:1px solid #444;border-radius:8px">
        <button class="btn" id="btn-send-freq"
            style="background:#2a4a2a;color:#0f0;font-size:13px;padding:10px 16px">요청</button>
    </div>`;

    el.innerHTML = html;

    // 이벤트 바인딩
    el.querySelectorAll('.tf-accept').forEach(b => b.onclick = () => {
        b.disabled = true;
        const offer = G.tradeOffers.find(o => o.ts == b.dataset.ts);
        if (offer) acceptTrade(offer);
    });
    el.querySelectorAll('.tf-reject').forEach(b => b.onclick = () => {
        b.disabled = true;
        const offer = G.tradeOffers.find(o => o.ts == b.dataset.ts);
        if (offer) rejectTrade(offer);
    });
    el.querySelectorAll('.fr-accept').forEach(b => b.onclick = () => { b.disabled = true; acceptFriend(b.dataset.nick); });
    el.querySelectorAll('.fr-reject').forEach(b => b.onclick = () => { b.disabled = true; rejectFriend(b.dataset.nick); });
    el.querySelectorAll('.fl-trade').forEach(b => b.onclick = () => { closeModal('modal-friends'); openTradeModal(b.dataset.nick); });
    el.querySelectorAll('.fl-remove').forEach(b => b.onclick = () => { if(confirm(`'${b.dataset.nick}'을(를) 친구 목록에서 삭제할까요?`)) { removeFriend(b.dataset.nick); renderFriends(); } });
    const freqBtn = $('btn-send-freq');
    freqBtn.onclick = async () => {
        freqBtn.disabled = true;
        await sendFriendRequest($('inp-friend-nick').value.trim());
        freqBtn.disabled = false;
    };
}

// ── 거래 모달 ─────────────────────────────────────────────────
async function openTradeModal(toNick) {
    const el = $('trade-content');
    el.innerHTML = `<div style="color:#aaa;text-align:center;padding:20px">친구 인벤토리 불러오는 중...</div>`;
    closeModal('modal-friends');
    openModal('modal-trade');

    const friendInv = (FB ? await FB.get(`inv/${encN(toNick)}`) : null) || {};
    const state = { offerItems:{}, offerGold:0, wantItems:{}, wantGold:0 };

    const countRow = (name, cur, max, plusCls, minusCls) =>
        `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1a1a1a;border-radius:6px;margin-bottom:4px">
            <span style="flex:1;color:#fff;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${emojiHtml(name)} ${name}</span>
            <button class="btn ${minusCls}" data-n="${name}" style="background:#333;color:#fff;width:26px;height:26px;padding:0;font-size:14px;flex-shrink:0">-</button>
            <span style="color:#0f0;width:22px;text-align:center;font-size:13px;flex-shrink:0">${cur}</span>
            <button class="btn ${plusCls}" data-n="${name}" style="background:#333;color:#fff;width:26px;height:26px;padding:0;font-size:14px;flex-shrink:0">+</button>
            <span style="color:#555;font-size:11px;width:36px;text-align:right;flex-shrink:0">/${max}</span>
        </div>`;

    const render = () => {
        const scrollTop = el.firstElementChild?.scrollTop ?? 0;
        const offerSummary = Object.entries(state.offerItems).filter(([,c])=>c>0).map(([f,c])=>`${G.emoji[f]||f}×${c}`).join(' ') || '없음';
        const wantSummary  = Object.entries(state.wantItems).filter(([,c])=>c>0).map(([f,c])=>`${G.emoji[f]||f}×${c}`).join(' ')  || '없음';

        let html = `<div style="overflow-y:auto;max-height:calc(92dvh - 130px)">`;

        // ── 내가 줄 것 ──────────────────────────────────
        html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="color:#ffd700;font-size:12px;font-weight:bold">📤 내가 줄 것</span>
            <span style="color:#aaa;font-size:11px">${offerSummary} ${state.offerGold>0?`💰${state.offerGold.toLocaleString()}G`:''}</span>
        </div>`;
        html += `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1a1a1a;border-radius:6px;margin-bottom:4px">
            <span style="flex:1;color:#ffd700;font-size:12px">💰 골드</span>
            <input id="trade-offer-gold" type="number" min="0" value="${state.offerGold}"
                style="width:80px;padding:3px 6px;background:#222;color:#fff;border:1px solid #444;border-radius:4px;font-size:12px;text-align:right">
            <span style="color:#555;font-size:11px;width:36px;text-align:right">/${G.gold.toLocaleString()}</span>
        </div>`;
        let hasMyItems = false;
        for (const f of BASE_FRUITS)
            for (const name of [f.name, GOLD+f.name, DIA+f.name]) {
                const inv = G.inventory[name]||0; if (inv<=0) continue;
                hasMyItems = true;
                html += countRow(name, state.offerItems[name]||0, inv, 'to-p', 'to-m');
            }
        if (!hasMyItems) html += `<div style="color:#555;font-size:12px;padding:6px 8px">보유 중인 과일이 없습니다.</div>`;

        // ── 내가 받을 것 ─────────────────────────────────
        html += `<div style="border-top:1px solid #2a2a2a;margin:10px 0 8px"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="color:#7af;font-size:12px;font-weight:bold">📥 내가 받을 것 <span style="color:#555;font-size:11px;font-weight:normal">(${esc(toNick)} 보유)</span></span>
            <span style="color:#aaa;font-size:11px">${wantSummary} ${state.wantGold>0?`💰${state.wantGold.toLocaleString()}G`:''}</span>
        </div>`;
        html += `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1a1a1a;border-radius:6px;margin-bottom:4px">
            <span style="flex:1;color:#ffd700;font-size:12px">💰 골드</span>
            <input id="trade-want-gold" type="number" min="0" value="${state.wantGold}"
                style="width:80px;padding:3px 6px;background:#222;color:#fff;border:1px solid #444;border-radius:4px;font-size:12px;text-align:right">
        </div>`;
        let hasFriendItems = false;
        for (const f of BASE_FRUITS)
            for (const name of [f.name, GOLD+f.name, DIA+f.name]) {
                const inv = friendInv[name]||0; if (inv<=0) continue;
                hasFriendItems = true;
                html += countRow(name, state.wantItems[name]||0, inv, 'tw-p', 'tw-m');
            }
        if (!hasFriendItems) html += `<div style="color:#555;font-size:12px;padding:6px 8px">${esc(toNick)}님이 보유한 과일이 없습니다.</div>`;

        html += `</div>
        <button class="btn" id="btn-do-trade"
            style="width:100%;background:#cc4400;color:#fff;font-size:14px;padding:10px;margin-top:8px">거래 요청 보내기</button>`;
        el.innerHTML = html;
        if (el.firstElementChild) el.firstElementChild.scrollTop = scrollTop;

        el.querySelectorAll('.to-p').forEach(b=>b.onclick=()=>{ const n=b.dataset.n; state.offerItems[n]=Math.min((state.offerItems[n]||0)+1,(G.inventory[n]||0)); syncGold(); render(); });
        el.querySelectorAll('.to-m').forEach(b=>b.onclick=()=>{ const n=b.dataset.n; state.offerItems[n]=Math.max((state.offerItems[n]||0)-1,0); syncGold(); render(); });
        el.querySelectorAll('.tw-p').forEach(b=>b.onclick=()=>{ const n=b.dataset.n; state.wantItems[n]=Math.min((state.wantItems[n]||0)+1,(friendInv[n]||0)); syncGold(); render(); });
        el.querySelectorAll('.tw-m').forEach(b=>b.onclick=()=>{ const n=b.dataset.n; state.wantItems[n]=Math.max((state.wantItems[n]||0)-1,0); syncGold(); render(); });

        const syncGold = () => {
            state.offerGold = Math.max(parseInt($('trade-offer-gold')?.value)||0, 0);
            state.wantGold  = Math.max(parseInt($('trade-want-gold')?.value)||0,  0);
        };

        $('btn-do-trade').onclick=async()=>{
            syncGold();
            const offerItems = Object.fromEntries(Object.entries(state.offerItems).filter(([,c])=>c>0));
            const wantItems  = Object.fromEntries(Object.entries(state.wantItems).filter(([,c])=>c>0));
            if (!Object.keys(offerItems).length && state.offerGold<=0) return alert('줄 항목을 선택하세요.');
            if (state.offerGold > G.gold) return alert('골드가 부족합니다.');
            if (state.offerGold < 0 || state.wantGold < 0) return alert('올바르지 않은 금액입니다.');
            await sendTrade(toNick, offerItems, state.offerGold, wantItems, state.wantGold);
            closeModal('modal-trade');
        };
    };
    render();
}


// ── UI 유틸 ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = id => { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); };
const openModal  = id => $(id).classList.add('open');
const closeModal = id => $(id).classList.remove('open');

function closeDrop() {
    $('drop-notif').classList.remove('show');
    $('drop-backdrop').classList.remove('show');
}

// ── 두리안 도둑 ────────────────────────────────────────────────
function showDurian() {
    const stolen = Math.floor(G.gold * 0.1);
    G.gold = Math.max(0, G.gold - stolen);
    G.save();
    refreshMain();

    const el = $('durian-popup');
    el.innerHTML = `
        <div class="durian-char">
            <div style="color:#7cb342;font-size:19px;line-height:.72;letter-spacing:-5px">▲▲▲▲▲▲</div>
            <div style="color:#9ccc65;font-size:14px;line-height:.72;letter-spacing:-4px">▲▲▲▲▲▲▲▲</div>
            <div style="width:66px;height:52px;border-radius:50%;
                        background:radial-gradient(ellipse,#fff9c4 8%,#f9a825 52%,#bf360c 100%);
                        display:flex;align-items:center;justify-content:center;font-size:26px;
                        box-shadow:inset 0 -6px 12px rgba(0,0,0,.3),0 3px 8px rgba(0,0,0,.4)">😤</div>
            <div style="color:#558b2f;font-size:14px;line-height:.72;letter-spacing:-4px">▼▼▼▼▼▼▼▼</div>
            <div style="color:#33691e;font-size:19px;line-height:.72;letter-spacing:-5px">▼▼▼▼▼▼</div>
        </div>
        <div style="font-size:13px;color:#ff8888;font-weight:bold;letter-spacing:1px">두리안 도둑 등장!</div>
        <div class="durian-stolen">💰 −${stolen.toLocaleString()} G 도둑맞았다!</div>
        <div style="font-size:18px;margin:4px 0">💨🤢💨</div>
        <div class="durian-escape">냄새만 남기고 줄행랑...</div>`;

    el.classList.remove('flee');
    el.classList.add('show');

    // 1.5초 후 도망
    setTimeout(() => {
        el.classList.add('flee');
        setTimeout(() => {
            el.classList.remove('show', 'flee');
        }, 500);
    }, 1500);
}

function checkDurian() {
    if (G.eqBase === '귤') return false;
    if (G.isPurplePotionActive) return false;
    if (Math.random() * 100 >= 0.1) return false;
    showDurian();
    return true;
}

function showDrop(fruit, count, upgraded=0) {
    const rarityInfo = getFruitRarity(G.base(fruit));
    const borderColor = rarityInfo?.color || '#4caf50';
    const totalPrice = G.prices[fruit] * count;
    const countText = count > 1 ? ` ×${count}` : '';
    const priceText = count > 1
        ? `시세: ${G.prices[fruit].toLocaleString()}G × ${count} = ${totalPrice.toLocaleString()}G`
        : `시세: ${G.prices[fruit].toLocaleString()}G`;
    const upgradeLabel = upgraded >= 2
        ? `<span style="display:inline-block;margin-bottom:4px;padding:2px 10px;border-radius:12px;background:linear-gradient(90deg,#a855f7,#ec4899);color:#fff;font-size:12px;font-weight:bold;letter-spacing:.5px">✦ 상위 등급 2단계 등장!</span>`
        : upgraded === 1
        ? `<span style="display:inline-block;margin-bottom:4px;padding:2px 10px;border-radius:12px;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;font-size:12px;font-weight:bold;letter-spacing:.5px">↑ 상위 등급 등장!</span>`
        : '';

    const el = $('drop-notif');
    el.style.borderColor = borderColor;
    el.innerHTML = `
        ${upgradeLabel}
        <span class="notif-emoji">${emojiHtml(fruit)}</span>
        <span class="notif-name">${fruit}${countText} 획득!</span>
        <span class="notif-price">${priceText}</span>
        <span class="notif-timer" id="notif-countdown">선택 가능까지 2초...</span>
        <div class="notif-btns" id="notif-btns">
            <button class="btn" id="btn-sell-now"
                style="background:#cc4400;color:#fff">💰 바로 팔기</button>
            <button class="btn" id="btn-to-inv"
                style="background:#228b22;color:#fff">🎒 인벤토리</button>
        </div>`;

    $('drop-backdrop').classList.add('show');
    el.classList.add('show');

    // 1초 후 카운트다운 업데이트, 2초 후 버튼 활성화
    const countdown = $('notif-countdown');
    const btns = $('notif-btns');

    setTimeout(() => { if(countdown) countdown.textContent = '선택 가능까지 1초...'; }, 1000);
    setTimeout(() => {
        if (!el.classList.contains('show')) return;
        if (countdown) countdown.style.display = 'none';
        if (btns) btns.classList.add('visible');

        $('btn-sell-now').onclick = () => {
            if (NO_SELL_FRUITS.includes(G.base(fruit))) {
                G.addFruit(fruit, count);
                G.save(); refreshMain(); closeDrop();
                return;
            }
            G.gold += totalPrice;
            G.save(); refreshMain(); closeDrop();
        };
        $('btn-to-inv').onclick = () => {
            G.addFruit(fruit, count);
            G.save(); refreshMain(); closeDrop();
        };
    }, 2000);
}

function emojiHtml(fruit) {
    if (G.base(fruit) === '개척자의 열매') return PIONEER_SVG;
    if (G.base(fruit) === '축복의 복숭아') return BLESSED_PEACH_SVG;
    const e = G.emoji[fruit] || (typeof fruit === 'string' ? fruit : '');
    const bf = BASE_FRUITS.find(f => f.name === G.base(fruit));
    if (G.isDia(fruit))  return `<span class="diamond">${e}</span>`;
    if (G.isGold(fruit)) return `<span class="golden">${e}</span>`;
    if (bf && bf.rarity === '비밀') return `<span class="star-soul">${e}</span>`;
    return e;
}

// 등급 색 작은 네모
function rarityDot(fruitName) {
    const r = getFruitRarity(fruitName);
    if (!r) return '';
    const dotBase = `display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:middle;flex-shrink:0`;
    const style = (r.cardClass === 'rarity-secret' || r.cardClass === 'rarity-divine')
        ? `class="${r.cardClass}" style="${dotBase}"`
        : `style="${dotBase};background:${r.color};box-shadow:0 0 4px ${r.color}"`;
    return `<span ${style}></span>`;
}

function applyBg() {
    const app = $('app');
    app.querySelectorAll('.juice-drop,.juice-bubble,.tree-bg-el').forEach(el=>el.remove());
    return; // 배경 기능 비활성화

    // 별
    for (let i=0;i<22;i++){
        const s=document.createElement('div');
        s.className='tree-bg-el';
        const sz=(1+Math.random()*2.2).toFixed(1);
        s.style.cssText=`position:absolute;border-radius:50%;background:#fff;pointer-events:none;z-index:1;`+
            `width:${sz}px;height:${sz}px;top:${4+Math.random()*48}%;left:${Math.random()*100}%;`+
            `animation:bgStarTwinkle ${(2+Math.random()*4).toFixed(1)}s ease-in-out ${(-Math.random()*5).toFixed(1)}s infinite`;
        app.appendChild(s);
    }

    // 달
    const moon=document.createElement('div');
    moon.className='tree-bg-el';
    moon.style.cssText='position:absolute;top:6%;right:10%;font-size:32px;pointer-events:none;z-index:1;'+
        'animation:bgMoonGlow 3s ease-in-out infinite;';
    moon.textContent='🌕';
    app.appendChild(moon);

    // 나무
    const trees=[
        {l:0,  s:.70, f:['🍎','🍓']},
        {l:13, s:1.0,  f:['🍇','🍎','🍓']},
        {l:27, s:.85,  f:['🍑','🍊']},
        {l:44, s:1.2,  f:['🍎','🍇','🍋','🍓']},
        {l:62, s:.9,   f:['🍈','🍎']},
        {l:76, s:1.05, f:['🍇','🍊','🍎']},
        {l:91, s:.72,  f:['🍓','🍇']},
    ];
    const fPos=[[.5,.12],[.15,.42],[.82,.38],[.28,.68],[.72,.65],[.5,.42],[.18,.2],[.78,.18]];

    trees.forEach(({l,s,f})=>{
        const cw=82*s, ch=96*s, tw=13*s, th=52*s, fs=Math.round(15*s);
        const wrap=document.createElement('div');
        wrap.className='tree-bg-el';
        wrap.style.cssText=`position:absolute;bottom:0;left:${l}%;pointer-events:none;z-index:1;`+
            `display:flex;flex-direction:column;align-items:center;`;

        const crown=document.createElement('div');
        crown.style.cssText=`position:relative;width:${cw}px;height:${ch}px;border-radius:50% 50% 42% 42%;`+
            `background:radial-gradient(ellipse at 50% 58%,#1e5220 0%,#0d2e10 55%,#061508 100%);`+
            `box-shadow:0 0 22px rgba(0,60,0,.65),inset 0 -10px 22px rgba(0,0,0,.45);overflow:visible;`;

        f.forEach((emoji,i)=>{
            const [px,py]=fPos[i%fPos.length];
            const el=document.createElement('span');
            el.style.cssText=`position:absolute;font-size:${fs}px;line-height:1;pointer-events:none;`+
                `left:${(px*cw-fs/2).toFixed(0)}px;top:${(py*ch-fs/2).toFixed(0)}px;`+
                `filter:drop-shadow(0 3px 5px rgba(0,0,0,.65));`+
                `animation:bgFruitSway ${(2.2+i*.5).toFixed(1)}s ease-in-out ${(-i*.9).toFixed(1)}s infinite alternate;`+
                `transform-origin:top center;`;
            el.textContent=emoji;
            crown.appendChild(el);
        });

        const trunk=document.createElement('div');
        trunk.style.cssText=`width:${tw}px;height:${th}px;border-radius:3px 3px 0 0;flex-shrink:0;`+
            `background:linear-gradient(to right,#2a0e04,#6b3510,#2a0e04);`;

        wrap.appendChild(crown);
        wrap.appendChild(trunk);
        app.appendChild(wrap);
    });

    // 지면
    const ground=document.createElement('div');
    ground.className='tree-bg-el';
    ground.style.cssText='position:absolute;bottom:0;left:0;right:0;height:38px;pointer-events:none;z-index:1;'+
        'background:linear-gradient(to top,rgba(5,18,5,.9),transparent);';
    app.appendChild(ground);
}

// ── 메인 화면 ─────────────────────────────────────────────────
// 칭호 설정
const TITLES = {
    '갑부':      { icon:'👑', color:'#ce93d8', bg:'#4a0072', price: TITLE_GABBU_PRICE },
    '일론 머스크': { icon:'🚀', color:'#bbb',    bg:'#111',    price: TITLE_ELON_PRICE  },
};

function refreshMain() {
    $('lbl-nick').textContent = `🌱 ${G.nickname}`;
    $('lbl-gold').textContent = `💰 골드: ${G.gold.toLocaleString()}`;
    $('lbl-clicks').textContent = `👆 클릭: ${G.clickCount.toLocaleString()}회`;

    const blueRemainSec   = Math.max(0, Math.ceil((G.bluePotionUntil   - Date.now()) / 1000));
    const purpleRemainSec = Math.max(0, Math.ceil((G.purplePotionUntil - Date.now()) / 1000));
    const blackRemainSec  = Math.max(0, Math.ceil((G.blackPotionUntil  - Date.now()) / 1000));
    const blueText   = G.isBluePotionActive   ? ` | 🔵 블루 포션 ${Math.floor(blueRemainSec / 60)}:${String(blueRemainSec % 60).padStart(2, '0')}` : '';
    const redText    = (G.redPotionPending > 0) ? ` | 🔴 레드 포션 대기 ${G.redPotionPending}회` : '';
    const purpleText = G.isPurplePotionActive  ? ` | 🟣 퍼플 포션 ${Math.floor(purpleRemainSec / 60)}:${String(purpleRemainSec % 60).padStart(2, '0')}` : '';
    const blackText  = G.isBlackPotionActive   ? ` | 🖤 블랙 포션 ${Math.floor(blackRemainSec / 60)}:${String(blackRemainSec % 60).padStart(2, '0')}` : '';
    $('lbl-clicks').textContent += `${blueText}${redText}${purpleText}${blackText}`;

    // 주간 랭킹 보너스 배지
    let bonusBadge = $('lbl-weekly-bonus');
    if (!bonusBadge) {
        bonusBadge = document.createElement('div');
        bonusBadge.id = 'lbl-weekly-bonus';
        bonusBadge.style.cssText = 'margin-top:4px';
        $('lbl-clicks').insertAdjacentElement('afterend', bonusBadge);
    }
    if (G.weeklyDropBonus > 1 && G.weeklyBonusDetail) {
        const d = G.weeklyBonusDetail;
        const parts = [];
        if (d.goldRank)  parts.push(`💰${d.goldRank}위`);
        if (d.clickRank) parts.push(`👆${d.clickRank}위`);
        bonusBadge.innerHTML = `<span style="display:inline-block;background:linear-gradient(90deg,#3a1a00,#4a2a00);border:1px solid #ffd700;border-radius:8px;padding:3px 10px;font-size:12px;color:#ffd700;font-weight:bold">🏆 주간보너스 드롭률 ${G.weeklyDropBonus.toFixed(1)}배 (${parts.join(' · ')})</span>`;
    } else {
        bonusBadge.innerHTML = '';
    }

    // 이벤트 버튼
    const evBtn = $('btn-event-open');
    if (evBtn) evBtn.style.display = Date.now() >= EVENT_OPEN_TS ? '' : 'none';

    // 칭호 표시
    const titleEl = $('lbl-title');
    if (G.equippedTitle && TITLES[G.equippedTitle]) {
        const TITLE_STYLES = {
            '갑부': {
                bg:'linear-gradient(135deg,#180028 0%,#4a0072 50%,#180028 100%)',
                color:'#e1bee7', border:'#9c27b0', anim:'titlePurple',
                deco:'✦', shimmer:'linear-gradient(90deg,transparent 0%,rgba(225,190,231,.25) 50%,transparent 100%)',
            },
            '일론 머스크': {
                bg:'linear-gradient(135deg,#030303 0%,#1e1e1e 50%,#030303 100%)',
                color:'#d4d4d4', border:'#888', anim:'titleSilver',
                deco:'◈', shimmer:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.12) 50%,transparent 100%)',
            },
        };
        const t = TITLES[G.equippedTitle];
        const s = TITLE_STYLES[G.equippedTitle] || {bg:t.bg,color:t.color,border:t.color,anim:'',deco:'✦',shimmer:''};
        titleEl.style.display = 'block';
        titleEl.innerHTML = `
            <span style="
                display:inline-flex;align-items:center;gap:7px;
                padding:5px 18px;
                background:${s.bg};
                background-size:200% auto;
                color:${s.color};
                border:1px solid ${s.border};
                border-radius:3px;
                font-size:13px;font-weight:bold;letter-spacing:2.5px;
                position:relative;overflow:hidden;
                animation:${s.anim} 2.5s ease-in-out infinite;
            ">
                <span style="opacity:.7;font-size:11px">${s.deco}</span>
                <span style="font-size:15px">${t.icon}</span>
                ${G.equippedTitle}
                <span style="opacity:.7;font-size:11px">${s.deco}</span>
                <span style="position:absolute;top:0;left:0;right:0;bottom:0;
                    background:${s.shimmer};background-size:200% auto;
                    animation:titleShimmer 3s linear infinite;pointer-events:none"></span>
            </span>`;
    } else {
        titleEl.style.display = 'none';
    }

    updateEquip();
}
// 등급별 앱 배경 (버튼색, 앱 배경)
const RARITY_APP_BG = {
    '희귀':   { appBg:'linear-gradient(135deg,#0a2a0a,#030f03)', btnBg:'#0a2a0a', border:'#00c853' },
    '영웅':   { appBg:'linear-gradient(135deg,#1a0828,#0d0414)', btnBg:'#1a0828', border:'#ce93d8' },
    '전설':   { appBg:'linear-gradient(135deg,#2a1800,#120b00)', btnBg:'#2a1800', border:'#ffb300' },
    '신화':   { appBg:'linear-gradient(135deg,#2a0808,#120404)', btnBg:'#2a0808', border:'#ef5350' },
    '불멸':   { appBg:'linear-gradient(135deg,#1a0000,#050000)', btnBg:'#1a0000', border:'#7a0000' },
    '비밀':   { appBg:'linear-gradient(135deg,#000a18,#000)',   btnBg:'#000a18', border:'#4af'    },
    '신성':   { appBg:'linear-gradient(135deg,#1a0020,#000818)', btnBg:'#1a0020', border:'#ff88ff' },
};

function updateEquip() {
    const f=G.equippedFruit, emoji=f?G.emoji[f]:'🧺', base=G.eqBase;
    const effect = base==='딸기'?'효과: 드롭 확률 ×1.1'
                 : base==='수박'?'효과: 다이아 과일 확률 ×1.5'
                 : base==='키위'?'효과: 10% 확률 과일 2배 지급'
                 : base==='포도'?'효과: 5% 확률 상위 등급 등장'
                 : base==='귤'?'효과: 두리안 도둑 미등장'
                 : base==='코코넛'?'효과: 클릭수 ×2 · 드롭 확률 ×2'
                 : base==='레몬'?'효과: 50% 확률 과일 2배 지급'
                 : base==='할머니가 숨겨둔 감'?'효과: 30% 확률 과일 2배 지급 · 드롭 확률 ×2.5'
                 : base==='별혼과'?'효과: 드롭 확률 ×1.5 · 30% 상위 등급 등장 · 성공 시 10% 추가 상위 등급':'효과: 없음';

    const btn=$('action-btn');
    btn.innerHTML = f ? emojiHtml(f) : emoji;
    btn.classList.toggle('fx-orange', base === '귤');

    // 버튼 색
    const baseF = f ? BASE_FRUITS.find(b => b.name === base) : null;
    const theme = baseF ? RARITY_APP_BG[baseF.rarity] : null;
    btn.style.background = 'none';
    btn.style.border = 'none';

    $('lbl-equipped').textContent=`장착 중: ${emoji} ${f||'없음'}  |  ${effect}`;
}

// ── 가격 꺾은선 그래프 ─────────────────────────────────────────
function drawPriceChart(canvas, history, lineColor) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 280;
    const H = canvas.clientHeight || 90;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    if (!history || history.length < 2) {
        ctx.fillStyle = '#555';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('데이터 수집 중...', W/2, H/2 + 4);
        return;
    }

    const pad = {top:8, right:10, bottom:18, left:46};
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    const minV = Math.min(...history);
    const maxV = Math.max(...history);
    const range = maxV - minV || maxV * 0.1 || 1;

    const px = i => pad.left + (i / (history.length - 1)) * cW;
    const py = v => pad.top + cH - ((v - minV) / range) * cH;

    // 격자
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    [0, 0.5, 1].forEach(t => {
        const yp = pad.top + cH * t;
        ctx.beginPath(); ctx.moveTo(pad.left, yp); ctx.lineTo(pad.left + cW, yp); ctx.stroke();
    });

    // Y 레이블
    const fmt = v => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : String(v);
    ctx.fillStyle = '#666'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(fmt(maxV), pad.left - 3, pad.top + 4);
    ctx.fillText(fmt(minV), pad.left - 3, pad.top + cH + 3);

    // X 레이블
    ctx.textAlign = 'center';
    history.forEach((_, i) => {
        const label = i === history.length - 1 ? '오늘' : `-${history.length - 1 - i}일`;
        ctx.fillText(label, px(i), H - 2);
    });

    // 면적 채우기
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, lineColor + '55');
    grad.addColorStop(1, lineColor + '05');
    ctx.fillStyle = grad;
    ctx.beginPath();
    history.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
    ctx.lineTo(px(history.length - 1), pad.top + cH);
    ctx.lineTo(px(0), pad.top + cH);
    ctx.closePath();
    ctx.fill();

    // 꺾은선
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    history.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
    ctx.stroke();

    // 점
    history.forEach((v, i) => {
        const isLast = i === history.length - 1;
        ctx.beginPath();
        ctx.arc(px(i), py(v), isLast ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isLast ? '#fff' : lineColor;
        ctx.fill();
        if (isLast) {
            ctx.strokeStyle = lineColor; ctx.lineWidth = 2; ctx.stroke();
        }
    });
}

// ── 자세히 보기 ───────────────────────────────────────────────
function renderDetail(baseName) {
    const f = BASE_FRUITS.find(b => b.name === baseName);
    if (!f) return;
    const r = RARITY[f.rarity];
    const ability = baseName==='딸기' ? '드롭 확률 x1.1'
                 : baseName==='수박' ? '다이아 과일 확률 x1.5'
                 : baseName==='키위' ? '10% 확률 과일 2배 지급'
                 : baseName==='포도' ? '5% 확률 상위 등급 등장'
                 : baseName==='귤' ? '두리안 도둑 미등장'
                 : baseName==='코코넛' ? '클릭수 x2 · 드롭 확률 x2'
                 : baseName==='레몬' ? '50% 확률 과일 2배 지급'
                 : baseName==='할머니가 숨겨둔 감' ? '30% 확률 과일 2배 지급 · 드롭 확률 x2.5'
                 : baseName==='별혼과' ? '드롭 확률 ×1.5 · 30% 상위 등급 등장 · 성공 시 10% 추가 상위 등급'
                 : '효과 없음';

    const box = document.querySelector('#modal-detail .modal-box');
    const isLimitedGrade = r.cardClass === 'rarity-limited';
    box.className = r.cardClass === 'rarity-divine'  ? 'modal-box divine-border'
                  : isLimitedGrade                   ? 'modal-box limited-border'
                  : 'modal-box';
    box.style.cssText = r.cardClass === 'rarity-divine'
        ? 'text-align:center;border:2px solid #ff0000;'
        : isLimitedGrade
        ? 'text-align:center;border:2px solid #ff69b4;'
        : `text-align:center;border:2px solid ${r.color};box-shadow:0 0 18px ${r.color}55,0 0 50px ${r.color}18;`;

    const mainDisplay = f.name === '별혼과' ? `
        <div class="deity-wrap">
            <div class="deity-glow"></div>
            <div class="deity-ring deity-ring-1"></div>
            <div class="deity-ring deity-ring-2"></div>
            <div class="deity-ring deity-ring-3"></div>
            <div class="deity-spark sp-a"></div>
            <div class="deity-spark sp-b"></div>
            <div class="deity-spark sp-c"></div>
            <div class="deity-spark sp-d"></div>
            <div class="deity-core"></div>
            <div class="deity-star ds-a"><span>✦</span></div>
            <div class="deity-star ds-b"><span>✦</span></div>
            <div class="deity-star ds-c"><span>✦</span></div>
            <div class="deity-star ds-d"><span>✷</span></div>
            <div class="deity-star ds-e"><span>✷</span></div>
            <div class="deity-star ds-f"><span>✷</span></div>
            <div class="deity-star ds-g"><span>✶</span></div>
            <div class="deity-star ds-h"><span>✶</span></div>
            <div class="deity-star ds-i"><span>✶</span></div>
            <div class="deity-main">
                <span class="star-soul">🌟</span>
            </div>
        </div>` :
        f.name === '축복의 복숭아' ?
        `<div style="font-size:96px;line-height:1;margin-bottom:10px;animation:blessedPeachFloat 3s ease-in-out infinite">${emojiHtml(f.name)}</div>` :
        `<div style="font-size:96px;line-height:1;margin-bottom:10px">${emojiHtml(f.name)}</div>`;

    const limitedDesc = f.name === '개척자의 열매'
        ? '초기 개척자 50인에게 지급'
        : f.name === '축복의 복숭아'
        ? '1달 기념 이벤트 — 박 두드리기 보상'
        : '특별 한정 아이템';

    $('detail-content').innerHTML = `
        ${mainDisplay}
        <div style="font-size:26px;font-weight:bold;color:#fff;margin-bottom:10px">${f.name}</div>
        ${isLimitedGrade ? `
        <div style="background:rgba(0,0,0,.45);border-radius:10px;padding:14px 18px;font-size:14px;line-height:2;margin-bottom:12px;color:#ff69b4">
            ${limitedDesc}<br>
            <span style="color:#ffd700;font-weight:bold">판매 불가 · 거래만 가능</span><br>
            <span style="font-size:12px;color:#666">시세 없음 · 경매 불가</span>
        </div>` : `
        <div style="background:rgba(0,0,0,.45);border-radius:10px;padding:14px 18px;font-size:15px;line-height:2;margin-bottom:12px">
            <div>기본 시세 &nbsp;<strong style="color:#ffd700">${G.prices[f.name].toLocaleString()} G</strong></div>
            <div><span class="golden" style="font-size:15px">${f.emoji}</span> 황금 &nbsp;<strong style="color:#ffd700">${G.prices[GOLD+f.name].toLocaleString()} G</strong></div>
            <div><span class="diamond" style="font-size:15px">${f.emoji}</span> 다이아 &nbsp;<strong style="color:#00cfff">${G.prices[DIA+f.name].toLocaleString()} G</strong></div>
        </div>`}
        <div style="background:rgba(255,255,255,.06);border:1px solid #444;border-radius:10px;padding:10px 14px;font-size:14px;line-height:1.6;color:#ddd;margin-bottom:12px">
            <strong style="color:#9be89b">능력</strong> : ${ability}
        </div>
`;

    openModal('modal-detail');
}

// ── 확장 상태 ─────────────────────────────────────────────────
const expanded = { inv:{}, mkt:{}, equip:{} };

// ── 인벤토리 ─────────────────────────────────────────────────
const RARITY_ORDER = ['희귀','영웅','전설','신화','불멸','비밀','리미티드','신성'];

function renderInv() {
    const list=$('inv-list');
    list.innerHTML='';

    const grid = document.createElement('div');
    grid.className = 'inv-grid';
    let firstSection = true;

    for (const rarityKey of RARITY_ORDER) {
        const rarity = RARITY[rarityKey];
        const fruits = BASE_FRUITS.filter(f => f.rarity === rarityKey);
        if (!fruits.length) continue;

        const header = document.createElement('div');
        header.style.cssText = `grid-column:1 / -1;display:flex;align-items:center;gap:6px;${firstSection ? 'margin-top:0;' : 'margin-top:10px;'}`;
        header.innerHTML = `
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${rarity.color};box-shadow:0 0 6px ${rarity.color};"></span>
            <span style="color:${rarity.color};font-size:13px;font-weight:900;letter-spacing:.4px;">${rarityKey}</span>`;
        grid.appendChild(header);
        firstSection = false;

        for (const f of fruits) {
            const baseCount = G.inventory[f.name] || 0;
            const goldCount = G.inventory[GOLD + f.name] || 0;
            const diaCount = G.inventory[DIA + f.name] || 0;
            const total = baseCount + goldCount + diaCount;
            const isOpen = !!expanded.inv[f.name];
            const plainEmoji = G.emoji[f.name] || f.name;

            const card = document.createElement('div');
            card.className = 'inv-card';
            card.innerHTML = `
                <div style="display:flex;align-items:stretch;gap:8px;min-height:100%;flex:1;">
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px;">
                        <button class="toggle-btn inv-more" data-name="${f.name}" style="width:100%">${isOpen ? '접기' : '더보기'}</button>
                        <button class="detail-btn" data-name="${f.name}" style="width:100%">자세히</button>
                    </div>
                    <div style="flex:1.25;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;gap:4px;min-width:0;">
                        <span style="font-size:40px;line-height:1">${emojiHtml(f.name)}</span>
                        <span style="font-size:13px;line-height:1.25;white-space:normal;word-break:keep-all;overflow-wrap:anywhere;">${f.name}</span>
                        <div style="color:#90ee90;font-size:11px;font-weight:bold">총 ${total.toLocaleString()}개</div>
                        <div style="color:#aaa;font-size:11px">기본 ${baseCount.toLocaleString()}개</div>
                        <div class="inv-extra" style="display:${isOpen ? 'block' : 'none'}">
                            <div style="color:#ffd700;font-size:11px">황금 ${goldCount.toLocaleString()}개</div>
                            <div style="color:#7fdcff;font-size:11px">다이아 ${diaCount.toLocaleString()}개</div>
                        </div>
                    </div>
                </div>
                `;

            card.querySelector('.inv-more').onclick = (e)=>{
                e.stopPropagation();
                expanded.inv[f.name] = !isOpen;
                renderInv();
            };
            card.querySelector('.detail-btn').onclick = (e)=>{ e.stopPropagation(); renderDetail(f.name); };
            grid.appendChild(card);
        }
    }

    list.appendChild(grid);
}

// ── 시장 ─────────────────────────────────────────────────────
function mktRow(name, color) {
    const d=document.createElement('div');
    d.style.cssText=`padding:9px 10px;margin-bottom:4px;border-radius:7px;background:#222;border-left:3px solid ${color}`;
    d.innerHTML=`
        <div style="color:#fff;font-size:12px;margin-bottom:5px">
            ${emojiHtml(name)}  ${name} &nbsp;
            시세: <span style="color:#ffd700">${G.prices[name].toLocaleString()}G</span> &nbsp;
            보유: <span style="color:#90ee90">${G.inventory[name]||0}개</span>
        </div>
        <div style="display:flex;gap:4px">
            <button class="btn ms1" data-f="${name}" style="flex:1;background:#cc4400;color:#fff;font-size:11px;padding:6px 0">1개 팔기</button>
            <button class="btn msa" data-f="${name}" style="flex:1;background:#8b0000;color:#fff;font-size:11px;padding:6px 0">전부 팔기</button>
        </div>`;
    return d;
}

function renderMkt() {
    $('mkt-gold').textContent = `💰 골드: ${G.gold.toLocaleString()}`;
    const content = $('mkt-content');
    content.innerHTML = '';

    for (const rarityKey of RARITY_ORDER) {
        const r = RARITY[rarityKey];
        const fruitsInRarity = BASE_FRUITS.filter(f=>f.rarity===rarityKey);
        const isOpen = expanded.mkt[rarityKey];

        const header = document.createElement('div');
        const isDivine_mkt  = r.cardClass === 'rarity-divine';
        const isLimited_mkt = r.cardClass === 'rarity-limited';
        header.style.cssText=`display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:4px;border-radius:8px;background:#222;cursor:pointer;border-left:3px solid ${r.color}`;
        if (isDivine_mkt)  header.classList.add('divine-left-border');
        if (isLimited_mkt) header.classList.add('limited-left-border');
        const mktBadgeCls = isDivine_mkt ? 'divine-text' : isLimited_mkt ? 'limited-text' : '';
        const mktBadgeSt  = (isDivine_mkt || isLimited_mkt) ? '' : ('color:'+r.color+';border:1px solid '+r.color+';');
        const mktBadgeHtml = mktBadgeCls
            ? `<span class="rarity-badge" style="background:${r.badgeBg};font-size:11px;padding:2px 8px;letter-spacing:0"><span class="${mktBadgeCls}">${r.label}</span></span>`
            : `<span class="rarity-badge" style="background:${r.badgeBg};${mktBadgeSt}font-size:11px;padding:2px 8px;letter-spacing:0">${r.label}</span>`;
        header.innerHTML=`
            ${mktBadgeHtml}
            <span style="flex:1;color:#fff;font-size:13px">${rarityKey} 등급 과일</span>
            <button class="toggle-btn" style="pointer-events:none">${isOpen?'접기':'펼치기'}</button>`;
        header.onclick = () => { expanded.mkt[rarityKey]=!isOpen; renderMkt(); };
        content.appendChild(header);

        if (!isOpen) continue;

        if (r.unreleased || fruitsInRarity.length===0) {
            const msg = document.createElement('div');
            msg.style.cssText='margin-left:12px;margin-bottom:8px;padding:14px;border-radius:6px;background:#1a1a1a;color:#555;text-align:center;font-size:13px';
            msg.textContent='🔒 미출시';
            content.appendChild(msg);
            continue;
        }

        // 리미티드: 판매 불가 안내만 표시
        if (isLimited_mkt) {
            const lMsg = document.createElement('div');
            lMsg.style.cssText='margin-left:12px;margin-bottom:8px;padding:14px;border-radius:6px;background:#1e0018;border:1px solid #660033;color:#ff69b4;text-align:center;font-size:13px';
            lMsg.innerHTML='🔒 판매 불가 · 거래만 가능<br><span style="color:#666;font-size:11px">시세 없음 · 경매 불가</span>';
            content.appendChild(lMsg);
            continue;
        }

        for (const f of fruitsInRarity) {
            if (NO_SELL_FRUITS.includes(f.name)) continue; // 판매 불가 과일은 시장에서 숨김
            const isSubOpen = expanded.mkt[f.name];
            const row = document.createElement('div');
            row.style.cssText='padding:9px 10px;margin-left:12px;margin-bottom:4px;border-radius:7px;background:#1a1a1a';
            row.innerHTML=`
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
                    <span style="flex:1;color:#fff;font-size:13px;display:flex;align-items:center;flex-wrap:wrap;gap:4px">
                        ${rarityDot(f.name)}${f.emoji}  ${f.name} &nbsp;
                        시세: <span style="color:#ffd700">${G.prices[f.name].toLocaleString()}G</span> &nbsp;
                        보유: <span style="color:#90ee90">${G.inventory[f.name]||0}개</span>
                    </span>
                    <button class="toggle-btn">${isSubOpen?'▲':'▼'}</button>
                </div>
                <div style="display:flex;gap:4px">
                    <button class="btn ms1" data-f="${f.name}" style="flex:1;background:#cc4400;color:#fff;font-size:11px;padding:6px 0">1개 팔기</button>
                    <button class="btn msa" data-f="${f.name}" style="flex:1;background:#8b0000;color:#fff;font-size:11px;padding:6px 0">전부 팔기</button>
                </div>`;
            row.querySelector('.toggle-btn').onclick=(e)=>{ e.stopPropagation(); expanded.mkt[f.name]=!isSubOpen; renderMkt(); };
            content.appendChild(row);

            if (isSubOpen) {
                const gRow = mktRow(GOLD+f.name,'#ffd700'); gRow.style.marginLeft='24px'; content.appendChild(gRow);
                const dRow = mktRow(DIA+f.name, '#00cfff'); dRow.style.marginLeft='24px'; content.appendChild(dRow);
            }
        }
    }

    content.querySelectorAll('.ms1').forEach(b=>b.onclick=()=>{G.sellOne(b.dataset.f);G.save();renderMkt();refreshMain();});
    content.querySelectorAll('.msa').forEach(b=>b.onclick=()=>{G.sellAll(b.dataset.f);G.save();renderMkt();refreshMain();});
}

// ── 장착 ─────────────────────────────────────────────────────
function equipOpt(fruit, borderColor='transparent', indent=false) {
    const f=fruit;
    const can = f===null || (G.inventory[f]||0)>0;
    const eq  = G.equippedFruit===f;
    const base = f ? G.base(f) : '';
    const tag  = G.isDia(f)?'(다이아)':G.isGold(f)?'(황금)':'';
    const fx = base==='딸기'?`드롭 확률 ×1.1 ${tag}`
             : base==='수박'?`다이아 과일 확률 ×1.5 ${tag}`
             : base==='키위'?`10% 확률 과일 2배 지급 ${tag}`
             : base==='포도'?`5% 확률 상위 등급 등장 ${tag}`
             : base==='귤'?`두리안 도둑 미등장 ${tag}`
             : base==='코코넛'?`클릭수 ×2 · 드롭 확률 ×2 ${tag}`
             : base==='레몬'?`50% 확률 과일 2배 지급 ${tag}`
             : base==='할머니가 숨겨둔 감'?`30% 확률 과일 2배 지급 · 드롭 확률 ×2.5 ${tag}`
             : base==='별혼과'?`드롭 확률 ×1.5 · 30% 상위 등급 등장 · 성공 시 10% 추가 상위 등급 ${tag}`
             : `효과 없음 ${tag}`;
    const d=document.createElement('div');
    d.style.cssText=`padding:9px 12px;margin-bottom:4px;border-radius:8px;
        ${indent?'margin-left:14px;':''}
        cursor:${can?'pointer':'default'};opacity:${can?1:.45};
        background:${eq?'#1a4a1a':'#222'};
        border-left:3px solid ${eq?'#0f0':borderColor};`;
    d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center">
        <span style="color:#fff;font-weight:bold;font-size:13px;display:flex;align-items:center">${f?rarityDot(f):''}${f?emojiHtml(f):'🧺'}  ${f||'없음'}</span>
        ${eq?'<span style="color:#0f0;font-size:13px">✔</span>':''}
    </div>
    <div style="color:${eq?'#90ee90':'#666'};font-size:11px;margin-top:2px">${f?fx:'효과 없음'} · 보유: ${f?(G.inventory[f]||0):'-'}개</div>`;
    if(can) d.onclick=()=>{G.equippedFruit=f;G.save();closeModal('modal-equip');updateEquip();};
    return d;
}

function renderEquip() {
    const list=$('equip-list'); list.innerHTML='';
    list.appendChild(equipOpt(null));

    for (const rarityKey of RARITY_ORDER) {
        const r = RARITY[rarityKey];
        const fruitsInRarity = BASE_FRUITS.filter(f=>f.rarity===rarityKey);
        const isOpen = expanded.equip[rarityKey];

        const header = document.createElement('div');
        const isDivine_eq  = r.cardClass === 'rarity-divine';
        const isLimited_eq = r.cardClass === 'rarity-limited';
        header.style.cssText=`display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:4px;border-radius:8px;background:#1a1a1a;cursor:pointer;border-left:3px solid ${r.color}`;
        if (isDivine_eq)  header.classList.add('divine-left-border');
        if (isLimited_eq) header.classList.add('limited-left-border');
        const eqBadgeCls = isDivine_eq ? 'divine-text' : isLimited_eq ? 'limited-text' : '';
        const eqBadgeSt  = (isDivine_eq || isLimited_eq) ? '' : ('color:'+r.color+';border:1px solid '+r.color+';');
        const eqBadgeHtml = eqBadgeCls
            ? `<span class="rarity-badge" style="background:${r.badgeBg};font-size:11px;padding:2px 8px;letter-spacing:0"><span class="${eqBadgeCls}">${r.label}</span></span>`
            : `<span class="rarity-badge" style="background:${r.badgeBg};${eqBadgeSt}font-size:11px;padding:2px 8px;letter-spacing:0">${r.label}</span>`;
        header.innerHTML=`
            ${eqBadgeHtml}
            <span style="flex:1;color:#fff;font-size:13px">${rarityKey} 등급 과일</span>
            <button class="toggle-btn" style="pointer-events:none">${isOpen?'접기':'펼치기'}</button>`;
        header.onclick = ()=>{ expanded.equip[rarityKey]=!isOpen; renderEquip(); };
        list.appendChild(header);

        if (!isOpen) continue;

        if (r.unreleased || fruitsInRarity.length===0) {
            const msg = document.createElement('div');
            msg.style.cssText='margin-left:12px;margin-bottom:8px;padding:12px;border-radius:6px;background:#111;color:#555;text-align:center;font-size:13px';
            msg.textContent='🔒 미출시';
            list.appendChild(msg);
            continue;
        }

        for (const f of fruitsInRarity) {
            const isSubOpen = expanded.equip[f.name];
            const wrap = document.createElement('div');
            wrap.style.cssText='display:flex;gap:6px;align-items:flex-start;margin-bottom:4px;margin-left:12px';
            const opt = equipOpt(f.name);
            opt.style.flex='1'; opt.style.marginBottom='0';
            const tog = document.createElement('button');
            tog.className='toggle-btn';
            tog.style.marginTop='9px';
            tog.textContent = isSubOpen?'▲':'▼';
            tog.onclick=()=>{ expanded.equip[f.name]=!isSubOpen; renderEquip(); };
            wrap.appendChild(opt); wrap.appendChild(tog);
            list.appendChild(wrap);

            if (isSubOpen) {
                list.appendChild(equipOpt(GOLD+f.name,'#ffd700',true));
                list.appendChild(equipOpt(DIA+f.name, '#00cfff',true));
            }
        }
    }
}

// ── 프로필 ────────────────────────────────────────────────────
function renderProfile() {
    const el=$('profile-content');
    el.innerHTML=`
        <p style="margin-bottom:5px">닉네임: <strong>${G.nickname}</strong></p>
        <p style="color:#ffd700;margin-bottom:8px">보유 골드: ${G.gold.toLocaleString()} G</p>
        ${G.equippedTitle?`<p style="margin-bottom:8px">칭호: <strong style="color:#ffd700">${TITLES[G.equippedTitle]?.icon} ${G.equippedTitle}</strong></p>`:''}`;
}

// ── 상점 ─────────────────────────────────────────────────────
const shopQty = {}; // 포션 구매/사용 수량 (상점 재렌더 사이 유지)
function renderShop() {
    $('shop-gold').textContent = `💰 보유 골드: ${G.gold.toLocaleString()} G`;
    const list = $('shop-list');
    list.innerHTML = '';

    const blueRemainSec = Math.max(0, Math.ceil((G.bluePotionUntil - Date.now()) / 1000));
    const blueRemainText = G.isBluePotionActive
        ? `활성 중 (${Math.floor(blueRemainSec / 60)}:${String(blueRemainSec % 60).padStart(2, '0')} 남음)`
        : '비활성';
    const blackRemainSec2 = Math.max(0, Math.ceil((G.blackPotionUntil - Date.now()) / 1000));
    const blackRemainText = G.isBlackPotionActive
        ? `활성 중 (${Math.floor(blackRemainSec2 / 60)}:${String(blackRemainSec2 % 60).padStart(2, '0')} 남음)`
        : '비활성';

    const items = [
        {
            id:'title-gabbu', icon:'👑', name:'갑부 칭호',
            desc:'영웅 등급 — 닉네임 아래에 보라빛 갑부 칭호 표시',
            price:TITLE_GABBU_PRICE,
            owned: G.ownedTitles.includes('갑부'),
            active: G.equippedTitle==='갑부',
            onBuy:  ()=>{ if(G.buyTitle('갑부',TITLE_GABBU_PRICE)){G.equippedTitle='갑부';G.save();renderShop();refreshMain();} },
            onUse:  ()=>{ G.equippedTitle='갑부'; G.save(); renderShop(); refreshMain(); },
            onOff:  ()=>{ G.equippedTitle=null; G.save(); renderShop(); refreshMain(); },
        },
        {
            id:'title-elon', icon:'🚀', name:'일론 머스크 칭호',
            desc:'불멸 등급 — 화성을 꿈꾸는 자만이 얻을 수 있는 칭호',
            price:TITLE_ELON_PRICE,
            owned: G.ownedTitles.includes('일론 머스크'),
            active: G.equippedTitle==='일론 머스크',
            onBuy:  ()=>{ if(G.buyTitle('일론 머스크',TITLE_ELON_PRICE)){G.equippedTitle='일론 머스크';G.save();renderShop();refreshMain();} },
            onUse:  ()=>{ G.equippedTitle='일론 머스크'; G.save(); renderShop(); refreshMain(); },
            onOff:  ()=>{ G.equippedTitle=null; G.save(); renderShop(); refreshMain(); },
        },
        {
            id:'blue-potion', icon:'🔵', name:'블루 포션',
            desc:`10분 동안 전설 등급 이상 확률 1.5배 · 단가 ${BLUE_POTION_PRICE.toLocaleString()}G (${blueRemainText})`,
            price:BLUE_POTION_PRICE,
            owned: G.bluePotionCount > 0,
            active: G.isBluePotionActive,
            qty: G.bluePotionCount,
            stackable: true,
            onBuy: (n)=>{ if (G.buyBluePotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onUse: (n)=>{ if (G.useBluePotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onOff: null,
        },
        {
            id:'red-potion', icon:'🔴', name:'레드 포션',
            desc:`다음 수확한 과일을 황금 버전으로 변환 · 단가 ${RED_POTION_PRICE.toLocaleString()}G (대기 ${G.redPotionPending||0}회)`,
            price:RED_POTION_PRICE,
            owned: G.redPotionCount > 0,
            active: (G.redPotionPending||0) > 0,
            qty: G.redPotionCount,
            stackable: true,
            onBuy: (n)=>{ if (G.buyRedPotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onUse: (n)=>{ if (G.useRedPotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onOff: null,
        },
        {
            id:'purple-potion', icon:'🟣', name:'퍼플 포션',
            desc:`20분 동안 두리안 도둑 차단 · 단가 ${PURPLE_POTION_PRICE.toLocaleString()}G`,
            price:PURPLE_POTION_PRICE,
            owned: G.purplePotionCount > 0,
            active: G.isPurplePotionActive,
            qty: G.purplePotionCount,
            stackable: true,
            onBuy: (n)=>{ if (G.buyPurplePotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onUse: (n)=>{ if (G.usePurplePotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onOff: null,
        },
        {
            id:'black-potion', icon:'🖤', name:'블랙 포션',
            desc:(()=>{ const today=new Date().toDateString(); const bought=(G.blackPotionLastBuyDate===today?G.blackPotionBoughtToday:0); return `10분 동안 자동 수확 (15클릭/초) · 과일 자동 인벤토리 수납 · 단가 ${BLACK_POTION_PRICE.toLocaleString()}G · 오늘 ${2-bought}회 구매 가능 (${blackRemainText})`; })(),
            price:BLACK_POTION_PRICE,
            owned: G.blackPotionCount > 0,
            active: G.isBlackPotionActive,
            qty: G.blackPotionCount,
            stackable: true,
            onBuy: (n)=>{ if (G.buyBlackPotion(n)) { G.save(); renderShop(); refreshMain(); } },
            onUse: (n)=>{ if (G.useBlackPotion(n)) { G.save(); startBlackPotionTimer(); renderShop(); refreshMain(); } },
            onOff: null,
        },
    ];

    for (const it of items) {
        const qty = it.stackable ? Math.max(1, shopQty[it.id]||1) : 1;
        const totalPrice = it.price * qty;
        const canBuy = it.stackable ? (G.gold >= totalPrice) : (!it.owned && G.gold >= it.price);
        const div = document.createElement('div');
        div.style.cssText='padding:14px;margin-bottom:10px;border-radius:10px;background:#1a1a1a;border:1px solid #333';
        div.innerHTML=`
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <span style="font-size:26px">${it.icon}</span>
                <div style="flex:1">
                    <div style="font-weight:bold;font-size:15px">${it.name}</div>
                    <div style="color:#777;font-size:12px">${it.desc}</div>
                </div>
                ${typeof it.qty === 'number'
                    ? `<span style="color:#0f0;font-size:12px">보유 ${it.qty}개</span>`
                    : it.owned
                        ? '<span style="color:#0f0;font-size:12px">✔ 보유</span>'
                        : `<span style="color:#ffd700;font-size:13px">${it.price.toLocaleString()}G</span>`}
            </div>
            <div style="display:flex;gap:8px">
                ${it.id.includes('potion')
                    ? `<button class="btn" id="shop-qm-${it.id}"
                           style="width:34px;background:#333;color:#fff;font-size:16px;padding:9px 0">−</button>
                       <span style="min-width:38px;text-align:center;font-size:13px;color:#fff;align-self:center">${qty}개</span>
                       <button class="btn" id="shop-qp-${it.id}"
                           style="width:34px;background:#333;color:#fff;font-size:16px;padding:9px 0">＋</button>
                       <button class="btn" id="shop-buy-${it.id}" ${canBuy?'':'disabled'}
                           style="flex:1;background:${canBuy?'#1a5c8a':'#333'};color:${canBuy?'#fff':'#555'};font-size:13px;padding:9px 0">
                           구매 (${totalPrice.toLocaleString()}G)</button>
                       <button class="btn" id="shop-use-${it.id}" ${(it.qty||0)>=qty?'':'disabled'}
                           style="flex:1;background:${(it.qty||0)>=qty?'#2a6a2a':'#333'};color:${(it.qty||0)>=qty?'#fff':'#555'};font-size:13px;padding:9px 0">
                           사용 ${qty}개</button>`
                    : !it.owned
                        ? `<button class="btn" id="shop-buy-${it.id}" ${canBuy?'':'disabled'}
                               style="flex:1;background:${canBuy?'#1a5c8a':'#333'};color:${canBuy?'#fff':'#555'};font-size:13px;padding:9px 0">
                               ${canBuy?`구매 (${it.price.toLocaleString()}G)`:`골드 부족`}</button>`
                        : it.active
                            ? `<button class="btn" id="shop-off-${it.id}"
                                   style="flex:1;background:#333;color:#aaa;font-size:13px;padding:9px 0">해제</button>`
                            : `<button class="btn" id="shop-use-${it.id}"
                                   style="flex:1;background:#2a6a2a;color:#fff;font-size:13px;padding:9px 0">장착</button>`
                }
            </div>`;
        list.appendChild(div);

        const buyBtn = document.getElementById(`shop-buy-${it.id}`);
        const useBtn = document.getElementById(`shop-use-${it.id}`);
        const offBtn = document.getElementById(`shop-off-${it.id}`);
        const qmBtn = document.getElementById(`shop-qm-${it.id}`);
        const qpBtn = document.getElementById(`shop-qp-${it.id}`);
        if (qmBtn) qmBtn.onclick = ()=>{ shopQty[it.id] = Math.max(1, (shopQty[it.id]||1) - 1); renderShop(); };
        if (qpBtn) qpBtn.onclick = ()=>{ shopQty[it.id] = (shopQty[it.id]||1) + 1; renderShop(); };
        if (buyBtn) buyBtn.onclick = ()=> it.onBuy(it.stackable ? Math.max(1, shopQty[it.id]||1) : 1);
        if (useBtn) useBtn.onclick = ()=> it.onUse(it.stackable ? Math.max(1, shopQty[it.id]||1) : 1);
        if (offBtn) offBtn.onclick = it.onOff;
    }
}

// ── 이벤트 ───────────────────────────────────────────────────
$('btn-start').onclick = () => G.nickname ? (show('scr-main'),refreshMain()) : show('scr-nick');

$('btn-nick-ok').onclick = async () => {
    const nick=$('inp-nick').value.trim();
    if(!nick){alert('닉네임을 입력해주세요.');return;}
    if(nick.length>16){alert('닉네임은 16자 이하로 입력해주세요.');return;}
    if(/<|>|&|"|'|`/.test(nick)){alert('닉네임에 사용할 수 없는 문자가 포함되어 있습니다.');return;}
    if(await isNicknameTaken(nick)){alert(`❌ '${nick}'은(는) 이미 사용 중인 닉네임입니다.\n다른 닉네임을 선택해주세요.`);return;}
    await registerNickname(nick);
    G.nickname=nick; G.save(); show('scr-main'); refreshMain();
};
$('inp-nick').addEventListener('keydown',e=>{ if(e.key==='Enter')$('btn-nick-ok').click(); });

$('action-btn').onclick = () => {
    if ($('drop-notif').classList.contains('show')) return;
    checkAutoClick();
    G.registerClick();

    // 두리안 도둑 0.5% 체크
    if (checkDurian()) return;

    const {fruit,count,upgraded}=G.tryGetFruit();
    if (fruit) { showDrop(fruit, count, upgraded); }
    G.save(); refreshMain();
};

// 프로필 버튼 비활성화
$('btn-profile-close').onclick = ()=>{ closeModal('modal-profile'); refreshMain(); };
$('btn-friends').onclick      = ()=>{ renderFriends(); openModal('modal-friends'); };
$('btn-friends-close').onclick= ()=>{ closeModal('modal-friends'); };
$('btn-trade-close').onclick  = ()=>{ closeModal('modal-trade'); };

$('btn-inv-open').onclick  = ()=>{
    expanded.inv={};
    renderInv();
    openModal('modal-inv');
    const invBox = document.querySelector('#modal-inv .modal-box');
    if (invBox) invBox.scrollTop = 0;
    const invList = $('inv-list');
    if (invList) invList.scrollTop = 0;
};
$('btn-inv-close').onclick = ()=>   closeModal('modal-inv');

$('btn-mkt-open').onclick  = ()=>{ expanded.mkt={}; renderMkt(); openModal('modal-mkt'); };
$('btn-mkt-close').onclick = ()=>{ closeModal('modal-mkt'); refreshMain(); };

$('btn-equip-open').onclick  = ()=>{ expanded.equip={}; renderEquip(); openModal('modal-equip'); };
$('btn-equip-close').onclick  = ()=> closeModal('modal-equip');
$('btn-detail-close').onclick = ()=> closeModal('modal-detail');
$('btn-shop-open').onclick    = ()=>{ renderShop(); openModal('modal-shop'); };

// ── 세이브 연동 ───────────────────────────────────────────────
function randCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length:8}, ()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}
$('btn-sync').onclick = ()=>{
    $('save-code-out').style.display='none';
    $('inp-save-code').value='';
    // 백업 데이터가 있으면 복구 버튼 표시
    const backupRaw = localStorage.getItem('fruitFarm4_backup');
    const backupTs  = localStorage.getItem('fruitFarm4_backup_ts');
    if (backupRaw) {
        try {
            const bk = JSON.parse(backupRaw);
            const elapsed = backupTs ? Math.round((Date.now() - Number(backupTs)) / 60000) : '?';
            $('sync-backup-info').textContent = `${bk.nickname} (골드 ${(bk.gold||0).toLocaleString()}G) — ${elapsed}분 전 백업`;
            $('sync-backup-box').style.display = 'block';
        } catch { $('sync-backup-box').style.display = 'none'; }
    } else {
        $('sync-backup-box').style.display = 'none';
    }
    openModal('modal-sync');
};
$('btn-sync-close').onclick = ()=> closeModal('modal-sync');
$('btn-restore-backup').onclick = ()=>{
    const backupRaw = localStorage.getItem('fruitFarm4_backup');
    if (!backupRaw) { toast('백업 데이터가 없습니다'); return; }
    try {
        const bk = JSON.parse(backupRaw);
        if (!confirm(`"${bk.nickname}" 계정으로 되돌릴까요?\n현재 데이터는 사라집니다.`)) return;
        localStorage.setItem('fruitFarm4', backupRaw);
        localStorage.removeItem('fruitFarm4_backup');
        localStorage.removeItem('fruitFarm4_backup_ts');
        location.reload();
    } catch { toast('복구 실패'); }
};

$('btn-gen-save-code').onclick = async ()=>{
    const btn = $('btn-gen-save-code');
    btn.textContent = '생성 중...'; btn.disabled = true;
    try {
        const code = randCode();
        const saveData = JSON.parse(localStorage.getItem('fruitFarm4') || 'null');
        if (!saveData) { toast('저장된 데이터가 없습니다'); return; }
        await fetch(`${FIREBASE_URL}/saves/${code}.json`, {
            method: 'PUT',
            body: JSON.stringify({ ...saveData, _savedAt: Date.now() })
        });
        $('save-code-text').textContent = code;
        $('save-code-out').style.display = 'block';
        $('save-code-text').onclick = ()=>{
            navigator.clipboard?.writeText(code).then(()=>toast('코드 복사됨!'));
        };
    } catch(e) { toast('생성 실패. 인터넷 연결 확인'); }
    btn.textContent = '🔑 내 코드 생성하기'; btn.disabled = false;
};

$('btn-load-save-code').onclick = async ()=>{
    const code = $('inp-save-code').value.trim().toUpperCase();
    if (code.length !== 8) { toast('8자리 코드를 입력하세요'); return; }
    const btn = $('btn-load-save-code');
    btn.textContent = '불러오는 중...'; btn.disabled = true;
    try {
        const res = await fbFetch(`${FIREBASE_URL}/saves/${code}.json`);
        if (!res.ok) throw new Error('fetch fail');
        const data = await res.json();
        if (!data || data === 'null') { toast('코드를 찾을 수 없습니다'); btn.textContent='📥 이 코드로 불러오기'; btn.disabled=false; return; }
        // 현재 내 계정 정보 표시
        const currentSave = JSON.parse(localStorage.getItem('fruitFarm4') || 'null');
        const currentInfo = currentSave ? `현재 내 계정: ${currentSave.nickname} (골드 ${(currentSave.gold||0).toLocaleString()}G)` : '현재 저장된 데이터 없음';
        const incomingGold = (data.gold || 0).toLocaleString();
        if (!confirm(`⚠️ 정말 데이터를 덮어씌울까요?\n\n${currentInfo}\n  ↓ 이 데이터가 지워집니다\n\n불러올 계정: ${data.nickname} (골드 ${incomingGold}G)\n\n※ 코드는 1회용이므로 로드 후 삭제됩니다`)) {
            btn.textContent='📥 이 코드로 불러오기'; btn.disabled=false; return;
        }
        // 덮어쓰기 전에 현재 데이터 백업
        if (currentSave) {
            localStorage.setItem('fruitFarm4_backup', JSON.stringify(currentSave));
            localStorage.setItem('fruitFarm4_backup_ts', String(Date.now()));
        }
        delete data._savedAt;
        localStorage.setItem('fruitFarm4', JSON.stringify(data));
        // 사용된 연동코드는 즉시 삭제 (1회용)
        try { await fetch(`${FIREBASE_URL}/saves/${code}.json`, { method: 'DELETE' }); } catch {}
        // 이 기기의 세션 ID를 불러온 닉네임의 소유자로 등록 (실패해도 진행)
        try { await registerNickname(data.nickname); } catch {}
        location.reload();
    } catch(e) { toast('불러오기 실패. 인터넷 연결 확인'); btn.textContent='📥 이 코드로 불러오기'; btn.disabled=false; }
};
$('inp-save-code').addEventListener('input', e=>{
    e.target.value = e.target.value.toUpperCase();
});
$('btn-shop-close').onclick   = ()=>{ closeModal('modal-shop'); refreshMain(); };

// 모달 외부 클릭 닫기
document.querySelectorAll('.modal').forEach(m=>{
    m.onclick=e=>{ if(e.target===m) m.classList.remove('open'); };
});

// ── 초기화 ────────────────────────────────────────────────────
async function startGame() {
    // 다른 기기에 의해 강제 로그아웃된 경우 → 닉네임 설정부터 새로 시작
    if (localStorage.getItem('fruitFarm4_kicked')) {
        localStorage.removeItem('fruitFarm4_kicked');
        show('scr-nick');
        setInterval(async ()=>{ if(G.checkDay()){G.save();refreshMain();resolveAuctions(await getAuctionDate(-1));runWeeklySettlement();} }, 30000);
        setInterval(()=>{ processMailbox(); updateFriendBadge(); }, 5000);
        setInterval(checkActiveSession, 20000);
        return;
    }
    G.load();
    // [MIGRATION] hjh → 관리자 닉네임 일괄 변경 (적용 후 삭제)
    if (G.nickname === 'hjh') { G.nickname = '관리자'; G.save(); }
    G.checkDay();
    if (!Object.keys(G.priceHistory).length) G.recordPrices();
    applyBg();
    if (G.nickname) {
        // 정지 여부 확인
        const banInfo = await checkBanned(G.nickname);
        if (banInfo) {
            $('ban-reason-display').textContent = `사유: ${banInfo.reason||'규칙 위반'}`;
            show('scr-banned'); return;
        }
        registerNickname(G.nickname);
        processMailbox();
        show('scr-main'); refreshMain(); updateFriendBadge();
        await showAdminButtons();
        if (G.isBlackPotionActive) startBlackPotionTimer();
        // 접속 시 즉시 랭킹 데이터 업로드 (기존 유저 포함)
        if (FB) FB.set(`ranking/${encN(G.nickname)}`, { nick: G.nickname, gold: G.gold, clicks: G.clickCount, ts: Date.now() });
        runWeeklySettlement();
    } else {
        show('scr-start');
    }
    setInterval(async ()=>{ if(G.checkDay()){G.save();refreshMain();resolveAuctions(await getAuctionDate(-1));runWeeklySettlement();} }, 30000);
    setInterval(()=>{ processMailbox(); updateFriendBadge(); }, 5000);
    setInterval(checkActiveSession, 20000); // 20초마다 세션 확인
    // 30초마다 정지 여부 재확인
    setInterval(async ()=>{
        if (!G.nickname) return;
        const b = await checkBanned(G.nickname);
        if (b) { $('ban-reason-display').textContent=`사유: ${b.reason||'규칙 위반'}`; show('scr-banned'); }
    }, 30000);
}

// ── 정지 시스템 ──────────────────────────────────────────────
async function checkBanned(nick) {
    if (!FB || !nick) return null;
    const data = await FB.get(`ban/${encN(nick)}`);
    if (!data || typeof data !== 'object') return null;
    return data; // { reason, ts }
}

async function banUser(nick, reason) {
    if (!FB) return alert('Firebase 연결 필요');
    await FB.set(`ban/${encN(nick)}`, { reason: reason||'규칙 위반', ts: Date.now() });
    // 강제 로그아웃용 세션 무효화
    await FB.del(`session/${encN(nick)}`);
    alert(`'${nick}' 정지 완료`);
    renderBanList();
}

async function unbanUser(nick) {
    if (!FB) return alert('Firebase 연결 필요');
    await FB.del(`ban/${encN(nick)}`);
    alert(`'${nick}' 정지 해제 완료`);
    renderBanList();
}

async function renderBanList() {
    const list = $('ban-list');
    if (!list) return;
    list.innerHTML = '<div style="color:#666;font-size:13px">불러오는 중...</div>';
    const data = FB ? await FB.get('ban') : null;
    if (!data || Object.keys(data).length === 0) {
        list.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:12px">정지된 유저 없음</div>';
        return;
    }
    list.innerHTML = '';
    for (const [key, val] of Object.entries(data)) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#2a0000;border:1px solid #cc0000;border-radius:8px;padding:8px 10px';
        const date = new Date(val.ts).toLocaleDateString('ko-KR');
        row.innerHTML = `
            <div style="flex:1;min-width:0">
                <div style="color:#ff6666;font-weight:bold;font-size:13px">${esc(key)}</div>
                <div style="color:#aaa;font-size:11px">${esc(val.reason||'')} · ${date}</div>
            </div>
            <button class="btn" data-nick="${esc(key)}" style="background:#226622;color:#fff;font-size:11px;padding:4px 10px;border-radius:6px">해제</button>`;
        row.querySelector('button').onclick = () => unbanUser(key);
        list.appendChild(row);
    }
}

$('btn-ban-close').onclick = () => closeModal('modal-ban');
$('btn-ban-do').onclick = async () => {
    const nick = $('ban-nick-input').value.trim();
    const reason = $('ban-reason-input').value.trim();
    if (!nick) return alert('닉네임을 입력하세요');
    if (nick === '관리자') return alert('관리자는 정지할 수 없습니다');
    await banUser(nick, reason);
    $('ban-nick-input').value = '';
    $('ban-reason-input').value = '';
};
$('btn-ban-undo').onclick = async () => {
    const nick = $('ban-nick-input').value.trim();
    if (!nick) return alert('닉네임을 입력하세요');
    await unbanUser(nick);
    $('ban-nick-input').value = '';
};

// ── 블랙 포션 오토클릭 타이머 ─────────────────────────────────
let _blackPotionTimer = null;
let _blackPotionLoot = {}; // 세션 동안 수확한 과일 누적

function startBlackPotionTimer() {
    if (_blackPotionTimer) return; // 이미 실행 중
    _blackPotionLoot = {};
    _blackPotionTimer = setInterval(() => {
        if (!G.isBlackPotionActive) {
            clearInterval(_blackPotionTimer);
            _blackPotionTimer = null;
            refreshMain();
            showBlackPotionResult();
            return;
        }
        G.registerClick();
        const { fruit, count, upgraded } = G.tryGetFruit();
        if (fruit) {
            G.addFruit(fruit, count);
            _blackPotionLoot[fruit] = (_blackPotionLoot[fruit] || 0) + count;
        }
        G.save();
        refreshMain();
    }, 67); // 1000ms / 15 ≈ 67ms
}

function showBlackPotionResult() {
    const list = $('black-result-list');
    const total = $('black-result-total');
    list.innerHTML = '';
    const entries = Object.entries(_blackPotionLoot);
    if (entries.length === 0) {
        list.innerHTML = '<div style="color:#555;text-align:center;padding:16px;font-size:13px">수확된 과일이 없습니다</div>';
        total.textContent = '';
    } else {
        let totalGold = 0;
        for (const [fruit, count] of entries.sort((a,b) => (G.prices[b[0]]||0)*b[1] - (G.prices[a[0]]||0)*a[1])) {
            const price = G.prices[fruit] || 0;
            const value = price * count;
            totalGold += value;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 12px';
            row.innerHTML = `
                <span style="font-size:14px">${G.emoji[fruit]||''} ${fruit}</span>
                <span style="color:#aaa;font-size:13px">×${count.toLocaleString()}</span>
                <span style="color:#ffd700;font-size:13px">${value.toLocaleString()}G</span>`;
            list.appendChild(row);
        }
        total.textContent = `총 가치: ${totalGold.toLocaleString()} G`;
    }
    openModal('modal-black-result');
}

// ── 오토클릭 감지 ─────────────────────────────────────────────
// 1초 슬라이딩 윈도우 안에 30회 초과 시 오토클릭으로 판정
const _acClickTimes = [];
let _acLastReportTs = 0;

async function checkAutoClick() {
    const now = Date.now();
    _acClickTimes.push(now);
    while (_acClickTimes.length && _acClickTimes[0] < now - 1000) _acClickTimes.shift();

    // 30클릭 초과 시 5초마다 실제 CPS로 업데이트
    if (_acClickTimes.length > 30 && now - _acLastReportTs > 5000) {
        _acLastReportTs = now;
        if (G.nickname && FB) {
            try {
                await FB.set(`autoclickers/${encN(G.nickname)}`, {
                    nick: G.nickname,
                    ts: now,
                    cps: _acClickTimes.length
                });
            } catch {}
        }
    }
}

// ── 관리자: 오토클릭 감지 목록 ───────────────────────────────
async function renderAutoClickerList() {
    const list = $('autoclicker-list');
    if (!list) return;
    list.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:16px">불러오는 중...</div>';
    const data = FB ? await FB.get('autoclickers') : null;
    if (!data || Object.keys(data).length === 0) {
        list.innerHTML = '<div style="color:#444;font-size:13px;text-align:center;padding:16px">감지된 오토클릭 유저 없음</div>';
        return;
    }
    list.innerHTML = '';
    const entries = Object.entries(data).sort((a, b) => b[1].ts - a[1].ts);
    for (const [key, val] of entries) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:6px;background:#001a2a;border:1px solid #0077bb;border-radius:8px;padding:8px 10px';
        const date = new Date(val.ts).toLocaleString('ko-KR');
        const cpsText = val.cps ? `${val.cps}클릭/초` : '?클릭/초';
        const nick = val.nick || key;
        row.innerHTML = `
            <div style="flex:1;min-width:0">
                <div style="color:#fff;font-weight:bold;font-size:16px;margin-bottom:2px">${esc(nick)}</div>
                <div style="color:#00aaff;font-size:11px;margin-bottom:1px">⚡ ${esc(cpsText)} 감지</div>
                <div style="color:#555;font-size:11px">📅 ${date}</div>
            </div>
            <button class="btn" data-nick="${esc(nick)}" data-key="${esc(key)}" style="background:#550000;color:#ff4444;font-size:12px;padding:6px 10px;border-radius:6px;border:1px solid #cc0000">🚫 정지</button>
            <button class="btn" data-key="${esc(key)}" style="background:#1a1a1a;color:#666;font-size:12px;padding:6px 10px;border-radius:6px;border:1px solid #333">✕</button>`;
        const [banBtn, delBtn] = row.querySelectorAll('button');
        banBtn.onclick = async () => {
            const nick = banBtn.dataset.nick;
            const reason = prompt(`'${nick}' 정지 사유를 입력하세요:`, '오토클릭 사용');
            if (reason === null) return;
            await banUser(nick, reason || '오토클릭 사용');
            await FB.del(`autoclickers/${banBtn.dataset.key}`);
            renderAutoClickerList();
        };
        delBtn.onclick = async () => {
            await FB.del(`autoclickers/${delBtn.dataset.key}`);
            renderAutoClickerList();
        };
        list.appendChild(row);
    }
}

let _acPollTimer = null;
$('btn-admin-menu-open').onclick = () => openModal('modal-admin-menu');
$('btn-admin-menu-close').onclick = () => closeModal('modal-admin-menu');
$('btn-menu-autoclicker').onclick = () => {
    closeModal('modal-admin-menu');
    renderAutoClickerList();
    openModal('modal-autoclicker');
    _acPollTimer = setInterval(renderAutoClickerList, 5000);
};
$('btn-menu-ban').onclick = () => {
    closeModal('modal-admin-menu');
    renderBanList();
    openModal('modal-ban');
};
$('btn-menu-grant').onclick = () => {
    closeModal('modal-admin-menu');
    renderAdminGrantList();
    openModal('modal-admin-grant');
};
$('btn-black-result-close').onclick = () => closeModal('modal-black-result');
$('btn-autoclicker-close').onclick = () => {
    closeModal('modal-autoclicker');
    clearInterval(_acPollTimer);
    _acPollTimer = null;
};
$('btn-autoclicker-refresh').onclick = () => renderAutoClickerList();
$('btn-autoclicker-clear').onclick = async () => {
    if (!confirm('오토클릭 전체 기록을 삭제할까요?')) return;
    await FB.del('autoclickers');
    renderAutoClickerList();
};

// ── 관리자 권한 시스템 ────────────────────────────────────────
async function hasAdminRole(nick) {
    if (!FB || !nick) return false;
    if (nick === '관리자') return true;
    const data = await FB.get(`admins/${encN(nick)}`);
    return !!data;
}

async function showAdminButtons() {
    const admin = await hasAdminRole(G.nickname);
    if (admin) {
        $('btn-admin-menu-open').style.display = '';
    }
    if (G.nickname === '관리자') {
        $('btn-menu-grant').style.display = '';
    }
}

async function renderAdminGrantList() {
    const list = $('admin-grant-list');
    if (!list) return;
    list.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:10px">불러오는 중...</div>';
    const data = FB ? await FB.get('admins') : null;
    if (!data || Object.keys(data).length === 0) {
        list.innerHTML = '<div style="color:#444;font-size:13px;text-align:center;padding:10px">부여된 권한 없음</div>';
        return;
    }
    list.innerHTML = '';
    for (const [key, val] of Object.entries(data)) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#1a1200;border:1px solid #665500;border-radius:8px;padding:8px 10px';
        const date = new Date(val.grantedAt).toLocaleDateString('ko-KR');
        row.innerHTML = `
            <div style="flex:1;min-width:0">
                <div style="color:#ffd700;font-weight:bold;font-size:14px">👑 ${esc(val.nick || key)}</div>
                <div style="color:#666;font-size:11px">부여일: ${date}</div>
            </div>
            <button class="btn" data-key="${esc(key)}" style="background:#2a0000;color:#ff6666;font-size:11px;padding:4px 10px;border-radius:6px;border:1px solid #660000">해제</button>`;
        row.querySelector('button').onclick = async (e) => {
            await FB.del(`admins/${e.currentTarget.dataset.key}`);
            renderAdminGrantList();
        };
        list.appendChild(row);
    }
}

$('btn-admin-grant-close').onclick = () => closeModal('modal-admin-grant');
$('btn-grant-do').onclick = async () => {
    const nick = $('grant-nick-input').value.trim();
    if (!nick) return alert('닉네임을 입력하세요');
    if (nick === '관리자') return alert('관리자는 이미 최고 권한을 가집니다');
    await FB.set(`admins/${encN(nick)}`, { nick, grantedAt: Date.now(), grantedBy: G.nickname });
    $('grant-nick-input').value = '';
    alert(`'${nick}' 에게 관리자 권한을 부여했습니다`);
    renderAdminGrantList();
};
$('btn-revoke-do').onclick = async () => {
    const nick = $('grant-nick-input').value.trim();
    if (!nick) return alert('닉네임을 입력하세요');
    await FB.del(`admins/${encN(nick)}`);
    $('grant-nick-input').value = '';
    alert(`'${nick}' 의 관리자 권한을 해제했습니다`);
    renderAdminGrantList();
};

// ── 주간 랭킹 보너스 ──────────────────────────────────────────
// 서버 타임스탬프를 Firebase에서 직접 가져옴 (기기 시계 변조 방지)
async function getServerTime() {
    if (!FB) return Date.now();
    try {
        const res = await fbFetch(`${FIREBASE_URL}/ff/serverTime.json`, {
            method: 'PUT',
            body: JSON.stringify({ '.sv': 'timestamp' })
        });
        const ts = await res.json();
        return typeof ts === 'number' ? ts : Date.now();
    } catch { return Date.now(); }
}

function weekKeyFromTs(ts) {
    return 'W' + Math.floor(ts / (7 * 24 * 3600 * 1000));
}

const WEEKLY_RANK_BONUSES = [0.3, 0.2, 0.1]; // 1위,2위,3위 보너스 (추가 배율)

async function runWeeklySettlement() {
    if (!FB || !G.nickname) return;

    // 서버 시각 기준 주차 계산 (기기 날짜 변조 무력화)
    const serverTs   = await getServerTime();
    const currentWeek = weekKeyFromTs(serverTs);

    // 이미 이번 주 보너스를 갖고 있으면 스킵
    if (G.weeklyBonusWeek === currentWeek) return;

    // Firebase에서 이번 주 정산 여부 확인
    const settled = await FB.get('weeklySettle');
    if (settled?.week !== currentWeek) {
        // 정산 실행 (먼저 접속한 사람이 수행)
        await FB.set('weeklySettle', { week: currentWeek, settledAt: serverTs, by: G.nickname });

        const rankData = await FB.get('ranking');
        if (rankData) {
            const entries = Object.values(rankData).filter(d => d.nick && d.nick !== '관리자');
            const goldTop3  = [...entries].sort((a,b) => b.gold   - a.gold  ).slice(0,3);
            const clickTop3 = [...entries].filter(d => (d.clicks||0) > 0)
                                          .sort((a,b) => b.clicks - a.clicks).slice(0,3);

            const bonusMap = {};
            const add = (nick, key, val, rank) => {
                if (!bonusMap[nick]) bonusMap[nick] = { goldBonus:0, clickBonus:0, goldRank:null, clickRank:null };
                bonusMap[nick][key]  = val;
                bonusMap[nick][key.replace('Bonus','Rank')] = rank;
            };
            goldTop3.forEach( (e,i) => add(e.nick, 'goldBonus',  WEEKLY_RANK_BONUSES[i], i+1));
            clickTop3.forEach((e,i) => add(e.nick, 'clickBonus', WEEKLY_RANK_BONUSES[i], i+1));

            for (const [nick, b] of Object.entries(bonusMap)) {
                await FB.set(`weeklyBonus/${encN(nick)}`, {
                    multiplier: 1 + b.goldBonus + b.clickBonus,
                    goldBonus: b.goldBonus, goldRank: b.goldRank,
                    clickBonus: b.clickBonus, clickRank: b.clickRank,
                    week: currentWeek, grantedAt: serverTs
                });
            }
        }
    }

    // 내 보너스 불러오기
    const myBonus = await FB.get(`weeklyBonus/${encN(G.nickname)}`);
    if (myBonus && myBonus.week === currentWeek) {
        G.weeklyDropBonus   = myBonus.multiplier || 1;
        G.weeklyBonusDetail = myBonus;
    } else {
        G.weeklyDropBonus   = 1;
        G.weeklyBonusDetail = null;
    }
    G.weeklyBonusWeek = currentWeek;
    G.save(); refreshMain();

    if (G.weeklyDropBonus > 1) {
        const d = G.weeklyBonusDetail;
        const lines = [];
        if (d.goldRank)  lines.push(`💰 골드 ${d.goldRank}위 (+${Math.round(d.goldBonus*100)}%)`);
        if (d.clickRank) lines.push(`👆 클릭 ${d.clickRank}위 (+${Math.round(d.clickBonus*100)}%)`);
        toast(`🏆 주간 랭킹 보너스! 드롭률 ${G.weeklyDropBonus.toFixed(1)}배\n${lines.join(' / ')}`);
    }
}

// ── 경매장 ────────────────────────────────────────────────────
const AUCTION_ELIGIBLE = [];
for (const f of BASE_FRUITS) {
    if (['영웅','전설','신화','불멸'].includes(f.rarity) && f.price > 0) {
        AUCTION_ELIGIBLE.push(f.name);
        AUCTION_ELIGIBLE.push(GOLD + f.name);
        AUCTION_ELIGIBLE.push(DIA  + f.name);
    }
}

async function getAuctionDate(offsetDays = 0) {
    const ts = await getServerTime();
    const d = new Date(ts);
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDailyAuctionItems(dateStr) {
    const dateSeed = dateStr.split('-').reduce((a, n, i) => (a + Number(n) * (i+1) * 31) | 0, 7);
    const pool = [...AUCTION_ELIGIBLE];
    let s = (dateSeed >>> 0);
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return [pool[s % pool.length]];
}

async function resolveAuctions(dateStr) {
    if (!FB || !G.nickname) return;
    const data = await FB.get(`auction/${dateStr}`);
    if (!data) return;
    for (const [slot, item] of Object.entries(data)) {
        if (!item || item.resolved) continue;
        if (item.topBidder === G.nickname) {
            await FB.set(`auction/${dateStr}/${slot}/resolved`, true);
            G.addFruit(item.fruit, 1);
            toast(`🎉 경매 낙찰! ${G.emoji[item.fruit]||''}${item.fruit} 획득! (${(item.topBid||0).toLocaleString()}G)`);
            G.save(); refreshMain();
        }
    }
}

async function placeBid(dateStr, slot, fruitName, inputAmount) {
    if (!FB) { toast('Firebase 연결이 필요합니다'); return false; }
    const amount = Math.floor(Number(inputAmount));
    if (!amount || amount <= 0) { toast('올바른 금액을 입력하세요'); return false; }

    const current = await FB.get(`auction/${dateStr}/${slot}`);
    if (current?.resolved) { toast('이미 종료된 경매입니다'); return false; }

    const rawName   = fruitName.startsWith(DIA) ? fruitName.slice(DIA.length) : fruitName.startsWith(GOLD) ? fruitName.slice(GOLD.length) : fruitName;
    const baseFruit = BASE_FRUITS.find(f => f.name === rawName);
    const fixedBase = baseFruit ? baseFruit.price : 1;
    const basePrice = fruitName.startsWith(DIA) ? fixedBase * 25 : fruitName.startsWith(GOLD) ? fixedBase * 10 : fixedBase;
    const minBid = current?.topBid > 0 ? current.topBid + 1 : basePrice;

    if (amount < minBid) { toast(`최소 ${minBid.toLocaleString()}G 이상이어야 합니다`); return false; }
    if (G.gold < amount) { toast('골드가 부족합니다'); return false; }

    // 기존 내 입찰이 있으면 환불
    if (current?.topBidder === G.nickname && current.topBid > 0) {
        G.gold += current.topBid;
    }
    // 다른 사람이 최고입찰자였으면 환불 메시지
    else if (current?.topBidder && current.topBid > 0) {
        pushMsg(current.topBidder, { type:'auction_refund', amount: current.topBid, fruit: fruitName });
    }

    G.gold -= amount;
    await FB.set(`auction/${dateStr}/${slot}`, {
        fruit: fruitName,
        startPrice: basePrice,
        topBid: amount,
        topBidder: G.nickname,
        topBidTs: Date.now(),
        resolved: false
    });
    G.save();
    return true;
}

async function renderAuction() {
    $('auction-gold-lbl').textContent = `💰 ${G.gold.toLocaleString()} G`;
    const el = $('auction-content');
    el.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:24px">불러오는 중...</div>';

    // 어제 낙찰 확인
    await resolveAuctions(await getAuctionDate(-1));

    const today = await getAuctionDate(0);
    const items = getDailyAuctionItems(today);
    const slotData = await Promise.all(items.map((_, i) => FB ? FB.get(`auction/${today}/${i}`) : null));

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = midnight - now;
    const hh = Math.floor(ms / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);

    let html = `<div style="color:#555;font-size:11px;text-align:right;margin-bottom:10px">⏰ 마감까지 ${hh}시간 ${mm}분</div>`;

    for (let i = 0; i < items.length; i++) {
        const fruit   = items[i];
        const slot    = slotData[i];
        const emoji   = G.emoji[fruit] || '❓';
        const baseName = fruit.startsWith(DIA) ? fruit.slice(DIA.length)
                       : fruit.startsWith(GOLD) ? fruit.slice(GOLD.length) : fruit;
        const rarInfo  = getFruitRarity(baseName);
        const color    = rarInfo?.color || '#eee';
        const rawName2  = fruit.startsWith(DIA) ? fruit.slice(DIA.length) : fruit.startsWith(GOLD) ? fruit.slice(GOLD.length) : fruit;
        const baseFruit2= BASE_FRUITS.find(f => f.name === rawName2);
        const fp        = baseFruit2 ? baseFruit2.price : 0;
        const startPr   = fruit.startsWith(DIA) ? fp*25 : fruit.startsWith(GOLD) ? fp*10 : fp;
        const topBid   = slot?.topBid    || 0;
        const topBidder= slot?.topBidder || null;
        const resolved = slot?.resolved  || false;
        const isMe     = topBidder === G.nickname;
        const minNext  = topBid > 0 ? topBid + 1 : startPr;

        const badgeHtml = fruit.startsWith(DIA)  ? `<span style="font-size:10px;color:#7be8ff;margin-left:4px">다이아</span>`
                        : fruit.startsWith(GOLD) ? `<span style="font-size:10px;color:#ffd700;margin-left:4px">황금</span>` : '';

        html += `<div style="background:#111;border:1px solid ${isMe?'#5599ff':'#333'};border-radius:12px;padding:14px;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                <span style="font-size:34px;line-height:1">${emoji}</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:14px;font-weight:bold;color:${color}">${fruit}${badgeHtml}</div>
                    <div style="font-size:11px;color:#444">시작가 ${startPr.toLocaleString()}G</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                    <div style="font-size:11px;color:#888">현재 최고 입찰</div>
                    <div style="font-size:15px;font-weight:bold;color:${topBid>0?'#ffd700':'#444'}">
                        ${topBid > 0 ? topBid.toLocaleString()+'G' : '입찰 없음'}
                    </div>
                    ${topBidder ? `<div style="font-size:11px;color:${isMe?'#0f0':'#777'}">${isMe?'👑 내가 최고':'👤 '+esc(topBidder)}</div>` : ''}
                </div>
            </div>
            ${resolved
                ? `<div style="text-align:center;color:#444;font-size:12px;padding:6px 0;border-top:1px solid #222">경매 종료</div>`
                : `<div style="display:flex;gap:8px;margin-top:4px">
                    <input type="number" class="auc-input" data-slot="${i}" data-fruit="${fruit}" data-min="${minNext}"
                        placeholder="최소 ${minNext.toLocaleString()}G"
                        style="flex:1;padding:9px 10px;background:#1a1a1a;color:#fff;border:1px solid #444;border-radius:8px;font-size:13px;font-family:inherit;min-width:0">
                    <button class="btn auc-bid-btn" data-slot="${i}" data-date="${today}"
                        style="background:#1a2a3a;color:#7af;font-size:13px;padding:9px 16px;border:1px solid #5599ff;border-radius:8px;white-space:nowrap">
                        입찰
                    </button>
                   </div>`
            }
        </div>`;
    }

    el.innerHTML = html;

    el.querySelectorAll('.auc-bid-btn').forEach(btn => {
        btn.onclick = async () => {
            const slotIdx = Number(btn.dataset.slot);
            const date    = btn.dataset.date;
            const input   = el.querySelector(`.auc-input[data-slot="${slotIdx}"]`);
            btn.disabled  = true; btn.textContent = '처리 중...';
            const ok = await placeBid(date, slotIdx, input.dataset.fruit, input.value);
            if (ok) renderAuction();
            else { btn.disabled = false; btn.textContent = '입찰'; }
        };
    });
}

// ── 랭킹 ─────────────────────────────────────────────────────
const RANK_MEDALS = ['🥇','🥈','🥉'];
let rankMode = 'gold'; // 'gold' | 'clicks'
let rankCache = null;

async function renderRanking(mode) {
    if (mode) rankMode = mode;
    // 탭 버튼 스타일 갱신
    $('rank-tab-gold').style.cssText   = `flex:1;font-size:13px;padding:8px 0;border-radius:8px;cursor:pointer;font-weight:bold;` +
        (rankMode==='gold'   ? 'background:#3a2a00;color:#ffd700;border:1px solid #ffd700'
                              : 'background:#111;color:#888;border:1px solid #444');
    $('rank-tab-clicks').style.cssText = `flex:1;font-size:13px;padding:8px 0;border-radius:8px;cursor:pointer;font-weight:bold;` +
        (rankMode==='clicks' ? 'background:#001a33;color:#7af;border:1px solid #5599ff'
                              : 'background:#111;color:#888;border:1px solid #444');

    const list = $('ranking-list');
    if (!rankCache) {
        list.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:20px">불러오는 중...</div>';
        rankCache = FB ? await FB.get('ranking') : null;
    }
    if (!rankCache || Object.keys(rankCache).length === 0) {
        list.innerHTML = '<div style="color:#444;font-size:13px;text-align:center;padding:20px">랭킹 데이터 없음</div>';
        return;
    }

    const isGold = rankMode === 'gold';
    const allSorted = Object.values(rankCache)
        .filter(d => d.nick && d.nick !== '관리자' && typeof d.gold === 'number')
        .sort((a, b) => isGold ? b.gold - a.gold : (b.clicks||0) - (a.clicks||0));

    const top30 = allSorted.slice(0, 30);
    const myRank = allSorted.findIndex(d => d.nick === G.nickname) + 1; // 0이면 없음
    const myEntry = allSorted.find(d => d.nick === G.nickname);
    const inTop30 = myRank >= 1 && myRank <= 30;

    const makeRow = (entry, rank, isMe) => {
        const medal = RANK_MEDALS[rank - 1] || `${rank}`;
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;
            background:${isMe ? (isGold?'#1a2a1a':'#001020') : '#141414'};
            border:1px solid ${isMe ? (isGold?'#00cc00':'#5599ff') : rank<=3 ? '#554400' : '#222'}`;
        const value = isGold
            ? `<div style="font-size:12px;color:#ffd700">💰 ${entry.gold.toLocaleString()} G</div>`
            : `<div style="font-size:12px;color:#7af">👆 ${(entry.clicks||0).toLocaleString()} 회</div>`;
        row.innerHTML = `
            <div style="font-size:${rank<=3?'22px':'15px'};min-width:32px;text-align:center;font-weight:bold;color:${rank<=3?'#ffd700':'#555'}">${medal}</div>
            <div style="flex:1;min-width:0">
                <div style="font-size:14px;font-weight:bold;color:${isMe?(isGold?'#00cc00':'#5599ff'):'#eee'}">${esc(entry.nick)}${isMe?' 👈 나':''}</div>
                ${value}
            </div>`;
        return row;
    };

    list.innerHTML = '';

    // 내 순위 카드를 맨 위에 고정
    if (myEntry) {
        list.appendChild(makeRow(myEntry, myRank, true));
        const sep = document.createElement('div');
        sep.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0';
        sep.innerHTML = '<div style="flex:1;border-top:1px solid #2a2a2a"></div><div style="color:#444;font-size:11px;white-space:nowrap">TOP 30</div><div style="flex:1;border-top:1px solid #2a2a2a"></div>';
        list.appendChild(sep);
    } else {
        const noMe = document.createElement('div');
        noMe.style.cssText = 'text-align:center;color:#444;font-size:12px;padding:8px;margin-bottom:8px;border:1px dashed #333;border-radius:8px';
        noMe.textContent = '내 데이터가 없습니다 (접속 시 자동 등록)';
        list.appendChild(noMe);
    }

    top30.forEach((entry, i) => list.appendChild(makeRow(entry, i + 1, entry.nick === G.nickname)));
}

async function showRankInventory(nick) {
    $('rank-inv-title').textContent = `🎒 ${nick}의 인벤토리`;
    const invEl = $('rank-inv-list');
    invEl.innerHTML = '<div style="color:#555;font-size:13px;text-align:center;padding:20px">불러오는 중...</div>';
    openModal('modal-rank-inv');
    const inv = FB ? await FB.get(`inv/${encN(nick)}`) : null;
    if (!inv) { invEl.innerHTML = '<div style="color:#444;font-size:13px;text-align:center;padding:20px">인벤토리 정보 없음</div>'; return; }
    const entries = Object.entries(inv).filter(([,c]) => c > 0).sort((a,b) => (G.prices[b[0]]||0)*b[1] - (G.prices[a[0]]||0)*a[1]);
    if (entries.length === 0) { invEl.innerHTML = '<div style="color:#444;font-size:13px;text-align:center;padding:20px">인벤토리가 비어있습니다</div>'; return; }
    invEl.innerHTML = '';
    for (const [fruit, count] of entries) {
        const price = G.prices[fruit] || 0;
        const rarityInfo = getFruitRarity(G.base(fruit));
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;background:#141414;border:1px solid #222;border-radius:8px;margin-bottom:6px';
        row.innerHTML = `
            <span style="font-size:22px">${G.emoji[fruit]||'❓'}</span>
            <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:bold;color:${rarityInfo?.color||'#eee'}">${fruit}</div>
                <div style="font-size:11px;color:#777">개당 ${price.toLocaleString()}G</div>
            </div>
            <div style="text-align:right">
                <div style="color:#fff;font-size:13px;font-weight:bold">×${count.toLocaleString()}</div>
                <div style="color:#ffd700;font-size:11px">${(price*count).toLocaleString()}G</div>
            </div>`;
        invEl.appendChild(row);
    }
}

$('btn-auction-open').onclick  = () => { renderAuction(); openModal('modal-auction'); };
$('btn-auction-close').onclick = () => closeModal('modal-auction');

// ── 이벤트 시스템 ─────────────────────────────────────────────
function renderEventList() {
    const el = $('event-list');
    if (!el) return;
    const progress = Math.min(G.gourdClickCount, GOURD_TARGET);
    const claimed  = G.gourdRewardClaimed;
    el.innerHTML = `
        <div style="background:#1a1a1a;border:1px solid ${claimed?'#444':'#550033'};border-radius:10px;padding:14px;cursor:${claimed?'default':'pointer'}"
             id="ev-1month">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <div style="flex:1">
                    <div style="font-size:15px;font-weight:bold;color:#fff">🎂 1달 기념 이벤트</div>
                    <div style="font-size:12px;color:#aaa;margin-top:2px">박을 10,000번 두드려 축복의 복숭아를 획득하세요!</div>
                </div>
                <span style="font-size:11px;padding:3px 8px;border-radius:10px;background:${claimed?'#1a4a1a':'#2a0018'};color:${claimed?'#0f0':'#ff69b4'};border:1px solid ${claimed?'#0f0':'#cc0066'};white-space:nowrap">
                    ${claimed ? '✔ 완료' : '진행 중'}
                </span>
            </div>
            <div style="background:#333;border-radius:6px;height:8px;overflow:hidden">
                <div style="height:100%;background:linear-gradient(90deg,#ff8800,#ffd700);border-radius:6px;width:${(progress/GOURD_TARGET*100).toFixed(1)}%"></div>
            </div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-align:right">${progress.toLocaleString()} / ${GOURD_TARGET.toLocaleString()}</div>
        </div>`;
    if (!claimed) {
        document.getElementById('ev-1month').onclick = openGourdModal;
    }
}

async function openGourdModal() {
    closeModal('modal-event');
    // Firebase에서 수령 여부 확인 (localStorage 조작 방어)
    if (FB && G.nickname && !G.gourdRewardClaimed) {
        const claimed = await FB.get(`gourdClaim/${encN(G.nickname)}`);
        if (claimed) {
            G.gourdRewardClaimed = true;
            G.save();
        }
    }
    updateGourdUI();
    openModal('modal-gourd');
    bindGourdClick();
}

function updateGourdUI() {
    const count = Math.min(G.gourdClickCount, GOURD_TARGET);
    const pct   = (count / GOURD_TARGET * 100).toFixed(2);
    const iconEl = $('gourd-icon');
    if (iconEl) iconEl.innerHTML = GOURD_SVG;

    const progText = $('gourd-progress-text');
    if (progText) {
        if (G.gourdRewardClaimed) {
            progText.textContent = '✔ 보상 수령 완료!';
            progText.style.color = '#0f0';
        } else if (count >= GOURD_TARGET) {
            progText.textContent = '🎉 완료! 클릭하여 보상 수령';
            progText.style.color = '#ffd700';
        } else {
            progText.textContent = `${count.toLocaleString()} / ${GOURD_TARGET.toLocaleString()}`;
            progText.style.color = '#ffd700';
        }
    }
    const bar = $('gourd-progress-bar');
    if (bar) bar.style.width = pct + '%';

    const rewardMsg = $('gourd-reward-msg');
    if (rewardMsg) {
        if (G.gourdRewardClaimed) {
            rewardMsg.style.display = 'block';
            rewardMsg.innerHTML = `<span style="font-size:28px">${BLESSED_PEACH_SVG}</span><br>축복의 복숭아를 획득했습니다!`;
        } else {
            rewardMsg.style.display = 'none';
        }
    }
}

function bindGourdClick() {
    const iconEl = $('gourd-icon');
    if (!iconEl) return;
    iconEl.onclick = () => {
        if (G.gourdRewardClaimed) return;

        if (G.gourdClickCount >= GOURD_TARGET) {
            // 보상 지급
            G.addFruit('축복의 복숭아', 1);
            G.gourdRewardClaimed = true;
            if (FB && G.nickname) FB.set(`gourdClaim/${encN(G.nickname)}`, { ts: Date.now() });
            G.save(); refreshMain();
            updateGourdUI();
            toast('🎉 축복의 복숭아를 획득했습니다!');
            return;
        }

        G.gourdClickCount++;
        // 클릭 애니메이션
        iconEl.style.transform = 'scale(0.88)';
        setTimeout(() => { iconEl.style.transform = 'scale(1)'; }, 60);

        if (G.gourdClickCount >= GOURD_TARGET) {
            G.addFruit('축복의 복숭아', 1);
            G.gourdRewardClaimed = true;
            if (FB && G.nickname) FB.set(`gourdClaim/${encN(G.nickname)}`, { ts: Date.now() });
        }
        if (G.gourdClickCount % 10 === 0) G.save();
        updateGourdUI();
    };
}

$('btn-event-open').onclick = () => { renderEventList(); openModal('modal-event'); };
$('btn-event-close').onclick = () => closeModal('modal-event');
$('btn-gourd-close').onclick = () => { G.save(); closeModal('modal-gourd'); };

$('btn-ranking').onclick = () => { rankCache = null; rankMode = 'gold'; renderRanking(); openModal('modal-ranking'); };
$('btn-ranking-close').onclick = () => { rankCache = null; closeModal('modal-ranking'); };
$('rank-tab-gold').onclick   = () => renderRanking('gold');
$('rank-tab-clicks').onclick = () => renderRanking('clicks');
$('btn-rank-inv-close').onclick = () => closeModal('modal-rank-inv');

// ── 앱 숨김/종료 시 남은 포션 시간 저장 (꺼진 동안 시간 멈춤) ─
document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.nickname) {
        G.save(); // Remaining 포함해서 저장
    } else if (!document.hidden && G.nickname) {
        // 다시 켜질 때: Remaining 기반으로 Until 재계산
        const saved = JSON.parse(localStorage.getItem('fruitFarm4') || 'null');
        if (saved) {
            if (saved.bluePotionRemaining   > 0) G.bluePotionUntil   = Date.now() + saved.bluePotionRemaining;
            if (saved.purplePotionRemaining > 0) G.purplePotionUntil = Date.now() + saved.purplePotionRemaining;
            if (saved.blackPotionRemaining  > 0) {
                G.blackPotionUntil = Date.now() + saved.blackPotionRemaining;
                startBlackPotionTimer();
            }
        }
        refreshMain();
    }
});
window.addEventListener('beforeunload', () => { if (G.nickname) G.save(); });

startGame();