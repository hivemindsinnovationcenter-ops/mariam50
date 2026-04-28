import { useState, useEffect } from "react";

// ============================================================
//  ⚙️  CONFIGURATION — update these before deploying
// ============================================================
const SUPABASE_URL = "https://inprrcgcabxedtotmviy.supabase.co";
const SUPABASE_ANON = "sb_publishable_xpRMshJHRZi0GJHuzvSlYw_YBoAGDS0";
const MONZO_LINK = "https://monzo.me/oluwafunmibijohnaloba?h=fOv5jA&account_type=personal";
// ============================================================

async function dbInsert(payload) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
    method: "POST",
    headers: { "Content-Type":"application/json","apikey":SUPABASE_ANON,"Prefer":"return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function dbCheckEmail(email) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/guests?email=eq.${encodeURIComponent(email)}&select=id`,
    { headers: { "apikey":SUPABASE_ANON } }
  );
  if (!r.ok) return false;
  const d = await r.json();
  return d.length > 0; // true = already exists
}

const NAVY  = "#0C1929";
const GOLD  = "#BF9645";
const GOLD2 = "#D4AF5A";
const CREAM = "#FDFBF5";
const CREAM2= "#F4EFE2";
const MUTED = "#8A8070";

const injectStyles = () => {
  if (document.getElementById("m50-styles")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "m50-styles";
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{min-height:100vh}
    body{background:${CREAM};font-family:'Jost',sans-serif;color:${NAVY}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}
    .s1{animation-delay:.05s}.s2{animation-delay:.12s}.s3{animation-delay:.20s}
    .s4{animation-delay:.28s}.s5{animation-delay:.36s}.s6{animation-delay:.44s}
    input{font-family:'Jost',sans-serif}
  `;
  document.head.appendChild(s);
};

const Ornament = ({ size=32, color=GOLD }) => (
  <svg width={size} height={size/2} viewBox="0 0 64 20" fill="none">
    <line x1="0" y1="10" x2="24" y2="10" stroke={color} strokeWidth="0.8"/>
    <circle cx="32" cy="10" r="4" stroke={color} strokeWidth="0.8" fill="none"/>
    <circle cx="32" cy="10" r="1.5" fill={color}/>
    <line x1="40" y1="10" x2="64" y2="10" stroke={color} strokeWidth="0.8"/>
  </svg>
);

const Divider = ({ my=24 }) => (
  <div style={{display:"flex",alignItems:"center",gap:16,margin:`${my}px 0`}}>
    <div style={{flex:1,height:"0.5px",background:`${GOLD}55`}}/>
    <Ornament size={40} color={`${GOLD}99`}/>
    <div style={{flex:1,height:"0.5px",background:`${GOLD}55`}}/>
  </div>
);

const Page = ({ children }) => (
  <div style={{
    minHeight:"100vh",background:CREAM,
    backgroundImage:`radial-gradient(ellipse 80% 60% at 50% -10%,${GOLD}12 0%,transparent 70%)`,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
  }}>{children}</div>
);

const Card = ({ children, style={}, className="" }) => (
  <div className={className} style={{
    background:"#fff",border:`0.5px solid ${GOLD}55`,borderRadius:16,
    padding:"40px 44px",width:"100%",maxWidth:520,
    boxShadow:`0 4px 40px ${NAVY}08,0 0 0 1px ${GOLD}18`,...style,
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant="primary", disabled, style={}, full }) => {
  const [hov,setHov] = useState(false);
  const base = {
    fontFamily:"'Jost',sans-serif",fontWeight:500,fontSize:13,
    letterSpacing:"0.12em",textTransform:"uppercase",padding:"14px 32px",
    borderRadius:4,cursor:disabled?"not-allowed":"pointer",border:"none",
    transition:"all .3s ease",display:"inline-block",
    width:full?"100%":"auto",opacity:disabled?.55:1,...style,
  };
  const v = {
    primary:{ background:hov?GOLD2:GOLD,color:"#fff",boxShadow:hov?`0 6px 24px ${GOLD}55`:`0 2px 12px ${GOLD}30`,transform:hov?"translateY(-1px)":"none" },
    outline:{ background:"transparent",color:NAVY,border:`0.5px solid ${NAVY}66`,transform:hov&&!disabled?"translateY(-1px)":"none" },
    ghost:  { background:hov?CREAM2:"transparent",color:MUTED,border:`0.5px solid ${MUTED}44` },
    success:{ background:hov?"#059669":"#10b981",color:"#fff",boxShadow:hov?"0 6px 24px #10b98155":"0 2px 12px #10b98130",transform:hov?"translateY(-1px)":"none" },
  };
  return (
    <button style={{...base,...v[variant]}} onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </button>
  );
};

const ChoiceCard = ({ label,sublabel,icon,selected,onClick }) => {
  const [hov,setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        padding:"20px 24px",
        border:`${selected?"1.5px":"0.5px"} solid ${selected?GOLD:hov?`${GOLD}88`:`${NAVY}22`}`,
        borderRadius:12,cursor:"pointer",
        background:selected?`${GOLD}0e`:hov?`${GOLD}05`:"#fff",
        transition:"all .25s ease",display:"flex",alignItems:"center",gap:16,
      }}>
      {icon && <span style={{fontSize:20}}>{icon}</span>}
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:500,color:NAVY}}>{label}</div>
        {sublabel && <div style={{fontSize:12,color:MUTED,marginTop:2}}>{sublabel}</div>}
      </div>
      <div style={{
        width:18,height:18,borderRadius:"50%",
        border:`1.5px solid ${selected?GOLD:`${NAVY}33`}`,
        background:selected?GOLD:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all .2s",flexShrink:0,
      }}>
        {selected && <div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
      </div>
    </div>
  );
};

const Input = ({ label,value,onChange,type="text",placeholder,required }) => (
  <div style={{marginBottom:20}}>
    <label style={{display:"block",fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:8}}>
      {label} {required && <span style={{color:GOLD}}>*</span>}
    </label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"13px 16px",border:`0.5px solid ${NAVY}33`,borderRadius:8,fontSize:14,background:"#fff",color:NAVY,outline:"none",fontFamily:"'Jost',sans-serif",transition:"border-color .2s"}}
      onFocus={e=>{e.target.style.borderColor=GOLD;e.target.style.boxShadow=`0 0 0 3px ${GOLD}15`}}
      onBlur={e=>{e.target.style.borderColor=`${NAVY}33`;e.target.style.boxShadow="none"}}
    />
  </div>
);

const Progress = ({ step,total }) => (
  <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:32}}>
    {Array.from({length:total}).map((_,i)=>(
      <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i<=step?GOLD:`${NAVY}22`,transition:"all .3s ease"}}/>
    ))}
  </div>
);

const EventHeader = ({ subtitle }) => (
  <div style={{textAlign:"center",marginBottom:32}}>
    <div style={{fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",color:GOLD,marginBottom:10,fontWeight:500}}>
      08 · 08 · 2026
    </div>
    <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:400,color:NAVY,lineHeight:1.15}}>
      Mariam <em style={{fontStyle:"italic",color:GOLD}}>@ 50</em>
    </h1>
    {subtitle && <p style={{fontSize:13,color:MUTED,marginTop:10,fontWeight:300,lineHeight:1.6}}>{subtitle}</p>}
  </div>
);

// ─── Views ───────────────────────────────────────────────────

const HomeView = ({ onStart }) => (
  <Page>
    <div style={{textAlign:"center",padding:"20px 24px",width:"100%",maxWidth:560}}>
      <div className="fade-up s1" style={{fontSize:11,letterSpacing:"0.3em",textTransform:"uppercase",color:GOLD,marginBottom:20,fontWeight:500}}>You Are Cordially Invited</div>
      <div className="fade-up s2"><Ornament size={80} color={`${GOLD}cc`}/></div>
      <h1 className="fade-up s3" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,12vw,88px)",fontWeight:300,color:NAVY,lineHeight:1.0,margin:"24px 0 8px"}}>Mariam</h1>
      <h2 className="fade-up s3" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,7vw,48px)",fontWeight:400,fontStyle:"italic",color:GOLD,marginBottom:8}}>@ 50</h2>
      <div className="fade-up s4" style={{fontSize:12,letterSpacing:"0.2em",textTransform:"uppercase",color:MUTED,marginBottom:36}}>08 August 2026</div>
      <div className="fade-up s4"><Divider my={0}/></div>
      <p className="fade-up s5" style={{fontSize:14,color:MUTED,fontWeight:300,lineHeight:1.8,margin:"28px 0 36px"}}>Please click below to RSVP</p>
      <div className="fade-up s6">
        <Btn onClick={onStart} style={{minWidth:200,fontSize:12,letterSpacing:"0.18em",padding:"16px 40px"}}>RSVP Here</Btn>
      </div>
    </div>
  </Page>
);

const DetailsView = ({ onNext,onBack }) => {
  const [name,setName]       = useState("");
  const [email,setEmail]     = useState("");
  const [checking,setChecking] = useState(false);
  const [dupErr,setDupErr]   = useState("");

  const isValid = name.trim() && email.trim() && email.includes("@");

  const handleContinue = async () => {
    setDupErr("");
    setChecking(true);
    try {
      const exists = await dbCheckEmail(email.trim().toLowerCase());
      if (exists) {
        setDupErr("It looks like you have already RSVP'd with this email address. Please get in touch if you need to make a change.");
        return;
      }
      onNext(name.trim(), email.trim().toLowerCase());
    } catch(e) {
      // If check fails, let them through — don't block on a network error
      onNext(name.trim(), email.trim().toLowerCase());
    } finally {
      setChecking(false);
    }
  };

  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Progress step={0} total={3}/>
        <Card className="fade-up">
          <EventHeader subtitle="Let's start with your details"/>
          <Divider my={24}/>
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" required/>
          <Input label="Email Address" value={email} onChange={v=>{ setEmail(v); setDupErr(""); }} type="email" placeholder="your@email.com" required/>
          {dupErr && (
            <div style={{
              background:`${GOLD}0e`,border:`0.5px solid ${GOLD}66`,
              borderRadius:10,padding:"12px 16px",marginBottom:16,
              fontSize:13,color:NAVY,lineHeight:1.6,fontWeight:300,
            }}>
              {dupErr}
            </div>
          )}
          <div style={{display:"flex",gap:12,marginTop:8}}>
            <Btn variant="ghost" onClick={onBack} style={{flex:1}}>Back</Btn>
            <Btn onClick={handleContinue} disabled={!isValid||checking} style={{flex:2}}>
              {checking?"Checking…":"Continue"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
};

const Q1View = ({ onYes,onNo,onBack }) => {
  const [choice,setChoice] = useState(null);
  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Progress step={1} total={3}/>
        <Card className="fade-up">
          <EventHeader/>
          <Divider my={24}/>
          <p style={{fontSize:15,color:NAVY,lineHeight:1.7,textAlign:"center",marginBottom:28,fontWeight:300}}>
            Will you be joining us to celebrate<br/>
            <strong style={{fontWeight:500}}>Mariam @ 50</strong> on <strong style={{fontWeight:500}}>08/08/2026</strong>?
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            <ChoiceCard label="Yes, I will be in attendance" icon="🎉" selected={choice==="yes"} onClick={()=>setChoice("yes")}/>
            <ChoiceCard label="No, sorry I cannot make it" icon="🤍" selected={choice==="no"} onClick={()=>setChoice("no")}/>
          </div>
          <div style={{display:"flex",gap:12}}>
            <Btn variant="ghost" onClick={onBack} style={{flex:1}}>Back</Btn>
            <Btn disabled={!choice} onClick={()=>choice==="yes"?onYes():onNo()} style={{flex:2}}>Continue</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
};

const ContributionView = ({ onYes,onNo,onBack,saving }) => {
  const [choice,setChoice] = useState(null);
  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Progress step={2} total={3}/>
        <Card className="fade-up">
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:36,marginBottom:12}}>🌸</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:NAVY,marginBottom:10}}>We Are So Sorry</h2>
            <p style={{fontSize:14,color:MUTED,lineHeight:1.7,fontWeight:300}}>
              We are so sorry you cannot make it.<br/>Would you like to contribute?
            </p>
          </div>
          <Divider my={20}/>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            <ChoiceCard label="Yes, I would like to contribute" icon="💛" selected={choice==="yes"} onClick={()=>setChoice("yes")}/>
            <ChoiceCard label="No, thank you" icon="🤍" selected={choice==="no"} onClick={()=>setChoice("no")}/>
          </div>
          <div style={{display:"flex",gap:12}}>
            <Btn variant="ghost" onClick={onBack} style={{flex:1}}>Back</Btn>
            <Btn disabled={!choice||saving} onClick={()=>choice==="yes"?onYes():onNo()} style={{flex:2}}>
              {saving?"Saving…":"Submit Response"}
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
};

const Q2View = ({ onYes,onYesPaid,onNo,onBack }) => {
  const [choice,setChoice] = useState(null);
  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Progress step={2} total={3}/>
        <Card className="fade-up">
          <EventHeader subtitle="We have beautiful attire options available"/>
          <Divider my={24}/>
          <p style={{fontSize:15,color:NAVY,lineHeight:1.7,textAlign:"center",marginBottom:28,fontWeight:300}}>
            Would you like to buy <strong style={{fontWeight:500}}>asoebi</strong>, <strong style={{fontWeight:500}}>gele</strong>, or a <strong style={{fontWeight:500}}>cap</strong>?
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            <ChoiceCard label="Yes, I would love to" icon="⭐️" selected={choice==="yes"} onClick={()=>setChoice("yes")}/>
            <ChoiceCard label="Yes, I would love to and I have paid" icon="🤍" selected={choice==="yes_paid"} onClick={()=>setChoice("yes_paid")}/>
            <ChoiceCard label="No, I don't want to" icon="💙" selected={choice==="no"} onClick={()=>setChoice("no")}/>
          </div>
          <div style={{display:"flex",gap:12}}>
            <Btn variant="ghost" onClick={onBack} style={{flex:1}}>Back</Btn>
            <Btn disabled={!choice} onClick={()=>{
              if(choice==="yes") onYes();
              else if(choice==="yes_paid") onYesPaid();
              else onNo();
            }} style={{flex:2}}>Continue</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
};

// ─── Asoebi Items: select → optional pay → confirm ───────────
const ITEMS = [
  { key:"asoebi_gele", label:"Asoebi + Gele", price:"£150" },
  { key:"gele",        label:"Gele",          price:"£30"  },
  { key:"asoebi",      label:"Asoebi",        price:"£120" },
  { key:"cap",         label:"Cap",           price:"£20"  },
];

const AsoebItems = ({ onConfirm,onBack,saving }) => {
  const [item,setItem] = useState(null);

  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Progress step={2} total={3}/>
        <Card className="fade-up">
          <div style={{textAlign:"center",marginBottom:28}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:NAVY,marginBottom:8}}>Select Your Attire</h2>
            <p style={{fontSize:13,color:MUTED,fontWeight:300}}>Choose your item below</p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {ITEMS.map(it=>(
              <ChoiceCard key={it.key} label={it.label} sublabel={it.price}
                selected={item===it.key}
                onClick={()=>setItem(it.key)}
              />
            ))}
          </div>

          <Divider my={16}/>

          {/* Monzo info box */}
          <div style={{
            background:`${GOLD}08`,
            border:`0.5px solid ${GOLD}44`,
            borderRadius:12,padding:"20px 24px",marginBottom:24,
          }}>
            <p style={{fontSize:13,color:NAVY,lineHeight:1.7,fontWeight:300,marginBottom:14}}>
              If you would like to pay now, please use the Monzo link below.
              Please note, if you picked Cap, please add your cap size in the reference section of the Monzo payment. Thank you!
            </p>
            <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex",alignItems:"center",gap:8,
              fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",
              color:GOLD,fontWeight:500,textDecoration:"none",
              border:`0.5px solid ${GOLD}66`,borderRadius:4,
              padding:"10px 20px",transition:"all .2s",fontFamily:"'Jost',sans-serif",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${GOLD}15`}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
            >
              Pay via Monzo →
            </a>
          </div>

          <div style={{display:"flex",gap:12}}>
            <Btn variant="ghost" onClick={onBack} style={{flex:1}}>Back</Btn>
            <Btn disabled={!item||saving} onClick={()=>onConfirm(item)} style={{flex:2}}>
              {saving?"Saving…":"Confirm Selection"}
            </Btn>
          </div>

        </Card>
      </div>
    </Page>
  );
};

