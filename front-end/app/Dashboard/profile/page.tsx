'use client'
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAuthContext } from '@/context/authContext';
import Link from 'next/link';
import { LogOut, Mail, User, Camera, Loader2 } from 'lucide-react';
import { updateProfileImage } from '@/lib/apicall/user';
import imageCompression from 'browser-image-compression';

const ProfilePage = () => {
  const { user, logout } = useAuthContext();
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image);
  const [profileImageBackup, setProfileImageBackup] = useState(user?.profile_image);

  useEffect(() => {
    // Sync profileImage with user.profile_image when user context updates
    if (user?.profile_image) {
      setProfileImage(user.profile_image);
    }

    console.log("user profile", user?.profile_image)
  }, [user]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token available");
      window.location.href = `/login`;
      return;
    }

    const files = event.target.files;
    if (files && files.length > 0) {
      setImageUploading(true);
      setProfileImage(URL.createObjectURL(files[0]));

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(files[0], options);
        const response = await updateProfileImage(compressedFile, token);
        
        if (response.url) {
          setProfileImage(response.url);
          setProfileImageBackup(response.url);
        } else {
          setProfileImage(profileImageBackup);
        }
      } catch (error) {
        console.error("File upload failed:", error);
        setProfileImage(profileImageBackup);
      } finally {
        setImageUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="max-w-2xl shadow-none border-none lg:mx-auto bg-transparent">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-primary/10 relative">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile Picture" />
                ) : (
                  <AvatarFallback>{user?.username[0]}</AvatarFallback>
                )}
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </Avatar>
              <label 
                htmlFor="profile-image-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera className="w-8 h-8" />
              </label>
              <input
                type="file"
                id="profile-image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={imageUploading}
              />
            </div>
            
            <div className="flex-1 flex justify-between text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight">{user?.username}</h1>
              <div className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
                {user?.role}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span>{user?.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Link 
                href="/" 
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 hover:opacity-80 transition-opacity"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;