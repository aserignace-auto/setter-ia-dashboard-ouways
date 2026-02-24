import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  try {
    const { leadId, is_ai_paused } = await request.json();

    if (!leadId || typeof is_ai_paused !== 'boolean') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ is_ai_paused }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur toggle IA lead:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
