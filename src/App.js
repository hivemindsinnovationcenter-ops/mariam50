import { useState, useEffect } from "react";

// ============================================================
//  CONFIGURATION
// ============================================================
const SUPABASE_URL  = "https://inprrcgcabxedtotmviy.supabase.co";
const SUPABASE_ANON = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
const MONZO_LINK    = "https://monzo.me/oluwafunmibijohnaloba?h=fOv5jA&account_type=personal";
var BANK_NAME    = "Monzo Bank";
var ACCOUNT_NAME = "Oluwafunmibi Mary John-Aloba";
var SORT_CODE    = "04-00-03";
var ACCOUNT_NO   = "06775165";
var DEADLINE      = new Date("2026-05-15T23:59:59");
// ============================================================

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === "x" ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

async function dbInsert(payload) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/guests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
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
      asoebi_choice: (m.wantsAsoebi === "yes" || m.wantsAsoebi === "yes_paid") ? "yes" : "no",
      asoebi_item:   (m.wantsAsoebi && m.wantsAsoebi !== false && m.asoItem) ? m.asoItem : null,
      payment_status: m.wantsAsoebi === "yes_paid" ? "paid" : m.wantsAsoebi === "yes" ? "pending" : null,
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
const NAVY   = "#0C1929";
const NAVY2  = "#142236";
const GOLD   = "#BF9645";
const GOLD2  = "#D4AF5A";
const CREAM  = "#FDFBF5";
const CREAM2 = "#F4EFE2";
const MUTED  = "#8A8070";

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
  // Tiny diamond trellis SVG pattern at ~4% opacity for a subtle luxury texture
  const pattern = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M24 3 L45 24 L24 45 L3 24 Z' fill='none' stroke='rgba(12%2C25%2C41%2C0.055)' stroke-width='0.6'/%3E%3C/svg%3E";

  s.textContent =
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}" +
    "html,body,#root{min-height:100vh}" +
    "body{" +
      "background-color:" + CREAM + ";" +
      "background-image:" +
        "radial-gradient(ellipse 120% 100% at 50% 0%,rgba(191,150,69,0.06) 0%,transparent 55%)," +
        "radial-gradient(ellipse 100% 80% at 0% 100%,rgba(12,25,41,0.05) 0%,transparent 60%)," +
        "radial-gradient(ellipse 100% 80% at 100% 100%,rgba(12,25,41,0.04) 0%,transparent 60%)," +
        "url(\"" + pattern + "\");" +
      "font-family:'Jost',sans-serif;color:" + NAVY + ";" +
    "}" +
    "@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}" +
    ".fade-up{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) both}" +
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
      <line x1="0" y1="10" x2="22" y2="10" stroke={color} strokeWidth="0.8" />
      <circle cx="32" cy="10" r="5" stroke={color} strokeWidth="0.8" fill="none" />
      <circle cx="32" cy="10" r="2" fill={color} />
      <line x1="42" y1="10" x2="64" y2="10" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

function Divider(props) {
  const margin = props.my !== undefined ? props.my : 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: margin + "px 0" }}>
      <div style={{ flex: 1, height: "0.5px", background: GOLD + "55" }} />
      <Ornament size={44} color={GOLD + "99"} />
      <div style={{ flex: 1, height: "0.5px", background: GOLD + "55" }} />
    </div>
  );
}

function Page(props) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      backgroundImage:
        "radial-gradient(ellipse 70% 60% at 50% 40%,rgba(253,251,245,0.95) 0%,transparent 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {props.children}
    </div>
  );
}

function Card(props) {
  return (
    <div className={props.className || ""} style={Object.assign({
      background: "#FAF8F2",
      border: "0.5px solid " + GOLD + "44",
      borderTop: "3px solid " + NAVY,
      borderRadius: 16,
      padding: "44px 48px",
      width: "100%", maxWidth: 560,
      boxShadow: "0 4px 60px " + NAVY + "10, 0 1px 3px " + NAVY + "08, 0 0 0 1px " + GOLD + "18",
    }, props.style || {})}>
      {props.children}
    </div>
  );
}

