var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

//setting up delta time variables
var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var LAYER_COUNT = 3;

//SET THESE TO HOW BIG YOUR MAP IS tw is width and th is height
var MAP = { tw:60, th:15 }; 

var TILE = 35;
var TILESET_TILE = 70;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;


var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;

var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;

var ANIM_MAX = 6;


var tileset = document.createElement("img");
tileset.src = "tileset.png";


var cells = [];

function initializeCollision()
{
	//loop through each layer
	for ( var layerIdx = 0 ; layerIdx < LAYER_COUNT ; ++layerIdx )
	{
		cells[layerIdx] = [];
		var idx = 0;
	
		//loop through each row
		for ( var y = 0 ; y < level1.layers[layerIdx].height ; ++y)
		{
			cells[layerIdx][y] = [];
		
			//loop through each cell
			for ( var x = 0 ; x < level1.layers[layerIdx].width ; ++x)
			{
				//if the tile for this cell is not empty
				if ( level1.layers[layerIdx].data[idx] != 0 )
				{
					//set the 4 cells around it to be colliders
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y][x+1] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y-1][x] = 1;
				}
				
				//if the cell hasn't already been set to 1, set it to 0
				else if (cells[layerIdx][y][x] != 1 )
				{
					cells[layerIdx][y][x] = 0;
				}
				
				++idx;
			}
		}
	}
}

function tileToPixel(tile_coord)
{
	return tile_coord * TILE;
}

function pixelToTile(pixel)
{
	return Math.floor(pixel / TILE);
}


function cellAtTileCoord(layer, tx, ty)
{
	//if off the top, left or right of the map
	if ( tx < 0 || tx > MAP.tw || ty < 0 )
	{
		return 1;
	}
	
	//if off the bottom of the map
	if ( ty >= MAP.th )
	{
		return 0;
	}
	
	return cells[layer][ty][tx];
}

function cellAtPixelCoord(layer, x, y)
{
	var tx = pixelToTile(x);
	var ty = pixelToTile(y);
	
	return cellAtTileCoord(layer, tx, ty);
}


function drawMap(offsetX, offsetY)
{
	if (typeof(level1) === "undefined" )
	{
		alert("ADD 'level1' TO JSON FILE");
	}

	//this loops over all the layers in our tilemap
	for (var layerIdx = 0 ; layerIdx < LAYER_COUNT ; ++layerIdx )
	{
		//render everything in the current layer (layerIdx)
		//look at every tile in the layer in turn, and render them.
		
		var idx = 0;
		//look at each row
		for (var y = 0 ; y < level1.layers[layerIdx].height ; ++y)
		{
			//look at each tile in the row
			for ( var x = 0 ; x < level1.layers[layerIdx].width ; ++x)
			{
				var tileIndex = level1.layers[layerIdx].data[idx] - 1;
				
				//if there's actually a tile here
				if ( tileIndex != -1 )
				{
					//draw the current tile at the current location
					
					//where in the tilemap is the current tile?
					//where in the world should the current tile go?
					
					//source x in the tileset
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * 
												(TILESET_TILE + TILESET_SPACING);
					//source y in the tileset
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_X)) * 
												(TILESET_TILE + TILESET_SPACING);
					
					//destination x on the canvas
					var dx = x * TILE - offsetX;
					//destination y on the canvas
					var dy = (y-1) * TILE - offsetY;
					
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, 
											   dx, dy, TILESET_TILE, TILESET_TILE);
				}
				++idx;
			}
		}
	}
}

var keyboard = new Keyboard();
var player = new Player();
var enemy = new Enemy();

var timer = 0;

var deathSkull = document.createElement("img");
deathSkull.src = "skull.png";


//DOWNLOAD THE background.ogg FILE FROM PORTAL
//DOWNLIAD THE howler.hs FILE FROM PORTAL
//PUT BOTH FILES IN YOUR GAME FOLDER
//ADD THIS CODE ABOVE RUN FUNCTION 
var bgMusic = new Howl(
	{
		urls:["background.ogg"],
		loop:true,
		buffer:true,
		volume:0.5
	});

bgMusic.play();



function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	

	//ADDED THIS
	timer += deltaTime;

	if ( deltaTime > 0.03 )
	{
		deltaTime = 0.03;
	}
	
	var xScroll = player.position.x - player.startPos.x;
	var yScroll = 0;

	if ( xScroll < 0 )
		xScroll = 0;
	if ( xScroll > MAP.tw * TILE - canvas.width)
		xScroll = MAP.tw * TILE - canvas.width;

	if ( yScroll < 0 )
		yScroll = 0;
	if ( yScroll > MAP.th * TILE - canvas.height)
		yScroll = MAP.th * TILE - canvas.height;

	drawMap(xScroll, yScroll);

	enemy.update(deltaTime);
	enemy.draw(xScroll,yScroll);

	if ( player.health > 0 )
	{
		player.update(deltaTime);
		player.draw(xScroll,yScroll);
	}
	else
	{
		player.deathCount += 170;
		var skullPos = new Vector2();
		skullPos.set(0, 0);

		for ( var skull = 0 ; skull < player.deathCount ; ++skull)
		{
			context.drawImage(deathSkull, skullPos.x, skullPos.y, 32, 32);
			skullPos.x += 40;

			if ( skullPos.x >= canvas.width)
			{
				skullPos.x -= canvas.width;
				skullPos.y += 40;
				if ( skullPos.y > canvas.height )
				{
					skullPos.y -= (canvas.height);
					skullPos.x += (10);
				}
			}

		}
	}




	//ADDED THESE
	context.fillStyle = "black";
	context.font = "32px Arial";
	var timerSeconds = Math.floor(timer);
	var timerMilliseconds = Math.floor((timer - timerSeconds) * 1000);
	var textToDisplay = "Level Timer: " + timerSeconds + ":" + timerMilliseconds;
	context.fillText(textToDisplay, canvas.width - 325, 50);

	if ( player.health <= 0 )
	{
		//player.position.set(350, 50);
		//player.health = 100;
	}

	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}


initializeCollision();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
