export default function AppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Spokes from center to outer nodes */}
      <line x1="12" y1="12" x2="12" y2="4.5"  stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.55"/>
      <line x1="12" y1="12" x2="4.5" y2="12"  stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.55"/>
      <line x1="12" y1="12" x2="19.5" y2="12" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.55"/>
      <line x1="12" y1="12" x2="12" y2="19.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.55"/>
      {/* Diagonal spokes */}
      <line x1="12" y1="12" x2="6.5"  y2="6.5"  stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="12" y1="12" x2="17.5" y2="6.5"  stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="12" y1="12" x2="6.5"  y2="17.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="12" y1="12" x2="17.5" y2="17.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.3"/>
      {/* Outer ring connecting the 4 main nodes */}
      <circle cx="12" cy="12" r="7.5" stroke="white" strokeWidth="1" strokeOpacity="0.15" fill="none"/>
      {/* 4 outer nodes */}
      <circle cx="12"  cy="4.5"  r="2.2" fill="white"/>
      <circle cx="4.5" cy="12"   r="2.2" fill="white"/>
      <circle cx="19.5" cy="12"  r="2.2" fill="white"/>
      <circle cx="12"  cy="19.5" r="2.2" fill="white"/>
      {/* Center node — slightly larger, full opacity */}
      <circle cx="12" cy="12" r="2.8" fill="white"/>
    </svg>
  )
}
