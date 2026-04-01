"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ContactPage() {

  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending , setIsSending] = useState(false);
  const [mailReceived, setMailReceived] = useState(false);
  const [showMailReceived, setShowMailReceived] = useState(false);
  // const [showContactForm, setShowContactForm] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showToast = (message: string, type: "error" | "success" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      showToast("Invalid email", "error");
      return;
    }

    if (message.trim().length < 5) {
      showToast("Message too short", "error");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, message })
      });

      if (res.ok) {
        // handleFlip()
        // setShowContactForm(false);
        setShowMailReceived(true);
        setMailReceived(true);
        setEmail("");
        setMessage("");

        // Reset to show form again after 5 seconds
        setTimeout(() => {
          setMailReceived(false);
        }, 4000)
        setTimeout(() => {
          setShowMailReceived(false);
          // setShowContactForm(true);
        }, 5000);
      } else {
        showToast("Failed to send", "error");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showToast("Error occurred", "error");
    } finally {
      setIsSending(false);
      setEmail("");
      setMessage("");
    }
  }

  const handleFlip = () => {
    setIsFlipping(true);
    setIsFlipped((prev) => !prev);

    // Reset flipping state after animation ends (match duration-700)
    setTimeout(() => setIsFlipping(false), 700);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="w-full min-h-screen -mt-34 md:mt-[-100] flex justify-center items-center bg-[#1d1d1d] px-4 sm:px-6 lg:px-8">
      <div
        className={`relative w-60 h-[24rem] perspective transform transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Card Wrapper */}
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Side */}
          {/* Front Side */}
            <div className="absolute w-full h-full backface-hidden bg-white text-black rounded-xl shadow-lg border border-gray-300 p-6">
              {showMailReceived ? (
                <div
                  className={`text-center mt-16 p-8 space-y-2 transition-opacity duration-1000 ease-in-out ${
                    mailReceived ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h2 className="text-xl font-bold animate-fadeIn">Mail Received</h2>
                  <p className="text-sm text-gray-600 animate-fadeIn delay-200">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
              <>
              <div className="space-y-4 pb-20">
                <h2 className="text-xl font-bold text-center">Contact Us</h2>

                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Send Button - bottom right */}
              <div className="absolute bottom-4 right-4">
                <button 
                  className="px-5 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-900 transition"
                  onClick={handleSubmit}
                  disabled={isSending}
                >
                  {isSending ? "Sending" : "Send"}
                </button>
              </div>
              </>
          )}
              {/* Logo - bottom left */}
              <div className="absolute bottom-0 left-0">
                <Image
                  src="/bP_Left.png"
                  alt="Logo"
                  width={150}
                  height={150}
                  className="object-contain rounded-bl-xl"
                />
              </div>

            </div>

          {/* Back Side */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-black rounded-xl shadow-lg border border-gray-300 p-6 flex flex-col justify-center items-center space-y-4">
            <h2 className="text-xl font-bold">Contact</h2>
            <p className="text-sm">📧 jv@blackpome.com</p>
            <p className="text-sm">📞 +91 82700 94307</p>

            <div className="absolute bottom-0 right-0">
              <Image
                src="/bP_Right.png"
                alt="Logo"
                width={150}
                height={150}
                className="object-contain rounded-br-xl"
              />
            </div>
          </div>
        </div>

        {/* Turn Button */}
        <button
          className={`absolute top-1/2 right-[-2.5rem] -translate-y-1/2 px-4 py-2 bg-black text-white rounded-full text-xs hover:bg-gray-900 transition ${
            isFlipping ? "" : "border border-white"
          }`}
          onClick={handleFlip}
        >
          Turn
        </button>

        {toast && (
          <div
            className={`relatives w-full mt-1.5 bottom-5 px-2 py-2 text-center rounded-md shadow-lg text-sm font-medium transition-opacity duration-300 z-50
              ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
          >
            {toast.message}
          </div>
        )}



      </div>

      {/* Add perspective style */}
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}
