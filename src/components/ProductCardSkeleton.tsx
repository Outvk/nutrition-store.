"use client";

export default function ProductCardSkeleton() {
  return (
    <div style={{ 
      background: "rgba(255,255,255,0.02)", 
      border: "1px solid var(--border)", 
      display: "flex", 
      flexDirection: "column",
      height: "100%",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Shimmer effect */}
      <div className="shimmer" />
      
      {/* Image box */}
      <div style={{ 
        aspectRatio: "1/1", 
        background: "rgba(255,255,255,0.03)", 
        width: "100%" 
      }} />
      
      {/* Content box */}
      <div style={{ padding: "16px", flex: 1 }}>
        <div style={{ 
          height: "12px", 
          background: "rgba(255,255,255,0.05)", 
          width: "40%", 
          marginBottom: "12px" 
        }} />
        <div style={{ 
          height: "20px", 
          background: "rgba(255,255,255,0.08)", 
          width: "90%", 
          marginBottom: "16px" 
        }} />
        <div style={{ 
          height: "24px", 
          background: "rgba(255,255,255,0.1)", 
          width: "60%" 
        }} />
      </div>

      <style jsx>{`
        .shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.03) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
          transform: translateX(-100%);
          z-index: 1;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
