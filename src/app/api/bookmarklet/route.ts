import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const zone = searchParams.get('zone') || 'B1'
  const qty = searchParams.get('qty') || '1'
  const showId = searchParams.get('showId') || '81858'
  const orderNum = searchParams.get('order') || 'ออเดอร์'
  const bookingUrl = searchParams.get('url') || 'https://booking.thaiticketmajor.com/booking/3m/zones.php?query=622'

  const script = `(function(){
  var CFG={showId:'${showId}',zone:'${zone}',qty:${qty},bookingUrl:'${bookingUrl}'};
  var p=location.href;
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function setVal(el,v){el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}));}
  function flash(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;top:16px;right:16px;z-index:99999;background:#7c3aed;color:#fff;padding:12px 20px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(0,0,0,0.4)';document.body.appendChild(d);setTimeout(function(){d.remove()},3000);}
  async function run(){
    if(p.includes('zones.php')){
      flash('\\u{1F916} Ticket Mate: \\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E23\\u0E2D\\u0E1A...');
      var rdId=document.querySelector('#rdId');
      if(rdId&&!rdId.value){setVal(rdId,CFG.showId);}
      await wait(1000);
      var areas=document.querySelectorAll('map area');
      var clicked=false;
      for(var i=0;i<areas.length;i++){
        var href=areas[i].getAttribute('href')||'';
        if(href.includes(CFG.zone)){
          flash('\\u{1F916} Ticket Mate: Zone '+CFG.zone+'...');
          if(typeof selectzone==='function'){selectzone(href,new MouseEvent('click'));}
          else{areas[i].click();}
          clicked=true;break;
        }
      }
      if(!clicked){flash('\\u26A0\\uFE0F \\u0E44\\u0E21\\u0E48\\u0E1E\\u0E1A Zone '+CFG.zone);}
    }else if(p.includes('fixed.php')||p.includes('seat')){
      flash('\\u{1F916} Ticket Mate: \\u0E15\\u0E31\\u0E49\\u0E07\\u0E08\\u0E33\\u0E19\\u0E27\\u0E19 '+CFG.qty+' \\u0E43\\u0E1A...');
      await wait(500);
      var qEls=[].slice.call(document.querySelectorAll('select[name*="qty"],select[id*="qty"],input[name*="qty"],#numberOfTickets,.qty-select'));
      if(qEls.length>0){setVal(qEls[0],String(CFG.qty));}
      await wait(800);
      var addBtn=document.querySelector('.btn-addcart,button.addtocart,[class*="add-cart"],[onclick*="addCart"],button[type="submit"]');
      if(addBtn){flash('\\u{1F916} Ticket Mate: Add to Cart...');addBtn.click();}
    }else if(p.includes('payment')||p.includes('checkout')||p.includes('confirm')){
      flash('\\u270B Ticket Mate: \\u0E2B\\u0E22\\u0E38\\u0E14\\u0E17\\u0E35\\u0E48\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E0A\\u0E33\\u0E23\\u0E30\\u0E40\\u0E07\\u0E34\\u0E19');
      alert('${orderNum}\\n\\n\\u0E2B\\u0E22\\u0E38\\u0E14\\u0E17\\u0E35\\u0E48\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E19\\u0E35\\u0E49\\u0E41\\u0E25\\u0E49\\u0E27 — \\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E01\\u0E23\\u0E2D\\u0E01\\u0E02\\u0E49\\u0E2D\\u0E21\\u0E39\\u0E25\\u0E41\\u0E25\\u0E30\\u0E22\\u0E37\\u0E19\\u0E22\\u0E31\\u0E19\\u0E14\\u0E49\\u0E27\\u0E22\\u0E15\\u0E31\\u0E27\\u0E40\\u0E2D\\u0E07\\u0E04\\u0E23\\u0E31\\u0E1A');
    }else if(p.includes('thaiticketmajor.com/concert/')){
      flash('\\u{1F916} Ticket Mate: \\u0E01\\u0E33\\u0E25\\u0E31\\u0E07\\u0E2B\\u0E32\\u0E25\\u0E34\\u0E07\\u0E01\\u0E4C\\u0E08\\u0E2D\\u0E07...');
      function extractUrl(el){var h=el.href||'';if(h&&!h.includes('javascript:'))return h;var oc=el.getAttribute('onclick')||'';var m=oc.match(new RegExp('https?://booking\\.thaiticketmajor\\.com[^\'"\\)\\s]+'));return m?m[0].trim():'';}
      async function findLink(){
        var allEls=[].slice.call(document.querySelectorAll('a,button'));
        var roundBtn=null;
        for(var b=0;b<allEls.length;b++){if(allEls[b].textContent.includes('\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E23\\u0E2D\\u0E1A')){roundBtn=allEls[b];break;}}
        if(roundBtn){flash('\\u{1F916} Ticket Mate: \\u0E04\\u0E25\\u0E34\\u0E01\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E23\\u0E2D\\u0E1A...');roundBtn.click();await wait(1000);}
        var showBtns=[].slice.call(document.querySelectorAll('a.btn,[onclick*="booking.thaiticketmajor.com"]'));
        var targetUrl='';
        for(var i=0;i<showBtns.length;i++){var u=extractUrl(showBtns[i]);if(u){if(!targetUrl)targetUrl=u;if(u.includes(CFG.showId)){targetUrl=u;break;}}}
        if(targetUrl){flash('\\u{1F916} Ticket Mate: \\u0E44\\u0E1B\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E08\\u0E2D\\u0E07...');await wait(500);location.href=targetUrl;}
        else if(CFG.bookingUrl){flash('\\u{1F916} Ticket Mate: Fallback...');await wait(500);location.href=CFG.bookingUrl;}
        else{flash('\\u26A0\\uFE0F \\u0E44\\u0E21\\u0E48\\u0E1E\\u0E1A\\u0E25\\u0E34\\u0E07\\u0E01\\u0E4C\\u0E08\\u0E2D\\u0E07');}
      }
      findLink();
    }else if(p.includes('thaiticketmajor.com')){
      flash('\\u{1F916} Ticket Mate: \\u0E40\\u0E1B\\u0E34\\u0E14\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E08\\u0E2D\\u0E07...');
      location.href=CFG.bookingUrl;
    }else if(CFG.bookingUrl){
      flash('\\u{1F916} Ticket Mate: \\u0E40\\u0E1B\\u0E34\\u0E14\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E08\\u0E2D\\u0E07...');
      await wait(400);location.href=CFG.bookingUrl;
    }else{
      alert('\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E15\\u0E31\\u0E49\\u0E07\\u0E04\\u0E48\\u0E32 ticket_url \\u0E43\\u0E19\\u0E2D\\u0E2D\\u0E40\\u0E14\\u0E2D\\u0E23\\u0E4C\\u0E01\\u0E48\\u0E2D\\u0E19\\u0E19\\u0E30\\u0E04\\u0E23\\u0E31\\u0E1A');
    }
  }
  run();
})()`

  const encoded = encodeURIComponent(script)
  const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎫 ${orderNum} — Ticket Mate Bookmarklet</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0d1a;font-family:-apple-system,sans-serif;padding:24px;box-sizing:border-box}
  .card{background:#13132a;border-radius:20px;padding:36px 32px;max-width:480px;width:100%;text-align:center;border:1px solid #2a2a4a}
  h1{color:#a78bfa;font-size:22px;margin:0 0 8px}
  .sub{color:#6b7280;font-size:14px;margin:0 0 28px}
  .drag-btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;cursor:grab;user-select:none;border:2px dashed rgba(255,255,255,0.3);transition:transform 0.1s}
  .drag-btn:active{transform:scale(0.97);cursor:grabbing}
  .steps{text-align:left;margin:24px 0 0;background:#0a0a18;border-radius:12px;padding:16px 20px}
  .step{color:#a0a0b8;font-size:13px;margin-bottom:8px;line-height:1.5}
  .arrow{color:#4a4a6a;font-size:12px;margin-top:16px}
</style>
</head>
<body>
<div class="card">
  <h1>🎫 Ticket Mate Bot</h1>
  <p class="sub">${orderNum} · Zone ${zone} · รอบ ${showId === '81858' ? '14:00' : '19:00'} · ${qty} ใบ</p>
  <a class="drag-btn" href="javascript:${encoded}" draggable="true">
    🔖 ลาก Bookmarklet นี้ไป Bookmarks Bar
  </a>
  <div class="steps">
    <div class="step">1️⃣ <strong style="color:#e8e8f0">ลากปุ่มม่วงด้านบน</strong>ไปวางบน Bookmarks Bar ของ Chrome</div>
    <div class="step">2️⃣ ตั้งชื่อ bookmark ว่า <strong style="color:#a78bfa">"TTM Bot"</strong></div>
    <div class="step">3️⃣ เปิดหน้า ThaiTicketMajor concert ใดก็ได้</div>
    <div class="step">4️⃣ กด bookmark <strong style="color:#a78bfa">TTM Bot</strong> → Script ทำงานอัตโนมัติ</div>
    <div class="step">5️⃣ หน้า Payment → กรอกข้อมูลเองครับ 💳</div>
  </div>
  <p class="arrow">⚠️ Script หยุดก่อน payment เสมอ — ไม่มีการกรอก password หรือบัตรเครดิต</p>
</div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
