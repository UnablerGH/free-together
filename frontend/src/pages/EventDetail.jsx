import React,{useEffect,useState}from'react';import{fetchEvent,createResponse,deleteEvent}from'../api';import{useParams,useNavigate}from'react-router-dom';
export default function EventDetail(){
  const{id}=useParams();const nav=useNavigate();const[event,setEvent]=useState(null);
  useEffect(()=>{fetchEvent(id).then(setEvent)},[id]);if(!event)return<div>Loading...</div>;
  async function handleDelete(){await deleteEvent(id);nav('/events');}
  async function handleRSVP(){await createResponse(id,{availability:{slot1:1}});alert('RSVP sent');}
  return(
    <div>
      <h1>{event.name}</h1>
      <button onClick={handleRSVP}>RSVP Yes for slot1</button>
      <button onClick={handleDelete} style={{marginLeft:10}}>Delete Event</button>
    </div>
  );
}