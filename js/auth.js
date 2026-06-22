// =============================================
// FUTTODESK — Auth v1.0
// =============================================

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  const btnText = document.getElementById('btn-login-text');
  const btnLoading = document.getElementById('btn-login-loading');
  const btn = document.getElementById('btn-login');

  // Limpa erro anterior
  errorEl.style.display = 'none';

  // Validação básica
  if (!email || !password) {
    errorEl.textContent = 'Preencha e-mail e senha.';
    errorEl.style.display = 'block';
    return;
  }

  // Loading
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) throw error;

    // Busca o perfil para saber o tipo (agent ou contact)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('type, active')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) throw new Error('Perfil não encontrado.');
    if (!profile.active) throw new Error('Usuário inativo. Entre em contato com a Futto.');

    // Redireciona conforme o tipo
    if (profile.type === 'agent') {
      window.location.href = 'pages/futto/dashboard.html';
    } else {
      window.location.href = 'pages/client/dashboard.html';
    }

  } catch (err) {
    errorEl.textContent = err.message === 'Invalid login credentials'
      ? 'E-mail ou senha incorretos.'
      : err.message;
    errorEl.style.display = 'block';

    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// Enter para logar
document.getElementById('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});

document.getElementById('btn-login').addEventListener('click', login);

// Se já estiver logado, redireciona direto
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('type')
    .eq('id', session.user.id)
    .single();

  if (profile?.type === 'agent') {
    window.location.href = 'pages/futto/dashboard.html';
  } else if (profile?.type === 'contact') {
    window.location.href = 'pages/client/dashboard.html';
  }
})();