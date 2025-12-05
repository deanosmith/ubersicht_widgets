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

              // Pre-sunrise - subtle lightening
              addColor(sunrise - 1, '#1a2646');
              addColor(sunrise - 0.75, '#1c2848');
              addColor(sunrise - 0.5, '#1e2a4a');
              addColor(sunrise - 0.25, '#202c4e');

              // SUNRISE - Vibrant orange period
              addColor(sunrise, '#FF8C5A');
              addColor(sunrise + 0.15, '#FF9864');
              addColor(sunrise + 0.3, '#FFA46E');
              addColor(sunrise + 0.45, '#FFB078');
              addColor(sunrise + 0.6, '#FFBC82');
              addColor(sunrise + 0.75, '#FFC88C');

              // Morning golden hour to day transition
              addColor(sunrise + 1, '#EDD096');
              addColor(sunrise + 1.25, '#DCD8A0');
              // addColor(sunrise + 1.5, '#CBE0AA');
              // addColor(sunrise + 1.75, '#BAE8B4');

              // Mid-morning - transition to blue
              // addColor(9.5, '#A8E0BE');
              addColor(10, '#96D8C8');
              addColor(10.5, '#8AD0D2');
              addColor(11, '#88C8DC');
              addColor(11.5, '#87C9E3');

              // NOON - Peak bright blue
              addColor(12, '#87CEEB');
              addColor(12.5, '#88CCE9');
              addColor(13, '#89CAE7');
              addColor(13.5, '#8BC8E5');

              // Afternoon - maintaining brightness
              addColor(14, '#8DC6E3');
              addColor(14.5, '#90C4E0');

              // Pre-sunset - warming up
              // addColor(sunset - 1, '#95BCDC');
              // addColor(sunset - 0.75, '#9CB4D8');
              // addColor(sunset - 0.5, '#A4ACD4');
              addColor(sunset - 0.25, '#ACA4D0');

              // SUNSET - Pink/purple peak
              addColor(sunset, '#FF9AD0');
              addColor(sunset + 0.15, '#F496CA');
              addColor(sunset + 0.3, '#E992C4');
              addColor(sunset + 0.45, '#DE8EBE');
              addColor(sunset + 0.6, '#D38AB8');

              // Dusk - transitioning to night
              // addColor(sunset + 0.8, '#C086B2');
              // addColor(sunset + 1, '#AD7CA0');
              // addColor(sunset + 1.25, '#9A72A0');
              // addColor(sunset + 1.5, '#876896');
              // addColor(sunset + 1.75, '#745E8C');
              // addColor(sunset + 2, '#615482');

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
      </svg>
    </div>
  );
};
