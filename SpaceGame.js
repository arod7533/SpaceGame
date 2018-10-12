var timeOut;
function scrollToTop() {
	if (document.body.scrollTop!=0 || document.documentElement.scrollTop!=0){
		window.scrollBy(0,-50);
		timeOut=setTimeout('scrollToTop()',10);
	}
	else clearTimeout(timeOut);
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });


WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    //active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Space Mono']
    }

};

var spacefield;
var player;
var cursors;
var bullet;
var bulletTimer = 0;
var fireButton;
var bank;
var shipTrail;
var enemyShipOne;
var enemyShipTwo;
var explosions;
var shields;
var score = 0;
var scoreText;
var enemyShipOneLaunchTimer;
var enemyShipTwoLaunchTimer;
var gameOver;
var enemyBullets;


var ACCLERATION = 600;
var DRAG = 1000;
var MAXSPEED = 400;

function preload() {
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('stars', '/static/spacegame/assets/stars.jpg');
    game.load.image('spaceship', '/static/spacegame/assets/spaceship.png')
    game.load.image('bullet', '/static/spacegame/assets/laser.png')
    game.load.image('enemyShipOne', '/static/spacegame/assets/enemyShip1.png');
    game.load.image('enemyShipTwo', '/static/spacegame/assets/enemyShip2.png');
    game.load.image('laser-red', '/static/spacegame/assets/laser-red.png');
    game.load.spritesheet('explosion', '/static/spacegame/assets/explosion.png', 100, 100);
    game.load.audio('background-music', ['/static/spacegame/assets/background-music.mp3', '/static/spacegame/assets/background-music.ogg']);
}



function create() {
    
    spacefield = game.add.tileSprite(0,0,800,600,'stars');
    music = game.sound.play('background-music');
    music.loopFull();
    
    // The player 
    player = game.add.sprite(game.world.centerX, game.world.centerY + 150, 'spaceship');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.health = 100;
    player.weaponLevel = 1
    player.events.onKilled.add(function(){
        shipTrail.on = false;
    });
    player.events.onRevived.add(function(){
        shipTrail.on = true;
        shipTrail.start(false, 5000, 10);
    });
    
    cursors = game.input.keyboard.createCursorKeys();
    
    bullets = game.add.group();
    bullets.enableBody= true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', -3.4);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  Add an emitter for the ship's trail
    shipTrail = game.add.emitter(player.x, player.y + 35, 400);
    shipTrail.width = 15;
    shipTrail.makeParticles('bullet');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(100, 180);
    shipTrail.setRotation(50,-50);
    shipTrail.setAlpha(1, 0.3, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 1000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 2000, 25);

    //  The baddies!
    enemyShipOne = game.add.group();
    enemyShipOne.enableBody = true;
    enemyShipOne.physicsBodyType = Phaser.Physics.ARCADE;
    enemyShipOne.createMultiple(5, 'enemyShipOne');
    enemyShipOne.setAll('anchor.x', 0.5);
    enemyShipOne.setAll('anchor.y', 0.5);
    enemyShipOne.setAll('scale.x', 1);
    enemyShipOne.setAll('scale.y', 1);
    enemyShipOne.setAll('angle', 0);
    enemyShipOne.setAll('outOfBoundsKill', true);
    enemyShipOne.setAll('checkWorldBounds', true);
    enemyShipOne.forEach(function(enemy){
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
        enemy.damageAmount = 20;
    });

    game.time.events.add(1000, launchEnemy);

    //  Blue enemy's bullets
    TwoEnemyBullets = game.add.group();
    TwoEnemyBullets.enableBody = true;
    TwoEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    TwoEnemyBullets.createMultiple(30, 'laser-red');
    TwoEnemyBullets.setAll('alpha', 0.9);
    TwoEnemyBullets.setAll('anchor.x', 0.5);
    TwoEnemyBullets.setAll('anchor.y', 0.5);
    TwoEnemyBullets.setAll('outOfBoundsKill', true);
    TwoEnemyBullets.setAll('checkWorldBounds', true);
    TwoEnemyBullets.forEach(function(enemy){
        enemy.body.setSize(20, 20);
    });

    enemyShipTwo = game.add.group();
    enemyShipTwo.enableBody = true;
    enemyShipTwo.physicsBodyType = Phaser.Physics.ARCADE;
    enemyShipTwo.createMultiple(30, 'enemyShipTwo');
    enemyShipTwo.setAll('anchor.x', 0.5);
    enemyShipTwo.setAll('anchor.y', 0.5);
    enemyShipTwo.setAll('scale.x', .8);
    enemyShipTwo.setAll('scale.y', .8);
    enemyShipTwo.forEach(function(enemy){
        enemy.damageAmount = 40;
    });

    game.time.events.add(1000, launchEnemyTwo);

    //  An explosion pool
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach( function(explosion) {
        explosion.animations.add('explosion');
    });

    //  Shields stat
    shields = game.add.text(game.world.width - 145, 10, 'Health: ' + player.health +'%', { font: '18px Space Mono', fill: '#fff' });
    shields.render = function () {
        shields.text = 'Health: ' + Math.max(player.health, 0) +'%';
    };

    //  Score
    scoreText = game.add.text(10, 10, '', { font: '18px Space Mono', fill: '#fff' });
    scoreText.render = function () {
        scoreText.text = 'Score: ' + score;
    };
    scoreText.render();

    //  Game over text
    gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER!', { font: '84px Space Mono', fill: '#fff' });
    gameOver.anchor.setTo(0.5, 0.5);
    gameOver.visible = false;

    //Press spacebar to restart
    gameOverRestart = game.add.text(game.world.centerX, game.world.centerY + 75, 'Press any key to restart.', { font: '20px Space Mono', fill: '#fff' });
    gameOverRestart.anchor.setTo(0.5, 0.5);
    gameOverRestart.visible = false;

}

