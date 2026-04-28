import { useState, useEffect, useCallback } from "react";

// ============================================================
//  ⚙️  CONFIGURATION — must match mariam-rsvp.jsx
// ============================================================
const SUPABASE_URL  = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON = "YOUR_SUPABASE_ANON_KEY";
// ============================================================

async function dbFetch(tok) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/guests?select=*&order=created_at.desc`, {
    headers: { "apikey":SUPABASE_ANON, "Authorization":`Bearer ${tok}` },
  });
  if (!r.ok) throw new Error("Unauthorized — check credentials");
  return r.json();
}

async function authLogin(email, pw) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:"POST",
    headers:{ "Content-Type":"application/json","apikey":SUPABASE_ANON },
    body: JSON.stringify({ email, password:pw }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || "Login failed");
  return d;
}

const NAVY  = "#0C1929";
const GOLD  = "#BF9645";
const GOLD2 = "#D4AF5A";
const CREAM = "#FDFBF5";
const CREAM2= "#F4EFE2";
const MUTED = "#8A8070";

const injectStyles = () => {
  if (document.getElementById("m50-admin-styles")) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "m50-admin-styles";
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{min-height:100vh}
    body{background:${CREAM2};font-family:'Jost',sans-serif;color:${NAVY}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
    .pulsing{animation:pulse 1.4s ease infinite}
    input{font-family:'Jost',sans-serif}
    tr:hover td{background:#faf8f2 !important}
  `;
  document.head.appendChild(s);
};

const Btn = ({ children,onClick,variant="primary",disabled,style={},full }) => {
  const [hov,setHov] = useState(false);
  const base = {
    fontFamily:"'Jost',sans-serif",fontWeight:500,fontSize:12,
    letterSpacing:"0.12em",textTransform:"uppercase",padding:"11px 24px",
    borderRadius:4,cursor:disabled?"not-allowed":"pointer",border:"none",
    transition:"all .25s",display:"inline-block",
    width:full?"100%":"auto",opacity:disabled?.5:1,...style,
  };
  const v = {
    primary:{ background:hov?GOLD2:GOLD,color:"#fff",boxShadow:hov?`0 4px 20px ${GOLD}55`:`0 2px 10px ${GOLD}30` },
    navy:   { background:hov?"#1a3050":NAVY,color:"#fff",boxShadow:hov?`0 4px 20px ${NAVY}44`:`0 2px 10px ${NAVY}22` },
    outline:{ background:"transparent",color:NAVY,border:`0.5px solid ${NAVY}55` },
    ghost:  { background:hov?`${MUTED}15`:"transparent",color:MUTED,border:`0.5px solid ${MUTED}33` },
    danger: { background:hov?"#b91c1c":"#dc2626",color:"#fff" },
  };
  return (
    <button style={{...base,...v[variant]}} onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </button>
  );
};

const Input = ({ label,value,onChange,type="text",placeholder }) => (
  <div style={{marginBottom:18}}>
    <label style={{display:"block",fontSize:10,fontWeight:500,letterSpacing:"0.12em",textTransform:"uppercase",color:MUTED,marginBottom:7}}>
      {label}
    </label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"12px 14px",border:`0.5px solid ${NAVY}33`,borderRadius:8,fontSize:14,background:"#fff",color:NAVY,outline:"none",fontFamily:"'Jost',sans-serif"}}
      onFocus={e=>{e.target.style.borderColor=GOLD;e.target.style.boxShadow=`0 0 0 3px ${GOLD}15`}}
      onBlur={e=>{e.target.style.borderColor=`${NAVY}33`;e.target.style.boxShadow="none"}}
    />
  </div>
);

