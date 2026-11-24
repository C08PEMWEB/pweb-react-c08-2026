interface IconProps {
  className?: string;
}

export function GrassBlockLogo({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Top Grass Face */}
      <polygon points="32,6 58,20 32,34 6,20" fill="#6BAF5D" />
      <polygon points="32,6 45,13 32,20 19,13" fill="#82C974" />
      <polygon points="45,13 58,20 45,27 32,20" fill="#5D9E50" />
      {/* Left Dirt Face */}
      <polygon points="6,20 32,34 32,58 6,44" fill="#B57A4E" />
      {/* Left Grass Overhang */}
      <polygon
        points="6,20 32,34 32,41 25,37 25,34 18,30 18,33 11,29 11,26 6,24"
        fill="#559247"
      />
      <polygon points="12,35 19,39 19,45 12,41" fill="#9E673E" />
      <polygon points="22,44 28,47 28,53 22,50" fill="#8C5934" />
      {/* Right Dirt Face */}
      <polygon points="58,20 32,34 32,58 58,44" fill="#8E5B37" />
      {/* Right Grass Overhang */}
      <polygon
        points="58,20 32,34 32,41 39,37 39,34 46,30 46,33 52,30 52,26 58,23"
        fill="#417835"
      />
      <polygon points="44,37 51,33 51,39 44,43" fill="#74482A" />
      <polygon points="36,46 42,43 42,49 36,52" fill="#A06A42" />
    </svg>
  );
}

export function VoxelEmeraldIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="#52A535" />
      <polygon points="12,2 20,7 12,12 4,7" fill="#82D468" />
      <polygon points="12,12 20,7 20,17 12,22" fill="#3B8224" />
      <polygon points="12,6 16,8.5 16,15.5 12,18 8,15.5 8,8.5" fill="#A4E88E" fillOpacity="0.45" />
    </svg>
  );
}

export function VoxelPickaxeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Pixel Diamond Pickaxe */}
      <rect x="6" y="3" width="3" height="3" fill="#5EEAD4" />
      <rect x="9" y="3" width="3" height="3" fill="#38BDF8" />
      <rect x="12" y="3" width="3" height="3" fill="#0EA5E9" />
      <rect x="15" y="6" width="3" height="3" fill="#0284C7" />
      <rect x="18" y="9" width="3" height="3" fill="#0369A1" />
      <rect x="18" y="12" width="3" height="3" fill="#0369A1" />
      <rect x="12" y="6" width="3" height="3" fill="#7DD3FC" />
      {/* Oak Handle */}
      <rect x="12" y="9" width="3" height="3" fill="#B57A4E" />
      <rect x="9" y="12" width="3" height="3" fill="#9A643C" />
      <rect x="6" y="15" width="3" height="3" fill="#B57A4E" />
      <rect x="3" y="18" width="3" height="3" fill="#7A4C2A" />
    </svg>
  );
}

