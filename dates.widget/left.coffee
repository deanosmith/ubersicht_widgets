# Übersicht widget to count days until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2025-12-23" "+%s") # Replace with your target date
  currentDate=$(date "+%s")
  daysLeft=$(( ($targetDate - $currentDate) / 86400 ))
  echo $daysLeft
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh once every day

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-6);
  }
"""

render: (output) ->
  [daysLeft] = output.split(',').map(Number)
  """
    <div class="mast-chip" style="--accent: #ff6b6b">
      <span class="mast-icon">🎄</span>
      <span class="mast-group">#{daysLeft}<span class="mast-unit">d</span></span>
      <span class="mast-unit accent">to go</span>
    </div>
  """
