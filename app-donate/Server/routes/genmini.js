const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

if (!GEMINI_API_KEY) {
  console.error('❌ Thiếu GEMINI_API_KEY trong .env');
  process.exit(1);
}

const callGemini = async (model, prompt) => {
  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(endpoint, {
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu prompt trong body.' });
  }

  try {
    let result;
    try {
      // Thử với gemini-1.5-pro
      result = await callGemini('gemini-1.5-pro', prompt);
    } catch (err) {
      // Nếu lỗi 429 → chuyển sang gemini-1.5-flash
      if (err.response?.status === 429) {
        console.warn('⚠️ Quá tải gemini-1.5-pro, thử lại với gemini-1.5-flash...');
        result = await callGemini('gemini-1.5-flash', prompt);
      } else {
        throw err; // Nếu lỗi khác thì không fallback
      }
    }

    res.json({ result });
  } catch (error) {
    console.error('❌ Gemini API lỗi:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Lỗi kết nối Gemini API',
      detail: error.response?.data || error.message
    });
  }
});

module.exports = router;
