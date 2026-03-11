import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#0B1B3D] p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#D4AF37]" size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Admin Portal</h2>
          <p className="text-gray-300 text-sm mt-2">Sign in to manage bookings</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#0B1B3D] focus:border-[#0B1B3D]"
                placeholder="Enter admin username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#0B1B3D] focus:border-[#0B1B3D]"
                placeholder="Enter password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0B1B3D] text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Demo Credentials: admin / admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
