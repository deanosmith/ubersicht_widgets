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
  """
    <div class="mast-chip" style="--accent: #8be36b">
      <span class="mast-icon">🌱</span>
      <span class="mast-group">#{weeks}<span class="mast-unit">wk</span></span>
      <span class="mast-group">#{days}<span class="mast-unit">d</span></span>
    </div>
  """
style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-6);
  }
"""