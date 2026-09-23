/**
 * Baiti Atelier: Windmill Script for Transactional Resend Emails
 * Dispatches high-end branded onboarding emails to Algerian artisans and workshop owners.
 * Integrates directly with Resend API.
 */

export interface WelcomeEmailArgs {
  recipient_email: string;
  artisan_name: string;
  trade_type: string;
  wilaya: string;
  language?: "fr" | "ar" | "en";
  resend_api_key?: string;
  custom_ai_copy?: {
    subject?: string;
    headline?: string;
    intro?: string;
    key_points?: string[];
    cta_text?: string;
  };
}

export async function main(args: WelcomeEmailArgs) {
  const {
    recipient_email,
    artisan_name,
    trade_type,
    wilaya,
    language = "fr",
    resend_api_key,
    custom_ai_copy,
  } = args;

  const apiKey = resend_api_key || Deno.env.get("RESEND_API_KEY") || "re_test_placeholder";

  const subject =
    custom_ai_copy?.subject ||
    (language === "ar"
      ? `مرحبا بك في منصة بيتي اتليي يا ${artisan_name}`
      : `Bienvenue sur Baiti Atelier, ${artisan_name}`);

  const headline =
    custom_ai_copy?.headline ||
    (language === "ar"
      ? `ورشتكم في ولاية ${wilaya} اصبحت جاهزة`
      : `Votre atelier a ${wilaya} est operationnel`);

  const intro =
    custom_ai_copy?.intro ||
    (language === "ar"
      ? `يسر فريق بيتي ان يضع بين ايديكم احدث منظومة لحسابات التقطيع والتسعير وفق معايير السوق الجزائري.`
      : `Baiti Atelier met a votre disposition le studio de calcul millimetrique et d'optimisation de debitage dedie a la fabrication.`);

  const points = custom_ai_copy?.key_points || [
    "Optimisation de debitage lineaire 1D et plaques 2D avec chutes valorisables",
    "Chiffrage instantane en Dinars Algeriens (DZD) selon le bareme de votre atelier",
    "Securite absolue: vos prix restent chifTres en local, sans fuite de marge",
  ];

  const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #030914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
    .wrapper { max-width: 600px; margin: 40px auto; background-color: #071326; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .header { background: linear-gradient(135deg, #020D1F 0%, #061E3D 50%, #0A2F5C 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); }
    .logo-badge { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #C5A880 100%); color: #020D1F; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 999px; margin-bottom: 12px; letter-spacing: 0.1em; }
    .title { color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
    .subtitle { color: #38BDF8; font-size: 13px; font-family: monospace; margin-top: 6px; }
    .content { padding: 36px 30px; }
    .greeting { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px; }
    .paragraph { font-size: 14px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
    .card { background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-title { color: #D4AF37; font-size: 12px; font-weight: 700; font-family: monospace; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em; }
    .point-item { font-size: 13px; color: #CBD5E1; margin-bottom: 8px; display: flex; align-items: flex-start; }
    .point-dot { color: #D4AF37; margin-right: 8px; font-weight: bold; }
    .cta-container { text-align: center; margin: 32px 0 16px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #D4AF37 100%); color: #070B14 !important; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.3); }
    .footer { background-color: #030A17; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #64748B; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">BAITI ATELIER | بيتي</div>
      <h1 class="title">${headline}</h1>
      <div class="subtitle">WILAYA: ${wilaya.toUpperCase()} • METIER: ${trade_type.toUpperCase()}</div>
    </div>
    <div class="content">
      <div class="greeting">Bonjour ${artisan_name},</div>
      <p class="paragraph">${intro}</p>
      
      <div class="card">
        <div class="card-title">Capacites Industrielles Activees</div>
        ${points
          .map(
            (p) => `<div class="point-item"><span class="point-dot">&#10003;</span><span>${p}</span></div>`
          )
          .join("")}
      </div>

      <div class="cta-container">
        <a href="https://web-two-tan-31.vercel.app/#cad-studio" class="cta-button">Lancer le Studio d'Atelier</a>
      </div>
    </div>
    <div class="footer">
      <div>Baiti Atelier • Concu pour les artisans fabricants d'Algerie</div>
      <div style="margin-top: 6px;">Donnees chiffrees en local • Baremes confidentiels de l'atelier</div>
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
        from: "Baiti Atelier <onboarding@resend.dev>",
        to: [recipient_email],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      status: res.status,
      data: data,
      recipient: recipient_email,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to dispatch email via Resend",
      recipient: recipient_email,
    };
  }
}
