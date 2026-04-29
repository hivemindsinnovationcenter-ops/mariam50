import { useState, useEffect } from "react";

// ============================================================
//  CONFIGURATION
// ============================================================
const SUPABASE_URL  = "https://inprrcgcabxedtotmviy.supabase.co";
const SUPABASE_ANON = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
const MONZO_LINK    = "https://monzo.me/oluwafunmibijohnaloba?h=fOv5jA&account_type=personal";
var BANK_NAME    = "Monzo Bank";
var ACCOUNT_NAME = "Oluwafunmibi Mary John-Aloba";
var SORT_CODE    = "04-00-03";
var ACCOUNT_NO   = "06775165";
var DEADLINE      = new Date("2026-05-15T23:59:59");
// ============================================================

async function dbInsert(payload) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/guests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data[0];
}

async function dbCheckEmail(email) {
  const r = await fetch(
    SUPABASE_URL + "/rest/v1/guests?email=eq." + encodeURIComponent(email) + "&select=id",
    { headers: { "apikey": SUPABASE_ANON } }
  );
  if (!r.ok) return false;
  const d = await r.json();
  return d.length > 0;
}

async function dbInsertMembers(guestId, members) {
  if (!members || members.length === 0) return;
  const rows = members.map(function(m) {
    return {
      guest_id: guestId,
      full_name: m.name,
      asoebi_choice: m.wantsAsoebi ? "yes" : "no",
      asoebi_item:   (m.wantsAsoebi && m.asoItem) ? m.asoItem : null,
      payment_status: m.wantsAsoebi ? "pending" : null,
    };
  });
  const r = await fetch(SUPABASE_URL + "/rest/v1/group_members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(await r.text());
}

// ── Design tokens ──────────────────────────────────────────
const NAVY  = "#0C1929";
const GOLD  = "#BF9645";
const GOLD2 = "#D4AF5A";
const CREAM = "#FDFBF5";
const CREAM2 = "#F4EFE2";
const MUTED = "#8A8070";

const ITEMS = [
  { key: "asoebi_gele", label: "Asoebi + Gele", price: 150 },
  { key: "gele",        label: "Gele",           price: 30  },
  { key: "asoebi",      label: "Asoebi",          price: 120 },
  { key: "cap",         label: "Cap",             price: 20  },
];

const ITEM_LABEL = { asoebi_gele: "Asoebi + Gele", gele: "Gele", asoebi: "Asoebi", cap: "Cap" };
const ITEM_PRICE = { asoebi_gele: 150, gele: 30, asoebi: 120, cap: 20 };

function injectStyles() {
  if (document.getElementById("m50-styles")) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "m50-styles";
  s.textContent =
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}" +
    "html,body,#root{min-height:100vh}" +
    "body{background:" + CREAM + ";font-family:'Jost',sans-serif;color:" + NAVY + "}" +
    "@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
    ".fade-up{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}" +
    ".s1{animation-delay:.05s}.s2{animation-delay:.12s}.s3{animation-delay:.20s}" +
    ".s4{animation-delay:.28s}.s5{animation-delay:.36s}.s6{animation-delay:.44s}" +
    "input,select{font-family:'Jost',sans-serif}";
  document.head.appendChild(s);
}

// ── Shared UI ──────────────────────────────────────────────

function Ornament(props) {
  const size  = props.size  || 32;
  const color = props.color || GOLD;
  return (
    <svg width={size} height={size / 2} viewBox="0 0 64 20" fill="none">
      <line x1="0" y1="10" x2="24" y2="10" stroke={color} strokeWidth="0.8" />
      <circle cx="32" cy="10" r="4" stroke={color} strokeWidth="0.8" fill="none" />
      <circle cx="32" cy="10" r="1.5" fill={color} />
      <line x1="40" y1="10" x2="64" y2="10" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

function Divider(props) {
  const margin = props.my !== undefined ? props.my : 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: margin + "px 0" }}>
      <div style={{ flex: 1, height: "0.5px", background: GOLD + "55" }} />
      <Ornament size={40} color={GOLD + "99"} />
      <div style={{ flex: 1, height: "0.5px", background: GOLD + "55" }} />
    </div>
  );
}

