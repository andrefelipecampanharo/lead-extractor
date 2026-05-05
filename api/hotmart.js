const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const { event, data } = req.body;
 
    // Busca email em todos os campos possíveis da Hotmart
    const email = (
      data?.buyer?.email ||
      data?.subscriber?.email ||
      data?.subscription?.subscriber?.email ||
      data?.purchase?.buyer?.email ||
      ''
    ).toLowerCase().trim();
 
    const hotmartId =
      data?.subscriber?.code ||
      data?.subscription?.subscriber?.code ||
      null;
 
    if (!email) return res.status(400).json({ erro: 'sem email' });
 
    if (
      event === 'PURCHASE_APPROVED' ||
      event === 'SUBSCRIPTION_REACTIVATION' ||
      event === 'PURCHASE_COMPLETE'
    ) {
      await sb.from('usuarios').upsert(
        { email, status: 'ativo', hotmart_sub_id: hotmartId },
        { onConflict: 'email' }
      );
      await sb.auth.admin.createUser({ email, email_confirm: true }).catch(() => {});
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
 
      // Bloqueia acesso no Supabase Auth também
      const { data: users } = await sb.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);
      if (user) {
        await sb.auth.admin.updateUserById(user.id, { ban_duration: '876600h' });
      }
    }
 
    return res.status(200).json({ ok: true });
 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
};
 
