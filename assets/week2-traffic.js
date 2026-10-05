(() => {
  const body = document.body;
  const svg = document.querySelector('#traffic-svg');
  const camera = document.querySelector('#camera');
  const roadLines = document.querySelector('#road-lines');
  const carField = document.querySelector('#car-field');
  const focusCar = document.querySelector('#focus-car');
  const mobileRendering = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  const canvas = document.querySelector('#traffic-canvas');
  const canvasContext = mobileRendering ? canvas.getContext('2d', { alpha: true }) : null;
  const spriteCache = new Map();
  let canvasRatio = 1;
  let canvasCamera = { scale: 9.2, x: 0, y: 0 };
  let cameraTween = null;
  let resizeTimer = 0;
  const beats = [...document.querySelectorAll('.story-beat')];
  const progress = document.querySelector('#scroll-progress-fill');
  const language = () => document.documentElement.lang === 'ja' ? 'ja' : 'en';
  // Sixteen lanes span the frame: eight southbound on the left, eight northbound on the right.
  const focus = { lane: 2, x: 787.5, y: 450 };
  const road = { left: 0, center: 600, lanePitch: 75, edge: 1200 };
  const carSize = { width: 30, height: 48, pitch: 56 };
  const scaleFor = { 1: 9.2, 2: 2.4, 3: 1, 4: 1 };
  let sceneHeight = 900;
  let cycleRows = 20;
  let cycleHeight = cycleRows * carSize.pitch;
  let renderedSceneHeight = 0;
  let trafficLanes = [];
  let motionFrame = 0;
  let lastTrafficUpdate = 0;
  let trafficTime = 0;
  let active = 1;
  let activeBeat = 0;
  let ticking = false;

  const svgNode = (name, attrs = {}) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  // Ten deliberately different silhouettes; the small redraws affect the ink, never vehicle position.
  const carModels = [
    { name: 'Sedan', half: 10, nose: 7, top: 2, end: 46, glass: 13, rear: 34 },
    { name: 'Hatchback', half: 10.5, nose: 8, top: 4, end: 43, glass: 12, rear: 34 },
    { name: 'Coupe', half: 9, nose: 5, top: 2, end: 46, glass: 17, rear: 31 },
    { name: 'SUV', half: 12, nose: 11, top: 2, end: 46, glass: 11, rear: 36 },
    { name: 'Station wagon', half: 10.5, nose: 8, top: 2, end: 46, glass: 12, rear: 39 },
    { name: 'Pickup', half: 11.5, nose: 10, top: 2, end: 46, glass: 11, rear: 24 },
    { name: 'Van', half: 11, nose: 10, top: 2, end: 46, glass: 7, rear: 39 },
    { name: 'Roadster', half: 9.5, nose: 6, top: 3, end: 44, glass: 16, rear: 30 },
    { name: 'Taxi', half: 10, nose: 8, top: 2, end: 46, glass: 12, rear: 34 },
    { name: 'City car', half: 9.5, nose: 8, top: 7, end: 41, glass: 14, rear: 33 }
  ];

  function penStroke(points, closed, key, frame) {
    // Short, independently redrawn pen segments, held between frames like traditional animation.
    const sampled = [];
    const segments = closed ? points.length : points.length - 1;
    for (let edge = 0; edge < segments; edge += 1) {
      const a = points[edge], b = points[(edge + 1) % points.length];
      const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.4));
      for (let step = 0; step < steps; step += 1) {
        const t = step / steps;
        const mark = `${key}-${edge}-${step}`;
        sampled.push([
          a[0] + (b[0] - a[0]) * t + jitter(`${frame}-${mark}`, 'ink-x', .32),
          a[1] + (b[1] - a[1]) * t + jitter(`${frame}-${mark}`, 'ink-y', .32)
        ]);
      }
    }
    if (!closed) sampled.push(points.at(-1));
    return sampled.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') + (closed ? 'Z' : '');
  }

  function carInkPath(variant, frame, side = false) {
    const m = carModels[variant];
    const strokes = [];
    const draw = (points, closed = false) => strokes.push(penStroke(points, closed, `${variant}-${side}-${strokes.length}`, frame));
    if (side) {
      const roof = variant === 6 ? [[9, 11], [10, 4], [39, 4], [42, 12]]
        : variant === 5 ? [[10, 11], [15, 5], [26, 5], [30, 12], [47, 12]]
        : [[9, 12], [16, variant === 3 ? 3 : 5], [variant === 4 ? 37 : 31, variant === 3 ? 3 : 5], [42, 12]];
      draw([[2, 18], [2, 13], ...roof, [49, 14], [50, 19], [44, 19], [41, 16], [37, 16], [34, 19], [15, 19], [12, 16], [8, 16], [5, 19]], true);
      draw([[16, 11], [19, 7], [29, 7], [34, 11]], true);
      draw([[25, 7], [25, 11]]);
      for (const x of [10, 39]) draw(Array.from({ length: 10 }, (_, i) => [x + Math.cos(i * Math.PI / 5) * 3, 20 + Math.sin(i * Math.PI / 5) * 3]), true);
      if (variant === 8) draw([[22, 4], [22, 1], [29, 1], [29, 4]], true);
      if (variant === 5) draw([[31, 13], [46, 13]]);
      return strokes.join('');
    }
    const l = 15 - m.half, r = 15 + m.half;
    draw([[15 - m.nose, m.top + 1], [15, m.top], [15 + m.nose, m.top + 1], [r - 1, m.top + 6], [r, 18], [r - .4, m.end - 4], [r - 3, m.end], [l + 3, m.end - .2], [l, m.end - 4], [l, 18], [l + 1, m.top + 6]], true);
    draw([[l + 2, m.glass + 4], [l + 4, m.glass], [r - 4, m.glass - .3], [r - 2, m.glass + 4]], true);
    draw([[l + 2.5, m.glass + 5.5], [l + 2.5, m.rear - 2]]);
    draw([[r - 2.5, m.glass + 5.5], [r - 2.5, m.rear - 2]]);
    if (variant === 5) {
      draw([[l + 2, 27], [r - 2, 27], [r - 2, 43], [l + 2, 43]], true);
      draw([[l + 4, 29], [l + 4, 41]]); draw([[r - 4, 29], [r - 4, 41]]);
    } else {
      draw([[l + 3, m.rear], [r - 3, m.rear], [r - 4, m.rear + 4], [l + 4, m.rear + 4]], true);
    }
    if (variant === 4 || variant === 3) {
      draw([[l + 4, m.glass + 7], [l + 4, m.rear - 3]]); draw([[r - 4, m.glass + 7], [r - 4, m.rear - 3]]);
    }
    if (variant === 7) {
      draw([[10, 23], [13, 22], [13, 28], [10, 28]], true); draw([[17, 22], [20, 23], [20, 28], [17, 28]], true);
    }
    if (variant === 8) draw([[12, 23], [18, 23], [18, 26], [12, 26]], true);
    draw([[l + 2, m.top + 4], [l + 5, m.top + 3.5]]); draw([[r - 5, m.top + 3.5], [r - 2, m.top + 4]]);
    draw([[l + 1, m.end - 3], [l + 4, m.end - 3]]); draw([[r - 4, m.end - 3], [r - 1, m.end - 3]]);
    return strokes.join('');
  }

  function createInkVariants() {
    const defs = document.querySelector('#traffic-defs');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (let variant = 0; variant < carModels.length; variant += 1) {
      const symbol = svgNode('symbol', { id: `line-car-${variant}`, viewBox: '0 0 30 48' });
      const path = svgNode('path', {
        d: carInkPath(variant, 0), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'
      });
      if (!reduceMotion && (!mobileRendering || variant === 0)) path.append(svgNode('animate', {
        attributeName: 'd', values: [0, 1, 2, 0].map(phase => carInkPath(variant, phase)).join(';'),
        dur: `${(.4 + (variant % 3) * .04).toFixed(2)}s`, begin: `-${(variant * .07 % .4).toFixed(2)}s`,
        repeatCount: 'indefinite', calcMode: 'discrete'
      }));
      symbol.append(path);
      defs.append(symbol);
      const profile = svgNode('symbol', { id: `side-car-${variant}`, viewBox: '0 0 52 26' });
      const profilePath = svgNode('path', { d: carInkPath(variant, 0, true), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' });
      if (!reduceMotion && (!mobileRendering || variant === 3)) profilePath.append(svgNode('animate', { attributeName: 'd', values: [0, 1, 2, 0].map(frame => carInkPath(variant, frame, true)).join(';'), dur: '.44s', begin: `-${variant * .03}s`, repeatCount: 'indefinite', calcMode: 'discrete' }));
      profile.append(profilePath); defs.append(profile);
      const skate = svgNode('symbol', { id: `skate-car-${variant}`, viewBox: '0 0 52 28' });
      skate.append(svgNode('use', { href: `#side-car-${variant}`, width: 52, height: 26 }), svgNode('path', { d: 'M1 26h50m-44 1h5m28 0h5', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.3' }));
      defs.append(skate);
    }
  }

  function inkVariant(key) {
    let hash = 0;
    for (const character of key) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return hash % carModels.length;
  }

  function jitter(key, axis, range) {
    let hash = 2166136261;
    for (const character of `${key}:${axis}`) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (((hash >>> 0) / 4294967295) - .5) * range;
  }

  function updateSceneDimensions() {
    sceneHeight = Math.max(1, Math.round(1200 * innerHeight / Math.max(1, innerWidth)));
    cycleRows = Math.ceil(sceneHeight / carSize.pitch) + 3;
    cycleHeight = cycleRows * carSize.pitch;
    focus.y = sceneHeight / 2;
    const focusUse = focusCar.querySelector('use');
    focusUse.setAttribute('x', focus.x - carSize.width / 2);
    focusUse.setAttribute('y', focus.y - carSize.height / 2);
    focusUse.setAttribute('width', carSize.width);
    focusUse.setAttribute('height', carSize.height);
    svg.setAttribute('viewBox', active >= 6 ? '0 0 1200 900' : `0 0 1200 ${sceneHeight}`);
    if (canvasContext) {
      canvasRatio = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(innerWidth * canvasRatio);
      canvas.height = Math.round(innerHeight * canvasRatio);
      spriteCache.clear();
    }
  }

  function carSprite(car) {
    const zoom = active === 2 ? 2.4 : 1;
    const key = `${car.variant}-${car.ink}-${zoom}`;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const sprite = document.createElement('canvas');
    const resolution = 3;
    sprite.width = carSize.width * resolution;
    sprite.height = carSize.height * resolution;
    const context = sprite.getContext('2d');
    context.scale(resolution, resolution);
    context.strokeStyle = car.ink;
    context.lineWidth = Math.min(3, 1.5 / (innerWidth / 1200 * zoom));
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.stroke(new Path2D(carInkPath(car.variant, 0)));
    spriteCache.set(key, sprite);
    return sprite;
  }

  function drawCanvasTraffic(now) {
    if (!canvasContext || active < 2 || active >= 6) return;
    if (cameraTween) {
      const t = Math.min(1, Math.max(0, (now - cameraTween.started) / 1050));
      const ease = 1 - Math.pow(1 - t, 3);
      for (const axis of ['scale', 'x', 'y']) canvasCamera[axis] = cameraTween.from[axis] + (cameraTween.to[axis] - cameraTween.from[axis]) * ease;
      if (t === 1) cameraTween = null;
    }
    const ctx = canvasContext;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const unit = canvasRatio * innerWidth / 1200;
    ctx.setTransform(unit * canvasCamera.scale, 0, 0, unit * canvasCamera.scale, unit * canvasCamera.x, unit * canvasCamera.y);
    const visibleTop = -canvasCamera.y / canvasCamera.scale;
    const visibleBottom = (sceneHeight - canvasCamera.y) / canvasCamera.scale;
    const visibleLeft = -canvasCamera.x / canvasCamera.scale;
    const visibleRight = (1200 - canvasCamera.x) / canvasCamera.scale;
    for (const lane of trafficLanes) {
      for (const car of lane.cars) {
        const y = car.directionSign < 0 ? cycleHeight - car.progress : car.progress;
        if (car.laneX + carSize.width < visibleLeft || car.laneX - carSize.width > visibleRight) continue;
        if (y + carSize.height < visibleTop || y - carSize.height > visibleBottom) continue;
        ctx.globalAlpha = car.personal ? 1 : lane.carpool ? .9 : .53;
        ctx.save();
        ctx.translate(car.laneX, y);
        if (car.rotated) ctx.rotate(Math.PI);
        ctx.drawImage(carSprite(car), -carSize.width / 2, -carSize.height / 2, carSize.width, carSize.height);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRoad() {
    roadLines.replaceChildren();
    roadLines.append(svgNode('rect', { x: road.left, y: 0, width: road.edge - road.left, height: sceneHeight, class: 'road-bed' }));
    roadLines.append(
      svgNode('rect', { x: 525, y: 0, width: 75, height: sceneHeight, class: 'hov-lane southbound' }),
      svgNode('rect', { x: 600, y: 0, width: 75, height: sceneHeight, class: 'hov-lane northbound' })
    );
    roadLines.append(svgNode('path', { d: `M${road.left} 0V${sceneHeight} M${road.edge} 0V${sceneHeight}`, class: 'road-edge' }));
    for (let lane = 1; lane < 8; lane += 1) {
      const x = road.left + lane * road.lanePitch;
      const southX = road.center + lane * road.lanePitch;
      roadLines.append(svgNode('path', { d: `M${x} 0 C${x + 3} ${sceneHeight * .3} ${x - 3} ${sceneHeight * .65} ${x} ${sceneHeight}`, class: lane === 7 ? 'lane-path hov-divider' : 'lane-path' }));
      roadLines.append(svgNode('path', { d: `M${southX} 0 C${southX - 3} ${sceneHeight * .3} ${southX + 3} ${sceneHeight * .65} ${southX} ${sceneHeight}`, class: lane === 1 ? 'lane-path hov-divider' : 'lane-path' }));
    }
    for (let y = 88; y < sceneHeight; y += 164) {
      roadLines.append(
        svgNode('use', { href: '#hov-diamond', x: 550.5, y, width: 24, height: 24, class: 'hov-symbol southbound' }),
        svgNode('use', { href: '#hov-diamond', x: 625.5, y, width: 24, height: 24, class: 'hov-symbol northbound' })
      );
    }
    roadLines.append(svgNode('path', { d: `M598 0 C600 ${sceneHeight * .3} 596 ${sceneHeight * .65} 600 ${sceneHeight} M602 0 C600 ${sceneHeight * .3} 604 ${sceneHeight * .65} 600 ${sceneHeight}`, class: 'center-line' }));
    const north = svgNode('text', { x: 780, y: 48, class: 'direction-label' });
    north.textContent = language() === 'ja' ? '北行き ↑' : 'NORTHBOUND ↑';
    const south = svgNode('text', { x: 200, y: sceneHeight - 28, class: 'direction-label', 'text-anchor': 'end' });
    south.textContent = language() === 'ja' ? '南行き ↓' : 'SOUTHBOUND ↓';
    roadLines.append(north, south);
  }

  function renderCars(stage) {
    if (stage === 1 || stage >= 6) {
      carField.replaceChildren();
      trafficLanes = [];
      renderedSceneHeight = 0;
      if (motionFrame) cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      return;
    }
    if (renderedSceneHeight === sceneHeight && trafficLanes.length) return;
    carField.replaceChildren();
    trafficLanes = [];
    const addLane = (lane, direction) => {
      const laneName = `${direction}-${lane}`;
      const isCarpool = direction === 'northbound' ? lane === 0 : lane === 7;
      const laneX = direction === 'northbound'
        ? road.center + road.lanePitch / 2 + lane * road.lanePitch
        : road.left + road.lanePitch / 2 + lane * road.lanePitch;
      const laneGroup = svgNode('g', { class: `traffic-lane ${direction}${isCarpool ? ' carpool' : ''}` });
      const laneState = {
        name: laneName,
        lane,
        direction,
        personalLane: direction === 'northbound' && lane === focus.lane,
        carpool: isCarpool,
        node: laneGroup,
        cars: [],
        cruiseSpeed: isCarpool ? 68 + Math.abs(jitter(laneName, 'pace', 28)) : 24 + Math.abs(jitter(laneName, 'pace', 20)),
        cycleSeconds: 10 + Math.abs(jitter(laneName, 'cycle', 16)),
        phaseSeconds: Math.abs(jitter(laneName, 'phase', 1)) * (10 + Math.abs(jitter(laneName, 'cycle', 16)))
      };
      const directionSign = direction === 'northbound' ? -1 : 1;
      const count = Math.max(1, Math.floor(cycleHeight / (isCarpool ? 112 : 62)));
      const minimumGap = 2;
      const variableGapSpace = Math.max(0, cycleHeight - count * (carSize.height + minimumGap));
      const gapWeights = Array.from({ length: count }, (_, index) => 1 + jitter(laneName, `gap-${index}`, 1.5));
      const gapWeightTotal = gapWeights.reduce((total, weight) => total + weight, 0);
      const gaps = gapWeights.map(weight => minimumGap + variableGapSpace * weight / gapWeightTotal);
      const origin = (jitter(laneName, 'spacing-origin', cycleHeight) + cycleHeight) % cycleHeight;
      const positions = [];
      let position = origin;
      for (let index = 0; index < count; index += 1) {
        positions.push(position % cycleHeight);
        position += carSize.height + gaps[index];
      }
      const personalIndex = laneState.personalLane
        ? positions.reduce((bestIndex, centerY, index) => Math.abs(centerY - sceneHeight / 2) < Math.abs(positions[bestIndex] - sceneHeight / 2) ? index : bestIndex, 0)
        : -1;

      for (let index = 0; index < positions.length; index += 1) {
        const key = `${laneName}-${index}`;
        const centerY = positions[index];
        const isPersonal = index === personalIndex;
        const variant = isPersonal ? 0 : inkVariant(key);
        // Drivers hold a slightly different position within their lane, without swaying.
        const centerX = laneX + jitter(key, 'lane-position', 12);
        const maxSpeed = laneState.cruiseSpeed * (.85 + Math.abs(jitter(key, 'individual-speed', .3)));
        const car = mobileRendering ? null : svgNode('use', {
          href: `#line-car-${variant}`,
          x: centerX - carSize.width / 2,
          y: centerY - carSize.height / 2,
          width: carSize.width,
          height: carSize.height,
          class: `traffic-car ${direction}${isCarpool ? ' carpool' : ''}${isPersonal ? ' personal' : ''}`
        });
        if (car && direction === 'southbound') car.setAttribute('transform', `rotate(180 ${centerX} ${centerY})`);
        if (car) laneGroup.append(car);
        laneState.cars.push({
          node: car,
          variant,
          ink: isPersonal ? '#f29b78' : isCarpool ? '#e8c36d' : direction === 'northbound' ? '#6dc0bf' : '#c98569',
          progress: ((directionSign * centerY) % cycleHeight + cycleHeight) % cycleHeight,
          directionSign,
          laneX: centerX,
          rotated: direction === 'southbound',
          maxSpeed,
          speedPhase: jitter(key, 'speed-phase', Math.PI * 2) + Math.PI,
          acceleration: 9 + Math.abs(jitter(key, 'acceleration', 20)),
          deceleration: 10 + Math.abs(jitter(key, 'deceleration', 24)),
          speed: laneState.personalLane ? 0 : maxSpeed * .6,
          advance: 0,
          personal: isPersonal
        });
      }
      laneState.cars.sort((a, b) => a.progress - b.progress);
      trafficLanes.push(laneState);
      carField.append(laneGroup);
    };

    for (let lane = 0; lane < 8; lane += 1) {
      addLane(lane, 'southbound');
      addLane(lane, 'northbound');
    }
    renderedSceneHeight = sceneHeight;
    if (!motionFrame) motionFrame = requestAnimationFrame(updateTrafficMotion);
  }

  function lanePace(lane, time) {
    if (lane.personalLane) return 0;
    const phase = (time + lane.phaseSeconds) / lane.cycleSeconds * Math.PI * 2;
    const wave = (Math.sin(phase) + 1) / 2;
    return lane.carpool ? .76 + .24 * wave : .48 + .52 * wave;
  }

  function updateTrafficMotion(now) {
    motionFrame = 0;
    if (!trafficLanes.length || document.hidden) return;
    if (now - lastTrafficUpdate < (mobileRendering ? 15 : 32)) {
      motionFrame = requestAnimationFrame(updateTrafficMotion);
      return;
    }
    const delta = lastTrafficUpdate ? Math.min(.08, (now - lastTrafficUpdate) / 1000) : 0;
    lastTrafficUpdate = now;
    trafficTime += delta;

    for (const lane of trafficLanes) {
      const cars = lane.cars;
      if (!cars.length) continue;
      if (lane.personalLane) continue;
      // Drivers cannot overtake inside a lane; only the off-screen wrap changes the order.
      while (cars.length > 1 && cars.at(-1).progress < cars[0].progress) cars.unshift(cars.pop());
      const pace = lanePace(lane, trafficTime);
      const safeGap = 2;

      for (let index = cars.length - 1; index >= 0; index -= 1) {
        const car = cars[index];
        const leader = cars[(index + 1) % cars.length];
        const distance = (leader.progress - car.progress + cycleHeight) % cycleHeight;
        const gap = distance - carSize.height;
        const personalCruise = .78 + .22 * ((Math.sin(trafficTime * .72 + car.speedPhase) + 1) / 2);
        let target = car.maxSpeed * pace * personalCruise;
        if (gap < 168) {
          const followCap = leader.speed + Math.max(0, gap - safeGap) * .4;
          target = Math.min(target, followCap);
        }
        if (target < car.speed) car.speed = Math.max(target, car.speed - car.deceleration * delta);
        else car.speed = Math.min(target, car.speed + car.acceleration * delta);
        car.advance = car.speed * delta;
      }

      // Clamp every follower to the leader's actual frame movement plus only a safe fraction of its open gap.
      let anchor = 0;
      for (let index = 1; index < cars.length; index += 1) if (cars[index].advance < cars[anchor].advance) anchor = index;
      for (let offset = 1; offset < cars.length; offset += 1) {
        const index = (anchor - offset + cars.length) % cars.length;
        const leader = cars[(index + 1) % cars.length];
        const car = cars[index];
        const distance = (leader.progress - car.progress + cycleHeight) % cycleHeight;
        const gap = distance - carSize.height;
        car.advance = Math.min(car.advance, leader.advance + Math.max(0, gap - safeGap) * .35);
        car.speed = delta ? car.advance / delta : car.speed;
      }

      for (const car of cars) {
        car.progress = (car.progress + car.advance) % cycleHeight;
        const centerY = car.directionSign < 0 ? cycleHeight - car.progress : car.progress;
        if (car.node) {
          car.node.setAttribute('y', centerY - carSize.height / 2);
          if (car.rotated) car.node.setAttribute('transform', `rotate(180 ${car.laneX} ${centerY})`);
        }
      }
    }
    drawCanvasTraffic(now);
    motionFrame = requestAnimationFrame(updateTrafficMotion);
  }

  function drawSurfaceCars() {
    const line = document.querySelector('#surface-cars');
    if (line.childElementCount) return;
    for (let index = 0; index < 31; index += 1) {
      if (index >= 13 && index <= 15) continue;
      const x = 14 + index * 39;
      const isPersonal = index === 24;
      line.append(svgNode('use', {
        href: `#side-car-${isPersonal ? 0 : inkVariant(`surface-${index}`)}`, x, y: 134, width: 34, height: 16,
        class: `surface-car${isPersonal ? ' personal-car' : ''}`,
        style: `animation-delay:-${index * .37}s`
      }));
    }
  }

  function drawPodTraffic() {
    const field = document.querySelector('#pod-traffic');
    if (field.childElementCount) return;
    const lanes = [
      { y: 750, direction: 'eastbound' },
      { y: 800, direction: 'westbound' },
      { y: 850, direction: 'eastbound' }
    ];
    lanes.forEach((lane, laneIndex) => {
      for (let index = 0; index < 3; index += 1) {
        const x = lane.direction === 'eastbound' ? 60 : 1096;
        const duration = 1.35 + laneIndex * .15;
        const pod = svgNode('use', {
          href: `#skate-car-${inkVariant(`pod-${laneIndex}-${index}`)}`, x, y: lane.y - 20, width: 44, height: 20,
          class: `pod-car ${lane.direction}`,
          style: `--zip-duration:${duration.toFixed(2)}s;--zip-delay:${index ? `${(-duration * index / 3).toFixed(2)}s` : '0s'}`
        });
        if (lane.direction === 'westbound') pod.setAttribute('transform', `translate(${2 * x + 44} 0) scale(-1 1)`);
        field.append(pod);
      }
    });
  }

  function setStage(stage, force = false, beatIndex = beats.findIndex(beat => Number(beat.dataset.stage) === stage)) {
    activeBeat = beatIndex;
    body.dataset.beat = beats[beatIndex]?.id || '';
    body.dataset.aqua = beats[beatIndex]?.dataset.aqua || '';
    const comparison = document.querySelector('#region-comparison');
    const metric = beats[beatIndex]?.dataset.compare;
    comparison.hidden = !metric;
    comparison.querySelectorAll('.comparison-frame').forEach(frame => {
      frame.hidden = frame.dataset.metric !== metric;
    });
    beats.forEach((beat, index) => beat.classList.toggle('is-active', index === activeBeat));
    if (stage === active && body.dataset.stage && !force) {
      if (stage === 1 && carField.childElementCount) renderCars(1);
      return;
    }
    active = stage;
    body.dataset.stage = String(stage);
    focusCar.classList.toggle('is-visible', stage === 1);
    svg.setAttribute('viewBox', stage >= 6 ? '0 0 1200 900' : `0 0 1200 ${sceneHeight}`);
    if (stage < 6) {
      const scale = scaleFor[stage] || 1;
      camera.style.transformOrigin = '0px 0px';
      const offsetX = stage <= 2 ? 600 - focus.x * scale : 0;
      const offsetY = stage <= 2 ? focus.y - focus.y * scale : 0;
      if (canvasContext) {
        cameraTween = { from: { ...canvasCamera }, to: { scale, x: offsetX, y: offsetY }, started: performance.now() };
        if (stage === 1) { canvasCamera = { scale, x: offsetX, y: offsetY }; cameraTween = null; }
      }
      camera.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      camera.style.opacity = '1';
      document.querySelector('#section-scene').style.opacity = '0';
    } else {
      camera.style.transformOrigin = '0px 0px';
      camera.style.transform = 'translate(0px, 0px) scale(1)';
      camera.style.opacity = '0';
      document.querySelector('#section-scene').style.opacity = stage >= 10 ? '0' : '1';
    }
    renderCars(stage);
    if (canvasContext) canvas.style.opacity = stage >= 2 && stage < 6 ? '1' : '0';
  }

  function findActiveBeat() {
    const anchor = innerHeight * .84;
    // Activate long paragraphs as they enter, even before the whole card fits.
    return beats.reduce((current, beat, index) =>
      beat.querySelector('.beat-card').getBoundingClientRect().top <= anchor ? index + 1 : current, 1);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const index = findActiveBeat() - 1;
      setStage(Number(beats[index].dataset.stage), false, index);
      const maxScroll = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${maxScroll > 0 ? Math.min(100, scrollY / maxScroll * 100) : 0}%`;
      ticking = false;
    });
  }

  function onResize() {
    updateSceneDimensions();
    drawRoad();
    setStage(active, true, activeBeat);
    onScroll();
  }

  function goBeat(offset) {
    const nextIndex = Math.max(0, Math.min(beats.length - 1, activeBeat + offset));
    beats[nextIndex].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  updateSceneDimensions();
  drawRoad();
  createInkVariants();
  drawSurfaceCars();
  drawPodTraffic();
  renderCars(1);
  setStage(1);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 150);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('traffic-paused', document.hidden);
    if (document.hidden) {
      svg.pauseAnimations();
      if (motionFrame) cancelAnimationFrame(motionFrame);
      motionFrame = 0;
    } else {
      svg.unpauseAnimations();
      lastTrafficUpdate = 0;
      if (trafficLanes.length && !motionFrame) motionFrame = requestAnimationFrame(updateTrafficMotion);
    }
  });
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('a,button,input,summary')) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goBeat(1); }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goBeat(-1); }
  });
  addEventListener('course-language-change', () => {
    drawRoad();
    const index = findActiveBeat() - 1;
    setStage(Number(beats[index].dataset.stage), false, index);
  });
  addEventListener('load', onScroll, { once: true });
  requestAnimationFrame(onScroll);
})();
