const tenQuestionBuilder=window.buildUNStory;
window.buildUNStory=function(data){
 const quiz=tenQuestionBuilder(data);quiz.forEach((q,i)=>q.quizNumber=i+1);
 const make=(key,en,ja,head,jhead,copy,jcopy,source,n)=>{const q=[en,ja,'',head,copy,jcopy,source,'Opening based on documented disaster history and Yoh’s supplied personal account.'];q.answerJA=jhead;q.proof=[key,[],'Sources / 出典',source];q.autoReveal=true;q.bookend=key;q.openingNumber=n;q.chapter=['Before the quiz','クイズの前に'];return q;};
 const intro=[
  make('opening-claudio','Claudio','Claudio','','','Claudio is a photographer friend I met in Los Angeles. He greatly influenced my photography. Shortly after, I went to Banda Aceh.','Claudioは、ロサンゼルスで出会った写真家の友人。私の写真に大きな影響を与えてくれた。その後まもなく、私はバンダ・アチェへ向かった。','',1),
  make('opening-photo','26 December 2004','2004年12月26日','','','The Indian Ocean tsunami.','インド洋大津波。','https://legacy.itic.ioc-unesco.org/legacy.itic.ioc-unesco.org/index50c4.html?Itemid=1373&id=1136&layout=blog&option=com_content&view=category',1),
  make('opening-scale','A disaster across an ocean.','海を越えて広がった災害。','The scale','被害の規模','A magnitude 9.1 earthquake off Sumatra generated a tsunami across the Indian Ocean. The figures are historical estimates of dead or missing people, not a count of confirmed deaths alone.','スマトラ沖のマグニチュード9.1の地震が、インド洋を越える津波を起こした。数値は死亡・行方不明者の歴史的な推計で、確認された死者数だけではない。','https://legacy.itic.ioc-unesco.org/legacy.itic.ioc-unesco.org/index50c4.html?Itemid=1373&id=1136&layout=blog&option=com_content&view=category',2),
  make('opening-response','What did the UN do?','国連は、何をしたのか。','An international response, alongside local action.','地域の行動を支えた、国際的な対応。','Survivors, communities, governments and many other responders acted first and throughout the recovery. UN agencies helped coordinate international assistance, deliver supplies, support water and sanitation, and rebuild livelihoods.','生存者、地域、各国政府、多くの支援者が初動から復興まで動いた。国連の機関は、国際支援の調整、物資の輸送、水と衛生の確保、暮らしの再建を支えた。','https://digitallibrary.un.org/record/589279',3),
  make('opening-yoh','Banda Aceh. Muli and me.','バンダ・アチェ。Muliと、私。','','','Muli was working for UNDP in Jakarta. He took some time off, and together—just the two of us—we toured the disaster zone in Banda Aceh.','当時、MuliはジャカルタのUNDP（国連開発計画）で働いていた。彼が休みを取り、私たちは二人だけで、バンダ・アチェの被災地を巡った。','',4)
 ];
 intro.forEach((q,i)=>q.openingNumber=i+1);
 const gallery=make('closing-gallery','Ten landmark achievements','世界を変えた十の取り組み','','','','','',null);gallery.chapter=['After the questions','十の問いの、その先へ'];
 const album=make('closing-album','Banda Aceh · Photo album','バンダ・アチェ · 写真アルバム','','','','','',null);
 return [...intro,...quiz,gallery,album];
};
const tenQuestionDraw=window.drawUNScene;
window.drawUNScene=function(host,q){
 if(!q.bookend){tenQuestionDraw(host,q);return;}
 const T=(en,ja)=>document.documentElement.lang==='ja'?ja:en;
 const E=(tag,copy,parent=host)=>{const n=document.createElement(tag);if(copy)n.textContent=copy;parent.append(n);return n;};
 const a=(copy,url,parent=host)=>{const n=E('a',copy,parent);n.href=url;n.target='_blank';n.rel='noopener';return n;};
 host.classList.add('story-scene','bookend-scene');
 if(q.bookend==='opening-claudio'){host.classList.add('claudio-scene');const link=a('', 'https://www.facebook.com/photo?fbid=10161073665540036&set=pcb.10164187407288943');link.className='claudio-photo-link';link.setAttribute('aria-label',T('View Claudio’s photographs on Facebook in a new tab','Claudioの写真をFacebookの新しいタブで見る'));const img=E('img',null,link);img.src='assets/un-gallery/claudio-photography.png';img.alt=T('Black-and-white collage of ships, shipbreaking and workers, shared as Claudio’s photography.','Claudioの写真として紹介する、船、船の解体、働く人々の白黒写真のコラージュ。');E('span',T('Claudio, a photographer friend I met in Los Angeles, greatly influenced my photography. Soon after, I went to Banda Aceh. ↗','ロサンゼルスで出会った写真家の友人Claudio。私の写真に大きな影響を与えてくれた。その後まもなく、バンダ・アチェへ。↗'),link);return;}
 if(q.bookend==='opening-photo'){
  host.classList.add('opening-bleed');const img=E('img',null);img.src='assets/un-gallery/yoh-aceh-cover.png';img.alt=T('Banda Aceh disaster zone: two visitors beside a damaged building and overturned vehicle.','バンダ・アチェの被災地。損壊した建物と横転した車両のそばに立つ二人。');return;
 }
 if(q.bookend==='opening-scale'||q.bookend==='opening-response'){const photo=E('img',null);photo.className='opening-scene-photo';photo.src='assets/un-gallery/'+(q.bookend==='opening-scale'?'yoh-aceh-scale.png':'yoh-aceh-response.png');photo.alt=T('Photograph supplied by Yoh from the Banda Aceh disaster-zone story.','Yoh提供、バンダ・アチェの被災地の写真。');host.classList.add('personal-photo-scene');}
 if(q.bookend==='opening-scale'){
  const stats=E('div');stats.className='tsunami-stats';[[227898,T('dead or missing','死亡・行方不明者'),0],[14,T('countries with fatalities','犠牲者が出た国'),0],[9.1,T('earthquake magnitude','地震のマグニチュード'),1]].forEach(([value,label,decimals])=>{const box=E('div',null,stats),n=E('strong','',box);E('span',label,box);const format=v=>decimals?v.toFixed(decimals):Math.round(v).toLocaleString();n.textContent=format(value);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){let start;const tick=time=>{if(!n.isConnected)return;start??=time;const f=Math.min(1,(time-start)/1000);n.textContent=format(value*f);if(f<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}});
  E('p',T('Source: UNESCO-IOC / International Tsunami Information Center. Historical estimates; published totals differ by source and date.','出典：UNESCO-IOC／国際津波情報センター。歴史的な推計で、資料や集計時点により合計は異なります。')).className='scene-caption';return;
 }
 if(q.bookend==='opening-response'){
  E('h2',T('Many jobs. One enormous emergency.','必要だったのは、一つではない仕事。')).className='scene-title';const detail=E('p',T('Select a part of the response.','支援の役割を選んでみよう。'));detail.className='scene-detail';const list=E('div');list.className='response-roles';
  [['OCHA',T('Coordinating international humanitarian assistance and the UN appeal. OCHA is the UN coordination office, not the whole response.','国際的な人道支援と国連の資金要請を調整。OCHAは調整を担う事務所で、対応のすべてを行うわけではない。'),'https://digitallibrary.un.org/record/589279'],['UNICEF',T('Water, sanitation and support for children, working with governments and partners.','政府や協力者と、水・衛生や子どもへの支援に取り組んだ。'),'https://www.unicefusa.org/mission/emergencies/tsunamis/2004-south-asia'],['WFP / UNHCR',T('Food and logistics; shelter and essential supplies. Access by air and sea mattered where roads were lost.','食料と物流、避難用の住まいと必需品。道路を失った地域では空と海からのアクセスが重要だった。'),'https://www.unhcr.org/news/unhcrs-shelter-relief-boosted-swiss-helicopters'],['UNDP',T('Recovery included debris and waste management and restoring livelihoods—not simply replacing buildings. UNDP is the United Nations Development Programme.','瓦礫や廃棄物への対応、暮らしの再建も復興の仕事だった。UNDPは国連開発計画。'),'https://wedocs.unep.org/items/4cceb609-d1fc-4935-a6f8-a97397de3d76']].forEach(([name,copy,url])=>{const b=E('button',name,list);b.onclick=()=>{detail.textContent=copy;ref.href=url;ref.textContent=T('Read the source ↗','出典を読む ↗');};});const ref=a(T('UN response report ↗','国連の対応報告 ↗'),'https://digitallibrary.un.org/record/589279');return;
 }
 if(q.bookend==='opening-yoh'){
  const map=E('div');map.className='journey-map';const svg=worldMap(map,()=>{});svg.setAttribute('viewBox','540 150 110 75');const ns='http://www.w3.org/2000/svg';[[95.32,5.55,'Banda Aceh'],[106.85,-6.21,'Jakarta']].forEach(([lon,lat,name])=>{const x=(lon+180)*2,y=(90-lat)*2,c=document.createElementNS(ns,'circle');[['cx',x],['cy',y],['r',1.3],['fill','#b56b35']].forEach(([k,v])=>c.setAttribute(k,v));svg.append(c);const t=document.createElementNS(ns,'text');t.setAttribute('x',x+2);t.setAttribute('y',y-2);t.setAttribute('font-size','3');t.textContent=name;svg.append(t);});
  E('p',T('Jakarta → Banda Aceh','ジャカルタ → バンダ・アチェ')).className='journey-label';E('p',T('Yoh’s personal account. Map marks the two cities; it does not reconstruct the route travelled.','Yoh自身の記憶。地図は二つの都市の位置で、実際の移動経路を再現したものではありません。')).className='scene-caption';return;
 }
 if(q.bookend==='closing-album'){host.classList.add('album-scene');E('h1',T('Banda Aceh · Photo album','バンダ・アチェ · 写真アルバム'));const link=a('', 'https://photos.google.com/album/AF1QipNIw7yKmVUajCzX-VSoZL-r7SCYiGXHRII6c3-o');link.className='album-link';link.setAttribute('aria-label',T('Open my Banda Aceh photo album in a new tab','バンダ・アチェの写真アルバムを新しいタブで開く'));const img=E('img',null,link);img.src='assets/un-gallery/yoh-aceh-album.png';img.alt=T('Collage of photographs from Banda Aceh: people and streets after the tsunami.','津波後のバンダ・アチェの人々と街を写した写真のコラージュ。');E('span',T('Open photo album ↗','写真アルバムを開く ↗'),link);return;}
 E('h1',T('Ten achievements with global impact','世界に影響を与えた十の成果'));E('p',T('A curated selection, not a numerical ranking. These were achieved with states, communities, researchers and other partners. They do not cancel the failures we have discussed.','数値による順位ではなく、重要な取り組みを選んだもの。各国、地域、研究者、協力者とともに実現した成果であり、ここまで見た失敗を帳消しにするものではない。')).className='gallery-intro';
 const grid=E('div');grid.className='achievement-grid';window.UN_ACHIEVEMENTS.forEach(([en,ja,date,file,copy,jcopy,url,credit,photoURL],i)=>{const card=E('article',null,grid),photo=a('',file.startsWith('../')?'assets/un-photos/wfp-food.jpg':'assets/un-gallery/'+file,card),img=E('img',null,photo);img.src=photo.href;img.alt=credit;img.loading='lazy';const content=E('div',null,card);E('p',date,content).className='achievement-date';E('h2',T(en,ja),content);E('p',T(copy,jcopy),content);a(T('Reference ↗','参考資料 ↗'),url,content);const caption=E('p',credit,content);caption.className='achievement-credit';a(T('Photo source ↗','写真の出典 ↗'),photoURL,caption);});
};
window.afterUNRender=function(stage,q){
 document.body.dataset.bookend=q.bookend||'';const panel=stage.querySelector('.story-panel');
 if(q.bookend==='closing-gallery'||q.bookend==='closing-album'||q.bookend==='opening-claudio')panel.hidden=true;
 if(['opening-photo','opening-scale','opening-response'].includes(q.bookend)){
  panel.hidden=true;
  const caption=document.createElement('p');caption.className='personal-opening-caption';
  caption.textContent=q.bookend==='opening-photo'?(document.documentElement.lang==='ja'?'2004年12月26日。インド洋大津波。その後、Muliと二人でバンダ・アチェの被災地を巡った。':'26 December 2004. The Indian Ocean tsunami. Later, Muli and I travelled through the disaster zone in Banda Aceh.'):q.bookend==='opening-scale'?(document.documentElement.lang==='ja'?'インド洋を越えて広がった災害。死亡・行方不明者は歴史的な推計。':'A disaster across the Indian Ocean. Dead or missing: a historical estimate.'):(document.documentElement.lang==='ja'?'地域の人々と政府が動いた。国連は支援の調整、物資、水と衛生、暮らしの再建を支えた。':'Communities and governments responded. The UN helped coordinate aid, deliver supplies, restore water and sanitation, and rebuild livelihoods.');
  stage.querySelector('.bookend-scene').append(caption);
 }

 if(q.bookend==='opening-yoh'||q.bookend==='opening-claudio')stage.querySelector('.evidence')?.remove();
 const pos=document.querySelector('#position');pos.textContent=q.quizNumber?`${q.quizNumber} / 10`:q.openingNumber?`${document.documentElement.lang==='ja'?'はじめに':'Opening'} ${q.openingNumber} / 5`:(q.bookend==='closing-album'?(document.documentElement.lang==='ja'?'写真アルバム':'Photo album'):(document.documentElement.lang==='ja'?'成果のギャラリー':'Achievement gallery'));
};
