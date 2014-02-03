//From window listener, store key in array
function keyDown(e) {
    pressedKeys[e.keyCode || e.which] = true;
}

//From window listener, delete key in array
function keyUp(e) {
    pressedKeys[e.keycode || e.which] = false;
}

//Welcome state, also initializes the canvas
function welcome(canvas) {
	canvas.width = 800;
	canvas.height = 600;
	ctx = canvas.getContext("2d");
	
	ctx.fillRect(0,0,800,600);
	ctx.font="30px Arial";
	ctx.fillStyle="red";
	ctx.fillText("Press Enter to begin the war!", 220, canvas.height / 2);
	
	welcomeTime = setInterval(welcomeLoop, 30);
}

//Waits until user presses enter to start the main GameLoop
//Also assigns basic mechanic variables that don't change and leads into other variables
function welcomeLoop() {
    if (pressedKeys[13]) {
        clearInterval(welcomeTime);
        boundaries = { left: 0, right: 800, top: 0, bottom: 575 };
        shipSpeed = 1.5;
        shipWidth = 85;
        shipHeight = 75;
        rocketWidth = 30;
        rocketHeight = 30;
        regBombWidth = 30;
        regBombHeight = 30;
        bossBombAWidth = 10;
        bossBombAHeight = 40;
        bossBombBWidth = 15;
        bossBombBHeight = 15;
        bossAttackSpeed = 7;
        bossMoveSpeed = 1.5;
        alienBaseWidth = 45;
        alienBaseHeight = 40;
        bossWidth = 100;
        bossHeight = 110;
        bossFrequency = 3;
        bossBombChance = 3;
        lastFire = null;
        lastBombB = null;
        ship = document.getElementById("ship");

        startTime = null;

        score = 0;
        level = 1;
        lives = 3;

		start();
	}
}

//Main game information, all variables are defined in this state
function start() {
    bossLevel = false;
    alienSpeed = 0.85 + 0.05 * level;
    if ((level % bossFrequency) == 0) {
        bossLevel = true;
        alienWidth = bossWidth;
        alienHeight = bossHeight;
        alienSpeed *= bossMoveSpeed;
    }
    else {
        alienWidth = alienBaseWidth;
        alienHeight = alienBaseHeight;
    }
    bombBDropping = false;
    bombBIntervalCount = 0;
    bombBAmount = 0;

    bombBRate = 250;

    alienDrop = 22;
    alienPoints = 11 + 2 * level;
    bombRate = 0.0003 + 0.0002 * level;
    regBombSpeed = 0.85 + 0.05 * level;
    bombASpeed = 2.0 + 0.05 * level;
    bombBSpeed = 0.6 + 0.06 * level;
    rocketSpeed = 3;
    rocketRate = 1.7;

    alienRow = 0 + level - level/bossFrequency;
    alienCol = 2 + level - level/bossFrequency;

    if (alienRow > 6 && alienCol > 9) {
        alienRow = 6;
        alienCol = 9;
    }

    aliens = [];
    rockets = [];
    bombs = [];

    x = canvas.width / 2;
    y = boundaries.bottom - shipHeight / 2;

    bossHP = level;

    //Checks whether the level is a boss level and if so populate the boss
    if (bossLevel) {
        aliens.push(new makeAlien((canvas.width + 50) / 2, 80, 0, 0, "boss")); 
    }
    else {
        //Populates the aliens from the defined rows and columns and stores in array
        for (var i = 0; i < alienRow; i++) {
            for (var j = 0; j < alienCol; j++) {
                aliens.push(new makeAlien(0 + j * 55, 0 + i * 40, i, j, "alien"));
            }
        }
    }

    //Repeat the loop every 15 ms for smooth transitions and responces
    gameTime = setInterval(gameLoop, 15);
}

