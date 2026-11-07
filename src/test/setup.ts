function memoryStorage(): Storage {
  const storage = new Map<string, string>()
  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size
    },
  } as Storage
}

// Always install in-memory storage: Node's own experimental `localStorage`
// global has no methods and shadows jsdom's.
for (const name of ['localStorage', 'sessionStorage'] as const) {
  Object.defineProperty(globalThis, name, {
    value: memoryStorage(),
    configurable: true,
  })
}

if (typeof document === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: globalThis.localStorage },
    configurable: true,
  })
} else if (typeof HTMLDialogElement !== 'undefined') {
  // jsdom does not implement <dialog> modal behaviour.
  const proto = HTMLDialogElement.prototype
  if (!proto.showModal) {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  }
  if (!proto.close) {
    proto.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  // jsdom does not implement layout-dependent scrolling.
  Element.prototype.scrollIntoView = () => {}
}
