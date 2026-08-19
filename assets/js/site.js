/* DOMAINE WEIMERSKIRCH — comportements communs. Aucune dépendance. */

function menu() {
  const bouton = document.querySelector('[data-bouton-menu]');
  const nav = document.querySelector('[data-nav]');
  if (!bouton || !nav) return;

  const basculer = (ouvrir) => {
    nav.dataset.ouvert = String(ouvrir);
    bouton.setAttribute('aria-expanded', String(ouvrir));
    bouton.textContent = ouvrir ? 'Fermer' : 'Menu';
    document.body.style.overflow = ouvrir ? 'hidden' : '';
  };

  bouton.addEventListener('click', () => basculer(nav.dataset.ouvert !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') basculer(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') basculer(false); });
}

/* La barre gagne son fond dès qu'on quitte le haut de page */
function barre() {
  const b = document.querySelector('[data-barre]');
  if (!b || b.classList.contains('barre--posee')) return;
  const maj = () => { b.dataset.fond = String(scrollY > 8); };
  addEventListener('scroll', maj, { passive: true });
  maj();
}

function apparitions() {
  const cibles = document.querySelectorAll('[data-apparait]');
  if (!cibles.length) return;
  /* cascade : les éléments d'une même section se lèvent l'un après l'autre */
  document.querySelectorAll('.section, .lignee, .cave, .rayon, .galerie').forEach((zone) => {
    zone.querySelectorAll(':scope [data-apparait]').forEach((el, i) => {
      el.style.setProperty('--cascade', Math.min(i, 5));
    });
  });
  if (!('IntersectionObserver' in window)) {
    cibles.forEach((c) => (c.dataset.vu = 'true'));
    return;
  }
  const obs = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.dataset.vu = 'true';
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  cibles.forEach((c) => obs.observe(c));
}

/* Badge panier sur toutes les pages — la boutique tient le vrai panier,
   ici on ne fait que lire le compte. */
function badgePanier() {
  const lien = document.querySelector('[data-panier-lien]');
  if (!lien || window.panierWeimerskirch) return; /* boutique.js s'en charge */
  let n = 0;
  try {
    const p = JSON.parse(localStorage.getItem('weimerskirch-panier')) || {};
    n = Object.values(p).reduce((s, q) => s + q, 0);
  } catch {}
  lien.dataset.vide = String(n === 0);
  if (n > 0) lien.textContent = `Panier · ${n}`;
}

function formulaire() {
  const form = document.querySelector('[data-formulaire]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const retour = form.querySelector('[data-retour]');
    if (retour) {
      retour.textContent = 'Message reçu. Anne ou Tom vous répond sous deux jours ouvrés.';
      retour.hidden = false;
    }
    form.reset();
  });
}

/* Parallaxe : les photos de héros et de respiration glissent moins vite
   que la page. Coupée si l'utilisateur préfère éviter le mouvement. */
function parallaxe() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heros = document.querySelector('.heros__photo');
  const bandes = [...document.querySelectorAll('.respiration img')];
  if (!heros && !bandes.length) return;
  let demande = false;
  const rendre = () => {
    demande = false;
    if (heros) heros.style.translate = '0 ' + (scrollY * 0.22).toFixed(1) + 'px';
    bandes.forEach((img) => {
      const cadre = img.parentElement.getBoundingClientRect();
      const progression = (cadre.top + cadre.height / 2 - innerHeight / 2) / innerHeight;
      img.style.translate = '0 ' + (progression * cadre.height * 0.18).toFixed(1) + 'px';
    });
  };
  addEventListener('scroll', () => {
    if (!demande) { demande = true; requestAnimationFrame(rendre); }
  }, { passive: true });
  rendre();
}


/* La liane de la lignée : une gravure à l'encre — un seul trait souple,
   feuilles de vigne lobées au trait, vrilles en spirale, grappes gravées.
   Monochrome cuivre, comme l'horizon du pied de page. */
function vigneLignee() {
  const zone = document.querySelector('.lignee');
  if (!zone || zone.querySelector('.vigne-lignee')) return;
  const d = document.createElement('div');
  d.className = 'vigne-lignee';
  d.style.cssText = 'position:absolute;left:calc(50% - 55px);top:0;width:110px;height:100%;' +
    "z-index:0;pointer-events:none;background-image:url('assets/img/vigne-verticale.png');" +
    'background-repeat:repeat-y;background-size:110px auto;background-position:center top;' +
    'opacity:0.92;-webkit-mask-image:linear-gradient(to bottom, transparent, black 150px, black calc(100% - 170px), transparent);mask-image:linear-gradient(to bottom, transparent, black 150px, black calc(100% - 170px), transparent)';
  zone.appendChild(d);
}


