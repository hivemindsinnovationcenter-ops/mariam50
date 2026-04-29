import { useState, useEffect, useCallback } from "react";

// ============================================================
//  CONFIGURATION
// ============================================================
const SUPABASE_URL  = "https://inprrcgcabxedtotmviy.supabase.co";
const SUPABASE_ANON = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
// ============================================================

async function dbFetch(tok) {
  const r = await fetch(
    SUPABASE_URL + "/rest/v1/guests?select=*,group_members(*)&order=created_at.desc",
    { headers: { "apikey": SUPABASE_ANON, "Authorization": "Bearer " + tok } }
  );
  if (!r.ok) throw new Error("Unauthorized -- check credentials");
  return r.json();
}

async function dbPatch(id, payload, tok) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/guests?id=eq." + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON, "Authorization": "Bearer " + tok, "Prefer": "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbDelete(id, tok) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/guests?id=eq." + id, {
    method: "DELETE",
    headers: { "apikey": SUPABASE_ANON, "Authorization": "Bearer " + tok },
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbPatchMember(id, payload, tok) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/group_members?id=eq." + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON, "Authorization": "Bearer " + tok, "Prefer": "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbDeleteMember(id, tok) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/group_members?id=eq." + id, {
    method: "DELETE",
    headers: { "apikey": SUPABASE_ANON, "Authorization": "Bearer " + tok },
  });
  if (!r.ok) throw new Error(await r.text());
}

async function authLogin(email, pw) {
  const r = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON },
    body: JSON.stringify({ email: email, password: pw }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || "Login failed");
  return d;
}

const NAVY  = "#0C1929";
const GOLD  = "#BF9645";
const GOLD2 = "#D4AF5A";
const CREAM = "#FDFBF5";
const CREAM2 = "#F4EFE2";
const MUTED = "#8A8070";

function injectStyles() {
  if (document.getElementById("m50-admin-styles")) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "m50-admin-styles";
  s.textContent =
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}" +
    "html,body,#root{min-height:100vh}" +
    "body{background:" + CREAM2 + ";font-family:'Jost',sans-serif;color:" + NAVY + "}" +
    "@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}" +
    "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}" +
    "@keyframes spin{to{transform:translateY(-50%) rotate(360deg)}}" +
    "@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}" +
    ".fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}" +
    ".pulsing{animation:pulse 1.4s ease infinite}" +
    "input,select{font-family:'Jost',sans-serif}";
  document.head.appendChild(s);
}

// ── Shared components ──────────────────────────────────────

function Btn(props) {
  const [hov, setHov] = useState(false);
  const v = props.variant || "primary";
  const disabled = !!props.disabled;
  const base = {
    fontFamily: "'Jost',sans-serif", fontWeight: 500, fontSize: 12,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "11px 24px",
    borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all .25s", display: "inline-block",
    width: props.full ? "100%" : "auto", opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: hov ? GOLD2 : GOLD,   color: "#fff", boxShadow: hov ? "0 4px 20px " + GOLD + "55" : "0 2px 10px " + GOLD + "30" },
    navy:    { background: hov ? "#1a3050" : NAVY, color: "#fff", boxShadow: hov ? "0 4px 20px " + NAVY + "44" : "0 2px 10px " + NAVY + "22" },
    outline: { background: "transparent", color: NAVY, border: "0.5px solid " + NAVY + "55" },
    ghost:   { background: hov ? MUTED + "15" : "transparent", color: MUTED, border: "0.5px solid " + MUTED + "33" },
    danger:  { background: hov ? "#b91c1c" : "#dc2626", color: "#fff", boxShadow: hov ? "0 4px 20px #dc262655" : "none" },
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

function InputField(props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 7 }}>
        {props.label}
      </label>
      <input
        type={props.type || "text"} value={props.value}
        onChange={function(e) { props.onChange(e.target.value); }}
        placeholder={props.placeholder}
        style={{ width: "100%", padding: "12px 14px", border: "0.5px solid " + NAVY + "33", borderRadius: 8, fontSize: 14, background: "#fff", color: NAVY, outline: "none" }}
        onFocus={function(e) { e.target.style.borderColor = GOLD; e.target.style.boxShadow = "0 0 0 3px " + GOLD + "15"; }}
        onBlur={function(e)  { e.target.style.borderColor = NAVY + "33"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Badge(props) {
  const colors = {
    green:  { bg: "#d1fae5", text: "#065f46" },
    red:    { bg: "#fee2e2", text: "#991b1b" },
    gold:   { bg: GOLD + "22",  text: "#92400e" },
    blue:   { bg: "#dbeafe", text: "#1e40af" },
    purple: { bg: "#ede9fe", text: "#5b21b6" },
    teal:   { bg: "#ccfbf1", text: "#134e4a" },
    amber:  { bg: "#fef3c7", text: "#92400e" },
    gray:   { bg: "#f3f4f6", text: MUTED },
    navy:   { bg: NAVY + "15",  text: NAVY },
  };
  const c = colors[props.color] || colors.gray;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: c.bg, color: c.text, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {props.label}
    </span>
  );
}

function StatCard(props) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, padding: "20px 22px", borderTop: "3px solid " + props.accent }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>{props.label}</div>
      <div style={{ fontSize: 30, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: props.accent || NAVY }}>{props.value}</div>
    </div>
  );
}

