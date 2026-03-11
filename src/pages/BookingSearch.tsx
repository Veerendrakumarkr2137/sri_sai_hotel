import { useState } from "react";

export default function BookingSearch() {

  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<any>(null);

  const searchBooking = async () => {

    const res = await fetch("/api/search-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bookingRef,
        email
      })
    });

    const data = await res.json();

    if (data.success) {
      setBooking(data.booking);
    } else {
      alert("Booking not found");
    }

  };

  return (
    <div style={{padding:"40px"}}>

      <h2>Find My Booking</h2>

      <input
        placeholder="Booking ID"
        value={bookingRef}
        onChange={(e)=>setBookingRef(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <button onClick={searchBooking}>
        Search
      </button>

      {booking && (

        <div style={{marginTop:"30px"}}>

          <h3>Booking Details</h3>

          <p>Room: {booking.roomType}</p>
          <p>Check-in: {booking.checkIn}</p>
          <p>Check-out: {booking.checkOut}</p>
          <p>Guests: {booking.guests}</p>
          <p>Status: {booking.status}</p>

        </div>

      )}

    </div>
  );
}