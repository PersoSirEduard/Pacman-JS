var assets = [
  "assets/textures/1.png",
  "assets/textures/2.png",
  "assets/textures/3.png",
  "assets/textures/4.png",
  "assets/textures/5.png",
  "assets/textures/6.png",
  "assets/textures/7.png",
  "assets/textures/8.png",
  "assets/textures/9.png",
  "assets/textures/10.png",
  "assets/textures/11.png",
  "assets/textures/12.png",
  "assets/textures/13.png",
  "assets/textures/14.png",
  "assets/textures/player_0.png",
  "assets/textures/player_1.png",
  "assets/textures/player_2.png",
  "assets/textures/ghost_body_0.png",
  "assets/textures/ghost_body_1.png",
  "assets/textures/ghost_eyes_left.png",
  "assets/textures/ghost_eyes_right.png",
  "assets/textures/ghost_eyes_up.png",
  "assets/textures/ghost_eyes_down.png",
  "assets/textures/ghost_eyes_scared.png",
  "assets/textures/gateway.png"
];

const app = new PIXI.Application({ //New PIXI engine container
  width: window.innerWidth,
  height: window.innerHeight,
  autoResize: true,
  antialias: true
});
var loaded = false;

document.body.appendChild(app.view); //Add canvas to html body
window.addEventListener('resize', resize); //Window resize event

function resize() { //Resize Event
  app.renderer.resize(window.innerWidth, window.innerHeight);
  if (loaded) {
    map.adjustSizeAndPosition();
    player.adjustSizeAndPosition();
    for (var g = 0; g < ghosts.length; g++) {
      ghosts[g].adjustSizeAndPosition();
    }
  }
}

var pressedKeys = {};
document.addEventListener('keydown', onKeyDown); //Key press event
document.addEventListener('keyup', onKeyUp); //Key up event

var map, player, lastedTouch;
var ghosts = [];

for (let a = 0; a < assets.length; a++) { ///Load all assets
  PIXI.Loader.shared.add(assets[a]);
}
PIXI.Loader.shared.load(setup); //When finish loading --> go to setup()

function setup() {
  loaded = true;
  map = new TileMap();
  map.loadMap(0);
  player = new Player(0, map);
  for (var g = 0; g < 4; g++) {
    var ghost = new Ghost(g, map);
    ghosts.push(ghost);
  }
  app.ticker.add(delta => { //Tick update
    update(delta);
  });
}

function update(delta) {
  player.update(delta);
  updateTimerMode(delta);
  for (var g = 0; g < ghosts.length; g++) {
    ghosts[g].update(delta);
  }
  //map.displayGrid();
}

function onKeyDown(e) {
  if (!(e.keyCode in pressedKeys)) {
    pressedKeys[e.keyCode] = true;
  }
}

function onKeyUp(e) {
  if (e.keyCode in pressedKeys) {
    delete pressedKeys[e.keyCode];
  }
}
