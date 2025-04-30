class Platform extends Phaser.Scene {
    constructor() {
        // Class variable definitions -- these are all "undefined" to start
        super("platformScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings
        //Starting Point
        this.bodyX = 300;
        this.bodyY = 350;
    }
    preload(){
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.image("greenAlien", "shipGreen_manned.png"); 
        this.load.atlasXML("aliens", "spritesheet_spaceships.png", "spritesheet_spaceships.xml");
        this.load.atlasXML("spaceShooter", "sheet.png", "sheet.xml");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>platformScene.js<br><br>A - move left || D - move right<br>Space - shoot<br></h2>'
    }
    create(){
        // Initialize Phaser graphics, used to draw lines
        this.graphics = this.add.graphics();

        //line for green alien
        let my = this.my;
        //Line Test
        this.greenAlienPointsArray = [
            20, 50,
            game.config.width - 51, 50
        ];
        this.curve = new Phaser.Curves.Spline(this.greenAlienPointsArray);
        this.xImages = [];
        this.drawPoints();
        this.drawLine();

        my.sprite.greenAlien = this.add.follower(this.curve, 10, 10, "greenAlien");
        my.sprite.greenAlien.setDisplaySize(50, 50);
        my.sprite.user = this.add.sprite(game.config.width/2, game.config.height - 60, "spaceShooter", "enemyBlue1.png");
        my.sprite.user.setDisplaySize(50, 50);
        my.sprite.user.flipY = true;


        // Set ship to first point
        my.sprite.greenAlien.x = this.curve.points[0].x;
        my.sprite.greenAlien.y = this.curve.points[0].y;
        my.sprite.greenAlien.visible = true;

        my.sprite.greenAlien.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: false,
            rotationOffset: 0
        });




        //keybinds
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);


        let score = 0;
        //top right scoreboard
        this.infoText = this.add.text(game.config.width - 20, 20, 'Score: ' + score, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'right'
        });
        this.infoText.setOrigin(1, 0);
        //top right lives count
        
    }
    
    drawPoints() {
        for (let point of this.curve.points) {
            this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
        }
    }

    // Add a point to the spline
    addPoint(point) {
        this.curve.addPoint(point);
        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
        //edited here
        this.points.push(point.x);
        this.points.push(point.y);
    }

    // Draws the spline
    drawLine() {
        this.graphics.clear();                      // Clear the existing line
        this.graphics.lineStyle(2, 0xffffff, 1);    // A white line
        this.curve.draw(this.graphics, 32);         // Draw the spline
    }


    update(){
        let my = this.my;
        if (this.dKey.isDown && my.sprite.user.x < game.config.width - 51) {
            my.sprite.user.x += 12;
        }

        if (this.aKey.isDown && my.sprite.user.x > 51) {
            my.sprite.user.x -= 12;
        }
        
    }

}