"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // SIMULATED LOGIN LOGIC
    // In a real app, you would verify credentials with your backend here.
    setTimeout(() => {
        setIsLoading(false);
        router.push("/"); // Redirect to Dashboard on success
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section */}
        <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-xl shadow-teal-200">
                <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">MaidMatch Admin</h1>
            <p className="mt-2 text-slate-500">Connectez-vous pour gérer les demandes.</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Adresse E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                            type="email" 
                            required
                            placeholder="admin@maidmatch.com"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Connexion...
                        </>
                    ) : (
                        <>
                            Se Connecter
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>

            </form>

            {/* Footer / Links */}
            <div className="mt-6 text-center">
                <a href="#" className="text-xs font-medium text-slate-400 hover:text-teal-600 transition-colors">
                    Mot de passe oublié ?
                </a>
            </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MaidMatch Inc. Accès restreint.
        </p>

      </div>
    </div>
  );
}