function Btn(props) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  const v = props.variant || "primary";
  const disabled = !!props.disabled;
  const base = {
    fontFamily: "'Jost',sans-serif", fontWeight: 500, fontSize: 13,
    letterSpacing: "0.16em", textTransform: "uppercase", padding: "15px 36px",
    borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .25s ease", display: "inline-flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    width: props.full ? "100%" : "auto", opacity: disabled ? 0.45 : 1,
    transform: pressed && !disabled ? "translateY(1px)" : hov && !disabled ? "translateY(-2px)" : "none",
    border: "none",
    position: "relative", overflow: "hidden",
  };
  const variants = {
    primary: {
      background: hov ? GOLD2 : GOLD,
      color: "#fff",
      boxShadow: hov
        ? "0 8px 28px " + GOLD + "66, 0 2px 8px " + GOLD + "44, inset 0 1px 0 rgba(255,255,255,0.15)"
        : "0 4px 16px " + GOLD + "44, 0 1px 4px " + GOLD + "33, inset 0 1px 0 rgba(255,255,255,0.12)",
    },
    navy: {
      background: hov ? NAVY2 : NAVY,
      color: "#fff",
      boxShadow: hov
        ? "0 8px 28px " + NAVY + "55, 0 2px 8px " + NAVY + "33, inset 0 1px 0 rgba(255,255,255,0.08)"
        : "0 4px 16px " + NAVY + "33, 0 1px 4px " + NAVY + "22, inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    outline: {
      background: hov ? NAVY + "08" : "transparent",
      color: NAVY,
      border: "1.5px solid " + NAVY + "88",
      boxShadow: hov ? "0 4px 14px " + NAVY + "14" : "none",
    },
    ghost: {
      background: hov ? CREAM2 : "#f8f5ee",
      color: NAVY + "bb",
      border: "1px solid " + NAVY + "22",
      boxShadow: hov ? "0 2px 8px " + NAVY + "10" : "inset 0 1px 3px " + NAVY + "08",
    },
  };
  return (
    <button
      style={Object.assign({}, base, variants[v] || variants.primary, props.style || {})}
      onClick={props.onClick} disabled={disabled}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); setPressed(false); }}
      onMouseDown={function() { setPressed(true); }}
      onMouseUp={function() { setPressed(false); }}
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
        borderLeft: selected ? "4px solid " + GOLD : (hov ? "4px solid " + GOLD + "55" : "4px solid transparent"),
        borderRadius: 12, cursor: "pointer",
        background: selected ? NAVY + "06" : hov ? GOLD + "05" : "#FAF8F2",
        transition: "all .25s ease", display: "flex", alignItems: "center", gap: 16,
      }}
    >
      {props.icon && <span style={{ fontSize: 22 }}>{props.icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: NAVY }}>{props.label}</div>
        {props.sublabel && <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{props.sublabel}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        border: "1.5px solid " + (selected ? GOLD : NAVY + "33"),
        background: selected ? GOLD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s", flexShrink: 0,
      }}>
        {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FAF8F2" }} />}
      </div>
    </div>
  );
}

function Input(props) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY + "99", marginBottom: 9 }}>
        {props.label}{props.required && <span style={{ color: GOLD }}> *</span>}
      </label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={function(e) { props.onChange(e.target.value); }}
        placeholder={props.placeholder}
        style={{ width: "100%", padding: "14px 17px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 15, background: "#FAF8F2", color: NAVY, outline: "none", fontFamily: "'Jost',sans-serif", transition: "all .2s" }}
        onFocus={function(e) { e.target.style.borderColor = NAVY; e.target.style.boxShadow = "0 0 0 3px " + NAVY + "12"; }}
        onBlur={function(e)  { e.target.style.borderColor = NAVY + "33"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Progress(props) {
  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 28 }}>
      {Array.from({ length: props.total }).map(function(_, i) {
        return (
          <div key={i} style={{
            width: i === props.step ? 28 : 7,
            height: 7, borderRadius: 4,
            background: i < props.step ? NAVY : i === props.step ? GOLD : NAVY + "18",
            transition: "all .35s ease",
          }} />
        );
      })}
    </div>
  );
}

// Navy top strip for each card
function NavyBadge(props) {
  return (
    <div style={{
      background: NAVY,
      borderRadius: "12px 12px 0 0",
      padding: "14px 20px",
      textAlign: "center",
      marginTop: -44, marginLeft: -48, marginRight: -48, marginBottom: 32,
      borderBottom: "1px solid " + GOLD + "33",
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, fontWeight: 500 }}>
        {props.label || "08 · 08 · 2026"}
      </div>
    </div>
  );
}

function EventHeader(props) {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 400, color: NAVY, lineHeight: 1.1 }}>
        Mariam <em style={{ fontStyle: "italic", color: GOLD }}>@ 50</em>
      </h1>
      {props.subtitle && (
        <p style={{ fontSize: 15, color: MUTED, marginTop: 12, fontWeight: 300, lineHeight: 1.6 }}>{props.subtitle}</p>
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
    <div style={{ textAlign: "center", minWidth: 52 }}>
      <div style={{ fontSize: 30, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: CREAM, lineHeight: 1 }}>
        {String(props.value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD + "99", marginTop: 4 }}>
        {props.label}
      </div>
    </div>
  );
}

