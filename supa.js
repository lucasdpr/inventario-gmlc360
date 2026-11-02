// Conexão com o Supabase do Inventário GMLC 360°. A chave abaixo é a pública (anon): ela só abre as funções
// liberadas no banco; ler/gravar tabelas e mexer nas fotos exige login de administrador.
window.SB = (() => {
  const URL = 'https://wiujtvcmikrwnsxkpztv.supabase.co';
  const KEY = 'sb_publishable_6uAKSWzfNolqRGxiXpBcEQ_RN8H3PR2';
  const H = tok => ({ apikey: KEY, Authorization: `Bearer ${tok || KEY}` });
  async function lerErro(r) {
    const d = await r.json().catch(() => ({}));
    return new Error(d.message || d.error_description || d.msg || d.error || `Erro ${r.status}`);
  }
  async function rpc(nome, args, tok) {
    const r = await fetch(`${URL}/rest/v1/rpc/${nome}`, { method: 'POST', cache: 'no-store', headers: { ...H(tok), 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
    if (!r.ok) throw await lerErro(r);
    return r.json();
  }
  async function tabela(metodo, caminho, corpo, tok, extra) {
    const r = await fetch(`${URL}/rest/v1/${caminho}`, { method: metodo, cache: 'no-store', headers: { ...H(tok), 'Content-Type': 'application/json', ...(extra || {}) }, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
    if (!r.ok) throw await lerErro(r);
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  async function enviarFoto(caminho, blob, tok) {
    const r = await fetch(`${URL}/storage/v1/object/inv-fotos/${caminho}`, { method: 'POST', headers: { ...H(tok), 'Content-Type': blob.type || 'image/jpeg', 'x-upsert': 'false' }, body: blob });
    if (!r.ok) throw await lerErro(r);
  }
  const fotoUrl = (caminho, rev) => `${URL}/storage/v1/object/public/inv-fotos/${caminho}?r=${rev || 0}`;
  async function entrar(email, senha) {
    const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: senha }) });
    if (!r.ok) { const e = await lerErro(r); throw new Error(/invalid login/i.test(e.message) ? 'E-mail ou senha incorretos.' : e.message); }
    return r.json();
  }
  async function renovar(refresh) {
    const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh }) });
    if (!r.ok) throw await lerErro(r);
    return r.json();
  }
  return { URL, KEY, rpc, tabela, enviarFoto, fotoUrl, entrar, renovar };
})();
