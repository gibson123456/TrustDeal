// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://epqxjwokutjzwpnrtzeb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HmuOnCJlo38T1Wf5eWvb4g_thTld5Ew';

console.log("🔗 TrustDeal connecting to Supabase...");

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    
    async signUp(email, password, userData) {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, data: userData })
        });
        return response.json();
    },
    
    async signIn(email, password) {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },
    
    async getUsers() {
        const response = await fetch(`${this.url}/rest/v1/users?select=*`, {
            headers: { 'apikey': this.key }
        });
        return response.json();
    },
    
    async createUser(user) {
        const response = await fetch(`${this.url}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(user)
        });
        return response.json();
    },
    
    async updateUser(email, data) {
        const response = await fetch(`${this.url}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
            method: 'PATCH',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    async getDeals() {
        const response = await fetch(`${this.url}/rest/v1/deals?select=*`, {
            headers: { 'apikey': this.key }
        });
        return response.json();
    },
    
    async createDeal(deal) {
        const response = await fetch(`${this.url}/rest/v1/deals`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(deal)
        });
        return response.json();
    },
    
    async updateDeal(id, data) {
        const response = await fetch(`${this.url}/rest/v1/deals?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    async getNotifications() {
        const response = await fetch(`${this.url}/rest/v1/notifications?select=*`, {
            headers: { 'apikey': this.key }
        });
        return response.json();
    },
    
    async createNotification(notification) {
        const response = await fetch(`${this.url}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(notification)
        });
        return response.json();
    }
};

// ============================================================
// HELPERS
// ============================================================
const STORAGE = { users: "td_users", deals: "td_deals", notifications: "td_notifications", session: "td_session", admin: "td_admin" };
let cache = { users: [], deals: [], notifications: [] };

const get = (k) => JSON.parse(localStorage.getItem(k)) || [];
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const money = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
const toast = (msg) => { let el = document.getElementById("toast"); el.innerText = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3000); };
const id = () => Math.random().toString(36).substring(2, 9).toUpperCase();
const currentUser = () => { let email = localStorage.getItem(STORAGE.session); if (!email) return null; return cache.users.find(u => u.email === email) || null; };
const initials = (n) => n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();

async function syncData() {
    try {
        cache.users = await supabase.getUsers();
        cache.deals = await supabase.getDeals();
        cache.notifications = await supabase.getNotifications();
        set(STORAGE.users, cache.users);
        set(STORAGE.deals, cache.deals);
        set(STORAGE.notifications, cache.notifications);
        console.log("✅ Synced:", cache.users.length, "users");
    } catch (error) {
        console.log("Using cached data");
        cache.users = get(STORAGE.users);
        cache.deals = get(STORAGE.deals);
        cache.notifications = get(STORAGE.notifications);
    }
}

async function addNotification(title, text, type = "green") {
    const notif = { id: "NTF-" + id(), title, text, type, time: "Just now" };
    try {
        await supabase.createNotification(notif);
        cache.notifications.unshift(notif);
    } catch {
        let n = get(STORAGE.notifications);
        n.unshift(notif);
        set(STORAGE.notifications, n.slice(0, 20));
    }
}

// ============================================================
// SEED DATA
// ============================================================
async function seedData() {
    try {
        const users = await supabase.getUsers();
        if (users.length === 0) {
            const demoUsers = [
                { id: "USR-001", name: "ABC Trading Ltd", email: "abc@example.com", phone: "+234 802 111 2222", role: "customer", verified: true, business_name: "ABC Trading Ltd", trust_score: 96, joined: "Jan 2025", password: "demo123" },
                { id: "USR-003", name: "John Ade", email: "john@example.com", phone: "+234 801 234 5678", role: "customer", verified: true, business_name: "", trust_score: 98, joined: "Dec 2024", password: "demo123" },
                { id: "USR-ADMIN", name: "TrustDeal Admin", email: "admin@trustdeal.test", phone: "+234 800 000 0000", password: "admin123", role: "admin", verified: true, business_name: "TrustDeal", trust_score: 100, joined: "Jan 2025" }
            ];
            for (const u of demoUsers) await supabase.createUser(u);
            
            const demoDeals = [
                { id: "TD-10452", title: "500 bags cement", product: "Building Materials", buyer: "ABC Trading Ltd", supplier: "XYZ Manufacturing", amount: 5000000, buyer_paid: true, supplier_delivered: false, supplier_paid: false, status: "escrow", dispute: false, quantity: "500 bags", delivery: "Abeokuta, Ogun State", condition: "Release after verified delivery", created: "2025-04-15" },
                { id: "TD-10451", title: "Industrial food supply", product: "Food", buyer: "John Ade", supplier: "Ogun Foods", amount: 2400000, buyer_paid: true, supplier_delivered: true, supplier_paid: true, status: "completed", dispute: false, quantity: "500 bags", delivery: "Lagos", condition: "Release after buyer confirmation", created: "2025-03-20" }
            ];
            for (const d of demoDeals) await supabase.createDeal(d);
        }
        await syncData();
    } catch (error) {
        if (!localStorage.getItem(STORAGE.users)) {
            set(STORAGE.users, [
                { id: "USR-003", name: "John Ade", email: "john@example.com", phone: "+234 801 234 5678", role: "customer", verified: true, business_name: "", trust_score: 98, joined: "Dec 2024", password: "demo123" },
                { id: "USR-ADMIN", name: "TrustDeal Admin", email: "admin@trustdeal.test", phone: "+234 800 000 0000", password: "admin123", role: "admin", verified: true, business_name: "TrustDeal", trust_score: 100, joined: "Jan 2025" }
            ]);
        }
        await syncData();
    }
}

// ============================================================
// ROUTER
// ============================================================
const navigate = (page, param = null) => { let hash = "#" + page; if (param) hash += "=" + encodeURIComponent(param); history.pushState({ page, param }, "", hash); render(page, param); };
const currentRoute = () => { let h = location.hash.slice(1) || "home"; let [p, x] = h.split("="); return [p, x ? decodeURIComponent(x) : null]; };
window.onpopstate = () => { let [p, x] = currentRoute(); render(p, x); };
window.onhashchange = () => { let [p, x] = currentRoute(); render(p, x); };

