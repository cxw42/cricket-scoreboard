// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

let Two = require('two.js');
//let Textbox = require('textbox');

/**
 * The box showing a batter's information
 *
 * @class BatterBox
 * @constructor
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 */
class BatterBox {
    // two.js coordinates
    twoX;
    twoY;

    group; // the group of shapes
    outline; // visible outline

    // Two.Text instances
    tName; // batter's name
    tRuns; // batter's run count
    runsLabel; // "R" label for runs
    tBalls; // batter's ball count
    ballsLabel; // "B" label for balls

    constructor(ulx, uly, w, h, styles = {}) {
        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 10; // units???
        let namePct = 0.5;
        let runsPct = 0.25;
        let ballsPct = 0.125;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = 'middle';

        this.twoX = ulx + w / 2;
        this.twoY = uly + h / 2;

        this.outline = new Two.Rectangle(this.twoX, this.twoY, w, h);
        this.outline.fill = 'none';

        // Name: left-aligned
        styles.alignment = 'left';
        this.tName = new Two.Text('name', ulx + leftPadding, this.twoY,
            styles);

        // Runs and balls
        styles.alignment = 'right';
        this.tRuns = new Two.Text('42', ulx + w * (namePct + runsPct), this
            .twoY, styles);
        this.tBalls = new Two.Text('84', ulx + w * (namePct + runsPct +
            ballsPct), this.twoY, styles);

        // Labels
        styles.alignment = 'left';
        styles.size = 'small'; // TODO make parameterizable

        this.runsLabel = new Two.Text('R', ulx + w * (namePct + runsPct),
            this.twoY, styles);
        this.ballsLabel = new Two.Text('B', ulx + w * (namePct + runsPct +
            ballsPct), this.twoY, styles);

        this.group = new Two.Group(this.outline, this.tName, this.tRuns,
            this.runsLabel, this.tBalls, this.ballsLabel);
    }

    addTo(two) {
        this.group.addTo(two)
    }

    set name(value) {
        this.tName.value = value;
    }

    set runs(value) {
        this.tRuns.value = value;
    }

    set balls(value) {
        this.tBalls.value = value;
    }

};

module.exports = BatterBox;
