const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => [...document.querySelectorAll(selector)]

const state = {
  mode: 'login',
  articles: [],
  current: null,
  filter: 'all',
  dirty: false,
  sitePreviewUrl: 'http://127.0.0.1:4173/news/',
}

const refs = {
  authView: $('#authView'),
  authTitle: $('#authTitle'),
  authLead: $('#authLead'),
  authForm: $('#authForm'),
  authEmail: $('#authEmail'),
  authPassword: $('#authPassword'),
  authSubmit: $('#authSubmit'),
  passwordHint: $('#passwordHint'),
  authMessage: $('#authMessage'),
  workspace: $('#workspace'),
  articleList: $('#articleList'),
  articleCount: $('#articleCount'),
  emptyEditor: $('#emptyEditor'),
  editorForm: $('#editorForm'),
  saveState: $('#saveState'),
  articleNumber: $('#articleNumber'),
  articleStatus: $('#articleStatus'),
  saveButton: $('#saveButton'),
  publishButton: $('#publishButton'),
  deleteButton: $('#deleteButton'),
  previewButton: $('#previewButton'),
  coverInput: $('#coverInput'),
  coverDrop: $('#coverDrop'),
  coverPreview: $('#coverPreview'),
  coverEmpty: $('#coverEmpty'),
  coverUrl: $('#coverUrl'),
  bodyEditor: $('#bodyEditor'),
  bodyImageInput: $('#bodyImageInput'),
  restoreInput: $('#restoreInput'),
  staticExportButton: $('#staticExportButton'),
  exportDialog: $('#exportDialog'),
  exportDialogSummary: $('#exportDialogSummary'),
  toast: $('#toast'),
}

let toastTimer

function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  refs.toast.textContent = message
  refs.toast.className = `toast show${type === 'error' ? ' error' : ''}`
  toastTimer = setTimeout(() => refs.toast.classList.remove('show'), 3200)
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const contentType = response.headers.get('content-type') || ''
  if (!response.ok) {
    const payload = contentType.includes('json') ? await response.json() : null
    const error = new Error(payload?.error || `请求失败（${response.status}）`)
    error.status = response.status
    throw error
  }
  if (response.status === 204) return null
  return contentType.includes('json') ? response.json() : response
}

function setAuthMode(mode) {
  state.mode = mode
  refs.authForm.hidden = false
  refs.authMessage.textContent = ''
  if (mode === 'setup') {
    refs.authTitle.textContent = '建立管理员账户'
    refs.authLead.textContent = '第一次使用只需设置一个本机管理员。账户和文章数据都保存在这台电脑。'
    refs.authSubmit.textContent = '建立并进入工作台'
    refs.passwordHint.hidden = false
    refs.authPassword.autocomplete = 'new-password'
  } else {
    refs.authTitle.textContent = '文章工作台'
    refs.authLead.textContent = '登录后即可撰写、上传图片并发布网站新闻。'
    refs.authSubmit.textContent = '进入工作台'
    refs.passwordHint.hidden = true
    refs.authPassword.autocomplete = 'current-password'
  }
}

async function boot() {
  try {
    const config = await api('/api/public-config')
    if (config.sitePreviewUrl) state.sitePreviewUrl = config.sitePreviewUrl
    const setup = await api('/api/setup/status')
    if (setup.needsSetup) return setAuthMode('setup')
    try {
      await api('/api/auth/me')
      await enterWorkspace()
    } catch {
      setAuthMode('login')
    }
  } catch (error) {
    refs.authLead.textContent = '后台服务暂时无法连接。'
    refs.authMessage.textContent = error.message
  }
}

refs.authForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  refs.authSubmit.disabled = true
  refs.authMessage.textContent = ''
  try {
    await api(state.mode === 'setup' ? '/api/setup' : '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: refs.authEmail.value.trim(),
        password: refs.authPassword.value,
      }),
    })
    refs.authPassword.value = ''
    await enterWorkspace()
  } catch (error) {
    refs.authMessage.textContent = error.message
  } finally {
    refs.authSubmit.disabled = false
  }
})

async function enterWorkspace() {
  await loadArticles()
  refs.authView.hidden = true
  refs.workspace.hidden = false
}

