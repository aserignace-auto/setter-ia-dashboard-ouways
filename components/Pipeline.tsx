'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';

interface PipelineProps {
  leads: Lead[];
}

type TimeRange = 'day' | 'week' | 'month';

const timeRanges: { key: TimeRange; label: string }[] = [
  { key: 'day', label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
];

function filterByTime(leads: Lead[], range: TimeRange): Lead[] {
  const now = new Date();
  let cutoff: Date;

  switch (range) {
    case 'day':
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  return leads.filter(lead => new Date(lead.created_at) >= cutoff);
}

export default function Pipeline({ leads }: PipelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filteredLeads = filterByTime(leads, timeRange);

  const stages = [
    { key: 'nouveau', label: 'Nouveaux' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'qualifie', label: 'Qualifiés' },
    { key: 'rdv_pris', label: 'Booking' },
  ];

  const stageCounts = stages.map(stage => ({
    ...stage,
    count: filteredLeads.filter(lead => lead.statut === stage.key).length,
  }));

  const total = filteredLeads.length || 1;

  return (
    <div className="luxury-card p-6 bg-gradient-to-br from-brown-dark to-brown opacity-0 animate-fade-up"
         style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-taupe">Pipeline de Conversion</h3>

        <div className="flex items-center bg-brown/60 rounded-xl p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer
                ${timeRange === range.key
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-white shadow-sm'
                  : 'text-taupe hover:text-beige-light'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stageCounts.map((stage, index) => (
          <div key={stage.key} className="text-center">
            <div className="relative">
              <div className="text-3xl font-bold gold-gradient-text mb-2">
                {stage.count}
              </div>
              <div className="text-sm text-taupe">
                {stage.label}
              </div>
              <div className="mt-3 h-1.5 bg-brown rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-1000"
                  style={{ width: `${(stage.count / total) * 100}%` }}
                />
              </div>
            </div>
            {index < stages.length - 1 && (
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-gold hidden lg:block">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-taupe/60 mt-4 text-right">
        {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} sur cette période
      </p>
    </div>
  );
}
