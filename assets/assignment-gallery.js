(() => {
  const params = new URLSearchParams(location.search);
  const assignments = window.SUBMISSION_ASSIGNMENTS;
  const week = Object.hasOwn(assignments, params.get('week')) ? params.get('week') : '2';
  document.querySelector('#assignment-week').value = week;
  Object.assign(window.ASSIGNMENT_SUBMISSION_CONFIG, {
    thumbnails: true,
    titlePrefix: assignments[week].prefix,
    excludeTitlePrefix: ''
  });
  if (params.has('embed')) {
    document.body.classList.add('gallery-embed');
    const main = document.querySelector('main');
    const resize = () => parent.postMessage({ type: 'assignment-gallery-height', height: Math.ceil(main.getBoundingClientRect().height) + 24 }, location.origin);
    new ResizeObserver(resize).observe(main);
    window.addEventListener('load', resize);
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'assignment-gallery-language') return;
      const wanted = event.data.lang;
      if (['en', 'ja'].includes(wanted) && document.documentElement.lang !== wanted) document.querySelector('.language-toggle, [data-language-toggle]')?.click();
    });
  }
})();
