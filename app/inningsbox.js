// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

require('3rdparty/snap.svg.free_transform');

/**
 * The box showing the innings, toss, and team scores
 *
 * @class InningsBox
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} styles Text styles
 */
class InningsBox {
    // User-specified bounding-box coordinates
    bbox = {};

    group; // the group of shapes
    outline; // visible outline
    textGroup; // Text boxes

    // Raw data
    // TODO

    // text nodes
    // TODO
    // tName; // bowler's name
    tTeam1Label;
    tTeam2Label;
    tTeam1HomeToss
    ; // whether team1 is playing at home, and whether team1 won the toss
    tTeam2HomeToss;

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
        let ballsPct = 0.2;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = 'baseline';

        this.group = svg.g();
        //this.group.attr('transform', `translate(${ulx}, ${uly})`);
        let ft = svg.freeTransform(this.group);
        ft.attrs.translate.x = ulx;
        ft.attrs.translate.y = uly;
        ft.hideHandles();
        ft.apply();
        // Now you can say things like
        //  this.group.freeTransform.attrs.translate.y -= 20;
        //  this.group.freeTransform.apply();
        // to move the box around.

        if (false) { // XXX

            this.textGroup = svg.g();

            // Create shapes.  All have baseline x = 0, y=0.  addTo() will
            // position the group containing the shapes.

            // Name: left-aligned
            styles['text-align'] = styles['text-anchor'] = 'start';

            // Use "My Name" as the initial value so it will have both
            // ascenders and descenders.
            this.tName = svg.text(0, 0, 'My Name').attr(styles);
            this.textGroup.add(this.tName);

            // Figures
            const labelTextSize = '50%'; // empirical

            styles['text-align'] = styles['text-anchor'] = 'end';
            this.tFigures = svg.text(w * (namePct + scorePct), 0,
                ["W", "1-2", "R"]).attr(
                styles);
            let kids = this.tFigures.children();
            kids[0].attr({
                'font-size': labelTextSize
            });
            kids[1].attr({
                'class': 'bowlingFigures'
            });
            kids[2].attr({
                'font-size': labelTextSize
            });
            this.textGroup.add(this.tFigures);

            // Overs
            //styles['font-size'] = 'small'; // TODO make parameterizable
            this.tOvers = svg.text(w * (namePct + scorePct + ballsPct),
                0, ["1", "O", "2", "B"]).attr(styles);
            kids = this.tOvers.children();
            kids[0].attr({
                'class': 'bowlingCompletedOvers'
            });
            kids[1].attr({
                'font-size': labelTextSize,
                'font-weight': 1000
            });
            kids[2].attr({
                'class': 'bowlingBalls'
            });
            kids[3].attr({
                'font-size': labelTextSize
            });
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

            // Second line - XXX placeholder
            this.thisOverGroup = svg.g();
            /*svg.rect(0, -dyTopToBaseline + this.bbox.h/2, this.bbox.w,
                        this.bbox.h/2).attr({
                        fill: '#eee',
                        stroke: 'none',
                    });*/
            this.group.add(this.thisOverGroup);

            const ballIconHeight = this.bbox.h * 0.4;
            const ballIconTop = -dyTopToBaseline + this.bbox.h / 2 + 0.5 * (
                this.bbox.h / 2 - ballIconHeight);
            for (let i = 0; i < 6; ++i) {
                let rect = svg.circle(i * (ballIconHeight * 1.10) +
                    ballIconHeight / 2, ballIconTop + ballIconHeight /
                    2, ballIconHeight / 2, ballIconHeight / 2);
                rect.attr({
                    fill: '#fff',
                    'fill-opacity': '35%'
                });
                this.thisOverGroup.add(rect);
            }

        } // XXX

        // Add the outline now that we have a center
        this.outline = svg.rect(0, 0,
            //0, -dyTopToBaseline,
            this.bbox.w, this.bbox.h).attr({
            fill: 'none',
            stroke: '#0dd'
        });
        this.group.add(this.outline);

    } // ctor

    _updateFigures() {
        this.tFigures.select('.bowlingFigures').attr({
            text: `${this.currWickets}-${this.currRuns}`,
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
        this.tOvers.select('.bowlingCompletedOvers').attr({
            text: completedOvers
        })
        this.tOvers.select('.bowlingBalls').attr({
            text: ballsThisOver
        })
    }

};

module.exports = InningsBox;
