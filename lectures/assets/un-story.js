// A journey from the meeting room to the field, then back to the people doing the work.
window.buildUNStory=function(old){
 const by=Object.fromEntries(old.map(q=>[q.proof[0],q]));
 const make=(key,en,ja,choices,answer,copy,jcopy,url,chapter,bridge)=>{
  const q=[en,ja,choices,answer,copy,jcopy,url,'Teaching scenarios are labelled. Ask students to explain their choice before revealing.'];
  q.proof=[key,[],({assembly:'UN · General Assembly',launch:'UN Peacekeeping · Deployment',workday:'UN Peacekeeping · Civilian personnel',dispatch:'UNDSS · Risk management',family:'ICSC · Non-family duty stations',relationships:'UN Policy Portal · Family separation',closing:'UN Peacekeeping · Careers'})[key],url];q.chapter=chapter;q.bridge=bridge;return q;
 };
 const room=['01 / The room','01 / 会議の場'],field=['02 / The field','02 / 現場へ'],life=['03 / The person','03 / 働く人へ'];
 const ga=make('assembly','193 countries walk into a room. Is this a world government?','193か国が一つの部屋に。これが世界政府？','A  Yes, it can order every country around\nB  No, it is a forum of Member States','B · A room for negotiation, not a world government.','The General Assembly brings every member together to debate, vote, and approve the UN budget. Most resolutions are recommendations; states do not become a single country.','国連総会は全加盟国が議論し、投票し、国連予算を承認する場。決議の多くは勧告であり、世界を一つの国として統治するわけではない。','https://www.un.org/en/ga/about/background.shtml',room,['So who is actually sitting in that famous room?','あの有名な議場には、誰が座っている？']);
 const launch=make('launch','The Council votes. Do blue helmets appear the next morning?','安保理で可決。翌朝には青いヘルメットが現れる？','A  Yes, there is a team waiting at UN HQ\nB  No, a mandate still needs people, money, and a plan','B · A resolution is the beginning of the work.','For a peacekeeping operation, the Security Council sets the mandate. The Assembly finances it. Countries contribute troops and police; the UN recruits civilian staff. Deployment and reporting follow.','平和維持活動では、安保理が任務を定め、総会が予算を決める。各国の軍・警察と、国連が採用する文民職員を集め、展開し、報告する。','https://peacekeeping.un.org/en/deploying-peacekeepers',field,['A vote in New York. Now someone has to make it happen.','ニューヨークで決まった。その先を動かすのは、人だ。']);
 const jobs=make('workday','It is 08:00 at a field office. What counts as UN work?','現地事務所、朝8時。どれが国連の仕事？','A  Fixing a radio\nB  Checking a water point and updating a map\nC  Both—and talking to the people who live there','C · The work is often practical, local, and collaborative.','Civilian teams do logistics, finance, ICT, human rights, and community liaison. GIS supports decisions; it does not replace local knowledge. Different agencies and missions do different jobs.','文民職員は物流、財務、通信、人権、地域との対話などを担う。GISは判断を支えるが、地域の知識に代わるものではない。組織や任務によって仕事は異なる。','https://peacekeeping.un.org/en/civilian-personnel',field,['Forget the podium for a moment. What is on the desk?','演説台から離れて、現場の机を見てみよう。']);
 const day=make('dispatch','One vehicle. Three urgent requests. What do you do first?','車は1台。急ぎの依頼は3件。まず何をする？','A  Choose the closest point on the map\nB  Compare need, access, and what people are telling you\nC  Choose the most impressive photograph','B · A good map starts a conversation.','There is no universal correct route. In this fictional exercise, changing access changes what is possible. Local partners, logistics and security colleagues all hold information you need.','万能な正解のルートはない。この架空の演習では、通行状況が変われば判断も変わる。地域の協力者、物流担当、安全担当の情報を合わせる。','https://www.un.org/safety-and-security/en/expertise/risk-management',field,['Let’s give you a small piece of that job.','その仕事を、少し体験してみよう。']);
 const family=make('family','You got the overseas job. Can your family come too?','海外勤務が決まった。家族も一緒に行ける？','A  Always\nB  It depends on the duty station\nC  Never','B · Some assignments mean living apart.','Some duty stations are designated non-family. UN rules explicitly recognise the financial and psychological hardship of involuntary family separation. This is about a posting, not the quality of someone’s relationship.','勤務地によっては家族の帯同が認められない。国連の規則も、家族との別居による経済的・心理的な負担を認めている。勤務地の条件と、家族関係の良し悪しは別の話だ。','https://icsc.un.org/Home/NonFamily',life,['We have talked about the work. What happens to life outside it?','仕事の話をしてきた。その外側の暮らしは、どうなる？']);
 const divorce=make('relationships','And the divorce rate? Would you trust a dramatic percentage?','では、離婚率は？驚くような数字を、そのまま信じる？','A  Yes, if it sounds plausible\nB  Only with a population, a period, and a credible source','B · No reliable UN-wide divorce rate verified here.','A share of staff who are divorced is not an annual divorce rate. Nor does it show that UN work caused a divorce. The better question for Kana: what does this career ask of relationships—and what support actually helps?','「離婚歴のある職員の割合」は年間の離婚率ではない。仕事が離婚の原因とも言えない。Kanaさんに聞きたいのは、この働き方が家族やパートナーに何を求め、どんな支援が役立つのか。','https://policy.un.org/en/salaries-and-related-allowances',life,['An extraordinary career still contains ordinary human needs.','特別な仕事にも、人としての当たり前の暮らしがある。']);
 const end=make('closing','Kana walks into our classroom next week. What will you ask now?','来週、Kanaさんが教室に来る。今なら、何を聞く？','A  What does a difficult day actually look like?\nB  When has a map changed a decision?\nC  What has this path asked you to give up?','All three. Follow the answer, not just your question list.','From an urban-planning skill to a humanitarian decision: ask about a real moment, the people involved, and the trade-off. Where might your own skills meet a problem beyond Japan?','都市計画の技能から、人道支援の判断へ。実際の場面、関わった人、迷った選択を聞いてみよう。自分の技能は、日本の外のどんな課題とつながるだろう。','https://peacekeeping.un.org/en/work-with-us',life,['Now turn the quiz into a conversation.','ここからは、クイズを対話につなげよう。']);
 const keys=['founding','members',ga,'equality','seats','veto',launch,'army',jobs,day,'wfp','toilet','security','privacy','careers','ypp','salary',family,divorce,'support','protection',end];
 const japanese={
  founding:['A  再び世界大戦が起きること\nB  国際貿易\nC  移住','A・再び世界大戦を起こさないために'],
  members:['A  51\nB  193\nC  195','B・193加盟国'],
  assembly:['A  各国に命令できる世界政府\nB  加盟国が集まる議論の場','B・交渉の場であって、世界政府ではない。'],
  equality:['A  どこでも同じ\nB  どこでも違う\nC  どの機関かによる','C・どの機関かによる'],
  seats:['A  会議1回分\nB  2年間\nC  憲章上、定期的な任期満了はない','C・常任5か国、非常任10か国'],
  veto:['A  必ず14か国の賛成が勝つ\nB  誰が反対するかによる','B・実質事項では常任理事国の反対が拒否権となる'],
  launch:['A  本部に待機チームがいるので、すぐ展開できる\nB  人、予算、計画をそろえる必要がある','B・決議は、仕事の始まり。'],
  army:['A  ニューヨークの地下\nB  秘密の島\nC  国連独自の常備軍はない','C・国連独自の常備軍はない'],
  workday:['A  無線を修理する\nB  給水所を確認し、地図を更新する\nC  両方。そして、地域の人の話を聞く','C・実務を担い、地域と協働する。'],
  dispatch:['A  地図で一番近い所を選ぶ\nB  ニーズ、通行状況、地域からの情報を照らし合わせる\nC  写真映えする所を選ぶ','B・良い地図から、対話が始まる。'],
  wfp:['A  世界食糧計画（WFP）\nB  国連の食堂\nC  料理コンテスト','A・世界食糧計画、2020年'],
  toilet:['A  全員返信の日\nB  世界トイレの日\nC  国際表計算の日','B・本当にある、世界トイレの日。'],
  security:['A  最速ルートを走る\nB  安全上の手続きを確認する\nC  地図に楽観的になってもらう','B・安全上の手続きを確認する'],
  privacy:['A  すべての正確な位置を公開する\nB  集計した情報にする\nC  誰に何を共有するか、リスクに応じて決める','C・正確さだけでは、安全な地図にならない'],
  careers:['A  スピーチだけ\nB  役割によって、どれも役立つ\nC  地図だけ','B・どれも役立つ場面がある'],
  ypp:['A  全職種共通の試験がある\nB  採用ルートと職種による','B・入口は一つではない'],
  salary:['A  同じ身分証なら、同じ給与\nB  等級、職種、勤務地などによる','B・給与には、いくつもの条件がある'],
  family:['A  必ず同行できる\nB  勤務地による\nC  必ず別居する','B・家族と離れて暮らす赴任もある。'],
  relationships:['A  もっともらしければ信じる\nB  対象集団、期間、信頼できる出典を確かめる','B・信頼できる国連全体の離婚率は確認できていない。'],
  support:['A  誰もいない\nB  支援はあるが、対象や利用条件による','B・支援の仕組みと、その利用条件を知る'],
  protection:['A  身分証があれば、どこでも安全\nB  法的な保護があっても、危険は残る','B・法的な保護は、安全の保証ではない'],
  closing:['A  大変な一日は、実際にどんな一日？\nB  地図で判断が変わったことは？\nC  この道のために、手放したものは？','どれも聞きたい。用意した質問より、返ってきた答えをたどろう。']
 };
 const story=keys.map((v,i)=>{const q=typeof v==='string'?by[v]:v;q.chapter=q.chapter||(i<6?room:i<14?field:life);[q.optionsJA,q.answerJA]=japanese[q.proof[0]];return q;});
 return window.applyBentiuStory(story);
};

