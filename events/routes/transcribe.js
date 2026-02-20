/**
 * Transcription route.
 * POST /api/transcribe — proxy audio blob to Whisper.
 */

import { Router } from 'express';
import multer from 'multer';
import { transcribe } from '../lib/whisper.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/transcribe
 * Accepts multipart form with audio file, returns Whisper transcript.
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const result = await transcribe(req.file.buffer, req.file.mimetype);

        if (!result) {
            // Whisper not configured
            return res.json({ skipped: true, text: null });
        }

        res.json(result);
    } catch (err) {
        console.error('POST /api/transcribe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