// ============================================================
// NAVBARS
// ============================================================
const landingNavbar = () => { let user = currentUser(); return `<nav class="navbar"><a onclick="navigate('home')" class="logo">Trust<span>Deal</span></a><div class="nav-links"><a onclick="navigate('home')">Home</a><a onclick="navigate('login')">Login</a><a onclick="navigate('signup')">Sign Up</a></div><div class="nav-user">${user ? `<div class="avatar" onclick="navigate('dashboard')" title="${user.name}">${initials(user.name)}</div><button class="btn btn-light" onclick="logout()">Logout</button>` : `<button class="btn btn-primary" onclick="navigate('login')">Login</button>`}</div></nav>`; };
const dashboardNavbar = () => { let user = currentUser(); return `<nav class="navbar"><a onclick="navigate('home')" class="logo">Trust<span>Deal</span></a><div class="nav-links"><a onclick="navigate('dashboard')">Dashboard</a><a onclick="navigate('create')">New Deal</a><a onclick="navigate('transactions')">Transactions</a><a onclick="navigate('account')">Account</a></div><div class="nav-user">${user ? `<div class="avatar" onclick="navigate('account')" title="${user.name}">${initials(user.name)}</div><button class="btn btn-light" onclick="logout()">Logout</button>` : `<button class="btn btn-primary" onclick="navigate('login')">Login</button>`}</div></nav>`; };
const adminNav = () => `<nav class="navbar"><a class="logo" onclick="navigate('admin')">Trust<span>Deal</span> <span style="font-size:12px;color:var(--muted)">· Admin</span></a><div class="nav-links"><a onclick="navigate('admin')">Overview</a><a onclick="navigate('admin-users')">Users</a><a onclick="navigate('admin-suppliers')">Suppliers</a><a onclick="navigate('admin-transactions')">Txns</a><a onclick="navigate('admin-disputes')">Disputes</a></div><div class="nav-user"><span class="badge badge-red">ADMIN</span><button class="btn btn-light" onclick="adminLogout()">Logout</button></div></nav>`;

// ============================================================
// HOME PAGE
// ============================================================
function home() {
    const demoDeals = [
        { id: "TD-10452", title: "500 bags cement", amount: 5000000, status: "escrow", badge: "badge-green" },
        { id: "TD-10451", title: "Industrial food supply", amount: 2400000, status: "completed", badge: "badge-green" },
        { id: "TD-10450", title: "Steel roofing", amount: 3200000, status: "escrow", badge: "badge-green" },
        { id: "TD-10449", title: "Packaging materials", amount: 850000, status: "pending", badge: "badge-orange" }
    ];
    const totalValue = demoDeals.reduce((s, d) => s + d.amount, 0);
    const securedValue = demoDeals.filter(d => d.status === "escrow").reduce((s, d) => s + d.amount, 0);
    let dealsHtml = demoDeals.map(d => `<div class="demo-deal-item"><div><b>${d.title}</b><div class="small muted">${d.id}</div></div><div><span class="money" style="font-size:18px">${money(d.amount)}</span><span class="badge ${d.badge}" style="margin-left:10px">${d.status === "escrow" ? "Escrow" : d.status === "completed" ? "Completed" : "Pending"}</span><button class="btn btn-light" style="margin-left:10px;padding:6px 12px;font-size:12px" onclick="navigate('login')">View</button></div></div>`).join("");
    return `${landingNavbar()}
    <main class="container">
        <section class="hero">
            <div class="hero-content">
                <span class="badge badge-green">● LOCAL TRADE PROTECTION</span>
                <h1>Do business without the fear.</h1>
                <p>TrustDeal sits between buyers and suppliers, helping both sides manage protected transactions, delivery and payment conditions.</p>
                <div class="hero-actions">
                    <button class="btn btn-green" onclick="navigate('signup')">Create account</button>
                    <button class="btn btn-white" onclick="navigate('login')">Login</button>
                </div>
            </div>
            <div class="hero-card">
                <div class="label">PROTECTED DEAL</div>
                <h3>Building Materials</h3>
                <div class="money">₦5,000,000</div>
                <span class="badge badge-green">● Buyer credited</span>
                <div style="height:12px"></div>
                <div class="small muted">Funds are protected while supplier completes delivery.</div>
                <div style="height:14px"></div>
                <span class="badge badge-red">● Supplier unpaid</span>
            </div>
        </section>
        <section class="card section" style="margin-top:40px">
            <div class="page-header">
                <div><div class="label">DEMO PREVIEW</div><h2 style="margin:0">Welcome, Demo User</h2><div class="muted">Here is what's happening with your deals.</div></div>
                <span class="badge badge-green">● System online</span>
            </div>
            <section class="grid grid-4" style="margin-bottom:20px">
                <div class="card" style="background:var(--green-light)"><div class="label">TOTAL DEALS</div><div class="stat-number">${demoDeals.length}</div></div>
                <div class="card" style="background:var(--blue-light)"><div class="label">TRANSACTION VALUE</div><div class="stat-number">${money(totalValue)}</div></div>
                <div class="card" style="background:var(--orange-light)"><div class="label">CURRENTLY SECURED</div><div class="stat-number">${money(securedValue)}</div></div>
                <div class="card" style="background:var(--green-light)"><div class="label">TRUST SCORE</div><div class="stat-number">98%</div></div>
            </section>
            <div class="card" style="box-shadow:none;border:1px solid var(--line)">
                <div class="page-header"><div><h3 style="margin:0">Recent transactions</h3><div class="muted small">Monitor every deal from payment to delivery.</div></div></div>
                ${dealsHtml}
            </div>
            <div style="text-align:center;margin-top:20px;padding:20px;background:var(--bg);border-radius:12px">
                <p class="muted">👆 This is a demo preview. <a onclick="navigate('signup')" style="color:var(--green);font-weight:700;cursor:pointer">Create an account</a> to start your own protected transactions.</p>
            </div>
        </section>
        <section class="grid grid-3 section">
            <div class="card"><div class="label">BUYER</div><h2>Secure your money</h2><p class="muted">Agree on the transaction before your money is released.</p></div>
            <div class="card"><div class="label">TRUSTDEAL</div><h2>Protected transaction</h2><p class="muted">Track payment, delivery and release conditions.</p></div>
            <div class="card"><div class="label">SUPPLIER</div><h2>Know the money exists</h2><p class="muted">Suppliers get confidence that the buyer has secured the deal.</p></div>
        </section>
        <section class="card section">
            <div class="page-header">
                <div><div class="label">MANAGEMENT</div><h2>Administrator portal</h2><p class="muted">Access the private operations dashboard.</p></div>
                <button class="btn btn-light" onclick="navigate('admin-login')">Admin Login</button>
            </div>
        </section>
    </main>`;
}