async function loadArticles(selectId = state.current?.id) {
  const response = await api('/api/admin/articles')
  state.articles = response.data || []
  renderArticleList()
  if (selectId) {
    const selected = state.articles.find((article) => article.id === selectId)
    if (selected) fillEditor(selected)
  }
}

function filteredArticles() {
  return state.filter === 'all'
    ? state.articles
    : state.articles.filter((article) => article.status === state.filter)
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]))
}

function renderArticleList() {
  const articles = filteredArticles()
  refs.articleCount.textContent = `${state.articles.length} 篇文章`
  if (!articles.length) {
    refs.articleList.innerHTML = `<div class="list-empty">${state.articles.length ? '当前筛选下没有文章。' : '还没有文章。点击右上角的“＋”开始撰写。'}</div>`
    return
  }
  refs.articleList.innerHTML = articles.map((article, index) => {
    const number = String(index + 1).padStart(2, '0')
    const date = new Date(article.updatedAt).toLocaleDateString('zh-CN')
    return `
      <button class="article-item${state.current?.id === article.id ? ' active' : ''}" type="button" data-id="${article.id}">
        <span class="article-item-top">
          <span class="article-item-index">${number} / ${escapeHtml(article.language.toUpperCase())}</span>
          <span class="article-item-status ${article.status}">${article.status === 'published' ? '已发布' : '草稿'}</span>
        </span>
        <strong>${escapeHtml(article.title)}</strong>
        <time>${date}</time>
      </button>`
  }).join('')
  $$('.article-item').forEach((button) => button.addEventListener('click', () => {
    const article = state.articles.find((item) => item.id === Number(button.dataset.id))
    if (article) selectArticle(article)
  }))
}

function selectArticle(article) {
  if (state.dirty && !window.confirm('当前修改尚未保存，确定切换文章吗？')) return
  fillEditor(article)
  renderArticleList()
}

function newArticle() {
  if (state.dirty && !window.confirm('当前修改尚未保存，确定新建文章吗？')) return
  state.current = null
  refs.editorForm.reset()
  refs.bodyEditor.innerHTML = ''
  refs.coverUrl.value = ''
  showCover('')
  $('#language').value = 'zh'
  $('#readingTime').value = '5'
  refs.emptyEditor.hidden = true
  refs.editorForm.hidden = false
  refs.articleNumber.textContent = 'ARTICLE / NEW'
  updateStatus('draft')
  refs.deleteButton.hidden = true
  markDirty(false)
  $('#title').focus()
  renderArticleList()
}

function fillEditor(article) {
  state.current = article
  refs.emptyEditor.hidden = true
  refs.editorForm.hidden = false
  refs.editorForm.reset()
  for (const field of ['language', 'title', 'slug', 'summary', 'coverUrl', 'categoryName', 'author', 'readingTime', 'seoTitle', 'seoDescription']) {
    const element = $(`#${field}`)
    if (element) element.value = article[field] ?? ''
  }
  $('#tags').value = (article.tags || []).join(', ')
  $('#featured').checked = Boolean(article.featured)
  refs.bodyEditor.innerHTML = article.bodyHtml || ''
  showCover(article.coverUrl)
  refs.articleNumber.textContent = `ARTICLE / ${String(article.id).padStart(3, '0')}`
  refs.deleteButton.hidden = false
  updateStatus(article.status)
  markDirty(false)
}

function showCover(url) {
  if (url) {
    refs.coverPreview.src = url
    refs.coverPreview.hidden = false
    refs.coverEmpty.hidden = true
  } else {
    refs.coverPreview.removeAttribute('src')
    refs.coverPreview.hidden = true
    refs.coverEmpty.hidden = false
  }
}

function updateStatus(status) {
  refs.articleStatus.textContent = status === 'published' ? '已发布' : '草稿'
  refs.articleStatus.className = `status-badge ${status}`
  refs.publishButton.textContent = status === 'published' ? '撤回发布' : '发布文章'
}

function markDirty(dirty = true) {
  state.dirty = dirty
  refs.saveState.textContent = dirty ? '有未保存修改' : (state.current ? '所有修改已保存' : '新文章尚未保存')
  if (dirty && state.current?.status === 'published') refs.publishButton.textContent = '更新发布'
}

