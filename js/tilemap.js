function TileMap() {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.xCells = 1;
    this.yCells = 1;
    this.mapID = -1;
    this.remainingPts = -1;
    this.tileContainer = new PIXI.Container();
    app.stage.addChild(this.tileContainer);
    this.graphics = new PIXI.Graphics();
    app.stage.addChild(this.graphics);

    this.getSmallestScreenSize = function() {
      if (window.innerWidth <= window.innerHeight) {
        return window.innerWidth;
      } else {
        return window.innerHeight;
      }
    }

    this.getGridSize = function() {
      var maxSize = this.getSmallestScreenSize();
      var maxCells; if (this.xCells > this.yCells) { maxCells = this.xCells; } else { maxCells = this.yCells; }
      var cellSize = maxSize/maxCells;
      return new PIXI.Point(cellSize*this.xCells, cellSize*this.yCells);
    }

    this.displayGrid = function() {
      this.graphics.clear();
      var lineWidth = 3;
      var lineColor = 0xFFFFFF;
      this.graphics.lineStyle(lineWidth, lineColor, 0xFF);
      var gridSize = this.getGridSize();
      var xOff = (window.innerWidth - gridSize.x)/2;
      var yOff = (window.innerHeight - gridSize.y)/2;

      for (var x = 0; x < this.xCells+1; x++) {
        this.graphics.moveTo(x*gridSize.x/this.xCells + xOff, yOff);
        this.graphics.lineTo(x*gridSize.x/this.xCells + xOff, yOff + gridSize.y);
      }
      for (var y = 0; y < this.yCells+1; y++) {
        this.graphics.moveTo(xOff, y*gridSize.y/this.yCells + yOff);
        this.graphics.lineTo(xOff + gridSize.x, y*gridSize.y/this.yCells + yOff);
      }
  }

  this.getAdjacentTilesPos = function(xCenter, yCenter) {
    var tiles = [];
    tiles.push(new PIXI.Point(xCenter, yCenter - 1));
    tiles.push(new PIXI.Point(xCenter - 1, yCenter));
    tiles.push(new PIXI.Point(xCenter, yCenter + 1));
    tiles.push(new PIXI.Point(xCenter + 1, yCenter));
    return tiles;
  }

  this.getTile = function(x, y) {
    var key = String(x) + "," + String(y);
    return this.tileContainer.getChildByName(key) || null;
  }

  this.getTileID = function(x, y) {
    var tile = this.getTile(x, y);
    if (tile != null) {
      return tile.type;
    } else {
      return null;
    }
  }

  this.setTileID = function(x, y, type) {
    var tile = this.getTile(x, y);
    if (tile != null) {
      if (type == 0) {
        this.tileContainer.removeChild(tile);
      } else {
        tile.texture = PIXI.Texture.from("assets/textures/" + String(type) + ".png");
        tile.type = type;
      }
    }
  }

  this.getFreeAdjacentTilesPos = function(xCenter, yCenter) {
    var adjacentTiles = this.getAdjacentTilesPos(xCenter, yCenter);
    var freeAdjacentTiles = [];
    for (var t = 0; t < adjacentTiles.length; t++) {
      var tile = adjacentTiles[t];
      if (this.getTileID(tile.x, tile.y) == null || this.getTileID(tile.x, tile.y) > 14) {
        freeAdjacentTiles.push(tile);
      }
    }
    return freeAdjacentTiles;
  }

  this.getViewTilesPos = function(xCenter, yCenter, dir) {
    var adjacentTiles = this.getAdjacentTilesPos(xCenter, yCenter);
    var backwardTile = new PIXI.Point(xCenter - dir.x, yCenter - dir.y);
    var freeAdjacentTiles = [];
    for (var t = 0; t < adjacentTiles.length; t++) {
      var tile = adjacentTiles[t];
      if (tile.x == backwardTile.x && tile.y == backwardTile.y) continue;
      if (this.getTileID(tile.x, tile.y) == null || this.getTileID(tile.x, tile.y) > 14) {
        freeAdjacentTiles.push(tile);
      }
    }
    return freeAdjacentTiles;

  }

  this.mapToWorld = function(x, y) {
    var gridSize = this.getGridSize();
    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    return new PIXI.Point(x*(gridSize.x/this.xCells) + xOff, y*(gridSize.y/this.yCells) + yOff);
  }

  this.worldToMap = function(x, y) {
    var gridSize = this.getGridSize();
    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    return new PIXI.Point(Math.floor((x - xOff)/(gridSize.x/this.xCells)), Math.floor((y - yOff)/(gridSize.y/this.yCells)));
  }

  this.loadMap = function(mpID) {
    var mp = MAPS[mpID];
    this.mapID = mpID;
    this.xCells = mp["size_x"];
    this.yCells = mp["size_y"];
    this.remainingPts = 0;
    while(this.tileContainer.children[0]) { this.tileContainer.removeChild(this.tileContainer.children[0]); }
    var gridSize = this.getGridSize();
    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    for (var c = 0; c < mp["sprites"].length; c++) {
      var x = c % (this.xCells);
      var y = Math.floor(c / (this.xCells));
      var type = String(mp["sprites"][c]);
      if (type == "16") { type = "pts"; this.remainingPts++; }
      if (type == "17") { type = "big_pts"; this.remainingPts++; }
      if (type == "15") { type = "gateway"; }
      if (type!="0") {
        var key = String(x) + "," + String(y);
        var sprite = new PIXI.Sprite.from("assets/textures/" + type + ".png");
        sprite.position = new PIXI.Point(x*gridSize.x/this.xCells + xOff, y*gridSize.y/this.yCells + yOff);
        sprite.width = gridSize.x/this.xCells;
        sprite.height = gridSize.y/this.yCells;
        sprite.name = key;
        sprite.type = mp["sprites"][c];
        this.tileContainer.addChild(sprite);
      }
    }
  }

  this.isInArea = function(pos, p1, p2) { if (pos.x >= p1.x && pos.x <= p2.x && pos.y >= p1.y && pos.y <= p2.y) { return true; } else { return false; } }

  this.adjustSizeAndPosition = function() {
    var gridSize = this.getGridSize();
    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;
    for (var x = 0; x < this.xCells; x++) {
      for (var y = 0; y < this.yCells; y++) {
        var tile = this.getTile(x, y);
        if (tile != null) {
          tile.position  = new PIXI.Point(x*gridSize.x/this.xCells + xOff, y*gridSize.y/this.yCells + yOff);
          tile.width = gridSize.x/this.xCells;
          tile.height = gridSize.y/this.yCells;
        }
      }
    }
  }
}