function Page(props) {
  return (
    <div style={{
      minHeight: "100vh", background: CREAM,
      backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%," + GOLD + "12 0%,transparent 70%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {props.children}
    </div>
  );
}

function Card(props) {
  return (
    <div className={props.className || ""} style={Object.assign({
      background: "#fff", border: "0.5px solid " + GOLD + "55",
      borderRadius: 16, padding: "40px 44px",
      width: "100%", maxWidth: 540,
      boxShadow: "0 4px 40px " + NAVY + "08,0 0 0 1px " + GOLD + "18",
    }, props.style || {})}>
      {props.children}
    </div>
  );
}

function Btn(props) {
  const [hov, setHov] = useState(false);
  const v = props.variant || "primary";
  const disabled = !!props.disabled;
  const base = {
    fontFamily: "'Jost',sans-serif", fontWeight: 500, fontSize: 13,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 32px",
    borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all .3s ease", display: "inline-block",
    width: props.full ? "100%" : "auto", opacity: disabled ? 0.55 : 1,
  };
  const variants = {
    primary: { background: hov ? GOLD2 : GOLD, color: "#fff", boxShadow: hov ? "0 6px 24px " + GOLD + "55" : "0 2px 12px " + GOLD + "30", transform: hov ? "translateY(-1px)" : "none" },
    outline: { background: "transparent", color: NAVY, border: "0.5px solid " + NAVY + "66", transform: hov && !disabled ? "translateY(-1px)" : "none" },
    ghost:   { background: hov ? CREAM2 : "transparent", color: MUTED, border: "0.5px solid " + MUTED + "44" },
    success: { background: hov ? "#059669" : "#10b981", color: "#fff", boxShadow: hov ? "0 6px 24px #10b98155" : "0 2px 12px #10b98130", transform: hov ? "translateY(-1px)" : "none" },
  };
  return (
    <button
      style={Object.assign({}, base, variants[v] || variants.primary, props.style || {})}
      onClick={props.onClick} disabled={disabled}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
    >
      {props.children}
    </button>
  );
}

function ChoiceCard(props) {
  const [hov, setHov] = useState(false);
  const selected = !!props.selected;
  return (
    <div
      onClick={props.onClick}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={{
        padding: "20px 24px",
        border: (selected ? "1.5px" : "0.5px") + " solid " + (selected ? GOLD : hov ? GOLD + "88" : NAVY + "22"),
        borderRadius: 12, cursor: "pointer",
        background: selected ? GOLD + "0e" : hov ? GOLD + "05" : "#fff",
        transition: "all .25s ease", display: "flex", alignItems: "center", gap: 16,
      }}
    >
      {props.icon && <span style={{ fontSize: 20 }}>{props.icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{props.label}</div>
        {props.sublabel && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{props.sublabel}</div>}
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: "1.5px solid " + (selected ? GOLD : NAVY + "33"),
        background: selected ? GOLD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s", flexShrink: 0,
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
      </div>
    </div>
  );
}

function Input(props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
        {props.label}{props.required && <span style={{ color: GOLD }}> *</span>}
      </label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={function(e) { props.onChange(e.target.value); }}
        placeholder={props.placeholder}
        style={{ width: "100%", padding: "13px 16px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 14, background: "#fff", color: NAVY, outline: "none", fontFamily: "'Jost',sans-serif", transition: "border-color .2s" }}
        onFocus={function(e) { e.target.style.borderColor = GOLD; e.target.style.boxShadow = "0 0 0 3px " + GOLD + "15"; }}
        onBlur={function(e)  { e.target.style.borderColor = NAVY + "33"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Progress(props) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: props.total }).map(function(_, i) {
        return (
          <div key={i} style={{
            width: i === props.step ? 20 : 6, height: 6, borderRadius: 3,
            background: i <= props.step ? GOLD : NAVY + "22", transition: "all .3s ease",
          }} />
        );
      })}
    </div>
  );
}

function EventHeader(props) {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 10, fontWeight: 500 }}>
        08 · 08 · 2026
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 400, color: NAVY, lineHeight: 1.15 }}>
        Mariam <em style={{ fontStyle: "italic", color: GOLD }}>@ 50</em>
      </h1>
      {props.subtitle && (
        <p style={{ fontSize: 13, color: MUTED, marginTop: 10, fontWeight: 300, lineHeight: 1.6 }}>{props.subtitle}</p>
      )}
    </div>
  );
}

function useCountdown() {
  function calc() {
    const diff = DEADLINE - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000)  / 60000),
      secs:  Math.floor((diff % 60000)    / 1000),
      expired: false,
    };
  }
  const [time, setTime] = useState(calc);
  useEffect(function() {
    const t = setInterval(function() { setTime(calc()); }, 1000);
    return function() { clearInterval(t); };
  }, []);
  return time;
}

function TimeBox(props) {
  return (
    <div style={{ textAlign: "center", minWidth: 48 }}>
      <div style={{ fontSize: 28, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: NAVY, lineHeight: 1 }}>
        {String(props.value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginTop: 3 }}>
        {props.label}
      </div>
    </div>
  );
}

