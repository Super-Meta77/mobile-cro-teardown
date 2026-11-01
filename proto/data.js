// FICTIONAL brand and product data for the wireframes. Prices in EUR; unit prices per kg (PAngV reference unit).
window.KALMO = {
  formats: {
    kit:   { id: 'kit',  name: 'Starter kit', meta: '3 flavours · 6 sachets + shaker', price: 14.90, grams: 180, servings: 6, sub: false },
    g500:  { id: 'g500', name: '500 g', meta: '16 servings', price: 24.90, grams: 500, servings: 16, sub: true },
    kg1:   { id: 'kg1',  name: '1 kg', meta: '33 servings', price: 42.90, grams: 1000, servings: 33, sub: true, tag: 'Most chosen' },
  },
  flavours: ['Cacao', 'Vanilla bean', 'Unflavoured'],
  subDiscount: 0.10,
  freeShipFrom: 40,
};
window.eur = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
window.perKg = (price, grams) => window.eur(price / grams * 1000) + '/kg';
