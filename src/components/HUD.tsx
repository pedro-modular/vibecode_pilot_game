import React from 'react';

interface HUDProps {
  speed: number;
}

export const HUD: React.FC<HUDProps> = ({ speed }) => {
  return (
    <div className="hud">
      <div className="speed">Speed: {Math.round(speed * 100)} km/s</div>
      <div className="controls">
        <h3>Controls:</h3>
        <p>W/S - Forward/Backward</p>
        <p>A/D - Turn Left/Right</p>
        <p>Space - Move Up</p>
        <p>Shift - Move Down</p>
      </div>
      <style jsx>{`
        .hud {
          position: fixed;
          top: 20px;
          left: 20px;
          color: #0f0;
          font-family: monospace;
          font-size: 16px;
          text-shadow: 0 0 5px #0f0;
          pointer-events: none;
        }

        .speed {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .controls {
          background: rgba(0, 0, 0, 0.5);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #0f0;
        }

        .controls h3 {
          margin: 0 0 10px 0;
        }

        .controls p {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
}; 