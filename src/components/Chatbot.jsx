import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { getPurchased, getProgress } from '../utils/storage';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcSparkles  = ({ s = 22 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>;
const IcArrow     = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"/></svg>;
const IcMic       = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>;
const IcSend      = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>;
const IcSound     = ({ on }) => on
  ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
  : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>;

// ─── Text renderer — supports **bold** and newlines ───────────────────────────
function RichText({ text }) {
  return (
    <div style={{ lineHeight: 1.55 }}>
      {text.split('\n').map((line, i) => (
        <div key={i} style={{ marginBottom: line === '' ? 6 : 0 }}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
            chunk.startsWith('**') && chunk.endsWith('**')
              ? <strong key={j}>{chunk.slice(2, -2)}</strong>
              : chunk
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Smart reply engine ───────────────────────────────────────────────────────
function getReply(input, { name, courses, purchased, progressMap }) {
  const m = input.toLowerCase().trim();
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // Greet
  if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|sup|yo)\b/.test(m))
    return {
      text: `Hey ${name}! 👋 So great to see you back. I'm ARIA, your personal learning mentor here at ReachOut.\n\nWhat would you like to explore today?`,
      chips: ['Recommend a course', 'My progress', 'What can you do?'],
    };

  // How are you
  if (/how are you|how do you do/.test(m))
    return {
      text: `I'm doing amazing — always energised when a learner shows up! 😄\n\nI'm here to help you find the right courses, understand tricky concepts, track your progress, and keep you motivated. What's on your mind?`,
      chips: ['Show me courses', 'Check my progress', 'Give me a learning tip'],
    };

  // What can you do
  if (/what can you|what.*help|how.*work|capabilities/.test(m))
    return {
      text: `Great question! Here's what I can do for you:\n\n🔍 **Discover courses** tailored to your goals\n📊 **Track & explain** your learning progress\n🧠 **Explain concepts** from any course\n💡 **Give personalised** learning tips & strategies\n🎯 **Quiz you** to check your understanding\n💬 **Answer** any app or course question\n🎙 **Listen** — just tap the mic and talk to me!\n\nWhat would you like to start with?`,
      chips: ['Recommend a course', 'Explain a concept', 'Learning tips'],
    };

  // Recommendations
  if (/recommend|suggest|what.*should.*learn|best course|where.*start|getting started/.test(m)) {
    if (purchased.length === 0) {
      const top = courses.find(c => c.featured) || courses[0];
      return {
        text: `Since you're just starting out, I'd love to point you in the right direction! 🎯\n\nA fantastic first course is **${top?.title}** — it has a stellar ⭐${top?.rating} rating and ${top?.enrolled?.toLocaleString()} learners love it.\n\nOr tell me what excites you most and I'll match you with the perfect course!`,
        chips: ['Technology', 'Business', 'Design', `Tell me about ${top?.title}`],
      };
    }
    const next = courses.find(c => !purchased.find(p => p.id === c.id));
    return {
      text: `You're already on your learning journey — I love the dedication, ${name}! 🚀\n\nBased on what you're studying, **${next?.title}** would be a brilliant next step. It'll really complement your current skills.\n\nWant to know more about it?`,
      chips: [`Tell me about ${next?.title}`, 'Show all courses', "What am I enrolled in?"],
    };
  }

  // Category searches
  if (/\b(tech|programming|coding|python|react|javascript|software)\b/.test(m)) {
    const cat = courses.filter(c => c.category === 'Technology');
    return {
      text: `Tech is one of the most in-demand skill areas right now! 💻\n\nWe have **${cat.length} Technology courses:**\n\n${cat.map(c => `• **${c.title}** — ${c.price === 0 ? 'Free' : '₹' + c.price.toLocaleString()}`).join('\n')}\n\nWhich one catches your eye?`,
      chips: cat.slice(0, 2).map(c => `Tell me about ${c.title}`),
    };
  }
  if (/\b(design|ui|ux|figma|visual|prototype)\b/.test(m)) {
    const cat = courses.filter(c => c.category === 'Design');
    return {
      text: `Design is where creativity meets problem-solving! 🎨\n\nOur Design courses:\n\n${cat.map(c => `• **${c.title}** — ${c.price === 0 ? 'Free' : '₹' + c.price.toLocaleString()}`).join('\n')}`,
      chips: cat.slice(0, 2).map(c => `Tell me about ${c.title}`),
    };
  }
  if (/\b(business|finance|financial|model|excel|invest)\b/.test(m)) {
    const cat = courses.filter(c => c.category === 'Business');
    return {
      text: `Business skills open so many doors! 📊\n\nOur Business courses:\n\n${cat.map(c => `• **${c.title}** — ${c.price === 0 ? 'Free' : '₹' + c.price.toLocaleString()}`).join('\n')}`,
      chips: cat.slice(0, 2).map(c => `Tell me about ${c.title}`),
    };
  }
  if (/\b(leadership|manage|team|lead|communication)\b/.test(m)) {
    const cat = courses.filter(c => c.category === 'Leadership');
    return {
      text: `Great leaders are made, not born — and learning is the foundation! 👑\n\nOur Leadership courses:\n\n${cat.map(c => `• **${c.title}** — ${c.price === 0 ? 'Free' : '₹' + c.price.toLocaleString()}`).join('\n')}`,
      chips: cat.slice(0, 2).map(c => `Tell me about ${c.title}`),
    };
  }
  if (/\b(marketing|seo|social media|ads|digital|campaign)\b/.test(m)) {
    const cat = courses.filter(c => c.category === 'Marketing');
    return {
      text: `Marketing is the art of connecting ideas to people! 📣\n\nOur Marketing courses:\n\n${cat.map(c => `• **${c.title}** — ${c.price === 0 ? 'Free' : '₹' + c.price.toLocaleString()}`).join('\n')}`,
      chips: cat.slice(0, 2).map(c => `Tell me about ${c.title}`),
    };
  }

  // Specific course match
  const hit = courses.find(c =>
    c.title.toLowerCase().split(' ').some(w => w.length > 3 && m.includes(w.toLowerCase()))
  );
  if (hit) {
    const enrolled = purchased.find(p => p.id === hit.id);
    const pct = progressMap[hit.notionId || hit.id]?.percentComplete ?? 0;
    const disc = hit.originalPrice ? Math.round((1 - hit.price / hit.originalPrice) * 100) : 0;
    return {
      text: `Here's everything about **${hit.title}**! ✨\n\n📚 **${hit.lessons} lessons** · ⏱ **${hit.duration}** · ⭐ **${hit.rating}/5** · 👥 **${hit.enrolled?.toLocaleString()} learners**\n\n${hit.description}\n\n💰 **Price:** ${hit.price === 0 ? 'Completely Free! 🎉' : `₹${hit.price.toLocaleString()}${disc > 0 ? ` (${disc}% off original price)` : ''}`}\n\n${enrolled ? `🎓 You're enrolled! You've completed **${pct}%** of this course.` : 'Ready to join thousands of learners?'}`,
      chips: enrolled
        ? ['How do I earn a certificate?', 'Continue learning', 'Show me more courses']
        : ['How do I enrol?', 'What will I learn?', 'Are there free courses?'],
    };
  }

  // Progress
  if (/\b(progress|my learning|enrolled|my course|studying)\b/.test(m)) {
    if (purchased.length === 0)
      return {
        text: `You haven't enrolled in any courses yet, ${name} — but that's easy to fix! 😊\n\nExplore our catalog and find something that excites you. Your learning journey is just one tap away.`,
        chips: ['Show me courses', "What's popular?", 'Free courses'],
      };
    const lines = purchased.map(c => {
      const pct = progressMap[c.notionId || c.id]?.percentComplete ?? 0;
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      return `• **${c.title}**\n  ${bar} ${pct}%`;
    });
    return {
      text: `Here's your learning snapshot, ${name}! 📊\n\n${lines.join('\n\n')}\n\n${purchased.length > 0 ? '🔥 Keep up the momentum — consistency beats intensity every time!' : ''}`,
      chips: ['How do I earn a certificate?', 'Learning tips', 'Explore more courses'],
    };
  }

  // Quiz
  if (/\b(quiz|test|exam|assessment|attempt)\b/.test(m))
    return {
      text: `Quizzes are the best way to lock in what you've learned! 🧠\n\n**How it works:**\n• Each course ends with a final quiz\n• Score **70% or above** to pass\n• Passing unlocks your **completion certificate** 🏆\n• Failed? No problem — you can retake it!\n\n**Pro tip:** Before the quiz, skim the lesson titles and key bullet points. That 10-minute review can make a huge difference!`,
      chips: ['How do I get my certificate?', 'I failed the quiz — help!', 'Show my courses'],
    };

  // Failed quiz
  if (/fail|failed|didn.t pass|not passing|wrong answers/.test(m))
    return {
      text: `Don't worry — failing a quiz is part of learning, not the end of it! 💪\n\n**Here's what to do:**\n1. Revisit the lessons where you felt uncertain\n2. Write down the concepts you found hard\n3. Ask me to explain any topic — that's what I'm here for!\n4. Take a short break before retrying\n\nThe brain consolidates learning during rest. Come back fresh and you'll do much better. What topic do you want me to help explain?`,
      chips: ['Explain a concept', 'Learning strategies', 'Show my courses'],
    };

  // Certificate
  if (/\b(certificate|certif|badge|completion)\b/.test(m))
    return {
      text: `Certificates on ReachOut are genuinely earned — that's what makes them valuable! 🏆\n\n**Your path to certification:**\n1️⃣ Enrol in any paid or free course\n2️⃣ Complete all lessons\n3️⃣ Score **≥70%** on the final quiz\n4️⃣ Your certificate appears in your Profile! ✅\n\nIt's a great way to showcase your skills to employers or on LinkedIn. Which course are you going for?`,
      chips: ['How do I take a quiz?', 'Show my enrolled courses', 'Browse courses'],
    };

  // Pricing
  if (/\b(price|cost|fee|discount|promo|cheap|free course|afford)\b/.test(m)) {
    const free = courses.filter(c => c.price === 0);
    return {
      text: `Here's the full pricing picture! 💰\n\n🆓 **Free courses (${free.length}):** ${free.map(c => c.title).join(', ')}\n\n💳 **Paid courses:** ₹849 – ₹2,199\n\n🎟 **Promo code: REACH20** — 20% off at checkout!\n\n💡 **Tip:** When buying, choose **CC Avenue** for potentially lower prices on some courses vs in-app purchase.`,
      chips: ['Show free courses', 'Tell me about CC Avenue', 'Apply REACH20'],
    };
  }

  // Payment methods
  if (/\b(payment|ccavenue|cc avenue|in.?app|google play|upi|netbanking)\b/.test(m))
    return {
      text: `ReachOut offers two ways to pay for courses! 💳\n\n📱 **In-App Purchase**\nBilled via Google Play / App Store. Super convenient, but includes an 18% platform convenience fee.\n\n💳 **CC Avenue**\nPay via Credit/Debit Card, UPI, or NetBanking. Usually a better deal — lower price, no extra fees!\n\nWhen you tap **Buy Now** on any course, both options appear side-by-side so you can choose. Which would work better for you?`,
      chips: ['How do I buy a course?', 'What is the promo code?', 'Show courses'],
    };

  // Concept — Python
  if (/what is python|python.*beginner|learn python|why python/.test(m))
    return {
      text: `Python is hands-down one of the best first languages to learn! 🐍\n\n**Why Python rocks:**\n• Reads almost like plain English\n• Used in Data Science, AI, Web Dev, Automation & more\n• Huge community — help is always available\n• Top-requested skill by employers\n\nFun fact: NASA, Instagram, and Spotify all use Python!\n\nOur **Python for Data Science** course is perfect for beginners. No prior coding experience needed at all!`,
      chips: ['Tell me about Python for Data Science', 'How long will it take?', 'Is it hard?'],
    };

  // Concept — Data Science
  if (/\b(data science|machine learning|ml|ai|artificial intelligence|pandas|numpy|scikit)\b/.test(m))
    return {
      text: `Data Science is one of the most exciting — and in-demand — fields of this decade! 📊\n\n**The core toolkit:**\n• **Python** — for coding and logic\n• **Pandas & NumPy** — for data wrangling\n• **Matplotlib / Seaborn** — for visualisation\n• **Scikit-learn** — for machine learning\n\nOur **Python for Data Science** course covers all of this through real projects, not just theory. It's the most practical way to get started!`,
      chips: ['Tell me about Python for Data Science', 'What jobs can I get?', 'How long does it take?'],
    };

  // Concept — UX
  if (/\b(ux|user experience|user research|wireframe|prototype|usability)\b/.test(m))
    return {
      text: `UX Design is fundamentally about empathy — understanding people and designing for them! 🎨\n\n**Core UX skills you'll build:**\n• **User Research** — understanding what people actually need\n• **Wireframing** — sketching the structure before the visuals\n• **Figma** — the industry-standard design tool\n• **Usability Testing** — validating your designs with real users\n\nOur **UI/UX Design Masterclass** is completely **free** and covers Figma end-to-end. It's one of our most loved courses!`,
      chips: ['Tell me about UI/UX Masterclass', 'Is Figma free to use?', 'What jobs need UX?'],
    };

  // Concept — Finance
  if (/\b(dcf|lbo|valuation|financial model|balance sheet|cash flow|excel finance)\b/.test(m))
    return {
      text: `Financial modeling is a superpower in the business world! 📈\n\n**What financial modelers do:**\n• Build Excel models to forecast a company's performance\n• Run **DCF** (Discounted Cash Flow) valuations\n• Build **LBO** (Leveraged Buyout) models\n• Support M&A, investment, and strategic decisions\n\nIt's a must-have skill for investment bankers, consultants, and finance analysts. Our **Financial Modeling Fundamentals** course takes you from zero to job-ready!`,
      chips: ['Tell me about Financial Modeling', 'Do I need Excel skills first?', 'What salary can I expect?'],
    };

  // Struggling / stuck
  if (/\b(stuck|struggle|difficult|hard|frustrated|give up|don.t understand|confused)\b/.test(m))
    return {
      text: `${name}, that feeling of being stuck? That's your brain literally building new neural pathways. It's the most important part of learning. 💪\n\n**When you're stuck, try this:**\n1. Take a genuine **10-minute break** (no phone!)\n2. **Re-watch** just the specific lesson that's unclear\n3. Write down your question in one sentence\n4. **Ask me** — I'll explain it a different way!\n\n*"Every expert was once a beginner."* You've got this.\n\nWhat specific topic is giving you trouble?`,
      chips: ['Explain a concept', 'How to stay motivated', 'Show easier courses'],
    };

  // Motivation / tips
  if (/\b(motivat|learning tip|how to learn|study tip|advice|habit|focus)\b/.test(m)) {
    const tips = [
      `Here are my top learning secrets, ${name}! 🧠\n\n⏱ **25-minute sprints** — Focus hard for 25 min, then take a 5-min break (Pomodoro method)\n🔁 **Spaced repetition** — Review after 1 day, 3 days, 1 week\n📝 **Write, don't highlight** — Summarise in your own words\n🎯 **One goal at a time** — "Build a data dashboard by month-end" beats "learn Python"\n🗣 **Teach someone** — Explaining it to others cements it in your memory`,
      `Learning science is fascinating! Here's what the research says works best: 📚\n\n🌙 **Sleep is non-negotiable** — Memory consolidates during deep sleep\n🏃 **Exercise before studying** — 20 mins of movement boosts focus significantly\n❓ **Ask questions constantly** — Curiosity is the engine of learning\n✅ **Celebrate small wins** — Finished a lesson? That counts. Be proud!\n🤝 **Find a study buddy** — Accountability doubles your follow-through rate`,
    ];
    return { text: pick(tips), chips: ['How do I track progress?', 'Recommend a course', 'I need help with a topic'] };
  }

  // Thank you
  if (/\b(thank|thanks|awesome|great answer|helpful|love this)\b/.test(m))
    return {
      text: `You're so welcome, ${name}! 🌟 That's exactly what I'm here for.\n\nRemember — every question you ask is a step forward. Don't ever hesitate to come back, day or night. I'm always here for you! 😊`,
      chips: ['Browse courses', 'Check my progress', "That's all for now!"],
    };

  // Bye
  if (/\b(bye|goodbye|see you|that.s all|done for now|cya)\b/.test(m))
    return {
      text: `See you soon, ${name}! 👋 Keep learning, keep growing — every lesson brings you closer to your goals.\n\n✨ *"The expert in anything was once a beginner."*\n\nCome back anytime!`,
      chips: [],
    };

  // Default — graceful fallback
  return {
    text: pick([
      `That's an interesting one, ${name}! I want to give you the best answer — could you tell me a bit more? Are you asking about a **specific course**, a **concept**, or something about **how the app works**?`,
      `Hmm, I want to make sure I help you well! I'm great at course recommendations, explaining concepts, tracking progress, and app questions. Could you rephrase or give me a bit more context?`,
      `Great question! Let me make sure I understand — are you looking for a **course recommendation**, help with a **concept from your course**, or something about **the app**?`,
    ]),
    chips: ['Recommend a course', 'Explain a concept', 'Help with the app'],
  };
}

// ─── Welcome message builder ──────────────────────────────────────────────────
function buildWelcome(name, purchased) {
  if (purchased.length === 0)
    return {
      text: `Hi ${name}! 👋 I'm **ARIA**, your personal learning mentor at ReachOut.\n\nI'm here to help you discover courses, understand concepts, track your growth, and keep you motivated. Think of me as your always-available study buddy!\n\nWhat would you like to explore today?`,
      chips: ['Recommend a course for me', 'Show free courses', "What can you do?"],
    };
  return {
    text: `Welcome back, ${name}! 🎉 Great to see you investing in yourself.\n\nI'm **ARIA**, your learning mentor. You have **${purchased.length} course${purchased.length > 1 ? 's' : ''}** in progress — want a progress check, or shall we explore something new?`,
    chips: ['Check my progress', 'Recommend next course', 'I have a question'],
  };
}

// ─── Voice helpers ────────────────────────────────────────────────────────────
const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const plain = text.replace(/\*\*/g, '').replace(/[🎉🎓📚⭐💡🎯🔍🧠💪✨👋😊📊🏆🐍💻🎨📣💰💳📈🔁⏱🌙🏃❓✅🤝🗣🆓]/gu, '');
  const utt = new SpeechSynthesisUtterance(plain);
  utt.rate = 1.05;
  utt.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /female|samantha|karen|victoria|moira/i.test(v.name));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Chatbot() {
  const { currentUser } = useAuth();
  const { courses } = useCourses();
  const name = currentUser?.name?.split(' ')[0] || 'there';

  const purchased = currentUser ? getPurchased(currentUser.userId) : [];
  const progressMap = purchased.reduce((acc, c) => {
    acc[c.notionId || c.id] = getProgress(currentUser?.userId, c.notionId || c.id);
    return acc;
  }, {});

  const context = useMemo(
    () => ({ name, courses, purchased, progressMap }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, courses, purchased.length]
  );

  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [voiceOn, setVoiceOn]     = useState(false);
  const [recording, setRecording] = useState(false);

  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const srRef    = useRef(null);

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const pushReply = useCallback((reply) => {
    setIsTyping(true);
    const delay = Math.min(600 + reply.text.length * 8, 2200);
    setTimeout(() => {
      setIsTyping(false);
      const msg = { id: Date.now(), ...reply, isBot: true };
      setMessages(p => [...p, msg]);
      if (voiceOn) speak(reply.text);
    }, delay);
  }, [voiceOn]);

  const handleSend = useCallback((text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages(p => [...p, { id: Date.now(), text: msg, isBot: false }]);
    setInput('');
    pushReply(getReply(msg, context));
  }, [input, context, pushReply]);

  // Voice input
  const startRecording = () => {
    if (!SR) { alert('Voice input is not supported in this browser.'); return; }
    const sr = new SR();
    srRef.current = sr;
    sr.lang = 'en-IN';
    sr.interimResults = false;
    sr.onresult = e => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setRecording(false);
      setTimeout(() => handleSendRef.current(transcript), 300);
    };
    sr.onerror = () => setRecording(false);
    sr.onend   = () => setRecording(false);
    sr.start();
    setRecording(true);
  };

  const stopRecording = () => { srRef.current?.stop(); setRecording(false); };

  // Stable ref for handleSend (used in voice callback)
  const handleSendRef = useRef(handleSend);
  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  const handleOpen = () => {
    setIsOpen(true);
    window.speechSynthesis?.cancel();
    setMessages(prev => {
      if (prev.length > 0) return prev;
      const welcome = buildWelcome(name, purchased);
      return [{ id: 0, ...welcome, isBot: true }];
    });
  };
  const handleClose = () => { setIsOpen(false); stopRecording(); window.speechSynthesis?.cancel(); };

  return (
    <>
      {/* FAB trigger */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={handleOpen}
          aria-label="Chat with ARIA, your learning mentor"
          style={{ position: 'absolute', bottom: 82, right: 20, width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(79,70,229,0.5)', zIndex: 100, border: 'none', cursor: 'pointer' }}
        >
          <IcSparkles s={22} />
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--primary)', pointerEvents: 'none' }}
          />
        </motion.button>
      )}

      {/* Full-screen panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot-screen"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{ position: 'absolute', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}
          >
            {/* ── Header ── */}
            <div style={{ background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 60%, #a21caf 100%)', padding: '18px 16px 16px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handleClose} aria-label="Close chat" style={{ color: 'rgba(255,255,255,0.85)', cursor: 'pointer', flexShrink: 0, padding: 4 }}>
                  <IcArrow />
                </button>

                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                    <IcSparkles s={20} />
                  </div>
                  {/* Online dot */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, background: '#22c55e', borderRadius: '50%', border: '2px solid #3730a3' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>ARIA</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Your Learning Mentor · Always here for you</div>
                </div>

                {/* TTS toggle */}
                <button
                  onClick={() => { setVoiceOn(v => !v); window.speechSynthesis?.cancel(); }}
                  aria-label={voiceOn ? 'Mute ARIA voice' : 'Unmute ARIA voice'}
                  aria-pressed={voiceOn}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: voiceOn ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', flexShrink: 0 }}
                >
                  <IcSound on={voiceOn} />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              className="hide-scrollbar"
              style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end', gap: 8 }}>
                  {/* Bot avatar for first visible line */}
                  {msg.isBot && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '88%' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3730a3,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                        <IcSparkles s={14} />
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-primary)' }}>
                        <RichText text={msg.text} />
                      </div>
                    </div>
                  )}

                  {/* User bubble */}
                  {!msg.isBot && (
                    <div style={{ background: 'linear-gradient(135deg,var(--primary),#6d28d9)', padding: '11px 14px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  )}

                  {/* Quick reply chips */}
                  {msg.isBot && msg.chips?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 36 }}>
                      {msg.chips.map((chip, ci) => (
                        <motion.button
                          key={ci}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSend(chip)}
                          style={{ padding: '6px 12px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 20, fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                        >
                          {chip}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div role="status" aria-label="ARIA is typing" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3730a3,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcSparkles s={14} />
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '14px 16px', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(n => (
                      <motion.div
                        key={n}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: n * 0.15 }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* ── Voice recording overlay ── */}
            <AnimatePresence>
              {recording && (
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Voice recording in progress"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(55,48,163,0.92)', backdropFilter: 'blur(12px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Listening…</div>
                  {/* Waveform bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 48 }}>
                    {[0.4, 0.7, 1, 0.85, 0.6, 0.9, 0.5, 0.75, 1, 0.65, 0.45, 0.8].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [h, h * 0.4 + 0.1, h] }}
                        transition={{ repeat: Infinity, duration: 0.5 + i * 0.07, ease: 'easeInOut' }}
                        style={{ width: 4, height: 48 * h, background: 'rgba(255,255,255,0.85)', borderRadius: 4, transformOrigin: 'center' }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Speak clearly — I'm hearing you</div>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={stopRecording}
                    style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 24, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input bar ── */}
            <div style={{ padding: '10px 12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-dark)', borderRadius: 28, border: '1.5px solid var(--border)', padding: '6px 6px 6px 16px' }}>
                <label htmlFor="aria-input" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Message ARIA</label>
                <input
                  id="aria-input"
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask ARIA anything…"
                  aria-label="Message ARIA"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter,sans-serif' }}
                />
                {/* Mic */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={recording ? stopRecording : startRecording}
                  aria-label={recording ? 'Stop voice recording' : 'Start voice input'}
                  aria-pressed={recording}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: recording ? 'var(--error)' : 'transparent', color: recording ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <IcMic />
                </motion.button>
                {/* Send */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  aria-label="Send message"
                  style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'var(--primary)' : 'var(--border)', color: input.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
                >
                  <IcSend />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
