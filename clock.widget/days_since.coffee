# Übersicht widget to count days until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2025-05-20" "+%s") # Replace with your target date
  currentDate=$(date "+%s")
  daysUntil=$(( ($currentDate - $targetDate) / 86400 ))
  echo $daysUntil
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh once every day

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

render: (output) ->
  [daysUntil] = output.split(',').map(Number)
  """
    <div id="countdown-container">
      🩼󠁮󠁧󠁿 #{daysUntil} days
    </div>
  """
