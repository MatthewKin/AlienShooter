class GameWinScene extends Phaser.Scene {
    constructor() {
        super("gameWinScene");
    }

    preload() {
        document.getElementById('description').innerHTML = '<h2>gameWin.js<br>Click to Start Over</h2>';
    }

    create() {
        this.add.text(400, 300, "You Win! \n Click to Start Over \n Highscore: " + this.sys.game.globals.highscore, {
            font: '48px Trebuchet MS',
            color: "#ffffff"
        }).setOrigin(0.5);
        
        this.input.once("pointerdown", () => {
            this.scene.start("title");
        });
    }
}