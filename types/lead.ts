export interface Lead {
  id: string;
  instagram_id: string;
  plateforme: string;
  nom: string | null;
  statut: 'nouveau' | 'en_cours' | 'qualifie' | 'rdv_pris' | 'perdu';
  historique_conversation: any[];
  nb_relances: number;
  dernier_message_lead: string | null;
  is_ai_paused: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = Lead['statut'];
