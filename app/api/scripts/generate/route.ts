import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
type Product = {title:string; image?:string; benefits:string[]; url:string; source:string};
const allowed = ["mercadolivre.com.br","mercadolivre.com","mercadolibre.com","shopee.com.br","shopee.com"];
const hostAllowed = (host:string) => allowed.some(d => host===d || host.endsWith("."+d));
function text(html:string, property:string):string {
 const escaped=property.replace(/[.*+?^$\{\}()|[\]\\]/g,"\\$&");
 const tags=html.match(/<meta\s+[^>]*>/gi)||[];
 for(const tag of tags){if(new RegExp("(?:property|name)=[\"']"+escaped+"[\"']","i").test(tag)){
 const m=tag.match(/content=[\"']([^\"']*)[\"']/i);if(m)return m[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').trim();
 }}return "";
}
function scenes(p:Product){
 const name=p.title.slice(0,90);
 const benefit=p.benefits[0];
 return [
 {title:"O problema",duration:"0–5s",spoken:"Procurando uma opção para facilitar sua rotina?",instruction:"Olhe para a câmera e apresente a situação."},
 {title:"A descoberta",duration:"5–10s",spoken:"Encontrei este produto: "+name+".",instruction:"Mostre o produto ou sua imagem, sem sugerir que já o testou."},
 {title:"O benefício",duration:"10–15s",spoken:benefit?"Segundo a descrição do produto: "+benefit+".":"Confira os detalhes do produto para saber se ele atende ao que você precisa.",instruction:"Mostre apenas características verificadas na descrição."},
 {title:"O convite",duration:"15–20s",spoken:"Veja os detalhes no meu link de afiliado na descrição.",instruction:"Aponte para a descrição e identifique a publicidade."}
 ];
}
export async function POST(request:NextRequest){
 try{
 const body=await request.json() as {url?:unknown;title?:unknown;benefits?:unknown};
 if(typeof body.url!=="string")return NextResponse.json({error:"Informe o link do produto."},{status:400});
 let url:URL;try{url=new URL(body.url);if(url.protocol!=="https:"||!hostAllowed(url.hostname.toLowerCase()))throw Error();}catch{return NextResponse.json({error:"Use um link HTTPS do Mercado Livre ou Shopee."},{status:400});}
 let title=typeof body.title==="string"?body.title.trim().slice(0,140):"";
 let benefits=Array.isArray(body.benefits)?body.benefits.filter((v):v is string=>typeof v==="string").slice(0,3).map(v=>v.trim().slice(0,180)).filter(Boolean):[];
 let image: string|undefined;let source="manual";
 if(!title){
 try{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),4500);
 try{
 const response=await fetch(url.toString(),{signal:controller.signal,redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; AffiliateContentStudio/0.2)"}});
 const final=new URL(response.url);
 if(response.ok&&hostAllowed(final.hostname.toLowerCase())&&(response.headers.get("content-type")||"").includes("text/html")){
 const html=(await response.text()).slice(0,400000);
 title=text(html,"og:title").slice(0,140);
 const rawImage=text(html,"og:image");
 if(rawImage){try{const img=new URL(rawImage,final);if(img.protocol==="https:")image=img.toString();}catch{}}
 const description=text(html,"og:description").slice(0,180);
 if(description)benefits=[description];
 if(title)source="metadata";
 }
 }finally{clearTimeout(timer)}
 }catch{}
 }
 if(!title)return NextResponse.json({needsDetails:true,message:"Não foi possível identificar o produto. Informe o nome e, se quiser, um benefício."});
 const product:Product={title,image,benefits,url:url.toString(),source};
 return NextResponse.json({product,scenes:scenes(product)});
 }catch{return NextResponse.json({error:"Não foi possível gerar o roteiro. Tente novamente."},{status:500});}
}
