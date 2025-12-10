const axios = require('axios');

// ambil dari Environment Variables Vercel → jaga di dashboard saja
const cfg = {
  atlanticApiKey: "dviVP9oF3jnBESvJx3xMbiVwNAISQ13EWCHtASX2z1BnPgZSQ8AhFYQMkhOUGIfzILVAnVdfqUPG13oUASdt2CO567z4KUHSsvfd",
  atlanticbaseUrl: 'https://atlantich2h.com'
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { amount, customerName } = req.body;
  if (!amount || !customerName) {
    return res.status(400).json({ success: false, error: 'amount & customerName required' });
  }

  const refId = 'DEMO-' + Date.now(); // bikin unik

  try {
    const params = new URLSearchParams();
    params.append('api_key', cfg.atlanticApiKey);
    params.append('reff_id', refId);
    params.append('nominal', amount);
    params.append('type', 'ewallet');
    params.append('metode', 'qris');

    const resp = await axios.post(
      `${cfg.atlanticbaseUrl}/deposit/create`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );

    if (resp.data?.status === true) {
      return res.json({
        success: true,
        qr_url: resp.data.data.qr_image,
        qr_string: resp.data.data.qr_string,
        id: resp.data.data.id
      });
    }

    throw new Error(resp.data?.message || 'Failed to generate QRIS');
  } catch (err) {
    let msg = err.message || 'Server error';
    if (err.code === 'ECONNABORTED') msg = 'Timeout – API tidak merespon';
    if (err.code === 'ENOTFOUND') msg = 'API Gateway tidak ditemukan';
    return res.status(200).json({ success: false, error: msg });
  }
};
