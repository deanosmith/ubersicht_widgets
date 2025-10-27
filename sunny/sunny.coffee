command: """
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

    # Print times in 12-hour format without AM/PM
    print(sunrise_local.strftime("%I:%M"), sunset_local.strftime("%I:%M"))
except Exception:
    print("🔴 Error 🔴")
  '
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every day

style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 195px;
    background-color: black;
    border-radius: 6px;
    border: 2px solid grey;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 15px;
    padding: 4px 6px;
    text-align: left; /* Align text horizontally */
    display: inline-block; /* Make the container size dynamic based on text */
  }
"""

render: (output) ->
  cleaned = (output or "").trim()
  return """
    <div id="countdown-container">
      Loading Error
    </div>
  """ if cleaned == "" or cleaned == "Loading Error"

  times = cleaned.split(" ")
  return """
    <div id="countdown-container">
      Loading Error
    </div>
  """ if times.length < 2

  sunrise = times[0]
  sunset = times[1]
  """
    <div id="countdown-container">
      ☀ #{sunrise}<br/>
      ☼ #{sunset}<br/>
    </div>
  """
