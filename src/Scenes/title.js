class Title extends Phaser.Scene {
    constructor() {
        super("title");
    }

    preload() {
        document.getElementById('description').innerHTML = '<h2>Title.js</h2>';
    }

    create() {
        this.add.text(400, 300, "SpaceShooters \n Click to Start!", {
            font: '100px Trebuchet MS',
            color: "#ffffff"
        }).setOrigin(0.5);
        
        // Optional: Restart game or go to menu after delay or on click
        this.input.once("pointerdown", () => {
            this.scene.start("spaceShooter"); // or "GameScene"
        });
    }
}