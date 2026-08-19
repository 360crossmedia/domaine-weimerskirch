/* DOMAINE WEIMERSKIRCH — réservation de visite.
   Calendrier réel : fermé dimanche-lundi, vendanges du 25/09 au 02/11,
   deux créneaux par jour. Démo : la réservation reste en localStorage,
   avec un fichier .ics à ajouter au calendrier. */

const CRENEAUX = ['10 h 30', '15 h 00'];
const HEURES_ICS = { '10 h 30': [10, 30], '15 h 00': [15, 0] };
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_MAX = 6;

const etat = { date: null, creneau: null, convives: 2 };

function estFerme(d) {
  const jour = d.getDay(); /* 0 dim, 1 lun */
  if (jour === 0 || jour === 1) return true;
  const m = d.getMonth(), j = d.getDate();
  /* vendanges : 25 septembre → 2 novembre */
  if ((m === 8 && j >= 25) || m === 9 || (m === 10 && j <= 2)) return true;
  return false;
}

function memeJour(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function calendrier() {
  const grille = document.querySelector('[data-cal-grille]');
  if (!grille) return;
  const titreMois = document.querySelector('[data-cal-mois]');
  const prec = document.querySelector('[data-cal-prec]');
  const suiv = document.querySelector('[data-cal-suiv]');

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  let vue = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
  const vueMin = new Date(vue);
  const vueMax = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + MOIS_MAX, 1);

  function rendre() {
    titreMois.textContent = vue.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    prec.disabled = vue <= vueMin;
    suiv.disabled = vue >= vueMax;

    let html = JOURS.map((j) => `<span class="calendrier__jour-nom">${j}</span>`).join('');
    const premier = new Date(vue);
    const decalage = (premier.getDay() + 6) % 7; /* lundi en tête */
    html += '<span></span>'.repeat(decalage);

    const nbJours = new Date(vue.getFullYear(), vue.getMonth() + 1, 0).getDate();
    for (let j = 1; j <= nbJours; j++) {
      const d = new Date(vue.getFullYear(), vue.getMonth(), j);
      const passe = d <= aujourdhui; /* pas de résa le jour même */
      const ferme = estFerme(d);
      const choisi = memeJour(d, etat.date);
      html += `<button type="button" class="calendrier__jour" data-jour="${d.toISOString()}"
        ${passe || ferme ? 'disabled' : ''} aria-pressed="${choisi}"
        aria-label="${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${ferme ? ' — fermé' : ''}">${j}</button>`;
    }
    grille.innerHTML = html;
  }

  prec.addEventListener('click', () => { vue = new Date(vue.getFullYear(), vue.getMonth() - 1, 1); rendre(); });
  suiv.addEventListener('click', () => { vue = new Date(vue.getFullYear(), vue.getMonth() + 1, 1); rendre(); });

  grille.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-jour]');
    if (!bouton) return;
    etat.date = new Date(bouton.dataset.jour);
    etat.creneau = null;
    rendre();
    creneaux();
    verifier();
  });

  rendre();
}

function creneaux() {
  const zone = document.querySelector('[data-creneaux]');
  const texte = document.querySelector('[data-resa-date-txt]');
  if (!zone) return;

  if (!etat.date) { zone.innerHTML = ''; return; }

  texte.textContent = etat.date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  zone.innerHTML = CRENEAUX.map((c) =>
    `<button type="button" data-creneau="${c}" aria-pressed="${etat.creneau === c}">${c}</button>`
  ).join('');

  zone.querySelectorAll('[data-creneau]').forEach((b) => {
    b.addEventListener('click', () => {
      etat.creneau = b.dataset.creneau;
      zone.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      verifier();
    });
  });
}

function convives() {
  const moins = document.querySelector('[data-conv-moins]');
  const plus = document.querySelector('[data-conv-plus]');
  const sortie = document.querySelector('[data-conv-nb]');
  if (!moins) return;
  moins.addEventListener('click', () => { etat.convives = Math.max(2, etat.convives - 1); sortie.textContent = etat.convives; });
  plus.addEventListener('click', () => { etat.convives = Math.min(6, etat.convives + 1); sortie.textContent = etat.convives; });
}

function verifier() {
  const bouton = document.querySelector('[data-resa-envoyer]');
  if (bouton) bouton.disabled = !(etat.date && etat.creneau);
}

/* ---------- Fichier .ics ------------------------------------------------- */

function fichierICS(ref) {
  const [h, mn] = HEURES_ICS[etat.creneau];
  const debut = new Date(etat.date); debut.setHours(h, mn, 0, 0);
  const fin = new Date(debut.getTime() + 90 * 60 * 1000);
  const f = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0')
    + 'T' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '00';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Domaine Weimerskirch//Visites//FR',
    'BEGIN:VEVENT',
    'UID:' + ref + '@domaine-weimerskirch.lu',
    'DTSTAMP:' + f(new Date()),
    'DTSTART:' + f(debut),
    'DTEND:' + f(fin),
    'SUMMARY:Visite du Domaine Weimerskirch (' + etat.convives + ' pers.)',
    'LOCATION:12 rue de la Moselle\\, L-5480 Wormeldange-Haut\\, Luxembourg',
    'DESCRIPTION:Cave\\, coteau du Koeppchen et dégustation des sept cuvées. Référence ' + ref + '. Prévoir des chaussures qui tiennent.',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
}

/* ---------- Envoi --------------------------------------------------------- */

function envoi() {
  const form = document.querySelector('[data-form-resa]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!(etat.date && etat.creneau)) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const ref = 'VIS-' + String(Date.now()).slice(-6);
    const donnees = new FormData(form);
    localStorage.setItem('weimerskirch-resa', JSON.stringify({
      ref, date: etat.date.toISOString(), creneau: etat.creneau, convives: etat.convives,
      nom: donnees.get('prenom') + ' ' + donnees.get('nom'), langue: donnees.get('langue')
    }));

    document.querySelector('[data-resa]').hidden = true;
    const conf = document.querySelector('[data-resa-confirmation]');
    conf.hidden = false;
    document.querySelector('[data-resa-ref]').textContent = 'Référence ' + ref;
    document.querySelector('[data-resa-recap]').textContent =
      etat.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      + ' à ' + etat.creneau + ', ' + etat.convives + ' personnes. '
      + 'Visite en ' + donnees.get('langue').toLowerCase() + ', 18 € par personne, déduits à la première commande.';
    document.querySelector('[data-resa-ics]').href = fichierICS(ref);
    conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  calendrier();
  creneaux();
  convives();
  envoi();
});