const ATTENDING_TYPES = ["default","asoebi_paid","asoebi_no","asoebi_items"];

const DoneView = ({ type }) => {
  const msgs = {
    default:      { emoji:"✨", title:"Thank You",         body:"Your response has been received. We look forward to celebrating with you!" },
    not_attending:{ emoji:"🌸", title:"Thank You",         body:"Thank you for your response. You will be missed!" },
    contribute:   { emoji:"💛", title:"Thank You So Much", body:"Your generosity means the world. Thank you for contributing!" },
    asoebi_paid:  { emoji:"👗", title:"Wonderful!",        body:"Thank you! We cannot wait to see you in your beautiful attire." },
    asoebi_no:    { emoji:"💙", title:"See You There!",    body:"Thank you. We cannot wait to see you.\nDress code: Blue and Gold." },
    asoebi_items: { emoji:"⭐️", title:"You're Confirmed!", body:"Your payment and selection are saved.\nWe cannot wait to see you in your beautiful attire!" },
  };
  const m = msgs[type] || msgs.default;
  const showGift = ATTENDING_TYPES.includes(type);
  return (
    <Page>
      <div style={{padding:"24px 16px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Card className="fade-up" style={{textAlign:"center"}}>
          <div style={{fontSize:44,marginBottom:20}}>{m.emoji}</div>
          <Ornament size={60} color={`${GOLD}88`}/>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:400,color:NAVY,margin:"20px 0 12px"}}>{m.title}</h2>
          <p style={{fontSize:14,color:MUTED,lineHeight:1.8,fontWeight:300,whiteSpace:"pre-line"}}>{m.body}</p>

          {showGift && (
            <>
              <Divider my={24}/>
              <div style={{
                background:`${GOLD}08`,
                border:`0.5px solid ${GOLD}44`,
                borderRadius:12,padding:"20px 24px",
                textAlign:"left",
              }}>
                <div style={{fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",color:GOLD,fontWeight:500,marginBottom:8}}>
                  🎁 Would you like to give a gift?
                </div>
                <p style={{fontSize:13,color:MUTED,lineHeight:1.7,fontWeight:300,marginBottom:14}}>
                  If you would like to bless Mariam with a monetary gift, you can send it via Monzo using the link below. Your generosity is so appreciated!
                </p>
                <a href={MONZO_LINK} target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex",alignItems:"center",gap:8,
                    fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",
                    color:GOLD,fontWeight:500,textDecoration:"none",
                    border:`0.5px solid ${GOLD}66`,borderRadius:4,
                    padding:"10px 20px",transition:"all .2s",fontFamily:"'Jost',sans-serif",
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${GOLD}15`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}
                >
                  Send a Gift via Monzo →
                </a>
              </div>
            </>
          )}

          <Divider my={24}/>
          <p style={{fontSize:12,color:`${MUTED}88`,letterSpacing:"0.1em"}}>MARIAM @ 50 · 08/08/2026</p>
        </Card>
      </div>
    </Page>
  );
};

// ════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════
export default function App() {
  useEffect(()=>{ injectStyles(); },[]);

  const [view,setView]         = useState("home");
  const [doneType,setDoneType] = useState("default");
  const [saving,setSaving]     = useState(false);
  const [name,setName]         = useState("");
  const [email,setEmail]       = useState("");

  const save = async (payload) => {
    setSaving(true);
    try { await dbInsert({ full_name:name, email:email||null, ...payload }); }
    catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleContribYes = async () => {
    await save({ attending:false, contribution_choice:"yes" });
    window.open(MONZO_LINK,"_blank");
    setDoneType("contribute"); setView("done");
  };
  const handleContribNo = async () => {
    await save({ attending:false, contribution_choice:"no" });
    setDoneType("not_attending"); setView("done");
  };
  const handleQ2YesPaid = async () => {
    await save({ attending:true, asoebi_choice:"yes_paid", payment_status:"paid" });
    setDoneType("asoebi_paid"); setView("done");
  };
  const handleQ2No = async () => {
    await save({ attending:true, asoebi_choice:"no" });
    setDoneType("asoebi_no"); setView("done");
  };
  const handleAsoebItem = async (item) => {
    await save({ attending:true, asoebi_choice:"yes", asoebi_item:item, payment_status:"paid" });
    setDoneType("asoebi_items"); setView("done");
  };

  if(view==="home")         return <HomeView onStart={()=>setView("details")}/>;
  if(view==="details")      return <DetailsView onNext={(n,em)=>{ setName(n); setEmail(em); setView("q1"); }} onBack={()=>setView("home")}/>;
  if(view==="q1")           return <Q1View onYes={()=>setView("q2")} onNo={()=>setView("contribution")} onBack={()=>setView("details")}/>;
  if(view==="contribution") return <ContributionView onYes={handleContribYes} onNo={handleContribNo} onBack={()=>setView("q1")} saving={saving}/>;
  if(view==="q2")           return <Q2View onYes={()=>setView("asoebi_items")} onYesPaid={handleQ2YesPaid} onNo={handleQ2No} onBack={()=>setView("q1")}/>;
  if(view==="asoebi_items") return <AsoebItems onConfirm={handleAsoebItem} onBack={()=>setView("q2")} saving={saving}/>;
  if(view==="done")         return <DoneView type={doneType}/>;
  return null;
}
