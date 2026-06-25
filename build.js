/* ============================================================
   ThatMeme — SEO 페이지 빌더 (build.js)
   ------------------------------------------------------------
   사용법:  node build.js
   하는 일: memes.js 를 읽어서 아래를 자동 생성합니다.
     /m/<슬러그>/index.html   ← 밈마다 검색에 잡히는 독립 페이지
     /explore/index.html      ← 전체 밈 둘러보기 허브(내부링크 모음)
     /sitemap.xml             ← 검색엔진 제출용
     /robots.txt
     /style.css               ← 생성 페이지 공용 스타일

   밈을 추가하면 memes.js만 고치고 다시 `node build.js` 하면 끝.
   ============================================================ */

const fs = require("fs");
const path = require("path");

/* ───────── 설정 (배포 전 본인 값으로 ↓) ───────── */
const SITE      = "https://YOURNAME.github.io/thatmeme"; // 배포 주소, 끝에 / 없이
const SITE_NAME = "ThatMeme";
const GA_ID     = "G-XXXXXXXXXX";                        // GA4 측정 ID
const CONTACT   = "onlyonecorpceo@gmail.com";
/* ───────────────────────────────────────────── */

const ROOT = __dirname;
const OUT  = process.env.OUT ? path.resolve(process.env.OUT) : path.join(ROOT, "dist");
// 매번 깨끗하게 다시 빌드 (삭제된 밈의 잔재 페이지 방지)
fs.rmSync(OUT, { recursive:true, force:true });
fs.mkdirSync(OUT, { recursive:true });

// memes.js / categories.js 는 window.* 형태 → window 를 만들어 두고 로드
global.window = {};
require(path.join(ROOT, "memes.js"));
require(path.join(ROOT, "categories.js"));
const MEMES = global.window.MEMES || [];
const CATS  = global.window.CATEGORIES || { moods:[], uses:[] };
if (!MEMES.length) { console.error("memes.js 에서 MEMES 를 못 읽었습니다."); process.exit(1); }

const byName = new Map(MEMES.map(m=>[m.name_en, m]));
const HAY = MEMES.map(m => (m.name_en+" "+m.name_ko+" "+m.tags.join(" ")+" "+m.desc_en+" "+m.desc_ko).toLowerCase());
// 카테고리 → 밈 목록 (시드 우선 + 키워드 자동매칭, index.html 과 동일 규칙)
function listFor(cat){
  const out=[], seen=new Set();
  (cat.seed||[]).forEach(nm=>{ const m=byName.get(nm); if(m&&!seen.has(m)){seen.add(m);out.push(m);} });
  MEMES.map((m,i)=>({m,s:(cat.kw||[]).reduce((a,k)=>a+(HAY[i].includes(k.toLowerCase())?1:0),0)}))
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s)
    .forEach(x=>{ if(!seen.has(x.m)){seen.add(x.m);out.push(x.m);} });
  return out;
}

/* ───────── 유틸 ───────── */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const slugify = s => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
const imgUrl = q => "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(q);
const clip = (s,n) => s.length>n ? s.slice(0,n-1).trim()+"…" : s;
const today = new Date().toISOString().slice(0,10);

// 슬러그 배정 (배열 순서대로, 충돌 시 -2/-3 … 클라이언트와 동일 규칙)
const seen = {};
const slugOf = new Map();
MEMES.forEach(m => {
  let base = slugify(m.name_en) || "meme", s = base, n = 2;
  while (seen[s]) s = base + "-" + (n++);
  seen[s] = true; slugOf.set(m, s);
});

// 관련 밈: 태그 겹침 상위 6개
function related(m){
  const set = new Set(m.tags.map(t=>t.toLowerCase()));
  return MEMES.filter(x=>x!==m)
    .map(x=>({x, n:x.tags.reduce((a,t)=>a+(set.has(t.toLowerCase())?1:0),0)}))
    .sort((a,b)=>b.n-a.n).slice(0,6).map(o=>o.x);
}

const gaSnippet = GA_ID && GA_ID!=="G-XXXXXXXXXX" ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>` :
`<!-- GA: build.js 상단 GA_ID 를 채우면 모든 페이지에 자동 삽입됩니다 -->`;

const fontLink = `<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">`;

/* OnlyOne 랜딩(허브)으로 돌아가는 공용 링크 — 모든 생성 페이지 좌상단에 들어감 */
const ONLYONE = "https://main.onlyonecorpceo.workers.dev/";
const onlyoneLink = `<a class="onlyone" href="${ONLYONE}" target="_blank" rel="noopener" onclick="if(window.gtag)gtag('event','onlyone_click')" aria-label="OnlyOne"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="6.4" r="4.1" stroke="currentColor" stroke-width="2.6"/><rect x="8.7" y="10.3" width="2.6" height="7.3" rx="1.3" fill="currentColor"/></svg><span>OnlyOne</span></a>`;