function formPayload() {
  return {
    language: $('#language').value,
    title: $('#title').value.trim(),
    slug: $('#slug').value.trim(),
    summary: $('#summary').value.trim(),
    coverUrl: refs.coverUrl.value.trim(),
    categoryName: $('#categoryName').value.trim(),
    tags: $('#tags').value,
    author: $('#author').value.trim(),
    readingTime: Number($('#readingTime').value || 1),
    seoTitle: $('#seoTitle').value.trim(),
    seoDescription: $('#seoDescription').value.trim(),
    featured: $('#featured').checked,
    bodyHtml: refs.bodyEditor.innerHTML,
  }
}

async function saveArticle({ quiet = false } = {}) {
  if (!$('#title').value.trim()) {
    $('#title').focus()
    throw new Error('请先填写文章标题')
  }
  refs.saveButton.disabled = true
  const wasPublished = state.current?.status === 'published'
  try {
    const response = await api(
      state.current ? `/api/admin/articles/${state.current.id}` : '/api/admin/articles',
      {
        method: state.current ? 'PUT' : 'POST',
        body: JSON.stringify(formPayload()),
      },
    )
    state.current = response.data
    markDirty(false)
    await loadArticles(state.current.id)
    if (!quiet) showToast(wasPublished ? '修改已保存为草稿，重新发布前网站不会显示本文' : '文章已保存为草稿')
    return state.current
  } finally {
    refs.saveButton.disabled = false
  }
}

refs.editorForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  try {
    await saveArticle()
  } catch (error) {
    showToast(error.message, 'error')
  }
})

refs.publishButton.addEventListener('click', async () => {
  refs.publishButton.disabled = true
  try {
    if (!state.current || state.dirty) await saveArticle({ quiet: true })
    const action = state.current.status === 'published' ? 'unpublish' : 'publish'
    const response = await api(`/api/admin/articles/${state.current.id}/${action}`, { method: 'POST' })
    state.current = response.data
    await loadArticles(state.current.id)
    showToast(action === 'publish' ? '文章已发布到网站新闻中心' : '文章已撤回为草稿')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    refs.publishButton.disabled = false
  }
})

refs.deleteButton.addEventListener('click', async () => {
  if (!state.current || !window.confirm(`确定删除《${state.current.title}》吗？此操作无法撤销。`)) return
  try {
    await api(`/api/admin/articles/${state.current.id}`, { method: 'DELETE' })
    state.current = null
    state.dirty = false
    refs.editorForm.hidden = true
    refs.emptyEditor.hidden = false
    await loadArticles()
    showToast('文章已删除')
  } catch (error) {
    showToast(error.message, 'error')
  }
})

refs.previewButton.addEventListener('click', () => {
  if (!state.current || state.current.status !== 'published') {
    return showToast('请先发布文章，再打开网站预览', 'error')
  }
  const preview = new URL(state.sitePreviewUrl, window.location.href)
  preview.searchParams.set('slug', state.current.slug)
  window.open(preview.toString(), '_blank', 'noopener')
})

async function uploadImage(file) {
  if (!file) return null
  const form = new FormData()
  form.append('file', file)
  const response = await api('/api/admin/uploads', { method: 'POST', body: form })
  return response.data
}

async function setCoverFile(file) {
  if (!file) return
  refs.coverDrop.classList.remove('dragging')
  try {
    const uploaded = await uploadImage(file)
    refs.coverUrl.value = uploaded.url
    showCover(uploaded.url)
    markDirty()
    showToast('封面图片已上传')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    refs.coverInput.value = ''
  }
}

refs.coverDrop.addEventListener('click', () => refs.coverInput.click())
refs.coverInput.addEventListener('change', () => setCoverFile(refs.coverInput.files[0]))
for (const eventName of ['dragenter', 'dragover']) {
  refs.coverDrop.addEventListener(eventName, (event) => {
    event.preventDefault()
    refs.coverDrop.classList.add('dragging')
  })
}
for (const eventName of ['dragleave', 'drop']) {
  refs.coverDrop.addEventListener(eventName, (event) => {
    event.preventDefault()
    refs.coverDrop.classList.remove('dragging')
  })
}
refs.coverDrop.addEventListener('drop', (event) => setCoverFile(event.dataTransfer.files[0]))

