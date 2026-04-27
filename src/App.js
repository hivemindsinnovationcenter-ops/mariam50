import { useState, useEffect, useCallback } from "react";

// ============================================================
//  ⚙️  CONFIGURATION — update these before deploying
// ============================================================
const SUPABASE_URL   = "https://inprrcgcabxedtotmviy.supabase.co";
const SUPABASE_ANON  = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
const MONZO_LINK     = "https://monzo.me/oluwafunmibijohnaloba?h=fOv5jA&account_type=personal";
// ============================================================

// ─── Supabase helpers ───────────────────────────────────────
const hdr = (tok) => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON,
  ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
});

async function dbInsert(payload) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
    method: "POST",
    headers: { ...hdr(), Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbFetch(tok) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/guests?select=*&order=created_at.desc`,
    { headers: hdr(tok) }
  );
  if (!r.ok) throw new Error("Unauthorized");
  return r.json();
}

async function authLogin(email, pw) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
    body: JSON.stringify({ email, password: pw }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || "Login failed");
  return d;
}

// ─── Shared tokens ──────────────────────────────────────────
const NAVY   = "#0C1929";
const GOLD   = "#BF9645";
const GOLD2  = "#D4AF5A";
const CREAM  = "#FDFBF5";
const CREAM2 = "#F4EFE2";
const MUTED  = "#8A8070";

// ─── Inject global styles + Google Fonts ────────────────────
const injectStyles = () => {
  if (document.getElementById("m50-styles")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);

  const s = document.createElement("style");
  s.id = "m50-styles";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { min-height: 100vh; }
    body { background: ${CREAM}; font-family: 'Jost', sans-serif; color: ${NAVY}; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
    .fade-up  { animation: fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
    .fade-in  { animation: fadeIn .4s ease both; }
    .stagger-1 { animation-delay: .05s; }
    .stagger-2 { animation-delay: .12s; }
    .stagger-3 { animation-delay: .20s; }
    .stagger-4 { animation-delay: .28s; }
    .stagger-5 { animation-delay: .36s; }
    .stagger-6 { animation-delay: .44s; }
    input, select { font-family: 'Jost', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${CREAM2}; }
    ::-webkit-scrollbar-thumb { background: ${GOLD}; border-radius: 2px; }
  `;
  document.head.appendChild(s);
};

// ─── Decorative ornament ────────────────────────────────────
const Ornament = ({ size = 32, color = GOLD }) => (
  <svg width={size} height={size / 2} viewBox="0 0 64 20" fill="none">
    <line x1="0" y1="10" x2="24" y2="10" stroke={color} strokeWidth="0.8" />
    <circle cx="32" cy="10" r="4" stroke={color} strokeWidth="0.8" fill="none" />
    <circle cx="32" cy="10" r="1.5" fill={color} />
    <line x1="40" y1="10" x2="64" y2="10" stroke={color} strokeWidth="0.8" />
  </svg>
);

const Divider = ({ my = 24 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: `${my}px 0` }}>
    <div style={{ flex: 1, height: "0.5px", background: `${GOLD}55` }} />
    <Ornament size={40} color={`${GOLD}99`} />
    <div style={{ flex: 1, height: "0.5px", background: `${GOLD}55` }} />
  </div>
);

// ─── Layout wrapper ─────────────────────────────────────────
const Page = ({ children, center = false }) => (
  <div style={{
    minHeight: "100vh",
    background: CREAM,
    backgroundImage: `
      radial-gradient(ellipse 80% 60% at 50% -10%, ${GOLD}12 0%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 80% 110%, ${NAVY}08 0%, transparent 60%)
    `,
    display: "flex",
    flexDirection: "column",
    ...(center ? { alignItems: "center", justifyContent: "center" } : {}),
  }}>
    {children}
  </div>
);

