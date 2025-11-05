// components/AboutSection.js
import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Left Section: Images */}
        <div className="flex-1 flex flex-col items-center gap-6">
          <div className="relative w-full max-w-sm">
            <Image
              src="/images1.jpg" // Replace with the actual image path
              alt="Overview of Al Samamat"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="relative w-full max-w-sm">
            <Image
              src="/images2.jpg" // Replace with the actual image path
              alt="Overview of Al Samamat"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Right Section: Content */}
        <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Your Vision
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Al Samamat combines advanced AI technology with decades of industry
            experience to deliver solutions that drive innovation and success.
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-1 gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                <span className="text-xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Innovative AI Tools</h3>
                <p className="text-sm md:text-base mt-2">
                  Leverage cutting-edge AI algorithms to streamline workflows
                  and achieve faster results.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                <span className="text-xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Decades of Expertise</h3>
                <p className="text-sm md:text-base mt-2">
                  Over 28 years of precision and innovation tailored to meet
                  your unique needs.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-900  flex items-center justify-center">
                <span className="text-xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Comprehensive Solutions</h3>
                <p className="text-sm md:text-base mt-2">
                  From advanced machinery to expert guidance, we provide end-to-end
                  solutions for success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
