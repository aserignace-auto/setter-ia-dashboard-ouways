'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadsTableProps {
  leads: Lead[];
  onToggleLeadAI: (leadId: string, paused: boolean) => Promise<void>;
}

function getStatusBadge(statut: string) {
  const styles: Record<string, string> = {
    nouveau: 'bg-blue-100 text-blue-700',
    en_cours: 'bg-yellow-100 text-yellow-700',
    qualifie: 'bg-green-100 text-green-700',
    rdv_pris: 'bg-purple-100 text-purple-700',
    perdu: 'bg-red-100 text-red-700',
  };

  const labels: Record<string, string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    qualifie: 'Qualifié',
    rdv_pris: 'RDV Pris',
    perdu: 'Perdu',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[statut] || 'bg-gray-100 text-gray-700'}`}>
      {labels[statut] || statut}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(nom: string | null, instagram_id: string): string {
  if (nom) {
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return instagram_id.slice(0, 2).toUpperCase();
}

function LeadAIToggle({ lead, onToggle }: { lead: Lead; onToggle: (leadId: string, paused: boolean) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const isPaused = lead.is_ai_paused;

  async function handleClick() {
    setLoading(true);
    await onToggle(lead.id, !isPaused);
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer
        ${loading ? 'opacity-50 cursor-wait' : ''}
        ${!isPaused
          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        }
      `}
      title={!isPaused ? 'IA active — cliquer pour désactiver' : 'IA en pause — cliquer pour réactiver'}
    >
      {/* Mini toggle */}
      <div className={`relative w-7 h-3.5 rounded-full transition-colors duration-300 ${!isPaused ? 'bg-green-500' : 'bg-red-400'}`}>
        <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform duration-300 ${!isPaused ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </div>
      <span>{loading ? '...' : !isPaused ? 'IA' : 'OFF'}</span>
    </button>
  );
}

export default function LeadsTable({ leads, onToggleLeadAI }: LeadsTableProps) {
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (lead.nom && lead.nom.toLowerCase().includes(q)) ||
      lead.instagram_id.toLowerCase().includes(q)
    );
  });

  const displayedLeads = search.trim() ? filteredLeads : leads.slice(0, 10);

  return (
    <div className="luxury-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: '800ms' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-brown-dark">Tous les leads</h3>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un lead..."
            className="w-full pl-9 pr-9 py-2 text-sm text-brown-dark bg-beige-light/40 border border-beige rounded-xl placeholder:text-taupe/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-beige transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-taupe" />
            </button>
          )}
        </div>
      </div>

      {search.trim() && (
        <p className="text-xs text-taupe mb-3">
          {filteredLeads.length} résultat{filteredLeads.length !== 1 ? 's' : ''} pour « {search.trim()} »
        </p>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b border-beige">
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Lead</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Plateforme</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Statut</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Relances</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-taupe">Agent IA</th>
            </tr>
          </thead>
          <tbody>
            {displayedLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-taupe">
                  {search.trim() ? 'Aucun lead trouvé' : 'Aucun lead pour le moment'}
                </td>
              </tr>
            ) : (
              displayedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-beige/50 hover:bg-beige-light/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(lead.nom, lead.instagram_id)}
                      </div>
                      <div>
                        <p className="font-medium text-brown-dark">
                          {lead.nom || lead.instagram_id}
                        </p>
                        <p className="text-xs text-taupe">@{lead.instagram_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-brown">{lead.plateforme}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-taupe">{formatDate(lead.created_at)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(lead.statut)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-brown-dark">{lead.nb_relances}</span>
                  </td>
                  <td className="py-3 px-4">
                    <LeadAIToggle lead={lead} onToggle={onToggleLeadAI} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
