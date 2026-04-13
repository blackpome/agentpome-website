"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [pw,  setPw]  = useState("");
  const [err, setErr] = useState(false);
  const router        = useRouter();

  async function attempt() {
    const res  = await fetch("/api/admin/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/admin/review");
    } else {
      setErr(true);
      setPw("");
      setTimeout(() => setErr(false), 1500);
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-3">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <Lock className="w-5 h-5 text-white/25" />
          </div>
        </div>
        <h1 className="text-center text-xl font-semibold text-white mb-6">Admin Access</h1>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          className="w-full h-12 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04]
                     text-white text-sm placeholder:text-white/15 outline-none
                     focus:border-white/20 transition-colors"
          autoFocus
        />
        {err && <p className="text-red-400 text-xs text-center">Incorrect password</p>}
        <button
          onClick={attempt}
          className="w-full h-12 rounded-xl bg-white text-black text-sm font-semibold
                     hover:bg-white/90 transition-all"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}