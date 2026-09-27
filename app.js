const Q=[
 ['M-NUM-01','数学','整数与运算','计算：48 ÷ 6 × 3 = ?',['6','8','24','144'],2],
 ['M-NUM-02','数学','整数与运算','一个数的 3 倍是 27，这个数是？',['6','9','24','81'],1],
 ['M-DEC-01','数学','小数与百分数','计算：2.5 + 0.75 = ?',['2.80','3.25','3.75','7.5'],1],
 ['M-PCT-01','数学','小数与百分数','80 的 25% 是多少？',['20','25','32','55'],0],
 ['M-FRAC-01','数学','分数','计算：1/2 + 1/3 = ?',['2/5','2/6','5/6','1'],2],
 ['M-FRAC-02','数学','分数','计算：3/4 ÷ 1/2 = ?',['3/8','2/3','3/2','2'],2],
 ['M-NEG-01','数学','有理数','计算：-3 + 7 = ?',['-10','-4','4','10'],2],
 ['M-NEG-02','数学','有理数','计算：(-2) × (-5) = ?',['-10','-7','7','10'],3],
 ['M-ALG-01','数学','代数式','化简：3x + 2x - 4 = ?',['5x - 4','5x + 4','6x - 4','5x'],0],
 ['M-ALG-02','数学','代数式','当 x = -2 时，x² + 3x 的值是？',['-10','-2','2','10'],1],
 ['M-EQN-01','数学','方程','解方程：3x + 5 = 20',['x = 3','x = 5','x = 15','x = 25/3'],1],
 ['M-EQN-02','数学','方程','解方程：2(x - 1) = x + 4',['x = 2','x = 4','x = 6','x = 8'],2],
 ['M-POW-01','数学','幂与根式','计算：2³ × 2² = ?',['2⁵','4⁵','2⁶','4⁶'],0],
 ['M-ROOT-01','数学','幂与根式','√49 的算术平方根是？',['-7','7','±7','49'],1],
 ['M-FUNC-01','数学','函数前备','函数 y = 2x - 1 中，当 x = 3 时，y = ?',['3','5','6','7'],1],
 ['M-FUNC-02','数学','函数前备','一次函数 y = -2x + 3 的图像随 x 增大而？',['上升','下降','先升后降','无法判断'],1],
 ['E-VOC-01','英语','基础词汇','Choose the closest meaning of “improve”.',['变得更好','记住','比较','完成'],0],
 ['E-VOC-02','英语','基础词汇','She was tired, ___ she finished the work.',['because','but','or','if'],1],
 ['E-BE-01','英语','句子骨架','My parents ___ both teachers.',['am','is','are','be'],2],
 ['E-SENT-01','英语','句子骨架','Which is a complete sentence?',['Because it rained.','The boy in the room.','She opened the window.','Very beautiful flowers.'],2],
 ['E-TENSE-01','英语','时态','I ___ to school by bus every day.',['go','went','am going','have gone'],0],
 ['E-TENSE-02','英语','时态','They ___ the museum last Sunday.',['visit','visited','will visit','are visiting'],1],
 ['E-TENSE-03','英语','时态','Look! The baby ___.',['sleeps','slept','is sleeping','has slept'],2],
 ['E-TENSE-04','英语','时态','I ___ this book twice.',['read','am reading','have read','will read'],2],
 ['E-AGR-01','英语','语法关系','The news ___ very important.',['are','were','is','have'],2],
 ['E-NONFINITE-01','英语','非谓语基础','She decided ___ early.',['leave','to leave','leaving','left'],1],
 ['E-CLAUSE-01','英语','从句基础','The book ___ I bought yesterday is useful.',['who','where','that','when'],2],
 ['E-CLAUSE-02','英语','从句基础','I don’t know ___ he will come.',['whether','which','what','whose'],0],
 ['E-READ-01','英语','阅读理解','“Tom missed the bus, so he walked to work.” Why did Tom walk?',['He liked walking.','He missed the bus.','He had no job.','The bus was early.'],1],
 ['E-READ-02','英语','阅读理解','“The library closes at 6 p.m. on weekdays and at 4 p.m. on Saturdays.” When does it close on Saturday?',['4 p.m.','5 p.m.','6 p.m.','7 p.m.'],0],
 ['E-READ-03','英语','阅读理解','“Although the task was difficult, Mei kept trying and finally solved it.” What can we infer?',['Mei gave up.','The task was easy.','Mei was persistent.','Mei asked no questions.'],2],
 ['E-READ-04','英语','阅读理解','“Online courses are flexible, but learners must manage their own time.” What is the main idea?',['Online courses are always easy.','Flexibility requires self-management.','Learners need more teachers.','Time is not important.'],1]
];
const TREE={math:[['整数与运算'],['小数与百分数','分数'],['有理数'],['代数式','方程','幂与根式'],['函数前备'],['极限','导数','积分']],english:[['基础词汇'],['句子骨架'],['时态','语法关系'],['非谓语基础','从句基础'],['阅读理解'],['专升本综合运用']]};
const $=s=>document.querySelector(s), key='jiarui-assessment-v1';
let state={i:0,started:null,finished:null,student:'',testId:'',answers:{},visits:{}},entered=0;
function save(){localStorage.setItem(key,JSON.stringify(state))}
function start(){state.student=$('#student').value.trim()||'未填写';state.testId=$('#testId').value.trim()||'Baseline-2026-09';state.started=state.started||new Date().toISOString();save();$('#intro').classList.add('hidden');$('#quiz').classList.remove('hidden');show()}
function show(){const q=Q[state.i],a=state.answers[q[0]]||{};entered=Date.now();state.visits[q[0]]=(state.visits[q[0]]||0)+1;$('#sectionName').textContent=q[1]+' · '+q[2];$('#counter').textContent=`${state.i+1} / ${Q.length}`;$('#bar').style.width=((state.i+1)/Q.length*100)+'%';$('#qType').textContent=q[1]==='数学'?'MATHEMATICS':'ENGLISH';$('#prompt').textContent=q[3];$('#options').innerHTML=q[4].map((x,j)=>`<label class="choice"><input type="radio" name="answer" value="${j}" ${a.value===j?'checked':''}><span>${String.fromCharCode(65+j)}. ${x}</span></label>`).join('');$('#hint').textContent=a.skipped?'此题已标记为跳过，可重新选择答案。':'';$('#prev').disabled=state.i===0;$('#next').textContent=state.i===Q.length-1?'完成测试':'下一题 →';document.querySelectorAll('[name=answer]').forEach(x=>x.onchange=()=>answer(+x.value))}
function recordTime(){const id=Q[state.i][0],a=state.answers[id]||{};a.timeMs=(a.timeMs||0)+(Date.now()-entered);state.answers[id]=a}
function answer(v){const id=Q[state.i][0],a=state.answers[id]||{};if(a.value!==undefined&&a.value!==v)a.changes=(a.changes||0)+1;a.value=v;a.skipped=false;state.answers[id]=a;$('#hint').textContent='';save()}
function move(d){recordTime();if(d>0&&state.answers[Q[state.i][0]]?.value===undefined)state.answers[Q[state.i][0]]={...state.answers[Q[state.i][0]],skipped:true};if(state.i===Q.length-1&&d>0)return finish();state.i=Math.max(0,Math.min(Q.length-1,state.i+d));save();show()}
function skip(){const id=Q[state.i][0];state.answers[id]={...state.answers[id],value:undefined,skipped:true};move(1)}
function score(){const groups={};Q.forEach(q=>{const g=q[2],a=state.answers[q[0]]||{},ok=a.value===q[5];groups[g]??={right:0,total:0};groups[g].total++;groups[g].right+=ok?1:0});return groups}
function finish(){state.finished=state.finished||new Date().toISOString();save();$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');const g=score(),correct=Object.values(g).reduce((n,x)=>n+x.right,0);$('#summary').textContent=`共答对 ${correct} / ${Q.length} 题。分数只作参考，模块表现和每题过程数据将用于确定下一轮精测范围。`;$('#modules').innerHTML=Object.entries(g).map(([k,v])=>`<div class="module"><b>${k}</b><span>${v.right} / ${v.total} 正确</span></div>`).join('')}
function payload(){const g=score();return {schema:'jiarui-assessment-result/v1',test:state.testId,student:state.student,startedAt:state.started,finishedAt:state.finished,durationSeconds:Math.round((new Date(state.finished)-new Date(state.started))/1000),basis:{jurisdiction:'山东普通专升本',reference:'山东省教育招生考试院 2026年公共基础课考试要求',purpose:'前备知识广度筛查，不等同于正式模拟考试'},prerequisiteTree:TREE,moduleScores:g,responses:Q.map(q=>{const a=state.answers[q[0]]||{};return {id:q[0],subject:q[1],module:q[2],answer:a.value===undefined?null:q[4][a.value],correct:a.value===q[5],timeSeconds:+((a.timeMs||0)/1000).toFixed(1),changes:a.changes||0,skipped:!!a.skipped,visits:state.visits[q[0]]||0}})}}
function download(){const blob=new Blob([JSON.stringify(payload(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${state.testId}-${state.student}-result.json`;a.click();URL.revokeObjectURL(a.href)}
$('#start').onclick=start;$('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);$('#skip').onclick=skip;$('#download').onclick=download;$('#restart').onclick=()=>{localStorage.removeItem(key);location.reload()};
setInterval(()=>{$('#clock').textContent=state.started&&!state.finished?'测试进行中 · '+Math.floor((Date.now()-new Date(state.started))/60000)+' 分钟':state.finished?'已完成':'未开始'},1000);
const old=localStorage.getItem(key);if(old){try{state=JSON.parse(old);if(state.finished)finish();else if(state.started){$('#intro').classList.add('hidden');$('#quiz').classList.remove('hidden');show()}}catch{localStorage.removeItem(key)}}
