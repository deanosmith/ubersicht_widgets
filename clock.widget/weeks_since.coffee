# Übersicht widget to count days until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2025-08-10" "+%s") # Replace with your target date
  currentDate=$(date "+%s")
  daysSince=$(( ($currentDate - $targetDate) / 86400 ))
  monthsSince=$(echo "scale=1; $daysSince / 30.44" | bc)
  echo $monthsSince
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
  monthsSince = parseFloat(output).toFixed(1)
  """
    <div id="countdown-container">
      🐘 #{monthsSince} Months
    </div>
  """
