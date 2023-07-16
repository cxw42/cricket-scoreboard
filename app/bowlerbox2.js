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
 * The box showing a bowler's information
 *
 * @class BowlerBox2
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
 */
class BowlerBox2 extends Shape {
    outline; // visible outline
    textBox; // all the text
    onStrikeIcon;

    constructor(svg, x, y, w, h, corner, styles = {}) {
        super(svg, x, y, w, h, corner);

        const teamColor = styles.teamColor || "#ffffff";
        const textColor = Utils.getContrastingTextColor(teamColor);

        styles = Utils.extend(styles, { fill: textColor });

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 2; // units???
        let namePct = 0.4;
        let runsPct = 0.4;

        // Background
        if (styles.background) {
            this.outline = new Rect(svg, 0, 0, w, h, "tl", {
                background: styles.background,
            });
            this.outline.addTo(this);
        }

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

        // Runs and wickets
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
            },
            {
                text: "-",
                styles: Utils.extend(styles, Styles.scoreStyles),
            },
            {
                text: "9",
                styles: Utils.extend(styles, Styles.scoreStyles),
                label: "wickets",
            },
            {
                text: "W",
                styles: Utils.extend(styles, Styles.scoreStyles, {
                    "font-size": Styles.labelTextSize,
                }),
            }
        );

        // Overs
        textAndStyles.push(
            {
                text: "999",
                styles: Utils.extend(Styles.numberStyles, {
                    fontSize: Styles.powerplayTextSize,
                    x: leftPadding + w * (namePct + runsPct),
                }),
                label: "overs",
            },
            {
                text: " OV.",
                styles: Utils.extend(Styles.numberStyles, {
                    fontSize: Styles.labelTextSize,
                    //dx: 1,
                }),
            }
        );

        // Now create the text line
        this.textBox = new TextBox(svg, 0, 0, -1, -1, "tl", textAndStyles);
        this.textBox.addTo(this);
    }

    set name(value) {
        this.textBox.setValue(value, "name");
    }

    set runs(value) {
        this.textBox.setValue(value, "runs");
    }

    set wickets(value) {
        this.textBox.setValue(value, "wickets");
    }

    set overs(value) {
        this.textBox.setValue(value, "overs");
    }
}

module.exports = BowlerBox2;
