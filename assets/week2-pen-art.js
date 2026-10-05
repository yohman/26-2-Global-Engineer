/* A few held ink drawings, like hand-drawn animation. No blur/displacement filters. */
(async () => {
  const ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  function ink(svg) {
    let animated = 0;
    svg.querySelectorAll('circle, ellipse, rect').forEach(shape => {
      if (shape.closest('clipPath') || shape.querySelector('animateMotion') || shape.closest('defs')) return;
      const number = name => Number(shape.getAttribute(name) || 0);
      const path = document.createElementNS(ns, 'path');
      let d;
      if (shape.tagName === 'rect') {
        const x = number('x'), y = number('y'), w = number('width'), h = number('height'), r = Math.min(number('rx'), w / 2, h / 2);
        d = `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
      } else {
        const x = number('cx'), y = number('cy'), rx = number('r') || number('rx'), ry = number('r') || number('ry');
        d = `M${x-rx} ${y}A${rx} ${ry} 0 1 0 ${x+rx} ${y}A${rx} ${ry} 0 1 0 ${x-rx} ${y}Z`;
      }
      [...shape.attributes].forEach(a => path.setAttribute(a.name, a.value));
      path.setAttribute('d', d);
      shape.replaceWith(path);
    });
    const paths = [...svg.querySelectorAll('path')];
    paths.forEach((path, index) => {
      if ((path.closest('defs') && !svg.closest('defs')) || path.closest('clipPath') || path.querySelector('animate[attributeName="d"]') || !path.getAttribute('d')) return;
      // Keep each disconnected pen stroke separate (windows, railings, wipers).
      const parts = path.getAttribute('d').match(/M[^M]*/g) || [path.getAttribute('d')];
      if (!parts) return;
      const strokes = parts.map(part => {
        const probe = document.createElementNS(ns, 'path');
        probe.setAttribute('d', part);
        const length = probe.getTotalLength();
        const count = Math.max(2, Math.min(240, Math.ceil(length / 7)));
        return { closed: !part.includes('m') && /[zZ]\s*$/.test(part), step: length / count, points: Array.from({ length: count + 1 }, (_, n) => probe.getPointAtLength(length * n / count)) };
      });
      const frames = [0, 1, 2].map(frame => strokes.map(({ points, closed, step }) => {
        const coordinates = points.map((p, n) => {
          const seed = (index + 1) * 13.7 + n * 7.1 + frame * 11.3;
          const amount = n === 0 || n === points.length - 1 ? 0 : .48;
          const previous = points[n - 1];
          const move = !previous || Math.hypot(p.x - previous.x, p.y - previous.y) > step * 3 + 2;
          return `${move ? 'M' : 'L'}${(p.x + Math.sin(seed * 2.9) * amount).toFixed(2)},${(p.y + Math.cos(seed * 4.1) * amount).toFixed(2)}`;
        });
        return `${coordinates.join(' ')}${closed ? ' Z' : ''}`;
      }).join(' '));
      path.setAttribute('d', frames[0]);
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
      // Only a small set of environmental strokes vibrates on small screens.
      if (!reduced && (!mobile || animated < 10)) {
        const animation = document.createElementNS(ns, 'animate');
        Object.entries({ attributeName: 'd', values: [...frames, frames[0]].join(';'), dur: '.48s', begin: `-${(index % 5) * .06}s`, repeatCount: 'indefinite', calcMode: 'discrete' }).forEach(([key, value]) => animation.setAttribute(key, value));
        path.append(animation);
        animated++;
      }
    });
    svg.dataset.penArt = 'ready';
  }
  async function illustration(url, className) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Illustration ${response.status}`);
    const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid illustration');
    const svg = document.importNode(doc.documentElement, true);
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }
  try {
    const scene = document.querySelector('.aqua-scene');
    const bridge = await illustration('assets/week2-aqualine.svg', 'aqua-art');
    scene.querySelector('img').replaceWith(bridge);
    const window = await illustration('assets/week2-bus-window.svg', 'bus-window-art');
    scene.append(window);
    scene.dataset.windowReady = 'true';
    ink(bridge);
    bridge.querySelectorAll('defs g').forEach(ink);
    ink(window);
  } catch (error) { console.warn('Using fallback illustrations', error); }
  // Traffic cars already use their own three-drawing templates. Leave those alone.
  document.querySelectorAll('.pacific-jump svg path:not([id])').forEach(path => {
    if (path.getAttribute('fill') !== 'none') {
      path.setAttribute('fill', '#030607');
      path.setAttribute('stroke', '#80b7b1');
      path.setAttribute('stroke-width', '1.5');
    }
  });
  document.querySelectorAll('.pacific-jump svg, #section-scene, .case-ink, .comparison-train, .comparison-road').forEach(ink);
})();
