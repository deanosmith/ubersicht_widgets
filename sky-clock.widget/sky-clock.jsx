// Sky Clock Widget for Übersicht
// A visual 24-hour clock with sky colors representing time of day

// Refresh once every day
export const refreshFrequency = 1000 * 60 * 60 * 24;

// Fetch sunrise and sunset times for Copenhagen (matches working example methodology)
export const command = `
source venv/bin/activate && python3 -c '
import datetime
import requests
from zoneinfo import ZoneInfo

try:
    # Copenhagen coordinates
    lat = 55.6761
    lng = 12.5683
    # Hermanus
    #lat = -34.4090
    #lng = 19.2490

    # Get current date in YYYY-MM-DD format
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")

    # Fetch sunrise and sunset times from Sunrise-Sunset.org API
    response = requests.get(
        f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lng}&date={current_date}&formatted=0",
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()["results"]

    # Parse UTC times
    sunrise_utc = datetime.datetime.fromisoformat(data["sunrise"])
    sunset_utc = datetime.datetime.fromisoformat(data["sunset"])

    # Convert UTC times to Copenhagen local time
    sunrise_local = sunrise_utc.astimezone(ZoneInfo("Europe/Copenhagen"))
    sunset_local = sunset_utc.astimezone(ZoneInfo("Europe/Copenhagen"))

    # Print times in 24-hour format (HH:MM HH:MM)
    print(sunrise_local.strftime("%H:%M"), sunset_local.strftime("%H:%M"))
except Exception:
    print("🔴 Error 🔴")
'
`;

// Widget styling
export const className = `
  left: 150px;
  bottom: -100px;
  transform: translate(-50%, -50%);
  
  .clock-container {
    width: 250px;
    height: 250px;
    position: relative;
  }
  
  .clock-face {
    width: 100%;
    height: 100%;
    position: relative;
  }
`;

// Helper function to convert "HH:MM" to decimal hours
const timeToDecimal = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60.0;
};

