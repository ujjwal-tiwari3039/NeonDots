export class BaseMode {
    constructor(game) {
        this.game = game;
        this.name = 'Unknown Mode';
    }

    // Called when the mode starts
    onStart() {}

    // Called every frame
    update(dt) {}

    // Called every frame to draw custom HUD/effects if needed
    draw(ctx) {}

    // Input handlers
    handleClick(x, y) {}
    handleKey(key) {}
}
