"use client";

import { use, useEffect, useState } from "react"; 
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api"; // Import your Axios instance
import { 
  ArrowLeft, MapPin, Phone, Mail, Star, Award, 
  CalendarCheck, Download, CheckCircle2, Languages, Loader2, AlertCircle, User
} from "lucide-react";
import Link from "next/link";

// Define the shape of the data coming from the API
interface Maid {
  id: number;
  fullName: string;
  specialty: string;
  phoneNumber: string;
  bio?: string;
  experienceYears: number;
  rating: number;
  languages: string[];
  status: string;
  isVerified: boolean;
  requests?: unknown[]; // To calculate job count
  _count?: { requests: number };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StaffProfilePage({ params }: PageProps) {
  // 1. Unwrap the params
  const { id } = use(params);

  // 2. State for Data Fetching
  const [staff, setStaff] = useState<Maid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch Data from Backend
  useEffect(() => {
    if (!id) return;

    const fetchStaff = async () => {
      try {
        const response = await api.get(`/maids/${id}`);
        setStaff(response.data);
      } catch (err) {
        console.error("Error fetching staff details:", err);
        setError("Impossible de charger le profil de cet intervenant.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  // 4. Helper to get Initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "??";
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans">
        <Sidebar />
        <div className="lg:ml-64 flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !staff) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans">
          <Sidebar />
          <div className="lg:ml-64 flex-1 flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-slate-900">Introuvable</h1>
              <p className="text-slate-500 mb-6">{error || "Cet intervenant n'existe pas."}</p>
              <Link href="/staff" className="text-teal-700 hover:underline font-bold flex items-center gap-2">
                 <ArrowLeft className="h-4 w-4" /> Retour au catalogue
              </Link>
          </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8">
        
        {/* Navigation Return */}
        <div className="mb-6">
            <Link href="/staff" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour au catalogue
            </Link>
        </div>

        {/* Header Card (Cover & Photo) */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Colored Cover */}
            <div className="h-32 bg-gradient-to-r from-teal-600 to-slate-700"></div>
            
            <div className="px-8 pb-8">
                <div className="relative -mt-12 flex items-end justify-between">
                    <div className="flex items-end gap-6">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-3xl font-bold text-slate-600 shadow-md">
                            {getInitials(staff.fullName)}
                        </div>
                        <div className="mb-1">
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                {staff.fullName}
                                {staff.isVerified && (
                                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                                        <CheckCircle2 className="h-3 w-3" /> Vérifié
                                    </span>
                                )}
                            </h1>
                            <p className="font-medium text-teal-700">{staff.specialty}</p>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-1">
                        {/* Hidden until CVs can be stored (there is no file upload yet). */}
                        <button hidden type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Télécharger CV</span>
                        </button>
                        <a href={`tel:${staff.phoneNumber.replace(/\s/g, "")}`} className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white shadow-md hover:bg-teal-800 transition-colors">
                            Contacter
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Info & KPIs) --- */}
            <div className="col-span-1 space-y-6">
                
                {/* Contact Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        Coordonnées
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin className="h-4 w-4 text-teal-600" />
                            Localisation non renseign&eacute;e
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Phone className="h-4 w-4 text-teal-600" />
                            {staff.phoneNumber}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail className="h-4 w-4 text-teal-600" />
                            {/* Placeholder email generator based on name */}
                            {staff.fullName.split(' ')[0].toLowerCase()}@maidmatch.com
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-2xl font-bold text-slate-900">{staff.rating?.toFixed(1) || "5.0"}</p>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Note Moy.</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-900">{staff._count?.requests ?? staff.requests?.length ?? 0}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Missions</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-900">{staff.experienceYears}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Ans Exp.</p>
                        </div>
                        <div className="rounded-xl bg-green-50 p-3 text-center border border-green-100">
                            <p className="text-xl font-bold text-green-700">100%</p>
                            <p className="text-xs text-green-600 uppercase font-bold">Fiabilité</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (Bio, Skills) --- */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* About Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">À propos</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {staff.bio || "Aucune description disponible pour cet intervenant."}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-6 pt-6 border-t border-slate-100">
                         {staff.languages && staff.languages.length > 0 && (
                             <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Languages className="h-5 w-5 text-indigo-500" />
                                {staff.languages.join(', ')}
                             </div>
                         )}
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Award className="h-5 w-5 text-indigo-500" />
                            Certifiée Hygiène & Sécurité
                         </div>
                    </div>
                </div>

                {/* Skills & Specialties */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Compétences & Spécialités</h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Render Specialty as main skill */}
                        <div className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-100 px-4 py-2 text-teal-800 font-medium capitalize">
                            <CheckCircle2 className="h-4 w-4 text-teal-700" />
                            {staff.specialty}
                        </div>
                        {/* Since we don't store extra skills separately yet, we can re-list languages or static placeholders */}
                        {['Nettoyage Vapeur', 'Produits Écologiques', 'Gestion du Temps'].map(skill => (
                            <div key={skill} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-slate-600 font-medium text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Availability Calendar (Simulated for UI) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-80">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Disponibilités (Simulé)</h3>
                        <CalendarCheck className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                            <div key={day} className={`rounded-lg p-3 text-sm font-bold border ${
                                i === 6 ? 'bg-slate-50 text-slate-500 border-slate-100' : 
                                staff.status === 'BUSY' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-white text-slate-700 border-teal-200'
                            }`}>
                                {day}
                                <div className={`mt-2 h-1.5 w-1.5 rounded-full mx-auto ${
                                    i === 6 ? 'bg-slate-300' : 
                                    staff.status === 'BUSY' ? 'bg-orange-400' : 'bg-green-500'
                                }`} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
}