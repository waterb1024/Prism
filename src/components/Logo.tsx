export default function Logo({ size = 22 }: { size?: number }) {
  const mark = Math.round(size * 1.05);
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="24" height="24" rx="6.5" fill="#0a0a0a" />
        <path d="M9 6.5 L17.5 12 L9 17.5 Z" fill="#ffffff" />
      </svg>
      <span
        style={{
          fontSize: size,
          fontFamily:
            '"Inter", "Pretendard Variable", -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: 800,
          letterSpacing: "-0.032em",
          lineHeight: 1,
          color: "#0a0a0a",
        }}
      >
        Prism
      </span>
    </span>
  );
}
