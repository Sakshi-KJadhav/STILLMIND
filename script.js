<<<<<<< HEAD
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StillMind | Personalized AI Pre-Consultation Emotional Support</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- ================= LOGIN / SIGNUP SCREEN ================= -->
  <div id="auth-modal" class="modal-overlay auth-overlay">
    <div class="modal-box auth-box">
      <h2 id="auth-title">🌿 Welcome to StillMind</h2>
      <p id="auth-description">Login to access your private conversations.</p>

      <div class="auth-tabs">
        <button id="show-login" class="primary-btn" type="button">Login</button>
        <button id="show-signup" class="secondary-btn" type="button">Sign Up</button>
      </div>

      <form id="auth-form">
        <label class="input-label" for="auth-email">Email Address</label>
        <input type="email" id="auth-email" placeholder="Enter your email" required />

        <label class="input-label" for="auth-password">Password</label>
        <input type="password" id="auth-password" placeholder="Minimum 8 characters" minlength="8" required />

        <button type="submit" id="auth-submit" class="primary-btn full-width">Login</button>
      </form>

      <p id="auth-message" class="auth-message" role="status"></p>
      <p class="small-text">🔒 Your account keeps your conversations private.</p>
    </div>
  </div>

  <!-- ================= 1. INFORMED CONSENT POP-UP MODAL ================= -->
  <div id="consent-modal" class="modal-overlay">
    <div class="modal-box">
      <h2>🌿 Welcome to StillMind</h2>
      <p>
        StillMind is your safe, confidential space to share your feelings, relieve stress, and receive empathetic pre-consultation emotional support in <strong>English, Hindi, and Marathi</strong>.
      </p>
      <div class="consent-points">
        <p>🔒 <strong>Minimal Data & Encryption:</strong> We never ask for your real name, phone number, or address. Your chat messages are encrypted before being stored.</p>
        <p>🩺 <strong>Informed Medical Disclaimer:</strong> StillMind uses evidence-based talk therapy concepts like CBT and Humanistic support, but it is an AI pre-consultation companion—not a replacement for a licensed psychologist or psychiatrist.</p>
      </div>
      <label for="nickname-input" class="input-label">Choose a private nickname (optional):</label>
      <input type="text" id="nickname-input" placeholder="e.g., CalmSeeker, Friend, Aarav..." />

      <label class="checkbox-label">
        <input type="checkbox" id="consent-checkbox" />
        I understand and give my informed consent to start my wellness session.
      </label>
      <button id="accept-consent-btn" class="primary-btn">Enter StillMind Safe Space</button>
    </div>
  </div>

  <!-- ================= 2. EDITABLE NAVIGATION BAR ================= -->
  <header class="navbar">
    <div class="logo-container">
      <span class="logo-icon">🌿</span>
      <div>
        <h1 class="brand-name">StillMind</h1>
        <span class="brand-tagline">AI Pre-Consultation Emotional Support</span>
      </div>
    </div>

    <nav class="nav-links">
      <a href="#workspace">AI Consultant</a>
      <a href="#calm-zone">Relief & Games</a>
      <a href="#specialist-directory">Real Psychologists</a>
    </nav>

    <div class="nav-controls">
      <select id="language-select" aria-label="Select Language">
        <option value="English">🌐 English</option>
        <option value="Hindi">🌐 हिन्दी (Hindi)</option>
        <option value="Marathi">🌐 मराठी (Marathi)</option>
      </select>

      <button id="theme-toggle" class="secondary-btn">🌙 Dark Mode</button>
    </div>
  </header>

  <!-- ================= 3. MOOD & CONDITION BAR ================= -->
  <section class="mood-bar">
    <div class="mood-item">
      <label for="mood-select"><strong>How are you feeling right now?</strong></label>
      <select id="mood-select">
        <option value="Stressed with college or work performance">📚 Stressed with College / Work</option>
        <option value="Want to share a life incident and vent">💬 Want to Share a Life Incident</option>
        <option value="Anxious and overwhelmed">😰 Anxious / Overwhelmed</option>
        <option value="Feeling low, lonely, or sad">🌧️ Feeling Low / Lonely</option>
        <option value="Relationship or family stress">🤝 Family / Relationship Stress</option>
        <option value="Need a smile, joke, or mood boost">😊 Need a Joke / Mood Boost</option>
      </select>
    </div>

    <div class="mood-item">
      <label for="stress-slider"><strong>Stress Level: <span id="stress-value">5</span>/10</strong></label>
      <input type="range" id="stress-slider" min="1" max="10" value="5" />
    </div>
  </section>

  <!-- ================= 4. EMERGENCY BANNER ================= -->
  <div id="emergency-banner" class="emergency-banner hidden">
    <div>
      <strong>🚨 You Are Not Alone — Immediate Human Support is Available:</strong>
      <p>It sounds like you are going through deep emotional pain. Please reach out to a real human specialist right now:</p>
      <p>📞 <strong>Tele-MANAS (24/7 Free Govt. of India Mental Health Helpline):</strong> <code>14416</code> or <code>1800-891-4416</code> | <strong>Emergency:</strong> <code>112</code></p>
    </div>
    <a href="#specialist-directory" class="emergency-btn">Connect to a Real Psychologist</a>
  </div>

  <!-- ================= 5. MAIN WORKSPACE: AI CHAT + RELIEF TOOLKIT ================= -->
  <main id="workspace" class="main-grid">
    <section class="chat-card">
      <div class="chat-header">
        <div>
          <h2>💬 StillMind AI Companion</h2>
          <p id="welcome-user-text">Listening with patience, warmth, and zero judgement.</p>
        </div>
        <button id="download-summary-btn" class="outline-btn" title="Download summary for a real psychologist">
          📄 Pre-Consultation Note
        </button>
      </div>

      <div id="chat-box" class="chat-box">
        <div class="message bot-message">
          Namaste! 🌿 I am <strong>StillMind</strong>, your personal emotional support companion. Whether you want to share a life incident, calm down from exam or work stress, try a guided breathing exercise, hear a light joke, or prepare for a visit with a real psychologist—I am right here with you. How has your day been so far?
        </div>
      </div>

      <div class="quick-chips">
        <button class="chip" onclick="sendQuickPrompt('I want to share something that happened today.')">🗣️ Share a life incident</button>
        <button class="chip" onclick="sendQuickPrompt('Guide me through a CBT exercise to calm my overthinking.')">🧠 Calm my overthinking (CBT)</button>
        <button class="chip" onclick="sendQuickPrompt('Tell me a wholesome joke to make me smile.')">😄 Tell me a joke</button>
        <button class="chip" onclick="sendQuickPrompt('Suggest a quick physical exercise to relieve stress.')">🏃 Quick stress exercise</button>
      </div>

      <div class="chat-input-area">
        <input type="text" id="user-input" placeholder="Type freely in English, Hindi, or Marathi..." autocomplete="off" />
        <button id="send-btn" class="primary-btn">Send ➤</button>
      </div>
    </section>

    <aside id="calm-zone" class="toolkit-column">
      <div class="tool-card">
        <h3>🧘 4-7-8 Breathing Meditation</h3>
        <p class="small-text">Follow the expanding circle to slow your heart rate and relax your nervous system.</p>
        <div class="breathing-container">
          <div id="breathing-circle" class="breathing-circle">Tap Start</div>
        </div>
        <button id="breathe-btn" class="secondary-btn full-width">Start Breathing Exercise</button>
      </div>

      <div class="tool-card">
        <h3>🎮 5-4-3-2-1 Grounding Mini-Game</h3>
        <p class="small-text">Pull your mind out of anxiety and back into the present moment:</p>
        <div id="grounding-game-box" class="game-box">
          <p id="grounding-prompt"><strong>Step 1 of 5:</strong> Look around you and name <strong>5 things you can SEE</strong> right now.</p>
          <input type="text" id="grounding-input" placeholder="e.g., My notebook, window, water bottle..." />
          <button id="grounding-next-btn" class="primary-btn full-width">Next Step ➔</button>
        </div>
      </div>

      <div class="tool-card">
        <h3>✨ Instant Mood & Body Relief</h3>
        <div class="booster-buttons">
          <button id="joke-btn" class="outline-btn">😄 Wholesome Joke</button>
          <button id="stretch-btn" class="outline-btn">🙆 1-Min Desk Exercise</button>
        </div>
        <div id="booster-output" class="booster-box">
          Click a button above whenever you need a quick smile or physical tension release!
        </div>
      </div>
    </aside>
  </main>

  <section id="specialist-directory" class="directory-section">
    <div class="directory-header">
      <h2>🩺 Connect with Qualified Mental Health Professionals</h2>
      <p>
        When you are facing deeper emotional challenges, human care is essential. Psychologists use talk therapy (such as CBT, DBT, Interpersonal, and Humanistic therapy) to help you work through roadblocks.
        <em>Note: Clinical and counseling psychologists hold doctoral degrees (PhD/PsyD) rather than medical degrees (MD/DO) and generally work alongside psychiatrists if medication is needed.</em>
      </p>
    </div>

    <div class="doctor-grid">
      <div class="doctor-card">
        <span class="badge clinical">Clinical Psychologist (PhD)</span>
        <h3>Dr. Ananya Deshmukh</h3>
        <p class="specialty"><strong>Focus:</strong> Severe Depression, Anxiety Disorders, Trauma & PTSD (CBT & DBT)</p>
        <p class="why-see"><strong>Role:</strong> Specializes in psychopathology and comprehensive care for more serious mental health conditions.</p>
        <p class="lang">🗣️ Speaks: Marathi, Hindi, English | 📍 Pune & Online</p>
        <button class="primary-btn full-width" onclick="bookSpecialist('Dr. Ananya Deshmukh (Clinical Psychologist)')">Request Human Consultation</button>
      </div>

      <div class="doctor-card">
        <span class="badge counseling">Counseling Psychologist (PsyD)</span>
        <h3>Dr. Rohan Kulkarni</h3>
        <p class="specialty"><strong>Focus:</strong> Academic & Career Stress, Relationship Issues, Self-Confidence & Grief</p>
        <p class="why-see"><strong>Role:</strong> Helps individuals address everyday emotional, social, and physical stressors in life.</p>
        <p class="lang">🗣️ Speaks: English, Hindi, Marathi | 📍 Pune & Online</p>
        <button class="primary-btn full-width" onclick="bookSpecialist('Dr. Rohan Kulkarni (Counseling Psychologist)')">Request Human Consultation</button>
      </div>

      <div class="doctor-card">
        <span class="badge counselor">Licensed Counselor (M.A. Psychology)</span>
        <h3>Ms. Priya Sharma</h3>
        <p class="specialty"><strong>Focus:</strong> Student Adjustment, Sleep Difficulties, Unhealthy Habits & Talk Therapy</p>
        <p class="why-see"><strong>Role:</strong> Master's-level therapist using humanistic and interpersonal talk therapy for supportive care.</p>
        <p class="lang">🗣️ Speaks: Hindi, English | 📍 Online Video Session</p>
        <button class="primary-btn full-width" onclick="bookSpecialist('Ms. Priya Sharma (Licensed Counselor)')">Request Human Consultation</button>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>🌿 <strong>StillMind</strong> — VIT Pune EDI Project | Encrypted Pre-Consultation Emotional Support Platform</p>
    <p>24/7 National Tele-MANAS Helpline: <strong>14416</strong> | Emergency: <strong>112</strong></p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
