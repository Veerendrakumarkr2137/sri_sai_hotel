import { useEffect,useState } from "react";

export default function Profile(){

  const [user,setUser] = useState<any>(null);

  useEffect(()=>{

    const token = localStorage.getItem("token");

    fetch("/api/profile",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.success){
        setUser(data.user);
      }
    })

  },[])

  if(!user) return <div>Loading...</div>

  return(

    <div style={{padding:"40px"}}>

      <h2>My Profile</h2>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>

    </div>

  )

}