# Based on Uptime Pro by Mike Pennella (github.com/mpen01/uptime_pro)

command: """
  uptime | awk '{ if (/day/) { print $3 }
                          else { print 0 } }' && scutil --get ComputerName
"""

# Update uptime every 6 hours
refreshFrequency: 21600000

style: """
  .mast-chip {
    margin-left: var(--mast-left);
    margin-top: var(--mast-row-2);
  }
"""

render: (output) ->
  uptime = (output or '').split("\n")[0].trim()
  value = if uptime isnt '' then "#{uptime}<span class='mast-unit'>d</span>" else "<span class='mast-unit'>n/a</span>"
  """
    <div class="mast-chip" style="--accent: #6ff0b0">
      <span class="mast-icon">⏻</span>
      <span class="mast-group">#{value}</span>
      <span class="mast-unit accent">up</span>
    </div>
  """