=======
// ================= 1. GLOBAL STATE =================
let userNickname = "Friend";
const sessionId = "session_" + Math.random().toString(36).substring(2, 10);
let breathingInterval = null;
let isBreathing = false;

// ================= 2. INFORMED CONSENT MODAL =================
const consentModal = document.getElementById("consent-modal");
const consentCheckbox = document.getElementById("consent-checkbox");
const acceptConsentBtn = document.getElementById("accept-consent-btn");
const nicknameInput = document.getElementById("nickname-input");
const welcomeUserText = document.getElementById("welcome-user-text");

acceptConsentBtn.addEventListener("click", () => {
  if (!consentCheckbox.checked) {
    alert("Please tick the consent checkbox to continue to StillMind.");
    return;
  }
  const enteredName = nicknameInput.value.trim();
  if (enteredName) {
    userNickname = enteredName;
  }
  welcomeUserText.textContent = `Welcome, ${userNickname}. Listening with patience, warmth, and zero judgement.`;
  consentModal.classList.add("hidden");
});

// ================= 3. DARK / LIGHT THEME TOGGLE =================
const themeToggleBtn = document.getElementById("theme-toggle");
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ================= 4. STRESS SLIDER UPDATE =================
const stressSlider = document.getElementById("stress-slider");
const stressValue = document.getElementById("stress-value");

