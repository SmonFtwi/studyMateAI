/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiSearch, CiMenuBurger } from "react-icons/ci";
import React from "react";





import { ModeToggle } from "../../theme-mode";



interface Props {
  handleToggle: () => void;
}

export const DashNavBar: React.FC<Props> = ({ handleToggle }) => {
//const {logout} = useAuthContext();
  return (
    <nav className=" custom-bg-nav  sticky top-0 flex justify-between items-center px-6 py-4 w-full   ">
    {/* Sidebar Trigger and Logo */}
    <div className="flex items-center space-x-4">
    <CiMenuBurger size={32} onClick={handleToggle} className="cursor-pointer" />
     
    </div>

    {/* Right Section: Mode Toggle and Profile Dropdown */}
    <div className="flex items-center space-x-4">
      <ModeToggle />
      
    </div>
  </nav>
      
   
  );
};
