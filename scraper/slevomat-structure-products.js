const SIZE_TOKEN_RE = /\/\d+x\d+c\//; // matches `/320x160c/`, `/640x320c/` etc.
const HIGH_RES_TOKEN = '/1280x640c/'; // or e.g. '/944x472c/'

const products = Array.from(document.querySelectorAll('article.product')).map(article => {
  const ga4Raw = article.getAttribute('data-slevomat-gtm-ga4-item-data') || '{}';
  let ga4 = {};
  try {
    ga4 = JSON.parse(ga4Raw);
  } catch (e) {
    const txt = document.createElement('textarea');
    txt.innerHTML = ga4Raw;
    try { ga4 = JSON.parse(txt.value); } catch (e2) { ga4 = {}; }
  }

  const link = article.querySelector('a.product__link');
  const url = link ? link.href : null;

  const nameEl = article.querySelector('.product__name-text, .product__name');
  const name = nameEl ? nameEl.textContent.trim().replace(/\s+/g, ' ') : null;

  const brandEl = article.querySelector('.product__info span:first-child');
  const brand = brandEl ? brandEl.textContent.trim() : null;

  const ratingEl = article.querySelector('.product__rating');
  const ratingText = ratingEl ? ratingEl.textContent.trim() : null;
  const rating = ratingText
    ? parseFloat(ratingText.replace(',', '.'))
    : (ga4.item_rating ? parseFloat(String(ga4.item_rating).replace(',', '.')) : null);

  const ratingCountEl = article.querySelector('.product__rating-counter');
  const ratingCount = ratingCountEl
    ? parseInt(ratingCountEl.textContent.replace(/\D+/g, ''), 10) || null
    : null;

  const currentPriceEl = article.querySelector('.product__extra-price, .product__label--price');
  const currentPrice = currentPriceEl
    ? parseFloat(currentPriceEl.textContent.replace(/\s|Kč/g, '').replace(',', '.'))
    : (ga4.price || null);

  const originalPriceEl = article.querySelector('.product__discount-price, .product__price-original');
  const originalPrice = originalPriceEl
    ? parseFloat(originalPriceEl.textContent.replace(/\s|Kč/g, '').replace(',', '.'))
    : (ga4.price_original || null);

  const dataSpans = Array.from(article.querySelectorAll('.product__data'));
  const dataTexts = dataSpans.map(s => s.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);

  let image = null;

  const sourceEl = article.querySelector('picture source');
  if (sourceEl) {
    const srcset = sourceEl.getAttribute('srcset') || '';
    if (srcset) {
      let candidate = srcset.split(',')[0].trim().split(' ')[0];
      if (SIZE_TOKEN_RE.test(candidate)) {
        candidate = candidate.replace(SIZE_TOKEN_RE, HIGH_RES_TOKEN);
      }
      image = candidate;
    }
  }

  if (!image) {
    const noScriptImg = article.querySelector('picture noscript img');
    if (noScriptImg) {
      let candidate = noScriptImg.getAttribute('src');
      if (candidate && SIZE_TOKEN_RE.test(candidate)) {
        candidate = candidate.replace(SIZE_TOKEN_RE, HIGH_RES_TOKEN);
      }
      image = candidate;
    }
  }

  if (image && image.startsWith('/')) {
    image = location.origin + image;
  }

  return {
    item_name: ga4.item_name || name,
    item_brand: ga4.item_brand || brand,
    item_category: ga4.item_category || null,
    item_category2: ga4.item_category2 || null,
    price: currentPrice,
    price_without_vat: ga4.price_without_vat || null,
    url,
    name,
    brand,
    rating,
    ratingCount,
    originalPrice,
    personsAndNights: dataTexts,
    image
  };
});

console.log(JSON.stringify(products, null, 2));
products;
