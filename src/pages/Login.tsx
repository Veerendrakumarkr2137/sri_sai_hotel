import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async(e:any)=>{

    e.preventDefault();

    const res = await fetch("/api/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if(data.success){

      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify(data.user));

      alert("Login successful");

      window.location.href = "/";

    }else{

      alert(data.error || "Login failed");

    }

  };

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="bg-white p-8 rounded shadow w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button className="w-full bg-[#0B1B3D] text-white py-3 rounded">
            Login
          </button>

        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#D4AF37]">
            Register
          </Link>
        </p>

      </div>

    </div>

  );

}