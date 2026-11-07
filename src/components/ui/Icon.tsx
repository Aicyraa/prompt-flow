import type { ReactNode } from 'react'

const CLOSE_PATH =
  'M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z'

export function CloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={CLOSE_PATH} />
    </svg>
  )
}

export type IconName =
  | 'play'
  | 'spinner'
  | 'download'
  | 'upload'
  | 'help'
  | 'settings'
  | 'copy'
  | 'expand'
  | 'key'
  | 'alert'
  | 'check'
  | 'history'
  | 'chevron'
  | 'undo'
  | 'redo'
  | 'trash'
  | 'plus'

const STROKE: Record<Exclude<IconName, 'play' | 'spinner'>, ReactNode> = {
  chevron: <path d="m5 8 5 5 5-5" />,
  undo: <path d="M7 5 3.5 8.5 7 12M3.5 8.5H12a4.5 4.5 0 0 1 0 9H8" />,
  redo: <path d="m13 5 3.5 3.5L13 12M16.5 8.5H8a4.5 4.5 0 0 0 0 9h4" />,
  plus: <path d="M10 4v12M4 10h12" />,
  trash: (
    <>
      <path d="M4 6h12M8 6V4h4v2M6 6l.7 9.5a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L14 6" />
      <path d="M8.5 9v4.5M11.5 9v4.5" />
    </>
  ),
  download: <path d="M10 3v10M6 9l4 4 4-4M4 16h12" />,
  upload: <path d="M10 13V3M6 7l4-4 4 4M4 16h12" />,
  help: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M8.2 8a1.9 1.9 0 1 1 2.6 1.75c-.5.25-.8.65-.8 1.25M10 13.8h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
    </>
  ),
  copy: (
    <>
      <rect x="7" y="7" width="9" height="9" rx="1.5" />
      <path d="M4 13V5.5A1.5 1.5 0 0 1 5.5 4H13" />
    </>
  ),
  expand: <path d="M12 4h4v4M8 16H4v-4M16 4l-5 5M4 16l5-5" />,
  key: (
    <>
      <circle cx="7" cy="12" r="3" />
      <path d="M9.2 9.8 16 3M13.5 5.5l2 2" />
    </>
  ),
  alert: <path d="M10 3 2.5 16h15L10 3ZM10 8v3.5M10 13.8h.01" />,
  check: <path d="m4 10.5 4 4 8-9" />,
  history: (
    <>
      <path d="M3.5 10a6.5 6.5 0 1 0 2-4.7M3.5 3.5v3h3" />
      <path d="M10 6.5V10l2.5 1.5" />
    </>
  ),
}

export function Icon({
  name,
  className = 'h-4 w-4',
}: {
  name: IconName
  className?: string
}) {
  if (name === 'play') {
    return (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6 4.5v11l9-5.5-9-5.5Z" />
      </svg>
    )
  }
  if (name === 'spinner') {
    return (
      <svg
        className={`${className} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
    )
  }
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {STROKE[name]}
    </svg>
  )
}
