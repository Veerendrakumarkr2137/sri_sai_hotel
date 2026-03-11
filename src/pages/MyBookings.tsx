import { useEffect,useState } from "react";

export default function MyBookings(){

  const [bookings,setBookings] = useState<any[]>([]);

  useEffect(()=>{

    const token = localStorage.getItem("token");

    fetch("/api/my-bookings",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.success){
        setBookings(data.bookings);
      }
    })

  },[])

  return(

    <div style={{padding:"40px"}}>

      <h2>My Bookings</h2>

      {bookings.map(b=>(
        <div key={b._id} style={{marginBottom:"20px"}}>
          <span
style={{
padding:"4px 10px",
background:
booking.status === "confirmed" ? "green" :
booking.status === "cancelled" ? "red" :
"orange",
color:"white",
borderRadius:"6px"
}}
>
{booking.status}
</span>
          <p>Booking ID: {b.bookingRef}</p>
          <p>Room: {b.roomType}</p>
          <p>Check-in: {b.checkIn}</p>
          <p>Check-out: {b.checkOut}</p>

        </div>
      ))}

    </div>

  )

}