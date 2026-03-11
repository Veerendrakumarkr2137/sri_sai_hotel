import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async (e:any) => {

    e.preventDefault();

    const res = await fetch("/api/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await res.json();

    if(data.success){
      alert("Account created");
      navigate("/login");
    }else{
      alert(data.error);
    }

  }

  return (

    <div style={{padding:"40px"}}>

      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>

        <input
        placeholder="Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        />

        <br/><br/>

        <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

        <br/><br/>

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        />

        <br/><br/>

        <button>Create Account</button>

      </form>

    </div>

  );

}