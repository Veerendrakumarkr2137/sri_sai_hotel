import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../lib/api";

async function readResponseData(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
        resetUrl?: string;
      };
    } catch {
      return {};
    }
  }

  const text = await response.text();

  return {
    success: response.ok,
    error: text.trim() || undefined,
  };
}

function getRequestErrorMessage(
  response: Response,
  fallbackMessage: string,
  data?: { error?: string },
) {
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (response.status === 404) {
    return "This feature is not available on the running server yet. Restart the app and try again.";
  }

  return fallbackMessage;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await readResponseData(response);

      if (!response.ok || !data.success) {
        setError(getRequestErrorMessage(response, "Unable to process your request right now.", data));
        return;
      }

      setMessage(data.message || "If an account exists for that email, a reset link has been sent.");
      if (typeof data.resetUrl === "string") {
        setResetUrl(data.resetUrl);
      }
    } catch (requestError) {
      setError("Unable to process your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-3xl font-serif font-bold text-[#0B1B3D]">Forgot Password</h1>
        <p className="mb-6 text-sm text-slate-600">
          Enter your email address and we will send you a password reset link.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {resetUrl && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Development reset link:
            {" "}
            <a href={resetUrl} className="font-medium underline">
              Open reset page
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border p-3"
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#0B1B3D] py-3 text-white disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Remembered your password?
          {" "}
          <Link to="/login" className="font-medium text-[#D4AF37]">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
