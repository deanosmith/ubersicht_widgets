# Übersicht widget to count days until a specific date
command: """
  target="2026-02-01" # Default target date
  json_file="$HOME/Library/Application Support/Übersicht/widgets/clock.widget/dates.json"
  if [ -f "$json_file" ]; then
    candidate=$(cat "$json_file" | grep '"days_since"' | sed 's/.*"days_since": *"\\([^"]*\\)".*/\\1/')
    if [ -n "$candidate" ]; then
      target_ts=$(date -j -f "%Y-%m-%d" "$candidate" "+%s" 2>/dev/null)
      if [ $? -eq 0 ]; then
        target="$candidate"
      else
        target_ts=""
      fi
    fi
  fi
  if [ -z "$target_ts" ]; then
    target_ts=$(date -j -f "%Y-%m-%d" "$target" "+%s")
  fi
  current_ts=$(date "+%s")
  days_since=$(( ($current_ts - $target_ts) / 86400 ))
  echo "$days_since,$target"
"""

refreshFrequency: 1000 * 60 * 60 * 12 # Refresh once every day

style: """
  #countdown-container {
    position: relative;
    margin-left: 25px;
    margin-top: 385px;
    background-color: black;
    border-radius: 8px;
    border: 2px solid grey;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 15px;
    padding: 3px 6px;
    text-align: center; /* Align text horizontally */
    display: inline-block; /* Make the container size dynamic based on text */
    cursor: pointer; /* Indicate clickable */
  }

  #countdown-container input[type="date"] {
    background: black;
    color: white;
    border: none;
    font-size: 15px;
    text-align: center;
  }
"""

render: (output) ->
  [daysSince, target] = output.split(',')
  daysSince = Number(daysSince)
  """
    <div id="countdown-container" data-target="#{target}">
      🐘 #{daysSince} Days
    </div>
  """

afterRender: (domEl) ->
  container = domEl.querySelector('#countdown-container')
  originalHTML = container.innerHTML

  container.addEventListener 'click', (e) =>
    target = container.dataset.target
    input = document.createElement('input')
    input.type = 'date'
    input.value = target

    container.innerHTML = ''
    container.appendChild(input)
    input.focus()

    restore = =>
      container.innerHTML = originalHTML

    save = =>
      newTarget = input.value
      if newTarget && newTarget isnt target
        updateCmd = """
          json_file="$HOME/Library/Application Support/Übersicht/widgets/clock.widget/dates.json"
          if [ -f "$json_file" ]; then
            # Read current JSON, update days_since, write back
            cat "$json_file" | sed 's/"days_since": *"[^"]*"/"days_since": "#{newTarget}"/g' > "$json_file.tmp"
            mv "$json_file.tmp" "$json_file"
          else
            echo '{"days_since": "#{newTarget}", "days_left": "2025-09-23"}' > "$json_file"
          fi
          echo "Updated to #{newTarget}"
        """
        @run updateCmd, (err, output) =>
          if err
            console.error "Error saving target date: #{err}"
            restore()
          else
            console.log "Target date saved successfully: #{newTarget}"
            console.log "Command output:", output
            refreshCmd = """osascript -e 'tell application id "tracesOf.Uebersicht" to refresh widget id "clock.widget-index-coffee"'"""
            @run refreshCmd, (refreshErr, refreshOutput) =>
              if refreshErr
                console.error "Error refreshing widget: #{refreshErr}"
      else
        restore()

    input.addEventListener 'change', save
    input.addEventListener 'blur', restore
    input.addEventListener 'keydown', (e) =>
      if e.key is 'Enter'
        e.preventDefault()
        save()
      else if e.key is 'Escape'
        e.preventDefault()
        restore()