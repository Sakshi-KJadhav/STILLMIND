import os
import re
import sqlite3

from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography.fernet import Fernet

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# ================= 1. OPTIONAL GEMINI API KEY =================
# Set this in your environment before running the app, for example:
#   export GEMINI_API_KEY="your_key_here"
# If it is not set, the app still works with its built-in fallback engine.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# ================= 2. ENCRYPTION & SECURE SQLITE DATABASE =================
KEY_FILE = "secret.key"
if not os.path.exists(KEY_FILE):
    with open(KEY_FILE, "wb") as f:
        f.write(Fernet.generate_key())

with open(KEY_FILE, "rb") as f:
    cipher = Fernet(f.read())

DB_FILE = "stillmind_secure.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS encrypted_chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            nickname TEXT,
            mood TEXT,
            stress_level INTEGER,
            encrypted_user_msg BLOB,
            encrypted_bot_reply BLOB,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()
session_memory = {}

# ================= 3. AUTO-DETECT LANGUAGE (MARATHI, HINDI, ENGLISH) =================
MARATHI_MARKERS = [
    "मला", "आहे", "नाही", "वाटतंय", "वाटते", "काय", "कसा", "कशी", "ताण", "दुःख",
    "मदत", "विनोद", "झोप", "भीती", "एकटं", "एकटे", "अभ्यास", "घरचे", "माझं", "माझे",
    "तुम्ही", "सांगा", "बरं", "मन", "त्रास", "कंटाळा", "रडू", "आयुष्य"
]

HINDI_MARKERS = [
    "मुझे", "है", "हूँ", "नहीं", "तनाव", "परेशान", "दुख", "मदद", "चुटकुला", "नींद",
    "डर", "अकेला", "अकेली", "पढ़ाई", "मेरा", "मेरी", "आप", "बताओ", "मन", "रो", "जिंदगी", "क्या", "कैसे"
]

def detect_language(user_text, dropdown_lang):
    text_lower = user_text.lower()
    # Check if user typed in Devanagari script
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', user_text))
    if has_devanagari:
        for word in MARATHI_MARKERS:
            if word in user_text:
                return "Marathi"
        for word in HINDI_MARKERS:
            if word in user_text:
                return "Hindi"
        # If Devanagari but general words, respect dropdown if set to Marathi/Hindi, else default Marathi/Hindi
        if dropdown_lang in ["Marathi", "Hindi"]:
            return dropdown_lang
        return "Marathi"

    # Also check Romanized Marathi / Hindi words
    if any(w in text_lower.split() for w in ["mala", "aahe", "nahi", "kasa", "vatat", "taan", "tras", "manat"]):
        return "Marathi"
    if any(w in text_lower.split() for w in ["mujhe", "hai", "bohot", "pareshan", "dukh", "akela", "zindagi"]):
        return "Hindi"

    return dropdown_lang

# ================= 4. CRISIS & SEVERE DEPRESSION DETECTION =================
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "no reason to live",
    "self harm", "severely depressed", "hopeless", "can't go on", "give up on life",
    "आत्महत्या", "मरना चाहता", "मरना चाहती", "जीना नहीं", "जिंदगी खत्म",
    "आत्महत्येचा", "जगायचे नाही", "नकोसं वाटतंय", "माझा अंत", "जीव द्यावासा"
]


