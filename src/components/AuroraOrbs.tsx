"use client";

/**
 * AuroraOrbs – fixed background layer with drifting iridescent blobs.
 * Mount once in layout or page roots; pointer-events: none so it never
 * intercepts clicks.
 */
export default function AuroraOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Cyan orb – top-left */}
      <div
        className="orb-1 absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(6,214,208,0.8) 0%, rgba(6,214,208,0.2) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Lavender orb – top-right */}
      <div
        className="orb-2 absolute -top-24 -right-24 h-[600px] w-[600px] rounded-full opacity-[0.11]"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.8) 0%, rgba(167,139,250,0.2) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Pink orb – bottom-right */}
      <div
        className="orb-3 absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full opacity-[0.09]"
        style={{
          background:
            "radial-gradient(circle, rgba(244,114,182,0.7) 0%, rgba(244,114,182,0.15) 50%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />

      {/* Gold orb – bottom-left */}
      <div
        className="orb-1 absolute -bottom-32 -left-16 h-[420px] w-[420px] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.7) 0%, rgba(251,191,36,0.1) 50%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "-4s",
        }}
      />

      {/* Center accent – very subtle */}
      <div
        className="orb-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.6) 0%, rgba(129,140,248,0.05) 60%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "-7s",
        }}
      />
    </div>
  );
}
