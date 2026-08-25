// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://epqxjwokutjzwpnrtzeb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HmuOnCJlo38T1Wf5eWvb4g_thTld5Ew';

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    
    // AUTH METHODS
    async signUp(email, password, userData) {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                data: userData
            })
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
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        return response.json();
    },
    
    async signOut(accessToken) {
        const response = await fetch(`${this.url}/auth/v1/logout`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response;
    },
    
    async getSession() {
        const response = await fetch(`${this.url}/auth/v1/user`, {
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${localStorage.getItem('sb_access_token')}`
            }
        });
        if (response.status === 200) {
            return response.json();
        }
        return null;
    },
    
    // USERS TABLE METHODS
    async getUsers() {
        const response = await fetch(`${this.url}/rest/v1/users?select=*`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        return response.json();
    },
    
    async getUser(email) {
        const response = await fetch(`${this.url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
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
    
    // DEALS METHODS
    async getDeals() {
        const response = await fetch(`${this.url}/rest/v1/deals?select=*`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
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
    
    // NOTIFICATIONS
    async getNotifications() {
        const response = await fetch(`${this.url}/rest/v1/notifications?select=*`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
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

let cache = {
    users: [],
    deals: [],
    notifications: []
};

const get = (k) => JSON.parse(localStorage.getItem(k)) || [];
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const money = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
const toast = (msg) => { let el = document.getElementById("toast"); el.innerText = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3000); };
const id = () => Math.random().toString(36).substring(2, 9).toUpperCase();
const currentUser = () => { let email = localStorage.getItem(STORAGE.session); if (!email) return null; return cache.users.find(u => u.email === email) || null; };
const initials = (n) => n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();

// ============================================================
// SYNC DATA
// ============================================================
async function syncData() {
    try {
        cache.users = await supabase.getUsers();
        cache.deals = await supabase.getDeals();
        cache.notifications = await supabase.getNotifications();
        set(STORAGE.users, cache.users);
        set(STORAGE.deals, cache.deals);
        set(STORAGE.notifications, cache.notifications);
    } catch (error) {
        console.log("Using cached data (offline mode)");
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
// SEED DATA - Only if tables are empty
// ============================================================
async function seedData() {
    try {
        const users = await supabase.getUsers();
        if (users.length === 0) {
            // Add demo users (password: demo123)
            const demoUsers = [
                { id: "USR-001", name: "ABC Trading Ltd", email: "abc@example.com", phone: "+234 802 111 2222", role: "customer", verified: true, business_name: "ABC Trading Ltd", trust_score: 96, joined: "Jan 2025", password: "demo123" },
                { id: "USR-003", name: "John Ade", email: "john@example.com", phone: "+234 801 234 5678", role: "customer", verified: true, business_name: "", trust_score: 98, joined: "Dec 2024", password: "demo123" },
                { id: "USR-ADMIN", name: "TrustDeal Admin", email: "admin@trustdeal.test", phone: "+234 800 000 0000", password: "admin123", role: "admin", verified: true, business_name: "TrustDeal", trust_score: 100, joined: "Jan 2025" }
            ];
            
            for (const u of demoUsers) {
                await supabase.createUser(u);
            }
            
            // Add demo deals
            const demoDeals = [
                { id: "TD-10452", title: "500 bags cement", product: "Building Materials", buyer: "ABC Trading Ltd", supplier: "XYZ Manufacturing", amount: 5000000, buyer_paid: true, supplier_delivered: false, supplier_paid: false, status: "escrow", dispute: false, quantity: "500 bags", delivery: "Abeokuta, Ogun State", condition: "Release after verified delivery", created: "2025-04-15" },
                { id: "TD-10451", title: "Industrial food supply", product: "Food", buyer: "John Ade", supplier: "Ogun Foods", amount: 2400000, buyer_paid: true, supplier_delivered: true, supplier_paid: true, status: "completed", dispute: false, quantity: "500 bags", delivery: "Lagos", condition: "Release after buyer confirmation", created: "2025-03-20" }
            ];
            
            for (const d of demoDeals) {
                await supabase.createDeal(d);
            }
        }
        await syncData();
    } catch (error) {
        console.log("Error seeding data:", error);
        if (!localStorage.getItem(STORAGE.users)) {
            seedLocalFallback();
        }
        await syncData();
    }
}

function seedLocalFallback() {
    if (!localStorage.getItem(STORAGE.users)) {
        set(STORAGE.users, [
            { id: "USR-003", name: "John Ade", email: "john@example.com", phone: "+234 801 234 5678", role: "customer", verified: true, business_name: "", trust_score: 98, joined: "Dec 2024", password: "demo123" },
            { id: "USR-ADMIN", name: "TrustDeal Admin", email: "admin@trustdeal.test", phone: "+234 800 000 0000", password: "admin123", role: "admin", verified: true, business_name: "TrustDeal", trust_score: 100, joined: "Jan 2025" }
        ]);
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
    
    try {
        // Try Supabase auth login
        const authResult = await supabase.signIn(email, password);
        
        if (authResult.error) {
            toast(authResult.error.message || "Login failed. Please try again.");
            return;
        }
        
        // Store access token
        if (authResult.access_token) {
            localStorage.setItem('sb_access_token', authResult.access_token);
        }
        
        await syncData();
        let user = cache.users.find(u => u.email === email);
        
        if (!user) {
            toast("Account not found. Please sign up first.");
            return;
        }
        
        // Check if email is verified
        if (user.verified === false) {
            toast("⚠️ Please verify your email first. Check your inbox!");
            return;
        }
        
        localStorage.setItem(STORAGE.session, email);
        toast("Welcome back, " + user.name + "!");
        navigate("dashboard");
    } catch (error) {
        // Fallback to localStorage
        let users = get(STORAGE.users);
        let user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            let exists = users.find(u => u.email === email);
            if (exists) { toast("Wrong password. Please try again."); } else { toast("Account not found. Please sign up first."); }
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
}

// ============================================================
// SIGNUP - With Email Verification
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
    
    try {
        // Step 1: Create user in Supabase Auth
        const authResult = await supabase.signUp(email, password, {
            name: name,
            phone: phone,
            role: role,
            business_name: businessName
        });
        
        if (authResult.error) {
            toast(authResult.error.message || "Sign up failed. Please try again.");
            return;
        }
        
        // Step 2: Save user data to users table
        let user = {
            id: "USR-" + id(),
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role,
            business_name: businessName,
            verified: false,
            trust_score: 50,
            joined: new Date().toISOString().split("T")[0]
        };
        
        await supabase.createUser(user);
        await syncData();
        
        // Store access token if provided
        if (authResult.access_token) {
            localStorage.setItem('sb_access_token', authResult.access_token);
        }
        
        // Don't auto-login - require email verification
        toast("✅ Account created! Please check your email to verify your account.");
        
        // Clear form
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-phone').value = '';
        document.getElementById('signup-password').value = '';
        
        // Navigate to login after a few seconds
        setTimeout(() => {
            navigate('login');
        }, 3000);
        
    } catch (error) {
        // Fallback to localStorage
        let users = get(STORAGE.users);
        if (users.some(u => u.email === email)) {
            toast("Email already exists. Please login.");
            return;
        }
        let user = {
            id: "USR-" + id(),
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role,
            business_name: businessName,
            verified: false,
            trust_score: 50,
            joined: new Date().toISOString().split("T")[0]
        };
        users.push(user);
        set(STORAGE.users, users);
        toast("✅ Account created! Please verify your email.");
        setTimeout(() => navigate('login'), 3000);
    }
}

function logout() {
    localStorage.removeItem(STORAGE.session);
    localStorage.removeItem('sb_access_token');
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
    
    if (deals.length === 0 && allDeals.length > 0) {
        deals = allDeals;
    }
    
    let total = deals.reduce((s, d) => s + d.amount, 0);
    let secured = deals.filter(d => d.buyer_paid && !d.supplier_paid).reduce((s, d) => s + d.amount, 0);
    let completed = deals.filter(d => d.status === "completed").length;
    let pending = deals.filter(d => d.status === "pending").length;
    let escrow = deals.filter(d => d.status === "escrow").length;
    
    let dealsContent = deals.length === 0 ? `<div class="empty-state"><div class="icon">📦</div><h2>No transactions yet</h2><p>Start by creating your first protected deal. TrustDeal will secure your transaction until delivery is confirmed.</p><button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button></div>` : deals.map(dealRow).join("");
    
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
            <div class="page-header">
                <div><h2>Your transactions</h2><div class="muted small">${deals.length} deal${deals.length !== 1 ? "s" : ""}</div></div>
                <span class="badge badge-green">● ${deals.length > 0 ? "Active" : "Ready"}</span>
            </div>
            ${dealsContent}
        </section>

        <section class="grid grid-2 section">
            <div class="card">
                <div class="label">ACCOUNT</div>
                <h2>${user.name}</h2>
                <p class="muted">${user.email}</p>
                <p class="small">Joined: ${user.joined || "N/A"} · ${user.role}</p>
                <button class="btn btn-light" onclick="navigate('account')">View account</button>
            </div>
            <div class="card">
                <div class="label">NOTIFICATIONS</div>
                ${notificationPreview()}
            </div>
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
    return n.slice(0, 3).map(n => `<