/* ───────── 밈 상세 페이지 ───────── */
function memePage(m){
  const slug = slugOf.get(m);
  const url = `${SITE}/m/${slug}/`;
  const title = `${m.name_ko} 뜻·유래 | ${m.name_en} meme - ${SITE_NAME}`;
  const metaDesc = clip(`${m.desc_ko} / ${m.desc_en}`, 155);
  const rel = related(m);
  const relCards = rel.map(r=>`
        <a class="rel" href="../${slugOf.get(r)}/">
          <span class="rel-ko">${esc(r.name_ko)}</span>
          <span class="rel-en">${esc(r.name_en)}</span>
        </a>`).join("");
  const tagPills = m.tags.slice(0,8).map(t=>`<span class="tag">${esc(t)}</span>`).join("");

  // 긴 설명(body) 이 있으면 문단으로 펼침, 없으면 desc 한 줄만.
  const paras = (lead, body) => {
    let out = `<p>${esc(lead)}</p>`;
    if (body && String(body).trim()) {
      out += String(body).split(/\n{2,}/).map(p=>p.trim()).filter(Boolean)
              .map(p=>`<p>${esc(p)}</p>`).join("");
    }
    return out;
  };
  const koBody = paras(m.desc_ko, m.body_ko);
  const enBody = paras(m.desc_en, m.body_en);

  const jsonld = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":`${m.name_ko}이(가) 뭐예요?`,
       "acceptedAnswer":{"@type":"Answer","text":m.desc_ko}},
      {"@type":"Question","name":`What is the ${m.name_en} meme?`,
       "acceptedAnswer":{"@type":"Answer","text":m.desc_en}}
    ]
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(m.name_ko)} · ${esc(m.name_en)} meme">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${fontLink}
<link rel="stylesheet" href="../../style.css">
${gaSnippet}
</head>
<body>
<div class="wrap">
  <nav class="nav">
    <div class="nav-left">${onlyoneLink}
      <a class="logo" href="../../"><span class="that">That</span>Meme</a></div>
    <a class="navlink" href="../../explore/">전체 밈 둘러보기</a>
  </nav>

  <nav class="crumb" aria-label="breadcrumb">
    <a href="../../">홈</a> › <a href="../../explore/">밈 사전</a> › <span>${esc(m.name_ko)}</span>
  </nav>

  <article class="detail">
    <p class="eyebrow">밈 사전 · meme dictionary</p>
    <h1>${esc(m.name_ko)}</h1>
    <p class="altname">${esc(m.name_en)}</p>

    <section class="block">
      <h2>무슨 밈인가요?</h2>
      ${koBody}
    </section>
    <section class="block">
      <h2>What is it?</h2>
      ${enBody}
    </section>

    <!-- ▼ 광고 위치 (애드센스 승인 후 코드 삽입) ▼ -->
    <!-- <div class="ad-slot"></div> -->

    <a class="cta" target="_blank" rel="noopener"
       href="${imgUrl(m.query)}"
       onclick="if(window.gtag)gtag('event','google_redirect',{source:'meme_page',meme:'${esc(m.name_en).replace(/'/g,'')}'})">
      구글 이미지에서 ‘${esc(m.name_ko)}’ 보기
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
    </a>

    <div class="tags">${tagPills}</div>
  </article>

  <section class="related">
    <h2>관련 밈</h2>
    <div class="rel-grid">${relCards}</div>
  </section>

  <p class="backhome"><a href="../../">← 다른 밈도 설명만으로 찾아보기</a></p>

  <footer>
    <div>문의 · 제휴 — <a href="mailto:${CONTACT}">${CONTACT}</a></div>
    <div class="note">이 사이트는 방문 분석을 위해 쿠키를 사용하며 광고가 표시될 수 있습니다. · This site uses cookies for analytics and may display ads.</div>
    <div class="note">밈 이미지는 저장하지 않으며, 구글 이미지검색 결과로 연결됩니다.</div>
  </footer>
