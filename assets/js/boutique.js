/* DOMAINE WEIMERSKIRCH — boutique : produits, panier, commande.
   Panier en localStorage ; aucun paiement, c'est un squelette. */

const PRODUITS = [
  { id: 'koeppchen',   nom: 'Koeppchen',   cepage: 'Riesling · Grand Premier Cru', prix: 34,
    desc: 'Le haut de pente. Citron confit, pierre mouillée, finale saline.',
    capsule: ['#f2d49c', '#e6b87e', '#8a5c2c'], robe: 'blanc', tampon: 'GRAND PREMIER CRU' },
  { id: 'uewer-bierg', nom: 'Uewer Bierg', cepage: 'Riesling', prix: 19,
    desc: 'Le plateau de 2016. Vif, direct, à boire jeune.',
    capsule: ['#f0f0ee', '#c9c9c4', '#6f6f68'], robe: 'blanc' },
  { id: 'nussbaum',    nom: 'Nussbaum',    cepage: 'Pinot gris', prix: 22,
    desc: 'Poire mûre, fumé léger, finale sèche.',
    capsule: ['#eec39c', '#d08a5a', '#77401f'], robe: 'blanc' },
  { id: 'marnes',      nom: 'Les Marnes',  cepage: 'Auxerrois', prix: 14,
    desc: 'Le vin de tous les jours, rond et discret.',
    capsule: ['#f7f2e6', '#e6d9bb', '#8f8161'], robe: 'blanc' },
  { id: 'am-ufer',     nom: 'Am Ufer',     cepage: 'Elbling · vieilles vignes', prix: 11,
    desc: 'Tranchant, léger, parfait au casse-croûte.',
    capsule: ['#d8e4d8', '#a9c0a9', '#506850'], robe: 'blanc', tampon: 'VIEILLES VIGNES 1976' },
  { id: 'palmberg',    nom: 'Palmberg',    cepage: 'Pinot noir', prix: 28,
    desc: 'Cerise acidulée, tanin fin, aucun bois neuf.',
    capsule: ['#413d46', '#26222c', '#0e0c12'], robe: 'rouge', rare: '1 800 bouteilles', tampon: '1 800 BOUTEILLES' },
  { id: 'cremant',     nom: 'Brut Nature', cepage: 'Crémant de Luxembourg', prix: 24,
    desc: 'Trente mois sur lattes, zéro dosage.',
    capsule: ['#fdf6e3', '#f3e3bb', '#a08d54'], robe: 'blanc', mousseux: true }
];

const CLE = 'weimerskirch-panier';
const eur = (n) => n.toLocaleString('fr-FR') + ' €';

/* ---------- Bouteille SVG : flûte de Moselle, capsule par cuvée -------- */