// ── Payment status dropdown ────────────────────────────────

const PAY_OPTIONS = [
  { value: "pending", label: "Pending", bg: "#fef3c7", color: "#92400e" },
  { value: "paid",    label: "Paid",    bg: "#d1fae5", color: "#065f46" },
];

function PayStatusDropdown(props) {
  const current = PAY_OPTIONS.find(function(o) { return o.value === props.value; });
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={props.value || ""}
        onChange={function(e) { props.onChange(e.target.value); }}
        disabled={!!props.loading}
        style={{
          appearance: "none", WebkitAppearance: "none",
          padding: "4px 28px 4px 10px", fontSize: 11, fontWeight: 500,
          borderRadius: 20, border: "1px solid " + (current ? current.color + "55" : "#e5e7eb"),
          background: current ? current.bg : "#f3f4f6",
          color: current ? current.color : MUTED,
          cursor: props.loading ? "not-allowed" : "pointer",
          outline: "none", transition: "all .2s", opacity: props.loading ? 0.6 : 1,
        }}
      >
        <option value="">-- unset --</option>
        {PAY_OPTIONS.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
      </select>
      <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 9, color: current ? current.color : MUTED }}>
        {props.loading ? "" : "v"}
      </div>
      {props.loading && (
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", border: "1.5px solid " + GOLD, borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />
      )}
    </div>
  );
}

// ── Trash button ───────────────────────────────────────────