refs.bodyImageInput.addEventListener('change', async () => {
  try {
    const uploaded = await uploadImage(refs.bodyImageInput.files[0])
    if (uploaded) {
      refs.bodyEditor.focus()
      document.execCommand('insertImage', false, uploaded.url)
      markDirty()
      showToast('图片已插入正文')
    }
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    refs.bodyImageInput.value = ''
  }
})

$$('.editor-toolbar [data-command]').forEach((button) => {
  button.addEventListener('click', () => {
    refs.bodyEditor.focus()
    const value = button.dataset.value
    document.execCommand(button.dataset.command, false, value ? `<${value}>` : null)
    markDirty()
  })
})

$('#linkButton').addEventListener('click', () => {
  const url = window.prompt('请输入链接地址（以 https:// 开头）')
  if (!url) return
  refs.bodyEditor.focus()
  document.execCommand('createLink', false, url)
  markDirty()
})

refs.editorForm.addEventListener('input', () => markDirty())
refs.editorForm.addEventListener('change', () => markDirty())
$('#newArticleButton').addEventListener('click', newArticle)
$('#emptyNewButton').addEventListener('click', newArticle)

$$('.filter-chip').forEach((button) => button.addEventListener('click', () => {
  state.filter = button.dataset.filter
  $$('.filter-chip').forEach((chip) => chip.classList.toggle('active', chip === button))
  renderArticleList()
}))

$('#backupButton').addEventListener('click', async () => {
  try {
    const response = await api('/api/admin/backup')
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `flydeer-news-${new Date().toISOString().slice(0, 10)}.zip`
    link.click()
    URL.revokeObjectURL(link.href)
    showToast('备份文件已导出')
  } catch (error) {
    showToast(error.message, 'error')
  }
})

refs.staticExportButton.addEventListener('click', async () => {
  if (state.dirty && !window.confirm('当前文章有未保存修改，这些修改不会进入静态网站。确定继续生成吗？')) return
  refs.staticExportButton.disabled = true
  refs.staticExportButton.textContent = '正在生成…'
  try {
    const response = await api('/api/admin/static-export', { method: 'POST' })
    const { articles, images } = response.data
    refs.exportDialogSummary.textContent = `已生成 ${articles} 篇已发布文章和 ${images} 张引用图片。草稿不会进入网站。`
    refs.exportDialog.showModal()
    showToast('静态新闻已生成，请提交并推送 GitHub')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    refs.staticExportButton.disabled = false
    refs.staticExportButton.textContent = '发布到静态网站'
  }
})

for (const selector of ['#exportDialogClose', '#exportDialogDone']) {
  $(selector).addEventListener('click', () => refs.exportDialog.close())
}

$('#copyGitCommands').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#gitCommands').textContent)
    showToast('Git 命令已复制')
  } catch {
    showToast('复制失败，请手动复制命令', 'error')
  }
})

refs.restoreInput.addEventListener('change', async () => {
  const file = refs.restoreInput.files[0]
  if (!file) return
  if (state.dirty && !window.confirm('当前文章有未保存修改，恢复备份会放弃这些修改。确定继续吗？')) {
    refs.restoreInput.value = ''
    return
  }
  if (!window.confirm('恢复备份会新增文章，并覆盖链接标识相同的文章。确定继续吗？')) {
    refs.restoreInput.value = ''
    return
  }
  try {
    const form = new FormData()
    form.append('file', file)
    const response = await api('/api/admin/restore', { method: 'POST', body: form })
    state.current = null
    state.dirty = false
    await loadArticles()
    refs.editorForm.reset()
    refs.bodyEditor.innerHTML = ''
    refs.editorForm.hidden = true
    refs.emptyEditor.hidden = false
    refs.saveState.textContent = '尚未编辑'
    showToast(`已恢复 ${response.data.articles} 篇文章和 ${response.data.images} 张图片`)
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    refs.restoreInput.value = ''
  }
})

$('#logoutButton').addEventListener('click', async () => {
  if (state.dirty && !window.confirm('当前修改尚未保存，确定退出登录吗？')) return
  try { await api('/api/auth/logout', { method: 'POST' }) } catch { /* session may already be gone */ }
  state.dirty = false
  window.location.reload()
})

window.addEventListener('beforeunload', (event) => {
  if (!state.dirty) return
  event.preventDefault()
})

boot()
