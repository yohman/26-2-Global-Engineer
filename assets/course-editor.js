(() => {
  const api = 'https://global-engineer-atlas.ykawano.workers.dev';
  const label = (en, ja) => document.documentElement.lang === 'ja' ? ja : en;
  let session = null, content = {}, current = null, original = '', translated = '';
  async function request(path, options = {}) {
    const response = await fetch(api + path, { ...options, headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}) } });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data;
  }
  const ready = request('/content').then(data => { content = data.content; }).catch(() => {});
  const dialog = document.createElement('dialog'); dialog.className = 'course-editor-dialog';
  dialog.innerHTML = `<form><header><h2></h2><button type="button" data-close aria-label="Close">×</button></header><div data-login><label>Email / メール<input type="email" name="email" value="ykawano@reitaku-u.ac.jp" required autocomplete="username"></label><label>Admin password / 管理者パスワード<input type="password" name="password" autocomplete="current-password"></label></div><div data-edit hidden><p>Markdown: - bullets · **bold** · [link](https://…)</p><label>English<textarea name="en" rows="9" maxlength="12000"></textarea></label><label>日本語<textarea name="ja" rows="9" maxlength="12000"></textarea></label><button type="button" data-translate>English → 日本語</button><p>English changes are translated before saving. Review Japanese before publishing.</p></div><p role="status" aria-live="polite"></p><footer><button type="button" data-close>Cancel / キャンセル</button><button type="submit" data-save>Sign in / ログイン</button></footer></form>`;
  document.body.append(dialog);
  const automatic = document.createElement('label'); automatic.innerHTML = '<input type="checkbox" name="automatic" checked> Auto-translate English / 英語を自動翻訳';
  dialog.querySelector('[data-edit]').append(automatic);
  const form = dialog.querySelector('form'), status = dialog.querySelector('[role="status"]');
  const busy = value => dialog.querySelectorAll('button').forEach(button => button.disabled = value);
  dialog.querySelectorAll('[data-close]').forEach(button => button.onclick = () => dialog.close());
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'course-admin-toggle';
  const update = () => { document.body.classList.toggle('course-editing', Boolean(session)); toggle.textContent = session ? label('Finish editing', '編集を終了') : label('Instructor edit', '教員用編集'); };
  (document.querySelector('#main') || document.querySelector('#story') || document.body).prepend(toggle); update();
  toggle.onclick = () => {
    if (session) { request('/session', { method: 'DELETE' }).catch(() => {}); session = null; update(); return; }
    current = null; status.textContent = ''; dialog.querySelector('h2').textContent = label('Instructor sign in', '教員ログイン');
    dialog.querySelector('[data-login]').hidden = false; dialog.querySelector('[data-edit]').hidden = true;
    dialog.querySelector('[data-save]').textContent = label('Sign in', 'ログイン'); dialog.showModal();
  };
  async function translate() {
    if (!form.elements.en.value.trim()) throw new Error('Enter English text first.');
    status.textContent = label('Translating…', '翻訳中…'); const input = form.elements.en.value;
    const data = await request('/content/translate', { method: 'POST', body: JSON.stringify({ en: input }) });
    form.elements.ja.value = data.ja; translated = input; status.textContent = label('Review Japanese, then Save.', '日本語を確認してから保存してください。');
  }
  dialog.querySelector('[data-translate]').onclick = async () => { busy(true); try { await translate(); } catch (error) { status.textContent = error.message; } finally { busy(false); } };
  form.onsubmit = async event => {
    event.preventDefault(); busy(true); status.textContent = '';
    try {
      if (!current) {
        const signed = await request('/session', { method: 'POST', body: JSON.stringify({ email: form.elements.email.value, password: form.elements.password.value }) });
        form.elements.password.value = ''; if (!signed.admin) throw new Error('Use your instructor email and admin password, not the class password.');
        session = signed; update(); dialog.close();
      } else {
        if (form.elements.automatic.checked && form.elements.en.value !== original && form.elements.en.value !== translated) { await translate(); return; }
        if (!form.elements.en.value.trim() || !form.elements.ja.value.trim()) throw new Error('English and Japanese are required.');
        const result = await request('/content', { method: 'PUT', body: JSON.stringify({ id: current.id, revision: current.revision, en: form.elements.en.value, ja: form.elements.ja.value }) });
        content[current.id] = { en: form.elements.en.value, ja: form.elements.ja.value, revision: result.revision };
        dialog.close(); window.dispatchEvent(new Event('course-content-change'));
      }
    } catch (error) { status.textContent = error.message; } finally { busy(false); }
  };
  window.COURSE_EDITOR = { ready, get: id => content[id], attach(block, section) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'course-section-edit'; button.textContent = label('✎ Edit', '✎ 編集');
    button.onclick = () => {
      if (!session) return; current = { id: section.editId, revision: content[section.editId]?.revision || 0 };
      const stored = content[section.editId]; original = stored?.en || section.originalContent; translated = original;
      form.elements.en.value = original;
      form.elements.automatic.checked = true;
      form.elements.ja.value = stored?.ja || section.originalJa || original.split('\n').map(line => { const bullet = line.startsWith('- ') ? '- ' : ''; return bullet + (window.COURSE_TRANSLATIONS?.ja?.[line.slice(bullet.length)] || line.slice(bullet.length)); }).join('\n');
      status.textContent = ''; dialog.querySelector('h2').textContent = label('Edit: ', '編集：') + section.title;
      dialog.querySelector('[data-login]').hidden = true; dialog.querySelector('[data-edit]').hidden = false;
      dialog.querySelector('[data-save]').textContent = label('Save & publish', '保存して公開'); dialog.showModal();
    }; block.prepend(button);
  } };
})();
