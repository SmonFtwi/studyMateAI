//import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
		<Navbar/>
		<section className="flex flex-col items-center  gap-4 py-5 md:py-5">
			<div className="inline-block max-w-lg ">
				{children}
			</div>
		</section>
		{/* <Footer/> */}
		</>
	);
}
