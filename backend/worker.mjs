const ALLOWED_ORIGINS=new Set(['https://shuffletongue.github.io']);
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};

function json(data,status=200,origin=''){
  const headers=new Headers(JSON_HEADERS);
  if(origin&&ALLOWED_ORIGINS.has(origin)){
    headers.set('Access-Control-Allow-Origin',origin);
    headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers','Authorization, Content-Type');
    headers.set('Vary','Origin');
  }
  return new Response(JSON.stringify(data),{status,headers});
}

function validResult(x){
  return x&&x.schema==='jiarui-assessment-result/v1'
    &&typeof x.submissionId==='string'&&/^[0-9a-f-]{36}$/i.test(x.submissionId)
    &&typeof x.student==='string'&&x.student.length<=100
    &&typeof x.test==='string'&&x.test.length<=100
    &&Number.isFinite(Date.parse(x.startedAt))&&Number.isFinite(Date.parse(x.finishedAt))
    &&Number.isFinite(x.durationSeconds)&&x.durationSeconds>=0
    &&x.moduleScores&&typeof x.moduleScores==='object'
    &&Array.isArray(x.responses)&&x.responses.length===32
    &&x.responses.every(r=>r&&typeof r.id==='string'&&r.id.length<=50
      &&typeof r.subject==='string'&&typeof r.module==='string'
      &&typeof r.prompt==='string'&&r.prompt.length<=1000
      &&(r.answer===null||typeof r.answer==='string')&&typeof r.correct==='boolean'
      &&Number.isFinite(r.timeSeconds)&&r.timeSeconds>=0
      &&Number.isSafeInteger(r.changes)&&r.changes>=0
      &&typeof r.skipped==='boolean'&&Number.isSafeInteger(r.visits)&&r.visits>=0);
}

async function readLimitedBody(request,maxBytes){
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks=[];let size=0;
  while(true){
    const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;if(size>maxBytes){await reader.cancel();return null}chunks.push(value);
  }
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  return new TextDecoder().decode(bytes);
}

async function passwordMatches(actual,expected){
  if(!expected||!actual)return false;
  const encode=new TextEncoder();
  const [a,b]=await Promise.all([encode.encode(actual),encode.encode(expected)].map(x=>crypto.subtle.digest('SHA-256',x)));
  const left=new Uint8Array(a),right=new Uint8Array(b);let diff=0;
  for(let i=0;i<left.length;i++)diff|=left[i]^right[i];
  return diff===0;
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(request.method==='OPTIONS'){
      if(!ALLOWED_ORIGINS.has(origin))return json({error:'origin not allowed'},403);
      const headers=new Headers();headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');headers.set('Access-Control-Allow-Headers','Authorization, Content-Type');headers.set('Vary','Origin');
      return new Response(null,{status:204,headers});
    }
    if(!ALLOWED_ORIGINS.has(origin))return json({error:'origin not allowed'},403);
    if(!env.DB)return json({error:'storage is not configured'},503,origin);

    if(url.pathname==='/api/submissions'&&request.method==='POST'){
      const length=Number(request.headers.get('Content-Length')||0);if(length>65536)return json({error:'submission too large'},413,origin);
      let raw;try{raw=await readLimitedBody(request,65536)}catch{return json({error:'invalid request body'},400,origin)}
      if(raw===null)return json({error:'submission too large'},413,origin);
      let result;try{result=JSON.parse(raw)}catch{return json({error:'invalid JSON'},400,origin)}
      if(!validResult(result))return json({error:'invalid assessment result'},400,origin);
      try{
        await env.DB.prepare('INSERT OR IGNORE INTO submissions (submission_id, created_at, student, test_id, result_json) VALUES (?, ?, ?, ?, ?)')
          .bind(result.submissionId,new Date().toISOString(),result.student,result.test,JSON.stringify(result)).run();
        return json({received:true,submissionId:result.submissionId},200,origin);
      }catch{return json({error:'storage unavailable'},503,origin)}
    }

    if(url.pathname==='/api/submissions'&&request.method==='GET'){
      const authorization=request.headers.get('Authorization')||'',supplied=authorization.startsWith('Bearer ')?authorization.slice(7):'';
      if(!await passwordMatches(supplied,env.ADMIN_PASSWORD))return json({error:'unauthorized'},401,origin);
      try{
        const {results=[]}=await env.DB.prepare('SELECT submission_id, created_at, result_json FROM submissions ORDER BY created_at DESC LIMIT 50').all();
        const submissions=results.map(row=>({submissionId:row.submission_id,createdAt:row.created_at,result:JSON.parse(row.result_json)}));
        return json({submissions},200,origin);
      }catch{return json({error:'storage unavailable'},503,origin)}
    }
    return json({error:'not found'},404,origin);
  }
};
