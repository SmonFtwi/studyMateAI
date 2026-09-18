"use client";
import { useAuthContext } from "@/context/authContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, User } from "lucide-react";
export default function Profile() {
  const { user, logout } = useAuthContext();
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow mb-2">Your account</p>
      <h1 className="page-heading">Profile</h1>
      <p className="muted mt-3 mb-8 text-sm">
        Your account details, all in one place.
      </p>
      <section className="surface rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-5 border-b pb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user?.profile_image || undefined}
              alt="Your profile"
            />
            <AvatarFallback className="bg-blue-500/10 text-blue-500 text-2xl">
              {user?.username?.[0]?.toUpperCase() || <User />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold break-words">
              {user?.username || "Your profile"}
            </h2>
            {user?.role && (
              <p className="muted text-sm mt-2 capitalize">{user.role}</p>
            )}
          </div>
        </div>
        <dl className="space-y-6 py-7">
          <div>
            <dt className="muted text-sm flex items-center gap-2">
              <User size={16} />
              Name
            </dt>
            <dd className="mt-2 break-words">{user?.username || "—"}</dd>
          </div>
          <div>
            <dt className="muted text-sm flex items-center gap-2">
              <Mail size={16} />
              Email
            </dt>
            <dd className="mt-2 break-all">{user?.email || "—"}</dd>
          </div>
        </dl>
        <div className="border-t pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="muted text-xs max-w-sm">
            Profile photo updates are not available with the current account
            service.
          </p>
          <Button variant="outline" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
