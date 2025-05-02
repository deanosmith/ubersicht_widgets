# Übersicht widget .coffee file
command: """
  echo $(osascript -e 'return (current date)')
"""

refreshFrequency: 1000 * 60 * 60 * 24 # Refresh once every 1 days

style: """
  #progress-container {
    position: relative;
    margin-left: 25px;
    margin-top: 120px;
    width: 200px;
    height: 20px;
    background-color: grey;
    border-radius: 4px;
    border: 2px solid grey;
    overflow: hidden;
    color: white; /* Set the text color for the progress bar here */
    font-family: Arial, sans-serif;
    font-size: 14px; /* Adjust the font size to fit inside the progress bar */
    line-height: 20px; /* Align the line height with the progress bar's height for vertical centering */
    text-align: left; /* Align text to the center */
  }

  #progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: black;
    transition: width 0.5s ease-in-out;
    z-index: 1; /* Ensure the progress bar is below the text */
  }

  .marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: black;
    z-index: 2; /* Ensure markers are above the progress bar but below the text */
  }

  .progress-text {
    position: absolute;
    width: 100%;
    padding: 0px 5px
    z-index: 3; /* Ensure the text is above the progress bar and markers */
  }
"""

render: (output) ->
  today = new Date()
  yearStart = new Date(today.getFullYear(), 0, 1)
  yearEnd = new Date(today.getFullYear(), 11, 31)
  daysInYear = (yearEnd - yearStart) / (1000 * 60 * 60 * 24) + 1
  daysElapsed = (today - yearStart) / (1000 * 60 * 60 * 24)
  progress = parseFloat(((daysElapsed / daysInYear) * 100).toFixed(1));
  markersHTML = for i in [1..9]
    "<div class='marker' style='left: #{i * 10}%'></div>"
  markersHTML = markersHTML.join ''

  """
    <div id="progress-container">
      <div id="progress-bar" style="width: #{progress}%;"></div>
      #{markersHTML}
      <span class='progress-text' style='z-index: 3;'>#{progress}%</span> <!-- Text is brought to front with z-index -->
    </div>
  """
