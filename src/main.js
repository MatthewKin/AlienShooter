let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 600,
    scene: [Title, SpaceShooter, GameOverScene, GameWinScene],
    fps: {
        target: 60,
        forceSetTimeOut: true
    }
}

const game = new Phaser.Game(config);


// Manually attach global data object
game.globals = {
    highscore: 0
};