// Keep visual and text in separate flow columns: neither can cover the other.
window.layoutUNStory=function(stage,q,revealed){
 const T=(en,ja)=>document.documentElement.lang==='ja'?ja:en;
 const h=stage.querySelector('h1'),choices=stage.querySelector('.choices'),answer=stage.querySelector('.answer'),reveal=stage.querySelector('.reveal'),gis=stage.querySelector('.gis'),gallery=stage.querySelector('.story-scene');
 const layout=document.createElement('div');layout.className='story-layout';
 const visual=document.createElement('section');visual.className='story-visual';visual.setAttribute('aria-label',T('Interactive scene','操作できる場面'));
 const panel=document.createElement('section');panel.className='story-panel';
 const chapter=document.createElement('p');chapter.className='story-chapter';chapter.textContent=q.chapter[document.documentElement.lang==='ja'?1:0];panel.append(chapter,h);
 if(q.bridge){const bridge=document.createElement('p');bridge.className='story-bridge';bridge.textContent=q.bridge[document.documentElement.lang==='ja'?1:0];panel.append(bridge);}
 panel.append(choices);if(reveal)panel.append(reveal);if(answer)panel.append(answer);
 if(gis){visual.append(gis);if(gallery)gallery.remove();}
 else if(gallery)visual.append(gallery);
 else {const teaser=document.createElement('div');teaser.className='scene-teaser';const img=document.createElement('img');img.src='assets/un-photos/'+(q.photo||((q.chapter[0].startsWith('01')?'charter-1945.jpg':q.chapter[0].startsWith('02')?'peacekeepers.jpg':'field-map.webp')));img.alt=T('UN work, from the meeting room to the field','会議の場から現場へ、国連の仕事');teaser.append(img);const text=document.createElement('p');text.textContent=T('Make a choice. Then look closer.','選んでから、その先を見てみよう。');teaser.append(text);visual.append(teaser);}
 layout.append(visual,panel);stage.replaceChildren(layout);
};

