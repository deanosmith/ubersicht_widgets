command: """
  python3 - <<'PY'
from datetime import date
import calendar

target = date(2026, 2, 1)
today = date.today()

if today >= target:
    total_weeks = 0
    total_days = 0
else:
    # Calculate total days remaining
    delta = target - today
    total_days = delta.days
    total_weeks = total_days // 7

print(f"{total_weeks}.{total_days}")
PY
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every day

render: (output) ->
  [weeks, days] = output.trim().split('.')
  days = if days.length == 1 then "0#{days}" else days
  """
    <div id="countdown-container">
      🏝️ #{weeks} : #{days}
    </div>
  """
style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 385px;
    background-color: black;
    border-radius: 8px;
    border: 2px solid grey;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 15px;
    padding: 3px 6px
    text-align: center; /* Align text horizontally */
    display: inline-block; /* Make the container size dynamic based on text */
  }
"""