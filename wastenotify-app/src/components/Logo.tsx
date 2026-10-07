import { useId } from 'react';

/**
 * The Wasteman mark: a figure in a blazer reaching to a bin, on the brand
 * blue→green gradient.
 *
 * The figure is painted by masking a white rectangle rather than by stacking
 * white shapes. That way the cut-outs — the lapel V, the gap under the lid, the
 * bin ridges — reveal the gradient itself, so the mark holds together at 24 px
 * and at 512 px without a second flat-colour version.
 *
 * `useId` because the gradient and mask are referenced by id: two logos on one
 * screen (sidebar and top bar) would otherwise both resolve to the first one's
 * defs, and any change to one would silently repaint the other.
 */
const Logo: React.FC<{
  size?: number;
  /** Renders the name beside the mark. */
  withWordmark?: boolean;
  /** On the gradient itself, where a second gradient would disappear. */
  variant?: 'gradient' | 'mono';
  className?: string;
}> = ({ size = 40, withWordmark = false, variant = 'gradient', className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const grad = `wm-grad-${uid}`;
  const cut = `wm-cut-${uid}`;

  const mark = (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className="shrink-0"
      role="img"
      aria-label="Wasteman"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B57D0" />
          <stop offset="0.52" stopColor="#1A73E8" />
          <stop offset="1" stopColor="#34A853" />
        </linearGradient>

        <mask id={cut}>
          <rect width="512" height="512" fill="black" />
          <g fill="white">
            <circle cx="178" cy="150" r="44" />
            <path d="M108 384 L119 258 Q126 210 178 200 Q230 210 237 258 L248 384 Z" />
            <path
              d="M234 236 Q272 244 300 262"
              stroke="white"
              strokeWidth="30"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="262" y="250" width="138" height="26" rx="11" />
            <rect x="318" y="234" width="26" height="18" rx="7" />
            <path d="M274 280 L389 280 L377 394 Q376 402 368 402 L294 402 Q286 402 285 394 Z" />
          </g>
          <g fill="black">
            <path d="M154 205 L202 205 L178 272 Z" />
            <rect x="266" y="274" width="132" height="8" />
            <rect x="309" y="300" width="10" height="76" rx="5" />
            <rect x="340" y="300" width="10" height="76" rx="5" />
          </g>
        </mask>
      </defs>

      {/* On the gradient sidebar the badge would vanish into its background,
          so the mono variant inverts: translucent white plate, gradient figure
          knocked out of it. */}
      <rect
        width="512"
        height="512"
        rx="114"
        fill={variant === 'mono' ? 'rgba(255,255,255,0.22)' : `url(#${grad})`}
      />
      <g mask={`url(#${cut})`}>
        <rect width="512" height="512" fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (!withWordmark) return <span className={className}>{mark}</span>;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      <span
        className="font-display font-extrabold leading-none"
        style={{ fontSize: Math.round(size * 0.55) }}
      >
        {variant === 'mono' ? (
          <span className="text-white">Wasteman</span>
        ) : (
          <>
            <span className="text-brand-dark">Waste</span>
            <span className="text-grass">man</span>
          </>
        )}
      </span>
    </span>
  );
};

export default Logo;
