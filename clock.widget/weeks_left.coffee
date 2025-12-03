# Übersicht widget to count weeks until a specific date
command: """
  targetDate=$(date -j -f "%Y-%m-%d" "2026-05-02" "+%s")
  currentDate=$(date "+%s")
  weeksLeft=$(echo "($targetDate - $currentDate) / (86400 * 7)" | bc)
  echo $weeksLeft
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh twice a day

style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 430px;
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
  [weeksLeft] = output.split(',').map(Number)
  """
    <div id="countdown-container">
      🏁 #{weeksLeft} Weeks
    </div>
  """
