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
  const scaleFor = { 1: 9.2, 2: 2.4, 3: 1, 4: 1 };
  let active = 1;
  let ticking = false;

  const svgNode = (name, attrs = {}) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  function drawRoad() {
    roadLines.replaceChildren();
    roadLines.append(svgNode('rect', { x: 120, y: 0, width: 960, height: 900, class: 'road-bed' }));
    roadLines.append(svgNode('path', { d: 'M120 0 C130 145 112 278 120 430 S130 718 120 900 M1080 0 C1070 145 1088 278 1080 430 S1070 718 1080 900', class: 'road-edge' }));
    for (let lane = 1; lane < 8; lane += 1) {
      const x = 120 + lane * 60;
      const southX = 600 + lane * 60;
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
    const nextCars = new Map();
    const addCar = (lane, row, direction = 'northbound') => {
      const x = direction === 'northbound' ? 150 + lane * 60 : 630 + lane * 60;
      const y = 90 + row * 36;
      if (Math.abs(x - focus.x) < 1 && Math.abs(y - focus.y) < 36) return;
      const key = `${direction}-${lane}-${row}`;
      const use = svgNode('use', {
        href: '#line-car', x: x - 12, y: y - 18, width: 24, height: 36,
        class: `traffic-car ${direction}`,
        style: `transition-delay:${Math.min(900, row * 18 + lane * 14)}ms`
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
        for (let row = 0; row < 22; row += 1) addCar(lane, row);
        for (let row = 0; row < 22; row += 1) addCar(lane, row, 'southbound');
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
      if (stage === 1 && currentCars.size) renderCars(1);
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
    const anchor = innerHeight * .72;
    return beats.reduce((best, beat, index) => {
      const card = beat.querySelector('.beat-card').getBoundingClientRect();
      const distance = Math.abs(card.top + Math.min(card.height * .45, 180) - anchor);
      return distance < best.distance ? { index: index + 1, distance } : best;
    }, { index: 1, distance: Infinity }).index;
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
