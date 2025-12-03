# Übersicht widget to count days until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2025-08-10" "+%s")
  currentDate=$(date "+%s")
  daysSince=$(( ($currentDate - $targetDate) / 86400 ))
  months=$(( $daysSince / 31 ))
  remainingDays=$(( $daysSince % 31 + 1 ))
  echo "$months.$remainingDays"
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