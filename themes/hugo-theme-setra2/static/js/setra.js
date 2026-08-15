(()=>{"use strict";
const one=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=one(".menu-toggle"),nav=one("#main-nav");
if(menu&&nav)menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",open);nav.classList.toggle("open",open)});
const dialog=one("#search-dialog"),globalInput=one("#global-search");
const openSearch=()=>{if(!dialog)return;dialog.showModal();setTimeout(()=>globalInput&&globalInput.focus(),0)};
all("[data-search-open]").forEach(b=>b.addEventListener("click",openSearch));
document.addEventListener("keydown",e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);if(((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k")||(e.key==="/"&&!typing)){e.preventDefault();openSearch()}});
all("[data-print]").forEach(b=>b.addEventListener("click",()=>print()));

all(".js-accordion").forEach(root=>{const headings=all(":scope > h3",root);if(!headings.length)return;root.classList.add("enhanced");headings.forEach(h=>{const details=document.createElement("details"),summary=document.createElement("summary"),body=document.createElement("div");details.className="accordion-item";body.className="accordion-body";summary.textContent=h.textContent;details.append(summary,body);root.insertBefore(details,h);let node=h.nextSibling;h.remove();while(node&&node.nodeName!=="H3"){const next=node.nextSibling;body.append(node);node=next}})});

const projectFilters=one("[data-project-filters]");
if(projectFilters)all("button",projectFilters).forEach(button=>button.addEventListener("click",()=>{all("button",projectFilters).forEach(b=>b.classList.toggle("active",b===button));const value=button.dataset.filter;all(".project-grid [data-status]").forEach(card=>card.hidden=value!=="alle"&&card.dataset.status!==value)}));

const searchPage=one("[data-search-page]");
if(!searchPage)return;
const input=one("#page-query"),count=one(".result-count"),results=one(".search-results"),filters=one("[data-search-filters]");
const params=new URLSearchParams(location.search);input.value=params.get("q")||"";let active=params.get("filter")||"alt",docs=[];
const esc=s=>String(s||"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").toLocaleLowerCase("nb").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const excerpt=(text,query)=>{text=String(text||"").replace(/\s+/g," ").trim();const i=norm(text).indexOf(norm(query)),start=Math.max(0,(i<0?0:i)-70),end=Math.min(text.length,(i<0?0:i)+query.length+110),before=(start?"…":"")+text.slice(start,i<0?end:i),hit=i<0?"":text.slice(i,i+query.length),after=i<0?"":text.slice(i+query.length,end)+(end<text.length?"…":"");return esc(before)+(hit?`<mark>${esc(hit)}</mark>${esc(after)}`:"")};
function render(){const query=input.value.trim(),terms=norm(query).split(/\s+/).filter(Boolean);let found=docs.filter(d=>{if(active!=="alt"&&(active==="dokumenter"?d.type!=="document":d.section!==active))return false;if(!terms.length)return active==="dokumenter";const hay=norm(`${d.title} ${d.description} ${d.content} ${d.path}`);return terms.every(t=>hay.includes(t))}).sort((a,b)=>{const score=d=>(norm(d.title).includes(norm(query))?5:0)+(norm(d.description).includes(norm(query))?2:0);return score(b)-score(a)}).slice(0,60);count.textContent=query?`${found.length} treff på «${query}»`:active==="dokumenter"?`${found.length} dokumenter`:"Skriv inn det du leter etter.";results.innerHTML=found.map(d=>`<a class="search-result" href="${esc(d.uri)}"><small>${esc(d.path||d.section)}</small><h2>${esc(d.title)}</h2><p>${excerpt(d.description||d.content,query)}</p></a>`).join("")}
all("button",filters).forEach(b=>{b.classList.toggle("active",b.dataset.filter===active);b.addEventListener("click",()=>{active=b.dataset.filter;all("button",filters).forEach(x=>x.classList.toggle("active",x===b));render()})});
input.addEventListener("input",render);
fetch("/lunr-index.json").then(r=>{if(!r.ok)throw Error();return r.json()}).catch(()=>fetch("/index.json").then(r=>r.json())).then(data=>{docs=Array.isArray(data)?data:data.meta||[];render()}).catch(()=>{count.textContent="Søket kunne ikke lastes. Prøv igjen senere."});
})();
