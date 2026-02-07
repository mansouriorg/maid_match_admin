"use client";

import { use } from "react"; // <--- 1. Import nécessaire
import Sidebar from "@/components/Sidebar";
import { mockStaff } from "@/lib/data";
import { 
  ArrowLeft, MapPin, Phone, Mail, Star, Award, 
  CalendarCheck, Download, CheckCircle2, Languages
} from "lucide-react";
import Link from "next/link";

// 2. Le type params devient une Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StaffProfilePage({ params }: PageProps) {
  // 3. On "déballe" la promesse avec use()
  const { id } = use(params);

  // 4. On utilise l'ID récupéré
  const staff = mockStaff.find((s) => s.id === id);

  // Gestion d'erreur si l'intervenant n'existe pas
  if (!staff) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
          <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-slate-900">404</h1>
              <p>Intervenant introuvable.</p>
              <Link href="/staff" className="text-teal-600 hover:underline mt-4 block font-medium">Retour au catalogue</Link>
          </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        
        {/* Navigation Retour */}
        <Link href="/staff" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
        </Link>

        {/* Carte En-tête (Cover & Photo) */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
            {/* Fond coloré (Cover) */}
            <div className="h-32 bg-gradient-to-r from-teal-600 to-slate-700"></div>
            
            <div className="px-8 pb-8">
                <div className="relative -mt-12 flex items-end justify-between">
                    <div className="flex items-end gap-6">
                        {/* Avatar / Photo avec Initiales */}
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-3xl font-bold text-slate-600 shadow-md">
                            {staff.photo}
                        </div>
                        <div className="mb-1">
                            <h1 className="text-3xl font-bold text-slate-900">{staff.name}</h1>
                            <p className="font-medium text-teal-600">{staff.role}</p>
                        </div>
                    </div>
                    {/* Boutons d'action */}
                    <div className="flex gap-3 mb-1">
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Download className="h-4 w-4" />
                            Télécharger CV
                        </button>
                        <button className="rounded-lg bg-teal-600 px-4 py-2 font-bold text-white shadow-md hover:bg-teal-700 transition-colors">
                            Contacter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
            
            {/* --- COLONNE GAUCHE (Infos & Stats) --- */}
            <div className="col-span-1 space-y-6">
                
                {/* Coordonnées */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900">Coordonnées</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin className="h-4 w-4 text-teal-500" />
                            {staff.location}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Phone className="h-4 w-4 text-teal-500" />
                            {staff.phone}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail className="h-4 w-4 text-teal-500" />
                            {staff.email}
                        </div>
                    </div>
                </div>

                {/* Indicateurs de Performance (KPIs) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-900">{staff.rating}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Note Moy.</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-900">{staff.jobsCompleted}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Missions</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-900">{staff.experience}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Ans Exp.</p>
                        </div>
                        <div className="rounded-xl bg-green-50 p-3 text-center border border-green-100">
                            <p className="text-xl font-bold text-green-700">100%</p>
                            <p className="text-xs text-green-600 uppercase font-bold">Fiabilité</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- COLONNE DROITE (CV, Bio, Compétences) --- */}
            <div className="col-span-2 space-y-6">
                
                {/* Biographie & Langues */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">À propos</h3>
                    <p className="text-slate-600 leading-relaxed">
                        {staff.bio}
                    </p>
                    <div className="mt-6 flex gap-6 pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Languages className="h-5 w-5 text-indigo-500" />
                            Arabe, Français
                         </div>
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Award className="h-5 w-5 text-indigo-500" />
                            Certifiée Hygiène & Sécurité
                         </div>
                    </div>
                </div>

                {/* Compétences (Tags) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Compétences & Spécialités</h3>
                    <div className="flex flex-wrap gap-3">
                        {staff.skills.map(skill => (
                            <div key={skill} className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-100 px-4 py-2 text-teal-800 font-medium capitalize">
                                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendrier de Disponibilité (Simulé) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Disponibilités cette semaine</h3>
                        <CalendarCheck className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                            <div key={day} className={`rounded-lg p-3 text-sm font-bold border ${
                                i === 6 ? 'bg-slate-50 text-slate-400 border-slate-100' : // Dimanche repos
                                i === 2 ? 'bg-orange-50 text-orange-700 border-orange-100' : // Mercredi occupé
                                'bg-white text-slate-700 border-teal-200' // Disponible
                            }`}>
                                {day}
                                <div className={`mt-2 h-1.5 w-1.5 rounded-full mx-auto ${
                                    i === 6 ? 'bg-slate-300' : i === 2 ? 'bg-orange-400' : 'bg-green-500'
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