(() => {
  "use strict";

  if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radii) {
      const r = Array.isArray(radii) ? Number(radii[0] || 0) : Number(radii || 0);
      const radius = Math.min(Math.abs(width) / 2, Math.abs(height) / 2, r);
      this.moveTo(x + radius, y);
      this.arcTo(x + width, y, x + width, y + height, radius);
      this.arcTo(x + width, y + height, x, y + height, radius);
      this.arcTo(x, y + height, x, y, radius);
      this.arcTo(x, y, x + width, y, radius);
      this.closePath();
      return this;
    };
  }


  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const intro = $("#intro");
  const world = $("#world");
  const cloudEntry = $("#cloudEntry");
  const transitionClouds = $("#transitionClouds");
  const particlesLayer = $("#burstParticles");
  const worldCanvas = $("#worldCanvas");
  const mapIntro = $("#mapIntro");
  const projectIndex = $("#projectIndex");
  const islandTitle = $("#islandTitle");
  const islandName = $("#islandName");
  const islandType = $("#islandType");
  const islandTagline = $("#islandTagline");
  const hotspots = $("#hotspots");
  const storyPanel = $("#storyPanel");
  const storyClose = $("#storyClose");
  const storyNext = $("#storyNext");
  const backIsland = $("#backIsland");
  const mapButton = $("#mapButton");
  const brandHome = $("#brandHome");
  const soundToggle = $("#soundToggle");
  const locationLabel = $("#locationLabel span:last-child");
  const toast = $("#toast");

  const ctx = worldCanvas.getContext("2d", { alpha: false });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let lastTime = performance.now();
  let worldStarted = false;
  let activeProject = null;
  let activePhase = null;
  let hoverProject = null;
  let pointerDown = false;
  let dragMoved = false;
  let dragStart = { x: 0, y: 0 };
  let cameraStart = { x: 0, y: 0 };
  let audioContext = null;
  let soundEnabled = false;

  const camera = {
    x: 0,
    y: 0,
    zoom: 0.78,
    targetX: 0,
    targetY: 0,
    targetZoom: 0.78
  };

  const phases = ["house", "person", "animal"];

  const projects = {
    bloop: {
      id: "bloop",
      name: "Bloop",
      type: "Event discovery · Product design",
      tagline: "Un’isola sociale dove scoprire cosa succede davvero intorno a te.",
      x: -420,
      y: -70,
      radius: 220,
      rotation: -0.10,
      colors: {
        cliff: "#976fc9",
        sand: "#ffe1a8",
        land: "#a98be9",
        land2: "#7d62c7",
        accent: "#ff775c",
        water: "#77c9ea"
      },
      phasePositions: {
        house: { x: -72, y: -30 },
        person: { x: 49, y: 38 },
        animal: { x: 90, y: -70 }
      },
      phases: {
        house: {
          number: "01",
          kicker: "Fondamenta · Problem framing",
          title: "Il caos prima della scoperta.",
          copy: "Eventi sparsi tra stories, passaparola e siti diversi. La sfida era costruire un punto d’accesso locale, immediato e non promozionale.",
          facts: [
            "Discovery basata su rilevanza, distanza e momento.",
            "RSVP gratuito con capienza e rilasci programmati.",
            "Strumenti dedicati anche ai piccoli organizzatori."
          ]
        },
        person: {
          number: "02",
          kicker: "Esperienza · UX flow",
          title: "Tre gesti dalla curiosità all’RSVP.",
          copy: "La persona entra, riconosce il contesto, capisce se l’evento fa per lei e conferma la partecipazione senza attraversare un labirinto.",
          facts: [
            "Feed Per te, Oggi e Popolare.",
            "Mappa, filtri e schede evento leggibili.",
            "QR personale e wallet dei propri RSVP."
          ]
        },
        animal: {
          number: "03",
          kicker: "Carattere · Brand behavior",
          title: "Curiosa, leggera, locale.",
          copy: "La creatura di Bloop è un uccello esploratore: si muove, osserva e collega luoghi diversi. È la metafora del prodotto e della community.",
          facts: [
            "Tono fresco ma mai infantile.",
            "Palette lilla, corallo e luce naturale.",
            "Microinterazioni che premiano la scoperta."
          ]
        }
      }
    },
    merqorn: {
      id: "merqorn",
      name: "Merqorn",
      type: "B2B software · Product strategy",
      tagline: "Un’isola operativa: meno attrito, più controllo, dati che servono davvero.",
      x: 370,
      y: -155,
      radius: 235,
      rotation: 0.08,
      colors: {
        cliff: "#9a4b21",
        sand: "#ffd4a6",
        land: "#ff9147",
        land2: "#d9621f",
        accent: "#202025",
        water: "#72c3e3"
      },
      phasePositions: {
        house: { x: -58, y: -57 },
        person: { x: 60, y: 40 },
        animal: { x: 78, y: -58 }
      },
      phases: {
        house: {
          number: "01",
          kicker: "Fondamenta · Service design",
          title: "Il software parte dall’azienda.",
          copy: "Prima dei wireframe vengono i processi reali: fogli Excel, passaggi manuali, responsabilità e decisioni che oggi vivono nella testa delle persone.",
          facts: [
            "Osservazione sul campo prima della progettazione.",
            "Mappatura di dati, ruoli e colli di bottiglia.",
            "MVP costruito sui processi ad alto impatto."
          ]
        },
        person: {
          number: "02",
          kicker: "Esperienza · Operational UX",
          title: "Ogni schermata deve far decidere.",
          copy: "Dashboard e flussi non mostrano semplicemente dati. Rispondono a domande operative: cosa sta andando storto, dove intervenire e cosa succede dopo.",
          facts: [
            "Gerarchia visiva orientata all’azione.",
            "Complessità progressiva per utenti diversi.",
            "Design system modulare e verticale."
          ]
        },
        animal: {
          number: "03",
          kicker: "Carattere · Product logic",
          title: "La volpe osserva prima di agire.",
          copy: "Il carattere Merqorn è intelligente, pragmatico e umano. Non promette magia: elimina lavoro inutile e rende visibili le scelte.",
          facts: [
            "Identità tech ma accessibile.",
            "Metafore visive legate a costruzione e orbite.",
            "Tono diretto, giovane e competente."
          ]
        }
      }
    },
    dreambase: {
      id: "dreambase",
      name: "Dreambase",
      type: "Wellness concept · Experience design",
      tagline: "Un’isola notturna dove la tecnologia si abbassa di volume.",
      x: 30,
      y: 365,
      radius: 225,
      rotation: -0.02,
      colors: {
        cliff: "#3c3b72",
        sand: "#ddd8ef",
        land: "#6866a6",
        land2: "#44437b",
        accent: "#b79aff",
        water: "#74c2df"
      },
      phasePositions: {
        house: { x: -68, y: -43 },
        person: { x: 42, y: 45 },
        animal: { x: 91, y: -55 }
      },
      phases: {
        house: {
          number: "01",
          kicker: "Fondamenta · Ecosystem",
          title: "Un rituale, non un’altra dashboard.",
          copy: "Il progetto collega dispositivo e app senza trasformare il sonno in una performance. Il sistema accompagna, suggerisce e poi scompare.",
          facts: [
            "Pairing semplice tra hardware e app.",
            "Programmi di luce, suono e respirazione.",
            "Esperienza serale a basso carico cognitivo."
          ]
        },
        person: {
          number: "02",
          kicker: "Esperienza · Calm interaction",
          title: "Poche decisioni nel momento giusto.",
          copy: "Di sera l’interfaccia riduce contrasto, testo e scelta. Al risveglio restituisce solo ciò che è utile, senza giudicare la notte appena trascorsa.",
          facts: [
            "Rituali attivabili con un gesto.",
            "Feedback morbidi e non invasivi.",
            "Personalizzazione progressiva."
          ]
        },
        animal: {
          number: "03",
          kicker: "Carattere · Emotional layer",
          title: "La balena si muove senza rumore.",
          copy: "Dreambase prende il carattere da una creatura lenta e profonda. Il prodotto deve trasmettere presenza, calma e protezione.",
          facts: [
            "Toni notturni e bagliori morbidi.",
            "Animazioni sincronizzate con il respiro.",
            "Tecnologia percepita come atmosfera."
          ]
        }
      }
    }
  };

  const islandOrder = ["bloop", "merqorn", "dreambase"];

  const birds = [
    { x: -530, y: -175, t: .1 },
    { x: -340, y: -220, t: 1.2 },
    { x: -440, y: 25, t: 2.1 }
  ];

  const boats = [
    { x: -40, y: -150, angle: .7 },
    { x: 260, y: 210, angle: -1.2 }
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function ensureAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function tone(freq = 260, duration = .08, type = "sine", volume = .025) {
    if (!soundEnabled) return;
    ensureAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    worldCanvas.width = Math.round(width * dpr);
    worldCanvas.height = Math.round(height * dpr);
    worldCanvas.style.width = `${width}px`;
    worldCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function worldToScreen(x, y) {
    return {
      x: width / 2 + (x - camera.x) * camera.zoom,
      y: height / 2 + (y - camera.y) * camera.zoom
    };
  }

  function screenToWorld(x, y) {
    return {
      x: camera.x + (x - width / 2) / camera.zoom,
      y: camera.y + (y - height / 2) / camera.zoom
    };
  }

  function roundedPolygonPath(cx, cy, radius, seed = 1, count = 18, squeezeY = .68) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const wave =
        1 +
        Math.sin(angle * 3 + seed) * .07 +
        Math.sin(angle * 5 - seed * 1.7) * .05 +
        Math.cos(angle * 2 + seed * .4) * .035;
      points.push({
        x: cx + Math.cos(angle) * radius * wave,
        y: cy + Math.sin(angle) * radius * squeezeY * wave
      });
    }

    ctx.beginPath();
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      const mx = (point.x + next.x) / 2;
      const my = (point.y + next.y) / 2;
      if (index === 0) ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(point.x, point.y, mx, my);
    });
    ctx.closePath();
  }

  function drawOcean(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#a9e4fa");
    gradient.addColorStop(.52, "#79c9e8");
    gradient.addColorStop(1, "#63b8da");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = .17;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;

    const spacing = 48;
    const offset = (time * .012) % spacing;

    for (let y = -spacing; y < height + spacing; y += spacing) {
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 12) {
        const yy = y + offset + Math.sin(x * .018 + time * .0014 + y * .02) * 5;
        if (x === -20) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = .08;
    ctx.strokeStyle = "#205f82";
    for (let x = -100; x < width + 100; x += 105) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(time * .0004) * 25, 0);
      ctx.lineTo(x + 65 + Math.sin(time * .0004) * 25, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawIsland(project, time) {
    const center = worldToScreen(project.x, project.y);
    const r = project.radius * camera.zoom;
    const seed = project.id === "bloop" ? 1.3 : project.id === "merqorn" ? 2.7 : 4.1;
    const hoverScale = hoverProject === project.id && !activeProject ? 1.035 : 1;
    const detailPulse = activeProject === project.id ? 1 + Math.sin(time * .0015) * .004 : 1;
    const radius = r * hoverScale * detailPulse;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(project.rotation);
    ctx.translate(-center.x, -center.y);

    // Underwater glow
    ctx.save();
    ctx.globalAlpha = .18;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 45 * camera.zoom;
    roundedPolygonPath(center.x, center.y + 14 * camera.zoom, radius * 1.10, seed, 20);
    ctx.fillStyle = "#d9f8ff";
    ctx.fill();
    ctx.restore();

    // Shadow
    roundedPolygonPath(center.x + 10 * camera.zoom, center.y + 30 * camera.zoom, radius * 1.02, seed, 20);
    ctx.fillStyle = "rgba(28,88,119,.22)";
    ctx.fill();

    // Cliff extrusion
    roundedPolygonPath(center.x, center.y + 25 * camera.zoom, radius, seed, 20);
    ctx.fillStyle = project.colors.cliff;
    ctx.fill();

    // Cliff striations
    ctx.save();
    ctx.globalAlpha = .18;
    ctx.strokeStyle = "#261e2e";
    ctx.lineWidth = Math.max(1, 2 * camera.zoom);
    for (let i = 0; i < 6; i++) {
      const yy = center.y + (7 + i * 5) * camera.zoom;
      ctx.beginPath();
      ctx.arc(center.x, yy, radius * (.82 - i * .025), 0.2, Math.PI - .18);
      ctx.stroke();
    }
    ctx.restore();

    // Sand rim
    roundedPolygonPath(center.x, center.y, radius, seed, 20);
    ctx.fillStyle = project.colors.sand;
    ctx.fill();

    // Land
    roundedPolygonPath(center.x, center.y - 4 * camera.zoom, radius * .88, seed + .2, 20);
    const landGradient = ctx.createRadialGradient(
      center.x - radius * .25,
      center.y - radius * .28,
      radius * .08,
      center.x,
      center.y,
      radius
    );
    landGradient.addColorStop(0, project.colors.land);
    landGradient.addColorStop(1, project.colors.land2);
    ctx.fillStyle = landGradient;
    ctx.fill();

    drawIslandTexture(project, center, radius, time);

    if (camera.zoom < 1.32 && !activeProject) {
      drawIslandMapLabel(project, center, radius);
    }

    ctx.restore();
  }

  function drawIslandTexture(project, center, radius, time) {
    const scale = camera.zoom;
    const detailMode = activeProject === project.id && camera.zoom > 1.25;

    // Paths
    ctx.save();
    ctx.globalAlpha = .40;
    ctx.strokeStyle = project.colors.sand;
    ctx.lineWidth = Math.max(2, 8 * scale);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(center.x - 62 * scale, center.y + 45 * scale);
    ctx.bezierCurveTo(
      center.x - 30 * scale, center.y + 5 * scale,
      center.x + 20 * scale, center.y + 20 * scale,
      center.x + 78 * scale, center.y - 45 * scale
    );
    ctx.stroke();
    ctx.restore();

    // Trees / vegetation
    const trees = [
      [-94, -28, .9], [-118, 18, .75], [-38, -82, .8],
      [20, -95, .68], [115, 12, .78], [87, 74, .65],
      [-82, 76, .70], [8, 92, .56]
    ];

    trees.forEach(([x, y, s], index) => {
      drawTree(
        center.x + x * scale,
        center.y + y * scale,
        s * scale,
        project.id,
        time + index * 400
      );
    });

    if (project.id === "bloop") drawBloopMotifs(center, scale, detailMode, time);
    if (project.id === "merqorn") drawMerqornMotifs(center, scale, detailMode, time);
    if (project.id === "dreambase") drawDreambaseMotifs(center, scale, detailMode, time);
  }

  function drawTree(x, y, scale, projectId, time) {
    const palette =
      projectId === "bloop" ? ["#3f8c70", "#66b884"] :
      projectId === "merqorn" ? ["#4d7257", "#7fa26b"] :
      ["#2f5368", "#5e7793"];

    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = .95;

    ctx.fillStyle = "rgba(21,37,38,.18)";
    ctx.beginPath();
    ctx.ellipse(4 * scale, 8 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#6a4a34";
    ctx.lineWidth = Math.max(1, 2.3 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 6 * scale);
    ctx.lineTo(Math.sin(time * .001) * 1.5 * scale, -5 * scale);
    ctx.stroke();

    ctx.fillStyle = palette[0];
    ctx.beginPath();
    ctx.arc(-4 * scale, -7 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.arc(5 * scale, -9 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.arc(1 * scale, -15 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette[1];
    ctx.globalAlpha = .75;
    ctx.beginPath();
    ctx.arc(-2 * scale, -15 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHouse(x, y, scale, projectId) {
    const body =
      projectId === "bloop" ? "#fff3df" :
      projectId === "merqorn" ? "#f5eee6" :
      "#dad9e9";
    const roof =
      projectId === "bloop" ? "#ff785d" :
      projectId === "merqorn" ? "#202025" :
      "#24264c";

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(20,34,40,.18)";
    ctx.beginPath();
    ctx.ellipse(6 * scale, 14 * scale, 26 * scale, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = body;
    ctx.fillRect(-19 * scale, -8 * scale, 38 * scale, 31 * scale);

    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(-26 * scale, -7 * scale);
    ctx.lineTo(0, -29 * scale);
    ctx.lineTo(26 * scale, -7 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = projectId === "dreambase" ? "#a989ff" : "#7ab4d2";
    ctx.fillRect(-12 * scale, 1 * scale, 10 * scale, 9 * scale);
    ctx.fillRect(5 * scale, 1 * scale, 9 * scale, 9 * scale);

    ctx.fillStyle = "#6b4b39";
    ctx.fillRect(-4 * scale, 9 * scale, 8 * scale, 14 * scale);

    if (projectId === "merqorn") {
      ctx.strokeStyle = "#ff7d31";
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(-17 * scale, -5 * scale, 34 * scale, 26 * scale);
    }

    ctx.restore();
  }

  function drawPerson(x, y, scale, projectId, time) {
    const shirt =
      projectId === "bloop" ? "#ff785d" :
      projectId === "merqorn" ? "#202025" :
      "#a98cff";

    ctx.save();
    ctx.translate(x, y + Math.sin(time * .003) * 1.2 * scale);

    ctx.fillStyle = "rgba(20,34,40,.17)";
    ctx.beginPath();
    ctx.ellipse(2 * scale, 12 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3e3330";
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 3 * scale);
    ctx.lineTo(-6 * scale, 13 * scale);
    ctx.moveTo(2 * scale, 3 * scale);
    ctx.lineTo(7 * scale, 13 * scale);
    ctx.stroke();

    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-8 * scale, -10 * scale, 16 * scale, 16 * scale, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = "#3e3330";
    ctx.beginPath();
    ctx.moveTo(-7 * scale, -5 * scale);
    ctx.lineTo(-13 * scale, 2 * scale);
    ctx.moveTo(7 * scale, -5 * scale);
    ctx.lineTo(13 * scale, -1 * scale);
    ctx.stroke();

    ctx.fillStyle = "#d99a73";
    ctx.beginPath();
    ctx.arc(0, -16 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#392b2a";
    ctx.beginPath();
    ctx.arc(-1 * scale, -18 * scale, 6 * scale, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawAnimal(x, y, scale, projectId, time) {
    ctx.save();
    ctx.translate(x, y);

    if (projectId === "bloop") {
      const flap = Math.sin(time * .008) * 3 * scale;
      ctx.strokeStyle = "#263b46";
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-1 * scale, 0);
      ctx.quadraticCurveTo(-9 * scale, -8 * scale - flap, -18 * scale, -3 * scale);
      ctx.moveTo(1 * scale, 0);
      ctx.quadraticCurveTo(9 * scale, -8 * scale - flap, 18 * scale, -3 * scale);
      ctx.stroke();
      ctx.fillStyle = "#ffda60";
      ctx.beginPath();
      ctx.arc(0, 0, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (projectId === "merqorn") {
      ctx.fillStyle = "#ad6238";
      ctx.beginPath();
      ctx.ellipse(0, 2 * scale, 13 * scale, 8 * scale, -.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -4 * scale);
      ctx.lineTo(-10 * scale, -14 * scale);
      ctx.lineTo(0, -8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5 * scale, -4 * scale);
      ctx.lineTo(10 * scale, -14 * scale);
      ctx.lineTo(1 * scale, -8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f3dac1";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(13 * scale, 2 * scale, 8 * scale, -1.4, 1.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#8d83c7";
      ctx.beginPath();
      ctx.ellipse(0, 2 * scale, 18 * scale, 8 * scale, -.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(15 * scale, 0);
      ctx.lineTo(26 * scale, -8 * scale);
      ctx.lineTo(24 * scale, 7 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#cfc5ff";
      ctx.lineWidth = Math.max(1, 1.6 * scale);
      ctx.beginPath();
      ctx.moveTo(-6 * scale, -5 * scale);
      ctx.quadraticCurveTo(-10 * scale, -17 * scale, -1 * scale, -14 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBloopMotifs(center, scale, detailMode, time) {
    // Event canopy
    ctx.save();
    ctx.translate(center.x + 15 * scale, center.y - 30 * scale);
    ctx.fillStyle = "rgba(28,47,52,.16)";
    ctx.beginPath();
    ctx.ellipse(5 * scale, 11 * scale, 28 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffe7ae";
    ctx.fillRect(-23 * scale, -2 * scale, 46 * scale, 14 * scale);
    ctx.fillStyle = "#ff785d";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo((-25 + i * 10) * scale, -2 * scale);
      ctx.lineTo((-20 + i * 10) * scale, -18 * scale);
      ctx.lineTo((-15 + i * 10) * scale, -2 * scale);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Tiny cloudEntrys
    for (let i = 0; i < 5; i++) {
      const angle = time * .0003 + i * 1.7;
      const x = center.x + Math.cos(angle) * (90 + i * 7) * scale;
      const y = center.y + Math.sin(angle * 1.2) * (52 + i * 5) * scale;
      ctx.strokeStyle = "rgba(255,255,255,.74)";
      ctx.lineWidth = Math.max(.7, scale);
      ctx.beginPath();
      ctx.arc(x, y, (3 + i % 2 * 2) * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (detailMode) {
      const p = projects.bloop.phasePositions;
      drawHouse(center.x + p.house.x * scale, center.y + p.house.y * scale, .96 * scale, "bloop");
      drawPerson(center.x + p.person.x * scale, center.y + p.person.y * scale, .96 * scale, "bloop", time);
      drawAnimal(center.x + p.animal.x * scale, center.y + p.animal.y * scale, 1.1 * scale, "bloop", time);
    }
  }

  function drawMerqornMotifs(center, scale, detailMode, time) {
    // Data blocks
    const blocks = [
      [-8, -25, 36, 24, "#252528"],
      [36, -5, 28, 40, "#f4e7d8"],
      [-48, 30, 34, 28, "#ffcf98"]
    ];

    blocks.forEach(([x, y, w, h, color], index) => {
      ctx.save();
      ctx.translate(center.x + x * scale, center.y + y * scale);
      ctx.fillStyle = "rgba(30,37,39,.16)";
      ctx.fillRect((-w/2 + 6) * scale, (-h/2 + 8) * scale, w * scale, h * scale);
      ctx.fillStyle = color;
      ctx.fillRect(-w/2 * scale, -h/2 * scale, w * scale, h * scale);
      ctx.fillStyle = index === 0 ? "#ff7d31" : "#d46125";
      ctx.fillRect((-w/2 + 5) * scale, (-h/2 + 5) * scale, (w - 10) * scale, 4 * scale);
      ctx.restore();
    });

    // Orbit line
    ctx.save();
    ctx.strokeStyle = "rgba(32,32,37,.25)";
    ctx.lineWidth = Math.max(1, scale);
    ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, 105 * scale, 57 * scale, .12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (detailMode) {
      const p = projects.merqorn.phasePositions;
      drawHouse(center.x + p.house.x * scale, center.y + p.house.y * scale, .96 * scale, "merqorn");
      drawPerson(center.x + p.person.x * scale, center.y + p.person.y * scale, .96 * scale, "merqorn", time);
      drawAnimal(center.x + p.animal.x * scale, center.y + p.animal.y * scale, 1.05 * scale, "merqorn", time);
    }
  }

  function drawDreambaseMotifs(center, scale, detailMode, time) {
    // Moon pool
    const glow = ctx.createRadialGradient(
      center.x - 10 * scale, center.y - 15 * scale, 2,
      center.x - 10 * scale, center.y - 15 * scale, 45 * scale
    );
    glow.addColorStop(0, "rgba(220,211,255,.95)");
    glow.addColorStop(.4, "rgba(168,139,255,.78)");
    glow.addColorStop(1, "rgba(88,76,153,.12)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(center.x - 10 * scale, center.y - 15 * scale, 42 * scale, 23 * scale, -.15, 0, Math.PI * 2);
    ctx.fill();

    // Stars
    ctx.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 7; i++) {
      const angle = i * 1.7 + .4;
      const x = center.x + Math.cos(angle) * (75 + i * 4) * scale;
      const y = center.y + Math.sin(angle) * (48 + i * 2) * scale;
      const pulse = 1 + Math.sin(time * .003 + i) * .35;
      ctx.beginPath();
      ctx.arc(x, y, (1.4 + (i % 2)) * scale * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    if (detailMode) {
      const p = projects.dreambase.phasePositions;
      drawHouse(center.x + p.house.x * scale, center.y + p.house.y * scale, .96 * scale, "dreambase");
      drawPerson(center.x + p.person.x * scale, center.y + p.person.y * scale, .96 * scale, "dreambase", time);
      drawAnimal(center.x + p.animal.x * scale, center.y + p.animal.y * scale, 1.08 * scale, "dreambase", time);
    }
  }

  function drawIslandMapLabel(project, center, radius) {
    const isHovered = hoverProject === project.id;
    const labelY = center.y + radius * .78;
    const text = project.name;
    ctx.save();
    ctx.font = `700 ${Math.max(11, 15 * camera.zoom)}px Inter, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + 30;
    const boxHeight = Math.max(30, 38 * camera.zoom);

    ctx.fillStyle = isHovered ? "rgba(255,255,255,.94)" : "rgba(255,255,255,.72)";
    ctx.strokeStyle = "rgba(255,255,255,.92)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(center.x - boxWidth / 2, labelY - boxHeight / 2, boxWidth, boxHeight, boxHeight / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1c252a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, center.x, labelY + 1);
    ctx.restore();
  }

  function drawBirds(time) {
    if (activeProject && activeProject !== "bloop") return;

    const project = projects.bloop;
    birds.forEach((bird, index) => {
      const angle = time * .00016 + bird.t;
      const worldX = bird.x + Math.cos(angle + index) * 24;
      const worldY = bird.y + Math.sin(angle * 1.2 + index) * 16;
      const p = worldToScreen(worldX, worldY);
      const s = Math.max(.55, camera.zoom);

      ctx.save();
      ctx.strokeStyle = "rgba(26,55,66,.7)";
      ctx.lineWidth = Math.max(1, 1.6 * s);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x - 6 * s, p.y - 6 * s, p.x - 12 * s, p.y);
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + 6 * s, p.y - 6 * s, p.x + 12 * s, p.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawBoats(time) {
    boats.forEach((boat, index) => {
      const drift = Math.sin(time * .00025 + index) * 16;
      const p = worldToScreen(boat.x + drift, boat.y + drift * .25);
      const s = camera.zoom;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(boat.angle);
      ctx.fillStyle = "rgba(33,76,96,.18)";
      ctx.beginPath();
      ctx.ellipse(4 * s, 7 * s, 15 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f7efe1";
      ctx.beginPath();
      ctx.moveTo(-12 * s, 0);
      ctx.lineTo(12 * s, 0);
      ctx.lineTo(7 * s, 7 * s);
      ctx.lineTo(-7 * s, 7 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7b543a";
      ctx.lineWidth = Math.max(1, 1.4 * s);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -18 * s);
      ctx.stroke();
      ctx.fillStyle = index === 0 ? "#ff785d" : "#9a7cff";
      ctx.beginPath();
      ctx.moveTo(1 * s, -17 * s);
      ctx.lineTo(12 * s, -7 * s);
      ctx.lineTo(1 * s, -7 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function render(time) {
    const dt = Math.min(32, time - lastTime);
    lastTime = time;

    const smoothing = 1 - Math.pow(.001, dt / 1000);
    camera.x = lerp(camera.x, camera.targetX, smoothing);
    camera.y = lerp(camera.y, camera.targetY, smoothing);
    camera.zoom = lerp(camera.zoom, camera.targetZoom, smoothing);

    drawOcean(time);
    drawBoats(time);

    const sorted = Object.values(projects).sort((a, b) => a.y - b.y);
    sorted.forEach(project => drawIsland(project, time));

    drawBirds(time);
    updateHotspotPositions();

    requestAnimationFrame(render);
  }

  function createWorldClouds() {
    const back = $("#cloudBack");
    const front = $("#cloudFront");
    const configs = [
      [back, "22vw", "12%", ".25", "8px", "42s", "-9s"],
      [back, "17vw", "58%", ".18", "10px", "52s", "-27s"],
      [back, "27vw", "78%", ".17", "12px", "58s", "-14s"],
      [front, "33vw", "18%", ".29", "15px", "48s", "-18s"],
      [front, "28vw", "66%", ".24", "18px", "55s", "-36s"]
    ];

    configs.forEach(([parent, w, top, opacity, blur, duration, delay]) => {
      const cloud = document.createElement("div");
      cloud.className = "world-cloud";
      cloud.style.setProperty("--w", w);
      cloud.style.setProperty("--opacity", opacity);
      cloud.style.setProperty("--blur", blur);
      cloud.style.setProperty("--duration", duration);
      cloud.style.setProperty("--delay", delay);
      cloud.style.top = top;
      cloud.innerHTML = "<i></i>";
      parent.appendChild(cloud);
    });
  }

  function createBurstParticles() {
    const rect = cloudEntry.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const count = window.innerWidth < 700 ? 28 : 46;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("i");
      particle.className = "burst-particle";
      const angle = (Math.PI * 2 * i) / count + Math.random() * .26;
      const distance = rect.width * (.36 + Math.random() * .9);
      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--size", `${4 + Math.random() * 17}px`);
      particle.style.setProperty("--duration", `${.55 + Math.random() * .55}s`);
      particle.style.setProperty("--rotate", `${Math.random() * 480 - 240}deg`);
      particlesLayer.appendChild(particle);
      setTimeout(() => particle.remove(), 1300);
    }
  }

  function enterWorld() {
    if (worldStarted) return;
    worldStarted = true;
    cloudEntry.classList.add("entering");
    tone(610, .08, "sine", .03);
    setTimeout(() => tone(180, .45, "sine", .045), 120);

    setTimeout(() => {
      transitionClouds.classList.add("active");
    }, 260);

    setTimeout(() => {
      world.classList.remove("hidden");
      world.classList.add("world-ready");
      resizeCanvas();
      createWorldClouds();
      requestAnimationFrame(render);
      locationLabel.textContent = "Project archipelago";
      mapButton.classList.remove("hidden");
    }, 900);

    setTimeout(() => {
      intro.classList.add("hidden");
    }, 1400);

    setTimeout(() => {
      transitionClouds.classList.remove("active");
      showToast("Benvenuto nell’arcipelago.");
    }, 2950);
  }

  function resetToIntro() {
    closeStory();
    activeProject = null;
    activePhase = null;
    hoverProject = null;
    camera.x = camera.targetX = 0;
    camera.y = camera.targetY = 0;
    camera.zoom = camera.targetZoom = .78;
    world.classList.remove("world-ready");
    world.classList.add("hidden");
    intro.classList.remove("hidden");
    cloudEntry.classList.remove("entering");
    mapButton.classList.add("hidden");
    worldStarted = false;
    $("#cloudBack").innerHTML = "";
    $("#cloudFront").innerHTML = "";
    locationLabel.textContent = "Above the clouds";
    showMapUI();
  }

  function selectProject(projectId) {
    const project = projects[projectId];
    if (!project) return;

    activeProject = projectId;
    activePhase = null;
    hoverProject = projectId;
    closeStory();

    camera.targetX = project.x;
    camera.targetY = project.y + 14;
    camera.targetZoom = width < 650 ? 1.58 : 1.82;

    mapIntro.classList.add("minimized");
    projectIndex.classList.add("hidden");
    $("#worldHelp").classList.add("hidden");
    $("#compass").classList.add("hidden");
    backIsland.classList.remove("hidden");
    hotspots.classList.remove("hidden");
    islandTitle.classList.remove("hidden");
    mapButton.classList.remove("hidden");

    islandName.textContent = project.name;
    islandType.textContent = project.type;
    islandTagline.textContent = project.tagline;
    locationLabel.textContent = `${project.name} island`;

    $$("#projectIndex button").forEach(button => {
      button.classList.toggle("active", button.dataset.project === projectId);
    });

    tone(projectId === "bloop" ? 420 : projectId === "merqorn" ? 260 : 330, .13, "triangle", .03);
  }

  function showMapUI() {
    activeProject = null;
    activePhase = null;
    hoverProject = null;
    closeStory();

    camera.targetX = 0;
    camera.targetY = 45;
    camera.targetZoom = width < 650 ? .66 : .78;

    mapIntro.classList.remove("minimized");
    projectIndex.classList.remove("hidden");
    $("#worldHelp").classList.remove("hidden");
    $("#compass").classList.remove("hidden");
    backIsland.classList.add("hidden");
    hotspots.classList.add("hidden");
    islandTitle.classList.add("hidden");
    locationLabel.textContent = "Project archipelago";

    $$("#projectIndex button").forEach(button => button.classList.remove("active"));
    tone(190, .10, "sine", .02);
  }

  function updateHotspotPositions() {
    if (!activeProject || hotspots.classList.contains("hidden")) return;
    const project = projects[activeProject];
    const center = worldToScreen(project.x, project.y);

    phases.forEach(phase => {
      const pos = project.phasePositions[phase];
      const screenX = center.x + pos.x * camera.zoom;
      const screenY = center.y + pos.y * camera.zoom;
      const button = $(`.hotspot-${phase}`);
      button.style.left = `${screenX}px`;
      button.style.top = `${screenY}px`;
    });
  }

  function openPhase(phase) {
    if (!activeProject) return;
    const project = projects[activeProject];
    const data = project.phases[phase];
    if (!data) return;

    activePhase = phase;
    $("#storyNumber").textContent = data.number;
    $("#storyKicker").textContent = data.kicker;
    $("#storyTitle").textContent = data.title;
    $("#storyCopy").textContent = data.copy;
    $("#storyFacts").innerHTML = data.facts.map(fact => `<span>${fact}</span>`).join("");
    storyPanel.classList.add("open");
    storyPanel.setAttribute("aria-hidden", "false");

    $$(".hotspot").forEach(button => {
      button.classList.toggle("active", button.dataset.phase === phase);
    });

    tone(phase === "house" ? 240 : phase === "person" ? 330 : 480, .09, "sine", .025);
  }

  function closeStory() {
    storyPanel.classList.remove("open");
    storyPanel.setAttribute("aria-hidden", "true");
    activePhase = null;
    $$(".hotspot").forEach(button => button.classList.remove("active"));
  }

  function nextPhase() {
    const current = Math.max(0, phases.indexOf(activePhase));
    const next = phases[(current + 1) % phases.length];
    openPhase(next);
  }

  function islandHitTest(screenX, screenY) {
    const point = screenToWorld(screenX, screenY);
    let hit = null;
    let minDistance = Infinity;

    Object.values(projects).forEach(project => {
      const dx = point.x - project.x;
      const dy = (point.y - project.y) / .70;
      const distance = Math.hypot(dx, dy);
      if (distance < project.radius * .94 && distance < minDistance) {
        hit = project.id;
        minDistance = distance;
      }
    });

    return hit;
  }

  function onPointerMove(event) {
    if (!worldStarted) return;

    if (pointerDown && !activeProject) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      if (Math.hypot(dx, dy) > 4) dragMoved = true;

      camera.targetX = cameraStart.x - dx / camera.zoom;
      camera.targetY = cameraStart.y - dy / camera.zoom;
      camera.targetX = clamp(camera.targetX, -320, 320);
      camera.targetY = clamp(camera.targetY, -250, 310);
    }

    if (!pointerDown && !activeProject) {
      hoverProject = islandHitTest(event.clientX, event.clientY);
      worldCanvas.style.cursor = hoverProject ? "pointer" : "grab";
    }
  }

  function onPointerDown(event) {
    pointerDown = true;
    dragMoved = false;
    dragStart = { x: event.clientX, y: event.clientY };
    cameraStart = { x: camera.targetX, y: camera.targetY };
    worldCanvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    pointerDown = false;

    if (!dragMoved && !activeProject) {
      const hit = islandHitTest(event.clientX, event.clientY);
      if (hit) selectProject(hit);
    }

    worldCanvas.style.cursor = hoverProject ? "pointer" : "grab";
  }

  function onWheel(event) {
    if (!worldStarted || activeProject) return;
    event.preventDefault();

    const oldZoom = camera.targetZoom;
    const zoomFactor = Math.exp(-event.deltaY * .001);
    const newZoom = clamp(oldZoom * zoomFactor, .58, 1.12);

    const pointerWorld = screenToWorld(event.clientX, event.clientY);
    camera.targetZoom = newZoom;
    camera.targetX = pointerWorld.x - (event.clientX - width / 2) / newZoom;
    camera.targetY = pointerWorld.y - (event.clientY - height / 2) / newZoom;
  }
  intro.addEventListener("click", event => {
    if (event.target.closest("#cloudEntry")) return;
    enterWorld();
  });

  cloudEntry.addEventListener("click", event => {
    event.preventDefault();
    enterWorld();
  });

  cloudEntry.addEventListener("pointerup", event => {
    if (event.pointerType === "touch") {
      event.preventDefault();
      enterWorld();
    }
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "Disattiva i suoni" : "Attiva i suoni");
    if (soundEnabled) {
      ensureAudio();
      tone(520, .12, "sine", .035);
      showToast("Suoni attivi.");
    }
  });

  mapButton.addEventListener("click", () => {
    if (activeProject) showMapUI();
    else showToast("Sei già sull’arcipelago.");
  });

  backIsland.addEventListener("click", showMapUI);
  storyClose.addEventListener("click", closeStory);
  storyNext.addEventListener("click", nextPhase);

  brandHome.addEventListener("click", event => {
    event.preventDefault();
    if (!worldStarted) return;
    resetToIntro();
  });

  $$("#projectIndex button").forEach(button => {
    button.addEventListener("click", () => selectProject(button.dataset.project));
  });

  $$(".hotspot").forEach(button => {
    button.addEventListener("click", () => openPhase(button.dataset.phase));
  });

  worldCanvas.addEventListener("pointerdown", onPointerDown);
  worldCanvas.addEventListener("pointermove", onPointerMove);
  worldCanvas.addEventListener("pointerup", onPointerUp);
  worldCanvas.addEventListener("pointercancel", () => { pointerDown = false; });
  worldCanvas.addEventListener("wheel", onWheel, { passive: false });

  window.addEventListener("resize", () => {
    resizeCanvas();
    if (!activeProject) {
      camera.targetZoom = width < 650 ? .66 : .78;
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (storyPanel.classList.contains("open")) closeStory();
      else if (activeProject) showMapUI();
      return;
    }

    if (!worldStarted) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        enterWorld();
      }
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "b") selectProject("bloop");
    if (key === "m") selectProject("merqorn");
    if (key === "d") selectProject("dreambase");
  });

  resizeCanvas();
})();
