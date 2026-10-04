const A = './assets/';

const products = [
  {
    id: 'stay', category: 'sticker', name: 'Stay child forever', size: '6×6 cm', price: 200,
    image: 'product-stay-forever.png',
    description: '生きる上で一番大切なマインドはこれなんだ！！という\n世間に蔓延る固定概念に対してのアンチテーゼから\nこの全てが始まったと言っても過言ではない。\nいつまでも夢を追って、叶えるために生きる。\n人生に大きな熱量を持つ人々で世界が溢れますように。'
  },
  {
    id: 'heart', category: 'sticker', name: 'Thingsoftheart', size: '6×6 cm', price: 200,
    image: 'product-things-heart.png',
    description: '[thing soft heart] 心身ともに無くては生きられない\nただひとつのもの、それは柔らかで優しいハート。\n[things of the art] それはアートにとっても同じ。\n唯一無二性、内包するのは感情、想い、主張。\n決して機械に制すことはできない領域である。'
  },
  {
    id: 'star', category: 'sticker', name: 'Wish star', size: '6×6 cm', price: 200,
    image: 'product-wish-star.png',
    description: '夜空を見上げると僅かながらではあるが\n小さくも美しい星たちが輝いているのがわかる。\nそのどれか一つで良いから手に取ることができ\nその輝きを手のひらの中で見つめることができれば\nその瞬間は確実に人生の表紙になるなぁ。'
  },
  {
    id: 'dream', category: 'mirror', name: 'Time To Dream', size: '38×38 cm', price: 3600,
    image: 'product-time-to-dream.png',
    description: 'ここがなにひとつ、しがらみのない世界だとして。\n自分としっかり目を合わせ、自分に問いかける。\n「君が人生賭けて叶えたいことって、何だっけ？」\n浮かんだ答えこそが、あなたの心底に眠る夢である。\nさぁ早く起きて、目を覚まして。もう夢を見る時間だ。'
  },
  {
    id: 'sunshine', category: 'mirror', name: "You're my Sunshine", size: '38×38 cm', price: 3600,
    image: 'product-youre-my-sunshine.png',
    description: '人生に価値を見出せない、そんな日もあるよね。\nけれど、これを見るたび思い出して。\n自分を突き動かせるのは自分だけであること。\n誰よりも自分自身が自分のエネルギー、\n天高く輝くお日さまのようにあろう☼'
  }
];
const MAX_CART_QUANTITY = 2147483647;

const footerTop = {
  home: 1137, story: 973, shop: 970, gallery: 1544, contact: 677,
  news: 1542, mybox: 2984, thanks: 719, terms: 3769, policy: 1879, commerce: 1393
};
const frameHeight = {
  home: 1337, story: 1173, shop: 1170, gallery: 1744, contact: 877,
  news: 1742, mybox: 3184, thanks: 919, terms: 3969, policy: 2079,
  commerce: 1593, faq: 1442, 'product-sticker': 1021,
  'product-dream': 1090, 'product-sunshine': 1108
};

function readCart() {
  try {
    const saved = localStorage.getItem('dtay-cart');
    if (saved === null) return {};
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(products.flatMap((product) => {
      const quantity = parsed[product.id];
      return Number.isSafeInteger(quantity) && quantity > 0 && quantity <= MAX_CART_QUANTITY
        ? [[product.id, quantity]]
        : [];
    }));
  } catch {
    return {};
  }
}

const state = {
  page: 'home', productId: null, previousPage: 'shop', shopTab: 'sticker',
  cart: readCart(), menuOpen: false, menuClosing: false, menuCloseTimer: null,
  skipNextScreenAnimation: false, hasRendered: false, isLoading: true,
  productImageTransitionId: null, shopSliderTransition: null, footerTransition: false,
  productPanelMotion: false, cartNoticeVisible: false
};
const app = document.getElementById('app');
let activeScreenTransition = null;

