import React, { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MAISON AURELE — Combined Website + Admin CRM
// Navigate to #admin for the CRM panel
// ═══════════════════════════════════════════════════════════════


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

function CRMApp({ onExitAdmin }) {
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
    if (onExitAdmin) onExitAdmin();
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


// ═══════════════════════════════════════════════════════════════
// WEBSITE
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════
// SHARED STORAGE — same key the CRM writes to
// ═══════════════════════════════════════════════════════════
// STORAGE_KEY same as LIVE_KEY in CRM - shared

// Website uses shared S.getLive/S.setLive from CRM storage module above

// ═══════════════════════════════════════════════════════════
// SEED — used only if CRM hasn't written yet
// ═══════════════════════════════════════════════════════════
const WEB_SEED = {
  products: [
    { id:"p1", name:"La Dune",   subtitle:"Structured Tote · Sablé Calfskin",     quarter:"Q II 2026", price:6800,  edition:12, sold:8,  status:"active",   material:"Vachetta Calfskin",        hardware:"18k Gold Vermeil",     lining:"Lyonnais Silk, Ivory",  artisan:"Marco Ferretti",  description:"Inspired by the shifting geometries of coastal dunes at first light. The body is formed over a hand-carved ash wood mould, then released — retaining its architectural tension permanently.", visible:true  },
    { id:"p2", name:"L'Ombre",   subtitle:"Evening Flap · Smoked Patent",          quarter:"Q II 2026", price:9400,  edition:8,  sold:8,  status:"sold_out", material:"Smoked Patent Calfskin",    hardware:"Oxidised Bronze",      lining:"Ebony Suede",           artisan:"Isabeau Renard",  description:"The light disappears into it. Patent calfskin hand-finished with a technique our atelier developed over forty years produces a surface that absorbs rather than reflects.",                  visible:true  },
    { id:"p3", name:"La Boîte",  subtitle:"Box Bag · Grain-de-Poudre Calf",        quarter:"Q II 2026", price:11200, edition:6,  sold:0,  status:"active",   material:"Grain-de-Poudre Calfskin",  hardware:"Palladium-plated Brass",lining:"Tabac Goatskin Suede",  artisan:"Marco Ferretti",  description:"The form is derived from 18th-century cartonnage — the art of covered box-making practised in bookbinding ateliers across Lyon. A collaboration with master bookbinder Claude Breton.",    visible:true  },
  ],
  enquiries: [],
  clients: [],
  commissions: [],
  siteContent: {
    heroHeadline: "Each season, we make three things only.",
    heroSub: "Not a catalogue. Not a collection. Three singular objects, conceived over months, made by hand over weeks, and offered to those who understand the difference.",
    philosophyQuote: "We do not make more because we cannot make better. When we reach three, we stop. The fourth would be a lie.",
    quarterLabel: "Q II · 2026",
    footerLine: "Maison de Maroquinerie. Florence, since 1961. Three pieces. Every quarter. Nothing more.",
  }
};

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════
// fmt — defined in CRM section above
// uid — defined in CRM section above

// ═══════════════════════════════════════════════════════════
// BAG SVGs
// ═══════════════════════════════════════════════════════════
const BagTote = () => (
  <svg viewBox="0 0 360 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 40px 70px rgba(24,20,15,0.18))"}}>
    <path d="M108 118 Q108 56 180 56 Q252 56 252 118" stroke="#9A7B4F" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <ellipse cx="180" cy="396" rx="100" ry="10" fill="rgba(24,20,15,0.1)"/>
    <rect x="44" y="124" width="272" height="260" rx="4" fill="#C8A870"/>
    <rect x="44" y="124" width="272" height="260" rx="4" fill="url(#gt)"/>
    <line x1="180" y1="132" x2="180" y2="376" stroke="rgba(154,100,40,0.22)" strokeWidth="1.5"/>
    <rect x="158" y="230" width="44" height="28" rx="2" fill="#9A7B4F"/>
    <circle cx="180" cy="244" r="4.5" fill="#C4A06A"/>
    <rect x="56" y="136" width="248" height="236" rx="2" fill="none" stroke="rgba(154,100,40,0.28)" strokeWidth="1.5" strokeDasharray="5 4"/>
    <text x="180" y="340" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#9A7B4F" letterSpacing="6" opacity="0.5">AURÈLE</text>
    <defs>
      <linearGradient id="gt" x1="44" y1="124" x2="316" y2="384" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D4B878" stopOpacity=".45"/>
        <stop offset="45%" stopColor="transparent"/>
        <stop offset="100%" stopColor="#5C3A10" stopOpacity=".3"/>
      </linearGradient>
    </defs>
  </svg>
);

