let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 600,
    scene: [Platform],
    fps: {
        target: 30,
        forceSetTimeOut: true
    }
}

const game = new Phaser.Game(config);