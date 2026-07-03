let _cachedSiteName = 'ShopHub'

export function setSiteName(name: string) {
  _cachedSiteName = name
  if (_overrideMeta) {
    applyMeta()
  }
}

function setMetaTag(selector: string, attr: string, value: string) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const eqIdx = attr.indexOf('=')
    el.setAttribute(attr.slice(0, eqIdx), attr.slice(eqIdx + 1))
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function applyMeta() {
  if (typeof document === 'undefined') return
  if (_overrideMeta?.title) {
    const full = `${_overrideMeta.title} - ${_cachedSiteName}`
    document.title = full
    setMetaTag('meta[name="description"]', 'name=description', _overrideMeta.description || '')
    setMetaTag('meta[property="og:title"]', 'property=og:title', full)
    setMetaTag('meta[property="og:description"]', 'property=og:description', _overrideMeta.description || '')
  }
}

export function getFullTitle(): string | null {
  if (!_overrideMeta?.title) return null
  return `${_overrideMeta.title} - ${_cachedSiteName}`
}

export function getOverrideDescription(): string | null {
  return _overrideMeta?.description || null
}

let _overrideMeta: { title?: string; description?: string } | null = null

export function setPageMeta(meta: { title?: string; description?: string } | null) {
  _overrideMeta = meta
  applyMeta()
}

export function getPageMeta(): { title?: string; description?: string } | null {
  return _overrideMeta
}
