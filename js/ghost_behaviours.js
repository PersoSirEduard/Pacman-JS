var targetMode = 1;
var playing = true;
var chaseModeTime = 20;
var scatterModeTime = 7;
var frightenedModeTime = 10;
var frightenedModeSprite = 1;
var lastedTime = 0;

function updateTimerMode(delta) {
  if (playing) {
    lastedTime += delta/100;
    for (var g = 0; g < ghosts.length; g++) {
      if (ghosts[g].imprisoned) {
        ghosts[g].lastedTimePrisonSentence += delta/100;
        if (ghosts[g].lastedTimePrisonSentence >= ghosts[g].prisonSentence) {
          ghosts[g].lastedTimePrisonSentence = 0;
          ghosts[g].canGoThroughGate = true;
        }
      }
    }
    switch (targetMode) {
      case 0: //Chase
        if (lastedTime >= chaseModeTime) {
          lastedTime = 0;
          targetMode = 1;
        }
        break;
      case 1: //Scatter
        if (lastedTime >= scatterModeTime) {
          lastedTime = 0;
          targetMode = 0;
        }
        break;
      case 2: //Run away
        frightenedModeSprite = Math.ceil(Math.sin(10*Math.pow(lastedTime, 2)/frightenedModeTime));
        if (lastedTime >= frightenedModeTime) {
          lastedTime = 0;
          targetMode = 1;
          for (var g = 0; g < ghosts.length; g++) { ghosts[g].frightened = false; }
        }
        break;
    }
  }
}

function getGhostDestination(ghost) {
  if (ghost.alive) {
    if (ghost.imprisoned) return getOutMode(ghost.tileMap);
    switch (targetMode) {
      case 0: //Chase
        return chaseMode(ghost.ghostType, ghost.tilePos, ghost.tileMap);
      case 1: //Scatter
        return scatterMode(ghost.ghostType, ghost.tileMap);
      case 2: //Run away
        return frightenedMode(ghost.tileMap);
    }
  } else {
    return deadMode(ghost.tileMap);
  }
}

function scatterMode(ghostType, map) {
  var gridSize = map.getGridSize();
  var halfTile = new PIXI.Point(gridSize.x/map.xCells/2, gridSize.y/map.yCells/2);
  var anchorTile = new PIXI.Point(MAPS[map.mapID]["scatter_pos"][ghostType][0], MAPS[map.mapID]["scatter_pos"][ghostType][1]);
  return addVectors(map.mapToWorld(anchorTile.x, anchorTile.y), halfTile);
}

function chaseMode(ghostType, currentTile, map) {
  var gridSize = map.getGridSize();
  var halfTile = new PIXI.Point(gridSize.x/map.xCells/2, gridSize.y/map.yCells/2);
  switch (ghostType) {
    case 0:
      return player.sprite.position;
    case 1:
      var tile = addVectors(player.tilePos, multVector(player.lastestDirection, 4));
      return addVectors(map.mapToWorld(tile.x, tile.y), halfTile);
    case 2:
      var currentGhostPos = addVectors(map.mapToWorld(currentTile.x, currentTile.y), halfTile);
      var forwardTile = addVectors(player.tilePos, multVector(player.lastestDirection, 2));
      var forwardVector = addVectors(map.mapToWorld(forwardTile.x, forwardTile.y), halfTile);
      var blinkyPos;
      for (var g = 0; g < ghosts.length; g++) {
        if (ghosts[g].ghostType == 0) {
          blinkyPos = ghosts[g].sprite.position;
          break;
        }
      }
      return addVectors(multVector(subVectors(forwardVector, blinkyPos), 2), blinkyPos);
    case 3:
      var tileDis = subVectors(currentTile, player.tilePos);
      if (getVectorMag(tileDis) > 8) {
        return player.sprite.position;
      } else {
        return scatterMode(ghostType, map);
      }
  }
}

function frightenedMode(map) {
  var gridSize = map.getGridSize();
  var halfTile = new PIXI.Point(gridSize.x/map.xCells/2, gridSize.y/map.yCells/2);
  var tile;
  do {
    tile = new PIXI.Point(Math.random() * map.xCells, Math.random() * map.yCells);
  } while(getVectorMag(subVectors(tile, player.tilePos)) < 4);
  return map.mapToWorld(tile.x, tile.y);
}

function deadMode(map) {
  var gridSize = map.getGridSize();
  var halfTile = new PIXI.Point(gridSize.x/map.xCells/2, gridSize.y/map.yCells/2);
  return addVectors(map.mapToWorld(MAPS[map.mapID]["master_home_pos"][0], MAPS[map.mapID]["master_home_pos"][1]), halfTile);
}

function getOutMode(map) {
  var gridSize = map.getGridSize();
  var halfTile = new PIXI.Point(gridSize.x/map.xCells/2, gridSize.y/map.yCells/2);
  return addVectors(map.mapToWorld(MAPS[map.mapID]["get_out_pos"][0], MAPS[map.mapID]["get_out_pos"][1]), halfTile);
}