function TrashBtn(props) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={props.onClick}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      title="Delete"
      style={{ background: hov ? "#fee2e2" : "transparent", border: "0.5px solid " + (hov ? "#fca5a5" : NAVY + "18"), borderRadius: 6, cursor: "pointer", padding: "5px 7px", transition: "all .2s", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={hov ? "#dc2626" : MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}

// ── Delete modal ───────────────────────────────────────────

function DeleteModal(props) {
  if (!props.target) return null;
  const isMember = props.target._isMember;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(12,25,41,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "44", borderRadius: 16, padding: "36px 40px", maxWidth: 420, width: "100%", boxShadow: "0 8px 60px " + NAVY + "44", animation: "modalIn .25s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 400, color: NAVY, marginBottom: 8 }}>
            {isMember ? "Remove Group Member?" : "Delete Entry?"}
          </h2>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, fontWeight: 300 }}>
            {isMember ? "You are about to remove" : "You are about to permanently delete the RSVP for"}
          </p>
          <div style={{ fontWeight: 600, color: NAVY, fontSize: 15, marginTop: 6 }}>{props.target.full_name}</div>
          {!isMember && props.target.email && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{props.target.email}</div>}
          {!isMember && props.target.group_members && props.target.group_members.length > 0 && (
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 8, padding: "6px 12px", background: "#fef2f2", borderRadius: 6 }}>
              This will also delete {props.target.group_members.length} group {props.target.group_members.length === 1 ? "member" : "members"}.
            </div>
          )}
          <p style={{ fontSize: 12, color: "#dc2626", marginTop: 10, fontWeight: 300 }}>This cannot be undone.</p>
        </div>
        {props.err && (
          <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>{props.err}</div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" onClick={props.onCancel} style={{ flex: 1 }} disabled={props.deleting}>Cancel</Btn>
          <Btn variant="danger" onClick={props.onConfirm} style={{ flex: 1 }} disabled={props.deleting}>
            {props.deleting ? "Deleting..." : "Delete"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════

function LoginView(props) {
  const [email, setEmail] = useState("");
  const [pw,    setPw]    = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  function handle() {
    setErr(""); setLoading(true);
    authLogin(email, pw)
      .then(function(d) { props.onLogin(d.access_token); })
      .catch(function(e) { setErr(e.message); setLoading(false); });
  }

  return (
    <div style={{ minHeight: "100vh", background: NAVY, backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%," + GOLD + "18 0%,transparent 60%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="fade-up" style={{ background: "#fff", border: "0.5px solid " + GOLD + "55", borderRadius: 16, padding: "48px 44px", width: "100%", maxWidth: 420, boxShadow: "0 8px 60px " + NAVY + "44" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: GOLD + "15", border: "0.5px solid " + GOLD + "55", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 6, fontWeight: 500 }}>Admin Portal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: NAVY }}>
            Mariam <em style={{ color: GOLD }}>@ 50</em>
          </h1>
        </div>
        <InputField label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@example.com" />
        <InputField label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••" />
        {err && <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>{err}</div>}
        <Btn full variant="navy" onClick={handle} disabled={!email || !pw || loading} style={{ marginTop: 4, fontSize: 12, padding: "14px" }}>
          {loading ? "Signing in..." : "Sign In"}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════

function Dashboard(props) {
  const token = props.token;

  const [guests,       setGuests]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [err,          setErr]          = useState("");
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [tab,          setTab]          = useState("guests");
  const [updating,     setUpdating]     = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteErr,    setDeleteErr]    = useState("");
  const [deleting,     setDeleting]     = useState(false);

  const load = useCallback(function() {
    setLoading(true); setErr("");
    dbFetch(token)
      .then(function(d) { setGuests(d); })
      .catch(function(e) { setErr(e.message); })
      .finally(function() { setLoading(false); });
  }, [token]);

  useEffect(function() { load(); }, [load]);

  function toggleExpand(id) {
    setExpandedRows(function(prev) {
      const next = Object.assign({}, prev);
      next[id] = !prev[id];
      return next;
    });
  }

  // ── Payment updates ──────────────────────────────────────
  function updateGuestPayment(id, status) {
    setUpdating(id);
    dbPatch(id, { payment_status: status }, token)
      .then(function() {
        setGuests(function(prev) {
          return prev.map(function(g) { return g.id === id ? Object.assign({}, g, { payment_status: status }) : g; });
        });
      })
      .catch(function(e) { setErr("Failed to update: " + e.message); })
      .finally(function() { setUpdating(null); });
  }

  function updateMemberPayment(guestId, memberId, status) {
    setUpdating(memberId);
    dbPatchMember(memberId, { payment_status: status }, token)
      .then(function() {
        setGuests(function(prev) {
          return prev.map(function(g) {
            if (g.id !== guestId) return g;
            return Object.assign({}, g, {
              group_members: (g.group_members || []).map(function(m) {
                return m.id === memberId ? Object.assign({}, m, { payment_status: status }) : m;
              }),
            });
          });
        });
      })
      .catch(function(e) { setErr("Failed to update: " + e.message); })
      .finally(function() { setUpdating(null); });
  }

  // ── Delete ────────────────────────────────────────────────
  function handleDeleteClick(item, isMember) {
    setDeleteTarget(Object.assign({}, item, { _isMember: !!isMember }));
    setDeleteErr("");
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteErr("");
    const fn = deleteTarget._isMember ? dbDeleteMember : dbDelete;
    fn(deleteTarget.id, token)
      .then(function() {
        if (deleteTarget._isMember) {
          setGuests(function(prev) {
            return prev.map(function(g) {
              return Object.assign({}, g, {
                group_members: (g.group_members || []).filter(function(m) { return m.id !== deleteTarget.id; }),
              });
            });
          });
        } else {
          setGuests(function(prev) { return prev.filter(function(g) { return g.id !== deleteTarget.id; }); });
        }
        setDeleteTarget(null);
      })
      .catch(function(e) { setDeleteErr(e.message); })
      .finally(function() { setDeleting(false); });
  }

  // ── Derived data ─────────────────────────────────────────
  const totalPeople = guests.reduce(function(s, g) { return s + 1 + (g.group_members || []).length; }, 0);
  const attending   = guests.filter(function(g) { return g.attending === true; });
  const notAttend   = guests.filter(function(g) { return g.attending === false; });
  const contributed = guests.filter(function(g) { return g.contribution_choice === "yes"; });

  // All asoebi orders (lead + members combined)
  const allAsoOrders = [];
  guests.forEach(function(g) {
    if (g.asoebi_choice === "yes" || g.asoebi_choice === "yes_paid") {
      allAsoOrders.push(Object.assign({}, g, { _type: "lead" }));
    }
    (g.group_members || []).forEach(function(m) {
      if (m.asoebi_choice === "yes") {
        allAsoOrders.push(Object.assign({}, m, { _type: "member", _leadEmail: g.email, _guestId: g.id }));
      }
    });
  });

  const paidCount    = allAsoOrders.filter(function(x) { return x.payment_status === "paid"; }).length;
  const pendingCount = allAsoOrders.filter(function(x) { return x.payment_status === "pending"; }).length;

  // Filtered guest list
  const filtered = guests.filter(function(g) {
    const q = search.toLowerCase();
    const nameMatch  = g.full_name && g.full_name.toLowerCase().includes(q);
    const emailMatch = g.email && g.email.toLowerCase().includes(q);
    const memberMatch = (g.group_members || []).some(function(m) { return m.full_name && m.full_name.toLowerCase().includes(q); });
    const matchSearch = !q || nameMatch || emailMatch || memberMatch;
    if (!matchSearch) return false;
    if (filter === "attending")     return g.attending === true;
    if (filter === "not_attending") return g.attending === false;
    if (filter === "asoebi")        return g.asoebi_choice === "yes" || g.asoebi_choice === "yes_paid" || (g.group_members || []).some(function(m) { return m.asoebi_choice === "yes"; });
    if (filter === "paid")          return g.payment_status === "paid" || (g.group_members || []).some(function(m) { return m.payment_status === "paid"; });
    if (filter === "pending")       return g.payment_status === "pending" || (g.group_members || []).some(function(m) { return m.payment_status === "pending"; });
    if (filter === "contributed")   return g.contribution_choice === "yes";
    if (filter === "groups")        return (g.group_members || []).length > 0;
    return true;
  });

  function exportCSV() {
    const rows = ["Full Name,Email,Type,Lead Name,Attending,Asoebi Choice,Item,Payment Status,Date"];
    guests.forEach(function(g) {
      const date = g.created_at ? new Date(g.created_at).toLocaleDateString("en-GB") : "";
      rows.push(['"' + (g.full_name || "") + '"', '"' + (g.email || "") + '"', "Lead", "", g.attending === true ? "Yes" : g.attending === false ? "No" : "", g.asoebi_choice || "", g.asoebi_item || "", g.payment_status || "", date].join(","));
      (g.group_members || []).forEach(function(m) {
        const mdate = m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB") : "";
        rows.push(['"' + (m.full_name || "") + '"', '"' + (g.email || "") + '"', "Group Member", '"' + (g.full_name || "") + '"', "Yes", m.asoebi_choice || "", m.asoebi_item || "", m.payment_status || "", mdate].join(","));
      });
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = "mariam50_all_guests.csv";
    a.click();
  }

  const itemLabel = { asoebi_gele: "Asoebi + Gele", gele: "Gele", asoebi: "Asoebi", cap: "Cap" };
  function attendingColor(v) { return v === true ? "green" : v === false ? "red" : "gray"; }
  function attendingLabel(v) { return v === true ? "Yes" : v === false ? "No" : "--"; }
  function asoColor(v) { return v === "yes_paid" ? "blue" : v === "yes" ? "gold" : "gray"; }
  function asoLabel(v) { return v === "yes_paid" ? "Paid" : v === "yes" ? "Pending" : v === "no" ? "No" : "--"; }

  const thStyle = { padding: "11px 16px", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, fontWeight: 500, borderBottom: "0.5px solid " + GOLD + "22", whiteSpace: "nowrap" };
  function tdStyle(extra) { return Object.assign({ padding: "12px 16px", borderBottom: "0.5px solid " + GOLD + "15" }, extra || {}); }

  return (
    <div style={{ minHeight: "100vh", background: CREAM2 }}>

      <DeleteModal
        target={deleteTarget}
        deleting={deleting}
        err={deleteErr}
        onConfirm={handleDeleteConfirm}
        onCancel={function() { setDeleteTarget(null); setDeleteErr(""); }}
      />

      {/* Header */}
      <div style={{ background: NAVY, padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#fff" }}>
              Mariam <em style={{ color: GOLD }}>@ 50</em>
            </h1>
            <div style={{ width: "0.5px", height: 20, background: GOLD + "44" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD + "bb" }}>Admin Dashboard</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={load} style={{ color: "#fff", borderColor: "#fff3", fontSize: 11, padding: "8px 16px" }}>Refresh</Btn>
            <Btn onClick={exportCSV} style={{ fontSize: 11, padding: "8px 16px" }}>Export CSV</Btn>
            <Btn variant="ghost" onClick={props.onLogout} style={{ color: GOLD + "cc", borderColor: GOLD + "33", fontSize: 11, padding: "8px 16px" }}>Logout</Btn>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {[["guests","All Guests"],["asoebi","Asoebi Orders"],["contributions","Contributions"]].map(function(item) {
            return (
              <button key={item[0]} onClick={function() { setTab(item[0]); }} style={{
                fontFamily: "'Jost',sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "12px 20px", border: "none", cursor: "pointer", background: "transparent",
                color: tab === item[0] ? "#fff" : GOLD + "88",
                borderBottom: tab === item[0] ? "2px solid " + GOLD : "2px solid transparent",
                transition: "all .2s", fontWeight: tab === item[0] ? 500 : 400,
              }}>{item[1]}</button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {err && (
          <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#991b1b" }}>
            {err}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard label="Submissions"    value={guests.length}    accent={NAVY} />
          <StatCard label="Total People"   value={totalPeople}      accent="#6366f1" />
          <StatCard label="Attending"      value={attending.length} accent="#10b981" />
          <StatCard label="Not Attending"  value={notAttend.length} accent="#ef4444" />
          <StatCard label="Contributions"  value={contributed.length} accent={GOLD} />
          <StatCard label="Asoebi Orders"  value={allAsoOrders.length} accent="#8b5cf6" />
          <StatCard label="Paid"           value={paidCount}        accent="#0891b2" />
          <StatCard label="Pending"        value={pendingCount}     accent="#f59e0b" />
        </div>

        {/* ── ALL GUESTS TAB ── */}
        {tab === "guests" && (
          <>
            {/* Filters */}
            <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, padding: "16px 20px", marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[["all","All"],["attending","Attending"],["not_attending","Not Attending"],["asoebi","Asoebi"],["paid","Paid"],["pending","Pending"],["contributed","Contributed"],["groups","Groups"]].map(function(f) {
                  return (
                    <button key={f[0]} onClick={function() { setFilter(f[0]); }} style={{
                      padding: "6px 14px", fontSize: 11, borderRadius: 20, cursor: "pointer",
                      border: "0.5px solid " + (filter === f[0] ? GOLD : NAVY + "18"),
                      background: filter === f[0] ? GOLD + "15" : "transparent",
                      color: filter === f[0] ? GOLD : MUTED,
                      fontWeight: filter === f[0] ? 500 : 400,
                      transition: "all .2s", fontFamily: "'Jost',sans-serif",
                    }}>{f[1]}</button>
                  );
                })}
              </div>
              <input value={search} onChange={function(e) { setSearch(e.target.value); }}
                placeholder="Search by name, email or member..."
                style={{ marginLeft: "auto", padding: "8px 14px", fontSize: 13, border: "0.5px solid " + NAVY + "22", borderRadius: 8, color: NAVY, minWidth: 240, outline: "none", background: "#fff" }}
              />
            </div>

            {/* Table */}
            <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "0.5px solid " + GOLD + "22" }}>
                <span style={{ fontSize: 13, color: MUTED }}>{filtered.length} {filtered.length === 1 ? "submission" : "submissions"}</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 12 }}>
                  ({filtered.reduce(function(s, g) { return s + 1 + (g.group_members || []).length; }, 0)} total people)
                </span>
              </div>
              {loading ? (
                <div className="pulsing" style={{ padding: 60, textAlign: "center", fontSize: 13, color: MUTED }}>Loading guests...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", fontSize: 13, color: MUTED }}>No guests found</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: CREAM2 }}>
                        {["","Name","Email","Attending","Asoebi","Item","Payment","Date",""].map(function(h, i) {
                          return <th key={i} style={thStyle}>{h}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.reduce(function(rows, g, i) {
                        const members = g.group_members || [];
                        const isExpanded = expandedRows[g.id];
                        const hasGroup = members.length > 0;

                        // Lead row
                        rows.push(
                          <tr key={g.id} style={{ background: i % 2 === 0 ? "#fff" : CREAM + "66" }}>
                            <td style={tdStyle({ width: 36 })}>
                              {hasGroup && (
                                <button onClick={function() { toggleExpand(g.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, color: GOLD, fontWeight: 500, fontSize: 11 }}>
                                  {isExpanded ? "▲" : "▼"}
                                </button>
                              )}
                            </td>
                            <td style={tdStyle({ fontWeight: 500, color: NAVY })}>
                              {g.full_name}
                              {hasGroup && (
                                <span style={{ marginLeft: 8, fontSize: 10, background: NAVY + "12", color: NAVY, padding: "2px 7px", borderRadius: 10, fontWeight: 500 }}>
                                  party of {members.length + 1}
                                </span>
                              )}
                            </td>
                            <td style={tdStyle({ color: MUTED })}>{g.email || "--"}</td>
                            <td style={tdStyle()}><Badge label={attendingLabel(g.attending)} color={attendingColor(g.attending)} /></td>
                            <td style={tdStyle()}>
                              {g.asoebi_choice ? <Badge label={asoLabel(g.asoebi_choice)} color={asoColor(g.asoebi_choice)} /> : "--"}
                            </td>
                            <td style={tdStyle({ color: MUTED })}>{itemLabel[g.asoebi_item] || "--"}</td>
                            <td style={tdStyle()}>
                              <PayStatusDropdown value={g.payment_status} loading={updating === g.id} onChange={function(s) { updateGuestPayment(g.id, s); }} />
                            </td>
                            <td style={tdStyle({ color: MUTED, fontSize: 12, whiteSpace: "nowrap" })}>
                              {g.created_at ? new Date(g.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "--"}
                            </td>
                            <td style={tdStyle({ textAlign: "right" })}>
                              <TrashBtn onClick={function() { handleDeleteClick(g, false); }} />
                            </td>
                          </tr>
                        );

                        // Member rows (shown when expanded)
                        if (isExpanded && hasGroup) {
                          members.forEach(function(m) {
                            rows.push(
                              <tr key={m.id} style={{ background: "#f0fdf8" }}>
                                <td style={tdStyle({ borderLeft: "3px solid " + GOLD + "44" })}></td>
                                <td style={tdStyle({ color: NAVY })}>
                                  <span style={{ color: GOLD, marginRight: 6, fontSize: 12 }}>↳</span>
                                  {m.full_name}
                                  <span style={{ marginLeft: 6, fontSize: 10, color: MUTED }}>(group member)</span>
                                </td>
                                <td style={tdStyle({ color: MUTED, fontSize: 12 })}>{g.email || "--"}</td>
                                <td style={tdStyle()}><Badge label="Yes" color="green" /></td>
                                <td style={tdStyle()}>
                                  {m.asoebi_choice ? <Badge label={asoLabel(m.asoebi_choice)} color={asoColor(m.asoebi_choice)} /> : "--"}
                                </td>
                                <td style={tdStyle({ color: MUTED })}>{itemLabel[m.asoebi_item] || "--"}</td>
                                <td style={tdStyle()}>
                                  <PayStatusDropdown value={m.payment_status} loading={updating === m.id} onChange={function(s) { updateMemberPayment(g.id, m.id, s); }} />
                                </td>
                                <td style={tdStyle({ color: MUTED, fontSize: 12 })}>
                                  {m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "--"}
                                </td>
                                <td style={tdStyle({ textAlign: "right" })}>
                                  <TrashBtn onClick={function() { handleDeleteClick(m, true); }} />
                                </td>
                              </tr>
                            );
                          });
                        }

                        return rows;
                      }, [])}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── ASOEBI ORDERS TAB ── */}
        {tab === "asoebi" && (
          <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "0.5px solid " + GOLD + "22" }}>
              <span style={{ fontSize: 13, color: MUTED }}>{allAsoOrders.length} total orders</span>
            </div>
            {allAsoOrders.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", fontSize: 13, color: MUTED }}>No asoebi orders yet</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: CREAM2 }}>
                      {["Name","Email","Type","Item","Amount","Payment Status","Date"].map(function(h) {
                        return <th key={h} style={thStyle}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {allAsoOrders.map(function(x, i) {
                      const prices = { asoebi_gele: "£150", gele: "£30", asoebi: "£120", cap: "£20" };
                      return (
                        <tr key={x.id} style={{ background: i % 2 === 0 ? "#fff" : CREAM + "66" }}>
                          <td style={tdStyle({ fontWeight: 500, color: NAVY })}>{x.full_name}</td>
                          <td style={tdStyle({ color: MUTED })}>{x._leadEmail || x.email || "--"}</td>
                          <td style={tdStyle()}>
                            <Badge label={x._type === "member" ? "Group member" : "Lead"} color={x._type === "member" ? "teal" : "navy"} />
                          </td>
                          <td style={tdStyle()}>
                            {x.asoebi_item ? <Badge label={itemLabel[x.asoebi_item]} color="gold" /> : "--"}
                          </td>
                          <td style={tdStyle({ color: GOLD, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 500 })}>
                            {prices[x.asoebi_item] || "--"}
                          </td>
                          <td style={tdStyle()}>
                            {x._type === "member" ? (
                              <PayStatusDropdown
                                value={x.payment_status}
                                loading={updating === x.id}
                                onChange={function(s) { updateMemberPayment(x._guestId, x.id, s); }}
                              />
                            ) : (
                              <PayStatusDropdown
                                value={x.payment_status}
                                loading={updating === x.id}
                                onChange={function(s) { updateGuestPayment(x.id, s); }}
                              />
                            )}
                          </td>
                          <td style={tdStyle({ color: MUTED, fontSize: 12 })}>
                            {x.created_at ? new Date(x.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {allAsoOrders.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: "0.5px solid " + GOLD + "22", background: CREAM2, display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[["Total Orders", allAsoOrders.length, NAVY], ["Paid", paidCount, "#10b981"], ["Pending", pendingCount, "#f59e0b"]].map(function(x) {
                  return (
                    <div key={x[0]} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: MUTED }}>{x[0]}</span>
                      <span style={{ fontSize: 20, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: x[2] }}>{x[1]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CONTRIBUTIONS TAB ── */}
        {tab === "contributions" && (
          <div>
            <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 28, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: GOLD }}>{contributed.length}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>Guests who chose to contribute</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>These guests indicated they would like to contribute via Monzo</div>
                </div>
              </div>
              {contributed.length === 0 ? (
                <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "30px 0" }}>No contributions recorded yet</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {contributed.map(function(g) {
                    return (
                      <div key={g.id} style={{ padding: "10px 18px", border: "0.5px solid " + GOLD + "44", borderRadius: 8, background: GOLD + "08" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{g.full_name}</div>
                        {g.email && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{g.email}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ background: "#fff", border: "0.5px solid " + GOLD + "33", borderRadius: 12, padding: "24px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: NAVY, marginBottom: 16 }}>Not Attending Breakdown</h3>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[[notAttend.length, "#ef4444", "Not Attending"], [contributed.length, GOLD, "Chose to Contribute"], [notAttend.length - contributed.length, MUTED, "Declined to Contribute"]].map(function(x) {
                  return (
                    <div key={x[2]} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 28, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, color: x[1] }}>{x[0]}</span>
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: MUTED }}>{x[2]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════

export default function App() {
  useEffect(function() { injectStyles(); }, []);
  const [token, setToken] = useState(null);
  if (!token) return <LoginView onLogin={setToken} />;
  return <Dashboard token={token} onLogout={function() { setToken(null); }} />;
}
