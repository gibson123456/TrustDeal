// ============================================================
// STORAGE KEYS - ready for Supabase migration
// ============================================================
const STORAGE = {
    users: "td_users",
    deals: "td_deals",
    notifications: "td_notifications",
    session: "td_session",
    admin: "td_admin"
};

// ============================================================
// HELPERS
// ============================================================
const get = (k) => JSON.parse(localStorage.getItem(k)) || [];
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const money = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
const toast = (msg) => { let el = document.getElementById("toast"); el.innerText = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3000); };
const id = () => Math.random().toString(36).substring(2, 9).toUpperCase();
const currentUser = () => { let email = localStorage.getItem(STORAGE.session); if (!email) return null; return get(STORAGE.users).find(u => u.email === email) || null; };
const initials = (n) => n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
const addNotification = (title, text, type = "green") => { let n = get(STORAGE.notifications); n.unshift({ title, text, type, time: "Just now" }); set(STORAGE.notifications, n.slice(0, 20)); };

// ============================================================
// SEED DATA - Create admin account and empty state
// ============================================================
function seedData() {
    let users = get(STORAGE.users);

    // Create admin account if it doesn't exist
    if (!users.some(u => u.email === "admin@trustdeal.test")) {
        users.push({
            id: "USR-ADMIN",
            name: "TrustDeal Admin",
            email: "admin@trustdeal.test",
            phone: "+234 800 000 0000",
            password: "admin123",
            role: "admin",
            verified: true,
            businessName: "TrustDeal",
            trustScore: 100,
            joined: new Date().toISOString().split("T")[0]
        });
        set(STORAGE.users, users);
    }

    // Deals start empty - only created by users
    if (!localStorage.getItem(STORAGE.deals)) {
        localStorage.setItem(STORAGE.deals, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE.notifications)) {
        localStorage.setItem(STORAGE.notifications, JSON.stringify([]));
    }
}

// ============================================================
// ROUTER
// ============================================================
const navigate = (page, param = null) => {
    let hash = "#" + page;
    if (param) hash += "=" + encodeURIComponent(param);
    history.pushState({ page, param }, "", hash);
    render(page, param);
};

const currentRoute = () => {
    let h = location.hash.slice(1) || "home";
    let [p, x] = h.split("=");
    return [p, x ? decodeURIComponent(x) : null];
};

window.onpopstate = () => {
    let [p, x] = currentRoute();
    render(p, x);
};

window.onhashchange = () => {
    let [p, x] = currentRoute();
    render(p, x);
};

// ============================================================
// NAVBARS
// ============================================================
// LANDING PAGE NAVBAR - No nav links, only logo and login button
const landingNavbar = () => {
    let user = currentUser();
    return `<nav class="navbar">
        <a href="#" onclick="navigate('home')" class="logo">Trust<span>Deal</span></a>
        <div class="nav-links" style="display:none"></div>
        <div class="nav-user">
            ${user ? `<div class="avatar" onclick="navigate('dashboard')" title="${user.name}">${initials(user.name)}</div><button class="btn btn-light" onclick="logout()">Logout</button>` : `<button class="btn btn-primary" onclick="navigate('login')">Login</button>`}
        </div>
    </nav>`;
};

// DASHBOARD NAVBAR - Full nav for logged-in users
const dashboardNavbar = () => {
    let user = currentUser();
    return `<nav class="navbar">
        <a href="#" onclick="navigate('home')" class="logo">Trust<span>Deal</span></a>
        <div class="nav-links">
            <a onclick="navigate('dashboard')">Dashboard</a>
            <a onclick="navigate('create')">New Deal</a>
            <a onclick="navigate('transactions')">Transactions</a>
            <a onclick="navigate('account')">Account</a>
        </div>
        <div class="nav-user">
            ${user ? `<div class="avatar" onclick="navigate('account')" title="${user.name}">${initials(user.name)}</div><button class="btn btn-light" onclick="logout()">Logout</button>` : `<button class="btn btn-primary" onclick="navigate('login')">Login</button>`}
        </div>
    </nav>`;
};

