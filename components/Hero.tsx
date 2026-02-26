"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="w-full min-h-screen -mt-20 md:mt-0 flex flex-col justify-center items-center bg-[#1d1d1d] text-white px-4 sm:px-6 lg:px-8 gap-16 sm:gap-32">
      {/* Heading */}
      <div
        className={`max-w-xl sm:max-w-2xl w-full text-left transform transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-0"
        }`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-light leading-tight">
          AgentPome<br />
          <span className="font-medium">Personal CyberSecurity</span><br />
          For Individuals
        </h1>
      </div>

      {/* Subtext */}
      <p
        className={`text-gray-400 text-base sm:text-lg transition-opacity duration-1000 delay-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* <span className="text-white font-medium">0</span>
        {" "} Individuals Secured */}

      </p>
    </section>
  );
}