const BagFlap = () => (
  <svg viewBox="0 0 360 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 40px 80px rgba(0,0,0,0.55))"}}>
    <ellipse cx="180" cy="400" rx="120" ry="11" fill="rgba(0,0,0,0.4)"/>
    <rect x="40" y="160" width="280" height="220" rx="3" fill="#1A1510"/>
    <rect x="40" y="160" width="280" height="220" rx="3" fill="url(#gf1)"/>
    <path d="M40 160 L40 260 L180 295 L320 260 L320 160 Z" fill="#14110D"/>
    <path d="M40 160 L40 260 L180 295 L320 260 L320 160 Z" fill="url(#gf2)"/>
    <circle cx="180" cy="282" r="18" fill="#9A7B4F"/>
    <circle cx="180" cy="282" r="13" fill="#7A5E38"/>
    <circle cx="180" cy="282" r="5" fill="#C4A06A"/>
    <rect x="52" y="172" width="256" height="196" rx="2" fill="none" stroke="rgba(196,160,106,.1)" strokeWidth="1.5" strokeDasharray="5 4"/>
    <text x="180" y="344" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#9A7B4F" letterSpacing="6" opacity="0.4">AURÈLE</text>
    <defs>
      <linearGradient id="gf1" x1="40" y1="160" x2="320" y2="380" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4D3E2A" stopOpacity=".4"/>
        <stop offset="100%" stopColor="black" stopOpacity=".5"/>
      </linearGradient>
      <linearGradient id="gf2" x1="40" y1="160" x2="320" y2="295" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="white" stopOpacity=".05"/>
        <stop offset="100%" stopColor="transparent"/>
      </linearGradient>
    </defs>
  </svg>
);

const BagBox = () => (
  <svg viewBox="0 0 360 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 44px 72px rgba(24,20,15,0.18))"}}>
    <ellipse cx="180" cy="400" rx="100" ry="9" fill="rgba(24,20,15,0.1)"/>
    <rect x="60" y="150" width="240" height="230" rx="2" fill="#6B5040"/>
    <rect x="60" y="150" width="240" height="230" rx="2" fill="url(#gb1)"/>
    <path d="M60 150 L40 170 L40 395 L60 380 Z" fill="#5A4235"/>
    <path d="M300 150 L320 170 L320 395 L300 380 Z" fill="#5A4235"/>
    <rect x="60" y="150" width="240" height="72" rx="2" fill="#7A5D48"/>
    <rect x="163" y="192" width="34" height="22" rx="2" fill="#9A7B4F"/>
    <path d="M170 192 L170 184 Q180 176 190 184 L190 192" stroke="#9A7B4F" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <circle cx="180" cy="203" r="4" fill="#C4A06A"/>
    <rect x="148" y="128" width="64" height="28" rx="14" fill="none" stroke="#9A7B4F" strokeWidth="6"/>
    <rect x="72" y="162" width="216" height="208" rx="1" fill="none" stroke="rgba(154,123,79,.22)" strokeWidth="1" strokeDasharray="4 3.5"/>
    <text x="180" y="318" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#9A7B4F" letterSpacing="6" opacity="0.5">AURÈLE</text>
    <defs>
      <linearGradient id="gb1" x1="60" y1="150" x2="300" y2="380" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A07050" stopOpacity=".28"/>
        <stop offset="60%" stopColor="transparent"/>
        <stop offset="100%" stopColor="black" stopOpacity=".22"/>
      </linearGradient>
    </defs>
  </svg>
);

const BAG_COMPONENTS = { p1: BagTote, p2: BagFlap, p3: BagBox };
const CANVAS_BG = { p1: "#E8E0D4", p2: "#1E1B17", p3: "#D4C8B8" };

