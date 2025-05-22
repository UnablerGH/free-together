import React,{useEffect,useState}from'react';import{fetchEvents,createEvent,deleteEvent}from'../api';
export default function Events(){
  const[events,setEvents]=useState([]);const[form,setForm]=useState({name:'',type:'once',timezone:'Europe/Warsaw',access:'public'});
  useEffect(()=>{fetchEvents().then(setEvents)},[]);
  async function handleCreate(e){e.preventDefault();const ev=await createEvent(form);setEvents([...events,{...form,eventId:ev.eventId}])}
  async function handleDelete(id){await deleteEvent(id);setEvents(events.filter(e=>e.eventId!==id));}
  return(
    <div>
      <h1>Your Events</h1>
      <form onSubmit={handleCreate} style={{marginBottom:20}}>
        <input placeholder='Name' required onChange={e=>setForm({...form,name:e.target.value})}/>
        <select onChange={e=>setForm({...form,type:e.target.value})}><option value='once'>Once</option><option value='weekly'>Weekly</option></select>
        <input placeholder='Timezone' onChange={e=>setForm({...form,timezone:e.target.value})}/>
        <select onChange={e=>setForm({...form,access:e.target.value})}><option>public</option><option>restricted</option></select>
        <button type='submit'>Create Event</button>
      </form>
      <ul>{events.map(e=>(<li key={e.eventId}>{e.name} <button onClick={()=>handleDelete(e.eventId)}>Delete</button></li>))}</ul>
    </div>
  );
}