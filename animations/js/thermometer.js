const thermometer = (id = 't0', change = 'cooling', animationTime = 5,
    canvasWidth = 50, canvasHeight = 200, bulbDia = 40, shaftDia = 20,
    outlineThickness = 3, columnTopRange = [30, 125]) => {

  const canvasTherm = document.getElementById(id);
  canvasTherm.width = canvasWidth;
  canvasTherm.height = canvasHeight;
  const ctxTherm = canvasTherm.getContext('2d');

  let startTime = Date.now();
  const drawTherm = () => {
    ctxTherm.clearRect(0, 0, canvasWidth, canvasHeight)
    const elapsedTimeSec = (Date.now() - startTime) / 1000;
    const elapsedFrac =
      elapsedTimeSec / animationTime < 1 ? elapsedTimeSec / animationTime : 1;

    ctxTherm.strokeStyle = 'black';
    ctxTherm.lineWidth = outlineThickness;
    ctxTherm.lineCap = 'round';
    ctxTherm.fillStyle = 'white';

    ctxTherm.beginPath();
    ctxTherm.moveTo((canvasWidth - shaftDia) / 2, 0.8 * canvasHeight);
    ctxTherm.lineTo((canvasWidth - shaftDia) / 2, canvasWidth / 2);
    ctxTherm.arc(canvasWidth / 2, canvasWidth / 2, shaftDia / 2, Math.PI, 0);
    ctxTherm.lineTo((canvasWidth + shaftDia) / 2, 0.8 * canvasHeight);
    ctxTherm.fill();
    ctxTherm.stroke();

    let colTop;
    switch (change) {
      case 'cooling':
        ctxTherm.fillStyle =
          'rgb(' + 255 * (1 - elapsedFrac) + ', 0, ' + 255 * elapsedFrac;
        colTop =
          columnTopRange[0] * (1 - elapsedFrac) +
          columnTopRange[1] * elapsedFrac;
        break;
      case 'heating':
        ctxTherm.fillStyle =
          'rgb(' + 255 * elapsedFrac + ', 0, ' + 255 * (1 - elapsedFrac);
        colTop =
          columnTopRange[0] * elapsedFrac +
          columnTopRange[1] * (1 - elapsedFrac);
        break;
      case 'hot':
        ctxTherm.fillStyle = 'red';
        colTop = columnTopRange[0];
        break;
      case 'cold':
      default:
        ctxTherm.fillStyle = 'blue';
        colTop = columnTopRange[1];
    }
    let colHeight = canvasHeight - canvasWidth / 2 - colTop;

    ctxTherm.beginPath();
    ctxTherm.arc(
      canvasWidth / 2,
      canvasHeight - canvasWidth / 2,
      bulbDia / 2,
      0,
      2 * Math.PI
    );
    ctxTherm.fill();
    ctxTherm.stroke();

    ctxTherm.beginPath();
    ctxTherm.fillRect(
      (canvasWidth - shaftDia + outlineThickness) / 2,
      colTop,
      shaftDia - outlineThickness,
      colHeight
    );
    ctxTherm.fill();
    if (elapsedFrac === 1 || change === 'hot' || change === 'cold') return;

    window.requestAnimationFrame(drawTherm);
  };

  window.setTimeout(drawTherm);
};