/* L'horizon gravé : le Koeppchen, lisible comme une gravure de livre */
function horizon() {
  const pied = document.querySelector('.pied');
  if (!pied || document.querySelector('.horizon')) return;
  pied.insertAdjacentHTML('beforebegin', `
  <div class="horizon" aria-hidden="true">
    <img src="assets/img/horizon-grave.png" alt="" loading="lazy"
      style="display:block;width:min(1080px,92%);margin:0 auto;opacity:0.92">
    <p class="horizon__legende">Saint-Donat, le Koeppchen et la Moselle</p>
  </div>`);
}


/* Le vent entre les pièces : au départ vers une autre page, quelques
   feuilles de vigne traversent l'écran, la page part en fondu. */
function vent() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const FEUILLE_OR = '%23c49a52', FEUILLE_VERTE = '%23657a44';
  const feuilleURI = (c) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-16 -34 32 36'%3E%3Cpath d='M0 0 C -3 -4 -12 -3 -13 -10 C -19 -11 -19 -19 -14 -21 C -16 -27 -9 -31 -5 -28 C -4 -34 4 -34 5 -28 C 9 -31 16 -27 14 -21 C 19 -19 19 -11 13 -10 C 12 -3 3 -4 0 0 Z' fill='${c}' opacity='0.9'/%3E%3C/svg%3E")`;

  window.envolee = (x, y) => {
    const x0 = x ?? innerWidth * 0.2, y0 = y ?? innerHeight * 0.5;
    for (let i = 0; i < 6; i++) {
      const f = document.createElement('i');
      const t = 26 + Math.random() * 34;
      f.className = 'feuille-vent';
      f.style.cssText = `width:${t}px;height:${t}px;background-image:${feuilleURI(Math.random() > 0.45 ? FEUILLE_OR : FEUILLE_VERTE)};
        left:${x0 - 20 + Math.random() * 40}px; top:${y0 - 16 + Math.random() * 32}px;
        --derive:${(Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 22)}vh; --tour:${420 + Math.random() * 520}deg;
        animation-duration:${840 + Math.random() * 460}ms; animation-delay:${Math.random() * 140}ms`;
      document.body.appendChild(f);
      setTimeout(() => f.remove(), 1700);
    }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$=".html"], a[href*=".html#"]');
    if (!a || a.origin !== location.origin) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault();
    window.envolee(e.clientX, e.clientY);
    document.documentElement.classList.add('page-depart');
    setTimeout(() => { location.href = a.href; }, 620);
  });
}

addEventListener('load', () => {
  const v = document.querySelector('.vigne-lignee');
  if (v) { v.remove(); vigneLignee(); }
});


/* Le carnet des millésimes : défilement par flèches. */
function carnet() {
  const livre = document.querySelector('[data-livre]');
  if (!livre || livre.dataset.branche) return;
  livre.dataset.branche = 'true';
  const pas = () => (livre.querySelector('.livre__an')?.getBoundingClientRect().width || 360) + 40;
  document.querySelector('[data-carnet-prec]')?.addEventListener('click', () => livre.scrollBy({ left: -pas(), behavior: 'smooth' }));
  document.querySelector('[data-carnet-suiv]')?.addEventListener('click', () => livre.scrollBy({ left: pas(), behavior: 'smooth' }));
}

/* Sauts d'ancre internes : compatibles avec le routage par ancre de la
   version monopage (on n'utilise pas location.hash). */
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-va-carnet]');
  if (!a) return;
  const cible = document.getElementById('carnet');
  if (cible) { e.preventDefault(); cible.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  if (document.getElementById('app')) {
    e.preventDefault();
    location.hash = '#histoire';
    setTimeout(() => document.getElementById('carnet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
  }
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-saut]');
  if (!a) return;
  const cible = document.getElementById(a.dataset.saut);
  if (cible) { e.preventDefault(); cible.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

document.addEventListener('DOMContentLoaded', () => {
  menu();
  barre();
  apparitions();
  parallaxe();
  vigneLignee();
  horizon();
  vent();
  badgePanier();
  formulaire();
  carnet();
});
