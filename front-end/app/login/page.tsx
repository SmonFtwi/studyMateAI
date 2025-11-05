/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import React, { useState, ChangeEvent } from "react";
import { useFormContext } from "@/context/context";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { loginUser } from "@/lib/apicall/user";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function DocsPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginMessage, setLoginMessage] = useState<string>("");
  
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
  } = useFormContext();

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
    <>
      <div className="">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute top-40 left-20 w-48 h-48 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-xl"></div>
        </div>

        <div className="relative flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 min-h-screen">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Continue your learning journey with StudyMate
            </p>
          </div>

          <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="p-8 space-y-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-start ">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="h-12 pr-12 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm font-medium flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link href="/login/confirmcode">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                      Forgot your password?
                    </span>
                  </Link>
                </div>

                {/* General Error Message */}
                {errors.general && (
                  <div className="p-4 rounded-xl text-center font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {errors.general}
                  </div>
                )}

                {/* Success/Error Message */}
                {loginMessage && (
                  <div className={`p-4 rounded-xl text-center font-medium ${
                    loginMessage.includes('successful') 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {loginMessage}
                  </div>
                )}

                {/* Submit Button */}
                {isLoading ? (
                  <div className="flex justify-center py-3">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                      <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20"></div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
                  >
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Button>
                )}

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" onClick={handleRegisterClick}>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                        Create account here
                      </span>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>

          {/* Footer Features */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Smart Summaries
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Instant Flashcards
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                AI Chat Support
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </>
  );
}