// ═══════════════════════════════════════════════════════════
// AVAILABILITY BADGE
// ═══════════════════════════════════════════════════════════
const AvailBadge = ({ product }) => {
  const remaining = product.edition - product.sold;
  const pct = product.sold / product.edition;
  if (product.status === "sold_out" || remaining <= 0)
    return <div style={{display:"flex",alignItems:"center",gap:8,fontSize:8.5,letterSpacing:".28em",textTransform:"uppercase",color:"#9C9488"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#B08080",display:"inline-block"}}/> Sold out — Join waitlist</div>;
  if (pct >= 0.66)
    return <div style={{display:"flex",alignItems:"center",gap:8,fontSize:8.5,letterSpacing:".28em",textTransform:"uppercase",color:"#9C9488"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#C4A06A",display:"inline-block"}}/>{remaining} of {product.edition} remaining</div>;
  return <div style={{display:"flex",alignItems:"center",gap:8,fontSize:8.5,letterSpacing:".28em",textTransform:"uppercase",color:"#9C9488"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#8BAF7C",display:"inline-block",animation:"pulse 2.5s ease-in-out infinite"}}/>{remaining} of {product.edition} available</div>;
};

// ═══════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════
const Toast = ({ msg, visible }) => (
  <div style={{position:"fixed",bottom:32,left:"50%",transform:`translateX(-50%) translateY(${visible?0:20}px)`,opacity:visible?1:0,transition:"all .4s ease",zIndex:9000,background:"#18140F",border:"1px solid rgba(154,123,79,.35)",padding:"14px 28px",fontSize:10,letterSpacing:".22em",textTransform:"uppercase",color:"#C4A06A",whiteSpace:"nowrap",pointerEvents:"none"}}>
    ✦ {msg}
  </div>
);

// ═══════════════════════════════════════════════════════════
// FORM COMPONENTS
// ═══════════════════════════════════════════════════════════
const FormField = ({ label, value, onChange, type = "text", options, placeholder }) => (
  <div style={{borderBottom:"1px solid rgba(24,20,15,.12)",marginBottom:22,paddingBottom:10}}>
    <label style={{display:"block",fontSize:7.5,letterSpacing:".38em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:7}}>{label}</label>
    {options
      ? <select value={value} onChange={e => onChange(e.target.value)} style={{width:"100%",background:"none",border:"none",outline:"none",fontFamily:"'EB Garamond',serif",fontSize:16,color:"#18140F",letterSpacing:".04em",WebkitAppearance:"none"}}>
          {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{width:"100%",background:"none",border:"none",outline:"none",fontFamily:"'EB Garamond',serif",fontSize:16,color:"#18140F",letterSpacing:".04em"}}/>
    }
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN WEBSITE
// ═══════════════════════════════════════════════════════════
function AureleWebsite({ onOpenAdmin }) {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "inquire"|"waitlist"|"contact", product?: {} }
  const [form, setForm] = useState({});
  const [toast, setToast] = useState({ msg: "", visible: false });
  const [mobileNav, setMobileNav] = useState(false);
  const [navPinned, setNavPinned] = useState(false);
  const [revealed, setRevealed] = useState(new Set());
  const revealRefs = useRef([]);

  // Load live data from shared storage
  useEffect(() => {
    (async () => {
      const live = await S.getLive();
      setSiteData(live || WEB_SEED);
      setLoading(false);
    })();
  }, []);

  // Scroll nav pin
  useEffect(() => {
    const fn = () => setNavPinned(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Intersection reveal
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setRevealed(s => new Set([...s, e.target.dataset.rid]));
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [siteData]);

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  // Write form submissions back to shared storage → CRM sees them
  const submitForm = async (type) => {
    if (!form.name || !form.email) return;
    const now = new Date().toISOString().slice(0, 10);
    const newData = { ...siteData };

    if (type === "inquire" || type === "waitlist") {
      // Add to enquiries
      const enq = {
        id: `e${uid()}`,
        from: form.name,
        email: form.email,
        subject: type === "waitlist"
          ? `Waitlist — ${modal.product?.name}`
          : `Enquiry — ${modal.product?.name}`,
        type: type === "waitlist" ? "waitlist" : "product",
        status: "new",
        source: "website",
        date: now,
        message: form.message || `${type === "waitlist" ? "Waitlist request" : "Enquiry"} for ${modal.product?.name}. Phone: ${form.phone || "not provided"}.`,
        assignedTo: "Céleste",
      };
      newData.enquiries = [enq, ...(siteData.enquiries || [])];

      // Also add/update client record
      const existing = (siteData.clients || []).find(c => c.email === form.email);
      if (!existing) {
        const client = {
          id: `c${uid()}`,
          name: form.name,
          email: form.email,
          country: form.country || "",
          phone: form.phone || "",
          tier: "standard",
          since: now,
          totalPurchases: 0,
          totalSpend: 0,
          lastContact: now,
          notes: `Submitted ${type} form for ${modal.product?.name} via website.`,
          referredBy: "Website",
        };
        newData.clients = [client, ...(siteData.clients || [])];
      }
    }

    if (type === "commission") {
      const comm = {
        id: `cm${uid()}`,
        client: uid(),
        clientName: form.name,
        piece: "Commission TBD",
        type: form.pieceType || "Bespoke",
        status: "design",
        startDate: now,
        deliveryDate: null,
        artisan: "",
        leather: "",
        hardware: "",
        lining: "",
        price: 0,
        notes: form.message || "",
        progress: 0,
      };
      newData.commissions = [comm, ...(siteData.commissions || [])];
      // Also add as enquiry
      const enq = {
        id: `e${uid()}`,
        from: form.name,
        email: form.email,
        subject: `Commission Request — ${form.pieceType || "Bespoke"}`,
        type: "commission",
        status: "new",
        source: "website",
        date: now,
        message: form.message || "Commission enquiry submitted via website.",
        assignedTo: "Céleste",
      };
      newData.enquiries = [enq, ...(siteData.enquiries || [])];
    }

    if (type === "contact") {
      const enq = {
        id: `e${uid()}`,
        from: form.name,
        email: form.email,
        subject: form.subject || "General Enquiry",
        type: form.enquiryType || "general",
        status: "new",
        source: "website",
        date: now,
        message: form.message || "",
        assignedTo: "Céleste",
      };
      newData.enquiries = [enq, ...(siteData.enquiries || [])];
    }

    if (type === "waitlist_page") {
      const enq = {
        id: `e${uid()}`,
        from: form.name,
        email: form.email,
        subject: `Private Access Request — ${form.preference || "General"}`,
        type: "waitlist",
        status: "new",
        source: "website",
        date: now,
        message: `Private client access request. Preference: ${form.preference || "unspecified"}`,
        assignedTo: "Céleste",
      };
      newData.enquiries = [enq, ...(siteData.enquiries || [])];
      if (!(siteData.clients || []).find(c => c.email === form.email)) {
        newData.clients = [{
          id: `c${uid()}`, name: form.name, email: form.email, country: "", phone: "",
          tier: "waitlist", since: now, totalPurchases: 0, totalSpend: 0,
          lastContact: now, notes: `Submitted private access request for ${form.preference}.`, referredBy: "Website",
        }, ...(siteData.clients || [])];
      }
    }

    setSiteData(newData);
    await S.setLive(newData);
    setModal(null);
    setForm({});
    showToast(type === "commission" ? "Commission request received" : type === "contact" ? "Message sent" : "Request received — we'll be in touch");
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#F7F3EE",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{fontFamily:"'EB Garamond',serif",fontSize:22,color:"rgba(154,123,79,.4)",letterSpacing:".25em"}}>…</p>
    </div>
  );

  const products = (siteData.products || []).filter(p => p.visible && p.quarter === "Q II 2026");
  const content = siteData.siteContent || SEED.siteContent;

  const ref = (i) => el => { revealRefs.current[i] = el; };
  const vis = (i) => revealed.has(String(i)) ? "1" : "0";
  const ry = (i) => revealed.has(String(i)) ? "0" : "28px";

  return (
    <div style={{fontFamily:"'Tenor Sans',sans-serif",background:"#F7F3EE",color:"#18140F",overflowX:"hidden",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Tenor+Sans&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--bone:#F7F3EE;--paper:#EDE8E0;--linen:#E0D8CD;--bronze:#9A7B4F;--bronze-lt:#C4A06A;--ink:#18140F;--ash:#9C9488;--faint:rgba(24,20,15,0.08);--pad-x:clamp(20px,5vw,64px)}
        html{scroll-behavior:smooth}
        img,svg{display:block;max-width:100%}
        @keyframes ruleIn{from{height:0;opacity:0}to{height:60px;opacity:1}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes scrollPulse{0%,100%{opacity:.35}50%{opacity:1}}
        body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:8000;mix-blend-mode:multiply;opacity:.5}
        .btn-arrow{display:inline-flex;align-items:center;gap:18px;font-size:9.5px;letter-spacing:.35em;text-transform:uppercase;color:#18140F;text-decoration:none;transition:gap .3s;cursor:pointer;background:none;border:none;font-family:inherit}
        .btn-arrow::after{content:'——';color:#9A7B4F;font-size:11px}
        .btn-arrow:hover{gap:28px}
        .btn-dark{font-size:9px;letter-spacing:.32em;text-transform:uppercase;color:#F7F3EE;background:#18140F;text-decoration:none;padding:16px clamp(20px,3vw,40px);display:inline-block;transition:background .3s;cursor:pointer;border:none;font-family:inherit;white-space:nowrap}
        .btn-dark:hover{background:#9A7B4F}
        .btn-ghost{font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:#9C9488;text-decoration:none;border-bottom:1px solid #E0D8CD;padding-bottom:4px;transition:color .3s,border-color .3s;white-space:nowrap;cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;font-family:inherit}
        .btn-ghost:hover{color:#18140F;border-color:#18140F}
        .field-group{display:flex;flex-direction:column;border-bottom:1px solid rgba(24,20,15,.1);margin-bottom:22px;padding-bottom:10px}
        .field-group label{font-size:7.5px;letter-spacing:.38em;text-transform:uppercase;color:#9A7B4F;margin-bottom:7px}
        .field-group input,.field-group select,.field-group textarea{background:none;border:none;outline:none;font-family:'EB Garamond',serif;font-size:16px;color:#18140F;letter-spacing:.04em;-webkit-appearance:none;resize:none;width:100%}
        .field-group input::placeholder,.field-group textarea::placeholder{color:#E0D8CD}
        @media(max-width:900px){.nav-center,.nav-right{display:none!important}}
        @media(min-width:900px){.hamburger{display:none!important}}
      `}</style>

      <Toast msg={toast.msg} visible={toast.visible} />

      {/* Mobile Menu */}
      {mobileNav && (
        <div style={{position:"fixed",inset:0,zIndex:550,background:"#F7F3EE",display:"flex",flexDirection:"column",justifyContent:"center",padding:"80px var(--pad-x)",animation:"fadeSlide .3s ease"}}>
          {["Collections","Maison","Atelier","Commissions"].map(item => (
            <a key={item} href="#" onClick={() => setMobileNav(false)} style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(26px,6vw,40px)",fontWeight:400,color:"#18140F",textDecoration:"none",padding:"14px 0",borderBottom:"1px solid rgba(24,20,15,.07)",letterSpacing:".04em",display:"block"}}>{item}</a>
          ))}
          <div style={{marginTop:36,display:"flex",gap:28}}>
            <a href="#" style={{fontSize:9,letterSpacing:".35em",textTransform:"uppercase",color:"#9C9488",textDecoration:"none"}}>Private Client</a>
            <a href="#" style={{fontSize:9,letterSpacing:".35em",textTransform:"uppercase",color:"#9C9488",textDecoration:"none"}}>Contact</a>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"space-between",padding:navPinned?"18px var(--pad-x)":"28px var(--pad-x)",transition:"all .4s",background:navPinned?"rgba(247,243,238,0.95)":"transparent",backdropFilter:navPinned?"blur(16px) saturate(1.2)":"none",borderBottom:navPinned?"1px solid rgba(24,20,15,.07)":"1px solid transparent"}}>
        <a href="#" style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(14px,2.5vw,18px)",letterSpacing:".36em",textTransform:"uppercase",color:"#18140F",textDecoration:"none",flexShrink:0,zIndex:600}}>AURÈLE<sup style={{fontSize:8,color:"#9A7B4F",letterSpacing:".1em",verticalAlign:"super",marginLeft:3}}>®</sup></a>
        <div className="nav-center" style={{display:"flex",gap:44,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
          {["Maison","Collections","Atelier","Commissions"].map(item => (
            <a key={item} href="#" style={{fontSize:9.5,letterSpacing:".28em",textTransform:"uppercase",color:"#9C9488",textDecoration:"none",transition:"color .3s"}}>{item}</a>
          ))}
        </div>
        <div className="nav-right" style={{display:"flex",gap:24,alignItems:"center"}}>
          <a href="#" style={{fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:"#9C9488",textDecoration:"none"}}>Private Client</a>
          <a href="#waitlist" style={{fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:"#9C9488",textDecoration:"none"}}>Reserve</a>
        </div>
        <button className="hamburger" onClick={() => setMobileNav(v => !v)} style={{display:"flex",flexDirection:"column",gap:5,background:"none",border:"none",cursor:"pointer",padding:6,zIndex:600}}>
          {mobileNav ? <span style={{fontSize:18,color:"#18140F",lineHeight:1}}>✕</span> : <>
            <span style={{display:"block",width:24,height:1,background:"#18140F"}}/>
            <span style={{display:"block",width:24,height:1,background:"#18140F"}}/>
            <span style={{display:"block",width:24,height:1,background:"#18140F"}}/>
          </>}
        </button>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100svh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(100px,18vw,160px) var(--pad-x) clamp(60px,10vw,100px)",position:"relative",overflow:"hidden"}}>
        <div style={{width:1,height:60,background:"#9A7B4F",marginBottom:40,animation:"ruleIn 1.2s cubic-bezier(.16,1,.3,1) .3s forwards",opacity:0}}/>
        <p style={{fontSize:9,letterSpacing:".42em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:28,animation:"fadeSlide .9s ease .6s forwards",opacity:0}}>{content.quarterLabel} &nbsp;·&nbsp; Three Pieces. Nothing More.</p>
        <h1 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(44px,9vw,110px)",fontWeight:400,lineHeight:.96,letterSpacing:"-.01em",color:"#18140F",maxWidth:800,marginBottom:40,animation:"fadeSlide .9s ease .8s forwards",opacity:0}}>
          {content.heroHeadline.split(" ").map((w,i) => w === "three" ? <em key={i} style={{fontStyle:"italic",color:"#9A7B4F"}}>{w} </em> : w + " ")}
        </h1>
        <p style={{fontSize:"clamp(11px,1.4vw,13px)",lineHeight:2,letterSpacing:".06em",color:"#9C9488",maxWidth:380,marginBottom:52,animation:"fadeSlide .9s ease 1s forwards",opacity:0}}>{content.heroSub}</p>
        <button className="btn-arrow" style={{animation:"fadeSlide .9s ease 1.2s forwards",opacity:0}} onClick={() => document.getElementById("pieces")?.scrollIntoView({behavior:"smooth"})}>See this quarter's pieces</button>
        <div style={{position:"absolute",right:-10,bottom:-40,fontFamily:"'EB Garamond',serif",fontSize:"clamp(180px,28vw,420px)",fontWeight:400,color:"rgba(154,123,79,0.05)",lineHeight:1,pointerEvents:"none",userSelect:"none",letterSpacing:"-.05em"}}>III</div>
      </section>

      {/* DIVIDER */}
      <div style={{display:"flex",alignItems:"center",gap:24,padding:"0 var(--pad-x)"}}>
        <div style={{flex:1,height:1,background:"rgba(24,20,15,.07)"}}/>
        <span style={{fontFamily:"'EB Garamond',serif",fontSize:10,letterSpacing:".32em",color:"#9A7B4F",textTransform:"uppercase",whiteSpace:"nowrap"}}>{content.quarterLabel}</span>
        <div style={{flex:1,height:1,background:"rgba(24,20,15,.07)"}}/>
      </div>

      {/* PRODUCTS — live from CRM */}
      <section id="pieces" style={{padding:"clamp(72px,10vw,120px) var(--pad-x)"}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:"clamp(48px,8vw,100px)",flexWrap:"wrap",rowGap:8}}>
          <span style={{fontSize:9,letterSpacing:".42em",textTransform:"uppercase",color:"#9C9488"}}>This Quarter's Works</span>
          <div style={{flex:1,height:1,minWidth:40,background:"linear-gradient(to right,rgba(24,20,15,.07),transparent)"}}/>
          <span style={{fontFamily:"'EB Garamond',serif",fontSize:11,letterSpacing:".2em",color:"#9A7B4F"}}>{products.length} of {products.length}</span>
        </div>

        {/* Live sync indicator */}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:8.5,letterSpacing:".22em",textTransform:"uppercase",color:"#9C9488",background:"rgba(154,123,79,.06)",border:"1px solid rgba(154,123,79,.15)",padding:"6px 14px",borderRadius:1,marginBottom:48}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#8BAF7C",animation:"pulse 2s ease-in-out infinite",display:"inline-block"}}/>
          Live inventory — synced with atelier
        </div>

        {products.map((product, idx) => {
          const BagComp = BAG_COMPONENTS[product.id] || BagTote;
          const bg = CANVAS_BG[product.id] || "#E8E0D4";
          const dark = product.id === "p2";
          const even = idx % 2 === 1;
          const rid = `prod-${idx}`;
          const remaining = product.edition - product.sold;
          const isSoldOut = product.status === "sold_out" || remaining <= 0;

          return (
            <div key={product.id} ref={el => { revealRefs.current[`prod-${idx}`] = el; if(el) el.dataset.rid = rid; }}
              style={{display:"grid",gridTemplateColumns:"1fr",marginBottom:"clamp(80px,12vw,180px)",opacity:vis(rid),transform:`translateY(${ry(rid)})`,transition:"opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)"}}>
              <style>{`@media(min-width:768px){#pf-${idx}{grid-template-columns:1fr 1fr!important}${even?`#pf-${idx} .pf-canvas{order:2}#pf-${idx} .pf-info{order:1}`:""}}`}</style>
              <div id={`pf-${idx}`} style={{display:"grid",gridTemplateColumns:"1fr"}}>
                {/* Canvas */}
                <div className="pf-canvas" style={{position:"relative",overflow:"hidden",aspectRatio:"3/4",minHeight:340,background:bg}}>
                  <div style={{position:"absolute",top:20,left:20,fontSize:10,letterSpacing:".3em",color:dark?"rgba(196,160,106,.45)":"#9A7B4F",opacity:.65,zIndex:2}}>Piece {["I","II","III"][idx]} · {content.quarterLabel}</div>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
                    <BagComp/>
                  </div>
                  <div style={{position:"absolute",bottom:20,right:20,textAlign:"right",zIndex:2}}>
                    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(24px,3vw,36px)",fontWeight:400,lineHeight:1,marginBottom:4,color:dark?"#F7F3EE":undefined}}>{fmt(product.price)}</div>
                    <div style={{fontSize:8,letterSpacing:".28em",textTransform:"uppercase",color:dark?"rgba(247,243,238,.4)":"#9C9488"}}>Starting price</div>
                  </div>
                  {isSoldOut && (
                    <div style={{position:"absolute",inset:0,background:"rgba(24,20,15,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>
                      <div style={{background:"rgba(24,20,15,.85)",border:"1px solid rgba(247,243,238,.15)",padding:"16px 32px",textAlign:"center"}}>
                        <p style={{fontSize:9,letterSpacing:".38em",textTransform:"uppercase",color:"#F7F3EE",marginBottom:6}}>Sold Out</p>
                        <p style={{fontSize:11,color:"rgba(247,243,238,.5)"}}>Join waitlist for future editions</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="pf-info" style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(32px,5vw,80px) clamp(24px,5vw,80px)",position:"relative",background:dark?"#18140F":undefined,color:dark?"#F7F3EE":undefined}}>
                  <div style={{position:"absolute",top:24,right:24,fontFamily:"'EB Garamond',serif",fontSize:"clamp(72px,10vw,160px)",fontWeight:400,color:dark?"rgba(247,243,238,.04)":"rgba(24,20,15,.05)",lineHeight:.9,pointerEvents:"none",userSelect:"none"}}>
                    {["I","II","III"][idx]}
                  </div>
                  <p style={{fontSize:8.5,letterSpacing:".42em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:20}}>Piece 0{idx+1} &nbsp;·&nbsp; Spring–Summer 2026</p>
                  <h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(32px,4.5vw,60px)",fontWeight:400,lineHeight:1.05,letterSpacing:"-.01em",marginBottom:8}}>{product.name.replace("'", "'")}</h2>
                  <p style={{fontSize:9.5,letterSpacing:".22em",textTransform:"uppercase",color:dark?"rgba(156,148,136,.45)":"#9C9488",marginBottom:36,paddingBottom:36,borderBottom:`1px solid ${dark?"rgba(247,243,238,.07)":"rgba(24,20,15,.08)"}`}}>{product.subtitle}</p>
                  <p style={{fontSize:"clamp(11.5px,1.3vw,13px)",lineHeight:2,letterSpacing:".04em",color:dark?"rgba(156,148,136,.65)":"#9C9488",maxWidth:380,marginBottom:36}}>{product.description}</p>
                  <div style={{marginBottom:36}}>
                    {[["Material",product.material],["Hardware",product.hardware],["Lining",product.lining],["Edition",`${product.edition} pieces only`]].map(([k,v]) => (
                      <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:`1px solid ${dark?"rgba(247,243,238,.07)":"rgba(24,20,15,.07)"}`,padding:"12px 0",flexWrap:"wrap",gap:8}}>
                        <span style={{fontSize:8,letterSpacing:".32em",textTransform:"uppercase",color:dark?"rgba(156,148,136,.5)":"#9C9488"}}>{k}</span>
                        <span style={{fontFamily:"'EB Garamond',serif",fontSize:15,color:dark?"#F7F3EE":undefined,textAlign:"right"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <AvailBadge product={product}/>
                  <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:20,marginTop:24}}>
                    {isSoldOut
                      ? <button className="btn-dark" onClick={() => { setModal({type:"waitlist",product}); setForm({}); }} style={{background:"#9A7B4F"}}>Join the Waitlist</button>
                      : <button className="btn-dark" onClick={() => { setModal({type:"inquire",product}); setForm({}); }}>Inquire to Acquire</button>
                    }
                    <button className="btn-ghost" onClick={() => { setModal({type:"inquire",product}); setForm({}); }}>Reserve a Viewing</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <p style={{fontFamily:"'EB Garamond',serif",fontSize:28,color:"rgba(24,20,15,.25)",fontStyle:"italic"}}>No pieces available this quarter.</p>
            <p style={{fontSize:10,color:"#9C9488",marginTop:12,letterSpacing:".1em"}}>The next quarter's works are being made.</p>
          </div>
        )}
      </section>

      {/* PHILOSOPHY */}
      <section ref={el => { revealRefs.current["phil"] = el; if(el) el.dataset.rid = "phil"; }}
        style={{padding:"clamp(72px,12vw,140px) var(--pad-x)",background:"#18140F",position:"relative",overflow:"hidden",opacity:vis("phil"),transform:`translateY(${ry("phil")})`,transition:"opacity .9s ease, transform .9s ease"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 60%, rgba(154,123,79,.1) 0%, transparent 55%)"}}/>
        <div style={{maxWidth:680,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <div style={{width:1,height:52,background:"#9A7B4F",margin:"0 auto 36px",opacity:.35}}/>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:32,color:"#9A7B4F",opacity:.4,marginBottom:36,letterSpacing:".2em"}}>✦</div>
          <blockquote style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(20px,3.2vw,38px)",fontWeight:400,fontStyle:"italic",lineHeight:1.55,color:"#F7F3EE",marginBottom:40,letterSpacing:".01em"}}>"{content.philosophyQuote}"</blockquote>
          <p style={{fontSize:9,letterSpacing:".42em",textTransform:"uppercase",color:"rgba(156,148,136,.45)"}}>— Founder's Charter, Maison Aurèle, Florence, 1961</p>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" style={{background:"#EDE8E0",padding:"clamp(72px,10vw,140px) var(--pad-x)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"clamp(48px,6vw,80px)"}}>
          <style>{`@media(min-width:768px){#waitlist-grid{grid-template-columns:1fr 1fr!important;align-items:center!important}}`}</style>
          <div id="waitlist-grid" style={{display:"grid",gridTemplateColumns:"1fr",gap:"clamp(48px,6vw,80px)"}}>
            <div ref={el => { revealRefs.current["wl"] = el; if(el) el.dataset.rid="wl"; }}
              style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(26px,3.8vw,48px)",fontWeight:400,lineHeight:1.18,letterSpacing:"-.01em",opacity:vis("wl"),transform:`translateY(${ry("wl")})`,transition:"opacity .9s ease, transform .9s ease"}}>
              The next quarter's<br/>pieces are already<br/><em style={{fontStyle:"italic",color:"#9A7B4F"}}>being made.</em><br/>Is one meant for you?
            </div>
            <div>
              <p style={{fontSize:"clamp(11px,1.3vw,12.5px)",lineHeight:2,color:"#9C9488",marginBottom:36,letterSpacing:".04em"}}>Private clients receive first access before public announcement. We limit this list to 40 names per quarter.</p>
              <div>
                <div className="field-group"><label>Your Name</label><input placeholder="Full name" value={form.wl_name||""} onChange={e=>setForm(f=>({...f,wl_name:e.target.value}))}/></div>
                <div className="field-group"><label>Email Address</label><input type="email" placeholder="Private email" value={form.wl_email||""} onChange={e=>setForm(f=>({...f,wl_email:e.target.value}))}/></div>
                <div className="field-group">
                  <label>Preference</label>
                  <select value={form.wl_pref||""} onChange={e=>setForm(f=>({...f,wl_pref:e.target.value}))}>
                    <option value="" disabled>Which piece interests you?</option>
                    {products.map(p=><option key={p.id}>{p.name}</option>)}
                    <option>Next Quarter's Offering</option>
                    <option>Bespoke Commission</option>
                  </select>
                </div>
                <button className="btn-arrow" onClick={async () => {
                  if(!form.wl_name||!form.wl_email) return showToast("Please enter your name and email");
                  const f2 = { name: form.wl_name, email: form.wl_email, preference: form.wl_pref };
                  setForm(f=>({...f, name:f2.name, email:f2.email, preference:f2.preference }));
                  await submitForm("waitlist_page");
                  setForm({});
                }}>Request Private Access</button>
                <p style={{fontSize:9.5,color:"#9C9488",letterSpacing:".06em",marginTop:20,lineHeight:1.75}}>Your enquiry reaches our Private Client director directly. No automation. No CRM. A person replies within 48 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:"#18140F",padding:"clamp(52px,8vw,80px) var(--pad-x) clamp(28px,4vw,44px)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:44,paddingBottom:44,borderBottom:"1px solid rgba(247,243,238,.07)",marginBottom:36}}>
          <style>{`@media(min-width:600px){#footer-grid{grid-template-columns:1fr 1fr!important}}@media(min-width:900px){#footer-grid{grid-template-columns:2fr 1fr 1fr!important}}`}</style>
          <div id="footer-grid" style={{display:"grid",gridTemplateColumns:"1fr",gap:44}}>
            <div>
              <a href="#" style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(16px,2.5vw,20px)",letterSpacing:".32em",color:"#F7F3EE",textDecoration:"none",display:"block",marginBottom:16}}>AURÈLE <span style={{color:"#9A7B4F"}}>®</span></a>
              <p style={{fontSize:11,color:"rgba(156,148,136,.4)",letterSpacing:".06em",lineHeight:1.9,maxWidth:260,marginBottom:28}}>{content.footerLine}</p>
            </div>
            <div>
              <h5 style={{fontSize:8,letterSpacing:".42em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:18}}>Maison</h5>
              <ul style={{listStyle:"none"}}>
                {["Our History","The Atelier","Artisans","Archive","Press"].map(item=>(
                  <li key={item} style={{marginBottom:11}}><a href="#" style={{fontSize:11,color:"rgba(156,148,136,.45)",textDecoration:"none",letterSpacing:".05em"}}>{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 style={{fontSize:8,letterSpacing:".42em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:18}}>Client</h5>
              <ul style={{listStyle:"none"}}>
                {["Private Access","Bespoke Commission","Restoration","Authentication","Contact"].map(item=>(
                  <li key={item} style={{marginBottom:11}}><a href="#" style={{fontSize:11,color:"rgba(156,148,136,.45)",textDecoration:"none",letterSpacing:".05em"}}>{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:14}}>
          <p style={{fontSize:9,letterSpacing:".13em",color:"rgba(156,148,136,.28)"}}>© 2026 Maison Aurèle. Florence. All rights reserved.</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:22}}>
            {["Instagram","Weibo","Private Telegram"].map(s=><a key={s} href="#" style={{fontSize:8.5,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(156,148,136,.28)",textDecoration:"none"}}>{s}</a>)}
            <button onClick={()=>onOpenAdmin&&onOpenAdmin()} style={{background:"none",border:"none",fontSize:8,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(156,148,136,.1)",cursor:"pointer",padding:0,marginLeft:8,transition:"color .3s"}} onMouseEnter={e=>e.target.style.color="rgba(156,148,136,.4)"} onMouseLeave={e=>e.target.style.color="rgba(156,148,136,.1)"}>Admin</button>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {modal && (
        <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(24,20,15,.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:"#F7F3EE",width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",padding:36,animation:"fadeSlide .35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,paddingBottom:18,borderBottom:"1px solid rgba(24,20,15,.08)"}}>
              <div>
                <p style={{fontSize:8.5,letterSpacing:".4em",textTransform:"uppercase",color:"#9A7B4F",marginBottom:5}}>
                  {modal.type==="inquire"?"Inquire to Acquire":modal.type==="waitlist"?"Join the Waitlist":modal.type==="commission"?"Commission Enquiry":"Contact Us"}
                </p>
                <h3 style={{fontFamily:"'EB Garamond',serif",fontSize:22,fontWeight:400}}>
                  {modal.product ? modal.product.name : "Get in Touch"}
                </h3>
              </div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9C9488",lineHeight:1}}>✕</button>
            </div>

            {modal.product && (
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",marginBottom:20,borderBottom:"1px solid rgba(24,20,15,.08)"}}>
                <div>
                  <p style={{fontFamily:"'EB Garamond',serif",fontSize:18}}>{modal.product.name}</p>
                  <p style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"#9C9488"}}>{modal.product.subtitle}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontFamily:"'EB Garamond',serif",fontSize:22,color:"#9A7B4F"}}>{fmt(modal.product.price)}</p>
                  <AvailBadge product={modal.product}/>
                </div>
              </div>
            )}

            <div className="field-group"><label>Your Name</label><input placeholder="Full name" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="field-group"><label>Email</label><input type="email" placeholder="Private email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
            <div className="field-group"><label>Phone (optional)</label><input placeholder="International format" value={form.phone||""} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
            {modal.type==="commission"&&<div className="field-group">
              <label>Piece Type</label>
              <select value={form.pieceType||""} onChange={e=>setForm(f=>({...f,pieceType:e.target.value}))}>
                <option value="" disabled>What do you have in mind?</option>
                {["Tote / Day bag","Evening bag","Box bag","Bucket bag","Clutch","Something new"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>}
            <div className="field-group"><label>Message (optional)</label><textarea rows={3} placeholder={modal.type==="inquire"?"Any questions or requests…":modal.type==="waitlist"?"Tell us about yourself…":"How can we help?"} value={form.message||""} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/></div>

            <button className="btn-arrow" onClick={()=>submitForm(modal.type)}>
              {modal.type==="inquire"?"Send Enquiry":modal.type==="waitlist"?"Join Waitlist":modal.type==="commission"?"Submit Request":"Send Message"}
            </button>
            <p style={{fontSize:9.5,color:"#9C9488",letterSpacing:".06em",marginTop:20,lineHeight:1.75}}>Your message reaches our team directly. A person replies within 48 hours.</p>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ROOT ROUTER — handles #admin navigation
// ═══════════════════════════════════════════════════════════════
export default function Root() {
  const [view, setView] = useState(() => window.location.hash === "#admin" ? "admin" : "website");

  useEffect(() => {
    const onHash = () => setView(window.location.hash === "#admin" ? "admin" : "website");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (view === "admin") return <CRMApp onExitAdmin={() => { window.location.hash = ""; setView("website"); }} />;
  return <AureleWebsite onOpenAdmin={() => { window.location.hash = "admin"; setView("admin"); }} />;
}
