const slotsSection=document.querySelector('#slots');
slotsSection.querySelectorAll(':scope > p:not(.section-label),.project-table').forEach(el=>el.remove());
const signup=document.createElement('section');signup.dataset.midtermSlots='';slotsSection.querySelector('h3').before(signup);
document.querySelectorAll('#milestones ol li:first-child strong').forEach(el=>el.textContent=el.closest('.project-ja')?'11月10日：':'November 10:');
document.querySelectorAll('#milestones > p').forEach(el=>el.textContent=el.classList.contains('project-ja')?'日程とテーマは上のフォームから提出してください。発表資料の提出先はYohが案内します。':'Use the form above to submit your slot and topic. Yoh will announce the submission channel for presentation materials.');
