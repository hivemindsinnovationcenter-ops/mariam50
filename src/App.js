import { useState, useEffect } from "react";

// ============================================================
//  CONFIGURATION
// ============================================================
var SUPABASE_URL  = "https://inprrcgcabxedtotmviy.supabase.co";
var SUPABASE_ANON = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
var MONZO_LINK    = "https://monzo.me/oluwafunmibijohnaloba?h=fOv5jA&account_type=personal";
var BANK_NAME    = "Monzo Bank";
var ACCOUNT_NAME = "Oluwafunmibi Mary John-Aloba";
var SORT_CODE    = "04-00-03";
var ACCOUNT_NO   = "06775165";
var DEADLINE      = new Date("2026-05-15T23:59:59");
// ============================================================

// ── DB helpers ─────────────────────────────────────────────
async function dbInsertGuest(payload) {
  var r = await fetch(SUPABASE_URL + "/rest/v1/guests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  var d = await r.json();
  return d[0];
}

async function dbInsertMembers(arr) {
  if (!arr || !arr.length) return;
  var r = await fetch(SUPABASE_URL + "/rest/v1/group_members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(arr),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbCheckEmail(email) {
  var r = await fetch(
    SUPABASE_URL + "/rest/v1/guests?email=eq." + encodeURIComponent(email) + "&select=id",
    { headers: { "apikey": SUPABASE_ANON } }
  );
  if (!r.ok) return false;
  var d = await r.json();
  return d.length > 0;
}

// ── Design tokens ──────────────────────────────────────────
var NAVY  = "#0C1929";
var GOLD  = "#BF9645";
var GOLD2 = "#D4AF5A";
var CREAM = "#FDFBF5";
var CREAM2 = "#F4EFE2";
var MUTED = "#8A8070";

var ITEMS = [
  { key: "asoebi_gele", label: "Asoebi + Gele", price: 150 },
  { key: "gele",        label: "Gele",          price: 30  },
  { key: "asoebi",      label: "Asoebi",        price: 120 },
  { key: "cap",         label: "Cap",           price: 20  },
  { key: "none",        label: "No, thank you", price: 0   },
];

function injectStyles() {
  if (document.getElementById("m50-styles")) return;
  var link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
  var s = document.createElement("style");
  s.id = "m50-styles";
  s.textContent =
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}" +
    "html,body,#root{min-height:100vh}" +
    "body{background:" + CREAM + ";font-family:'Jost',sans-serif;color:" + NAVY + "}" +
    "@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
    ".fade-up{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}" +
    ".s1{animation-delay:.05s}.s2{animation-delay:.12s}.s3{animation-delay:.20s}" +
    ".s4{animation-delay:.28s}.s5{animation-delay:.36s}.s6{animation-delay:.44s}" +
    "input{font-family:'Jost',sans-serif}";
  document.head.appendChild(s);
}

// ── useCountdown ───────────────────────────────────────────
function useCountdown() {
  function calc() {
    var diff = DEADLINE - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000)  / 60000),
      secs:  Math.floor((diff % 60000)    / 1000),
      expired: false,
    };
  }
  var [time, setTime] = useState(calc);
  useEffect(function() {
    var t = setInterval(function() { setTime(calc()); }, 1000);
    return function() { clearInterval(t); };
  }, []);
  return time;
}

// ── Shared UI ──────────────────────────────────────────────
function Ornament(props) {
  var size  = props.size  || 32;
  var color = props.color || GOLD;
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
  var margin = props.my !== undefined ? props.my : 24;
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
      borderRadius: 16, padding: "40px 44px", width: "100%", maxWidth: 520,
      boxShadow: "0 4px 40px " + NAVY + "08,0 0 0 1px " + GOLD + "18",
    }, props.style || {})}>
      {props.children}
    </div>
  );
}

