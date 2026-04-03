import React, { useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_URL } from "../lib/api";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      const { data } = await axios.post(`${API_URL}/api/auth/login`, payload);
      if (!data?.success) {
        throw new Error(data?.error || "Login failed");
      }
      loginUser(data.token, data.user);
      toast.success("Login successful");
      navigate(redirectTo);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
      const fallbackMessage = err?.message?.includes("Network") || !err?.response
        ? "Unable to reach the server. Please check the API URL or try again."
        : "Login failed";
      toast.error(serverMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/google`, {
        idToken: credentialResponse.credential,
      });

      if (!data?.success) {
        throw new Error(data?.error || "Google login failed");
      }

      loginUser(data.token, data.user);
      toast.success("Login successful");
      navigate(redirectTo);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
      const fallbackMessage = err?.message?.includes("Network") || !err?.response
        ? "Unable to reach the server. Please check the API URL or try again."
        : err?.message || "Google login failed";
      toast.error(serverMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{" "}
            <Link to={`/register${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:z-10 sm:text-sm transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:z-10 sm:text-sm transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="mt-4 flex justify-center">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed. Please try again.")}
                useOneTap={false}
              />
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                Continue with Google
              </button>
            )}
          </div>
          {!googleClientId && import.meta.env.DEV && (
            <p className="mt-2 text-center text-xs text-slate-400">
              Set VITE_GOOGLE_CLIENT_ID to enable Google login.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

