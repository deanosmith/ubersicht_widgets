# Übersicht widget .coffee file
command: """
  echo $(osascript -e 'return (current date)')
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every 1 days

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-1);
    padding-left: 12px;
    gap: 10px;
  }
"""

render: (output) ->
  today = new Date()
  yearStart = new Date(today.getFullYear(), 0, 1)
  yearEnd = new Date(today.getFullYear(), 11, 31)
  daysInYear = (yearEnd - yearStart) / (1000 * 60 * 60 * 24) + 1
  daysElapsed = (today - yearStart) / (1000 * 60 * 60 * 24)
  progress = parseFloat(((daysElapsed / daysInYear) * 100).toFixed(1));
  ticksHTML = ("<div class='mast-tick' style='left: calc(#{q}% - 1px)'></div>" for q in [25, 50, 75]).join ''

  """
    <div class="mast-chip" style="--accent: #7cc4ff">
      <span class="mast-unit accent">#{today.getFullYear()}</span>
      <div class="mast-track">
        <div class="mast-fill" style="width: #{progress}%"></div>
        #{ticksHTML}
      </div>
      <span class="mast-group">#{progress}<span class="mast-unit">%</span></span>
    </div>
  """
