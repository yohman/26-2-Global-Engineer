(() => {
  const body = document.body;
  const camera = document.querySelector('#camera');
  const roadLines = document.querySelector('#road-lines');
  const carField = document.querySelector('#car-field');
  const focusCar = document.querySelector('#focus-car');
  const beats = [...document.querySelectorAll('.story-beat')];
  const progress = document.querySelector('#scroll-progress-fill');
  const language = () => document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const currentCars = new Map();
  // Northbound lane 2 is centered at x=720; x=696 sat on the painted divider.
  const focus = { lane: 2, x: 720, y: 450 };
  const road = { left: 216, center: 600, lanePitch: 48, edge: 984 };
  const scaleFor = { 1: 9.2, 2: 2.4, 3: 1, 4: 1 };
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

  function drawRoad() {
    roadLines.replaceChildren();
    roadLines.append(svgNode('rect', { x: road.left, y: 0, width: road.edge - road.left, height: 900, class: 'road-bed' }));
    roadLines.append(
      svgNode('rect', { x: 552, y: 0, width: 48, height: 900, class: 'hov-lane southbound' }),
      svgNode('rect', { x: 600, y: 0, width: 48, height: 900, class: 'hov-lane northbound' })
    );
    roadLines.append(svgNode('path', { d: `M${road.left} 0 C${road.left + 10} 145 ${road.left - 8} 278 ${road.left} 430 S${road.left + 10} 718 ${road.left} 900 M${road.edge} 0 C${road.edge - 10} 145 ${road.edge + 8} 278 ${road.edge} 430 S${road.edge - 10} 718 ${road.edge} 900`, class: 'road-edge' }));
    for (let lane = 1; lane < 8; lane += 1) {
      const x = road.left + lane * road.lanePitch;
      const southX = road.center + lane * road.lanePitch;
      roadLines.append(svgNode('path', { d: `M${x} 0 C${x + 7} 150 ${x - 6} 280 ${x} 430 S${x + 6} 725 ${x} 900`, class: lane === 7 ? 'lane-path hov-divider' : 'lane-path' }));
      roadLines.append(svgNode('path', { d: `M${southX} 0 C${southX - 6} 150 ${southX + 7} 280 ${southX} 430 S${southX - 5} 725 ${southX} 900`, class: lane === 1 ? 'lane-path hov-divider' : 'lane-path' }));
    }
    for (let y = 88; y < 900; y += 164) {
      roadLines.append(
        svgNode('use', { href: '#hov-diamond', x: 564, y, width: 24, height: 24, class: 'hov-symbol southbound' }),
        svgNode('use', { href: '#hov-diamond', x: 612, y, width: 24, height: 24, class: 'hov-symbol northbound' })
      );
    }
    roadLines.append(svgNode('path', { d: 'M594 0 C600 140 592 310 600 450 S608 730 600 900 M606 0 C600 140 608 310 600 450 S592 730 600 900', class: 'center-line' }));
    const north = svgNode('text', { x: 780, y: 48, class: 'direction-label' });
    north.textContent = language() === 'ja' ? '北行き ↑' : 'NORTHBOUND ↑';
    const south = svgNode('text', { x: 200, y: 865, class: 'direction-label', 'text-anchor': 'end' });
    south.textContent = language() === 'ja' ? '南行き ↓' : 'SOUTHBOUND ↓';
    roadLines.append(north, south);
  }

  function renderCars(stage) {
    if (stage === 1) {
      currentCars.clear();
      carField.replaceChildren();
      return;
    }
    const nextCars = new Map();
    const addCar = (lane, row, direction = 'northbound') => {
      const key = `${direction}-${lane}-${row}`;
      // Keep both directions legible while narrowing the visual median gap.
      const isCarpool = direction === 'northbound' ? lane === 0 : lane === 7;
      // A hashed, sparse pattern keeps the express lanes from reading as neat pairs.
      if (isCarpool && inkVariant(key) % 5 > 1) return;
      const laneX = direction === 'northbound' ? road.center + road.lanePitch / 2 + lane * road.lanePitch : road.left + road.lanePitch / 2 + lane * road.lanePitch;
      const x = laneX + jitter(key, 'lane', 12);
      const y = 60 + row * 31 + jitter(key, 'spacing', 22);
      const variant = inkVariant(key);
      const flowDuration = isCarpool ? 27 + (variant % 4) * 1.7 : 92 + (variant % 6) * 3.4;
      const flowDelay = Math.abs(jitter(key, 'flow', flowDuration)).toFixed(2);
      const isPersonal = direction === 'northbound' && lane === focus.lane && row === 12;
      const use = svgNode('use', {
        href: `#line-car-${variant}`, x: x - 12, y: y - 18, width: 24, height: 36,
        class: `traffic-car ${direction}${isCarpool ? ' carpool' : ''}${isPersonal ? ' personal' : ''}`,
        style: `--flow-duration:${flowDuration.toFixed(2)}s;--flow-delay:-${flowDelay}s`
      });
      if (direction === 'southbound') use.setAttribute('transform', `rotate(180 ${x} ${y})`);
      nextCars.set(key, use);
    };

    if (stage >= 2) {
      for (let lane = 0; lane < 8; lane += 1) {
        for (let row = 0; row < 30; row += 1) addCar(lane, row);
        for (let row = 0; row < 30; row += 1) addCar(lane, row, 'southbound');
      }
    }

    for (const [key, node] of currentCars) if (!nextCars.has(key)) node.remove();
    for (const [key, node] of nextCars) {
      if (!currentCars.has(key)) carField.append(node);
    }
    currentCars.clear();
    nextCars.forEach((node, key) => currentCars.set(key, node));
  }

  function drawSurfaceCars() {
    const line = document.querySelector('#surface-cars');
    if (line.childElementCount) return;
    for (let index = 0; index < 28; index += 1) {
      const x = 108 + index * 36;
      const isPersonal = index === 23;
      const isTransferCar = index === 12;
      line.append(svgNode('use', {
        href: '#side-car', x: isTransferCar ? 548 : x, y: 130, width: isTransferCar ? 44 : 34, height: isTransferCar ? 20 : 16,
        ...(isTransferCar ? { id: 'descending-car' } : {}),
        class: `surface-car${isPersonal ? ' personal-car' : ''}${isTransferCar ? ' transfer-car' : ''}`,
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

  function setStage(stage) {
    if (stage === active && body.dataset.stage) {
      if (stage === 1 && (currentCars.size || carField.childElementCount)) renderCars(1);
      return;
    }
    active = stage;
    body.dataset.stage = String(stage);
    beats.forEach((beat, index) => beat.classList.toggle('is-active', index === stage - 1));
    if (stage < 6) {
      const scale = scaleFor[stage] || 1;
      camera.style.transformOrigin = '0px 0px';
      camera.style.transform = `translate(${790 - focus.x * scale}px, ${450 - focus.y * scale}px) scale(${scale})`;
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

  function goBeat(offset) {
    const nextIndex = Math.max(0, Math.min(beats.length - 1, active - 1 + offset));
    beats[nextIndex].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  drawRoad();
  createInkVariants();
  drawSurfaceCars();
  drawPodTraffic();
  renderCars(1);
  setStage(1);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
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
