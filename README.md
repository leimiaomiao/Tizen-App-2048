# Tizen-App-2048
### 概述
2048基于web project开发，本篇主要介绍2048中的核心算法。
### 算法介绍
核心代码主要位于2048.js文件中.
此处封装了一个game2048方法，主要记录container、tiles和score信息.
<pre>
function game2048(container) {
	this.container = container;
	this.tiles = new Array(16);
	this.score = 0;
}
</pre>
此处定义了game2048相关的方法.
<pre>
game2048.prototype = {
</pre>
游戏初始化，将所有的tiles初始化为0，并随机生成两个值不为0的tiles.
<pre>
	init : function() {
		this.score = 0;
		
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			var tile = this.newTile(0);
			tile.setAttribute('index', i);
			this.container.appendChild(tile);
			this.tiles[i] = tile;
		}
		this.randomTile();
		this.randomTile();
	},
</pre>
创建一个tile实例，此处使用了DOM元素中的div.
<pre>
	newTile : function(val) {
		var tile = document.createElement('div');
		this.setTileVal(tile, val);
		return tile;
	},

	setTileVal : function(tile, val) {
		tile.className = 'tile tile' + val;
		tile.setAttribute('val', val);
		tile.innerHTML = val > 0 ? val : '';
	},
</pre>
随机生成一个tile实例
<pre>
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
</pre>
根据滑动方向改变tiles的值
<pre>
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
		document.getElementById("score").innerHTML = ""+this.score+"";
		this.randomTile();
	},
</pre>
合并两个tiles
<pre>
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
			}
		}
	},
</pre>
判断两个tile的值是否相同
<pre>
	equal : function(tile1, tile2) {
		return tile1.getAttribute('val') == tile2.getAttribute('val');
	},
</pre>
判断是否有值为2048的tile
<pre>
	max : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			if (this.tiles[i].getAttribute('val') == 2048) {
				return true;
			}
		}
	},
</pre>
判断游戏是否结束
<pre>
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
</pre>
清除所有游戏内容
<pre>
	clean : function() {
		for (var i = 0, len = this.tiles.length; i < len; i++) {
			this.container.removeChild(this.tiles[i]);
		}
		this.tiles = new Array(16);
		this.score = 0;
	}
}
</pre>
以下内容为游戏添加事件监听
<pre>
var game, startBtn, score;

window.onload = gameStart;
</pre>
为后退键添加监听
<pre>
window.addEventListener('tizenhwkey', function(e) {
	if(e.keyName == "back") {
		try {
			tizen.application.getCurrentApplication().exit();
		} catch (error) {
			console.error("getCurrentApplication(): " + error.message);
		}
	}
},false);
</pre>
游戏开始，指定container，初始化game
<pre>
function gameStart(){
	var container = document.getElementById('div2048');
	startBtn = document.getElementById('startBtn');
	score = document.getElementById("score").innerHTML="0";
	game = game || new game2048(container);
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}
	
	game.init();
	
}
</pre>
监听手指滑动，根据相对位移计算滑动方向。
<pre>
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
	score.innerHTML = game.score;
	direction = null;
}, false);

</pre>