// ADMIN NAVBAR
const adminNav = () => `<nav class="navbar">
    <a class="logo" href="#" onclick="navigate('admin')">Trust<span>Deal</span> <span style="font-size:12px;color:var(--muted)">· Admin</span></a>
    <div class="nav-links">
        <a onclick="navigate('admin')">Overview</a>
        <a onclick="navigate('admin-users')">Users</a>
        <a onclick="navigate('admin-suppliers')">Suppliers</a>
        <a onclick="navigate('admin-transactions')">Txns</a>
        <a onclick="navigate('admin-disputes')">Disputes</a>
    </div>
    <div class="nav-user">
        <span class="badge badge-red">ADMIN</span>
        <button class="btn btn-light" onclick="adminLogout()">Logout</button>
    </div>
</nav>`;

// ============================================================
// HOME PAGE (Landing Page - No nav links, just logo)
// ============================================================
function home() {
    return `${landingNavbar()}
    <main class="container">
        <section class="hero">
            <div class="hero-content">
                <span class="badge badge-green">● LOCAL TRADE PROTECTION</span>
                <h1>Do business without the fear.</h1>
                <p>TrustDeal sits between buyers and suppliers, helping both sides manage protected transactions, delivery and payment conditions.</p>
                <div class="hero-actions">
                    <button class="btn btn-green" onclick="navigate('signup')">Create account</button>
                    <button class="btn btn-white" onclick="navigate('dashboard')">View demo</button>
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
// AUTH PAGES
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
            <p class="small">Don't have an account? <a href="#" onclick="navigate('signup')"><b>Create one</b></a></p>
        </div>
    </div>`;
}

function loginUser(e) {
    e.preventDefault();
    let email = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value;
    let users = get(STORAGE.users);
    let user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        let exists = users.find(u => u.email === email);
        if (exists) {
            toast("Wrong password. Please try again.");
        } else {
            toast("Account not found. Please sign up first.");
        }
        return;
    }

    localStorage.setItem(STORAGE.session, email);
    toast("Welcome back, " + user.name + "!");
    navigate("dashboard");
}

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
            <p class="small muted">Already have an account? <a href="#" onclick="navigate('login')">Sign in</a></p>
        </div>
    </div>`;
}

function createAccount(e) {
    e.preventDefault();
    let users = get(STORAGE.users);
    let email = document.getElementById("signup-email").value.trim();

    if (users.some(u => u.email === email)) {
        toast("Email already exists. Please login.");
        return;
    }

    let user = {
        id: "USR-" + id(),
        name: document.getElementById("signup-name").value.trim(),
        email: email,
        phone: document.getElementById("signup-phone").value.trim(),
        password: document.getElementById("signup-password").value,
        role: document.getElementById("signup-role").value,
        businessName: document.getElementById("signup-business").value.trim() || "",
        verified: false,
        trustScore: 50,
        joined: new Date().toISOString().split("T")[0]
    };

    users.push(user);
    set(STORAGE.users, users);
    localStorage.setItem(STORAGE.session, email);

    addNotification("Welcome to TrustDeal", "Start by creating your first protected transaction!", "green");
    toast("Account created successfully!");
    setTimeout(() => navigate("dashboard"), 500);
}

function logout() {
    localStorage.removeItem(STORAGE.session);
    toast("Logged out.");
    navigate("home");
}

// ============================================================
// DASHBOARD - Customer specific data (shows full nav)
// ============================================================
function dashboard() {
    let user = currentUser();
    if (!user) return login();

    let allDeals = get(STORAGE.deals);
    let deals = allDeals.filter(d =>
        d.buyer === user.name ||
        d.supplier === user.name ||
        d.buyer === user.businessName ||
        d.supplier === user.businessName
    );

    let total = deals.reduce((s, d) => s + d.amount, 0);
    let secured = deals.filter(d => d.buyerPaid && !d.supplierPaid).reduce((s, d) => s + d.amount, 0);
    let completed = deals.filter(d => d.status === "completed").length;
    let pending = deals.filter(d => d.status === "pending").length;
    let escrow = deals.filter(d => d.status === "escrow").length;

    let dealsContent = deals.length === 0 ? `
        <div class="empty-state">
            <div class="icon">📦</div>
            <h2>No transactions yet</h2>
            <p>Start by creating your first protected deal. TrustDeal will secure your transaction until delivery is confirmed.</p>
            <button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button>
        </div>
    ` : deals.map(dealRow).join("");

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header">
            <div>
                <div class="label">DASHBOARD</div>
                <h1>Welcome, ${user.name.split(" ")[0]}</h1>
                <div class="muted">${user.role === "supplier" ? "Supplier" : "Customer"} · Trust Score: ${user.trustScore || "—"}%</div>
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
    let cls = "badge-orange",
        txt = "Pending";
    if (d.status === "escrow") { cls = "badge-green";
        txt = "Escrow"; }
    if (d.status === "delivered") { cls = "badge-blue";
        txt = "Delivery"; }
    if (d.status === "completed") { cls = "badge-green";
        txt = "Completed"; }
    if (d.status === "dispute") { cls = "badge-red";
        txt = "Dispute"; }

    let user = currentUser();
    let role = (d.buyer === user.name || d.buyer === user.businessName) ? "You (Buyer)" : "You (Supplier)";

    return `<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:15px;align-items:center;padding:17px 0;border-bottom:1px solid var(--line)">
        <div><b>${d.title}</b><div class="small muted">${d.id}</div></div>
        <div>${money(d.amount)}</div>
        <div class="small"><b>${role}</b><br><span class="small muted">${d.buyer} → ${d.supplier}</span></div>
        <div><span class="badge ${cls}">${txt}</span></div>
        <button class="btn btn-light" onclick="navigate('transaction','${d.id}')">View</button>
    </div>`;
}

function notificationPreview() {
    let n = get(STORAGE.notifications);
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
                <div class="card" style="background:var(--bg);box-shadow:none"><b>How protection works</b><p class="small muted">Buyer payment is represented as secured funds in this prototype. In production, actual funds are handled by regulated payment/escrow systems.</p></div>
                <button class="btn btn-green" type="submit">Create protected deal</button>
            </form>
        </div>
    </main>`;
}

