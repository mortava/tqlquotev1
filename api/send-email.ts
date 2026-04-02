import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_hLkp4Nxh_8Mt9gG9ZRgmpn4Rorfugi2aJ');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, from } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  try {
    const result = await resend.emails.send({
      from: from || 'TQL Advisor <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Email send failed', details: String(err) });
  }
}
