// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Rect = require("rect");
const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

/**
 * The box showing a batter's information
 *
 * @class BatterBox2
 * @constructor
 * @param {Snap} svg SVG surface (see {{#crossLink "Shape"}}{{/crossLink}})
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Corner
 * @param {Object} [styles] Text styles
 * @param {Object} [styles.background] Background for the box
 * @param {Object} [styles.teamColor=#fff] Team's color
 * @param {bool} [onStrike=false] Whether the batter is on strike
 */
class BatterBox2 extends Shape {
    outline; // visible outline
    textBox; // all the text
    onStrikeIcon;

    constructor(svg, x, y, w, h, corner, styles = {}, onStrike = false) {
        super(svg, x, y, w, h, corner);

        const teamColor = styles.teamColor || "#ffffff";
        const textColor = Utils.getContrastingTextColor(teamColor);

        styles = Utils.extend(styles, { fill: textColor });

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 2; // units???
        let namePct = 0.5;
        let runsPct = 0.2;
        let ballsPct = 0.2;

        // Background
        this.outline = new Rect(svg, 0, 0, w, h, "tl", {
            background: styles.background || {
                stroke: "none",
                fill: "none",
            },
        });
        this.outline.addTo(this);

        // Build up the text and styles.  We will then create them in one
        // TextBox so they share a baseline.
        let textAndStyles = [];

        // Name.  Use "My Name" as the initial value so it will
        // have both ascenders and descenders.
        textAndStyles.push({
            text: "My Name",
            styles: Utils.extend(styles, {
                x: leftPadding,
            }),
            label: "name",
        });

        // Runs
        textAndStyles.push(
            {
                text: "R",
                styles: Utils.extend(styles, Styles.scoreStyles, {
                    "font-size": Styles.labelTextSize,
                    x: leftPadding + w * namePct,
                }),
            },
            {
                text: "999",
                styles: Utils.extend(styles, Styles.scoreStyles),
                label: "runs",
            }
        );

        // Balls
        let ballStyles = Utils.extend(styles, Styles.numberStyles, {
            "font-size": "x-small",
        });
        textAndStyles.push(
            {
                text: "(",
                styles: Utils.extend(ballStyles, { dx: 10 }),
            },
            {
                text: "999",
                styles: ballStyles,
                label: "balls",
            },
            {
                text: "B",
                styles: Utils.extend(ballStyles, {
                    "font-size": Styles.labelTextSize,
                    dx: 1,
                }),
            },
            {
                text: ")",
                styles: ballStyles,
            }
        );

        // Now create the text line
        this.textBox = new TextBox(svg, 0, 0, -1, -1, "tl", textAndStyles);
        this.textBox.addTo(this.group);

        // On strike?
        if (
            false && // XXX
            onStrike
        ) {
            // TODO put this back
            this.onStrikeIcon = svg.image("/bat-icon.png", 0, 0);
            this.onStrikeIcon.scale = 0.15; // hack --- FIXME
            this.group.add(this.onStrikeIcon);
        }
    } // ctor

    set name(value) {
        this.textBox.setValue(value, "name");
    }

    set runs(value) {
        this.textBox.setValue(value, "runs");
    }

    set balls(value) {
        this.textBox.setValue(value, "balls");
    }
}

module.exports = BatterBox2;
