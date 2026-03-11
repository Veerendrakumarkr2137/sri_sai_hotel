import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e:any) => {
    e.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            name: data.user.name,
            email: data.user.email
        }));
        navigate("/");
    }

  return (
    <div style={{padding:"40px"}}>
      <h2>User Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
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

        <button type="submit">Login</button>

      </form>
    </div>
  );
}
}