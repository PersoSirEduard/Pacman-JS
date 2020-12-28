function Player(type, map) {

  const UP = 87;
  const DOWN = 83;
  const RIGHT = 68;
  const LEFT = 65;

  this.adjustSizeAndPosition = function() {
    var gridSize = this.tileMap.getGridSize();
    var xTileSize = gridSize.x / this.tileMap.xCells;
    var yTileSize =  gridSize.y / this.tileMap.yCells;
    this.sprite.position = this.tileMap.mapToWorld(this.tilePos.x, this.tilePos.y);
    this.sprite.position.x += xTileSize/2;
    this.sprite.position.y += yTileSize/2;
    this.sprite.width = xTileSize;
    this.sprite.height = yTileSize;
  }

  this.tileMap = map;
  this.playerID = type;
  this.sprite = new PIXI.AnimatedSprite([PIXI.Loader.shared.resources["assets/textures/player_0.png"].texture,
                                        PIXI.Loader.shared.resources["assets/textures/player_1.png"].texture,
                                        PIXI.Loader.shared.resources["assets/textures/player_2.png"].texture,
                                        PIXI.Loader.shared.resources["assets/textures/player_1.png"].texture]);
  switch (this.playerID) {
    case 0:
      this.sprite.tint = 0xfff700;
      break;
    case 1:
      this.sprite.tint = 0x00abd5;
      break;
    case 2:
      this.sprite.tint = 0x84f137;
      break;
  }
  this.sprite.autoUpdate = true;
  this.sprite.animationSpeed = 0.16;
  this.sprite.play();
  app.stage.addChild(this.sprite);
  this.sprite.pivot.set(16, 16);
  this.tilePos = new PIXI.Point(MAPS[map.mapID]["init_player_pos"][0], MAPS[map.mapID]["init_player_pos"][1]);
  this.adjustSizeAndPosition();
  this.direction = new PIXI.Point(0, 0);
  this.lastestDirection = new PIXI.Point(1, 0);
  this.alive = true;
  this.speed = 0.035;

  this.update = function(delta) {

    /*
    * ===============
    * INPUT DIRECTION
    * ===============
    */

    this.direction.x = 0;
    this.direction.y = 0;
    if (UP in pressedKeys) { this.direction.y = -1; this.direction.x = 0; this.sprite.rotation = -Math.PI/2; }
    if (DOWN in pressedKeys) { this.direction.y = 1; this.direction.x = 0; this.sprite.rotation = Math.PI/2; }
    if (RIGHT in pressedKeys) { this.direction.x = 1; this.direction.y = 0; this.sprite.rotation = 0; }
    if (LEFT in pressedKeys) { this.direction.x = -1; this.direction.y = 0; this.sprite.rotation = Math.PI; }

    if (this.direction.x == 0 && this.direction.y == 0) { this.sprite.stop(); } else { this.sprite.play(); this.lastestDirection = this.direction.clone(); } //Animation

    /*
    * =============================
    * POSITION + MOVEMENT + EATING
    * =============================
    */

    var gridSize = this.tileMap.getGridSize();

    var currentTile = this.tileMap.worldToMap(this.sprite.position.x, this.sprite.position.y);
    this.tilePos = currentTile;
    var currentTilePos = this.tileMap.mapToWorld(currentTile.x, currentTile.y);
    var halfTile = new PIXI.Point(gridSize.x/this.tileMap.xCells/2, gridSize.y/this.tileMap.yCells/2);
    var currentTilePosCenter = addVectors(currentTilePos, halfTile);
    var forwardTile = new PIXI.Point(currentTile.x + this.direction.x, currentTile.y + this.direction.y);
    var centerForwardTile = addVectors(this.tileMap.mapToWorld(forwardTile.x, forwardTile.y), halfTile);
    var currentTileID = this.tileMap.getTileID(currentTile.x, currentTile.y);
    var forwardTileID = this.tileMap.getTileID(forwardTile.x, forwardTile.y);

    if ((forwardTileID != "#" && forwardTileID != "?") || distanceBetweenPoints(this.sprite.position, centerForwardTile) > gridSize.x/this.tileMap.xCells + 2) {
      this.sprite.position = lerpVectors(this.sprite.position, centerForwardTile, this.speed*delta*getVectorMag(this.direction));
      if (distanceBetweenPoints(currentTilePosCenter, this.sprite.position) < halfTile.x && (currentTileID == "$" || currentTileID == "%")) {
        this.tileMap.remainingPts--;
        if (currentTileID == "$") { //BIG_PTS & TRIGGER FRIGHT
          lastedTime = 0;
          targetMode = 2;
          for (var g = 0; g < ghosts.length; g++) { ghosts[g].frightened = true; }
        }
        this.tileMap.setTileID(currentTile.x, currentTile.y, 0);
      }
    }

    /*
    * ===================================
    * OUTSIDE MAP COLLISION TELEPORTATION
    * ===================================
    */

    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    if (this.sprite.position.x > gridSize.x + xOff) this.sprite.position.x = xOff;
    if (this.sprite.position.x < xOff) this.sprite.position.x = gridSize.x + xOff;
    if (this.sprite.position.y > gridSize.y + yOff) this.sprite.position.y = yOff;
    if (this.sprite.position.y < yOff) this.sprite.position.y = gridSize.y + yOff;
  }
}
