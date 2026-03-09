import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// SHARED STORAGE — same key the CRM writes to
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = "aurele-live-data";

const S = {
  async get(k) {
    try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
  },
  async set(k, v) {
    try { await window.storage.set(k, JSON.stringify(v), true); } catch {}
  },
};

// ═══════════════════════════════════════════════════════════
// SEED — used only if CRM hasn't written yet
// ═══════════════════════════════════════════════════════════
const SEED = {
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
const fmt = n => `$${Number(n).toLocaleString()}`;
const uid = () => Math.random().toString(36).slice(2, 10);

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
export default function AureleWebsite() {
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
      const live = await S.get(STORAGE_KEY);
      setSiteData(live || SEED);
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
    await S.set(STORAGE_KEY, newData);
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