// ─── Badge ───────────────────────────────────────────────────
const Badge = ({ label,color="gray" }) => {
  const colors = {
    green:  { bg:"#d1fae5", text:"#065f46" },
    red:    { bg:"#fee2e2", text:"#991b1b" },
    gold:   { bg:`${GOLD}22`, text:"#92400e" },
    blue:   { bg:"#dbeafe", text:"#1e40af" },
    purple: { bg:"#ede9fe", text:"#5b21b6" },
    teal:   { bg:"#ccfbf1", text:"#134e4a" },
    gray:   { bg:"#f3f4f6", text:MUTED },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display:"inline-block",padding:"3px 10px",borderRadius:20,
      fontSize:11,fontWeight:500,background:c.bg,color:c.text,
      letterSpacing:"0.03em",whiteSpace:"nowrap",
    }}>{label}</span>
  );
};

// ─── Stat card ───────────────────────────────────────────────
const StatCard = ({ label,value,accent }) => (
  <div style={{
    background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,
    padding:"20px 22px",borderTop:`3px solid ${accent}`,
  }}>
    <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:MUTED,marginBottom:8}}>{label}</div>
    <div style={{fontSize:30,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:accent||NAVY}}>{value}</div>
  </div>
);

// ════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════
const LoginView = ({ onLogin }) => {
  const [email,setEmail] = useState("");
  const [pw,setPw]       = useState("");
  const [err,setErr]     = useState("");
  const [loading,setLoading] = useState(false);

  const handle = async () => {
    setErr(""); setLoading(true);
    try {
      const d = await authLogin(email,pw);
      onLogin(d.access_token);
    } catch(e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",background:NAVY,
      backgroundImage:`radial-gradient(ellipse 60% 50% at 50% 0%,${GOLD}18 0%,transparent 60%)`,
      display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",
    }}>
      <div className="fade-up" style={{
        background:"#fff",border:`0.5px solid ${GOLD}55`,borderRadius:16,
        padding:"48px 44px",width:"100%",maxWidth:420,
        boxShadow:`0 8px 60px ${NAVY}44`,
      }}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{
            width:48,height:48,borderRadius:"50%",
            background:`${GOLD}15`,border:`0.5px solid ${GOLD}55`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 16px",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:GOLD,marginBottom:6,fontWeight:500}}>
            Admin Portal
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:NAVY}}>
            Mariam <em style={{color:GOLD}}>@ 50</em>
          </h1>
        </div>

        <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@example.com"/>
        <Input label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••"/>

        {err && (
          <div style={{background:"#fef2f2",border:"0.5px solid #fca5a5",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#991b1b"}}>
            {err}
          </div>
        )}

        <Btn full variant="navy" onClick={handle} disabled={!email||!pw||loading}
          style={{marginTop:4,fontSize:12,padding:"14px"}}>
          {loading?"Signing in…":"Sign In"}
        </Btn>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
const Dashboard = ({ token,onLogout }) => {
  const [guests,setGuests]   = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr]         = useState("");
  const [filter,setFilter]   = useState("all");
  const [search,setSearch]   = useState("");
  const [tab,setTab]         = useState("guests");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { setGuests(await dbFetch(token)); }
    catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  },[token]);

  useEffect(()=>{ load(); },[load]);

  // Derived stats
  const total       = guests.length;
  const attending   = guests.filter(g=>g.attending===true);
  const notAttend   = guests.filter(g=>g.attending===false);
  const contributed = guests.filter(g=>g.contribution_choice==="yes");
  const asoebiAll   = guests.filter(g=>g.asoebi_choice==="yes"||g.asoebi_choice==="yes_paid");
  const paid        = guests.filter(g=>g.payment_status==="paid");
  const pending     = guests.filter(g=>g.payment_status==="pending");

  const filtered = guests.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = !q || g.full_name?.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q);
    if(!matchSearch) return false;
    if(filter==="attending")     return g.attending===true;
    if(filter==="not_attending") return g.attending===false;
    if(filter==="asoebi")        return g.asoebi_choice==="yes"||g.asoebi_choice==="yes_paid";
    if(filter==="paid")          return g.payment_status==="paid";
    if(filter==="pending")       return g.payment_status==="pending";
    if(filter==="contributed")   return g.contribution_choice==="yes";
    return true;
  });

  const exportCSV = () => {
    const cols = ["full_name","email","attending","contribution_choice","asoebi_choice","asoebi_item","payment_status","created_at"];
    const rows = [
      cols.join(","),
      ...guests.map(g => cols.map(c=>`"${(g[c]??"")}"`).join(","))
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/csv"}));
    a.download = "mariam50_guests.csv";
    a.click();
  };

  const itemLabel = { asoebi_gele:"Asoebi + Gele", gele:"Gele", asoebi:"Asoebi", cap:"Cap" };
  const attendingColor = v => v===true?"green":v===false?"red":"gray";
  const attendingLabel = v => v===true?"Yes":v===false?"No":"—";
  const asoColor = v => v==="yes_paid"?"blue":v==="yes"?"gold":"gray";
  const asoLabel = v => v==="yes_paid"?"Yes — paid":v==="yes"?"Yes — pending":v==="no"?"No":"—";
  const payColor = v => v==="paid"?"teal":v==="pending"?"purple":"gray";

  return (
    <div style={{minHeight:"100vh",background:CREAM2}}>

      {/* Header */}
      <div style={{background:NAVY,padding:"0 32px"}}>
        <div style={{
          maxWidth:1200,margin:"0 auto",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          height:64,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,color:"#fff"}}>
              Mariam <em style={{color:GOLD}}>@ 50</em>
            </h1>
            <div style={{width:"0.5px",height:20,background:`${GOLD}44`}}/>
            <span style={{fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:`${GOLD}bb`}}>
              Admin Dashboard
            </span>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="outline" onClick={load} style={{color:"#fff",borderColor:"#fff3",fontSize:11,padding:"8px 16px"}}>
              ↺ Refresh
            </Btn>
            <Btn onClick={exportCSV} style={{fontSize:11,padding:"8px 16px"}}>
              Export CSV
            </Btn>
            <Btn variant="ghost" onClick={onLogout} style={{color:`${GOLD}cc`,borderColor:`${GOLD}33`,fontSize:11,padding:"8px 16px"}}>
              Logout
            </Btn>
          </div>
        </div>

        {/* Tabs */}
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:0}}>
          {[["guests","All Guests"],["asoebi","Asoebi Orders"],["contributions","Contributions"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:"0.1em",
              textTransform:"uppercase",padding:"12px 20px",border:"none",cursor:"pointer",
              background:"transparent",
              color:tab===k?"#fff":`${GOLD}88`,
              borderBottom:tab===k?`2px solid ${GOLD}`:"2px solid transparent",
              transition:"all .2s",fontWeight:tab===k?500:400,
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px"}}>

        {err && (
          <div style={{background:"#fef2f2",border:"0.5px solid #fca5a5",borderRadius:8,padding:"12px 16px",marginBottom:24,fontSize:13,color:"#991b1b"}}>
            ⚠ {err}
          </div>
        )}

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14,marginBottom:28}}>
          <StatCard label="Total Responses" value={total}            accent={NAVY}/>
          <StatCard label="Attending"        value={attending.length} accent="#10b981"/>
          <StatCard label="Not Attending"    value={notAttend.length} accent="#ef4444"/>
          <StatCard label="Contributions"    value={contributed.length} accent={GOLD}/>
          <StatCard label="Asoebi Orders"    value={asoebiAll.length} accent="#8b5cf6"/>
          <StatCard label="Paid"             value={paid.length}     accent="#0891b2"/>
          <StatCard label="Pending Payment"  value={pending.length}  accent="#f59e0b"/>
        </div>

        {/* ── TAB: ALL GUESTS ── */}
        {tab==="guests" && (
          <>
            {/* Filter + search bar */}
            <div style={{background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,padding:"16px 20px",marginBottom:18,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  ["all","All"],["attending","Attending"],["not_attending","Not Attending"],
                  ["asoebi","Asoebi"],["paid","Paid"],["pending","Pending"],["contributed","Contributed"],
                ].map(([v,l])=>(
                  <button key={v} onClick={()=>setFilter(v)} style={{
                    padding:"6px 14px",fontSize:11,borderRadius:20,cursor:"pointer",
                    border:`0.5px solid ${filter===v?GOLD:`${NAVY}18`}`,
                    background:filter===v?`${GOLD}15`:"transparent",
                    color:filter===v?GOLD:MUTED,
                    fontWeight:filter===v?500:400,
                    transition:"all .2s",fontFamily:"'Jost',sans-serif",
                    letterSpacing:"0.04em",
                  }}>{l}</button>
                ))}
              </div>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search name or email…"
                style={{
                  marginLeft:"auto",padding:"8px 14px",fontSize:13,
                  border:`0.5px solid ${NAVY}22`,borderRadius:8,
                  fontFamily:"'Jost',sans-serif",color:NAVY,minWidth:220,
                  outline:"none",background:"#fff",
                }}
              />
            </div>

            {/* Table */}
            <div style={{background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:`0.5px solid ${GOLD}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:MUTED}}>{filtered.length} {filtered.length===1?"guest":"guests"}</span>
              </div>
              {loading ? (
                <div className="pulsing" style={{padding:60,textAlign:"center",fontSize:13,color:MUTED}}>Loading guests…</div>
              ) : filtered.length===0 ? (
                <div style={{padding:60,textAlign:"center",fontSize:13,color:MUTED}}>No guests found</div>
              ) : (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead>
                      <tr style={{background:CREAM2}}>
                        {["Name","Email","Attending","Contribution","Asoebi","Item","Payment","Date"].map(h=>(
                          <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,fontWeight:500,borderBottom:`0.5px solid ${GOLD}22`,whiteSpace:"nowrap"}}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((g,i)=>(
                        <tr key={g.id} style={{background:i%2===0?"#fff":`${CREAM}66`}}>
                          <td style={{padding:"12px 16px",fontWeight:500,color:NAVY,borderBottom:`0.5px solid ${GOLD}15`}}>{g.full_name}</td>
                          <td style={{padding:"12px 16px",color:MUTED,borderBottom:`0.5px solid ${GOLD}15`}}>{g.email||"—"}</td>
                          <td style={{padding:"12px 16px",borderBottom:`0.5px solid ${GOLD}15`}}>
                            <Badge label={attendingLabel(g.attending)} color={attendingColor(g.attending)}/>
                          </td>
                          <td style={{padding:"12px 16px",color:MUTED,borderBottom:`0.5px solid ${GOLD}15`}}>
                            {g.contribution_choice ? <Badge label={g.contribution_choice} color={g.contribution_choice==="yes"?"gold":"gray"}/> : "—"}
                          </td>
                          <td style={{padding:"12px 16px",borderBottom:`0.5px solid ${GOLD}15`}}>
                            {g.asoebi_choice ? <Badge label={asoLabel(g.asoebi_choice)} color={asoColor(g.asoebi_choice)}/> : "—"}
                          </td>
                          <td style={{padding:"12px 16px",color:MUTED,borderBottom:`0.5px solid ${GOLD}15`}}>
                            {itemLabel[g.asoebi_item]||"—"}
                          </td>
                          <td style={{padding:"12px 16px",borderBottom:`0.5px solid ${GOLD}15`}}>
                            {g.payment_status ? <Badge label={g.payment_status} color={payColor(g.payment_status)}/> : "—"}
                          </td>
                          <td style={{padding:"12px 16px",color:MUTED,fontSize:12,borderBottom:`0.5px solid ${GOLD}15`,whiteSpace:"nowrap"}}>
                            {g.created_at ? new Date(g.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB: ASOEBI ORDERS ── */}
        {tab==="asoebi" && (
          <div style={{background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`0.5px solid ${GOLD}22`}}>
              <span style={{fontSize:13,color:MUTED}}>{asoebiAll.length} orders</span>
            </div>
            {asoebiAll.length===0 ? (
              <div style={{padding:60,textAlign:"center",fontSize:13,color:MUTED}}>No asoebi orders yet</div>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:CREAM2}}>
                      {["Name","Email","Item","Amount","Status","Date"].map(h=>(
                        <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,fontWeight:500,borderBottom:`0.5px solid ${GOLD}22`}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {asoebiAll.map((g,i)=>{
                      const prices = { asoebi_gele:"£150", gele:"£30", asoebi:"£120", cap:"£20" };
                      return (
                        <tr key={g.id} style={{background:i%2===0?"#fff":`${CREAM}66`}}>
                          <td style={{padding:"12px 16px",fontWeight:500,color:NAVY,borderBottom:`0.5px solid ${GOLD}15`}}>{g.full_name}</td>
                          <td style={{padding:"12px 16px",color:MUTED,borderBottom:`0.5px solid ${GOLD}15`}}>{g.email||"—"}</td>
                          <td style={{padding:"12px 16px",borderBottom:`0.5px solid ${GOLD}15`}}>
                            {g.asoebi_item ? <Badge label={itemLabel[g.asoebi_item]} color="gold"/> : "—"}
                          </td>
                          <td style={{padding:"12px 16px",color:GOLD,fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,borderBottom:`0.5px solid ${GOLD}15`}}>
                            {prices[g.asoebi_item]||"—"}
                          </td>
                          <td style={{padding:"12px 16px",borderBottom:`0.5px solid ${GOLD}15`}}>
                            <Badge label={g.payment_status||"—"} color={payColor(g.payment_status)}/>
                          </td>
                          <td style={{padding:"12px 16px",color:MUTED,fontSize:12,borderBottom:`0.5px solid ${GOLD}15`}}>
                            {g.created_at ? new Date(g.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue summary */}
            {asoebiAll.length>0 && (
              <div style={{padding:"20px 24px",borderTop:`0.5px solid ${GOLD}22`,background:CREAM2,display:"flex",gap:24,flexWrap:"wrap"}}>
                {[
                  ["Total Orders", asoebiAll.length, NAVY],
                  ["Paid", paid.length, "#10b981"],
                  ["Pending", pending.length, "#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:MUTED}}>{l}</span>
                    <span style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:c}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CONTRIBUTIONS ── */}
        {tab==="contributions" && (
          <div>
            <div style={{background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,padding:"24px",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{fontSize:28,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:GOLD}}>{contributed.length}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:NAVY}}>Guests who chose to contribute</div>
                  <div style={{fontSize:12,color:MUTED,marginTop:2}}>These guests indicated they would like to contribute via Monzo</div>
                </div>
              </div>
              {contributed.length===0 ? (
                <p style={{fontSize:13,color:MUTED,textAlign:"center",padding:"30px 0"}}>No contributions recorded yet</p>
              ) : (
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {contributed.map(g=>(
                    <div key={g.id} style={{
                      padding:"10px 18px",border:`0.5px solid ${GOLD}44`,borderRadius:8,
                      background:`${GOLD}08`,
                    }}>
                      <div style={{fontSize:13,fontWeight:500,color:NAVY}}>{g.full_name}</div>
                      {g.email && <div style={{fontSize:11,color:MUTED,marginTop:2}}>{g.email}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Not attending breakdown */}
            <div style={{background:"#fff",border:`0.5px solid ${GOLD}33`,borderRadius:12,padding:"24px"}}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:NAVY,marginBottom:16}}>Not Attending Breakdown</h3>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <span style={{fontSize:28,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:"#ef4444"}}>{notAttend.length}</span>
                  <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:MUTED}}>Not Attending</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <span style={{fontSize:28,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:GOLD}}>{contributed.length}</span>
                  <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:MUTED}}>Chose to Contribute</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <span style={{fontSize:28,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:MUTED}}>{notAttend.length-contributed.length}</span>
                  <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:MUTED}}>Declined to Contribute</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════
export default function App() {
  useEffect(()=>{ injectStyles(); },[]);
  const [token,setToken] = useState(null);

  if (!token) return <LoginView onLogin={setToken}/>;
  return <Dashboard token={token} onLogout={()=>setToken(null)}/>;
}
