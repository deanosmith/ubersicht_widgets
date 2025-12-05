// Sky Clock Widget for Übersicht
// A visual 24-hour clock with sky colors representing time of day

// No need to refresh - this is a static visual representation
export const refreshFrequency = false;

// Fetch sunrise and sunset times for Copenhagen
export const command = `
python3 -c '
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
    
    sunrise_local = sunrise_utc.astimezone(ZoneInfo("Europe/Copenhagen"))
    sunset_local = sunset_utc.astimezone(ZoneInfo("Europe/Copenhagen"))
    
    # Output as decimal hours (e.g., 8.5 for 8:30)
    sunrise_hour = sunrise_local.hour + sunrise_local.minute / 60.0
    sunset_hour = sunset_local.hour + sunset_local.minute / 60.0
    
    print(json.dumps({"sunrise": sunrise_hour, "sunset": sunset_hour}))
except Exception as e:
    # Default values if API fails (winter in Copenhagen)
    print(json.dumps({"sunrise": 8.5, "sunset": 15.5}))
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
    // Use defaults
  }

  const { sunrise, sunset } = sunTimes;

  return (
    <div className="clock-container">
      <svg className="clock-face" viewBox="0 0 500 500">
        <defs>
          {/* Blur filter for smooth transitions */}
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
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

              // NIGHT COLORS - Deep darkness dominates winter
              // Midnight (0:00)
              addColor(0, '#0a1628');
              addColor(1, '#0c1a2e');
              addColor(2, '#0e1d34');
              addColor(3, '#10203a');
              addColor(4, '#122340');
              addColor(5, '#142646');
              addColor(6, '#16294c');
              addColor(7, '#182c52');

              // Pre-sunrise transition (1 hour before)
              const preSunrise = sunrise - 0.5;
              addColor(preSunrise, '#1a2f58');

              // SUNRISE - Brief orange/golden period
              addColor(sunrise, '#FF8C5A');           // Sunrise orange
              addColor(sunrise + 0.25, '#FFA070');
              addColor(sunrise + 0.5, '#FFB488');

              // Morning - transition to day
              addColor(sunrise + 1, '#D4C896');
              addColor(sunrise + 1.5, '#B0D4AA');

              // Mid-morning to noon
              addColor(10, '#90C8D0');
              addColor(11, '#88C6DD');

              // NOON - Peak daylight (bright blue)
              addColor(12, '#87CEEB');
              addColor(13, '#88CAE8');

              // Afternoon
              addColor(14, '#90C0E0');

              // Pre-sunset transition
              const preSunset = sunset - 0.5;
              addColor(preSunset, '#A8AACC');

              // SUNSET - Pink/purple/orange
              addColor(sunset, '#FF9AD0');            // Sunset pink
              addColor(sunset + 0.25, '#E090C0');
              addColor(sunset + 0.5, '#C088B0');

              // Dusk - quick transition to night
              addColor(sunset + 1, '#6B5B88');
              addColor(sunset + 1.5, '#453d68');
              addColor(sunset + 2, '#2f3050');

              // Back to deep night
              addColor(18, '#1e2642');
              addColor(19, '#1a2438');
              addColor(20, '#16222e');
              addColor(21, '#142028');
              addColor(22, '#121e24');
              addColor(23, '#101c22');
              addColor(24, '#0a1628');

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
              const currentAngle = ((current.hour - 12) * 15 - 90) * (Math.PI / 180);
              const nextAngle = ((next.hour - 12) * 15 - 90) * (Math.PI / 180);

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
      </svg>
    </div>
  );
};