function bouteilleSVG(p, hauteur = 220) {
  const [c1, c2, c3] = p.capsule;
  const u = p.id;
  const large = p.mousseux; /* le crémant est plus épaulé */
  const corps = large
    ? 'M44 88 C36 96 28 112 28 142 L28 336 Q28 360 60 360 Q92 360 92 336 L92 142 C92 112 84 96 76 88 L76 82 L44 82 Z'
    : 'M48 90 C41 98 34 114 34 146 L34 338 Q34 360 60 360 Q86 360 86 338 L86 146 C86 114 79 98 72 90 L72 84 L48 84 Z';
  const goulotX = large ? 44 : 48;
  const goulotL = large ? 32 : 24;
  return `<svg viewBox="0 0 120 376" style="height:${hauteur}px" aria-hidden="true">
  <defs>
    <linearGradient id="verre-${u}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0c0a07"/>
      <stop offset="0.18" stop-color="#241c11"/>
      <stop offset="0.42" stop-color="#3a2e1a"/>
      <stop offset="0.6" stop-color="#241c11"/>
      <stop offset="0.85" stop-color="#0e0b08"/>
      <stop offset="1" stop-color="#080605"/>
    </linearGradient>
    <linearGradient id="capsule-${u}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c3}"/>
      <stop offset="0.35" stop-color="${c1}"/>
      <stop offset="0.6" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="reflet-${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(244,239,233,0.32)"/>
      <stop offset="1" stop-color="rgba(244,239,233,0.04)"/>
    </linearGradient>
  </defs>
  <!-- goulot -->
  <rect x="${goulotX}" y="26" width="${goulotL}" height="62" rx="3" fill="url(#verre-${u})"/>
  <!-- capsule -->
  <rect x="${goulotX - 2}" y="12" width="${goulotL + 4}" height="30" rx="3" fill="url(#capsule-${u})"/>
  <rect x="${goulotX - 2}" y="38" width="${goulotL + 4}" height="2.2" fill="rgba(0,0,0,0.3)"/>
  <!-- corps -->
  <path d="${corps}" fill="url(#verre-${u})"/>
  <!-- reflet -->
  <path d="M${large ? 34 : 40} 104 C${large ? 31 : 37} 124 ${large ? 30 : 36} 144 ${large ? 30 : 36} 172 L${large ? 30 : 36} 316 L${large ? 39 : 44} 316 L${large ? 39 : 44} 126 Z" fill="url(#reflet-${u})" opacity="0.5"/>
  <!-- étiquette -->
  <g>
    <rect x="${large ? 32 : 34}" y="206" width="${large ? 56 : 52}" height="74" rx="1.5" fill="#efe7d6"/>
    <rect x="${large ? 32 : 34}" y="206" width="${large ? 56 : 52}" height="74" rx="1.5" fill="none" stroke="#c9b691" stroke-width="0.8"/>
    <circle cx="60" cy="226" r="8.5" fill="none" stroke="#8a5c2c" stroke-width="0.9"/>
    <path d="M55 222 L58 231 L60 225.5 L62 231 L65 222" fill="none" stroke="#8a5c2c" stroke-width="1.1" stroke-linejoin="round"/>
    <text x="60" y="250" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="${p.nom.length > 9 ? 9 : 11}" fill="#2c2013">${p.nom}</text>
    <text x="60" y="263" text-anchor="middle" font-family="Jost, sans-serif" font-size="4.6" letter-spacing="0.8" fill="#7a5f38">${p.cepage.split('·')[0].trim().toUpperCase()}</text>
    <text x="60" y="272" text-anchor="middle" font-family="Jost, sans-serif" font-size="4" letter-spacing="0.6" fill="#a08d64">WORMELDANGE · MOSELLE</text>
  </g>
</svg>`;
}


/* Les bouteilles générées, une par cuvée — composite en secours (crémant) */
/* chemins littéraux : le build monopage les convertit en data-URI */
const FLACONS_PHOTO = {
  'koeppchen':   'assets/img/flacon-koeppchen.png',
  'uewer-bierg': 'assets/img/flacon-uewer-bierg.png',
  'nussbaum':    'assets/img/flacon-nussbaum.png',
  'marnes':      'assets/img/flacon-marnes.png',
  'am-ufer':     'assets/img/flacon-am-ufer.png',
  'palmberg':    'assets/img/flacon-palmberg.png'
};
function flaconHTML(p, hauteur = 230) {
  if (FLACONS_PHOTO[p.id]) {
    return `<div class="flacon flacon--photo" style="height:${hauteur}px">
    <img src="${FLACONS_PHOTO[p.id]}" alt="Bouteille de ${p.nom}">
  </div>`;
  }
  const [c1, c2, c3] = p.capsule;
  return `<div class="flacon" style="height:${hauteur}px;--flacon-h:${hauteur}px">
    <img src="assets/img/bouteille.png" alt="">
    <span class="flacon__cou" style="background:linear-gradient(105deg, ${c3}, ${c1} 45%, ${c2})"></span>
    <span class="flacon__etq">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="none" stroke="#8a5c2c" stroke-width="1.6"/>
        <path d="M11 13 L16.5 28 L20 17.5 L23.5 28 L29 13" fill="none" stroke="#8a5c2c" stroke-width="2.4" stroke-linejoin="round"/>
      </svg>
      <span class="flacon__nom">${p.nom}</span>
      <span class="flacon__cepage">${p.cepage.split('·')[0].trim()}</span>
    </span>
  </div>`;
}

