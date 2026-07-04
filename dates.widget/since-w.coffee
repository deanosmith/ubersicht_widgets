command: """
  python3 - <<'PY'
from datetime import date

target = date(2026, 4, 19)
today = date.today()

if today < target:
    weeks = 0
    remaining_days = 0
else:
    total_days = (today - target).days
    weeks = total_days // 7
    remaining_days = total_days % 7

print(f"{weeks}.{remaining_days}")
PY
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every 12 hours

render: (output) ->
  [weeks, days] = output.trim().split('.')
  days = if days.length == 1 then "0#{days}" else days
  """
    <div id="countdown-container">
      🌱 #{weeks}.#{days} Weeks
    </div>
  """
style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 340px;
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