function createDeal(e) {
    e.preventDefault();
    let user = currentUser();
    if (!user) { toast("Please login first.");
        navigate("login"); return; }

    let deals = get(STORAGE.deals);
    let deal = {
        id: "TD-" + id(),
        title: document.getElementById("deal-title").value.trim(),
        buyer: user.businessName || user.name,
        supplier: document.getElementById("deal-supplier").value.trim(),
        product: document.getElementById("deal-product").value.trim(),
        quantity: document.getElementById("deal-quantity").value.trim(),
        amount: Number(document.getElementById("deal-amount").value),
        delivery: document.getElementById("deal-location").value.trim(),
        condition: document.getElementById("deal-condition").value,
        status: "pending",
        created: new Date().toISOString().split("T")[0],
        buyerPaid: false,
        supplierDelivered: false,
        supplierPaid: false,
        dispute: false
    };

    deals.unshift(deal);
    set(STORAGE.deals, deals);
    addNotification("New deal created", deal.id + " - " + deal.title + " by " + user.name, "blue");
    toast("Protected deal created!");
    setTimeout(() => navigate("transaction", deal.id), 500);
}

// ============================================================
// TRANSACTION PAGE
// ============================================================
function transactionPage(dealId) {
    let deals = get(STORAGE.deals);
    let d = deals.find(x => x.id === dealId);
    if (!d) return `${dashboardNavbar()}<main class="container"><div class="card"><h1>Transaction not found</h1><button class="btn btn-light" onclick="navigate('dashboard')">Back to Dashboard</button></div></main>`;
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
                ${d.buyerPaid ? `<span class="badge badge-green">🟢 CUSTOMER CREDITED</span>` : `<span class="badge badge-red">🔴 PAYMENT NOT RECEIVED</span>`}
            </div>
            <div class="flow-middle">
                <div class="label">TRANSACTION FLOW</div>
                <div class="flow-arrow" style="color:${d.buyerPaid ? "var(--green)" : "var(--gray-300)"}">→</div>
                <div class="escrow-box">
                    <div class="label">TRUSTDEAL</div>
                    <h3 style="margin:7px 0">${d.buyerPaid ? "ESCROW / SECURED" : "AWAITING PAYMENT"}</h3>
                    <div class="small muted">${d.buyerPaid ? "Funds remain protected." : "Buyer has not credited the deal."}</div>
                </div>
                <div class="flow-arrow" style="color:${d.supplierPaid ? "var(--green)" : "var(--red)"}">→</div>
                <div class="small">${d.supplierPaid ? "Payment released" : "Supplier awaiting release"}</div>
            </div>
            <div class="party-card supplier">
                <div class="party-icon red">🏭</div>
                <div class="label">SUPPLIER / SELLER</div>
                <h2>${d.supplier}</h2>
                <div class="money">${money(d.amount)}</div>
                ${d.supplierPaid ? `<span class="badge badge-green">🟢 PAYMENT RELEASED</span>` : `<span class="badge badge-red">🔴 PAYMENT WAITING</span>`}
            </div>
        </div>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">TRANSACTION DETAILS</div><h2>Order information</h2><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity || "—"}</p><p><b>Delivery:</b> ${d.delivery || "—"}</p><p><b>Payment rule:</b> ${d.condition || "Standard"}</p><p><b>Created:</b> ${d.created || "—"}</p></div>
            <div class="card"><div class="label">TRANSACTION PROTECTION</div><h2>Where is the money?</h2>${d.buyerPaid && !d.supplierPaid ? `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Customer has credited</b><p class="small">The transaction is funded. The supplier has not received the release yet.</p></div>` : d.supplierPaid ? `<div style="background:var(--green-light);padding:17px;border-radius:12px"><b style="color:#166534">🟢 Supplier has been paid</b><p class="small">The protected transaction has completed.</p></div>` : `<div style="background:var(--red-light);padding:17px;border-radius:12px"><b style="color:#991b1b">🔴 Waiting for customer payment</b></div>`}</div>
        </section>
        <section class="card section">
            <div class="label">PROTOTYPE CONTROLS</div>
            <h2>Simulate the transaction</h2>
            <p class="muted small">These buttons simulate the states. In production events come from verified payment and delivery systems.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                ${!d.buyerPaid ? `<button class="btn btn-green" onclick="buyerCredit('${d.id}')">🟢 Simulate Customer Credit</button>` : ""}
                ${d.buyerPaid && !d.supplierDelivered ? `<button class="btn btn-primary" onclick="supplierDeliver('${d.id}')">📦 Simulate Supplier Delivery</button>` : ""}
                ${d.supplierDelivered && !d.supplierPaid ? `<button class="btn btn-green" onclick="releasePayment('${d.id}')">💰 Release Supplier Payment</button>` : ""}
                ${!d.supplierPaid && !d.dispute ? `<button class="btn btn-red" onclick="openDispute('${d.id}')">⚠ Open Dispute</button>` : ""}
            </div>
        </section>
    </main>`;
}

function updateDeal(id, fn) { let ds = get(STORAGE.deals); let d = ds.find(x => x.id === id); if (!d) return; fn(d); set(STORAGE.deals, ds); navigate("transaction", id); }

function buyerCredit(id) { updateDeal(id, d => { d.buyerPaid = true;
        d.status = "escrow";
        addNotification("Customer credited", d.id + " is now secured.", "green"); });
    toast("Customer credited. Funds secured."); }

function supplierDeliver(id) { updateDeal(id, d => { if (!d.buyerPaid) { toast("Customer must credit first."); return; }
        d.supplierDelivered = true;
        d.status = "delivered";
        addNotification("Delivery marked", d.id + " delivered.", "blue"); });
    toast("Supplier delivery recorded."); }

function releasePayment(id) { updateDeal(id, d => { if (!d.supplierDelivered) { toast("Delivery must be confirmed."); return; }
        d.supplierPaid = true;
        d.status = "completed";
        addNotification("Payment released", money(d.amount) + " released to supplier.", "green"); });
    toast("Payment released. Deal completed."); }

function openDispute(id) { updateDeal(id, d => { d.dispute = true;
        d.status = "dispute";
        addNotification("Dispute opened", d.id + " paused for review.", "red"); });
    toast("Dispute opened."); }

// ============================================================
// TRANSACTIONS LIST
// ============================================================
function transactionsPage() {
    let user = currentUser();
    if (!user) return login();
    let allDeals = get(STORAGE.deals);
    let deals = allDeals.filter(d => d.buyer === user.name || d.supplier === user.name || d.buyer === user.businessName || d.supplier === user.businessName);

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header">
            <div>
                <div class="label">TRANSACTIONS</div>
                <h1>Your deals</h1>
                <p class="muted">${deals.length} transaction${deals.length !== 1 ? "s" : ""} found</p>
            </div>
            <button class="btn btn-green" onclick="navigate('create')">+ New Deal</button>
        </div>
        <div class="card">
            ${deals.length === 0 ? `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <h2>No transactions</h2>
                    <p>You haven't created any deals yet. Start your first protected transaction now.</p>
                    <button class="btn btn-green" onclick="navigate('create')" style="margin-top:16px">+ Create Your First Deal</button>
                </div>
            ` : `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Deal</th>
                            <th>Buyer</th>
                            <th>Supplier</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${deals.map(d => `<tr>
                            <td><b>${d.title}</b><div class="small muted">${d.id}</div></td>
                            <td>${d.buyer}</td>
                            <td>${d.supplier}</td>
                            <td>${money(d.amount)}</td>
                            <td>${d.status === "escrow" ? '<span class="badge badge-green">🟢 Escrow</span>' : d.status === "completed" ? '<span class="badge badge-green">🟢 Completed</span>' : d.status === "dispute" ? '<span class="badge badge-red">🔴 Dispute</span>' : '<span class="badge badge-orange">🟠 Pending</span>'}</td>
                            <td><button class="btn btn-light" onclick="navigate(\'transaction\',\'${d.id}\')">Open</button></td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>`}
        </div>
    </main>`;
}

// ============================================================
// ACCOUNT PAGE
// ============================================================
function accountPage() {
    let user = currentUser();
    if (!user) return login();
    let deals = get(STORAGE.deals).filter(d => d.buyer === user.name || d.supplier === user.name || d.buyer === user.businessName || d.supplier === user.businessName);

    return `${dashboardNavbar()}
    <main class="container">
        <div class="page-header"><div><div class="label">ACCOUNT</div><h1>Your account</h1></div></div>
        <section class="grid grid-2">
            <div class="card">
                <div style="display:flex;align-items:center;gap:15px"><div class="avatar">${initials(user.name)}</div><div><h2 style="margin:0">${user.name}</h2><div class="muted">${user.email}</div></div></div>
                <hr style="border:none;border-top:1px solid var(--line);margin:22px 0">
                <p><b>Phone</b><br>${user.phone || "—"}</p>
                <p><b>Account type</b><br>${user.role}</p>
                <p><b>Business</b><br>${user.businessName || "Not added"}</p>
                <p><b>Joined</b><br>${user.joined || "—"}</p>
                <span class="badge ${user.verified ? "badge-green" : "badge-orange"}">${user.verified ? "✓ Verified" : "Verification pending"}</span>
            </div>
            <div class="card">
                <div class="label">BUSINESS TRUST</div>
                <h2>Trust profile</h2>
                <div style="font-size:45px;font-weight:900;color:var(--green)">${user.trustScore || 50}%</div>
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
// ADMIN SECTION - FULLY FUNCTIONAL
// ============================================================
function adminLogin() {
    return `${landingNavbar()}
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo">Trust<span>Deal</span> <span style="font-size:14px;color:var(--muted)">· Admin</span></div>
            <div class="label">PRIVATE ADMIN PORTAL</div>
            <h1>Management Login</h1>
            <p class="muted">Restricted to TrustDeal administrators.</p>
            <form class="form" onsubmit="performAdminLogin(event)">
                <label>Admin email<input id="admin-email" class="input" type="email" value="admin@trustdeal.test" required></label>
                <label>Password<input id="admin-password" class="input" type="password" value="admin123" required></label>
                <button class="btn btn-primary">Enter Admin Portal</button>
            </form>
            <div class="card" style="margin-top:18px;box-shadow:none"><div class="small muted">Admin: <b>admin@trustdeal.test</b> / <b>admin123</b></div></div>
        </div>
    </div>`;
}

function performAdminLogin(e) {
    e.preventDefault();
    let email = document.getElementById("admin-email").value;
    let password = document.getElementById("admin-password").value;

    let users = get(STORAGE.users);
    let admin = users.find(u => u.email === email && u.password === password && u.role === "admin");

    if (admin) {
        localStorage.setItem(STORAGE.admin, "true");
        toast("Admin access granted.");
        navigate("admin");
    } else {
        let exists = users.find(u => u.email === email && u.role === "admin");
        if (exists) {
            toast("Wrong password for admin account.");
        } else {
            toast("Admin account not found. Please use admin@trustdeal.test / admin123");
        }
    }
}

function adminGuard() {
    if (localStorage.getItem(STORAGE.admin) !== "true") {
        navigate("admin-login");
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem(STORAGE.admin);
    toast("Admin logged out.");
    navigate("admin-login");
}

function adminDealStatus(d) {
    if (d.dispute) return '<span class="badge badge-red">🔴 DISPUTE</span>';
    if (d.supplierPaid) return '<span class="badge badge-green">🟢 COMPLETED</span>';
    if (d.supplierDelivered) return '<span class="badge badge-blue">🔵 DELIVERY</span>';
    if (d.buyerPaid) return '<span class="badge badge-green">🟢 ESCROW</span>';
    return '<span class="badge badge-orange">🟠 AWAITING FUNDING</span>';
}

function adminTransactionTable(ds) {
    if (!ds.length) return '<div class="empty-state"><div class="icon">📊</div><h2>No transactions</h2><p>No deals have been created on the platform yet.</p></div>';
    return `<div class="table-wrapper"><table>
        <thead><tr><th>Transaction</th><th>Customer</th><th>Supplier</th><th>Value</th><th>Position</th><th></th></tr></thead>
        <tbody>${ds.map(d => `<tr>
            <td><b>${d.id}</b><div class="small muted">${d.title}</div></td>
            <td>${d.buyer}</td>
            <td>${d.supplier}</td>
            <td>${money(d.amount)}</td>
            <td>${adminDealStatus(d)}</td>
            <td><button class="btn btn-light" onclick="navigate('admin-transaction','${d.id}')">Monitor</button></td>
        </tr>`).join("")}</tbody>
    </table></div>`;
}

function adminDashboard() {
    if (!adminGuard()) return "";
    let us = get(STORAGE.users);
    let ds = get(STORAGE.deals);
    let total = ds.reduce((s, d) => s + d.amount, 0);
    let esc = ds.filter(d => d.buyerPaid && !d.supplierPaid && !d.dispute).reduce((s, d) => s + d.amount, 0);
    let done = ds.filter(d => d.status === "completed").reduce((s, d) => s + d.amount, 0);
    let dis = ds.filter(d => d.dispute).length;
    let sup = us.filter(u => u.role === "supplier").length;
    let customers = us.filter(u => u.role === "customer" || u.role === "business").length;

    return `${adminNav()}
    <main class="container">
        <div class="page-header">
            <div><div class="label">TRUSTDEAL MANAGEMENT</div><h1>Admin Overview</h1><p class="muted">Monitor the entire TrustDeal marketplace.</p></div>
            <span class="badge badge-green">● PLATFORM OPERATIONAL</span>
        </div>
        <section class="grid grid-4">
            <div class="card"><div class="label">TOTAL USERS</div><div class="stat-number">${us.length}</div><div class="small muted">${customers} customers · ${sup} suppliers</div></div>
            <div class="card"><div class="label">TOTAL VALUE</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(total)}</div></div>
            <div class="card"><div class="label">CURRENT ESCROW</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(esc)}</div></div>
            <div class="card"><div class="label">COMPLETED VALUE</div><div class="stat-number">${ds.length === 0 ? "₦0" : money(done)}</div></div>
        </section>
        <section class="grid grid-4 section">
            <div class="card"><div class="label">TOTAL DEALS</div><div class="stat-number">${ds.length}</div></div>
            <div class="card"><div class="label">ACTIVE PIPELINE</div><div class="stat-number">${ds.filter(d => !d.supplierPaid && !d.dispute).length}</div></div>
            <div class="card"><div class="label">WAITING FUNDING</div><div class="stat-number">${ds.filter(d => !d.buyerPaid && !d.dispute).length}</div></div>
            <div class="card"><div class="label">DISPUTES</div><div class="stat-number" style="color:${dis ? "var(--red)" : "var(--green)"}">${dis}</div></div>
        </section>
        <section class="card section">
            <div class="page-header"><div><div class="label">LIVE MONITOR</div><h2>Current transactions</h2><p class="muted">${ds.length} total deal${ds.length !== 1 ? "s" : ""}</p></div><button class="btn btn-light" onclick="navigate('admin-transactions')">View all</button></div>
            ${adminTransactionTable(ds.slice(0, 10))}
        </section>
    </main>`;
}

function adminUsers() {
    if (!adminGuard()) return "";
    let us = get(STORAGE.users);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">USER MANAGEMENT</div><h1>All users</h1><p class="muted">${us.length} registered users</p></div></div>
        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>User</th><th>Email</th><th>Type</th><th>Trust Score</th><th>Verification</th><th>Joined</th></tr></thead>
                    <tbody>${us.map(u => `<tr>
                        <td><b>${u.name}</b><div class="small muted">${u.businessName || ""}</div></td>
                        <td>${u.email}</td>
                        <td><span class="badge badge-blue">${u.role}</span></td>
                        <td>${u.trustScore || 50}%</td>
                        <td>${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-orange">Pending</span>'}</td>
                        <td class="small muted">${u.joined || "—"}</td>
                    </tr>`).join("")}</tbody>
                </table>
            </div>
        </div>
    </main>`;
}

function adminSuppliers() {
    if (!adminGuard()) return "";
    let us = get(STORAGE.users).filter(u => u.role === "supplier");
    let ds = get(STORAGE.deals);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">SUPPLIER MANAGEMENT</div><h1>Suppliers</h1><p class="muted">${us.length} registered suppliers</p></div></div>
        ${us.length === 0 ? `
            <div class="card">
                <div class="empty-state"><div class="icon">🏭</div><h2>No suppliers yet</h2><p>Suppliers will appear here when they register on the platform.</p></div>
            </div>
        ` : `
        <div class="grid grid-2">
            ${us.map(u => {
                let name = u.businessName || u.name;
                let x = ds.filter(d => d.supplier === name);
                let v = x.reduce((s, d) => s + d.amount, 0);
                return `<div class="card">
                    <div class="page-header">
                        <div><div class="label">SUPPLIER</div><h2>${name}</h2><div class="muted">${u.email}</div></div>
                        ${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-orange">Pending</span>'}
                    </div>
                    <div class="grid grid-3">
                        <div><div class="label">DEALS</div><b>${x.length}</b></div>
                        <div><div class="label">VALUE</div><b>${x.length === 0 ? "₦0" : money(v)}</b></div>
                        <div><div class="label">COMPLETED</div><b>${x.filter(d => d.status === "completed").length}</b></div>
                    </div>
                </div>`;
            }).join("")}
        </div>`}
    </main>`;
}

function adminTransactions() {
    if (!adminGuard()) return "";
    let ds = get(STORAGE.deals);
    return `${adminNav()}
    <main class="container">
        <div class="page-header"><div><div class="label">TRANSACTION MANAGEMENT</div><h1>All transactions</h1><p class="muted">${ds.length} total deals</p></div></div>
        <div class="card">${adminTransactionTable(ds)}</div>
    </main>`;
}

function adminTransaction(id) {
    if (!adminGuard()) return "";
    let d = get(STORAGE.deals).find(x => x.id === id);
    if (!d) return `${adminNav()}<main class="container"><div class="card"><h1>Transaction not found</h1><button class="btn btn-light" onclick="navigate('admin')">Back</button></div></main>`;

    return `${adminNav()}
    <main class="container">
        <div class="page-header">
            <div><div class="label">ADMIN MONITOR</div><h1>${d.id}</h1><p class="muted">${d.title}</p></div>
            ${adminDealStatus(d)}
        </div>
        <section class="card">
            <div class="transaction-flow">
                <div class="party-card buyer">
                    <div class="party-icon green">👤</div>
                    <div class="label">CUSTOMER</div>
                    <h2>${d.buyer}</h2>
                    <div class="money">${money(d.amount)}</div>
                    <span class="badge ${d.buyerPaid ? "badge-green" : "badge-red"}">${d.buyerPaid ? "🟢 CREDITED" : "🔴 NOT FUNDED"}</span>
                </div>
                <div class="flow-middle">
                    <div class="flow-arrow">→</div>
                    <div class="escrow-box">
                        <div class="label">TRUSTDEAL</div>
                        <h3>${d.buyerPaid ? "ESCROW" : "AWAITING FUNDS"}</h3>
                        <div class="small">${d.buyerPaid ? money(d.amount) : "₦0"}</div>
                    </div>
                    <div class="flow-arrow">→</div>
                </div>
                <div class="party-card supplier">
                    <div class="party-icon red">🏭</div>
                    <div class="label">SUPPLIER</div>
                    <h2>${d.supplier}</h2>
                    <div class="money">${money(d.amount)}</div>
                    <span class="badge ${d.supplierPaid ? "badge-green" : "badge-red"}">${d.supplierPaid ? "🟢 PAID" : "🔴 PAYMENT LOCKED"}</span>
                </div>
            </div>
        </section>
        <section class="grid grid-2 section">
            <div class="card"><div class="label">DETAILS</div><p><b>Product:</b> ${d.product}</p><p><b>Quantity:</b> ${d.quantity}</p><p><b>Delivery:</b> ${d.delivery}</p><p><b>Condition:</b> ${d.condition}</p></div>
            <div class="card"><div class="label">TIMELINE</div><div style="display:grid;gap:8px;margin-top:8px"><div>${d.buyerPaid ? "✅ Customer funded" : "⏳ Awaiting funding"}</div><div>${d.supplierDelivered ? "✅ Delivery confirmed" : "⏳ Awaiting delivery"}</div><div>${d.supplierPaid ? "✅ Payment released" : "⏳ Payment locked"}</div></div></div>
        </section>
        ${d.dispute ? `<section class="card section" style="border:2px solid var(--red);background:var(--red-light)">
            <div class="label">ACTION REQUIRED</div>
            <h2>🔴 Dispute is open</h2>
            <p>This transaction is paused for administrator review.</p>
            <button class="btn btn-red" onclick="resolveDispute('${d.id}')">Resolve dispute</button>
        </section>` : ""}
    </main>`;
}

function adminDisputes() {
    if (!adminGuard()) return "";
    let ds = get(STORAGE.deals).filter(d => d.dispute);
    return `${adminNav()}
    <main class="container">
        <div class="page-header">
            <div><div class="label">RISK MANAGEMENT</div><h1>Disputes</h1><p class="muted">Transactions requiring intervention</p></div>
            <span class="badge ${ds.length ? "badge-red" : "badge-green"}">${ds.length} Open</span>
        </div>
        <div class="card">
            ${ds.length ? ds.map(d => `<div class="notification" style="justify-content:space-between;align-items:center">
                <div><span class="badge badge-red">🔴 DISPUTE</span><div style="margin-top:8px"><b>${d.id}</b> — ${d.title}</div><div class="small muted">${d.buyer} → ${d.supplier} · ${money(d.amount)}</div></div>
                <button class="btn btn-red" onclick="navigate('admin-transaction','${d.id}')">Review</button>
            </div>`).join("") : `<div class="empty-state"><div class="icon">✅</div><h2>No open disputes</h2><p>All transactions are running smoothly.</p></div>`}
        </div>
    </main>`;
}

function resolveDispute(id) {
    let ds = get(STORAGE.deals);
    let d = ds.find(x => x.id === id);
    if (!d) return;
    d.dispute = false;
    d.status = d.buyerPaid ? "escrow" : "pending";
    set(STORAGE.deals, ds);
    addNotification("Dispute resolved", id + " has been reviewed and resolved.", "green");
    toast("Dispute resolved successfully.");
    navigate("admin-transaction", id);
}

// ============================================================
// RENDER ENGINE
// ============================================================
function render(page, param) {
    seedData();
    let app = document.getElementById("app");
    switch (page) {
        case "home":
            app.innerHTML = home();
            break;
        case "login":
            app.innerHTML = login();
            break;
        case "signup":
            app.innerHTML = signup();
            break;
        case "dashboard":
            app.innerHTML = dashboard();
            break;
        case "create":
            app.innerHTML = createDealPage();
            break;
        case "transaction":
            app.innerHTML = transactionPage(param);
            break;
        case "transactions":
            app.innerHTML = transactionsPage();
            break;
        case "account":
            app.innerHTML = accountPage();
            break;
        case "admin-login":
            app.innerHTML = adminLogin();
            break;
        case "admin":
            app.innerHTML = adminDashboard();
            break;
        case "admin-users":
            app.innerHTML = adminUsers();
            break;
        case "admin-suppliers":
            app.innerHTML = adminSuppliers();
            break;
        case "admin-transactions":
            app.innerHTML = adminTransactions();
            break;
        case "admin-transaction":
            app.innerHTML = adminTransaction(param);
            break;
        case "admin-disputes":
            app.innerHTML = adminDisputes();
            break;
        default:
            app.innerHTML = home();
    }
}

// ============================================================
// START
// ============================================================
seedData();
let [initialPage, initialParam] = currentRoute();
render(initialPage, initialParam);

console.log("🔒 TrustDeal ready for Supabase integration");
console.log("👤 Admin: admin@trustdeal.test / admin123");
console.log("📊 New users start with empty dashboard");
console.log("📍 Landing page → NO nav links, only logo + login");
console.log("📋 Dashboard → shows customer-specific data with full nav");
console.log("✅ All navigation links work properly");
console.log("⬅️ Browser back button works correctly");