// Render the clock
export const render = ({ output }) => {
  // Default sunrise/sunset times (in decimal hours)

  // Parse sunrise/sunset times from command output (matching working example methodology)
  const cleaned = (output || "").trim();

  let sunset = 12;  // Default fallback
  let sunrise = 12;  // Default fallback

  if (cleaned && cleaned !== "" && cleaned !== "🔴 Error 🔴") {
    const times = cleaned.split(" ");
    if (times.length >= 2) {
      sunrise = timeToDecimal(times[0]);  // Parse sunrise from API
      sunset = timeToDecimal(times[1]);   // Parse sunset from API
    }
  }

  // Debug output to console
  console.log("Sky Clock - Sunrise:", sunrise, "Sunset:", sunset, "Raw output:", output);

  return (
    <div className="clock-container">
      {/* Layer 1: Dark Background Circle (for night) */}
      <div style={{
        position: 'absolute',
        top: '1%', left: '1%', width: '98%', height: '98%',
        borderRadius: '100%',
        background: '#0a1628',
        zIndex: 0
      }} />

      {/* Layer 2: Sky Conic Gradient (with blur) */}
      {(() => {
        // Generate hour colors dynamically based on sunrise/sunset
        // Note: Logic preserved from previous step to ensure smooth gradient
        const generateHourColors = () => {
          const colors = [];
          const addColor = (hour, color) => colors.push({ hour, color });

          // Define windows (30 mins = 0.5 hours)
          const sunriseStart = sunrise - 0.5;
          const sunriseEnd = sunrise + 0.5;

          const sunsetStart = sunset - 0.5;
          const sunsetEnd = sunset + 0.5;

          const noon = (sunrise + sunset) / 2;

          // --- SUNRISE WINDOW [sunrise - 0.5, sunrise + 0.5] ---
          // Distribute the warm sunrise colors within this 1-hour window
          addColor(sunriseStart - .3, '#ff8c5a2f'); // Fade in start
          addColor(sunriseStart, '#ff8c5a70'); // Fade in start
          addColor(sunriseStart + 0.1, '#ff8c5a72');
          addColor(sunriseStart + 0.2, '#ff9864cb');
          addColor(sunriseStart + 0.3, '#FFA46E');
          addColor(sunriseStart + 0.4, '#FFB078');
          // addColor(sunrise, '#FFBC82'); // Actual sunrise time
          // addColor(sunrise + 0.1, '#FFC88C');
          // addColor(sunrise + 0.2, '#EDD096');
          // addColor(sunrise + 0.3, '#dcc4a0ff');
          // addColor(sunrise + 0.4, '#dcc4a0ff');
          // addColor(sunriseEnd, '#96c1d8ff'); // Transition to blue at end of window

          // --- DAY WINDOW [sunrise + 0.5, sunset - 0.5] ---
          // Natural sky blue palette between the events

          // We lay out a few points to maintain the gradient structure and "noon" brightness
          // Start of day proper
          const dayDuration = sunsetStart - sunriseEnd;
          const dayStart = sunriseEnd;

          // Add a few interpolation points for the blue sky
          addColor(dayStart + dayDuration * 0.2, '#8AD0D2');
          addColor(dayStart + dayDuration * 0.5, '#87CEEB'); // Peak noonish color (can align with actual noon if within window)
          // Ensure noon is exactly represented if it falls nicely in the middle (it usually does)
          // But strict noon alignment isn't as critical as the smooth blue wash requested.
          // Let's explicitly add the noon color at the actual solar noon if it's inside this window (it technically must be)
          if (noon > sunriseEnd && noon < sunsetStart) {
            addColor(noon, '#87CEEB');
          }

          addColor(dayStart + dayDuration * 0.8, '#88CCE9');

          // --- SUNSET WINDOW [sunset - 0.5, sunset + 0.5] ---
          // Distribute sunset colors within this 1-hour window
          const sunsetWindowDuration = 1.0;
          // We can just step through relative to sunsetStart
          // addColor(sunset - 0.5, '#e992c4ff');
          // addColor(sunset - 0.3, '#e992c4ff');
          // addColor(sunset - 0.2, '#e992c4ff');
          // addColor(sunset - 0.1, '#e992c4ff');
          addColor(sunset, '#ff9cc8ff');
          addColor(sunset + 0.1, '#ff6caeff');
          addColor(sunset + 0.2, '#ff6caec1');// SUNSET HAND
          addColor(sunset + 0.4, '#ff6cae7c');
          // addColor(sunset + 0.5, '#ff6caeff');
          // End of light

          colors.sort((a, b) => a.hour - b.hour);
          return colors;
        };

        const hourColors = generateHourColors();
        const stops = hourColors.map(p => `${p.color} ${p.hour * 15}deg`).join(', ');
        const startAngle = hourColors[0].hour * 15;
        const endAngle = hourColors[hourColors.length - 1].hour * 15;
        const gradient = `conic-gradient(from 180deg, transparent 0deg, transparent ${startAngle}deg, ${stops}, transparent ${endAngle}deg, transparent 360deg)`;

        return (
          <div style={{
            position: 'absolute',
            top: '1%', left: '1%', width: '98%', height: '98%',
            borderRadius: '100%',
            background: gradient,
            filter: 'blur(5px)', // Heavy blur for sky atmosphere
            transform: 'scale(1.0)', // Slight scale to handle blur edges if needed
            zIndex: 1
          }} />
        );
      })()}

      {/* Layer 3: SVG for stars, labels, hands */}
      <svg className="clock-face" viewBox="0 0 500 500" style={{ position: 'absolute', zIndex: 10 }}>
        {/* Helper defs if needed */}
        <defs>
          {/* Circular clipping path to contain blur within circle */}
          <clipPath id="circleClip">
            <circle cx="250" cy="250" r="245" />
          </clipPath>
        </defs>

        {/* Stars generation */}
        {(() => {
          const stars = [];
          // Deterministic random generator for consistent star positions across renders
          let seed = 1;
          const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };

          const sunriseAngleDeg = (sunrise - 12) * 15 - 90;
          const sunsetAngleDeg = (sunset - 12) * 15 - 90;

          const nightStart = sunsetAngleDeg;
          const nightEnd = sunriseAngleDeg + 360;

          // Generate stars
          for (let i = 0; i < 100; i++) {
            const angleDeg = random() * 360;
            const r = random() * 245;
            const starAngle = angleDeg - 90;

            let visible = false;
            // Check if star is in the night segment [sunset, sunrise+360]
            if (starAngle >= nightStart && starAngle <= nightEnd) {
              visible = true;
            }

            if (visible) {
              const x = 250 + r * Math.cos(starAngle * Math.PI / 180);
              const y = 250 + r * Math.sin(starAngle * Math.PI / 180);
              const size = random() * 2 + 0.5;
              const opacity = random() * 0.7 + 0.1;
              stars.push(<circle cx={x} cy={y} r={size} fill="white" fillOpacity={opacity} key={`star-${i}`} />);
            }
          }
          return stars;
        })()}


        {/* Hour labels - 12, 18, 24, 6 at cardinal positions */}
        {[
          { hour: 12, angle: -90 },    // Top (noon)
          { hour: 18, angle: 0 },      // Right (6pm sunset)
          { hour: 24, angle: 90 },     // Bottom (midnight)
          { hour: 6, angle: 180 },     // Left (6am sunrise)
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
              fontSize="28"
              fontWeight="100"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            // style={{
            // textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            // opacity: 1
            // }}
            >
              {hour}
            </text>
          );
        })}

        {/* Sunrise hand and tick */}
        {(() => {
          const sunriseAngle = ((sunrise - 12) * 15 - 90) * (Math.PI / 180);

          // Hand (Black line) from center to tick start
          const xStart = 250;
          const yStart = 250;
          const xEndHand = 250 + 225 * Math.cos(sunriseAngle);
          const yEndHand = 250 + 225 * Math.sin(sunriseAngle);

          // Tick (White) at edge
          const xEndTick = 250 + 245 * Math.cos(sunriseAngle);
          const yEndTick = 250 + 245 * Math.sin(sunriseAngle);

          return (
            <g>
              {/* Black Hand */}
              <line
                x1={xStart}
                y1={yStart}
                x2={xEndHand}
                y2={yEndHand}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* White Tick */}
              <line
                x1={xEndHand}
                y1={yEndHand}
                x2={xEndTick}
                y2={yEndTick}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          );
        })()}

        {/* Sunset hand and tick */}
        {(() => {
          const sunsetAngle = ((sunset - 12) * 15 - 90) * (Math.PI / 180);

          // Hand (Black line) from center to tick start
          const xStart = 250;
          const yStart = 250;
          const xEndHand = 250 + 225 * Math.cos(sunsetAngle);
          const yEndHand = 250 + 225 * Math.sin(sunsetAngle);

          // Tick (White) at edge
          const xEndTick = 250 + 245 * Math.cos(sunsetAngle);
          const yEndTick = 250 + 245 * Math.sin(sunsetAngle);

          return (
            <g>
              {/* Black Hand */}
              <line
                x1={xStart}
                y1={yStart}
                x2={xEndHand}
                y2={yEndHand}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* White Tick */}
              <line
                x1={xEndHand}
                y1={yEndHand}
                x2={xEndTick}
                y2={yEndTick}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