// ============================================================
// LOGIN
// ============================================================
function login() {
    return `${landingNavbar()}
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo">Trust<span>Deal</span></div>
            <div class="label" style="margin-top:25px">ACCOUNT LOGIN</div>
            <h1>Welcome back</h1>
            <p class="muted">Sign in to your account to manage your transactions.</p>
            <form class="form" onsubmit="loginUser(event)">
                <label>Email<input id="login-email" class="input" type="email" required placeholder="you@example.com"></label>
                <label>Password<input id="login-password" class="input" type="password" required placeholder="••••••••"></label>
                <button class="btn btn-primary">Sign in</button>
            </form>
            <p class="small">Don't have an account? <a onclick="navigate('signup')" style="color:var(--green);font-weight:700;cursor:pointer">Create one</a></p>
            <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:10px">
                <p class="small muted" style="margin:0">Demo: <b>john@example.com</b> / <b>demo123</b> · <b>admin@trustdeal.test</b> / <b>admin123</b></p>
            </div>
        </div>
    </div>`;
}

async function loginUser(e) {
    e.preventDefault();
    let email = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value;
    
    await syncData();
    let user = cache.users.find(u => u.email === email);
    
    if (!user) {
        toast("Account not found. Please sign up first.");
        return;
    }
    
    if (user.password !== password) {
        toast("Wrong password. Please try again.");
        return;
    }
    
    if (user.verified === false) {
        toast("⚠️ Please verify your email first. Check your inbox!");
        return;
    }
    
    localStorage.setItem(STORAGE.session, email);
    toast("Welcome back, " + user.name + "!");
    navigate("dashboard");
}

// ============================================================
// SIGNUP
// ============================================================
function signup() {
    return `${landingNavbar()}
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo">Trust<span>Deal</span></div>
            <h1>Create your account</h1>
            <p class="muted">Start protecting your business transactions today.</p>
            <form class="form" onsubmit="createAccount(event)">
                <label>Full name<input id="signup-name" class="input" required placeholder="John Doe"></label>
                <label>Email<input id="signup-email" type="email" class="input" required placeholder="you@example.com"></label>
                <label>Phone<input id="signup-phone" class="input" required placeholder="+234 800 000 0000"></label>
                <label>Password<input id="signup-password" type="password" class="input" required minlength="6" placeholder="••••••••"></label>
                <label>Account type<select id="signup-role" class="input"><option value="customer">Customer / Buyer</option><option value="supplier">Supplier / Vendor</option></select></label>
                <label>Business name (optional)<input id="signup-business" class="input" placeholder="Your business name"></label>
                <button class="btn btn-green" type="submit">Create account</button>
            </form>
            <p class="small muted">Already have an account? <a onclick="navigate('login')" style="color:var(--green);font-weight:700;cursor:pointer">Sign in</a></p>
        </div>
    </div>`;
}

async function createAccount(e) {
    e.preventDefault();
    let email = document.getElementById("signup-email").value.trim();
    let password = document.getElementById("signup-password").value;
    let name = document.getElementById("signup-name").value.trim();
    let phone = document.getElementById("signup-phone").value.trim();
    let role = document.getElementById("signup-role").value;
    let businessName = document.getElementById("signup-business").value.trim() || "";
    
    await syncData();
    if (cache.users.some(u => u.email === email)) {
        toast("Email already exists. Please login.");
        return;
    }
    
    try {
        const authResult = await supabase.signUp(email, password, {
            name, phone, role, business_name: businessName
        });
        
        if (authResult.error) {
            toast(authResult.error.message || "Sign up failed.");
            return;
        }
        
        let user = {
            id: "USR-" + id(),
            name, email, phone, password, role,
            business_name: businessName,
            verified: false,
            trust_score: 50,
            joined: new Date().toISOString().split("T")[0]
        };
        
        await supabase.createUser(user);
        await syncData();
        
        toast("✅ Account created! Please check your email to verify.");
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-phone').value = '';
        document.getElementById('signup-password').value = '';
        
        setTimeout(() => navigate('login'), 3000);
        
    } catch (error) {
        let user = {
            id: "USR-" + id(),
            name, email, phone, password, role,
            business_name: businessName,
            verified: false,
            trust_score: 50,
            joined: new Date().toISOString().split("T")[0]
        };
        let users = get(STORAGE.users);
        users.push(user);
        set(STORAGE.users, users);
        toast("✅ Account created! Please verify your email.");
        setTimeout(() => navigate('login'), 3000);
    }
}

function logout() {
    localStorage.removeItem(STORAGE.session);
    toast("Logged out.");
    navigate("home");
}