function updateStressDisplay(value) {
  const nextValue = Math.min(10, Math.max(1, Number(value) || 5));
  stressSlider.value = String(nextValue);
  stressValue.textContent = String(nextValue);
}

stressSlider.addEventListener("input", () => {
  stressValue.textContent = stressSlider.value;
});

// ================= 5. SENDING MESSAGES TO THE PYTHON BACKEND =================
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const languageSelect = document.getElementById("language-select");
const moodSelect = document.getElementById("mood-select");
const emergencyBanner = document.getElementById("emergency-banner");

function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

async function sendMessage() {
  const messageText = userInput.value.trim();
  if (!messageText) return;

  // Show user's message on screen
  appendMessage(messageText, "user");
  userInput.value = "";

  // Show temporary typing message
  const loadingMsg = appendMessage("StillMind is listening and thinking...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        nickname: userNickname,
        message: messageText,
        language: languageSelect.value,
        mood: moodSelect.value,
        stress_level: stressSlider.value
      })
    });

    const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Server error: " + response.status);
}

loadingMsg.textContent = data.reply || "Please try again.";

    if (typeof data.stress_level !== "undefined") {
      updateStressDisplay(data.stress_level);
    }

    // If backend detects severe depression or crisis, show the Emergency & Real Psychologist Banner
    if (data.is_emergency) {
      emergencyBanner.classList.remove("hidden");
      emergencyBanner.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("StillMind Error:", error);
loadingMsg.textContent = "⚠️ " + error.message;
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendQuickPrompt(promptText) {
  userInput.value = promptText;
  sendMessage();
}

// ================= 6. 4-7-8 GUIDED BREATHING MEDITATION =================
const breatheBtn = document.getElementById("breathe-btn");
const breathingCircle = document.getElementById("breathing-circle");

breatheBtn.addEventListener("click", () => {
  if (isBreathing) {
    clearInterval(breathingInterval);
    isBreathing = false;
    breathingCircle.className = "breathing-circle";
    breathingCircle.textContent = "Tap Start";
    breatheBtn.textContent = "Start Breathing Exercise";
    return;
  }

  isBreathing = true;
  breatheBtn.textContent = "Stop Breathing Exercise";

  function runBreathingCycle() {
    if (!isBreathing) return;
    breathingCircle.textContent = "Inhale... (4s)";
    breathingCircle.className = "breathing-circle inhale";

    setTimeout(() => {
      if (!isBreathing) return;
      breathingCircle.textContent = "Hold... (4s)";
    }, 4000);

    setTimeout(() => {
      if (!isBreathing) return;
      breathingCircle.textContent = "Exhale Slowly... (4s)";
      breathingCircle.className = "breathing-circle exhale";
    }, 8000);
  }

  runBreathingCycle();
  breathingInterval = setInterval(runBreathingCycle, 12000);
});

// ================= 7. 5-4-3-2-1 GROUNDING MINI-GAME =================
const groundingSteps = [
  "Step 1 of 5: Look around and type 5 things you can SEE right now.",
  "Step 2 of 5: Type 4 things you can physically FEEL or TOUCH right now.",
  "Step 3 of 5: Listen quietly and type 3 things you can HEAR.",
  "Step 4 of 5: Type 2 things you can SMELL (or love the smell of).",
  "Step 5 of 5: Type 1 good quality you appreciate about YOURSELF."
];
let currentGroundingStep = 0;

const groundingPrompt = document.getElementById("grounding-prompt");
const groundingInput = document.getElementById("grounding-input");
const groundingNextBtn = document.getElementById("grounding-next-btn");

groundingNextBtn.addEventListener("click", () => {
  if (!groundingInput.value.trim()) {
    alert("Take a gentle moment to type your answer before moving to the next step!");
    return;
  }
  currentGroundingStep++;
  groundingInput.value = "";

  if (currentGroundingStep < groundingSteps.length) {
    groundingPrompt.innerHTML = `<strong>${groundingSteps[currentGroundingStep]}</strong>`;
  } else {
    groundingPrompt.innerHTML = "🌟 <strong>Wonderful job!</strong> You completed the 5-4-3-2-1 Grounding Game. Notice how much calmer your mind feels right now.";
    groundingNextBtn.textContent = "Restart Game";
    currentGroundingStep = -1;
  }
});

// ================= 8. INSTANT MOOD BOOSTER (JOKES & EXERCISES) =================
const jokesList = [
  "Why did the computer go to the therapist? Because it had too many open tabs in its brain! 💻😄",
  "Why don't scientists trust atoms? Because they make up everything—just like our overthinking at 2 AM! 🌟",
  "What did one stressed textbook say to the other? 'Don't worry, we've got all the answers inside us!' 📚😊",
  "Why did the student eat his homework? Because the teacher told him it was a piece of cake! 🍰😄"
];

const stretchesList = [
  "🙆 Neck & Shoulder Release: Drop your shoulders away from your ears. Slowly tilt your right ear toward your right shoulder and hold for 10 seconds. Switch sides.",
  "👐 Wrist & Finger Reset: Extend both arms forward, gently pull your fingers back with your other hand for 10 seconds, then shake your hands out.",
  "🚶 2-Minute Walk & Sip: Stand up right now, walk to get a glass of water, and look out a window at something far away for 30 seconds."
];

const boosterOutput = document.getElementById("booster-output");
document.getElementById("joke-btn").addEventListener("click", () => {
  const randomJoke = jokesList[Math.floor(Math.random() * jokesList.length)];
  boosterOutput.textContent = randomJoke;
});

document.getElementById("stretch-btn").addEventListener("click", () => {
  const randomStretch = stretchesList[Math.floor(Math.random() * stretchesList.length)];
  boosterOutput.textContent = randomStretch;
});

// ================= 9. PRE-CONSULTATION NOTE & DOCTOR HANDOVER =================
document.getElementById("download-summary-btn").addEventListener("click", async () => {
  const summaryText = `STILLMIND PRE-CONSULTATION HANDOVER NOTE\n=========================================\nPatient Nickname: ${userNickname}\nPreferred Language: ${languageSelect.value}\nReported Condition/Mood: ${moodSelect.value}\nSelf-Reported Stress Level: ${stressSlider.value}/10\n\nNote for Psychologist/Counselor:\nThis user interacted with StillMind for pre-consultation emotional support and reflection. Please review their current stressors with empathy and care.`;
  const blob = new Blob([summaryText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${userNickname}_StillMind_PreConsultation_Note.txt`;
  link.click();
});

function bookSpecialist(doctorName) {
  appendMessage(
    `🩺 Handover Request Prepared for ${doctorName}.\nTip: Click the "📄 Pre-Consultation Note" button at the top of the chat to download your summary note so you can share it directly with ${doctorName} without repeating your story from scratch.`,
    "bot"
  );
  window.scrollTo({ top: 150, behavior: "smooth" });
}
>>>>>>> 042d233 (Updated project files)
