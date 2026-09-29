command: """
  python3 - <<'PY'
from datetime import date
import calendar

target = date(2026, 10, 31)
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
  """
    <div class="mast-chip" style="--accent: #ff6b6b">
      <span class="mast-icon">🏁</span>
      <span class="mast-group">#{weeks}<span class="mast-unit">wk</span></span>
      <span class="mast-sep"></span>
      <span class="mast-group">#{days}<span class="mast-unit">d</span></span>
      <span class="mast-unit accent">to go</span>
    </div>
  """

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-6);
  }
"""