// ============================================================
// DASHBOARD
// ============================================================
async function dashboard() {
    let user = currentUser();
    if (!user) return login();
    
    await syncData();
    let allDeals = cache.deals;
    let deals = allDeals.filter(d => d.buyer === user.name || d.supplier === user.name || d.buyer === user.business_name || d.supplier === user.business_name);
    
    if (deals.length === 0 && allDeals.length > 0) deals = allDeals;
    
    let total = deals.reduce((s, d) => s + d.amount, 0);
    let secured = deals.filter(d => d.buyer_paid && !d.supplier_paid).reduce((s, d) => s + d.amount, 0);
    let completed = deals.filter(d => d.status === "completed").length;
    let pending = deals.filter(d => d.status === "pending").length;
    let escrow = deals.filter(d => d.status === "escrow").length;
    
    let dealsContent = deals.length === 0 ? `<div class="empty-state"><div class="icon">📦</div><h2>No transactions yet</h2><p>Start by creating your first protected deal.</p><button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button></div>` : deals.map(dealRow).join("");
    
    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header">
            <div>
                <div class="label">DASHBOARD</div>
                <h1>Welcome, ${user.name.split(" ")[0]}</h1>
                <div class="muted">${user.role === "supplier" ? "Supplier" : "Customer"} · Trust Score: ${user.trust_score || "—"}%</div>
            </div>
            <button class="btn btn-green" onclick="navigate('create')">+ Create Deal</button>
        </div>
        <section class="grid grid-4">
            <div class="card"><div class="label">MY DEALS</div><div class="stat-number">${deals.length}</div></div>
            <div class="card"><div class="label">TOTAL VALUE</div><div class="stat-number">${deals.length === 0 ? "₦0" : money(total)}</div></div>
            <div class="card"><div class="label">IN ESCROW</div><div class="stat-number">${deals.length === 0 ? "₦0" : money(secured)}</div></div>
            <div class="card"><div class="label">COMPLETED</div><div class="stat-number">${completed}</div></div>
        </section>
        <section class="grid grid-4 section">
            <div class="card" style="background:var(--green-light)"><div class="label">ESCROW</div><div class="stat-number">${escrow}</div></div>
            <div class="card" style="background:var(--orange-light)"><div class="label">PENDING</div><div class="stat-number">${pending}</div></div>
            <div class="card" style="background:var(--blue-light)"><div class="label">DELIVERED</div><div class="stat-number">${deals.filter(d => d.status === "delivered").length}</div></div>
            <div class="card" style="background:var(--red-light)"><div class="label">DISPUTES</div><div class="stat-number">${deals.filter(d => d.dispute).length}</div></div>
        </section>
        <section class="card section">
            <div class="page-header"><div><h2>Your transactions</h2><div class="muted small">${deals.length} deal${deals.length !== 1 ? "s" : ""}</div></div><span class="badge badge-green">● ${deals.length > 0 ? "Active" : "Ready"}</span></div>
            ${dealsContent}
        </section>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">ACCOUNT</div><h2>${user.name}</h2><p class="muted">${user.email}</p><p class="small">Joined: ${user.joined || "N/A"} · ${user.role}</p><button class="btn btn-light" onclick="navigate('account')">View account</button></div>
            <div class="card"><div class="label">NOTIFICATIONS</div>${notificationPreview()}</div>
        </section>
    </main>`;
}

function dealRow(d) {
    let cls = "badge-orange", txt = "Pending";
    if (d.status === "escrow") { cls = "badge-green"; txt = "Escrow"; }
    if (d.status === "delivered") { cls = "badge-blue"; txt = "Delivery"; }
    if (d.status === "completed") { cls = "badge-green"; txt = "Completed"; }
    if (d.status === "dispute") { cls = "badge-red"; txt = "Dispute"; }
    
    let user = currentUser();
    let role = (d.buyer === user.name || d.buyer === user.business_name) ? "You (Buyer)" : "You (Supplier)";
    
    return `<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:15px;align-items:center;padding:17px 0;border-bottom:1px solid var(--line)">
        <div><b>${d.title}</b><div class="small muted">${d.id}</div></div>
        <div>${money(d.amount)}</div>
        <div class="small"><b>${role}</b><br><span class="small muted">${d.buyer} → ${d.supplier}</span></div>
        <div><span class="badge ${cls}">${txt}</span></div>
        <button class="btn btn-light" onclick="navigate('transaction','${d.id}')">View</button>
    </div>`;
}

function notificationPreview() {
    let n = cache.notifications.length > 0 ? cache.notifications : get(STORAGE.notifications);
    return n.slice(0, 3).map(n => `<div class="notification">
        <span class="badge ${n.type === "red" ? "badge-red" : n.type === "blue" ? "badge-blue" : "badge-green"}">●</span>
        <div><b>${n.title}</b><div class="small muted">${n.text}</div><div class="small muted">${n.time}</div></div>
    </div>`).join("") || `<p class="muted">No notifications yet.</p>`;
}

// ============================================================
// CREATE DEAL
// ============================================================
function createDealPage() {
    let user = currentUser();
    if (!user) return login();
    
    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">PROTECTED DEAL</div><h1>Create a transaction</h1><p class="muted">Define exactly what the buyer and supplier have agreed to.</p></div></div>
        <div class="card" style="max-width:750px">
            <form class="form" onsubmit="createDeal(event)">
                <label>Transaction title<input id="deal-title" class="input" placeholder="Building materials supply" required></label>
                <label>Supplier / Vendor<input id="deal-supplier" class="input" placeholder="XYZ Manufacturing Ltd" required></label>
                <label>Product / service<input id="deal-product" class="input" placeholder="Cement, rice, equipment..." required></label>
                <label>Quantity<input id="deal-quantity" class="input" placeholder="500 bags" required></label>
                <label>Transaction value (NGN)<input id="deal-amount" class="input" type="number" min="1" placeholder="5000000" required></label>
                <label>Delivery location<input id="deal-location" class="input" placeholder="Abeokuta, Ogun State" required></label>
                <label>Payment condition<select id="deal-condition" class="input"><option>Release after verified delivery</option><option>Release after buyer confirmation</option><option>Milestone payment</option></select></label>
                <div class="card" style="background:var(--bg);box-shadow:none"><b>How protection works</b><p class="small muted">Buyer payment is represented as secured funds in this prototype.</p></div>
                <button class="btn btn-green" type="submit">Create protected deal</button>
            </form>
        </div>
    </main>`;
}