def estimate_stress_level(user_message, recent_history=None, mood="General"):
    history = recent_history or []
    full_text = " ".join([str(user_message or "")] + [str(item) for item in history]).lower()
    if not full_text.strip():
        return 5

    negative_terms = {
        "panic": 3, "anxious": 3, "anxiety": 3, "overwhelmed": 3, "hopeless": 4,
        "depressed": 4, "crying": 4, "cry": 3, "exhausted": 3, "tired": 2,
        "lonely": 3, "sad": 2, "scared": 2, "worried": 2, "stress": 2,
        "stressed": 2, "nervous": 2, "can't sleep": 4, "cannot sleep": 4,
        "insomnia": 3, "can't focus": 2, "no reason": 4, "want to die": 8,
        "kill myself": 9, "self harm": 9, "suicide": 9, "breakdown": 5,
        "pressure": 2, "failed": 2, "failing": 2, "overthinking": 3,
        "relationship": 1, "family": 1, "exam": 2, "college": 2, "work": 2,
        "angry": 1, "upset": 2, "hurt": 1, "frustrated": 2, "ashamed": 2,
        "alone": 2, "empty": 2, "hoping": 1
    }

    negative_terms_multilingual = {
        "ताण": 2, "दुःख": 3, "घाबर": 3, "वाटतंय": 2, "एकटं": 2, "रडू": 4,
        "अकेला": 2, "परेशान": 3, "तनाव": 2, "डर": 2, "असह्य": 3, "दुख": 3,
        "नींद": 2, "बहुत": 1, "पढ़ाई": 2, "काम": 2, "जिंदगी": 2, "मरना": 6,
        "आत्महत्या": 9, "जीना नहीं": 7, "नकोसं": 3, "अवघड": 2
    }

    positive_terms = {
        "calm": -2, "happy": -2, "peaceful": -2, "confident": -2, "relaxed": -3,
        "hopeful": -2, "better": -2, "smile": -2, "rested": -2, "okay": -1,
        "normal": -1, "strong": -2, "joy": -2, "support": -1
    }

    positive_terms_multilingual = {
        "सुसंवादी": -2, "नम्र": -1, "मानसिक": -1, "सुखी": -2, "आनंद": -2,
        "शांत": -2, "खुशी": -2, "सामर्थ्य": -2, "काळजी": -1, "सोडून": -1,
        "शांतमय": -2, "सामान्य": -1, "आराम": -2, "ताज": -1
    }

    score = 5

    for term, weight in negative_terms.items():
        if term in full_text:
            score += weight
    for term, weight in negative_terms_multilingual.items():
        if term in full_text:
            score += weight
    for term, weight in positive_terms.items():
        if term in full_text:
            score += weight
    for term, weight in positive_terms_multilingual.items():
        if term in full_text:
            score += weight

    mood_lower = (mood or "").lower()
    if any(word in mood_lower for word in ["stressed", "overwhelmed", "low", "sad", "anxious", "lost", "tired"]):
        score += 1
    if any(word in mood_lower for word in ["smile", "joke", "boost", "happy", "calm", "relaxed"]):
        score -= 1

    if "i am fine" in full_text or "i feel okay" in full_text:
        score -= 1

    return max(1, min(10, int(score)))


def check_is_emergency(text, stress_level):
    lower_text = text.lower()
    for word in CRISIS_KEYWORDS:
        if word in lower_text:
            return True
    if int(stress_level) >= 10 and any(w in lower_text for w in ["depressed", "crying", "दुःख", "रडू", "रो"]):
        return True
    return False