// ── Pay section ────────────────────────────────────────────

function PaySection(props) {
  const time = useCountdown();
  const { payMethod, setPayMethod, total, isCap } = props;
  return (
    <>
      {/* Countdown in navy */}
      <div style={{ background: NAVY, borderRadius: 12, padding: "18px 20px", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 14, fontWeight: 500 }}>
          Payment Deadline &mdash; 15 May 2026
        </div>
        {time.expired ? (
          <p style={{ fontSize: 13, color: MUTED }}>The payment deadline has passed</p>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}>
            <TimeBox value={time.days}  label="Days"  />
            <div style={{ fontSize: 22, color: GOLD + "88", marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.hours} label="Hours" />
            <div style={{ fontSize: 22, color: GOLD + "88", marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.mins}  label="Mins"  />
            <div style={{ fontSize: 22, color: GOLD + "88", marginBottom: 8, fontWeight: 300 }}>:</div>
            <TimeBox value={time.secs}  label="Secs"  />
          </div>
        )}
      </div>

      {/* Pay Now */}
      <div onClick={function() { setPayMethod("now"); }} style={{
        border: (payMethod === "now" ? "1.5px" : "0.5px") + " solid " + (payMethod === "now" ? GOLD : NAVY + "22"),
        borderLeft: payMethod === "now" ? "4px solid " + GOLD : "4px solid transparent",
        borderRadius: 12, padding: "17px 18px", marginBottom: 9,
        background: payMethod === "now" ? NAVY + "04" : "#FAF8F2", cursor: "pointer", transition: "all .25s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "now" ? 14 : 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: NAVY }}>Pay Now</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>via link</div>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (payMethod === "now" ? GOLD : NAVY + "33"), background: payMethod === "now" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {payMethod === "now" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FAF8F2" }} />}
          </div>
        </div>
        {payMethod === "now" && (
          <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "10px 20px", fontFamily: "'Jost',sans-serif" }}>
            Open link
          </a>
        )}
      </div>

      {/* Pay Later */}
      <div onClick={function() { setPayMethod("later"); }} style={{
        border: (payMethod === "later" ? "1.5px" : "0.5px") + " solid " + (payMethod === "later" ? NAVY + "66" : NAVY + "22"),
        borderLeft: payMethod === "later" ? "4px solid " + NAVY : "4px solid transparent",
        borderRadius: 12, padding: "17px 18px", marginBottom: 16,
        background: payMethod === "later" ? NAVY + "04" : "#FAF8F2", cursor: "pointer", transition: "all .25s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "later" ? 14 : 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: NAVY }}>Pay Later</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>bank transfer &mdash; by 15 May</div>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (payMethod === "later" ? NAVY : NAVY + "33"), background: payMethod === "later" ? NAVY : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {payMethod === "later" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FAF8F2" }} />}
          </div>
        </div>
        {payMethod === "later" && (
          <div style={{ background: NAVY + "06", border: "0.5px solid " + NAVY + "18", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: NAVY, fontWeight: 600, marginBottom: 10 }}>Bank Details</div>
            {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
              return (
                <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid " + NAVY + "12" }}>
                  <span style={{ fontSize: 13, color: MUTED }}>{row[0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{row[1]}</span>
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: MUTED, marginTop: 10, lineHeight: 1.6 }}>
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
      <div style={{ textAlign: "center", padding: "20px 24px", width: "100%", maxWidth: 580 }}>

        {/* Invited badge */}
        <div className="fade-up s1" style={{
          background: NAVY, borderRadius: 12,
          padding: "14px 28px", marginBottom: 36,
          display: "inline-block",
        }}>
          <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontWeight: 500 }}>
            You Are Cordially Invited
          </div>
        </div>

        <div className="fade-up s2"><Ornament size={88} color={GOLD + "cc"} /></div>
        <h1 className="fade-up s3" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(60px,14vw,96px)", fontWeight: 300, color: NAVY, lineHeight: 1.0, margin: "26px 0 6px" }}>Mariam</h1>
        <h2 className="fade-up s3" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,8vw,52px)", fontWeight: 400, fontStyle: "italic", color: GOLD, marginBottom: 10 }}>@ 50</h2>
        <div className="fade-up s4" style={{ fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED, marginBottom: 36 }}>08 August 2026</div>

        <div className="fade-up s4"><Divider my={0} /></div>

        <p className="fade-up s5" style={{ fontSize: 16, color: MUTED, fontWeight: 300, lineHeight: 1.8, margin: "28px 0 36px" }}>
          Please click below to RSVP
        </p>
        <div className="fade-up s6">
          <Btn onClick={props.onStart} style={{ minWidth: 220, fontSize: 13, letterSpacing: "0.2em", padding: "17px 44px" }}>
            RSVP Here
          </Btn>
        </div>

        <div className="fade-up s6" style={{ marginTop: 48, borderTop: "0.5px solid " + GOLD + "33", paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: MUTED + "88", letterSpacing: "0.12em" }}>MARIAM @ 50 &middot; 08/08/2026</p>
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
          <NavyBadge label="Your Details" />
          <EventHeader subtitle="Let's start with your details" />
          <Divider my={26} />
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <Input label="Email Address" value={email} onChange={function(v) { setEmail(v); setDupErr(""); }} type="email" placeholder="your@email.com" required />
          {dupErr && (
            <div style={{ background: GOLD + "0e", border: "0.5px solid " + GOLD + "66", borderRadius: 10, padding: "13px 17px", marginBottom: 18, fontSize: 14, color: NAVY, lineHeight: 1.6, fontWeight: 300 }}>
              {dupErr}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
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
          <NavyBadge label="Attendance" />
          <EventHeader />
          <Divider my={26} />
          <p style={{ fontSize: 16, color: NAVY, lineHeight: 1.75, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Will you be joining us to celebrate<br />
            <strong style={{ fontWeight: 600 }}>Mariam @ 50</strong> on <strong style={{ fontWeight: 600 }}>08/08/2026</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
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
          <NavyBadge label="Gift" />
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🌸</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 400, color: NAVY, marginBottom: 12 }}>We Are So Sorry</h2>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, fontWeight: 300 }}>
              We are so sorry you cannot make it.<br />Would you like to gift?
            </p>
          </div>
          <Divider my={22} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
            <ChoiceCard label="Yes, I would like to gift" icon="💛" selected={choice === "yes"} onClick={function() { setChoice("yes"); }} />
            <ChoiceCard label="No, thank you"             icon="🤍" selected={choice === "no"}  onClick={function() { setChoice("no");  }} />
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

function GroupQuestionView(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <NavyBadge label="Almost There!" />
          <EventHeader subtitle="Are you RSVPing for anyone else?" />
          <Divider my={26} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
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

function Q2View(props) {
  const [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up">
          <NavyBadge label="Asoebi &amp; Attire" />
          <EventHeader subtitle="We have beautiful attire options available" />
          <Divider my={26} />
          <p style={{ fontSize: 16, color: NAVY, lineHeight: 1.75, textAlign: "center", marginBottom: 28, fontWeight: 300 }}>
            Would you like to buy <strong style={{ fontWeight: 600 }}>asoebi</strong>, <strong style={{ fontWeight: 600 }}>gele</strong>, or a <strong style={{ fontWeight: 600 }}>cap</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            <ChoiceCard label="Yes, I would love to"                 icon="⭐️" selected={choice === "yes"}      onClick={function() { setChoice("yes");      }} />
            <ChoiceCard label="Yes, I would love to and I have paid" icon="🤍" selected={choice === "yes_paid"} onClick={function() { setChoice("yes_paid"); }} />
            <ChoiceCard label="No, I don't want to"                  icon="💙" selected={choice === "no"}       onClick={function() { setChoice("no");       }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!choice} onClick={function() {
              if (choice === "yes")           props.onYes();
              else if (choice === "yes_paid") props.onYesPaid();
              else                            props.onNo();
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
          <NavyBadge label="Select Your Attire" />
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 400, color: NAVY, marginBottom: 8 }}>Choose Your Item</h2>
            <p style={{ fontSize: 14, color: MUTED, fontWeight: 300 }}>Select one of the options below</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
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
            <div style={{ background: "#fff8e1", border: "0.5px solid #f59e0b88", borderRadius: 10, padding: "13px 17px", marginBottom: 14, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18 }}>👒</span>
              <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.65, fontWeight: 300 }}>
                Cap buyers should <strong style={{ fontWeight: 600 }}>wear white</strong> on the day. Add your cap size in the payment reference.
              </p>
            </div>
          )}
          <Divider my={18} />
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