async function createDeal(e) {
    e.preventDefault();
    let user = currentUser();
    if (!user) { toast("Please login first."); navigate("login"); return; }
    
    let deal = {
        id: "TD-" + id(),
        title: document.getElementById("deal-title").value.trim(),
        buyer: user.business_name || user.name,
        supplier: document.getElementById("deal-supplier").value.trim(),
        product: document.getElementById("deal-product").value.trim(),
        quantity: document.getElementById("deal-quantity").value.trim(),
        amount: Number(document.getElementById("deal-amount").value),
        delivery: document.getElementById("deal-location").value.trim(),
        condition: document.getElementById("deal-condition").value,
        status: "pending",
        created: new Date().toISOString().split("T")[0],
        buyer_paid: false,
        supplier_delivered: false,
        supplier_paid: false,
        dispute: false
    };
    
    try {
        await supabase.createDeal(deal);
        await syncData();
        await addNotification("New deal created", deal.id + " - " + deal.title + " by " + user.name, "blue");
        toast("Protected deal created!");
        setTimeout(() => navigate("transaction", deal.id), 500);
    } catch {
        let deals = get(STORAGE.deals);
        deals.unshift(deal);
        set(STORAGE.deals, deals);
        toast("Protected deal created!");
        setTimeout(() => navigate("transaction", deal.id), 500);
    }
}

// ============================================================
// TRANSACTION PAGE
// ============================================================
function transactionPage(dealId) {
    let deals = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let d = deals.find(x => x.id === dealId);
    if (!d) return `${dashboardNavbar()}<main class="container"><div class="card"><h1>Transaction not found</h1><button class="btn btn-light" onclick="navigate('dashboard')">Back</button></div></main>`;
    let completed = d.status === "completed";
    let disputed = d.dispute === true;
    
    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header">
            <div><div class="label">TRANSACTION ${d.id}</div><h1>${d.title}</h1><p class="muted">Track exactly where the transaction stands.</p></div>
            <span class="badge ${completed ? "badge-green" : disputed ? "badge-red" : "badge-blue"}">${completed ? "● Completed" : disputed ? "● Dispute" : "● Protected"}</span>
        </div>
        <div class="transaction-flow">
            <div class="party-card buyer">
                <div class="party-icon green">👤</div>
                <div class="label">BUYER / CUSTOMER</div>
                <h2>${d.buyer}</h2>
                <div class="money">${money(d.amount)}</div>
                ${d.buyer_paid ? `<span class="badge badge-green">🟢 CUSTOMER CREDITED</span>` : `<span class="badge badge-red">🔴 PAYMENT NOT RECEIVED</span>`}
            </div>
            <div class="flow-middle">
                <div class="label">TRANSACTION FLOW</div>
                <div class="flow-arrow" style="color:${d.buyer_paid ? "var(--green)" : "var(--gray-300)"}">→</div>
                <div class="escrow-box">
                    <div class="label">TRUSTDEAL</div>
                    <h3 style="margin:7px 0">${d.buyer_paid ? "ESCROW / SECURED" : "AWAITING PAYMENT"}</h3>
                    <div class="small muted">${d.buyer_paid ? "Funds remain protected." : "Buyer has not credited the deal."}</div>
                </div>
                <div class="flow-arrow" style="color:${d.supplier_paid ? "var(--green)" : "var(--red)"}">→</div>
                <div class="small">${d.supplier_paid ? "Payment released" : "Supplier awaiting release"}</div>
            </div>
            <div class="party-card supplier">
                <div class="party-icon red">🏭</div>
                <div class="label">SUPPLIER / SELLER</div>
                <h2>${d.supplier}</h2>
                <div class="money">${money(d.amount)}</div>
                ${d.supplier_paid ? `<span class="badge badge-green">🟢 PAYMENT RELEASED</span>` : `<span class="badge badge-red">🔴 PAYMENT WAITING</span>`}
            </div>
        </div>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">TRANSACTION DETAILS</div><h2>Order information</h2><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity || "—"}</p><p><b>Delivery:</b> ${d.delivery || "—"}</p><p><b>Payment rule:</b> ${d.condition || "Standard"}</p><p><b>Created:</b> ${d.created || "—"}</p></div>
            <div class="card"><div class="label">TRANSACTION PROTECTION</div><h2>Where is the money?</h2>${d.buyer_paid && !d.supplier_paid ? `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Customer has credited</b><p class="small">The transaction is funded. The supplier has not received the release yet.</p></div>` : d.supplier_paid ? `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Supplier has been paid</b><p class="small">The protected transaction has completed.</p></div>` : `<div style="background:var(--red-light);padding:17px;border-radius:12px"><b style="color:#991b1b">🔴 Waiting for customer payment</b></div>`}</div>
        </section>
        <section class="card section">
            <div class="label">PROTOTYPE CONTROLS</div>
            <h2>Simulate the transaction</h2>
            <p class="muted small">These buttons simulate the states. In production events come from verified payment and delivery systems.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                ${!d.buyer_paid ? `<button class="btn btn-green" onclick="buyerCredit('${d.id}')">🟢 Simulate Customer Credit</button>` : ""}
                ${d.buyer_paid && !d.supplier_delivered ? `<button class="btn btn-primary" onclick="supplierDeliver('${d.id}')">📦 Simulate Supplier Delivery</button>` : ""}
                ${d.supplier_delivered && !d.supplier_paid ? `<button class="btn btn-green" onclick="releasePayment('${d.id}')">💰 Release Supplier Payment</button>` : ""}
                ${!d.supplier_paid && !d.dispute ? `<button class="btn btn-red" onclick="openDispute('${d.id}')">⚠ Open Dispute</button>` : ""}
            </div>
        </section>
    </main>`;
}

async function updateDeal(id, fn) {
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let d = ds.find(x => x.id === id);
    if (!d) return;
    fn(d);
    try {
        await supabase.updateDeal(id, d);
        await syncData();
    } catch {
        let deals = get(STORAGE.deals);
        let index = deals.findIndex(x => x.id === id);
        if (index !== -1) deals[index] = d;
        set(STORAGE.deals, deals);
    }
    navigate("transaction", id);
}

async function buyerCredit(id) { await updateDeal(id, d => { d.buyer_paid = true; d.status = "escrow"; addNotification("Customer credited", d.id + " is now secured.", "green"); }); toast("Customer credited. Funds secured."); }
async function supplierDeliver(id) { await updateDeal(id, d => { if (!d.buyer_paid) { toast("Customer must credit first."); return; } d.supplier_delivered = true; d.status = "delivered"; addNotification("Delivery marked", d.id + " delivered.", "blue"); }); toast("Supplier delivery recorded."); }
async function releasePayment(id) { await updateDeal(id, d => { if (!d.supplier_delivered) { toast("Delivery must be confirmed."); return; } d.supplier_paid = true; d.status = "completed"; addNotification("Payment released", money(d.amount) + " released.", "green"); }); toast("Payment released. Deal completed."); }
async function openDispute(id) { await updateDeal(id, d => { d.dispute = true; d.status = "dispute"; addNotification("Dispute opened", d.id + " paused.", "red"); }); toast("Dispute opened."); }

// ============================================================
// TRANSACTIONS LIST
// ============================================================
function transactionsPage() {
    let user = currentUser();
    if (!user) return login();
    let allDeals = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let deals = allDeals.filter(d => d.buyer === user.name || d.supplier === user.name || d.buyer === user.business_name || d.supplier === user.business_name);
    
    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">TRANSACTIONS</div><h1>Your deals</h1><p class="muted">${deals.length} transaction${deals.length !== 1 ? "s" : ""}</p></div><button class="btn btn-green" onclick="navigate('create')">+ New Deal</button></div>
        <div class="card">
            ${deals.length === 0 ? `<div class="empty-state"><div class="icon">📋</div><h2>No transactions</h2><p>Start your first protected transaction now.</p><button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button></div>` :
            `<div class="table-wrapper"><table><thead><tr><th>Deal</th><th>Buyer</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${deals.map(d => `<tr><td><b>${d.title}</b><div class="small muted">${d.id}</div></td><td>${d.buyer}</td><td>${d.supplier}</td><td>${money(d.amount)}</td><td>${d.status === "escrow" ? '<span class="badge badge-green">🟢 Escrow</span>' : d.status === "completed" ? '<span class="badge badge-green">🟢 Completed</span>' : d.status === "dispute" ? '<span class="badge badge-red">🔴 Dispute</span>' : '<span class="badge badge-orange">🟠 Pending</span>'}</td><td><button class="btn btn-light" onclick="navigate(\'transaction\',\'${d.id}\')">Open</button></td></tr>`).join("")}</tbody></table></div>`}
        </div>
    </main>`;
}

