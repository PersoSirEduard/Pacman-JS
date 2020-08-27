function Ghost(type, map) {
  this.tileMap = map;
  this.ghostType = type;
  this.alive = true;
  this.direction = new PIXI.Point(-1, 0);
  this.speed = 1;
  this.frightened = false;
  this.canGoThroughGate = false;
  this.imprisoned = true;
  this.prisonSentence = 5;
  this.lastedTimePrisonSentence = 0;

  this.adjustSizeAndPosition = function() {
    var gridSize = this.tileMap.getGridSize();
    var xTileSize = gridSize.x / this.tileMap.xCells;
    var yTileSize =  gridSize.y / this.tileMap.yCells;
    this.sprite.position = this.tileMap.mapToWorld(this.tilePos.x, this.tilePos.y);
    this.sprite.position.x += xTileSize/2;
    this.sprite.position.y += yTileSize/2;
    for (var i = 0; i < this.sprite.children.length; i++) {
      this.sprite.getChildAt(i).width = xTileSize;
      this.sprite.getChildAt(i).height = yTileSize;
    }
  }

  var bodyTextures = [PIXI.Loader.shared.resources["assets/textures/ghost_body_0.png"].texture,
                      PIXI.Loader.shared.resources["assets/textures/ghost_body_1.png"].texture];
  var eyesTextures = [PIXI.Loader.shared.resources["assets/textures/ghost_eyes_left.png"].texture,
                      PIXI.Loader.shared.resources["assets/textures/ghost_eyes_right.png"].texture,
                      PIXI.Loader.shared.resources["assets/textures/ghost_eyes_up.png"].texture,
                      PIXI.Loader.shared.resources["assets/textures/ghost_eyes_down.png"].texture,
                      PIXI.Loader.shared.resources["assets/textures/ghost_eyes_scared.png"].texture];

  this.sprite = new PIXI.Container();
  var bodySprite = new PIXI.AnimatedSprite(bodyTextures);
  bodySprite.name = "body";
  bodySprite.autoUpdate = true;
  bodySprite.animationSpeed = 0.16;
  bodySprite.play();
  bodySprite.pivot.set(16, 16);
  this.sprite.addChild(bodySprite);
  var eyesSprite = new PIXI.Sprite(eyesTextures[0]);
  eyesSprite.name = "eyes";
  eyesSprite.pivot.set(16, 16);
  this.sprite.addChild(eyesSprite);

  this.tilePos = new PIXI.Point(MAPS[this.tileMap.mapID]["master_home_pos"][0], MAPS[this.tileMap.mapID]["master_home_pos"][1]);
  //this.tilePos = new PIXI.Point(6, 10);
  this.canTurn = true;
  app.stage.addChild(this.sprite);
  this.adjustSizeAndPosition();

  this.update = function(delta) {

    /*
    * ================
    * SPRITES UPDATE
    * ================
    */

    if (this.alive) {
      if (this.frightened) {
        if (frightenedModeSprite == 1) {
          this.sprite.getChildByName("eyes").texture = eyesTextures[4];
          this.sprite.getChildByName("eyes").tint = 0xffffff;
          this.sprite.getChildByName("body").tint = 0x2121ff;
        } else {
          this.sprite.getChildByName("eyes").texture = eyesTextures[4];
          this.sprite.getChildByName("eyes").tint = 0xfa0303;
          this.sprite.getChildByName("body").tint = 0xffffff;
        }
      } else {
        this.sprite.getChildByName("body").visible = true
        this.sprite.getChildByName("eyes").tint = 0xffffff;
        switch (this.ghostType) {
          case 0:
            this.sprite.getChildByName("body").tint = 0xfa0303; //Blinky
            this.prisonSentence = 2;
            break;
          case 1:
            this.sprite.getChildByName("body").tint = 0xf78999; //Pinky
            this.prisonSentence = 4;
            break;
          case 2:
            this.sprite.getChildByName("body").tint = 0x05c2f7; //Inky
            this.prisonSentence = 6;
            break;
          case 3:
            this.sprite.getChildByName("body").tint = 0xf29208; //Clyde
            this.prisonSentence = 8;
            break;
        }
        if (this.direction.x == 1) { this.sprite.getChildByName("eyes").texture = eyesTextures[1]; }
        if (this.direction.x == -1) { this.sprite.getChildByName("eyes").texture = eyesTextures[0]; }
        if (this.direction.y == 1) { this.sprite.getChildByName("eyes").texture = eyesTextures[3]; }
        if (this.direction.y == -1) { this.sprite.getChildByName("eyes").texture = eyesTextures[2]; }
      }
    } else {
      this.sprite.getChildByName("body").visible = false
      this.sprite.getChildByName("eyes").tint = 0xffffff;
      if (this.direction.x == 1) { this.sprite.getChildByName("eyes").texture = eyesTextures[1]; }
      if (this.direction.x == -1) { this.sprite.getChildByName("eyes").texture = eyesTextures[0]; }
      if (this.direction.y == 1) { this.sprite.getChildByName("eyes").texture = eyesTextures[3]; }
      if (this.direction.y == -1) { this.sprite.getChildByName("eyes").texture = eyesTextures[2]; }
    }

    /*
    * ================
    * POSITION
    * ================
    */

    var gridSize = this.tileMap.getGridSize();

    var currentTile = this.tileMap.worldToMap(this.sprite.position.x, this.sprite.position.y);
    if (currentTile.x != this.tilePos.x || currentTile.y != this.tilePos.y) this.canTurn = true;
    this.tilePos = currentTile;
    if (this.tileMap.getTileID(currentTile.x, currentTile.y) == 15) {
      if (this.canGoThroughGate == true) this.imprisoned = !this.imprisoned;
      this.canGoThroughGate = false;
      this.alive = true;
      this.frightened = false;
    }
    var destination = getGhostDestination(this);
    var currentTilePos = this.tileMap.mapToWorld(currentTile.x, currentTile.y);
    var halfTile = new PIXI.Point(gridSize.x/this.tileMap.xCells/2, gridSize.y/this.tileMap.yCells/2);
    var currentTilePosCenter = addVectors(currentTilePos, halfTile);
    var forwardTile = new PIXI.Point(currentTile.x + this.direction.x, currentTile.y + this.direction.y);
    var forwardTilePos = this.tileMap.mapToWorld(forwardTile.x, forwardTile.y);
    var forwardTilePosCenter = addVectors(forwardTilePos, halfTile);
    var freeAdjTiles = this.tileMap.getFreeAdjacentTilesPos(currentTile.x, currentTile.y);

    /*
    * =================
    * TURNING ALGORITHM
    * =================
    */

    if (distanceBetweenPoints(forwardTilePosCenter, this.sprite.position) < gridSize.x/this.tileMap.xCells && this.canTurn) {
      this.canTurn = false;
      if (freeAdjTiles.length == 1) {
        this.direction.x *= -1;
        this.direction.y *= -1;
      } else if (this.tileMap.getTileID(forwardTile.x, forwardTile.y) != null && this.tileMap.getTileID(forwardTile.x, forwardTile.y) < 16) {
        this.sprite.position = currentTilePosCenter;
        if (this.direction.x != 0) {
          this.direction.x = 0;
          var upTilePos = addVectors(currentTilePosCenter, new PIXI.Point(0, -gridSize.y/this.tileMap.yCells));
          var downTilePos = addVectors(currentTilePosCenter, new PIXI.Point(0, gridSize.y/this.tileMap.yCells));
          if (distanceBetweenPoints(destination, upTilePos) < distanceBetweenPoints(destination, downTilePos)) {
            if (this.tileMap.getTileID(currentTile.x, currentTile.y - 1) == null || this.tileMap.getTileID(currentTile.x, currentTile.y - 1) > 15) {
              this.direction.y = -1;
            } else { this.direction.y = 1; }
          } else {
            if (this.tileMap.getTileID(currentTile.x, currentTile.y + 1) == null || this.tileMap.getTileID(currentTile.x, currentTile.y + 1) > 15) {
              this.direction.y = 1;
            } else { this.direction.y = -1; }
          }
        } else if (this.direction.y != 0) {
          this.direction.y = 0;
          var leftTilePos = addVectors(currentTilePosCenter, new PIXI.Point(-gridSize.x/this.tileMap.xCells, 0));
          var rightTilePos = addVectors(currentTilePosCenter, new PIXI.Point(gridSize.x/this.tileMap.xCells, 0));
          if (distanceBetweenPoints(destination, leftTilePos) < distanceBetweenPoints(destination, rightTilePos)) {
            if (this.tileMap.getTileID(currentTile.x - 1, currentTile.y) == null || this.tileMap.getTileID(currentTile.x - 1, currentTile.y) > 15) {
              this.direction.x = -1;
            } else { this.direction.x = 1; }
          } else {
            if (this.tileMap.getTileID(currentTile.x + 1, currentTile.y) == null || this.tileMap.getTileID(currentTile.x + 1, currentTile.y) > 15) {
              this.direction.x = 1;
            } else { this.direction.x = -1; }
          }
        }
      } else if (freeAdjTiles.length >= 3) {
        var tempDirection = this.direction;
        var closestDistance = distanceBetweenPoints(forwardTilePosCenter, destination);
        for (var t = 0; t < freeAdjTiles.length; t++) {
          var adjTile = freeAdjTiles[t];
          var backTile = subVectors(currentTile, this.direction);
          if (adjTile.x == backTile.x && adjTile.y == backTile.y) continue;
          if (this.canGoThroughGate == false && this.tileMap.getTileID(adjTile.x, adjTile.y) == 15) continue;
          var dir = subVectors(adjTile, currentTile);
          if (this.direction.x == -dir.x && this.direction.y == -dir.y) continue;
          var tilePosCenter = addVectors(this.tileMap.mapToWorld(adjTile.x, adjTile.y), halfTile);
          var distance = distanceBetweenPoints(tilePosCenter, destination);
          if (distance < closestDistance) {
            tempDirection = dir;
            closestDistance = distance;
          }
        }
        this.direction = tempDirection;
    }
  }

    /*
    * =========================
    * SPEED DECISION + MOVEMENT
    * =========================
    */

    if (this.alive) {
      if (this.frightened) {
        this.sprite.position = addVectors(this.sprite.position, multVector(unitVector(this.direction), 0.8*this.speed*delta));
      } else {
        this.sprite.position = addVectors(this.sprite.position, multVector(unitVector(this.direction), this.speed*delta));
      }
    } else {
      this.sprite.position = addVectors(this.sprite.position, multVector(unitVector(this.direction), 4*this.speed*delta));
    }

    /*
    * =================
    * PLAYER COLLISION
    * =================
    */

    if (distanceBetweenPoints(this.sprite.position, player.sprite.position) < halfTile.x && this.alive) {
      if (this.frightened) {
        this.alive = false; this.frightened = false; this.canGoThroughGate = true;
      } else {
        //Add code to kill player here
      }
    }

    /*
    * ===================================
    * OUTSIDE MAP COLLISION TELEPORTATION
    * ===================================
    */

    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    if (this.sprite.position.x > gridSize.x + xOff) this.sprite.position.x =  xOff;
    if (this.sprite.position.x < xOff) this.sprite.position.x = gridSize.x + xOff;
    if (this.sprite.position.y > gridSize.y + yOff) this.sprite.position.y = yOff;
    if (this.sprite.position.y < yOff) this.sprite.position.y = gridSize.y + yOff;
  }
}
