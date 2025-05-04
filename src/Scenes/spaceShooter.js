class SpaceShooter extends Phaser.Scene {
    constructor() {
        super("spaceShooter");
        this.my = {sprite: {}};
    }
    preload(){
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.audio("bgMusic", "bgMusic.mp3"); //bg music made by me
        this.load.audio("bgMusicBoss", "bgMusicBoss.mp3"); //bg music made by me again
        this.load.audio("laserPlayer", "laserPlayer.ogg");
        this.load.audio("explosion", "explosion.ogg");

        this.load.image("greenAlien", "shipGreen_manned.png"); 
        this.load.image("redAlien", "shipPink_manned.png");
        this.load.image("bossAlien", "enemyBlack3.png");
        this.load.atlasXML("aliens", "spritesheet_spaceships.png", "spritesheet_spaceships.xml");
        this.load.atlasXML("spaceShooter", "sheet.png", "sheet.xml");
        

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>spaceShooter.js<br><br>A - move left || D - move right<br>Space - shoot<br></h2>'
    }
    create(){

        if (this.sys.game.globals.highscore === undefined) {
            this.sys.game.globals.highscore = 0;
        }
        
        this.cameras.main.setBackgroundColor(0x000033);
        this.graphics = this.add.graphics();
        let my = this.my;

        //sound effects/music
        this.musicStarted = false;
        this.music = this.sound.add("bgMusic", {
            volume: 0.5,
            loop: true
        });


        this.music.play();
        this.laserSound = this.sound.add("laserPlayer");
        this.explosion = this.sound.add("explosion");

        //Aliens
        this.greenAliens = [];
        this.greenAlienBullets = [];
        this.greenAliensFireRate = 2000; // 2 milliseconds between shots per alien
        this.greenAlienBulletSpeed = 5;
        this.greenAlienRows = [];

        this.redAliens = [];
        this.redAlienBullets = [];
        this.redAliensFireRate = 1000;
        this.redAlienBulletSpeed = 7;
        this.redAlienRows = [];


        my.sprite.bossAlien = this.add.sprite(-3000, 70, "spaceShooter", "enemyBlack3.png");
        my.sprite.bossAlien.setDisplaySize(400, 400);
        my.bossHealth = 500;
        my.bossAlive = false;


        my.sprite.bossAlienHealthbar = this.add.sprite(game.config.width / 2, 25, "spaceShooter", "laserRed02.png");
        my.sprite.bossAlienHealthbar.setDisplaySize(20, (my.bossHealth*2));
        my.sprite.bossAlienHealthbar.angle = 90;
        
        my.sprite.bossAlien.visible = false;
        my.sprite.bossAlienHealthbar.visible = false;
        
        this.bossAlienPointsArray = [
            game.config.width/2, 0,
            game.config.width/2, 70
        ]

        //Line Test
        this.greenAlienPointsArray = [
            20, 50,
            game.config.width - 51, 50
        ];

        this.redAlienPointsArray = [
            300, 150,
            400, 50,
            500, 150,
            400, 250,
            300, 150,
            200, 50,
            100, 150,
            200, 250,
            300, 150
        ];
        
        this.redAlienCurve = new Phaser.Curves.Spline(this.redAlienPointsArray);
        this.greenAlienCurve = new Phaser.Curves.Spline(this.greenAlienPointsArray);
        this.bossAlienCurve = new Phaser.Curves.Spline(this.bossAlienPointsArray);
        this.xImages = [];

        let yOffsets = [50, 120, 190];  // y positions for each row

        // Create 3 spline paths
        for (let i = 0; i < 3; i++) {
            let points = [20, yOffsets[i], game.config.width - 51, yOffsets[i]];
            let curve = new Phaser.Curves.Spline(points);
            this.greenAlienRows.push(curve);
            // this.drawLine(curve);

            // let redCurve = new Phaser.Curves.Spline(points);
            // this.redAlienPointsArray.push(redCurve);
            // this.drawLine(redCurve);
        }


        //spawning
        this.playerMovable = false;
        this.wave = 1;
        this.spawnWave(this.wave);
        this.waveInProgress = false;
        


        //user character
        my.sprite.user = this.add.sprite(game.config.width/2, game.config.height - 60, "spaceShooter", "enemyBlue1.png");
        my.sprite.user.setDisplaySize(50, 50);
        my.sprite.user.flipY = true;

        //laserbeam player
        this.bulletSpeed = 9;
        my.sprite.bullet = []; 
        this.maxBullets = 6;

        //keybinds
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        //player values
        this.playerSpeed = 12;
        this.playerLives = 5;
        this.playerScore = 0;
        
        //top right scoreboard:
        this.infoText = this.add.text(game.config.width - 20, 20, 'Score: ' + this.playerScore, {
            font: '20px Trebuchet MS',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoText.setOrigin(1, 0);

        //top right HighScore:
        this.infoTextHighscore = this.add.text(game.config.width - 20, 40, 'Highscore: ' + this.sys.game.globals.highscore, {
            font: '20px Trebuchet MS',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoTextHighscore.setOrigin(1, 0);

        //top right lives:
        this.infoLives = this.add.text(game.config.width - 20, 60, 'Lives: ' + this.playerLives, {
            font: '20px Trebuchet MS',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoLives.setOrigin(1, 0);

        
        
    }

    spawnWave(number) {
        switch (number) {
            case 1:
                // Initial immediate spawns for wave 1
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
    
                for (let i = 0; i < 17; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }
    
                // Start game text
                this.time.delayedCall(1300, () => {
                    this.musicStarted = true;
                    this.playerMovable = true;
    
                    this.gameStartText = this.add.text(game.config.width / 2, game.config.height / 2, "Game Start", {
                        font: '100px Trebuchet MS',
                        fill: '#ffffff',
                        align: 'center'
                    });
                    this.gameStartText.setOrigin(0.5, 0.5);
    
                    // Hide text after 2 seconds
                    this.time.delayedCall(1500, () => {
                        this.gameStartText.destroy();
                    });
                });
                break;
    
            case 2:
                // Initial immediate spawns for wave 1
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
    
                for (let i = 0; i < 20; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }
                for (let i = 0; i < 3; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnRedAlien();
                    });
                }
                break;

            case 3:
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
                for (let i = 0; i < 22; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }

                for (let i = 0; i < 5; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnRedAlien();
                    });
                }

                
                break;
            case 4:
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }

                for (let i = 0; i < 27; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }


                for (let i = 0; i < 8; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnRedAlien();
                    });
                }
                break;

            case 5:
                // Initial immediate spawns for wave 1
                if (this.music && this.music.isPlaying) {
                    this.music.stop();
                }
            
                // Start boss battle music
                this.music = this.sound.add("bgMusicBoss", {
                    volume: 0.75,
                    loop: true
                });

                
                this.music.play();

                this.my.sprite.bossAlien = this.add.follower(this.bossAlienCurve, this.bossAlienPointsArray[0], this.bossAlienPointsArray[1], "bossAlien");
                this.my.sprite.bossAlienHealthbar.visible = true;
                this.my.bossAlive = true;

                this.my.sprite.bossAlien.setDisplaySize(250, 250);

                // Start following path
                this.my.sprite.bossAlien.startFollow({
                    from: 0,
                    to: 1,
                    delay: 0,
                    duration: 5000,
                    ease: 'Linear',
                    repeat: -1,
                    yoyo: true,
                    rotateToPath: false,
                    rotationOffset: 0
                });

                this.children.bringToTop(this.my.sprite.bossAlienHealthbar);
    
                for (let i = 0; i < 30; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }
    
                // Start game text
                this.time.delayedCall(1500, () => {
                    this.musicStarted = true;
                    this.playerMovable = true;
    
                    this.gameStartText = this.add.text(game.config.width / 2, game.config.height / 2, "BOSS STAGE", {
                        font: '100px Trebuchet MS',
                        fill: '#ff0000',
                        align: 'center'
                    });
                    this.gameStartText.setOrigin(0.5, 0.5);
    
                    // Hide text after 2 seconds
                    this.time.delayedCall(1500, () => {
                        this.gameStartText.destroy();
                    });
                });

                this.time.addEvent({
                    delay: 1000, // every second
                    loop: true,
                    callback: () => {
                        if (this.my.bossAlive) {
                            let row = Phaser.Math.Between(0, 2);
                            this.spawnGreenAlien(row);
                        }
                    }
                });

                this.time.addEvent({
                    delay: 6000, // every 6 seconds
                    loop: true,
                    callback: () => {
                        if (this.my.bossAlive) {
                            this.spawnRedAlien();
                        }
                    }
                });


                break;
    
            default:
                console.log("Wave number not recognized.");
                break;
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    spawnRedAlien() {
        let alien = this.add.follower(this.redAlienCurve, this.redAlienPointsArray[0], this.redAlienPointsArray[1], "redAlien");
        alien.setDisplaySize(50, 50);
        alien.visible = true;
    
        alien.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 2000,
            ease: 'Linear',
            repeat: -1,
            yoyo: false,
            rotateToPath: false,
            rotationOffset: 0
        });
    
        this.redAliens.push(alien);
    
        // Randomized firing interval
        let fireRate = Phaser.Math.Between(500, 800);

        this.time.addEvent({
            delay: fireRate,
            loop: true,
            callback: () => {
                if (alien.active) {
                    let bullet = this.add.sprite(alien.x, alien.y + alien.displayHeight / 2, "spaceShooter", "laserRed03.png");
                    bullet.setDisplaySize(10, 20);
                    this.redAlienBullets.push(bullet);
                }
            }
        });
    }
    
    fireRedAlienBullet(alien) {
        let bullet = this.add.sprite(alien.x, alien.y + alien.displayHeight / 2, "spaceShooter", "laserRed03.png");
        bullet.setDisplaySize(10, 20);
        this.redAlienBullets.push(bullet);
    }

    spawnGreenAlien(row) {
        let curve = this.greenAlienRows[row];
        let alien = this.add.follower(curve, curve.points[0].x, curve.points[0].y, "greenAlien");


    
        alien.setDisplaySize(50, 50);

        alien.visible = true;
    
        alien.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 5000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true,
            rotateToPath: false,
            rotationOffset: 0
        });
    
        this.greenAliens.push(alien);
        let fireRate = Phaser.Math.Between(1000, 3000);

        this.time.addEvent({
            delay: fireRate,
            loop: true,
            callback: () => {
                if (alien.active) {
                    let bullet = this.add.sprite(alien.x, alien.y + 20, "spaceShooter", "laserGreen05.png");
                    bullet.setDisplaySize(10, 20);
                    this.greenAlienBullets.push(bullet);
                }
            }
        });
    }

    // Draws the points/line
    drawLine(curve) {
        this.graphics.lineStyle(2, 0xffffff, 1);
        curve.draw(this.graphics, 32);
    }
    

    waveClearText() {
        this.waveClearTextMessage = this.add.text(game.config.width / 2, game.config.height / 2, "Wave Cleared", {
            font: '100px Trebuchet MS',
            fill: '#ffffff',
            align: 'center'
        });
        this.waveClearTextMessage.setOrigin(0.5, 0.5);

        // Hide text after 2 seconds
        this.time.delayedCall(1500, () => {
            this.waveClearTextMessage.destroy();
            if (this.wave < 5) {
                this.waveClearTextMessage = this.add.text(game.config.width / 2, game.config.height / 2, "Wave " + this.wave, {
                font: '100px Trebuchet MS',
                fill: '#ffffff',
                align: 'center'
            });
            this.waveClearTextMessage.setOrigin(0.5, 0.5);
            }

        });

        this.time.delayedCall(3000, () => {
                this.waveClearTextMessage.destroy();
        });
    }

    playerDeathText() {
        this.playerMovable = false;  // prevent movement while "dead"
        this.my.sprite.user.visible = false;
        this.my.sprite.user.x = -300
        this.countdown = 3;
        this.playerLives--;
        this.infoLives.setText('Lives: ' + this.playerLives);

        if (this.playerLives === 0) {
            this.music.stop();
            this.scene.start("gameOverScene");
        } else {
            // Show "YOU DIED"
            this.deathText = this.add.text(game.config.width / 2, game.config.height / 2, "YOU DIED \n LIVES REMAINING :" + this.playerLives, {
                font: '75px Trebuchet MS',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
        
            // After 1.5 seconds, start countdown
            this.time.delayedCall(2500, () => {
                this.deathText.destroy();
                this.deathText = this.add.text(game.config.width / 2, game.config.height / 2, "Respawning in " + 3, {
                    font: '75px Trebuchet MS',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5, 0.5);
            });

            this.time.delayedCall(3500, () => {
                this.deathText.destroy();
                this.deathText = this.add.text(game.config.width / 2, game.config.height / 2, "Respawning in " + 2, {
                    font: '75px Trebuchet MS',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5, 0.5);
            });

            this.time.delayedCall(4500, () => {
                this.deathText.destroy();
                this.deathText = this.add.text(game.config.width / 2, game.config.height / 2, "Respawning in " + 1, {
                    font: '75px Trebuchet MS',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5, 0.5);
            });

            this.time.delayedCall(5500, () => {
                this.deathText.destroy();
                for (let i = this.redAlienBullets.length - 1; i >= 0; i--) {
                    let bullet = this.redAlienBullets[i];
                        bullet.destroy();
                        this.redAlienBullets.splice(i, 1);
                        continue;
                }

                for (let i = this.greenAlienBullets.length - 1; i >= 0; i--) {
                    let bullet = this.greenAlienBullets[i];
                        bullet.destroy();
                        this.greenAlienBullets.splice(i, 1);
                        continue;
                }

                this.playerMovable = true; 
            this.my.sprite.user.visible = true;
            this.my.sprite.user.x = game.config.width / 2;
            });
        }
    
        
    }

    update(){
        let my = this.my;

        if (this.dKey.isDown && my.sprite.user.x < game.config.width - 51 && this.playerMovable) {
            my.sprite.user.x += this.playerSpeed;
        }

        if (this.aKey.isDown && my.sprite.user.x > 51 && this.playerMovable) {
            my.sprite.user.x -= this.playerSpeed;
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.playerMovable) {
            //  bullet spawner
            if (my.sprite.bullet.length < this.maxBullets) {
                let bullet = this.add.sprite(
                    my.sprite.user.x,
                    my.sprite.user.y - (my.sprite.user.displayHeight / 2),
                    "spaceShooter",
                    "laserBlue05.png"
                );

                bullet.setDisplaySize(15, 30);
                my.sprite.bullet.push(bullet);
                let randomRate = Phaser.Math.FloatBetween(1.4, 1.6);
                this.laserSound.play({ 
                    rate: randomRate,
                    volume: 0.1
                 });
            }
        }
        //USER BULLETS
        for (let i = my.sprite.bullet.length - 1; i >= 0; i--) {
            let bullet = my.sprite.bullet[i];
            bullet.y -= this.bulletSpeed;
        
            let bulletRemoved = false;
        
            if (bullet.y < 0) {
                bullet.destroy();
                my.sprite.bullet.splice(i, 1);
                continue;
            }
        
            // Green aliens
            for (let j = this.greenAliens.length - 1; j >= 0; j--) {
                let alien = this.greenAliens[j];
                if (this.collides(bullet, alien)) {
                    bullet.destroy();
                    alien.destroy();
                    my.sprite.bullet.splice(i, 1);
                    this.greenAliens.splice(j, 1);
                    this.explosion.play({ volume: 0.3 });
                    this.playerScore += 100;
                    this.infoText.setText('Score: ' + this.playerScore);
                    if (this.playerScore > this.sys.game.globals.highscore) {
                        this.sys.game.globals.highscore = this.playerScore;
                        this.infoTextHighscore.setText('Highscore: ' + this.sys.game.globals.highscore);
                    }
                    bulletRemoved = true;
                    break;
                }
            }
        
            if (bulletRemoved) continue;
        
            // Red aliens
            for (let j = this.redAliens.length - 1; j >= 0; j--) {
                let alien = this.redAliens[j];
                if (this.collides(bullet, alien)) {
                    bullet.destroy();
                    alien.destroy();

                    my.sprite.bullet.splice(i, 1);
                    this.redAliens.splice(j, 1);
                    this.explosion.play({ volume: 0.3 });
                    this.playerScore += 300;
                    this.infoText.setText('Score: ' + this.playerScore);
                    if (this.playerScore > this.sys.game.globals.highscore) {
                        this.sys.game.globals.highscore = this.playerScore;
                        this.infoTextHighscore.setText('Highscore: ' + this.sys.game.globals.highscore);
                    }
                    break;
                }
            }
            // Boss alien
                let alien = my.sprite.bossAlien;
                if (this.collides(bullet, alien)) {
                    bullet.destroy();

                    my.sprite.bullet.splice(i, 1);
                    this.explosion.play({ volume: 0.3 });
                    my.bossHealth -= 5;
                    my.sprite.bossAlienHealthbar.setDisplaySize(20, (my.bossHealth*2));

                    if (my.bossHealth === 0) {
                        this.playerScore += 10000;
                        this.music.stop();
                        
                        if (this.playerScore > this.sys.game.globals.highscore) {
                            this.sys.game.globals.highscore = this.playerScore;
                        }
                        this.scene.start("gameWinScene");
                    }

                    break;
                }
            
        }
        //GREEN ALIEN BULLETS
        for (let i = this.greenAlienBullets.length - 1; i >= 0; i--) {
            let bullet = this.greenAlienBullets[i];
            bullet.y += this.greenAlienBulletSpeed;
        
            if (bullet.y > game.config.height) {
                bullet.destroy();
                this.greenAlienBullets.splice(i, 1);
                continue;
            }
        
            if (this.collides(bullet, my.sprite.user)) {
                bullet.destroy();
                this.greenAlienBullets.splice(i, 1);
                this.explosion.play({ volume: 0.8 });
        
                this.playerDeathText();
            }
        }
        //RED ALIEN BULLETS
        for (let i = this.redAlienBullets.length - 1; i >= 0; i--) {
            let bullet = this.redAlienBullets[i];
            bullet.y += this.redAlienBulletSpeed;
        
            if (bullet.y > game.config.height) {
                bullet.destroy();
                this.redAlienBullets.splice(i, 1);
                continue;
            }
        
            if (this.collides(bullet, my.sprite.user)) {
                bullet.destroy();
                this.redAlienBullets.splice(i, 1);
                this.explosion.play({ volume: 0.8 });
        
                this.playerDeathText();
            }
        }

        //move onto next wave when finished
        if (!this.waveInProgress && this.greenAliens.length === 0 && this.redAliens.length === 0 && this.wave < 5 && my.bossAlive == false) {
            this.waveInProgress = true;
            this.wave++;
            this.waveClearText();
            this.spawnWave(this.wave);
        
            this.time.delayedCall(2000, () => {
                this.waveInProgress = false;
            });
        }
    }

}