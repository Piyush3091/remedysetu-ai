import json
import re
from pathlib import Path

DATA_FILE = Path(__file__).parent / "products.json"

with open(DATA_FILE, encoding="utf-8") as f:
    PRODUCTS = json.load(f)

UNIT_MAP = {
    "ratti": "ratti", "rati": "ratti", "रत्ती": "ratti",
    "carat": "carat", "ct": "carat",
    "pcs": "piece", "pc": "piece", "pieces": "piece", "piece": "piece",
    "pics": "piece", "nos": "piece", "units": "piece", "unit": "piece",
    "dana": "piece", "पीस": "piece",
    "mala": "mala", "malas": "mala",
}
UNIT_RE = "|".join(sorted(UNIT_MAP.keys(), key=len, reverse=True))
UNIT_HI = {"ratti": "रत्ती", "piece": "पीस"}

HINGLISH_WORDS = [
    "kya", "hai", "hain", "chahiye", "chahie", "batao", "bataiye", "bataye",
    "mujhe", "kitna", "kitne", "ka", "ki", "ke", "aap", "nahi", "bhejo",
    "bhej", "lena", "dena", "wala", "mere", "hume", "humein", "milega",
    "milta", "karo", "kijiye", "kripya",
]
COMPLAINT_WORDS = [
    "complaint", "kharab", "kharaab", "damaged", "broken", "fake", "galat",
    "wrong", "refund", "return", "not received", "nahi mila", "nahi aaya",
    "delay", "late", "problem", "issue", "cheat", "dhoka", "शिकायत", "खराब",
]
BULK_WORDS = ["wholesale", "bulk", "thok", "dealer", "reseller", "थोक"]
PRICE_WORDS = [
    "rate", "price", "kitna", "kitne", "kimat", "keemat", "cost", "bhav",
    "bhaav", "daam", "dam", "कीमत", "भाव", "दाम", "रेट",
]
AVAIL_WORDS = [
    "available", "availability", "do you have", "have you", "stock",
    "original", "milega", "milta", "hai kya", "hain kya", "उपलब्ध", "मिलेगा", "असली",
]

