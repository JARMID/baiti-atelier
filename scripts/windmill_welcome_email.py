"""
Baiti Atelier: Windmill Onboarding & Welcome Email Dispatcher
Delivers high-fidelity transactional onboarding emails via Resend API to Algerian artisans.
Compatible with Windmill Python runtime and local execution.
"""

import os
import sys
import json
import urllib.request
import urllib.error

def get_resend_api_key() -> str:
    # 1. Check local environment
    key = os.environ.get("RESEND_API_KEY", "")
    if key:
        return key

    # 2. Check Windmill context if available
    try:
        import wmill
        key = wmill.get_variable("f/trustvaulti/resend_api_key")
        if key:
            return key
    except Exception:
        pass

    return ""

def generate_welcome_html(artisan_name: str, workshop_name: str, wilaya: str, phone: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Baiti Atelier | بيتي</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #040B16;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #040B16;
      padding: 40px 0;
    }}
    .main-table {{
      max-width: 580px;
      margin: 0 auto;
      background-color: #0A1324;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }}
    .header {{
      padding: 36px 40px 24px;
      text-align: center;
      background: linear-gradient(180deg, rgba(212, 175, 55, 0.12) 0%, rgba(10, 19, 36, 0) 100%);
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }}
    .badge {{
      display: inline-block;
      padding: 5px 14px;
      background: rgba(212, 175, 55, 0.15);
      color: #D4AF37;
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .brand-title {{
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #D4AF37;
      margin: 0 0 6px;
    }}
    .brand-sub {{
      font-size: 12px;
      color: #94A3B8;
      letter-spacing: 0.5px;
    }}
    .content {{
      padding: 36px 40px;
      text-align: left;
    }}
    .heading {{
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 16px;
      line-height: 1.3;
    }}
    .paragraph {{
      font-size: 13.5px;
      line-height: 1.6;
      color: #CBD5E1;
      margin: 0 0 20px;
    }}
    .info-card {{
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 14px;
      padding: 20px;
      margin: 24px 0;
    }}
    .info-row {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 12.5px;
    }}
    .info-label {{
      color: #94A3B8;
    }}
    .info-val {{
      font-weight: bold;
      color: #D4AF37;
    }}
    .cta-container {{
      text-align: center;
      margin: 32px 0 16px;
    }}
    .cta-button {{
      display: inline-block;
      background: #D4AF37;
      color: #040B16 !important;
      font-weight: 800;
      font-size: 13px;
      padding: 14px 34px;
      border-radius: 12px;
      text-decoration: none;
      letter-spacing: 0.8px;
    }}
    .footer {{
      background-color: #060D18;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header">
          <div class="badge">Espace Atelier Pro Actif</div>
          <h1 class="brand-title">BAITI ATELIER | بيتي</h1>
          <div class="brand-sub">Menuiserie Industrielle, Débit CAD et Répertoire 58 Wilayas</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="heading">Bienvenue, {artisan_name} !</div>
          <p class="paragraph">
            Votre compte atelier professionnel a été initialisé avec succès. Vous disposez désormais d'un accès intégral à la suite logicielle Baiti Atelier sur mobile et web.
          </p>

          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Responsable :</span>
              <span class="info-val">{artisan_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Atelier :</span>
              <span class="info-val">{workshop_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Téléphone :</span>
              <span class="info-val">{phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Wilaya :</span>
              <span class="info-val">{wilaya}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Formule :</span>
              <span class="info-val">Abonnement Pro Annuel (35 000 DZD)</span>
            </div>
            <div class="info-row" style="margin-bottom: 0;">
              <span class="info-label">Double Authentification :</span>
              <span class="info-val" style="color: #10B981;">Active (Google Authenticator TOTP)</span>
            </div>
          </div>

          <p class="paragraph">
            Tous vos calculs de coupes de vitrage, profilés aluminium (gammes 40, 45, RPT 52) et devis proforma en Dinars Algériens sont sauvegardés et calculés en mode local sécurisé.
          </p>

          <div class="cta-container">
            <a href="https://baiti-atelier.vercel.app" class="cta-button">OUVRIR MON ATELIER EN LIGNE</a>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          &copy; 2026 Baiti Atelier. Plateforme certifiée pour les menuisiers et artisans des 58 Wilayas d'Algérie.<br>
          Assistance technique : contact@baiti-atelier.dz
        </td>
      </tr>
    </table>
  </div>
</body>
</html>"""

def send_welcome_email(
    email: str = "midbariola@gmail.com",
    artisan_name: str = "Mourad Hadj-Ali",
    workshop_name: str = "Atelier Aluminium Kouba",
    wilaya: str = "Alger (16)",
    phone: str = "0797780838"
) -> dict:
    html = generate_welcome_html(artisan_name, workshop_name, wilaya, phone)
    text = (
        f"Bienvenue sur Baiti Atelier, {artisan_name} !\n"
        f"Votre atelier {workshop_name} à {wilaya} est opérationnel avec l'abonnement Pro Annuel (35 000 DZD).\n"
        f"Téléphone enregistré : {phone}\n"
        f"Ouvrez votre atelier sur https://baiti-atelier.vercel.app"
    )

    api_key = get_resend_api_key()

    if not api_key:
        print(f"[LOCAL SIMULATION] No Resend API key detected in environment. Dispatch simulated successfully for: {email}")
        return {
            "status": "simulated",
            "delivered_to": email,
            "artisan_name": artisan_name,
            "workshop_name": workshop_name,
            "wilaya": wilaya,
            "subject": f"Bienvenue sur Baiti Atelier Pro, {artisan_name} !",
            "message": "Email synthesized and verified locally. Ready for Windmill production runner."
        }

    payload = {
        "from": "Baiti Atelier <onboarding@resend.dev>",
        "to": [email],
        "subject": f"Bienvenue sur Baiti Atelier Pro, {artisan_name} !",
        "html": html,
        "text": text
    }

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[DELIVERED] Email sent to {email} successfully: {data}")
            return {"status": "sent", "resend_id": data.get("id"), "to": email}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[ERROR] Resend API error ({e.code}): {error_body}")
        return {"status": "error", "code": e.code, "details": error_body}

def main(
    email: str = "midbariola@gmail.com",
    artisan_name: str = "Mourad Hadj-Ali",
    workshop_name: str = "Atelier Aluminium Kouba",
    wilaya: str = "Alger (16)",
    phone: str = "0797780838"
) -> dict:
    return send_welcome_email(email, artisan_name, workshop_name, wilaya, phone)

if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
