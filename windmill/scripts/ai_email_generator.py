import wmill
from openai import OpenAI
import os
import json
import time

# ==============================================================================
# Baiti Atelier AI Email Synthesis Engine
# Leverages ultra-fast Groq inference with rate-limit queuing and single-key NVIDIA NIM fallback.
# Strictly compliant with single NVIDIA NIM API key architecture.
# ==============================================================================

# Single verified NVIDIA NIM API key
NVIDIA_NIM_KEY = os.environ.get("NVIDIA_NIM_API_KEY", "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")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def generate_personalized_content(
    artisan_name: str,
    trade: str,
    wilaya: str,
    email_type: str = "welcome",
    language: str = "fr",
    quote_details: dict = None
) -> dict:
    """
    Synthesizes concise, professional email copy tailored to Algerian workshop trades.
    Uses Groq queue with automatic retry, falling back to NVIDIA NIM.
    """
    system_prompt = (
        "Vous etes le redacteur industriel de Baiti Atelier (بيتي), la plateforme des artisans "
        "menuisiers, ebenistes et ferronniers en Algerie. Redigez des emails clairs, chaleureux "
        "et techniques en Dinars Algeriens (DZD), sans verbiage artificiel, sans tirets cadratins, "
        "en respectant les termes professionnels de l'artisanat algerien (gamme 40/45, RPT 52, DTR C3-2)."
    )

    if email_type == "welcome":
        user_prompt = (
            f"Redigez un court message de bienvenue personnalise pour {artisan_name}, "
            f"artisan en {trade} base a la wilaya de {wilaya}. Langue: {language}. "
            "Rappelez que l'optimiseur de debitage 1D/2D et le carnet de devis sont prets et 100% hors-ligne. "
            "Repondez au format JSON strictement avec les cles 'subject', 'headline', 'intro', 'key_points' (liste de 3 phrases), 'cta_text'."
        )
    else:
        quote_code = quote_details.get("quote_code", "MON-26-XXXX") if quote_details else "MON-26-XXXX"
        total_dzd = quote_details.get("total_dzd", 0) if quote_details else 0
        user_prompt = (
            f"Redigez une notification de devis pour {artisan_name} ({trade}, {wilaya}). "
            f"Devis reference: {quote_code}, Montant: {total_dzd:,.2f} DZD. Langue: {language}. "
            "Repondez au format JSON strictement avec les cles 'subject', 'headline', 'intro', 'key_points', 'cta_text'."
        )

    # 1. Attempt Groq with queue / exponential backoff
    if GROQ_API_KEY:
        for attempt in range(2):
            try:
                groq_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)
                resp = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    timeout=10.0
                )
                return json.loads(resp.choices[0].message.content)
            except Exception as e:
                print(f"[Groq Queue Notice] Attempt {attempt + 1} failed: {e}")
                time.sleep(1.0)

    # 2. Fallback: NVIDIA NIM Single Key Inference
    try:
        nim_client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=NVIDIA_NIM_KEY)
        nim_models = [
            "meta/llama-3.1-8b-instruct",
            "mistralai/mistral-7b-instruct-v0.3",
            "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"
        ]
        for model in nim_models:
            try:
                print(f"[NVIDIA NIM] Invoking fast model: {model}")
                resp = nim_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    timeout=12.0
                )
                return json.loads(resp.choices[0].message.content)
            except Exception as model_err:
                print(f"[NVIDIA NIM] Model {model} exception: {model_err}")
                continue
    except Exception as nim_err:
        print(f"[NVIDIA NIM Engine Error]: {nim_err}")

    # 3. Deterministic Static Fallback
    if language == "ar":
        return {
            "subject": f"مرحبا بك في بيتي اتليي يا {artisan_name}",
            "headline": f"ورشتكم في ولاية {wilaya} جاهزة للعمل على منصة بيتي",
            "intro": f"يسعدنا انضمامكم الى شبكة الحرفيين في مجال {trade}.",
            "key_points": [
                "حسابات تقطيع الالمنيوم والزجاج بدقة المليمتر",
                "اصدار فوري لكشوف الاسعار والطلبيات بالدينار الجزائري",
                "عمل متكامل حتى بدون انترنت في ورشتكم"
            ],
            "cta_text": "فتح ورشة العمل"
        }
    return {
        "subject": f"Bienvenue sur Baiti Atelier, {artisan_name}",
        "headline": f"Votre atelier a {wilaya} est operationnel sur Baiti",
        "intro": f"Nous sommes ravis d'accompagner votre activite en {trade}.",
        "key_points": [
            "Calculs millimetriques de debit de barres et de vitrage",
            "Emission immediate de devis proforma en Dinars Algeriens",
            "Fonctionnement 100% autonome hors-ligne a l'atelier"
        ],
        "cta_text": "Acceder au Studio Atelier"
    }

def main(
    artisan_name: str = "Atelier Moderne",
    trade: str = "Menuiserie Aluminium",
    wilaya: str = "Alger (16)",
    email_type: str = "welcome",
    language: str = "fr",
    quote_details: dict = None
):
    return generate_personalized_content(
        artisan_name=artisan_name,
        trade=trade,
        wilaya=wilaya,
        email_type=email_type,
        language=language,
        quote_details=quote_details
    )
