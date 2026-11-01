(() => {
  'use strict';
  const T = window.T;
  const $ = (s, r = document) => r.querySelector(s);
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'html') n.innerHTML = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
    return n;
  }
  const pct = x => Math.round(x * 100) + '%';
  const B = T.first.before, A = T.first.after;

  /* stats */
  const stat = (v, w, label, small) => el('div', { class: 'stat' }, el('dt', {}, label), el('dd', {}, v, el('span', {}, ` vs ${w}`)), el('small', {}, small));
  $('#stats').append(
    stat(`${T.first_count.after}/7`, `${T.first_count.before}/7`, 'decision items in the first phone screen', 'after vs a typical theme layout'),
    stat(`${T.task.after.taps} taps`, `${T.task.before.taps}`, 'to put "1 kg, Vanilla, every 8 weeks" in the cart', 'scripted and verified in Chromium'),
    stat(pct(T.reach.after.reachable_share), pct(T.reach.before.reachable_share), 'of scroll positions with Add to cart in reach', 'sticky bar vs none'),
    stat(String(T.targets.after.under44), String(T.targets.before.under44), 'tap targets under 44 px', `of ${T.targets.after.total} interactive elements`));

  /* tabs */
  const TABS = [['map', 'Where momentum drops'], ['pdp', 'Product page'], ['mobile', 'Mobile details'], ['lp', 'Landing page'], ['de', 'German rules'], ['comp', 'Components'], ['plan', 'How I would work']];
  const tl = $('#tablist'), P = {};
  TABS.forEach(([id, label]) => {
    tl.append(el('button', { role: 'tab', id: 't-' + id, 'aria-controls': 'p-' + id, 'aria-selected': 'false', tabindex: '-1', onclick: () => { location.hash = id; } }, label));
    P[id] = el('section', { class: 'panel', id: 'p-' + id, role: 'tabpanel', 'aria-labelledby': 't-' + id, hidden: true }); $('#panels').append(P[id]);
  });
  tl.addEventListener('keydown', e => { const b = [...tl.children], i = b.indexOf(document.activeElement); if (i < 0) return; const j = e.key === 'ArrowRight' ? (i + 1) % b.length : e.key === 'ArrowLeft' ? (i - 1 + b.length) % b.length : -1; if (j >= 0) { b[j].focus(); b[j].click(); e.preventDefault(); } });
  const select = id => { if (!P[id]) id = 'map'; Object.entries(P).forEach(([k, p]) => { p.hidden = k !== id; }); [...tl.children].forEach(b => { const on = b.id === 't-' + id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; }); };
  addEventListener('hashchange', () => select(location.hash.slice(1)));

  /* ---------------- friction map ---------------- */
  const hyp = (pri, title, signal, fix) => el('div', { class: 'hyp' }, el('span', { class: 'pri ' + pri }, { high: 'High', med: 'Medium', found: 'Found while prototyping' }[pri]), el('b', {}, title),
    el('dl', {}, el('dt', {}, 'Confirm'), el('dd', {}, signal), el('dt', {}, 'Fix'), el('dd', {}, fix)));
  const stage = (n, name, ...cards) => el('div', { class: 'stage' }, el('h4', {}, el('i', {}, String(n)), name), ...cards);
  P.map.append(el('h2', {}, 'Where an interested customer starts losing momentum'),
    el('p', { class: 'sub' }, 'Hypotheses for the fictional store, mapped along the paid-traffic journey rather than page by page. On your store, week 1 confirms or kills each one with your analytics, recordings and reviews before anything is redesigned.'),
    el('div', { class: 'journey' },
      stage(1, 'Ad to landing', hyp('high', 'The ad sells texture; the click lands on a generic collection.', 'Landing-page report by campaign and device: engagement and add-to-cart by entry page.', 'A landing page that continues the ad\'s angle and offer (see Landing page).')),
      stage(2, 'Product page, first screen', hyp('high', 'What it is and why it\'s different sit below the Add to cart button.', `Scroll maps; add-to-cart rate on mobile vs desktop. In the typical layout the description starts at ${B.what.top}px.`, 'One line under the title: what it is and the one difference that matters.'),
        hyp('med', 'A square gallery pushes every choice below the first screen.', 'Gallery swipe rate vs scroll depth in recordings.', 'Shorter gallery; all seven decision items in the first screen.')),
      stage(3, 'Choosing', hyp('high', 'Size and flavour are picked without a reason to pick.', 'Variant split; starter kit vs full-size orders; reviews mentioning "wrong flavour".', 'Size cards with per-serving price; the starter kit becomes a size, not a separate product.'),
        hyp('high', 'Subscription terms hide behind "How subscriptions work".', 'Subscription take rate by device; support tickets about cancelling.', 'Frequency and "pause, skip or cancel online any time" in plain view.')),
      stage(4, 'Cart', hyp('found', 'Subscribe & save takes 1 kg from 42,90 € to 38,61 €, under the 40 € free-shipping line.', 'Shipping fee shown on subscription carts; abandonment of carts under the threshold.', 'Subscriptions ship free, so the discount the product page promotes never adds a fee in the cart.')),
      stage(5, 'Checkout', el('div', { class: 'hyp' }, el('span', { class: 'pri med' }, 'Leave mostly alone'), el('b', {}, 'Shopify\'s checkout is standardised.'), el('p', { class: 'note', style: 'margin:0' }, 'Few levers worth a designer\'s time beyond payment methods and shipping copy. The money is upstream.')))),
    el('h3', { style: 'margin-top:26px' }, 'What probably does not need changing'),
    el('p', { class: 'note', style: 'margin:0 0 10px' }, 'Saying this early keeps the project small. Each one is still checked against your data.'),
    el('div', { class: 'leave' },
      el('div', {}, el('b', {}, 'Brand identity. '), 'The problems above are structure and order, not paint.'),
      el('div', {}, el('b', {}, 'Homepage hero. '), 'If paid traffic rarely lands there, it is not where conversion is lost.'),
      el('div', {}, el('b', {}, 'Navigation, '), 'if the catalogue fits in a short menu. A redesign is only worth it if collections keep sending people to the wrong product.'),
      el('div', {}, el('b', {}, 'Checkout. '), 'See above.')));

  /* ---------------- PDP ---------------- */
  function phone(name, data, label) {
    const wrap = el('div', {}, el('div', { class: 'phone' }, el('img', { src: `img/${name}-first.png`, alt: `${label}: first phone screen` })));
    const ph = wrap.firstChild;
    T.keys.forEach(k => {
      const r = data[k]; if (!r || !r.first_screen) return;
      ph.append(el('div', { class: 'box', style: `left:${r.left / 3.9}%;top:${r.top / 8.44}%;width:${r.width / 3.9}%;height:${r.height / 8.44}%` }, el('span', {}, T.labels[k])));
    });
    const missing = T.keys.filter(k => !data[k]?.first_screen).map(k => T.labels[k]);
    wrap.append(el('div', { class: 'cap' }, el('b', {}, `${label}: ${T.keys.length - missing.length}/7 in the first screen. `), missing.length ? `Below it or missing: ${missing.join(', ')}.` : 'Nothing needed for the decision is below it.'));
    return wrap;
  }
  const row = k => el('tr', {}, el('td', {}, T.labels[k]),
    ...['before', 'after'].flatMap(n => { const r = T.first[n][k]; return [el('td', { class: r?.first_screen ? 'y' : 'n' }, r?.first_screen ? '✓' : '✗'), el('td', { class: r?.above_atc ? 'y' : 'n' }, r?.present ? (r.above_atc ? '✓' : '✗ below') : '✗ missing')]; }));
  P.pdp.append(el('h2', {}, 'A product page built around the buying decision'),
    el('p', { class: 'sub' }, 'Same product, same brand, two structures. Left: the order a typical Shopify theme gives you. Right: the order a customer actually answers questions in. Boxes mark what fits in the first phone screen; the dashed line is the fold.'),
    el('div', { class: 'phones' }, phone('before', B, 'Typical theme'), phone('after', A, 'Decision-led'),
      el('div', { class: 'stack' },
        el('div', { class: 'card' }, el('h3', {}, 'The question order'),
          el('ol', { class: 'order' }, el('li', {}, 'What is it, and why this one?'), el('li', {}, 'Do people like it?'), el('li', {}, 'Which size, and why that one? (per-serving price, or try the kit first)'), el('li', {}, 'Which flavour?'), el('li', {}, 'Once, or regularly? And can I stop?'), el('li', {}, 'What exactly will I pay? (per kg, per serving)'), el('li', {}, 'Add.')),
          el('p', { class: 'note' }, 'Everything needed for those seven sits above the button. Ingredients, evidence, how to use and review detail move lower: they support a decision, they don\'t start one.')),
        el('div', { class: 'card' }, el('table', { class: 't' },
          el('thead', {}, el('tr', {}, el('th', {}, 'Decision item'), el('th', {}, 'Typical: first screen'), el('th', {}, 'above button'), el('th', {}, 'Decision-led: first screen'), el('th', {}, 'above button'))),
          el('tbody', {}, T.keys.map(row), el('tr', {}, el('td', {}, 'Subscription terms stated'), el('td', { class: 'n', colspan: 2 }, '✗ only a "How subscriptions work" link'), el('td', { class: 'y', colspan: 2 }, `✓ at ${A.terms.top}px, in the first screen`))))))),
    el('div', { class: 'grid2', style: 'margin-top:20px' },
      el('div', { class: 'card' }, el('h3', {}, 'What moved lower, and where it lands'),
        el('table', { class: 't' }, el('thead', {}, el('tr', {}, el('th', {}, 'Section'), el('th', {}, 'Typical'), el('th', {}, 'Decision-led'))),
          el('tbody', {}, [['Ingredients', 'ingredients'], ['Evidence (authorised claims)', 'evidence'], ['Reviews', 'reviews']].map(([l, k]) => el('tr', {}, el('td', {}, l), el('td', {}, B[k]?.present ? `${B[k].top}px` : 'not on page'), el('td', {}, A[k]?.present ? `${A[k].top}px` : 'not on page'))))),
        el('p', { class: 'note' }, `Typical layout: ingredients sit in a closed accordion and there is no evidence section. Decision-led page height: ${T.doc.after}px vs ${T.doc.before}px; the extra length is below the decision, with the sticky bar keeping Add to cart in reach.`)),
      el('div', { class: 'card desk' }, el('h3', {}, 'The same components on desktop'), el('img', { src: 'img/after-desktop.png', alt: 'Decision-led product page at 1280 px wide' }), el('p', { class: 'note' }, 'Gallery left and sticky, buying decision right. Not a stretched phone layout, not a squeezed desktop one.'))),
    el('h3', { style: 'margin-top:24px' }, 'Try both'),
    el('p', { class: 'note' }, 'Live prototypes. Pick sizes, flavours and subscription, then add to cart.'),
    el('div', { class: 'live' }, el('iframe', { class: 'frame', src: 'proto/before.html', title: 'Typical theme product page prototype', loading: 'lazy' }), el('iframe', { class: 'frame', src: 'proto/after.html', title: 'Decision-led product page prototype', loading: 'lazy' })));
  P.pdp.querySelectorAll('.phone').forEach(ph => ph.append(el('div', { class: 'fold', style: 'top:100%' })));

  /* ---------------- mobile ---------------- */
  const strip = n => el('div', { class: 'strip', 'aria-label': `${n}: Add to cart reachable at ${pct(T.reach[n].reachable_share)} of scroll positions` }, T.reach[n].positions.map(p => el('i', { class: p.reachable ? 'on' : 'off', title: `scrolled ${p.y}px: ${p.reachable ? 'reachable' : 'not reachable'}` }, p.reachable ? '●' : '○')));
  const steps = n => el('ol', { class: 'order' }, T.task[n].steps.map(s => el('li', {}, s)));
  P.mobile.append(el('h2', {}, 'Built as a mobile buying journey, not a collapsed desktop page'),
    el('p', { class: 'sub' }, 'Four checks a thumb cares about, measured on the prototypes in Chromium at 390 × 844.'),
    el('div', { class: 'grid2' },
      el('div', { class: 'card' }, el('h3', {}, 'Is Add to cart within reach while scrolling?'),
        el('p', { class: 'note', style: 'margin:0 0 6px' }, 'Each square is a scroll position, 100 px apart. ● = an Add to cart button fully on screen.'),
        el('div', {}, el('b', {}, `Typical theme · ${pct(T.reach.before.reachable_share)}`), strip('before')),
        el('div', { style: 'margin-top:10px' }, el('b', {}, `Decision-led · ${pct(T.reach.after.reachable_share)}`), strip('after')),
        el('p', { class: 'note' }, 'The sticky bar carries the current choice ("1 kg · Vanilla bean · every 8 wks") so the second Add never surprises anyone, and it hides while the cart is open.')),
      el('div', { class: 'card' }, el('h3', {}, `Taps to "${T.task.goal}"`),
        el('div', { class: 'grid2' }, el('div', {}, el('b', {}, `Typical: ${T.task.before.taps} taps`), steps('before')), el('div', {}, el('b', {}, `Decision-led: ${T.task.after.taps} taps`), steps('after'))),
        el('p', { class: 'note' }, `A native dropdown counts as two taps: open, then choose. Both runs end with the right line in the cart (checked: ${T.task.before.correct && T.task.after.correct ? 'yes' : 'no'}). The typical layout pre-selects 500 g; the decision-led one pre-selects the most chosen size.`))),
    el('div', { class: 'grid2', style: 'margin-top:18px' },
      el('div', { class: 'card' }, el('h3', {}, 'Tap targets under 44 px'),
        el('table', { class: 't' }, el('tbody', {}, el('tr', {}, el('td', {}, 'Typical theme'), el('td', { class: 'n' }, `${T.targets.before.under44} of ${T.targets.before.total}`), el('td', { class: 'note' }, T.targets.before.small.join(', '))),
          el('tr', {}, el('td', {}, 'Decision-led'), el('td', { class: 'y' }, `${T.targets.after.under44} of ${T.targets.after.total}`), el('td', { class: 'note' }, 'Size, flavour, frequency and footer links all ≥ 44 px')))),
        el('p', { class: 'note' }, 'Small size pills and quantity steppers are where thumbs miss on a moving train.')),
      el('div', { class: 'card' }, el('h3', {}, 'The trade-off I made'),
        el('p', { style: 'margin:0' }, 'The gallery gives up height: square (390 px) to 204 px. In exchange, all seven decision items and the button fit in the first screen. Swiping the gallery still shows four images, and the first one is the product mixed in water, because that is the claim the customer is testing.'))),
    el('div', { class: 'shots', style: 'margin-top:20px' },
      el('figure', {}, el('img', { src: 'img/after-sticky.png', alt: 'Sticky add-to-cart bar while reading evidence' }), el('figcaption', { class: 'cap' }, el('b', {}, 'Sticky bar'), ': appears once the main button leaves the screen')),
      el('figure', {}, el('img', { src: 'img/after-drawer.png', alt: 'Cart drawer with a subscription line' }), el('figcaption', { class: 'cap' }, el('b', {}, 'Cart drawer'), ': the subscription and its frequency named in the line; subscriptions ship free')),
      el('figure', {}, el('img', { src: 'img/after-kit-first.png', alt: 'Product page opened with the starter kit pre-selected' }), el('figcaption', { class: 'cap' }, el('b', {}, 'Kit pre-selected'), ': flavour row hides, subscription is replaced by a one-line note'))));

  /* ---------------- landing page ---------------- */
  P.lp.append(el('h2', {}, 'A landing page that continues the ad'),
    el('p', { class: 'sub' }, 'A homepage introduces the brand, a product page closes a decision about one product, and a landing page carries one promise from one ad to one offer. This one is for cold paid-social traffic.'),
    el('div', { class: 'grid3' },
      el('div', { class: 'stack' }, el('div', { class: 'ad' }, el('div', { class: 'lab' }, 'The ad (fictional)'), el('div', { class: 'adimg' }, 'Texture shot: protein mixing in water'), el('div', { class: 'adtxt' }, 'Plant protein that mixes smooth in water.'), el('div', { class: 'adsub' }, 'No chalky aftertaste. Try all three flavours.')),
        el('div', { class: 'card' }, el('h3', {}, 'Measured on the prototype'), el('ul', { class: 'clean' },
          el('li', {}, `Headline, price and button in the first screen (button at ${T.first.lp.atc.top}px).`),
          el('li', {}, `Button in reach at ${pct(T.reach.lp.reachable_share)} of scroll positions.`),
          el('li', {}, `${T.task.lp.taps} tap from button to an open cart with the kit in it.`),
          el('li', {}, `"See full sizes" opens the product page with the size that matches; ?format=kit pre-selects the kit (checked: selected, flavour row hidden, ${T.kit_param.price}).`)))),
      el('iframe', { class: 'frame', src: 'proto/lp.html', title: 'Landing page prototype', loading: 'lazy' }),
      el('div', { class: 'card' }, el('h3', {}, 'Why it is in this order'), el('ol', { class: 'seq' },
        el('li', {}, el('b', {}, 'Message match. '), 'Same words and same image as the ad, so the visitor knows they are in the right place.'),
        el('li', {}, el('b', {}, 'Offer for cold traffic. '), 'A low-risk kit, clearly a one-time purchase. A stranger is not asked to subscribe.'),
        el('li', {}, el('b', {}, 'Proof of the one claim. '), 'The 10-second texture test, then reviews filtered to texture.'),
        el('li', {}, el('b', {}, 'Objections, named. '), 'Gritty, earthy, long ingredient list: answered in the brand\'s voice, no countdown timers.'),
        el('li', {}, el('b', {}, 'What arrives. '), 'Kit contents, so the price feels like a thing.'),
        el('li', {}, el('b', {}, 'What happens next. '), 'The path from kit to 1 kg and an optional subscription, stated without pressure.'),
        el('li', {}, el('b', {}, 'Questions, then the same button. '), 'One offer, repeated, never a second competing one.')))),
    el('div', { class: 'card', style: 'margin-top:18px' }, el('h3', {}, 'Homepage, collection, product page, landing page: different jobs'),
      el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Page', 'Arrives from', 'Its job', 'Main action', 'Leaves out'].map(h => el('th', {}, h)))),
        el('tbody', {}, [
          ['Homepage', 'Brand search, direct, returning', 'Orient: who you are, what to buy first', 'Go to a product or collection', 'Long product education'],
          ['Collection', 'Navigation, browse', 'Compare: help choose between products', 'Open the right product page', 'Brand story'],
          ['Product page', 'Collections, search, returning, some ads', 'Close the decision on one product', 'Add a configured item to cart', 'Other offers competing with the button'],
          ['Landing page', 'One ad, one audience', 'Carry the ad\'s promise to one offer', 'Take that offer', 'Navigation, other products, other offers']].map(r => el('tr', {}, r.map(c => el('td', {}, c))))))));

  /* ---------------- German rules ---------------- */
  const law = (title, src, rule, design, where) => el('div', { class: 'card' }, el('h3', {}, title, el('small', {}, src)),
    el('dl', {}, el('dt', {}, 'The rule'), el('dd', {}, rule), el('dt', {}, 'What it changes'), el('dd', {}, design), el('dt', {}, 'In the prototype'), el('dd', {}, where)));
  P.de.append(el('h2', {}, 'The German rules that shape the design'),
    el('p', { class: 'sub' }, 'These are design constraints, not a legal review: confirm the details with your adviser. Knowing them up front means the redesign does not create an Abmahnung risk while fixing conversion.'),
    el('div', { class: 'law' },
      law('Unit price at a glance', 'PAngV §4, §5', 'Goods sold by weight or volume show a price per 1 kg or 1 l (no longer per 100 g), unmistakable, clearly visible and legible: total price and unit price at a glance. A separate link or a mouse-over does not count. Mixed goods such as gift baskets are exempt.',
        'The unit price is part of the price block and updates with every size and purchase option, including the subscription price. It never moves into an accordion to save space on mobile.', '"38,61 € · 38,61 €/kg · 1,17 € per serving". The kit shows "mixed kit incl. shaker"; confirm its treatment with your adviser.'),
      law('Subscriptions and the cancel button', '§312k BGB · Fair Consumer Contracts Act', 'Since 1 July 2022, subscriptions sold online need a "Verträge hier kündigen" button reachable from every page, leading to a "jetzt kündigen" confirmation. Since 1 March 2022, contracts may only renew silently for an indefinite period, cancellable with at most one month\'s notice. In July 2026 the BGH ruled that the confirmation page may not carry pause or discount offers.',
        '"Cancel online any time" is a promise the law already makes you keep, so it belongs next to the Subscribe option as reassurance, not in small print. Retention offers belong before the decision, not on the cancel page.', 'Terms under the purchase options; "Verträge hier kündigen" in every footer; FAQ explains pause, skip and cancel.'),
      law('Health claims: only authorised wording', 'Reg. (EC) 1924/2006 · Reg. (EU) 432/2012', 'Health claims must come from the EU register of authorised claims. For protein there are three: growth in muscle mass, maintenance of muscle mass, maintenance of normal bones, for foods that are at least a source of protein.',
        'Moving "evidence" higher on the page moves its claims higher too. The evidence block uses register wording; the rest of the education stays descriptive: taste, texture, routine. "Supports recovery" is not an authorised protein claim.', '"What it does" uses two of the three protein claims, verbatim.'),
      law('Strike-through prices', 'PAngV §11', 'When a price reduction is advertised, the lowest price of the previous 30 days must be shown.',
        'Offer communication (bundles, launch prices, campaign landing pages) is designed with the 30-day reference built in, rather than added later as a footnote.', 'The prototypes use no strike-through prices; the subscription saving is shown as its own price.')),
    el('p', { class: 'note', style: 'margin-top:14px' }, 'Sources: Händlerbund on §312k BGB and the BGH ruling of 16 July 2026; Händlerbund on the rules from 1 March 2022; e-recht24 on PAngV unit prices; §11 PAngV; Commission Regulation (EU) No 432/2012.'));

  /* ---------------- components ---------------- */
  P.comp.append(el('h2', {}, 'Reusable components, with their states'),
    el('p', { class: 'sub' }, 'What Phase 3 delivers in Figma: each component with its states and the rule behind it, so your developer builds behaviour, not just a picture. Shown here in the prototype\'s neutral style; the real ones wear your brand.'),
    el('iframe', { class: 'comp', src: 'proto/components.html', title: 'Component states', loading: 'lazy' }));

  /* ---------------- plan ---------------- */
  P.plan.append(el('h2', {}, 'How I would diagnose your store before redesigning it'),
    el('div', { class: 'grid2' },
      el('div', { class: 'card' }, el('h3', {}, 'Week 1: diagnosis'), el('ol', { class: 'order' },
        el('li', {}, el('b', {}, 'Split the funnel '), 'by device, landing page and new vs returning, to find whether momentum is lost before add to cart (product page) or after it (cart).'),
        el('li', {}, el('b', {}, 'Watch 40-60 mobile sessions '), 'on the landing pages that take the most ad spend, noting where people hesitate, backtrack or open the same accordion twice.'),
        el('li', {}, el('b', {}, 'Read the customers\' words: '), 'reviews, support tickets and on-site search, tagged by objection (taste, texture, price per serving, cancelling).'),
        el('li', {}, el('b', {}, 'Buy every product '), 'on a mid-range Android and an iPhone, starter kit and subscription included, and check the cart, emails and the cancel flow.'),
        el('li', {}, el('b', {}, 'Write the friction map: '), 'each issue with its evidence, its confidence and its likely fix, plus what does not need changing, and the recommended scope.'))),
      el('div', { class: 'card' }, el('h3', {}, 'What I do'),
        el('ul', { class: 'clean' }, el('li', {}, el('b', {}, 'Strategy and UX: '), 'the diagnosis, the friction map, wireframes.'), el('li', {}, el('b', {}, 'Design: '), 'desktop and mobile in Figma, reusable components with states, developer specs, in your existing brand.'), el('li', {}, el('b', {}, 'Shopify: '), 'Online Store 2.0 sections as an optional Phase 4, or a clean handover to your developer.')),
        el('p', { class: 'note' }, 'Not included: copywriting beyond structure and microcopy, photography, and analytics engineering.'))),
    el('h3', { style: 'margin-top:24px' }, 'Initial CRO review, priority product page and one landing page'),
    el('div', { class: 'phase' },
      el('div', { class: 'card' }, el('div', { class: 'note' }, 'Phase 1 · weeks 1-1.5'), el('h3', {}, 'Diagnosis'), el('div', { class: 'price' }, '$1,400'), el('p', { class: 'note' }, 'Friction map, mobile and product page findings, landing page opportunity, recommended scope.')),
      el('div', { class: 'card' }, el('div', { class: 'note' }, 'Phase 2 · weeks 2-3'), el('h3', {}, 'UX and wireframes'), el('div', { class: 'price' }, '$1,400'), el('p', { class: 'note' }, 'Priority product page structure, mobile treatment, campaign landing page, cart tweaks if needed.')),
      el('div', { class: 'card' }, el('div', { class: 'note' }, 'Phase 3 · weeks 4-5'), el('h3', {}, 'High-fidelity design'), el('div', { class: 'price' }, '$2,000'), el('p', { class: 'note' }, 'Desktop and mobile Figma, components with states, developer specs, brand preserved.'))),
    el('p', { style: 'margin-top:12px' }, el('b', {}, '$4,800 fixed, 5 weeks. '), el('span', { class: 'note' }, 'If Phase 1 shows the structure is sound, Phases 2-3 stay targeted rather than growing into a redesign.')));

  select(location.hash.slice(1) || 'map');
})();
