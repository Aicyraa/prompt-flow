/** PromptFlow mark: two nodes joined by a flowing edge. */
export default function Logo({
  className = 'h-8 w-8',
}: {
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="PromptFlow logo"
    >
      <rect width="64" height="64" rx="14" fill="#161310" />
      <path
        d="M19 40c0-9 6-9 13-9s13 0 13-9"
        stroke="#A78BFA"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="9" y="33" width="14" height="14" rx="4" fill="#A78BFA" />
      <rect x="41" y="13" width="14" height="14" rx="4" fill="#DED8CF" />
    </svg>
  )
}