// ── Pay section (shared between solo and group flows) ──────

function PaySection(props) {
  const time = useCountdown();
  const { payMethod, setPayMethod, total, isCap } = props;
  return (
    <>
      <div style={{ background: CREAM2, border: "0.5px solid " + GOLD + "55", borderRadius: 12, padding: "16px 18px", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12, fontWeight: 500 }}>
          Payment Deadline -- 15 May 2026
        </div>
        {time.expired ? (
          <p style={{ fontSize: 12, color: MUTED }}>The payment deadline has passed</p>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "center" }}>
            <TimeBox value={time.days}  label="Days"  />
            <div style={{ fontSize: 20, color: GOLD, marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.hours} label="Hours" />
            <div style={{ fontSize: 20, color: GOLD, marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.mins}  label="Mins"  />
            <div style={{ fontSize: 20, color: GOLD, marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.secs}  label="Secs"  />
          </div>
        )}
      </div>

      {/* Pay Now */}
      <div onClick={function() { setPayMethod("now"); }} style={{
        border: (payMethod === "now" ? "1.5px" : "0.5px") + " solid " + (payMethod === "now" ? GOLD : NAVY + "22"),
        borderRadius: 12, padding: "16px 18px", marginBottom: 8,
        background: payMethod === "now" ? GOLD + "0e" : "#fff", cursor: "pointer", transition: "all .25s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "now" ? 12 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>Pay Now</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>via Monzo link</div>
          </div>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid " + (payMethod === "now" ? GOLD : NAVY + "33"), background: payMethod === "now" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {payMethod === "now" && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
          </div>
        </div>
        {payMethod === "now" && (
          <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "9px 18px", fontFamily: "'Jost',sans-serif" }}>
            Open Monzo
          </a>
        )}
      </div>

      {/* Pay Later */}
      <div onClick={function() { setPayMethod("later"); }} style={{
        border: (payMethod === "later" ? "1.5px" : "0.5px") + " solid " + (payMethod === "later" ? GOLD : NAVY + "22"),
        borderRadius: 12, padding: "16px 18px", marginBottom: 14,
        background: payMethod === "later" ? GOLD + "0e" : "#fff", cursor: "pointer", transition: "all .25s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "later" ? 12 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>Pay Later</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>bank transfer -- by 15 May</div>
          </div>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid " + (payMethod === "later" ? GOLD : NAVY + "33"), background: payMethod === "later" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {payMethod === "later" && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
          </div>
        </div>
        {payMethod === "later" && (
          <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 8 }}>Bank Details</div>
            {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
              return (
                <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid " + GOLD + "18" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>{row[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: NAVY }}>{row[1]}</span>
                </div>
              );
            })}
            <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
              Use your name as reference.{total > 0 ? " Total: £" + total + "." : ""}{isCap ? " Include cap size." : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  RSVP VIEWS
// ════════════════════════════════════════════════════════════

function HomeView(props) {
  return (
    <Page>
      <div style={{ textAlign: "center", padding: "20px 24px", width: "100%", maxWidth: 560 }}>
        <div className="fade-up s1" style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: 20, fontWeight: 500 }}>You Are Cordially Invited</div>
        <div className="fade-up s2"><Ornament size={80} color={GOLD + "cc"} /></div>
        <h1 className="fade-up s3" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(52px,12vw,88px)", fontWeight: 300, color: NAVY, lineHeight: 1.0, margin: "24px 0 8px" }}>Mariam</h1>
        <h2 className="fade-up s3" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,7vw,48px)", fontWeight: 400, fontStyle: "italic", color: GOLD, marginBottom: 8 }}>@ 50</h2>
        <div className="fade-up s4" style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, marginBottom: 36 }}>08 August 2026</div>
        <div className="fade-up s4"><Divider my={0} /></div>
        <p className="fade-up s5" style={{ fontSize: 14, color: MUTED, fontWeight: 300, lineHeight: 1.8, margin: "28px 0 36px" }}>Please click below to RSVP</p>
        <div className="fade-up s6">
          <Btn onClick={props.onStart} style={{ minWidth: 200, fontSize: 12, letterSpacing: "0.18em", padding: "16px 40px" }}>RSVP Here</Btn>
        </div>
      </div>
    </Page>
  );
}

