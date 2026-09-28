(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = { map:$('atlas-map'), name:$('atlas-country-name'), search:$('atlas-country-search'), options:$('atlas-country-options'), world:$('atlas-world'), sheet:$('atlas-sheet'), welcome:document.querySelector('.atlas-welcome'), selected:document.querySelector('.atlas-selected'), welcomeTitle:$('atlas-welcome-title'), welcomeCopy:$('atlas-welcome-copy'), hint:$('atlas-welcome-hint'), count:$('atlas-stage-count'), campus:$('atlas-use-campus'), demo:$('atlas-demo'), myJourney:$('atlas-my-journey'), clear:$('atlas-clear'), selectedName:$('atlas-selected-name'), form:$('atlas-form'), first:document.querySelector('.atlas-form-first'), second:document.querySelector('.atlas-form-second'), next:$('atlas-next'), back:$('atlas-back'), status:$('atlas-form-status'), existing:$('atlas-existing'), filmstrip:$('atlas-filmstrip'), filmstripTrack:$('atlas-filmstrip-track'), filmstripTitle:$('atlas-filmstrip-title'), filmstripKicker:$('atlas-filmstrip-kicker'), filmstripPlay:$('atlas-filmstrip-play'), filmstripClose:$('atlas-filmstrip-close'), tether:$('atlas-tether'), tetherLine:$('atlas-tether-line'), tetherHalo:$('atlas-tether-halo') };
  const config = window.ATLAS_CONFIG || {};
  const storageKey = 'global-engineer-atlas-journey-v2';
  const japan = [139.967,35.862];
  const sample = { id:'simulated-mina', alias:'Mina', simulated:true, origin:{place:'Kashiwa, Japan',point:japan,beat:'IDEA',engineering:'Metro = tunnels + signals + power + stations + access. One system.'}, hops:[
    {country:'Philippines',point:[121.04,14.60],year:2018,beat:'DESIGN',lens:'Infrastructure',engineering:'A planned 25-km first subway must thread beneath a congested city.',reason:'Who gives up land to make it possible?',trace:'The 2018 Japanese loan supported the planned first subway. Later construction and resettlement are part of the story, too.',mediaUrl:'https://www.jica.go.jp/oda/project/PH-P267/',costUrl:'https://www.jica.go.jp/english/about/policy/environment/objection/philippines_02.html'},
    {country:'India',point:[77.21,28.61],year:2025,beat:'SCALE',lens:'Infrastructure',engineering:'New corridors must join an existing metro and widen access.',reason:'Who gains from the expansion?',trace:'JICA’s 2025 loan supports additional Delhi Metro corridors; it does not mean Manila and Delhi share one design.',mediaUrl:'https://www.jica.go.jp/english/overseas/india/information/press/2024/1565716_53431.html'},
    {country:'Indonesia',point:[106.83,-6.18],year:2026,beat:'FUTURE QUESTION',lens:'Infrastructure',engineering:'A design study considers shield tunneling and flood exposure.',reason:'How would an underground line live with floods?',trace:'This is Mina’s 2026 question about an earlier design study, not a claim that this work happened in 2026.',mediaUrl:'https://openjicareport.jica.go.jp/pdf/12144796_02.pdf'}
  ]};
  let map,features=[],stage='origin',origin=null,selected=null,hover='',journey=readJourney(),markers=[],returnStage='origin';
  let activeRoute=null,activeMoment=0,playTimer=null,tetherFrame=0;
  function readJourney(){try{const v=JSON.parse(localStorage.getItem(storageKey)||'null');return v&&Array.isArray(v.hops)&&v.origin?v:null}catch{return null}}
  function writeJourney(v){try{localStorage.setItem(storageKey,JSON.stringify(v));return true}catch{return false}}
  function safeUrl(v){try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}}
  function node(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!=null)n.textContent=content;return n}
  function pointFor(feature){const coords=[];function visit(v){if(!Array.isArray(v))return;if(typeof v[0]==='number')coords.push(v);else v.forEach(visit)}visit(feature.geometry.coordinates);if(!coords.length)return[0,0];return[(Math.min(...coords.map(p=>p[0]))+Math.max(...coords.map(p=>p[0])))/2,(Math.min(...coords.map(p=>p[1]))+Math.max(...coords.map(p=>p[1])))/2]}
  function setCountryName(name,active=false){ui.name.textContent=name||'Japan';ui.name.classList.toggle('is-hover',active)}
  function setStage(next){
    stage=next;
    ui.sheet.hidden=next==='demo';
    ui.filmstrip.hidden=next!=='demo';
    ui.tether.classList.toggle('is-visible',next==='demo');
    ui.welcome.hidden=!['origin','choose'].includes(next);
    ui.selected.hidden=next!=='selected';
    ui.name.hidden=!['origin','choose'].includes(next);
    ui.sheet.classList.toggle('atlas-sheet--welcome',!ui.welcome.hidden);
    ui.myJourney.hidden=!journey||!journey.hops.length;
    ui.search.disabled=next==='origin';
    if(next==='origin'){
      ui.welcomeTitle.textContent='Start in Japan.';
      ui.welcomeCopy.textContent='After we hear each other’s stories, tap a hometown or another meaningful place in Japan. Then follow your curiosity outward. You do not need to prove a global connection yet.';
      ui.hint.textContent='Tap your place in Japan';ui.count.textContent='01 / 03';
      ui.campus.textContent='Start at Reitaku campus ↗';setCountryName('Japan');
    }else if(next==='choose'){
      ui.welcomeTitle.textContent=journey?.hops.length?'Where next?':'Follow a thread.';
      ui.welcomeCopy.textContent=journey?.hops.length?'One stop is saved. Choose another country to extend your journey, or review what you have made.':'Hover or tap a nation. Choose a technology, infrastructure, person, or object that makes you curious. A question is enough to begin.';
      ui.hint.textContent='Choose a nation';ui.count.textContent='02 / 03';
      ui.campus.textContent='Change my starting place';setCountryName('The world');
    }
    renderRoutes();
  }
  function setOrigin(point,place){origin={place,point};if(journey&&journey.hops.length){journey.origin=origin;writeJourney(journey)}setStage('choose');map?.easeTo({center:[110,20],zoom:1.7,duration:900})}
  function useCountry(feature){if(!origin)return;const name=feature.properties.name;if(name==='Japan')return;selected={name,feature,point:pointFor(feature)};map.setFilter('atlas-selected-fill',['==',['get','name'],name]);ui.selectedName.textContent=name;ui.form.elements.localPlace.value=origin.place;ui.form.elements.alias.value=journey?.alias||'';ui.selected.querySelector('.atlas-selected-prompt').textContent='What brought this place to mind?';ui.first.hidden=false;ui.second.hidden=true;ui.status.textContent='';ui.existing.hidden=true;showExisting(name);setStage('selected');setCountryName(name)}
  function showExisting(name){const stops=sample.hops.filter(h=>h.country===name);if(!stops.length)return;ui.existing.replaceChildren();const details=node('details');details.append(node('summary','','A simulated student also wondered about this place'));for(const hop of stops){const line=node('div','atlas-trace');line.append(node('strong','',`${hop.year} · ${hop.lens}`),node('p','',hop.reason));if(hop.mediaUrl){const link=node('a','','See the source ↗');link.href=hop.mediaUrl;link.target='_blank';link.rel='noopener noreferrer';line.append(link)}details.append(line)}ui.existing.append(details);ui.existing.hidden=false}
  function lineFeatures(route){if(!route?.origin||!route.hops?.length)return[];const points=[route.origin.point,...route.hops.map(h=>h.point)];return points.slice(1).map((point,i)=>({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[points[i],point]}}))}
  function removeMarkers(){markers.forEach(m=>m.remove());markers=[]}
  function addMarker(point,label,kind,photoUrl,index=null){
    const interactive=stage==='demo'&&index!==null;
    const dot=node(interactive?'button':'div',`atlas-portrait atlas-portrait--${kind}`);
    if(interactive){
      dot.type='button';
      dot.addEventListener('click',()=>{stopPlayback();setActiveMoment(index,true)});
    }
    dot.title=label;
    if(kind==='stop'&&index!==null)dot.dataset.step=String(index);
    if(photoUrl&&photoUrl.startsWith('assets/')){
      const img=node('img');img.src=photoUrl;img.alt='';dot.append(img);
    }else dot.textContent=kind==='origin'?'J':(activeRoute?.alias||label).slice(0,1).toUpperCase();
    const pin=new maplibregl.Marker({element:dot,anchor:'center'}).setLngLat(point).addTo(map);
    if(interactive)dot.setAttribute('aria-label',`Show ${label} in the story`);
    markers.push(pin);
  }
  function renderRoutes(){
    if(!map?.getSource('atlas-route'))return;
    if(!map.getSource('atlas-focus-route')){
      map.addSource('atlas-focus-route',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      map.addLayer({id:'atlas-focus-line',type:'line',source:'atlas-focus-route',layout:{'line-cap':'round'},paint:{'line-color':'#d74b3f','line-width':4,'line-dasharray':[1,2]}});
    }
    const route=stage==='demo'?activeRoute:journey;
    let lines=lineFeatures(route);
    if(stage==='selected'&&origin&&selected){
      const previous=journey?.hops.length?journey.hops.at(-1).point:origin.point;
      lines=[...lines,{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[previous,selected.point]}}];
    }
    map.getSource('atlas-route').setData({type:'FeatureCollection',features:lines});
    if(stage!=='demo')map.getSource('atlas-focus-route')?.setData({type:'FeatureCollection',features:[]});
    removeMarkers();
    if(route?.origin&&(stage==='demo'||journey?.hops.length)){
      addMarker(route.origin.point,route.origin.place,'origin',null,stage==='demo'?0:null);
      route.hops.forEach((hop,i)=>addMarker(hop.point,`${route.alias} · ${i+1}: ${hop.country}`,'stop',route.photoUrl,i+1));
    }else if(origin)addMarker(origin.point,origin.place,'origin');
  }
  function frameMoment(route,index){
    return index===0?{...route.origin,country:'Japan',reason:'A place I know. A question begins here.'}:route.hops[index-1];
  }
  function timeGap(previous,current){
    if(previous?.year&&current?.year){
      const years=Math.abs(current.year-previous.year);
      return {label:years?`${years} ${years===1?'year':'years'} ${current.year>previous.year?'later':'earlier'}`:'same year',width:Math.min(205,68+years*18)};
    }
    return {label:!previous?.year&&current?.year?'first thread':'time unmarked',width:88};
  }
  function buildFilmstrip(route){
    ui.filmstripTitle.textContent=route.simulated?'Mina: what travels with a metro?':`${route.alias||'My'}’s engineering threads`;
    ui.filmstripKicker.textContent=route.simulated?'SIMULATED ENGINEERING STORY':'MY STUDIO JOURNEY';
    ui.filmstripTrack.replaceChildren();
    const moments=[route.origin,...route.hops];
    moments.forEach((moment,index)=>{
      if(index){
        const gapInfo=timeGap(moments[index-1],moment);
        const gap=node('div','atlas-time-gap');
        gap.style.setProperty('--gap-width',`${gapInfo.width}px`);
        gap.append(node('span','',gapInfo.label));
        ui.filmstripTrack.append(gap);
      }
      const frame=node('article','atlas-frame');frame.dataset.moment=index;
      const button=node('button','atlas-frame-button');button.type='button';
      button.setAttribute('aria-label',`Focus ${moment.country||'Japan'}${moment.year?` in ${moment.year}`:''}`);
      const top=node('span','atlas-frame-top');
      top.append(node('span','atlas-frame-year',moment.year||(index?'UNDATED':'HERE')),node('span','atlas-frame-beat',moment.beat||moment.lens||'QUESTION'));
      button.append(top,node('span','atlas-frame-place',index?moment.country:moment.place));
      button.append(node('span','atlas-frame-story',moment.engineering||moment.reason||'A question begins here.'));
      if(moment.engineering&&moment.reason)button.append(node('span','atlas-frame-question',moment.reason));
      else if(moment.trace)button.append(node('span','atlas-frame-question',moment.trace));
      button.addEventListener('click',()=>{stopPlayback();setActiveMoment(index,true)});
      frame.append(button);
      const sources=node('div','atlas-frame-sources');
      const url=safeUrl(moment.mediaUrl);
      if(url){const link=node('a','atlas-frame-source',moment.country==='Indonesia'&&route.simulated?'2013 study ↗':'Project ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';sources.append(link)}
      const costUrl=safeUrl(moment.costUrl);
      if(costUrl){const link=node('a','atlas-frame-source','Social cost ↗');link.href=costUrl;link.target='_blank';link.rel='noopener noreferrer';sources.append(link)}
      if(sources.childNodes.length)frame.append(sources);
      ui.filmstripTrack.append(frame);
    });
  }
  function requestTether(){
    if(tetherFrame)return;
    tetherFrame=requestAnimationFrame(()=>{tetherFrame=0;updateTether()});
  }
  function updateTether(){
    if(stage!=='demo'||!markers[activeMoment])return;
    const frame=ui.filmstripTrack.querySelector(`[data-moment="${activeMoment}"]`);
    if(!frame)return;
    const marker=markers[activeMoment].getElement();
    const a=frame.getBoundingClientRect(),b=marker.getBoundingClientRect(),stageRect=ui.map.parentElement.getBoundingClientRect();
    const x1=a.left+a.width/2-stageRect.left,y1=a.top-stageRect.top;
    const x2=b.left+b.width/2-stageRect.left,y2=b.top+b.height/2-stageRect.top;
    const visible=x2>=0&&x2<=stageRect.width&&y2>=0&&y2<y1;
    ui.tether.classList.toggle('is-visible',visible);
    if(!visible)return;
    const path=`M ${x1} ${y1} C ${x1} ${y1-72}, ${x2} ${y2+75}, ${x2} ${y2}`;
    ui.tetherLine.setAttribute('d',path);ui.tetherHalo.setAttribute('d',path);
  }
  function setActiveMoment(index,move=false){
    if(stage!=='demo'||!activeRoute)return;
    activeMoment=Math.max(0,Math.min(index,activeRoute.hops.length));
    ui.filmstripTrack.querySelectorAll('.atlas-frame').forEach((frame,i)=>frame.classList.toggle('is-active',i===activeMoment));
    markers.forEach((marker,i)=>marker.getElement().classList.toggle('is-active',i===activeMoment));
    const moment=frameMoment(activeRoute,activeMoment);
    map.setFilter('atlas-selected-fill',['==',['get','name'],activeMoment?moment.country:'']);
    const previous=activeMoment?frameMoment(activeRoute,activeMoment-1):null;
    const features=previous?[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[previous.point,moment.point]}}]:[];
    map.getSource('atlas-focus-route')?.setData({type:'FeatureCollection',features});
    const frame=ui.filmstripTrack.querySelector(`[data-moment="${activeMoment}"]`);
    if(frame)ui.filmstripTrack.scrollTo({left:frame.offsetLeft-ui.filmstripTrack.offsetLeft-ui.filmstripTrack.clientWidth/2+frame.offsetWidth/2,behavior:'smooth'});
    if(move)map.easeTo({center:moment.point,zoom:activeMoment?3.3:3.1,offset:[0,-80],duration:1050});
    requestTether();
  }
  function stopPlayback(){if(playTimer)clearTimeout(playTimer);playTimer=null;ui.filmstripPlay.textContent='Play journey ▶'}
  function playJourney(){
    if(playTimer){stopPlayback();return}
    if(activeMoment>=activeRoute.hops.length)setActiveMoment(0,true);
    ui.filmstripPlay.textContent='Pause Ⅱ';
    const advance=()=>{
      if(activeMoment>=activeRoute.hops.length){stopPlayback();return}
      const from=frameMoment(activeRoute,activeMoment),to=frameMoment(activeRoute,activeMoment+1);
      setActiveMoment(activeMoment+1,true);
      const gap=from.year&&to.year?Math.abs(to.year-from.year):0;
      playTimer=setTimeout(advance,Math.min(3000,1450+gap*230));
    };
    playTimer=setTimeout(advance,750);
  }
  function showJourney(route,personal=false){
    stopPlayback();returnStage=stage;activeRoute=route;activeMoment=0;
    buildFilmstrip(route);setStage('demo');
    setActiveMoment(0,true);
  }
  function saveDraft(){const f=ui.form.elements,localPlace=f.localPlace.value.trim(),reason=f.reason.value.trim(),lens=ui.form.querySelector('[name="lens"]:checked')?.value,alias=f.alias.value.trim(),mediaUrl=f.mediaUrl.value.trim();if(!localPlace||!reason||!lens||!alias){ui.status.textContent='Please add your starting place, a reason, a thread, and your name or alias.';return}if(mediaUrl&&!safeUrl(mediaUrl)){ui.status.textContent='Please use an http or https link, or leave it blank.';return}const yearText=f.year.value.trim(),year=yearText?Number(yearText):null;if(year&&(year<1900||year>2100)){ui.status.textContent='Please enter a year between 1900 and 2100.';return}const hop={country:selected.name,point:selected.point,reason,lens,year,trace:f.trace.value.trim(),mediaUrl:safeUrl(mediaUrl)};const draft=journey||{id:`journey-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,alias,origin,hops:[]};draft.alias=alias;draft.origin={place:localPlace,point:origin.point};draft.hops.push(hop);const localSaved=writeJourney(draft);journey=draft;origin=draft.origin;ui.form.reset();ui.status.textContent=localSaved?'Saved on this device. Sending to the class intake…':'Could not save on this device. Please keep a copy of your story.';renderRoutes();if(config.formResponseUrl&&config.fields){const fields=new URLSearchParams();fields.set(config.fields.alias,draft.alias);fields.set(config.fields.title,`${draft.origin.place} → ${hop.country}`);fields.set(config.fields.record,JSON.stringify(draft));fetch(config.formResponseUrl,{method:'POST',mode:'no-cors',credentials:'omit',body:fields}).then(()=>{ui.status.textContent='Saved on this device. Sent to class intake, but delivery cannot be verified here. Public map display is not yet connected.'}).catch(()=>{ui.status.textContent='Saved on this device; sending to class intake failed. Please try again later.'})}else ui.status.textContent='Saved on this device. Class intake is not configured yet.';ui.first.hidden=true;ui.second.hidden=true;ui.selected.querySelector('.atlas-selected-prompt').textContent='Your thread has been added. Choose another nation when you are ready.';ui.myJourney.hidden=false;ui.existing.hidden=true;const again=node('button','atlas-primary atlas-add-hop','Add another hop →');again.type='button';again.addEventListener('click',()=>{selected=null;map.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage('choose')});ui.existing.replaceChildren(again);ui.existing.hidden=false}
  async function initMap(){
    if(!window.maplibregl||!window.topojson){ui.hint.textContent='Map unavailable. Please reload when connected.';return}
    map=new maplibregl.Map({container:ui.map,style:'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',center:[137,37],zoom:2.55,minZoom:1.2,maxZoom:8,attributionControl:false});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
    map.on('load',async()=>{
      try{
        const response=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        if(!response.ok)throw new Error('Country boundaries unavailable');
        const topology=await response.json();
        features=topojson.feature(topology,topology.objects.countries).features;
        map.addSource('atlas-countries',{type:'geojson',data:{type:'FeatureCollection',features}});
        const firstLabel=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
        function addFill(id,paint,filter){
          const layer={id,type:'fill',source:'atlas-countries',paint};
          if(filter)layer.filter=filter;
          map.addLayer(layer,firstLabel);
        }
        addFill('atlas-muted',{'fill-color':'#d9d8d0','fill-opacity':.72});
        addFill('atlas-japan',{'fill-color':'#d74b3f','fill-opacity':.85},['==',['get','name'],'Japan']);
        addFill('atlas-hover',{'fill-color':'#f4c745','fill-opacity':.9},['==',['get','name'],'']);
        addFill('atlas-selected-fill',{'fill-color':'#20567c','fill-opacity':.86},['==',['get','name'],'']);
        map.addLayer({id:'atlas-outline',type:'line',source:'atlas-countries',paint:{'line-color':'#f7f4ed','line-width':.6,'line-opacity':.65}},firstLabel);
        map.addLayer({id:'atlas-hit',type:'fill',source:'atlas-countries',paint:{'fill-color':'#000000','fill-opacity':.01}});
        map.addSource('atlas-route',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
        map.addLayer({id:'atlas-route-line',type:'line',source:'atlas-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#164d70','line-width':3,'line-dasharray':[1,2],'line-opacity':.92}});
        features.map(f=>f.properties.name).sort().forEach(name=>{const option=node('option');option.value=name;ui.options.append(option)});
        map.on('mousemove','atlas-hit',event=>{
          const name=event.features[0]?.properties.name;
          if(!name||hover===name)return;
          hover=name;map.getCanvas().style.cursor='pointer';
          map.setFilter('atlas-hover',['==',['get','name'],name==='Japan'?'':name]);
          if(stage!=='demo')setCountryName(name,name!=='Japan');
        });
        map.on('mouseleave','atlas-hit',()=>{
          hover='';map.getCanvas().style.cursor='';
          map.setFilter('atlas-hover',['==',['get','name'],'']);
          if(stage!=='demo')setCountryName(selected?.name||(origin?'The world':'Japan'));
        });
        map.on('click','atlas-hit',event=>{
          const feature=event.features[0];if(!feature)return;
          if(stage==='origin'&&feature.properties.name==='Japan')setOrigin([event.lngLat.lng,event.lngLat.lat],'My chosen place in Japan');
          else if(['choose','selected'].includes(stage))useCountry(feature);
        });
        if(journey?.hops.length){origin=journey.origin;setStage('choose');map.jumpTo({center:[110,20],zoom:1.7})}
        else setStage('origin');
      }catch(error){ui.hint.textContent='The map could not load country boundaries. Please reconnect and reload.';console.error(error)}
    });
  }
  ui.campus.addEventListener('click',()=>{if(stage==='choose'){origin=null;setStage('origin');map?.easeTo({center:[137,37],zoom:2.55})}else setOrigin(japan,'Reitaku campus, Kashiwa')});
  ui.world.addEventListener('click',()=>map?.easeTo({center:[100,20],zoom:1.55,duration:800}));
  ui.search.addEventListener('change',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature){useCountry(feature);ui.search.value=''}});
  ui.demo.addEventListener('click',()=>showJourney(sample));ui.myJourney.addEventListener('click',()=>{if(journey)showJourney(journey,true)});
  function closeJourney(){stopPlayback();activeRoute=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage(returnStage==='origin'?'origin':'choose');map?.easeTo(returnStage==='origin'?{center:[137,37],zoom:2.55,duration:800}:{center:[110,20],zoom:1.7,duration:800})}
  ui.filmstripClose.addEventListener('click',closeJourney);
  ui.filmstripPlay.addEventListener('click',playJourney);
  ui.filmstripTrack.addEventListener('scroll',requestTether);
  window.addEventListener('resize',requestTether);
  ui.clear.addEventListener('click',()=>{selected=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage('choose')});
  ui.next.addEventListener('click',()=>{const f=ui.form.elements;if(!f.localPlace.value.trim()||!f.reason.value.trim()||!ui.form.querySelector('[name="lens"]:checked')){ui.status.textContent='Add a starting place, a reason, and one kind of thread to follow.';return}ui.status.textContent='';ui.first.hidden=true;ui.second.hidden=false;ui.sheet.scrollTop=0});
  ui.search.addEventListener('input',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature&&origin){useCountry(feature);ui.search.value=''}});
  ui.back.addEventListener('click',()=>{ui.first.hidden=false;ui.second.hidden=true;ui.status.textContent=''});ui.form.addEventListener('submit',event=>{event.preventDefault();saveDraft()});
  ui.campus.disabled=true;ui.demo.disabled=true;
  initMap();
  if(map){map.jumpTo({center:[137,37],zoom:2.55});map.on('move',requestTether);map.on('idle',()=>{if(map.getSource('atlas-route')){ui.campus.disabled=false;ui.demo.disabled=false}})}
})();
