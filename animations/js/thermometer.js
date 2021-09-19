// start = 'cold'|'hot'
// timingArray = [{initialDwell: <num sec>,
//                 tempStart: <num degF>,
//                 tempFinish: <num degF>,
//                 tempRampTime = <num sec>}, {...}, ...]
const thermometer = (id = 't0', start = 'cold', thermometerWidth = 50,
    thermometerHeight = 200, labels = false, timingArray) => {

  const canvasTherm = document.getElementById(id);
  canvasTherm.width = labels ? 2 * thermometerWidth : thermometerWidth;
  canvasTherm.height = thermometerHeight;
  const ctxTherm = canvasTherm.getContext('2d');

  const bulbDia = 0.8 * thermometerWidth;
  const shaftDia = 0.4 * thermometerWidth;
  const outlineThickness = 0.06 * thermometerWidth;
  const upperColumnPosition = 0.15 * thermometerHeight;
  const lowerColumnPosition = 0.7 * thermometerHeight;
  const yBulbCenter = thermometerHeight - thermometerWidth / 2;

  const graph = {};
  graph.totalTime = 0;
  graph.totalTemp = 0;
  graph.totalRampTime = 0;
  graph.data = [];
  for (let i = 0; i < timingArray.length; i++) {
    graph.data[i] = {};
    graph.totalTime += timingArray[i].initialDwell;
    graph.data[i].dwellEndTime = graph.totalTime;
    graph.totalTime += timingArray[i].tempRampTime;
    graph.data[i].rampEndTime = graph.totalTime;
    graph.totalRampTime += timingArray[i].tempRampTime;
    let deltaT = (timingArray[i].tempFinish - timingArray[i].tempStart);
    graph.data[i].rampRate = deltaT / timingArray[i].tempRampTime;
    graph.totalTemp += deltaT;
  }
  let rampStartingFrac = 0;
  let tempStartingFrac = 0;
  for (let i = 0; i < timingArray.length; i++) {
    graph.data[i].rampStartingFrac = rampStartingFrac;
    graph.data[i].tempStartingFrac = tempStartingFrac;
    graph.data[i].rampFrac = graph.totalRampTime != 0 ?
        timingArray[i].tempRampTime / graph.totalRampTime : 0;
    graph.data[i].tempFrac = graph.totalTemp != 0 ?
        (timingArray[i].tempFinish - timingArray[i].tempStart) /
        graph.totalTemp : 0;
    rampStartingFrac += graph.data[i].rampFrac;
    tempStartingFrac += graph.data[i].tempFrac;
  }

  ctxTherm.strokeStyle = 'black';
  ctxTherm.lineWidth = outlineThickness;
  ctxTherm.lineCap = 'round';
  ctxTherm.fillStyle = 'white';

  // draw thermometer shaft
  ctxTherm.beginPath();
  ctxTherm.moveTo((thermometerWidth - shaftDia) / 2, 0.8 * thermometerHeight);
  ctxTherm.lineTo((thermometerWidth - shaftDia) / 2, thermometerWidth / 2);
  ctxTherm.arc(thermometerWidth / 2, thermometerWidth / 2, shaftDia / 2, Math.PI, 0);
  ctxTherm.lineTo((thermometerWidth + shaftDia) / 2, 0.8 * thermometerHeight);
  ctxTherm.fill();
  ctxTherm.stroke();

  // draw thermometer bulb
  ctxTherm.beginPath();
  ctxTherm.arc(
    thermometerWidth / 2,
    yBulbCenter,
    bulbDia / 2,
    0,
    2 * Math.PI
  );
  ctxTherm.stroke();

  // draw labels if labels == true
  if (labels) {
    ctxTherm.font = '' + 0.4 * thermometerWidth + 'px sans-serif';
    ctxTherm.textBaseline = 'middle';
    ctxTherm.fillStyle = 'black';
    const dYdT = graph.totalTemp != 0 ?
      (lowerColumnPosition - upperColumnPosition) / graph.totalTemp : 0;
    const tickXStart = (thermometerWidth + shaftDia) / 2;
    let yPos = start === 'hot' ? upperColumnPosition : lowerColumnPosition;
    const sign = dYdT < 0 ? -1 : 1;
    for (let i = 0; i < timingArray.length; i++) {
      ctxTherm.beginPath();
      ctxTherm.moveTo(tickXStart, yPos);
      ctxTherm.lineTo(2 * outlineThickness + tickXStart, yPos);
      ctxTherm.stroke();
      ctxTherm.fillText('' + timingArray[i].tempStart + '\xB0F', 4 * outlineThickness + tickXStart, yPos);
      yPos += sign * dYdT * (timingArray[i].tempStart - timingArray[i].tempFinish);
    }
    ctxTherm.beginPath();
    ctxTherm.moveTo(tickXStart, yPos);
    ctxTherm.lineTo(2 * outlineThickness + tickXStart, yPos);
    ctxTherm.stroke();
    ctxTherm.fillText('' + timingArray[timingArray.length - 1].tempFinish + '\xB0F', 4 * outlineThickness + tickXStart, yPos);
  }

  let startTime = Date.now();
  let segmentIndex = 0;
  const drawTherm = () => {
    const elapsedTimeSec = (Date.now() - startTime) / 1000;

    let colTop;
    let fillStyle;
    let rampElapsedFrac;
    let tempElapsedFrac;
    if (elapsedTimeSec < graph.data[segmentIndex].dwellEndTime) {
      rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac;
      tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac;
    }
    else if (elapsedTimeSec < graph.data[segmentIndex].rampEndTime) {
      rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac +
          graph.data[segmentIndex].rampFrac * (elapsedTimeSec - graph.data[segmentIndex].dwellEndTime) /
          (timingArray[segmentIndex].tempRampTime);
      tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac +
          graph.data[segmentIndex].tempFrac * (elapsedTimeSec - graph.data[segmentIndex].dwellEndTime) /
          (timingArray[segmentIndex].tempRampTime);
    }
    else {
      rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac +
          graph.data[segmentIndex].rampFrac;
      tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac +
          graph.data[segmentIndex].tempFrac;
      segmentIndex += 1;
    }
    if (start === 'hot') {
      fillStyle = 'rgb(' + 255 * (1 - rampElapsedFrac) + ', 0, ' + 255 * rampElapsedFrac;
      colTop = 
          upperColumnPosition * (1 - tempElapsedFrac) +
          lowerColumnPosition * tempElapsedFrac;
    } else {
      fillStyle = 'rgb(' + 255 * rampElapsedFrac + ', 0, ' + 255 * (1 - rampElapsedFrac);
      colTop = 
          upperColumnPosition * tempElapsedFrac +
          lowerColumnPosition * (1 - tempElapsedFrac);
    }
    let colHeight = yBulbCenter - colTop;

    // clear previous column
    ctxTherm.fillStyle = 'white';
    ctxTherm.beginPath();
    ctxTherm.fillRect(
      (thermometerWidth - shaftDia + 1.35 * outlineThickness) / 2,
      upperColumnPosition,
      shaftDia - 1.35 * outlineThickness,
      lowerColumnPosition
    );

    // draw bulb color and outline
    ctxTherm.fillStyle = fillStyle;
    ctxTherm.beginPath();
    ctxTherm.arc(
      thermometerWidth / 2,
      yBulbCenter,
      (bulbDia - outlineThickness) / 2,
      0,
      2 * Math.PI
    );
    ctxTherm.stroke();
    ctxTherm.fill();

    // draw new column
    ctxTherm.beginPath();
    ctxTherm.fillRect(
      (thermometerWidth - shaftDia + 1.1 * outlineThickness) / 2,
      colTop,
      shaftDia - 1.1 * outlineThickness,
      colHeight
    );

    if (segmentIndex === timingArray.length) return;

    // if (elapsedFrac === 1) return;
    window.requestAnimationFrame(drawTherm);
  };

  drawTherm();
};