// ============================================================
// ACCOUNT PAGE
// ============================================================
function accountPage() {
    let user = currentUser();
    if (!user) return login();
    let allDeals = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let deals = allDeals.filter(d => d.buyer === user.name || d.supplier === user.name || d.buyer === user.business_name || d.supplier === user.business_name);
    
    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">ACCOUNT</div><h1>Your account</h1></div></div>
        <section class="grid grid-2">
            <div class="card">
                <div style="display:flex;align-items:center;gap:15px"><div class="avatar">${initials(user.name)}</div><div><h2 style="margin:0">${user.name}</h2><div class="muted">${user.email}</div></div></div>
                <hr style="border:none;border-top:1px solid var(--line);margin:22px 0">
                <p><b>Phone</b><br>${user.phone || "—"}</p>
                <p><b>Account type</b><br>${user.role}</p>
                <p><b>Business</b><br>${user.business_name || "Not added"}</p>
                <p><b>Joined</b><br>${user.joined || "—"}</p>
                <span class="badge ${user.verified ? "badge-green" : "badge-orange"}">${user.verified ? "✓ Verified" : "Verification pending"}</span>
            </div>
            <div class="card">
                <div class="label">BUSINESS TRUST</div>
                <h2>Trust profile</h2>
                <div style="font-size:45px;font-weight:900;color:var(--green)">${user.trust_score || 50}%</div>
                <p class="muted">Trust score</p>
                <p>✓ Identity information ${user.verified ? "✅" : "⏳"}</p>
                <p>✓ Transaction history (${deals.length} deals)</p>
                <p>✓ Completed deals: ${deals.filter(d => d.status === "completed").length}</p>
                <p>✓ Dispute history: ${deals.filter(d => d.dispute).length > 0 ? "⚠️ " + deals.filter(d => d.dispute).length : "✅ None"}</p>
            </div>
        </section>
    </main>`;
}

// ============================================================
// ADMIN SECTION
// ============================================================
function adminLogin() { return landingNavbar() + `<div class="auth-page"><div class="auth-card"><div class="logo">Trust<span>Deal</span> <span style="font-size:14px;color:var(--muted)">· Admin</span></div><div class="label">PRIVATE ADMIN PORTAL</div><h1>Management Login</h1><p class="muted">Restricted to administrators.</p><form class="form" onsubmit="performAdminLogin(event)"><label>Admin email<input id="admin-email" class="input" type="email" value="admin@trustdeal.test" required></label><label>Password<input id="admin-password" class="input" type="password" value="admin123" required></label><button class="btn btn-primary">Enter Admin Portal</button></form><div class="card" style="margin-top:18px;box-shadow:none"><div class="small muted">Admin: <b>admin@trustdeal.test</b> / <b>admin123</b></div></div></div></div>`; }

async function performAdminLogin(e) {
    e.preventDefault();
    let email = document.getElementById("admin-email").value;
    let password = document.getElementById("admin-password").value;
    await syncData();
    let admin = cache.users.find(u => u.email === email && u.password === password && u.role === "admin");
    if (admin) { localStorage.setItem(STORAGE.admin, "true"); toast("Admin access granted."); navigate("admin"); } else { toast("Invalid admin credentials."); }
}

function adminGuard() { if (localStorage.getItem(STORAGE.admin) !== "true") { navigate("admin-login"); return false; } return true; }
function adminLogout() { localStorage.removeItem(STORAGE.admin); toast("Admin logged out."); navigate("admin-login"); }

function adminDealStatus(d) {
    if (d.dispute) return '<span class="badge badge-red">🔴 DISPUTE</span>';
    if (d.supplier_paid) return '<span class="badge badge-green">🟢 COMPLETED</span>';
    if (d.supplier_delivered) return '<span class="badge badge-blue">🔵 DELIVERY</span>';
    if (d.buyer_paid) return '<span class="badge badge-green">🟢 ESCROW</span>';
    return '<span class="badge badge-orange">🟠 AWAITING FUNDING</span>';
}

function adminTransactionTable(ds) {
    if (!ds.length) return '<div class="empty-state"><div class="icon">📊</div><h2>No transactions</h2></div>';
    return `<div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>Customer</th><th>Supplier</th><th>Value</th><th>Position</th><th></th></tr></thead><tbody>${ds.map(d => `<tr><td><b>${d.id}</b><div class="small muted">${d.title}</div></td><td>${d.buyer}</td><td>${d.supplier}</td><td>${money(d.amount)}</td><td>${adminDealStatus(d)}</td><td><button class="btn btn-light" onclick="navigate('admin-transaction','${d.id}')">Monitor</button></td></tr>`).join("")}</tbody></table></div>`;
}

function adminDashboard() {
    if (!adminGuard()) return "";
    let us = cache.users.length > 0 ? cache.users : get(STORAGE.users);
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let total = ds.reduce((s, d) => s + d.amount, 0);
    let esc = ds.filter(d => d.buyer_paid && !d.supplier_paid && !d.dispute).reduce((s, d) => s + d.amount, 0);
    let done = ds.filter(d => d.status === "completed").reduce((s, d) => s + d.amount, 0);
    let dis = ds.filter(d => d.dispute).length;
    let sup = us.filter(u => u.role === "supplier").length;
    let customers = us.filter(u => u.role === "customer" || u.role === "business").length;
    
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">TRUSTDEAL MANAGEMENT</div><h1>Admin Overview</h1><p class="muted">Monitor the entire marketplace.</p></div><span class="badge badge-green">● PLATFORM OPERATIONAL</span></div>
        <section class="grid grid-4">
            <div class="card"><div class="label">TOTAL USERS</div><div class="stat-number">${us.length}</div><div class="small muted">${customers} customers · ${sup} suppliers</div></div>
            <div class="card"><div class="label">TOTAL VALUE</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(total)}</div></div>
            <div class="card"><div class="label">CURRENT ESCROW</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(esc)}</div></div>
            <div class="card"><div class="label">COMPLETED VALUE</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(done)}</div></div>
        </section>
        <section class="grid grid-4 section">
            <div class="card"><div class="label">TOTAL DEALS</div><div class="stat-number">${ds.length}</div></div>
            <div class="card"><div class="label">ACTIVE PIPELINE</div><div class="stat-number">${ds.filter(d => !d.supplier_paid && !d.dispute).length}</div></div>
            <div class="card"><div class="label">WAITING FUNDING</div><div class="stat-number">${ds.filter(d => !d.buyer_paid && !d.dispute).length}</div></div>
            <div class="card"><div class="label">DISPUTES</div><div class="stat-number" style="color:${dis ? "var(--red)" : "var(--green)"}">${dis}</div></div>
        </section>
        <section class="card section">
            <div class="page-header"><div><div class="label">LIVE MONITOR</div><h2>Current transactions</h2><p class="muted">${ds.length} total deals</p></div><button class="btn btn-light" onclick="navigate('admin-transactions')">View all</button></div>
            ${adminTransactionTable(ds.slice(0, 10))}
        </section>
    </main>`;
}

