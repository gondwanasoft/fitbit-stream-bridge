// Developed by Barbara Kälin.
// ❗️❗️WORK IN PROGRESS❗️❗️

//TODO 1 FIX the x-coords in tooltip for outer scaling!!!
// add magnify for tooltip maybe 5 points before/after

//adjust height when changing yFactor

// TODO create each line in an own g
// add option to toggle views allInOne/collapsed
// handle timeline instead index OR get index by timeDiff
// in any case add timestamp to dataPoints
// TOTALLY different struct for the dataObject? - and fill it up just show % portion?
// TODO add legend and axis
// make it a class? a component?

//TODO check the NaN error on drawing first set
// why does it redraw onload?
//TODO change to using a dataObject like let dataObject = [] // array of data = {timestamp: 0, x: 0, y: 0, z: 0, }
// PLAY SETTINGS
let maxDataPoints = 100;
let updateInterval = 1000 / 30; // 30Hz
// scaling x/y
let yFactor = 1;
let xFactor = 1;
let min = -10;
let max = 10;

//---------------------------------------------------------------------
yFactor *= 8;
const container = document.getElementById("container");
const outerSvg = document.getElementById("outerSvg");
const innerSvg = document.getElementById("innerSvg");

const group = innerSvg.getElementById("group");
const data = { x: [], y: [], z: [] };

const width = outerSvg.clientWidth;
const height = outerSvg.clientWidth;

const lineColors = ["red", "green", "blue"];
const lineElements = {};

let pointSpacing = (width / maxDataPoints) * xFactor;
const range = max - min;
const margin = 10;
// TODO set the g's y to range's 0
outerSvg.setAttribute(
	"viewBox",
	`0 0 ${width} ${range * yFactor + 2 * margin}`
);

//create a polyline for each prop in data
for (const key of Object.keys(data)) {
	lineElements[key] = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"polyline"
	);
	lineElements[key].setAttribute(
		"stroke",
		lineColors[key === "x" ? 0 : key === "y" ? 1 : 2]
	);
	lineElements[key].setAttribute("stroke-width", "2");
	lineElements[key].setAttribute("stroke-linejoin", "round");
	lineElements[key].setAttribute("fill", "none");
	group.appendChild(lineElements[key]);
}

// calc points to display dataPoints and add to polylines
// change this for real data-pool on %
function updateLines() {
	for (const key of Object.keys(data)) {
		const points = [];
		let i = 0;

		while (i < maxDataPoints) {
			const scaledX = i * pointSpacing * xFactor;
			const scaledY = -data[key][i] * yFactor;
			points.push(`${scaledX}, ${scaledY}`);
			i++;
		}

		lineElements[key].setAttribute("points", points.join(" "));
	}
}

let updatePointsInterval;
let isUpdating = true;

// Shift/push on array for displayed data
function updateDataArrays(newX, newY, newZ) {
	if (data.x.length >= maxDataPoints) {
		for (const key in data) data[key].shift();
	}

	data.x.push(newX);
	data.y.push(newY);
	data.z.push(newZ);
}

let totalPoints = 0; // just a counter
// PETER: superseded; see end of file
/*function startUpdatingPoints() {
	updatePointsInterval = setInterval(() => {
		const newX = Math.random() * range + min;
		const newY = Math.random() * range + min;
		const newZ = Math.random() * range + min;

		updateDataArrays(newX, newY, newZ);
		updateLines();
		totalPoints++;
	}, updateInterval);
}


function stopUpdatingPoints() {
	clearInterval(updatePointsInterval);
}*/

// Toggle button click event
document.getElementById("toggleButton").addEventListener("click", function () {
	if (isUpdating) {
		stopUpdatingPoints();
		isUpdating = false;
		this.textContent = "Start Scrolling";
	} else {
		startUpdatingPoints();
		isUpdating = true;
		this.textContent = "Stop Scrolling";
	}
});

// Create a tooltip element
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
document.body.appendChild(tooltip);

