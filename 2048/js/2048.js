function game2048(container) {
	this.container = container;
	this.tiles = new Array(16);
	this.score = 0;
}

game2048.prototype = {
	init : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			var tile = this.newTile(0);
			tile.setAttribute('index', i);
			this.container.appendChild(tile);
			this.tiles[i] = tile;
		}
		this.randomTile();
		this.randomTile();
	},

	newTile : function(val) {
		var tile = document.createElement('div');
		this.setTileVal(tile, val)
		return tile;
	},

	setTileVal : function(tile, val) {
		tile.className = 'tile tile' + val;
		tile.setAttribute('val', val);
		tile.innerHTML = val > 0 ? val : '';
	},

	randomTile : function() {
		var zeroTiles = [];
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			if (this.tiles[i].getAttribute('val') == 0) {
				zeroTiles.push(this.tiles[i]);
			}
		}
		var rTile = zeroTiles[Math.floor(Math.random() * zeroTiles.length)];
		this.setTileVal(rTile, Math.random() < 0.8 ? 2 : 4);
	},

	move : function(direction) {
		var j;
		switch (direction) {
		// 向上滑动
		case 'UP':
			for (var i = 4, len = this.tiles.length; i < len; i++) {
				j = i;
				while (j >= 4) {
					this.merge(this.tiles[j - 4], this.tiles[j]);
					j -= 4;
				}
			}
			break;
		// 向下滑动
		case 'DOWN':
			for (var i = 11; i >= 0; i--) {
				j = i;
				while (j <= 11) {
					this.merge(this.tiles[j + 4], this.tiles[j]);
					j += 4;
				}
			}
			break;
		// 向左滑动
		case 'LEFT':
			for (var i = 1, len = this.tiles.length; i < len; i++) {
				j = i;
				while (j % 4 != 0) {
					this.merge(this.tiles[j - 1], this.tiles[j]);
					j -= 1;
				}
			}
			break;
		// 向右滑动
		case 'RIGHT':
			for (var i = 14; i >= 0; i--) {
				j = i;
				while (j % 4 != 3) {
					this.merge(this.tiles[j + 1], this.tiles[j]);
					j += 1;
				}
			}
			break;
		default:
			return;
		}
		this.randomTile();
	},

	merge : function(prevTile, currTile) {
		var prevVal = prevTile.getAttribute('val');
		var currVal = currTile.getAttribute('val');
		if (currVal != 0) {
			if (prevVal == 0) {
				this.setTileVal(prevTile, currVal);
				this.setTileVal(currTile, 0);
			} else if (prevVal == currVal) {
				this.setTileVal(prevTile, prevVal * 2);
				this.setTileVal(currTile, 0);
				this.score += prevVal * 2;
				$("#score").html(this.score);
			}
		}
	},
	equal : function(tile1, tile2) {
		return tile1.getAttribute('val') == tile2.getAttribute('val');
	},
	max : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			if (this.tiles[i].getAttribute('val') == 2048) {
				return true;
			}
		}
	},
	over : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			if (this.tiles[i].getAttribute('val') == 0) {
				return false;
			}
			if (i % 4 != 3) {
				if (this.equal(this.tiles[i], this.tiles[i + 1])) {
					return false;
				}
			}
			if (i < 12) {
				if (this.equal(this.tiles[i], this.tiles[i + 4])) {
					return false;
				}
			}
		}
		return true;
	},
	clean : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			this.container.removeChild(this.tiles[i]);
		}
		this.tiles = new Array(16);
		this.score = 0;
		document.getElementById("score").innerHTML(0);
	}
}
var game, startBtn;

window.onload = gameStart;

function gameStart(){
	var container = document.getElementById('div2048');
	startBtn = document.getElementById('startBtn');
	game = game || new game2048(container);
	
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}
	
	game.init();
}

var startPos, endPos, direction, isScrolling;
window.addEventListener("touchstart", function(event) {
	var touch = event.targetTouches[0];
	startPos = {
		x : touch.screenX,
		y : touch.screenY
	};
}, false);

window.addEventListener("touchmove", function(event) {
	if (event.targetTouches.length > 1 || event.scale && event.scale !== 1)
		return;
	var touch = event.targetTouches[0];
	endPos = {
		x : touch.screenX - startPos.x,
		y : touch.screenY - startPos.y
	};
	if(Math.pow(endPos.x,2) + Math.pow(endPos.y,2) < 1){
		return;
	}
	// isScrolling为1时，表示纵向滑动，0为横向滑动
	isScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 1 : 0;
	if (isScrolling === 0) {
		event.preventDefault(); // 阻止触摸事件的默认行为，即阻止滚屏
		direction = endPos.x > 0 ? "RIGHT" : "LEFT";
	} else {
		direction = endPos.y > 0 ? "DOWN" : "UP";
	}
}, false);

window.addEventListener("touchend", function(event) {
	if (game.over()) {
		startBtn.style.display = 'block';
		startBtn.innerHTML = 'game over, replay?';
		return;
	}
	game.move(direction);
	direction = null;
}, false);

window.addEventListener('tizenhwkey', function onTizenHwKey(e) {
    if (e.keyName === 'back') {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (err) {
            console.log('Error: ', err);
        }
    }
});

