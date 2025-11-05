// components/AboutSection.js
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Globe, Users } from "lucide-react";
import Footer from "@/components/footer";

export default function AboutSection() {
  return (
    <>
      <Navbar />

      <section className="py-16 px-6 md:px-10">
        {/* Overview Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-20 mb-16">
          <div className="flex flex-col flex-1 gap-10">
            <div className="flex-1">
              <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
              <p className="leading-relaxed">
                Al Samamat has been a trusted name for over 28 years, delivering
                solutions that drive industrial progress. From advanced machinery
                to expert services, we meet the diverse needs of our clients with
                precision and excellence.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="leading-relaxed">
                To consistently deliver high-quality, efficient services that drive
                national growth, provide rewarding careers, and exceed client
                expectations. We are dedicated to innovation and building a
                sustainable future.
              </p>
            </div>
          </div>
          <div className="flex-1">
            <Image
              src="/about.png"
              alt="About Us Illustration"
              className="rounded-md"
              width={400}
              height={400}
            />
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8">
            Why Choose Al Samamat?
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "28+ Years of Excellence",
                description:
                  "Decades of experience delivering innovative industrial solutions.",
                icon: <CheckCircle className="w-10 h-10 mb-4" />,
              },
              {
                title: "Global Reach",
                description:
                  "We cater to clients across the globe with tailored solutions.",
                icon: <Globe className="w-10 h-10 mb-4" />,
              },
              {
                title: "Dedicated Team",
                description:
                  "A team of professionals committed to delivering quality and excellence.",
                icon: <Users className="w-10 h-10 mb-4" />,
              },
            ].map((highlight, index) => (
              <div
                key={index}
                className="p-6 border rounded-md shadow-md flex flex-col items-center text-center"
              >
                {highlight.icon}
                <h4 className="text-lg font-medium mb-2">{highlight.title}</h4>
                <p>{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
            <p>
              Phone: +966 (14) 325 - 4047 <br />
              Email: <br />
              <Link href="mailto:info@alsamamat.com" className="underline">
                info@alsamamat.com
              </Link>
              ,
              <Link href="mailto:contact@alsamamat.com" className="underline">
                contact@alsamamat.com
              </Link>
            </p>
            <p>
              Website: <br />
              <Link
                href="http://www.alsamamat.com"
                target="_blank"
                className="underline"
                rel="noopener noreferrer"
              >
                www.alsamamat.com
              </Link>
            </p>
          </div>

          {/* Interactive Contact Illustration */}
          {/* <div className="flex justify-center">
            <Image
              src="/contact-us.png"
              alt="Contact Us Illustration"
              width={400}
              height={400}
              className="rounded-md"
            />
          </div> */}
        </div>
        
      </section>
      <Footer/>
    </>
  );
}