# ================= 5. BUILT-IN CONTEXTUAL EMPATHETIC BRAIN (EN / HI / MR) =================
def generate_contextual_reply(user_message, nickname, lang, mood, stress_level, is_emergency):
    msg = user_message.lower()

    # Check what topic the user is talking about so the answer directly connects!
    is_joke = any(w in msg for w in ["joke", "funny", "laugh", "smile", "विनोद", "हस", "चुटकुला", "मजाक"])
    is_incident = any(w in msg for w in ["incident", "happened", "story", "hurt", "friend", "family", "relationship", "told me", "घडलं", "प्रसंग", "बोललो", "दुखावलं", "घरच्यांनी", "हुआ", "घटना", "दोस्त", "परिवार", "दिल"])
    is_study_work = any(w in msg for w in ["exam", "study", "college", "work", "job", "marks", "career", "अभ्यास", "परीक्षा", "कॉलेज", "काम", "पढ़ाई", "एग्जाम", "नौकरी"])
    is_anxious_cbt = any(w in msg for w in ["anxious", "anxiety", "overthinking", "panic", "cbt", "fear", "scared", "भीती", "विचार", "घाबर", "ताण", "घबराहट", "डर", "सोच"])
    is_exercise = any(w in msg for w in ["exercise", "meditation", "breathe", "game", "relax", "sleep", "व्यायाम", "ध्यान", "श्वास", "झोप", "नींद", "ध्यान"])

    if lang == "Marathi":
        if is_joke:
            return (
                f"नक्कीच {nickname}! तुमच्या चेहऱ्यावर हसू यावं म्हणून एक छोटासा विनोद 😄:\n\n"
                f"एकदा मनातले सगळे विचार एकत्र बसून मीटिंग करत असतात.\n"
                f"पहिला विचार म्हणतो: 'आज रात्री आपण शांत झोपूया का?'\n"
                f"दुसरा विचार लगेच म्हणतो: 'छे छे! ५ वर्षांपूर्वी आपण लोकांसमोर काय चुकीचं बोललो होतो, त्याची आठवण काढायची बाकी आहे अजून!' 😂🌟\n\n"
                f"कसा वाटला? आपलं मन असंही उगाचच जुन्या गोष्टी उकरून काढत असतं. आता एक दीर्घ श्वास घ्या आणि मला सांगा, आता थोडं हलकं वाटतंय का?"
            )
        elif is_incident:
            return (
                f"मी तुमचं बोलणं अगदी शांतपणे आणि पूर्ण आपुलकीने ऐकत आहे, {nickname} 🌿. "
                f"आयुष्यात असे काही प्रसंग घडतात जे आपल्या मनाला खूप खोलवर दुखावून जातात, आणि अशा वेळी वाईट वाटणं किंवा मनात संताप येणं पूर्णपणे नैसर्गिक आहे.\n\n"
                f"तुम्ही माझ्यावर विश्वास ठेवून हे शेअर केलं याबद्दल धन्यवाद. मानसशास्त्रातील (Humanistic Therapy) नियमानुसार, भावना मनात दाबून ठेवण्यापेक्षा त्या व्यक्त केल्याने मनावरील निम्मा भार कमी होतो. "
                f"त्या प्रसंगात तुम्हाला सर्वात जास्त कशाचे वाईट वाटले? मन मोकळं करून सांगा, मी तुमच्या सोबत आहे."
            )
        elif is_study_work:
            return (
                f"{nickname}, अभ्यास, करिअर किंवा कामाचा ताण येणं खूप साहजिक आहे 📚🌿. "
                f"जेव्हा आपल्यावर खूप अपेक्षांचं ओझं असतं, तेव्हा मेंदू थकून जातो.\n\n"
                f"एक छोटासा **CBT (Cognitive Behavioral Therapy)** उपाय करून पाहूया:\n"
                f"१. सर्व कामे एकाच वेळी करण्याचा विचार सोडा आणि फक्त पुढच्या २० मिनिटांत करता येईल अशी एकच छोटी गोष्ट निवडा.\n"
                f"२. उजव्या बाजूला दिलेला **🫧 Pop-It गेम** किंवा **४-७-८ श्वसनाचा व्यायाम** २ मिनिटे करा.\n"
                f"तुम्हाला सध्या कोणत्या विषयाची किंवा कामाची सर्वात जास्त काळजी वाटत आहे?"
            )
        elif is_anxious_cbt or is_exercise:
            return (
                f"शांत व्हा {nickname} 🌿, तुम्ही आता पूर्णपणे सुरक्षित आहात. जेव्हा मनात अतिविचार (Overthinking) सुरू होतात, तेव्हा आपलं मन भविष्यातील भीतीमध्ये अडकतं.\n\n"
                f"**मानसशास्त्रीय CBT आणि ग्राउंडिंग उपाय:**\n"
                f"• आत्ता या क्षणी तुमचे दोन्ही पाय जमिनीवर घट्ट टेकवा आणि ४ सेकंद दीर्घ श्वास घ्या.\n"
                f"• स्वतःला सांगा: *'हा फक्त एक विचार आहे, हे पूर्ण सत्य नाही.'*\n"
                f"• खाली दिलेल्या **🔥 Worry Shredder** गेममध्ये तुमची भीती लिहा आणि ती नष्ट करा. मी तुमच्या सोबत आहे, मला सांगा नेमकी कशाची भीती वाटत आहे?"
            )
        else:
            return (
                f"नमस्कार {nickname} 🌿, तुम्ही जे बोलत आहात ते मी पूर्ण लक्ष देऊन आणि आपुलकीने समजून घेत आहे. "
                f"तुमचा आजचा तणाव स्तर ({stress_level}/10) पाहता, स्वतःच्या मनाची काळजी घेणे खूप महत्त्वाचे आहे.\n\n"
                f"माझ्याकडे तुम्ही अगदी जवळच्या मित्राप्रमाणे मन मोकळं करू शकता. तुम्हाला एखादा आयुष्यातील प्रसंग सांगायचा आहे का, मनाला शांत करणारा व्यायाम करायचा आहे, की खालील तज्ज्ञ मानसशास्त्रज्ञांशी **🔴 Live Video** द्वारे थेट बोलायचे आहे?"
            )

    elif lang == "Hindi":
        if is_joke:
            return (
                f"ज़रूर {nickname}! आपके चेहरे पर मुस्कान लाने के लिए एक प्यारा सा चुटकुला 😄:\n\n"
                f"मरीज: डॉक्टर साहब, जब मैं सोता हूँ तो मेरे सपने में बंदर क्रिकेट खेलते हैं!\n"
                f"डॉक्टर: कोई बात नहीं, यह दवा आज रात से खा लेना।\n"
                f"मरीज: कल से खाऊँ तो चलेगा? आज रात तो उनका फाइनल मैच है! 😂🌟\n\n"
                f"हंसी तनाव की सबसे अच्छी दवा है। बताइए, अब मन थोड़ा हल्का महसूस हो रहा है?"
            )
        elif is_incident:
            return (
                f"मैं आपकी हर बात बहुत धैर्य, शांति और अपनेपन के साथ सुन रहा हूँ, {nickname} 🌿। "
                f"जब हमारे साथ कोई ऐसी घटना घटती है या कोई अपना दिल दुखाता है, तो मन का भारी होना बिल्कुल स्वाभाविक है।\n\n"
                f"आप यहाँ बिल्कुल सुरक्षित हैं और मैं आपको जज नहीं करूँगा। अपने दिल की बात बाहर निकालने से मन का बोझ हल्का होता है। "
                f"आप आराम से मुझे पूरी बात बताइए—उस वक्त आपको कैसा लगा था?"
            )
        elif is_study_work:
            return (
                f"{nickname}, पढ़ाई, कॉलेज या काम का दबाव कभी-कभी बहुत थका देता है 📚🌿। "
                f"मनोविज्ञान (CBT Therapy) कहता है कि जब हम पूरे पहाड़ को एक साथ देखते हैं तो घबराहट होती है, इसलिए सिर्फ अगले एक छोटे कदम पर ध्यान दें।\n\n"
                f"• अभी 2 मिनट के लिए स्क्रीन के दाईं ओर **4-7-8 ब्रीदिंग लोटस** के साथ गहरी सांस लें।\n"
                f"• नीचे **🫧 Pop-It गेम** खेलकर अपने दिमाग को थोड़ा ब्रेक दें।\n"
                f"मुझे बताइए, अभी सबसे ज्यादा किस बात का प्रेशर लग रहा है?"
            )
        elif is_anxious_cbt or is_exercise:
            return (
                f"गहरी सांस लें {nickname} 🌿, मैं आपके साथ हूँ। जब ओवरथिंकिंग या घबराहट बढ़ती है, तो हमारा दिमाग आने वाले कल की चिंता में उलझ जाता है।\n\n"
                f"**तुरंत राहत के लिए मनोवैज्ञानिक तकनीक (CBT & DBT):**\n"
                f"1. अपने कंधों को ढीला छोड़ें और 4 सेकंड तक धीरे-धीरे सांस अंदर लें।\n"
                f"2. नीचे दिए गए **🔥 Worry Shredder** में अपनी चिंता लिखें और उसे श्रेड (नष्ट) कर दें।\n"
                f"बताइए, अभी आपके मन में कौन सा विचार बार-बार आ रहा है?"
            )
        else:
            return (
                f"नमस्ते {nickname} 🌿, आपकी बात सुनकर मुझे एहसास हो रहा है कि आप इस समय काफी कुछ महसूस कर रहे हैं (तनाव स्तर: {stress_level}/10)।\n\n"
                f"आप मुझे अपना सबसे करीबी और भरोसेमंद दोस्त समझ सकते हैं। आप चाहें तो अपने जीवन की कोई घटना साझा करें, मुझसे कोई मजेदार चुटकुला सुनें, या नीचे हमारे विशेषज्ञ मनोवैज्ञानिकों से **🔴 Live Video** पर बात करें। आपके मन में अभी क्या चल रहा है?"
            )

    else:
        # English Contextual Replies
        if is_joke:
            return (
                f"Here is a light-hearted joke just to bring a smile to your face, {nickname} 😄:\n\n"
                f"Why did the overthinking brain go to the gym?\n"
                f"Because it wanted to stop *jumping to conclusions* and start doing gentle stretches instead! 🏃‍♂️😂\n\n"
                f"Laughter actually lowers stress hormones (cortisol) in your body within seconds. Did that give you a tiny smile, or would you like another one?"
            )
        elif is_incident:
            return (
                f"I am listening to you with all my patience and warmth, {nickname} 🌿. "
                f"When something painful happens in our lives, carrying it silently inside feels exhausting. It makes complete sense that you feel this way.\n\n"
                f"In Humanistic and Interpersonal therapy, having a safe, non-judgmental space to tell your story is the first step toward emotional relief. "
                f"Take all the time you need—tell me more about what happened and how it made you feel."
            )
        elif is_study_work:
            return (
                f"I completely understand why you feel stretched thin, {nickname} 📚🌿. Academic and work pressure can make your mind feel like it has 50 browser tabs open at once.\n\n"
                f"Let's use a real psychologist **CBT (Cognitive Behavioral Therapy) Micro-Step**:\n"
                f"1. Separate *your self-worth* from *your workload*. You are a human being, not a machine.\n"
                f"2. Pick just **one 15-minute task** and ignore the rest for now.\n"
                f"3. Try popping a few bubbles in the **🫧 Pop-It Stress Reliever** below to reset your nervous system.\n"
                f"What part of your work or studies is stressing you out the most today?"
            )
        elif is_anxious_cbt or is_exercise:
            return (
                f"Take a slow, grounding breath with me right now, {nickname} 🌿. You are safe here.\n\n"
                f"Let's walk through a **3-Step Psychologist CBT Thought-Reframing Exercise** together:\n"
                f"1. **Catch the Thought:** What is the exact worst-case scenario your mind is telling you right now?\n"
                f"2. **Check the Evidence:** Is this thought 100% a proven fact, or is it anxiety speaking?\n"
                f"3. **Physical Reset:** Unclench your jaw, drop your shoulders, and type that anxious thought into the **🔥 Worry Shredder** below to release it.\n\n"
                f"Tell me the thought that is bothering you, and we will reframe it together."
            )
        else:
            return (
                f"Thank you for sharing that with me, {nickname} 🌿. I am right here with you, and I care about what you are going through (Current Mood: {mood}, Stress: {stress_level}/10).\n\n"
                f"Whether you want to vent about a personal life incident, practice a calming meditation or CBT exercise, hear a joke to lift your spirits, or connect on a **🔴 Live Video Call** with one of our psychologists below—we will take this one gentle step at a time. Tell me more about what's on your mind."
            )

