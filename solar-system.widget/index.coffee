#CHANGE "USER" TO YOUR USERNAME/HOMEFOLDER!!!
command: "cd '/Users/deanmsmith/Library/Application\ Support/Übersicht/widgets/solar-system.widget/' && ./script.sh"

#Sets refresh rate in milliseconds
#Default = 86400000 (1 day)
refreshFrequency: 86400000

#Sets scale of sun and planets
#Default = 1
scale: 1.5

#Sets scale of asteroids
#Default = 1
scaleAsteroids: 1.5

#Sets scale of Mercury, Venus, Earth, and Mars
#Default = 23
scaleInner: 43

#Sets scale of Jupiter, Saturn, Uranus, and Neptune
#Default = 10
scaleOuter: 15

#Sets size of sun and planets globally
#Default = 1
sizeScale: 1

#Sets size of sun and planets individually
#Default for all = 5
sizes:
  sun: 48
  mercury: 10
  venus: 12
  earth: 15
  mars: 10
  jupiter: 40
  saturn: 30
  uranus: 25
  neptune: 20

style:"""
  //Sets position of widget in pixels
  position: fixed
  top: 400px
  left: 755px

  //////////////////////////////////////////////////////////////////////
  //DO NOT edit anything below this unless you know what you're doing!!!
  //////////////////////////////////////////////////////////////////////

  #sun
    position: absolute
    transform: translate(-50%,-50%)
  #asteroids
    position: absolute
    transform: translate(-50%,-50%)
  #mercury
    position: absolute
    transform: translate(-50%,-50%)
  #venus
    position: absolute
    transform: translate(-50%,-50%)
  #earth
    position: absolute
    transform: translate(-50%,-50%)    
  #mars
    position: absolute
    transform: translate(-50%,-50%)
  #jupiter
    position: absolute
    transform: translate(-50%,-50%)
  #saturn
    position: absolute
    transform: translate(-50%,-50%)
  #uranus
    position: absolute
    transform: translate(-50%,-50%)
  #neptune
    position: absolute
    transform: translate(-50%,-50%)
"""

render: ->"""
<img id="sun" src="solar-system.widget/Sun.png"/>
<img id="asteroids" src="solar-system.widget/Asteroids.png"/>
<img id="mercury" src="solar-system.widget/Mercury.png"/>
<img id="venus" src="solar-system.widget/Venus.png"/>
<img id="earth" src="solar-system.widget/Earth.png"/>
<img id="mars" src="solar-system.widget/Mars.png"/>
<img id="jupiter" src="solar-system.widget/Jupiter.png"/>
<img id="saturn" src="solar-system.widget/Saturn.png"/>
<img id="uranus" src="solar-system.widget/Uranus.png"/>
<img id="neptune" src="solar-system.widget/Neptune.png"/>
"""

update: (output, domEl) ->
  planets = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']
  asteroids = 'asteroids'  

  rows = output.split("\n")
  for row, i in rows
    x = row.split(" ")[0];  y = row.split(" ")[1]
    if i < 4
      x *= @scaleInner; y *= -@scaleInner
    else
      x *= @scaleOuter; y *= -@scaleOuter

    $("##{planets[i]}").css top: "#{y*@scale}px"
    $("##{planets[i]}").css left: "#{x*@scale}px"

  for element, size of @sizes
    $("##{element}").css height: "#{size}px"

  $("##{asteroids}").css height: "#{@scaleAsteroids*90}px"