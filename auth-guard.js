console.log("AUTH GUARD HUB FIX");
const AUTH_SUPABASE_URL = "https://erzuvpswagzwlrxgctaj.supabase.co";
const AUTH_SUPABASE_KEY = "sb_publishable_EERLI2l3AjQWkCLsMK3kbA_DMny2RFr";
const authClient = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY);

function domReady() {
  if (document.readyState === 'loading') {
    return new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  }
  return Promise.resolve();
}

async function authToken() {
  const session = (await authClient.auth.getSession()).data.session;
  return session?.access_token || AUTH_SUPABASE_KEY;
}

function injectAuthStyle() {
  if (document.getElementById('authGuardStyle')) return;
  const s = document.createElement('style');
  s.id = 'authGuardStyle';
  s.textContent = `
    .auth-lock { position: fixed; z-index: 99999; inset: 0; background: #d8d8d3; display: flex; align-items: center; justify-content: center; padding: 18px; color: #1d1d1b; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; }
    .auth-panel { width: min(430px,100%); background: #eeeeea; border: 1px solid #8d8d86; border-radius: 18px; padding: 22px; box-shadow: 0 12px 30px rgba(0,0,0,.18); }
    .auth-panel h1 { font-size: 22px; margin: 0 0 8px; }
    .auth-panel p { color: #5f5f58; font-size: 14px; margin: 0 0 14px; }
    .auth-panel input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #8d8d86; margin: 8px 0; font-size: 16px; background: #fff; color: #1d1d1b; }
    .auth-panel button { width: 100%; padding: 14px; border: none; border-radius: 12px; background: #1d1d1b; color: #fff; font-weight: 800; margin-top: 10px; font-size: 15px; cursor: pointer; }
    .auth-panel .secondary { background: #f6f6f2; color: #1d1d1b; border: 1px solid #8d8d86; }
    .auth-error { color: #b42318; font-size: 13px; margin-top: 10px; white-space: pre-wrap; }
  `;
  (document.head || document.documentElement).appendChild(s);
}

async function getUserRole(user) {
  if (!user) return 'user';
  let role = 'user';
  try {
    const r = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/user_roles?select=*&user_id=eq.${user.id}`, {
      headers: { apikey: AUTH_SUPABASE_KEY, Authorization: 'Bearer ' + await authToken() }
    });
    const rows = await r.json();
    if (rows && rows[0]) {
      role = rows[0].role || 'user';
    } else {
      await fetch(`${AUTH_SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: { apikey: AUTH_SUPABASE_KEY, Authorization: 'Bearer ' + await authToken(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ user_id: user.id, email: user.email, role: 'user' })
      });
    }
  } catch(e) {
    console.warn('Role unavailable', e);
  }
  return role;
}

async function showAuthModal() {
  await domReady();
  injectAuthStyle();
  let old = document.getElementById('authLock');
  if (old) old.remove();
  const lock = document.createElement('div');
  lock.id = 'authLock';
  lock.className = 'auth-lock';
  lock.innerHTML = `<div class="auth-panel">
    <h1>Connexion</h1>
    <p>Créez un compte avec n’importe quel email + mot de passe, ou connectez-vous.</p>
    <input id="guardEmail" type="email" placeholder="Email">
    <input id="guardPassword" type="password" placeholder="Mot de passe">
    <button id="guardLogin">Se connecter</button>
    <button id="guardSignup" class="secondary">Créer un compte</button>
    <button id="guardReset" class="secondary">Mot de passe oublié</button>
    <button id="guardClose" class="secondary">Fermer</button>
    <div id="guardMsg" class="auth-error"></div>
  </div>`;
  document.body.appendChild(lock);
  const msg = document.getElementById('guardMsg');
  const email = document.getElementById('guardEmail');
  const password = document.getElementById('guardPassword');
  document.getElementById('guardLogin').onclick = async () => {
    msg.textContent = '';
    const { error } = await authClient.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
    if (error) { msg.textContent = error.message; return; }
    location.reload();
  };
  document.getElementById('guardSignup').onclick = async () => {
    msg.textContent = '';
    const { error } = await authClient.auth.signUp({ email: email.value.trim(), password: password.value });
    msg.textContent = error ? error.message : 'Compte créé. Si Supabase demande une confirmation email, confirmez puis reconnectez-vous.';
  };
  document.getElementById('guardReset').onclick = async () => {
    msg.textContent = '';
    if (!email.value.trim()) { msg.textContent = 'Saisissez d’abord votre email.'; return; }
    const { error } = await authClient.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin });
    msg.textContent = error ? error.message : 'Email de réinitialisation envoyé si le compte existe.';
  };
  document.getElementById('guardClose').onclick = () => lock.remove();
}

async function requireAuth() {
  await domReady();
  const session = (await authClient.auth.getSession()).data.session;
  if (session) {
    window.currentUser = session.user;
    window.currentRole = await getUserRole(session.user);
    return session;
  }
  window.currentUser = null;
  window.currentRole = null;
  return null;
}

window.authReady = requireAuth();
window.appAuth = {
  getUser: async () => window.currentUser,
  getRole: async () => window.currentRole || 'user',
  showLogin: showAuthModal,
  signOut: async () => { await authClient.auth.signOut(); location.reload(); }
};
