(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = { map:$('atlas-map'), name:$('atlas-country-name'), search:$('atlas-country-search'), options:$('atlas-country-options'), world:$('atlas-world'), mapControls:document.querySelector('.atlas-map-controls'), sheet:$('atlas-sheet'), welcome:document.querySelector('.atlas-welcome'), selected:document.querySelector('.atlas-selected'), welcomeTitle:$('atlas-welcome-title'), welcomeCopy:$('atlas-welcome-copy'), hint:$('atlas-welcome-hint'), count:$('atlas-stage-count'), originForm:$('atlas-origin-form'), originStatus:$('atlas-origin-status'), originMapNote:$('atlas-origin-map-note'), originMarkerPreview:$('atlas-origin-marker-preview'), chooseMessage:$('atlas-choose-message'), chooseActions:$('atlas-choose-actions'), selectedName:$('atlas-selected-name'), form:$('atlas-form'), status:$('atlas-form-status'), filmstrip:$('atlas-filmstrip'), filmstripTrack:$('atlas-filmstrip-track'), filmstripTitle:$('atlas-filmstrip-title'), filmstripKicker:$('atlas-filmstrip-kicker'), filmstripPrev:$('atlas-filmstrip-prev'), filmstripNext:$('atlas-filmstrip-next'), filmstripPlay:$('atlas-filmstrip-play'), filmstripAdd:$('atlas-filmstrip-add'), filmstripStudio:$('atlas-filmstrip-studio'), filmstripClose:$('atlas-filmstrip-close'), studio:$('atlas-studio'), studioYears:$('atlas-studio-years'), studioLanes:$('atlas-studio-lanes'), addJourney:$('atlas-add-journey'), signOut:$('atlas-sign-out'), editor:$('atlas-editor'), editorForm:$('atlas-editor-form'), editorStatus:$('atlas-editor-status'), access:$('atlas-access'), accessForm:$('atlas-access-form'), accessStatus:$('atlas-access-status') };
  const config = window.ATLAS_CONFIG || {};
  const workerUrl = String(config.workerUrl || '').replace(/\/$/, '');
  const t = value => document.documentElement.lang === 'ja' ? (window.COURSE_TRANSLATIONS?.ja?.[String(value)] || value) : value;
  const storageKey = 'global-engineer-atlas-journey-v2';
  const sessionKey = 'global-engineer-atlas-session-v1';
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
  let map,features=[],stage='studio',origin=null,selected=null,hover='',journey=null,sharedStories=[],hiddenBuiltins=[],builtinOverrides={},markers=[],returnStage='studio';
  let activeRoute=null,activeMoment=0,playTimer=null,routeCamera=null,routeAnimation=null,studioCamera=null,studioReturnStage='studio';
  let session=readSession(),authorOriginPoint=[...japan],authorOriginCountry='Japan',authorDraft=null,connectionFromIndex=0,studioWorldView=false;
  function readJourney(){try{const v=JSON.parse(localStorage.getItem(storageKey)||'null');return v&&Array.isArray(v.hops)&&v.origin?v:null}catch{return null}}
  function writeJourney(v){try{localStorage.setItem(storageKey,JSON.stringify(v));return true}catch{return false}}
  function readSession(){try{const value=JSON.parse(sessionStorage.getItem(sessionKey)||'null');return value?.token&&Date.parse(value.expiresAt)>Date.now()?value:null}catch{return null}}
  function storeSession(value){session=value;try{if(value)sessionStorage.setItem(sessionKey,JSON.stringify(value));else sessionStorage.removeItem(sessionKey)}catch{}ui.signOut.hidden=!value;$('atlas-my-journeys-toggle').hidden=!value;const label=t(value?.admin?'All journeys':'My journeys');$('atlas-my-journeys-toggle').textContent=label;$('atlas-my-journeys').setAttribute('aria-label',label);$('atlas-my-journeys-heading').textContent=label;if(!value)$('atlas-my-journeys').hidden=true}
  function authHeaders(){return session?{Authorization:`Bearer ${session.token}`}:{}}
  function canEdit(route){return Boolean(session&&(route?.editable||(session.admin&&isBuiltin(route))))}
  function isBuiltin(route){return route?.id==='yoh-draft'||route?.id==='simulated-mina'}
  function canRemove(route){return canEdit(route)||Boolean(session?.admin&&isBuiltin(route))}
  function builtinRoute(id){return builtinOverrides[id]||(id==='yoh-draft'?yohStory:sample)}
  async function restoreSession(){
    if(!session)return;
    try{const response=await fetch(`${workerUrl}/session`,{headers:authHeaders(),cache:'no-store'});if(!response.ok)throw new Error('expired');const data=await response.json();storeSession({...session,admin:Boolean(data.admin)})}
    catch{storeSession(null)}
  }
  async function loadSharedStories(){
    if(!workerUrl)return false;
    try{
      const response=await fetch(`${workerUrl}/stories`,{headers:authHeaders(),cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data.stories))throw new Error('Invalid class feed');
      hiddenBuiltins=Array.isArray(data.hiddenBuiltins)?data.hiddenBuiltins.filter(id=>id==='yoh-draft'||id==='simulated-mina'):[];
      builtinOverrides=Object.fromEntries(Object.entries(data.builtinOverrides||{}).filter(([id,route])=>(id==='yoh-draft'||id==='simulated-mina')&&route?.origin&&Array.isArray(route.hops)));
      sharedStories=data.stories.filter(story=>story&&/^journey-[A-Za-z0-9-]{8,70}$/.test(story.id)&&Array.isArray(story.hops)&&story.origin);
      const current=sharedStories.find(story=>story.id===journey?.id);
      if(current){journey=current;origin=current.origin;writeJourney(current)}
      if(isBuiltin(journey)){journey=builtinRoute(journey.id);origin=journey.origin}
      if(stage==='studio'){buildStudio();buildMyJourneys();renderRoutes()}
      document.querySelector('.atlas-studio-note').textContent=t('Follow a journey by choosing a marker or a moment on the shared timeline. Your own journey can begin anywhere.');
      return true;
    }catch(error){document.querySelector('.atlas-studio-note').textContent=t('The class feed is unavailable. Please reload before adding a journey.');console.warn('Class Atlas feed unavailable',error);return false}
  }
  async function signIn(event){
    event.preventDefault();
    const email=ui.accessForm.elements.email.value.trim(),password=ui.accessForm.elements.password.value;
    if(!email||!password){ui.accessStatus.textContent=t('Enter your email and the class password.');return}
    ui.accessStatus.textContent=t('Checking class access…');
    try{
      const response=await fetch(`${workerUrl}/session`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Could not sign in');
      storeSession(data);
      if(!await loadSharedStories())throw new Error('The class feed is unavailable. Please reload before adding a journey.');
      ui.accessForm.reset();ui.access.close();
      showStudio();$('atlas-my-journeys').hidden=false;buildMyJourneys();
    }catch(error){ui.accessStatus.textContent=t(error.message)}
  }
  function updateAccessPrompt(){
    const instructor=ui.accessForm.elements.email.value.trim().toLowerCase()==='ykawano@reitaku-u.co.jp';
    $('atlas-access-kicker').textContent=t(instructor?'INSTRUCTOR ACCESS':'CLASS ACCESS');
    $('atlas-access-title').textContent=t(instructor?'Manage class journeys':'Add my journey');
    $('atlas-password-label').textContent=t(instructor?'Instructor password':'Class password');
    $('atlas-access-note').textContent=t(instructor?'Use your instructor password to manage every published class journey.':'Use the class password and your email to enter author mode. Your email is saved privately; it is not shown on the map.');
  }
  async function publishStory(story){
    if(!session)return {ok:false,error:'Sign in again'};
    try{
      const response=await fetch(isBuiltin(story)?`${workerUrl}/builtins/${story.id}/story`:`${workerUrl}/stories/${encodeURIComponent(story.id)}`,{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({revision:Number(story.revision||0),story})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      story.revision=result.revision;story.updatedAt=result.updatedAt;story.editable=true;
      if(isBuiltin(story))builtinOverrides[story.id]=story;
      else sharedStories=[story,...sharedStories.filter(item=>item.id!==story.id)];
      if(journey?.id===story.id){journey=story;writeJourney(story)}
      if(stage==='studio'){buildStudio();buildMyJourneys();renderRoutes()}
      return {ok:true};
    }catch(error){return {ok:false,error:error.message||'Could not reach the class service.'}}
  }
  async function compressImage(file){
    if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a JPEG, PNG, or WebP image.');
    if(file.size>15000000)throw new Error('Choose an image under 15 MB.');
    const bitmap=await createImageBitmap(file);
    let size=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    try{
      for(let attempt=0;attempt<4;attempt++){
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(bitmap.width*size));canvas.height=Math.max(1,Math.round(bitmap.height*size));
        const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',Math.max(.55,.82-attempt*.08)));
        if(blob&&blob.size<=700000)return blob;
        size*=.75;
      }
    }finally{bitmap.close()}
    throw new Error('This image is too large after resizing. Try a smaller one.');
  }
  async function uploadImage(storyId,file){
    const image=await compressImage(file);
    const collection=storyId==='yoh-draft'||storyId==='simulated-mina'?'builtins':'stories';
    const response=await fetch(`${workerUrl}/${collection}/${encodeURIComponent(storyId)}/images`,{method:'POST',headers:{'Content-Type':'image/jpeg',...authHeaders()},body:image});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Image upload failed');
    return data.imageId;
  }
  async function deleteStory(route){
    const response=await fetch(`${workerUrl}/stories/${encodeURIComponent(route.id)}`,{method:'DELETE',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({revision:Number(route.revision)})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Could not delete journey');
    sharedStories=sharedStories.filter(item=>item.id!==route.id);
    if(journey?.id===route.id){journey=null;origin=null}
  }
  async function setBuiltinVisible(route,visible){
    if(!session?.admin||!isBuiltin(route))return;
    const response=await fetch(`${workerUrl}/builtins/${route.id}`,{method:visible?'PUT':'DELETE',headers:authHeaders()});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Could not update journey');
    await loadSharedStories();showStudio();
  }
  function safeUrl(v){try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}}
  function markerColor(value){return /^#[0-9a-f]{6}$/i.test(value||'')?value:'#20567c'}
  function markerSymbol(value){const text=String(value||'').trim();return [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].slice(0,2).map(part=>part.segment).join('')||'✦'}
  function markerInk(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>155?'#15262d':'#ffffff'}
  function node(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!=null)n.textContent=t(content);return n}
  const iconPaths={view:['M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],edit:['M12 20h9','M4 17.5V20h2.5L18.7 7.8l-2.5-2.5L4 17.5Z','M15.8 5.3l1.4-1.4a1.5 1.5 0 0 1 2.1 0l.8.8a1.5 1.5 0 0 1 0 2.1l-1.4 1.4'],add:['M12 4v16','M4 12h16'],delete:['M4 7h16','M9 7V4h6v3','M6 7l1 13h10l1-13','M10 11v6','M14 11v6'],restore:['M4 11a8 8 0 1 1 2 6','M4 4v7h7']};
  function iconButton(button,kind,label){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    for(const d of iconPaths[kind]){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);svg.append(path)}
    button.classList.add('atlas-icon-button',`atlas-action--${kind}`);
    button.setAttribute('aria-label',t(label));button.title=t(label);button.replaceChildren(svg);
    return button;
  }
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
    ui.originForm.hidden=next!=='origin';
    ui.chooseMessage.hidden=next!=='choose';
    $('atlas-connection-source').hidden=next!=='choose';
    ui.chooseActions.hidden=next!=='choose';
    ui.mapControls.hidden=['origin','demo'].includes(next);
    ui.world.hidden=next!=='studio';
    ui.search.closest('.atlas-find').hidden=next==='studio';
    ui.sheet.classList.toggle('atlas-sheet--welcome',!ui.welcome.hidden);
    ui.search.disabled=['origin','demo','studio'].includes(next);
    if(map?.getLayer('atlas-muted')){
      const visibility=next==='studio'||(next==='demo'&&activeRoute?.id==='yoh-draft')||(next==='origin'&&ui.originForm.elements.anywhere.checked)?'none':'visible';
      map.setLayoutProperty('atlas-muted','visibility',visibility);
      map.setLayoutProperty('atlas-outline','visibility',visibility);
    }
    if(next==='origin'){
      ui.welcomeTitle.textContent=t('Start in Japan.');
      ui.welcomeCopy.textContent=t('Choose a place you know. This is your anchor, not a claim that your idea began here.');
      ui.hint.textContent=t('Tap your place in Japan');ui.count.textContent='01 / 02';
      setCountryName(authorOriginCountry);
    }else if(next==='choose'){
      ui.welcomeTitle.textContent=t('Choose a connection.');
      const source=journey?frameMoment(journey,connectionFromIndex):origin;
      ui.welcomeCopy.textContent=t('Follow an engineering idea to another country. Select it on the map or search by name.');
      $('atlas-connection-source').textContent=`${t('From')}: ${t(source?.place||source?.country||'Japan')}`;
      ui.hint.textContent=t('Choose a nation');ui.count.textContent='02 / 02';
      setCountryName('The world');
    }
    renderRoutes();
  }
  function startAuthor(){
    authorDraft=null;journey=null;origin=null;selected=null;connectionFromIndex=0;authorOriginPoint=[...japan];authorOriginCountry='Japan';
    ui.originForm.reset();ui.originForm.elements.markerColor.value='#20567c';
    ui.originForm.querySelector('details').open=false;
    ui.originForm.elements.place.value='';
    ui.originMapNote.textContent=t('Tap a place in Japan on the map, or use Reitaku campus as your starting point.');
    ui.originStatus.textContent='';updateMarkerPreview();setStage('origin');
    map?.easeTo({center:[139,36],zoom:4.1,duration:850});
  }
  function chooseOriginPoint(point,country){
    authorOriginPoint=point;authorOriginCountry=country;
    ui.originMapNote.textContent=`${t('Map anchor')}: ${t(country)} · ${point[1].toFixed(2)}, ${point[0].toFixed(2)}`;
    if(!ui.originForm.elements.place.value.trim())ui.originForm.elements.place.value=country==='Japan'?'':country;
    setCountryName(country);
    renderRoutes();
  }
  function saveOrigin(event){
    event.preventDefault();
    const form=ui.originForm.elements;
    const alias=form.alias.value.trim(),place=form.place.value.trim();
    if(!alias||!place){ui.originStatus.textContent=t('Add your alias and starting place.');return}
    origin={country:authorOriginCountry,place,point:authorOriginPoint,year:null};
    const marker={color:markerColor(form.markerColor.value),symbol:markerSymbol(form.markerSymbol.value||alias[0])};
    authorDraft={id:`journey-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,alias,marker,origin,hops:[]};
    journey=authorDraft;connectionFromIndex=0;setStage('choose');map?.easeTo({center:[60,18],zoom:1.65,duration:850});
  }
  function useCountry(feature,clickedPoint){
    if(!origin||!['choose','selected'].includes(stage))return;
    const name=feature.properties.name;if(name===(journey?.hops[connectionFromIndex-1]?.country||origin.country))return;
    selected={name,feature,point:clickedPoint||pointFor(feature)};
    map.setFilter('atlas-selected-fill',['==',['get','name'],name]);
    ui.selectedName.textContent=t(name);ui.form.reset();ui.form.querySelector('details').open=false;ui.status.textContent='';
    $('atlas-selected-source').textContent=`${t('From')}: ${t(frameMoment(journey,connectionFromIndex).place||origin.country)} → ${t(name)}`;
    setStage('selected');setCountryName(name);map?.easeTo({center:selected.point,zoom:2.5,duration:850});
  }
  function removeMarkers(){markers.forEach(m=>m.remove());markers=[]}
  function longitudeNear(lng,reference){return lng+360*Math.round((reference-lng)/360)}
  function updateMarkerPreview(){const color=markerColor(ui.originForm.elements.markerColor.value);ui.originMarkerPreview.style.backgroundColor=color;ui.originMarkerPreview.style.color=markerInk(color);ui.originMarkerPreview.textContent=markerSymbol(ui.originForm.elements.markerSymbol.value)}
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
    else if(stage==='origin')addMarker(authorOriginPoint,ui.originForm.elements.place.value||authorOriginCountry,'origin');
  }
  function studioProjects(){return [builtinRoute('yoh-draft'),builtinRoute('simulated-mina')].filter(route=>!hiddenBuiltins.includes(route.id)).concat(sharedStories)}
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
        markers.push(new maplibregl.Marker({element:host,anchor:'center'}).setLngLat([studioWorldView?point[0]:longitudeNear(point[0],studioCamera?.center.lng??point[0]),point[1]]).addTo(map));
      });
    }
  }
  function frameMoment(route,index){
    return index===0?{...route.origin,country:route.origin.country||'Japan',reason:'A place I know. A question begins here.'}:route.hops[index-1];
  }
  function sourceIndex(route,index){return index<1?0:Number.isInteger(route.hops[index-1]?.fromIndex)?route.hops[index-1].fromIndex:index-1}
  function sourceMoment(route,index){return frameMoment(route,sourceIndex(route,index))}
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
      const title=node('button','atlas-studio-person');
      const avatar=node('span','atlas-studio-avatar',markerSymbol(route.marker?.symbol||route.alias?.slice(0,1)));
      avatar.style.backgroundColor=color;avatar.style.color=markerInk(color);
      title.append(avatar,node('span','',`${route.alias}${route.simulated?t(' · simulated'):!isBuiltin(route)&&canEdit(route)?t(' · mine'):''}`));
      title.type='button';title.addEventListener('click',()=>showJourney(route));
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
  function buildMyJourneys(){
    const list=$('atlas-my-journeys-list');list.replaceChildren();
    if(!session)return;
    const owned=session.admin?[builtinRoute('yoh-draft'),builtinRoute('simulated-mina'),...sharedStories.filter(canEdit)]:sharedStories.filter(canEdit);
    if(!owned.length){list.append(node('p','atlas-my-empty','No journeys yet. Start with a place you know.'));return}
    for(const route of owned){
      const row=node('div','atlas-my-row');
      const label=node('strong','',route.title||`${route.alias} · ${route.origin.place}`);
      const hidden=isBuiltin(route)&&hiddenBuiltins.includes(route.id);
      const count=node('span','',hidden?t('Hidden from the atlas'):`${route.hops.length} ${route.hops.length===1?t('connection'):t('connections')}`);
      const actions=node('div','atlas-my-actions');
      const action=(kind,name,handler)=>{const button=iconButton(node('button'),kind,`${t(name)}: ${route.alias}`);button.type='button';button.addEventListener('click',handler);actions.append(button)};
      if(hidden)action('restore','Restore journey',()=>setBuiltinVisible(route,true).catch(error=>window.alert(t(error.message))));
      else{
        action('view','View',()=>showJourney(route,true));
        if(canEdit(route)){
          action('edit','Edit',()=>{showJourney(route,true);openEditor()});
          action('add','Add connection',()=>{showJourney(route,true,route.hops.length);addConnectionToRoute()});
        }
        action('delete','Delete journey',()=>deleteEntireJourney(route));
      }
      row.append(label,count,actions);list.append(row);
    }
  }
  function showStudio(){
    studioReturnStage=stage==='demo'?(returnStage==='studio'?studioReturnStage:returnStage):stage;
    stopPlayback();clearRouteLine();activeRoute=null;routeCamera=null;
    buildStudio();buildMyJourneys();
    const projects=studioProjects(),all=projects.flatMap(route=>[route.origin,...route.hops]);
    studioCamera=all.length?journeyCamera({origin:all[0],hops:all.slice(1)},Math.min(300,map.getContainer().clientHeight*.35)):null;studioWorldView=false;
    map.setFilter('atlas-selected-fill',['==',['get','name'],'']);
    setStage('studio');
    map.easeTo(studioCamera?{...studioCamera,duration:850}:{center:[20,15],zoom:1.25,duration:850});
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
      const imageUrl=moment.image?.startsWith('lectures/assets/')?moment.image:/^[0-9a-f-]{36}$/i.test(moment.imageId||'')?`${workerUrl}/images/${moment.imageId}`:'';
      if(imageUrl){
        frame.classList.add('atlas-frame--image');
        const photo=node('img','atlas-frame-image');photo.src=imageUrl;photo.alt=t(moment.imageAlt||moment.place||moment.country||'Journey image');photo.loading='lazy';
        button.append(photo);
      }
      const top=node('span','atlas-frame-top');
      top.append(node('span','atlas-frame-year',moment.dateLabel||moment.year||(index?'UNDATED':'HERE')),node('span','atlas-frame-beat',moment.beat||moment.lens||'QUESTION'));
      button.append(top,node('span','atlas-frame-place',moment.place||moment.country));
      button.append(node('span','atlas-frame-story',moment.engineering||moment.reason||'A question begins here.'));
      if(index){const from=sourceMoment(route,index);button.append(node('span','atlas-frame-from',`${t('From')} ${t(from.place||from.country)}`))}
      if(moment.engineering&&moment.reason)button.append(node('span','atlas-frame-question',moment.reason));
      else if(moment.trace)button.append(node('span','atlas-frame-question',moment.trace));
      button.addEventListener('click',()=>{stopPlayback();setActiveMoment(index,true)});
      frame.append(button);
      const expand=node('button','atlas-frame-expand','↗');expand.type='button';expand.title=t('Expand card');expand.setAttribute('aria-label',`${t('Expand card')}: ${t(moment.place||moment.country)}`);expand.addEventListener('click',()=>openCard(index));frame.append(expand);
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
    if(move&&previous!==activeMoment)revealConnection(sourceMoment(activeRoute,activeMoment),frameMoment(activeRoute,activeMoment));
    ui.filmstripPrev.disabled=activeMoment===0;
    ui.filmstripNext.disabled=activeMoment===activeRoute.hops.length;
    const editable=canEdit(activeRoute),removable=canRemove(activeRoute);
    ui.filmstripAdd.hidden=!editable;
    $('atlas-filmstrip-edit').hidden=!editable;$('atlas-filmstrip-delete').hidden=!removable;
    iconButton($('atlas-filmstrip-delete'),'delete',activeMoment?'Delete marker':isBuiltin(activeRoute)?'Remove built-in journey':'Delete journey');
    ui.filmstripTrack.querySelectorAll('.atlas-frame').forEach((frame,i)=>frame.classList.toggle('is-active',i===activeMoment));
    markers.forEach((marker,i)=>{
      const host=marker.getElement();
      host.firstElementChild?.classList.toggle('is-active',i===activeMoment);
      host.style.zIndex=i===activeMoment?'3':'1';
      host.querySelector('.atlas-marker-actions')?.remove();
    });
    if(removable&&markers[activeMoment]){
      const actions=node('div','atlas-marker-actions');
      if(editable){const edit=iconButton(node('button'),'edit','Edit this marker');edit.type='button';edit.addEventListener('click',event=>{event.stopPropagation();openEditor()});actions.append(edit)}
      const remove=iconButton(node('button'),'delete',activeMoment?'Delete this connection':isBuiltin(activeRoute)?'Remove built-in journey':'Delete this journey');remove.type='button';remove.addEventListener('click',event=>{event.stopPropagation();deleteActiveMoment()});
      actions.append(remove);markers[activeMoment].getElement().append(actions);
    }
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
  function stopPlayback(){if(playTimer)clearTimeout(playTimer);playTimer=null;ui.filmstripPlay.textContent='▶';ui.filmstripPlay.setAttribute('aria-label',t('Play journey'));ui.filmstripPlay.title=t('Play journey')}
  function playJourney(){
    if(playTimer){stopPlayback();return}
    if(activeMoment>=activeRoute.hops.length)setActiveMoment(0,true);
    ui.filmstripPlay.textContent='Ⅱ';ui.filmstripPlay.setAttribute('aria-label',t('Pause journey'));ui.filmstripPlay.title=t('Pause journey');
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
  function openCard(index){
    if(!activeRoute)return;
    setActiveMoment(index,true);
    const moment=frameMoment(activeRoute,activeMoment),dialog=$('atlas-card-detail');
    const imageUrl=moment.image?.startsWith('lectures/assets/')?moment.image:/^[0-9a-f-]{36}$/i.test(moment.imageId||'')?`${workerUrl}/images/${moment.imageId}`:'';
    const image=$('atlas-card-image');image.hidden=!imageUrl;if(imageUrl){image.src=imageUrl;image.alt=t(moment.imageAlt||moment.place||moment.country||'Journey image')}
    $('atlas-card-year').textContent=moment.dateLabel||moment.year||t('Undated');
    $('atlas-card-title').textContent=t(moment.place||moment.country||'Japan');
    $('atlas-card-story').textContent=t(moment.engineering||moment.reason||'A question begins here.');
    $('atlas-card-trace').textContent=t(moment.trace||moment.reason||'');
    const link=$('atlas-card-link'),url=safeUrl(moment.mediaUrl);link.hidden=!url;if(url)link.href=url;
    $('atlas-card-count').textContent=`${activeMoment+1} / ${activeRoute.hops.length+1}`;
    $('atlas-card-prev').disabled=activeMoment===0;$('atlas-card-next').disabled=activeMoment===activeRoute.hops.length;
    if(!dialog.open)dialog.showModal();
  }
  function openEditor(){
    if(!canEdit(activeRoute))return;
    const moment=activeMoment?activeRoute.hops[activeMoment-1]:activeRoute.origin;
    const form=ui.editorForm.elements;
    ui.editorForm.reset();
    form.title.value=activeRoute.title||'';form.alias.value=activeRoute.alias||'';
    form.year.value=moment.year||'';form.place.value=moment.place||moment.country||'';form.country.value=moment.country||activeRoute.origin.country||'Japan';
    form.story.value=moment.engineering||moment.reason||'';form.trace.value=moment.trace||'';
    form.mediaUrl.value=moment.mediaUrl||'';
    form.markerColor.value=markerColor(activeRoute.marker?.color);
    form.markerSymbol.value=activeRoute.marker?.symbol||'';
    ui.editorStatus.textContent='';ui.editor.showModal();form.story.focus();
  }
  async function saveEdit(event){
    event.preventDefault();
    if(!canEdit(activeRoute))return;
    const form=ui.editorForm.elements;
    const alias=form.alias.value.trim(),place=form.place.value.trim(),storyText=form.story.value.trim(),mediaUrl=form.mediaUrl.value.trim();
    if(!alias||!place||(activeMoment&&!storyText)){ui.editorStatus.textContent=t('Add a name, place, and story before saving.');return}
    if(mediaUrl&&!safeUrl(mediaUrl)){ui.editorStatus.textContent=t('Use an http or https link.');return}
    const yearText=form.year.value.trim(),year=yearText?Number(yearText):null;
    if(year&&(year<1900||year>2100)){ui.editorStatus.textContent=t('Enter a year between 1900 and 2100.');return}
    const draft=JSON.parse(JSON.stringify(activeRoute));
    draft.title=form.title.value.trim();draft.alias=alias;
    draft.marker={color:markerColor(form.markerColor.value),symbol:markerSymbol(form.markerSymbol.value||alias[0])};
    const moment=activeMoment?draft.hops[activeMoment-1]:draft.origin;
    moment.place=place;moment.year=year;
    const newCountry=form.country.value.trim();
    if(newCountry&&newCountry!==moment.country){
      const feature=features.find(item=>item.properties.name.toLowerCase()===newCountry.toLowerCase());
      if(!feature){ui.editorStatus.textContent=t('Choose a country from the list.');return}
      moment.country=feature.properties.name;moment.point=pointFor(feature);
    }
    if(activeMoment)moment.reason=storyText;
    else moment.engineering=storyText;
    moment.trace=form.trace.value.trim();moment.mediaUrl=safeUrl(mediaUrl);
    try{
      if(form.image.files[0]){ui.editorStatus.textContent=t('Preparing image…');moment.imageId=await uploadImage(draft.id,form.image.files[0])}
    }catch(error){ui.editorStatus.textContent=t(error.message);return}
    ui.editorStatus.textContent=t('Saving changes…');
    const result=await publishStory(draft);
    if(!result.ok){ui.editorStatus.textContent=t(result.error);return}
    activeRoute=draft;
    ui.editor.close();buildFilmstrip(draft);routeCamera=journeyCamera(draft);renderRoutes();setActiveMoment(activeMoment,false);
    if(routeCamera)map.easeTo({...routeCamera,duration:750});
  }
  function addConnectionToRoute(){
    if(!canEdit(activeRoute))return;
    const current=frameMoment(activeRoute,activeMoment),start=activeRoute.origin;
    $('atlas-branch-continue').textContent=`${t('Continue from')} ${t(current.place||current.country)}`;
    $('atlas-branch-origin').textContent=`${t('Branch from')} ${t(start.place||start.country||'Japan')}`;
    $('atlas-branch-continue').hidden=activeMoment===0;
    $('atlas-branch').showModal();
  }
  function beginConnection(fromIndex){
    $('atlas-branch').close();connectionFromIndex=fromIndex;
    stopPlayback();clearRouteLine();journey=JSON.parse(JSON.stringify(activeRoute));origin=journey.origin;writeJourney(journey);
    authorDraft=null;activeRoute=null;routeCamera=null;selected=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);
    setStage('choose');
    const point=frameMoment(journey,connectionFromIndex).point;
    map?.easeTo({center:point,zoom:Math.min(map.getZoom(),2.3),duration:800});
  }
  async function saveDraft(){
    if(!session||!selected||!origin){ui.status.textContent=t('Sign in again');return}
    const form=ui.form.elements,reason=form.reason.value.trim(),mediaUrl=form.mediaUrl.value.trim();
    const tags=[...ui.form.querySelectorAll('[name="tag"]:checked')].map(item=>item.value);
    if(!reason){ui.status.textContent=t('Describe the connection before publishing.');return}
    if(mediaUrl&&!safeUrl(mediaUrl)){ui.status.textContent=t('Please use an http or https link, or leave it blank.');return}
    const yearText=form.year.value.trim(),year=yearText?Number(yearText):null;
    if(year&&(year<1900||year>2100)){ui.status.textContent=t('Please enter a year between 1900 and 2100.');return}
    const base=journey||authorDraft;
    if(!base){ui.status.textContent=t('Start your journey again.');return}
    const draft=JSON.parse(JSON.stringify(base));
    draft.hops.push({country:selected.name,point:selected.point,fromIndex:connectionFromIndex,reason,lens:tags[0],tags,year,trace:form.trace.value.trim(),mediaUrl:safeUrl(mediaUrl)});
    const submit=ui.form.querySelector('[type="submit"]');submit.disabled=true;ui.status.textContent=t('Publishing connection…');
    const result=await publishStory(draft);
    if(!result.ok){ui.status.textContent=t(result.error);submit.disabled=false;return}
    let warning='';
    if(form.image.files[0]){
      try{
        ui.status.textContent=t('Uploading image…');
        draft.hops.at(-1).imageId=await uploadImage(draft.id,form.image.files[0]);
        const imageSave=await publishStory(draft);
        if(!imageSave.ok)throw new Error(imageSave.error);
      }catch(error){warning=t('The connection was published, but its image was not. You can add it with Edit.')}
    }
    journey=draft;origin=draft.origin;authorDraft=null;writeJourney(draft);submit.disabled=false;
    ui.form.reset();await loadSharedStories();showStudio();showJourney(draft,true,draft.hops.length);returnStage='studio';
    if(warning)window.alert(warning);
  }
  async function deleteActiveMoment(){
    if(!canRemove(activeRoute))return;
    const route=activeRoute,index=activeMoment;
    if(!index){await deleteEntireJourney(route);return}
    if(isBuiltin(route)&&route.hops.length===1){await deleteEntireJourney(route);return}
    const question=route.hops.length===1?t('Delete this last connection and the entire journey?'):t('Delete this connection from your journey?');
    if(!window.confirm(question))return;
    try{
      if(index&&route.hops.length>1){
        const draft=JSON.parse(JSON.stringify(route));
        const removed=draft.hops.splice(index-1,1)[0];
        draft.hops.forEach((hop,i)=>{const oldIndex=i>=index-1?i+1:i;const parent=Number.isInteger(hop.fromIndex)?hop.fromIndex:oldIndex;hop.fromIndex=parent===index?(Number.isInteger(removed.fromIndex)?removed.fromIndex:index-1):parent>index?parent-1:parent});
        const result=await publishStory(draft);if(!result.ok)throw new Error(result.error);
        await loadSharedStories();showJourney(draft,true,Math.min(index-1,draft.hops.length));returnStage='studio';
      }else{
        await deleteStory(route);await loadSharedStories();showStudio();
      }
    }catch(error){window.alert(t(error.message))}
  }
  async function deleteEntireJourney(route){
    if(!canRemove(route))return;
    const question=isBuiltin(route)?`${t('Remove built-in journey from the public atlas?')} ${t('You can restore it under All journeys.')}`:t('Delete your entire journey?');
    if(!window.confirm(question))return;
    try{if(isBuiltin(route))await setBuiltinVisible(route,false);else{await deleteStory(route);await loadSharedStories();showStudio()}}
    catch(error){window.alert(t(error.message))}
  }
  async function initMap(){
    if(!window.maplibregl||!window.topojson){document.querySelector('.atlas-studio-note').textContent=t('Map unavailable. Please reload when connected.');return}
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
          if(stage!=='demo')setCountryName(stage==='origin'?authorOriginCountry:selected?.name||(origin?'The world':'Japan'));
        });
        map.on('click','atlas-hit',event=>{
          const feature=event.features[0];if(!feature)return;
          const name=feature.properties.name;
          if(stage==='origin'&&(name==='Japan'||ui.originForm.elements.anywhere.checked))chooseOriginPoint([event.lngLat.lng,event.lngLat.lat],name);
          else if(['choose','selected'].includes(stage))useCountry(feature,[event.lngLat.lng,event.lngLat.lat]);
        });
        await restoreSession();await loadSharedStories();
        showStudio();
        if(window.location.hash==='#yoh'&&!hiddenBuiltins.includes(yohStory.id))showJourney(builtinRoute('yoh-draft'));
        else if(window.location.hash==='#sample'&&!hiddenBuiltins.includes(sample.id))showJourney(builtinRoute('simulated-mina'));
      }catch(error){document.querySelector('.atlas-studio-note').textContent=t('The map could not load country boundaries. Please reconnect and reload.');console.error(error)}
    });
  }
  function cancelAuthor(){authorDraft=null;selected=null;origin=null;journey=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);showStudio()}
  ui.world.addEventListener('click',()=>{studioWorldView=true;renderStudioMarkers();map?.fitBounds([[-178,-58],[178,78]],{padding:{top:70,bottom:Math.min(300,ui.studio.getBoundingClientRect().height+35),left:40,right:40},duration:850})});
  ui.search.addEventListener('change',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature){useCountry(feature);ui.search.value=''}});
  ui.addJourney.addEventListener('click',()=>{
    if(!session){ui.accessStatus.textContent='';ui.accessForm.reset();updateAccessPrompt();ui.access.showModal();ui.accessForm.elements.email.focus();return}
    startAuthor();
  });
  $('atlas-my-journeys-toggle').addEventListener('click',()=>{const panel=$('atlas-my-journeys');panel.hidden=!panel.hidden;if(!panel.hidden){buildMyJourneys();panel.scrollIntoView({block:'nearest',behavior:'smooth'})}});
  $('atlas-my-journeys-new').addEventListener('click',startAuthor);
  ui.accessForm.addEventListener('submit',signIn);
  ui.accessForm.elements.email.addEventListener('input',updateAccessPrompt);
  $('atlas-access-cancel').addEventListener('click',()=>ui.access.close());
  ui.signOut.addEventListener('click',async()=>{
    const token=session?.token;storeSession(null);journey=null;origin=null;activeRoute=null;
    if(token)fetch(`${workerUrl}/session`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}).catch(()=>{});
    await loadSharedStories();showStudio();
  });
  ui.originForm.addEventListener('submit',saveOrigin);
  ui.originForm.elements.markerColor.addEventListener('input',updateMarkerPreview);
  ui.originForm.elements.markerSymbol.addEventListener('input',updateMarkerPreview);
  ui.originForm.elements.anywhere.addEventListener('change',()=>{
    if(!ui.originForm.elements.anywhere.checked&&authorOriginCountry!=='Japan'){authorOriginPoint=[...japan];authorOriginCountry='Japan';ui.originMapNote.textContent=t('Tap a place in Japan on the map, or use Reitaku campus as your starting point.')}
    setStage('origin');map?.easeTo(ui.originForm.elements.anywhere.checked?{center:[60,18],zoom:1.65,duration:750}:{center:[139,36],zoom:4.1,duration:750});
  });
  $('atlas-author-cancel').addEventListener('click',cancelAuthor);
  $('atlas-choose-cancel').addEventListener('click',cancelAuthor);
  $('atlas-connection-cancel').addEventListener('click',cancelAuthor);
  $('atlas-connection-back').addEventListener('click',()=>{selected=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);setStage('choose')});
  function closeJourney(){stopPlayback();clearRouteLine();activeRoute=null;routeCamera=null;map?.setFilter('atlas-selected-fill',['==',['get','name'],'']);showStudio()}
  ui.filmstripClose.addEventListener('click',closeJourney);
  ui.filmstripAdd.addEventListener('click',addConnectionToRoute);
  $('atlas-filmstrip-edit').addEventListener('click',openEditor);
  $('atlas-filmstrip-delete').addEventListener('click',deleteActiveMoment);
  $('atlas-branch-continue').addEventListener('click',()=>beginConnection(activeMoment));
  $('atlas-branch-origin').addEventListener('click',()=>beginConnection(0));
  $('atlas-branch-cancel').addEventListener('click',()=>$('atlas-branch').close());
  $('atlas-card-close').addEventListener('click',()=>$('atlas-card-detail').close());
  $('atlas-card-prev').addEventListener('click',()=>openCard(activeMoment-1));
  $('atlas-card-next').addEventListener('click',()=>openCard(activeMoment+1));
  ui.editorForm.addEventListener('submit',saveEdit);
  $('atlas-editor-cancel').addEventListener('click',()=>ui.editor.close());
  $('atlas-editor-discard').addEventListener('click',()=>ui.editor.close());
  ui.filmstripStudio.addEventListener('click',showStudio);
  ui.filmstripPlay.addEventListener('click',playJourney);
  ui.filmstripPrev.addEventListener('click',()=>{stopPlayback();setActiveMoment(activeMoment-1,true)});
  ui.filmstripNext.addEventListener('click',()=>{stopPlayback();setActiveMoment(activeMoment+1,true)});
  window.addEventListener('keydown',event=>{
    if(stage!=='demo'||!['ArrowLeft','ArrowRight'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
    if(ui.editor.open||ui.access.open||$('atlas-branch').open||$('atlas-card-detail').open)return;
    if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    event.preventDefault();stopPlayback();setActiveMoment(activeMoment+(event.key==='ArrowRight'?1:-1),true);
  });
  ui.search.addEventListener('input',()=>{const feature=features.find(f=>f.properties.name.toLowerCase()===ui.search.value.trim().toLowerCase());if(feature&&origin){useCountry(feature);ui.search.value=''}});
  ui.form.addEventListener('submit',event=>{event.preventDefault();saveDraft()});
  iconButton($('atlas-filmstrip-edit'),'edit','Edit frame');
  iconButton($('atlas-filmstrip-delete'),'delete','Delete marker');
  iconButton(ui.filmstripAdd,'add','Add connection');
  function localizeAttributes(){
    ui.search.placeholder=t('Find a country');
    ui.originForm.elements.place.placeholder=t('A town, campus, kitchen, station…');
    ui.originForm.elements.alias.placeholder=t('How should we identify your story?');
    ui.form.elements.reason.placeholder=t('An invention, person, event, or idea you want to investigate…');
    ui.form.elements.year.placeholder=t('Year, if known');
    ui.form.elements.trace.placeholder=t('What changed—or might change?');
    ui.editorForm.elements.title.placeholder=t('Give your journey a title');
  }
  localizeAttributes();
  window.addEventListener('course-language-change',()=>{
    localizeAttributes();
    updateAccessPrompt();storeSession(session);
    iconButton($('atlas-filmstrip-edit'),'edit','Edit frame');iconButton(ui.filmstripAdd,'add','Add connection');
    ui.filmstripPlay.setAttribute('aria-label',t(playTimer?'Pause journey':'Play journey'));ui.filmstripPlay.title=t(playTimer?'Pause journey':'Play journey');
    $('atlas-filmstrip-close').setAttribute('aria-label',t('Close'));$('atlas-filmstrip-close').title=t('Close');
    if(['origin','choose'].includes(stage))setStage(stage);
    if(stage==='selected'){
      ui.selectedName.textContent=t(selected?.name||'');
      $('atlas-selected-source').textContent=`${t('From')}: ${t(frameMoment(journey,connectionFromIndex).place||origin.country)} → ${t(selected?.name||'')}`;
    }
    if(stage==='demo'&&activeRoute){buildFilmstrip(activeRoute);setActiveMoment(activeMoment,false)}
    if(stage==='studio'){buildStudio();buildMyJourneys()}
    ui.status.textContent=t(ui.status.textContent);
    ui.editorStatus.textContent=t(ui.editorStatus.textContent);
  });
  initMap();
})();
