import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearUserSession,
  createAuthHeaders,
  getStoredUser,
  getUserToken,
  updateStoredUser,
  type SessionUser,
} from "../lib/auth";

export default function Profile() {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isCancelled = false;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me", {
          headers: createAuthHeaders(token),
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403 || response.status === 404) {
          clearUserSession();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load your profile right now.");
        }

        if (!isCancelled) {
          updateStoredUser(data.user as SessionUser);
          setUser(data.user as SessionUser);
          setError("");
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load your profile right now.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getUserToken();

    if (!token) {
      clearUserSession();
      navigate("/login", { replace: true });
      return;
    }

    setPasswordError("");
    setPasswordNotice("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        clearUserSession();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        setPasswordError(data.error || "Unable to update your password.");
        return;
      }

      setPasswordNotice(data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setPasswordError("Unable to update your password right now.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="p-20 text-center text-red-600">{error || "Profile unavailable"}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-serif font-bold text-[#0B1B3D]">
            My Profile
          </h1>

          {error && (
            <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {error}
            </div>
          )}

          <div className="space-y-4 text-gray-700">
            <div>
              <span className="font-semibold">Name:</span> {user.name}
            </div>

            <div>
              <span className="font-semibold">Email:</span> {user.email}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-2 text-2xl font-serif font-bold text-[#0B1B3D]">Change Password</h2>
          <p className="mb-6 text-sm text-slate-600">
            Choose a new password with at least 8 characters.
          </p>

          {passwordError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {passwordError}
            </div>
          )}

          {passwordNotice && (
            <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {passwordNotice}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-md border p-3"
              autoComplete="current-password"
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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
              disabled={isChangingPassword}
              className="rounded-md bg-[#0B1B3D] px-6 py-3 text-white disabled:opacity-70"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
