import { NextResponse } from 'next/server';

const TABLE = 'agent_status';
const CLIENT_ID = 'ouways';

// GET — Lire le statut global de l'agent
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE}?select=*&client_id=eq.${CLIENT_ID}&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      const createRes = await fetch(
        `${supabaseUrl}/rest/v1/${TABLE}`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ is_active: true, client_id: CLIENT_ID }),
        }
      );
      const created = await createRes.json();
      return NextResponse.json(created[0] || { is_active: true });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Erreur agent status GET:', error);
    return NextResponse.json({ is_active: true });
  }
}

// PATCH — Mettre à jour le statut global
export async function PATCH(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  try {
    const { is_active } = await request.json();

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Paramètre invalide' }, { status: 400 });
    }

    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE}?select=id&client_id=eq.${CLIENT_ID}&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const rows = await getRes.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Aucune config trouvée' }, { status: 404 });
    }

    const id = rows[0].id;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE}?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ is_active }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Erreur agent status PATCH:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
