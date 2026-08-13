"use client";

/**
 * MoonFluxx Animated Logo Mark
 * Ported from the landing page — CSS-only animated moon eclipse with glowing star rays.
 */
export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <>
      <style jsx>{`
        .bmark {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bmark .b-ring {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1.5px solid #a855f7;
          opacity: 0.8;
          -webkit-mask: linear-gradient(90deg, #000 30%, transparent 70%);
          mask: linear-gradient(90deg, #000 30%, transparent 70%);
          box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.3);
        }
        .bmark .b-ring2 {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1.5px solid #3b82f6;
          opacity: 0.5;
          -webkit-mask: linear-gradient(180deg, transparent 20%, #000 80%);
          mask: linear-gradient(180deg, transparent 20%, #000 80%);
        }
        .bmark .b-flow {
          position: absolute;
          left: 40%;
          top: 50%;
          transform: translateY(-50%);
          width: 250%;
          height: 40%;
          background: radial-gradient(ellipse at left, rgba(168, 85, 247, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%);
          border-radius: 0 50px 50px 0;
          mix-blend-mode: screen;
          transform-origin: left center;
          animation: b-flux-scale 2.5s ease-in-out infinite;
          opacity: 0.8;
        }
        .bmark .b-fh {
          position: absolute;
          left: 40%;
          top: 50%;
          transform: translateY(-50%);
          width: 300%;
          height: 2px;
          background: linear-gradient(90deg, #fff 0%, #a855f7 30%, rgba(59, 130, 246, 0.8) 70%, transparent 100%);
          border-radius: 0 50px 50px 0;
          mix-blend-mode: screen;
          transform-origin: left center;
          animation: b-flux-x 1.5s ease-in-out infinite;
          box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.8);
        }
        .bmark .b-fhl {
          position: absolute;
          right: 50%;
          top: 50%;
          transform: translateY(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(270deg, #fff 0%, rgba(168, 85, 247, 0.5) 100%);
          border-radius: 50px 0 0 50px;
          mix-blend-mode: screen;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
        }
        .bmark .b-fv {
          position: absolute;
          width: 2px;
          height: 180%;
          background: linear-gradient(180deg, transparent 0%, rgba(168, 85, 247, 0.9) 30%, #fff 50%, rgba(168, 85, 247, 0.9) 70%, transparent 100%);
          border-radius: 50px;
          mix-blend-mode: screen;
          box-shadow: 0 0 12px 2px rgba(168, 85, 247, 0.8);
        }
        .bmark .b-core {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 20px 6px #a855f7, 0 0 40px 10px rgba(59, 130, 246, 0.8);
        }
        @keyframes b-flux-scale {
          0%, 100% { transform: translateY(-50%) scaleX(0.9); opacity: 0.5; }
          50% { transform: translateY(-50%) scaleX(1.15); opacity: 1; }
        }
        @keyframes b-flux-x {
          0%, 100% { transform: translate(0, -50%); opacity: 0.7; }
          50% { transform: translate(6px, -50%); opacity: 1; }
        }
      `}</style>
      <span className="bmark">
        <span className="b-ring" />
        <span className="b-ring2" />
        <span className="b-flow" />
        <span className="b-fh" />
        <span className="b-fhl" />
        <span className="b-fv" />
        <span className="b-core" />
      </span>
    </>
  );
}