// Click event handler for each polyline element
for (const key of Object.keys(data)) {
	lineElements[key].addEventListener("click", function (event) {
		const svgLeft = innerSvg.getBoundingClientRect().left;
		const svgWidth = innerSvg.getBoundingClientRect().width;
		const mouseX = event.clientX - svgLeft;

		/* WTF ???
		console.log(mouseX, event.offsetX);

		const svgPoint = outerSvg.createSVGPoint();
		console.log(svgPoint); // empty
		svgPoint.x = event.clientX;
		svgPoint.y = event.clientY;
		console.log(svgPoint.x, svgPoint.y); // values

		const matrix = group.getScreenCTM().inverse();

		console.log(matrix); // empty
		const transformedPoint = svgPoint.matrixTransform(matrix);
		console.log(transformedPoint); // empty
*/
		const marker = innerSvg.getElementById("marker");
		//TODO need to adjust this for scaling on WINDOW!!!
		marker.setAttribute("x1", mouseX);
		marker.setAttribute("x2", mouseX);
		marker.style.display = "inline";

		//get the closest point when clicking on any line

		//console.log({ pointSpacing });
		const pointIndex = Math.round(mouseX / pointSpacing / xFactor);
		//console.log({ svgWidth }, { mouseX }, { maxDataPoints });
		//console.log({ pointIndex });
		if (pointIndex >= 0 && pointIndex < maxDataPoints) {
			const clicked = {
				x: data.x[pointIndex],
				y: data.y[pointIndex],
				z: data.z[pointIndex]
			};

			// offset to mousePos
			tooltip.style.left = `${event.clientX + 10}px`;
			tooltip.style.top = `${event.clientY + 10}px`;
			//console.log(totalPoints);
			// Calculate the current point index based on totalPoints and maxDataPoints
			let currentPoint = pointIndex;

			if (totalPoints > maxDataPoints) {
				currentPoint = totalPoints - maxDataPoints + pointIndex;
			}

			tooltip.textContent = `dataPoint ${currentPoint}\nx: ${clicked.x.toFixed(
				2
			)}, y: ${clicked.y.toFixed(2)}, z: ${clicked.z.toFixed(2)}`;

			tooltip.style.display = "block";

			setTimeout(() => {
				tooltip.style.display = marker.style.display = "none";
			}, 5000); // Adjust the delay as needed or add a closeIcon?
		}
	});
}

// Listen for window resize event to handle adjustments
window.addEventListener("resize", function () {
	//width = outerSvg.clientWidth; // Update the width
	//pointSpacing = (width / maxDataPoints) * xFactor; // Recalculate pointSpacing
	// Update other relevant variables and adjust existing SVG elements as needed
});

/*
// Get the container element for event delegation
const settingsContainer = document.getElementById("settingsContainer");


// First restruct the code THEN this can be integrated
// now does NOT calc the y-offset for new maxDataPoints
// Event delegation for input changes
settingsContainer.addEventListener("change", function (event) {
    const target = event.target;
    if (target.tagName === "INPUT") {
        const settingId = target.id;
        const settingValue = parseInt(target.value);

        switch (settingId) {
            case "maxDataPoints":
                maxDataPoints = settingValue;
                break;
            case "updateInterval":
                updateInterval = settingValue;
                break;
            case "yFactor":
                yFactor = settingValue;
                break;
            default:
                // Handle unexpected input IDs
                break;
        }
    }
	updateLines()
	//startUpdatingPoints();
});
*/

// scale on x-axis
const xFactorInput = document.getElementById("scalingFactorInput");
const yFactorInput = document.getElementById("yFactor");
document.addEventListener("click", function (event) {
	if (event.target.id === "scaleButton") {
		xFactor *= 1.5;
	} else if (event.target.id === "reset") {
		xFactorInput.value = xFactor = 1;
	}
	updateLines();
});

xFactorInput.addEventListener("input", () => {
	xFactor = parseFloat(xFactorInput.value);
	//pointSpacing *= xScalingFactor;
	updateLines();
});
yFactorInput.addEventListener("input", () => {
	yFactor = parseFloat(yFactorInput.value) * 8;
	outerSvg.setAttribute(
		"viewBox",
		`0 0 ${width} ${range * yFactor + 2 * margin}`
	);
	updateLines();
});

window.onload = () => startUpdatingPoints();

// PETER:

function startUpdatingPoints() {
	stream.onmessage = onMessage 	// stream is defined in client-stream.js

	function onMessage(t, x, y, z) {
		//console.log(`onMessage ${z}`)
		updateDataArrays(x, y, z);
		updateLines();
		totalPoints++;
	}
}

function stopUpdatingPoints() {
	stream.onmessage = undefined
}
