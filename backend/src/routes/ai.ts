import { Router, Request, Response } from 'express';
import { askRiceShareAssistant } from '../lib/gemini';

const router = Router();

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A message prompt is required.',
      });
    }

    const reply = await askRiceShareAssistant(message.trim(), Array.isArray(history) ? history : []);

    res.json({
      success: true,
      message: reply,
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({
      success: false,
      message: 'The RiceShare Assistant is currently experiencing high demand. Please try again in a moment or visit our Browse Food page.',
    });
  }
});

export default router;