//Main game loop that runs the core of the game and calls all of the required functions
function gameLoop() {

    //Moves ship left with left-arrow key (37)
    if (pressedKeys[37]) {
    	if(x < boundaries.left + shipWidth / 2) {
    		x = x;
    	}
    	else {
    		x -= shipSpeed;
    	}
    }

    //Moves ship right with right-arrow key (39)
    if (pressedKeys[39]) {
    	if(x > boundaries.right - shipWidth / 2) {
    		x = x;
    	}
    	else {
    		x += shipSpeed;
    	}
    }

    //Creates an instance of a rocket and stores it in the rockets array when space is pressed (32)
    if (pressedKeys[32]) {
        if (lastFire == null || ((new Date()).valueOf() - lastFire) > 1000 / rocketRate) {
            rockets.push(new fireRocket(x, y));
            lastFire = (new Date()).valueOf();
        }
    }

    // clear canvas and draw ship to the canvas
    clearCanvas();
    ctx.drawImage(ship, x - shipWidth / 2, y - shipHeight / 2, shipWidth, shipHeight);

    //Create a HUD for the user to see their progress while ingame and update it as game progresses
    ctx.fillRect(0, 575, 800, 25);
    ctx.font = "18px Arial";
    ctx.fillStyle = "lime";
    ctx.fillText("Number of Lives: " + lives +
    		"                          Current Score: " + score +
    		"                          Current Level: " + level, 50, 595);

    //Takes an instance of a rocket and checks whether it is out of the canvas, if so delete it
    //from the array. If not, keep moving it up the canvas
    for (var r = 0; r < rockets.length; r++) {
        if (rockets[r].rockety < 0) {
            rockets.splice(r--, 1);
        }
        else {
            rockets[r].rockety -= rocketSpeed;
            ctx.drawImage(rockets[r].rocket, rockets[r].rocketx - rocketWidth / 2, rockets[r].rockety, rocketWidth, rocketHeight);
        }
    }

    //Takes an instance of a bomb and checks whether it is out of the canvas, if so delete it
    //from the array. If not, keep moving it down the canvas
    for (var b = 0; b < bombs.length; b++) {
        if (bombs[b].bomby > canvas.height - 25 - bombs[b].bombHeight) {
            bombs.splice(b--, 1);
        }
        else {
            if (bombs[b].bombType == "bombbleft") {
                bombs[b].bomby += bombs[b].bombSpeed;
                bombs[b].bombx = 100 / 63000 * (bombs[b].bomby- bombs[b].bombInitialY) * (bombs[b].bomby- 540) + bombs[b].bombInitialX;
            }
            else if (bombs[b].bombType == "bombbright") {
                bombs[b].bomby += bombs[b].bombSpeed;
                bombs[b].bombx = -100 / 63000 * (bombs[b].bomby - bombs[b].bombInitialY) * (bombs[b].bomby - 540) + bombs[b].bombInitialX;
            }
            else {
                bombs[b].bomby += bombs[b].bombSpeed;
            }
                ctx.drawImage(bombs[b].bomb, bombs[b].bombx - bombs[b].bombWidth / 2, bombs[b].bomby, bombs[b].bombWidth, bombs[b].bombHeight);
        }
    }

    //Define variables for left, right and bottom alien representatives
    rightMost = -5;
    rightAlien = null;
    leftMost = 1000;
    leftAlien = null;
    bottomMost = -5;
    bottomAlien = null;

    //Stores the index of the left, right, and bottom most alien from the array
    for (var k = 0; k < aliens.length; k++) {
        if (aliens[k].alienx > rightMost) {
            rightMost = aliens[k].alienx;
            rightAlien = k;
        }
        if (aliens[k].alienx < leftMost) {
            leftMost = aliens[k].alienx;
            leftAlien = k;
        }
        if (aliens[k].alieny > bottomMost) {
            bottomMost = aliens[k].alieny;
            bottomAlien = k;
        }
    }

    //Store the resulting alien co-ordinates from the indexs gathered above
    leftAlien = aliens[leftAlien].alienx;
    rightAlien = aliens[rightAlien].alienx;
    bottomAlien = aliens[bottomAlien].alieny;

    //If the alien representative reaches one of the bounds, make the alien go
    //the other direction and also drop a level down the canvas
    if (rightAlien + alienSpeed + alienWidth >= boundaries.right ||
    					leftAlien + alienSpeed <= boundaries.left) {
        alienSpeed = -alienSpeed;
        for (var move = 0; move < aliens.length; move++) {
            aliens[move].alieny = aliens[move].alieny + alienDrop;
            ctx.drawImage(aliens[move].alienImg, aliens[move].alienx, aliens[move].alieny, alienWidth, alienHeight);
        }
    }

    //If the alien representative reaches the bottom of the canvas, gameOver! 
    //If not, then move the alien across the canvas
    if (bottomAlien + alienHeight > boundaries.bottom) {
        clearInterval(gameTime);
        gameOver();
    }
    else {
        for (var move = 0; move < aliens.length; move++) {
            aliens[move].alienx = aliens[move].alienx + alienSpeed;
            ctx.drawImage(aliens[move].alienImg, aliens[move].alienx, aliens[move].alieny, alienWidth, alienHeight);
        }
    }
    if (bossLevel) {
        ctx.drawImage(document.getElementById("hpbar"), 100, 0, (600 * bossHP / level), 50);
    }

    //Go through the aliens and current rockets and check whether any intersect eachother
    //If they do, remove the rocket, add to the score, and remove the killed alien
    for (var a = 0; a < aliens.length; a++) {
        var alien = aliens[a];
        var hit = false;

        for (var r = 0; r < rockets.length; r++) {
            var rocket = rockets[r];

            if (rocket.rocketx >= alien.alienx && rocket.rocketx <= alien.alienx + alienWidth && rocket.rockety >= alien.alieny && rocket.rockety <= alien.alieny + alienHeight) {
                rockets.splice(r--, 1);
                hit = true;
                score += alienPoints;
                break;
            }
        }

        if (hit) {
            if ((bossHP == 1) || !bossLevel) {
                aliens.splice(a--, 1);
            }
            else {
                bossHP--;
            }
        }
    }

    //Store the front row of aliens in each column so that they may later fire 
    frontAliens = {};
    for (var f = 0; f < aliens.length; f++) {
        var alien = aliens[f];

        if (!frontAliens[alien.alienCol] || frontAliens[alien.alienCol].alienRow < alien.alienRow) {
            frontAliens[alien.alienCol] = alien;
        }
    }


    //Boss bombs b being dropped by the boss
    if ((bombBAmount > 0) && (lastBombB == null || (((new Date()).valueOf() - lastBombB) > bombBRate))) {
        bombs.push(new bombDrop(alien.alienx + alienWidth * 0.15, alien.alieny, bossBombBWidth, bossBombBHeight, "bombbleft", bombBSpeed));
        bombs.push(new bombDrop(alien.alienx + alienWidth * 0.85, alien.alieny, bossBombBWidth, bossBombBHeight, "bombbright", bombBSpeed));
        bombBAmount--;
        lastBombB = (new Date()).valueOf();
    }

    //Using randomization, if bombRate is higher then the generated number it will fire a bomb randomly
    for (var f = 0; f < alienCol; f++) {
        var alien = frontAliens[f];
        var fire = bombRate;
        if (bossLevel) {
            fire *= bossAttackSpeed;
        }
        if (fire > Math.random()) {
            if (bossLevel) {
                if (Math.floor((Math.random() * 10) + 1) > bossBombChance) {
                    bombs.push(new bombDrop(alien.alienx + alienWidth * 0.4, alien.alieny, bossBombAWidth, bossBombAHeight, "bomba", bombASpeed));
                    bombs.push(new bombDrop(alien.alienx + alienWidth * 0.6, alien.alieny, bossBombAWidth, bossBombAHeight, "bomba", bombASpeed));
                }
                else {
                    if (bombBAmount == 0) {
                        bombs.push(new bombDrop(alien.alienx + alienWidth * 0.15, alien.alieny, bossBombBWidth, bossBombBHeight, "bombbleft", bombBSpeed));
                        bombs.push(new bombDrop(alien.alienx + alienWidth * 0.85, alien.alieny, bossBombBWidth, bossBombBHeight, "bombbright", bombBSpeed));
                        bombBAmount = 3;
                        lastBombB = (new Date()).valueOf();
                    }
                }
            }
            else {
                bombs.push(new bombDrop(alien.alienx + alienWidth / 2, alien.alieny, regBombWidth, regBombHeight, "bomb", regBombSpeed));
            }
        }
    }

    //If any of the bombs intersect with the ship co-ordinates, it takes away a life from the user
    for (var v = 0; v < bombs.length; v++) {
        var bomb = bombs[v];
        if (bomb.bombx >= (x - shipWidth / 2) && bomb.bombx <= (x + shipWidth / 2) && bomb.bomby >= (y - shipHeight / 2) && bomb.bomby <= (y + shipHeight / 2)) {
            bombs.splice(v--, 1);
            if (lives > 0) {
                lives -= 1;
            }
        }
    }

    //If any of the aliens intersect with the ship co-ordinates, it is gameOver!
    for (var a = 0; a < aliens.length; a++) {
        var alien = aliens[a];
        if ((alien.alienx + alienWidth / 2) > (x - shipWidth / 2) &&
    		(alien.alienx - alienWidth / 2) < (x + shipWidth / 2) &&
    		(alien.alieny + alienHeight / 2) > (y - shipHeight / 2) &&
    		(alien.alieny - alienHeight / 2) < (y + shipHeight / 2)) {
            lives = 0;
        }
    }

    //If player removes all aliens from the array, the user increases level, wins current
    //level and adds score for completion
    if (aliens.length == 0) {
        score += level * 100;
        level += 1;
        clearInterval(gameTime);
        levelIntro();
    }

    //Call the pause function to pause the game using p
    if (pressedKeys[80]) {
        clearInterval(gameTime);
        pauseTime = setInterval("pause()", 20);
    }

    //If player reaches 0 lives, stop the loop and display gameOver state
    if (lives == 0) {
        bombs = [];
        clearInterval(gameTime);
        gameOver();
    }
}

