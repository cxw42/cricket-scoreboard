// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Two = require('two.js');
Score = require('score');

// 1080p, but divided by 2 to be more visible on screen.
const WIDTH = 1920;
const HEIGHT = 1080;
const SCALE = 2;

class Display {
    _two = null; // note: brunch doesn't do `#private`

    constructor(parentElement) {
        // Modified from the two.js sample
        // Make an instance of two and place it on the page.
        let params = {
            width: WIDTH / SCALE,
            height: HEIGHT / SCALE,
        };
        this._two = new Two(params).appendTo(parentElement);
        this._two.renderer.domElement.style.background = '#ddd'; // DEBUG

        // Two.js has convenient methods to make shapes and insert them into the scene.
        let radius = 50;
        let x = this._two.width * 0.5;
        let y = this._two.height * 0.5 - radius * 1.25;
        let circle = this._two.makeCircle(x, y, radius);

        y = this._two.height * 0.5 + radius * 1.25;
        let width = 100;
        let height = 100;
        let rect = this._two.makeRectangle(x, y, width, height);

        // The object returned has many stylable properties:
        circle.fill = '#FF8000';
        // And accepts all valid CSS color:
        circle.stroke = 'orangered';
        circle.linewidth = 5;

        rect.fill = 'rgb(0, 200, 255)';
        rect.opacity = 0.75;
        rect.noStroke();

        this._two.update();
    }

    update(score) {
        this._two.clear();
        let wkts = new Two.Text(`${score.wickets}-${score.runs}`, 100, 100);
        this._two.add(wkts);
        this._two.update();
    }

}

module.exports = Display;
