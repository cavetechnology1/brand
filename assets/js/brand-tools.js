(function(){
 const ar=document.documentElement.lang==='ar';
 const header=document.querySelector('.top');
 if(header){
  const offset=()=>document.documentElement.style.setProperty('--brand-header-height',`${header.getBoundingClientRect().height+16}px`);
  offset();
  if(window.ResizeObserver)new ResizeObserver(offset).observe(header);
  else window.addEventListener('resize',offset);
 }
 const status=document.createElement('p');status.className='brand-tool-status';status.setAttribute('role','status');document.querySelector('#colour').append(status);
 document.querySelectorAll('.sw').forEach(swatch=>{
  const code=swatch.querySelector('code'),name=swatch.querySelector('b').textContent;
  const button=document.createElement('button');button.type='button';button.className='asset-button';button.textContent=ar?'نسخ اللون':'Copy color';button.setAttribute('aria-label',`${button.textContent}: ${name} ${code.textContent}`);
  button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.textContent);status.textContent=(ar?'تم نسخ ':'Copied ')+code.textContent;}catch{const selection=getSelection(),range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);status.textContent=ar?'تم تحديد اللون. انسخه يدويًا.':'Color selected. Copy it manually.';}});
  swatch.append(button);
 });
 const backgrounds={white:ar?'أبيض':'White',paper:ar?'ورقي':'Paper',navy:ar?'كحلي':'Navy',charcoal:ar?'فحمي':'Charcoal',teal:ar?'فيروزي':'Teal'};
 document.querySelectorAll('.ground').forEach((card,index)=>{
  const img=card.querySelector('img'),white=img.src.includes('-white'),choices=white?['navy','charcoal','teal']:['white','paper'];
  const label=document.createElement('label');label.className='asset-background';label.textContent=ar?'خلفية المعاينة':'Preview background';label.htmlFor=`asset-background-${index}`;
  const select=document.createElement('select');select.id=label.htmlFor;
  for(const value of choices){const option=document.createElement('option');option.value=value;option.textContent=backgrounds[value];select.append(option);if(card.classList.contains('g-'+value))select.value=value;}
  select.addEventListener('change',()=>{for(const key of Object.keys(backgrounds))card.classList.remove('g-'+key);card.classList.add('g-'+select.value);});
  label.append(select);card.append(label);
  const guidance=document.createElement('p');guidance.className='asset-guidance';guidance.textContent=white?(ar?'للخلفيات الكحلية والفحمية والفيروزية. حافظ على اللون والنسب.':'For navy, charcoal and teal backgrounds. Preserve color and proportions.'):(ar?'للخلفيات البيضاء والورقية فقط. حافظ على اللون والنسب.':'For white and paper backgrounds only. Preserve color and proportions.');card.append(guidance);
  const button=document.createElement('button');button.type='button';button.className='asset-button';button.textContent=ar?'تنزيل PNG شفاف · عرض 1600 بكسل':'Download transparent PNG · 1600px wide';
  button.setAttribute('aria-label',button.textContent+': '+img.alt);
  const result=document.createElement('p');result.className='asset-guidance';result.setAttribute('role','status');
  button.addEventListener('click',async()=>{
   button.disabled=true;
   try{await img.decode();const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=Math.round(1600*img.naturalHeight/img.naturalWidth);const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');context.drawImage(img,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=img.src.split('/').pop().replace('.svg','-1600.png');document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    result.textContent=ar?'تم تجهيز PNG. الخلفية المختارة للمعاينة فقط.':'PNG prepared. The selected background is for preview only.';
   }catch{result.textContent=ar?'تعذر إنشاء PNG. استخدم ملف SVG أو حاول مجددًا.':'PNG could not be created. Use the SVG or try again.';}finally{button.disabled=false;}
  });card.append(button,result);
 });
})();
