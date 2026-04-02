import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.RENTCAST_API_KEY || 'be640db6b474427085c5796113f69a36';
const BASE = 'https://api.rentcast.io/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { type, address } = req.query;
  if (!address || typeof address !== 'string') return res.status(400).json({ error: 'Address required' });

  const encoded = encodeURIComponent(address);
  let url: string;

  switch (type) {
    case 'value':
      url = `${BASE}/avm/value?address=${encoded}&compCount=5`;
      break;
    case 'rent':
      url = `${BASE}/avm/rent/long-term?address=${encoded}&compCount=5`;
      break;
    case 'property':
      url = `${BASE}/properties?address=${encoded}`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid type. Use: value, rent, property' });
  }

  try {
    const response = await fetch(url, {
      headers: { 'X-Api-Key': API_KEY, 'Accept': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'RentCast API error', details: String(err) });
  }
}
