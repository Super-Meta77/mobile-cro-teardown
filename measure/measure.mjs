// Measures the three wireframes in Chromium at a 390x844 CSS viewport (iPhone-class) and 1280x900 desktop.
// Everything here is measured on MY prototypes of a fictional brand - not on any real store.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = 'file:///home/claude/cro-asset/proto/';
const OUT = '/home/claude/cro-asset/out';
const KEYS = ['what', 'proof', 'format', 'flavour', 'purchase', 'price', 'atc'];
const LABEL = { what: 'What it is', proof: 'Reviews signal', format: 'Size choice', flavour: 'Flavour choice', purchase: 'One-time vs subscription', price: 'Price + price per kg', atc: 'Add to cart' };
const VW = 390, VH = 844;
const res = { viewport: { w: VW, h: VH }, pages: {} };
const b = await chromium.launch();

async function firstScreen(page) {
  return page.evaluate(({ KEYS, VH }) => {
    const out = {};
    for (const k of [...KEYS, 'terms', 'ingredients', 'evidence', 'reviews', 'different']) {
      const el = document.querySelector(`[data-q="${k}"]`);
      if (!el) { out[k] = { present: false }; continue; }
      const r = el.getBoundingClientRect();
      const shown = r.height > 0 && getComputedStyle(el).display !== 'none';
      out[k] = { present: shown, top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), first_screen: shown && r.top >= 0 && r.bottom <= VH };
    }
    const atc = out.atc && out.atc.present ? out.atc.top : null;
    for (const k of KEYS) if (out[k]?.present && atc != null) out[k].above_atc = k === 'atc' ? true : out[k].bottom <= atc + 1;
    out._doc_height = document.documentElement.scrollHeight;
    return out;
  }, { KEYS, VH });
}
async function reach(page, hasSticky) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const pos = []; let ok = 0;
  for (let y = 0; y <= H - VH; y += 100) {
    await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(280);
    const v = await page.evaluate(({ VH, hasSticky }) => {
      const inView = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= VH && getComputedStyle(el).visibility !== 'hidden'; };
      const main = inView(document.querySelector('#atc') || document.querySelector('#cta1')) || inView(document.querySelector('#cta2'));
      const st = hasSticky && document.querySelector('#sticky')?.classList.contains('on') && inView(document.querySelector('#sticky'));
      return main || st;
    }, { VH, hasSticky });
    pos.push({ y, reachable: v }); if (v) ok++;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return { positions: pos, reachable_share: ok / pos.length, n: pos.length };
}
async function targets(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('button, a, select, summary, input')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('.drawer') && !e.closest('#sticky'); });
    const sz = els.map(e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 30) }; });
    return { total: sz.length, under44: sz.filter(s => s.w < 44 || s.h < 44).length, under24: sz.filter(s => s.w < 24 || s.h < 24).length, small: sz.filter(s => s.w < 44 || s.h < 44).map(s => `${s.t.replace(/\s+/g, ' ')} (${Math.floor(s.w)}×${Math.floor(s.h)})`) };
  });
}

for (const name of ['before', 'after', 'lp']) {
  const page = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await page.goto(ROOT + name + '.html'); await page.waitForTimeout(200);
  const r = { first: await firstScreen(page) };
  await page.screenshot({ path: `${OUT}/shots/${name}-first.png` });
  r.reach = await reach(page, name !== 'before');
  r.targets = await targets(page);
  await page.addStyleTag({ content: '.sticky{display:none!important}' });
  await page.screenshot({ path: `${OUT}/shots/${name}-full.png`, fullPage: true });
  res.pages[name] = r;
  await page.close();
}