/* ---------- Panier ------------------------------------------------------ */

function lirePanier() {
  try { return JSON.parse(localStorage.getItem(CLE)) || {}; }
  catch { return {}; }
}
function ecrirePanier(p) {
  localStorage.setItem(CLE, JSON.stringify(p));
  majBadge();
}
function nbBouteilles(p = lirePanier()) {
  return Object.values(p).reduce((somme, quantite) => somme + quantite, 0);
}
function sousTotal(p = lirePanier()) {
  return Object.entries(p).reduce((somme, [id, quantite]) => {
    const produit = PRODUITS.find((x) => x.id === id);
    return somme + (produit ? produit.prix * quantite : 0);
  }, 0);
}
function majBadge() {
  const lien = document.querySelector('[data-panier-lien]');
  if (!lien) return;
  const n = nbBouteilles();
  lien.dataset.vide = String(n === 0);
  lien.textContent = n === 0 ? 'Panier' : `Panier · ${n}`;
}

function ajouter(id, quantite) {
  const p = lirePanier();
  p[id] = (p[id] || 0) + quantite;
  if (p[id] <= 0) delete p[id];
  ecrirePanier(p);
}

/* ---------- Rayon (page boutique) --------------------------------------- */

function rendreRayon() {
  const rayon = document.querySelector('[data-rayon]');
  if (!rayon) return;

  rayon.innerHTML = PRODUITS.map((p) => `
    <article class="produit" id="${p.id}">
      ${p.tampon ? `<span class="tampon"><span>${p.tampon}</span></span>` : ''}
      <div style="margin-bottom:1.2rem">${flaconHTML(p, 220)}</div>
      <span class="produit__cepage">${p.cepage}</span>
      <h3>${p.nom}</h3>
      <p class="produit__desc">${p.desc}${p.rare ? ` <em style="color:var(--or);font-style:normal">${p.rare}.</em>` : ''}</p>
      <p class="produit__prix">${eur(p.prix)} <small>/ bouteille</small></p>
      <div class="produit__ajout">
        <div class="stepper">
          <button type="button" data-moins aria-label="Une bouteille de moins">−</button>
          <output>1</output>
          <button type="button" data-plus aria-label="Une bouteille de plus">+</button>
        </div>
        <button class="bouton--plein" type="button" data-ajouter="${p.id}">Ajouter</button>
      </div>
    </article>`).join('');

  rayon.addEventListener('click', (e) => {
    const carte = e.target.closest('.produit');
    if (!carte) return;
    const sortie = carte.querySelector('output');
    let n = parseInt(sortie.value || sortie.textContent, 10);
    if (e.target.closest('[data-moins]')) { n = Math.max(1, n - 1); sortie.textContent = n; }
    if (e.target.closest('[data-plus]'))  { n = Math.min(24, n + 1); sortie.textContent = n; }
    const bouton = e.target.closest('[data-ajouter]');
    if (bouton) {
      ajouter(bouton.dataset.ajouter, n);
      sortie.textContent = 1;
      ouvrirTiroir();
    }
  });
}

/* ---------- Sélecteur de cuvée pour la scène 3D -------------------------- */