window.drawStoryScene=function(host,q){
 const key=q.proof[0],T=(en,ja)=>document.documentElement.lang==='ja'?ja:en;
 if(!['assembly','launch','workday','dispatch','family','relationships','closing'].includes(key))return false;
 host.classList.add('story-scene','new-scene');host.dataset.kind=key;
 const el=(tag,text,parent=host)=>{const n=document.createElement(tag);if(text)n.textContent=text;parent.append(n);return n;};
 const button=(text,fn,parent=host)=>{const b=el('button',text,parent);b.onclick=()=>{parent.querySelectorAll('button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');fn();};return b;};
 const title=text=>el('h2',text).className='scene-title';
 const caption=text=>el('p',text).className='scene-caption';
 if(key==='assembly'){
  title(T('The General Assembly','国連総会'));const tally=el('div','0 / 5');tally.className='scene-number';const row=el('div');row.className='delegates';const votes=new Set();
  ['Japan / 日本','Brazil / ブラジル','Kenya / ケニア','France / フランス','Fiji / フィジー'].forEach(name=>{const b=button(name,()=>{votes.has(name)?votes.delete(name):votes.add(name);b.setAttribute('aria-pressed',String(votes.has(name)));tally.textContent=votes.size+' / 5';},row);b.setAttribute('aria-pressed','false');});
  caption(T('Try a five-delegate classroom vote. Each gets one vote. This is a model, not a real UN voting record; actual decisions have different voting rules.','5か国による授業用の投票。一国一票。実際の投票記録ではありません。実際の決定には議題に応じた投票規則があります。'));return true;
 }
 if(key==='launch'){
  title(T('From a vote to a field operation','投票から、現場の活動へ'));const list=el('div');list.className='mission-chain';const detail=el('p',T('Follow the chain. Which part can a map solve?','順にたどろう。地図で解決できるのは、どの部分？'));detail.className='scene-detail';
  [[T('01  Mandate','01  任務'),T('Security Council: what is the operation authorised to do?','安保理：何をすることが認められている？')],[T('02  Budget','02  予算'),T('General Assembly: approve funding and its allocation.','総会：資金と配分を承認する。')],[T('03  People + equipment','03  人員と装備'),T('Countries contribute uniformed personnel. The UN recruits civilians. Logistics brings equipment and supplies.','各国が軍・警察の人員を提供し、国連が文民を採用する。物流担当が装備と物資を手配する。')],[T('04  Deploy + report','04  展開と報告'),T('Establish a presence, carry out the mandate, report back. The Council reviews and may renew or change the mandate.','拠点を設け、任務を実行し、報告する。安保理は任務を検討し、更新や変更を判断する。')]].forEach(([a,b])=>button(a,()=>{detail.textContent=b;},list));
  caption(T('Simplified peacekeeping pathway. Humanitarian agencies and political missions have different structures.','平和維持活動の流れを簡略化。人道支援機関や政治ミッションは仕組みが異なります。'));return true;
 }
 if(key==='workday'){
  title(T('Not every desk has a diplomat.','外交官だけが、働いているわけではない。'));const list=el('div');list.className='work-desks';const detail=el('p',T('Open a desk. What does this person produce?','机を選んでみよう。この人の仕事の成果は？'));detail.className='scene-detail';
  [[T('08:00 / ICT','08:00 / 通信'),T('A working radio network. A team that can check in.','つながる無線。現地のチームが連絡を取れる。')],[T('09:00 / GIS','09:00 / GIS'),T('An updated access map, checked against field reports—not just satellite pixels.','現地報告で確かめたアクセス地図。衛星画像だけではわからない。')],[T('10:00 / Logistics','10:00 / 物流'),T('Fuel, vehicles, supplies and a delivery plan. A warehouse is also part of the mission.','燃料、車両、物資、配送計画。倉庫もミッションを支える。')],[T('11:00 / Community liaison','11:00 / 地域との対話'),T('A conversation in the local language that changes what the team thought it knew.','地域の言葉で話を聞く。チームの思い込みが変わる。')]].forEach(([a,b])=>button(a,()=>detail.textContent=b,list));caption(T('Illustrative working day, based on civilian roles. Not a record of one person’s day.','文民職員の仕事を基にした架空の一日。特定の職員の記録ではありません。'));return true;
 }
 if(key==='dispatch'){
  title(T('Your first field decision','現場で、最初の判断'));const map=el('div');map.className='dispatch-map';map.innerHTML='<svg viewBox="0 0 640 360" role="img" aria-label="Fictional field access map"><path class="river" d="M330 0 Q250 100 340 190 T300 360"/><path class="road" d="M65 290 L210 220 L290 160 L500 65 M210 220 L500 260"/><circle cx="65" cy="290" r="13"/><circle cx="290" cy="160" r="13"/><circle cx="500" cy="65" r="13"/><circle cx="500" cy="260" r="13"/><text x="35" y="330">'+T('Base','拠点')+'</text><text x="220" y="135">'+T('Water point','給水所')+'</text><text x="455" y="40">'+T('Clinic','診療所')+'</text><text x="450" y="300">'+T('Village','集落')+'</text><path class="bridge" d="M300 145 L350 145"/></svg>';
  let closed=false;const status=el('p',T('Access update: bridge status unconfirmed.','通行情報：橋の状態は未確認。'));status.className='scene-detail';
  button(T('Receive a field update','現地からの報告を受け取る'),()=>{closed=!closed;map.classList.toggle('bridge-closed',closed);status.textContent=closed?T('Bridge reported closed. The clinic route needs reassessment. Confirm needs, alternatives and security arrangements before dispatch.','橋は通行止めとの報告。診療所への経路を再検討。出発前にニーズ、代替策、安全上の手続きを確認。'):T('Bridge status unconfirmed again. A line on a map is not proof of access.','橋の状態は再び未確認。地図に線があっても、通れるとは限らない。');});
  caption(T('Fictional geography and requests. No real operational route or risk score. What would you ask local colleagues next?','地形も依頼も架空。実際の経路やリスク評価ではありません。次に、地域の同僚に何を聞く？'));return true;
 }
 if(key==='family'){
  title(T('Two lives. One posting.','一つの赴任先。二つの暮らし。'));const row=el('div');row.className='family-windows';el('div',T('FIELD\nAnother working day','赴任先\n今日も仕事'),row);el('div',T('HOME\nAnother birthday','家\nまた一つ、誕生日'),row);const detail=el('p',T('An allowance can cover some costs. Can it give back an evening together?','手当で補える費用はある。一緒に過ごす夜は、戻ってくる？'));detail.className='scene-detail';caption(T('Illustration of separation, not a claim that all field staff have this experience. Non-family status depends on the duty station.','別居の負担を考える図。すべての職員が同じ経験をするわけではありません。帯同の可否は勤務地によります。'));return true;
 }
 if(key==='relationships'){
  const mark=el('div','?%');mark.className='scene-number';title(T('A striking number is not automatically evidence.','驚く数字が、根拠になるとは限らない。'));const detail=el('p',T('Ask what was measured.','何を測った数字なのか。'));detail.className='scene-detail';const row=el('div');row.className='mission-chain';[['Who?',T('Which agency, which staff, which sample?','どの機関、どの職員、どんな標本？')],['When?',T('Over one year, or across a whole lifetime?','1年間？それとも、それまでの人生全体？')],['Compared with?',T('A comparable population—and evidence before claiming a cause.','比較できる集団は？原因と結びつける前に根拠は？')]].forEach(([a,b])=>button(a,()=>detail.textContent=b,row));caption(T('No verified UN-wide divorce percentage is displayed. The source documents family-separation hardship, not a divorce rate.','確認できた国連全体の離婚率は掲載していません。出典が裏づけるのは、家族との別居の負担です。'));return true;
 }
 title(T('Ask for a moment, not a job title.','肩書きではなく、一つの場面を聞こう。'));const row=el('div');row.className='mission-chain';[T('A decision you changed','判断を変えた場面'),T('A person you learned from','誰かに教わったこと'),T('A trade-off you still think about','今も考える、難しい選択')].forEach(x=>button(x,()=>{detail.textContent=T('Follow up: What happened next? What would you do differently?','続けて聞こう。その後どうなった？今ならどうする？');},row));const detail=el('p',T('Choose a starting point for next week’s conversation.','来週の対話の、出発点を選ぼう。'));detail.className='scene-detail';return true;
};
