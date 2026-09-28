import assert from 'node:assert/strict';
import worker from './worker.mjs';

const ORIGIN='https://shuffletongue.github.io',PASSWORD='test-secret';
class MemoryDb{
  rows=new Map();
  prepare(sql){let values=[];const statement={bind:(...args)=>{values=args;return statement},run:async()=>{if(sql.startsWith('INSERT OR IGNORE')){const [id,createdAt,student,test,result]=values;if(!this.rows.has(id))this.rows.set(id,{submission_id:id,created_at:createdAt,student,test_id:test,result_json:result})}return {success:true}},all:async()=>({results:[...this.rows.values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,50)})};return statement}
}
const env={DB:new MemoryDb(),ADMIN_PASSWORD:PASSWORD};
const response=(path,options={})=>worker.fetch(new Request(`https://api.example${path}`,{...options,headers:{Origin:ORIGIN,...options.headers}}),env);
function sample(){const submissionId='123e4567-e89b-12d3-a456-426614174000';return {schema:'jiarui-assessment-result/v1',submissionId,test:'Baseline-2026-09',student:'么佳睿',startedAt:'2026-09-28T00:00:00.000Z',finishedAt:'2026-09-28T00:40:00.000Z',durationSeconds:2400,moduleScores:{数学:{right:1,total:1}},responses:Array.from({length:32},(_,i)=>({id:`Q-${i}`,subject:'数学',module:'基础',prompt:'题目',answer:'答案',correct:true,timeSeconds:2.5,changes:0,skipped:false,visits:1}))}}

const options=await response('/api/submissions',{method:'OPTIONS'});assert.equal(options.status,204);
const data=sample(),body=JSON.stringify(data);
const submitted=await response('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body});assert.equal(submitted.status,200);assert.equal((await submitted.json()).received,true);
await response('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body});assert.equal(env.DB.rows.size,1,'stable submission ID must deduplicate retries');
const anonymous=await response('/api/submissions');assert.equal(anonymous.status,401);
const wrong=await response('/api/submissions',{headers:{Authorization:'Bearer wrong'}});assert.equal(wrong.status,401);
const privateResults=await response('/api/submissions',{headers:{Authorization:`Bearer ${PASSWORD}`}});assert.equal(privateResults.status,200,await privateResults.clone().text());assert.equal((await privateResults.json()).submissions[0].result.responses.length,32);
const invalid=await response('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(invalid.status,400);
const foreign=await worker.fetch(new Request('https://api.example/api/submissions',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json'},body}),env);assert.equal(foreign.status,403);
const tooLarge=await response('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(65537)});assert.equal(tooLarge.status,413);
console.log('Backend checks passed: auto-save, deduplication, password gate, origin, validation, and size limit.');