</div>
</body>
</html>`;
}

/* ───────── 카테고리 랜딩 페이지 (기분별/용도별) ───────── */
function categoryPage(cat, group){
  const list = listFor(cat);
  const url = `${SITE}/${group}/${cat.id}/`;
  const isMood = group === "mood";
  const koWord = isMood ? "기분" : "상황";
  const title = `${cat.ko} 밈 모음 — ${cat.en} memes | ${SITE_NAME}`;
  const metaDesc = clip(`${cat.ko}에 어울리는 밈 ${list.length}개. 카드를 누르면 구글 이미지검색으로 바로 연결돼요. ${cat.en} memes to send.`, 155);

  const cards = list.map(m=>`
        <div class="mcard">
          <span class="mname">${esc(m.name_ko)}</span>
          <span class="maltname">${esc(m.name_en)}</span>
          <p class="mdesc">${esc(m.desc_ko)}</p>
          <div class="mactions">
            <a class="mgo" target="_blank" rel="noopener" href="${imgUrl(m.query)}"
               onclick="if(window.gtag)gtag('event','google_redirect',{source:'cat_page',cat:'${cat.id}',meme:'${esc(m.name_en).replace(/'/g,'')}'})">구글 이미지 &rarr;</a>
            <a class="mdetail" href="../../m/${slugOf.get(m)}/">자세히</a>
          </div>
        </div>`).join("");

  const others = (isMood ? CATS.moods : CATS.uses).filter(c=>c.id!==cat.id);
  const crossOther = (isMood ? CATS.uses : CATS.moods);
  const link = (c,g)=>`<a class="cat-link" href="../../${g}/${c.id}/">${c.emoji} ${esc(c.ko)}</a>`;
  const links = others.map(c=>link(c,group)).join("") + crossOther.map(c=>link(c, isMood?"use":"mood")).join("");

  const jsonld = {
    "@context":"https://schema.org","@type":"ItemList",
    "name":`${cat.ko} 밈 모음`,
    "itemListElement": list.slice(0,25).map((m,i)=>({"@type":"ListItem","position":i+1,"name":m.name_ko}))
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(cat.ko)} 밈 모음">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${fontLink}
<link rel="stylesheet" href="../../style.css">
${gaSnippet}
</head>
<body>
<div class="wrap">
  <nav class="nav">
    <div class="nav-left">${onlyoneLink}
      <a class="logo" href="../../"><span class="that">That</span>Meme</a></div>
    <a class="navlink" href="../../explore/">전체 밈 둘러보기</a>
  </nav>
  <nav class="crumb"><a href="../../">홈</a> › <span>${koWord}별</span> › <span>${esc(cat.ko)}</span></nav>

  <header class="cat-head">
    <p class="eyebrow">${koWord}별 밈 · ${esc(cat.en)}</p>
    <h1>${cat.emoji} ${esc(cat.ko)} 밈 모음</h1>
    <p class="cat-intro">${esc(cat.ko)}에 보내기 딱 좋은 밈 ${list.length}개를 모았어요. 카드를 누르면 구글 이미지검색으로 바로 연결됩니다.</p>
  </header>

  <!-- ▼ 광고 위치 (애드센스 승인 후) ▼ -->
  <!-- <div class="ad-slot"></div> -->

  <div class="cat-grid">${cards}</div>

  <section class="cat-more">
    <h2>다른 기분·상황</h2>
    <div class="cat-links">${links}</div>
  </section>

  <footer>
    <div>문의 · 제휴 — <a href="mailto:${CONTACT}">${CONTACT}</a></div>
    <div class="note">이 사이트는 방문 분석을 위해 쿠키를 사용하며 광고가 표시될 수 있습니다. · This site uses cookies for analytics and may display ads.</div>
    <div class="note">밈 이미지는 저장하지 않으며, 구글 이미지검색 결과로 연결됩니다.</div>
  </footer>
</div>
</body>
</html>`;
}

