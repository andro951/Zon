"use strict";

class DummyGame {
    constructor() {
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 1200;
        this.canvas.height = 600;

        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(100, 100, 200, 150);

        this.x = 100;
        this.y = 100;
        this.speed = 5;
        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
    }

    update() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update the position of the rectangle based on keyboard input
        if (this.keys['ArrowUp']) this.y -= this.speed;
        if (this.keys['ArrowDown']) this.y += this.speed;
        if (this.keys['ArrowLeft']) this.x -= this.speed;
        if (this.keys['ArrowRight']) this.x += this.speed;

        // Draw the rectangle at the new position
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x, this.y, 200, 150);
    }
    // // Get the canvas element and its 2d context
    // const canvas = document.getElementById('gameCanvas');
    // const ctx = canvas.getContext('2d');

    // // Set up the canvas size (in case it's not set in CSS)
    // canvas.width = 1200;
    // canvas.height = 600;

    // // Draw a red rectangle
    // ctx.fillStyle = 'red';
    // ctx.fillRect(100, 100, 200, 150);

    // let x = 100;
    // let y = 100;
    // const speed = 5;

    // function updateGame() {
    //     // Clear the canvas
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     // Update the position of the rectangle based on keyboard input
    //     if (keys['ArrowUp']) y -= speed;
    //     if (keys['ArrowDown']) y += speed;
    //     if (keys['ArrowLeft']) x -= speed;
    //     if (keys['ArrowRight']) x += speed;

    //     // Draw the rectangle at the new position
    //     ctx.fillStyle = 'red';
    //     ctx.fillRect(x, y, 200, 150);

    //     // Request the next frame
    //     requestAnimationFrame(updateGame);
    // }

    // // Handle key presses
    

    // // Start the game loop
    // updateGame();
}