function rendreChoixCuvee() {
  const zone = document.querySelector('[data-cuvee-choix]');
  if (!zone) return;
  zone.innerHTML = PRODUITS.map((p, i) => `
    <button type="button" data-cuvee="${p.id}" aria-pressed="${i === 0}"
      style="display:inline-flex;align-items:center;gap:0.55rem;background:none;cursor:pointer;
             border:1px solid ${i === 0 ? 'rgba(168,95,40,0.6)' : 'var(--ligne)'};border-radius:1px;
             color:var(--encre);font:inherit;font-size:0.82rem;padding:0.5rem 0.9rem;transition:border-color 250ms ease">
      <span style="width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%, ${p.capsule[0]}, ${p.capsule[1]} 50%, ${p.capsule[2]})"></span>
      ${p.nom}
    </button>`).join('');

  zone.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-cuvee]');
    if (!bouton) return;
    zone.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b === bouton));
      b.style.borderColor = b === bouton ? 'rgba(168,95,40,0.6)' : 'var(--ligne)';
    });
    const p = PRODUITS.find((x) => x.id === bouton.dataset.cuvee);
    if (window.bouteille3D) window.bouteille3D.changerCuvee(p);
  });
}

/* ---------- Tiroir ------------------------------------------------------- */

function rendreTiroir() {
  const lignes = document.querySelector('[data-tiroir-lignes]');
  const total = document.querySelector('[data-tiroir-total]');
  if (!lignes) return;
  const p = lirePanier();
  const entrees = Object.entries(p);

  lignes.innerHTML = entrees.length === 0
    ? '<p class="tiroir__vide">Le panier est vide.<br>Les capsules attendent en dessous.</p>'
    : entrees.map(([id, quantite]) => {
        const produit = PRODUITS.find((x) => x.id === id);
        if (!produit) return '';
        return `
        <div class="ligne-panier">
          <div class="capsule" style="background:radial-gradient(circle at 35% 30%, ${produit.capsule[0]}, ${produit.capsule[1]} 50%, ${produit.capsule[2]})"></div>
          <div>
            <p class="ligne-panier__nom">${produit.nom}</p>
            <p class="ligne-panier__detail">
              <span class="stepper">
                <button type="button" data-t-moins="${id}" aria-label="Une de moins">−</button>
                <output>${quantite}</output>
                <button type="button" data-t-plus="${id}" aria-label="Une de plus">+</button>
              </span>
              <button type="button" data-t-retirer="${id}">retirer</button>
            </p>
          </div>
          <p class="ligne-panier__prix">${eur(produit.prix * quantite)}</p>
        </div>`;
      }).join('');

  if (total) total.textContent = eur(sousTotal(p));
}

function ouvrirTiroir() {
  const tiroir = document.querySelector('[data-tiroir]');
  const voile = document.querySelector('[data-voile]');
  if (!tiroir) { location.href = 'boutique.html#panier'; return; }
  rendreTiroir();
  tiroir.hidden = false; voile.hidden = false;
  requestAnimationFrame(() => { tiroir.dataset.ouvert = 'true'; voile.dataset.ouvert = 'true'; });
}
function fermerTiroir() {
  const tiroir = document.querySelector('[data-tiroir]');
  const voile = document.querySelector('[data-voile]');
  if (!tiroir) return;
  delete tiroir.dataset.ouvert; delete voile.dataset.ouvert;
  setTimeout(() => { tiroir.hidden = true; voile.hidden = true; }, 460);
}

function brancherTiroir() {
  const tiroir = document.querySelector('[data-tiroir]');
  if (!tiroir) return;
  document.querySelector('[data-tiroir-fermer]')?.addEventListener('click', fermerTiroir);
  document.querySelector('[data-voile]')?.addEventListener('click', fermerTiroir);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerTiroir(); });

  tiroir.addEventListener('click', (e) => {
    const moins = e.target.closest('[data-t-moins]');
    const plus = e.target.closest('[data-t-plus]');
    const retirer = e.target.closest('[data-t-retirer]');
    if (moins) ajouter(moins.dataset.tMoins, -1);
    if (plus) ajouter(plus.dataset.tPlus, 1);
    if (retirer) { const p = lirePanier(); delete p[retirer.dataset.tRetirer]; ecrirePanier(p); }
    if (moins || plus || retirer) rendreTiroir();
  });

  if (location.hash === '#panier' && nbBouteilles() > 0) ouvrirTiroir();
  document.querySelector('[data-panier-lien]')?.addEventListener('click', (e) => {
    e.preventDefault(); ouvrirTiroir();
  });
}

