command: """
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

    print(sunrise_local.strftime("%H:%M"), sunset_local.strftime("%H:%M"))
except Exception:
    print("🔴 Error 🔴")
  '
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every day

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-3);
  }
"""

render: (output) ->
  times = (output or "").trim().split(" ")
  body = if times.length is 2 and /^\d\d:\d\d$/.test(times[0])
    """
      <span class="mast-group">#{times[0]}<span class="mast-unit">↑</span></span>
      <span class="mast-sep"></span>
      <span class="mast-group">#{times[1]}<span class="mast-unit">↓</span></span>
    """
  else
    "<span class='mast-unit'>no data</span>"
  """
    <div class="mast-chip" style="--accent: #ffb547">
      <span class="mast-icon">☀︎</span>
      #{body}
    </div>
  """
