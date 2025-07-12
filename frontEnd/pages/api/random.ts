// frontEnd/pages/api/random.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { ApiResponse, RandomEvent } from '@/types/events';

const fetchDataFile = <T>(filePath: string): T | null => {
  try {
    const fullPath = path.join(process.cwd(), 'src', 'data', filePath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
    }
    console.warn(`File not found: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch data for file ${filePath}:`, error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const randomDataPath = 'events/random.json';
      const randomDataFile = fetchDataFile<{ random_events: RandomEvent[] }>(randomDataPath);
      const randomEvents = randomDataFile?.random_events?.map(event => ({
        ...event,
        type: 'random',
        school: ''
      })) || [];

      res.status(200).json(randomEvents);
    } catch (error) {
      console.error('加载随机事件数据失败:', error);
      res.status(500).json({ error: '无法加载随机事件数据' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
