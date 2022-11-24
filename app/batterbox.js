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
    // User-specified bounding-box coordinates
    bbox = {};

    // two.js coordinates
    twoX;
    twoY;

    group; // the group of shapes
    outline; // visible outline

    // Two.Text instances
    textGroup;
    tName; // batter's name
    tRuns; // batter's run count
    runsLabel; // "R" label for runs
    tBalls; // batter's ball count
    ballsLabel; // "B" label for balls
    onStrikeIcon;

    constructor(ulx, uly, w, h, styles = {}, onStrike = false) {
        this.bbox.ulx = ulx;
        this.bbox.uly = uly;
        this.bbox.w = w;
        this.bbox.h = h;

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 10; // units???
        let namePct = 0.5;
        let runsPct = 0.3;
        let ballsPct = 0.15;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = 'baseline';

        this.twoX = ulx + w / 2;
        this.twoY = uly + h / 2;

        // Create shapes.  All have baseline x = 0, y=0.  addTo() will
        // position the group containing the shapes.

        // Name: left-aligned
        styles.alignment = 'left';
        // Use "My Name" as the initial value so it will have both
        // ascenders and descenders.
        this.tName = new Two.Text('My Name', 0, 0, styles);

        // Runs and balls
        styles.alignment = 'right';
        this.tRuns = new Two.Text('42', w * (namePct + runsPct), 0, styles);

        styles.size = 'small'; // TODO make parameterizable
        this.tBalls = new Two.Text('84', w * (namePct + runsPct + ballsPct),
            0, styles);

        // Labels
        styles.alignment = 'left';

        this.runsLabel = new Two.Text('R', w * (namePct + runsPct), 0,
            styles);
        this.ballsLabel = new Two.Text('B',
            w * (namePct + runsPct + ballsPct), 0, styles);

        this.textGroup = new Two.Group(this.tName, this.tRuns,
            this.runsLabel, this.tBalls, this.ballsLabel);

        this.group = new Two.Group(this.textGroup);

        // On strike?
        if (false /* XXX */ && onStrike) { // TODO put this back
            this.onStrikeIcon = new Two.ImageSequence(['bat-icon.png'], 0,
                0, 0);
            this.onStrikeIcon.scale = 0.15; // hack --- FIXME
            this.group.add(this.onStrikeIcon);
        }

    }

    addTo(two) {
        // Add the group off-screen so we can find out where it is.
        this.group.position.x = this.group.position.y = -1000;
        this.group.addTo(two);
        two.update()
        const where = this.group.getBoundingClientRect();

        // Get the baseline location.  E.g., top = -1010 means
        // the top is 10px above the baseline === baseline is 10px below
        // the top.
        const dyTopToBaseline = -1000 - where.top;

        // Move the group horizontally, left-justified
        // E.g., where.left = -1010 => move position.x +10 (right)
        this.group.position.x = this.bbox.ulx;
        this.textGroup.position.x = (-1000 - where.left);

        // Center textGroup vertically within group
        const vmargin = this.bbox.h - where.height;
        this.textGroup.position.y = vmargin / 2;

        // Add the outline now that we have a center
        // XXX figure out why we need the -1s
        this.outline = new Two.Rectangle(
            this.bbox.w / 2, 0, this.bbox.w - 1, this.bbox.h - 1
        );
        this.outline.fill = 'none';
        this.group.add(this.outline);

        // Move the group vertically, with center vspacing.
        this.group.position.y = this.bbox.uly + dyTopToBaseline + vmargin /
            2;



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
