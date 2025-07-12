// frontEnd/pages/api/events.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEvents } from '@/lib/fetchEvents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await fetchEvents({
        cache: 'no-cache',
        retries: 1 // 降低API端重试次数
      });
      res.status(200).json(data);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to load event data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
