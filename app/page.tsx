"use client";
import {useState} from "react";
type Scene={title:string;duration:string;spoken:string;instruction:string};
type Product={title:string;image?:string;benefits:string[];url:string;source:string};
const demo:Scene[]=[
{title:"O problema",duration:"0–5s",spoken:"Seu café da manhã também começa na correria?",instruction:"Olhe para a câmera, com uma xícara na mão."},
{title:"A descoberta",duration:"5–10s",spoken:"Olha essa cafeteira que eu encontrei!",instruction:"Mostre a cafeteira de frente, com boa iluminação."},
{title:"O benefício",duration:"10–15s",spoken:"Ela pode facilitar a preparação do café no dia a dia.",instruction:"Mostre o café. Não afirme funções que não verificou."},
{title:"O convite",duration:"15–20s",spoken:"Quer conhecer? O link de afiliado está na descrição.",instruction:"Aponte discretamente para a descrição."}
];
function Drawing({index}:{index:number}){return <svg className="drawing" viewBox="0 0 300 160" role="img" aria-label={"Esboço da cena "+(index+1)}><rect x="0" y="0" width="300" height="160" rx="16" fill="#f5f5f7"/><path d="M22 134 H278" stroke="#b9b9c0" strokeWidth="2"/><circle cx="110" cy="46" r="18" stroke="#333" strokeWidth="4" fill="none"/><path d="M110 64 V109 M110 78 L80 95 M110 78 L145 92 M110 109 L90 134 M110 109 L130 134" stroke="#333" strokeWidth="4" strokeLinecap="round" fill="none"/><rect x="178" y="74" width="63" height="58" rx="8" stroke="#6366f1" strokeWidth="3" fill="none"/><path d="M187 74 V61 H231 V74 M190 95 H228 M194 112 H224" stroke="#6366f1" strokeWidth="3" fill="none"/>{index===0?<text x="158" y="34" fontSize="24">☕</text>:index===3?<text x="158" y="34" fontSize="24">✓</text>:<path d="M145 83 L175 83 M165 75 L175 83 L165 91" stroke="#6366f1" strokeWidth="3" fill="none"/>}</svg>}
export default function Home(){
const [step,setStep]=useState(0),[url,setUrl]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false),[needsDetails,setNeedsDetails]=useState(false),[title,setTitle]=useState(""),[benefit,setBenefit]=useState("");
const [scenes,setScenes]=useState<Scene[]>(demo),[product,setProduct]=useState<Product>({title:"Cafeteira elétrica",benefits:[],url:"",source:"demo"});
async function generate(manual=false){
setError("");setLoading(true);
try{
const res=await fetch("/api/scripts/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,...(manual?{title,benefits:benefit?[benefit]:[]}:{})})});
const data=await res.json();
if(!res.ok)throw Error(data.error||"Não foi possível gerar o roteiro.");
if(data.needsDetails){setNeedsDetails(true);return;}
setProduct(data.product);setScenes(data.scenes);setNeedsDetails(false);setStep(1);
}catch(e){setError(e instanceof Error?e.message:"Erro inesperado.");}finally{setLoading(false)}
}
return <main><div className="eyebrow">Affiliate Content Studio · Protótipo</div><h1>Seu próximo vídeo começa aqui.</h1><p>Um produto. Um roteiro simples. Um guia visual para gravar com seu celular.</p><div className="step">Etapa {step+1} de 3</div>
{step===0&&<section className="panel"><h2>Qual produto você quer divulgar?</h2><p>Cole o link do Mercado Livre ou Shopee, ou experimente a demonstração.</p><input aria-label="Link do produto" placeholder="https://..." value={url} onChange={e=>{setUrl(e.target.value);setNeedsDetails(false)}}/>{needsDetails&&<div><p>Não conseguimos identificar o produto automaticamente.</p><input aria-label="Nome do produto" placeholder="Nome do produto" value={title} onChange={e=>setTitle(e.target.value)}/><input aria-label="Benefício do produto" placeholder="Benefício (opcional)" value={benefit} onChange={e=>setBenefit(e.target.value)}/></div>}{error&&<p role="alert">{error}</p>}<button disabled={loading||!url.trim()||(needsDetails&&!title.trim())} onClick={()=>generate(needsDetails)}>{loading?"Preparando roteiro...":needsDetails?"Continuar com estes dados":"Criar meu roteiro"}</button><button className="secondary" onClick={()=>{setProduct({title:"Cafeteira elétrica",benefits:[],url:"",source:"demo"});setScenes(demo);setStep(1);setError("")}}>Testar com uma cafeteira ☕</button><p className="note">As informações disponíveis variam por loja. Nunca inventamos benefícios do produto.</p></section>}
{step===1&&<section className="panel"><span className="tag">{product.source==="demo"?"Demonstração":product.source==="manual"?"Dados informados":"Dados da página do produto"}</span><div className="product">📦</div><h2>Seu roteiro de 20 segundos</h2><p>{product.title} · 4 cenas · formato Reels</p>{scenes.map((s,i)=><div className="scene" key={i}><small>Cena {i+1} · {s.duration}</small><strong>{s.title}</strong><div>“{s.spoken}”</div></div>)}<button onClick={()=>setStep(2)}>Ver como gravar</button><button className="secondary" onClick={()=>setStep(0)}>Voltar</button></section>}
{step===2&&<section className="panel"><h2>Seu storyboard</h2><p>Use estes desenhos como guia. Não precisa reproduzir exatamente.</p>{scenes.map((s,i)=><div className="scene" key={i}><small>Cena {i+1} · {s.duration}</small><Drawing index={i}/><strong>{s.title}</strong><p>“{s.spoken}”</p><div className="tag">Como gravar</div><p>{s.instruction}</p></div>)}<button onClick={()=>setStep(0)}>Criar outro roteiro</button><button className="secondary" onClick={()=>setStep(1)}>Voltar ao roteiro</button><p className="note">Identifique publicidade e informe que o link é de afiliado.</p></section>}
</main>}
