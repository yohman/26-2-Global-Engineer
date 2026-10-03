(() => {
  const body = document.body;
  const svg = document.querySelector('#traffic-svg');
  const camera = document.querySelector('#camera');
  const roadLines = document.querySelector('#road-lines');
  const carField = document.querySelector('#car-field');
  const focusCar = document.querySelector('#focus-car');
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
  let ticking = false;

  const svgNode = (name, attrs = {}) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  function carInkPath(variant, phase) {
    const outline = [
      [15, 1.8], [11.7, 2.5], [9.4, 4.7], [8.1, 8.3], [6.7, 13.7], [5.5, 18.5],
      [4.9, 24], [5, 36], [5.5, 40.3], [7, 43.7], [10.2, 45.5], [15, 46.1],
      [19.8, 45.5], [23, 43.7], [24.5, 40.3], [25, 36], [25.1, 24], [24.5, 18.5],
      [23.3, 13.7], [21.9, 8.3], [20.6, 4.7], [18.3, 2.5]
    ];
    const point = ([x, y], index) => {
      const edge = Math.min(index, outline.length - index);
      const sideWeight = edge > 2 && edge < 15 ? 1 : .65;
      const wave = Math.sin(index * 3.7 + variant * .91 + phase * 2.1) * .35
        + Math.sin(index * 5.1 - variant * .47 + phase * 3.2) * .14;
      return [x + wave * sideWeight, y + Math.sin(index * 3.3 + variant * .63 + phase * 2.6) * .18];
    };
    const p = outline.map(point);
    const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = midpoint(p.at(-1), p[0]);
    let path = `M${start[0].toFixed(2)} ${start[1].toFixed(2)}`;
    for (let i = 0; i < p.length; i += 1) {
      const end = midpoint(p[i], p[(i + 1) % p.length]);
      path += `Q${p[i][0].toFixed(2)} ${p[i][1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
    }
    const glass = Math.sin(variant * .8 + phase * 2.2) * .15;
    const rear = Math.cos(variant * .63 + phase * 2.7) * .14;
    // Broad front windscreen, roof/cabin, and rear glass make the silhouette read as a sedan.
    path += `ZM7.5 15.9Q8.1 11.8 10.7 ${(10.1 + glass).toFixed(2)}Q15 9.1 19.3 ${(10.1 - glass).toFixed(2)}Q21.9 11.8 22.5 15.9`;
    path += `M8 17.6Q15 ${(16.7 + glass).toFixed(2)} 22 17.6`;
    path += `M8.1 31.6Q15 ${(32.3 + rear).toFixed(2)} 21.9 31.6Q21.3 36.2 19 37.5Q15 38.6 11 37.5Q8.7 36.2 8.1 31.6Z`;
    // Short, paired lamp marks; no trailing stroke or loose line ends.
    path += 'M7.1 6.4q1-.8 2-.8m11.8 0q1 0 2 .8M6.2 40.2q1.1.5 2.1.5m13.4 0q1 0 2.1-.5';
    return path;
  }

  function createInkVariants() {
    const defs = document.querySelector('#traffic-defs');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (let variant = 0; variant < 16; variant += 1) {
      const symbol = svgNode('symbol', { id: `line-car-${variant}`, viewBox: '0 0 30 48' });
      const path = svgNode('path', {
        d: carInkPath(variant, 0), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'
      });
      if (!reduceMotion) path.append(svgNode('animate', {
        attributeName: 'd', values: [0, 1, 2, 0].map(phase => carInkPath(variant, phase)).join(';'),
        dur: `${(.65 + (variant % 5) * .15).toFixed(2)}s`, begin: `-${(variant * .17 % 1.4).toFixed(2)}s`,
        repeatCount: 'indefinite', calcMode: 'linear'
      }));
      symbol.append(path);
      defs.append(symbol);
    }
  }

  function inkVariant(key) {
    let hash = 0;
    for (const character of key) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return hash % 16;
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
        cruiseSpeed: isCarpool ? 23 + Math.abs(jitter(laneName, 'pace', 28)) : 2.5 + Math.abs(jitter(laneName, 'pace', 19)),
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
        const variant = inkVariant(key);
        const sideAmplitude = 3 + Math.abs(jitter(key, 'side-range', 38));
        const car = svgNode('use', {
          href: `#line-car-${variant}`,
          x: laneX - carSize.width / 2,
          y: centerY - carSize.height / 2,
          width: carSize.width,
          height: carSize.height,
          class: `traffic-car ${direction}${isCarpool ? ' carpool' : ''}${isPersonal ? ' personal' : ''}`
        });
        if (direction === 'southbound') car.setAttribute('transform', `rotate(180 ${laneX} ${centerY})`);
        laneGroup.append(car);
        laneState.cars.push({
          node: car,
          progress: ((directionSign * centerY) % cycleHeight + cycleHeight) % cycleHeight,
          directionSign,
          laneX,
          rotated: direction === 'southbound',
          maxSpeed: laneState.cruiseSpeed * (.76 + Math.abs(jitter(key, 'individual-speed', .48))),
          speedPhase: jitter(key, 'speed-phase', Math.PI * 2) + Math.PI,
          acceleration: 9 + Math.abs(jitter(key, 'acceleration', 20)),
          deceleration: 10 + Math.abs(jitter(key, 'deceleration', 24)),
          sideAmplitude,
          sidePhase: jitter(key, 'side-phase', Math.PI * 2) + Math.PI,
          sidePeriod: 3.5 + Math.abs(jitter(key, 'side-period', 7)),
          sideDrift: Math.abs(jitter(key, 'side-drift', 13)),
          speed: 0,
          advance: 0,
          personal: isPersonal
        });
      }
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
    const cycle = ((time + lane.phaseSeconds) % lane.cycleSeconds) / lane.cycleSeconds;
    if (lane.carpool) {
      if (cycle < .16) return .58;
      if (cycle < .25) return .22;
      if (cycle < .38) return .05;
      if (cycle < .62) return .72;
      if (cycle < .72) return .38;
      if (cycle < .88) return 1;
      return .56;
    }
    if (cycle < .14) return .24;
    if (cycle < .29) return 0;
    if (cycle < .51) return .12;
    if (cycle < .68) return .44;
    if (cycle < .81) return .82;
    return .28;
  }

  function updateTrafficMotion(now) {
    motionFrame = 0;
    if (!trafficLanes.length) return;
    if (now - lastTrafficUpdate < 32) {
      motionFrame = requestAnimationFrame(updateTrafficMotion);
      return;
    }
    const delta = lastTrafficUpdate ? Math.min(.08, (now - lastTrafficUpdate) / 1000) : 0;
    lastTrafficUpdate = now;
    trafficTime += delta;

    for (const lane of trafficLanes) {
      const cars = lane.cars;
      if (!cars.length) continue;
      cars.sort((a, b) => a.progress - b.progress);
      const pace = lanePace(lane, trafficTime);
      const safeGap = 3;

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
        const lateral = Math.sin(trafficTime * (Math.PI * 2 / car.sidePeriod) + car.sidePhase) * car.sideAmplitude
          + Math.sin(trafficTime * .31 + car.sidePhase * .73) * car.sideDrift;
        const laneOffsetLimit = (road.lanePitch - carSize.width) / 2 - 1;
        const centerX = car.laneX + Math.max(-laneOffsetLimit, Math.min(laneOffsetLimit, lateral));
        car.node.setAttribute('x', centerX - carSize.width / 2);
        car.node.setAttribute('y', centerY - carSize.height / 2);
        if (car.rotated) car.node.setAttribute('transform', `rotate(180 ${centerX} ${centerY})`);
      }
    }
    motionFrame = requestAnimationFrame(updateTrafficMotion);
  }

  function drawSurfaceCars() {
    const line = document.querySelector('#surface-cars');
    if (line.childElementCount) return;
    for (let index = 0; index < 31; index += 1) {
      if (index === 13 || index === 15) continue;
      const x = 14 + index * 39;
      const isPersonal = index === 24;
      const isTransferCar = index === 14;
      line.append(svgNode('use', {
        href: '#side-car', x: isTransferCar ? 548 : x, y: isTransferCar ? 138 : 134, width: isTransferCar ? 44 : 34, height: isTransferCar ? 20 : 16,
        ...(isTransferCar ? { id: 'descending-car' } : {}),
        class: `surface-car${isPersonal ? ' personal-car' : ''}${isTransferCar ? ' transfer-car' : ''}`,
        style: isTransferCar ? '' : `animation-delay:-${index * .37}s`
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
        const x = lane.direction === 'eastbound' ? 150 + index * 300 : 1050 - index * 300;
        const duration = .9;
        const pod = svgNode('use', {
          href: '#side-car', x, y: lane.y - 10, width: 44, height: 20,
          class: `pod-car ${lane.direction}`,
          style: `--zip-duration:${duration.toFixed(2)}s;--zip-delay:${index ? `${(-duration * index / 3).toFixed(2)}s` : '0s'}`
        });
        if (lane.direction === 'westbound') pod.setAttribute('transform', `translate(${2 * x + 44} 0) scale(-1 1)`);
        field.append(pod);
      }
    });
  }

  function setStage(stage, force = false) {
    if (stage === active && body.dataset.stage && !force) {
      if (stage === 1 && carField.childElementCount) renderCars(1);
      return;
    }
    active = stage;
    body.dataset.stage = String(stage);
    focusCar.classList.toggle('is-visible', stage === 1);
    svg.setAttribute('viewBox', stage >= 6 ? '0 0 1200 900' : `0 0 1200 ${sceneHeight}`);
    beats.forEach((beat, index) => beat.classList.toggle('is-active', index === stage - 1));
    if (stage < 6) {
      const scale = scaleFor[stage] || 1;
      camera.style.transformOrigin = '0px 0px';
      const offsetX = stage <= 2 ? 600 - focus.x * scale : 0;
      const offsetY = stage <= 2 ? focus.y - focus.y * scale : 0;
      camera.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      camera.style.opacity = '1';
      document.querySelector('#section-scene').style.opacity = '0';
    } else {
      camera.style.transformOrigin = '0px 0px';
      camera.style.transform = 'translate(0px, 0px) scale(1)';
      camera.style.opacity = '0';
      document.querySelector('#section-scene').style.opacity = '1';
    }
    renderCars(stage);
  }

  function findActiveBeat() {
    const anchor = innerHeight * .84;
    const visibleBeats = beats.map((beat, index) => ({ index: index + 1, card: beat.querySelector('.beat-card').getBoundingClientRect() }))
      .filter(({ card }) => card.top >= 0 && card.bottom <= innerHeight);
    return visibleBeats.reduce((best, beat) => {
      const distance = Math.abs(beat.card.top - anchor);
      return distance < best.distance ? { index: beat.index, distance } : best;
    }, { index: active, distance: Infinity }).index;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setStage(findActiveBeat());
      const maxScroll = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${maxScroll > 0 ? Math.min(100, scrollY / maxScroll * 100) : 0}%`;
      ticking = false;
    });
  }

  function onResize() {
    updateSceneDimensions();
    drawRoad();
    setStage(active, true);
    onScroll();
  }

  function goBeat(offset) {
    const nextIndex = Math.max(0, Math.min(beats.length - 1, active - 1 + offset));
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
  addEventListener('resize', onResize, { passive: true });
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('a,button,input,summary')) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goBeat(1); }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goBeat(-1); }
  });
  addEventListener('course-language-change', () => {
    drawRoad();
    setStage(findActiveBeat());
  });
  addEventListener('load', onScroll, { once: true });
  requestAnimationFrame(onScroll);
})();
