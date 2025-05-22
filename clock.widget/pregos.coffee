# Übersicht widget to count days until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2024-11-04" "+%s") # Replace with your target date
  currentDate=$(date "+%s")
  weeksSince=$(echo "($currentDate - $targetDate + 302400) / 604800" | bc)
  echo $weeksSince
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh once every day

style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 255px;
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
  $weeksSince = parseFloat(output)
  """
    <div id="countdown-container">
      ☃︎󠁧󠁿 #{$weeksSince} weeks
    </div>
  """
