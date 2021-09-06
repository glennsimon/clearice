// start = 'cold'|'hot'
// timingArray = [{startDwell: <num sec>,
//                 tempStart: <num degF>,
//                 tempFinish: <num degF>,
//                 animationTime = <num sec>}, {...}, ...]
const thermometer = (id = 't0', start = 'cold', animationTime = 5,
    thermometerWidth = 50, thermometerHeight = 200, labels = false, timingArray) => {

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
  // let deltaCol = 0;
  graph.totalTime = 0;
  graph.totalTemp = 0;
  graph.totalRampTime = 0;
  graph.data = [];
  for (let i = 0; i < timingArray.length; i++) {
    graph.data[i] = {};
    graph.totalTime += timingArray[i].startDwell;
    graph.data[i].dwellEnd = graph.totalTime;
    graph.totalTime += timingArray[i].animationTime;
    graph.data[i].rampEnd = graph.totalTime;
    graph.totalRampTime += timingArray[i].animationTime;
    let deltaT = (timingArray[i].tempFinish - timingArray[i].tempStart);
    graph.data[i].rampRate = deltaT / timingArray[i].animationTime;
    graph.totalTemp += deltaT;
  }
  let rampStartingFrac = 0;
  let tempStartingFrac = 0;
  for (let i = 0; i < timingArray.length; i++) {
    graph.data[i].rampStartingFrac = rampStartingFrac;
    graph.data[i].tempStartingFrac = tempStartingFrac;
    graph.data[i].rampFrac = timingArray[i].animationTime / graph.totalRampTime;
    graph.data[i].tempFrac = (timingArray[i].tempFinish - timingArray[i].tempStart) /
      graph.totalTemp;
    rampStartingFrac += graph.data[i].rampFrac;
    tempStartingFrac += graph.data[i].tempFrac;
  }

  // draw thermometer
  ctxTherm.strokeStyle = 'black';
  ctxTherm.lineWidth = outlineThickness;
  ctxTherm.lineCap = 'round';
  ctxTherm.fillStyle = 'white';

  ctxTherm.beginPath();
  ctxTherm.moveTo((thermometerWidth - shaftDia) / 2, 0.8 * thermometerHeight);
  ctxTherm.lineTo((thermometerWidth - shaftDia) / 2, thermometerWidth / 2);
  ctxTherm.arc(thermometerWidth / 2, thermometerWidth / 2, shaftDia / 2, Math.PI, 0);
  ctxTherm.lineTo((thermometerWidth + shaftDia) / 2, 0.8 * thermometerHeight);
  ctxTherm.fill();
  ctxTherm.stroke();

  ctxTherm.beginPath();
  ctxTherm.arc(
    thermometerWidth / 2,
    yBulbCenter,
    bulbDia / 2,
    0,
    2 * Math.PI
  );
  ctxTherm.stroke();

  if (labels) {
    ctxTherm.font = '' + 0.4 * thermometerWidth + 'px sans-serif';
    ctxTherm.textBaseline = 'middle';
    ctxTherm.fillStyle = 'black';
    const dYdT = timingArray[0].tempStart - timingArray[timingArray.length - 1].tempFinish != 0 ?
      (lowerColumnPosition - upperColumnPosition) /
      (timingArray[0].tempStart - timingArray[timingArray.length - 1].tempFinish) : 0;
    const tickXStart = (thermometerWidth + shaftDia) / 2;
    let yPos = start === 'cold' ? lowerColumnPosition : upperColumnPosition;
    for (let i = 0; i < timingArray.length; i++) {
      ctxTherm.beginPath();
      ctxTherm.moveTo(tickXStart, yPos);
      ctxTherm.lineTo(2 * outlineThickness + tickXStart, yPos);
      ctxTherm.stroke();
      ctxTherm.fillText('' + timingArray[i].tempStart + '\xB0F', 3 * outlineThickness + tickXStart, yPos);
      yPos += dYdT * (timingArray[i].tempStart - timingArray[i].tempFinish);
    }
    ctxTherm.beginPath();
    ctxTherm.moveTo(tickXStart, yPos);
    ctxTherm.lineTo(2 * outlineThickness + tickXStart, yPos);
    ctxTherm.stroke();
    ctxTherm.fillText('' + timingArray[timingArray.length - 1].tempFinish + '\xB0F', 3 * outlineThickness + tickXStart, yPos);
  }

  let startTime = Date.now();
  let segmentIndex = 0;
  const drawTherm = () => {
    const elapsedTimeSec = (Date.now() - startTime) / 1000;
    // const elapsedFrac = elapsedTimeSec / animationTime < 1 ? elapsedTimeSec / animationTime : 1;

    let colTop;
    let fillStyle;
    let rampElapsedFrac;
    let tempElapsedFrac;
    switch (start) {
      case 'hot':
        if (elapsedTimeSec < graph.data[segmentIndex].dwellEnd) {
          rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac;
          tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac;
          // fillStyle = 'rgb(' + 255 * (1 - rampElapsedFrac) + ', 0, ' + 255 * rampElapsedFrac;
          // colTop = 
          //     upperColumnPosition * (1 - rampElapsedFrac) +
          //     lowerColumnPosition * rampElapsedFrac;
        } else if (elapsedTimeSec < graph.data[segmentIndex].rampEnd) {
          rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac +
              graph.data[segmentIndex].rampFrac * (elapsedTimeSec - graph.data[segmentIndex].dwellEnd) /
              (timingArray[segmentIndex].animationTime);
          tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac +
              graph.data[segmentIndex].tempFrac * (elapsedTimeSec - graph.data[segmentIndex].dwellEnd) /
              (timingArray[segmentIndex].animationTime);
          // fillStyle = 'rgb(' + 255 * (1 - rampElapsedFrac) + ', 0, ' + 255 * rampElapsedFrac;
          // colTop = 
          //     upperColumnPosition * (1 - rampElapsedFrac) +
          //     lowerColumnPosition * rampElapsedFrac;
        } else {
          rampElapsedFrac = graph.data[segmentIndex].rampStartingFrac +
              graph.data[segmentIndex].rampFrac;
          tempElapsedFrac = graph.data[segmentIndex].tempStartingFrac +
              graph.data[segmentIndex].tempFrac;
          // fillStyle = 'rgb(' + 255 * (1 - rampElapsedFrac) + ', 0, ' + 255 * rampElapsedFrac;
          // colTop = 
          //     upperColumnPosition * (1 - rampElapsedFrac) +
          //     lowerColumnPosition * rampElapsedFrac;
          segmentIndex += 1;
          if (segmentIndex === timingArray.length) return;
        }
        fillStyle = 'rgb(' + 255 * (1 - rampElapsedFrac) + ', 0, ' + 255 * rampElapsedFrac;
        colTop = 
            upperColumnPosition * (1 - tempElapsedFrac) +
            lowerColumnPosition * tempElapsedFrac;
        break;
      case 'cold':
      default:
        ctxTherm.fillStyle = 'blue';
        colTop = lowerColumnPosition;
    }
    let colHeight = yBulbCenter - colTop;

    // clear previous column
    ctxTherm.fillStyle = 'white';
    ctxTherm.beginPath();
    ctxTherm.fillRect(
      (thermometerWidth - shaftDia + outlineThickness) / 2,
      upperColumnPosition,
      shaftDia - outlineThickness,
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
      (thermometerWidth - shaftDia + outlineThickness) / 2,
      colTop,
      shaftDia - outlineThickness,
      colHeight
    );

    // if (elapsedFrac === 1) return;
    window.requestAnimationFrame(drawTherm);
  };

  drawTherm();
};
