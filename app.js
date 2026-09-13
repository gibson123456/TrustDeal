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
            headers: { 'apikey': this.key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, data: userData })
        });
        return response.json();
    },

    async signIn(email, password) {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': this.key, 'Content-Type': 'application/json' },
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
// CONSTANTS
// ============================================================
const LOGISTICS_COMPANIES = [
    "GIG Logistics",
    "Kwik Delivery",
    "Sendbox",
    "DHL Nigeria",
    "TrustDeal Logistics"
];

const REGION_ROUTES = [
    { region: "South West", states: ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"] },
    { region: "South East", states: ["Enugu", "Anambra", "Abia", "Imo", "Ebonyi"] },
    { region: "South South", states: ["Rivers", "Delta", "Bayelsa", "Cross River", "Akwa Ibom", "Edo"] },
    { region: "North Central", states: ["FCT Abuja", "Plateau", "Kogi", "Benue", "Niger", "Nasarawa", "Kwara"] },
    { region: "North East", states: ["Borno", "Yobe", "Adamawa", "Bauchi", "Gombe", "Taraba"] },
    { region: "North West", states: ["Kano", "Kaduna", "Katsina", "Sokoto", "Kebbi", "Zamfara", "Jigawa"] }
];

const ETA_OPTIONS = ["2 hours", "4 hours", "6 hours", "Today, 5:00 PM", "Today, 8:00 PM", "Tomorrow morning", "Tomorrow afternoon"];

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

const userMatchesDeal = (user, deal) => {
    if (!user || !deal) return false;
    const userKeys = [user.name, user.business_name, user.email].filter(Boolean);
    const dealKeys = [deal.buyer, deal.buyer_email, deal.supplier, deal.supplier_email].filter(Boolean);
    return userKeys.some(k => dealKeys.includes(k));
};

const userRoleInDeal = (user, deal) => {
    if (!user || !deal) return null;
    const userKeys = [user.name, user.business_name, user.email].filter(Boolean);
    if (userKeys.includes(deal.buyer) || userKeys.includes(deal.buyer_email)) return "buyer";
    if (userKeys.includes(deal.supplier) || userKeys.includes(deal.supplier_email)) return "supplier";
    return null;
};

const generateTrackingId = (companyName) => {
    const firstWord = companyName.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
    const prefix = firstWord || "COURIER";
    const digits = Math.floor(1000000 + Math.random() * 9000000);
    return `TRK-${prefix}-${digits}`;
};

const pickRegionFor = (location) => {
    if (!location) return REGION_ROUTES[0];
    const lower = location.toLowerCase();
    for (const route of REGION_ROUTES) {
        if (route.states.some(s => lower.includes(s.toLowerCase()))) return route;
        if (lower.includes(route.region.toLowerCase())) return route;
    }
    return REGION_ROUTES[0];
};

const buildCheckpoints = (deal) => {
    const route = pickRegionFor(deal.delivery);
    const states = route.states;
    const midState = states[Math.min(2, states.length - 1)];
    const endState = states[states.length - 1];
    const originCity = states[0] + " depot";
    return [
        `Departed from ${originCity}, ${route.region} region`,
        `Passing through ${midState}, ${route.region} region`,
        `Arrived ${endState}, ${route.region} region`,
        `Out for delivery to ${deal.delivery || "buyer address"}`
    ];
};

async function syncData() {
    try {
        const usersRes = await supabase.getUsers();
        const dealsRes = await supabase.getDeals();
        const notifsRes = await supabase.getNotifications();

        cache.users = Array.isArray(usersRes) ? usersRes : get(STORAGE.users);
        cache.deals = Array.isArray(dealsRes) ? dealsRes : get(STORAGE.deals);
        cache.notifications = Array.isArray(notifsRes) ? notifsRes : get(STORAGE.notifications);

        set(STORAGE.users, cache.users);
        set(STORAGE.deals, cache.deals);
        set(STORAGE.notifications, cache.notifications);
        console.log("✅ Synced:", cache.users.length, "users,", cache.deals.length, "deals");
    } catch (error) {
        console.error("❌ Supabase sync failed:", error);
        console.log("Using cached data");
        cache.users = get(STORAGE.users);
        cache.deals = get(STORAGE.deals);
        cache.notifications = get(STORAGE.notifications);
    }
}

async function addNotification(title, text, type = "green", forEmail = null) {
    const notif = { id: "NTF-" + id(), title, text, type, time: "Just now", for_email: forEmail };
    try {
        await supabase.createNotification(notif);
        cache.notifications.unshift(notif);
    } catch {
        let n = get(STORAGE.notifications);
        n.unshift(notif);
        set(STORAGE.notifications, n.slice(0, 50));
    }
}

// ============================================================
// SEED DATA
// ============================================================
async function seedData() {
    try {
        const users = await supabase.getUsers();
        if (Array.isArray(users) && users.length === 0) {
            const demoUsers = [
                { id: "USR-001", name: "ABC Trading Ltd", email: "abc@example.com", phone: "+234 802 111 2222", role: "customer", verified: true, business_name: "ABC Trading Ltd", trust_score: 96, joined: "Jan 2025", password: "demo123" },
                { id: "USR-003", name: "John Ade", email: "john@example.com", phone: "+234 801 234 5678", role: "customer", verified: true, business_name: "", trust_score: 98, joined: "Dec 2024", password: "demo123" },
                { id: "USR-ADMIN", name: "TrustDeal Admin", email: "admin@trustdeal.test", phone: "+234 800 000 0000", password: "admin123", role: "admin", verified: true, business_name: "TrustDeal", trust_score: 100, joined: "Jan 2025" }
            ];
            for (const u of demoUsers) await supabase.createUser(u);
        }
        await syncData();
    } catch (error) {
        console.error("Seed failed:", error);
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

    let authResult;
    try {
        authResult = await supabase.signIn(email, password);
    } catch (err) {
        toast("Could not reach server. Check your connection.");
        return;
    }

    if (!authResult || authResult.error) {
        const msg = (authResult && authResult.error_description) || (authResult && authResult.error && authResult.error.message) || "Login failed.";
        if (msg.toLowerCase().includes("email not confirmed")) {
            toast("⚠️ Please confirm your email first. Check your inbox.");
        } else if (msg.toLowerCase().includes("invalid")) {
            toast("Wrong email or password.");
        } else {
            toast(msg);
        }
        return;
    }

    if (!authResult.user || !authResult.user.id) {
        toast("Login failed. Please try again.");
        return;
    }

    const authUserId = authResult.user.id;

    await syncData();

    let user = cache.users.find(u => u.auth_user_id === authUserId);

    if (!user) {
        const meta = authResult.user.user_metadata || {};
        user = {
            id: "USR-" + id(),
            auth_user_id: authUserId,
            name: meta.name || email.split("@")[0],
            email: email,
            phone: meta.phone || "",
            role: meta.role || "customer",
            business_name: meta.business_name || "",
            verified: !!authResult.user.email_confirmed_at,
            trust_score: 50,
            joined: new Date().toISOString().split("T")[0]
        };
        try {
            await supabase.createUser(user);
            await syncData();
        } catch (err) {
            console.warn("Could not save profile row:", err);
        }
    } else if (user.verified === false && authResult.user.email_confirmed_at) {
        try {
            await supabase.updateUser(email, { verified: true });
            user.verified = true;
        } catch (err) { /* ignore */ }
    }

    localStorage.setItem(STORAGE.session, user.email);
    toast("Welcome back, " + (user.name || "friend") + "!");
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

    let authResult;
    try {
        authResult = await supabase.signUp(email, password, { name, phone, role, business_name: businessName });
    } catch (err) {
        toast("Could not reach server. Check your connection.");
        return;
    }

    if (!authResult || authResult.error) {
        const msg = (authResult && authResult.error_description) || (authResult && authResult.error && authResult.error.message) || "Sign up failed.";
        toast(msg);
        return;
    }

    if (!authResult.user || !authResult.user.id) {
        toast("Sign up failed. Please try again.");
        return;
    }

    const user = {
        id: "USR-" + id(),
        auth_user_id: authResult.user.id,
        name, email, phone, role,
        business_name: businessName,
        verified: !!authResult.user.email_confirmed_at,
        trust_score: 50,
        joined: new Date().toISOString().split("T")[0]
    };

    try {
        const insertResult = await supabase.createUser(user);
        if (!Array.isArray(insertResult)) {
            document.getElementById("app").innerHTML = `
                <div class="auth-page">
                    <div class="auth-card" style="text-align:center">
                        <div class="logo">Trust<span>Deal</span></div>
                        <h1>⚠️ Profile save failed</h1>
                        <p class="muted">Your login account was created, but we could not save your profile.</p>
                        <p class="muted small">Try logging in — if it fails, please contact support with this email: <b>${email}</b></p>
                        <button class="btn btn-primary" onclick="navigate('login')" style="margin-top:20px">Go to Login</button>
                    </div>
                </div>`;
            return;
        }
    } catch (err) {
        document.getElementById("app").innerHTML = `
            <div class="auth-page">
                <div class="auth-card" style="text-align:center">
                    <div class="logo">Trust<span>Deal</span></div>
                    <h1>⚠️ Profile save failed</h1>
                    <p class="muted">Your login account was created, but we could not save your profile.</p>
                    <p class="muted small">Try logging in — if it fails, contact support. Email: <b>${email}</b></p>
                    <button class="btn btn-primary" onclick="navigate('login')" style="margin-top:20px">Go to Login</button>
                </div>
            </div>`;
        return;
    }

    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-phone').value = '';
    document.getElementById('signup-password').value = '';

    document.getElementById("app").innerHTML = `
        <div class="auth-page">
            <div class="auth-card" style="text-align:center">
                <div class="logo">Trust<span>Deal</span></div>
                <div class="label" style="margin-top:25px">VERIFY YOUR EMAIL</div>
                <h1>📧 Check your inbox!</h1>
                <p class="muted">We sent a confirmation link to <b>${email}</b>.</p>
                <p class="muted">Click the link in the email to activate your account, then log in.</p>
                <button class="btn btn-primary" onclick="navigate('login')" style="margin-top:20px">Go to Login</button>
            </div>
        </div>`;
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
    let deals = allDeals.filter(d => userMatchesDeal(user, d));

    let total = deals.reduce((s, d) => s + d.amount, 0);
    let secured = deals.filter(d => d.buyer_paid && !d.supplier_paid).reduce((s, d) => s + d.amount, 0);
    let completed = deals.filter(d => d.status === "completed").length;
    let pending = deals.filter(d => d.status === "pending").length;
    let escrow = deals.filter(d => d.status === "escrow").length;
    let inTransit = deals.filter(d => d.status === "in_transit" || d.status === "picked_up").length;
    let delivered = deals.filter(d => d.status === "delivered").length;

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
            <div class="card" style="background:var(--purple-light)"><div class="label">IN TRANSIT</div><div class="stat-number">${inTransit}</div></div>
            <div class="card" style="background:var(--blue-light)"><div class="label">DELIVERED</div><div class="stat-number">${delivered}</div></div>
        </section>
        <section class="card section">
            <div class="page-header"><div><h2>Your transactions</h2><div class="muted small">${deals.length} deal${deals.length !== 1 ? "s" : ""}</div></div><span class="badge badge-green">● ${deals.length > 0 ? "Active" : "Ready"}</span></div>
            ${dealsContent}
        </section>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">ACCOUNT</div><h2>${user.name}</h2><p class="muted">${user.email}</p><p class="small">Joined: ${user.joined || "N/A"} · ${user.role}</p><button class="btn btn-light" onclick="navigate('account')">View account</button></div>
            <div class="card"><div class="label">NOTIFICATIONS</div>${notificationPreview(user)}</div>
        </section>
    </main>`;
}

function statusBadge(d) {
    if (d.status === "escrow") return '<span class="badge badge-green">🟢 Escrow</span>';
    if (d.status === "logistics_chosen") return '<span class="badge badge-purple">📦 Logistics Chosen</span>';
    if (d.status === "tracking_confirmed") return '<span class="badge badge-purple">✅ Tracking Confirmed</span>';
    if (d.status === "picked_up") return '<span class="badge badge-purple">🚚 Picked Up</span>';
    if (d.status === "in_transit") return '<span class="badge badge-purple">📍 In Transit</span>';
    if (d.status === "delivered") return '<span class="badge badge-blue">📬 Delivered</span>';
    if (d.status === "completed") return '<span class="badge badge-green">🟢 Completed</span>';
    if (d.status === "dispute") return '<span class="badge badge-red">🔴 Dispute</span>';
    return '<span class="badge badge-orange">🟠 Pending</span>';
}

function dealRow(d) {
    let user = currentUser();
    let role = userRoleInDeal(user, d);
    let roleLabel = role === "buyer" ? "You (Buyer)" : role === "supplier" ? "You (Supplier)" : "—";

    return `<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:15px;align-items:center;padding:17px 0;border-bottom:1px solid var(--line)">
        <div><b>${d.title}</b><div class="small muted">${d.id}</div></div>
        <div>${money(d.amount)}</div>
        <div class="small"><b>${roleLabel}</b><br><span class="small muted">${d.buyer} → ${d.supplier}</span></div>
        <div>${statusBadge(d)}</div>
        <button class="btn btn-light" onclick="navigate('transaction','${d.id}')">View</button>
    </div>`;
}

function notificationPreview(user) {
    let n = cache.notifications.length > 0 ? cache.notifications : get(STORAGE.notifications);
    if (user && user.email) n = n.filter(x => !x.for_email || x.for_email === user.email);
    return n.slice(0, 3).map(n => `<div class="notification">
        <span class="badge ${n.type === "red" ? "badge-red" : n.type === "blue" ? "badge-blue" : n.type === "purple" ? "badge-purple" : "badge-green"}">●</span>
        <div><b>${n.title}</b><div class="small muted">${n.text}</div><div class="small muted">${n.time}</div></div>
    </div>`).join("") || `<p class="muted">No notifications yet.</p>`;
}

// ============================================================
// CREATE DEAL
// ============================================================
function createDealPage() {
    let user = currentUser();
    if (!user) return login();

    let isSupplier = user.role === "supplier";
    let counterpartyLabel = isSupplier ? "Buyer / Customer" : "Supplier / Vendor";
    let counterpartyNamePlaceholder = isSupplier ? "ABC Trading Ltd" : "XYZ Manufacturing Ltd";
    let counterpartyEmailPlaceholder = isSupplier ? "buyer@example.com" : "supplier@example.com";
    let counterpartyNameId = isSupplier ? "deal-buyer" : "deal-supplier";
    let counterpartyEmailId = isSupplier ? "deal-buyer-email" : "deal-supplier-email";

    let logisticsField = isSupplier ? `
        <label>Logistics Company
            <select id="deal-logistics" class="input" onchange="toggleCustomLogistics()">
                ${LOGISTICS_COMPANIES.map(c => `<option value="${c}">${c}</option>`).join("")}
                <option value="__other__">Other (enter manually)</option>
            </select>
        </label>
        <label id="deal-logistics-custom-wrap" style="display:none">Custom logistics name
            <input id="deal-logistics-custom" class="input" placeholder="SwiftCourier Ltd">
        </label>
    ` : `
        <div class="card" style="background:var(--bg);box-shadow:none">
            <b>Logistics will be chosen by the supplier</b>
            <p class="small muted" style="margin:6px 0 0">Once you fund the escrow, the supplier will select a logistics company and send you their tracking ID for confirmation.</p>
        </div>
    `;

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">PROTECTED DEAL</div><h1>Create a transaction</h1><p class="muted">Define exactly what the buyer and supplier have agreed to.</p></div></div>
        <div class="card" style="max-width:750px">
            <form class="form" onsubmit="createDeal(event)">
                <label>Transaction title<input id="deal-title" class="input" placeholder="Building materials supply" required></label>

                <label>${counterpartyLabel}<input id="${counterpartyNameId}" class="input" placeholder="${counterpartyNamePlaceholder}" required></label>
                <label>${counterpartyLabel} email<input id="${counterpartyEmailId}" class="input" type="email" placeholder="${counterpartyEmailPlaceholder}" required></label>

                <label>Product / service<input id="deal-product" class="input" placeholder="Cement, rice, equipment..." required></label>
                <label>Quantity<input id="deal-quantity" class="input" placeholder="500 bags" required></label>
                <label>Transaction value (NGN)<input id="deal-amount" class="input" type="number" min="1" placeholder="5000000" required></label>
                <label>Delivery location<input id="deal-location" class="input" placeholder="Abeokuta, Ogun State" required></label>
                <label>Payment condition<select id="deal-condition" class="input"><option>Release after verified delivery</option><option>Release after buyer confirmation</option><option>Milestone payment</option></select></label>

                ${logisticsField}

                <div class="card" style="background:var(--bg);box-shadow:none"><b>How protection works</b><p class="small muted">Buyer payment is represented as secured funds in this prototype.</p></div>
                <button class="btn btn-green" type="submit">Create protected deal</button>
            </form>
        </div>
    </main>`;
}

function toggleCustomLogistics() {
    let sel = document.getElementById("deal-logistics");
    let wrap = document.getElementById("deal-logistics-custom-wrap");
    if (!sel || !wrap) return;
    wrap.style.display = sel.value === "__other__" ? "block" : "none";
}

async function createDeal(e) {
    e.preventDefault();
    let user = currentUser();
    if (!user) { toast("Please login first."); navigate("login"); return; }

    let isSupplier = user.role === "supplier";

    let counterpartyName = (isSupplier
        ? document.getElementById("deal-buyer").value
        : document.getElementById("deal-supplier").value
    ).trim();

    let counterpartyEmail = (isSupplier
        ? document.getElementById("deal-buyer-email").value
        : document.getElementById("deal-supplier-email").value
    ).trim().toLowerCase();

    if (!counterpartyEmail) {
        toast("Please enter the " + (isSupplier ? "buyer's" : "supplier's") + " email address.");
        return;
    }

    let logisticsCompany = "";
    let trackingId = "";

    if (isSupplier) {
        let sel = document.getElementById("deal-logistics").value;
        if (sel === "__other__") {
            let custom = (document.getElementById("deal-logistics-custom").value || "").trim();
            if (!custom) { toast("Please enter the logistics company name."); return; }
            logisticsCompany = custom;
        } else {
            logisticsCompany = sel;
        }
        trackingId = generateTrackingId(logisticsCompany);
    }

    let buyer = isSupplier ? counterpartyName : (user.business_name || user.name);
    let buyerEmail = isSupplier ? counterpartyEmail : user.email;
    let supplier = isSupplier ? (user.business_name || user.name) : counterpartyName;
    let supplierEmail = isSupplier ? user.email : counterpartyEmail;

    let deal = {
        id: "TD-" + id(),
        title: document.getElementById("deal-title").value.trim(),
        buyer,
        buyer_email: buyerEmail,
        supplier,
        supplier_email: supplierEmail,
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
        dispute: false,
        logistics_company: logisticsCompany,
        tracking_id: trackingId,
        logistics_checkpoint: 0,
        logistics_location: "",
        logistics_region: "",
        logistics_eta: "",
        buyer_confirmed_tracking: false,
        buyer_confirmed_receipt: false,
        initiator: isSupplier ? "supplier" : "buyer"
    };

    // Try Supabase first
    let saved = false;
    try {
        const result = await supabase.createDeal(deal);
        if (Array.isArray(result) && result.length > 0) {
            saved = true;
            console.log("✅ Deal saved to Supabase:", result[0]);
        } else {
            console.warn("⚠️ Supabase createDeal returned unexpected result:", result);
        }
    } catch (err) {
        console.warn("⚠️ Supabase createDeal threw:", err);
    }

    // Always write to local cache too — so the transaction page can find it
    let localDeals = get(STORAGE.deals).filter(x => x.id !== deal.id);
    localDeals.unshift(deal);
    set(STORAGE.deals, localDeals);

    // Update in-memory cache immediately
    cache.deals = [deal, ...cache.deals.filter(x => x.id !== deal.id)];

    if (saved) {
        await syncData();
        // Ensure our new deal is still in cache after sync (in case the fetch missed it)
        if (!cache.deals.find(x => x.id === deal.id)) {
            cache.deals.unshift(deal);
        }
    }

    // Notifications
    addNotification("New deal created", deal.id + " - " + deal.title + " by " + user.name, "blue").catch(() => {});
    if (deal.supplier_email) addNotification("You have a new deal", deal.id + " — " + deal.title + " awaiting your response.", "blue", deal.supplier_email).catch(() => {});
    if (deal.buyer_email) addNotification("You have a new deal", deal.id + " — " + deal.title + " awaiting your response.", "blue", deal.buyer_email).catch(() => {});

    toast(saved ? "Protected deal created!" : "Deal saved locally — check connection.");
    setTimeout(() => navigate("transaction", deal.id), 500);
}

// ============================================================
// TRANSACTION PAGE
// ============================================================
async function transactionPage(dealId) {
    // Try cache first
    let deals = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let d = deals.find(x => x.id === dealId);

    // If not found, force a fresh sync and try again
    if (!d) {
        await syncData();
        deals = cache.deals;
        d = deals.find(x => x.id === dealId);
    }

    // Last resort: check localStorage
    if (!d) {
        d = get(STORAGE.deals).find(x => x.id === dealId);
    }

    if (!d) {
        return `${dashboardNavbar()}<main class="container"><div class="card"><h1>Transaction not found</h1><p class="muted">This deal may have been deleted or the link is incorrect.</p><button class="btn btn-light" onclick="navigate('dashboard')">Back to Dashboard</button></div></main>`;
    }

    let completed = d.status === "completed";
    let disputed = d.dispute === true;
    let headerBadge = completed ? "badge-green" : disputed ? "badge-red" : (d.status === "in_transit" || d.status === "picked_up" || d.status === "logistics_chosen" || d.status === "tracking_confirmed") ? "badge-purple" : "badge-blue";
    let headerText = completed ? "● Completed" : disputed ? "● Dispute" : d.status === "in_transit" ? "● In Transit" : d.status === "picked_up" ? "● Picked Up" : d.status === "delivered" ? "● Delivered" : d.status === "logistics_chosen" ? "● Logistics Chosen" : d.status === "tracking_confirmed" ? "● Tracking Confirmed" : "● Protected";

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header">
            <div><div class="label">TRANSACTION ${d.id}</div><h1>${d.title}</h1><p class="muted">Track exactly where the transaction stands.</p></div>
            <span class="badge ${headerBadge}">${headerText}</span>
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

        ${logisticsSection(d)}

        <section class="grid grid-2 section">
            <div class="card"><div class="label">TRANSACTION DETAILS</div><h2>Order information</h2><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity || "—"}</p><p><b>Delivery:</b> ${d.delivery || "—"}</p><p><b>Payment rule:</b> ${d.condition || "Standard"}</p><p><b>Created:</b> ${d.created || "—"}</p></div>
            <div class="card"><div class="label">TRANSACTION PROTECTION</div><h2>Where is the money?</h2>${moneyStateBox(d)}</div>
        </section>

        <section class="card section">
            <div class="label">TRANSACTION CONTROLS</div>
            <h2>Advance the deal</h2>
            <p class="muted small">These buttons simulate real-world events. In production, they come from verified payment, logistics and delivery systems.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap">${actionButtons(d)}</div>
        </section>
    </main>`;
}

function logisticsSection(d) {
    let hasLogistics = !!d.logistics_company;
    let checkpoints = hasLogistics ? buildCheckpoints(d) : [];
    let currentIdx = d.logistics_checkpoint || 0;

    let checkpointsHtml = hasLogistics ? checkpoints.map((c, i) => {
        let cls = i < currentIdx ? "done" : i === currentIdx && d.status === "in_transit" ? "current" : "";
        return `<div class="checkpoint"><div class="checkpoint-dot ${cls}"></div><div class="small">${c}</div></div>`;
    }).join("") : "";

    return `
        <section class="card section">
            <div class="page-header">
                <div><div class="label">LOGISTICS</div><h2>Shipment tracking</h2></div>
                ${hasLogistics ? `<span class="badge badge-purple">📦 ${d.logistics_company}</span>` : `<span class="badge badge-orange">Awaiting logistics choice</span>`}
            </div>

            ${!hasLogistics ? `
                <p class="muted">The supplier chooses the logistics company once the deal is funded. The tracking ID will appear here for the buyer to confirm.</p>
            ` : `
                <div class="grid grid-2" style="margin-bottom:16px">
                    <div class="logistics-box">
                        <div class="label">LOGISTICS COMPANY</div>
                        <h3 style="margin:6px 0">${d.logistics_company}</h3>
                        <div class="small muted">Tracking ID: <b>${d.tracking_id}</b></div>
                        ${d.buyer_confirmed_tracking ? `<div style="margin-top:8px"><span class="badge badge-green">✓ Tracking ID confirmed by buyer</span></div>` : `<div style="margin-top:8px"><span class="badge badge-orange">⏳ Awaiting buyer confirmation of tracking ID</span></div>`}
                    </div>
                    <div class="logistics-box">
                        <div class="label">LIVE STATUS</div>
                        <h3 style="margin:6px 0">${d.logistics_location || "Preparing for pickup"}</h3>
                        ${d.logistics_region ? `<div class="small muted">Region: ${d.logistics_region}</div>` : ""}
                        ${d.logistics_eta ? `<div class="small muted">Estimated delivery: <b>${d.logistics_eta}</b></div>` : ""}
                    </div>
                </div>
                ${checkpointsHtml ? `<div style="margin-top:6px">${checkpointsHtml}</div>` : ""}
            `}
        </section>
    `;
}

function moneyStateBox(d) {
    if (d.supplier_paid) {
        return `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Supplier has been paid</b><p class="small">The protected transaction has completed.</p></div>`;
    }
    if (d.buyer_paid && d.status === "delivered") {
        return `<div style="background:var(--blue-light);padding:17px;border-radius:12px"><b style="color:#1d4ed8">🔵 Delivered — awaiting buyer confirmation</b><p class="small">Funds stay in escrow until the buyer confirms receipt.</p></div>`;
    }
    if (d.buyer_paid) {
        return `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Customer has credited</b><p class="small">The transaction is funded. Funds will be released after delivery and buyer confirmation.</p></div>`;
    }
    return `<div style="background:var(--red-light);padding:17px;border-radius:12px"><b style="color:#991b1b">🔴 Waiting for customer payment</b><p class="small">The supplier will choose logistics once payment is secured.</p></div>`;
}

function actionButtons(d) {
    let btns = [];

    if (!d.buyer_paid) {
        btns.push(`<button class="btn btn-green" onclick="fundDeal('${d.id}')">🟢 Fund Escrow (Buyer)</button>`);
    }
    if (d.buyer_paid && !d.logistics_company) {
        btns.push(`<button class="btn btn-purple" onclick="openLogisticsPicker('${d.id}')">📦 Choose Logistics (Supplier)</button>`);
    }
    if (d.logistics_company && !d.buyer_confirmed_tracking) {
        btns.push(`<button class="btn btn-primary" onclick="confirmTracking('${d.id}')">✅ Confirm Tracking ID (Buyer)</button>`);
    }
    if (d.buyer_confirmed_tracking && !["picked_up", "in_transit", "delivered", "completed"].includes(d.status)) {
        btns.push(`<button class="btn btn-purple" onclick="markPickedUp('${d.id}')">🚚 Mark Handed to Courier (Supplier)</button>`);
    }
    if (d.status === "picked_up") {
        btns.push(`<button class="btn btn-primary" onclick="simulateInTransit('${d.id}')">📍 Simulate In Transit</button>`);
    }
    if (d.status === "in_transit") {
        btns.push(`<button class="btn btn-primary" onclick="advanceCheckpoint('${d.id}')">➡️ Advance Checkpoint</button>`);
        btns.push(`<button class="btn btn-purple" onclick="simulateDelivered('${d.id}')">📬 Simulate Delivered</button>`);
    }
    if (d.status === "delivered" && !d.supplier_paid) {
        btns.push(`<button class="btn btn-green" onclick="confirmReceipt('${d.id}')">💰 Confirm Receipt & Release Funds (Buyer)</button>`);
    }
    if (d.buyer_paid && !d.supplier_paid && !d.dispute) {
        btns.push(`<button class="btn btn-red" onclick="openDispute('${d.id}')">⚠ Open Dispute</button>`);
    }

    if (btns.length === 0) return `<p class="muted small">No actions available right now.</p>`;
    return btns.join("");
}

// ============================================================
// TRANSACTION ACTIONS
// ============================================================
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

async function fundDeal(id) {
    await updateDeal(id, d => {
        d.buyer_paid = true;
        d.status = "escrow";
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Escrow funded", d.id + " — funds are secured in TrustDeal.", "green");
        if (d.supplier_email) await addNotification("Funds secured — choose logistics", d.id + " is now funded. Please select a logistics company.", "purple", d.supplier_email);
    }
    toast("Escrow funded. Supplier can now choose logistics.");
}

function openLogisticsPicker(id) {
    let options = LOGISTICS_COMPANIES.map(c => `<option value="${c}">${c}</option>`).join("");
    let modal = document.createElement("div");
    modal.id = "logistics-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,.6);display:grid;place-items:center;z-index:1000;padding:20px";
    modal.innerHTML = `
        <div class="card" style="width:min(440px,100%)">
            <div class="label">SUPPLIER ACTION</div>
            <h2>Choose a logistics company</h2>
            <p class="muted small">The buyer will receive the tracking ID for confirmation.</p>
            <label>Logistics company
                <select id="modal-logistics" class="input" onchange="document.getElementById('modal-custom-wrap').style.display = this.value === '__other__' ? 'block' : 'none'">
                    ${options}
                    <option value="__other__">Other (enter manually)</option>
                </select>
            </label>
            <label id="modal-custom-wrap" style="display:none">Custom logistics name
                <input id="modal-custom" class="input" placeholder="SwiftCourier Ltd">
            </label>
            <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">
                <button class="btn btn-light" onclick="document.getElementById('logistics-modal').remove()">Cancel</button>
                <button class="btn btn-purple" onclick="submitLogistics('${id}')">Confirm & Generate Tracking ID</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

async function submitLogistics(id) {
    let sel = document.getElementById("modal-logistics").value;
    let companyName = sel === "__other__" ? (document.getElementById("modal-custom").value || "").trim() : sel;
    if (!companyName) { toast("Please enter the logistics company name."); return; }
    let trackingId = generateTrackingId(companyName);

    let modal = document.getElementById("logistics-modal");
    if (modal) modal.remove();

    await updateDeal(id, d => {
        d.logistics_company = companyName;
        d.tracking_id = trackingId;
        d.status = "logistics_chosen";
    });

    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Logistics chosen", d.id + " — " + companyName + " · " + trackingId, "purple");
        if (d.buyer_email) await addNotification("Tracking ID received", d.id + " — " + companyName + " · " + trackingId + ". Please confirm.", "purple", d.buyer_email);
    }
    toast("Logistics confirmed. Tracking ID generated.");
}

async function confirmTracking(id) {
    await updateDeal(id, d => {
        d.buyer_confirmed_tracking = true;
        d.status = "tracking_confirmed";
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Tracking ID confirmed", d.id + " — buyer acknowledged " + d.tracking_id, "green");
        if (d.supplier_email) await addNotification("Buyer confirmed tracking", d.id + " — safe to hand over to courier.", "green", d.supplier_email);
    }
    toast("Tracking ID confirmed.");
}

async function markPickedUp(id) {
    await updateDeal(id, d => {
        d.status = "picked_up";
        d.logistics_checkpoint = 0;
        let checkpoints = buildCheckpoints(d);
        d.logistics_location = checkpoints[0];
        d.logistics_region = pickRegionFor(d.delivery).region;
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Handed to courier", d.id + " — collected by " + d.logistics_company, "purple");
        if (d.buyer_email) await addNotification("Shipment in progress", d.id + " — " + d.logistics_company + " has collected your goods.", "purple", d.buyer_email);
    }
    toast("Courier has the goods.");
}

async function simulateInTransit(id) {
    await updateDeal(id, d => {
        d.status = "in_transit";
        d.logistics_checkpoint = 1;
        let checkpoints = buildCheckpoints(d);
        d.logistics_location = checkpoints[1];
        d.logistics_region = pickRegionFor(d.delivery).region;
        d.logistics_eta = ETA_OPTIONS[Math.floor(Math.random() * ETA_OPTIONS.length)];
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("In transit", d.id + " — " + d.logistics_location, "purple");
        if (d.buyer_email) await addNotification("Your shipment is moving", d.id + " — " + d.logistics_location + " · ETA " + d.logistics_eta, "purple", d.buyer_email);
    }
    toast("Shipment is in transit.");
}

async function advanceCheckpoint(id) {
    await updateDeal(id, d => {
        let checkpoints = buildCheckpoints(d);
        d.logistics_checkpoint = Math.min((d.logistics_checkpoint || 0) + 1, checkpoints.length - 1);
        d.logistics_location = checkpoints[d.logistics_checkpoint];
        d.logistics_eta = d.logistics_checkpoint >= checkpoints.length - 1 ? "Arriving now" : ETA_OPTIONS[Math.floor(Math.random() * 3)];
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) await addNotification("Checkpoint", d.id + " — " + d.logistics_location, "purple");
    toast("Checkpoint advanced.");
}

async function simulateDelivered(id) {
    await updateDeal(id, d => {
        d.status = "delivered";
        d.logistics_checkpoint = 4;
        d.logistics_location = "Delivered to buyer";
        d.logistics_eta = "Delivered";
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Delivered", d.id + " — awaiting buyer confirmation.", "blue");
        if (d.buyer_email) await addNotification("Delivered — please confirm", d.id + " — confirm receipt to release funds.", "blue", d.buyer_email);
    }
    toast("Delivered. Awaiting buyer confirmation.");
}

async function confirmReceipt(id) {
    await updateDeal(id, d => {
        d.buyer_confirmed_receipt = true;
        d.supplier_delivered = true;
        d.supplier_paid = true;
        d.status = "completed";
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) {
        await addNotification("Payment released", d.id + " — " + money(d.amount) + " released to " + d.supplier, "green");
        if (d.supplier_email) await addNotification("You've been paid", d.id + " — " + money(d.amount) + " released.", "green", d.supplier_email);
    }
    toast("Receipt confirmed. Funds released to supplier.");
}

async function openDispute(id) {
    await updateDeal(id, d => {
        d.dispute = true;
        d.status = "dispute";
    });
    let d = cache.deals.find(x => x.id === id) || get(STORAGE.deals).find(x => x.id === id);
    if (d) await addNotification("Dispute opened", d.id + " paused for review.", "red");
    toast("Dispute opened.");
}

// ============================================================
// TRANSACTIONS LIST
// ============================================================
function transactionsPage() {
    let user = currentUser();
    if (!user) return login();
    let allDeals = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let deals = allDeals.filter(d => userMatchesDeal(user, d));

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">TRANSACTIONS</div><h1>Your deals</h1><p class="muted">${deals.length} transaction${deals.length !== 1 ? "s" : ""}</p></div><button class="btn btn-green" onclick="navigate('create')">+ New Deal</button></div>
        <div class="card">
            ${deals.length === 0 ? `<div class="empty-state"><div class="icon">📋</div><h2>No transactions</h2><p>Start your first protected transaction now.</p><button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button></div>` :
            `<div class="table-wrapper"><table><thead><tr><th>Deal</th><th>Buyer</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${deals.map(d => `<tr><td><b>${d.title}</b><div class="small muted">${d.id}</div></td><td>${d.buyer}</td><td>${d.supplier}</td><td>${money(d.amount)}</td><td>${statusBadge(d)}</td><td><button class="btn btn-light" onclick="navigate('transaction','${d.id}')">Open</button></td></tr>`).join("")}</tbody></table></div>`}
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
    let deals = allDeals.filter(d => userMatchesDeal(user, d));

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
    if (d.status === "delivered") return '<span class="badge badge-blue">📬 DELIVERED</span>';
    if (d.status === "in_transit") return '<span class="badge badge-purple">📍 IN TRANSIT</span>';
    if (d.status === "picked_up") return '<span class="badge badge-purple">🚚 PICKED UP</span>';
    if (d.status === "tracking_confirmed") return '<span class="badge badge-purple">✅ TRACKING OK</span>';
    if (d.status === "logistics_chosen") return '<span class="badge badge-purple">📦 LOGISTICS SET</span>';
    if (d.buyer_paid) return '<span class="badge badge-green">🟢 ESCROW</span>';
    return '<span class="badge badge-orange">🟠 AWAITING FUNDING</span>';
}

function adminTransactionTable(ds) {
    if (!ds.length) return '<div class="empty-state"><div class="icon">📊</div><h2>No transactions</h2></div>';
    return `<div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>Customer</th><th>Supplier</th><th>Value</th><th>Logistics</th><th>Position</th><th></th></tr></thead><tbody>${ds.map(d => `<tr><td><b>${d.id}</b><div class="small muted">${d.title}</div></td><td>${d.buyer}</td><td>${d.supplier}</td><td>${money(d.amount)}</td><td class="small">${d.logistics_company ? `<b>${d.logistics_company}</b><div class="small muted">${d.tracking_id}</div>` : '<span class="muted">—</span>'}</td><td>${adminDealStatus(d)}</td><td><button class="btn btn-light" onclick="navigate('admin-transaction','${d.id}')">Monitor</button></td></tr>`).join("")}</tbody></table></div>`;
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
            <div class="card" style="background:var(--purple-light)"><div class="label">IN LOGISTICS</div><div class="stat-number">${ds.filter(d => ["logistics_chosen","tracking_confirmed","picked_up","in_transit"].includes(d.status)).length}</div></div>
            <div class="card" style="background:var(--blue-light)"><div class="label">DELIVERED</div><div class="stat-number">${ds.filter(d => d.status === "delivered").length}</div></div>
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
        ${us.length === 0 ? `<div class="card"><div class="empty-state"><div class="icon">🏭</div><h2>No suppliers yet</h2></div></div>` : `<div class="grid grid-2">${us.map(u => { let name = u.business_name || u.name; let x = ds.filter(d => d.supplier === name || d.supplier_email === u.email); let v = x.reduce((s, d) => s + d.amount, 0); return `<div class="card"><div class="page-header"><div><div class="label">SUPPLIER</div><h2>${name}</h2><div class="muted">${u.email}</div></div>${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-orange">Pending</span>'}</div><div class="grid grid-3"><div><div class="label">DEALS</div><b>${x.length}</b></div><div><div class="label">VALUE</div><b>${x.length === 0 ? "₦0" : money(v)}</b></div><div><div class="label">COMPLETED</div><b>${x.filter(d => d.status === "completed").length}</b></div></div></div>` }).join("")}</div>`}</main>`;
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
        ${d.logistics_company ? `
        <section class="card section">
            <div class="page-header"><div><div class="label">LOGISTICS</div><h2>${d.logistics_company}</h2></div><span class="badge badge-purple">📦 ${d.tracking_id}</span></div>
            <div class="grid grid-2">
                <div><div class="label">CURRENT LOCATION</div><p>${d.logistics_location || "Preparing"}</p></div>
                <div><div class="label">ETA</div><p>${d.logistics_eta || "—"}</p></div>
            </div>
        </section>` : ""}
        <section class="grid grid-2 section">
            <div class="card"><div class="label">DETAILS</div><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity}</p><p><b>Delivery:</b> ${d.delivery}</p><p><b>Condition:</b> ${d.condition}</p></div>
            <div class="card"><div class="label">TIMELINE</div><div style="display:grid;gap:8px;margin-top:8px"><div>${d.buyer_paid ? "✅ Customer funded" : "⏳ Awaiting funding"}</div><div>${d.logistics_company ? "✅ Logistics: " + d.logistics_company : "⏳ Awaiting logistics"}</div><div>${d.supplier_delivered ? "✅ Delivery confirmed" : "⏳ Awaiting delivery"}</div><div>${d.supplier_paid ? "✅ Payment released" : "⏳ Payment locked"}</div></div></div>
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
    let ds = cache.deals.length > 0 ? cache.deals : get(STORAGE.deals);
    let d = ds.find(x => x.id === id);
    if (!d) return;
    let newStatus = d.buyer_paid ? (d.logistics_company ? "logistics_chosen" : "escrow") : "pending";
    try {
        await supabase.updateDeal(id, { dispute: false, status: newStatus });
        await syncData();
        await addNotification("Dispute resolved", id + " reviewed.", "green");
        toast("Dispute resolved.");
        navigate("admin-transaction", id);
    } catch {
        let ds2 = get(STORAGE.deals);
        let d2 = ds2.find(x => x.id === id);
        if (d2) { d2.dispute = false; d2.status = newStatus; set(STORAGE.deals, ds2); }
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
        case "transaction": app.innerHTML = await transactionPage(param); break;
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

// ============================================================
// AUTO-LOGIN FROM EMAIL VERIFICATION LINK
// ============================================================
async function handleEmailVerification() {
    const hash = window.location.hash || "";
    const hasAuthToken = hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=recovery");

    if (hasAuthToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            toast("✅ Email verified! Please log in.");
            navigate("login");
        }, 200);
    }
}

handleEmailVerification();
