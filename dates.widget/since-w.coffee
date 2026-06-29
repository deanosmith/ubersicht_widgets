command: """
  python3 - <<'PY'
from datetime import date

target = date(2026, 4, 19)
today = date.today()

if today < target:
    weeks = 0
else:
    weeks = (today - target).days // 7

print(weeks)
PY
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every 12 hours

render: (output) ->
  weeks = output.trim()
  """
    <div id="countdown-container">
      🌱 #{weeks} Weeks
    </div>
  """
style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 297px;
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