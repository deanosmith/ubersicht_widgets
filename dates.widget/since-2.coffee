command: """
  python3 - <<'PY'
from datetime import date
import calendar

target = date(2025, 8, 10)
today = date.today()

if today < target:
    months = 0
    remaining_days = 0
else:
    # Count completed months by comparing year/month and adjusting when the day has not been reached yet.
    months = (today.year - target.year) * 12 + (today.month - target.month)
    if today.day < target.day:
        months -= 1

    def add_months(d, months):
        # Keep the day aligned when possible, otherwise clamp to the end of the target month.
        year = d.year + (d.month - 1 + months) // 12
        month = (d.month - 1 + months) % 12 + 1
        day = min(d.day, calendar.monthrange(year, month)[1])
        return date(year, month, day)

    anchor = add_months(target, months)
    remaining_days = (today - anchor).days

print(f"{months}.{remaining_days}")
PY
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh once every day

render: (output) ->
  [months, days] = output.trim().split('.')
  days = if days.length == 1 then "0#{days}" else days
  """
    <div id="countdown-container">
      🐘 #{months}.#{days} Months
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