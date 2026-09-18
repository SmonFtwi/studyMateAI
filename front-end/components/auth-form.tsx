"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, BookOpen, Check } from "lucide-react";
import Navbar from "./navbar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { loginUser, registerUser } from "@/lib/apicall/user";
export function AuthShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <>
      <Navbar />
      <main className="page-width grid gap-12 py-12 lg:grid-cols-2 lg:items-center lg:gap-24 lg:py-20">
        <div>
          <p className="eyebrow mb-5">Your next chapter starts here</p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight max-w-lg">
            A clear head.
            <br />A focused <span className="accent">study space.</span>
          </h1>
          <p className="muted mt-6 text-lg leading-8 max-w-md">
            Bring your materials together and make progress, one idea at a time.
          </p>
          <ul className="mt-8 space-y-4 muted text-sm">
            {[
              "Keep each subject organized",
              "Ask questions about your notes",
              "Practice with flashcards and quizzes",
            ].map((t) => (
              <li key={t} className="flex gap-3 items-center">
                <Check size={16} className="accent" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 hidden lg:flex gap-3 items-center border-t pt-6 text-sm muted">
            <BookOpen size={20} />
            Built around the way you learn.
          </div>
        </div>
        <section className="surface w-full max-w-lg rounded-2xl p-6 sm:p-9">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="muted mt-2 mb-7 text-sm leading-6">{description}</p>
          {children}
        </section>
      </main>
    </>
  );
}
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "new-password",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          required
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pr-12"
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center muted"
          onClick={() => setVisible((v) => !v)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
export default function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (register && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      let data;
      if (register) {
        data = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword: confirm,
        });
      } else {
        const res = await loginUser(email.trim(), password);
        data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error ||
              data.detail ||
              "Sign in failed. Check your email and password.",
          );
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        setSuccess("You’re signed in. Opening your projects…");
        router.push("/Dashboard");
      } else if (register) {
        setSuccess(
          data.message ||
            "Your account was created. Check your email to confirm your account, then sign in.",
        );
      } else throw new Error("Sign in failed. Please try again.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      title={register ? "Create your account" : "Welcome back"}
      description={
        register
          ? "Make a little room for better learning."
          : "Sign in to pick up where you left off."
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {register && (
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
              Name
            </label>
            <Input
              id="name"
              autoComplete="name"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={register ? "new-password" : "current-password"}
        />
        {register ? (
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
          />
        ) : (
          <div className="text-right">
            <Link href="/login/confirmcode" className="accent text-sm">
              Forgot your password?
            </Link>
          </div>
        )}
        {error && (
          <p role="alert" className="notice text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {success && (
          <div role="status" className="notice">
            {success}
            {register && (
              <Link className="accent block mt-2" href="/login">
                Go to sign in
              </Link>
            )}
          </div>
        )}
        <Button type="submit" disabled={busy || !!success} className="w-full">
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
          <ArrowRight size={16} />
        </Button>
        <p className="muted text-center text-sm">
          {register ? "Already have an account? " : "New to StudyMate? "}
          <Link className="accent" href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