# ================= 6. ROUTES =================
@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    session_id = data.get("session_id", "default")
    nickname = data.get("nickname", "Friend")
    user_message = data.get("message", "")
    dropdown_language = data.get("language", "English")
    mood = data.get("mood", "General")
    input_stress = int(data.get("stress_level", 5) or 5)

    if session_id not in session_memory:
        session_memory[session_id] = []
    session_memory[session_id].append(f"User ({nickname}): {user_message}")
    recent_history = session_memory[session_id][-8:]
    detected_stress = estimate_stress_level(user_message, recent_history[:-1], mood)
    stress_level = max(1, min(10, max(detected_stress, input_stress)))

    # Automatically detect if the user typed in Marathi, Hindi, or English!
    active_language = detect_language(user_message, dropdown_language)
    is_emergency = check_is_emergency(user_message, stress_level)

    recent_history_text = "\n".join(recent_history)

    bot_reply = ""

    # Use Gemini API if key is configured
    if GEMINI_AVAILABLE and GEMINI_API_KEY and GEMINI_API_KEY.strip():
        try:
            system_instruction = f"""
            You are StillMind, an official, deeply empathetic AI pre-consultation emotional support companion.
            - Patient Name: {nickname}
            - Current Mood: {mood} (Stress Level: {stress_level}/10)
            - Target Language: {active_language} (CRITICAL: You MUST reply 100% in {active_language}. Use natural Devanagari script for Marathi and Hindi).

            CLINICAL & EMPATHETIC RULES:
            1. Reply directly to what the patient just asked or shared with deep warmth, patience, and belonging.
            2. Use evidence-based psychological techniques (CBT, DBT, Humanistic, Interpersonal therapy).
            3. Suggest exercises, breathing, jokes, or the Pop-It / Worry Shredder games on the page when helpful.
            4. If severe distress is detected, guide them to click the Live Video Consultation button to speak with our Clinical or Counseling Psychologists immediately.

            Recent Conversation:
            {recent_history_text}
            """
            client = genai.Client(api_key=GEMINI_API_KEY.strip())
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=system_instruction
            )
            bot_reply = response.text
        except Exception:
            bot_reply = generate_contextual_reply(user_message, nickname, active_language, mood, stress_level, is_emergency)
    else:
        bot_reply = generate_contextual_reply(user_message, nickname, active_language, mood, stress_level, is_emergency)

    if is_emergency:
        if active_language == "Marathi":
            bot_reply += "\n\n🚨 **तातडीची काळजी:** तुम्ही खूप मोठ्या मानसिक त्रासातून जात आहात. कृपया एकटे राहू नका—मी वरती **🔴 Live Video Consultation** रूम ऑन केली आहे. कृपया आत्ताच आमच्या क्लिनिकल सायकॉलॉजिस्टशी व्हिडिओ कॉलवर बोला किंवा `14416` (Tele-MANAS) वर कॉल करा."
        elif active_language == "Hindi":
            bot_reply += "\n\n🚨 **तत्काल सहायता:** आप इस समय गहरे मानसिक दर्द से गुजर रहे हैं। कृपया इसे अकेले न सहें—ऊपर **🔴 Live Video Consultation** बटन दबाकर अभी हमारे क्लिनिकल साइकोलॉजिस्ट से लाइव वीडियो पर जुड़ें या `14416` (Tele-MANAS) पर कॉल करें।"
        else:
            bot_reply += "\n\n🚨 **Immediate Care Activated:** Because you are experiencing deep emotional pain, please don't carry this alone. Click the **🔴 Join Emergency Video Consultation Now** button above to connect live on video with our Clinical Psychologist, or call Tele-MANAS at `14416` (24/7)."

    session_memory[session_id].append(f"StillMind: {bot_reply}")

    # Encrypt and store in SQLite
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO encrypted_chats (session_id, nickname, mood, stress_level, encrypted_user_msg, encrypted_bot_reply, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id,
        nickname,
        mood,
        int(stress_level),
        cipher.encrypt(user_message.encode("utf-8")),
        cipher.encrypt(bot_reply.encode("utf-8")),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "reply": bot_reply,
        "is_emergency": is_emergency,
        "detected_language": active_language,
        "stress_level": stress_level
    })

if __name__ == "__main__":
    print("=====================================================")
    print("🌿 StillMind Health Official Server is Running!")
    print("👉 Open in Chrome: http://127.0.0.1:5000")
    print("=====================================================")
    app.run(debug=True, port=5000)