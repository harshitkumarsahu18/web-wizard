import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const initialEvents = [
 {id:1,title:'Got talent',category:'Cultural',date:'2026-11-25',deadline:'2026-11-23',venue:'Main Auditorium',fee:38,description:'A stage for music, dance, comedy and every kind of talent.',rules:'Solo, duo and group entries are welcome. Bring your college ID.',type:'Solo / Duo / Group',status:'Published'},
 {id:2,title:'TechNova 2026',category:'Technical',date:'2026-12-04',deadline:'2026-12-01',venue:'Computer Science Block',fee:50,description:'A day of coding, innovation and technology challenges.',rules:'Teams of up to 3 students. Bring your own laptop.',type:'Team',status:'Published'},
 {id:3,title:'Campus Cup',category:'Sports',date:'2026-12-12',deadline:'2026-12-08',venue:'Sports Ground',fee:20,description:'Inter-department sports tournament.',rules:'Valid student ID required.',type:'Individual / Team',status:'Published'}
];
const seedApps = [{id:'CC-2026-A0E234',eventId:1,event:'Got talent',category:'Cultural',date:'2026-11-25',fee:38,applied:'2026-11-19',participant:'Shraddha Vaishnav',type:'Solo',status:'Pending'}];
const read = (k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
function App(){
 const [role,setRole]=useState(()=>localStorage.getItem('cc-role')||'Student');
 const [page,setPage]=useState('My Applications');
 const [events,setEvents]=useState(()=>read('cc-events',initialEvents));
 const [apps,setApps]=useState(()=>read('cc-apps',seedApps));
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('All');
 const [selected,setSelected]=useState(null);
 const [modal,setModal]=useState('');
 const [form,setForm]=useState({});
 const [notice,setNotice]=useState('');
 const saveEvents=v=>{setEvents(v);localStorage.setItem('cc-events',JSON.stringify(v))};
 const saveApps=v=>{setApps(v);localStorage.setItem('cc-apps',JSON.stringify(v))};
 const goRole=r=>{setRole(r);localStorage.setItem('cc-role',r);setPage(r==='Student'?'Explore Events':'Dashboard');setSelected(null)};
 const counts={pending:apps.filter(a=>a.status==='Pending').length,approved:apps.filter(a=>a.status==='Approved').length,rejected:apps.filter(a=>a.status==='Rejected').length};
 const visibleEvents=useMemo(()=>events.filter(e=>(filter==='All'||e.category===filter)&&(`${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(query.toLowerCase()))),[events,filter,query]);
 const toast=m=>{setNotice(m);setTimeout(()=>setNotice(''),2400)};
 const openEvent=e=>{setSelected(e);setModal('details')};
 const apply=e=>{if(apps.some(a=>a.eventId===e.id&&a.participant==='Shraddha Vaishnav')){toast('You have already applied to this event.');return}
 const a={id:`CC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,eventId:e.id,event:e.title,category:e.category,date:e.date,fee:e.fee,applied:new Date().toISOString().slice(0,10),participant:'Shraddha Vaishnav',type:'Solo',status:'Pending'};
 saveApps([a,...apps]);setModal('');toast('Application submitted successfully.')};
 const status=(id,s)=>{saveApps(apps.map(a=>a.id===id?{...a,status:s}:a));toast(`Application ${s.toLowerCase()}.`)};
 const startCreate=e=>{setForm(e||{title:'',category:'Cultural',date:'2026-12-20',deadline:'2026-12-15',venue:'',fee:0,description:'',rules:'',type:'Solo / Duo / Group',status:'Published'});setModal('edit')};
 const saveEvent=()=>{if(!form.title||!form.date){toast('Please enter event name and date.');return}saveEvents(form.id?events.map(e=>e.id===form.id?form:e):[{...form,id:Date.now()},...events]);setModal('');toast('Event saved.')};
 const removeEvent=id=>{if(confirm('Delete this event?')){saveEvents(events.filter(e=>e.id!==id));saveApps(apps.filter(a=>a.eventId!==id));toast('Event deleted.')}};
 const navStudent=['Explore Events','My Applications','Entry Passes','Annual Calendar'];
 const navOrg=['Dashboard','Events','Participants'];
 const nav=role==='Student'?navStudent:navOrg;
 const go=p=>{setPage(p);setModal('');setSelected(null)};
 const heading={
 'Explore Events':['Discover what’s happening.','Find your next campus experience.'],
 'My Applications':['Everything you’ve applied to.',"Track each application from submission to the organizer’s decision. Entry passes appear only for approved entries."],
 'Entry Passes':['Your approved entries.','Your event passes are ready when applications are approved.'],
 'Annual Calendar':['A year full of campus moments.','Keep track of upcoming events and registration deadlines.'],
 'Dashboard':['Your event control room.','A clear overview of events, applications and participation.'],
 'Events':['Every event, in one place.','Create and manage the campus event calendar.'],
 'Participants':['The people behind every event.','Review applications and manage participant entries.']
 }[page]||['Campus Connect','College event planner'];
 return <div className="app">
  <aside className="sidebar">
   <div className="brand" onClick={()=>go(role==='Student'?'Explore Events':'Dashboard')}><div>Campus <span>Connect</span></div><small>COLLEGE EVENT PLANNER</small></div>
   <div className="navlabel">{role.toUpperCase()}</div>
   {nav.map((n,i)=><button key={n} className={'navitem '+(page===n?'active':'')} onClick={()=>go(n)}><small>{String(i+1).padStart(2,'0')}</small>{n}</button>)}
   <div className="switch"><span>VIEW AS</span><div><button className={role==='Student'?'chosen':''} onClick={()=>goRole('Student')}>Student</button><button className={role==='Organizer'?'chosen':''} onClick={()=>goRole('Organizer')}>Organizer</button></div></div>
   <div className="profile"><b>{role==='Student'?'Shraddha Vaishnav':'Event Organizer'}</b><small>{role==='Student'?'student@campus.edu':'organizer@campus.edu'}</small><button onClick={()=>{goRole('Student');go('Explore Events')}}>↪ &nbsp; SIGN OUT</button></div>
  </aside>
  <main className="main">
   <header className="top"><span>✳ &nbsp; CAMPUS CONNECT</span><div><span className="rolepill">{role} VIEW</span><button className="outline" onClick={()=>goRole(role==='Student'?'Organizer':'Student')}>Switch to {role==='Student'?'Organizer':'Student'}</button></div></header>
   <section className="content">
    <div className="eyebrow">{page.toUpperCase()}</div><h1>{heading[0]}</h1><p className="sub">{heading[1]}</p>
    {page==='Explore Events'&&<><div className="toolbar"><input placeholder="Search events, categories or venues..." value={query} onChange={e=>setQuery(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}>{['All','Cultural','Technical','Sports','Academic'].map(x=><option>{x}</option>)}</select></div><div className="eventgrid">{visibleEvents.map(e=><article className="eventcard" key={e.id}><div className="cardtop"><span className="tag">{e.category}</span><span className="date">{new Date(e.date+'T00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div><h2>{e.title}</h2><p>{e.description}</p><div className="meta">⌖ {e.venue}　·　₹{e.fee}</div><button className="darkbtn" onClick={()=>openEvent(e)}>VIEW EVENT DETAILS ↗</button></article>)}</div>{visibleEvents.length===0&&<p>No events match your search.</p>}</>}
    {page==='My Applications'&&<><div className="stats">{[['PENDING',counts.pending],['APPROVED',counts.approved],['REJECTED',counts.rejected]].map(([l,v])=><div><small>{l}</small><strong>{v}</strong></div>)}</div><div className="applicationlist">{apps.map(a=><article className="application"><div><span className="tag">{a.category}</span> <span className={'status '+a.status.toLowerCase()}>{a.status==='Pending'?'▪ PENDING REVIEW':a.status.toUpperCase()}</span><h2>{a.event}</h2><small>{a.type.toUpperCase()}　·　Applied {a.applied} · Event on {a.date} · ₹{a.fee}</small><div><button className="outline" onClick={()=>{setSelected(events.find(e=>e.id===a.eventId)||a);setModal('details')}}>EVENT DETAILS</button></div></div><div className="regid"><small>REGISTRATION ID</small><b>{a.id}</b></div></article>)}</div><p className="footnote">▣ &nbsp; Decisions update as soon as the organizer reviews your application.</p></>}
    {page==='Entry Passes'&&<div className="passgrid">{apps.filter(a=>a.status==='Approved').map(a=><div className="pass"><span className="tag">ENTRY PASS</span><h2>{a.event}</h2><p>{a.participant}</p><p>{a.date} · Registration {a.id}</p><b>APPROVED ENTRY</b></div>)}{!apps.some(a=>a.status==='Approved')&&<p>No entry passes yet. Approved applications will appear here.</p>}</div>}
    {page==='Annual Calendar'&&<div className="calendar">{events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=><div className="calrow"><div className="caldate">{new Date(e.date+'T00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div><div><span className="tag">{e.category}</span><h2>{e.title}</h2><small>{e.venue} · Registration closes {e.deadline}</small></div><button className="outline" onClick={()=>openEvent(e)}>DETAILS</button></div>)}</div>}
    {page==='Dashboard'&&<><div className="stats"><div><small>TOTAL EVENTS</small><strong>{events.length}</strong></div><div><small>APPLICATIONS</small><strong>{apps.length}</strong></div><div><small>PENDING REVIEW</small><strong>{counts.pending}</strong></div></div><div className="sectionhead"><h2>Recent activity</h2><button className="darkbtn" onClick={()=>go('Events')}>MANAGE EVENTS</button></div><div className="applicationlist">{apps.slice(0,5).map(a=><div className="calrow"><div><span className="tag">{a.category}</span><h2>{a.participant}</h2><small>{a.event} · {a.id}</small></div><span className={'status '+a.status.toLowerCase()}>{a.status}</span></div>)}</div></>}
    {page==='Events'&&<><div className="sectionhead"><div className="toolbar"><input placeholder="Search events..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="darkbtn" onClick={()=>startCreate()}>＋ CREATE EVENT</button></div><div className="eventgrid">{visibleEvents.map(e=><article className="eventcard"><span className="tag">{e.category}</span><h2>{e.title}</h2><p>{e.description}</p><div className="meta">{e.date} · ₹{e.fee} · {e.venue}</div><div className="actions"><button className="outline" onClick={()=>startCreate(e)}>EDIT</button><button className="outline" onClick={()=>removeEvent(e.id)}>DELETE</button></div></article>)}</div></>}
    {page==='Participants'&&<><div className="stats"><div><small>PENDING</small><strong>{counts.pending}</strong></div><div><small>APPROVED</small><strong>{counts.approved}</strong></div><div><small>REJECTED</small><strong>{counts.rejected}</strong></div></div><div className="applicationlist">{apps.map(a=><div className="participant"><div><span className="tag">{a.category}</span><h2>{a.participant}</h2><p>{a.event} · {a.type} · ₹{a.fee}</p><small>{a.id}</small></div><div className="review"><span className={'status '+a.status.toLowerCase()}>{a.status}</span>{a.status==='Pending'&&<><button className="approve" onClick={()=>status(a.id,'Approved')}>APPROVE</button><button className="reject" onClick={()=>status(a.id,'Rejected')}>REJECT</button></>}</div></div>)}</div></>}
   </section>
  </main>
  {modal&&<div className="shade" onClick={()=>setModal('')}><div className="dialog" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setModal('')}>×</button>
   {modal==='details'&&selected&&<><span className="tag">{selected.category}</span><h2>{selected.title||selected.event}</h2><p>{selected.description||'Event information and registration details.'}</p><div className="detailgrid"><span>DATE<strong>{selected.date}</strong></span><span>VENUE<strong>{selected.venue||'Campus venue'}</strong></span><span>FEE<strong>₹{selected.fee}</strong></span><span>FORMAT<strong>{selected.type||'Solo / Duo / Group'}</strong></span></div><h3>Participation rules</h3><p>{selected.rules||'Follow the event organizer instructions and carry your college ID.'}</p>{role==='Student'&&<button className="darkbtn full" onClick={()=>apply(selected)}>APPLY FOR THIS EVENT · ₹{selected.fee}</button>}</>}
   {modal==='edit'&&<><span className="eyebrow">ORGANIZER WORKSPACE</span><h2>{form.id?'Edit event':'Create an event'}</h2>{[['title','Event name'],['date','Event date'],['deadline','Registration deadline'],['venue','Venue'],['fee','Registration fee (₹)'],['description','Description'],['rules','Participation rules'],['type','Participation format']].map(([k,l])=><label>{l}{k==='description'||k==='rules'?<textarea value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input type={k==='date'||k==='deadline'?'date':k==='fee'?'number':'text'} value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</label>)}<label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Cultural','Technical','Sports','Academic'].map(x=><option>{x}</option>)}</select></label><button className="darkbtn full" onClick={saveEvent}>SAVE EVENT</button></>}
  </div></div>}
  {notice&&<div className="toast">{notice}</div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);