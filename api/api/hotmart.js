import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { event, data } = req.body;
    const email = data?.buyer?.email?.toLowerCase().trim();
    const hotmartId = data?.subscription?.subscriber?.code || null;

    if (!email) return res.status(400).json({ erro: 'sem email' });

    console.log(`[Hotmart] Evento: ${event} | Email: ${email}`);

    if (
      event === 'PURCHASE_APPROVED' ||
      event === 'SUBSCRIPTION_REACTIVATION' ||
      event === 'PURCHASE_COMPLETE'
    ) {
      await sb.from('usuarios').upsert(
        { email, status: 'ativo', hotmart_sub_id: hotmartId },
        { onConflict: 'email' }
      );

      await sb.auth.admin.createUser({
        email,
        email_confirm: true
      }).catch(() => {});

      console.log(`[OK] Acesso liberado: ${email}`);
    }

    if (
      event === 'SUBSCRIPTION_CANCELLATION' ||
      event === 'PURCHASE_REFUNDED' ||
      event === 'PURCHASE_CHARGEBACK' ||
      event === 'SUBSCRIPTION_INACTIVE'
    ) {
      await sb.from('usuarios')
        .update({ status: 'cancelado' })
        .eq('email', email);

      console.log(`[BLOQUEADO] Acesso cancelado: ${email}`);
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[Erro]', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