function DetailsView(props) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [checking, setChecking] = useState(false);
  const [dupErr,   setDupErr]   = useState("");

  const isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes("@");

  async function handleContinue() {
    setDupErr(""); setChecking(true);
    try {
      const exists = await dbCheckEmail(email.trim().toLowerCase());
      if (exists) {
        setDupErr("It looks like you have already RSVP'd with this email. Please get in touch if you need to make a change.");
        return;
      }
      props.onNext(name.trim(), email.trim().toLowerCase());
    } catch (e) {
      props.onNext(name.trim(), email.trim().toLowerCase());
    } finally {
      setChecking(false);
    }
  }

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={0} total={3} />
        <Card className="fade-up">
          <EventHeader subtitle="Let's start with your details" />
          <Divider my={24} />
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <Input label="Email Address" value={email} onChange={function(v) { setEmail(v); setDupErr(""); }} type="email" placeholder="your@email.com" required />
          {dupErr && (
            <div style={{ background: GOLD + "0e", border: "0.5px solid " + GOLD + "66", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: NAVY, lineHeight: 1.6, fontWeight: 300 }}>
              {dupErr}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn onClick={handleContinue} disabled={!isValid || checking} style={{ flex: 2 }}>
              {checking ? "Checking..." : "Continue"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Q1View(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={1} total={3} />
        <Card className="fade-up">
          <EventHeader />
          <Divider my={24} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Will you be joining us to celebrate<br />
            <strong style={{ fontWeight: 500 }}>Mariam @ 50</strong> on <strong style={{ fontWeight: 500 }}>08/08/2026</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <ChoiceCard label="Yes, I will be in attendance" icon="🎉" selected={choice === "yes"} onClick={function() { setChoice("yes"); }} />
            <ChoiceCard label="No, sorry I cannot make it"   icon="🤍" selected={choice === "no"}  onClick={function() { setChoice("no");  }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!choice} onClick={function() { choice === "yes" ? props.onYes() : props.onNo(); }} style={{ flex: 2 }}>Continue</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function ContributionView(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 10 }}>We Are So Sorry</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, fontWeight: 300 }}>
              We are so sorry you cannot make it.<br />Would you like to contribute?
            </p>
          </div>
          <Divider my={20} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <ChoiceCard label="Yes, I would like to contribute" icon="💛" selected={choice === "yes"} onClick={function() { setChoice("yes"); }} />
            <ChoiceCard label="No, thank you"                    icon="🤍" selected={choice === "no"}  onClick={function() { setChoice("no");  }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!choice || props.saving} onClick={function() { choice === "yes" ? props.onYes() : props.onNo(); }} style={{ flex: 2 }}>
              {props.saving ? "Saving..." : "Submit Response"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── NEW: Group question ────────────────────────────────────

function GroupQuestionView(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <EventHeader subtitle="Almost there!" />
          <Divider my={24} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Are you RSVPing for anyone else?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <ChoiceCard
              label="Just me"
              sublabel="Only RSVPing for myself"
              icon="🙋"
              selected={choice === "just_me"}
              onClick={function() { setChoice("just_me"); }}
            />
            <ChoiceCard
              label="Me and family / guests"
              sublabel="I'm bringing others -- I can set their asoebi too"
              icon="👨‍👩‍👧‍👦"
              selected={choice === "family"}
              onClick={function() { setChoice("family"); }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn
              disabled={!choice}
              onClick={function() { choice === "just_me" ? props.onJustMe() : props.onFamily(); }}
              style={{ flex: 2 }}
            >
              Continue
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── Solo asoebi flow (existing, unchanged) ─────────────────

function Q2View(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <EventHeader subtitle="We have beautiful attire options available" />
          <Divider my={24} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Would you like to buy <strong style={{ fontWeight: 500 }}>asoebi</strong>, <strong style={{ fontWeight: 500 }}>gele</strong>, or a <strong style={{ fontWeight: 500 }}>cap</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <ChoiceCard label="Yes, I would love to"                    icon="⭐️" selected={choice === "yes"}      onClick={function() { setChoice("yes");      }} />
            <ChoiceCard label="Yes, I would love to and I have paid"    icon="🤍" selected={choice === "yes_paid"} onClick={function() { setChoice("yes_paid"); }} />
            <ChoiceCard label="No, I don't want to"                     icon="💙" selected={choice === "no"}       onClick={function() { setChoice("no");       }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!choice} onClick={function() {
              if (choice === "yes")      props.onYes();
              else if (choice === "yes_paid") props.onYesPaid();
              else props.onNo();
            }} style={{ flex: 2 }}>Continue</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function AsoebItems(props) {
  const [item,      setItem]      = useState(null);
  const [payMethod, setPayMethod] = useState(null);
  const isCap = item === "cap";
  const total = (item && ITEM_PRICE[item]) ? ITEM_PRICE[item] : 0;

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 8 }}>Select Your Attire</h2>
            <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>Choose your item below</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {ITEMS.map(function(it) {
              return (
                <ChoiceCard key={it.key} label={it.label} sublabel={"£" + it.price}
                  selected={item === it.key}
                  onClick={function() { setItem(it.key); setPayMethod(null); }}
                />
              );
            })}
          </div>
          {isCap && (
            <div style={{ background: "#fff8e1", border: "0.5px solid #f59e0b88", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>👒</span>
              <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, fontWeight: 300 }}>
                Cap buyers should <strong style={{ fontWeight: 600 }}>wear white</strong> on the day. Add your cap size in the payment reference.
              </p>
            </div>
          )}
          <Divider my={16} />
          <PaySection payMethod={payMethod} setPayMethod={setPayMethod} total={total} isCap={isCap} />
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!item || !payMethod || props.saving} onClick={function() { props.onConfirm(item, payMethod); }} style={{ flex: 2 }}>
              {props.saving ? "Saving..." : "Confirm Selection"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── NEW: Group build view ──────────────────────────────────

function AsoToggle(props) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[{v: true, l: "Yes"}, {v: false, l: "No"}].map(function(opt) {
        const active = props.value === opt.v;
        return (
          <button key={opt.l} onClick={function() { props.onChange(opt.v); }} style={{
            padding: "5px 14px", fontSize: 12, borderRadius: 20,
            border: "0.5px solid " + (active ? (opt.v ? GOLD : NAVY + "55") : NAVY + "22"),
            background: active ? (opt.v ? GOLD : NAVY + "11") : "transparent",
            color: active ? (opt.v ? "#fff" : NAVY) : MUTED,
            cursor: "pointer", fontFamily: "'Jost',sans-serif",
            fontWeight: active ? 500 : 400, transition: "all .2s",
          }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  );
}

function PersonCard(props) {
  const isCap = props.asoItem === "cap";
  return (
    <div style={{
      border: "0.5px solid " + (props.wantsAsoebi ? GOLD + "66" : NAVY + "18"),
      borderRadius: 12, padding: "14px 16px",
      background: props.wantsAsoebi ? GOLD + "06" : "#fff",
      transition: "all .2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {props.isLead ? (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 2 }}>You</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{props.name}</div>
          </div>
        ) : (
          <>
            <input
              value={props.name}
              onChange={function(e) { props.onNameChange(e.target.value); }}
              placeholder="Guest full name"
              style={{ flex: 1, padding: "8px 12px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 13, color: NAVY, background: "#fff", fontFamily: "'Jost',sans-serif", outline: "none" }}
            />
            <button onClick={props.onRemove} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: MUTED, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>
              x
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: MUTED }}>Asoebi?</span>
        <AsoToggle value={props.wantsAsoebi} onChange={props.onToggleAsoebi} />
      </div>
      {props.wantsAsoebi && (
        <select
          value={props.asoItem || ""}
          onChange={function(e) { props.onItemChange(e.target.value); }}
          style={{ width: "100%", marginTop: 10, padding: "9px 12px", border: "0.5px solid " + GOLD + "55", borderRadius: 8, fontSize: 13, color: NAVY, background: "#fff", fontFamily: "'Jost',sans-serif", outline: "none" }}
        >
          <option value="">Select an item...</option>
          {ITEMS.map(function(it) {
            return <option key={it.key} value={it.key}>{it.label} -- £{it.price}</option>;
          })}
        </select>
      )}
      {isCap && props.wantsAsoebi && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff8e1", borderRadius: 8, fontSize: 12, color: NAVY, lineHeight: 1.5 }}>
          👒 Wear white on the day. Add cap size in payment reference.
        </div>
      )}
    </div>
  );
}

function GroupBuildView(props) {
  const [leadWants, setLeadWants] = useState(false);
  const [leadItem,  setLeadItem]  = useState("");
  const [members,   setMembers]   = useState([{ id: 1, name: "", wantsAsoebi: false, asoItem: "" }]);
  const [payMethod, setPayMethod] = useState(null);

  const anyAsoebi = leadWants || members.some(function(m) { return m.wantsAsoebi; });

  let total = 0;
  if (leadWants && leadItem) total += ITEM_PRICE[leadItem] || 0;
  members.forEach(function(m) { if (m.wantsAsoebi && m.asoItem) total += ITEM_PRICE[m.asoItem] || 0; });

  const anyCap = (leadWants && leadItem === "cap") || members.some(function(m) { return m.wantsAsoebi && m.asoItem === "cap"; });

  const canConfirm = (
    members.every(function(m) { return m.name.trim().length > 0; }) &&
    (!leadWants || leadItem) &&
    members.every(function(m) { return !m.wantsAsoebi || m.asoItem; }) &&
    (!anyAsoebi || payMethod)
  );

  function addMember() {
    setMembers(function(prev) { return prev.concat([{ id: Date.now(), name: "", wantsAsoebi: false, asoItem: "" }]); });
  }

  function removeMember(id) {
    setMembers(function(prev) { return prev.filter(function(m) { return m.id !== id; }); });
  }

  function updateMember(id, field, value) {
    setMembers(function(prev) {
      return prev.map(function(m) {
        if (m.id !== id) return m;
        const upd = {};
        upd[field] = value;
        if (field === "wantsAsoebi" && !value) upd.asoItem = "";
        return Object.assign({}, m, upd);
      });
    });
  }

  function handleConfirm() {
    props.onConfirm(
      { wantsAsoebi: leadWants, item: leadWants ? leadItem : null },
      members.map(function(m) { return { name: m.name.trim(), wantsAsoebi: m.wantsAsoebi, asoItem: m.wantsAsoebi ? m.asoItem : null }; }),
      payMethod || "none"
    );
  }

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up" style={{ maxWidth: 560 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 6 }}>Group RSVP</h2>
            <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>Set asoebi choices for everyone in your party</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <PersonCard
              isLead name={props.leadName}
              wantsAsoebi={leadWants} asoItem={leadItem}
              onToggleAsoebi={function(v) { setLeadWants(v); if (!v) setLeadItem(""); }}
              onItemChange={setLeadItem}
            />
            {members.map(function(m) {
              return (
                <PersonCard
                  key={m.id} isLead={false}
                  name={m.name} wantsAsoebi={m.wantsAsoebi} asoItem={m.asoItem}
                  onNameChange={function(v) { updateMember(m.id, "name", v); }}
                  onToggleAsoebi={function(v) { updateMember(m.id, "wantsAsoebi", v); }}
                  onItemChange={function(v) { updateMember(m.id, "asoItem", v); }}
                  onRemove={function() { removeMember(m.id); }}
                />
              );
            })}
          </div>

          {members.length < 9 && (
            <button onClick={addMember} style={{ width: "100%", padding: "12px", border: "0.5px dashed " + GOLD + "66", borderRadius: 10, background: "transparent", color: GOLD, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Jost',sans-serif", marginBottom: 14 }}>
              + Add another person
            </button>
          )}

          {total > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: GOLD + "0c", border: "0.5px solid " + GOLD + "44", borderRadius: 8, padding: "10px 16px", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>Total asoebi</span>
              <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>£{total}</span>
            </div>
          )}

          {anyAsoebi && (
            <>
              <Divider my={14} />
              <PaySection payMethod={payMethod} setPayMethod={setPayMethod} total={total} isCap={anyCap} />
            </>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!canConfirm || props.saving} onClick={handleConfirm} style={{ flex: 2 }}>
              {props.saving ? "Saving..." : "Confirm Group RSVP"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ════════════════════════════════════════════════════════════
//  DONE VIEW
// ════════════════════════════════════════════════════════════

const ATTENDING_TYPES = ["default", "asoebi_paid", "asoebi_no", "asoebi_items_now", "asoebi_items_later", "group_done"];

function GiftBox() {
  return (
    <div style={{ background: GOLD + "08", border: "0.5px solid " + GOLD + "44", borderRadius: 12, padding: "18px 20px", textAlign: "left" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 6 }}>Would you like to give a gift?</div>
      <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, fontWeight: 300, marginBottom: 12 }}>
        If you would like to bless Mariam with a monetary gift, you can send it via Monzo. Your generosity is so appreciated!
      </p>
      <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "9px 18px", fontFamily: "'Jost',sans-serif" }}>
        Send a Gift via Monzo
      </a>
    </div>
  );
}

function DoneView(props) {
  const type = props.type;

  // ── Group done ───────────────────────────────────────────
  if (type === "group_done" && props.groupData) {
    const gd = props.groupData;
    const allPeople = [{ name: props.leadName, wantsAsoebi: gd.lead.wantsAsoebi, asoItem: gd.lead.item, isLead: true }]
      .concat(gd.members.map(function(m) { return { name: m.name, wantsAsoebi: m.wantsAsoebi, asoItem: m.asoItem }; }));
    const hasNoAsoebi = allPeople.some(function(p) { return !p.wantsAsoebi; });
    let total = 0;
    allPeople.forEach(function(p) { if (p.wantsAsoebi && p.asoItem) total += ITEM_PRICE[p.asoItem] || 0; });

    return (
      <Page>
        <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card className="fade-up" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 20 }}>🎉</div>
            <Ornament size={60} color={GOLD + "88"} />
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "20px 0 8px" }}>Group Confirmed!</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300, marginBottom: 24 }}>
              We cannot wait to celebrate with your whole party!
            </p>

            {/* Party list */}
            <div style={{ background: CREAM2, borderRadius: 12, padding: "16px 20px", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 12 }}>
                Your party -- {allPeople.length} {allPeople.length === 1 ? "person" : "people"}
              </div>
              {allPeople.map(function(p, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < allPeople.length - 1 ? "0.5px solid " + GOLD + "22" : "none" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{p.name}</span>
                      {p.isLead && <span style={{ fontSize: 10, color: GOLD, marginLeft: 6, letterSpacing: "0.06em" }}>you</span>}
                    </div>
                    <div style={{ fontSize: 12, color: p.wantsAsoebi ? GOLD : MUTED }}>
                      {p.wantsAsoebi && p.asoItem ? ITEM_LABEL[p.asoItem] + " -- £" + ITEM_PRICE[p.asoItem] : "No asoebi"}
                    </div>
                  </div>
                );
              })}
              {total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: NAVY }}>Total</span>
                  <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>£{total}</span>
                </div>
              )}
            </div>

            {hasNoAsoebi && (
              <div style={{ background: NAVY + "06", borderRadius: 10, padding: "12px 16px", marginBottom: 16, textAlign: "left" }}>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, fontWeight: 300 }}>
                  Dress code for those without asoebi: <strong style={{ fontWeight: 600, color: NAVY }}>Navy Blue</strong> and <strong style={{ fontWeight: 600, color: GOLD }}>Gold</strong>
                </p>
              </div>
            )}

            {gd.payMethod === "later" && total > 0 && (
              <div style={{ background: CREAM2, border: "0.5px solid " + GOLD + "55", borderRadius: 12, padding: "16px 20px", marginBottom: 16, textAlign: "left" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 10 }}>Bank Details</div>
                {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
                  return (
                    <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid " + GOLD + "22" }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{row[0]}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: NAVY }}>{row[1]}</span>
                    </div>
                  );
                })}
                <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>Deadline: 15 May 2026. Use your name as reference.</p>
              </div>
            )}

            <GiftBox />
            <Divider my={24} />
            <p style={{ fontSize: 12, color: MUTED + "88", letterSpacing: "0.1em" }}>MARIAM @ 50 · 08/08/2026</p>
          </Card>
        </div>
      </Page>
    );
  }

  // ── Standard done ────────────────────────────────────────
  const msgs = {
    default:            { emoji: "✨", title: "Thank You",         body: "Your response has been received. We look forward to celebrating with you!" },
    not_attending:      { emoji: "🌸", title: "Thank You",         body: "Thank you for your response. You will be missed!" },
    contribute:         { emoji: "💛", title: "Thank You So Much", body: "Your generosity means the world. Thank you for contributing!" },
    asoebi_paid:        { emoji: "👗", title: "Wonderful!",        body: "Thank you! We cannot wait to see you in your beautiful attire." },
    asoebi_no:          { emoji: "💙", title: "See You There!",    body: null },
    asoebi_items_now:   { emoji: "⭐️", title: "You're Confirmed!", body: "Your selection is saved. Complete your Monzo payment and we cannot wait to see you!" },
    asoebi_items_later: { emoji: "⭐️", title: "You're Confirmed!", body: "Your selection is saved. Please send your bank transfer by 15 May 2026." },
  };
  const m = msgs[type] || msgs.default;
  const showGift = ATTENDING_TYPES.includes(type);

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card className="fade-up" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 20 }}>{m.emoji}</div>
          <Ornament size={60} color={GOLD + "88"} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "20px 0 12px" }}>{m.title}</h2>

          {type === "asoebi_no" ? (
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300 }}>
              Thank you. We cannot wait to see you.<br />
              Dress code: <strong style={{ fontWeight: 700, color: NAVY }}>Navy Blue</strong> and <strong style={{ fontWeight: 700, color: GOLD }}>Gold</strong>
            </p>
          ) : (
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300 }}>{m.body}</p>
          )}

          {props.asoItem === "cap" && (type === "asoebi_items_now" || type === "asoebi_items_later") && (
            <div style={{ background: "#fff8e1", border: "0.5px solid #f59e0b88", borderRadius: 10, padding: "12px 16px", marginTop: 16, textAlign: "left", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>👒</span>
              <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, fontWeight: 300 }}>
                Reminder: cap buyers should <strong style={{ fontWeight: 600 }}>wear white</strong> on the day.
              </p>
            </div>
          )}

          {type === "asoebi_items_later" && (
            <div style={{ background: CREAM2, border: "0.5px solid " + GOLD + "55", borderRadius: 12, padding: "16px 20px", marginTop: 16, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 10 }}>Bank Details</div>
              {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
                return (
                  <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid " + GOLD + "22" }}>
                    <span style={{ fontSize: 12, color: MUTED }}>{row[0]}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: NAVY }}>{row[1]}</span>
                  </div>
                );
              })}
              <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>Deadline: 15 May 2026. Use your name as reference.</p>
            </div>
          )}

          {showGift && (
            <>
              <Divider my={24} />
              <GiftBox />
            </>
          )}

          <Divider my={24} />
          <p style={{ fontSize: 12, color: MUTED + "88", letterSpacing: "0.1em" }}>MARIAM @ 50 · 08/08/2026</p>
        </Card>
      </div>
    </Page>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════

