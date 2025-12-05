// Sky Clock Widget for Übersicht
// A visual 24-hour clock with sky colors representing time of day

// Refresh every 10 seconds for testing (change to 24 * 60 * 60 * 1000 for production)
export const refreshFrequency = 10 * 1000; // 10 seconds for testing

// Fetch sunrise and sunset times for Copenhagen
export const command = `
python3 -c '
import datetime
import json
import requests
from zoneinfo import ZoneInfo

try:
    # Select location (uncomment the one you want to use)
    
    # Copenhagen coordinates
    lat = 55.6761
    lng = 12.5683
    timezone = "Europe/Copenhagen"
    
    # Sydney coordinates (uncomment to use)
    #lat = -33.8688
    #lng = 151.2093
    #timezone = "Australia/Sydney"

    # Get current date in YYYY-MM-DD format
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")

    # Fetch sunrise and sunset times from Sunrise-Sunset.org API
    response = requests.get(
        f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lng}&date={current_date}&formatted=0",
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()["results"]

    # Parse UTC times and convert to local timezone
    sunrise_utc = datetime.datetime.fromisoformat(data["sunrise"])
    sunset_utc = datetime.datetime.fromisoformat(data["sunset"])
    
    sunrise_local = sunrise_utc.astimezone(ZoneInfo(timezone))
    sunset_local = sunset_utc.astimezone(ZoneInfo(timezone))
    
    # Output as decimal hours (e.g., 8.5 for 8:30)
    sunrise_hour = sunrise_local.hour + sunrise_local.minute / 60.0
    sunset_hour = sunset_local.hour + sunset_local.minute / 60.0
    
    # Debug output
    import sys
    print(f"Location: ({lat}, {lng}), Sunrise: {sunrise_local.strftime('%H:%M')}, Sunset: {sunset_local.strftime('%H:%M')}", file=sys.stderr)
    
    print(json.dumps({"sunrise": sunrise_hour, "sunset": sunset_hour, "location": f"({lat}, {lng})", "sunrise_time": sunrise_local.strftime("%H:%M"), "sunset_time": sunset_local.strftime("%H:%M")}))
except Exception as e:
    import sys
    print(f"Error: {e}", file=sys.stderr)
    # Default values if API fails (winter in Copenhagen)
    print(json.dumps({"sunrise": 8.5, "sunset": 15.5, "error": str(e)}))
'
`;

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
    position: relative;
  }
