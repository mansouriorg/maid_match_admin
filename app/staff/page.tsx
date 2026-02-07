"use client";

import Sidebar from "@/components/Sidebar";
import { mockStaff } from "@/lib/data";
import { Search, MapPin, Star, Filter, Briefcase, Plus } from "lucide-react";
import Link from "next/link";

export default function StaffCatalogPage() {
  
  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'available': return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase tracking-wide">Disponible</span>;
        case 'busy': return <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 uppercase tracking-wide">En Mission</span>;
        default: return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Repos</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalogue Intervenants</h1>
                <p className="text-slate-500">Gérez votre équipe et consultez leurs compétences.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all hover:-translate-y-0.5">
                <Plus className="h-4 w-4" />
                Ajouter un profil
            </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                    placeholder="Rechercher par nom, compétence, ville..." 
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4" />
                Filtres
            </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mockStaff.map((person) => (
                <Link key={person.id} href={`/staff/${person.id}`} className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-teal-200">
                    
                    {/* Card Header: Avatar & Status */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                {person.photo}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">{person.name}</h3>
                                <p className="text-sm text-slate-500">{person.role}</p>
                            </div>
                        </div>
                        {getStatusBadge(person.status)}
                    </div>

                    {/* Stats Row */}
                    <div className="mb-4 flex items-center justify-between border-y border-slate-50 py-3">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            {person.rating}
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            {person.jobsCompleted} <span className="hidden sm:inline">Missions</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 truncate max-w-[80px]">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {person.location.split(' ')[0]}
                        </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2">
                        {person.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 capitalize group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                                {skill}
                            </span>
                        ))}
                        {person.skills.length > 3 && (
                            <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-400">
                                +{person.skills.length - 3}
                            </span>
                        )}
                    </div>

                </Link>
            ))}
        </div>

      </main>
    </div>
  );
}