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
        const generateHourColors = () => {
          const colors = [];
          const addColor = (hour, color) => colors.push({ hour, color });

          // Define windows (30 mins = 0.5 hours)
          const sunriseStart = sunrise - 0.5;
          const sunriseEnd = sunrise + 0.5;

          const sunsetStart = sunset - 0.5;
          const sunsetEnd = sunset + 0.5;

          const noon = (sunrise + sunset) / 2;

          addColor(sunriseStart - .3, '#ff8c5a2f');
          addColor(sunriseStart + 0.1, '#ff8c5a72');
          addColor(sunriseStart + 0.2, '#ff9864cb');
          addColor(sunriseStart + 0.3, '#FFA46E');
          addColor(sunriseStart + 0.4, '#FFB078');
          // addColor(sunrise, '#FFBC82');
          // addColor(sunrise + 0.1, '#FFC88C');
          // addColor(sunrise + 0.2, '#EDD096');
          // addColor(sunrise + 0.3, '#dcc4a0ff');
          // addColor(sunrise + 0.4, '#dcc4a0ff');
          // addColor(sunriseEnd, '#96c1d8ff');

          const dayDuration = sunsetStart - sunriseEnd;
          const dayStart = sunriseEnd;

          // Add a few interpolation points for the blue sky
          addColor(dayStart + dayDuration * 0.2, '#4cc6ffff');
          addColor(dayStart + dayDuration * 0.5, '#4cc6ffff');
          if (noon > sunriseEnd && noon < sunsetStart) {
            addColor(noon, '#4cc6ffff');
          }

          addColor(dayStart + dayDuration * 0.8, '#4cc6ffff');

          addColor(sunset, '#ff9cc8ff');
          addColor(sunset + 0.1, '#ff6caeff');
          addColor(sunset + 0.2, '#ff6cae9f');
          addColor(sunset + 0.4, '#ff6cae38');
          addColor(sunset + 0.5, '#ff6cae49');
          addColor(sunset + 0.6, '#ff6cae2e');

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
            top: '2%', left: '0%', width: '100%', height: '100%',
            borderRadius: '100%',
            background: gradient,
            filter: 'blur(5px)', // Heavy blur for sky atmosphere
            // transform: 'scale(1.0)', // Slight scale to handle blur edges if needed
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


        {/* Hour markers and ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const hour = i + 1; // 1 to 24
          const angleDeg = (hour - 12) * 15 - 90;
          const rad = angleDeg * (Math.PI / 180);

          // Tick geometry
          // Outer radius is ~245 (clip is 245)
          const tickInnerR = 235;
          const tickOuterR = 245;

          const x1 = 250 + tickInnerR * Math.cos(rad);
          const y1 = 250 + tickInnerR * Math.sin(rad);
          const x2 = 250 + tickOuterR * Math.cos(rad);
          const y2 = 250 + tickOuterR * Math.sin(rad);

          // Label geometry
          const labelR = 220;
          const lx = 250 + labelR * Math.cos(rad);
          const ly = 250 + labelR * Math.sin(rad);

          return (
            <g key={`marker-${hour}`}>
              {/* Tick Mark */}
              <line
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Label (Even hours only) */}
              {hour % 2 === 0 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="22"
                  fontWeight="00"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  style={{ opacity: 0.9 }}
                >
                  {hour}
                </text>
              )}
            </g>
          );
        })}

        {/* Sunrise & Sunset Hands */}
        {/* {(() => {
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
              <line
                x1={xStart}
                y1={yStart}
                x2={xEndHand}
                y2={yEndHand}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
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
              <line
                x1={xStart}
                y1={yStart}
                x2={xEndHand}
                y2={yEndHand}
                stroke="grey"
                strokeWidth="4"
                strokeLinecap="round"
              />
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
        })()} */}
      </svg>
    </div>
  );
};