function Btn(props) {
  var [hov, setHov] = useState(false);
  var v = props.variant || "primary";
  var disabled = !!props.disabled;
  var base = {
    fontFamily: "'Jost',sans-serif", fontWeight: 500, fontSize: 13,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 32px",
    borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all .3s ease", display: "inline-block",
    width: props.full ? "100%" : "auto", opacity: disabled ? 0.55 : 1,
  };
  var variants = {
    primary: { background: hov ? GOLD2 : GOLD, color: "#fff", boxShadow: hov ? "0 6px 24px " + GOLD + "55" : "0 2px 12px " + GOLD + "30", transform: hov ? "translateY(-1px)" : "none" },
    outline: { background: "transparent", color: NAVY, border: "0.5px solid " + NAVY + "66", transform: hov && !disabled ? "translateY(-1px)" : "none" },
    ghost:   { background: hov ? CREAM2 : "transparent", color: MUTED, border: "0.5px solid " + MUTED + "44" },
    success: { background: hov ? "#059669" : "#10b981", color: "#fff", transform: hov ? "translateY(-1px)" : "none" },
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
  var [hov, setHov] = useState(false);
  var selected = !!props.selected;
  return (
    <div
      onClick={props.onClick}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={{
        padding: "18px 20px",
        border: (selected ? "1.5px" : "0.5px") + " solid " + (selected ? GOLD : hov ? GOLD + "88" : NAVY + "22"),
        borderRadius: 12, cursor: "pointer",
        background: selected ? GOLD + "0e" : hov ? GOLD + "05" : "#fff",
        transition: "all .25s ease", display: "flex", alignItems: "center", gap: 14,
      }}
    >
      {props.icon && <span style={{ fontSize: 18 }}>{props.icon}</span>}
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
    <div style={{ marginBottom: 16 }}>
      {props.label && (
        <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
          {props.label}{props.required && <span style={{ color: GOLD }}> *</span>}
        </label>
      )}
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
          <div key={i} style={{ width: i === props.step ? 20 : 6, height: 6, borderRadius: 3, background: i <= props.step ? GOLD : NAVY + "22", transition: "all .3s ease" }} />
        );
      })}
    </div>
  );
}

function EventHeader(props) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 10, fontWeight: 500 }}>
        08 · 08 · 2026
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 400, color: NAVY, lineHeight: 1.15 }}>
        Mariam <em style={{ fontStyle: "italic", color: GOLD }}>@ 50</em>
      </h1>
      {props.subtitle && <p style={{ fontSize: 13, color: MUTED, marginTop: 10, fontWeight: 300, lineHeight: 1.6 }}>{props.subtitle}</p>}
    </div>
  );
}

// ── TimeBox ────────────────────────────────────────────────
function TimeBox(props) {
  return (
    <div style={{ textAlign: "center", minWidth: 48 }}>
      <div style={{ fontSize: 28, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: NAVY, lineHeight: 1 }}>
        {String(props.value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginTop: 4 }}>
        {props.label}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  VIEWS
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
  var [name,     setName]     = useState("");
  var [email,    setEmail]    = useState("");
  var [checking, setChecking] = useState(false);
  var [dupErr,   setDupErr]   = useState("");

  var isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes("@");

  function handleContinue() {
    setDupErr(""); setChecking(true);
    dbCheckEmail(email.trim().toLowerCase())
      .then(function(exists) {
        if (exists) {
          setDupErr("It looks like you have already RSVP'd with this email. Please get in touch if you need to make a change.");
          setChecking(false);
          return;
        }
        props.onNext(name.trim(), email.trim().toLowerCase());
        setChecking(false);
      })
      .catch(function() {
        props.onNext(name.trim(), email.trim().toLowerCase());
        setChecking(false);
      });
  }

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={0} total={4} />
        <Card className="fade-up">
          <EventHeader subtitle="Let's start with the lead contact" />
          <Divider my={20} />
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
  var [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={1} total={4} />
        <Card className="fade-up">
          <EventHeader />
          <Divider my={20} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 24, fontWeight: 300 }}>
            Will you be joining us to celebrate<br />
            <strong style={{ fontWeight: 500 }}>Mariam @ 50</strong> on <strong style={{ fontWeight: 500 }}>08/08/2026</strong>?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <ChoiceCard label="Yes, I will be in attendance" icon="🎉" selected={choice === "yes"} onClick={function() { setChoice("yes"); }} />
            <ChoiceCard label="No, sorry I cannot make it" icon="🤍" selected={choice === "no"} onClick={function() { setChoice("no"); }} />
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
  var [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={4} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 10 }}>We Are So Sorry</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, fontWeight: 300 }}>We are so sorry you cannot make it.<br />Would you like to contribute?</p>
          </div>
          <Divider my={16} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <ChoiceCard label="Yes, I would like to contribute" icon="💛" selected={choice === "yes"} onClick={function() { setChoice("yes"); }} />
            <ChoiceCard label="No, thank you" icon="🤍" selected={choice === "no"} onClick={function() { setChoice("no"); }} />
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

