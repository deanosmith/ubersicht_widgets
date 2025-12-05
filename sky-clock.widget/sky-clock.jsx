// Dynamic Sky Clock Widget for Übersicht
// A beautiful visual clock with sky colors that change based on time of day

// Refresh frequency (can be slower since no hands to update)
export const refreshFrequency = false;

// No shell command needed
export const command = undefined;

// Widget styling
export const className = `
  left: 10%;
  top: 85%;
  transform: translate(-50%, -50%);
  
  .clock-container {
    width: 250px;
    height: 250px;
    position: relative;
  }
  
  .clock-face {
    width: 100%;
    height: 100%;
    // border-radius: 50%;
    position: relative;
    // box-shadow: 0 10px 50px rgba(0, 0, 0, 0.4);
    filter: blur(0px);
  }
`;

// Render the clock
export const render = () => {
  return (
    <div className="clock-container">
      <svg className="clock-face" viewBox="0 0 500 500">
        <defs>
          {/* Radial gradient for smooth blending */}
          <radialGradient id="blurOverlay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Multiple gradients for smooth transitions */}
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
        </defs>

        {/* Main circle background */}
        <circle cx="250" cy="250" r="245" fill="#1a2540" />

        {/* Smooth blended sky gradient using many small segments */}
        {(() => {
          // Create smooth gradient with 48 segments for ultra-smooth blending
          const segments = [];
          const colors = [
            // 12 o'clock (top) - light blue day sky
            { angle: 0, color: '#87CEEB' },
            { angle: 15, color: '#7BC4E8' },
            { angle: 30, color: '#6FBAE5' },

            // 3 o'clock (right side) - transitioning
            { angle: 45, color: '#A8C8E0' },
            { angle: 60, color: '#C5B8D8' },
            { angle: 75, color: '#D8AAD0' },

            // 6 o'clock (bottom right) - sunset colors
            { angle: 90, color: '#E89FC8' },
            { angle: 105, color: '#F094C0' },
            { angle: 120, color: '#F88AB8' },

            // 9 o'clock (left side) - sunrise/golden colors
            { angle: 135, color: '#FF8FAF' },
            { angle: 150, color: '#FF94A6' },
            { angle: 165, color: '#FF9A9E' },
            { angle: 180, color: '#FFA596' },

            // Left side continuing - golden hour
            { angle: 195, color: '#FFB08E' },
            { angle: 210, color: '#FFBB86' },
            { angle: 225, color: '#FFC67E' },
            { angle: 240, color: '#FFD176' },

            // Top left - transitioning back to day
            { angle: 255, color: '#F5D67A' },
            { angle: 270, color: '#E5DB7E' },
            { angle: 285, color: '#D5E082' },
            { angle: 300, color: '#C5E586' },
            { angle: 315, color: '#B0E48A' },
            { angle: 330, color: '#9BE38E' },
            { angle: 345, color: '#8DD8A0' },

            // Back to top - completing the circle
            { angle: 360, color: '#87CEEB' },
          ];

          // Bottom half - night colors (deep blues and purples)
          const nightColors = [
            // Bottom center - deepest night
            { angle: 180, color: '#1a2540' },
            { angle: 195, color: '#1f2d4a' },
            { angle: 210, color: '#243554' },
            { angle: 225, color: '#293d5e' },
            { angle: 240, color: '#2e4568' },
            { angle: 255, color: '#334d72' },
            { angle: 270, color: '#38557c' },

            // Transitioning towards sunrise on left
            { angle: 285, color: '#4d5d7a' },
            { angle: 300, color: '#5a6580' },
            { angle: 315, color: '#676d86' },
            { angle: 330, color: '#74758c' },
            { angle: 345, color: '#7d8498' },
            { angle: 360, color: '#87CEEB' },
          ];

          // Combine day and night colors with smooth interpolation
          const allColors = [
            // Top - bright sky blue (12 o'clock position = 0°)
            { angle: 0, color: '#89CFF0' },   // Bright day sky
            { angle: 10, color: '#8ACBEE' },
            { angle: 20, color: '#8CC6EB' },
            { angle: 30, color: '#8EC2E9' },

            // Moving clockwise to 3 o'clock (90°) - still day but getting warmer
            { angle: 40, color: '#93BEE6' },
            { angle: 50, color: '#98BAE4' },
            { angle: 60, color: '#9DB6E1' },
            { angle: 70, color: '#A2B2DF' },
            { angle: 80, color: '#A7AEDD' },
            { angle: 90, color: '#ACAADB' },

            // 3 to 6 o'clock (90° to 180°) - sunset transition
            { angle: 100, color: '#B9A6D8' },
            { angle: 110, color: '#C6A2D5' },
            { angle: 120, color: '#D39ED2' },
            { angle: 130, color: '#E09ACF' },
            { angle: 140, color: '#ED96CC' },
            { angle: 150, color: '#F492C4' },
            { angle: 160, color: '#F78EBC' },
            { angle: 170, color: '#F98AB4' },

            // 6 o'clock (180°) - deep night at bottom
            { angle: 180, color: '#1E3A5F' },   // Deep blue night
            { angle: 190, color: '#1C3556' },
            { angle: 200, color: '#1A304D' },
            { angle: 210, color: '#182B44' },
            { angle: 220, color: '#16263B' },
            { angle: 230, color: '#142132' },

            // 6 to 9 o'clock (180° to 270°) - deep night to pre-dawn
            { angle: 240, color: '#1A2838' },
            { angle: 250, color: '#20303E' },
            { angle: 260, color: '#263844' },
            { angle: 270, color: '#2C404A' },

            // 9 o'clock to 12 (270° to 360°) - sunrise colors
            { angle: 280, color: '#3D4D5A' },
            { angle: 290, color: '#4E5A6A' },
            { angle: 300, color: '#5F677A' },
            { angle: 310, color: '#70748A' },
            { angle: 320, color: '#81819A' },
            { angle: 330, color: '#8D99B8' },
            { angle: 340, color: '#87A8CD' },
            { angle: 350, color: '#88B9E0' },
            { angle: 360, color: '#89CFF0' },
          ];

          // Create smooth segments with blur
          for (let i = 0; i < allColors.length - 1; i++) {
            const current = allColors[i];
            const next = allColors[i + 1];
            const startAngle = (current.angle - 90) * (Math.PI / 180);
            const endAngle = (next.angle - 90) * (Math.PI / 180);

            const x1 = 250 + 245 * Math.cos(startAngle);
            const y1 = 250 + 245 * Math.sin(startAngle);
            const x2 = 250 + 245 * Math.cos(endAngle);
            const y2 = 250 + 245 * Math.sin(endAngle);

            // Create gradient for this segment
            const gradientId = `grad${i}`;

            segments.push(
              <defs key={`def-${i}`}>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={current.color} />
                  <stop offset="100%" stopColor={next.color} />
                </linearGradient>
              </defs>
            );

            segments.push(
              <path
                key={i}
                d={`M 250 250 L ${x1} ${y1} A 245 245 0 0 1 ${x2} ${y2} Z`}
                fill={`url(#${gradientId})`}
                style={{ filter: 'blur(2px)' }}
              />
            );
          }

          return segments;
        })()}

        {/* Hour markers as subtle tick marks */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15) * (Math.PI / 180);
          const x1 = 250 + 220 * Math.cos(angle);
          const y1 = 250 + 220 * Math.sin(angle);
          const x2 = 250 + 230 * Math.cos(angle);
          const y2 = 250 + 230 * Math.sin(angle);

          return (
            <line
              key={`marker-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Hour labels - traditional clock positions but with 24-hour labels */}
        {[
          { hour: 12, angle: 0 },      // Top
          { hour: 3, angle: 90 },      // Right  
          { hour: 6, angle: 180 },     // Bottom
          { hour: 9, angle: 270 },     // Left
          { hour: 18, angle: 90 },     // Right (also show 18)
          { hour: 24, angle: 180 },    // Bottom (also show 24)
        ].map(({ hour, angle }) => {
          const rad = angle * (Math.PI / 180);
          const x = 250 + 195 * Math.cos(rad);
          const y = 250 + 195 * Math.sin(rad);

          return (
            <text
              key={`label-${hour}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="16"
              fontWeight="500"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                opacity: 0.9
              }}
            >
              {hour}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