PHRASES = {
    "English": {
        "hello": "Namaste! 🙏",
        "price_line": "{name}: ₹{up} per {unit}.",
        "bulk_line": "Bulk price: ₹{bp} per {unit} for {minq} {unit} or more.",
        "qty_bulk": "For {qty} {unit} of {name}: bulk price ₹{bp} per {unit} (regular ₹{up}). Total: ₹{total}.",
        "qty_regular": "For {qty} {unit} of {name}: ₹{up} per {unit}, total ₹{total}. Bulk price of ₹{bp} per {unit} applies from {minq} {unit}.",
        "avail": "Yes, {name} is part of our range. Our team will confirm current stock.",
        "ambiguous": "Which one would you like? We have:\n{options}\nPlease tell us the exact type.",
        "notfound": "Thank you for your message. Could you tell us which product you need (e.g. Neelam, Pukhraj, Rudraksha)? We will share the exact price right away.",
        "complaint": "We're sorry for the trouble. Please share your order details and our team will look into it immediately.",
        "general": "Thank you for contacting Remedy Setu. Please tell us which product and quantity you need, and we will share the exact price.",
        "closing": "Let us know if you'd like to place an order.",
    },
    "Hinglish": {
        "hello": "Namaste! 🙏",
        "price_line": "{name} ka rate ₹{up} per {unit} hai.",
        "bulk_line": "{minq} {unit} ya usse zyada par bulk rate ₹{bp} per {unit} hai.",
        "qty_bulk": "{qty} {unit} {name} ke liye bulk rate ₹{bp} per {unit} lagega (normal rate ₹{up}). Total: ₹{total}.",
        "qty_regular": "{qty} {unit} {name} ke liye ₹{up} per {unit}, total ₹{total}. {minq} {unit} ya zyada par bulk rate ₹{bp} per {unit} milega.",
        "avail": "Ji, {name} hamari range mein hai. Current stock hamari team confirm karegi.",
        "ambiguous": "Aapko kaun sa chahiye? Hamare paas ye hain:\n{options}\nKripya exact type bataiye.",
        "notfound": "Aapke message ke liye dhanyavaad. Kripya batayein aapko kaun sa product chahiye (jaise Neelam, Pukhraj, Rudraksha)? Hum turant exact rate bhej denge.",
        "complaint": "Hume asuvidha ke liye khed hai. Kripya apne order ki details bhejein, hamari team turant dekhegi.",
        "general": "Remedy Setu se sampark karne ke liye dhanyavaad. Kripya product aur quantity bataiye, hum exact rate share karenge.",
        "closing": "Order karna ho to bata dijiye.",
    },
    "Hindi": {
        "hello": "नमस्ते! 🙏",
        "price_line": "{name} का रेट ₹{up} प्रति {unit} है।",
        "bulk_line": "{minq} {unit} या उससे अधिक पर बल्क रेट ₹{bp} प्रति {unit} है।",
        "qty_bulk": "{qty} {unit} {name} के लिए बल्क रेट ₹{bp} प्रति {unit} लगेगा (सामान्य रेट ₹{up})। कुल: ₹{total}।",
        "qty_regular": "{qty} {unit} {name} के लिए ₹{up} प्रति {unit}, कुल ₹{total}। {minq} {unit} या अधिक पर बल्क रेट ₹{bp} प्रति {unit} मिलेगा।",
        "avail": "जी, {name} हमारी रेंज में है। वर्तमान स्टॉक हमारी टीम कन्फर्म करेगी।",
        "ambiguous": "आपको कौन सा चाहिए? हमारे पास ये हैं:\n{options}\nकृपया सही प्रकार बताइए।",
        "notfound": "आपके संदेश के लिए धन्यवाद। कृपया बताइए आपको कौन सा प्रोडक्ट चाहिए (जैसे नीलम, पुखराज, रुद्राक्ष)? हम तुरंत सही रेट भेज देंगे।",
        "complaint": "असुविधा के लिए खेद है। कृपया अपने ऑर्डर की जानकारी भेजें, हमारी टीम तुरंत देखेगी।",
        "general": "रेमेडी सेतु से संपर्क करने के लिए धन्यवाद। कृपया प्रोडक्ट और मात्रा बताइए, हम सही रेट बताएंगे।",
        "closing": "ऑर्डर करना हो तो बताइए।",
    },
}


def normalize(text):
    t = text.lower()
    return re.sub(r"(\d+)\s*-?\s*(mukhi|mukh|face|faced)(?![a-z])", r"\1 mukhi", t)


def _has_any(text, words):
    return any(
        re.search(r"(?<![a-z0-9])" + re.escape(w) + r"(?![a-z0-9])", text)
        for w in words
    )


def match_products(message):
    """Return the list of best-matching products (1 = clear match, >1 = ambiguous, 0 = none)."""
    t = normalize(message)
    scored = []
    for p in PRODUCTS:
        best = 0
        for alias in [p["name"], p["hindi_name"]] + p.get("aliases", []):
            a = normalize(alias)
            if re.search(r"(?<![a-z0-9])" + re.escape(a) + r"(?![a-z0-9])", t):
                best = max(best, len(a))
        if best:
            scored.append((best, p))
    if not scored:
        return []
    top = max(s for s, _ in scored)
    return [p for s, p in scored if s == top]


def extract_quantity(message):
    t = re.sub(r"\d+\s*mukhi", " ", normalize(message))
    m = re.search(r"(\d+(?:\.\d+)?)\s*(" + UNIT_RE + r")(?![a-z])", t)
    if m:
        qty = float(m.group(1))
        unit = UNIT_MAP[m.group(2)]
    else:
        m = re.search(r"(?<![\w.])(\d{1,5}(?:\.\d+)?)(?![\w])", t)
        if not m:
            return None, None
        qty = float(m.group(1))
        unit = None
    if qty.is_integer():
        qty = int(qty)
    return qty, unit


