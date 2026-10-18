(() => {
'use strict';
const CATS = ['breakfast','lunch','dinner','snack'];
const LABELS = {breakfast:'Завтрак',lunch:'Обед',dinner:'Ужин',snack:'Перекус'};
const PLURALS = {breakfast:'Завтраки',lunch:'Обеды',dinner:'Ужины',snack:'Перекусы'};
const DAYS = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const TARGETS = {breakfast:400,lunch:500,dinner:500,snack:200};
const KEY = 'porcia.planner.v1';
const recipes = window.RECIPES;
const foods = window.FOODS;
const byId = Object.fromEntries(recipes.map(r => [r.id,r]));
const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number.isInteger(n) ? String(n) : n.toLocaleString('ru-RU',{maximumFractionDigits:1});
const ICONS = {
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 heart:'<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>',
 basket:'<path d="m8 3-4 7m12-7 4 7M3 10h18l-2 11H5L3 10Zm6 4v3m6-3v3"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h.01m4 0h.01m4 0h.01"/>',
 shuffle:'<path d="m18 3 3 3-3 3m0 6 3 3-3 3M3 6h3c5 0 7 12 12 12h3M3 18h3c2 0 4-2 5-4m2-4c1-2 3-4 5-4h3"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.plus}</svg>`;
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
function blankDay(){return Object.fromEntries(CATS.map(c=>[c,null]));}
function initialState(){return {version:1,week:Array.from({length:7},(_,i)=>i===0?Object.fromEntries(CATS.map(c=>[c,`${c}-1`])):blankDay()),favorites:[],checked:{},mode:'portions',avoid:[],pantry:[],pantryEnabled:true,pantryStrict:false,day:0};}
function validWeek(week){return Array.isArray(week)&&week.length===7&&week.every(day=>day&&typeof day==='object'&&CATS.every(c=>day[c]===null||(typeof day[c]==='string'&&byId[day[c]]?.category===c)));}
function sanitize(raw){
 if(!raw||raw.version!==1||!validWeek(raw.week)) throw Error('Некорректный файл меню');
 return {version:1,week:raw.week.map(d=>Object.fromEntries(CATS.map(c=>[c,d[c]]))),favorites:Array.isArray(raw.favorites)?[...new Set(raw.favorites.filter(id=>typeof id==='string'&&byId[id]))]:[],checked:raw.checked&&typeof raw.checked==='object'&&!Array.isArray(raw.checked)?Object.fromEntries(Object.entries(raw.checked).filter(([k,v])=>typeof k==='string'&&v===true).slice(-2000)): {},mode:'portions',avoid:Array.isArray(raw.avoid)?[...new Set(raw.avoid.filter(k=>['dairy','legumes','cabbage','onion','nuts'].includes(k)))]:[],pantry:Array.isArray(raw.pantry)?[...new Set(raw.pantry.filter(id=>typeof id==='string'&&foods[id]))]:[],pantryEnabled:raw.pantryEnabled!==false,pantryStrict:raw.pantryStrict===true,day:Number.isInteger(raw.day)&&raw.day>=0&&raw.day<7?raw.day:0};
}
let state=initialState(),storageWorks=true,restoreFailed=false;
try{const raw=localStorage.getItem(KEY);if(raw)state=sanitize(JSON.parse(raw));}catch(e){restoreFailed=true;}
let category='breakfast',filter='all',method='all',pantryQuery='',query='',view='library',activeRecipe=null,servings=1,shopScope='day',lastFocus=null,toastTimer;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageWorks=true;}catch(e){storageWorks=false;}$('#save-note').innerHTML=icon(storageWorks?'check':'help')+(storageWorks?'Сохраняется в этом браузере':'Сохранение недоступно — скачай файл плана');}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function photoStyle(r){return `background-image:url('assets/${r.id}.jpg?v=home80');`;}
function photo(r,extra=''){return `<div class="dish-photo ${extra}" style="${photoStyle(r)}" role="img" aria-label="${esc(r.name)} — иллюстрация"></div>`;}
function amountText(i,multiplier=1){if(i.food==='egg')return `${fmt(i.amount*multiplier/50)} шт.`;return `${fmt(i.amount*multiplier)} ${foods[i.food].unit}`;}
function ingredientSummary(r){return r.ingredients.map(i=>`${foods[i.food].name.replace(' сухой','').replace(' сухая','').replace(' сухое','').replace(', без жидкости','')}: ${state.mode==='grams'?amountText(i):i.portion}`).join(' · ');}
function renderTabs(){
 $('#category-tabs').innerHTML=CATS.map(c=>`<button data-category="${c}" aria-pressed="${category===c}">${PLURALS[c]} <small>${recipes.filter(r=>r.category===c).length}</small></button>`).join('');
 $('#portions-mode')?.setAttribute('aria-pressed',state.mode==='portions');$('#grams-mode')?.setAttribute('aria-pressed',state.mode==='grams');
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===filter));
}
const AVOID_GROUPS={dairy:{label:'Без молочных продуктов',foods:['milk','kefir','yogurt','curd','cheese','creamcheese','brynza']},legumes:{label:'Без бобовых',foods:['beans','lentil','peas','splitpea','greenbeans']},cabbage:{label:'Без капусты',foods:['cabbage','broccoli','cauliflower']},onion:{label:'Без лука',foods:['onion']},nuts:{label:'Без орехов и арахиса',foods:['almond','walnut','peanut']}};
function allowedRecipe(r){return !state.avoid.some(k=>r.ingredients.some(i=>AVOID_GROUPS[k].foods.includes(i.food)));}
function renderAvoid(){ $('#avoid-options').innerHTML=Object.entries(AVOID_GROUPS).map(([k,g])=>`<label class="pantry-option"><input type="checkbox" data-avoid="${k}" ${state.avoid.includes(k)?'checked':''}><span>${g.label}</span></label>`).join('');$('#avoid-summary').textContent=state.avoid.length?`включено: ${state.avoid.length}`:'';}
function toleranceNotes(r){
 const ids=r.ingredients.map(i=>i.food),has=a=>a.some(k=>ids.includes(k));let notes=[];
 if(has(['milk','kefir','yogurt','curd','creamcheese','cheese','brynza']))notes.push('Есть молочные продукты. Если лактоза вызывает симптомы, выбирай подходящий безлактозный аналог; переносимость разных продуктов отличается.');
 if(has(['beans','lentil','peas','splitpea']))notes.push('Бобовые у некоторых вызывают газообразование. Ориентируйся на привычную переносимую порцию; консервированные слей и промой, сухие готовь до мягкости.');
 if(has(['cabbage','broccoli','cauliflower']))notes.push('Капуста может усиливать газообразование. Если замечал такую реакцию, выбери другое блюдо через фильтр «Без капусты».');
 if(has(['apple','pear','peach','prune','apricot','raisin','dates']))notes.push('Фрукты и сухофрукты подходят не всем одинаково. Соблюдай указанную порцию и учитывай свою реакцию.');
 notes.push('Сочетание продуктов не гарантирует отсутствие дискомфорта. Ешь не спеша и ориентируйся на свою переносимость.');
 return `<details class="recipe-tolerance"><summary>О переносимости этого блюда</summary><ul>${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><a href="https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/eating-diet-nutrition" target="_blank" rel="noopener noreferrer">Как питание влияет на пищеварение · NIDDK</a></details>`;
}
const METHOD_LABELS={'pan':'Одна сковорода','no-oven':'Без духовки','no-cook':'Без готовки','few-dishes':'Минимум посуды','oven':'В духовке'};
function pantryActive(){return state.pantryEnabled&&state.pantry.length>0;}
function pantryMatch(r){const missing=r.ingredients.filter(i=>!state.pantry.includes(i.food));return {missing,have:r.ingredients.length-missing.length,total:r.ingredients.length};}
function pantryCaption(r){if(!pantryActive())return '';const m=pantryMatch(r);return `<div class="pantry-match ${m.missing.length?'':'complete'}"><strong>${m.missing.length?`Есть ${m.have} из ${m.total} продуктов`:'Всё есть дома'}</strong>${m.missing.length?`<span>Докупить: ${esc(m.missing.map(i=>foods[i.food].name).join(', '))}</span>`:'<span>Проверь, хватит ли на нужное число порций.</span>'}</div>`;}
function renderPantryProducts(){
 const used=new Set(recipes.flatMap(r=>r.ingredients.map(i=>i.food)));
 const list=Object.entries(foods).filter(([id,f])=>used.has(id)&&(!pantryQuery||f.name.toLocaleLowerCase('ru').includes(pantryQuery))).sort((a,b)=>a[1].group.localeCompare(b[1].group,'ru')||a[1].name.localeCompare(b[1].name,'ru'));
 let group='';$('#pantry-products').innerHTML=list.length?list.map(([id,f])=>{const heading=group!==f.group?`${group?'</div></fieldset>':''}<fieldset><legend>${esc(f.group)}</legend><div class="pantry-options">`:'';group=f.group;return heading+`<label class="pantry-option"><input type="checkbox" data-pantry-food="${id}" ${state.pantry.includes(id)?'checked':''}><span>${esc(f.name)}</span></label>`;}).join('')+'</div></fieldset>':'<p class="muted">Такого продукта в рецептах пока нет. Попробуй другое название.</p>';
}
function renderPantryStatus(){
 $('#pantry-summary').textContent=state.pantry.length?`Отмечено: ${state.pantry.length}${state.pantryEnabled?'':' · подбор выключен'}`:'Отметь продукты — подберём блюда';
 $('#pantry-enabled').checked=state.pantryEnabled;$('#pantry-strict').checked=state.pantryStrict;$('#pantry-strict').disabled=!state.pantryEnabled||!state.pantry.length;$('#pantry-clear').disabled=!state.pantry.length;
 $('#pantry-results-note').hidden=!pantryActive();$('#pantry-results-note').textContent=state.pantryStrict?'Только блюда, для которых отмечены все продукты. Проверь их количество перед готовкой.':'Сначала блюда с наибольшей долей продуктов дома. Недостающее указано на карточке.';
 $('#method-filter').value=method;$('#clear-method').hidden=method==='all';
}
function filteredRecipes(){
 let list=recipes.filter(r=>r.category===category).filter(allowedRecipe).filter(r=>filter==='all'||filter==='easy'&&r.tags.includes('easy')||filter==='quick'&&r.minutes<=15||filter==='vegetarian'&&r.tags.includes('vegetarian')||filter==='favorite'&&state.favorites.includes(r.id)).filter(r=>method==='all'||r.methods.includes(method)).filter(r=>!query||`${r.name} ${r.ingredients.map(i=>foods[i.food].name).join(' ')}`.toLocaleLowerCase('ru').includes(query));
 if(pantryActive()){if(state.pantryStrict)list=list.filter(r=>!pantryMatch(r).missing.length);list.sort((a,b)=>{const x=pantryMatch(a),y=pantryMatch(b);return y.have/y.total-x.have/x.total||x.missing.length-y.missing.length||a.minutes-b.minutes;});}return list;
}
function renderRecipes(){
 renderPantryStatus();
 const list=filteredRecipes();
 $('#recipe-count').textContent=`${list.length} из ${recipes.filter(r=>r.category===category).length} вариантов`;
 $('#catalog-title').textContent=PLURALS[category];
 $('#recipes').innerHTML=list.length?list.map(r=>{
 const selected=state.week[state.day][r.category]===r.id;
 const favorite=state.favorites.includes(r.id);
 return `<article class="recipe-card" data-recipe="${r.id}"><div class="card-media"><button class="photo-open" data-recipe-open="${r.id}" aria-label="Открыть рецепт: ${esc(r.name)}">${photo(r)}</button><button class="favorite icon-button" data-favorite="${r.id}" aria-pressed="${favorite}" aria-label="${favorite?'Убрать из избранного':'В избранное'}: ${esc(r.name)}">${icon('heart')}</button></div><div class="card-body"><div class="card-meta"><span>${icon('clock')}${r.minutes} мин${r.id==='breakfast-9'?' + ночь':''}</span><span>Б ${r.protein} г</span><strong>≈${r.kcal} ккал</strong></div><h3 class="card-title"><button data-recipe-open="${r.id}">${esc(r.name)}</button></h3><p class="ingredients-summary">${esc(ingredientSummary(r))}</p>${pantryCaption(r)}<div class="card-actions"><button class="recipe-link" data-recipe-open="${r.id}">Как приготовить</button><button class="add-button" data-add="${r.id}" aria-pressed="${selected}" aria-label="${selected?'Уже в меню':'Добавить в меню'}: ${esc(r.name)}">${icon(selected?'check':'plus')}${selected?'В меню':'В меню на '+SHORT[state.day]}</button></div></div></article>`;
 }).join(''):`<div class="empty-state"><h3>${filter==='favorite'?'Здесь будут любимые блюда':'Ничего не нашлось'}</h3><p>${filter==='favorite'?'Нажми на сердечко у блюда из этого раздела.':(pantryActive()&&state.pantryStrict?'Не хватает отмеченных продуктов. Добавь продукты дома или выключи «Всё есть дома».':'Попробуй другой продукт или убери фильтры.')}</p><button class="button secondary" id="reset-filters">Показать все ${PLURALS[category].toLowerCase()}</button></div>`;
}
function selectedRecipes(day=state.day){return CATS.map(c=>byId[state.week[day][c]]).filter(Boolean);}
function totals(day=state.day){const list=selectedRecipes(day);return {kcal:list.reduce((n,r)=>n+r.kcal,0),protein:list.reduce((n,r)=>n+r.protein,0),count:list.length};}
function renderPlan(){
 $('#plan-heading').textContent='Твой день';
 $('#day-switch').innerHTML=SHORT.map((d,i)=>`<button data-day="${i}" aria-label="${DAYS[i]}" aria-pressed="${i===state.day}" class="${selectedRecipes(i).length?'has-plan':''}">${d}</button>`).join('');
 const total=totals();$('#total-kcal').textContent=total.kcal.toLocaleString('ru-RU');
 $('#total-caption').textContent=total.count===4?`${DAYS[state.day]} · 4 приёма пищи · белок ${total.protein} г`:`${DAYS[state.day]} · выбрано ${total.count} из 4 блюд`;
 $('#calorie-progress').setAttribute('aria-valuenow',Math.min(total.kcal,1600));$('#calorie-progress').setAttribute('aria-valuetext',`${total.kcal} из примерно 1600 ккал`);$('#progress-fill').style.width='100%';$('#progress-fill').style.transformOrigin='left';$('#progress-fill').style.transform=`scaleX(${Math.min(1,total.kcal/1600)})`;
 $('#plan-meals').innerHTML=CATS.map(c=>{const r=byId[state.week[state.day][c]];return `<div class="plan-slot"><div class="slot-label"><span>${LABELS[c]}</span><span>${r?'≈'+r.kcal:'≈'+TARGETS[c]} ккал</span></div>${r?`<div class="slot-item">${photo(r,'slot-image')}<button class="slot-name" data-recipe-open="${r.id}">${esc(r.name)}</button><button class="icon-button remove-meal" data-remove="${c}" aria-label="Убрать ${LABELS[c].toLowerCase()}">${icon('close')}</button></div>`:`<button class="slot-empty" data-choose="${c}">+ Выбрать ${LABELS[c].toLowerCase()}</button>`}</div>`;}).join('');
}
function renderWeek(){
 $('#week-grid').innerHTML=DAYS.map((day,i)=>{const total=totals(i);return `<article class="week-day"><h3>${day}</h3><p>${total.count?`≈${total.kcal} ккал · ${total.count}/4 блюд`:'Пока без плана'}</p>${CATS.map(c=>{const r=byId[state.week[i][c]];return `<div class="week-meal"><span>${LABELS[c]}</span><button data-edit-day="${i}" data-edit-category="${c}">${r?esc(r.name):'+ Выбрать блюдо'}</button></div>`;}).join('')}<button class="button secondary" data-edit-day="${i}">Изменить день ${icon('arrow')}</button></article>`;}).join('');
}
function render(){renderTabs();renderRecipes();renderPlan();renderAvoid();if(view==='week')renderWeek();}
function switchView(next,scroll=false){view=next;$('.workspace').hidden=next!=='library';$('#week-view').hidden=next!=='week';$('#library-nav').classList.toggle('active',next==='library');$('#week-nav').classList.toggle('active',next==='week');$('#library-nav').setAttribute('aria-pressed',next==='library');$('#week-nav').setAttribute('aria-pressed',next==='week');render();if(scroll)(next==='week'?$('#week-view'):$('#catalog')).scrollIntoView({behavior:'smooth',block:'start'});}
function chooseCategory(c,scroll=true){category=c;filter='all';query='';$('#search').value='';switchView('library');if(scroll)$('#catalog').scrollIntoView({behavior:'smooth',block:'start'});}
function addRecipe(id){const r=byId[id];if(!r)return;const previous=state.week[state.day][r.category];state.week[state.day][r.category]=r.id;save();render();toast(`${LABELS[r.category]} на ${SHORT[state.day]}: ${r.name}${previous&&previous!==id?' — заменено':''}`);}
function randomDay(){return Object.fromEntries(CATS.map(c=>{const list=recipes.filter(r=>r.category===c).filter(allowedRecipe);return [c,list.length?list[Math.floor(Math.random()*list.length)].id:null];}));}
function openDialog(dialog){lastFocus=document.activeElement;if(!dialog.open)dialog.showModal();}
function closeDialog(dialog){dialog.close();}
function recipeDetail(){
 const r=byId[activeRecipe];if(!r)return;
 const alternatives=recipes.filter(x=>x.category===r.category&&x.id!==r.id&&allowedRecipe(x)).sort((a,b)=>Math.abs(a.kcal-r.kcal)-Math.abs(b.kcal-r.kcal)).slice(0,2);
 $('#recipe-content').innerHTML=`${photo(r,'recipe-hero')}<div class="recipe-detail"><h2 id="recipe-title">${esc(r.name)}</h2><div class="detail-meta"><span>${icon('clock')}${r.minutes} ${r.minutes%10===1&&r.minutes%100!==11?'минута':r.minutes%10>=2&&r.minutes%10<=4&&(r.minutes%100<12||r.minutes%100>14)?'минуты':'минут'}${r.id==='breakfast-9'?' + ночь в холодильнике':''}</span><span>≈${r.kcal} ккал / порция</span><span>Белок ${r.protein} г / порция</span></div><div class="servings-control"><label for="servings">Готовим на</label><select id="servings"><option value="1" ${servings===1?'selected':''}>1 порцию</option><option value="2" ${servings===2?'selected':''}>2 порции</option><option value="3" ${servings===3?'selected':''}>3 порции</option></select><span class="small muted">≈${r.kcal*servings} ккал всего</span></div><div class="method-labels">${r.methods.map(m=>`<span>${esc(METHOD_LABELS[m]||m)}</span>`).join('')}</div>${pantryCaption(r)}<h3>Что понадобится</h3><ul class="ingredient-list">${r.ingredients.map(i=>`<li><span>${esc(foods[i.food].name)}</span><span>${state.mode==='grams'?amountText(i,servings):`${servings>1?servings+' × ':''}${esc(i.portion)}`}</span></li>`).join('')}</ul><p class="small muted">Крупы, хлопья и макароны отмеряй сухими, до варки. Стакан — 250 мл, без утрамбовки. Ладонь в рецепте — размер готового куска без пальцев. Меры приблизительные. ${servings>1?'Количество продуктов умножено на '+servings+'. Готовое блюдо раздели на '+servings+' равные порции.':''}</p><h3>Как приготовить</h3><ol class="cooking-steps">${r.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>${r.tip?`<p class="recipe-tip">${esc(r.tip)}</p>`:''}${toleranceNotes(r)}<h3>Можно выбрать вместо</h3><div class="recipe-alternatives">${alternatives.map(a=>`<button data-alternative="${a.id}">${esc(a.name)} · ≈${a.kcal} ккал</button>`).join('')}</div><button class="button primary full" data-detail-add="${r.id}">${icon('plus')}Выбрать 1 порцию на ${SHORT[state.day]}</button><p class="small muted">Изображение иллюстративное. Калории зависят от марки продуктов, масло уже включено.</p></div>`;
}
function openRecipe(id){if(!byId[id])return;activeRecipe=id;servings=1;recipeDetail();openDialog($('#recipe-dialog'));$('#recipe-dialog').scrollTop=0;}
function shoppingList(){const list=shopScope==='day'?selectedRecipes():state.week.flatMap((_,i)=>selectedRecipes(i));const amounts={};list.forEach(r=>r.ingredients.forEach(i=>amounts[i.food]=(amounts[i.food]||0)+i.amount));return Object.entries(amounts).map(([id,amount])=>({id,amount,...foods[id]})).sort((a,b)=>a.group.localeCompare(b.group,'ru')||a.name.localeCompare(b.name,'ru'));}
function shopKey(item){return `${shopScope}:${shopScope==='day'?state.day:'all'}:${item.id}:${item.amount}`;}
const SHOP_MEASURES={
 cornmeal:[180,'стак. сухой крупы'],splitpea:[200,'стак. сухого гороха'],pickle:[80,'шт. (небольшой огурец)'],liver:[160,'стак. кусочков'],pepper:[125,'шт. (средний перец)'],cauliflower:[100,'стак. соцветий'],greenbeans:[100,'стак. кусочков'],brynza:[100,'стак. кубиков'],prune:[8,'шт.'],dates:[8,'шт. без косточек'],cocoa:[5,'ч. л. с горкой'],beet:[150,'шт. (средняя свёкла)'],seeds:[10,'ст. л. без горки'],semolina:[200,'стак. сухой манки'],raisin:[10,'ст. л. без горки'],pumpkin:[150,'стак. кубиков'],mushroom:[30,'шт. (средний гриб)'],cabbage:[80,'стак. нашинкованной'],peas:[150,'стак. без жидкости'],broccoli:[100,'стак. соцветий'],cucumber:[125,'шт. (средний огурец)'],oats:[90,'стак. сухих хлопьев'],rice:[200,'стак. сухого риса'],buckwheat:[200,'стак. сухой гречки'],bulgur:[180,'стак. сухого булгура'],millet:[220,'стак. сухого пшена'],barley:[200,'стак. сухой перловки'],lentil:[200,'стак. сухой чечевицы'],pasta:[100,'стак. сухих макарон'],
 milk:[250,'стак.'],kefir:[250,'стак.'],yogurt:[250,'стак.'],curd:[200,'пачки'],cheese:[20,'ломт.'],creamcheese:[20,'ст. л.'],
 lavash:[80,'большого тонкого листа'],bread:[30,'ломтика'],crispbread:[8,'хлебца'],flour:[10,'ст. л. без горки'],oil:[5,'ч. л.'],peanut:[15,'ст. л. без горки'],walnut:[4,'ядра'],almond:[1.2,'штуки'],
 chicken:[180,'порц. (сырой кусок с ладонь)'],turkey:[180,'порц. (сырой кусок с ладонь)'],beef:[180,'порц. (сырой кусок с ладонь)'],cod:[200,'порц. (сырой кусок с ладонь)'],pollock:[200,'порц. (сырой кусок с ладонь)'],salmon:[150,'порц. (сырой кусок с ладонь)'],tuna:[120,'небольшой банки без жидкости'],beans:[200,'банки без жидкости'],
 potato:[125,'шт. (средний клубень)'],sweetpotato:[250,'шт. (средний клубень)'],veg:[200,'миски овощей'],tomato:[125,'шт. (средний помидор)'],carrot:[100,'шт. (средняя морковь)'],onion:[100,'шт. (средняя луковица)'],zucchini:[300,'шт. (небольшой кабачок)'],passata:[250,'стак.'],
 banana:[100,'шт. (небольшой банан)'],apple:[150,'шт. (среднее яблоко)'],pear:[140,'небольшой груши'],orange:[160,'шт. (средний апельсин)'],kiwi:[65,'небольших киви'],peach:[140,'шт. (средний персик)'],avocado:[150,'среднего авокадо'],berries:[150,'стак. ягод'],strawberry:[150,'стак. клубники'],apricot:[7,'штуки']
};
function householdNumber(value){const n=Math.max(.25,Math.round(value*4)/4);const whole=Math.floor(n),fraction=n-whole;return (whole?String(whole):'')+({0:'',0.25:'¼',0.5:'½',0.75:'¾'}[fraction]||'');}
function shoppingAmount(item){if(item.id==='egg')return `${Math.ceil(item.amount/50)} шт.`;const measure=SHOP_MEASURES[item.id];if(!measure)return 'по потребности';return `≈ ${householdNumber(item.amount/measure[0])} ${measure[1]}${measure[1].includes('стак.')?' (стакан 250 мл)':''}`;}

