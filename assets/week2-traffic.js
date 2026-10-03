(() => {
  const body = document.body;
  const camera = document.querySelector('#camera');
  const roadLines = document.querySelector('#road-lines');
  const carField = document.querySelector('#car-field');
  const focusCar = document.querySelector('#focus-car');
  const beats = [...document.querySelectorAll('.story-beat')];
  const progress = document.querySelector('#scroll-progress-fill');
  const capacityButtons = [...document.querySelectorAll('[data-capacity]')];
  const language = () => document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const currentCars = new Map();
  const focus = { lane: 7, x: 570, y: 450 };
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
      [15, 1.8], [11.4, 2.7], [9, 7.4], [6.5, 15.5], [5.2, 20], [4.8, 27], [4.9, 38],
      [6, 43.8], [10.2, 46.1], [15, 46.3], [19.8, 46.1], [24, 43.8], [25.1, 38],
      [25.2, 27], [24.8, 20], [23.5, 15.5], [21, 7.4], [18.6, 2.7]
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
    const glass = Math.sin(variant * .8 + phase * 2.2) * .2;
    const rear = Math.cos(variant * .63 + phase * 2.7) * .18;
    path += `ZM8.1 17.1C10.5 ${(16.2 + glass).toFixed(2)} 19.3 ${(16.4 - glass).toFixed(2)} 21.9 17.2`;
    path += `M8.1 32.3C10.5 ${(33.2 + rear).toFixed(2)} 19.3 ${(33.1 - rear).toFixed(2)} 21.9 32.2`;
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
    roadLines.append(svgNode('path', { d: `M${road.left} 0 C${road.left + 10} 145 ${road.left - 8} 278 ${road.left} 430 S${road.left + 10} 718 ${road.left} 900 M${road.edge} 0 C${road.edge - 10} 145 ${road.edge + 8} 278 ${road.edge} 430 S${road.edge - 10} 718 ${road.edge} 900`, class: 'road-edge' }));
    for (let lane = 1; lane < 8; lane += 1) {
      const x = road.left + lane * road.lanePitch;
      const southX = road.center + lane * road.lanePitch;
      roadLines.append(svgNode('path', { d: `M${x} 0 C${x + 7} 150 ${x - 6} 280 ${x} 430 S${x + 6} 725 ${x} 900`, class: 'lane-path' }));
      roadLines.append(svgNode('path', { d: `M${southX} 0 C${southX - 6} 150 ${southX + 7} 280 ${southX} 430 S${southX - 5} 725 ${southX} 900`, class: 'lane-path' }));
    }
    roadLines.append(svgNode('path', { d: 'M594 0 C600 140 592 310 600 450 S608 730 600 900 M606 0 C600 140 608 310 600 450 S592 730 600 900', class: 'center-line' }));
    const north = svgNode('text', { x: 140, y: 48, class: 'direction-label' });
    north.textContent = language() === 'ja' ? '北行き ↑' : 'NORTHBOUND ↑';
    const south = svgNode('text', { x: 844, y: 865, class: 'direction-label' });
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
      if (direction === 'northbound' && lane === 7 && row === 10) return;
      // Keep both directions legible while narrowing the visual median gap.
      const laneX = direction === 'northbound' ? road.left + road.lanePitch / 2 + lane * road.lanePitch : road.center + road.lanePitch / 2 + lane * road.lanePitch;
      const x = laneX + jitter(key, 'lane', 14);
      const y = 100 + row * 35 + jitter(key, 'spacing', 8);
      const variant = inkVariant(key);
      const use = svgNode('use', {
        href: `#line-car-${variant}`, x: x - 12, y: y - 18, width: 24, height: 36,
        class: `traffic-car ${direction}`
      });
      if (direction === 'southbound') use.setAttribute('transform', `rotate(180 ${x} ${y})`);
      nextCars.set(key, use);
    };

    if (stage === 2) {
      for (let lane = 4; lane < 8; lane += 1) {
        for (let row = 5; row <= 15; row += 1) addCar(lane, row);
      }
    } else if (stage >= 3) {
      for (let lane = 0; lane < 8; lane += 1) {
        for (let row = 0; row < 23; row += 1) addCar(lane, row);
        for (let row = 0; row < 23; row += 1) addCar(lane, row, 'southbound');
      }
    }

    for (const [key, node] of currentCars) if (!nextCars.has(key)) node.remove();
    for (const [key, node] of nextCars) {
      if (!currentCars.has(key)) carField.append(node);
    }
    currentCars.clear();
    nextCars.forEach((node, key) => currentCars.set(key, node));
  }

  function drawPeople(served = 32) {
    const wave = document.querySelector('#people-wave');
    if (!wave.childElementCount) {
      for (let index = 0; index < 96; index += 1) {
        const col = index % 12;
        const row = Math.floor(index / 12);
        const x = 175 + col * 77;
        const y = 485 + row * 42;
        const person = svgNode('g', { class: 'person', 'data-person': index });
        person.append(
          svgNode('circle', { cx: x, cy: y, r: 3.2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.25 }),
          svgNode('path', { d: `M${x} ${y + 5}v9m-5-5h10m-8 5-3 6m9-6 3 6`, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.25, 'stroke-linecap': 'round' })
        );
        wave.append(person);
      }
    }
    wave.querySelectorAll('.person').forEach((person, index) => person.classList.toggle('served', index < served));
  }

  function drawSurfaceCars() {
    const line = document.querySelector('#surface-cars');
    if (line.childElementCount) return;
    for (let index = 0; index < 18; index += 1) {
      line.append(svgNode('use', {
        href: '#side-car', x: 108 + index * 55, y: 276, width: 52, height: 24,
        class: 'surface-car', style: `animation-delay:-${index * .37}s`
      }));
    }
  }

  function setCapacity(seats) {
    capacityButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.capacity) === seats)));
    const served = Math.min(96, seats * 8);
    const waiting = 96 - served;
    const summary = document.querySelector('#scenario-summary');
    const math = document.querySelector('#scenario-math');
    if (language() === 'ja') {
      summary.textContent = `${served}人が出発し、${waiting}人は待っています。`;
      math.textContent = `${seats}人乗り × 8便で、96人中${served}人が移動できます（説明用の想定）。`;
    } else {
      summary.textContent = `${served} people depart; ${waiting} are still waiting.`;
      math.textContent = `At ${seats} seats and 8 departures, ${served} of 96 people are served (illustrative assumption).`;
    }
    drawPeople(served);
  }

  function setStage(stage) {
    if (stage === active && body.dataset.stage) {
      if (stage === 1 && (currentCars.size || carField.childElementCount)) renderCars(1);
      return;
    }
    active = stage;
    body.dataset.stage = String(stage);
    beats.forEach((beat, index) => beat.classList.toggle('is-active', index === stage - 1));
    if (stage < 5) {
      const scale = scaleFor[stage] || 1;
      camera.style.transformOrigin = '0px 0px';
      camera.style.transform = `translate(${790 - focus.x * scale}px, ${450 - focus.y * scale}px) scale(${scale})`;
      camera.style.opacity = '1';
      document.querySelector('#section-scene').style.opacity = '0';
    } else {
      camera.style.transformOrigin = '600px 450px';
      camera.style.transform = 'rotate(90deg) scale(.2)';
      camera.style.opacity = '.12';
      document.querySelector('#section-scene').style.opacity = '1';
    }
    renderCars(stage);
    if (stage === 5) {
      const car = document.querySelector('#descending-car');
      car.style.animation = 'none';
      requestAnimationFrame(() => { car.style.animation = ''; });
    }
    if (stage === 6) setCapacity(Number(document.querySelector('[data-capacity][aria-pressed="true"]')?.dataset.capacity || 4));
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
  drawPeople();
  drawSurfaceCars();
  renderCars(1);
  setStage(1);
  capacityButtons.forEach(button => button.addEventListener('click', () => setCapacity(Number(button.dataset.capacity))));
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('a,button,input,summary')) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goBeat(1); }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goBeat(-1); }
  });
  addEventListener('course-language-change', () => {
    drawRoad();
    setCapacity(Number(document.querySelector('[data-capacity][aria-pressed="true"]')?.dataset.capacity || 4));
    setStage(findActiveBeat());
  });
  addEventListener('load', onScroll, { once: true });
  requestAnimationFrame(onScroll);
})();