// Task: "1 kg, Vanilla bean, subscribe every 8 weeks" -> in cart. Count taps; a native <select> counts as 2 (open + choose).
async function task(name, steps) {
  const page = await b.newPage({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true });
  await page.goto(ROOT + name + '.html'); await page.waitForTimeout(150);
  let taps = 0; const log = [];
  for (const [kind, sel, val, label] of steps) {
    if (kind === 'tap') { await page.locator(sel).first().tap(); taps += 1; }
    if (kind === 'select') { await page.locator(sel).selectOption(val); taps += 2; }
    log.push(label);
  }
  const cart = await page.evaluate(() => window.CART);
  await page.close();
  return { taps, steps: log, cart };
}
res.task = {
  goal: '1 kg · Vanilla bean · subscription every 8 weeks, added to cart',
  before: await task('before', [['tap', '#sizes [data-f=kg1]', null, 'Tap 1 kg'], ['select', '#flavour', 'Vanilla bean', 'Open flavour list, choose Vanilla bean'], ['tap', '#subs', null, 'Tap Subscribe & save'], ['select', '#freq', '8 weeks', 'Open frequency list, choose 8 weeks'], ['tap', '#atc', null, 'Tap Add to cart']]),
  after: await task('after', [['tap', '#flavours [data-v="Vanilla bean"]', null, 'Tap Vanilla bean'], ['tap', '#subs', null, 'Tap Subscribe'], ['tap', '#freq [data-w="8"]', null, 'Tap Every 8 wks'], ['tap', '#atc', null, 'Tap Add to cart']]),
};
for (const k of ['before', 'after']) {
  const c = res.task[k].cart[0] || {};
  res.task[k].correct = c.format === 'kg1' && c.flavour === 'Vanilla bean' && c.sub === true && c.freq === '8 weeks';
}
// LP -> kit in cart
{
  const page = await b.newPage({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true });
  await page.goto(ROOT + 'lp.html'); await page.locator('#cta1').tap();
  res.task.lp = { taps: 1, drawer_open: await page.evaluate(() => document.querySelector('#drawer').classList.contains('on')), cart: await page.evaluate(() => window.CART) };
  await page.close();
}
// desktop render of the after PDP + kit preselected via URL (landing page continuity)
{
  const page = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(ROOT + 'after.html'); await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/shots/after-desktop.png` });
  await page.close();
  const m = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
  await m.goto(ROOT + 'after.html?format=kit'); await m.waitForTimeout(150);
  res.kit_param = await m.evaluate(() => ({ selected: document.querySelector('[data-f="kit"]').getAttribute('aria-checked'), flavour_hidden: getComputedStyle(document.querySelector('#flavWrap')).display === 'none', price: document.querySelector('#price').textContent }));
  await m.screenshot({ path: `${OUT}/shots/after-kit-first.png` });
  await m.close();
}
// drawer + sticky state shots
{
  const page = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await page.goto(ROOT + 'after.html'); await page.evaluate(() => window.scrollTo(0, 1500)); await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/shots/after-sticky.png` });
  const stickyOn = await page.evaluate(() => document.querySelector('#sticky').classList.contains('on')); res.sticky_on_at_1500 = stickyOn;
  await page.evaluate(() => { document.querySelector('#subs').click(); document.querySelector('#atc2').click(); }); await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/shots/after-drawer.png` });
  await page.close();
}
await b.close();
res.labels = LABEL; res.keys = KEYS;
fs.writeFileSync(`${OUT}/metrics.json`, JSON.stringify(res, null, 2));
for (const n of ['before', 'after', 'lp']) {
  const p = res.pages[n];
  const fs1 = KEYS.filter(k => p.first[k]?.first_screen);
  console.log(`${n}: first screen ${fs1.length}/7 [${fs1.join(', ')}]; ATC reachable ${(p.reach.reachable_share * 100).toFixed(0)}% of ${p.reach.n} scroll positions; targets <44px ${p.targets.under44}/${p.targets.total}, <24px ${p.targets.under24}; doc ${p.first._doc_height}px`);
}
console.log('task before', res.task.before.taps, res.task.before.correct, '| after', res.task.after.taps, res.task.after.correct, '| lp', res.task.lp.taps, res.task.lp.drawer_open);
console.log('kit param', JSON.stringify(res.kit_param));
for (const n of ['before', 'after']) { const f = res.pages[n].first; console.log(n, 'terms', JSON.stringify(f.terms), 'ingredients top', f.ingredients.top, 'reviews top', f.reviews.top, 'evidence', f.evidence.present ? f.evidence.top : 'absent'); }
