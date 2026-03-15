import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

async function readResponseData(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is missing or invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await readResponseData(response);

      if (!response.ok || !data.success) {
        setError(getRequestErrorMessage(response, "Unable to reset your password.", data));
        return;
      }

      setMessage(data.message || "Password reset successful.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (requestError) {
      setError("Unable to reset your password right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-3xl font-serif font-bold text-[#0B1B3D]">Reset Password</h1>
        <p className="mb-6 text-sm text-slate-600">
          Choose a new password for your account. Passwords must be at least 8 characters long.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border p-3"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-md border p-3"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#0B1B3D] py-3 text-white disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Return to
          {" "}
          <Link to="/login" className="font-medium text-[#D4AF37]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
