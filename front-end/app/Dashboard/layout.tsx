'use client'
import { DashNavBar } from "@/components/dashboardComponent/navbar/dashNavbar";
import Sidebar from "@/components/dashboardComponent/sideBar";
//import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";

import { AuthProvider } from "@/context/authContext";
import { useState, useEffect } from "react";

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isToggled, setIsToggled] = useState(false);

	// Handle sidebar toggle
	const handleToggle = () => {
		setIsToggled(!isToggled);
	};

	// Close sidebar when clicking outside
	const handleClickOutside = (event: MouseEvent) => {
		const sidebar = document.getElementById("sidebar");
		if (sidebar && !sidebar.contains(event.target as Node)) {
			setIsToggled(false);
		}
	};

	useEffect(() => {
		if (isToggled) {
			document.addEventListener("click", handleClickOutside);
		} else {
			document.removeEventListener("click", handleClickOutside);
		}
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isToggled]);

	return (
		<>
			<AuthProvider>
				<div className="flex h-screen overflow-hidden gap-3 ">
					{/* Sidebar */}
					<Card
						id="sidebar"
						className={`md:relative absolute md:w-1/5 w-2/3  shadow-lg z-50 h-[98vh] mt-1 rounded-md transition-transform duration-300 ease-in-out ${
							isToggled
								? "fixed inset-0 transform translate-x-0 md:hidden"
								: "fixed inset-0 transform -translate-x-full md:translate-x-0 "
						}`}
					>
						<div className="flex flex-col h-full">
							<Sidebar />
						</div>
					</Card>
         


					{/* Main Content */}
					<main
						className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out w-full ${
							isToggled ? "md:ml-1/5  " : "ml-0"
						}`}
					>
						<div className="flex flex-col min-h-screen ">
							<DashNavBar handleToggle={handleToggle} />
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-xl"></div>
							<div className="absolute bottom-1/3 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-lg"></div>
							
							<Card className="flex-grow rounded-md custom-bg ">{children}</Card>
							
						</div>
					</main>
				</div>
			</AuthProvider>
		</>
	);
}