function update() {

    player.body.acceleration.x = 0;

    spacefield.tilePosition.y += 2;

    if(cursors.left.isDown)
    {
        player.body.acceleration.x = -ACCLERATION;
    }
    if(cursors.right.isDown)
    {
        player.body.acceleration.x = ACCLERATION;
    }

    //  Squish and rotate ship for illusion of "banking"
    bank = player.body.velocity.x / MAXSPEED;
    player.scale.x = 1 - Math.abs(bank) / 10;
    player.angle = bank * 10;

    //  Keep the shipTrail lined up with the ship
    shipTrail.x = player.x + 17;

    //  Stop at screen edges
    if (player.x > game.width - 35) {
        player.x = game.width - 35;
        player.body.acceleration.x = 0;
    }

    if (player.x < 5) {
        player.x = 5;
        player.body.acceleration.x = 0;
    }

    if (player.alive && (fireButton.isDown)) {
        firebullet();
    }

    //  Check collisions
    game.physics.arcade.overlap(player, enemyShipOne, shipCollide, null, this);
    game.physics.arcade.overlap(enemyShipOne, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(player, enemyShipTwo, shipCollide, null, this);
    game.physics.arcade.overlap(enemyShipTwo, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(TwoEnemyBullets, player, enemyHitsPlayer, null, this);

    //  Game over?
    if (! player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOverRestart.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart,this);
            spaceRestart = fireButton.onDown.addOnce(_restart,this);
            function _restart() {
              tapRestart.detach();
              spaceRestart.detach();
              restart();
            }
        }
    }
}


function firebullet() {

    if (game.time.now > bulletTimer){

    var BULLET_SPEED = 400;
    var BULLET_SPACING = 250;
    var bullet = bullets.getFirstExists(false);

        if (bullet)
         {

            //  Make bullet come out of tip of ship with right angle
            var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
            bullet.reset(player.x + bulletOffset, player.y);
            bullet.angle = player.angle;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
            bullet.body.velocity.x += player.body.velocity.x;
            bulletTimer = game.time.now + BULLET_SPACING;
        }
    }
}

function launchEnemy() {
    var MIN_ENEMY_SPACING = 300;
    var MAX_ENEMY_SPACING = 3000;
    var ENEMY_SPEED = 175;

    var enemy = enemyShipOne.getFirstExists(false);
    if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), 0);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = ENEMY_SPEED;
        enemy.body.drag.x = 100;
    
        //  Kill enemies once they go off screen
        if (enemy.y > game.height + 200) {
            enemy.kill();
        }
        
    }   

    //  Send another enemy soon
    enemyShipOneLaunchTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), launchEnemy);
}

function launchEnemyTwo() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 180;
    var spread = 60;
    var frequency = 70;
    var verticalSpacing = 70;
    var numEnemiesInWave = 5;
    var timeBetweenWaves = 7000;



    //  Launch wave
    for (var i =0; i < numEnemiesInWave; i++) {
        var enemy = enemyShipTwo.getFirstExists(false);
        if (enemy) {
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = 2000;
            enemy.bullets = 1;
            enemy.lastShot = 0;

            //  Update function for each enemy
            enemy.update = function(){
              //  Wave movement
              this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;

              //  Squish and rotate ship for illusion of "banking"
              bank = Math.cos((this.y) / frequency)
              this.scale.x = 0.9 - Math.abs(bank) / 8;
              this.angle =  bank * 2;
              //  Fire
              enemyBullet = TwoEnemyBullets.getFirstExists(false);
              if (enemyBullet &&
                  this.alive &&
                  this.bullets &&
                  this.y > game.width / 8 &&
                  game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle - 90);
                }

              //  Kill enemies once they go off screen
              if (this.y > game.height + 200) {
                this.kill();
              }
            };
        }
    }

    //  Send another wave soon
    enemyShipTwoLaunchTimer = game.time.events.add(timeBetweenWaves, launchEnemyTwo);
}

function shipCollide(player, enemy) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 100, false, true);
    enemy.kill();
    player.damage(enemy.damageAmount);
    shields.render();
}

function hitEnemy(enemy, bullet) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    enemy.kill();
    bullet.kill();

    // Increase score
    score += enemy.damageAmount * 10;
    scoreText.render()

}

function enemyHitsPlayer (player, bullet) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    bullet.kill();

    player.damage(bullet.damageAmount);
    shields.render()
}

function render() {
    // for (var i = 0; i < greenEnemies.length; i++)
    // {
    //     game.debug.body(greenEnemies.children[i]);
    // }
    // game.debug.body(player);
}

function restart () {
    //  Reset the enemies
    enemyShipOne.callAll('kill');
    game.time.events.remove(enemyShipOneLaunchTimer);
    game.time.events.add(1000, launchEnemy);

    enemyShipTwo.callAll('kill');
    game.time.events.remove(enemyShipTwoLaunchTimer);
    game.time.events.add(1000, launchEnemyTwo);
    TwoEnemyBullets.callAll('kill');

    //  Revive the player
    player.revive();
    player.health = 100;
    shields.render();
    score = 0;
    scoreText.render();

    //  Hide the text
    gameOver.visible = false;
    gameOverRestart.visible = false;

}





