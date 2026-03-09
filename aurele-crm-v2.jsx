import React, { useState, useEffect } from "react";

// ─── STORAGE ────────────────────────────────────────────────
const LIVE_KEY    = "aurele-live-data";
const USERS_KEY   = "aurele-crm-users";
const SESSION_KEY = "aurele-crm-session";
const S = {
  async getLive()  { try { const r = await window.storage.get(LIVE_KEY, true);  return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async setLive(v) { try { await window.storage.set(LIVE_KEY, JSON.stringify(v), true); } catch {} },
  async get(k)     { try { const r = await window.storage.get(k);               return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v)  { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
  async del(k)     { try { await window.storage.delete(k); } catch {} },
};

// ─── ROLES ──────────────────────────────────────────────────
const ROLES = {
  owner:    { label:"Owner / Super Admin", color:"#9A7B4F", access:["dashboard","products","clients","commissions","enquiries","content","analytics","links","users"] },
  director: { label:"Client Director",     color:"#7BA7C4", access:["dashboard","clients","enquiries","links"] },
  artisan:  { label:"Artisan",             color:"#8BAF7C", access:["dashboard","commissions"] },
  press:    { label:"Press & Content",     color:"#B08080", access:["dashboard","content"] },
};

// ─── SEED DATA ──────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", username:"admin",    password:"admin",       name:"Celeste Aurele",  role:"owner",    email:"celeste@aurele.com",  active:true,  lastLogin:null },
  { id:"u2", username:"marco",    password:"ferretti24",  name:"Marco Ferretti",  role:"artisan",  email:"marco@aurele.com",    active:true,  lastLogin:null },
  { id:"u3", username:"isabeau",  password:"renard14",    name:"Isabeau Renard",  role:"artisan",  email:"isabeau@aurele.com",  active:true,  lastLogin:null },
  { id:"u4", username:"director", password:"client2026",  name:"Marie Fontaine",  role:"director", email:"marie@aurele.com",    active:true,  lastLogin:null },
  { id:"u5", username:"press",    password:"editorial26", name:"Lea Bertrand",    role:"press",    email:"lea@aurele.com",      active:false, lastLogin:null },
];

const SEED_LINKS = [
  { id:"lk1", type:"private_client", label:"Private Client - Margaux D.", token:"pvt-mdx-2026-a1b2", clientName:"Margaux Delacroix", email:"m.delacroix@private.fr", created:"2026-03-01", expires:"2026-04-01", used:false, createdBy:"Celeste Aurele" },
  { id:"lk2", type:"commission",     label:"Commission - Thomas Richter",  token:"com-thr-2026-c3d4", clientName:"Thomas Richter",    email:"t.richter@email.de",     created:"2026-02-25", expires:"2026-03-25", used:true,  createdBy:"Celeste Aurele" },
  { id:"lk3", type:"waitlist",       label:"Waitlist - L Ombre Q II",      token:"wlt-omb-2026-e5f6", clientName:null,                email:null,                      created:"2026-02-20", expires:"2026-05-01", used:false, createdBy:"Marie Fontaine" },
  { id:"lk4", type:"press",          label:"Press Access - Wallpaper",     token:"prs-wlp-2026-g7h8", clientName:"Lucia Ferreira",    email:"l.ferreira@press.pt",     created:"2026-02-18", expires:"2026-03-18", used:true,  createdBy:"Celeste Aurele" },
];

const SEED_DATA = {
  products: [
    { id:"p1", name:"La Dune",   subtitle:"Structured Tote - Sable Calfskin",      quarter:"Q II 2026", price:6800,  edition:12, sold:8,  status:"active",   material:"Vachetta Calfskin",        hardware:"18k Gold Vermeil",       lining:"Lyonnais Silk",        artisan:"Marco Ferretti",  description:"Inspired by coastal dunes at first light. Formed over a hand-carved ash wood mould.", visible:true  },
    { id:"p2", name:"L Ombre",   subtitle:"Evening Flap - Smoked Patent",           quarter:"Q II 2026", price:9400,  edition:8,  sold:8,  status:"sold_out", material:"Smoked Patent Calfskin",    hardware:"Oxidised Bronze",        lining:"Ebony Suede",           artisan:"Isabeau Renard",  description:"A surface that absorbs rather than reflects. Carried to the most exclusive rooms.", visible:true  },
    { id:"p3", name:"La Boite",  subtitle:"Box Bag - Grain-de-Poudre Calf",         quarter:"Q II 2026", price:11200, edition:6,  sold:0,  status:"active",   material:"Grain-de-Poudre Calfskin",  hardware:"Palladium-plated Brass", lining:"Tabac Goatskin Suede",  artisan:"Marco Ferretti",  description:"Derived from 18th-century cartonnage. Collaboration with master bookbinder Claude Breton.", visible:true  },
    { id:"p4", name:"Le Seau",   subtitle:"Bucket - Warm Taupe Calfskin",            quarter:"Q I 2026",  price:5200,  edition:10, sold:10, status:"archived", material:"Vachetta Calfskin",        hardware:"18k Gold Vermeil",       lining:"Ivory Silk",            artisan:"Yuki Tanaka",     description:"A study in effortless structure.", visible:false },
    { id:"p5", name:"La Petite", subtitle:"Mini Tote - Cognac Vachetta",             quarter:"Q I 2026",  price:4100,  edition:8,  sold:8,  status:"archived", material:"Cognac Vachetta",          hardware:"18k Gold Vermeil",       lining:"Blush Silk",            artisan:"Isabeau Renard",  description:"Everything a day requires, in the smallest possible form.", visible:false },
  ],
  clients: [
    { id:"c1", name:"Isabelle Morel",   email:"i.morel@private.fr",     country:"France",        phone:"+33 6 12 34 56 78", tier:"private",  since:"2019-03-14", totalPurchases:3, totalSpend:24600, lastContact:"2026-01-12", notes:"Prefers cognac and ivory leathers.", referredBy:"Direct" },
    { id:"c2", name:"Naomi Tanaka",     email:"n.tanaka@private.jp",    country:"Japan",          phone:"+81 90 1234 5678",  tier:"private",  since:"2021-06-20", totalPurchases:2, totalSpend:16200, lastContact:"2026-02-08", notes:"Traveled with La Dune to 32 countries.", referredBy:"Vogue Japan" },
    { id:"c3", name:"Catherine Lawson", email:"c.lawson@private.co.uk", country:"United Kingdom", phone:"+44 77 1234 5678",  tier:"private",  since:"2022-11-03", totalPurchases:1, totalSpend:14000, lastContact:"2026-01-28", notes:"Commission client 2023. Very detail-oriented.", referredBy:"Referral" },
    { id:"c4", name:"Soo-Jin Kim",      email:"sj.kim@private.kr",      country:"South Korea",    phone:"+82 10 1234 5678",  tier:"private",  since:"2020-09-15", totalPurchases:2, totalSpend:15800, lastContact:"2026-02-14", notes:"Extremely attentive to craft detail.", referredBy:"FT Article" },
    { id:"c5", name:"Margaux Delacroix",email:"m.delacroix@private.fr", country:"France",         phone:"+33 6 98 76 54 32", tier:"waitlist", since:"2026-01-15", totalPurchases:0, totalSpend:0,     lastContact:"2026-01-15", notes:"Applied for Private Client access.", referredBy:"Isabelle Morel" },
    { id:"c6", name:"Yuki Watanabe",    email:"y.watanabe@private.jp",  country:"Japan",          phone:"+81 80 9876 5432",  tier:"standard", since:"2025-04-10", totalPurchases:1, totalSpend:6800,  lastContact:"2025-12-01", notes:"Purchased La Dune Q I 2025.", referredBy:"Instagram" },
  ],
  commissions: [
    { id:"cm1", client:"c3", clientName:"Catherine Lawson", piece:"La Coupole",    type:"Structured Tote", status:"delivered", startDate:"2023-03-01", deliveryDate:"2023-11-14", artisan:"Marco Ferretti",  leather:"Tabac Grain-de-Poudre", hardware:"Palladium Brass",  lining:"Navy Suede",     price:18500, notes:"Client visited atelier during stitching stage.", progress:100 },
    { id:"cm2", client:"c1", clientName:"Isabelle Morel",   piece:"Commission TBD", type:"Evening Flap",   status:"design",    startDate:"2026-01-20", deliveryDate:"",           artisan:"Isabeau Renard",  leather:"TBD - samples sent",   hardware:"18k Gold Vermeil", lining:"TBD",            price:16000, notes:"Sketch series in progress.", progress:15 },
    { id:"cm3", client:"c2", clientName:"Naomi Tanaka",     piece:"Le Voyage",      type:"Large Tote",     status:"making",    startDate:"2025-10-01", deliveryDate:"2026-06-01", artisan:"Marco Ferretti",  leather:"Cognac Vachetta",      hardware:"Oxidised Bronze",  lining:"Ivory Lyonnais", price:22000, notes:"Maquette approved Dec 2025.", progress:55 },
  ],
  enquiries: [
    { id:"e1", from:"James Hartford", email:"j.hartford@email.com", subject:"La Boite - Q II 2026",       type:"product",     status:"new",         date:"2026-03-01", message:"I would like to inquire about acquiring La Boite. Is a viewing possible?", assignedTo:"Celeste" },
    { id:"e2", from:"Yuna Park",      email:"yuna.p@email.kr",      subject:"L Ombre Waitlist",           type:"waitlist",    status:"replied",     date:"2026-02-28", message:"Please add me to the waitlist for any future reissue.", assignedTo:"Celeste" },
    { id:"e3", from:"Thomas Richter", email:"t.richter@email.de",   subject:"Commission Enquiry",         type:"commission",  status:"in_progress", date:"2026-02-25", message:"Interested in a bespoke box bag for my wife's anniversary.", assignedTo:"Celeste" },
    { id:"e4", from:"Anna Bjork",     email:"a.bjork@email.se",     subject:"Restoration - 2019 piece",   type:"restoration", status:"new",         date:"2026-03-02", message:"The lining has begun to separate near the base pocket.", assignedTo:"Marco Ferretti" },
    { id:"e5", from:"Lucia Ferreira", email:"l.ferreira@press.pt",  subject:"Press Request - Wallpaper",  type:"press",       status:"replied",     date:"2026-02-20", message:"Preparing a feature on ultra-limited luxury for our May issue.", assignedTo:"Celeste" },
  ],
  links: SEED_LINKS,
  siteContent: {
    heroHeadline: "Each season, we make three things only.",
    heroSub: "Not a catalogue. Not a collection. Three singular objects, conceived over months, made by hand over weeks.",
    philosophyQuote: "We do not make more because we cannot make better. When we reach three, we stop.",
    quarterLabel: "Q II - 2026",
    footerLine: "Maison de Maroquinerie. Florence, since 1961. Three pieces. Every quarter. Nothing more.",
  },
  analytics: {
    revenueByQuarter: [
      { q:"Q III 2025", revenue:82400, pieces:3, clients:12 },
      { q:"Q IV 2025",  revenue:94600, pieces:3, clients:14 },
      { q:"Q I 2026",   revenue:78200, pieces:3, clients:11 },
      { q:"Q II 2026",  revenue:64200, pieces:3, clients:8  },
    ],
    clientsByCountry: [
      { country:"France", count:11 }, { country:"Japan", count:9 }, { country:"United Kingdom", count:7 },
      { country:"South Korea", count:6 }, { country:"United States", count:5 }, { country:"Germany", count:3 },
    ],
  },
};

// ─── HELPERS ────────────────────────────────────────────────
const fmt     = n => "$" + Number(n || 0).toLocaleString();
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—";
const uid     = () => Math.random().toString(36).slice(2, 9);
const genTok  = (t, n) => t.slice(0,3) + "-" + (n||"gen").replace(/\s+/g,"-").toLowerCase().slice(0,6) + "-" + new Date().getFullYear() + "-" + uid().slice(0,4);
const isExp   = d => d && new Date(d) < new Date();

const ROLE_COLORS = { owner:"#9A7B4F", director:"#7BA7C4", artisan:"#8BAF7C", press:"#B08080" };
const STATUS_COLORS = {
  active:"#8BAF7C", sold_out:"#B08080", archived:"#9C9488", draft:"#C4A06A",
  new:"#C4A06A", replied:"#8BAF7C", in_progress:"#7BA7C4", closed:"#9C9488",
  design:"#C4A06A", maquette:"#7BA7C4", leather_selection:"#9A7B4F", making:"#8BAF7C", review:"#E8C56A", delivered:"#6B9A6B",
  private:"#9A7B4F", waitlist:"#C4A06A", standard:"#9C9488",
};
const STATUS_LABELS = {
  active:"Available", sold_out:"Sold Out", archived:"Archived", draft:"Draft",
  new:"New", replied:"Replied", in_progress:"In Progress", closed:"Closed",
  design:"Design", maquette:"Maquette", leather_selection:"Leather", making:"Making", review:"Review", delivered:"Delivered",
  private:"Private", waitlist:"Waitlist", standard:"Standard",
  owner:"Owner", director:"Client Director", artisan:"Artisan", press:"Press",
  private_client:"Private Client", commission:"Commission",
};

// ─── GLOBAL CSS ─────────────────────────────────────────────
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Tenor+Sans&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0F0D0A;color:#F7F3EE;font-family:'Tenor Sans',sans-serif}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:#0F0D0A}
::-webkit-scrollbar-thumb{background:rgba(154,123,79,.3);border-radius:2px}
input,select,textarea,button{font-family:inherit}
select option{background:#1A1714;color:#F7F3EE}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.fade{animation:fadeUp .3s ease}
.hrow:hover{background:rgba(154,123,79,.05)!important;cursor:pointer}
`;

// ─── ATOMS ──────────────────────────────────────────────────
function Dot({ color }) {
  return <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:color||"#9C9488", flexShrink:0 }} />;
}

function Badge({ status, small }) {
  const c = STATUS_COLORS[status] || "#9C9488";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:small?8:9, letterSpacing:".2em", textTransform:"uppercase", color:c, background:c+"18", padding:small?"2px 7px":"4px 10px", borderRadius:2, border:"1px solid "+c+"28", whiteSpace:"nowrap" }}>
      <Dot color={c} />{STATUS_LABELS[status] || status}
    </span>
  );
}

function Bar({ pct, color }) {
  return (
    <div style={{ height:2, background:"rgba(255,255,255,.07)", borderRadius:1, overflow:"hidden", marginTop:5 }}>
      <div style={{ height:"100%", width:Math.min(100, pct||0)+"%", background:color||"#9A7B4F", transition:"width .5s ease" }} />
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", padding:"18px 20px", borderRadius:2 }}>
      <p style={{ fontSize:8, letterSpacing:".38em", textTransform:"uppercase", color:accent||"#9A7B4F", marginBottom:7 }}>{label}</p>
      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:30, color:"#F7F3EE", lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:9.5, color:"#9C9488", marginTop:5 }}>{sub}</p>}
    </div>
  );
}

function Btn({ children, onClick, variant, small, disabled }) {
  const v = variant || "pri";
  const styles = {
    pri:    { background:"#9A7B4F", border:"none", color:"#F7F3EE" },
    ghost:  { background:"none", border:"1px solid rgba(255,255,255,.1)", color:"#9C9488" },
    danger: { background:"none", border:"1px solid rgba(176,128,128,.3)", color:"#B08080" },
    bronze: { background:"rgba(154,123,79,.12)", border:"1px solid rgba(154,123,79,.28)", color:"#9A7B4F" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[v], padding:small?"5px 12px":"9px 18px", fontSize:small?8:9, letterSpacing:".24em", textTransform:"uppercase", cursor:disabled?"not-allowed":"pointer", borderRadius:1, opacity:disabled?.5:1, transition:"opacity .2s" }}>
      {children}
    </button>
  );
}

function Tag({ children, active, onClick, color }) {
  const c = color || "#9A7B4F";
  return (
    <button onClick={onClick} style={{ background:active?c+"18":"none", border:"1px solid "+(active?c:"rgba(255,255,255,.08)"), color:active?c:"#9C9488", padding:"5px 11px", fontSize:8, letterSpacing:".2em", textTransform:"uppercase", cursor:"pointer", borderRadius:1, transition:"all .2s" }}>
      {children}
    </button>
  );
}

// ─── MODAL ──────────────────────────────────────────────────
function Modal({ title, onClose, children, width }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div className="fade" style={{ background:"#16130F", border:"1px solid rgba(154,123,79,.18)", width:"100%", maxWidth:width||600, maxHeight:"90vh", overflow:"auto", borderRadius:2, padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:20, color:"#F7F3EE", fontWeight:400 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#9C9488", fontSize:16, cursor:"pointer", padding:4 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FIELD ──────────────────────────────────────────────────
function Field({ label, value, onChange, type, options, rows, readonly }) {
  const t = type || "text";
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:7.5, letterSpacing:".36em", textTransform:"uppercase", color:readonly?"rgba(154,123,79,.4)":"#9A7B4F", marginBottom:5 }}>{label}</label>
      {readonly ? (
        <p style={{ fontSize:13, color:"#9C9488", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>{value || "—"}</p>
      ) : options ? (
        <select value={value||""} onChange={e => onChange(e.target.value)} style={{ width:"100%", background:"#1E1B17", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 11px", fontSize:12, outline:"none", borderRadius:1 }}>
          {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value||""} onChange={e => onChange(e.target.value)} rows={rows} style={{ width:"100%", background:"#1E1B17", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 11px", fontSize:12, outline:"none", resize:"vertical", borderRadius:1 }} />
      ) : (
        <input type={t} value={value||""} onChange={e => onChange(e.target.value)} style={{ width:"100%", background:"#1E1B17", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 11px", fontSize:12, outline:"none", borderRadius:1 }} />
      )}
    </div>
  );
}

function FieldRow({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>{children}</div>;
}

function ModalActions({ onCancel, onSave, saveLabel }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:4, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.05)" }}>
      <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      <Btn onClick={onSave}>{saveLabel || "Save"}</Btn>
    </div>
  );
}

// ─── LOGIN ──────────────────────────────────────────────────
function Login({ users, onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function attempt() {
    if (!u || !p) return;
    setLoading(true);
    setErr("");
    await new Promise(r => setTimeout(r, 500));
    const list = Array.isArray(users) ? users : [];
    const found = list.find(x => x.username === u.trim() && x.password === p);
    if (found) {
      if (!found.active) { setErr("Account deactivated."); setLoading(false); return; }
      onLogin(found);
    } else {
      setErr("Incorrect credentials.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0F0D0A", display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", right:-40, bottom:-60, fontFamily:"'EB Garamond',serif", fontSize:"clamp(200px,28vw,360px)", color:"rgba(154,123,79,.04)", lineHeight:1, userSelect:"none" }}>A</div>
      <div className="fade" style={{ width:"100%", maxWidth:400, position:"relative", zIndex:2 }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <p style={{ fontSize:8, letterSpacing:".55em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:12 }}>Admin Portal</p>
          <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:42, fontWeight:400, color:"#F7F3EE", marginBottom:5 }}>AURELE</h1>
          <p style={{ fontSize:9.5, color:"#9C9488", letterSpacing:".15em" }}>Maison de Maroquinerie - Florence</p>
        </div>
        <div style={{ background:"#16130F", border:"1px solid rgba(154,123,79,.15)", borderRadius:2, padding:"32px 28px" }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:8, letterSpacing:".36em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:7 }}>Username</label>
            <input value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key==="Enter" && attempt()} autoFocus
              style={{ width:"100%", background:"#1A1714", border:"1px solid rgba(255,255,255,.08)", color:"#F7F3EE", padding:"11px 13px", fontSize:14, outline:"none", borderRadius:1 }} />
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={{ display:"block", fontSize:8, letterSpacing:".36em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:7 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={show?"text":"password"} value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key==="Enter" && attempt()}
                style={{ width:"100%", background:"#1A1714", border:"1px solid rgba(255,255,255,.08)", color:"#F7F3EE", padding:"11px 40px 11px 13px", fontSize:14, outline:"none", borderRadius:1, letterSpacing:".1em" }} />
              <button onClick={() => setShow(s => !s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#9C9488", cursor:"pointer", fontSize:9 }}>{show?"Hide":"Show"}</button>
            </div>
          </div>
          {err && <p style={{ fontSize:10, color:"#B08080", marginTop:10, marginBottom:4 }}>{err}</p>}
          <button onClick={attempt} disabled={loading || !u || !p}
            style={{ width:"100%", marginTop:16, background:loading||!u||!p?"rgba(154,123,79,.3)":"#9A7B4F", border:"none", color:"#F7F3EE", padding:13, fontSize:9, letterSpacing:".3em", textTransform:"uppercase", cursor:loading||!u||!p?"not-allowed":"pointer", borderRadius:1, transition:"background .3s" }}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:9, color:"rgba(156,148,136,.25)", marginTop:20 }}>admin / admin</p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard",   icon:"*", label:"Dashboard" },
  { id:"products",    icon:"-", label:"Products" },
  { id:"clients",     icon:"o", label:"Clients" },
  { id:"commissions", icon:"<", label:"Commissions" },
  { id:"enquiries",   icon:"@", label:"Enquiries" },
  { id:"content",     icon:"#", label:"Content" },
  { id:"analytics",   icon:"~", label:"Analytics" },
  { id:"links",       icon:"+", label:"Request Links" },
  { id:"users",       icon:"^", label:"Users and Roles" },
];

function Sidebar({ active, setActive, user, collapsed, setCollapsed, onLogout, newEnq }) {
  const allowed = (ROLES[user.role] || {}).access || [];
  const rc = ROLE_COLORS[user.role] || "#9A7B4F";
  return (
    <div style={{ width:collapsed?56:212, background:"#0A0907", borderRight:"1px solid rgba(154,123,79,.1)", display:"flex", flexDirection:"column", transition:"width .3s", flexShrink:0, position:"sticky", top:0, height:"100vh", overflow:"hidden" }}>
      <div style={{ padding:collapsed?"16px 10px":"20px 18px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:66 }}>
        {!collapsed && (
          <div>
            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, letterSpacing:".3em", color:"#F7F3EE" }}>AURELE</p>
            <p style={{ fontSize:7, letterSpacing:".35em", textTransform:"uppercase", color:"rgba(156,148,136,.4)", marginTop:2 }}>Admin</p>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{ background:"none", border:"none", color:"#9C9488", cursor:"pointer", fontSize:10, padding:3, flexShrink:0 }}>{collapsed?">>":"<<"}</button>
      </div>
      <nav style={{ flex:1, padding:"8px 6px", overflowY:"auto" }}>
        {NAV_ITEMS.filter(n => allowed.includes(n.id)).map(n => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => setActive(n.id)} title={collapsed?n.label:""} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:collapsed?"9px 11px":"8px 12px", background:on?"rgba(154,123,79,.12)":"none", border:"none", borderLeft:"2px solid "+(on?"#9A7B4F":"transparent"), color:on?"#F7F3EE":"#9C9488", cursor:"pointer", textAlign:"left", fontSize:9, letterSpacing:".16em", textTransform:"uppercase", transition:"all .2s", borderRadius:"0 1px 1px 0", marginBottom:1, justifyContent:collapsed?"center":"flex-start" }}>
              <span style={{ fontSize:11, flexShrink:0 }}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
              {n.id==="enquiries" && newEnq > 0 && !collapsed && (
                <span style={{ marginLeft:"auto", background:"#C4A06A", color:"#0F0D0A", fontSize:7.5, padding:"1px 5px", borderRadius:8 }}>{newEnq}</span>
              )}
            </button>
          );
        })}
      </nav>
      {!collapsed && (
        <div style={{ padding:"12px 18px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:rc+"20", border:"1px solid "+rc+"40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:rc, flexShrink:0 }}>{user.name[0]}</div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:11, color:"#F7F3EE", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</p>
              <Badge status={user.role} small />
            </div>
          </div>
          <button onClick={onLogout} style={{ background:"none", border:"1px solid rgba(255,255,255,.06)", color:"rgba(156,148,136,.45)", padding:"5px 0", fontSize:8, letterSpacing:".22em", textTransform:"uppercase", cursor:"pointer", borderRadius:1, width:"100%" }}>Sign Out</button>
        </div>
      )}
      {collapsed && (
        <div style={{ padding:"10px 6px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
          <button onClick={onLogout} title="Sign Out" style={{ background:"none", border:"none", color:"rgba(156,148,136,.35)", cursor:"pointer", width:"100%", fontSize:12, padding:5 }}>X</button>
        </div>
      )}
    </div>
  );
}

function PageHead({ eyebrow, title, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:10 }}>
      <div>
        <p style={{ fontSize:8, letterSpacing:".44em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:5 }}>{eyebrow}</p>
        <h2 style={{ fontFamily:"'EB Garamond',serif", fontSize:26, color:"#F7F3EE", fontWeight:400 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────
function Dashboard({ data, user }) {
  const allowed = (ROLES[user.role] || {}).access || [];
  const P = data.products || [];
  const E = data.enquiries || [];
  const C = data.commissions || [];
  const CL = data.clients || [];
  const rev = P.reduce((s, p) => s + (p.price||0) * (p.sold||0), 0);
  const newEnq = E.filter(e => e.status === "new").length;
  const myCom = user.role === "artisan"
    ? C.filter(c => c.artisan === user.name && c.status !== "delivered")
    : C.filter(c => c.status !== "delivered");
  const webEnq = E.filter(e => e.source === "website").length;

  return (
    <div className="fade">
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:8.5, letterSpacing:".42em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:6 }}>Welcome back</p>
        <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:"clamp(20px,3vw,32px)", fontWeight:400, color:"#F7F3EE" }}>
          Good morning, {user.name.split(" ")[0]}.
        </h1>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:9, marginBottom:22 }}>
        {allowed.includes("products") && <Stat label="Q II Revenue"   value={"$"+(rev/1000).toFixed(0)+"k"} sub="This quarter" />}
        {allowed.includes("clients")  && <Stat label="Private Clients" value={CL.filter(c=>c.tier==="private").length} sub="Active" accent="#7BA7C4" />}
        {allowed.includes("enquiries")&& <Stat label="New Enquiries"   value={newEnq} sub="Awaiting response" accent="#C4A06A" />}
        {allowed.includes("commissions")&&<Stat label={user.role==="artisan"?"My Work":"Active Commissions"} value={myCom.length} sub="In progress" accent="#8BAF7C" />}
        {allowed.includes("enquiries") && webEnq > 0 && <Stat label="From Website" value={webEnq} sub="Web submissions" accent="#8BAF7C" />}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
        {allowed.includes("products") && (
          <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
            <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:14 }}>Q II 2026 - Inventory</p>
            {P.filter(p => p.quarter==="Q II 2026").map(p => (
              <div key={p.id} style={{ padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:16, color:"#F7F3EE" }}>{p.name}</p>
                  <Badge status={p.status} small />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:9.5, color:"#9C9488" }}>{p.sold}/{p.edition} sold</span>
                  <span style={{ fontSize:12, color:"#9A7B4F", fontFamily:"'EB Garamond',serif" }}>{fmt(p.price)}</span>
                </div>
                <Bar pct={(p.sold/Math.max(1,p.edition))*100} />
              </div>
            ))}
          </div>
        )}
        {allowed.includes("commissions") && (
          <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
            <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:14 }}>
              {user.role==="artisan" ? "My Active Work" : "Active Commissions"}
            </p>
            {myCom.length === 0
              ? <p style={{ fontSize:12, color:"rgba(156,148,136,.35)", fontStyle:"italic" }}>No active commissions.</p>
              : myCom.map(c => (
                <div key={c.id} style={{ padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:"#F7F3EE" }}>{c.clientName}</p>
                    <Badge status={c.status} small />
                  </div>
                  <p style={{ fontSize:9.5, color:"#9C9488", marginBottom:3 }}>{c.piece} - {fmt(c.price)}</p>
                  <Bar pct={c.progress||0} />
                  <p style={{ fontSize:8.5, color:"rgba(156,148,136,.35)", marginTop:2 }}>{c.progress||0}%</p>
                </div>
              ))
            }
          </div>
        )}
        {allowed.includes("enquiries") && (
          <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
            <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:14 }}>Recent Enquiries</p>
            {E.slice(0,4).map(e => (
              <div key={e.id} style={{ padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, gap:6 }}>
                  <p style={{ fontSize:12, color:"#F7F3EE" }}>{e.from}</p>
                  <div style={{ display:"flex", gap:4 }}>
                    {e.source==="website" && <span style={{ fontSize:7, letterSpacing:".15em", textTransform:"uppercase", color:"#8BAF7C", background:"rgba(139,175,124,.1)", border:"1px solid rgba(139,175,124,.2)", padding:"1px 5px", borderRadius:1 }}>Web</span>}
                    <Badge status={e.status} small />
                  </div>
                </div>
                <p style={{ fontSize:9.5, color:"#9C9488" }}>{e.subject}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCTS ───────────────────────────────────────────────
function Products({ data, setData }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [qf, setQf] = useState("all");
  const P = data.products || [];
  const quarters = [...new Set(P.map(p => p.quarter))];
  const shown = qf === "all" ? P : P.filter(p => p.quarter === qf);

  function sf(k) { return v => setForm(f => ({...f, [k]:v})); }

  function openNew() {
    setForm({ id:"p"+uid(), name:"", subtitle:"", quarter:"Q III 2026", price:0, edition:1, sold:0, status:"draft", material:"", hardware:"", lining:"", artisan:"", description:"", visible:false });
    setModal("edit");
  }
  function openEdit(p) { setForm({...p}); setModal("edit"); }
  function save() {
    setData(d => {
      const arr = d.products || [];
      return { ...d, products: arr.find(p => p.id===form.id) ? arr.map(p => p.id===form.id?form:p) : [...arr, form] };
    });
    setModal(null);
  }
  function del(id) {
    if (confirm("Delete this product?")) setData(d => ({...d, products:(d.products||[]).filter(p=>p.id!==id)}));
  }

  return (
    <div className="fade">
      <PageHead eyebrow="Inventory" title="Products" action={<Btn onClick={openNew}>+ Add Product</Btn>} />
      <div style={{ display:"flex", gap:5, marginBottom:16, flexWrap:"wrap" }}>
        {["all",...quarters].map(q => <Tag key={q} active={qf===q} onClick={() => setQf(q)}>{q}</Tag>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:9 }}>
        {shown.map(p => (
          <div key={p.id} style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ padding:"16px 16px 11px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                <div>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"#F7F3EE", marginBottom:1 }}>{p.name}</p>
                  <p style={{ fontSize:8.5, color:"#9C9488", letterSpacing:".1em" }}>{p.quarter}</p>
                </div>
                <Badge status={p.status} small />
              </div>
              <p style={{ fontSize:10, color:"#9C9488", marginBottom:9 }}>{p.subtitle}</p>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"#9A7B4F" }}>{fmt(p.price)}</span>
                <span style={{ fontSize:9.5, color:"#9C9488" }}>{p.sold}/{p.edition}</span>
              </div>
              <Bar pct={(p.sold/Math.max(1,p.edition))*100} />
            </div>
            <div style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:7 }}>
              <Dot color={p.visible?"#8BAF7C":"#9C9488"} />
              <span style={{ fontSize:8, color:p.visible?"#8BAF7C":"#9C9488", letterSpacing:".15em", textTransform:"uppercase" }}>{p.visible?"Live":"Hidden"}</span>
              <div style={{ marginLeft:"auto", display:"flex", gap:7 }}>
                <button onClick={() => openEdit(p)} style={{ background:"none", border:"none", color:"#9C9488", fontSize:8.5, cursor:"pointer", letterSpacing:".18em", textTransform:"uppercase" }}>Edit</button>
                <button onClick={() => del(p.id)} style={{ background:"none", border:"none", color:"#B08080", fontSize:8.5, cursor:"pointer", letterSpacing:".18em", textTransform:"uppercase" }}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal==="edit" && (
        <Modal title={P.find(p=>p.id===form.id)?"Edit Product":"New Product"} onClose={() => setModal(null)}>
          <FieldRow>
            <Field label="Name" value={form.name} onChange={sf("name")} />
            <Field label="Subtitle" value={form.subtitle} onChange={sf("subtitle")} />
          </FieldRow>
          <FieldRow>
            <Field label="Quarter" value={form.quarter} onChange={sf("quarter")} />
            <Field label="Status" value={form.status} onChange={sf("status")} options={["draft","active","sold_out","archived"].map(s=>({value:s,label:STATUS_LABELS[s]||s}))} />
          </FieldRow>
          <FieldRow>
            <Field label="Price (USD)" value={form.price} onChange={v => sf("price")(+v)} type="number" />
            <Field label="Edition" value={form.edition} onChange={v => sf("edition")(+v)} type="number" />
          </FieldRow>
          <FieldRow>
            <Field label="Sold" value={form.sold} onChange={v => sf("sold")(+v)} type="number" />
            <Field label="Artisan" value={form.artisan} onChange={sf("artisan")} />
          </FieldRow>
          <Field label="Material" value={form.material} onChange={sf("material")} />
          <Field label="Hardware" value={form.hardware} onChange={sf("hardware")} />
          <Field label="Lining" value={form.lining} onChange={sf("lining")} />
          <Field label="Description" value={form.description} onChange={sf("description")} rows={3} />
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
            <input type="checkbox" id="vis" checked={!!form.visible} onChange={e => sf("visible")(e.target.checked)} style={{ accentColor:"#9A7B4F" }} />
            <label htmlFor="vis" style={{ fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"#9C9488", cursor:"pointer" }}>Visible on website</label>
          </div>
          <ModalActions onCancel={() => setModal(null)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS ────────────────────────────────────────────────
function Clients({ data, setData, user }) {
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [tf, setTf] = useState("all");
  const CL = data.clients || [];
  const C  = data.commissions || [];
  const shown = CL.filter(c =>
    (tf==="all" || c.tier===tf) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  );
  const client = sel ? CL.find(c => c.id===sel) || null : null;
  function sf(k) { return v => setForm(f => ({...f, [k]:v})); }
  function openEdit(c) {
    setForm(c || { id:"c"+uid(), name:"", email:"", country:"", phone:"", tier:"standard", since:new Date().toISOString().slice(0,10), totalPurchases:0, totalSpend:0, lastContact:"", notes:"", referredBy:"" });
    setModal("edit");
  }
  function save() {
    setData(d => {
      const arr = d.clients || [];
      return { ...d, clients: arr.find(c=>c.id===form.id) ? arr.map(c=>c.id===form.id?form:c) : [...arr,form] };
    });
    setModal(null);
  }
  function del(id) {
    if (confirm("Delete client?")) { setData(d => ({...d, clients:(d.clients||[]).filter(c=>c.id!==id)})); setSel(null); }
  }

  return (
    <div className="fade" style={{ display:"grid", gridTemplateColumns:client?"minmax(240px,290px) 1fr":"1fr", gap:12, minHeight:"60vh" }}>
      <div>
        <PageHead eyebrow="CRM" title="Clients" action={<Btn small onClick={() => openEdit(null)}>+ Add</Btn>} />
        <div style={{ display:"flex", gap:5, marginBottom:9, flexWrap:"wrap" }}>
          {["all","private","waitlist","standard"].map(t => <Tag key={t} active={tf===t} onClick={() => setTf(t)}>{t}</Tag>)}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width:"100%", background:"#1A1714", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 11px", fontSize:11, outline:"none", borderRadius:1, marginBottom:7 }} />
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {shown.map(c => (
            <button key={c.id} onClick={() => setSel(c.id)} className="hrow" style={{ background:sel===c.id?"rgba(154,123,79,.09)":"#1A1714", border:"1px solid "+(sel===c.id?"rgba(154,123,79,.22)":"rgba(255,255,255,.04)"), padding:"11px 13px", cursor:"pointer", textAlign:"left", borderRadius:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3, gap:6 }}>
                <p style={{ fontSize:12, color:"#F7F3EE" }}>{c.name}</p>
                <div style={{ display:"flex", gap:4 }}>
                  {c.referredBy==="Website" && <span style={{ fontSize:7, letterSpacing:".15em", textTransform:"uppercase", color:"#7BA7C4", background:"rgba(123,167,196,.1)", border:"1px solid rgba(123,167,196,.2)", padding:"1px 5px", borderRadius:1 }}>Web</span>}
                  <Badge status={c.tier} small />
                </div>
              </div>
              <p style={{ fontSize:9, color:"#9C9488" }}>{c.country} - {fmt(c.totalSpend)}</p>
            </button>
          ))}
        </div>
      </div>
      {client && (
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.05)", flexWrap:"wrap", gap:9 }}>
            <div>
              <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:24, color:"#F7F3EE", fontWeight:400, marginBottom:3 }}>{client.name}</h3>
              <p style={{ fontSize:9.5, color:"#9C9488" }}>{client.email}</p>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              <Badge status={client.tier} />
              <Btn small variant="bronze" onClick={() => openEdit(client)}>Edit</Btn>
              <Btn small variant="ghost" onClick={() => setSel(null)}>X</Btn>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:8, marginBottom:16 }}>
            {[["Country",client.country],["Since",fmtDate(client.since)],["Purchases",client.totalPurchases],["Spend",fmt(client.totalSpend)],["Last Contact",fmtDate(client.lastContact)],["Referred",client.referredBy]].map(([l,v]) => (
              <div key={l} style={{ background:"#16130F", padding:"10px 12px", borderRadius:1 }}>
                <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:3 }}>{l}</p>
                <p style={{ fontSize:12, color:"#F7F3EE" }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ background:"#16130F", borderRadius:1, padding:"12px 14px", marginBottom:12 }}>
            <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:7 }}>Notes</p>
            <p style={{ fontSize:12, color:"#9C9488", lineHeight:1.85 }}>{client.notes || "No notes."}</p>
          </div>
          {C.filter(c => c.client===client.id).length > 0 && (
            <div>
              <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:9 }}>Commissions</p>
              {C.filter(c => c.client===client.id).map(c => (
                <div key={c.id} style={{ background:"#16130F", borderRadius:1, padding:"11px 13px", marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"#F7F3EE" }}>{c.piece}</p>
                    <Badge status={c.status} small />
                  </div>
                  <p style={{ fontSize:9.5, color:"#9C9488", marginBottom:4 }}>{fmt(c.price)} - {fmtDate(c.startDate)}</p>
                  <Bar pct={c.progress||0} />
                </div>
              ))}
            </div>
          )}
          {user.role==="owner" && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,.05)" }}>
              <Btn small variant="danger" onClick={() => del(client.id)}>Delete Client</Btn>
            </div>
          )}
        </div>
      )}
      {modal==="edit" && (
        <Modal title={CL.find(c=>c.id===form.id)?"Edit Client":"New Client"} onClose={() => setModal(null)}>
          <FieldRow>
            <Field label="Full Name" value={form.name} onChange={sf("name")} />
            <Field label="Email" value={form.email} onChange={sf("email")} />
          </FieldRow>
          <FieldRow>
            <Field label="Country" value={form.country} onChange={sf("country")} />
            <Field label="Phone" value={form.phone} onChange={sf("phone")} />
          </FieldRow>
          <FieldRow>
            <Field label="Tier" value={form.tier} onChange={sf("tier")} options={["private","waitlist","standard"].map(t=>({value:t,label:STATUS_LABELS[t]||t}))} />
            <Field label="Referred By" value={form.referredBy} onChange={sf("referredBy")} />
          </FieldRow>
          <FieldRow>
            <Field label="Purchases" value={form.totalPurchases} onChange={v=>sf("totalPurchases")(+v)} type="number" />
            <Field label="Total Spend" value={form.totalSpend} onChange={v=>sf("totalSpend")(+v)} type="number" />
          </FieldRow>
          <Field label="Last Contact" value={form.lastContact} onChange={sf("lastContact")} type="date" />
          <Field label="Notes" value={form.notes} onChange={sf("notes")} rows={3} />
          <ModalActions onCancel={() => setModal(null)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

// ─── COMMISSIONS ────────────────────────────────────────────
function Commissions({ data, setData, user }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const STAGES = ["design","maquette","leather_selection","making","review","delivered"];
  const C = data.commissions || [];
  const mine = user.role==="artisan" ? C.filter(c=>c.artisan===user.name) : C;
  function sf(k) { return v => setForm(f => ({...f,[k]:v})); }
  function openEdit(c) {
    setForm(c || { id:"cm"+uid(), client:"", clientName:"", piece:"", type:"", status:"design", startDate:new Date().toISOString().slice(0,10), deliveryDate:"", artisan:"", leather:"", hardware:"", lining:"", price:0, notes:"", progress:0 });
    setModal("edit");
  }
  function save() {
    setData(d => {
      const arr = d.commissions || [];
      return { ...d, commissions: arr.find(c=>c.id===form.id) ? arr.map(c=>c.id===form.id?form:c) : [...arr,form] };
    });
    setModal(null);
  }

  return (
    <div className="fade">
      <PageHead eyebrow="Bespoke" title="Commissions" action={user.role!=="artisan" && <Btn onClick={() => openEdit(null)}>+ New Commission</Btn>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:7, marginBottom:22 }}>
        {STAGES.map(s => {
          const items = mine.filter(c => c.status===s);
          return (
            <div key={s} style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:"11px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
                <Badge status={s} small />
                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"#9C9488" }}>{items.length}</span>
              </div>
              {items.map(c => (
                <div key={c.id} onClick={() => openEdit(c)} className="hrow" style={{ background:"#16130F", borderRadius:1, padding:"9px 10px", marginBottom:4 }}>
                  <p style={{ fontSize:11, color:"#F7F3EE", marginBottom:1 }}>{c.clientName}</p>
                  <p style={{ fontSize:9, color:"#9C9488" }}>{c.piece}</p>
                  <Bar pct={c.progress||0} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {mine.map(c => (
          <div key={c.id} onClick={() => openEdit(c)} className="hrow" style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:"14px 18px", display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:9 }}>
              {[["Client",c.clientName],["Piece",c.piece],["Value",fmt(c.price)],["Artisan",c.artisan],["Started",fmtDate(c.startDate)]].map(([l,v]) => (
                <div key={l}>
                  <p style={{ fontSize:7.5, letterSpacing:".26em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:3 }}>{l}</p>
                  <p style={{ fontSize:11.5, color:"#F7F3EE" }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign:"right" }}>
              <Badge status={c.status} />
              <p style={{ fontSize:8.5, color:"rgba(156,148,136,.4)", marginTop:5 }}>{c.progress||0}%</p>
            </div>
          </div>
        ))}
      </div>
      {modal==="edit" && (
        <Modal title={C.find(c=>c.id===form.id)?"Edit Commission":"New Commission"} onClose={() => setModal(null)} width={660}>
          <FieldRow>
            <Field label="Client Name" value={form.clientName} onChange={sf("clientName")} />
            <Field label="Piece Name" value={form.piece} onChange={sf("piece")} />
          </FieldRow>
          <FieldRow>
            <Field label="Type" value={form.type} onChange={sf("type")} />
            <Field label="Price (USD)" value={form.price} onChange={v=>sf("price")(+v)} type="number" />
          </FieldRow>
          <FieldRow>
            <Field label="Artisan" value={form.artisan} onChange={sf("artisan")} readonly={user.role==="artisan"} />
            <Field label="Status" value={form.status} onChange={sf("status")} options={STAGES.map(s=>({value:s,label:STATUS_LABELS[s]||s}))} />
          </FieldRow>
          <FieldRow>
            <Field label="Progress %" value={form.progress} onChange={v=>sf("progress")(Math.min(100,Math.max(0,+v)))} type="number" />
            <Field label="Start Date" value={form.startDate} onChange={sf("startDate")} type="date" />
          </FieldRow>
          <Field label="Est. Delivery" value={form.deliveryDate} onChange={sf("deliveryDate")} type="date" />
          <Field label="Leather" value={form.leather} onChange={sf("leather")} />
          <Field label="Hardware" value={form.hardware} onChange={sf("hardware")} />
          <Field label="Lining" value={form.lining} onChange={sf("lining")} />
          <Field label="Notes" value={form.notes} onChange={sf("notes")} rows={3} />
          <ModalActions onCancel={() => setModal(null)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

// ─── ENQUIRIES ──────────────────────────────────────────────
function Enquiries({ data, setData }) {
  const [sel, setSel] = useState(null);
  const [sf, setSf] = useState("all");
  const [reply, setReply] = useState("");
  const E = data.enquiries || [];
  const shown = sf==="all" ? E : E.filter(e => e.status===sf || e.type===sf);
  const enq = sel ? E.find(e => e.id===sel) || null : null;
  function setStatus(id, s) {
    setData(d => ({ ...d, enquiries:(d.enquiries||[]).map(e => e.id===id?{...e,status:s}:e) }));
  }

  return (
    <div className="fade" style={{ display:"grid", gridTemplateColumns:enq?"minmax(260px,310px) 1fr":"1fr", gap:12, minHeight:"60vh" }}>
      <div>
        <PageHead eyebrow="Inbox" title="Enquiries" />
        <div style={{ display:"flex", gap:4, marginBottom:9, flexWrap:"wrap" }}>
          {["all","new","replied","in_progress","commission","waitlist","press","restoration"].map(f => (
            <Tag key={f} active={sf===f} onClick={() => setSf(f)}>{f.replace(/_/g," ")}</Tag>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {shown.map(e => (
            <button key={e.id} onClick={() => setSel(e.id)} className="hrow" style={{ background:sel===e.id?"rgba(154,123,79,.08)":"#1A1714", border:"1px solid "+(sel===e.id?"rgba(154,123,79,.2)":"rgba(255,255,255,.04)"), padding:"11px 13px", cursor:"pointer", textAlign:"left", borderRadius:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, gap:5, alignItems:"flex-start" }}>
                <p style={{ fontSize:12, color:"#F7F3EE" }}>{e.from}</p>
                <div style={{ display:"flex", gap:3 }}>
                  {e.source==="website" && <span style={{ fontSize:7, letterSpacing:".15em", textTransform:"uppercase", color:"#8BAF7C", background:"rgba(139,175,124,.1)", border:"1px solid rgba(139,175,124,.2)", padding:"1px 5px", borderRadius:1, whiteSpace:"nowrap" }}>Web</span>}
                  <Badge status={e.status} small />
                </div>
              </div>
              <p style={{ fontSize:10, color:"#9C9488", marginBottom:2 }}>{e.subject}</p>
              <p style={{ fontSize:8.5, color:"rgba(156,148,136,.35)", letterSpacing:".06em" }}>{fmtDate(e.date)}</p>
            </button>
          ))}
        </div>
      </div>
      {enq && (
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,.05)", flexWrap:"wrap", gap:9 }}>
            <div>
              <p style={{ fontSize:8, color:"#9A7B4F", letterSpacing:".3em", textTransform:"uppercase", marginBottom:5 }}>{enq.type} - {fmtDate(enq.date)}</p>
              <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:20, color:"#F7F3EE", fontWeight:400 }}>{enq.subject}</h3>
            </div>
            <Btn small variant="ghost" onClick={() => setSel(null)}>X</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8, marginBottom:14 }}>
            {[["From",enq.from],["Email",enq.email],["Assigned",enq.assignedTo]].map(([l,v]) => (
              <div key={l} style={{ background:"#16130F", padding:"9px 11px", borderRadius:1 }}>
                <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:3 }}>{l}</p>
                <p style={{ fontSize:11.5, color:"#F7F3EE" }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ background:"#16130F", borderRadius:1, padding:"12px 14px", marginBottom:14 }}>
            <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:7 }}>Message</p>
            <p style={{ fontSize:12.5, lineHeight:1.85, color:"#9C9488" }}>{enq.message}</p>
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
            {["new","replied","in_progress","closed"].map(s => (
              <Tag key={s} active={enq.status===s} onClick={() => setStatus(enq.id, s)}>Mark {STATUS_LABELS[s]||s}</Tag>
            ))}
          </div>
          <p style={{ fontSize:7.5, letterSpacing:".28em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:6 }}>Draft Reply</p>
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Write a reply..."
            style={{ width:"100%", background:"#16130F", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"9px 11px", fontFamily:"inherit", fontSize:12.5, outline:"none", resize:"vertical", borderRadius:1, marginBottom:8 }} />
          <div style={{ display:"flex", gap:7 }}>
            <Btn onClick={() => { setStatus(enq.id,"replied"); setReply(""); }} disabled={!reply.trim()}>Send and Mark Replied</Btn>
            <Btn variant="ghost" onClick={() => setReply("")}>Clear</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTENT ────────────────────────────────────────────────
function Content({ data, setData }) {
  const [tab, setTab] = useState("products");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const P = data.products || [];
  const SC = data.siteContent || SEED_DATA.siteContent;
  function setSC(k, v) { setData(d => ({ ...d, siteContent:{ ...(d.siteContent||SEED_DATA.siteContent), [k]:v } })); }

  return (
    <div className="fade">
      <PageHead eyebrow="CMS" title="Content Management" />
      <div style={{ display:"flex", gap:5, marginBottom:20 }}>
        {[["products","Product Copy"],["site","Live Site Copy"]].map(([id,lbl]) => (
          <Tag key={id} active={tab===id} onClick={() => setTab(id)}>{lbl}</Tag>
        ))}
      </div>
      {tab==="products" && (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {P.map(p => (
            <div key={p.id} style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                <div>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"#F7F3EE", marginBottom:1 }}>{p.name}</p>
                  <p style={{ fontSize:8.5, letterSpacing:".18em", textTransform:"uppercase", color:"#9C9488" }}>{p.quarter}</p>
                </div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
                  <Badge status={p.status} small />
                  <Btn small variant="bronze" onClick={() => { setDraft({...p}); setEditId(p.id); }}>Edit Copy</Btn>
                  <Btn small variant="ghost" onClick={() => setData(d => ({ ...d, products:(d.products||[]).map(pp=>pp.id===p.id?{...pp,visible:!pp.visible}:pp) }))}>
                    {p.visible ? "Hide" : "Show"}
                  </Btn>
                </div>
              </div>
              {editId===p.id ? (
                <div>
                  <Field label="Name" value={draft.name} onChange={v => setDraft(f=>({...f,name:v}))} />
                  <Field label="Subtitle" value={draft.subtitle} onChange={v => setDraft(f=>({...f,subtitle:v}))} />
                  <Field label="Description" value={draft.description} onChange={v => setDraft(f=>({...f,description:v}))} rows={3} />
                  <div style={{ display:"flex", gap:7 }}>
                    <Btn onClick={() => { setData(d=>({...d,products:(d.products||[]).map(pp=>pp.id===p.id?draft:pp)})); setEditId(null); }}>Save</Btn>
                    <Btn variant="ghost" onClick={() => setEditId(null)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize:12.5, lineHeight:1.85, color:"#9C9488", maxWidth:680 }}>{p.description || "No description."}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {tab==="site" && (
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:8.5, letterSpacing:".2em", textTransform:"uppercase", color:"#8BAF7C", background:"rgba(139,175,124,.08)", border:"1px solid rgba(139,175,124,.2)", padding:"6px 13px", borderRadius:1, marginBottom:16 }}>
            Changes publish live to the website instantly
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:9 }}>
            {[["heroHeadline","Hero Headline",1],["heroSub","Hero Subtext",2],["philosophyQuote","Philosophy Quote",2],["quarterLabel","Quarter Label",1],["footerLine","Footer Tagline",2]].map(([id,lbl,rows]) => (
              <div key={id} style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:"16px 18px" }}>
                <p style={{ fontSize:7.5, letterSpacing:".3em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:7 }}>{lbl}</p>
                <textarea rows={rows} value={SC[id]||""} onChange={e => setSC(id, e.target.value)}
                  style={{ width:"100%", background:"#16130F", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 10px", fontSize:12, outline:"none", resize:"vertical", borderRadius:1, lineHeight:1.7 }} />
                <p style={{ fontSize:8, color:"rgba(156,148,136,.3)", marginTop:4 }}>Auto-saves - live on website</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ──────────────────────────────────────────────
function Analytics({ data }) {
  const P  = data.products || [];
  const CL = data.clients  || [];
  const C  = data.commissions || [];
  const RQ = (data.analytics || {}).revenueByQuarter || [];
  const CC = (data.analytics || {}).clientsByCountry || [];
  const maxRev = Math.max(1, ...RQ.map(q=>q.revenue));
  const totalRev = RQ.reduce((s,q)=>s+q.revenue,0);
  const soldP = P.filter(p=>p.sold>0);
  const avgVal = soldP.length > 0 ? soldP.reduce((s,p)=>s+p.price,0)/soldP.length : 0;

  return (
    <div className="fade">
      <PageHead eyebrow="Reporting" title="Analytics" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:9, marginBottom:22 }}>
        <Stat label="Lifetime Revenue" value={"$"+(totalRev/1000).toFixed(0)+"k"} sub="Last 4 quarters" />
        <Stat label="Avg Piece Value"  value={fmt(Math.round(avgVal))} sub="Active pieces" />
        <Stat label="Total Clients"    value={CL.length} sub={CL.filter(c=>c.tier==="private").length+" private"} accent="#7BA7C4" />
        <Stat label="Commissions"      value={C.length} sub={C.filter(c=>c.status==="delivered").length+" delivered"} accent="#8BAF7C" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
          <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:16 }}>Revenue by Quarter</p>
          {RQ.map(q => (
            <div key={q.q} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:9.5, color:"#9C9488" }}>{q.q}</span>
                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"#F7F3EE" }}>{fmt(q.revenue)}</span>
              </div>
              <div style={{ height:4, background:"rgba(255,255,255,.06)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:((q.revenue/maxRev)*100)+"%", background:"linear-gradient(to right,#9A7B4F,#C4A06A)", borderRadius:2 }} />
              </div>
              <p style={{ fontSize:8, color:"rgba(156,148,136,.35)", marginTop:2 }}>{q.pieces} pieces - {q.clients} clients</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
          <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:16 }}>Clients by Country</p>
          {CC.map((c,i) => (
            <div key={c.country} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
              <span style={{ fontSize:9.5, color:"#9C9488", width:105, flexShrink:0 }}>{c.country}</span>
              <div style={{ flex:1, height:3, background:"rgba(255,255,255,.05)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:((c.count/Math.max(1,(CC[0]||{count:1}).count))*100)+"%", background:i===0?"#9A7B4F":"rgba(154,123,79,.35)", borderRadius:2 }} />
              </div>
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"#F7F3EE", width:16, textAlign:"right", flexShrink:0 }}>{c.count}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
          <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:16 }}>Product Sell-Through</p>
          {P.map(p => (
            <div key={p.id} style={{ marginBottom:11 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, color:"#F7F3EE" }}>{p.name} <span style={{ fontSize:8.5, color:"#9C9488" }}>{p.quarter}</span></span>
                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"#9A7B4F" }}>{fmt((p.price||0)*(p.sold||0))}</span>
              </div>
              <Bar pct={((p.sold||0)/Math.max(1,p.edition||1))*100} />
              <p style={{ fontSize:8, color:"rgba(156,148,136,.3)", marginTop:1 }}>{p.sold||0}/{p.edition||0}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, padding:20 }}>
          <p style={{ fontSize:8, letterSpacing:".34em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:16 }}>Client Tier Spend</p>
          {["private","waitlist","standard"].map(tier => {
            const cs = CL.filter(c => c.tier===tier);
            const spend = cs.reduce((s,c)=>s+(c.totalSpend||0),0);
            return (
              <div key={tier} style={{ background:"#16130F", borderRadius:1, padding:"11px 13px", marginBottom:7, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <Badge status={tier} small />
                  <p style={{ fontSize:8.5, color:"rgba(156,148,136,.4)", marginTop:5 }}>{cs.length} client{cs.length!==1?"s":""}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"#F7F3EE" }}>{fmt(spend)}</p>
                  <p style={{ fontSize:8, color:"rgba(156,148,136,.3)" }}>total spend</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST LINKS ──────────────────────────────────────────
const LINK_TYPES = [
  { v:"private_client", l:"Private Client Application", c:"#9A7B4F", desc:"Pre-filled private client application form" },
  { v:"commission",     l:"Commission Enquiry",         c:"#7BA7C4", desc:"Commission request form pre-filled for a client" },
  { v:"waitlist",       l:"Waitlist Reservation",       c:"#C4A06A", desc:"Adds recipient directly to product waitlist" },
  { v:"press",          l:"Press / Editorial Access",   c:"#B08080", desc:"Temporary press access for editorial enquiries" },
];

function Links({ data, setData, user }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type:"private_client", clientName:"", email:"", label:"", expires:"" });
  const [copied, setCopied] = useState(null);
  const LK = data.links || [];

  function copy(token) {
    navigator.clipboard.writeText("https://aurele.com/access/"+token).catch(()=>{});
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }
  function gen() {
    const lk = { id:"lk"+uid(), type:form.type, label:form.label || (LINK_TYPES.find(t=>t.v===form.type)||{}).l+" - "+(form.clientName||"General"), token:genTok(form.type,form.clientName||form.label), clientName:form.clientName||null, email:form.email||null, created:new Date().toISOString().slice(0,10), expires:form.expires||null, used:false, createdBy:user.name };
    setData(d => ({ ...d, links:[...(d.links||[]),lk] }));
    setModal(null);
    setForm({ type:"private_client", clientName:"", email:"", label:"", expires:"" });
  }
  function del(id) {
    if (confirm("Revoke link?")) setData(d => ({ ...d, links:(d.links||[]).filter(l=>l.id!==id) }));
  }

  return (
    <div className="fade">
      <PageHead eyebrow="Access Management" title="Request Links" action={<Btn onClick={() => setModal("gen")}>+ Generate Link</Btn>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:8, marginBottom:22 }}>
        {LINK_TYPES.map(t => (
          <div key={t.v} style={{ background:"#1A1714", border:"1px solid "+t.c+"20", borderRadius:2, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
              <Dot color={t.c} />
              <p style={{ fontSize:8.5, letterSpacing:".2em", textTransform:"uppercase", color:t.c }}>{t.l}</p>
            </div>
            <p style={{ fontSize:10, color:"rgba(156,148,136,.5)", lineHeight:1.55 }}>{t.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, overflow:"hidden" }}>
        {LK.length===0 && (
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"rgba(156,148,136,.3)", fontStyle:"italic" }}>No links generated yet.</p>
          </div>
        )}
        {LK.map(lk => {
          const lt = LINK_TYPES.find(t => t.v===lk.type) || {};
          const exp = isExp(lk.expires);
          const sc = lk.used?"#9C9488":exp?"#B08080":"#8BAF7C";
          const sl = lk.used?"Used":exp?"Expired":"Active";
          return (
            <div key={lk.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto auto", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
              <div style={{ padding:"12px 13px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <Dot color={lt.c} />
                  <p style={{ fontSize:12, color:"#F7F3EE" }}>{lk.label}</p>
                </div>
                <p style={{ fontSize:8.5, color:"rgba(156,148,136,.4)", fontFamily:"monospace" }}>{lk.token}</p>
              </div>
              <div style={{ padding:"12px 13px" }}>
                <p style={{ fontSize:11.5, color:"#9C9488" }}>{lk.clientName||"—"}</p>
                <p style={{ fontSize:9.5, color:"rgba(156,148,136,.4)" }}>{lk.email||"Open"}</p>
              </div>
              <div style={{ padding:"12px 13px", display:"flex", alignItems:"center", gap:5 }}>
                <Dot color={sc} />
                <span style={{ fontSize:8.5, letterSpacing:".18em", textTransform:"uppercase", color:sc }}>{sl}</span>
              </div>
              <div style={{ padding:"12px 13px" }}>
                <p style={{ fontSize:11, color:"#9C9488" }}>{fmtDate(lk.created)}</p>
                {lk.expires && <p style={{ fontSize:9, color:exp?"#B08080":"rgba(156,148,136,.35)" }}>Exp {fmtDate(lk.expires)}</p>}
              </div>
              <div style={{ padding:"8px 9px", display:"flex", flexDirection:"column", gap:5, justifyContent:"center" }}>
                <Btn small variant="bronze" onClick={() => copy(lk.token)}>{copied===lk.token?"Copied":"Copy"}</Btn>
                <Btn small variant="danger" onClick={() => del(lk.id)}>Revoke</Btn>
              </div>
            </div>
          );
        })}
      </div>
      {modal==="gen" && (
        <Modal title="Generate Request Link" onClose={() => setModal(null)}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:8, letterSpacing:".36em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:8 }}>Link Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {LINK_TYPES.map(t => (
                <button key={t.v} onClick={() => setForm(f=>({...f,type:t.v}))} style={{ background:form.type===t.v?t.c+"16":"#1A1714", border:"1px solid "+(form.type===t.v?t.c:"rgba(255,255,255,.07)"), padding:"11px 13px", cursor:"pointer", textAlign:"left", borderRadius:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <Dot color={t.c} />
                    <p style={{ fontSize:8.5, letterSpacing:".16em", textTransform:"uppercase", color:t.c }}>{t.l}</p>
                  </div>
                  <p style={{ fontSize:9, color:"rgba(156,148,136,.45)", lineHeight:1.5 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <FieldRow>
            <Field label="Label" value={form.label} onChange={v => setForm(f=>({...f,label:v}))} />
            <Field label="Expiry Date" value={form.expires} onChange={v => setForm(f=>({...f,expires:v}))} type="date" />
          </FieldRow>
          <FieldRow>
            <Field label="Recipient Name" value={form.clientName} onChange={v => setForm(f=>({...f,clientName:v}))} />
            <Field label="Recipient Email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} />
          </FieldRow>
          <ModalActions onCancel={() => setModal(null)} onSave={gen} saveLabel="Generate Link" />
        </Modal>
      )}
    </div>
  );
}

// ─── USERS ──────────────────────────────────────────────────
function Users({ users, setUsers, user: currentUser }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [showPw, setShowPw] = useState(false);
  const U = Array.isArray(users) ? users : [];
  function sf(k) { return v => setForm(f=>({...f,[k]:v})); }
  function openEdit(u) {
    setForm(u || { id:"u"+uid(), username:"", password:"", name:"", role:"artisan", email:"", active:true, lastLogin:null });
    setModal("edit");
  }
  function save() {
    setUsers(us => {
      const arr = Array.isArray(us) ? us : [];
      return arr.find(u=>u.id===form.id) ? arr.map(u=>u.id===form.id?form:u) : [...arr,form];
    });
    setModal(null);
  }
  function del(id) {
    if (id===currentUser.id) { alert("Cannot delete your own account."); return; }
    if (confirm("Delete user?")) setUsers(us => (Array.isArray(us)?us:[]).filter(u=>u.id!==id));
  }
  function toggle(id) {
    setUsers(us => (Array.isArray(us)?us:[]).map(u=>u.id===id?{...u,active:!u.active}:u));
  }

  return (
    <div className="fade">
      <PageHead eyebrow="Administration" title="Users and Roles" action={<Btn onClick={() => openEdit(null)}>+ Add User</Btn>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:8, marginBottom:22 }}>
        {Object.entries(ROLES).map(([role,def]) => (
          <div key={role} style={{ background:"#1A1714", border:"1px solid "+def.color+"20", borderRadius:2, padding:"13px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <Dot color={def.color} />
              <p style={{ fontSize:8.5, letterSpacing:".2em", textTransform:"uppercase", color:def.color }}>{def.label}</p>
            </div>
            <p style={{ fontSize:9, color:"rgba(156,148,136,.45)", marginBottom:8 }}>{def.access.length} modules</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
              {def.access.map(a => (
                <span key={a} style={{ fontSize:7, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(156,148,136,.4)", background:"rgba(255,255,255,.04)", padding:"2px 5px", borderRadius:1 }}>{a}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"#1A1714", border:"1px solid rgba(255,255,255,.05)", borderRadius:2, overflow:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 140px 100px 120px", minWidth:600 }}>
          {["Name / Username","Email","Role","Status","Actions"].map(h => (
            <div key={h} style={{ padding:"9px 13px", fontSize:7.5, letterSpacing:".3em", textTransform:"uppercase", color:"#9A7B4F", borderBottom:"1px solid rgba(255,255,255,.06)" }}>{h}</div>
          ))}
          {U.map(u => (
            <React.Fragment key={u.id}>
              <div style={{ padding:"11px 13px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:(ROLE_COLORS[u.role]||"#9A7B4F")+"18", border:"1px solid "+(ROLE_COLORS[u.role]||"#9A7B4F")+"35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:ROLE_COLORS[u.role]||"#9A7B4F", flexShrink:0 }}>{u.name[0]}</div>
                <div>
                  <p style={{ fontSize:12, color:"#F7F3EE" }}>{u.name}</p>
                  <p style={{ fontSize:9, color:"rgba(156,148,136,.45)", fontFamily:"monospace" }}>{u.username}</p>
                </div>
              </div>
              <div style={{ padding:"11px 13px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <p style={{ fontSize:11.5, color:"#9C9488" }}>{u.email}</p>
              </div>
              <div style={{ padding:"11px 13px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", alignItems:"center" }}>
                <Badge status={u.role} small />
              </div>
              <div style={{ padding:"11px 13px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", alignItems:"center" }}>
                <button onClick={() => toggle(u.id)} style={{ background:u.active?"rgba(139,175,124,.1)":"rgba(176,128,128,.1)", border:"1px solid "+(u.active?"rgba(139,175,124,.28)":"rgba(176,128,128,.22)"), color:u.active?"#8BAF7C":"#B08080", padding:"4px 10px", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", cursor:"pointer", borderRadius:1 }}>
                  {u.active?"Active":"Off"}
                </button>
              </div>
              <div style={{ padding:"8px 9px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", flexDirection:"column", gap:4, justifyContent:"center" }}>
                <Btn small variant="bronze" onClick={() => openEdit(u)}>Edit</Btn>
                {u.id!==currentUser.id && <Btn small variant="danger" onClick={() => del(u.id)}>Delete</Btn>}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      {modal==="edit" && (
        <Modal title={U.find(u=>u.id===form.id)?"Edit User":"New User"} onClose={() => setModal(null)}>
          <FieldRow>
            <Field label="Full Name" value={form.name} onChange={sf("name")} />
            <Field label="Email" value={form.email} onChange={sf("email")} />
          </FieldRow>
          <FieldRow>
            <Field label="Username" value={form.username} onChange={sf("username")} />
            <Field label="Role" value={form.role} onChange={sf("role")} options={Object.entries(ROLES).map(([v,d])=>({value:v,label:d.label}))} />
          </FieldRow>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:7.5, letterSpacing:".36em", textTransform:"uppercase", color:"#9A7B4F", marginBottom:5 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw?"text":"password"} value={form.password||""} onChange={e => sf("password")(e.target.value)}
                style={{ width:"100%", background:"#1E1B17", border:"1px solid rgba(255,255,255,.07)", color:"#F7F3EE", padding:"8px 40px 8px 11px", fontSize:12, outline:"none", borderRadius:1 }} />
              <button onClick={() => setShowPw(s=>!s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#9C9488", cursor:"pointer", fontSize:9 }}>
                {showPw?"Hide":"Show"}
              </button>
            </div>
          </div>
          <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:14 }}>
            <input type="checkbox" id="uact" checked={!!form.active} onChange={e => sf("active")(e.target.checked)} style={{ accentColor:"#9A7B4F" }} />
            <label htmlFor="uact" style={{ fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"#9C9488", cursor:"pointer" }}>Account active</label>
          </div>
          <ModalActions onCancel={() => setModal(null)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
const PAGES = { dashboard:Dashboard, products:Products, clients:Clients, commissions:Commissions, enquiries:Enquiries, content:Content, analytics:Analytics, links:Links, users:Users };

export default function App() {
  const [session,  setSession]  = useState(null);
  const [users,    setUsers]    = useState(null);
  const [data,     setData]     = useState(null);
  const [active,   setActive]   = useState("dashboard");
  const [collapsed,setCol]      = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    (async () => {
      const [rawUsers, rawData, rawSession] = await Promise.all([
        S.get(USERS_KEY),
        S.getLive(),
        S.get(SESSION_KEY),
      ]);
      // Users — always force admin/admin for u1
      const baseUsers = rawUsers
        ? rawUsers.map(u => u.id==="u1" ? {...u, username:"admin", password:"admin"} : u)
        : SEED_USERS;
      setUsers(baseUsers);
      // Data — deep merge to ensure all keys exist
      const d = {
        products:    (rawData && rawData.products)    || SEED_DATA.products,
        clients:     (rawData && rawData.clients)     || SEED_DATA.clients,
        commissions: (rawData && rawData.commissions) || SEED_DATA.commissions,
        enquiries:   (rawData && rawData.enquiries)   || SEED_DATA.enquiries,
        links:       (rawData && rawData.links)       || SEED_DATA.links,
        siteContent: (rawData && rawData.siteContent) || SEED_DATA.siteContent,
        analytics:   (rawData && rawData.analytics)   || SEED_DATA.analytics,
      };
      setData(d);
      // Session
      if (rawSession) {
        const found = baseUsers.find(u => u.id===rawSession.id && u.active);
        if (found) setSession(found);
      }
      setReady(true);
    })();
  }, []);

  // Autosave data → shared storage (website reads this)
  useEffect(() => {
    if (!data) return;
    setSaving(true);
    const t = setTimeout(async () => { await S.setLive(data); setSaving(false); }, 700);
    return () => clearTimeout(t);
  }, [data]);

  // Autosave users → private storage
  useEffect(() => { if (users) S.set(USERS_KEY, users); }, [users]);

  async function handleLogin(u) {
    const updated = {...u, lastLogin:new Date().toISOString()};
    setUsers(us => (Array.isArray(us)?us:[]).map(x => x.id===u.id ? updated : x));
    await S.set(SESSION_KEY, { id:u.id });
    setSession(updated);
  }

  async function handleLogout() {
    await S.del(SESSION_KEY);
    setSession(null);
  }

  if (!ready) {
    return (
      <div style={{ minHeight:"100vh", background:"#0F0D0A", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{GCSS}</style>
        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:20, color:"rgba(154,123,79,.4)", letterSpacing:".25em" }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <style>{GCSS}</style>
        <Login users={users || SEED_USERS} onLogin={handleLogin} />
      </>
    );
  }

  const Page   = PAGES[active] || Dashboard;
  const newEnq = ((data && data.enquiries) || []).filter(e => e.status==="new").length;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F0D0A" }}>
      <style>{GCSS}</style>
      <Sidebar active={active} setActive={setActive} user={session} collapsed={collapsed} setCollapsed={setCol} onLogout={handleLogout} newEnq={newEnq} />
      <main style={{ flex:1, padding:"clamp(14px,2.8vw,34px)", overflowY:"auto", minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, marginBottom:22, flexWrap:"wrap" }}>
          <span style={{ fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:saving?"#C4A06A":"rgba(156,148,136,.25)" }}>
            {saving ? "Saving..." : "Saved"}
          </span>
          <div style={{ width:1, height:11, background:"rgba(255,255,255,.07)" }} />
          <span style={{ fontSize:8, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(156,148,136,.25)" }}>
            {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
          </span>
          {session.role==="owner" && (
            <button onClick={async () => { if (confirm("Reset all data to defaults?")) { const d={...SEED_DATA}; setData(d); await S.setLive(d); } }}
              style={{ background:"none", border:"1px solid rgba(255,255,255,.05)", color:"rgba(156,148,136,.25)", padding:"4px 10px", fontSize:7.5, letterSpacing:".2em", textTransform:"uppercase", cursor:"pointer", borderRadius:1 }}>
              Reset Data
            </button>
          )}
        </div>
        {data && <Page data={data} setData={setData} user={session} users={users} setUsers={setUsers} />}
      </main>
    </div>
  );
}
