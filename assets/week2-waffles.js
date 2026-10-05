(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const palette = ['#e8c36d', '#80b7b1', '#e59c7a', '#a99bd3', '#b8c5d2'];
  const category = (value, en, ja) => ({ value, en, ja });
  const laTravel = [category(72.3,'Drove alone','一人で車'), category(10.5,'Carpool','相乗り'), category(7.3,'Public transit','公共交通'), category(.8,'Bicycle','自転車'), category(9.1,'Other / worked at home','その他・在宅勤務')];
  const tokyoTravel = [category(9.4,'Car only','車のみ'), category(44.5,'Rail only','鉄道のみ'), category(7.3,'Rail + bus','鉄道＋バス'), category(2.5,'Bus only','バスのみ'), category(36.3,'Other modes / combinations / unknown','その他の手段・組合せ・不詳')];
  // Preserve each panel's original year and denominator; do not equate LA workers with Tokyo work/school travellers.
  const charts = {
    age: {
      la: [category(17.1,'65 and older','65歳以上'), category(82.9,'Under 65','65歳未満')],
      tokyo: [category(22.7,'65 and older','65歳以上'), category(77.3,'Under 65','65歳未満')]
    },
    diversity: {
      // 2020 Census, LA County redistricting report, Table A.2-1. All race groups below are non-Hispanic.
      la: [category(47.98,'Latino, any race','ラティーノ・人種不問'), category(25.60,'White, non-Latino','白人・非ラティーノ'), category(7.60,'Black, non-Latino','黒人・非ラティーノ'), category(14.72,'Asian, non-Latino','アジア系・非ラティーノ'), category(4.10,'Other / multiracial, non-Latino','その他・複数人種・非ラティーノ')],
      // Right-hand panel is LA Metro, not Tokyo. Unlisted remainder is not an invented survey category.
      tokyo: [category(58,'Latino / Hispanic','ラティーノ・ヒスパニック'), category(12,'White / Caucasian','白人'), category(14,'Black / African American','黒人・アフリカ系アメリカ人'), category(8,'Asian / Pacific Islander','アジア系・太平洋諸島系'), category(8,'Remaining share (not detailed)','残りの割合・内訳未掲載')]
    },
    education: {
      la: [category(36,'Bachelor’s or higher','学士以上'), category(64,'Below bachelor’s','学士未満')],
      tokyo: [category(35.2,'University','大学卒'), category(4.8,'Graduate school','大学院卒'), category(60,'Other education / not reported','その他の学歴・不詳')]
    },
    car: { la: laTravel, tokyo: tokyoTravel },
    rail: { la: laTravel, tokyo: tokyoTravel }
  };
  function allocation(categories) {
    const counts = categories.map(c => Math.floor(c.value));
    const order = categories.map((c,i) => ({i, remainder: c.value-counts[i]})).sort((a,b)=> b.remainder-a.remainder);
    const remaining = 100-counts.reduce((a,b)=>a+b,0);
    for (let n = 0; n < remaining; n++) counts[order[n].i]++;
    return counts;
  }
  function render() {
    const ja = document.documentElement.lang === 'ja';
    Object.entries(charts).forEach(([metric, regions]) => Object.entries(regions).forEach(([region, categories]) => {
      const panel = document.querySelector(`.comparison-frame[data-metric="${metric}"] .comparison-${region}`);
      if (!panel) return;
      panel.querySelectorAll('.comparison-dots, .comparison-road, .comparison-train, .waffle-chart').forEach(x=>x.remove());
      const wrapper = document.createElement('div'); wrapper.className = 'waffle-chart';
      const grid = document.createElement('div'); grid.className = 'waffle-grid'; grid.setAttribute('aria-hidden','true');
      const legend = document.createElement('ul'); legend.className = 'waffle-legend';
      const counts = allocation(categories);
      categories.forEach((c,index) => {
        const label = `${ja ? c.ja : c.en} ${c.value}%`;
        for (let n=0; n<counts[index]; n++) {
          const mark = document.createElementNS(ns,'svg'); mark.setAttribute('viewBox','0 0 20 20');
          mark.style.color = palette[index];
          const use = document.createElementNS(ns,'use'); use.setAttribute('href',`#comparison-ink-dot-${n%3}`);
          mark.append(use); grid.append(mark);
        }
        const item = document.createElement('li');
        const swatch = document.createElement('span'); swatch.className='waffle-key'; swatch.style.color=palette[index]; swatch.textContent='○';
        item.append(swatch, document.createTextNode(label)); legend.append(item);
      });
      const note = document.createElement('p'); note.className='waffle-rounding';
      note.textContent=ja ? '1つの丸 ≈ 1%。丸の数は合計100になるように丸めています。' : 'One circle ≈ 1%. Circle counts rounded to total 100.';
      wrapper.append(grid,legend,note); panel.append(wrapper);
    }));
  }
  render();
  const volumeGrid = document.querySelector('.freeway-volume-grid');
  if (volumeGrid) {
    for (let i = 0; i < 100; i++) {
      const mark = document.createElementNS(ns, 'svg');
      mark.setAttribute('viewBox', '0 0 20 20');
      const use = document.createElementNS(ns, 'use');
      use.setAttribute('href', `#comparison-ink-dot-${i % 3}`);
      mark.append(use); volumeGrid.append(mark);
    }
  }
  addEventListener('course-language-change',render);
})();
