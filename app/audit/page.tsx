"use client";

import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Clock, 
  Loader2, 
  AlertCircle,
  Database,
  Activity
} from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  createdAt: string;
  admin?: { email: string };
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit');
        setLogs(response.data);
      } catch (err) {
        console.error("Erreur chargement audit", err);
        setError("Impossible de charger le journal d'audit.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Helpers pour le design des badges
  const getActionBadge = (action: string) => {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('PAYMENT')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('ASSIGN')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (action.includes('STATUS')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8 flex flex-col gap-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Journal d&rsquo;Audit</h1>
                    <p className="text-sm font-medium text-slate-500">
                        Traçabilité complète et immuable des actions de l&rsquo;administration.
                    </p>
                </div>
            </div>
        </div>

        {/* Gestion des états (Chargement / Erreur) */}
        {loading && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        )}

        {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 font-medium">
                <AlertCircle className="h-5 w-5" /> {error}
            </div>
        )}

        {/* Le Tableau des Logs */}
        {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Horodatage</th>
                                <th className="px-6 py-4">Administrateur</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Cible</th>
                                <th className="px-6 py-4">Détails de l&rsquo;opération</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Database className="mx-auto h-8 w-8 mb-3 opacity-20" />
                                        Aucune action enregistrée pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        
                                        {/* Date & Heure */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 font-medium text-slate-900">
                                                <Clock className="h-4 w-4 text-slate-500 group-hover:text-teal-600 transition-colors" />
                                                {new Date(log.createdAt).toLocaleDateString('fr-FR', { 
                                                    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' 
                                                })}
                                                <span className="text-slate-500 ml-1">
                                                    {new Date(log.createdAt).toLocaleTimeString('fr-FR', { 
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Paris' 
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Utilisateur */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 uppercase">
                                                    {log.admin?.email ? log.admin.email.substring(0,2) : 'SY'}
                                                </div>
                                                <span className="font-medium">
                                                    {log.admin?.email || 'Système Automatique'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action (Badge) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                                                <Activity className="h-3 w-3" />
                                                {formatActionName(log.action)}
                                            </span>
                                        </td>

                                        {/* Cible */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-700">
                                                {log.entity} #{log.entityId}
                                            </span>
                                        </td>

                                        {/* Détails */}
                                        <td className="px-6 py-4 max-w-md">
                                            <p className="truncate text-slate-600 font-medium" title={log.details}>
                                                {log.details}
                                            </p>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}