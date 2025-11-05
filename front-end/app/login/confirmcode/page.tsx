'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';

export default function PasswordReset() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSendEmail = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    setEmailError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_url}/auth/sendVerificationEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.field === 'email') setEmailError(errorData.message);
        throw new Error(errorData.message);
      }
      setStep(2);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    setCodeError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_url}/auth/confirmVerificationCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: confirmationCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setCodeError(errorData.message);
        throw new Error(errorData.message);
      }
      setStep(3);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    setPasswordError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_url}/auth/updatePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password:newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setPasswordError(errorData.message);
        throw new Error(errorData.message);
      }

      router.push(`/login`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center px-6 py-8 mx-auto max-w-3xl  lg:py-0 ">
      <div className=" w-full md:w-[35vw]  bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md p-10  dark:bg-gray-950 dark:border-gray-700 ">
        <h2 className="text-center text-2xl font-bold mb-6 dark:text-white">
          {step === 1 ? 'Reset Password' : step === 2 ? 'Enter Confirmation Code' : 'Set New Password'}
        </h2>

        {loading && (
           <div className="flex justify-center">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
         </div>
        )}

        <form onSubmit={step === 1 ? handleSendEmail : step === 2 ? handleConfirmCode : handleUpdatePassword}>
          {step === 1 && (
            <>
              <Input
                type="email"
                
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4"
                
                aria-label="Email Address"
              />
              <p className="text-red-500 text-sm">{emailError}</p>
              <Button type="submit"  className="mt-4 w-full bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-700 dark:bg-blue-500 text-gray-200 dark:text-gray-200">
                Get Confirmation Code
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                
                placeholder="Confirmation Code"
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mb-4"
                
                aria-label="Confirmation Code"
              />
              <p className="text-red-500 text-sm">{codeError}</p>
              <Button type="submit"  className="mt-4 w-full bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-700 dark:bg-blue-500 text-gray-200 dark:text-gray-200">
                Confirm Code
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Input
                type="password"
                
                placeholder="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                className="mb-4"
               
                aria-label="New Password"
              />
              <Input
                type="password"
                
                placeholder="Confirm New Password"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mb-4"
                
                aria-label="Confirm New Password"
              />
              <p className="text-red-500 text-sm">{passwordError}</p>
              <Button type="submit"  className="mt-4 w-full bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-700 dark:bg-blue-500 text-gray-200 dark:text-gray-200">
                Update Password
              </Button>
            </>
          )}
        </form>

        <div className="flex flex-col mt-10 justify-start items-start">
          <Link href="/login" className="font-medium text-sm dark:text-white text-gray-800 hover:underline">Back to Sign In
          </Link>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register">
                <span className="font-medium dark:text-white text-gray-800 hover:underline">
                  Create account here
                </span>
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
