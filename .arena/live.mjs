import { chromium } from 'playwright';
const BASE = 'https://primeshop2.netlify.app';
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY25zdGFxb3p4Y3R5amxoeGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzYwNzEsImV4cCI6MjEwNjExMjA3MX0.2YD3ul2o1BYU3PPywTsdylRWK1Po8iSxFuQgE1j9cR0';
const sb = async (q) => (await fetch('https://vicnstaqozxctyjlhxlz.supabase.co/rest/v1/'+q,{headers:{apikey:K,Authorization:'Bearer '+K}})).json();
const browser = await chromium.launch(); const errors=[];
const newPage = async (mobile=true) => { const ctx = await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{}); const page = await ctx.newPage();
  page.on('pageerror', e=>errors.push('PAGEERROR '+e.message)); page.on('dialog', d=>d.accept()); return {ctx,page}; };
const NAME='TEST-LIVE Casque Audio';
{ const {ctx,page}=await newPage(); await page.goto(BASE+'/#/'); await page.waitForTimeout(3000);
  await page.locator('.animate-marquee > div').first().dispatchEvent('click'); await page.waitForTimeout(800);
  console.log('1. Vitrine modale EXEMPLE visible:', await page.getByText('EXEMPLE DE DÉMONSTRATION').isVisible());
  console.log('   WhatsApp accueil:', (await page.locator('a[href*="wa.me"]').first().getAttribute('href')).slice(0,26));
  console.log('   Manifest PWA:', await page.locator('link[rel="manifest"]').count()); await ctx.close(); }
{ const {ctx,page}=await newPage(false); await page.goto(BASE+'/#/gestion-prime'); await page.waitForTimeout(3000);
  await page.locator('input[type="password"]').first().fill('admin123'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.getByText('Ajouter un Produit').click(); await page.waitForTimeout(500);
  await page.locator('input[type="url"]').first().fill('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
  await page.locator('input[placeholder*="Écouteurs"]').first().fill(NAME);
  const nums=page.locator('input[type="number"]'); await nums.nth(0).fill('19500'); if(await nums.count()>2) await nums.nth(2).fill('7');
  await page.getByText('Publier sur la boutique').click(); await page.waitForTimeout(3000);
  console.log('2. Produit listé admin:', (await page.textContent('body')).includes(NAME)); await ctx.close(); }
const rows = await sb('products?select=id,name'); console.log('3. Supabase produits:', rows);
const pid = rows.find(r=>r.name===NAME)?.id;
{ const {ctx,page}=await newPage(); await page.goto(`${BASE}/#/shop?cat=electronique&product=${pid}`); await page.waitForTimeout(4000);
  console.log('4. Lien partagé (tel. vierge) affiche produit:', (await page.textContent('body')).includes(NAME));
  await page.goto(`${BASE}/#/suivi?id=PS-TEST`); await page.waitForTimeout(2500); console.log('5. Page suivi OK:', (await page.textContent('body')).includes('suivi') || (await page.textContent('body')).length>500);
  await page.goto(`${BASE}/#/xyz`); await page.waitForTimeout(1200); console.log('6. Route inconnue → page Exemple:', (await page.textContent('body')).includes('Exemple')); await ctx.close(); }
{ const {ctx,page}=await newPage(false); await page.goto(BASE+'/#/gestion-prime'); await page.waitForTimeout(3000);
  await page.locator('input[type="password"]').first().fill('admin123'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const row=page.locator('tr',{hasText:'TEST-LIVE'}).first(); const b=row.locator('button'); await b.nth(await b.count()-1).click(); await page.waitForTimeout(3000); await ctx.close(); }
console.log('7. Supabase après suppression du test:', await sb('products?select=id'), '| commandes:', await sb('orders?select=id'), '| whatsapp:', await sb('store_settings?select=whatsapp_number'));
console.log('ERREURS JS:', errors); await browser.close();