//Clear the canvas so that it can be upgraded
function clearCanvas() {
    canvas.width = canvas.width;
}

//Creates a rocket object with co-ordinates
function fireRocket(x, y) {
    this.rocket = document.getElementById("rocket");
    this.rocketx = x;
    this.rockety = y;
}

//Creates a bomb object with co-ordinates
function bombDrop(x, y, width, height, id, speed) {
    if (id == "bombbleft" || id == "bombbright") {
        this.bomb = document.getElementById("bombb");
    }
    else {
        this.bomb = document.getElementById(id);
    }
    this.bombType = id;
    this.bombx = x;
    this.bomby = y;
    this.bombWidth = width;
    this.bombHeight = height;
    this.bombSpeed = speed;
    this.bombInitialX = x;
    this.bombInitialY = y;
}

//Creates an alien object with co-ordinates and it's row and column
function makeAlien(posx, posy, row, col, id) {
    this.alienImg = document.getElementById(id);
    this.alienx = posx;
    this.alieny = posy;
    this.alienRow = row;
    this.alienCol = col;
}

//The levelIntro state, once the user wins a level, this sets up the next level
//and allows for a break before the aliens start again
function levelIntro() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 600);
    ctx.font = "90px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Level: " + level, 150, canvas.height / 2);
    setTimeout(start, 3000);
}

//The pause state, that displays a paused indication and freezes gameLoop
function pause() {
    ctx.fillStyle="black";
    ctx.fillRect(0,0,800,600);
    ctx.font="90px Arial";
    ctx.fillStyle="red";
    ctx.fillText("GAME PAUSED", 90, canvas.height / 2);
    ctx.font="40px Arial";
    ctx.fillStyle="lime";
    ctx.fillText("Press u to unpause the game!", 160, 400);
    //Press u to unpause the game
    if (pressedKeys[85]) {
        clearCanvas();
        clearInterval(pauseTime);
        gameTime = setInterval("gameLoop()", 15);
    }
}

//The gameOver state, that displays the user's score and level that was reached
function gameOver() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 600);
    ctx.font = "90px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("GAMEOVER", 150, canvas.height / 4);
    ctx.font = "40px Arial";
    ctx.fillStyle = "lime";
    ctx.fillText("Final Score:  " + score, 280, 330);
    ctx.fillText("Final Level:  " + level, 285, 270);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Press Enter to try again and beat the Alien Invasion!", 58, 455);
    welcomeTime = setInterval(welcomeLoop, 30);
}

