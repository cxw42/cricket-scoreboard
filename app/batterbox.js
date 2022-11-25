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
 * @param {Snap} svg SVG surface
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

    constructor(svg, ulx, uly, w, h, styles = {}, onStrike = false) {
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

        this.textGroup = svg.g();

        // Create shapes.  All have baseline x = 0, y=0.  addTo() will
        // position the group containing the shapes.

        // Name: left-aligned
        styles['text-align'] = 'start';

        // Use "My Name" as the initial value so it will have both
        // ascenders and descenders.
        this.tName = svg.text(0, 0, 'My Name').attr(styles);
        this.textGroup.add(this.tName);

        // Runs and balls
        styles['text-align'] = 'end';
        this.tRuns = svg.text(w * (namePct + runsPct), 0, '42').attr(
            styles);
        this.textGroup.add(this.tRuns);

        styles['font-size'] = 'small'; // TODO make parameterizable
        this.tBalls = svg.text(w * (namePct + runsPct + ballsPct),
            0, '84').attr(styles);
        this.textGroup.add(this.tBalls);

        // Labels
        styles['text-align'] = 'start';

        this.runsLabel = svg.text(w * (namePct + runsPct), 0,
            'R').attr(styles);
        this.textGroup.add(this.runsLabel);
        this.ballsLabel = svg.text(
            w * (namePct + runsPct + ballsPct), 0, 'B').attr(styles);
        this.textGroup.add(this.ballsLabel);


        this.group = svg.g();
        this.group.add(this.textGroup);

        // DEBUG
        let bbox = this.textGroup.getBBox();
        this.group.add(svg.rect(bbox.x, bbox.y, bbox.width, bbox.height)
            .attr({
                fill: 'none',
                stroke: '#ff0'
            }));

        // On strike?
        if (false // XXX
            &&
            onStrike) { // TODO put this back
            this.onStrikeIcon = svg.image('/bat-icon.png', 0, 0);
            this.onStrikeIcon.scale = 0.15; // hack --- FIXME
            this.group.add(this.onStrikeIcon);
        }

        // this.group.transform('t100,100');   // XXX DEBUG for visibility

        // Position the group
        // Add the group off-screen so we can find out where it is.
        this.group.attr('transform', 'translate(-1000, -1000)');
        const where = this.group.getBBox();

        // Get the baseline location.  E.g., top = -1010 means
        // the top is 10px above the baseline === baseline is 10px below
        // the top.
        const dyTopToBaseline = -1000 - where.y;

        // Center textGroup vertically within group
        const vmargin = this.bbox.h - where.height;

        // Move the group horizontally, left-justified
        // E.g., where.left = -1010 => move position.x +10 (right)
        this.textGroup.attr('transform',
            `translate(${-1000 - where.left}, ${vmargin/2})`);

        this.group.attr('transform',
            `translate(${this.bbox.ulx}, ${this.bbox.uly + dyTopToBaseline + vmargin/2*0})`
            // XXX *0 seems to make it look better --- why?
        );

        // Add the outline now that we have a center
        // XXX figure out why we need the -1s
        this.outline = svg.rect(0, -dyTopToBaseline, this.bbox.w, this.bbox
            .h).attr({
            fill: 'none',
            stroke: '#0ff'
        });
        this.group.add(this.outline);

    } // ctor

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
