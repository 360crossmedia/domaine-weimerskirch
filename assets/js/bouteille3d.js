/* DOMAINE WEIMERSKIRCH — la bouteille, modélisée.
   Flûte de Moselle tournée en LatheGeometry, verre physique, étiquette
   peinte sur canvas, capsule aux couleurs de la cuvée choisie.
   Si WebGL ou le CDN manquent : on prévient la boutique, qui pose une
   bouteille dessinée à la place. */

const conteneur = document.querySelector('[data-scene3d]');

function echec() {
  if (conteneur) conteneur.dispatchEvent(new CustomEvent('bouteille3d-echec', { bubbles: true }));
}

if (!conteneur) {
  /* pas de scène sur cette page */
} else {
  init().catch((e) => { console.warn('Bouteille 3D indisponible :', e.message); echec(); });
}

async function init() {
  const THREE = await import('../vendor/three.module.js');
  const { RoomEnvironment } = await import('../vendor/RoomEnvironment.js');

  const canvas = conteneur.querySelector('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch { echec(); return; }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(26, 3 / 4, 0.1, 50);
  camera.position.set(0, 1.4, 8.6);
  camera.lookAt(0, 1.25, 0);

  /* Lumières : une lampe chaude en douche, un liseré froid à contre */
  const lampe = new THREE.SpotLight(0xffd9a8, 260, 0, Math.PI / 5, 0.45, 2);
  lampe.position.set(2.6, 5.5, 2.2);
  scene.add(lampe);
  const contre = new THREE.DirectionalLight(0x8fa3b8, 1.4);
  contre.position.set(-3.5, 2.2, -3);
  scene.add(contre);
  scene.add(new THREE.AmbientLight(0x2a2018, 2.2));

  const groupe = new THREE.Group();
  scene.add(groupe);

  /* ---------- Le profil de la flûte (rayon, hauteur) ---------- */
  const profil = [
    [0.001, 0], [0.34, 0], [0.42, 0.015], [0.44, 0.06],
    [0.44, 1.55], [0.43, 1.75], [0.38, 1.95], [0.30, 2.14],
    [0.21, 2.32], [0.145, 2.52], [0.115, 2.72], [0.105, 2.92],
    [0.105, 3.06], [0.115, 3.1], [0.115, 3.16], [0.001, 3.16]
  ].map(([r, y]) => new THREE.Vector2(r, y));

  const verre = new THREE.Mesh(
    new THREE.LatheGeometry(profil, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x3a2c16,
      transmission: 0.7,
      thickness: 1.2,
      attenuationColor: new THREE.Color(0x5a3d18),
      attenuationDistance: 1.6,
      roughness: 0.08,
      ior: 1.5,
      specularIntensity: 1,
      envMapIntensity: 1.1
    })
  );
  groupe.add(verre);

  /* Le vin dans le verre : un cylindre sombre à l'intérieur du corps */
  const vin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.9, 48),
    new THREE.MeshStandardMaterial({ color: 0x1c1206, roughness: 0.35 })
  );
  vin.position.y = 1.0;
  groupe.add(vin);

  /* ---------- Capsule, refaite à chaque cuvée ---------- */
  let capsule = null;
  function poserCapsule(couleurs) {
    if (capsule) { groupe.remove(capsule); capsule.geometry.dispose(); capsule.material.dispose(); }
    const profilCapsule = [
      [0.128, 2.78], [0.128, 3.08], [0.135, 3.1], [0.135, 3.19], [0.001, 3.19]
    ].map(([r, y]) => new THREE.Vector2(r, y));
    capsule = new THREE.Mesh(
      new THREE.LatheGeometry(profilCapsule, 64),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(couleurs[1]),
        metalness: 0.82,
        roughness: 0.28,
        envMapIntensity: 1.2
      })
    );
    groupe.add(capsule);
  }

  /* ---------- Étiquette : un canvas peint, collé en bande ---------- */
  const toile = document.createElement('canvas');
  toile.width = 1024; toile.height = 640;
  const etiquetteTexture = new THREE.CanvasTexture(toile);
  etiquetteTexture.colorSpace = THREE.SRGBColorSpace;
  etiquetteTexture.anisotropy = 8;

  function peindreEtiquette(p) {
    const g = toile.getContext('2d');
    g.fillStyle = '#efe7d6';
    g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = '#c9b691'; g.lineWidth = 6;
    g.strokeRect(26, 26, 972, 588);
    g.strokeStyle = '#8a5c2c'; g.lineWidth = 3;
    /* le sceau */
    g.beginPath(); g.arc(512, 150, 62, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 8; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(478, 128); g.lineTo(496, 180); g.lineTo(512, 142); g.lineTo(528, 180); g.lineTo(546, 128);
    g.stroke();
    /* les textes */
    g.fillStyle = '#2c2013';
    g.textAlign = 'center';
    g.font = '86px Marcellus, Georgia, serif';
    g.fillText(p.nom, 512, 330);
    g.fillStyle = '#7a5f38';
    g.font = '34px Jost, sans-serif';
    g.fillText(p.cepage.split('·')[0].trim().toUpperCase().split('').join('  '), 512, 408);
    g.fillStyle = '#a08d64';
    g.font = '26px Jost, sans-serif';
    g.fillText('WORMELDANGE · MOSELLE · 2023', 512, 470);
    g.strokeStyle = '#c9b691'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(330, 520); g.lineTo(694, 520); g.stroke();
    etiquetteTexture.needsUpdate = true;
  }

  const etiquette = new THREE.Mesh(
    new THREE.CylinderGeometry(0.452, 0.452, 0.78, 64, 1, true, -0.95, 1.9),
    new THREE.MeshStandardMaterial({ map: etiquetteTexture, roughness: 0.7, side: THREE.FrontSide })
  );
  etiquette.position.y = 0.86;
  groupe.add(etiquette);

  /* L'assise : un disque d'ombre douce */
  const ombreToile = document.createElement('canvas');
  ombreToile.width = ombreToile.height = 256;
  const og = ombreToile.getContext('2d');
  const degrade = og.createRadialGradient(128, 128, 10, 128, 128, 128);
  degrade.addColorStop(0, 'rgba(0,0,0,0.55)');
  degrade.addColorStop(1, 'rgba(0,0,0,0)');
  og.fillStyle = degrade; og.fillRect(0, 0, 256, 256);
  const ombre = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ombreToile), transparent: true, depthWrite: false })
  );
  ombre.rotation.x = -Math.PI / 2;
  ombre.position.y = 0.001;
  scene.add(ombre);

  /* ---------- Cuvée courante ---------- */
  const premiere = {
    nom: 'Koeppchen', cepage: 'Riesling · Grand Premier Cru',
    capsule: ['#f2d49c', '#e6b87e', '#8a5c2c']
  };
  await document.fonts.ready;
  peindreEtiquette(premiere);
  poserCapsule(premiere.capsule);

  window.bouteille3D = {
    changerCuvee(p) { peindreEtiquette(p); poserCapsule(p.capsule); }
  };

  /* ---------- Rotation : glisser, sinon elle tourne seule ---------- */
  let vitesse = 0.32, glisse = null, inertie = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { glisse = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (glisse === null) return;
    const delta = e.clientX - glisse;
    glisse = e.clientX;
    groupe.rotation.y += delta * 0.012;
    inertie = delta * 0.012;
  });
  const lacher = () => { glisse = null; };
  canvas.addEventListener('pointerup', lacher);
  canvas.addEventListener('pointercancel', lacher);

  /* ---------- Taille et boucle ---------- */
  function tailler() {
    const rect = conteneur.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(tailler).observe(conteneur);
  tailler();

  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const horloge = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = horloge.getDelta();
    if (glisse === null) {
      inertie *= 0.94;
      groupe.rotation.y += (reduit ? 0 : vitesse * dt) + inertie;
    }
    renderer.render(scene, camera);
  });
}