/* ---------- Commande ------------------------------------------------------ */

function rendreCommande() {
  const zone = document.querySelector('[data-commande]');
  if (!zone) return;
  const vide = document.querySelector('[data-commande-vide]');
  const p = lirePanier();
  const entrees = Object.entries(p);

  if (entrees.length === 0) { zone.hidden = true; vide.hidden = false; return; }

  const lignes = document.querySelector('[data-recap-lignes]');
  const st = sousTotal(p);
  lignes.innerHTML = entrees.map(([id, quantite]) => {
    const produit = PRODUITS.find((x) => x.id === id);
    return `<div class="recap__ligne"><span><strong>${quantite} ×</strong> ${produit.nom}</span><output>${eur(produit.prix * quantite)}</output></div>`;
  }).join('');
  document.querySelector('[data-recap-soustotal]').textContent = eur(st);

  const majTotal = () => {
    const livraison = document.querySelector('input[name="mode"]:checked').value === 'livraison';
    const port = livraison ? (st >= 120 ? 0 : 12) : 0;
    document.querySelector('[data-recap-mode-txt]').textContent =
      livraison ? (port === 0 ? 'Livraison — offerte' : 'Livraison Benelux') : 'Enlèvement au domaine';
    document.querySelector('[data-recap-port]').textContent = eur(port);
    document.querySelector('[data-recap-total]').textContent = eur(st + port);
    document.querySelector('[data-champ-adresse]').hidden = !livraison;
    const adresse = document.getElementById('adresse');
    if (adresse) adresse.required = livraison;
  };
  document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', majTotal));
  majTotal();

  document.querySelector('[data-form-commande]').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const ref = 'WMK-' + String(Date.now()).slice(-6);
    localStorage.removeItem(CLE);
    majBadge();
    zone.hidden = true;
    const conf = document.querySelector('[data-confirmation]');
    conf.hidden = false;
    document.querySelector('[data-confirmation-ref]').textContent = 'Référence ' + ref;
    conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ---------- Départ -------------------------------------------------------- */

/* La scène : la bouteille photo, habillée par la cuvée choisie */
function sceneFlacon() {
  const scene = document.querySelector('[data-scene3d]');
  if (!scene) return;
  const poser = (p) => {
    scene.innerHTML = `<div style="display:grid;place-items:center;height:100%">${flaconHTML(p, 440)}</div>
      <p style="text-align:center;font-size:0.72rem;letter-spacing:0.24em;text-transform:uppercase;color:var(--terre);margin:0.8rem 0 0">La cuvée choisie habille la bouteille</p>`;
  };
  poser(PRODUITS[0]);
  window.bouteille3D = { changerCuvee: poser };
}

/* Les fiches cuvées (page Vins) : la vraie bouteille remplace le médaillon. */
function vitrineCuvees() {
  document.querySelectorAll('.cuvee[id]').forEach((el) => {
    if (el.querySelector('.flacon')) return;
    const p = PRODUITS.find((x) => x.id === el.id);
    if (!p) return;
    const porte = document.createElement('div');
    porte.className = 'cuvee__flacon';
    porte.innerHTML = flaconHTML(p, 215);
    const caps = el.querySelector('.capsule');
    if (caps) caps.replaceWith(porte); else el.prepend(porte);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  majBadge();
  sceneFlacon();
  rendreRayon();
  rendreChoixCuvee();
  vitrineCuvees();
  brancherTiroir();
  rendreCommande();
});

/* Le badge sur toutes les pages : site.js ne connaît pas la boutique,
   donc on exporte le minimum. */
window.panierWeimerskirch = { nbBouteilles, majBadge };
window.vitrineCuvees = vitrineCuvees;
