"use client";

import Sidebar from "@/components/Sidebar";
import { mockRequests } from "@/lib/data";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, 
  CheckCircle2, XCircle, User, Shield, MessageSquare, Save, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Props automatically passed by Next.js for dynamic routes
interface PageProps {
  params: { id: string };
}

export default function RequestDetailsPage({ params }: PageProps) {
  // 1. Find the request in mock data
  const request = mockRequests.find((r) => r.id === params.id);

  // 2. Handle "Not Found" case
  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-slate-900">404</h1>
            <p>Demande introuvable.</p>
            <Link href="/" className="text-teal-600 hover:underline mt-4 block font-medium">Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  // State for internal notes
  const [note, setNote] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        
        {/* --- Header & Navigation --- */}
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="rounded-full bg-white p-2 text-slate-400 shadow-sm hover:text-teal-600 hover:shadow-md transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Demande #{request.id}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Reçue le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                            request.status === 'confirmed' ? 'bg-teal-100 text-teal-800' : 
                            request.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {request.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Actions */}
            <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                    <XCircle className="h-4 w-4" />
                    Refuser
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                    Valider & Assigner
                </button>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (2/3) --- */}
            <div className="col-span-2 space-y-6">
                
                {/* 1. Property & Service Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-teal-600" />
                        Détails de la mission
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Adresse</p>
                            <div className="flex items-start gap-2 font-medium text-slate-900">
                                <MapPin className="mt-1 h-4 w-4 text-teal-500" />
                                {request.property.address}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Type de bien</p>
                            <p className="font-medium text-slate-900 capitalize">
                                {request.property.type} • {request.property.rooms} Pièces • {request.property.bathrooms} SDB
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Type de nettoyage</p>
                            <p className="font-medium text-slate-900 capitalize flex items-center gap-2">
                                {request.property.cleaningType === 'deep' ? 'Grand Ménage (Deep Clean)' : 'Standard'}
                                {request.property.cleaningType === 'deep' && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded font-bold">Premium</span>}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Matériel</p>
                            <div className={`font-medium flex items-center gap-2 ${!request.property.hasSupplies ? 'text-orange-600' : 'text-green-600'}`}>
                                {!request.property.hasSupplies ? (
                                    <><AlertTriangle className="h-4 w-4" /> Client SANS matériel</>
                                ) : (
                                    <><CheckCircle2 className="h-4 w-4" /> Client a tout le matériel</>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    {request.property.extras.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-3">Options demandées</p>
                            <div className="flex gap-2">
                                {request.property.extras.map(extra => (
                                    <span key={extra} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 capitalize">
                                        {extra}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-teal-600" />
                        Planning
                    </h2>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-400">
                                    {new Date(request.schedule.startDate).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-lg font-bold text-slate-900">
                                    {new Date(request.schedule.startDate).getDate()}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Date d'intervention</p>
                                <p className="text-sm text-slate-500">
                                    {request.schedule.endDate ? 'Intervention sur plusieurs jours' : 'Intervention unique'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-teal-700 font-bold">
                                <Clock className="h-4 w-4" />
                                {request.schedule.startTime} - {request.schedule.endTime}
                            </div>
                            <p className="text-xs text-slate-400 uppercase font-bold mt-1">Heure estimée</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (1/3) --- */}
            <div className="space-y-6">
                
                {/* Client Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-600" />
                        Client
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg">
                            {request.contact.name.substring(0,2)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{request.contact.name}</p>
                            <p className="text-xs text-slate-400">Nouveau client</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <a href={`tel:${request.contact.phone}`} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                            <Phone className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-medium text-slate-700">{request.contact.phone}</span>
                        </a>
                        <a href={`mailto:${request.contact.email}`} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                            <Mail className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-medium text-slate-700">{request.contact.email}</span>
                        </a>
                    </div>
                </div>

                {/* Internal Notes */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-600" />
                        Notes Internes
                    </h2>
                    <textarea 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-teal-500 focus:outline-none min-h-[100px] resize-none"
                        placeholder="Code d'entrée, préférences spéciales, etc..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-2 text-sm font-bold text-white hover:bg-slate-900 transition-colors">
                        <Save className="h-4 w-4" />
                        Sauvegarder la note
                    </button>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
}