// ─── Card ────────────────────────────────────────────────────
const Card = ({ children, style = {}, className = "" }) => (
  <div
    className={className}
    style={{
      background: "#fff",
      border: `0.5px solid ${GOLD}55`,
      borderRadius: 16,
      padding: "40px 44px",
      width: "100%",
      maxWidth: 520,
      boxShadow: `0 4px 40px ${NAVY}08, 0 0 0 1px ${GOLD}18`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Button variants ─────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", disabled, style = {}, full }) => {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "14px 32px",
    borderRadius: 4,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all .3s ease",
    display: "inline-block",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.55 : 1,
    ...style,
  };
  const styles = {
    primary: {
      background: hov ? GOLD2 : GOLD,
      color: "#fff",
      boxShadow: hov ? `0 6px 24px ${GOLD}55` : `0 2px 12px ${GOLD}30`,
      transform: hov ? "translateY(-1px)" : "none",
    },
    outline: {
      background: "transparent",
      color: NAVY,
      border: `0.5px solid ${NAVY}66`,
      boxShadow: "none",
      transform: hov && !disabled ? "translateY(-1px)" : "none",
    },
    ghost: {
      background: hov ? CREAM2 : "transparent",
      color: MUTED,
      border: `0.5px solid ${MUTED}44`,
      boxShadow: "none",
    },
    navy: {
      background: hov ? "#1a3050" : NAVY,
      color: "#fff",
      boxShadow: hov ? `0 6px 24px ${NAVY}44` : `0 2px 12px ${NAVY}22`,
      transform: hov ? "translateY(-1px)" : "none",
    },
    danger: {
      background: hov ? "#c0392b" : "#e74c3c",
      color: "#fff",
      boxShadow: "none",
    },
  };
  return (
    <button
      style={{ ...base, ...styles[variant] }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

// ─── Choice Card ─────────────────────────────────────────────
const ChoiceCard = ({ label, sublabel, icon, selected, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "20px 24px",
        border: `${selected ? "1.5px" : "0.5px"} solid ${selected ? GOLD : hov ? `${GOLD}88` : `${NAVY}22`}`,
        borderRadius: 12,
        cursor: "pointer",
        background: selected ? `${GOLD}0e` : hov ? `${GOLD}05` : "#fff",
        transition: "all .25s ease",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `1.5px solid ${selected ? GOLD : `${NAVY}33`}`,
        background: selected ? GOLD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
      </div>
    </div>
  );
};

// ─── Input ───────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
      {label} {required && <span style={{ color: GOLD }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "13px 16px",
        border: `0.5px solid ${NAVY}33`,
        borderRadius: 8, fontSize: 14,
        background: "#fff", color: NAVY,
        outline: "none", fontFamily: "'Jost', sans-serif",
        transition: "border-color .2s",
      }}
      onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}15`; }}
      onBlur={e => { e.target.style.borderColor = `${NAVY}33`; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

// ─── Progress dots ───────────────────────────────────────────
const Progress = ({ step, total }) => (
  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i === step ? 20 : 6, height: 6,
        borderRadius: 3,
        background: i <= step ? GOLD : `${NAVY}22`,
        transition: "all .3s ease",
      }} />
    ))}
  </div>
);

// ─── Event header ────────────────────────────────────────────
const EventHeader = ({ subtitle }) => (
  <div style={{ textAlign: "center", marginBottom: 32 }}>
    <div style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 10, fontWeight: 500 }}>
      08 · 08 · 2025
    </div>
    <h1 style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 38, fontWeight: 400, color: NAVY,
      lineHeight: 1.15, letterSpacing: "0.02em",
    }}>
      Mariam <em style={{ fontStyle: "italic", color: GOLD }}>@ 50</em>
    </h1>
    {subtitle && (
      <p style={{ fontSize: 13, color: MUTED, marginTop: 10, fontWeight: 300, lineHeight: 1.6 }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
//  RSVP VIEWS
// ════════════════════════════════════════════════════════════

// ─── 1. Home ─────────────────────────────────────────────────
const HomeView = ({ onStart, onAdmin }) => {
  useEffect(() => { injectStyles(); }, []);
  return (
    <Page center>
      <div style={{ textAlign: "center", padding: "20px 24px", width: "100%", maxWidth: 560 }}>
        <div className="fade-up stagger-1" style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: 20, fontWeight: 500 }}>
          You Are Cordially Invited
        </div>
        <div className="fade-up stagger-2">
          <Ornament size={80} color={`${GOLD}cc`} />
        </div>
        <h1 className="fade-up stagger-3" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(52px, 12vw, 88px)",
          fontWeight: 300,
          color: NAVY,
          lineHeight: 1.0,
          letterSpacing: "0.02em",
          margin: "24px 0 8px",
        }}>
          Mariam
        </h1>
        <h2 className="fade-up stagger-3" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(28px, 7vw, 48px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: GOLD,
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}>
          @ 50
        </h2>
        <div className="fade-up stagger-4" style={{
          fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
          color: MUTED, fontWeight: 400, marginBottom: 36,
        }}>
          08 August 2025
        </div>
        <div className="fade-up stagger-4">
          <Divider my={0} />
        </div>
        <p className="fade-up stagger-5" style={{
          fontSize: 14, color: MUTED, fontWeight: 300,
          lineHeight: 1.8, margin: "28px 0 36px",
          letterSpacing: "0.04em",
        }}>
          Please click below to RSVP
        </p>
        <div className="fade-up stagger-6">
          <Btn onClick={onStart} style={{ minWidth: 200, fontSize: 12, letterSpacing: "0.18em", padding: "16px 40px" }}>
            RSVP Here
          </Btn>
        </div>
        <button
          onClick={onAdmin}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, color: `${MUTED}99`, marginTop: 52,
            letterSpacing: "0.08em", display: "block", margin: "52px auto 0",
          }}
        >
          Admin →
        </button>
      </div>
    </Page>
  );
};

// ─── 2. Details ──────────────────────────────────────────────
const DetailsView = ({ onNext, onBack }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const err = !name.trim();
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={0} total={3} />
        <Card className="fade-up">
          <EventHeader subtitle="Let's start with your details" />
          <Divider my={24} />
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" onClick={onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn onClick={() => onNext(name.trim(), email.trim())} disabled={err} style={{ flex: 2 }}>
              Continue
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
};

// ─── 3. Q1 – Attendance ──────────────────────────────────────
const Q1View = ({ onYes, onNo }) => {
  const [choice, setChoice] = useState(null);
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={1} total={3} />
        <Card className="fade-up">
          <EventHeader />
          <Divider my={24} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Will you be joining us to celebrate<br />
            <strong style={{ fontWeight: 500 }}>Mariam @ 50</strong> on <strong style={{ fontWeight: 500 }}>08/08/2025</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <ChoiceCard
              label="Yes, I will be in attendance"
              icon="🎉"
              selected={choice === "yes"}
              onClick={() => setChoice("yes")}
            />
            <ChoiceCard
              label="No, sorry I cannot make it"
              icon="🤍"
              selected={choice === "no"}
              onClick={() => setChoice("no")}
            />
          </div>
          <Btn
            full
            disabled={!choice}
            onClick={() => choice === "yes" ? onYes() : onNo()}
          >
            Continue
          </Btn>
        </Card>
      </div>
    </Page>
  );
};

// ─── 4. Contribution (not attending) ─────────────────────────
const ContributionView = ({ onYes, onNo, saving }) => {
  const [choice, setChoice] = useState(null);
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 10 }}>
              We Are So Sorry
            </h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, fontWeight: 300 }}>
              We are so sorry you cannot make it.<br />Would you like to contribute?
            </p>
          </div>
          <Divider my={20} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <ChoiceCard label="Yes, I would like to contribute" icon="💛" selected={choice === "yes"} onClick={() => setChoice("yes")} />
            <ChoiceCard label="No, thank you" icon="🤍" selected={choice === "no"} onClick={() => setChoice("no")} />
          </div>
          <Btn full disabled={!choice || saving} onClick={() => choice === "yes" ? onYes() : onNo()}>
            {saving ? "Saving…" : "Submit Response"}
          </Btn>
        </Card>
      </div>
    </Page>
  );
};

// ─── 5. Q2 – Asoebi ──────────────────────────────────────────
const Q2View = ({ onYes, onYesPaid, onNo }) => {
  const [choice, setChoice] = useState(null);
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <EventHeader subtitle="We have beautiful attire options available" />
          <Divider my={24} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Would you like to buy <strong style={{ fontWeight: 500 }}>asoebi</strong>, <strong style={{ fontWeight: 500 }}>gele</strong>, or a <strong style={{ fontWeight: 500 }}>cap</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <ChoiceCard label="Yes, I would love to" icon="⭐️" selected={choice === "yes"} onClick={() => setChoice("yes")} />
            <ChoiceCard label="Yes, I would love to and I have paid" icon="🤍" selected={choice === "yes_paid"} onClick={() => setChoice("yes_paid")} />
            <ChoiceCard label="No, I don't want to" icon="💙" selected={choice === "no"} onClick={() => setChoice("no")} />
          </div>
          <Btn
            full disabled={!choice}
            onClick={() => {
              if (choice === "yes") onYes();
              else if (choice === "yes_paid") onYesPaid();
              else onNo();
            }}
          >
            Continue
          </Btn>
        </Card>
      </div>
    </Page>
  );
};

// ─── 6. Asoebi Items ─────────────────────────────────────────
const ITEMS = [
  { key: "asoebi_gele", label: "Asoebi + Gele", price: "£150" },
  { key: "gele",        label: "Gele",           price: "£30"  },
  { key: "asoebi",      label: "Asoebi",          price: "£120" },
  { key: "cap",         label: "Cap",             price: "£20"  },
];

const AsoebItems = ({ onConfirm, saving }) => {
  const [item, setItem] = useState(null);
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 8 }}>
              Select Your Attire
            </h2>
            <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>Choose an option below</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {ITEMS.map(it => (
              <ChoiceCard
                key={it.key}
                label={it.label}
                sublabel={it.price}
                selected={item === it.key}
                onClick={() => setItem(it.key)}
              />
            ))}
          </div>
          <Divider my={20} />
          <div style={{
            background: `${GOLD}0c`,
            border: `0.5px solid ${GOLD}44`,
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.7, fontWeight: 300 }}>
              If you would like to pay now, please use the Monzo link below.
              Please note, if you picked Cap, please add your cap size in the refrence section of the Monzo payment. Thank you!
            </p>
            <a
              href={MONZO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 10,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: GOLD,
                fontWeight: 500,
                textDecoration: "none",
                borderBottom: `0.5px solid ${GOLD}55`,
                paddingBottom: 2,
              }}
            >
              Pay via Monzo →
            </a>
          </div>
          <Btn full disabled={!item || saving} onClick={() => onConfirm(item)}>
            {saving ? "Saving…" : "Confirm Selection"}
          </Btn>
        </Card>
      </div>
    </Page>
  );
};

// ─── 7. Done ─────────────────────────────────────────────────
const DoneView = ({ type }) => {
  const msgs = {
    default:       { emoji: "✨", title: "Thank You", body: "Your response has been received. We look forward to celebrating with you!" },
    not_attending: { emoji: "🌸", title: "Thank You", body: "Thank you for your response. You will be missed!" },
    contribute:    { emoji: "💛", title: "Thank You So Much", body: "Your generosity means the world. Thank you for contributing!" },
    asoebi_paid:   { emoji: "👗", title: "Wonderful!", body: "Thank you! We cannot wait to see you in your beautiful attire." },
    asoebi_no:     { emoji: "💙", title: "See You There!", body: "Thank you. We cannot wait to see you.\nDress code: Blue and Gold." },
    asoebi_items:  { emoji: "⭐️", title: "Exciting!", body: "Your selection has been saved. Please use the Monzo link to complete payment at your convenience." },
  };
  const m = msgs[type] || msgs.default;
  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card className="fade-up" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 20 }}>{m.emoji}</div>
          <Ornament size={60} color={`${GOLD}88`} />
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32, fontWeight: 400, color: NAVY,
            margin: "20px 0 12px",
          }}>
            {m.title}
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300, whiteSpace: "pre-line" }}>
            {m.body}
          </p>
          <Divider my={28} />
          <p style={{ fontSize: 12, color: `${MUTED}88`, letterSpacing: "0.1em" }}>
            MARIAM @ 50 · 08/08/2025
          </p>
        </Card>
      </div>
    </Page>
  );
};

// ════════════════════════════════════════════════════════════
//  ADMIN VIEWS
// ════════════════════════════════════════════════════════════

const AdminLoginView = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr(""); setLoading(true);
    try {
      const d = await authLogin(email, pw);
      onLogin(d.access_token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page center>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card className="fade-up" style={{ maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD, marginBottom: 8, textTransform: "uppercase", fontWeight: 500 }}>
              Admin Portal
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 400, color: NAVY }}>
              Secure Login
            </h2>
          </div>
          <Divider my={20} />
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@example.com" required />
          <Input label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••" required />
          {err && (
            <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>
              {err}
            </div>
          )}
          <Btn full variant="navy" onClick={handleLogin} disabled={!email || !pw || loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Btn>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: MUTED, marginTop: 16, display: "block", width: "100%", textAlign: "center" }}>
            ← Back to event
          </button>
        </Card>
      </div>
    </Page>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────────
const AdminDashboard = ({ token, onLogout }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const d = await dbFetch(token);
      setGuests(d);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const attending   = guests.filter(g => g.attending === true);
  const notAttend   = guests.filter(g => g.attending === false);
  const contributed = guests.filter(g => g.contribution_choice === "yes");
  const asoebiAll   = guests.filter(g => g.asoebi_choice === "yes" || g.asoebi_choice === "yes_paid");
  const paid        = asoebiAll.filter(g => g.payment_status === "paid");
  const pending     = asoebiAll.filter(g => g.payment_status === "pending");

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.full_name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "attending") return g.attending === true;
    if (filter === "not_attending") return g.attending === false;
    if (filter === "asoebi") return g.asoebi_choice === "yes" || g.asoebi_choice === "yes_paid";
    if (filter === "paid") return g.payment_status === "paid";
    if (filter === "pending") return g.payment_status === "pending";
    return true;
  });

  const exportCSV = () => {
    const cols = ["full_name","email","attending","contribution_choice","asoebi_choice","asoebi_item","payment_status","created_at"];
    const rows = [cols.join(","), ...guests.map(g =>
      cols.map(c => {
        const v = g[c] === null || g[c] === undefined ? "" : String(g[c]);
        return `"${v.replace(/"/g, '""')}"`;
      }).join(",")
    )];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "mariam50_rsvp.csv"; a.click();
  };

  const statCard = (label, value, color = NAVY) => (
    <div style={{
      background: "#fff", border: `0.5px solid ${GOLD}44`,
      borderRadius: 12, padding: "20px 24px",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color }}>{value}</div>
    </div>
  );

  const itemLabel = { asoebi_gele: "Asoebi + Gele", gele: "Gele", asoebi: "Asoebi", cap: "Cap" };
  const asoLabel = { yes: "Yes (pending)", yes_paid: "Yes (paid)", no: "No" };

  return (
    <div style={{ background: CREAM2, minHeight: "100vh", fontFamily: "'Jost', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: NAVY,
        padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#fff", fontWeight: 400 }}>
            Mariam <em style={{ color: GOLD }}>@ 50</em>
          </div>
          <div style={{ fontSize: 11, color: `${GOLD}bb`, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
            Admin Dashboard
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Btn variant="outline" onClick={load} style={{ color: "#fff", borderColor: "#fff4", fontSize: 11 }}>
            Refresh
          </Btn>
          <Btn onClick={exportCSV} style={{ fontSize: 11, padding: "10px 20px" }}>
            Export CSV
          </Btn>
          <Btn variant="ghost" onClick={onLogout} style={{ color: `${GOLD}cc`, borderColor: `${GOLD}44`, fontSize: 11 }}>
            Logout
          </Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {err && (
          <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#991b1b" }}>
            Error: {err} — Check your Supabase credentials.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 32 }}>
          {statCard("Total Responses", guests.length, NAVY)}
          {statCard("Attending", attending.length, "#1a7f4b")}
          {statCard("Not Attending", notAttend.length, "#c0392b")}
          {statCard("Contributions", contributed.length, GOLD)}
          {statCard("Asoebi Orders", asoebiAll.length, "#7c3aed")}
          {statCard("Paid", paid.length, "#0891b2")}
          {statCard("Pending", pending.length, "#d97706")}
        </div>

        {/* Filters + Search */}
        <div style={{
          background: "#fff", border: `0.5px solid ${GOLD}33`,
          borderRadius: 12, padding: "20px 24px", marginBottom: 24,
          display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["all", "All"],
              ["attending", "Attending"],
              ["not_attending", "Not Attending"],
              ["asoebi", "Asoebi"],
              ["paid", "Paid"],
              ["pending", "Pending"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                style={{
                  padding: "7px 16px", fontSize: 12, borderRadius: 20, cursor: "pointer",
                  border: `0.5px solid ${filter === v ? GOLD : `${NAVY}22`}`,
                  background: filter === v ? `${GOLD}15` : "transparent",
                  color: filter === v ? GOLD : MUTED,
                  fontWeight: filter === v ? 500 : 400,
                  transition: "all .2s", fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              marginLeft: "auto", padding: "8px 14px", fontSize: 13,
              border: `0.5px solid ${NAVY}22`, borderRadius: 8,
              fontFamily: "'Jost', sans-serif", color: NAVY, minWidth: 220,
              outline: "none", background: "#fff",
            }}
          />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: `0.5px solid ${GOLD}33`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `0.5px solid ${GOLD}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>
              {filtered.length} {filtered.length === 1 ? "guest" : "guests"}
            </div>
          </div>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: MUTED, fontSize: 13 }}>
              <div style={{ animation: "pulse 1.5s ease infinite" }}>Loading guests…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: MUTED, fontSize: 13 }}>No guests found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: `${CREAM2}` }}>
                    {["Name", "Email", "Attending", "Contribution", "Asoebi", "Item", "Payment", "Date"].map(h => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: "left",
                        fontSize: 11, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: MUTED, fontWeight: 500,
                        borderBottom: `0.5px solid ${GOLD}22`,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => (
                    <tr key={g.id} style={{ background: i % 2 === 0 ? "#fff" : `${CREAM}55`, transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${GOLD}08`}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : `${CREAM}55`}
                    >
                      <td style={{ padding: "13px 16px", fontWeight: 500, color: NAVY, borderBottom: `0.5px solid ${GOLD}18` }}>
                        {g.full_name}
                      </td>
                      <td style={{ padding: "13px 16px", color: MUTED, borderBottom: `0.5px solid ${GOLD}18` }}>
                        {g.email || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${GOLD}18` }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 11,
                          background: g.attending === true ? "#d1fae5" : g.attending === false ? "#fee2e2" : "#f3f4f6",
                          color: g.attending === true ? "#065f46" : g.attending === false ? "#991b1b" : MUTED,
                        }}>
                          {g.attending === true ? "Yes" : g.attending === false ? "No" : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", color: MUTED, borderBottom: `0.5px solid ${GOLD}18` }}>
                        {g.contribution_choice || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${GOLD}18` }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 11,
                          background: g.asoebi_choice === "yes_paid" ? "#dbeafe" : g.asoebi_choice === "yes" ? `${GOLD}22` : "#f3f4f6",
                          color: g.asoebi_choice === "yes_paid" ? "#1e40af" : g.asoebi_choice === "yes" ? "#92400e" : MUTED,
                        }}>
                          {asoLabel[g.asoebi_choice] || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", color: MUTED, borderBottom: `0.5px solid ${GOLD}18` }}>
                        {itemLabel[g.asoebi_item] || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${GOLD}18` }}>
                        {g.payment_status ? (
                          <span style={{
                            display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 11,
                            background: g.payment_status === "paid" ? "#d1fae5" : "#fef3c7",
                            color: g.payment_status === "paid" ? "#065f46" : "#92400e",
                          }}>
                            {g.payment_status}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: MUTED, fontSize: 12, borderBottom: `0.5px solid ${GOLD}18` }}>
                        {g.created_at ? new Date(g.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contribution section */}
        {contributed.length > 0 && (
          <div style={{ background: "#fff", border: `0.5px solid ${GOLD}33`, borderRadius: 12, padding: "24px", marginTop: 24 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: NAVY, marginBottom: 16 }}>
              Contributions
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {contributed.map(g => (
                <div key={g.id} style={{
                  padding: "8px 16px", border: `0.5px solid ${GOLD}44`,
                  borderRadius: 8, fontSize: 13, color: NAVY,
                  background: `${GOLD}08`,
                }}>
                  {g.full_name} {g.email ? `· ${g.email}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  useEffect(() => { injectStyles(); }, []);

  const [view, setView] = useState("home");
  const [doneType, setDoneType] = useState("default");
  const [token, setToken] = useState(null);
  const [saving, setSaving] = useState(false);

  // Collected form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const save = async (payload) => {
    setSaving(true);
    try {
      await dbInsert({ full_name: name, email: email || null, ...payload });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  // ─── RSVP flow handlers ─────────────────────────────────
  const handleDetails = (n, em) => { setName(n); setEmail(em); setView("q1"); };

  const handleQ1Yes = () => setView("q2");
  const handleQ1No  = () => setView("contribution");

  const handleContribYes = async () => {
    await save({ attending: false, contribution_choice: "yes" });
    window.open(MONZO_LINK, "_blank");
    setDoneType("contribute"); setView("done");
  };
  const handleContribNo = async () => {
    await save({ attending: false, contribution_choice: "no" });
    setDoneType("not_attending"); setView("done");
  };

  const handleQ2Yes     = () => setView("asoebi_items");
  const handleQ2YesPaid = async () => {
    await save({ attending: true, asoebi_choice: "yes_paid", payment_status: "paid" });
    setDoneType("asoebi_paid"); setView("done");
  };
  const handleQ2No = async () => {
    await save({ attending: true, asoebi_choice: "no" });
    setDoneType("asoebi_no"); setView("done");
  };

  const handleAsoebItem = async (item) => {
    await save({ attending: true, asoebi_choice: "yes", asoebi_item: item, payment_status: "pending" });
    setDoneType("asoebi_items"); setView("done");
  };

  // ─── Admin handlers ──────────────────────────────────────
  const handleLogin = (tok) => { setToken(tok); setView("dashboard"); };
  const handleLogout = () => { setToken(null); setView("home"); };

  // ─── Render ─────────────────────────────────────────────
  if (view === "home")         return <HomeView onStart={() => setView("details")} onAdmin={() => setView("admin")} />;
  if (view === "details")      return <DetailsView onNext={handleDetails} onBack={() => setView("home")} />;
  if (view === "q1")           return <Q1View onYes={handleQ1Yes} onNo={handleQ1No} />;
  if (view === "contribution") return <ContributionView onYes={handleContribYes} onNo={handleContribNo} saving={saving} />;
  if (view === "q2")           return <Q2View onYes={handleQ2Yes} onYesPaid={handleQ2YesPaid} onNo={handleQ2No} />;
  if (view === "asoebi_items") return <AsoebItems onConfirm={handleAsoebItem} saving={saving} />;
  if (view === "done")         return <DoneView type={doneType} />;
  if (view === "admin")        return <AdminLoginView onLogin={handleLogin} onBack={() => setView("home")} />;
  if (view === "dashboard")    return <AdminDashboard token={token} onLogout={handleLogout} />;
  return null;
}
