const heatRipple = (
  rippleId = 'r1',
  rippleWidth = 200,
  rippleHeight = 20,
  lineThickness = 3,
  ripplePeriod = 40,
  rippleSpeed = 50,
  startColor = 'red',
  endColor = 'yellow'
) => {
  const canvasHeight = rippleHeight + lineThickness;
  const upperTangent = (canvasHeight - rippleHeight) / 2;
  const lowerTangent = upperTangent + rippleHeight;

  const canvasRipples = document.getElementById(rippleId);
  canvasRipples.width = rippleWidth;
  canvasRipples.height = canvasHeight;
  const ctxRipples = canvasRipples.getContext('2d');

  var gradient = ctxRipples.createLinearGradient(0, 0, rippleWidth, 0);
  gradient.addColorStop('0', startColor);
  gradient.addColorStop('1.0', endColor);
  // Fill with gradient
  ctxRipples.strokeStyle = gradient;
  ctxRipples.lineWidth = lineThickness;
  ctxRipples.lineCap = 'round';

  let startTime = Date.now();
  let strokeXstart = -ripplePeriod;
  const drawWiggly = () => {
    ctxRipples.clearRect(0, 0, rippleWidth, canvasHeight);
    const elapsedTime = (Date.now() - startTime) / 1000;
    strokeX = strokeXstart + rippleSpeed * elapsedTime;
    if (strokeX > 0) {
      strokeXstart = -ripplePeriod + strokeX;
      startTime += elapsedTime * 1000;
    }
    ctxRipples.beginPath();
    ctxRipples.moveTo(strokeX, upperTangent);
    while (strokeX < rippleWidth) {
      ctxRipples.bezierCurveTo(
        strokeX + ripplePeriod / 4,
        upperTangent,
        strokeX + ripplePeriod / 4,
        lowerTangent,
        strokeX + ripplePeriod / 2,
        lowerTangent
      );
      ctxRipples.bezierCurveTo(
        strokeX + (3 * ripplePeriod) / 4,
        lowerTangent,
        strokeX + (3 * ripplePeriod) / 4,
        upperTangent,
        strokeX + ripplePeriod,
        upperTangent
      );
      strokeX += ripplePeriod;
    }
    ctxRipples.stroke();

    window.requestAnimationFrame(drawWiggly);
  };

  window.requestAnimationFrame(drawWiggly);
};
