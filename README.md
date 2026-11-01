# Mobile CRO teardown (sample)

A worked conversion and UX sample for a Shopify DTC wellness brand, built on a **fictional** protein brand ("Kalmo").
Reviews, ratings and nutrition values in the prototypes are placeholders. Nothing here is a real store.

## What it contains
* `site/`: the tabbed teardown (friction map, product page before/after, mobile details, landing page, German rules,
  components, approach and price). Static, deploy as-is. A 2-page PDF is at `site/teardown-sample.pdf`.
* `proto/`: the clickable prototypes: `before.html` (typical theme order), `after.html` (decision-led, responsive to
  desktop), `lp.html` (campaign landing page), `components.html` (component states).
* `measure/measure.mjs`: Playwright measurements in Chromium at a 390 x 844 viewport.

## Measured on the prototypes
| | Typical theme | Decision-led |
|---|---|---|
| Decision items fully in the first phone screen (of 7) | 4 | 7 |
| Taps to add "1 kg, Vanilla bean, subscribe every 8 weeks" (native dropdown = 2) | 7 | 4 |
| Scroll positions (every 100 px) with an Add to cart button fully on screen | 57% | 100% |
| Tap targets under 44 px | 6 of 15 | 0 of 15 |
Landing page: headline, price and button in the first screen; 1 tap to an open cart; `?format=kit` pre-selects the kit.

Found while prototyping: a 10% subscription discount takes 1 kg from 42,90 EUR to 38,61 EUR, under a 40 EUR
free-shipping threshold. The prototype ships subscriptions free.

## Not measured
Conversion rates. These are structural measurements of prototypes, not results from a live store or an A/B test.

## Run
```bash
node measure/measure.mjs && python3 build.py   # needs Playwright's Chromium
```

## German / EU references used (design constraints, not legal advice)
* Kündigungsbutton, §312k BGB, BGH 16 July 2026: https://www.haendlerbund.de/de/ratgeber/recht/kuendigungsbutton-nach-312k-bgb
* Contract extension rules from 1 March 2022: https://www.haendlerbund.de/de/news/aktuelles/rechtliches/4088-maerz-regeln-kuendigung-vertragsverlaengerung
* Grundpreis (PAngV 2022): https://www.e-recht24.de/ecommerce/13092-preisangabenverordnung.html
* §11 PAngV (30-day lowest price): https://gesetze.legal/bund/pangv/11
* Authorised health claims, Reg. (EU) 432/2012: https://www.legislation.gov.uk/eur/2012/432/pdfs/eur_20120432_adopted_en.pdf
