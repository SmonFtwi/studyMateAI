"use client";
import { useState } from "react";
import Link from "next/link";
import { AuthShell, PasswordField } from "@/components/auth-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function PasswordReset() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (step === 3 && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const endpoint = [
        "sendVerificationEmail",
        "confirmVerificationCode",
        "updatePassword",
      ][step - 1];
      const body =
        step === 1
          ? { email }
          : step === 2
            ? { email, code }
            : { email, password };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_url || process.env.NEXT_PUBLIC_backend_url}/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            data.detail ||
            "We couldn’t complete this step. Please try again.",
        );
      }
      if (step === 3) setDone(true);
      else setStep((v) => v + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      title={
        done
          ? "Password updated"
          : [
              "Reset your password",
              "Check your email",
              "Choose a new password",
            ][step - 1]
      }
      description={
        done
          ? "You can now sign in with your new password."
          : `Step ${step} of 3 · ${["Enter the email for your account.", "Enter the confirmation code sent to your email.", "Choose a password and confirm it below."][step - 1]}`
      }
    >
      {!done && (
        <form onSubmit={submit} className="space-y-5">
          {step === 1 ? (
            <div>
              <label htmlFor="reset-email" className="block text-sm mb-2">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : step === 2 ? (
            <div>
              <label htmlFor="code" className="block text-sm mb-2">
                Confirmation code
              </label>
              <Input
                id="code"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="muted text-xs mt-3">Sent to {email}</p>
            </div>
          ) : (
            <>
              <PasswordField
                id="new-password"
                label="New password"
                value={password}
                onChange={setPassword}
              />
              <PasswordField
                id="confirm-new-password"
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
              />
            </>
          )}
          {error && (
            <p role="alert" className="notice text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button disabled={busy} className="w-full">
            {busy
              ? "Please wait…"
              : ["Send confirmation code", "Confirm code", "Update password"][
                  step - 1
                ]}
          </Button>
          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setStep(1);
                setError("");
              }}
            >
              Start again
            </Button>
          )}
        </form>
      )}
      <Link href="/login" className="accent block text-sm mt-6">
        Back to sign in
      </Link>
    </AuthShell>
  );
}