/* ───────── explore 허브 ───────── */
function explorePage(){
  const catLink = (c,g)=>`<a class="cat-link" href="../${g}/${c.id}/">${c.emoji} ${esc(c.ko)}</a>`;
  const moodLinks = CATS.moods.map(c=>catLink(c,"mood")).join("");
  const useLinks  = CATS.uses.map(c=>catLink(c,"use")).join("");
  const cards = MEMES.map(m=>`
      <a class="ex" href="../m/${slugOf.get(m)}/">
        <span class="ex-ko">${esc(m.name_ko)}</span>
        <span class="ex-en">${esc(m.name_en)}</span>
      </a>`).join("");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>밈 사전 — 전체 ${MEMES.length}개 | ${SITE_NAME}</title>
<meta name="description" content="ThatMeme 밈 사전. 글로벌부터 한국 밈, 무한도전 짤까지 ${MEMES.length}개 밈의 뜻과 유래를 한곳에서.">
<link rel="canonical" href="${SITE}/explore/">
<meta property="og:title" content="밈 사전 — 전체 ${MEMES.length}개">
<meta property="og:description" content="설명만으로 무슨 밈인지 찾아주는 ThatMeme의 밈 사전.">
<meta property="og:url" content="${SITE}/explore/">
${fontLink}
<link rel="stylesheet" href="../style.css">
${gaSnippet}
</head>
<body>
<div class="wrap">
  <nav class="nav">
    <div class="nav-left">${onlyoneLink}
      <a class="logo" href="../"><span class="that">That</span>Meme</a></div>
    <a class="navlink" href="../">설명으로 찾기</a>
  </nav>
  <header class="ex-head">
    <h1>밈 사전</h1>
    <p>전체 ${MEMES.length}개 · 글로벌, 한국, 무한도전 짤까지</p>
  </header>
  <section class="cat-more">
    <h2>기분별</h2>
    <div class="cat-links">${moodLinks}</div>
    <h2 style="margin-top:18px">용도별</h2>
    <div class="cat-links">${useLinks}</div>
  </section>
  <div class="ex-grid">${cards}</div>
  <footer>
    <div>문의 · 제휴 — <a href="mailto:${CONTACT}">${CONTACT}</a></div>
    <div class="note">이 사이트는 방문 분석을 위해 쿠키를 사용하며 광고가 표시될 수 있습니다. · This site uses cookies for analytics and may display ads.</div>
  </footer>
</div>
</body>
</html>`;
}

/* ───────── 공용 스타일 ───────── */
const STYLE = `:root{--bg:#f5f5f7;--surface:#fff;--ink:#1d1d1f;--ink-2:#6e6e73;--ink-3:#86868b;--accent:#0071e3;--accent-press:#0077ed;--hairline:#d2d2d7;--pill:#f5f5f7;--radius:18px;--shadow:0 4px 30px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","SF Pro Display",system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.6}
.wrap{max-width:760px;margin:0 auto;padding:0 22px}
.nav{display:flex;justify-content:space-between;align-items:center;padding:20px 0}
.logo{font-size:22px;font-weight:800;letter-spacing:-.03em;text-decoration:none;color:var(--ink)}
.logo .that{color:var(--accent)}
.navlink{font-size:14px;font-weight:600;color:var(--ink-2);text-decoration:none;border:1px solid var(--hairline);background:var(--surface);padding:7px 14px;border-radius:980px}
.navlink:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.nav-left{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.onlyone{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--ink-2);font-size:13px;font-weight:600;border:1px solid var(--hairline);background:var(--surface);padding:5px 11px 5px 9px;border-radius:980px;transition:background .15s,color .15s,border-color .15s}
.onlyone:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.onlyone svg{width:17px;height:17px;display:block}
.crumb{font-size:13px;color:var(--ink-3);padding:6px 0 0}
.crumb a{color:var(--ink-2);text-decoration:none}.crumb a:hover{text-decoration:underline}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);margin:26px 0 12px}
.detail h1{font-size:clamp(30px,6vw,46px);font-weight:800;letter-spacing:-.025em;line-height:1.1;margin:0 0 6px}
.altname{font-size:17px;color:var(--ink-3);margin:0 0 8px}
.block{margin:26px 0 0}
.block h2{font-size:15px;font-weight:700;color:var(--ink-3);margin:0 0 6px;letter-spacing:-.01em}
.block p{font-size:18px;color:var(--ink);margin:0;letter-spacing:-.01em}
.ad-slot{margin:26px 0;min-height:90px;border:1px dashed var(--hairline);border-radius:12px}
.cta{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:13px 24px;border-radius:980px;margin:30px 0 0;transition:background .15s ease}
.cta:hover{background:var(--accent-press)}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin:24px 0 0}
.tag{background:var(--pill);color:var(--ink-2);font-size:13px;padding:5px 11px;border-radius:980px}
.related{margin:54px 0 0}
.related h2{font-size:14px;font-weight:700;color:var(--ink-3);margin:0 0 14px}
.rel-grid,.ex-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.rel,.ex{display:flex;flex-direction:column;gap:2px;background:var(--surface);border:1px solid var(--hairline);border-radius:14px;padding:15px 16px;text-decoration:none;color:inherit;transition:border-color .15s ease,transform .05s ease}
.rel:hover,.ex:hover{border-color:var(--ink-3)}
.rel-ko,.ex-ko{font-weight:600;font-size:15px}
.rel-en,.ex-en{font-size:12px;color:var(--ink-3)}
.backhome{margin:40px 0 0}.backhome a{color:var(--accent);text-decoration:none;font-weight:600}
.ex-head{padding:20px 0 6px}
.ex-head h1{font-size:clamp(30px,6vw,44px);font-weight:800;letter-spacing:-.025em;margin:0 0 6px}
.ex-head p{color:var(--ink-2);margin:0 0 14px}
.ex-grid{margin:14px 0 0}
.cat-head{padding:20px 0 6px}
.cat-head h1{font-size:clamp(28px,6vw,44px);font-weight:800;letter-spacing:-.025em;margin:0 0 8px}
.cat-intro{font-size:17px;color:var(--ink-2);margin:0 0 6px;max-width:40em}
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:22px 0 0}
.mcard{background:var(--surface);border:1px solid var(--hairline);border-radius:16px;padding:18px 18px 14px;box-shadow:var(--shadow);display:flex;flex-direction:column}
.mname{font-weight:700;font-size:17px;letter-spacing:-.01em}
.maltname{font-size:13px;color:var(--ink-3);margin-top:1px}
.mdesc{font-size:14px;color:var(--ink-2);margin:9px 0 14px;flex:1;line-height:1.45}
.mactions{display:flex;align-items:center;gap:14px}
.mgo{display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 16px;border-radius:980px}
.mgo:hover{background:var(--accent-press)}
.mdetail{color:var(--ink-3);text-decoration:none;font-size:13px;font-weight:600}
.mdetail:hover{color:var(--ink);text-decoration:underline}
.cat-more{margin:54px 0 0}
.cat-more h2{font-size:14px;font-weight:700;color:var(--ink-3);margin:0 0 12px}
.cat-links{display:flex;flex-wrap:wrap;gap:9px}
.cat-link{border:1px solid var(--hairline);background:var(--surface);color:var(--ink);text-decoration:none;font-size:14px;font-weight:500;padding:8px 14px;border-radius:980px}
.cat-link:hover{border-color:var(--ink-3)}
footer{margin-top:70px;padding:30px 0 56px;border-top:1px solid var(--hairline);text-align:center;color:var(--ink-3);font-size:13px;line-height:1.7}
footer a{color:var(--ink-2);text-decoration:none}footer a:hover{text-decoration:underline}
.note{margin-top:8px}
@media (max-width:520px){.rel-grid,.ex-grid{grid-template-columns:1fr}}`;

/* ───────── sitemap / robots ───────── */
function sitemap(){
  const catUrls = [
    ...CATS.moods.map(c=>`${SITE}/mood/${c.id}/`),
    ...CATS.uses.map(c=>`${SITE}/use/${c.id}/`)
  ];
  const urls = [ `${SITE}/`, `${SITE}/explore/`, ...catUrls, ...MEMES.map(m=>`${SITE}/m/${slugOf.get(m)}/`) ];
  const body = urls.map(u=>`  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`;

/* ───────── 쓰기 ───────── */
function write(rel, content){
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive:true });
  fs.writeFileSync(full, content, "utf8");
}

let count = 0;
MEMES.forEach(m => { write(`m/${slugOf.get(m)}/index.html`, memePage(m)); count++; });
let catCount = 0;
CATS.moods.forEach(c => { write(`mood/${c.id}/index.html`, categoryPage(c,"mood")); catCount++; });
CATS.uses.forEach(c => { write(`use/${c.id}/index.html`, categoryPage(c,"use")); catCount++; });
write("explore/index.html", explorePage());
write("style.css", STYLE);
write("sitemap.xml", sitemap());
write("robots.txt", robots);

// 런타임 소스 파일을 dist 로 복사 (index.html 에는 GA_ID 를 자동 주입)
let indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (GA_ID && GA_ID !== "G-XXXXXXXXXX") indexHtml = indexHtml.split("G-XXXXXXXXXX").join(GA_ID);
fs.writeFileSync(path.join(OUT, "index.html"), indexHtml);
fs.copyFileSync(path.join(ROOT, "memes.js"), path.join(OUT, "memes.js"));
fs.copyFileSync(path.join(ROOT, "categories.js"), path.join(OUT, "categories.js"));

console.log(`✅ 생성 완료 → ${OUT}/`);
console.log(`   밈 페이지: ${count}개, 카테고리: ${catCount}개, + index/explore/sitemap/robots/style`);
if (SITE.includes("YOURNAME")) console.log(`   ⚠️  build.js 상단 SITE 주소를 본인 배포 주소로 바꾸세요 (sitemap/canonical 에 쓰임).`);
if (GA_ID === "G-XXXXXXXXXX") console.log(`   ⚠️  GA_ID 를 채우면 생성 페이지에도 애널리틱스가 들어갑니다.`);
