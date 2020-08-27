function distanceBetweenPoints(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function addVectors(a, b) {
  return new PIXI.Point(a.x + b.x, a.y + b.y);
}

function subVectors(a, b) {
  return new PIXI.Point(a.x - b.x, a.y - b.y);
}

function getVectorMag(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
}

function divVector(v, val) {
  if (val == 0) return null;
  return new PIXI.Point(v.x / val, v.y / val);
}

function multVector(v, val) {
  return new PIXI.Point(v.x * val, v.y * val);
}

function unitVector(v) {
  var mag = getVectorMag(v);
  if (mag == 0) return new PIXI.Point(0, 0);
  return divVector(v, mag);
}

function dotVectors(a, b) {
  return a.x*b.x + a.y*b.y;
}

function lerpVectors(a, b, t) {
  return new PIXI.Point(a.x + (b.x-a.x)*t, a.y + (b.y-a.y)*t);
}
