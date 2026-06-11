const loadedScripts = new Map()

export const loadOnlyOfficeApi = (documentServerUrl) => {
  const baseUrl = documentServerUrl?.replace(/\/$/, '')
  if (!baseUrl) {
    return Promise.reject(new Error('ONLYOFFICE Document Server manzili sozlanmagan'))
  }

  if (window.DocsAPI?.DocEditor) {
    return Promise.resolve(window.DocsAPI)
  }

  const scriptUrl = `${baseUrl}/web-apps/apps/api/documents/api.js`
  if (loadedScripts.has(scriptUrl)) {
    return loadedScripts.get(scriptUrl)
  }

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-onlyoffice="${scriptUrl}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.DocsAPI))
      existing.addEventListener('error', () => reject(new Error('ONLYOFFICE skripti yuklanmadi')))
      return
    }

    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.dataset.onlyoffice = scriptUrl
    script.onload = () => {
      if (window.DocsAPI?.DocEditor) {
        resolve(window.DocsAPI)
        return
      }
      reject(new Error('ONLYOFFICE API topilmadi'))
    }
    script.onerror = () =>
      reject(
        new Error(
          'ONLYOFFICE Document Server ulanmadi. 88.88.5.15:8080 portida Docker konteyner ishlayotganini tekshiring.',
        ),
      )
    document.body.appendChild(script)
  })

  loadedScripts.set(scriptUrl, promise)
  return promise
}

export const destroyOnlyOfficeEditor = (editorId) => {
  const editor = window.DocEditor?.instances?.[editorId]
  if (editor?.destroyEditor) {
    editor.destroyEditor()
  }
}

export const forceSaveOnlyOfficeEditor = (editorId) => {
  const editor = window.DocEditor?.instances?.[editorId]
  if (editor?.serviceCommand) {
    editor.serviceCommand('forcesave', '')
    return true
  }
  return false
}
