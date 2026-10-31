// src/components/DashboardStats.tsx
"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  CalendarDays, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from "lucide-react";

// --- MISE À JOUR DE L'INTERFACE ---
interface AnalyticsData {
  totalRequests: number;
  statusCounts: {
    requested: number;
    confirmed?: number;
    assigned: number;
    completed: number;
    cancelled: number;
    rejected?: number;
  };
  totalHours: number;
  estimatedRevenue: number;
  collectedRevenue: number; // <-- Le nouveau champ ajouté au backend
}

export default function DashboardStats() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/service-requests/analytics');
        setStats(response.data);
      } catch (err) {
        console.error("Erreur de chargement des stats:", err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mb-8 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  const statCards = [
    {
      // --- CARTE MISE À JOUR POUR LA FACTURATION ---
      title: "Revenus Encaissés",
      value: `${stats.collectedRevenue?.toLocaleString("fr-FR") || 0} \u20ac`, 
      subtitle: `Sur ${stats.estimatedRevenue?.toLocaleString("fr-FR") || 0} \u20ac prévus`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Réservations",
      value: stats.totalRequests,
      subtitle: `Dont ${stats.statusCounts.cancelled} annulées, ${stats.statusCounts.rejected ?? 0} refusées`,
      icon: CalendarDays,
      color: "bg-blue-500",
      lightColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Nouvelles Demandes",
      value: stats.statusCounts.requested,
      subtitle: `${stats.statusCounts.confirmed ?? 0} confirmée(s) en attente d'intervenant`,
      icon: Clock,
      color: "bg-orange-500",
      lightColor: "bg-orange-100 text-orange-600",
    },
    {
      title: "Missions Complétées",
      value: stats.statusCounts.completed,
      subtitle: `${stats.totalHours} heures de travail total`,
      icon: CheckCircle2,
      color: "bg-purple-500",
      lightColor: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${stat.color}`} />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-500">
              {stat.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}