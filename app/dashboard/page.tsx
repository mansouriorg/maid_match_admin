"use client";

import Sidebar from "@/components/Sidebar";
import { mockRequests } from "@/lib/data";
import { 
  Search, Bell, MapPin, Calendar, Clock, Phone, MoreHorizontal, 
  CheckCircle2, XCircle, SprayCan, Key, Shirt, Cat
} from "lucide-react";
import Link from "next/link"; // <--- 1. Import de Link
import { useState } from "react";

export default function AdminDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getExtraIcon = (extra: string) => {
    switch(extra) {
      case 'ironing': return <Shirt className="h-3 w-3" />;
      case 'keys': return <Key className="h-3 w-3" />;
      case 'pets': return <Cat className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      
      <main className="ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-800">Demandes Entrantes</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Rechercher un client..." 
                className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <button className="relative rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          
          {/* 1. Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase text-slate-400">Demandes en attente</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase text-slate-400">Revenu estimé (Mois)</p>
                <p className="mt-2 text-3xl font-bold text-teal-600">4,250 €</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase text-slate-400">Intervenants Actifs</p>
                <p className="mt-2 text-3xl font-bold text-indigo-600">8</p>
            </div>
          </div>

          {/* 2. Requests List */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-lg text-slate-800">Dernières réservations</h2>
              <button className="text-sm font-medium text-teal-600 hover:text-teal-700">Tout voir</button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {mockRequests.map((req) => (
                // 2. REMPLACEMENT DU DIV PAR LINK
                <Link 
                    href={`/requests/${req.id}`} 
                    key={req.id} 
                    className="group flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  
                  {/* Left: Client Info */}
                  <div className="flex w-1/4 gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 uppercase">
                        {req.contact.name.substring(0,2)}
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{req.contact.name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                           <Phone className="h-3 w-3" />
                           {req.contact.phone}
                        </div>
                     </div>
                  </div>

                  {/* Middle: Schedule */}
                  <div className="flex w-1/4 flex-col gap-1 text-sm">
                     <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        {new Date(req.schedule.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} 
                        {req.schedule.endDate && ` ➔ ${new Date(req.schedule.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                     </div>
                     <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4" />
                        {req.schedule.startTime} - {req.schedule.endTime}
                     </div>
                  </div>

                  {/* Middle: Address & Alerts */}
                  <div className="hidden w-1/3 lg:block">
                     <div className="flex items-center gap-2 text-sm text-slate-600 mb-2 truncate">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{req.property.address}</span>
                     </div>
                     <div className="flex gap-2">
                        {!req.property.hasSupplies && (
                            <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                <SprayCan className="h-3 w-3" /> Matériel requis
                            </span>
                        )}
                        {req.property.extras.map(e => (
                             <span key={e} className="inline-flex items-center justify-center h-6 w-6 rounded bg-slate-100 text-slate-500" title={e}>
                                {getExtraIcon(e)}
                             </span>
                        ))}
                     </div>
                  </div>

                  {/* Right: Status & Quick Actions */}
                  <div className="flex w-auto items-center justify-end gap-6">
                     <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${getStatusColor(req.status)}`}>
                        {req.status}
                     </span>
                     
                     {/* Quick Actions (Prevent default to stop opening page when clicking buttons) */}
                     <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button 
                            onClick={(e) => { e.preventDefault(); /* Ajoutez logique validation ici */ }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors" 
                            title="Confirmer"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); /* Ajoutez logique refus ici */ }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors" 
                            title="Refuser"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                        <button 
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors" 
                            title="Détails"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                     </div>
                  </div>

                </Link>
              ))}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

