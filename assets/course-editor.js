(() => {
  const api = 'https://global-engineer-atlas.ykawano.workers.dev';
  const label = (en, ja) => document.documentElement.lang === 'ja' ? ja : en;
  let session = null, content = {}, current = null, original = '';
  async function request(path, options = {}) {
    const response = await fetch(api + path, { ...options, headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}) } });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data;
  }
  const ready = request('/content').then(data => { content = data.content; }).catch(() => {});
  const dialog = document.createElement('dialog'); dialog.className = 'course-editor-dialog';
  dialog.innerHTML = `<form><header><h2></h2><button type="button" data-close aria-label="Close">×</button></header><div data-login><label>Email / メール<input type="email" name="email" value="ykawano@reitaku-u.ac.jp" required autocomplete="username"></label><label>Admin password / 管理者パスワード<input type="password" name="password" autocomplete="current-password"></label></div><div data-edit hidden><p>Markdown: - bullets · **bold** · [link](https://…)</p><label>English<textarea name="en" rows="9" maxlength="12000"></textarea></label><label>日本語<textarea name="ja" rows="9" maxlength="12000"></textarea></label><p>Edit English and Japanese independently. / 英語と日本語をそれぞれ編集してください。</p></div><p role="status" aria-live="polite"></p><footer><button type="button" data-close>Cancel / キャンセル</button><button type="submit" data-save>Sign in / ログイン</button></footer></form>`;
  document.body.append(dialog);
  // Keep typing, selection and Escape local to the modal; don't trigger story shortcuts.
  ['keydown', 'keyup', 'keypress'].forEach(type => dialog.addEventListener(type, event => event.stopPropagation()));
  const form = dialog.querySelector('form'), status = dialog.querySelector('[role="status"]');
  const remove = document.createElement('button'); remove.type = 'button'; remove.hidden = true;
  remove.textContent = label('Delete narrative', 'この文章を削除'); dialog.querySelector('footer').prepend(remove);
  remove.onclick = async () => {
    if (!current || !confirm(label('Delete this entire narrative panel from the public story?', 'この文章パネル全体を公開ストーリーから削除しますか？'))) return;
    busy(true);
    try {
      const record = { id: current.id, revision: current.revision, en: original, ja: form.elements.ja.value || original, deleted: true };
      const result = await request('/content', { method: 'PUT', body: JSON.stringify(record) });
      content[current.id] = { ...record, revision: result.revision };
      dialog.close(); window.dispatchEvent(new Event('course-content-change'));
    } catch (error) { status.textContent = error.message; } finally { busy(false); }
  };
  const busy = value => dialog.querySelectorAll('button').forEach(button => button.disabled = value);
  dialog.querySelectorAll('[data-close]').forEach(button => button.onclick = () => dialog.close());
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'course-admin-toggle';
  const update = () => { document.body.classList.toggle('course-editing', Boolean(session)); toggle.textContent = session ? label('Finish editing', '編集を終了') : label('Instructor edit', '教員用編集'); };
  (document.querySelector('#main') || document.querySelector('#story') || document.body).prepend(toggle); update();
  toggle.onclick = () => {
    if (session) { request('/session', { method: 'DELETE' }).catch(() => {}); session = null; update(); return; }
    current = null; remove.hidden = true; status.textContent = ''; dialog.querySelector('h2').textContent = label('Instructor sign in', '教員ログイン');
    dialog.querySelector('[data-login]').hidden = false; dialog.querySelector('[data-edit]').hidden = true;
    dialog.querySelector('[data-save]').textContent = label('Sign in', 'ログイン'); dialog.showModal();
  };
  form.onsubmit = async event => {
    event.preventDefault(); busy(true); status.textContent = '';
    try {
      if (!current) {
        const signed = await request('/session', { method: 'POST', body: JSON.stringify({ email: form.elements.email.value, password: form.elements.password.value }) });
        form.elements.password.value = ''; if (!signed.admin) throw new Error('Use your instructor email and admin password, not the class password.');
        session = signed; update(); dialog.close();
      } else {
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
      remove.hidden = !section.editId.startsWith('week-2:story/');
      const stored = content[section.editId]; original = stored?.en || section.originalContent;
      form.elements.en.value = original;
      form.elements.ja.value = stored?.ja || section.originalJa || original.split('\n').map(line => { const bullet = line.startsWith('- ') ? '- ' : ''; return bullet + (window.COURSE_TRANSLATIONS?.ja?.[line.slice(bullet.length)] || line.slice(bullet.length)); }).join('\n');
      status.textContent = ''; dialog.querySelector('h2').textContent = label('Edit: ', '編集：') + section.title;
      dialog.querySelector('[data-login]').hidden = true; dialog.querySelector('[data-edit]').hidden = false;
      dialog.querySelector('[data-save]').textContent = label('Save & publish', '保存して公開'); dialog.showModal();
    }; block.prepend(button);
  } };
})();
