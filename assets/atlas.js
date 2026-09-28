(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = { map:$('atlas-map'), name:$('atlas-country-name'), search:$('atlas-country-search'), options:$('atlas-country-options'), world:$('atlas-world'), sheet:$('atlas-sheet'), welcome:document.querySelector('.atlas-welcome'), selected:document.querySelector('.atlas-selected'), welcomeTitle:$('atlas-welcome-title'), welcomeCopy:$('atlas-welcome-copy'), hint:$('atlas-welcome-hint'), count:$('atlas-stage-count'), campus:$('atlas-use-campus'), demo:$('atlas-demo'), yoh:$('atlas-yoh'), studioOpen:$('atlas-studio-open'), myJourney:$('atlas-my-journey'), clear:$('atlas-clear'), selectedName:$('atlas-selected-name'), form:$('atlas-form'), first:document.querySelector('.atlas-form-first'), second:document.querySelector('.atlas-form-second'), next:$('atlas-next'), back:$('atlas-back'), status:$('atlas-form-status'), existing:$('atlas-existing'), markerPreview:$('atlas-marker-preview'), filmstrip:$('atlas-filmstrip'), filmstripTrack:$('atlas-filmstrip-track'), filmstripTitle:$('atlas-filmstrip-title'), filmstripKicker:$('atlas-filmstrip-kicker'), filmstripPrev:$('atlas-filmstrip-prev'), filmstripNext:$('atlas-filmstrip-next'), filmstripPlay:$('atlas-filmstrip-play'), filmstripEdit:$('atlas-filmstrip-edit'), filmstripAdd:$('atlas-filmstrip-add'), filmstripStudio:$('atlas-filmstrip-studio'), filmstripClose:$('atlas-filmstrip-close'), studio:$('atlas-studio'), studioYears:$('atlas-studio-years'), studioLanes:$('atlas-studio-lanes'), studioClose:$('atlas-studio-close'), editor:$('atlas-editor'), editorForm:$('atlas-editor-form'), editorStatus:$('atlas-editor-status'), access:$('atlas-access'), accessForm:$('atlas-access-form'), accessStatus:$('atlas-access-status') };
  const config = window.ATLAS_CONFIG || {};
  const workerUrl = String(config.workerUrl || '').replace(/\/$/, '');
  const t = value => document.documentElement.lang === 'ja' ? (window.COURSE_TRANSLATIONS?.ja?.[String(value)] || value) : value;
  const storageKey = 'global-engineer-atlas-journey-v2';
  const japan = [139.967,35.862];
  const sample = { id:'simulated-mina', alias:'Mina', simulated:true, marker:{color:'#20567c',symbol:'M'}, origin:{place:'Kashiwa, Japan',point:japan,beat:'IDEA',engineering:'Metro = tunnels + signals + power + stations + access. One system.'}, hops:[
    {country:'Philippines',point:[121.04,14.60],year:2018,beat:'DESIGN',lens:'Infrastructure',engineering:'A planned 25-km first subway must thread beneath a congested city.',reason:'Who gives up land to make it possible?',trace:'The 2018 Japanese loan supported the planned first subway. Later construction and resettlement are part of the story, too.',mediaUrl:'https://www.jica.go.jp/oda/project/PH-P267/',costUrl:'https://www.jica.go.jp/english/about/policy/environment/objection/philippines_02.html'},
    {country:'India',point:[77.21,28.61],year:2025,beat:'SCALE',lens:'Infrastructure',engineering:'New corridors must join an existing metro and widen access.',reason:'Who gains from the expansion?',trace:'JICA’s 2025 loan supports additional Delhi Metro corridors; it does not mean Manila and Delhi share one design.',mediaUrl:'https://www.jica.go.jp/english/overseas/india/information/press/2024/1565716_53431.html'},
    {country:'Indonesia',point:[106.83,-6.18],year:2026,beat:'FUTURE QUESTION',lens:'Infrastructure',engineering:'A design study considers shield tunneling and flood exposure.',reason:'How would an underground line live with floods?',trace:'This is Mina’s 2026 question about an earlier design study, not a claim that this work happened in 2026.',mediaUrl:'https://openjicareport.jica.go.jp/pdf/12144796_02.pdf'}
  ]};
  const yohStory = { id:'yoh-draft', alias:'Yoh', title:'From rice fields to disaster stories', kicker:'YOH’S STORY · DRAFT', marker:{color:'#ac4939',symbol:'旅'}, origin:{place:'Japan',point:[138.2,36.2],year:1960,beat:'SEED',engineering:'My father begins doctoral study in tropical agriculture. His research will shape where our family lives.'}, hops:[
    {country:'Philippines',place:'IRRI · Los Baños',point:[121.24,14.17],year:1964,beat:'ENCOUNTER',engineering:'My father does fieldwork at IRRI while pursuing his PhD.',reason:'In the Philippines he meets my mother. They marry, and a research journey becomes a family story.',image:'lectures/assets/irri-rice-science.png',imageAlt:'Present-day rice research image from IRRI; not a photograph from 1964.',mediaUrl:'https://isl.irri.org/contact-us',sourceLabel:'IRRI ↗'},
    {country:'Colombia',place:'CIAT · Colombia',point:[-76.35,3.52],year:1971,beat:'ROOTS',engineering:'My father’s cassava research at CIAT brings our family to Colombia. I am born here in 1971.',reason:'How does agricultural science reach farmers—and change the lives of researchers’ families?',image:'lectures/assets/kazuo-kawano-cassava-book.png',imageAlt:'Book cover featuring Kazuo Kawano in a cassava field; published later than the 1971 event.',mediaUrl:'https://alliancebioversityciat.org/regions/americas/colombia',sourceLabel:'CIAT ↗'},
    {country:'Thailand',place:'Bangkok · Thailand',point:[100.5,13.75],year:1982,period:'Bangkok years',beat:'REGIONAL BASE',engineering:'Our family moves to Bangkok. My father oversees Southeast Asian work from here.',reason:'The work is not contained by one country; relationships and field visits make a region.'},
    {country:'Vietnam',place:'Vietnam · regional visits',point:[106.4,16.0],dateLabel:'1982+',period:'Bangkok years',beat:'FIELD THREAD',engineering:'My father travels to Vietnam during his Bangkok-based years.',reason:'One of several branches of regional agricultural work; the exact visit dates and cities are not specified.'},
    {country:'Indonesia',place:'Indonesia · regional visits',point:[110.4,-7.0],dateLabel:'1982+',period:'Bangkok years',beat:'FIELD THREAD',engineering:'Indonesia is another recurring destination in my father’s regional work.',reason:'This is a country-level marker, not a claim about a particular city or year.'},
    {country:'Philippines',place:'Philippines · regional visits',point:[122.4,12.8],dateLabel:'1982+',period:'Bangkok years',beat:'RETURN',engineering:'He also travels back to the Philippines during the Bangkok years.',reason:'The same country can re-enter a life story in a different role and period.'},
    {country:'United States of America',place:'UCLA · Los Angeles',point:[-118.44,34.07],year:1995,beat:'MY PATH',engineering:'I move to UCLA, where I pursue an M.A. in urban planning and later a PhD.',reason:'My own questions about cities, people, and place begin to take shape.'},
    {country:'Indonesia',place:'Banda Aceh · Indonesia',point:[95.32,5.55],year:2004,beat:'TURNING POINT',engineering:'After the Indian Ocean tsunami, I travel to Banda Aceh to witness its aftermath.',reason:'Meeting the leader of an IDP camp changes what I understand my work to be.',image:'lectures/assets/banda-aceh-rice.png',imageAlt:'Yoh with a camp leader beside a bag of rice in Banda Aceh.'},
    {country:'Japan',place:'Japan · the 2011 disasters',point:[141.0,38.2],year:2011,beat:'WITNESS',engineering:'I return to witness the disasters in Japan and the lives they unsettle.',reason:'How do people live with the consequences of engineered systems and failed assumptions?'},
    {country:'Japan',place:'Fukushima · Japan',point:[140.47,37.76],dateLabel:'AFTER 2011',beat:'LISTEN',engineering:'In Fukushima, Human Error documents the narratives of people affected by the nuclear disaster.',reason:'My role is to listen and carry those stories beyond Japan.',image:'lectures/assets/human-error-still.png',imageAlt:'A still from Human Error showing a person descending an outdoor staircase.',mediaUrl:'https://filmfreeway.com/HumanError',sourceLabel:'Human Error ↗'}
  ]};
  let map,features=[],stage='origin',origin=null,selected=null,hover='',journey=readJourney(),sharedStories=[],markers=[],returnStage='origin';
  let activeRoute=null,activeMoment=0,playTimer=null,routeCamera=null,routeAnimation=null,studioCamera=null,studioReturnStage='origin';
  function readJourney(){try{const v=JSON.parse(localStorage.getItem(storageKey)||'null');return v&&Array.isArray(v.hops)&&v.origin?v:null}catch{return null}}
  function writeJourney(v){try{localStorage.setItem(storageKey,JSON.stringify(v));return true}catch{return false}}
  async function loadSharedStories(){
    if(!workerUrl)return;
    try{
      const response=await fetch(`${workerUrl}/stories`,{cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data.stories))throw new Error('Invalid class feed');
      sharedStories=data.stories.filter(story=>story&&/^journey-[A-Za-z0-9-]{8,70}$/.test(story.id)&&Array.isArray(story.hops)&&story.origin);
      const current=sharedStories.find(story=>story.id===journey?.id);
      if(current&&current.revision>Number(journey?.revision||0)){journey=current;origin=current.origin;writeJourney(current)}
      if(stage==='studio'){buildStudio();renderRoutes()}
    }catch(error){console.warn('Class Atlas feed unavailable',error)}
  }
  function askClassPassword(){
    return new Promise(resolve=>{
      ui.accessStatus.textContent='';ui.accessForm.reset();ui.access.showModal();
      const finish=value=>{ui.accessForm.removeEventListener('submit',submit);$('atlas-access-cancel').removeEventListener('click',cancel);ui.access.removeEventListener('cancel',cancel);ui.access.close();ui.accessForm.reset();resolve(value)};
      const submit=event=>{event.preventDefault();finish(ui.accessForm.elements.password.value)};
      const cancel=event=>{event?.preventDefault();finish(null)};
      ui.accessForm.addEventListener('submit',submit);$('atlas-access-cancel').addEventListener('click',cancel);ui.access.addEventListener('cancel',cancel);
      ui.accessForm.elements.password.focus();
    });
  }
  async function publishStory(story){
    if(!workerUrl)return {ok:false,error:'Class service is not connected yet.'};
    const password=await askClassPassword();
    if(!password)return {ok:false,cancelled:true,error:'Saved on this device only.'};
    try{
      const response=await fetch(`${workerUrl}/stories/${encodeURIComponent(story.id)}`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':`Bearer ${password}`},body:JSON.stringify({revision:Number(story.revision||0),story})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      story.revision=result.revision;story.updatedAt=result.updatedAt;
      sharedStories=[story,...sharedStories.filter(item=>item.id!==story.id)];
      if(journey?.id===story.id){journey=story;writeJourney(story)}
      if(stage==='studio'){buildStudio();renderRoutes()}
      return {ok:true};
    }catch(error){return {ok:false,error:error.message||'Could not reach the class service.'}}
  }
  function safeUrl(v){try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}}
  function markerColor(value){return /^#[0-9a-f]{6}$/i.test(value||'')?value:'#20567c'}
  function markerSymbol(value){const text=String(value||'').trim();return [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].slice(0,2).map(part=>part.segment).join('')||'✦'}
  function markerInk(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>155?'#15262d':'#ffffff'}
  function node(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!=null)n.textContent=t(content);return n}
  function pointFor(feature){const coords=[];function visit(v){if(!Array.isArray(v))return;if(typeof v[0]==='number')coords.push(v);else v.forEach(visit)}visit(feature.geometry.coordinates);if(!coords.length)return[0,0];return[(Math.min(...coords.map(p=>p[0]))+Math.max(...coords.map(p=>p[0])))/2,(Math.min(...coords.map(p=>p[1]))+Math.max(...coords.map(p=>p[1])))/2]}
  function setCountryName(name,active=false){ui.name.textContent=t(name||'Japan');ui.name.classList.toggle('is-hover',active)}
  function setStage(next){
    stage=next;
    ui.sheet.hidden=['demo','studio'].includes(next);
    ui.filmstrip.hidden=next!=='demo';
    ui.studio.hidden=next!=='studio';
    ui.welcome.hidden=!['origin','choose'].includes(next);
    ui.selected.hidden=next!=='selected';
    ui.name.hidden=!['origin','choose'].includes(next);
    ui.sheet.classList.toggle('atlas-sheet--welcome',!ui.welcome.hidden);
    ui.myJourney.hidden=!journey||!journey.hops.length;
    ui.search.disabled=['origin','demo','studio'].includes(next);
    if(map?.getLayer('atlas-muted')){
      const visibility=next==='studio'||(next==='demo'&&activeRoute===yohStory)?'none':'visible';
      map.setLayoutProperty('atlas-muted','visibility',visibility);
      map.setLayoutProperty('atlas-outline','visibility',visibility);
    }
    if(next==='origin'){
      ui.welcomeTitle.textContent=t('Start in Japan.');
      ui.welcomeCopy.textContent=t('Begin with a place you know in Japan. Choose an engineering idea, object, or problem that touches it. Where did it come from, where else did it go, and who changed it? No global background required.');
      ui.hint.textContent=t('Tap your place in Japan');ui.count.textContent='01 / 03';
      ui.campus.textContent=t('Start at Reitaku campus ↗');setCountryName('Japan');
    }else if(next==='choose'){
      ui.welcomeTitle.textContent=t(journey?.hops.length?'Where else?':'Follow a thread.');
      ui.welcomeCopy.textContent=t(journey?.hops.length?'Choose another country connected to your idea. It can branch from Japan or from anywhere in your story; this is not a travel itinerary.':'Choose a country touched by your idea. It may be where the idea began, where it traveled, or where it changed. A question is enough to begin.');
      ui.hint.textContent=t('Choose a nation');ui.count.textContent='02 / 03';
      ui.campus.textContent=t('Change my starting place');setCountryName('The world');
    }
    renderRoutes();
  }
  function setOrigin(point,place){origin={place,point};if(journey&&journey.hops.length){journey.origin=origin;writeJourney(journey)}setStage('choose');map?.easeTo({center:[110,20],zoom:1.7,duration:900})}
  function useCountry(feature){if(!origin)return;const name=feature.properties.name;if(name==='Japan')return;selected={name,feature,point:pointFor(feature)};map.setFilter('atlas-selected-fill',['==',['get','name'],name]);ui.selectedName.textContent=t(name);ui.form.elements.localPlace.value=origin.place;ui.form.elements.alias.value=journey?.alias||'';ui.form.elements.markerColor.value=markerColor(journey?.marker?.color);ui.form.elements.markerSymbol.value=journey?.marker?.symbol||'';updateMarkerPreview();ui.selected.querySelector('.atlas-selected-prompt').textContent=t('What brought this place to mind?');ui.first.hidden=false;ui.second.hidden=true;ui.status.textContent='';ui.existing.hidden=true;showExisting(name);setStage('selected');setCountryName(name)}
  function showExisting(name){const stops=sample.hops.filter(h=>h.country===name);if(!stops.length)return;ui.existing.replaceChildren();const details=node('details');details.append(node('summary','','A simulated student also wondered about this place'));for(const hop of stops){const line=node('div','atlas-trace');line.append(node('strong','',`${hop.year} · ${hop.lens}`),node('p','',hop.reason));if(hop.mediaUrl){const link=node('a','','See the source ↗');link.href=hop.mediaUrl;link.target='_blank';link.rel='noopener noreferrer';line.append(link)}details.append(line)}ui.existing.append(details);ui.existing.hidden=false}
  function removeMarkers(){markers.forEach(m=>m.remove());markers=[]}
  function longitudeNear(lng,reference){return lng+360*Math.round((reference-lng)/360)}
  function updateMarkerPreview(){const color=markerColor(ui.form.elements.markerColor.value);ui.markerPreview.style.backgroundColor=color;ui.markerPreview.style.color=markerInk(color);ui.markerPreview.textContent=markerSymbol(ui.form.elements.markerSymbol.value)}
  function clearRouteLine(){
    if(routeAnimation)cancelAnimationFrame(routeAnimation);
    routeAnimation=null;
    map?.getSource('atlas-reveal-route')?.setData({type:'Feature',geometry:{type:'LineString',coordinates:[]},properties:{}});
  }
  function geographicArc(from,to){
    const radians=Math.PI/180;
    const vector=point=>[Math.cos(point[1]*radians)*Math.cos(point[0]*radians),Math.cos(point[1]*radians)*Math.sin(point[0]*radians),Math.sin(point[1]*radians)];
    const a=vector(from),b=vector(to),dot=Math.max(-1,Math.min(1,a.reduce((sum,value,i)=>sum+value*b[i],0)));
    const omega=Math.acos(dot),sinOmega=Math.sin(omega);
    if(omega<.0001)return [from,to];
    const tangent=a.map((value,i)=>(b[i]-dot*value)/sinOmega);
    const sample=angle=>{
      const points=[];
      for(let i=0;i<=72;i++){
        const theta=angle*i/72;
        const p=a.map((value,j)=>value*Math.cos(theta)+tangent[j]*Math.sin(theta));
        const lng=Math.atan2(p[1],p[0])/radians;
        points.push([longitudeNear(lng,i?points[i-1][0]:routeCamera?.center.lng??from[0]),Math.atan2(p[2],Math.hypot(p[0],p[1]))/radians]);
      }
      return points;
    };
    const choices=[sample(omega),sample(omega-2*Math.PI)];
    const center=routeCamera?.center.lng??from[0];
    return choices.sort((one,two)=>Math.max(...one.map(p=>Math.abs(p[0]-center)))-Math.max(...two.map(p=>Math.abs(p[0]-center))))[0];
  }
  function revealConnection(from,to){
    clearRouteLine();
    const source=map?.getSource('atlas-reveal-route');
    if(!source||!from?.point||!to?.point)return;
    const arc=geographicArc(from.point,to.point);
    const start=performance.now(),duration=1150;
    const draw=now=>{
      const t=Math.min(1,(now-start)/duration);
      const count=Math.max(2,Math.min(arc.length,Math.ceil((t*t*(3-2*t))*(arc.length-1))+1));
      source.setData({type:'Feature',geometry:{type:'LineString',coordinates:arc.slice(0,count)},properties:{}});
      if(t<1)routeAnimation=requestAnimationFrame(draw);else routeAnimation=null;
    };
    routeAnimation=requestAnimationFrame(draw);
  }
  function addMarker(point,label,kind,photoUrl,index=null,placeLabel=label){
    const interactive=stage==='demo'&&index!==null;
    const host=node('div','atlas-marker');
    const dot=node(interactive?'button':'div',`atlas-portrait atlas-portrait--${kind}`);
    if(stage==='demo'&&activeRoute?.hops.length>6)dot.classList.add('atlas-portrait--compact');
    if(interactive){
      dot.type='button';
      dot.addEventListener('click',()=>{stopPlayback();setActiveMoment(index,true)});
    }
    dot.title=label;
    dot.dataset.place=placeLabel;
    if(photoUrl&&photoUrl.startsWith('assets/')){
      const img=node('img');img.src=photoUrl;img.alt='';dot.append(img);
    }else dot.textContent=activeRoute?.marker?.symbol||((activeRoute?.alias||label).slice(0,1).toUpperCase());
    if(activeRoute?.marker){const color=markerColor(activeRoute.marker.color);dot.style.backgroundColor=color;dot.style.color=markerInk(color)}
    host.append(dot);
    const longitude=stage==='demo'&&routeCamera?longitudeNear(point[0],routeCamera.center.lng):point[0];
    const pin=new maplibregl.Marker({element:host,anchor:'center'}).setLngLat([longitude,point[1]]).addTo(map);
    if(interactive)dot.setAttribute('aria-label',`Show ${label} in the story`);
    markers.push(pin);
  }
  function renderRoutes(){
    if(!map?.getSource('atlas-countries'))return;
    if(stage==='studio'){renderStudioMarkers();return}
    const route=stage==='demo'?activeRoute:journey;
    removeMarkers();
    if(route?.origin&&(stage==='demo'||journey?.hops.length)){
      addMarker(route.origin.point,route.origin.place,'origin',null,stage==='demo'?0:null);
      route.hops.forEach((hop,i)=>addMarker(hop.point,`${route.alias} · ${hop.place||hop.country}`,'stop',route.photoUrl,i+1,hop.place||hop.country));
    }else if(origin)addMarker(origin.point,origin.place,'origin');
  }
  function studioProjects(){return [yohStory,sample,...sharedStories,...(journey?.hops.length&&!sharedStories.some(story=>story.id===journey.id)?[journey]:[])]}
  function renderStudioMarkers(){
    removeMarkers();
    for(const route of studioProjects()){
      const color=markerColor(route.marker?.color),symbol=markerSymbol(route.marker?.symbol||route.alias?.slice(0,1));
      [route.origin,...route.hops].forEach((moment,index)=>{
        const host=node('div','atlas-marker atlas-marker--studio');
        const button=node('button','atlas-portrait atlas-portrait--studio',symbol);
        button.type='button';button.title=`${route.alias} · ${moment.place||moment.country}`;
        button.setAttribute('aria-label',`Open ${route.alias}’s story at ${moment.place||moment.country}`);
        button.style.backgroundColor=color;button.style.color=markerInk(color);
        button.addEventListener('click',()=>showJourney(route,false,index));
        host.append(button);
        const point=moment.point;
        markers.push(new maplibregl.Marker({element:host,anchor:'center'}).setLngLat([longitudeNear(point[0],studioCamera?.center.lng??point[0]),point[1]]).addTo(map));
      });
    }
  }
  function frameMoment(route,index){
    return index===0?{...route.origin,country:'Japan',reason:'A place I know. A question begins here.'}:route.hops[index-1];
  }
  function journeyCamera(route,panelHeight=ui.filmstrip.getBoundingClientRect().height){
    const points=[route.origin.point,...route.hops.map(hop=>hop.point)];
    const longitudes=points.map(point=>(point[0]+360)%360).sort((a,b)=>a-b);
    let widestGap=-1,gapIndex=0;
    longitudes.forEach((lng,i)=>{
      const next=i===longitudes.length-1?longitudes[0]+360:longitudes[i+1];
      if(next-lng>widestGap){widestGap=next-lng;gapIndex=i}
    });
    const west=longitudes[(gapIndex+1)%longitudes.length];
    const east=west+360-widestGap;
    const south=Math.min(...points.map(point=>point[1])),north=Math.max(...points.map(point=>point[1]));
    const padding={top:105,bottom:Math.min(map.getContainer().clientHeight*.48,panelHeight+38),left:75,right:75};
    return map.cameraForBounds([[west,south],[east,north]],{padding,maxZoom:2.7});
  }
  function buildStudio(){
    const projects=studioProjects();
    const dated=projects.flatMap(route=>[route.origin,...route.hops].map(moment=>Number(moment.year)).filter(Boolean));
    const minimum=Math.floor(Math.min(...dated,1960)/10)*10,maximum=Math.ceil(Math.max(...dated,2026)/10)*10;
    ui.studioYears.replaceChildren();ui.studioLanes.replaceChildren();
    for(let year=minimum;year<=maximum;year+=10){
      const tick=node('span','',year);
      tick.style.left=`${(year-minimum)/(maximum-minimum)*100}%`;
      ui.studioYears.append(tick);
    }
    for(const route of projects){
      const color=markerColor(route.marker?.color),moments=[route.origin,...route.hops];
      const lane=node('div','atlas-studio-lane');
      const title=node('button','atlas-studio-person',`${markerSymbol(route.marker?.symbol||route.alias?.slice(0,1))}  ${route.alias}${route.simulated?t(' · simulated'):route===journey?t(' · this device'):''}`);
      title.type='button';title.style.color=color;title.addEventListener('click',()=>showJourney(route));
      const track=node('div','atlas-studio-track');track.style.setProperty('--lane-color',color);
      moments.forEach((moment,index)=>{
        const year=Number(moment.year)||Number(moments.slice(0,index).reverse().find(item=>item.year)?.year)||Number(moments.find(item=>item.year)?.year)||2026;
        const dot=node('button','atlas-studio-point',markerSymbol(route.marker?.symbol||route.alias?.slice(0,1)));
        dot.type='button';dot.style.left=`${(year-minimum)/(maximum-minimum)*100}%`;
        dot.style.backgroundColor=color;dot.style.color=markerInk(color);
        dot.title=`${route.alias} · ${moment.place||moment.country} · ${moment.dateLabel||year}`;
        dot.setAttribute('aria-label',`Open ${route.alias}’s story at ${moment.place||moment.country}`);
        dot.addEventListener('click',()=>showJourney(route,false,index));track.append(dot);
      });
      lane.append(title,track);ui.studioLanes.append(lane);
    }
  }
  function showStudio(){
    studioReturnStage=stage==='demo'?(returnStage==='studio'?studioReturnStage:returnStage):stage;
    stopPlayback();clearRouteLine();activeRoute=null;routeCamera=null;
    buildStudio();
    const projects=studioProjects(),all=projects.flatMap(route=>[route.origin,...route.hops]);
    studioCamera=journeyCamera({origin:all[0],hops:all.slice(1)},Math.min(300,map.getContainer().clientHeight*.35));
    map.setFilter('atlas-selected-fill',['==',['get','name'],'']);
    setStage('studio');
    if(studioCamera)map.easeTo({...studioCamera,duration:850});
  }
  function timeGap(previous,current){
    if(previous?.period&&previous.period===current?.period)return {label:'same period',width:70};
    if(current?.dateLabel==='AFTER 2011')return {label:'after 2011',width:84};
    if(previous?.period&&!previous.year&&current?.year)return {label:document.documentElement.lang==='ja'?`${current.year}年までに`:`by ${current.year}`,width:88};
    if(previous?.year&&current?.year){
      const years=Math.abs(current.year-previous.year);
      const label=years?(document.documentElement.lang==='ja'?`${years}年${current.year>previous.year?'後':'前'}`:`${years} ${years===1?'year':'years'} ${current.year>previous.year?'later':'earlier'}`):'same year';
      return {label,width:Math.min(205,68+years*18)};
    }
    return {label:!previous?.year&&current?.year?'first thread':'time unmarked',width:88};
  }
  function buildFilmstrip(route){
    ui.filmstripTitle.textContent=t(route.title||(route.simulated?'Mina: what travels with a metro?':`${route.alias||'My'}’s engineering threads`));
    ui.filmstripKicker.textContent=t(route.kicker||(route.simulated?'SIMULATED ENGINEERING STORY':'MY STUDIO JOURNEY'));
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
      button.setAttribute('aria-label',`${t('Focus')} ${t(moment.place||moment.country||'Japan')}${moment.year?` ${t('in')} ${moment.year}`:''}`);
      if(moment.image?.startsWith('lectures/assets/')){
        frame.classList.add('atlas-frame--image');
        const photo=node('img','atlas-frame-image');photo.src=moment.image;photo.alt=t(moment.imageAlt||'');photo.loading='lazy';
        button.append(photo);
      }
      const top=node('span','atlas-frame-top');
      top.append(node('span','atlas-frame-year',moment.dateLabel||moment.year||(index?'UNDATED':'HERE')),node('span','atlas-frame-beat',moment.beat||moment.lens||'QUESTION'));
      button.append(top,node('span','atlas-frame-place',moment.place||moment.country));
      button.append(node('span','atlas-frame-story',moment.engineering||moment.reason||'A question begins here.'));
      if(moment.engineering&&moment.reason)button.append(node('span','atlas-frame-question',moment.reason));
      else if(moment.trace)button.append(node('span','atlas-frame-question',moment.trace));
      button.addEventListener('click',()=>{stopPlayback();setActiveMoment(index,true)});
      frame.append(button);
      const sources=node('div','atlas-frame-sources');
      const url=safeUrl(moment.mediaUrl);
      if(url){const link=node('a','atlas-frame-source',moment.sourceLabel||(moment.country==='Indonesia'&&route.simulated?'2013 study ↗':'Project ↗'));link.href=url;link.target='_blank';link.rel='noopener noreferrer';sources.append(link)}
      const costUrl=safeUrl(moment.costUrl);
      if(costUrl){const link=node('a','atlas-frame-source','Social cost ↗');link.href=costUrl;link.target='_blank';link.rel='noopener noreferrer';sources.append(link)}
      if(sources.childNodes.length)frame.append(sources);
      ui.filmstripTrack.append(frame);
    });
  }
  function setActiveMoment(index,move=false){
    if(stage!=='demo'||!activeRoute)return;
    const previous=activeMoment;
    activeMoment=Math.max(0,Math.min(index,activeRoute.hops.length));
    if(move&&previous!==activeMoment)revealConnection(frameMoment(activeRoute,previous),frameMoment(activeRoute,activeMoment));
    ui.filmstripPrev.disabled=activeMoment===0;
    ui.filmstripNext.disabled=activeMoment===activeRoute.hops.length;
    const editable=workerUrl&&/^journey-[A-Za-z0-9-]{8,70}$/.test(activeRoute.id||'');
    ui.filmstripEdit.hidden=!editable;ui.filmstripAdd.hidden=!editable;
    ui.filmstripTrack.querySelectorAll('.atlas-frame').forEach((frame,i)=>frame.classList.toggle('is-active',i===activeMoment));
    markers.forEach((marker,i)=>{
      const host=marker.getElement();
      host.firstElementChild?.classList.toggle('is-active',i===activeMoment);
      host.style.zIndex=i===activeMoment?'3':'1';
    });
    const moment=frameMoment(activeRoute,activeMoment);
    map.setFilter('atlas-selected-fill',['==',['get','name'],activeMoment?moment.country:'']);
    const frame=ui.filmstripTrack.querySelector(`[data-moment="${activeMoment}"]`);
    if(frame)ui.filmstripTrack.scrollTo({left:frame.offsetLeft-ui.filmstripTrack.offsetLeft-ui.filmstripTrack.clientWidth/2+frame.offsetWidth/2,behavior:'smooth'});
    if(move&&routeCamera){
      const center=routeCamera.center;
      const longitude=longitudeNear(moment.point[0],center.lng);
      map.easeTo({center:[center.lng+(longitude-center.lng)*.1,center.lat+(moment.point[1]-center.lat)*.1],zoom:routeCamera.zoom,duration:750});
    }
  }
  function stopPlayback(){if(playTimer)clearTimeout(playTimer);playTimer=null;ui.filmstripPlay.textContent=t('Play journey ▶')}
  function playJourney(){
    if(playTimer){stopPlayback();return}
    if(activeMoment>=activeRoute.hops.length)setActiveMoment(0,true);
    ui.filmstripPlay.textContent=t('Pause Ⅱ');
    const advance=()=>{
      if(activeMoment>=activeRoute.hops.length){stopPlayback();return}
      const from=frameMoment(activeRoute,activeMoment),to=frameMoment(activeRoute,activeMoment+1);
      setActiveMoment(activeMoment+1,true);
      const gap=from.year&&to.year?Math.abs(to.year-from.year):0;
      playTimer=setTimeout(advance,Math.min(3000,1450+gap*230));
    };
    playTimer=setTimeout(advance,750);
  }
  function showJourney(route,personal=false,startIndex=0){
    stopPlayback();clearRouteLine();returnStage=stage;activeRoute=route;activeMoment=0;
    buildFilmstrip(route);setStage('demo');
    routeCamera=journeyCamera(route);
    renderRoutes();
    setActiveMoment(startIndex,false);
    if(routeCamera)map.easeTo({...routeCamera,duration:850});
  }
  function openEditor(){
    if(!activeRoute||ui.filmstripEdit.hidden)return;
    const moment=activeMoment?activeRoute.hops[activeMoment-1]:activeRoute.origin;
    const form=ui.editorForm.elements;
    form.title.value=activeRoute.title||'';form.alias.value=activeRoute.alias||'';
    form.year.value=moment.year||'';form.place.value=moment.place||moment.country||'';
    form.story.value=moment.engineering||moment.reason||'';form.trace.value=moment.trace||'';
    form.mediaUrl.value=moment.mediaUrl||'';
    form.markerColor.value=markerColor(activeRoute.marker?.color);
    form.markerSymbol.value=activeRoute.marker?.symbol||'';
    ui.editorStatus.textContent='';ui.editor.showModal();form.story.focus();
  }
  async function saveEdit(event){
    event.preventDefault();
    if(!activeRoute)return;
    const form=ui.editorForm.elements;
    const alias=form.alias.value.trim(),place=form.place.value.trim(),storyText=form.story.value.trim(),mediaUrl=form.mediaUrl.value.trim();
    if(!alias||!place||!storyText){ui.editorStatus.textContent=t('Add a name, place, and story before saving.');return}
    if(mediaUrl&&!safeUrl(mediaUrl)){ui.editorStatus.textContent=t('Use an http or https link.');return}
    const yearText=form.year.value.trim(),year=yearText?Number(yearText):null;
    if(year&&(year<1900||year>2100)){ui.editorStatus.textContent=t('Enter a year between 1900 and 2100.');return}
    const draft=JSON.parse(JSON.stringify(activeRoute));
    draft.title=form.title.value.trim();draft.alias=alias;
    draft.marker={color:markerColor(form.markerColor.value),symbol:markerSymbol(form.markerSymbol.value||alias[0])};
    const moment=activeMoment?draft.hops[activeMoment-1]:draft.origin;
    moment.place=place;moment.year=year;
    if(activeMoment)moment.reason=storyText;
    else moment.engineering=storyText;
    moment.trace=form.trace.value.trim();moment.mediaUrl=safeUrl(mediaUrl);
    ui.editorStatus.textContent=t('Waiting for class password…');
    const result=await publishStory(draft);
    if(!result.ok){ui.editorStatus.textContent=t(result.error);return}
    activeRoute=draft;
    ui.editor.close();buildFilmstrip(draft);renderRoutes();setActiveMoment(activeMoment,false);
  }
  function addConnectionToRoute(){
    if(!activeRoute||ui.filmstripAdd.hidden)return;
    if(journey?.id!==activeRoute.id&&journey?.hops.length&&!confirm(t('Continue this story here? Your other local draft will remain in the class Atlas if it was published.')))return;
    stopPlayback();clearRouteLine();journey=JSON.parse(JSON.stringify(activeRoute));origin=journey.origin;writeJourney(journey);
    activeRoute=null;routeCamera=null;selected=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);
    setStage('choose');map?.easeTo({center:[110,20],zoom:1.7,duration:800});
  }
  function saveDraft(){
    const f=ui.form.elements,localPlace=f.localPlace.value.trim(),reason=f.reason.value.trim();
    const lens=ui.form.querySelector('[name="lens"]:checked')?.value,alias=f.alias.value.trim(),mediaUrl=f.mediaUrl.value.trim();
    if(!localPlace||!reason||!lens||!alias){ui.status.textContent=t('Please add your starting place, a reason, a thread, and your name or alias.');return}
    if(mediaUrl&&!safeUrl(mediaUrl)){ui.status.textContent=t('Please use an http or https link, or leave it blank.');return}
    const yearText=f.year.value.trim(),year=yearText?Number(yearText):null;
    if(year&&(year<1900||year>2100)){ui.status.textContent=t('Please enter a year between 1900 and 2100.');return}
    const hop={country:selected.name,point:selected.point,reason,lens,year,trace:f.trace.value.trim(),mediaUrl:safeUrl(mediaUrl)};
    const draft=journey||{id:`journey-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,alias,origin,hops:[]};
    draft.alias=alias;draft.marker={color:markerColor(f.markerColor.value),symbol:markerSymbol(f.markerSymbol.value||alias.slice(0,1))};draft.origin={place:localPlace,point:origin.point};draft.hops.push(hop);
    const localSaved=writeJourney(draft);journey=draft;origin=draft.origin;ui.form.reset();
    ui.status.textContent=t(localSaved?'Saved on this device. Preparing to publish…':'Could not save on this device. Please keep a copy of your story.');
    renderRoutes();
    if(workerUrl){
      publishStory(draft).then(result=>{
        ui.status.textContent=result.ok?t('Published to the class Atlas. Everyone can now see this journey.'):`${t(result.error)} ${t('Your draft remains on this device.')}`;
        ui.existing.querySelector('.atlas-retry-publish').hidden=result.ok;
      });
    }else if(config.formResponseUrl&&config.fields){
      const fields=new URLSearchParams();
      fields.set(config.fields.alias,draft.alias);
      fields.set(config.fields.title,`${draft.origin.place} · ${hop.country}`);
      fields.set(config.fields.record,JSON.stringify(draft));
      fetch(config.formResponseUrl,{method:'POST',mode:'no-cors',credentials:'omit',body:fields})
        .then(()=>{ui.status.textContent='Saved on this device. Sent to class intake, but delivery cannot be verified here. Public map display is not yet connected.'})
        .catch(()=>{ui.status.textContent='Saved on this device; sending to class intake failed. Please try again later.'});
    }else ui.status.textContent='Saved on this device. Class intake is not configured yet.';
    ui.first.hidden=true;ui.second.hidden=true;
    ui.selected.querySelector('.atlas-selected-prompt').textContent=t('Your thread has been added. Choose another nation when you are ready.');
    ui.myJourney.hidden=false;ui.existing.hidden=true;
    const again=node('button','atlas-primary atlas-add-hop','Add another connection →');again.type='button';
    again.addEventListener('click',()=>{selected=null;map.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage('choose')});
    ui.existing.replaceChildren(again);
    if(workerUrl){const retry=node('button','atlas-retry-publish','Publish this draft');retry.type='button';retry.hidden=true;retry.addEventListener('click',async()=>{const result=await publishStory(journey);ui.status.textContent=t(result.ok?'Published to the class Atlas.':result.error);retry.hidden=result.ok});ui.existing.append(retry)}
    ui.existing.hidden=false;
  }
  async function initMap(){
    if(!window.maplibregl||!window.topojson){ui.hint.textContent='Map unavailable. Please reload when connected.';return}
    map=new maplibregl.Map({container:ui.map,style:'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',center:[137,37],zoom:2.55,minZoom:.7,maxZoom:8,attributionControl:false});
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
        map.addSource('atlas-reveal-route',{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:[]},properties:{}}});
        map.addLayer({id:'atlas-reveal-route-line',type:'line',source:'atlas-reveal-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#b73e32','line-width':4,'line-dasharray':[.15,1.3],'line-opacity':.96}},firstLabel);
        map.addLayer({id:'atlas-hit',type:'fill',source:'atlas-countries',paint:{'fill-color':'#000000','fill-opacity':.01}});
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
        if(window.location.hash==='#studio')showStudio();
        else if(window.location.hash==='#yoh')showJourney(yohStory);
        else if(window.location.hash==='#sample')showJourney(sample);
        else if(journey?.hops.length){origin=journey.origin;setStage('choose');map.jumpTo({center:[110,20],zoom:1.7})}
        else setStage('origin');
        loadSharedStories();
      }catch(error){ui.hint.textContent='The map could not load country boundaries. Please reconnect and reload.';console.error(error)}
    });
  }
  ui.campus.addEventListener('click',()=>{if(stage==='choose'){origin=null;setStage('origin');map?.easeTo({center:[137,37],zoom:2.55})}else setOrigin(japan,'Reitaku campus, Kashiwa')});
  ui.world.addEventListener('click',()=>map?.easeTo({center:[100,20],zoom:1.55,duration:800}));
  ui.search.addEventListener('change',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature){useCountry(feature);ui.search.value=''}});
  ui.demo.addEventListener('click',()=>showJourney(sample));
  ui.yoh.addEventListener('click',()=>showJourney(yohStory));
  ui.studioOpen.addEventListener('click',()=>{showStudio();loadSharedStories()});
  ui.myJourney.addEventListener('click',()=>{if(journey)showJourney(journey,true)});
  function closeJourney(){if(returnStage==='studio'){showStudio();return}stopPlayback();clearRouteLine();activeRoute=null;routeCamera=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage(returnStage==='origin'?'origin':'choose');map?.easeTo(returnStage==='origin'?{center:[137,37],zoom:2.55,duration:800}:{center:[110,20],zoom:1.7,duration:800})}
  function closeStudio(){activeRoute=null;studioCamera=null;setStage(studioReturnStage==='origin'?'origin':'choose');map?.easeTo(studioReturnStage==='origin'?{center:[137,37],zoom:2.55,duration:800}:{center:[110,20],zoom:1.7,duration:800})}
  ui.studioClose.addEventListener('click',closeStudio);
  ui.filmstripClose.addEventListener('click',closeJourney);
  ui.filmstripEdit.addEventListener('click',openEditor);
  ui.filmstripAdd.addEventListener('click',addConnectionToRoute);
  ui.editorForm.addEventListener('submit',saveEdit);
  $('atlas-editor-cancel').addEventListener('click',()=>ui.editor.close());
  $('atlas-editor-discard').addEventListener('click',()=>ui.editor.close());
  ui.filmstripStudio.addEventListener('click',showStudio);
  ui.filmstripPlay.addEventListener('click',playJourney);
  ui.filmstripPrev.addEventListener('click',()=>{stopPlayback();setActiveMoment(activeMoment-1,true)});
  ui.filmstripNext.addEventListener('click',()=>{stopPlayback();setActiveMoment(activeMoment+1,true)});
  window.addEventListener('keydown',event=>{
    if(stage!=='demo'||!['ArrowLeft','ArrowRight'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
    if(ui.editor.open||ui.access.open)return;
    if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    event.preventDefault();stopPlayback();setActiveMoment(activeMoment+(event.key==='ArrowRight'?1:-1),true);
  });
  ui.clear.addEventListener('click',()=>{selected=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage('choose')});
  ui.form.elements.markerColor.addEventListener('input',updateMarkerPreview);
  ui.form.elements.markerSymbol.addEventListener('input',updateMarkerPreview);
  ui.next.addEventListener('click',()=>{const f=ui.form.elements;if(!f.localPlace.value.trim()||!f.reason.value.trim()||!ui.form.querySelector('[name="lens"]:checked')){ui.status.textContent='Add a starting place, a reason, and one kind of thread to follow.';return}ui.status.textContent='';ui.first.hidden=true;ui.second.hidden=false;ui.sheet.scrollTop=0});
  ui.search.addEventListener('input',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature&&origin){useCountry(feature);ui.search.value=''}});
  ui.back.addEventListener('click',()=>{ui.first.hidden=false;ui.second.hidden=true;ui.status.textContent=''});ui.form.addEventListener('submit',event=>{event.preventDefault();saveDraft()});
  ui.campus.disabled=true;ui.demo.disabled=true;ui.yoh.disabled=true;
  if(workerUrl){
    document.querySelector('.atlas-studio-note').textContent=t('Shared time, separate journeys. Yoh’s draft and Mina’s simulated example are shown alongside published class stories. Select a chapter to explore or edit it.');
    document.querySelector('.atlas-privacy').textContent=t('Use an alias if you prefer. Do not include private details or a photo without consent. Your story appears immediately on the public class Atlas after you enter the class password.');
  }
  function localizeAttributes(){
    ui.search.placeholder=t('Find a country');
    ui.form.elements.localPlace.placeholder=t('A town, campus, kitchen, station…');
    ui.form.elements.reason.placeholder=t('Something Japan shared, inherited, adapted—or a problem both places face…');
    ui.form.elements.year.placeholder=t('Year, if known');
    ui.form.elements.trace.placeholder=t('The feat, the benefit, the tradeoff, or an open question…');
    ui.form.elements.alias.placeholder=t('How should we identify your story?');
    ui.editorForm.elements.title.placeholder=t('Give your journey a title');
  }
  localizeAttributes();
  window.addEventListener('course-language-change',()=>{
    localizeAttributes();
    if(['origin','choose'].includes(stage))setStage(stage);
    if(stage==='selected'){
      ui.selectedName.textContent=t(selected?.name||'');
      ui.selected.querySelector('.atlas-selected-prompt').textContent=t(ui.first.hidden?'Your thread has been added. Choose another nation when you are ready.':'What brought this place to mind?');
    }
    if(stage==='demo'&&activeRoute){buildFilmstrip(activeRoute);setActiveMoment(activeMoment,false)}
    if(stage==='studio')buildStudio();
    if(workerUrl){
      document.querySelector('.atlas-studio-note').textContent=t('Shared time, separate journeys. Yoh’s draft and Mina’s simulated example are shown alongside published class stories. Select a chapter to explore or edit it.');
      document.querySelector('.atlas-privacy').textContent=t('Use an alias if you prefer. Do not include private details or a photo without consent. Your story appears immediately on the public class Atlas after you enter the class password.');
    }
    ui.status.textContent=t(ui.status.textContent);
    ui.editorStatus.textContent=t(ui.editorStatus.textContent);
  });
  initMap();
  if(map){map.jumpTo({center:[137,37],zoom:2.55});map.on('idle',()=>{if(map.getSource('atlas-countries')){ui.campus.disabled=false;ui.demo.disabled=false;ui.yoh.disabled=false}})}
})();