function adminUsers() {
    if (!adminGuard()) return "";
    let us = cache.users.length > 0 ? cache.users : get(STORAGE.users);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">USER MANAGEMENT</div><h1>All users</h1><p class="muted">${us.length} registered users</p></div></div>
        <div class="card"><div class="table-wrapper"><table><thead><tr><th>User</th><th>Email</th><th>Type</th><th>Trust Score</th><th>Verification</th><th>Joined</th></tr></thead><tbody>${us.map(u => `<tr><td><b>${u.name}</b><div class="small muted">${u.business_name || ""}</div></td><td>${u.email}</td><td><span class="badge badge-blue">${u.role}</span></td><td>${u.trust_score || 50}%</td><td>${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-orange">Pending</span>'}</td><td class="small muted">${u.joined || "—"}</td></tr>`).join("")}</tbody></table></div></div></main>`;
}

function adminSuppliers() {
    if (!adminGuard()) return "";
    let us = cache.users.length > 0 ? cache.users.filter(u => u.role === "supplier") : get(STORAGE.users).filter(u => u.role === "supplier");
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">SUPPLIER MANAGEMENT</div><h1>Suppliers</h1><p class="muted">${us.length} registered suppliers</p></div></div>
        ${us.length === 0 ? `<div class="card"><div class="empty-state"><div class="icon">🏭</div><h2>No suppliers yet</h2></div></div>` : `<div class="grid grid-2">${us.map(u => { let name = u.business_name || u.name; let x = ds.filter(d => d.supplier === name); let v = x.reduce((s, d) => s + d.amount, 0); return `<div class="card"><div class="page-header"><div><div class="label">SUPPLIER</div><h2>${name}</h2><div class="muted">${u.email}</div></div>${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-orange">Pending</span>'}</div><div class="grid grid-3"><div><div class="label">DEALS</div><b>${x.length}</b></div><div><div class="label">VALUE</div><b>${x.length === 0 ? "₦0" : money(v)}</b></div><div><div class="label">COMPLETED</div><b>${x.filter(d => d.status === "completed").length}</b></div></div></div>` }).join("")}</div>`}</main>`;
}

