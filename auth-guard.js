/*
  Auth guard for protected apps.
  Add this file to each app folder and include this before </body>:
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="auth-guard.js"></script>

  IMPORTANT: for a single login shared between apps, host the hub and apps under the SAME origin,
  for example:
  /index.html
  /cnc/index.html
  /hot-stamping/index.html
*/
const AUTH_SUPABASE_URL = "https://erzuvpswagzwlrxgctaj.supabase.co";
const AUTH_SUPABASE_KEY = "sb_publishable_EnZYq5RqBLVh3R4nOsGW0A_NuEFm86V";
const AUTH_HUB_URL = "/";
const authClient = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY);

function authGuardStyle() {
  if (document.getElementById('authGuardStyle')) return;
  const s = document.createElement('style');
  s.id = 'authGuardStyle';
  s.textContent = `
    .auth-lock{position:fixed;z-index:99999;inset:0;background:#d8d8d3;display:flex;align-items:center;justify-content:center;padding:18px;color:#1d1d1b;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
    .auth-panel{width:min(420px,100%);background:#eeeeea;border:1px solid #8d8d86;border-radius:18px;padding:22px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
    .auth-panel h1{font-size:22px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
    .auth-panel p{color:#5f5f58;font-size:14px;margin:0 0 14px}
    .auth-panel input{width:100%;padding:14px 15px;border-radius:12px;border:1px solid #8d8d86;margin:8px 0;font-size:16px;background:#fff;color:#1d1d1b}
    .auth-panel button{width:100%;padding:14px;border:none;border-radius:12px;background:#1d1d1b;color:#fff;font-weight:800;margin-top:10px;font-size:15px}
    .auth-panel .secondary{background:#f6f6f2;color:#1d1d1b;border:1px solid #8d8d86}
    .auth-error{color:#b42318;font-size:13px;margin-top:10px;white-space:pre-wrap}
  `;
  document.head.appendChild(s);
}

async function requireAuth() {
  const { data } = await authClient.auth.getSession();
  if (data.session) return data.session;
  authGuardStyle();
  const lock = document.createElement('div');
  lock.className = 'auth-lock';
  lock.innerHTML = `
    <div class="auth-panel">
      <h1>Connexion</h1>
      <p>Connectez-vous pour accéder à l'application.</p>
      <input id="guardEmail" type="email" placeholder="Adresse email" autocomplete="email">
      <input id="guardPassword" type="password" placeholder="Mot de passe" autocomplete="current-password">
      <button id="guardLogin">Se connecter</button>
      <button id="guardSignup" class="secondary">Créer un compte</button>
      <button id="guardReset" class="secondary">Mot de passe oublié</button>
      <button id="guardHub" class="secondary">Retour au portail</button>
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
    if (error) { msg.textContent = error.message; return; }
    msg.textContent = 'Compte créé. Si la confirmation email est activée, vérifiez votre boîte mail.';
  };
  document.getElementById('guardReset').onclick = async () => {
    msg.textContent = '';
    if (!email.value.trim()) { msg.textContent = 'Saisissez d’abord votre email.'; return; }
    const { error } = await authClient.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + location.pathname });
    msg.textContent = error ? error.message : 'Email de réinitialisation envoyé si le compte existe.';
  };
  document.getElementById('guardHub').onclick = () => { location.href = AUTH_HUB_URL; };
}

requireAuth();