export default function App() {
  useEffect(function() { injectStyles(); }, []);

  const [view,         setView]         = useState("home");
  const [doneType,     setDoneType]     = useState("default");
  const [doneGroupData, setDoneGroupData] = useState(null);
  const [asoItem,      setAsoItem]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");

  // ── Save helper for non-group flows ─────────────────────
  async function save(payload) {
    setSaving(true);
    try {
      await dbInsert(Object.assign({ full_name: name, email: email || null }, payload));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // ── Non-group handlers ───────────────────────────────────
  async function handleContribYes() {
    await save({ attending: false, contribution_choice: "yes" });
    window.open(MONZO_LINK, "_blank");
    setDoneType("contribute"); setView("done");
  }
  async function handleContribNo() {
    await save({ attending: false, contribution_choice: "no" });
    setDoneType("not_attending"); setView("done");
  }
  async function handleQ2YesPaid() {
    await save({ attending: true, asoebi_choice: "yes_paid", payment_status: "paid" });
    setDoneType("asoebi_paid"); setView("done");
  }
  async function handleQ2No() {
    await save({ attending: true, asoebi_choice: "no" });
    setDoneType("asoebi_no"); setView("done");
  }
  async function handleAsoebItem(item, payMethod) {
    await save({ attending: true, asoebi_choice: "yes", asoebi_item: item, payment_status: "pending" });
    setAsoItem(item);
    setDoneType(payMethod === "now" ? "asoebi_items_now" : "asoebi_items_later");
    setView("done");
  }

  // ── Group handler ────────────────────────────────────────
  async function handleGroupConfirm(leadAso, groupMembers, payMethod) {
    setSaving(true);
    try {
      const guest = await dbInsert({
        full_name:      name,
        email:          email || null,
        attending:      true,
        asoebi_choice:  leadAso.wantsAsoebi ? "yes" : "no",
        asoebi_item:    leadAso.wantsAsoebi ? leadAso.item : null,
        payment_status: leadAso.wantsAsoebi ? "pending" : null,
      });
      await dbInsertMembers(guest.id, groupMembers);
      setDoneGroupData({ lead: leadAso, members: groupMembers, payMethod: payMethod });
      setDoneType("group_done");
      setView("done");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // ── Routing ──────────────────────────────────────────────
  if (view === "home") {
    return <HomeView onStart={function() { setView("details"); }} />;
  }
  if (view === "details") {
    return <DetailsView onNext={function(n, em) { setName(n); setEmail(em); setView("q1"); }} onBack={function() { setView("home"); }} />;
  }
  if (view === "q1") {
    return <Q1View onYes={function() { setView("group_question"); }} onNo={function() { setView("contribution"); }} onBack={function() { setView("details"); }} />;
  }
  if (view === "contribution") {
    return <ContributionView onYes={handleContribYes} onNo={handleContribNo} onBack={function() { setView("q1"); }} saving={saving} />;
  }
  if (view === "group_question") {
    return <GroupQuestionView onJustMe={function() { setView("q2"); }} onFamily={function() { setView("group_build"); }} onBack={function() { setView("q1"); }} />;
  }
  if (view === "q2") {
    return <Q2View onYes={function() { setView("asoebi_items"); }} onYesPaid={handleQ2YesPaid} onNo={handleQ2No} onBack={function() { setView("group_question"); }} />;
  }
  if (view === "asoebi_items") {
    return <AsoebItems onConfirm={handleAsoebItem} onBack={function() { setView("q2"); }} saving={saving} />;
  }
  if (view === "group_build") {
    return <GroupBuildView leadName={name} onConfirm={handleGroupConfirm} onBack={function() { setView("group_question"); }} saving={saving} />;
  }
  if (view === "done") {
    return <DoneView type={doneType} asoItem={asoItem} leadName={name} groupData={doneGroupData} />;
  }
  return null;
}