// ── NEW: Group size question ───────────────────────────────
function GroupSizeView(props) {
  var [choice, setChoice] = useState(null);
  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={4} />
        <Card className="fade-up">
          <EventHeader subtitle="We want to make sure everyone is accounted for" />
          <Divider my={20} />
          <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.7, textAlign: "center", marginBottom: 24, fontWeight: 300 }}>
            Are you RSVPing for anyone else?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <ChoiceCard
              label="Just myself"
              sublabel="Only my RSVP"
              icon="🙋"
              selected={choice === "solo"}
              onClick={function() { setChoice("solo"); }}
            />
            <ChoiceCard
              label="Myself and family / guests"
              sublabel="I am RSVPing for a group"
              icon="👨‍👩‍👧‍👦"
              selected={choice === "group"}
              onClick={function() { setChoice("group"); }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn
              disabled={!choice}
              onClick={function() { choice === "solo" ? props.onSolo() : props.onGroup(); }}
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

// ── NEW: Add group members ─────────────────────────────────
function AddMembersView(props) {
  var [members, setMembers] = useState([""]);

  function addMember() {
    if (members.length < 9) setMembers(members.concat([""]));
  }

  function updateMember(i, val) {
    var updated = members.slice();
    updated[i] = val;
    setMembers(updated);
  }

  function removeMember(i) {
    setMembers(members.filter(function(_, idx) { return idx !== i; }));
  }

  var allFilled = members.every(function(m) { return m.trim().length > 0; });

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={2} total={4} />
        <Card className="fade-up">
          <EventHeader subtitle="Add the names of everyone in your group" />
          <Divider my={20} />

          {/* Lead person (read only) */}
          <div style={{ background: GOLD + "0a", border: "0.5px solid " + GOLD + "44", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 500, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{props.leadName}</div>
              <div style={{ fontSize: 11, color: MUTED }}>Lead contact (you)</div>
            </div>
          </div>

          {/* Additional members */}
          {members.map(function(m, i) {
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: NAVY + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: MUTED, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>
                  {i + 2}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={m}
                    onChange={function(e) { updateMember(i, e.target.value); }}
                    placeholder={"Guest " + (i + 2) + " full name"}
                    style={{ width: "100%", padding: "12px 14px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 14, background: "#fff", color: NAVY, outline: "none", fontFamily: "'Jost',sans-serif" }}
                    onFocus={function(e) { e.target.style.borderColor = GOLD; e.target.style.boxShadow = "0 0 0 3px " + GOLD + "15"; }}
                    onBlur={function(e)  { e.target.style.borderColor = NAVY + "33"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                {members.length > 1 && (
                  <button
                    onClick={function() { removeMember(i); }}
                    style={{ background: "none", border: "0.5px solid " + NAVY + "22", borderRadius: 6, cursor: "pointer", padding: "10px 10px", color: MUTED, fontSize: 14, marginTop: 2, flexShrink: 0 }}
                  >
                    x
                  </button>
                )}
              </div>
            );
          })}

          {members.length < 9 && (
            <button
              onClick={addMember}
              style={{ background: "none", border: "0.5px dashed " + GOLD + "88", borderRadius: 8, cursor: "pointer", padding: "10px 16px", color: GOLD, fontSize: 13, fontFamily: "'Jost',sans-serif", width: "100%", marginTop: 4, marginBottom: 8 }}
            >
              + Add another guest
            </button>
          )}

          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 20, marginTop: 8, fontWeight: 300 }}>
            Total group size: <strong style={{ color: NAVY, fontWeight: 500 }}>{members.length + 1} people</strong>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn
              disabled={!allFilled}
              onClick={function() {
                var filled = members.filter(function(m) { return m.trim(); }).map(function(m) { return m.trim(); });
                props.onNext(filled);
              }}
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

// ── NEW: Asoebi stepper (one person at a time) ─────────────
function AsoebStepperView(props) {
  var person    = props.people[props.currentIdx];
  var total     = props.people.length;
  var isLast    = props.currentIdx === total - 1;
  var isCap     = props.asoebis[props.currentIdx] === "cap";
  var selected  = props.asoebis[props.currentIdx];

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={3} total={4} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {/* Person indicator */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
              {props.people.map(function(_, i) {
                return (
                  <div key={i} style={{
                    width: i === props.currentIdx ? 20 : 8, height: 8, borderRadius: 4,
                    background: i < props.currentIdx ? GOLD : i === props.currentIdx ? NAVY : NAVY + "22",
                    transition: "all .3s",
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 6, fontWeight: 500 }}>
              {props.currentIdx + 1} of {total}
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 4 }}>
              {person.name}
            </h2>
            <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>
              Would {props.currentIdx === 0 ? "you" : person.name} like to buy asoebi, gele, or a cap?
            </p>
          </div>

          <Divider my={16} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {ITEMS.map(function(it) {
              return (
                <ChoiceCard
                  key={it.key}
                  label={it.label}
                  sublabel={it.price > 0 ? "£" + it.price : null}
                  selected={selected === it.key}
                  onClick={function() { props.onSelect(it.key); }}
                />
              );
            })}
          </div>

          {isCap && (
            <div style={{ background: "#fff8e1", border: "0.5px solid #f59e0b88", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>👒</span>
              <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, fontWeight: 300 }}>
                Cap buyers should <strong style={{ fontWeight: 600 }}>wear white</strong> on the day. Please add cap size in the payment reference.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!selected} onClick={props.onNext} style={{ flex: 2 }}>
              {isLast ? "Review Order" : "Next"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── NEW: Payment summary ───────────────────────────────────
function PaymentView(props) {
  var [payMethod, setPayMethod] = useState(null);
  var time = useCountdown();

  var orders = props.people.filter(function(p, i) {
    return props.asoebis[i] && props.asoebis[i] !== "none";
  });
  var itemPrices = { asoebi_gele: 150, gele: 30, asoebi: 120, cap: 20 };
  var itemNames  = { asoebi_gele: "Asoebi + Gele", gele: "Gele", asoebi: "Asoebi", cap: "Cap" };
  var total = 0;
  orders.forEach(function(p, _) {
    var idx = props.people.indexOf(p);
    total += itemPrices[props.asoebis[idx]] || 0;
  });

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Progress step={3} total={4} />
        <Card className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 6 }}>Order Summary</h2>
            <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>Please review before confirming</p>
          </div>

          {/* Order list */}
          <div style={{ background: CREAM2, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
            {props.people.map(function(p, i) {
              var item = props.asoebis[i];
              if (!item || item === "none") return null;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid " + GOLD + "22" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{itemNames[item]}</div>
                  </div>
                  <div style={{ fontSize: 15, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>
                    £{itemPrices[item]}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div>
              <div style={{ fontSize: 22, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: NAVY }}>£{total}</div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ background: CREAM2, border: "0.5px solid " + GOLD + "55", borderRadius: 12, padding: "16px 18px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, marginBottom: 12, fontWeight: 500 }}>
              Payment Deadline — 15 May 2026
            </div>
            {time.expired ? (
              <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>The payment deadline has passed</p>
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
          <div
            onClick={function() { setPayMethod("now"); }}
            style={{ border: (payMethod === "now" ? "1.5px" : "0.5px") + " solid " + (payMethod === "now" ? GOLD : NAVY + "22"), borderRadius: 12, padding: "16px 18px", marginBottom: 8, background: payMethod === "now" ? GOLD + "0e" : "#fff", cursor: "pointer", transition: "all .25s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "now" ? 12 : 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>Pay Now</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>via Monzo link</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (payMethod === "now" ? GOLD : NAVY + "33"), background: payMethod === "now" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {payMethod === "now" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
            {payMethod === "now" && (
              <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "10px 18px", fontFamily: "'Jost',sans-serif" }}>
                Open Monzo →
              </a>
            )}
          </div>

          {/* Pay Later */}
          <div
            onClick={function() { setPayMethod("later"); }}
            style={{ border: (payMethod === "later" ? "1.5px" : "0.5px") + " solid " + (payMethod === "later" ? GOLD : NAVY + "22"), borderRadius: 12, padding: "16px 18px", marginBottom: 8, background: payMethod === "later" ? GOLD + "0e" : "#fff", cursor: "pointer", transition: "all .25s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: payMethod === "later" ? 12 : 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>Pay Later</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>bank transfer — must be by 15 May</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (payMethod === "later" ? GOLD : NAVY + "33"), background: payMethod === "later" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {payMethod === "later" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
            {payMethod === "later" && (
              <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 8 }}>Bank Details</div>
                {[["Bank", BANK_NAME], ["Account Name", ACCOUNT_NAME], ["Sort Code", SORT_CODE], ["Account No", ACCOUNT_NO]].map(function(row) {
                  return (
                    <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid " + GOLD + "18" }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{row[0]}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: NAVY }}>{row[1]}</span>
                    </div>
                  );
                })}
                <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>Please use your name as the payment reference.</p>
              </div>
            )}
          </div>

          {/* Already paid */}
          <div
            onClick={function() { setPayMethod("paid"); }}
            style={{ border: (payMethod === "paid" ? "1.5px" : "0.5px") + " solid " + (payMethod === "paid" ? GOLD : NAVY + "22"), borderRadius: 12, padding: "16px 18px", marginBottom: 16, background: payMethod === "paid" ? GOLD + "0e" : "#fff", cursor: "pointer", transition: "all .25s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>I Have Already Paid</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>payment already sent</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (payMethod === "paid" ? GOLD : NAVY + "33"), background: payMethod === "paid" ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {payMethod === "paid" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" onClick={props.onBack} style={{ flex: 1 }}>Back</Btn>
            <Btn disabled={!payMethod || props.saving} onClick={function() { props.onConfirm(payMethod); }} style={{ flex: 2 }}>
              {props.saving ? "Saving..." : "Confirm"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function DoneView(props) {
  var type = props.type;
  var msgs = {
    not_attending:  { emoji: "🌸", title: "Thank You",          body: "Thank you for your response. You will be missed!" },
    contribute:     { emoji: "💛", title: "Thank You So Much",  body: "Your generosity means the world. Thank you for contributing!" },
    no_asoebi:      { emoji: "💙", title: "See You There!",     body: null },
    asoebi_now:     { emoji: "⭐️", title: "You're Confirmed!", body: "Your order is saved. Please complete your Monzo payment to secure your items." },
    asoebi_later:   { emoji: "⭐️", title: "You're Confirmed!", body: "Your order is saved. Please send your bank transfer by 15 May 2026." },
    asoebi_paid:    { emoji: "👗", title: "Wonderful!",         body: "Thank you! We cannot wait to see you all in your beautiful attire." },
  };
  var m = msgs[type] || { emoji: "✨", title: "Thank You", body: "Your response has been received. We look forward to celebrating with you!" };
  var showGift = ["no_asoebi","asoebi_now","asoebi_later","asoebi_paid"].includes(type);

  return (
    <Page>
      <div style={{ padding: "24px 16px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card className="fade-up" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 20 }}>{m.emoji}</div>
          <Ornament size={60} color={GOLD + "88"} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "20px 0 12px" }}>{m.title}</h2>

          {type === "no_asoebi" ? (
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300 }}>
              Thank you. We cannot wait to see you.<br />
              Dress code: <strong style={{ fontWeight: 700, color: NAVY }}>Navy Blue</strong> and <strong style={{ fontWeight: 700, color: GOLD }}>Gold</strong>
            </p>
          ) : (
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300 }}>{m.body}</p>
          )}

          {showGift && (
            <>
              <Divider my={24} />
              <div style={{ background: GOLD + "08", border: "0.5px solid " + GOLD + "44", borderRadius: 12, padding: "20px 22px", textAlign: "left" }}>
                <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 8 }}>
                  Would you like to give a gift?
                </div>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, fontWeight: 300, marginBottom: 12 }}>
                  If you would like to bless Mariam with a monetary gift, you can send it via Monzo. Your generosity is so appreciated!
                </p>
                <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 500, textDecoration: "none", border: "0.5px solid " + GOLD + "66", borderRadius: 4, padding: "10px 18px", fontFamily: "'Jost',sans-serif" }}>
                  Send a Gift via Monzo
                </a>
              </div>
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

  var [view,       setView]       = useState("home");
  var [doneType,   setDoneType]   = useState("default");
  var [saving,     setSaving]     = useState(false);
  var [name,       setName]       = useState("");
  var [email,      setEmail]      = useState("");
  var [people,     setPeople]     = useState([]);
  var [asoebis,    setAsoebis]    = useState([]);
  var [currentIdx, setCurrentIdx] = useState(0);

  function buildPeople(leadName, extras) {
    var all = [{ name: leadName }].concat(extras.map(function(n) { return { name: n }; }));
    setPeople(all);
    setAsoebis(all.map(function() { return null; }));
    setCurrentIdx(0);
  }

  function handleAsoebSelect(item) {
    var updated = asoebis.slice();
    updated[currentIdx] = item;
    setAsoebis(updated);
  }

  function handleAsoebNext() {
    if (currentIdx < people.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      var anyAsoebi = asoebis.some(function(a) { return a && a !== "none"; });
      if (anyAsoebi) {
        setView("payment");
      } else {
        handleSaveNoAsoebi();
      }
    }
  }

  function handleAsoebBack() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else {
      setView(people.length > 1 ? "add_members" : "group_size");
    }
  }

  async function handleSaveNoAsoebi() {
    setSaving(true);
    try {
      var guest = await dbInsertGuest({
        full_name: name, email: email || null,
        attending: true, asoebi_choice: "no",
      });
      var members = people.map(function(p) {
        return { guest_id: guest.id, full_name: p.name, asoebi_choice: "no", asoebi_item: null, payment_status: null };
      });
      await dbInsertMembers(members);
      setDoneType("no_asoebi");
      setView("done");
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handlePaymentConfirm(payMethod) {
    setSaving(true);
    try {
      var isPaid = payMethod === "paid";
      var anyAsoebi = asoebis.some(function(a) { return a && a !== "none"; });
      var guest = await dbInsertGuest({
        full_name: name, email: email || null,
        attending: true,
        asoebi_choice: anyAsoebi ? "yes" : "no",
        payment_status: anyAsoebi ? (isPaid ? "paid" : "pending") : null,
      });
      var members = people.map(function(p, i) {
        var item = asoebis[i];
        var hasItem = item && item !== "none";
        return {
          guest_id: guest.id,
          full_name: p.name,
          asoebi_choice: hasItem ? "yes" : "no",
          asoebi_item: hasItem ? item : null,
          payment_status: hasItem ? (isPaid ? "paid" : "pending") : null,
        };
      });
      await dbInsertMembers(members);
      if (isPaid)           setDoneType("asoebi_paid");
      else if (payMethod === "now")   setDoneType("asoebi_now");
      else                  setDoneType("asoebi_later");
      setView("done");
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleContribYes() {
    setSaving(true);
    try {
      await dbInsertGuest({ full_name: name, email: email || null, attending: false, contribution_choice: "yes" });
      window.open(MONZO_LINK, "_blank");
      setDoneType("contribute"); setView("done");
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleContribNo() {
    setSaving(true);
    try {
      await dbInsertGuest({ full_name: name, email: email || null, attending: false, contribution_choice: "no" });
      setDoneType("not_attending"); setView("done");
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }

  if (view === "home") return <HomeView onStart={function() { setView("details"); }} />;

  if (view === "details") return (
    <DetailsView
      onNext={function(n, em) { setName(n); setEmail(em); setView("q1"); }}
      onBack={function() { setView("home"); }}
    />
  );

  if (view === "q1") return (
    <Q1View
      onYes={function() { setView("group_size"); }}
      onNo={function() { setView("contribution"); }}
      onBack={function() { setView("details"); }}
    />
  );

  if (view === "contribution") return (
    <ContributionView
      onYes={handleContribYes} onNo={handleContribNo}
      onBack={function() { setView("q1"); }} saving={saving}
    />
  );

  if (view === "group_size") return (
    <GroupSizeView
      onSolo={function() { buildPeople(name, []); setView("asoebi_stepper"); }}
      onGroup={function() { setView("add_members"); }}
      onBack={function() { setView("q1"); }}
    />
  );

  if (view === "add_members") return (
    <AddMembersView
      leadName={name}
      onNext={function(extras) { buildPeople(name, extras); setView("asoebi_stepper"); }}
      onBack={function() { setView("group_size"); }}
    />
  );

  if (view === "asoebi_stepper") return (
    <AsoebStepperView
      people={people}
      asoebis={asoebis}
      currentIdx={currentIdx}
      onSelect={handleAsoebSelect}
      onNext={handleAsoebNext}
      onBack={handleAsoebBack}
    />
  );

  if (view === "payment") return (
    <PaymentView
      people={people}
      asoebis={asoebis}
      onConfirm={handlePaymentConfirm}
      onBack={function() { setCurrentIdx(people.length - 1); setView("asoebi_stepper"); }}
      saving={saving}
    />
  );

  if (view === "done") return <DoneView type={doneType} />;

  return null;
}
