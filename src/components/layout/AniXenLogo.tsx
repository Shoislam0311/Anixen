interface AniXenLogoProps {
  className?: string;
}

export default function AniXenLogo({ className = '' }: AniXenLogoProps) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      Ani<span className="text-[#ff4444]">Xen</span>
    </span>
  );
}
