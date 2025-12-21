"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useFormContext } from "@/context/context";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { registerUser } from "@/lib/apicall/user";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

export default function SignUpPage() {
  const [registerMessage, setRegisterMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
  } = useFormContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {};

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
      isValid = false;
    }
    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
      isValid = false;
    }
    if (formData.confirmPassword?.trim() !== formData.password.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
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
    setRegisterMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await handleRegister();
      } catch (error) {
        console.error("Error registering user:", error);
        setIsLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    try {
      const response = await registerUser(formData);

      if (response.ok) {
        const data = await response();
        setRegisterMessage("Account created successfully! Redirecting...");

        localStorage.setItem("token", data.token);

        setTimeout(() => {
          resetForm();
          router.push("/Dashboard");
        }, 1500);
      } else {
        const errorData = await response;
        console.error("Error registering user:", errorData);
        setRegisterMessage(errorData.error);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setRegisterMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLoginClick = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen bg-[#0c0f1a] text-white overflow-hidden relative">
      <Navbar />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_25%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0e17]" />

      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">
            StudyMate
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
            Create your desk and keep every study session connected.
          </h1>
          <p className="text-white/70 max-w-xl">
            Upload, embed, generate flashcards, and quiz yourself—all inside one
            workspace built for deliberate learning.
          </p>
          <div className="flex gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              Project-aware embeddings
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              Flashcards on upload
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              Questions that adapt
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Card className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-[0_30px_90px_-50px_rgba(0,0,0,0.8)]">
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Create your account</h2>
                <p className="text-white/70 text-sm">
                  Join StudyMate and start your next session
                </p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-white/80">
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/80">
                    Email Address
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
                  <Label htmlFor="password" className="text-sm font-medium text-white/80">
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-12 pr-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {registerMessage && (
                  <div className="p-4 rounded-xl text-center font-medium bg-green-900/30 text-green-200 border border-green-800/60">
                    {registerMessage}
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
                      Create account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-white/70">
                    Already have an account?{" "}
                    <Link href="/login" onClick={handleLoginClick}>
                      <span className="font-semibold text-white hover:text-white/80 transition-colors duration-200 cursor-pointer">
                        Sign in
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
