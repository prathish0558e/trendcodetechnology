import { useEffect, useRef, useState } from "react";
import { COMPANY, SERVICES } from "../data/content.js";
import { postLead } from "../api.js";

/*
 * "Codey" — the TCT site bot. A floating robot that greets visitors and
 * walks them through a guided enquiry (service → name → contact → message)
 * and submits it to the same /api/leads pipeline as the quote form.
 *
 * Why "Codey"? Code + Trend**Code** Technology — short, friendly, memorable.
 */

const START_OPTIONS = [
  { id: "services", label: "Explore our services" },
  { id: "quote", label: "Get a free quote" },
  { id: "about", label: "About TCT" },
  { id: "contact", label: "Talk to a human" },
];

const SERVICE_OPTIONS = SERVICES.map((s) => s.title);

export default function TctBot() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("idle"); // idle | menu | service | name | contact | message | done
  const [draft, setDraft] = useState({});
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [nudge, setNudge] = useState("");
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // teaser bubble after 6s (once per page load)
  useEffect(() => {
    const t = setTimeout(() => setTeaser(true), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setTeaser(false);
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
    }
  }, [messages, typing, open]);

  const pushBot = (text, delay = 550) => {
    setTyping(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { from: "bot", text }]);
        resolve();
      }, delay);
    });
  };

  const greet = async () => {
    if (messages.length) return;
    await pushBot(
      `Hi! I'm Codey 🤖 — the Trend Code Technology assistant.`,
      500
    );
    await pushBot("I can help with our services, pricing, careers — or connect you to the team. What brings you here today?", 500);
    setMode("menu");
  };

  const toggle = () => {
    setOpen((o) => {
      if (!o) greet();
      return !o;
    });
  };

  const startEnquiry = async () => {
    setMode("service");
    await pushBot("Great — which service are you interested in?", 500);
  };

  const pickMenu = async (id) => {
    if (id === "services") {
      await pushBot("We build websites, web & mobile apps, custom software, run digital marketing and handle BPO operations.", 500);
      await pushBot("You can explore everything on our Services page — or I can take your enquiry right now.", 500);
      setMode("menu");
    } else if (id === "quote") {
      await startEnquiry();
    } else if (id === "about") {
      await pushBot(
        `Trend Code Technology is a Coimbatore-based IT company (Ganapathy) serving clients since 2019 — 1,200+ projects, 24×7 support, and a 98.4% on-time delivery score.`,
        600
      );
      await pushBot("Want a free quote for your project?", 500);
      setMode("menu");
    } else {
      await pushBot(
        `You can call us at ${COMPANY.phone} (24×7), WhatsApp the same number, or email ${COMPANY.email}. HR replies within a few hours on working days.`,
        600
      );
      await pushBot("Or leave your enquiry with me and the team will call you back.", 500);
      setMode("menu");
    }
  };

  const pickService = async (svc) => {
    setDraft((d) => ({ ...d, service: svc }));
    setMode("name");
    await pushBot(`${svc} — good choice! May I have your name?`, 500);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);

    if (mode === "name") {
      if (text.length < 2) return setNudge("Please enter your name (at least 2 letters).");
      setNudge("");
      setDraft((d) => ({ ...d, name: text }));
      setMode("contact");
      await pushBot(`Nice to meet you, ${text.split(" ")[0]}! What's the best phone or email to reach you?`, 550);
    } else if (mode === "contact") {
      const isPhone = /^[+()\d\s-]{7,16}$/.test(text);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!isPhone && !isEmail) {
        setNudge("Hmm, that doesn't look right — please share a valid phone number or email.");
        return;
      }
      setNudge("");
      setDraft((d) => ({ ...d, contact: text }));
      setMode("message");
      await pushBot("Perfect. Tell me briefly about your project or requirement.", 550);
    } else if (mode === "message") {
      if (text.length < 5) return setNudge("A few more words, please — describe what you need.");
      setNudge("");
      setDraft((d) => ({ ...d, message: text }));
      await submit({ ...draft, message: text }); // pass merged draft — setState above is async
    } else if (mode === "menu") {
      // free text in menu mode → treat as enquiry start
      setDraft({ message: text });
      setMode("name");
      await pushBot("Got it! I'll note that down. May I have your name?", 550);
    } else {
      await pushBot("Pick one of the options below to continue 👇", 500);
      setMode("menu");
    }
  };

  const submit = async (finalDraft) => {
    const d = finalDraft || draft;
    setBusy(true);
    await pushBot("One second — sending this to the team…", 700);
    try {
      // Phone-only chat enquiries stay phone-only; do not fabricate an email.
      const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact || "");
      const fd = {
        name: d.name || "Codey chat visitor",
        email: emailLike ? d.contact : "",
        phone: emailLike ? "" : d.contact,
        service: d.service || "Codey Chat Enquiry",
        message: `[Codey chat] ${d.message || "(from chat)"}`,
      };
      await postLead(fd);
      await pushBot("✅ Done! Your enquiry has reached our team.", 600);
      await pushBot(
        "Someone from TCT will reach out within 24 hours (usually much faster). You can also call 24×7 — anything else I can help with?",
        550
      );
    } catch {
      await pushBot(
        `Sorry — something went wrong on my side. Please WhatsApp us at ${COMPANY.phone} or email ${COMPANY.email} and the team will respond quickly.`,
        600
      );
    }
    setBusy(false);
    setMode("done");
  };

  const options = () => {
    if (mode === "menu")
      return [
        ...START_OPTIONS,
        ...(messages.length && mode === "menu" ? [{ id: "enquire", label: "Leave an enquiry" }] : []),
      ];
    if (mode === "service") return SERVICE_OPTIONS.slice(0, 12).map((s) => ({ id: s, label: s, service: true }));
    return [];
  };

  const onOption = async (opt) => {
    if (opt.service) {
      setMessages((m) => [...m, { from: "user", text: opt.label }]);
      await pickService(opt.label);
    } else {
      setMessages((m) => [...m, { from: "user", text: opt.label }]);
      if (opt.id === "enquire") await startEnquiry();
      else await pickMenu(opt.id);
    }
  };

  const quickReplies = options();

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        className="tctbot-launch"
        onClick={toggle}
        aria-label={open ? "Close Codey chat" : "Chat with Codey, the TCT assistant"}
      >
        <span className={`tctbot-face ${open ? "open" : ""}`}>
          {/* robot face — pure SVG, no image dependency */}
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <g className="tctbot-bot">
              <rect x="9" y="13" width="30" height="24" rx="9" className="tctbot-head" />
              <line x1="24" y1="6" x2="24" y2="12" className="tctbot-ant" />
              <circle cx="24" cy="5" r="2.4" className="tctbot-ant-tip" />
              <circle cx="18" cy="24" r="2.6" className="tctbot-eye" />
              <circle cx="30" cy="24" r="2.6" className="tctbot-eye" />
              <path d="M18.5 30.5q5.5 3.4 11 0" className="tctbot-mouth" />
              <line x1="4" y1="23" x2="9" y2="23" className="tctbot-ear" />
              <line x1="39" y1="23" x2="44" y2="23" className="tctbot-ear" />
            </g>
            <g className="tctbot-close">
              <line x1="17" y1="17" x2="31" y2="31" />
              <line x1="31" y1="17" x2="17" y2="31" />
            </g>
          </svg>
        </span>
        <span className="tctbot-launch-ring" aria-hidden="true"></span>
      </button>

      {teaser && !open && (
        <div className="tctbot-teaser" onClick={toggle} role="button" tabIndex={0}>
          <strong>Codey here 🤖</strong>
          <span>Need a quote or info? Ask me!</span>
        </div>
      )}

      {open && (
        <div className="tctbot-panel" role="dialog" aria-label="Codey — TCT assistant">
          <div className="tctbot-head">
            <div className="tctbot-head-avatar">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="9" y="13" width="30" height="24" rx="9" className="tctbot-head" />
                <circle cx="18" cy="24" r="2.6" className="tctbot-eye" />
                <circle cx="30" cy="24" r="2.6" className="tctbot-eye" />
                <path d="M18.5 30.5q5.5 3.4 11 0" className="tctbot-mouth" />
              </svg>
            </div>
            <div>
              <strong>Codey</strong>
              <small>TCT Assistant · online</small>
            </div>
            <span className="tctbot-status" aria-hidden="true"></span>
          </div>

          <div className="tctbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`tctbot-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="tctbot-msg bot tctbot-typing" aria-label="Codey is typing">
                <i></i><i></i><i></i>
              </div>
            )}
            {nudge && <div className="tctbot-nudge">{nudge}</div>}
          </div>

          {quickReplies.length > 0 && !busy && (
            <div className="tctbot-quick">
              {quickReplies.map((o) => (
                <button key={o.id} type="button" onClick={() => onOption(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}

          <div className="tctbot-input">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                mode === "name"
                  ? "Type your name…"
                  : mode === "contact"
                  ? "Phone or email…"
                  : mode === "message"
                  ? "Describe your requirement…"
                  : "Type a message…"
              }
              value={input}
              disabled={busy || mode === "done"}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={busy || !input.trim()}
              aria-label="Send"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </div>

          <small className="tctbot-foot">
            Codey replies instantly · human team responds within 24 hrs
          </small>
        </div>
      )}
    </>
  );
}
