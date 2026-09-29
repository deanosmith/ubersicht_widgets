# Übersicht widget to count full months and remaining days since a specific date
command: """
  python3 - <<'PY'
from datetime import date
import calendar

target = date(2025, 6, 2)
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
  """
    <div class="mast-chip" style="--accent: #c9a7ff">
      <span class="mast-icon">🐘</span>
      <span class="mast-group">#{months}<span class="mast-unit">mo</span></span>
      <span class="mast-group">#{days}<span class="mast-unit">d</span></span>
    </div>
  """

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-4);
  }
"""
