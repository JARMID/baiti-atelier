/**
 * Baiti Atelier: Windmill Script for Proforma Quote Notifications via Resend
 * Sends formal quote details and cryptographic verification tokens to clients and workshops.
 */

export interface QuoteEmailArgs {
  recipient_email: string;
  client_name: string;
  artisan_name: string;
  quote_code: string;
  verification_token: string;
  window_type: string;
  width_mm: number;
  height_mm: number;
  total_price_dzd: number;
  wilaya: string;
  language?: "fr" | "ar" | "en";
  resend_api_key?: string;
}

export async function main(args: QuoteEmailArgs) {
  const {
    recipient_email,
    client_name,
    artisan_name,
    quote_code,
    verification_token,
    window_type,
    width_mm,
    height_mm,
    total_price_dzd,
    wilaya,
    language = "fr",
    resend_api_key,
  } = args;

  const apiKey = resend_api_key || Deno.env.get("RESEND_API_KEY") || "re_test_placeholder";
  const verificationUrl = `https://web-two-tan-31.vercel.app/quote/${quote_code}?token=${verification_token}`;

  const subject =
    language === "ar"
      ? `كشف حساب مبدئي رقم ${quote_code} - ورشة ${artisan_name}`
      : `Devis Proforma ${quote_code} - Atelier ${artisan_name} (${wilaya})`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #030914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E2E8F0; }
    .wrapper { max-width: 600px; margin: 40px auto; background-color: #071326; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #020D1F 0%, #061E3D 50%, #0A2F5C 100%); padding: 32px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); }
    .title { color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 8px 0 0 0; }
    .content { padding: 32px 30px; }
    .spec-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: rgba(255,255,255,0.02); border-radius: 8px; overflow: hidden; }
    .spec-table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
    .spec-table tr:last-child td { border-bottom: none; }
    .spec-label { color: #94A3B8; }
    .spec-value { color: #FFFFFF; font-weight: bold; text-align: right; }
    .price-box { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .price-label { font-size: 12px; font-family: monospace; color: #D4AF37; text-transform: uppercase; }
    .price-val { font-size: 28px; font-weight: 900; color: #FFFFFF; margin-top: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #D4AF37 100%); color: #070B14 !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div style="color: #D4AF37; font-family: monospace; font-size: 12px; font-weight: bold;">FICHE PROFORMA SÉCURISÉE</div>
      <h1 class="title">${quote_code}</h1>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #94A3B8;">Bonjour ${client_name}, voici la fiche chiffrée émise par <strong>${artisan_name}</strong>.</p>
      
      <table class="spec-table">
        <tr><td class="spec-label">Châssis</td><td class="spec-value">${window_type}</td></tr>
        <tr><td class="spec-label">Dimensions</td><td class="spec-value">${width_mm} x ${height_mm} mm</td></tr>
        <tr><td class="spec-label">Wilaya de Pose</td><td class="spec-value">${wilaya}</td></tr>
      </table>

      <div class="price-box">
        <div class="price-label">Montant Total Estimé (TTC)</div>
        <div class="price-val">${total_price_dzd.toLocaleString()} DZD</div>
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${verificationUrl}" class="cta-button">Vérifier l'Authenticité du Devis</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Baiti Atelier <quotes@resend.dev>",
        to: [recipient_email],
        subject: subject,
        html: htmlContent,
      }),
    });
    const data = await res.json();
    return { success: res.ok, status: res.status, data };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
