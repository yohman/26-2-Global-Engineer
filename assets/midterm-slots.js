(() => {
  const root = document.querySelector('[data-midterm-slots]');
  if (!root) return;
  const ja = () => document.documentElement.lang === 'ja';
  const t = (en,jp) => ja()?jp:en;
  const slots = ['A · November 17 · First','B · November 17 · Second','C · December 1 · First','D · December 1 · Second','E · December 15 · First'];
  let rows=[], message='';
  function csv(s) { const out=[];let row=[],v='',q=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++;}else q=!q;}else if(c===','&&!q){row.push(v);v='';}else if(/[\r\n]/.test(c)&&!q){if(c==='\r'&&s[i+1]==='\n')i++;row.push(v);out.push(row);row=[];v='';}else v+=c;}if(v||row.length){row.push(v);out.push(row);}return out; }
  function render(){
    root.replaceChildren();
    const p=document.createElement('p');p.textContent=t('Choose your slot and topic today, November 10. Names, topics, and choices are public. Your latest submission using the same name counts. Duplicate slot choices need Yoh’s confirmation.','本日11月10日に日程とテーマを選んでください。名前・テーマ・希望枠は公開されます。同じ名前の最新の提出を採用します。希望枠が重なった場合はYohが調整します。');root.append(p);
    const table=document.createElement('table');table.className='midterm-schedule';
    const caption=table.createCaption();caption.textContent=t('Mid-term schedule · 30 minutes each','中間発表の日程・一人30分');
    const head=table.createTHead().insertRow();[t('Slot / date','枠・日程'),t('Student / topic','学生・テーマ')].forEach(v=>{const th=document.createElement('th');th.textContent=v;head.append(th);});
    const body=table.createTBody();slots.forEach((s,i)=>{const tr=body.insertRow();tr.insertCell().textContent=s;const selected=rows.filter(r=>r[2].startsWith(`[Midterm ${'ABCDE'[i]}] `));tr.insertCell().textContent=selected.length?selected.map(r=>`${r[1]} — ${r[2].replace(/^\[Midterm [A-E]\] /,'')}`).join('; ')+(selected.length>1?t(' · Conflict: confirm with Yoh','・重複：Yohに確認'): ''):message||t('Open','未割当');});root.append(table);
    const form=document.createElement('form');form.className='midterm-signup';form.action='https://docs.google.com/forms/d/e/1FAIpQLScMnACVgNNdy3TR0yoZR1NyH61rNB-mjA6GJAWJ3pNbK8SSTA/formResponse';form.method='post';form.target='slot-receipt';
    const label=(text,el)=>{const l=document.createElement('label');l.textContent=text;l.append(el);form.append(l);};
    const name=document.createElement('input');name.name='entry.353120641';name.required=true;name.maxLength=100;label(t('Name','名前'),name);
    const slot=document.createElement('select');slot.required=true;slots.forEach((s,i)=>slot.add(new Option(s,'ABCDE'[i])));label(t('Presentation slot','発表枠'),slot);
    const topic=document.createElement('input');topic.required=true;topic.maxLength=120;label(t('Topic / working title','テーマ・仮タイトル'),topic);
    ['entry.524778989','entry.1745886152','entry.48860208'].forEach(n=>{const el=document.createElement('input');el.type='hidden';el.name=n;form.append(el);});
    const button=document.createElement('button');button.className='button';button.textContent=t('Submit slot and topic','日程とテーマを提出');form.append(button);
    const status=document.createElement('p');status.setAttribute('role','status');form.append(status);
    form.addEventListener('submit',()=>{form.elements['entry.524778989'].value=`[Midterm ${slot.value}] ${topic.value.trim()}`;form.elements['entry.1745886152'].value='https://yohman.github.io/26-2-Global-Engineer/projects.html#slots';form.elements['entry.48860208'].value='Mid-term slot and topic selection';status.textContent=t('Sent for submission. Refresh the schedule to verify your entry; publication may take a few minutes.','送信しました。「日程を更新」で掲載を確認してください。反映に数分かかる場合があります。');});root.append(form);
    const frame=document.createElement('iframe');frame.name='slot-receipt';frame.title='Submission receipt';frame.hidden=true;root.append(frame);
    const refresh=document.createElement('button');refresh.textContent=t('Refresh schedule','日程を更新');refresh.addEventListener('click',load);root.append(refresh);
  }
  async function load(){message=t('Loading…','読み込み中…');render();try{const res=await fetch(window.ASSIGNMENT_SUBMISSION_CONFIG.feed,{cache:'no-store'});if(!res.ok)throw Error();const latest=new Map();csv(await res.text()).filter(r=>/^\[Midterm [A-E]\] /.test(r[2]||'')).forEach(r=>latest.set(r[1].normalize('NFKC').trim().toLowerCase(),r));rows=[...latest.values()];message='';}catch{message=t('Schedule unavailable. Please refresh.','日程を取得できません。更新してください。');}render();}
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});load();
})();
