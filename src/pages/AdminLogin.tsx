import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { setAdminSession } from "../lib/auth";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAdminSession(data.token);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (requestError) {
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
        className="max-w-md w-full overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="bg-[#0B1B3D] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Lock className="text-[#D4AF37]" size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-300">Sign in to manage bookings</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-md border border-gray-300 p-3 focus:border-[#0B1B3D] focus:ring-[#0B1B3D]"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-md border border-gray-300 p-3 focus:border-[#0B1B3D] focus:ring-[#0B1B3D]"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#0B1B3D] py-3 font-medium text-white transition-colors disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
