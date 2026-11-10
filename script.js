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
    const response = await fetch("http://127.0.0.1:5000/api/chat", {
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
    loadingMsg.textContent = data.reply;

    if (typeof data.stress_level !== "undefined") {
      updateStressDisplay(data.stress_level);
    }

    // If backend detects severe depression or crisis, show the Emergency & Real Psychologist Banner
    if (data.is_emergency) {
      emergencyBanner.classList.remove("hidden");
      emergencyBanner.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    loadingMsg.textContent =
      "⚠️ Your Python Backend (app.py) is not running yet! Open your VS Code terminal and type: python app.py — then open http://127.0.0.1:5000 in your browser.";
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