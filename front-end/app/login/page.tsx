"use client";

import Link from "next/link";
import React, { useState, ChangeEvent } from "react";
import { useFormContext } from "@/context/context";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser } from "@/lib/apicall/user";
import Navbar from "@/components/navbar";
import { CosmicBackground } from "@/components/LandingPage/CosmicBackground";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginMessage, setLoginMessage] = useState<string>("");

  const { formData, setFormData, errors, setErrors, isLoading, setIsLoading } =
    useFormContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
    setLoginMessage("");
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {};
    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
      isValid = false;
    }
    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setLoginMessage("");
    setShowPassword(false);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const newErrors: FormErrors = {};
      const response = await loginUser(formData.email, formData.password);
      const data = await response.json();

      if (response.ok && data.token) {
        setLoginMessage("Login successful! Redirecting...");

        localStorage.setItem("token", data.token);

        setTimeout(() => {
          resetForm();
          window.location.href = "/Dashboard";
        }, 1500);
      } else {
        if (data.error === "Invalid email") {
          newErrors.email = "Invalid email address";
        } else if (data.error === "Invalid password") {
          newErrors.password = "Invalid password";
        } else {
          setLoginMessage("Login failed. Please check your credentials.");
        }
        setErrors(newErrors);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      await handleLogin();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden relative">
      <CosmicBackground />
      <Navbar />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-16 flex flex-col justify-center items-center lg:flex-row gap-20">
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400 font-bold">
            StudyMate AI
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Sign in and get back to <span className="text-gradient-cosmic">Intelligent Learning.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl leading-relaxed">
            Your projects, embeddings, flashcards, and answers stay organized in
            one desk. Pick up exactly where you left off.
          </p>
          <div className="grid gap-4 text-sm text-white/50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              Instant answers from your documents
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Flashcards generated on upload
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              Project-aware cosmic chat
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <Card className="w-full glass-cosmos border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="text-white/70 text-sm">
                  Sign in to access your StudyMate desk
                </p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white/80"
                  >
                    Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-white/80"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 pr-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <Link href="/login/confirmcode">
                    <span className="text-sm font-medium text-white hover:text-white/80 transition-colors duration-200 cursor-pointer">
                      Forgot your password?
                    </span>
                  </Link>
                </div>

                {errors.general && (
                  <div className="p-4 rounded-xl text-center font-medium bg-red-900/30 text-red-200 border border-red-800/60">
                    {errors.general}
                  </div>
                )}

                {loginMessage && (
                  <div
                    className={`p-4 rounded-xl text-center font-medium ${
                      loginMessage.includes("successful")
                        ? "bg-green-900/30 text-green-200 border border-green-800/60"
                        : "bg-red-900/30 text-red-200 border border-red-800/60"
                    }`}
                  >
                    {loginMessage}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center py-3">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
                      <div className="absolute inset-0 rounded-full bg-white/10 opacity-30"></div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full h-12 bg-white text-[#0c0f1a] hover:bg-white/90 font-semibold rounded-xl shadow-lg transition-all duration-200"
                  >
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-white/70">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" onClick={handleRegisterClick}>
                      <span className="font-semibold text-white hover:text-white/80 transition-colors duration-200 cursor-pointer">
                        Create account
                      </span>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
