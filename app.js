// Sample data for the private prototype. Replace with Mavee's confirmed menu.
const menu = [
  {id:'cappuccino',name:'Cappuccino',description:'Espresso with steamed milk and a soft foam finish.',price:34,category:'Coffee'},
  {id:'americano',name:'Americano',description:'A smooth, longer black coffee.',price:29,category:'Coffee'},
  {id:'latte',name:'Café latte',description:'Espresso with plenty of silky steamed milk.',price:38,category:'Coffee'},
  {id:'tea',name:'Tea',description:'A comforting cup, served hot.',price:25,category:'Drinks'},
  {id:'juice',name:'Fruit juice',description:'A chilled refreshment for your break.',price:32,category:'Drinks'},
  {id:'chicken',name:'Toasted chicken sandwich',description:'A warm, satisfying lunchtime favourite.',price:68,category:'Food'},
  {id:'cheese',name:'Toasted cheese sandwich',description:'Golden toasted bread with melted cheese.',price:48,category:'Food'},
  {id:'muffin',name:'Fresh muffin',description:'A little something to go with your coffee.',price:35,category:'Food'}
];
const WHATSAPP_NUMBER = '27622005401'; // Mavee's business WhatsApp, international format, digits only. Not yet verified.
const NAMED_BLOCKS = []; // Blocks known by a name instead of a number, e.g. ['Reception building']. Numbers are always accepted.
const cart = new Map();
let category='All';
let fulfilment='delivery';
let orderText='';
let orderRef='';
let orderPlaced=false;
const STEPS=['menu','details','review'];
function setStep(step,updateHash=true){
  document.body.dataset.step=step;
  if(updateHash){const hash=step==='menu'?'':'#'+step;if(location.hash!==hash){if(hash)location.hash=hash;else history.pushState('', '', location.pathname+location.search);}}
  if(step!=='review')window.scrollTo({top:0});
}
function stepFromHash(){const s=location.hash.slice(1);if(s==='sent'&&orderPlaced)return 'sent';if((s==='review'||s==='sent')&&orderText)return 'review';return s==='details'||(s==='review'&&cart.size)?'details':'menu';}
window.addEventListener('hashchange',()=>{const s=stepFromHash();if(s!==document.body.dataset.step)setStep(s,false);});
window.addEventListener('popstate',()=>{const s=stepFromHash();if(s!==document.body.dataset.step)setStep(s,false);});
const $=id=>document.getElementById(id);
const money=n=>'R'+n.toFixed(2);
const subtotal=()=>[...cart].reduce((sum,[id,qty])=>sum+menu.find(item=>item.id===id).price*qty,0);
function renderMenu(){
  $('categories').innerHTML=['All','Coffee','Food','Drinks'].map(c=>`<button type="button" data-category="${c}" class="${category===c?'active':''}" aria-pressed="${category===c}">${c}</button>`).join('');
  $('menuItems').innerHTML=menu.filter(item=>category==='All'||item.category===category).map(item=>`<article class="menu-card"><div><h3>${item.name}</h3><p>${item.description}</p></div><div class="menu-card-bottom"><strong>${money(item.price)}</strong><button class="add-button" type="button" data-add="${item.id}" aria-label="Add ${item.name}">Add +</button></div></article>`).join('');
}
function renderCart(){
  const count=[...cart.values()].reduce((a,b)=>a+b,0);
  $('basketCount').textContent=count;$('cartQty').textContent=count+' '+(count===1?'item':'items');
  $('cartItems').innerHTML=count?[...cart].map(([id,qty])=>{const item=menu.find(i=>i.id===id);return `<div class="cart-line"><div><strong>${item.name}</strong><small>${money(item.price*qty)}</small></div><div class="stepper"><button type="button" data-change="${id}" data-delta="-1" aria-label="Remove one ${item.name}">−</button><span>${qty}</span><button type="button" data-change="${id}" data-delta="1" aria-label="Add one ${item.name}">+</button></div></div>`}).join(''):'<p class="empty-cart">Your basket is empty. Add something from the menu to get started.</p>';
  const total=subtotal();$('subtotal').textContent=money(total);
  $('minimumNote').textContent=fulfilment==='delivery'&&total<30?`Add ${money(30-total)} more for office delivery (R30 minimum order).`:'';
  $('deliveryFields').hidden=fulfilment==='pickup';
  $('stepSummary').textContent=count+' '+(count===1?'item':'items')+' · '+money(total);
  $('nextStep').disabled=!count;
}
function timeOptions(){
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Johannesburg',hour:'2-digit',minute:'2-digit',hour12:false});
  const [hour,minute]=formatter.format(new Date()).split(':').map(Number);
  const current=hour*60+minute;
  let html='<option value="">Choose a time</option>';
  for(let t=480;t<960;t+=30) if(t>=current+30){const label=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;html+=`<option value="${label}">${label}</option>`;}
  $('timeSelect').innerHTML=html;
  if(html==='<option value="">Choose a time</option>') $('timeSelect').innerHTML='<option value="">No delivery or collection times left today</option>';
}
function normalisePhone(raw){const digits=raw.replace(/\D/g,'');const local=digits.length===11&&digits.startsWith('27')?'0'+digits.slice(2):digits;return /^0[678]\d{8}$/.test(local)?local:null;}
function validBlock(raw){const v=raw.trim();return /^\d{1,3}$/.test(v)||NAMED_BLOCKS.some(b=>b.toLowerCase()===v.toLowerCase());}
function blockLabel(raw){const v=raw.trim();return /^\d{1,3}$/.test(v)?'Block '+v:v;}
function newRef(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let ref='MV-';for(let i=0;i<4;i++)ref+=chars[Math.floor(Math.random()*chars.length)];return ref;}
function dateLabel(){return new Intl.DateTimeFormat('en-ZA',{timeZone:'Africa/Johannesburg',weekday:'short',day:'numeric',month:'short'}).format(new Date());}
function whatsappLink(text){return 'https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(text);}
function textValue(form,key){return String(new FormData(form).get(key)||'').trim();}
function createOrderText(form){
  const name=textValue(form,'name'),phone=normalisePhone(textValue(form,'phone'))||textValue(form,'phone'),time=textValue(form,'time');
  const lines=[...cart].map(([id,qty])=>{const item=menu.find(i=>i.id===id);return `${qty} × ${item.name} — ${money(item.price*qty)}`});
  const destination=fulfilment==='delivery'?`Deliver to: ${blockLabel(textValue(form,'block'))}, ${textValue(form,'company')}, ${textValue(form,'floor')}`:'Collection at Mavee';
  const header=orderPlaced?`UPDATED ORDER REQUEST ${orderRef} (replaces my earlier message)`:`MAVEE CAFÉ ORDER REQUEST ${orderRef}`;
  return [header,...lines,'',`Total: ${money(subtotal())}`,`For: ${name}`,`Mobile: ${phone}`,destination,`Preferred time: ${dateLabel()} ${time} (SAST)`,'Payment: on delivery/collection',textValue(form,'note')?`Note: ${textValue(form,'note')}`:'','','This is an order request awaiting your confirmation. Thank you!'].filter((line,i,arr)=>line||arr[i-1]).join('\n');
}
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){cart.set(add.dataset.add,(cart.get(add.dataset.add)||0)+1);renderCart();}
  const change=e.target.closest('[data-change]');if(change){const id=change.dataset.change,next=(cart.get(id)||0)+Number(change.dataset.delta);next?cart.set(id,next):cart.delete(id);renderCart();}
  const tab=e.target.closest('[data-category]');if(tab){category=tab.dataset.category;renderMenu();}
});
document.querySelectorAll('[name=fulfilment]').forEach(input=>input.addEventListener('change',()=>{fulfilment=input.value;renderCart();}));
$('cartJump').addEventListener('click',()=>{setStep('details');$('orderPanel').scrollIntoView({behavior:'smooth'});});
$('nextStep').addEventListener('click',()=>{if(cart.size)setStep('details');});
$('backStep').addEventListener('click',()=>setStep('menu'));
$('orderForm').addEventListener('submit',e=>{
  e.preventDefault();$('formError').textContent='';
  const form=e.currentTarget;
  if(!cart.size){$('formError').textContent='Add at least one item to your order.';return;}
  if(fulfilment==='delivery'&&subtotal()<30){$('formError').textContent='Office delivery requires a minimum order of R30.';return;}
  for(const field of ['name','phone','time',...(fulfilment==='delivery'?['block','company','floor']:[])])if(!textValue(form,field)){$('formError').textContent='Please complete your name, mobile number, preferred time and delivery location.';form.elements[field].focus();return;}
  if(!normalisePhone(textValue(form,'phone'))){$('formError').textContent='Enter a 10-digit South African mobile number, e.g. 071 234 5678.';form.elements.phone.focus();return;}
  if(fulfilment==='delivery'&&!validBlock(textValue(form,'block'))){$('formError').textContent='Enter your block number (digits only), e.g. 3.';form.elements.block.focus();return;}
  const chosenTime=textValue(form,'time');timeOptions();
  if(![...$('timeSelect').options].some(option=>option.value===chosenTime)){$('formError').textContent='That time is no longer available. Please choose another.';return;}
  $('timeSelect').value=chosenTime;
  if(!orderRef)orderRef=newRef();
  orderText=createOrderText(form);$('reviewContent').textContent=orderText;$('copyStatus').textContent='';
  $('placeOrder').href=whatsappLink(orderText);
  setStep('review');$('closeReview').focus();
});
function closeModal(){setStep('details');$('reviewButton').focus();}
$('closeReview').addEventListener('click',closeModal);$('editOrder').addEventListener('click',closeModal);
$('reviewModal').addEventListener('click',e=>{if(e.target===$('reviewModal'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.dataset.step==='review')closeModal()});
$('placeOrder').addEventListener('click',()=>{orderPlaced=true;$('openAgain').href=$('placeOrder').href;$('sentRef').textContent=orderRef;setStep('sent');});
$('changeOrder').addEventListener('click',()=>setStep('details'));
$('newOrder').addEventListener('click',()=>{cart.clear();orderRef='';orderPlaced=false;orderText='';$('orderForm').elements.note.value='';renderCart();setStep('menu');});
$('copyOrder').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(orderText);$('copyStatus').textContent='Order details copied. Paste them into WhatsApp to Mavee; copying has not sent anything.';}catch{$('copyStatus').textContent='Copy failed. You can select the order details above.';}});
setStep(stepFromHash(),false);renderMenu();renderCart();timeOptions();
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{void Promise.resolve(document.modelContext.registerTool({
    name:'add_items_to_order',title:'Add items to Mavee order',
    description:'Add sample menu items to the visible order basket for review.',
    inputSchema:{type:'object',properties:{items:{type:'array',items:{type:'object',properties:{id:{type:'string'},quantity:{type:'integer',minimum:1,maximum:20}},required:['id','quantity'],additionalProperties:false},minItems:1}},required:['items'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      if(!input||!Array.isArray(input.items)||!input.items.length||input.items.some(i=>!menu.some(m=>m.id===i.id)||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>20))throw Error('Choose valid menu item IDs and quantities between 1 and 20.');
      input.items.forEach(i=>cart.set(i.id,(cart.get(i.id)||0)+i.quantity));renderCart();
      return {itemCount:[...cart.values()].reduce((a,b)=>a+b,0),subtotal:subtotal()};
    }
  },{signal:lifecycle.signal})).catch(()=>{});}catch{}
}
