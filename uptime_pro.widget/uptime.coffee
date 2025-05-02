#-----------------------------------------------------------------------#
#                                                                       #
# Uptime Pro for Übersicht                                              #
#                                                                       #
# Created July 2018 by Mike Pennella (github.com/mpen01/uptime_pro)     #
#                                                                       #
# Change the theme variable below to style the widget                   #
# THEME OPTIONS: mono, paper, color or dark (default is color)          #
# STYLE OPTIONS: min or full                                            #
theme       = 'color'                                                   #
style       = 'min'                                                     #
#                                                                       #
# POSITION WIDGET ON SCREEN                                             #
pos_top     = '155px'                                                   #
pos_left    = '25px'                                                    #
#                                                                       #
#-----------------------------------------------------------------------#

command: """
  uptime | awk '{ if (/day/) { print $3 }
                          else { print 0 } }' && scutil --get ComputerName
"""

# Update uptime every 6 hours
refreshFrequency: 21600000

style: """
  top:    #{pos_top}
  left:   #{pos_left}
  font-family: Helvetica Neue
  color: white

  div
    display: block
    border-radius: 5px
    background: black
    font-size: 16px
    border: 2px solid grey
    font-weight: 400
    opacity: 1
    padding: 6px 5px

  .uptime
    font-size: 15px
    font-weight: normal /* Set to normal weight */
    color: white
    margin: 3px
"""

render: -> """
  <div>
    <span class='uptime'></span>
  </div>
"""

update: (output, domEl) ->
  values        = output.split("\n")
  uptime        = values[0]
  div           = $(domEl)

  if (uptime != '')
    div.find('.uptime').html("Uptime: #{uptime} days")
  else
    div.find('.uptime').html('Uptime is not available')