def detect_language(message):
    if re.search(r"[\u0900-\u097F]", message):
        return "Hindi"
    if _has_any(message.lower(), HINGLISH_WORDS):
        return "Hinglish"
    return "English"


def detect_intent(t, product, qty, has_match):
    if _has_any(t, COMPLAINT_WORDS):
        return "complaint"
    if _has_any(t, BULK_WORDS):
        return "bulk_order"
    if product and qty is not None and qty >= product["min_bulk_qty"]:
        return "bulk_order"
    if not product and qty is not None and qty >= 20:
        return "bulk_order"
    if _has_any(t, PRICE_WORDS):
        return "price_enquiry"
    if _has_any(t, AVAIL_WORDS):
        return "availability"
    if has_match:
        return "price_enquiry"
    return "general_enquiry"


def get_pricing(product, qty):
    bulk_applies = qty is not None and qty >= product["min_bulk_qty"]
    applied = product["bulk_price"] if bulk_applies else product["unit_price"]
    total = round(applied * qty, 2) if qty is not None else None
    return {
        "unit": product["unit"],
        "unit_price": product["unit_price"],
        "bulk_price": product["bulk_price"],
        "min_bulk_qty": product["min_bulk_qty"],
        "bulk_applies": bulk_applies,
        "applied_price": applied,
        "total": total,
    }


def analyze_message(message):
    """Rule-based analysis. Backend is the single source of truth for products and prices."""
    t = normalize(message)
    matches = match_products(message)
    product = matches[0] if len(matches) == 1 else None
    qty, qty_unit = extract_quantity(message)
    if product:
        status = "matched"
    elif matches:
        status = "ambiguous"
    else:
        status = "not_found"
    return {
        "message": message,
        "language": detect_language(message),
        "intent": detect_intent(t, product, qty, bool(matches)),
        "status": status,
        "product": product,
        "candidates": matches[:6] if status == "ambiguous" else [],
        "quantity": qty,
        "quantity_unit": qty_unit,
        "pricing": get_pricing(product, qty) if product else None,
    }


def _n(x):
    x = float(x)
    return f"{x:,.0f}" if x.is_integer() else f"{x:,.2f}"


def build_fallback_reply(a):
    lang = a["language"]
    P = PHRASES[lang]
    parts = [P["hello"]]

    if a["intent"] == "complaint":
        parts.append(P["complaint"])
        return "\n".join(parts)

    if a["status"] == "matched":
        p, pr = a["product"], a["pricing"]
        name = p["hindi_name"] if lang == "Hindi" else p["name"]
        unit = UNIT_HI.get(pr["unit"], pr["unit"]) if lang == "Hindi" else pr["unit"]
        vals = dict(
            name=name, unit=unit,
            up=_n(pr["unit_price"]), bp=_n(pr["bulk_price"]), minq=_n(pr["min_bulk_qty"]),
            qty=_n(a["quantity"]) if a["quantity"] is not None else "",
            total=_n(pr["total"]) if pr["total"] is not None else "",
        )
        if a["intent"] == "availability":
            parts.append(P["avail"].format(**vals))
        if a["quantity"] is not None:
            parts.append(P["qty_bulk" if pr["bulk_applies"] else "qty_regular"].format(**vals))
        else:
            parts.append(P["price_line"].format(**vals))
            parts.append(P["bulk_line"].format(**vals))
        parts.append(P["closing"])
    elif a["status"] == "ambiguous":
        options = "\n".join(
            "- " + (c["hindi_name"] if lang == "Hindi" else c["name"]) for c in a["candidates"]
        )
        parts.append(P["ambiguous"].format(options=options))
    elif a["intent"] == "general_enquiry":
        parts.append(P["general"])
    else:
        parts.append(P["notfound"])

    return "\n".join(parts)