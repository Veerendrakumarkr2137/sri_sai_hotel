import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register(){

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleRegister = async(e:any)=>{

    e.preventDefault();

    setLoading(true);

    try{

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

        alert("Registration successful");

        navigate("/login");

      }else{

        alert(data.error || "Registration failed");

      }

    }catch(error){

      alert("Server error");

    }

    setLoading(false);

  };

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-serif font-bold text-center text-[#0B1B3D] mb-6">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1B3D] text-white py-3 rounded-md hover:bg-opacity-90"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#D4AF37] font-medium">
            Login
          </Link>
        </p>

      </div>

    </div>

  );

}