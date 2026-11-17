window.drawUNVoteComparison=function(host){
 const T=(en,ja)=>document.documentElement.lang==='ja'?ja:en;
 const E=(tag,text,parent=host)=>{const e=document.createElement(tag);if(text)e.textContent=text;parent.append(e);return e;};
 host.classList.add('vote-comparison');
 const grid=E('div');grid.className='vote-rooms';
 const votes=[
  {title:T('Security Council','安全保障理事会'),date:'25 Feb 2022 · S/2022/155',total:15,yes:11,no:1,abstain:3,absent:0,result:T('BLOCKED','不採択'),status:'blocked',note:T('Russia’s veto stopped adoption.','ロシアの拒否権が、採択を止めた。'),power:T('Can make binding decisions','法的拘束力のある決定が可能'),limit:T('Five permanent members can veto substantive decisions.','常任5か国は実質事項に拒否権を持つ。'),details:[T('11 yes votes. A substantive decision needs at least nine yes votes and no permanent-member veto.','11か国が賛成。実質事項には9か国以上の賛成と、常任理事国の拒否権がないことが必要。'),T('Russia voted no. Its permanent seat made this a veto—not just one vote against eleven.','ロシアが反対。常任理事国の反対は、11対1という集計を超えて、拒否権になる。'),T('China, India and the United Arab Emirates abstained. An abstention is not a veto.','中国、インド、UAEが棄権。棄権は拒否権ではない。')]},
  {title:T('General Assembly','国連総会'),date:'2 Mar 2022 · ES-11/1',total:193,yes:141,no:5,abstain:35,absent:12,result:T('ADOPTED','採択'),status:'adopted',note:T('A demand for Russia to withdraw.','ロシア軍の撤退を要求。'),power:T('One state, one vote. No veto.','一国一票。拒否権はない。'),limit:T('This resolution was a recommendation, not a legally binding enforcement order.','この決議は勧告であり、法的拘束力を持つ執行命令ではない。'),details:[T('141 voted yes, including Japan. That is 73.1% of all 193 members—not the percentage used to determine the voting majority.','日本を含む141か国が賛成。全193加盟国の73.1％であり、採択の多数を計算する際の分母とは異なる。'),T('Five voted no: Russia, Belarus, North Korea, Syria and Eritrea. None could veto the Assembly.','反対はロシア、ベラルーシ、北朝鮮、シリア、エリトリアの5か国。総会では拒否権を使えない。'),T('35 abstained, including China and India. Abstentions are excluded from “present and voting” for the majority calculation.','中国とインドを含む35か国が棄権。多数決の計算における「出席し投票する国」から棄権は除かれる。'),T('12 members did not vote: 193 − 141 − 5 − 35 = 12. This is not an abstention.','12加盟国は投票しなかった。193−141−5−35＝12。棄権とは別の区分。')]}
 ];
 votes.forEach(v=>{
  const card=E('article',null,grid);card.className='vote-room '+v.status;
  E('p',v.date,card).className='vote-date';E('h3',v.title,card);
  const hero=E('div',null,card);hero.className='vote-majority';E('strong',(100*v.yes/v.total).toFixed(1)+'%',hero);E('span',T('of all members voted yes','全構成国のうち、賛成'),hero);
  const track=E('div',null,card);track.className='vote-stack';track.setAttribute('aria-label',T('Vote shares of '+v.total+' members',v.total+'か国を分母とする投票割合'));
  const rows=E('div',null,card);rows.className='vote-counts';
  const readout=E('p',v.details[0],card);readout.className='vote-readout';readout.setAttribute('aria-live','polite');
  const names=[T('In favour','賛成'),T('Against','反対'),T('Abstained','棄権'),T('Did not vote','投票せず')];
  [v.yes,v.no,v.abstain,v.absent].forEach((value,i)=>{
   if(!value)return;
   const segment=E('button',null,track);segment.className='vote-segment vote-category-'+i;segment.style.width=100*value/v.total+'%';segment.setAttribute('aria-label',names[i]+' '+value+' / '+v.total);segment.title=names[i]+' · '+value;
   const row=E('button',null,rows);row.className='vote-count vote-category-'+i;E('span',names[i],row);E('strong',String(value),row);E('small',(100*value/v.total).toFixed(1)+'%',row);
   const select=()=>{readout.textContent=v.details[i];rows.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));row.classList.add('selected');};segment.onclick=select;row.onclick=select;
  });
  const outcome=E('div',null,card);outcome.className='vote-outcome';E('strong',v.result,outcome);E('p',v.note,outcome);
  const powers=E('div',null,card);powers.className='vote-power';E('h4',v.power,powers);E('p',v.limit,powers);
 });
 const bridge=E('p',T('Veto in the Council → emergency special session of the Assembly','安保理の拒否権 → 総会の緊急特別会期'));bridge.className='vote-bridge';
 E('p',T('Bars use each body’s full membership: 15 and 193. They compare shares, not absolute numbers. Select a bar segment or count to explore who voted how.','棒の分母は、それぞれの全構成国（15と193）。人数ではなく割合の比較。棒や数値を選ぶと、投票の内訳を確認できます。')).className='vote-method';
 const takeaway=E('div');takeaway.className='vote-takeaway';E('strong',T('A majority is not the same as enforcement.','多数の支持と、実行させる力は別。'),takeaway);E('p',T('The Charter prohibits aggression. Yet a permanent member can block Council action against itself. The Assembly condemned the invasion and demanded withdrawal, but this vote did not itself compel Russia to withdraw.','憲章は侵略を禁じる。それでも常任理事国は、自国への安保理の対応を止められる。総会は侵攻を非難し撤退を要求したが、この投票自体にロシアを撤退させる強制力はなかった。'),takeaway);
};
