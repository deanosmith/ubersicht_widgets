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

  let sunset = 18;  // Default fallback
  let sunrise = 6;  // Default fallback

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
      <svg className="clock-face" viewBox="0 0 500 500">
        <defs>
          {/* Blur filter for smooth transitions */}
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" />
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

              // Calculate the daylight duration
              const daylightDuration = sunset - sunrise;

              // Calculate noon as midpoint between sunrise and sunset
              const noon = (sunrise + sunset) / 2;

              // NO COLORS FOR NIGHT - The dark background will show naturally
              // We only add colors for the daylight period and brief twilight periods

              // Very subtle pre-dawn (15 minutes before sunrise)
              addColor(sunrise * .9, '#ff8c5a9e');
              // addColor(sunrise * .8, '#ff8c5a92');
              // addColor(sunrise * .7, '#ff8c5a92');
              // addColor(sunrise * .4, '#ff8c5a92');
              // addColor(sunrise * .5, '#ff8c5a92');

              // addColor(sunrise + noonToSunsetPhase * 0.1, '#F496CA');


              // === SUNRISE PHASE === 
              // This phase is fixed duration but scales with day length
              // For very short days, we'll compress this slightly
              const sunrisePhase = Math.min(1.5, daylightDuration * 0.15); // 15% of daylight or max 1.5 hours

              addColor(sunrise, '#FF8C5A');
              addColor(sunrise + sunrisePhase * 0.1, '#FF9864');
              addColor(sunrise + sunrisePhase * 0.2, '#FFA46E');
              addColor(sunrise + sunrisePhase * 0.3, '#FFB078');
              addColor(sunrise + sunrisePhase * 0.4, '#FFBC82');
              addColor(sunrise + sunrisePhase * 0.5, '#FFC88C');
              addColor(sunrise + sunrisePhase * 0.67, '#EDD096');
              addColor(sunrise + sunrisePhase, '#DCD8A0');

              // === MORNING TO NOON TRANSITION ===
              // Transition from golden hour to blue sky
              const morningStart = sunrise + sunrisePhase;
              const morningToNoon = noon - morningStart;

              addColor(morningStart + morningToNoon * 0.1, '#96D8C8');
              addColor(morningStart + morningToNoon * 0.3, '#8AD0D2');
              addColor(morningStart + morningToNoon * 0.5, '#88C8DC');
              addColor(morningStart + morningToNoon * 0.7, '#87C9E3');
              addColor(morningStart + morningToNoon * 0.9, '#87CEEB');

              // === NOON - PEAK BLUE SKY ===
              addColor(noon, '#87CEEB');

              // === NOON TO SUNSET TRANSITION ===
              // Blue sky transitioning to warmer sunset colors
              const noonToSunsetPhase = Math.min(1.5, daylightDuration * 0.15); // 15% of daylight or max 1.5 hours
              const sunsetStart = sunset - noonToSunsetPhase;
              const noonToSunsetDuration = sunsetStart - noon;

              addColor(noon + noonToSunsetDuration * 0.1, '#88CCE9');
              addColor(noon + noonToSunsetDuration * 0.3, '#89CAE7');
              addColor(noon + noonToSunsetDuration * 0.5, '#8BC8E5');
              addColor(noon + noonToSunsetDuration * 0.7, '#8DC6E3');
              addColor(noon + noonToSunsetDuration * 0.85, '#90C0DC');
              addColor(noon + noonToSunsetDuration * 0.95, '#94BAD8');

              // Late afternoon warming
              addColor(sunsetStart, '#98B4D4');
              addColor(sunsetStart + noonToSunsetPhase * 0.33, '#A0ACD2');

              // === SUNSET PHASE ===
              addColor(sunset, '#FF9AD0');
              addColor(sunset + noonToSunsetPhase * 0.1, '#F496CA');
              addColor(sunset + noonToSunsetPhase * 0.2, '#E992C4');
              addColor(sunset + noonToSunsetPhase * 0.3, '#DE8EBE');
              addColor(sunset + noonToSunsetPhase * 0.4, '#d38ab8ff');
              // addColor(sunset + noonToSunsetPhase * 0.5, '#C086B2');
              // addColor(sunset + noonToSunsetPhase * 0.67, '#9A6E96');

              // === DUSK TRANSITION TO NIGHT ===
              // Quick transition to darkness
              // addColor(sunset + noonToSunsetPhase, '#4e466e');
              // addColor(sunset + noonToSunsetPhase + 0.5, '#3b3c64');
              // addColor(sunset + noonToSunsetPhase + 1, '#1a2646');

              // NO MORE COLORS ADDED - Night will show as dark background

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


        {(() => {
          // Stars generation
          const stars = [];
          // Deterministic random generator for consistent star positions across renders
          let seed = 1;
          const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };

          // Generate stars
          for (let i = 0; i < 70; i++) {
            const angleDeg = random() * 360; // 0 to 360 degrees
            const r = random() * 245; // Within circle radius

            // Convert angle to hour to check if it's night time
            // Angle 0 is 6pm (sunset position in our logic below), but let's map standard clock angle
            // Our angles in drawing: -90 is 12pm, 90 is 12am. 
            // 180 is 6am, 0 is 6pm.

            // Let's normalize angle to 0-360 starting from -90 (noon)
            // Or easier: check if the star's angle falls within the night arc.

            // Sunrise/Sunset angles calculated same as hands
            const sunriseAngleDeg = (sunrise - 12) * 15 - 90;
            const sunsetAngleDeg = (sunset - 12) * 15 - 90;

            // Normalize angles to 0-360 range for easier comparison if needed, 
            // but our hands use linear angles.
            // Night is from Sunset clockwise to Sunrise.
            // In degrees from -90 (noon):
            // Sunset is roughly 0 to 90 range.
            // Sunrise is roughly 180 to 270 range.
            // Midnight is 90.

            // We need to map the random angle -90 to 270 to match our clock face
            // Actually we generated 0-360. Let's shift it to align with clock rotation
            const starAngle = angleDeg - 90;

            // Check if star is in the night segment
            // Night is between sunsetAngle and sunriseAngle (crossing midnight)
            // Since we go clockwise: Sunset -> Midnight -> Sunrise

            let isNight = false;
            if (sunriseAngleDeg < sunsetAngleDeg) {
              // This is weird, typically sunset (e.g. 18:00) is 'larger' hour than sunrise (06:00),
              // but we are on a 24h clock where 18 > 6.
              // Wait, on the circle:
              // -90deg is 12:00
              // 90deg is 24:00/00:00
              // Sunset (18:00) is 0deg
              // Sunrise (06:00) is 180deg

              // So night is from 0deg (Sunset) to 180deg (Sunrise) passing through 90deg.
              // Range: > SunsetAngle AND < SunriseAngle ? No.

              // Let's use simple logic:
              // If angle is > sunsetAngle OR angle < sunriseAngle?
              // Since sunset is approx 0deg and sunrise is approx 180deg.
              // We want the bottom half.

              // Let's handle generic cases:
              // Case 1: Sunset < Sunrise (e.g. 0deg to 180deg) -> standard run
              // Case 2: Sunset > Sunrise (e.g. crossing the wrap-around point if we used 0-360)

              // In our coordinate system (-90 at top):
              // Sunset is around 0. Sunrise is around 180.
              // Night is angle > sunset AND angle < sunrise.
              if (starAngle > sunsetAngleDeg && starAngle < sunriseAngleDeg) {
                isNight = true;
              }
            } else {
              // This shouldn't happen for standard day/night on this projection unless crazy latitude
              // But safe fallback logic could be added
              if (starAngle > sunsetAngleDeg || starAngle < sunriseAngleDeg) {
                isNight = true;
              }
            }

            if (isNight) {
              const x = 250 + r * Math.cos(starAngle * Math.PI / 180);
              const y = 250 + r * Math.sin(starAngle * Math.PI / 180);
              const size = random() * 1.5 + 0.5;
              const opacity = random() * 0.5 + 0.3;
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
              fontSize="18"
              fontWeight="600"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              style={{
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)',
                opacity: 0.95
              }}
            >
              {hour}
            </text>
          );
        })}

        {/* Sunrise tick mark */}
        {(() => {
          const sunriseAngle = ((sunrise - 12) * 15 - 90) * (Math.PI / 180);
          // Start near edge, end at edge
          const x1 = 250 + 225 * Math.cos(sunriseAngle);
          const y1 = 250 + 225 * Math.sin(sunriseAngle);
          const x2 = 250 + 245 * Math.cos(sunriseAngle);
          const y2 = 250 + 245 * Math.sin(sunriseAngle);
          return (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffffffff"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ opacity: 0.9 }}
            />
          );
        })()}

        {/* Sunset tick mark */}
        {(() => {
          const sunsetAngle = ((sunset - 12) * 15 - 90) * (Math.PI / 180);
          // Start near edge, end at edge
          const x1 = 250 + 225 * Math.cos(sunsetAngle);
          const y1 = 250 + 225 * Math.sin(sunsetAngle);
          const x2 = 250 + 245 * Math.cos(sunsetAngle);
          const y2 = 250 + 245 * Math.sin(sunsetAngle);
          return (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffffffff"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ opacity: 0.9 }}
            />
          );
        })()}
      </svg>
    </div >
  );
};