// ── Group build view ───────────────────────────────────────

function AsoToggle(props) {
  // value can be: false (no), "yes" (wants, not paid), "yes_paid" (wants, already paid)
  const opts = [
    { v: "yes",      l: "Yes",  activeColor: GOLD },
    { v: "yes_paid", l: "Paid", activeColor: "#10b981" },
    { v: false,      l: "No",   activeColor: NAVY },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map(function(opt) {
        const active = props.value === opt.v;
        return (
          <button key={String(opt.v)} onClick={function() { props.onChange(opt.v); }} style={{
            padding: "5px 13px", fontSize: 12, borderRadius: 20,
            border: "0.5px solid " + (active ? opt.activeColor : NAVY + "22"),
            background: active ? opt.activeColor : "transparent",
            color: active ? "#fff" : MUTED,
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
  const wantsAny = props.wantsAsoebi === "yes" || props.wantsAsoebi === "yes_paid";
  const isPaid   = props.wantsAsoebi === "yes_paid";
  const borderColor = isPaid ? "#10b981" : wantsAny ? GOLD : NAVY + "22";
  const bg          = isPaid ? "#10b98108" : wantsAny ? GOLD + "05" : NAVY + "03";
  return (
    <div style={{
      border: "0.5px solid " + borderColor,
      borderLeft: "4px solid " + borderColor,
      borderRadius: 12, padding: "16px 18px",
      background: bg, transition: "all .2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {props.isLead ? (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 3 }}>You</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: NAVY }}>{props.name}</div>
          </div>
        ) : (
          <>
            <input
              value={props.name}
              onChange={function(e) { props.onNameChange(e.target.value); }}
              placeholder="Guest full name"
              style={{ flex: 1, padding: "9px 13px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 14, color: NAVY, background: "#FAF8F2", fontFamily: "'Jost',sans-serif", outline: "none" }}
            />
            <button onClick={props.onRemove} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: MUTED, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>
              x
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: MUTED }}>Asoebi / Gele / Cap?</span>
        <AsoToggle value={props.wantsAsoebi} onChange={props.onToggleAsoebi} />
      </div>
      {isPaid && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#059669", fontWeight: 500 }}>
          <span>✓</span><span>Payment already received</span>
        </div>
      )}
      {wantsAny && (
        <select
          value={props.asoItem || ""}
          onChange={function(e) { props.onItemChange(e.target.value); }}
          style={{ width: "100%", marginTop: 12, padding: "10px 13px", border: "0.5px solid " + (isPaid ? "#10b98155" : GOLD + "55"), borderRadius: 8, fontSize: 14, color: NAVY, background: "#FAF8F2", fontFamily: "'Jost',sans-serif", outline: "none" }}
        >
          <option value="">Select an item...</option>
          {ITEMS.map(function(it) {
            return <option key={it.key} value={it.key}>{it.label} -- £{it.price}</option>;
          })}
        </select>
      )}
      {isCap && wantsAny && (
        <div style={{ marginTop: 10, padding: "9px 13px", background: "#fff8e1", borderRadius: 8, fontSize: 13, color: NAVY, lineHeight: 1.55 }}>
          👒 Please can all men wear white on the day with their cap. Kindly add cap size in payment reference. Thank you
        </div>
      )}
    </div>
  );
}

function GroupBuildView(props) {
  // leadWants: false | "yes" | "yes_paid"
  const [leadWants, setLeadWants] = useState(false);
  const [leadItem,  setLeadItem]  = useState("");
  const [members,   setMembers]   = useState([{ id: 1, name: "", wantsAsoebi: false, asoItem: "" }]);
  const [payMethod, setPayMethod] = useState(null);

  const leadWantsAny  = leadWants === "yes" || leadWants === "yes_paid";
  const anyAsoebi     = leadWantsAny || members.some(function(m) { return m.wantsAsoebi === "yes" || m.wantsAsoebi === "yes_paid"; });
  const anyUnpaid     = leadWants === "yes" || members.some(function(m) { return m.wantsAsoebi === "yes"; });

  // Total only for unpaid items (paid ones are already settled)
  let total = 0;
  if (leadWants === "yes" && leadItem) total += ITEM_PRICE[leadItem] || 0;
  members.forEach(function(m) { if (m.wantsAsoebi === "yes" && m.asoItem) total += ITEM_PRICE[m.asoItem] || 0; });

  // Paid total (for display)
  let paidTotal = 0;
  if (leadWants === "yes_paid" && leadItem) paidTotal += ITEM_PRICE[leadItem] || 0;
  members.forEach(function(m) { if (m.wantsAsoebi === "yes_paid" && m.asoItem) paidTotal += ITEM_PRICE[m.asoItem] || 0; });

  const anyCap = (leadWantsAny && leadItem === "cap") || members.some(function(m) { return (m.wantsAsoebi === "yes" || m.wantsAsoebi === "yes_paid") && m.asoItem === "cap"; });

  const canConfirm = (
    members.every(function(m) { return m.name.trim().length > 0; }) &&
    (!leadWantsAny || leadItem) &&
    members.every(function(m) { return (m.wantsAsoebi === false) || m.asoItem; }) &&
    (!anyUnpaid || payMethod)
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
        if (field === "wantsAsoebi" && value === false) upd.asoItem = "";
        return Object.assign({}, m, upd);
      });
    });
  }

  function handleConfirm() {
    props.onConfirm(
      { wantsAsoebi: leadWants, item: leadWantsAny ? leadItem : null },
      members.map(function(m) { return { name: m.name.trim(), wantsAsoebi: m.wantsAsoebi, asoItem: (m.wantsAsoebi && m.wantsAsoebi !== false) ? m.asoItem : null }; }),
      payMethod || "none"
    );
  }

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={3} />
        <Card className="fade-up" style={{ maxWidth: 580 }}>
          <NavyBadge label="Group RSVP" />
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 400, color: NAVY, marginBottom: 7 }}>Your Party</h2>
            <p style={{ fontSize: 14, color: MUTED, fontWeight: 300 }}>Set asoebi choices for everyone in your party</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
            <PersonCard
              isLead name={props.leadName}
              wantsAsoebi={leadWants} asoItem={leadItem}
              onToggleAsoebi={function(v) { setLeadWants(v); if (v === false) setLeadItem(""); }}
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
            <button onClick={addMember} style={{ width: "100%", padding: "13px", border: "1.5px dashed " + NAVY + "33", borderRadius: 10, background: NAVY + "03", color: NAVY + "99", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Jost',sans-serif", marginBottom: 14, letterSpacing: "0.06em", transition: "all .2s" }}>
              + Add another person
            </button>
          )}

          {/* Summary: paid vs outstanding */}
          {(total > 0 || paidTotal > 0) && (
            <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
              {paidTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#10b981", padding: "11px 18px" }}>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>Already paid</span>
                  <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: "#fff" }}>£{paidTotal}</span>
                </div>
              )}
              {total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: NAVY, padding: "11px 18px" }}>
                  <span style={{ fontSize: 13, color: CREAM, fontWeight: 500 }}>Outstanding payment</span>
                  <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>£{total}</span>
                </div>
              )}
            </div>
          )}

          {anyUnpaid && (
            <>
              <Divider my={16} />
              <PaySection payMethod={payMethod} setPayMethod={setPayMethod} total={total} isCap={anyCap} />
            </>
          )}

          {props.errMsg && (
            <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "11px 15px", marginBottom: 14, fontSize: 14, color: "#991b1b" }}>
              {props.errMsg}
            </div>
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
    <div style={{ background: NAVY + "06", border: "0.5px solid " + NAVY + "18", borderRadius: 12, padding: "20px 22px", textAlign: "left" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: NAVY, fontWeight: 600, marginBottom: 8 }}>Would you like to give a gift?</div>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>
        If you would like to bless Mariam with a monetary gift, you can send it via the link below. Your generosity is so appreciated!
      </p>
      <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "10px 20px", fontFamily: "'Jost',sans-serif" }}>
        Send a Gift
      </a>
    </div>
  );
}

