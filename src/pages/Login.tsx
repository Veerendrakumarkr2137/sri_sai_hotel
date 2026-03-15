import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUserSession, type SessionUser } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Login failed");
        return;
      }

      setUserSession(data.token, data.user as SessionUser);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-96 rounded bg-white p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Login
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border p-3"
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border p-3"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-[#0B1B3D] py-3 text-white disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-3 text-right text-sm">
          <Link to="/forgot-password" className="text-[#0B1B3D] hover:underline">
            Forgot password?
          </Link>
        </p>

        <p className="mt-4 text-center text-sm">
          {"Don't have an account? "}
          <Link to="/register" className="text-[#D4AF37]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
