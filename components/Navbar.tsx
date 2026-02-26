import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm rounded-bl-lg rounded-br-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 text-sm text-black">
        
        {/* Left: Copyright */}
        <div className="text-xs sm:text-base">Copyrights © 2025</div>

        {/* Center: Announcement (hidden on small screens if needed) */}
        <div className="hidden sm:block text-base">Website Launch in 2 Days.</div>

        {/* Right: Logo */}
        <div className="flex items-center">
          <Image
            src="/bP_Corner_Logo.png"
            alt="Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  );
}
