// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Two = require('two.js');
Team = require('team');

console.log('Hello, world!')

// 1080p, but divided by 2 to be more visible on screen.
const WIDTH = 1920;
const HEIGHT = 1080;
const SCALE = 2;

function create() {
    // two.js sample
    // Make an instance of two and place it on the page.
    var params = {
        width: WIDTH / SCALE,
        height: HEIGHT / SCALE,
    };
    var elem = document.body;
    var two = new Two(params).appendTo(elem);
    two.renderer.domElement.style.background = '#ddd'; // DEBUG

    // Two.js has convenient methods to make shapes and insert them into the scene.
    var radius = 50;
    var x = two.width * 0.5;
    var y = two.height * 0.5 - radius * 1.25;
    var circle = two.makeCircle(x, y, radius);

    y = two.height * 0.5 + radius * 1.25;
    var width = 100;
    var height = 100;
    var rect = two.makeRectangle(x, y, width, height);

    // The object returned has many stylable properties:
    circle.fill = '#FF8000';
    // And accepts all valid CSS color:
    circle.stroke = 'orangered';
    circle.linewidth = 5;

    rect.fill = 'rgb(0, 200, 255)';
    rect.opacity = 0.75;
    rect.noStroke();

    return two;
}

let two = create();
two.update();
