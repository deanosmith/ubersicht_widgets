const SHOW_TEXT = true;

// This is the shell command that gets executed every time this widget refreshes
export const command = undefined;

// The refresh frequency in milliseconds (once a day)
export const refreshFrequency = 86400000;

// The CSS style for this widget, written using Emotion
// https://emotion.sh/
const textColor = "white";
const glowColor = "black";
const glowStrength = 0;

const glowStyle = () => {
	let css = "";
	for (let i = 1; i <= 7; i++) {
		css += `0 0 ${i * glowStrength}px ${i <= 2 ? textColor : glowColor}${
			i < 7 ? "," : ""
		}`;
	}
	return css;
};

const widgetHeight = 100;

export const className = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600&display=swap');

  left: 20px;
  top: 10px;

  opacity: 1;

  .widget {
    display: flex;
    flex-direction: row;
    height: ${widgetHeight}px;
    width: 400px;
  }

  h2, h4 {
    margin: 0;
  }

  img {
    height: ${widgetHeight}px;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-left: 15px;
  }

  .glow {
    color: ${textColor};
    font-family: 'Rajdhani', cursive;
    text-shadow: ${glowStyle()};
  }
`;

export const render = () => {
	const moonPhase = calculateMoonPhase(new Date());
	const phaseStr = phase_text(moonPhase);
	const phaseLabel = phaseLabels[phaseStr];
	const cycleProgress = ``;
	// ${Math.round(moonPhase * 100)}%

	return (
		<div className="widget">
			<img src={`moon-phase.widget/${phaseStr}.png`} />
			{SHOW_TEXT && (
				<div className="info glow">
					<h2>{phaseLabel}</h2>
					<h4>{cycleProgress}</h4>
				</div>
			)}
		</div>
	);
};

// Accurate moon phase calculation using simplified method
function calculateMoonPhase(date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	// Calculate the days since known new moon date
	const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14)); // Known new moon on January 6, 2000 at 18:14 UTC
	const daysSinceKnownNewMoon = (date - knownNewMoon) / 86400000; // Convert milliseconds to days

	// Calculate the number of synodic months since the known new moon
	const synodicMonth = 29.53058867; // Average length of a synodic month
	const numberOfSynodicMonths = daysSinceKnownNewMoon / synodicMonth;

	// Calculate the current phase as a fraction of the synodic month
	const phase = numberOfSynodicMonths - Math.floor(numberOfSynodicMonths);

	return phase;
}

function phase_text(phase) {
	if (phase <= 0.0625 || phase > 0.9375) {
		return "phase_new";
	} else if (phase <= 0.1875) {
		return "phase_waxing_crescent";
	} else if (phase <= 0.3125) {
		return "phase_first_quarter";
	} else if (phase <= 0.4375) {
		return "phase_waxing_gibbous";
	} else if (phase <= 0.5625) {
		return "phase_full";
	} else if (phase <= 0.6875) {
		return "phase_waning_gibbous";
	} else if (phase <= 0.8125) {
		return "phase_third_quarter";
	} else {
		return "phase_waning_crescent";
	}
}

const phaseLabels = {
	phase_new: "New Moon",
	phase_waxing_crescent: "Waxing Crescent Moon",
	phase_first_quarter: "First Quarter Moon",
	phase_waxing_gibbous: "Waxing Gibbous Moon",
	phase_full: "Full Moon",
	phase_waning_gibbous: "Waning Gibbous Moon",
	phase_third_quarter: "Third Quarter Moon",
	phase_waning_crescent: "Waning Crescent Moon",
};