function DoneView(props) {
  const type = props.type;

  if (type === "group_done" && props.groupData) {
    const gd = props.groupData;
    const allPeople = [{ name: props.leadName, wantsAsoebi: gd.lead.wantsAsoebi, asoItem: gd.lead.item, isLead: true }]
      .concat(gd.members.map(function(m) { return { name: m.name, wantsAsoebi: m.wantsAsoebi, asoItem: m.asoItem }; }));
    const hasNoAsoebi = allPeople.some(function(p) { return !p.wantsAsoebi || p.wantsAsoebi === false; });
    let total = 0;
    allPeople.forEach(function(p) {
      if ((p.wantsAsoebi === "yes" || p.wantsAsoebi === true) && p.asoItem) total += ITEM_PRICE[p.asoItem] || 0;
    });

    return (
      <Page>
        <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card className="fade-up" style={{ textAlign: "center" }}>
            <NavyBadge label="Group Confirmed!" />
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
            <Ornament size={64} color={GOLD + "88"} />
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 400, color: NAVY, margin: "22px 0 10px" }}>Group Confirmed!</h2>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.8, fontWeight: 300, marginBottom: 26 }}>
              We cannot wait to see you!
            </p>

            <div style={{ background: NAVY, borderRadius: 12, padding: "18px 22px", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 14 }}>
                Your party &mdash; {allPeople.length} {allPeople.length === 1 ? "person" : "people"}
              </div>
              {allPeople.map(function(p, i) {
                const wantsAny = p.wantsAsoebi === "yes" || p.wantsAsoebi === "yes_paid" || p.wantsAsoebi === true;
                const isPaid   = p.wantsAsoebi === "yes_paid";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < allPeople.length - 1 ? "0.5px solid " + GOLD + "22" : "none" }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 500, color: CREAM }}>{p.name}</span>
                      {p.isLead && <span style={{ fontSize: 11, color: GOLD, marginLeft: 7, letterSpacing: "0.06em" }}>you</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: wantsAny ? (isPaid ? "#10b981" : GOLD) : MUTED }}>
                        {wantsAny && p.asoItem ? ITEM_LABEL[p.asoItem] + " — £" + ITEM_PRICE[p.asoItem] : "No asoebi"}
                      </div>
                      {isPaid && <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>✓ Paid</div>}
                    </div>
                  </div>
                );
              })}
              {total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: CREAM }}>Total</span>
                  <span style={{ fontSize: 22, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>£{total}</span>
                </div>
              )}
            </div>

            {hasNoAsoebi && (
              <div style={{ background: NAVY + "08", border: "0.5px solid " + NAVY + "18", borderRadius: 10, padding: "13px 17px", marginBottom: 16, textAlign: "left" }}>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, fontWeight: 300 }}>
                  Dress code for those without asoebi: <strong style={{ fontWeight: 700, color: NAVY }}>Navy Blue</strong> and <strong style={{ fontWeight: 700, color: GOLD }}>Gold</strong>
                </p>
              </div>
            )}

            {gd.payMethod === "later" && total > 0 && (
              <div style={{ background: NAVY + "06", border: "0.5px solid " + NAVY + "18", borderRadius: 12, padding: "18px 20px", marginBottom: 16, textAlign: "left" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: NAVY, fontWeight: 600, marginBottom: 12 }}>Bank Details</div>
                {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
                  return (
                    <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid " + NAVY + "12" }}>
                      <span style={{ fontSize: 13, color: MUTED }}>{row[0]}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{row[1]}</span>
                    </div>
                  );
                })}
                <p style={{ fontSize: 12, color: MUTED, marginTop: 10, lineHeight: 1.6 }}>Deadline: 15 May 2026. Use your name as reference.</p>
              </div>
            )}

            <GiftBox />
            <Divider my={26} />
            <p style={{ fontSize: 13, color: MUTED + "88", letterSpacing: "0.12em" }}>MARIAM @ 50 &middot; 08/08/2026</p>
          </Card>
        </div>
      </Page>
    );
  }

  const msgs = {
    default:            { emoji: "✨", title: "Thank You",         body: "Your response has been received. We look forward to celebrating with you!" },
    not_attending:      { emoji: "🌸", title: "Thank You",         body: "Thank you for your response. You will be missed!" },
    gift:               { emoji: "💛", title: "Thank You So Much", body: "Your generosity means the world. Thank you for your gift!" },
    asoebi_paid:        { emoji: "👗", title: "Wonderful!",        body: "Thank you! We cannot wait to see you in your beautiful attire." },
    asoebi_no:          { emoji: "💙", title: "See You There!",    body: null },
    asoebi_items_now:   { emoji: "⭐️", title: "You're Confirmed!", body: "Your selection is saved. Complete your payment and we cannot wait to see you!" },
    asoebi_items_later: { emoji: "⭐️", title: "You're Confirmed!", body: "Your selection is saved. Please send your bank transfer by 15 May 2026." },
  };
  const m = msgs[type] || msgs.default;
  const showGift = ATTENDING_TYPES.includes(type);

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card className="fade-up" style={{ textAlign: "center" }}>
          <NavyBadge label="Mariam @ 50 · 08/08/2026" />
          <div style={{ fontSize: 48, marginBottom: 20 }}>{m.emoji}</div>
          <Ornament size={64} color={GOLD + "88"} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 400, color: NAVY, margin: "22px 0 14px" }}>{m.title}</h2>

          {type === "asoebi_no" ? (
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.85, fontWeight: 300 }}>
              Thank you. We cannot wait to see you.<br />
              Dress code: <strong style={{ fontWeight: 700, color: NAVY }}>Navy Blue</strong> and <strong style={{ fontWeight: 700, color: GOLD }}>Gold</strong>
            </p>
          ) : (
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.85, fontWeight: 300 }}>{m.body}</p>
          )}

          {props.asoItem === "cap" && (type === "asoebi_items_now" || type === "asoebi_items_later") && (
            <div style={{ background: "#fff8e1", border: "0.5px solid #f59e0b88", borderRadius: 10, padding: "13px 17px", marginTop: 18, textAlign: "left", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18 }}>👒</span>
              <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.65, fontWeight: 300 }}>
                Reminder: cap buyers should <strong style={{ fontWeight: 600 }}>wear white</strong> on the day.
              </p>
            </div>
          )}

          {type === "asoebi_items_later" && (
            <div style={{ background: NAVY + "06", border: "0.5px solid " + NAVY + "18", borderRadius: 12, padding: "18px 20px", marginTop: 18, textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: NAVY, fontWeight: 600, marginBottom: 12 }}>Bank Details</div>
              {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account Number", ACCOUNT_NO]].map(function(row) {
                return (
                  <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid " + NAVY + "12" }}>
                    <span style={{ fontSize: 13, color: MUTED }}>{row[0]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{row[1]}</span>
                  </div>
                );
              })}
              <p style={{ fontSize: 12, color: MUTED, marginTop: 10, lineHeight: 1.6 }}>Deadline: 15 May 2026. Use your name as reference.</p>
            </div>
          )}

          {showGift && (
            <>
              <Divider my={26} />
              <GiftBox />
            </>
          )}

          <Divider my={26} />
          <p style={{ fontSize: 13, color: MUTED + "88", letterSpacing: "0.12em" }}>MARIAM @ 50 &middot; 08/08/2026</p>
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

  const [view,          setView]          = useState("home");
  const [doneType,      setDoneType]      = useState("default");
  const [doneGroupData, setDoneGroupData] = useState(null);
  const [asoItem,       setAsoItem]       = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [groupErr,      setGroupErr]      = useState("");
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");

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

  async function handleContribYes() {
    await save({ attending: false, contribution_choice: "yes" });
    window.open(MONZO_LINK, "_blank");
    setDoneType("gift"); setView("done");
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

  async function handleGroupConfirm(leadAso, groupMembers, payMethod) {
    setSaving(true);
    setGroupErr("");
    const guestId = generateUUID();
    try {
      await dbInsert({
        id:             guestId,
        full_name:      name,
        email:          email || null,
        attending:      true,
        asoebi_choice:  (leadAso.wantsAsoebi === "yes" || leadAso.wantsAsoebi === "yes_paid") ? "yes" : "no",
        asoebi_item:    (leadAso.wantsAsoebi && leadAso.wantsAsoebi !== false) ? leadAso.item : null,
        payment_status: leadAso.wantsAsoebi === "yes_paid" ? "paid" : leadAso.wantsAsoebi === "yes" ? "pending" : null,
      });
      await dbInsertMembers(guestId, groupMembers);
      setDoneGroupData({ lead: leadAso, members: groupMembers, payMethod: payMethod });
      setDoneType("group_done");
      setView("done");
    } catch (e) {
      console.error(e);
      setGroupErr("Something went wrong saving your RSVP. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (view === "home")           return <HomeView onStart={function() { setView("details"); }} />;
  if (view === "details")        return <DetailsView onNext={function(n, em) { setName(n); setEmail(em); setView("q1"); }} onBack={function() { setView("home"); }} />;
  if (view === "q1")             return <Q1View onYes={function() { setView("group_question"); }} onNo={function() { setView("contribution"); }} onBack={function() { setView("details"); }} />;
  if (view === "contribution")   return <ContributionView onYes={handleContribYes} onNo={handleContribNo} onBack={function() { setView("q1"); }} saving={saving} />;
  if (view === "group_question") return <GroupQuestionView onJustMe={function() { setView("q2"); }} onFamily={function() { setView("group_build"); }} onBack={function() { setView("q1"); }} />;
  if (view === "q2")             return <Q2View onYes={function() { setView("asoebi_items"); }} onYesPaid={handleQ2YesPaid} onNo={handleQ2No} onBack={function() { setView("group_question"); }} />;
  if (view === "asoebi_items")   return <AsoebItems onConfirm={handleAsoebItem} onBack={function() { setView("q2"); }} saving={saving} />;
  if (view === "group_build")    return <GroupBuildView leadName={name} onConfirm={handleGroupConfirm} onBack={function() { setView("group_question"); }} saving={saving} errMsg={groupErr} />;
  if (view === "done")           return <DoneView type={doneType} asoItem={asoItem} leadName={name} groupData={doneGroupData} />;
  return null;
}
