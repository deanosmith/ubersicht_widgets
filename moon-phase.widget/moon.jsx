// // Moon phase widget for Übersicht
// // by Volker Wieban (https://github.com/hpcodecraft)
// // Version 1.0
//
//
// const SHOW_TEXT = true;
//
//
// // this is the shell command that gets executed every time this widget refreshes
// export const command = undefined;
//
//
// // the refresh frequency in milliseconds
// export const refreshFrequency = 86400000;
//
//
// // the CSS style for this widget, written using Emotion
// // https://emotion.sh/
//
//
// const textColor = "white";
// const glowColor = "black";
// const glowStrength = 0;
//
//
// const glowStyle = () => {
//   let css = "";
//   for (let i = 1; i <= 7; i++) {
//     css += `0 0 ${i * glowStrength}px ${i <= 2 ? textColor : glowColor}${
//       i < 7 ? "," : ""
//     }`;
//   }
//   return css;
// };
//
//
// // const widgetHeight = 64;
// const widgetHeight = 100;
//
//
// export const className = `
//   @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600&display=swap');
//
//   left: 20px;
//   top: 10px;
//
//   opacity: 0.85;
//
//   .widget {
//     display: flex;
//     flex-direction: row;
//     height: ${widgetHeight}px;
//     width: 400px;
//   }
//
//   h2, h4{
//     margin: 0;
//   }
//
//   img {
//     height: ${widgetHeight}px;
//   }
//
//   .info {
//     display: flex;
//     flex-direction: column;
//     justify-content: space-evenly;
//     margin-left: 15px;
//   }
//
//   .glow {
//     color: ${textColor};
//     font-family: 'Rajdhani', cursive;
//     text-shadow: ${glowStyle()};
//   }
// `;
//
//
// export const render = () => {
// 	const phase = moon_day(new Date());
// 	console.log("Phase value:", phase); // Log phase value for debugging
// 	const phaseStr = phase_text(phase);
// 	const phaseLabel = phaseLabels[phaseStr];
// 	const cycleProgress = `${Math.round(phase * 100)}%`;
//
// 	return (
// 		<div className="widget">
// 			<img src={`moon-phase.widget/${phaseStr}.png`} />
// 			{SHOW_TEXT && (
// 				<div className="info glow">
// 					<h2>{phaseLabel}</h2>
// 					<h4>{cycleProgress}</h4>
// 				</div>
// 			)}
// 		</div>
// 	);
// };
//
//
// // Moon phase calculations taken from https://github.com/tingletech/moon-phase
// Date.prototype.getJulian = function () {
//   return this / 86400000 - this.getTimezoneOffset() / 1440 + 2440587.5;
// };
//
//
// function moon_day(today) {
//     const GetFrac = (fr) => fr - Math.floor(fr);
//     const thisJD = today.getJulian();
//     const year = today.getFullYear();
//     const degToRad = Math.PI / 180;
//     let K0, T, T2, T3, J0, F0, M0, M1, B1, oldJ;
//     K0 = Math.floor((year - 1900) * 12.3685);
//     T = (year - 1899.5) / 100;
//     T2 = T * T;
//     T3 = T2 * T;
//     J0 = 2415020 + 29 * K0;
//     F0 = 0.0001178 * T2 - 0.000000155 * T3 + 0.75933 + 0.53058868 * K0 - 0.000837 * T + 0.000335 * T2;
//     M0 = 360 * GetFrac(K0 * 0.08084821133) + 359.2242 - 0.0000333 * T2 - 0.00000347 * T3;
//     M1 = 360 * GetFrac(K0 * 0.07171366128) + 306.0253 + 0.0107306 * T2 + 0.00001236 * T3;
//     B1 = 360 * GetFrac(K0 * 0.08519585128) + 21.2964 - 0.0016528 * T2 - 0.00000239 * T3;
//     let phase = 0;
//     let jday = 0;
//     while (jday < thisJD) {
//         let F = F0 + 1.530588 * phase;
//         const M5 = (M0 + phase * 29.10535608) * degToRad;
//         const M6 = (M1 + phase * 385.81691806) * degToRad;
//         const B6 = (B1 + phase * 390.67050646) * degToRad;
//         F -= 0.4068 * Math.sin(M6) + (0.1734 - 0.000393 * T) * Math.sin(M5);
//         F += 0.0161 * Math.sin(2 * M6) + 0.0104 * Math.sin(2 * B6);
//         F -= 0.0074 * Math.sin(M5 - M6) - 0.0051 * Math.sin(M5 + M6);
//         F += 0.0021 * Math.sin(2 * M5) + 0.001 * Math.sin(2 * B6 - M6);
//         F += 0.5 / 1440;
//         oldJ = jday;
//         jday = J0 + 28 * phase + Math.floor(F);
//         phase++;
//     }
//     const moonAge = thisJD - oldJ;
//     const phaseFraction = moonAge / 29.53059; // Normalize phase to 0-1
//
//     // Ensure phaseFraction wraps around 1 correctly
//     return phaseFraction % 1;
// }
//
//
//
// function phase_text(phase) {
//   var txt_phase;
//   if (phase <= 0.0625 || phase > 0.9375) {
//     txt_phase = "phase_new";
//   } else if (phase <= 0.1875) {
//     txt_phase = "phase_waxing_crescent";
//   } else if (phase <= 0.3125) {
//     txt_phase = "phase_first_quarter";
//   } else if (phase <= 0.4375) {
//     txt_phase = "phase_waxing_gibbous";
//   } else if (phase <= 0.5625) {
//     txt_phase = "phase_full";
//   } else if (phase <= 0.6875) {
//     txt_phase = "phase_waning_gibbous";
//   } else if (phase <= 0.8125) {
//     txt_phase = "phase_third_quarter";
//   } else if (phase <= 0.9375) {
//     txt_phase = "phase_waning_crescent";
//   }
//
//   return txt_phase;
// }
//
//
//
// var phaseLabels = {
//   phase_new: "New Moon",
//   phase_waxing_crescent: "Waxing Crescent Moon",
//   phase_first_quarter: "First Quarter Moon",
//   phase_waxing_gibbous: "Waxing Gibbous Moon",
//   phase_full: "Full Moon",
//   phase_waning_gibbous: "Waning Gibbous Moon",
//   phase_third_quarter: "Third Quarter Moon",
//   phase_waning_crescent: "Waning Crescent Moon",
// };
