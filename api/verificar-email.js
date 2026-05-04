import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, ping } = req.body;
  if (!email) return res.status(400).json({ ativo: false });

  const emailLower = email.toLowerCase().trim();

  const { data: usuario, error } = await sb
    .from('usuarios')
    .select('status, email')
    .eq('email', emailLower)
    .single();

  if (error || !usuario) return res.status(200).json({ ativo: false });

  const ativo = usuario.status === 'ativo';

  if (ping && ativo) {
    await sb.from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('email', emailLower);
  }

  return res.status(200).json({ ativo });
}
