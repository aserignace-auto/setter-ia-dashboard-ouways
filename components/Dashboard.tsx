'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Users, Zap, MessageSquare, Calendar } from 'lucide-react';
import { Lead } from '@/types/lead';
import Header from './Header';
import StatsCard from './StatsCard';
import Pipeline from './Pipeline';
import EfficiencyGauges from './EfficiencyGauges';
import ActivityFeed from './ActivityFeed';
import WeeklyChart from './WeeklyChart';
import LeadsTable from './LeadsTable';
import Notification from './Notification';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const previousLeadCount = useRef(0);

  // Agent global ON/OFF
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);

  // Fetch agent status au chargement
  useEffect(() => {
    async function fetchAgentStatus() {
      try {
        const res = await fetch('/api/agent-status');
        const data = await res.json();
        setIsAgentActive(data.is_active ?? true);
      } catch {
        // Par défaut ON
      }
    }
    fetchAgentStatus();
  }, []);

  // Toggle agent global
  const handleToggleAgent = useCallback(async (active: boolean) => {
    setAgentLoading(true);
    try {
      const res = await fetch('/api/agent-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: active }),
      });
      if (res.ok) {
        setIsAgentActive(active);
        setNotification(active ? 'Agent IA activé' : 'Agent IA désactivé');
      }
    } catch {
      setNotification('Erreur lors du changement de statut');
    }
    setAgentLoading(false);
  }, []);

  // Toggle IA per lead
  const handleToggleLeadAI = useCallback(async (leadId: string, paused: boolean) => {
    try {
      const res = await fetch('/api/leads/toggle-ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, is_ai_paused: paused }),
      });
      if (res.ok) {
        setLeads(prev =>
          prev.map(l => l.id === leadId ? { ...l, is_ai_paused: paused } : l)
        );
      }
    } catch {
      console.error('Erreur toggle IA lead');
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Erreur de récupération');

      const data = await response.json();

      if (Array.isArray(data)) {
        // Détecter les nouveaux leads
        if (previousLeadCount.current > 0 && data.length > previousLeadCount.current) {
          const newCount = data.length - previousLeadCount.current;
          setNotification(`${newCount} nouveau${newCount > 1 ? 'x' : ''} lead${newCount > 1 ? 's' : ''} !`);
        }
        previousLeadCount.current = data.length;
        setLeads(data);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial + polling toutes les 5 secondes
  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const getConversationArray = (historique: any): any[] => {
    if (!historique) return [];
    if (Array.isArray(historique)) return historique;
    if (typeof historique === 'string') {
      try {
        const parsed = JSON.parse(historique);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: leads.length,
      newThisWeek: leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length,
      totalMessages: leads.reduce((acc, l) => {
        const conversation = getConversationArray(l.historique_conversation);
        return acc + conversation.filter((msg: any) => msg.role === 'agent').length;
      }, 0),
      rdvPris: leads.filter(l => l.statut === 'rdv_pris').length,
    };
  }, [leads]);

  if (isLoading && leads.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-beige border-t-gold rounded-full animate-spin" />
          <p className="text-taupe font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {notification && (
          <Notification
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}

        <Header
          isConnected={isConnected}
          isAgentActive={isAgentActive}
          onToggleAgent={handleToggleAgent}
          agentLoading={agentLoading}
        />

        {/* Bandeau agent OFF */}
        {!isAgentActive && (
          <div className="mb-6 px-5 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 opacity-0 animate-fade-up">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-medium text-red-700">
              Agent IA désactivé — Les messages Instagram ne sont plus traités automatiquement.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Leads"
            value={stats.total}
            icon={Users}
            delay={0}
          />
          <StatsCard
            title="Nouveaux 7j"
            value={stats.newThisWeek}
            icon={Zap}
            delay={100}
          />
          <StatsCard
            title="Messages IA"
            value={stats.totalMessages}
            icon={MessageSquare}
            delay={200}
          />
          <StatsCard
            title="RDV Pris"
            value={stats.rdvPris}
            icon={Calendar}
            delay={300}
          />
        </div>

        {/* Pipeline & Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Pipeline leads={leads} />
          </div>
          <div>
            <EfficiencyGauges leads={leads} />
          </div>
        </div>

        {/* Activity Feed & Weekly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ActivityFeed leads={leads} />
          <WeeklyChart leads={leads} />
        </div>

        {/* Leads Table */}
        <LeadsTable leads={leads} onToggleLeadAI={handleToggleLeadAI} />
      </div>
    </div>
  );
}
