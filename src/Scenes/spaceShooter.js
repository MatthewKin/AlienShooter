class SpaceShooter extends Phaser.Scene {
    constructor() {
        // Class variable definitions -- these are all "undefined" to start
        super("spaceShooter");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings
        //Starting Point
        this.bodyX = 300;
        this.bodyY = 350;
    }
    preload(){
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.audio("bgMusic", "bgMusic.mp3"); //bg music made by me
        this.load.audio("laserPlayer", "laserPlayer.ogg");
        this.load.audio("explosion", "explosion.ogg");

        this.load.image("greenAlien", "shipGreen_manned.png"); 
        this.load.atlasXML("aliens", "spritesheet_spaceships.png", "spritesheet_spaceships.xml");
        this.load.atlasXML("spaceShooter", "sheet.png", "sheet.xml");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>spaceShooter.js<br><br>A - move left || D - move right<br>Space - shoot<br></h2>'
    }
    create(){
        // Initialize Phaser graphics, used to draw lines
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
        this.redAliens = [];
        this.greenAlienRows = [];
        this.greenAlienBulletSpeed = 5;

        //Line Test
        this.greenAlienPointsArray = [
            20, 50,
            game.config.width - 51, 50
        ];
        
        this.curve = new Phaser.Curves.Spline(this.greenAlienPointsArray);
        this.xImages = [];

        let yOffsets = [50, 120, 190];  // Y positions for each row

        // Create 3 spline paths
        for (let i = 0; i < 3; i++) {
            let points = [20, yOffsets[i], game.config.width - 51, yOffsets[i]];
            let curve = new Phaser.Curves.Spline(points);
            this.greenAlienRows.push(curve);
            this.drawLine(curve);
        }


        //spawning
        this.playerMovable = false;
        this.wave = 1;
        this.spawnWave(this.wave);
        this.waveComplete = false;
        


        //user character
        my.sprite.user = this.add.sprite(game.config.width/2, game.config.height - 60, "spaceShooter", "enemyBlue1.png");
        my.sprite.user.setDisplaySize(50, 50);
        my.sprite.user.flipY = true;

        //laserbeam player
        this.bulletSpeed = 9;
        my.sprite.bullet = []; 
        this.maxBullets = 4;

        //keybinds
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        //player values
        this.playerSpeed = 12;
        this.playerLives = 3;
        this.playerScore = 0;
        this.playerHighscore = 0;
        
        //top right scoreboard:
        this.infoText = this.add.text(game.config.width - 20, 20, 'Score: ' + this.playerScore, {
            font: '20px Trebuchet MS',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoText.setOrigin(1, 0);

        //top left HighScore:
        this.infoTextHighscore = this.add.text(game.config.width - 20, 40, 'Highscore: ' + this.playerHighscore, {
            font: '20px Trebuchet MS',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoTextHighscore.setOrigin(1, 0);

        
        
    }

    spawnWave(number) {
        switch (number) {
            case 1:
                // Initial immediate spawns for wave 1
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
    
                for (let i = 0; i < 30; i++) {
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
    
                for (let i = 0; i < 10; i++) {
                    let delay = Phaser.Math.Between(100, 3000);  // Random delay in ms
                    let row = Phaser.Math.Between(0, 2);         // Random row (0, 1, 2)
                    this.time.delayedCall(delay, () => {
                        this.spawnGreenAlien(row);
                    });
                }
                break;

            case 3:
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
                break;
            case 4:
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
                break;

            case 5:
                // Initial immediate spawns for wave 1
                for (let i = 0; i < 3; i++) {
                    this.spawnGreenAlien(i);
                }
    
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
    }

    // Add a point to the spline
    addPoint(point) {
        this.curve.addPoint(point);
        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
        //edited here
        this.points.push(point.x);
        this.points.push(point.y);
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

        for (let i = my.sprite.bullet.length - 1; i >= 0; i--) {
            let bullet = my.sprite.bullet[i];
            bullet.y -= this.bulletSpeed;
            
            if (bullet.y < 0) {
                bullet.destroy();
                my.sprite.bullet.splice(i, 1);
            }

            //check for collision for GREEN ALIEN
            for (let j = this.greenAliens.length - 1; j >= 0; j--) {
                let alien = this.greenAliens[j];
                if (this.collides(bullet, alien)) {
                    // Destroy both
                    bullet.destroy();
                    alien.destroy();
                    my.sprite.bullet.splice(i, 1);
                    this.greenAliens.splice(j, 1);

                    //sound effect
                    this.explosion.play({ 
                        volume: 0.3
                     });
        
                    // update score
                    this.playerScore += 100;
                    this.infoText.setText('Score: ' + this.playerScore);

                    if(this.playerScore > this.playerHighscore) {
                        this.playerHighscore = this.playerScore;
                        this.infoTextHighscore.setText('Highscore: ' + this.playerHighscore);
                    }
                    
                    break; // exits loop after hit
                }
            }


        }

        //move onto next wave when finished
        if (this.greenAliens.length === 0 && this.wave < 5) {
            this.wave++;
            this.waveClearText();
            this.spawnWave(this.wave);

            // hide text after 2 seconds

            
        }

        if (this.greenAliens.length === 0 && this.wave === 5) {
            this.waveClearText();
        }
    }

}