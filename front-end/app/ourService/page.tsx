// components/ServicesPage.js
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
//import Image from "next/image";
import { Briefcase, Wrench, Award, Globe, ShieldCheck } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Industrial Equipment Supply",
      description:
        "We provide top-of-the-line industrial equipment to meet diverse business needs, ensuring quality and efficiency in operations.",
      icon: <Wrench className="w-10 h-10 mb-4" />,
    },
    {
      title: "Maintenance Services",
      description:
        "Comprehensive maintenance services to keep your operations running smoothly and minimize downtime.",
      icon: <ShieldCheck className="w-10 h-10 mb-4" />,
    },
    {
      title: "Consultancy Solutions",
      description:
        "Expert consultancy to help businesses optimize their industrial processes and achieve operational excellence.",
      icon: <Briefcase className="w-10 h-10 mb-4" />,
    },
    {
      title: "Global Reach",
      description:
        "Expanding our services across borders to deliver innovative solutions globally.",
      icon: <Globe className="w-10 h-10 mb-4" />,
    },
    {
      title: "Award-Winning Solutions",
      description:
        "Recognized for delivering high-quality and innovative solutions to a wide range of industries.",
      icon: <Award className="w-10 h-10 mb-4" />,
    },
  ];

  return (
    <>
      <Navbar />

      <section className="py-16 px-6 md:px-10">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Al Samamat offers a comprehensive range of services designed to support
            businesses in achieving their industrial goals efficiently and
            effectively.
          </p>
        </div>

        {/* Services Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 border rounded-md shadow-md flex flex-col items-center text-center"
            >
              {service.icon}
              <h4 className="text-lg font-medium mb-2">{service.title}</h4>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

       
      </section>
      <Footer/>
    </>
  );
}
