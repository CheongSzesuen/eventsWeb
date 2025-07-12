// frontEnd/pages/api/exam.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { ApiResponse, Event } from '@/types/events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const examDataPath = path.join(process.cwd(), 'src', 'data', 'events', 'exam', 'exam.json');
      const examData = fs.existsSync(examDataPath) 
        ? JSON.parse(fs.readFileSync(examDataPath, 'utf-8')) 
        : [];

      res.status(200).json(examData);
    } catch (error) {
      console.error('加载考试事件数据失败:', error);
      res.status(500).json({ error: '无法加载考试事件数据' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