function pageFromHash() {
  const oldPage = state.page;
  const key = decodeURIComponent(location.hash.replace(/^#/, ''));
  const product = key.match(/^product-(.+)$/);
  if (product && products.some((p) => p.id === product[1])) {
    state.productId = product[1];
    state.page = 'product';
    state.previousPage = history.state?.previousPage || 'shop';
    return;
  }
  state.productId = null;
  state.page = key === 'shipping' ? 'faq' : key === 'checkout' ? 'mybox' : (key || 'home');
  if (!frameHeight[state.page]) state.page = 'home';
  if (oldPage === 'product' && state.page !== 'shop') clearProductImageTransition();
  else if (state.productImageTransitionId && state.page !== 'shop') clearProductImageTransition();
}

function setRoute(page, { push = true, closeMenuAfter = false } = {}) {
  if (state.menuCloseTimer) window.clearTimeout(state.menuCloseTimer);
  const closeAfterTransition = closeMenuAfter && state.menuOpen;
  if ((state.page === 'product' || state.productImageTransitionId) && page !== 'shop') clearProductImageTransition();
  state.menuOpen = closeAfterTransition;
  state.menuClosing = closeAfterTransition;
  state.productId = null;
  state.page = page === 'shipping' ? 'faq' : page === 'checkout' ? 'mybox' : page;
  if (!frameHeight[state.page]) state.page = 'home';
  if (push) history.pushState({ page: state.page }, '', `#${state.page}`);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  render();
  if (closeAfterTransition) scheduleMenuClose();
}

function go(page) {
  state.footerTransition = false;
  setRoute(page);
}

function goFromMenu(page) {
  state.footerTransition = false;
  setRoute(page, { closeMenuAfter: true });
}

function goFromFooter(page) {
  clearProductImageTransition();
  app.querySelector('.detail-panel')?.style.setProperty('view-transition-name', 'none');
  app.querySelector('.shop-tab-slider')?.style.setProperty('view-transition-name', 'none');
  state.shopSliderTransition = null;
  state.footerTransition = false;
  setRoute(page);
}

function clearProductImageTransition() {
  app.querySelector('.detail-art img')?.style.setProperty('view-transition-name', 'none');
  app.querySelectorAll('.board-item img').forEach((image) => image.style.setProperty('view-transition-name', 'none'));
  state.productImageTransitionId = null;
}

function openProduct(id, event) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  app.querySelectorAll('.board-item img').forEach((image) => image.style.setProperty('view-transition-name', 'none'));
  const sourceImage = event?.currentTarget?.querySelector('img');
  if (sourceImage) sourceImage.style.setProperty('view-transition-name', 'product-image');
  state.productImageTransitionId = id;
  state.previousPage = state.page;
  state.productPanelMotion = true;
  state.productId = id;
  state.page = 'product';
  state.menuOpen = false;
  history.pushState({ page: 'product', productId: id, previousPage: state.previousPage }, '', `#product-${id}`);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  render();
}

function closeProduct() {
  const target = state.previousPage || 'shop';
  state.productId = null;
  state.page = target;
  // Replace the detail URL so browser Back returns to the page before Shop.
  history.replaceState({ page: target }, '', `#${target}`);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  render();
}

function saveCart() {
  try { localStorage.setItem('dtay-cart', JSON.stringify(state.cart)); } catch { /* local preview can run with storage disabled */ }
}

function addToBox(id) {
  if (!products.some((product) => product.id === id)) return;
  state.cart[id] = Math.min(MAX_CART_QUANTITY, (state.cart[id] || 0) + 1);
  saveCart();
  showCartNotice();
  closeProduct();
}

function changeQuantity(id, delta) {
  if (!products.some((product) => product.id === id)) return;
  const next = Math.max(0, Math.min(MAX_CART_QUANTITY, (state.cart[id] || 0) + delta));
  if (next === 0) delete state.cart[id]; else state.cart[id] = next;
  saveCart();
  state.skipNextScreenAnimation = true;
  render();
}

function removeFromBox(id) {
  delete state.cart[id];
  saveCart();
  state.skipNextScreenAnimation = true;
  render();
}

function openMenu() {
  if (state.menuCloseTimer) window.clearTimeout(state.menuCloseTimer);
  state.menuCloseTimer = null;
  state.menuOpen = true;
  state.menuClosing = false;
  render();
}

function closeMenu() {
  if (!state.menuOpen || state.menuClosing) return;
  state.menuClosing = true;
  render();
  scheduleMenuClose();
}

function scheduleMenuClose() {
  if (state.menuCloseTimer) window.clearTimeout(state.menuCloseTimer);
  state.menuCloseTimer = window.setTimeout(() => {
    state.menuCloseTimer = null;
    state.menuOpen = false;
    state.menuClosing = false;
    state.skipNextScreenAnimation = true;
    render();
  }, 500);
}

function brand() {
  return `<a class="brand" href="#home" onclick="go('home');return false" aria-label="Don't Tell Anybody home"><img src="${A}main-logo.png" alt="DON'T TELL ANYBODY"></a>`;
}

function header() {
  const links = [
    ['Shop', 'shop', 'shop'], ['Story', 'story', 'story'],
    ['Gallery', 'gallery', 'gallery'], ['Contact', 'contact', 'contact']
  ];
  const strokeWidths = { shop: 38.6, story: 46.8, gallery: 59.2, contact: 66.2 };
  const activePage = state.page === 'product' ? 'shop' : state.page;
  return `<header class="topbar" aria-label="Main navigation">
    ${brand()}
    <nav class="nav">${links.map(([label, target, cls]) => {
      const active = activePage === target;
      const width = strokeWidths[cls];
      return `<a class="${cls}${active ? ' active' : ''}" href="#${target}" aria-current="${active ? 'page' : 'false'}" onclick="go('${target}');return false">
        <svg class="nav-outline" style="width:${width}px" viewBox="0 0 ${width} 18" aria-hidden="true"><text x="0" y="14" font-family="DynaPuff" font-size="14" font-weight="700" letter-spacing="-.8" fill="none" stroke="#fff" stroke-width="6.67" stroke-linejoin="round">${label}</text></svg>
        <span class="nav-label">${label}</span>
      </a>`;
    }).join('')}</nav>
    <button class="menu-button" onclick="openMenu()" aria-label="Open menu"><i></i><i></i><i></i></button>
  </header>`;
}

function footer() {
  return `<footer class="footer" aria-label="Footer navigation">
    <a class="footer-home" href="#home" onclick="goFromFooter('home');return false" aria-label="Home"><img src="${A}main-logo.png" alt="DON'T TELL ANYBODY"></a>
    ${socialMarks('footer-social-row')}
    <nav class="footer-links" aria-label="Help and legal links">
      <a href="#faq" onclick="goFromFooter('faq');return false">FAQ</a>
      <a href="#policy" onclick="goFromFooter('policy');return false">プライバシーポリシー</a>
      <a href="#terms" onclick="goFromFooter('terms');return false">利用規約</a>
      <a href="#commerce" onclick="goFromFooter('commerce');return false">特定商取引法に基づく表記</a>
    </nav>
    <p class="footer-copyright">Copyright © 2025 DON’T TELL ANYBODY All rights reserved.</p>
  </footer>`;
}

function socialMarks(className) {
  const links = [
    ['instagram', 'Instagram', 'https://www.instagram.com/donttell.official?stkn=MWc0YnZzMmJpZjA0aw=='],
    ['threads', 'Threads', 'https://www.threads.com/@donttell.official?igshid=NTc4MTIwNjQ2YQ=='],
    ['note', 'note', 'https://note.com/heartofchild'],
    ['youtube', 'YouTube', 'https://youtube.com/@donttell_anybody?si=v5xjX-AlOBrqSOIB']
  ];
  return `<div class="${className}" aria-label="Social media">
    ${links.map(([id, label, href]) => `<a class="social-mark social-${id}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><img src="${A}social-${id}.svg" alt=""></a>`).join('')}
  </div>`;
}

function titlebar(label) {
  return `<h1 class="titlebar">${label}</h1>`;
}

function sprite(id, className = '', style = '', src = '') {
  const image = src || `character-${id}.png`;
  return `<img class="sprite ${className}" src="${A}${image}" alt="" style="${style}">`;
}

function loadingPage() {
  return `<div class="artboard loading-artboard" style="--frame-height:100svh">
    <main class="loading-screen">
      <div class="loading-content">
        <p class="loading-caption">YOUR SECRET BASE IS WAKING UP</p>
        <div class="loading-progress" aria-hidden="true"><span></span></div>
      </div>
    </main>
  </div>`;
}

function productImageStyle(id) {
  return state.productImageTransitionId === id ? ' style="view-transition-name:product-image"' : '';
}

const flow3CharacterLayouts = {
  home: [
    { src: 'character-21-edge.png', left: 0, top: 395.5, width: 40, height: 32.5 },
    { id: 20, left: 6, top: 359.5, width: 108, height: 60 },
    { id: 25, left: 58.5, top: 383.5, width: 87.7, height: 57 },
    { id: 23, left: 113, top: 362, width: 71.3, height: 63.9 },
    { id: 27, left: 183, top: 383, width: 77.6, height: 62.8 },
    { id: 26, left: 220.5, top: 370, width: 71, height: 45 },
    { id: 29, left: 252.7, top: 354.3, width: 122.2, height: 95 },
    { id: 28, left: 344.6, top: 390.3, width: 57.8, height: 25.5 },

    { id: 17, left: -20.5, top: 705.5, width: 108, height: 60 },
    { id: 19, left: 33.5, top: 720.5, width: 97, height: 83 },
    { id: 18, left: 84.5, top: 700.5, width: 84.5, height: 57 },
    { src: 'character-21.png', left: 174.5, top: 743.5, width: 40.5, height: 35.5 },
    { id: 23, left: 236.4, top: 706.7, width: 53.3, height: 45.1 },
    { id: 22, left: 255.5, top: 719, width: 86, height: 80.5 },
    { id: 27, left: 310.3, top: 713.8, width: 60.1, height: 38.5 },
    { id: 20, left: 309, top: 735.5, width: 108, height: 60 },

    { id: 25, left: -41.5, top: 1060.5, width: 107, height: 60 },
    { id: 27, left: 17.8, top: 1067.6, width: 106.3, height: 92.4 },
    { id: 24, left: 90.5, top: 1059, width: 78, height: 43 },
    { id: 23, left: 150.9, top: 1089.2, width: 71.3, height: 50.5 },
    { id: 29, left: 218.8, top: 1057.3, width: 128.7, height: 102.6 },
    { id: 28, left: 326.6, top: 1073.3, width: 57.8, height: 25.5 },
    { id: 26, left: 340.5, top: 1106, width: 71, height: 45 }
  ],
  contact: [
    { id: 23, left: -26, top: 190.8, width: 74.4, height: 59.9 },
    { id: 27, left: 334.5, top: 189.8, width: 86.6, height: 57.8 },
    { id: 29, left: -20.3, top: 291.4, width: 92.3, height: 81.3 },
    { id: 28, left: 360.4, top: 278.6, width: 51, height: 57.8 },
    { id: 18, left: -30, top: 392.4, width: 112, height: 76 },
    { id: 19, left: 347.5, top: 367, width: 97, height: 83 },
    { id: 25, left: -36.8, top: 508.9, width: 93.6, height: 52.5 },
    { id: 29, left: 346, top: 462, width: 121.3, height: 106.8 },
    { id: 26, left: -12.5, top: 600.3, width: 66, height: 50.4 },
    { id: 22, left: -38.4, top: 617, width: 157.4, height: 91 },
    { id: 28, left: 62.1, top: 620.7, width: 75.5, height: 33 },
    { src: 'character-21.png', left: 286.5, top: 644, width: 40.5, height: 35.5 },
    { id: 17, left: 317, top: 601, width: 103.7, height: 55.2 }
  ],
  thanks: [
    { id: 18, centerX: 330.5, centerY: 667, width: 78, angle: 11.69 },
    { id: 25, centerX: 189.5, centerY: 174, width: 107 },
    { id: 26, centerX: 273.5, centerY: 209.5, width: 71 },
    { id: 27, centerX: 268.1, centerY: 602.8, width: 107, angle: -17.66 },
    { id: 23, centerX: 198.4, centerY: 558.1, width: 107, angle: -11.53 },
    { id: 28, centerX: 44, centerY: 168, width: 68 },
    { id: 29, centerX: 140, centerY: 654, width: 108, angle: -23.01 },
    { id: 17, centerX: 303, centerY: 517.5, width: 52 },
    { id: 28, centerX: 370.5, centerY: 248, width: 85 },
    { id: 26, centerX: 73.8, centerY: 521.6, width: 63.7, angle: -3.34 },
    { id: 21, centerX: 348, centerY: 566.5, width: 52 },
    { id: 29, centerX: 355.5, centerY: 439.5, width: 77 },
    { id: 24, centerX: 43, centerY: 371, width: 54 },
    { id: 23, centerX: 111.5, centerY: 197.5, width: 53 },
    { id: 27, centerX: 342.1, centerY: 180.1, width: 50.3, angle: 44.92 },
    { id: 28, centerX: 116.9, centerY: 568.9, width: 33.3, angle: -21.12 },
    { id: 22, centerX: 44.3, centerY: 602.9, width: 84.9, angle: -22.03 },
    { id: 19, centerX: 349, centerY: 328.5, width: 52 },
    { id: 29, centerX: 31, centerY: 268.5, width: 50 },
    { id: 25, centerX: 32.5, centerY: 458.5, width: 53 }
  ]
};

function ambientCharacters() {
  const placements = flow3CharacterLayouts[state.page] || [];
  if (!placements.length) return '';
  const images = placements.map(({ id, src, left, top, centerX, centerY, width, angle = 0 }) => {
    const image = src || `character-${id}.png`;
    const centered = Number.isFinite(centerX) && Number.isFinite(centerY);
    const position = centered
      ? `left:${centerX}px;top:${centerY}px;transform:translate(-50%,-50%) rotate(${angle}deg);transform-origin:50% 50%`
      : `left:${left}px;top:${top}px;transform:rotate(${angle}deg)`;
    return sprite(id || '', 'ambient-character', `${position};width:${width}px;height:auto`, image);
  }).join('');
  return `<div class="ambient-character-field${state.page === 'contact' ? ' contact-sprites' : ''}" aria-hidden="true">${images}</div>`;
}

function homePage() {
  const title = '<span>LIKE CHILD.</span><span>PLAY WITH TOYS.</span><span>SHOW WHAT YOU ARE.</span>';
  return `<main class="home-screen">
    <section class="home-hero" aria-label="Like child. Play with toys. Show what you are.">
      <svg class="hero-text-effects" width="0" height="0" aria-hidden="true"><defs>
        <filter id="hero-letter-inset" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="softAlpha"/>
          <feComposite in="SourceAlpha" in2="softAlpha" operator="out" result="innerEdge"/>
          <feFlood flood-color="white"/><feComposite in2="innerEdge" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over"/>
        </filter>
        <filter id="hero-mirror-inset" x="-10%" y="-25%" width="120%" height="150%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="softAlpha"/>
          <feComposite in="SourceAlpha" in2="softAlpha" operator="out" result="innerEdge"/>
          <feFlood flood-color="white" flood-opacity=".8"/><feComposite in2="innerEdge" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over"/><feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs></svg>
      <h1 class="hero-title-art">${title}</h1>
      <div class="hero-title-art reflection" aria-hidden="true">${title}</div>
      <div class="hero-copy-art">
        <p class="hero-hush">し<span class="hero-whisper"><span>ー</span></span>っ。</p>
        <p>ここは僕らのための秘密基地。誰にも言っちゃいけないからね。</p>
        <p>思いのままに自分自身を表現し、好きなモノに囲まれて過ごす場所。</p>
        <p>オモチャたちに映るのはとっても自由な、あなたのあるがままの姿。</p>
        <p>思い出そうよ、<strong>コドモゴコロ。</strong>あなたの夢は、何ですか？</p>
      </div>
    </section>
    <section class="home-pickup">
      <h2 class="section-heading">Pickup Toys</h2>
      <div class="home-shelf"><a href="#shop" aria-label="Browse pickup toys" onclick="go('shop');return false"></a><a href="#shop" aria-label="Browse pickup toys" onclick="go('shop');return false"></a><a href="#shop" aria-label="Browse pickup toys" onclick="go('shop');return false"></a></div>
      <button class="pill view-all pickup-view" onclick="go('shop')">View all</button>
    </section>
    <section class="home-news">
      <h2 class="section-heading">News</h2>
      <div class="home-news-grid"><a href="#news" aria-label="News" onclick="go('news');return false"></a><a href="#news" aria-label="News" onclick="go('news');return false"></a></div>
      <button class="pill view-all news-view" onclick="go('news')">View all</button>
    </section>
  </main>`;
}

const storyBody = `あなたには今、夢がありますか？
心から叶えたい、夢が。
この現代社会では誰しもが歳を重ね
いつの間にか夢を失ってしまう。
全人類が子供のままでいられたら。
幾度となくそう考えた。
それは決して、いつまでも子供じみた行動をとる、
ということではなく

赤ん坊のように
未知の世界の全てを受け入れていく気持ちを持って
幼少期のように
何事にも好奇心旺盛かつ怖いもの知らずで
小学生のように
好きなことを全力で楽しんで
中学生のように
ありふれた可能性と共に大きな夢を追い求めて
高校生のように
しんどい時でも踏ん張って努力する

ことを忘れないでいたい、ということ。
これからあなたの元に届く “オモチャたち” は
このマインドをいつでも思い出させてくれるはず。
笑っちゃうくらい大きな夢を抱えた人間の生み出すものが
どこかで誰かのステキな夢を後押ししていること
未来ある子供たちが皆、子供心を忘れずに
キラキラ輝いた夢を抱えていることを願って。`;

function storyPage() {
  return `<main class="story-screen">${titlebar('Story')}
    <p class="story-lead">ここは、“子供心”で満ち溢れた世界＿。</p>
    <p class="story-copy">${storyBody}</p>
  </main>`;
}

function shopPage() {
  const mirror = state.shopTab === 'mirror';
  return `<main class="shop-screen">
    ${titlebar('Shop')}
    ${shopTabs(mirror)}
    <div class="shop-board">
      <img class="board-art" src="${A}sugoroku-board.png" alt="">
      ${mirror ? `<button class="board-item mirror-dream" aria-label="Time To Dream mirror" onclick="openProduct('dream', event)"><img${productImageStyle('dream')} src="${A}product-time-to-dream.png" alt="Time To Dream mirror"></button>
        <button class="board-item mirror-sunshine" aria-label="You're my Sunshine mirror" onclick="openProduct('sunshine', event)"><img${productImageStyle('sunshine')} src="${A}product-youre-my-sunshine.png" alt="You're my Sunshine mirror"></button>` : `<button class="board-item sticker-stay" aria-label="Stay child forever sticker" onclick="openProduct('stay', event)"><img${productImageStyle('stay')} src="${A}product-stay-forever.png" alt="Stay child forever"></button>
        <button class="board-item sticker-heart" aria-label="Thingsoftheart sticker" onclick="openProduct('heart', event)"><img${productImageStyle('heart')} src="${A}product-things-heart.png" alt="Thingsoftheart"></button>
        <button class="board-item sticker-star" aria-label="Wish star sticker" onclick="openProduct('star', event)"><img${productImageStyle('star')} src="${A}product-wish-star.png" alt="Wish star"></button>`}
    </div>
    <p class="shop-caption">EXPECT FOR NEXT PHASE!</p>
  </main>`;
}

function shopTabs(mirror) {
  const sliderName = state.shopSliderTransition === 'product-to-shop'
    ? 'shop-tab-route'
    : state.shopSliderTransition === 'shop-tab' ? 'shop-tab-slider' : 'none';
  const mirrorTextName = state.shopSliderTransition ? 'shop-tab-label-mirror' : 'none';
  const stickerTextName = state.shopSliderTransition ? 'shop-tab-label-sticker' : 'none';
  return `<div class="shop-tabs" role="tablist" aria-label="Shop category">
    <span class="shop-tab-slider${mirror ? ' to-mirror' : ''}" style="view-transition-name:${sliderName}" aria-hidden="true"></span>
    <button class="${mirror ? 'active' : ''}" role="tab" aria-selected="${mirror}" onclick="${state.page === 'product' ? "goShopTab('mirror')" : "setShopTab('mirror')"}"><span class="shop-tab-label" style="view-transition-name:${mirrorTextName}">Mirror</span></button>
    <button class="${mirror ? '' : 'active'}" role="tab" aria-selected="${!mirror}" onclick="${state.page === 'product' ? "goShopTab('sticker')" : "setShopTab('sticker')"}"><span class="shop-tab-label" style="view-transition-name:${stickerTextName}">Sticker</span></button>
  </div>`;
}

function nameCurrentShopTabTexts() {
  app.querySelector('.shop-tabs button:nth-of-type(1) .shop-tab-label')?.style.setProperty('view-transition-name', 'shop-tab-label-mirror');
  app.querySelector('.shop-tabs button:nth-of-type(2) .shop-tab-label')?.style.setProperty('view-transition-name', 'shop-tab-label-sticker');
}

function setShopTab(tab) {
  if (state.page !== 'shop' || state.shopTab === tab) return;
  app.querySelector('.shop-screen .shop-tab-slider')?.style.setProperty('view-transition-name', 'shop-tab-slider');
  nameCurrentShopTabTexts();
  state.shopSliderTransition = 'shop-tab';
  state.shopTab = tab;
  render();
}

function blankPanels(count, startY = 216) {
  return Array.from({ length: count }, (_, i) => `<div class="blank-panel panel-${i % 2 ? 'reverse' : 'forward'}" style="--panel-y:${startY + i * 216}px" aria-hidden="true"></div>`).join('');
}

function galleryPage() {
  return `<main class="gallery-screen">${titlebar('Gallery')}${blankPanels(5, 216)}</main>`;
}

function newsPage() {
  return `<main class="news-screen">${titlebar('News')}${blankPanels(5, 216)}</main>`;
}

function faqPage() {
  return `<main class="faq-screen">${titlebar('FAQ')}${blankPanels(4, 226)}</main>`;
}

function contactPage() {
  return `<main class="contact-screen">
    ${titlebar('Contact')}
    <form class="contact-card" onsubmit="submitContact(event)">
      <h2>Contact us</h2>
      <label class="visually-hidden" for="contact-name">Name</label>
      <input id="contact-name" name="name" placeholder="Name" autocomplete="name" required>
      <label class="visually-hidden" for="contact-address">Email address</label>
      <input id="contact-address" name="address" type="email" placeholder="Email address" autocomplete="email" required>
      <label class="visually-hidden" for="contact-message">Message</label>
      <textarea id="contact-message" name="message" placeholder="Message" required></textarea>
      <button class="send-button" type="submit">Send it!</button>
    </form>
    <p id="contact-submit-status" class="contact-thanks" role="status">Thanks For Visiting!</p>
  </main>`;
}

function submitContact(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const fields = {
    name: String(data.get('name') || '').trim(),
    address: String(data.get('address') || '').trim(),
    message: String(data.get('message') || '').trim()
  };
  const subject = "DON'T TELL ANYBODY — Contact";
  const body = `name: ${fields.name}\n\naddress: ${fields.address}\n\nMessage:\n${fields.message}`;
  const mailto = `mailto:donttellanybody.official@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.getElementById('contact-submit-status');
  if (status) status.textContent = 'メールアプリで宛先と内容をご確認のうえ、送信してください。';
  window.location.href = mailto;
}

function productPage() {
  const product = products.find((item) => item.id === state.productId) || products[0];
  const mirror = product.category === 'mirror';
  const panelTop = mirror ? 501 : 447;
  const heightClass = `product-${mirror ? product.id : 'sticker'}`;
  const artClass = `detail-art detail-${product.id}`;
  return `<main class="product-screen ${heightClass}">
    ${titlebar('Shop')}
    ${shopTabs(mirror)}
    <div class="${artClass}" aria-label="${product.name}"><img style="view-transition-name:product-image" src="${A + product.image}" alt="${product.name}"></div>
    <div class="size-tag">${product.size}</div>
    <section class="detail-panel" style="top:${panelTop}px;view-transition-name:product-details-panel" aria-label="${product.name} details">
      <h2>${product.name}</h2>
      <p class="detail-price">${product.price.toLocaleString('en-US')} yen</p>
      <div class="detail-divider"></div>
      <p class="detail-description">${product.description}</p>
      <button class="detail-close" onclick="closeProduct()" aria-label="Back to shop">×</button>
      <button class="add-button" onclick="addToBox('${product.id}')"><span class="add-circle" aria-hidden="true"></span> ADD TO MY BOX</button>
    </section>
  </main>`;
}

function goShopTab(tab) {
  const slider = app.querySelector('.product-screen .shop-tab-slider');
  slider?.style.setProperty('view-transition-name', 'shop-tab-route');
  nameCurrentShopTabTexts();
  state.shopSliderTransition = 'product-to-shop';
  state.shopTab = tab;
  setRoute('shop');
}

function myBoxPage() {
  const items = products.filter((product) => state.cart[product.id] > 0);
  const subtotal = cartSubtotal(items);
  const cards = items.map((product, i) => `<article class="box-card" style="top:${229 + i * 170}px">
    <div class="box-card-title">${product.name}</div>
    <div class="box-card-size">${product.size.replace('×', 'x')}</div>
    <div class="box-card-price">${product.price.toLocaleString('en-US')} yen</div>
    <img class="box-card-art" src="${A + product.image}" alt="">
    <div class="box-divider"></div>
    <div class="box-quantity">
      <button class="remove-item" aria-label="Remove ${product.name}" onclick="removeFromBox('${product.id}')">${trashSvg()}</button>
      <button aria-label="Decrease ${product.name} quantity" onclick="changeQuantity('${product.id}',-1)">−</button>
      <span aria-live="polite">${state.cart[product.id]}</span>
      <button aria-label="Increase ${product.name} quantity" onclick="changeQuantity('${product.id}',1)">＋</button>
    </div>
  </article>`).join('');
  return `<main class="mybox-screen">
    <div class="mybox-title"><span class="box-icon" aria-hidden="true">${boxSvg()}</span><span>My Box</span></div>
    ${cards || `<div class="empty-box"><p>Your box is waiting for a little joy.</p><button onclick="go('shop')">Browse toys</button></div>`}
    <section class="box-checkout-summary" style="top:${boxSummaryTop(items.length)}px">
      <p class="box-subtotal">SUBTOTAL <strong>¥${subtotal.toLocaleString('en-US')}</strong></p>
      <button id="shopify-checkout-button" class="checkout-pay-button" onclick="startShopifyCheckout()" ${checkoutConfigReady(items) ? '' : 'disabled'}>Continue to Shopify checkout</button>
      <h2>Ready for a little joy?</h2>
      <p class="checkout-note">送料はShopifyの決済画面でご確認いただけます。</p>
      <p id="shopify-checkout-status" class="checkout-status" role="status">${!items.length ? '商品を追加するとShopify決済に進めます。' : checkoutConfigReady(items) ? 'Shopifyの安全な決済画面へ進みます。' : '現在、決済への接続を準備しています。'}</p>
      <button class="checkout-back" onclick="go('shop')">← Back to Shop</button>
    </section>
  </main>`;
}

function cartSubtotal(items) {
  return items.reduce((sum, product) => sum + product.price * state.cart[product.id], 0);
}

function checkoutConfigReady(items) {
  const config = window.shopifyCheckoutConfig;
  return Boolean(config?.domain && config?.storefrontAccessToken && config?.apiVersion
    && items.length && items.every((product) => config.variantIds?.[product.id]));
}

function boxSummaryTop(count) {
  return count ? 404 + (count - 1) * 170 : 365;
}

async function startShopifyCheckout() {
  const items = products.filter((product) => state.cart[product.id] > 0);
  const config = window.shopifyCheckoutConfig;
  const status = document.getElementById('shopify-checkout-status');
  const button = document.getElementById('shopify-checkout-button');
  if (!checkoutConfigReady(items)) {
    if (status) status.textContent = 'Shopifyの接続情報がまだ設定されていません。';
    return;
  }

  button.disabled = true;
  status.textContent = 'Shopifyの決済画面を準備しています…';
  const mutation = `mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }`;
  const input = { lines: items.map((product) => ({
    merchandiseId: String(config.variantIds[product.id]).startsWith('gid://')
      ? config.variantIds[product.id]
      : `gid://shopify/ProductVariant/${config.variantIds[product.id]}`,
    quantity: state.cart[product.id]
  })) };
  try {
    const shopDomain = String(config.domain).replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const response = await fetch(`https://${shopDomain}/api/${config.apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
      },
      body: JSON.stringify({ query: mutation, variables: { input } })
    });
    const result = await response.json();
    const payload = result.data?.cartCreate;
    if (!response.ok || result.errors?.length || payload?.userErrors?.length || !payload?.cart?.checkoutUrl) {
      throw new Error(payload?.userErrors?.[0]?.message || result.errors?.[0]?.message || 'Checkout is unavailable.');
    }
    window.location.assign(payload.cart.checkoutUrl);
  } catch (error) {
    button.disabled = false;
    status.textContent = 'Shopifyの決済画面を開けませんでした。少し時間をおいて再度お試しください。';
    console.error('Shopify checkout could not be created:', error);
  }
}

function boxSvg() {
  return `<img src="${A}icon-box.svg" alt="" aria-hidden="true">`;
}

function trashSvg() {
  return `<img src="${A}icon-trash.svg" alt="" aria-hidden="true">`;
}

let noticeTimer;
function cartNoticeContent() {
  return `<span class="box-icon">${boxSvg()}</span><span>My Boxに追加しました</span><button onclick="go('mybox')">My Boxを見る</button>`;
}

function showCartNotice() {
  window.clearTimeout(noticeTimer);
  state.cartNoticeVisible = true;
  noticeTimer = window.setTimeout(() => {
    state.cartNoticeVisible = false;
    const notice = document.getElementById('cart-notice');
    if (notice) notice.hidden = true;
  }, 3500);
}

function floatingBox() {
  const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  return `<button class="floating-box" onclick="go('mybox')" aria-label="Open My Box${count ? `, ${count} items` : ''}"><span class="box-icon">${boxSvg()}</span>${count ? `<span class="box-count">${count}</span>` : ''}</button>`;
}

function updateFloatingBox() {
  const button = document.querySelector('.floating-box');
  const board = app.querySelector('.artboard:not([aria-hidden="true"])');
  const footer = board?.querySelector('.footer-position');
  if (!button || !board || !footer) return;
  const rect = board.getBoundingClientRect();
  const footerTop = footer.getBoundingClientRect().top;
  const bottom = Math.max(20, window.innerHeight - footerTop + 16);
  button.style.right = `${Math.max(16, window.innerWidth - rect.right + 16)}px`;
  button.style.bottom = `${bottom}px`;
  button.hidden = footerTop < 72 || state.menuOpen;
}

function updatePageGeometry() {
  const board = app.querySelector('.artboard:not([aria-hidden="true"])');
  const footer = board?.querySelector('.footer-position');
  if (board?.classList.contains('screen-story') && footer) {
    const lead = board.querySelector('.story-lead');
    const bar = board.querySelector('.titlebar');
    const body = board.querySelector('.story-copy');
    const gap = lead.offsetTop - (bar.offsetTop + bar.offsetHeight);
    const footerY = body.offsetTop + body.offsetHeight + gap;
    footer.style.top = `${footerY}px`;
    board.style.setProperty('--frame-height', `${footerY + 200}px`);
  }
  updateFloatingBox();
}

window.addEventListener('scroll', updateFloatingBox, { passive: true });
window.addEventListener('resize', updatePageGeometry);
document.fonts.ready.then(updatePageGeometry);
document.fonts.addEventListener('loadingdone', updatePageGeometry);

const thanksText = `ご注文ありがとうございます。

ようこそ我々の秘密基地へ！
TEAM STAY CHILDの一員として
これからの活躍、期待しています。

あ、ちなみに“これらのこと”は
決して誰にも言っちゃいけませんからね。

通常1〜2日ほどで
あなたのオモチャたちは発送されます。
お楽しみにお待ちくださいませ！`;

function thanksPage() {
  return `<main class="thanks-screen">
    <h1>Now You Join Our Team!</h1>
    <div class="thanks-message"><p>${thanksText.replace('TEAM STAY CHILD', '<span class="thanks-team">TEAM STAY CHILD</span>')}</p>
    <button onclick="go('home')">Back To Home</button></div>
  </main>`;
}

const legalLayout = {
  terms: { left: 42, top: 210, width: 309, line: 8.4 },
  policy: { left: 53, top: 210, width: 287, line: 9.35 },
  commerce: { left: 51, top: 209, width: 291, line: 11.5 }
};

function legalPage(page) {
  const doc = window.legalDocs?.[page] || { title: '利用規約', body: '' };
  const layout = legalLayout[page];
  return `<main class="legal-screen legal-${page}">
    <h1 class="legal-title">${doc.title}</h1>
    <article class="legal-copy" style="left:${layout.left}px;top:${layout.top}px;width:${layout.width}px;--legal-line:${layout.line}px">${escapeHtml(doc.body)}</article>
  </main>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function menuOverlay() {
  if (!state.menuOpen) return '';
  const menuLinks = [['Shop', 'shop'], ['Story', 'story'], ['Gallery', 'gallery'], ['News', 'news'], ['Contact', 'contact']];
  const activePage = state.page === 'product' ? 'shop' : state.page;
  const isActive = (target) => activePage === target;
  const closingClass = state.menuClosing ? ' closing' : '';
  return `<div class="menu-backdrop${closingClass}" onclick="if(event.target===this)closeMenu()">
    <aside class="menu-drawer${closingClass}" aria-label="More pages">
      <button class="menu-close" onclick="closeMenu()" aria-label="Close menu">×</button>
      <nav class="drawer-links">${menuLinks.map(([label, target]) => {
        const active = isActive(target);
        return `<a class="${active ? 'active' : ''}" href="#${target}" aria-current="${active ? 'page' : 'false'}" onclick="goFromMenu('${target}');return false">${label}</a>`;
      }).join('')}</nav>
      <button class="drawer-mybox${isActive('mybox') ? ' active' : ''}" onclick="goFromMenu('mybox')"><span class="box-icon">${boxSvg()}</span><span>My Box</span><span class="drawer-arrow" aria-hidden="true"><svg viewBox="0 0 16 20"><path d="m5 4 6 6-6 6"/></svg></span></button>
      <nav class="drawer-legal" aria-label="Help and legal links">
        <a class="${isActive('faq') ? 'active' : ''}" href="#faq" onclick="goFromMenu('faq');return false">FAQ</a>
        <a class="${isActive('policy') ? 'active' : ''}" href="#policy" onclick="goFromMenu('policy');return false">プライバシーポリシー</a>
        <a class="${isActive('terms') ? 'active' : ''}" href="#terms" onclick="goFromMenu('terms');return false">利用規約</a>
        <a class="${isActive('commerce') ? 'active' : ''}" href="#commerce" onclick="goFromMenu('commerce');return false">特定商取引法に基づく表記</a>
      </nav>
      ${socialMarks('drawer-social')}
    </aside>
  </div>`;
}

function screenContent() {
  if (state.page === 'product') return productPage();
  const renderers = {
    home: homePage, story: storyPage, shop: shopPage, gallery: galleryPage,
    news: newsPage, contact: contactPage, mybox: myBoxPage, thanks: thanksPage,
    faq: faqPage, terms: () => legalPage('terms'), policy: () => legalPage('policy'),
    commerce: () => legalPage('commerce')
  };
  return (renderers[state.page] || homePage)();
}

function render() {
  if (state.isLoading) {
    app.innerHTML = loadingPage();
    state.hasRendered = true;
    return;
  }
  const pageKey = state.page === 'product'
    ? (state.productId === 'dream' || state.productId === 'sunshine' ? `product-${state.productId}` : 'product-sticker')
    : state.page;
  const cartItemCount = products.filter((product) => state.cart[product.id] > 0).length;
  const myboxFooterY = boxSummaryTop(cartItemCount) + 300;
  const height = state.page === 'mybox' ? myboxFooterY + 200 : frameHeight[pageKey] || frameHeight.home;
  const productFooterTop = state.page === 'product'
    ? (state.productId === 'dream' ? 890 : state.productId === 'sunshine' ? 908 : 821)
    : null;
  const footerY = state.page === 'mybox' ? myboxFooterY : productFooterTop ?? footerTop[state.page] ?? (height - 200);
  const footerMarkup = `<div class="footer-position" style="top:${footerY}px">${footer()}</div>`;
  const content = screenContent().replace(/(<main\b[^>]*>)/, (opening) => `${opening}${ambientCharacters()}`);
  const markup = `<div class="artboard screen-${state.page}" style="--frame-height:${height}px">
    ${header()}
    ${content}
    ${footerMarkup}
  </div>${floatingBox()}<div id="cart-notice" class="cart-notice" role="status" ${state.cartNoticeVisible ? '' : 'hidden'}>${state.cartNoticeVisible ? cartNoticeContent() : ''}</div>${menuOverlay()}`;
  const shouldCrossfade = state.hasRendered && !state.menuOpen && !state.menuClosing && !state.skipNextScreenAnimation;
  const footerSlideTransition = state.footerTransition;
  const productPanelMotion = Boolean(state.productPanelMotion);
  state.productPanelMotion = false;
  const imageTransitionId = state.productImageTransitionId;
  const shouldFinishTabSliderTransition = state.shopSliderTransition !== null;
  const finishTabSliderTransition = () => {
    if (!shouldFinishTabSliderTransition) return;
    app.querySelector('.shop-tabs .shop-tab-slider')?.style.setProperty('view-transition-name', 'none');
    app.querySelectorAll('.shop-tab-label').forEach((label) => label.style.setProperty('view-transition-name', 'none'));
    state.shopSliderTransition = null;
  };
  const finishImageTransition = () => {
    if (!imageTransitionId || state.page === 'product' || state.productImageTransitionId !== imageTransitionId) return;
    app.querySelectorAll('.board-item img').forEach((image) => image.style.setProperty('view-transition-name', 'none'));
    state.productImageTransitionId = null;
  };
  const finishFooterTransition = () => {
    if (!footerSlideTransition) return;
    state.footerTransition = false;
    delete document.documentElement.dataset.navigationMotion;
  };
  if (shouldCrossfade && typeof document.startViewTransition === 'function') {
    activeScreenTransition?.skipTransition();
    if (footerSlideTransition) document.documentElement.dataset.navigationMotion = 'footer-slide';
    else if (productPanelMotion) document.documentElement.dataset.navigationMotion = 'product-panel';
    else delete document.documentElement.dataset.navigationMotion;
    const transition = document.startViewTransition(() => { app.innerHTML = markup; updatePageGeometry(); });
    activeScreenTransition = transition;
    const finishNavigation = () => {
      if (activeScreenTransition !== transition) return;
      activeScreenTransition = null;
      delete document.documentElement.dataset.navigationMotion;
      updatePageGeometry();
    };
    transition.finished.then(finishNavigation, finishNavigation);
    if (imageTransitionId && state.page !== 'product') transition.finished.then(finishImageTransition, finishImageTransition);
    if (shouldFinishTabSliderTransition) transition.finished.then(finishTabSliderTransition, finishTabSliderTransition);
    if (footerSlideTransition) transition.finished.then(finishFooterTransition, finishFooterTransition);
  } else if (shouldCrossfade) {
    const outgoing = app.querySelector('.artboard')?.cloneNode(true);
    app.innerHTML = markup;
    const incoming = app.querySelector('.artboard');
    if (productPanelMotion) {
      incoming?.querySelector('.detail-panel')?.classList.add('panel-slide-in');
    } else if (footerSlideTransition) {
      if (outgoing) {
        outgoing.classList.add('fallback-slide-old');
        outgoing.setAttribute('aria-hidden', 'true');
        outgoing.inert = true;
        app.insertBefore(outgoing, app.firstChild);
      }
      incoming?.classList.add('fallback-slide-up-in');
      window.setTimeout(() => {
        outgoing?.remove();
        incoming?.classList.remove('fallback-slide-up-in');
        finishFooterTransition();
      }, 500);
    } else if (outgoing) {
      outgoing.classList.add('fallback-crossfade-out');
      outgoing.setAttribute('aria-hidden', 'true');
      outgoing.inert = true;
      app.insertBefore(outgoing, app.firstChild);
      incoming?.classList.add('fallback-crossfade-in');
      window.setTimeout(() => outgoing.remove(), 500);
    }
    if (imageTransitionId && state.page !== 'product') window.setTimeout(finishImageTransition, 500);
    if (shouldFinishTabSliderTransition) window.setTimeout(finishTabSliderTransition, 500);
  } else {
    app.innerHTML = markup;
    finishTabSliderTransition();
    finishFooterTransition();
  }
  updatePageGeometry();
  state.hasRendered = true;
  state.skipNextScreenAnimation = false;
}

window.addEventListener('popstate', () => {
  if (state.menuCloseTimer) window.clearTimeout(state.menuCloseTimer);
  state.menuCloseTimer = null;
  state.menuOpen = false;
  state.menuClosing = false;
  state.footerTransition = false;
  delete document.documentElement.dataset.navigationMotion;
  pageFromHash();
  render();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.menuOpen) closeMenu();
    else if (state.page === 'product') closeProduct();
  }
});

pageFromHash();
render();
window.setTimeout(() => {
  state.isLoading = false;
  pageFromHash();
  history.replaceState({ page: state.page }, '', location.hash || '#home');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  render();
}, 2500);
