
(function(){
  var nav=document.getElementById('nav'),mb=document.querySelector('.menu');
  if(mb&&nav){mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'})}

  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.03});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('on')})}

  // sticky start pill
  var st=document.querySelector('.sticky');
  if(st){var tick=function(){st.classList.toggle('show',window.scrollY>520)};window.addEventListener('scroll',tick,{passive:true});tick()}

  // process stepper: four steps, tap through
  var PH=[
    {n:'Brief',we:['Read your brief','Ask what is missing'],you:['Fill in a short brief'],get:['One page on what the logo must do']},
    {n:'Concepts',we:['Design three different concepts','Show them side by side'],you:['Look at all three'],get:['Three concepts']},
    {n:'Choose',we:['Refine the one you pick'],you:['Choose one'],get:['One direction. Two concepts are for sale.']},
    {n:'Deliver',we:['Finish the logo','Export every file'],you:['Approve it','Pay the balance'],get:['Final files. They are yours.']}
  ];
  document.querySelectorAll('.stepper').forEach(function(root){
    var cur=0,btns=root.querySelectorAll('.ph-btn'),pn=root.querySelector('.panel');
    function li(a){return a.map(function(x){return '<li>'+x+'</li>'}).join('')}
    function render(){
      var p=PH[cur];
      btns.forEach(function(b,k){b.setAttribute('aria-selected',String(k===cur))});
      pn.innerHTML='<div class="head"><b>'+p.n+'</b><span>Step '+(cur+1)+' of '+PH.length+'</span></div>'
        +'<div class="col"><small>We do</small><ul>'+li(p.we)+'</ul></div>'
        +'<div class="col"><small>You do</small><ul>'+li(p.you)+'</ul></div>'
        +'<div class="col"><small>You get</small><ul>'+li(p.get)+'</ul></div>';
    }
    btns.forEach(function(b,k){b.addEventListener('click',function(){cur=k;render()});
      b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'&&cur<PH.length-1){cur++;render();btns[cur].focus()}if(e.key==='ArrowLeft'&&cur>0){cur--;render();btns[cur].focus()}})});
    render();
  });

  // readiness checklist
  var ck=document.getElementById('ready');
  if(ck){
    var boxes=ck.querySelectorAll('input'),bar=document.querySelector('.meter .bar i'),txt=document.getElementById('readytxt'),go=document.getElementById('readygo');
    var upd=function(){var n=0;boxes.forEach(function(b){if(b.checked)n++});bar.style.width=(n/boxes.length*100)+'%';
      txt.textContent=n===boxes.length?'You are ready. Let us start the clock.':n+' of '+boxes.length+' ready';
      go.classList.toggle('orange',n===boxes.length)};
    boxes.forEach(function(b){b.addEventListener('change',upd)});upd();
  }

  // filters: any [data-grid] with chips [data-key][data-val]; cards carry data-<key>
  document.querySelectorAll('[data-grid]').forEach(function(grid){
    var wrapEl=grid.closest('section')||document,chips=wrapEl.querySelectorAll('.chip[data-key]'),empty=wrapEl.querySelector('[data-empty]'),state={},q=new URLSearchParams(location.search);
    chips.forEach(function(b){state[b.dataset.key]=state[b.dataset.key]||''});
    Object.keys(state).forEach(function(k){if(q.get(k))state[k]=q.get(k)});
    var apply=function(){
      var n=0;
      grid.querySelectorAll(':scope > [data-'+Object.keys(state).join('],:scope > [data-')+']').forEach(function(c){
        var ok=Object.keys(state).every(function(k){var v=c.dataset[k]||'';return !state[k]||v.split(' ').indexOf(state[k])>-1});
        c.hidden=!ok;if(ok)n++;
      });
      chips.forEach(function(b){b.setAttribute('aria-pressed',String(state[b.dataset.key]===b.dataset.val))});
      if(empty)empty.hidden=n>0;
    };
    chips.forEach(function(b){b.addEventListener('click',function(){state[b.dataset.key]=b.dataset.val;apply()})});
    apply();
  });

  // contact: preselect the need from ?need=
  var need=new URLSearchParams(location.search).get('need'),sel=document.getElementById('f-need');
  if(need&&sel){for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===need)sel.selectedIndex=i}}

  // forms (Netlify Forms): validate, post, redirect to the form's action
  document.querySelectorAll('form[data-netlify]').forEach(function(f){
    var err=f.querySelector('.err'),btn=f.querySelector('button[type=submit]');
    f.addEventListener('submit',function(ev){
      ev.preventDefault();if(err)err.textContent='';
      var bad=false;
      f.querySelectorAll('[required]').forEach(function(i){
        var ok=i.value.trim()&&(i.type!=='email'||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value));
        i.classList.toggle('invalid',!ok);if(!ok)bad=true;
      });
      if(bad){if(err)err.textContent='Please add your name, a valid email and a few words about what you need.';else alert('Please enter a valid email.');return}
      btn.disabled=true;
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
        .then(function(r){if(!r.ok)throw 0;location.href=f.getAttribute('action')})
        .catch(function(){btn.disabled=false;var m='Something went wrong. Please email hello@madesteadfast.com instead.';if(err)err.textContent=m;else alert(m)});
    });
  });
})();
