// Simple Node/Express API just to verify reCAPTCHA tokens.
// Usage:
// 1. Crie um arquivo .env dentro de backend_example com:
//      RECAPTCHA_SECRET_KEY=SEU_SECRET_PRIVADO_DO_RECAPTCHA
//      PORT=4000  (opcional)
// 2. Rode:  cd backend_example && node verifyRecaptcha.js
// 3. No frontend, faça POST para http://localhost:4000/verify-recaptcha

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error('RECAPTCHA_SECRET_KEY não configurada no servidor (.env)');
  }

  const resp = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret,
        response: token,
      },
    }
  );

  return resp.data; // { success, score, action, hostname, ... }
}

// Rota simples para teste manual no navegador
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Use POST /verify-recaptcha para validar tokens.',
  });
});

app.post('/verify-recaptcha', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token ausente' });
    }

    const verification = await verifyRecaptcha(token);

    console.log('reCAPTCHA verification:', verification);

    if (!verification.success) {
      return res
        .status(400)
        .json({ success: false, error: 'Falha na verificação reCAPTCHA', data: verification });
    }

    if (typeof verification.score === 'number' && verification.score < 0.5) {
      return res.status(400).json({
        success: false,
        error: 'Suspeita de atividade automatizada (score baixo)',
        data: verification,
      });
    }

    return res.json({
      success: true,
      message: 'reCAPTCHA válido',
      data: verification,
    });
  } catch (err) {
    console.error('Error in /verify-recaptcha:', err.message || err);
    return res
      .status(500)
      .json({ success: false, error: 'Erro no servidor ao verificar reCAPTCHA' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`reCAPTCHA backend listening on port ${port}`);
  });
}

module.exports = app;