function adminTransactions() {
    if (!adminGuard()) return "";
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">TRANSACTION MANAGEMENT</div><h1>All transactions</h1><p class="muted">${ds.length} total deals</p></div></div>
        <div class="card">${adminTransactionTable(ds)}</div>
    </main>`;
}

function adminTransaction(id) {
    if (!adminGuard()) return "";
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let d = ds.find(x => x.id === id);
    if (!d) return `${adminNav()}<main class="container"><div class="card"><h1>Transaction not found</h1><button class="btn btn-light" onclick="navigate('admin')">Back</button></div></main>`;
    
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">ADMIN MONITOR</div><h1>${d.id}</h1><p class="muted">${d.title}</p></div>${adminDealStatus(d)}</div>
        <section class="card">
            <div class="transaction-flow">
                <div class="party-card buyer"><div class="party-icon green">👤</div><div class="label">CUSTOMER</div><h2>${d.buyer}</h2><div class="money">${money(d.amount)}</div><span class="badge ${d.buyer_paid ? "badge-green" : "badge-red"}">${d.buyer_paid ? "🟢 CREDITED" : "🔴 NOT FUNDED"}</span></div>
                <div class="flow-middle"><div class="flow-arrow">→</div><div class="escrow-box"><div class="label">TRUSTDEAL</div><h3>${d.buyer_paid ? "ESCROW" : "AWAITING FUNDS"}</h3><div class="small">${d.buyer_paid ? money(d.amount) : "₦0"}</div></div><div class="flow-arrow">→</div></div>
                <div class="party-card supplier"><div class="party-icon red">🏭</div><div class="label">SUPPLIER</div><h2>${d.supplier}</h2><div class="money">${money(d.amount)}</div><span class="badge ${d.supplier_paid ? "badge-green" : "badge-red"}">${d.supplier_paid ? "🟢 PAID" : "🔴 PAYMENT LOCKED"}</span></div>
            </div>
        </section>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">DETAILS</div><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity}</p><p><b>Delivery:</b> ${d.delivery}</p><p><b>Condition:</b> ${d.condition}</p></div>
            <div class="card"><div class="label">TIMELINE</div><div style="display:grid;gap:8px;margin-top:8px"><div>${d.buyer_paid ? "✅ Customer funded" : "⏳ Awaiting funding"}</div><div>${d.supplier_delivered ? "✅ Delivery confirmed" : "⏳ Awaiting delivery"}</div><div>${d.supplier_paid ? "✅ Payment released" : "⏳ Payment locked"}</div></div></div>
        </section>
        ${d.dispute ? `<section class="card section" style="border:2px solid var(--red);background:var(--red-light)"><div class="label">ACTION REQUIRED</div><h2>🔴 Dispute is open</h2><button class="btn btn-red" onclick="resolveDispute('${d.id}')">Resolve dispute</button></section>` : ""}
    </main>`;
}

function adminDisputes() {
    if (!adminGuard()) return "";
    let ds = cache.deals.length > 0 ? cache.deals.filter(d => d.dispute) : get(STORAGE.deals).filter(d => d.dispute);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">RISK MANAGEMENT</div><h1>Disputes</h1></div><span class="badge ${ds.length ? "badge-red" : "badge-green"}">${ds.length} Open</span></div>
        <div class="card">${ds.length ? ds.map(d => `<div class="notification" style="justify-content:space-between;align-items:center"><div><span class="badge badge-red">🔴 DISPUTE</span><div style="margin-top:8px"><b>${d.id}</b> — ${d.title}</div><div class="small muted">${d.buyer} → ${d.supplier} · ${money(d.amount)}</div></div><button class="btn btn-red" onclick="navigate('admin-transaction','${d.id}')">Review</button></div>`).join("") : `<div class="empty-state"><div class="icon">✅</div><h2>No open disputes</h2></div>`}</div>
    </main>`;
}

async function resolveDispute(id) {
    try {
        await supabase.updateDeal(id, { dispute: false, status: "pending" });
        await syncData();
        await addNotification("Dispute resolved", id + " reviewed.", "green");
        toast("Dispute resolved.");
        navigate("admin-transaction", id);
    } catch {
        let ds = get(STORAGE.deals);
        let d = ds.find(x => x.id === id);
        if (d) { d.dispute = false; d.status = "pending"; set(STORAGE.deals, ds); }
        toast("Dispute resolved.");
        navigate("admin-transaction", id);
    }
}

// ============================================================
// RENDER ENGINE
// ============================================================
async function render(page, param) {
    await seedData();
    let app = document.getElementById("app");
    switch (page) {
        case "home": app.innerHTML = home(); break;
        case "login": app.innerHTML = login(); break;
        case "signup": app.innerHTML = signup(); break;
        case "dashboard": app.innerHTML = await dashboard(); break;
        case "create": app.innerHTML = createDealPage(); break;
        case "transaction": app.innerHTML = transactionPage(param); break;
        case "transactions": app.innerHTML = transactionsPage(); break;
        case "account": app.innerHTML = accountPage(); break;
        case "admin-login": app.innerHTML = adminLogin(); break;
        case "admin": app.innerHTML = adminDashboard(); break;
        case "admin-users": app.innerHTML = adminUsers(); break;
        case "admin-suppliers": app.innerHTML = adminSuppliers(); break;
        case "admin-transactions": app.innerHTML = adminTransactions(); break;
        case "admin-transaction": app.innerHTML = adminTransaction(param); break;
        case "admin-disputes": app.innerHTML = adminDisputes(); break;
        default: app.innerHTML = home();
    }
}

// ============================================================
// START
// ============================================================
seedData();
let [initialPage, initialParam] = currentRoute();
render(initialPage, initialParam);
console.log("🔒 TrustDeal connected to Supabase!");
console.log("👤 Admin: admin@trustdeal.test / admin123");
console.log("📊 Data stored in Supabase");
