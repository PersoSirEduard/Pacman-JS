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

  this.getAdjacentTilesPos = function(xCenter, yCenter, includeSelf = false, sides = false) { // Get relative adjacent tiles (directly in contact)
    var tiles = [];
    // if (sides) tiles.push(new PIXI.Point(xCenter - 1, yCenter - 1));
    // tiles.push(new PIXI.Point(xCenter, yCenter - 1));
    // tiles.push(new PIXI.Point(xCenter - 1, yCenter));
    // if (includeSelf) tiles.push(new PIXI.Point(xCenter, yCenter));
    // tiles.push(new PIXI.Point(xCenter, yCenter + 1));
    // tiles.push(new PIXI.Point(xCenter + 1, yCenter));
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        if (x == 0 && y == 0 && !includeSelf) continue;
        if (sides) {
          if (Math.abs(x) == 1 && Math.abs(y)) {
            tiles.push(new PIXI.Point(null, null));
          } else {
            tiles.push(new PIXI.Point(xCenter + x, yCenter + y));
          }
        } else {
          if (Math.abs(x) == 1 && Math.abs(y)) continue;
          tiles.push(new PIXI.Point(xCenter + x, yCenter + y));
        }
      }
    }
    return tiles;
  }

  this.getSurroundingTilesPos = function(xCenter, yCenter, includeSelf = false) { // Get relative surrounding tiles
    var tiles = []
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        if (x == 0 && y == 0 && !includeSelf) continue;
        tiles.push(new PIXI.Point(xCenter + x, yCenter + y));
      }
    }
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
    var adjacentTiles = this.getAdjacentTilesPos(xCenter, yCenter, false, false);
    var freeAdjacentTiles = [];
    for (var t = 0; t < adjacentTiles.length; t++) {
      var tile = adjacentTiles[t];
      var tileID = this.getTileID(tile.x, tile.y);
      if (tileID == null || tileID == "?" || tileID == "$" || tileID == "%") {
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
      var tileID = this.getTileID(tile.x, tile.y);
      if (tileID == null || tileID == "?" || tileID == "$" || tileID == "%") {
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

  this.loadMap = function(mpID) { // Load map into the game from maps.js
    var mp = MAPS[mpID];

    this.mapID = mpID;
    this.xCells = mp["size_x"];
    this.yCells = mp["size_y"];
    this.remainingPts = 0;

    while(this.tileContainer.children[0]) { this.tileContainer.removeChild(this.tileContainer.children[0]); } // Erase data from previous map
    var gridSize = this.getGridSize();
    var xOff = (window.innerWidth - gridSize.x)/2;
    var yOff = (window.innerHeight - gridSize.y)/2;

    for (var c = 0; c < mp["sprites"].length; c++) {
      var x = c % (this.xCells);
      var y = Math.floor(c / (this.xCells));
      var type = String(mp["sprites"][c]);

      switch (type) {
        case "?": // Gateway tile
          type = "gateway";
          break;
        case "%": // Credit tile
          type = "pts"; this.remainingPts++;
          break;
        case "$": // Big credit tile
          type = "big_pts"; this.remainingPts++;
          break;
        case "#": // Wall tile
          // **AUTO TILE**
          var adjTilePos = this.getAdjacentTilesPos(x, y, true, true);
          //console.log(adjTilePos)
          var adjTiles = [];
          for (var t = 0; t < adjTilePos.length; t++) {
            var cAdj = adjTilePos[t].y * this.xCells + adjTilePos[t].x; // Convert coordinates to index value
            var adjTile = String(mp["sprites"][cAdj]) || "0";
            if (adjTilePos[t].x == null && adjTilePos[t].y == null) adjTile = "0"; // Out of boundary measure
            if (adjTilePos[t].x < 0 || adjTilePos[t].y < 0) adjTile = "0"; // Out of boundary measure
            if (adjTilePos[t].x >= this.xCells || adjTilePos[t].y >= this.yCells) adjTile = "0"; // Out of boundary measure
            if (adjTile != "#" && adjTile != "?") adjTile = "0"; // If not a wall, consider it as a void tile
            if (adjTile == "?") adjTile = "#" // Gateway
            adjTiles.push(adjTile);
          }
          type = getAutoTileValue(adjTiles, "wall");
          break;
        default:
          continue;
      }

      if (type!="0") { // Tile "0" being empty
        var key = String(x) + "," + String(y);
        var sprite = new PIXI.Sprite.from("assets/textures/" + type + ".png");
        sprite.position = new PIXI.Point(x*gridSize.x/this.xCells + xOff, y*gridSize.y/this.yCells + yOff);
        sprite.width = gridSize.x/this.xCells;
        sprite.height = gridSize.y/this.yCells;
        sprite.name = key;
        sprite.type = String(mp["sprites"][c]);
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