`;

// Render the clock
export const render = ({ output }) => {
  // Parse sunrise/sunset times from command output
  let sunTimes = { sunrise: 8.5, sunset: 15.5 };
  try {
    if (output) {
      sunTimes = JSON.parse(output.trim());
    }
  } catch (e) {
    console.error("Failed to parse sunrise/sunset data:", e);
  }

  const { sunrise, sunset } = sunTimes;

  // Debug output to console
  console.log("Sunrise:", sunrise, "Sunset:", sunset, "Data:", sunTimes);

  return (
    <div className="clock-container">
      <svg className="clock-face" viewBox="0 0 500 500">
        <defs>
          {/* Blur filter for smooth transitions */}
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
          </filter>

          {/* Circular clipping path to contain blur within circle */}
          <clipPath id="circleClip">
            <circle cx="250" cy="250" r="245" />
          </clipPath>
        </defs>

        {/* Main circle background */}
        <circle cx="250" cy="250" r="245" fill="#0a1628" />

        {/* Group to apply clipping */}
        <g clipPath="url(#circleClip)">
          {/* Sky color segments for 24-hour cycle */}
          {(() => {
            const segments = [];

            // Generate hour colors dynamically based on sunrise/sunset
            const generateHourColors = () => {
              const colors = [];

              // Helper to add color point
              const addColor = (hour, color) => {
                colors.push({ hour, color });
              };

              // Calculate noon as midpoint between sunrise and sunset
              const noon = (sunrise + sunset) / 2;

              // Calculate the daylight duration
              const daylightDuration = sunset - sunrise;

              // NIGHT - Start at hour 0 (midnight)
              // addColor(0, '#0a1628');

              // Continue deep night until well before sunrise
              // Only add pre-sunrise colors in the last 30 minutes before sunrise
              if (sunrise > 0.5) {
                addColor(sunrise - 0.5, '#0a1628');
              }

              // Very subtle pre-dawn lightening (only 15 min before sunrise)
              addColor(sunrise - 0.25, '#1a2646');

              // SUNRISE - Vibrant orange period
              addColor(sunrise, '#FF8C5A');
              addColor(sunrise + 0.15, '#FF9864');
              addColor(sunrise + 0.3, '#FFA46E');
              addColor(sunrise + 0.45, '#FFB078');
              addColor(sunrise + 0.6, '#FFBC82');
              addColor(sunrise + 0.75, '#FFC88C');

              // Morning golden hour to day transition
              addColor(sunrise + 1, '#EDD096');
              addColor(sunrise + 1.5, '#DCD8A0');

              // Mid-morning - transition to blue (25% through the day)
              const morningMid = sunrise + daylightDuration * 0.25;
              addColor(morningMid, '#96D8C8');
              addColor(morningMid + 0.5, '#8AD0D2');

              // Late morning (40% through the day)
              const lateMorning = sunrise + daylightDuration * 0.4;
              addColor(lateMorning, '#88C8DC');
              addColor(lateMorning + 0.25, '#87C9E3');

              // NOON - Peak bright blue (solar noon, 50% through the day)
              addColor(noon - 0.5, '#87CEEB');
              addColor(noon, '#87CEEB');
              addColor(noon + 0.5, '#88CCE9');

              // Early afternoon (60% through the day)
              const earlyAfternoon = sunrise + daylightDuration * 0.6;
              addColor(earlyAfternoon - 0.25, '#89CAE7');
              addColor(earlyAfternoon, '#8BC8E5');

              // Mid afternoon (75% through the day) - still bright
              const midAfternoon = sunrise + daylightDuration * 0.75;
              addColor(midAfternoon, '#8DC6E3');

              // Late afternoon (80% through the day) - beginning to warm
              const lateAfternoon80 = sunrise + daylightDuration * 0.80;
              addColor(lateAfternoon80, '#90C0DC');

              // Late afternoon (85% through the day) - warming more
              const lateAfternoon85 = sunrise + daylightDuration * 0.85;
              addColor(lateAfternoon85, '#94BAD8');

              // Very late afternoon (90% through the day) - transitioning to sunset colors
              const lateAfternoon90 = sunrise + daylightDuration * 0.90;
              addColor(lateAfternoon90, '#98B4D4');

              // Pre-sunset (95% through the day) - warming up significantly
              const preSunset95 = sunrise + daylightDuration * 0.95;
              addColor(preSunset95, '#A0ACD2');

              // SUNSET - Pink/purple peak
              addColor(sunset, '#FF9AD0');
              addColor(sunset + 0.15, '#F496CA');
              addColor(sunset + 0.3, '#E992C4');
              addColor(sunset + 0.45, '#DE8EBE');
              addColor(sunset + 0.6, '#D38AB8');

              // Brief dusk transition (only ~1 hour after sunset)
              addColor(sunset + 0.75, '#C086B2');
              addColor(sunset + 1, '#9A6E96');

              // Transition to deep night quickly after dusk
              addColor(sunset + 1.5, '#4e466e');
              addColor(sunset + 2, '#3b3c64');
              addColor(sunset + 2.5, '#1a2646');

              // Deep night until midnight or beyond
              if (sunset + 3 < 24) {
                addColor(sunset + 3, '#0a1628');
              }

              // Ensure we have color at hour 24 to complete the cycle
              // addColor(24, '#0a1628');

              // Sort by hour
              colors.sort((a, b) => a.hour - b.hour);

              return colors;
            };

            const hourColors = generateHourColors();

            // Create smooth segments with gradients
            for (let i = 0; i < hourColors.length - 1; i++) {
              const current = hourColors[i];
              const next = hourColors[i + 1];

              // Convert hour to angle (12 at top = -90°, then clockwise)
              // Add small overlap to prevent gaps between segments
              const overlapDegrees = 1; // Small overlap in degrees
              const currentAngle = ((current.hour - 12) * 15 - 90 - overlapDegrees) * (Math.PI / 180);
              const nextAngle = ((next.hour - 12) * 15 - 90 + overlapDegrees) * (Math.PI / 180);

              const x1 = 250 + 245 * Math.cos(currentAngle);
              const y1 = 250 + 245 * Math.sin(currentAngle);
              const x2 = 250 + 245 * Math.cos(nextAngle);
              const y2 = 250 + 245 * Math.sin(nextAngle);

              // Create gradient for this segment
              const gradientId = `grad${i}`;

              segments.push(
                <defs key={`def-${i}`}>
                  <linearGradient id={gradientId}>
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
                  filter="url(#blurFilter)"
                />
              );
            }

            return segments;
          })()}
        </g>



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
              fontSize="18"
              fontWeight="600"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                opacity: 0.95
              }}
            >
              {hour}
            </text>
          );
        })}

        {/* Sunrise marker */}
        {/* {(() => {
          const sunriseAngle = ((sunrise - 12) * 15 - 90) * (Math.PI / 180);
          const x = 250 + 220 * Math.cos(sunriseAngle);
          const y = 250 + 220 * Math.sin(sunriseAngle);
          return (
            <g>
              <circle cx={x} cy={y} r="4" fill="#FF8C5A" stroke="white" strokeWidth="1" />
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="500"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)' }}
              >
                ☀️ {sunrise.toFixed(1)}
              </text>
            </g>
          );
        })()} */}

        {/* Sunset marker */}
        {/* {(() => {
          const sunsetAngle = ((sunset - 12) * 15 - 90) * (Math.PI / 180);
          const x = 250 + 220 * Math.cos(sunsetAngle);
          const y = 250 + 220 * Math.sin(sunsetAngle);
          return (
            <g>
              <circle cx={x} cy={y} r="4" fill="#FF9AD0" stroke="white" strokeWidth="1" />
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="500"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)' }}
              >
                🌙 {sunset.toFixed(1)}
              </text>
            </g>
          );
        })()} */}
      </svg>
    </div>
  );
};
