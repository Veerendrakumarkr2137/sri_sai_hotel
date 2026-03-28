import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  CalendarDays,
  LockKeyhole,
  LogOut,
  Mail,
  PencilLine,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  clearUserSession,
  createAuthHeaders,
  getStoredUser,
  getUserToken,
  updateStoredUser,
  type SessionUser,
} from "../lib/auth";
import { API_BASE_URL } from "../lib/api";
import { hoverLift, revealSoft, revealUp, sectionStagger } from "../lib/animations";

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export default function Profile() {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
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
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
          const fetchedUser = data.user as SessionUser;
          updateStoredUser(fetchedUser);
          setUser(fetchedUser);
          setProfileName(fetchedUser.name);
          setProfileEmail(fetchedUser.email);
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

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getUserToken();

    if (!token) {
      clearUserSession();
      navigate("/login", { replace: true });
      return;
    }

    setProfileError("");
    setProfileNotice("");
    setIsSavingProfile(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
        }),
      });
      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        clearUserSession();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        setProfileError(data.error || "Unable to update your profile.");
        return;
      }

      const updatedUser = data.user as SessionUser;
      updateStoredUser(updatedUser);
      setUser(updatedUser);
      setProfileName(updatedUser.name);
      setProfileEmail(updatedUser.email);
      setProfileNotice("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch {
      setProfileError("Unable to update your profile right now.");
    } finally {
      setIsSavingProfile(false);
    }
  };

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
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
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
    } catch {
      setPasswordError("Unable to update your password right now.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleStartEditing = () => {
    if (!user) {
      return;
    }

    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfileError("");
    setProfileNotice("");
    setIsEditingProfile(true);
  };

  const handleCancelEditing = () => {
    if (!user) {
      return;
    }

    setIsEditingProfile(false);
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfileError("");
    setProfileNotice("");
  };

  const accountInitials = useMemo(() => getInitials(user?.name || ""), [user?.name]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-4 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <span className="text-slate-700">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-20 text-center text-red-600">{error || "Profile unavailable"}</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="motion-float absolute left-[8%] top-24 h-36 w-36 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="motion-float-delayed absolute right-[10%] top-40 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionStagger}
        className="relative mx-auto max-w-6xl px-4"
      >
        <motion.section
          variants={revealSoft}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
        >
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#38bdf8_100%)] px-8 py-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/20 bg-white/10 text-2xl font-black tracking-wide shadow-lg shadow-slate-950/15 backdrop-blur">
                  {accountInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-100/80">
                    Guest Account
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight">{user.name}</h1>
                  <p className="mt-2 text-sm text-sky-100/85">
                    Keep your contact details updated so booking confirmations and payment updates always reach you.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-100/70">Email</p>
                  <p className="mt-2 text-sm font-semibold">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-100/70">Security</p>
                  <p className="mt-2 text-sm font-semibold">Password protected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 bg-slate-50/80 px-8 py-5 md:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              Profile email powers booking communication
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              Password updates take effect immediately
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-white p-2 text-amber-600 shadow-sm">
                <CalendarDays className="h-4 w-4" />
              </div>
              Booking history stays linked to this account
            </div>
          </div>
        </motion.section>

        {error && (
          <motion.div
            variants={revealUp}
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            variants={revealSoft}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Personal Details</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Profile Information</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Update the name and email address you want attached to your hotel account.
                </p>
              </div>

              {!isEditingProfile && (
                <motion.button
                  whileHover={hoverLift}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-blue-600"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit Profile
                </motion.button>
              )}
            </div>

            {profileError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </div>
            )}

            {profileNotice && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {profileNotice}
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={profileEmail}
                        onChange={(event) => setProfileEmail(event.target.value)}
                        type="email"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Your email address is used for booking confirmations, payment updates, and important stay details.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Full Name</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{user.name}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Email Address</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900 break-all">{user.email}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Account Note</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Keep this profile current so every reservation, cancellation update, and payment reminder is tied to the right email address.
                  </p>
                </div>
              </div>
            )}
          </motion.section>

          <div className="space-y-6">
            <motion.section
              variants={revealSoft}
              className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5"
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Security</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Change Password</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a new password with at least 8 characters for better account protection.
                </p>
              </div>

              {passwordError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              {passwordNotice && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {passwordNotice}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Password changes apply right away. Use a strong password you do not reuse elsewhere.
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </motion.section>

            <motion.section
              variants={revealSoft}
              className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5"
            >
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Quick Actions</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Your Account</h2>
              </div>

              <div className="space-y-3">
                <motion.div whileHover={hoverLift}>
                  <Link
                    to="/my-bookings"
                    className="flex items-center justify-between rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">View My Bookings</p>
                        <p className="text-sm text-slate-500">Check your upcoming stays and booking status.</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={hoverLift}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    clearUserSession();
                    navigate("/");
                  }}
                  className="flex w-full items-center justify-between rounded-[1.5rem] border border-red-100 bg-red-50 px-5 py-4 text-left transition-colors hover:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2.5 text-red-600 shadow-sm">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Log Out</p>
                      <p className="text-sm text-slate-500">Sign out of your account on this device.</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