function renderShopping(){
 const items=shoppingList();const n=shopScope==='day'?selectedRecipes().length:state.week.reduce((s,_,i)=>s+selectedRecipes(i).length,0);
 $('#shop-scope-day').setAttribute('aria-pressed',shopScope==='day');$('#shop-scope-week').setAttribute('aria-pressed',shopScope==='week');
 $('#shopping-caption').textContent=`${shopScope==='day'?DAYS[state.day]:'Вся неделя'} · ${n} ${n===1?'блюдо':n>=2&&n<=4?'блюда':'блюд'} · отмечай то, что уже есть`;
 let group='';$('#shopping-items').innerHTML=items.length?items.map(item=>{const heading=item.group!==group?`${group?'</section>':''}<section class="shopping-group"><h3>${esc(item.group)}</h3>`:'';group=item.group;return `${heading}<label class="shopping-row"><input type="checkbox" data-shop-check="${esc(shopKey(item))}" ${state.checked[shopKey(item)]?'checked':''}><span>${esc(item.name)}</span><strong>${shoppingAmount(item)}</strong></label>`;}).join('')+'</section>':'<div class="empty-state"><h3>Сначала выбери блюда</h3><p>Добавь хотя бы одно блюдо в план — здесь появятся продукты.</p></div>';
 $('#download-shopping').disabled=!items.length;
}
function openShopping(scope){shopScope=scope;renderShopping();openDialog($('#shopping-dialog'));}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function downloadShopping(){const items=shoppingList();let group='';const lines=['ПОРЦИЯ — СПИСОК ПОКУПОК',shopScope==='day'?DAYS[state.day]:'Вся неделя','Примерные бытовые количества. 1 стакан = 250 мл. Крупы и макароны сухие, мясо для покупки сырое.',''];for(const item of items){if(item.group!==group){group=item.group;lines.push('',group);}lines.push(`${state.checked[shopKey(item)]?'[x]':'[ ]'} ${item.name} — ${shoppingAmount(item)}`);}lines.push('','Соль, специи и вода — по необходимости.');download('porcia-pokupki.txt',lines.join('\n'),'text/plain;charset=utf-8');toast('Список покупок сохранён в файл');}
function printWeek(){ $('#print-area').innerHTML=`<h1>Порция · меню на неделю ≈1600 ккал/день</h1><p>Крупы, хлопья и макароны отмеряй сухими, до варки. Стакан 250 мл. Порции и калории приблизительные.</p>${DAYS.map((day,i)=>`<section><h2>${day} · ≈${totals(i).kcal} ккал</h2>${CATS.map(c=>{const r=byId[state.week[i][c]];return `<p><b>${LABELS[c]}:</b> ${r?esc(r.name)+' · ≈'+r.kcal+' ккал':'Не выбрано'}${r?'<br><small>'+esc(ingredientSummary(r))+'</small>':''}</p>`;}).join('')}</section>`).join('')}`;window.print();}
// Delegated controls also work after list and dialog rerenders.
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.category){category=b.dataset.category;query='';$('#search').value='';renderTabs();renderRecipes();}
 if(b.dataset.filter){filter=b.dataset.filter;renderTabs();renderRecipes();}
 if(b.dataset.favorite){const id=b.dataset.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();renderRecipes();toast(state.favorites.includes(id)?'Добавлено в избранное':'Убрано из избранного');}
 if(b.dataset.recipeOpen)openRecipe(b.dataset.recipeOpen);
 if(b.dataset.add)addRecipe(b.dataset.add);
 if(b.dataset.detailAdd){addRecipe(b.dataset.detailAdd);closeDialog($('#recipe-dialog'));}
 if(b.dataset.alternative){activeRecipe=b.dataset.alternative;servings=1;recipeDetail();$('#recipe-dialog').scrollTop=0;}
 if(b.dataset.day!==undefined){state.day=Number(b.dataset.day);save();render();}
 if(b.dataset.choose)chooseCategory(b.dataset.choose);
 if(b.dataset.remove){state.week[state.day][b.dataset.remove]=null;save();render();toast('Блюдо убрано из дня');}
 if(b.dataset.editDay!==undefined){state.day=Number(b.dataset.editDay);save();chooseCategory(b.dataset.editCategory||'breakfast');}
 if(b.hasAttribute('data-close'))closeDialog(b.closest('dialog'));
 if(b.id==='reset-filters'){filter='all';method='all';query='';state.pantryStrict=false;state.avoid=[];$('#search').value='';save();render();}
});
$('#avoid-options').addEventListener('change',e=>{const k=e.target.dataset.avoid;if(!AVOID_GROUPS[k])return;state.avoid=e.target.checked?[...new Set([...state.avoid,k])]:state.avoid.filter(x=>x!==k);save();renderAvoid();renderRecipes();});
$('#method-filter').addEventListener('change',e=>{method=e.target.value;renderRecipes();});
$('#clear-method').addEventListener('click',()=>{method='all';renderRecipes();});
$('#pantry-search').addEventListener('input',e=>{pantryQuery=e.target.value.trim().toLocaleLowerCase('ru');renderPantryProducts();});
$('#pantry-products').addEventListener('change',e=>{const id=e.target.dataset.pantryFood;if(!id||!foods[id])return;state.pantry=e.target.checked?[...new Set([...state.pantry,id])]:state.pantry.filter(x=>x!==id);save();renderRecipes();});
$('#pantry-enabled').addEventListener('change',e=>{state.pantryEnabled=e.target.checked;save();renderRecipes();});
$('#pantry-strict').addEventListener('change',e=>{state.pantryStrict=e.target.checked;save();renderRecipes();});
$('#pantry-clear').addEventListener('click',()=>{state.pantry=[];state.pantryStrict=false;save();renderPantryProducts();renderRecipes();});
$('#search').addEventListener('input',event=>{query=event.target.value.trim().toLocaleLowerCase('ru');renderRecipes();});
$('#portions-mode')?.addEventListener('click',()=>{state.mode='portions';save();render();});
$('#grams-mode')?.addEventListener('click',()=>{state.mode='grams';save();render();});
$('#shuffle-day').addEventListener('click',()=>{state.week[state.day]=randomDay();save();render();toast('Новый вариант дня собран');});
$('#shuffle-week').addEventListener('click',()=>{let filled=0;state.week=state.week.map(day=>{const random=randomDay();return Object.fromEntries(CATS.map(c=>{if(!day[c]){filled++;return [c,random[c]];}return [c,day[c]];}));});save();renderWeek();toast(filled?'Пустые приёмы пищи заполнены':'Неделя уже заполнена — блюда можно менять по отдельности');});
$('#library-nav').addEventListener('click',()=>switchView('library',true));$('#week-nav').addEventListener('click',()=>switchView('week',true));
$('#shopping-nav').addEventListener('click',()=>openShopping('week'));$('#shopping-day').addEventListener('click',()=>openShopping('day'));$('#shopping-week').addEventListener('click',()=>openShopping('week'));
$('#shop-scope-day').addEventListener('click',()=>{shopScope='day';renderShopping();});$('#shop-scope-week').addEventListener('click',()=>{shopScope='week';renderShopping();});
$('#shopping-items').addEventListener('change',event=>{const key=event.target.dataset.shopCheck;if(key){if(event.target.checked)state.checked[key]=true;else delete state.checked[key];save();}});
$('#reset-checks').addEventListener('click',()=>{shoppingList().forEach(item=>delete state.checked[shopKey(item)]);save();renderShopping();});
$('#download-shopping').addEventListener('click',downloadShopping);
$('#recipe-content').addEventListener('change',event=>{if(event.target.id==='servings'){servings=Number(event.target.value);recipeDetail();$('#servings').focus();}});
$('#export-plan').addEventListener('click',()=>{download('porcia-menu.json',JSON.stringify(state,null,2),'application/json');toast('План сохранён. Его можно загрузить на другом устройстве.');});
$('#import-plan-button').addEventListener('click',()=>$('#import-plan').click());
$('#import-plan').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('Слишком большой файл');const incoming=sanitize(JSON.parse(await file.text()));state=incoming;save();renderPantryProducts();render();toast('План загружен из файла');}catch(e){toast('Не удалось загрузить план. Выбери JSON-файл, сохранённый в «Порции».');}finally{event.target.value='';}});
$('#print-plan').addEventListener('click',printWeek);
$('#help-button').addEventListener('click',()=>openDialog($('#help-dialog')));$('#transfer-help').addEventListener('click',()=>openDialog($('#help-dialog')));
for(const dialog of document.querySelectorAll('dialog')){
 dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus();else $('#help-button').focus();});
}
hydrateIcons();renderPantryProducts();render();save();if(restoreFailed)toast('Сохранённый план не прочитан. Открыт стартовый вариант. Можно загрузить резервный файл.');
})();
