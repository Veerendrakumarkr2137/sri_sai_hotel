import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile(){

  const [user,setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(()=>{

    const storedUser = localStorage.getItem("user");

    if(!storedUser){
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));

  },[]);

  if(!user){
    return <div className="p-20 text-center">Loading...</div>;
  }

  return(

    <div className="min-h-screen bg-slate-50 py-16">

      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-3xl font-serif font-bold text-[#0B1B3D] mb-6">
          My Profile
        </h1>

        <div className="space-y-4 text-gray-700">

          <div>
            <span className="font-semibold">Name:</span> {user.name}
          </div>

          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>

        </div>

      </div>

    </div>

  );

}