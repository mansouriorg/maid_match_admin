"use client";

import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Loader2, User, Phone, Briefcase, Star, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewStaffPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    specialty: "Ménage Standard",
    experienceYears: 0,
    bio: "",
    languages: [] as string[] // Array for languages
  });

  // Toggle Language Helper
  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
        const exists = prev.languages.includes(lang);
        if (exists) return { ...prev, languages: prev.languages.filter(l => l !== lang) };
        return { ...prev, languages: [...prev.languages, lang] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send data to NestJS Backend
      await api.post("/maids", formData);
      
      // Redirect to catalog on success
      router.push("/staff");
      router.refresh(); // Refresh to show new data
    } catch (err) {
      console.error("Error creating staff:", err);
      setError("Erreur lors de la création. Vérifiez que le numéro n'existe pas déjà.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
            <Link href="/staff" className="rounded-full bg-white p-2 text-slate-500 hover:text-teal-700 shadow-sm transition-colors">
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Nouveau Profil</h1>
                <p className="text-slate-500">Ajouter un membre à votre équipe.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            
            {/* Error Banner */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            {/* Section 1: Identity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-700" /> Identité
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="staff-fullName" className="text-sm font-semibold text-slate-600">Nom Complet</label>
                        <input 
                            required
                            type="text"
                            id="staff-fullName"
                            placeholder="ex: Fatma Ben Ali"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="staff-phone" className="text-sm font-semibold text-slate-600">Téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                            <input 
                                required
                                type="tel"
                                id="staff-phone"
                                placeholder="ex: 06 12 34 56 78"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Skills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-teal-700" /> Compétences
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="staff-specialty" className="text-sm font-semibold text-slate-600">Spécialité Principale</label>
                        <select 
                            id="staff-specialty"
                            value={formData.specialty}
                            onChange={e => setFormData({...formData, specialty: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all appearance-none"
                        >
                            <option value="Ménage Standard">Ménage Standard</option>
                            <option value="Grand Ménage (Deep Clean)">Grand Ménage (Deep Clean)</option>
                            <option value="Repassage Expert">Repassage Expert</option>
                            <option value="Cuisine">Cuisine</option>
                            <option value="Garde d'enfants">Garde d&rsquo;enfants</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="staff-experience" className="text-sm font-semibold text-slate-600">Années d&rsquo;Expérience</label>
                        <div className="relative">
                            <Star className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                            <input 
                                type="number"
                                min="0"
                                max="40"
                                id="staff-experience"
                                value={formData.experienceYears}
                                onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                     <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Langues parlées
                     </label>
                     <div className="flex gap-3">
                        {['Arabe', 'Français', 'Anglais'].map(lang => (
                            <button
                                key={lang}
                                type="button"
                                aria-pressed={formData.languages.includes(lang)}
                                onClick={() => toggleLanguage(lang)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                    formData.languages.includes(lang)
                                    ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                     </div>
                </div>

                <div className="mt-6 space-y-1.5">
                    <label htmlFor="staff-bio" className="text-sm font-semibold text-slate-600">Bio / Description (Optionnel)</label>
                    <textarea 
                        rows={3}
                        id="staff-bio"
                        placeholder="Petite note sur le profil..."
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                <Link href="/staff">
                    <button type="button" className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Annuler
                    </button>
                </Link>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-8 py-3 font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-800 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Enregistrer le profil
                        </>
                    )}
                </button>
            </div>

        </form>
      </main>
    </div>
  );
}