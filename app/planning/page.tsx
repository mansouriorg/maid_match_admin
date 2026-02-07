"use client";

import Sidebar from "@/components/Sidebar";
import { mockRequests, mockStaff } from "@/lib/data";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, MoreVertical, Plus, UserCircle 
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PlanningPage() {
  // Simuler la date actuelle (basée sur les mock data pour l'exemple)
  const [currentDate, setCurrentDate] = useState(new Date("2023-10-30"));

  // Générer les 7 jours de la semaine affichée
  const getDaysOfWeek = (date: Date) => {
    const days = [];
    const start = new Date(date);
    // Reculer au Lundi précédent
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentDate);

  // Helper pour formater la date (ex: "30 OCT")
  const formatDateHeader = (date: Date) => {
    return {
      dayName: date.toLocaleDateString("fr-FR", { weekday: "short" }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()
    };
  };

  // Trouver les jobs pour un jour donné
  const getJobsForDay = (date: Date) => {
    return mockRequests.filter(req => {
      const reqDate = new Date(req.schedule.startDate);
      return (
        reqDate.getDate() === date.getDate() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Simuler l'assignation d'un staff (juste pour l'affichage visuel)
  const getAssignedStaff = (reqId: string) => {
    // Logique fictive : assigner un staff aléatoire basé sur l'ID de la commande
    const index = reqId.charCodeAt(reqId.length - 1) % mockStaff.length;
    return mockStaff[index];
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- Header du Planning --- */}
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Planning</h1>
                
                {/* Contrôles de Navigation Date */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button className="rounded-md p-1 hover:bg-white hover:shadow-sm">
                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div className="px-4 font-bold text-slate-700 flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-teal-600" />
                        Semaine 44, 2023
                    </div>
                    <button className="rounded-md p-1 hover:bg-white hover:shadow-sm">
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-teal-700">
                    <Plus className="h-4 w-4" />
                    Nouvelle Intervention
                </button>
            </div>
        </header>

        {/* --- Grille Semainier --- */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="grid h-full grid-cols-7 gap-4 min-w-[1000px]">
                
                {weekDays.map((day, index) => {
                    const { dayName, dayNumber, month } = formatDateHeader(day);
                    const isToday = day.getDate() === 30; // Simuler "Aujourd'hui" au 30 Octobre
                    const jobs = getJobsForDay(day);

                    return (
                        <div key={index} className="flex flex-col h-full">
                            {/* En-tête de colonne (Jour) */}
                            <div className={`mb-4 flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors ${
                                isToday 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200' 
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}>
                                <span className={`text-xs font-bold uppercase ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>{dayName}</span>
                                <span className="text-2xl font-bold">{dayNumber}</span>
                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>{month}</span>
                            </div>

                            {/* Zone des cartes (Drag & Drop zone in future) */}
                            <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-100/50 p-2 border border-slate-200/50">
                                {jobs.length === 0 && (
                                    <div className="flex h-full items-center justify-center opacity-30">
                                        <p className="text-xs font-bold text-slate-400">Aucune mission</p>
                                    </div>
                                )}

                                {jobs.map((job) => {
                                    const staff = getAssignedStaff(job.id);
                                    
                                    return (
                                        <Link 
                                            href={`/requests/${job.id}`} 
                                            key={job.id}
                                            className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                                        >
                                            {/* Heure */}
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700">
                                                    <Clock className="h-3 w-3" />
                                                    {job.schedule.startTime}
                                                </div>
                                                {job.property.hasSupplies ? null : (
                                                    <div className="h-2 w-2 rounded-full bg-orange-500" title="Matériel requis" />
                                                )}
                                            </div>

                                            {/* Info Client */}
                                            <div className="mb-3">
                                                <p className="font-bold text-sm text-slate-900 truncate">{job.contact.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 truncate mt-0.5">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    {job.property.address.split(',')[0]}
                                                </div>
                                            </div>

                                            {/* Staff Assigné */}
                                            <div className="flex items-center gap-2 border-t border-slate-50 pt-2 mt-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                    {staff.photo}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 truncate">
                                                    {staff.name.split(' ')[0]}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>

      </main>
    </div>
  );
}