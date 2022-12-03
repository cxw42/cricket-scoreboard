// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

//let Textbox = require('textbox');

/**
 * The box showing a bowler's information.
 *
 * ```
 * Name         W${w}-${r}R   ${o}o${b}b
 * . . . . . .
 * ```
 *
 * @class BatterBox
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} styles Text styles
 */
class BowlerBox {
    // User-specified bounding-box coordinates
    bbox = {};

    group; // the group of shapes
    outline; // visible outline
    textGroup; // the text on the first line
    // TODO second line with what's happened this over

    // Raw data
    currWickets; // bowler's wickets taken
    currRuns; // bowler's runs allowed
    currBalls; // legal deliveries

    // Two.Text instances
    tName; // bowler's name
    tFigures; // wkts-runs
    tOvers; // bowler's ball count (legal deliveries)
    //ballsLabel; // "B" label for balls

    constructor(svg, ulx, uly, w, h, styles = {}) {
        this.bbox.ulx = ulx;
        this.bbox.uly = uly;
        this.bbox.w = w;
        this.bbox.h = h;

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 10; // units???
        let namePct = 0.5;
        let scorePct = 0.3; // wkt-run
        let ballsPct = 0.15;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = 'baseline';

        this.textGroup = svg.g();

        // Create shapes.  All have baseline x = 0, y=0.  addTo() will
        // position the group containing the shapes.

        // Name: left-aligned
        styles['text-align'] = styles['text-anchor'] = 'start';

        // Use "My Name" as the initial value so it will have both
        // ascenders and descenders.
        this.tName = svg.text(0, 0, 'My Name').attr(styles);
        this.textGroup.add(this.tName);

        // Figures and overs
        styles['text-align'] = styles['text-anchor'] = 'end';
        this.tFigures = svg.text(w * (namePct + scorePct), 0, '42').attr(
            styles);
        this.textGroup.add(this.tFigures);

        //styles['font-size'] = 'small'; // TODO make parameterizable
        this.tOvers = svg.text(w * (namePct + scorePct + ballsPct),
            0, '8o4b').attr(styles);
        this.textGroup.add(this.tOvers);

        this.group = svg.g();
        this.group.add(this.textGroup);

        /*
        // DEBUG
        let bbox = this.textGroup.getBBox();
        this.group.add(svg.rect(bbox.x, bbox.y, bbox.width, bbox.height)
            .attr({
                fill: 'none',
                stroke: '#ff0'
            }));
        */

        // Position the group.  TODO refactor this code, common with BatterBox,
        // to a single place.

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
            `translate(${this.bbox.ulx}, ${this.bbox.uly + dyTopToBaseline})`
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

    _updateFigures() {
        this.tFigures.attr({
            text: ["w", `${this.currWickets}-${this.currRuns}`, "r"]
        });
    }

    set name(value) {
        this.tName.attr({
            text: value
        });
    }

    set wickets(value) {
        this.currWickets = value
        this._updateFigures();
    }

    set runs(value) {
        this.currRuns = value;
        this._updateFigures();
    }

    set balls(value) {
        const completedOvers = Math.floor(value / 6);
        const ballsThisOver = value % 6;
        this.tOvers.attr({
            text: `${completedOvers}o${ballsThisOver}b`
        });
    }

};

module.exports = BowlerBox;
