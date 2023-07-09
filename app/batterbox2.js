// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

/**
 * The box showing a batter's information
 *
 * @class BatterBox2
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Corner
 * @param {Object} [styles] Text styles
 * @param {bool} [onStrike=false] Whether the batter is on strike
 */
class BatterBox2 extends Shape {
    outline; // visible outline
    textBox; // all the text
    onStrikeIcon;

    constructor(svg, x, y, w, h, corner, styles = {}, onStrike = false) {
        super(svg, x, y, w, h, corner);

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 2; // units???
        let namePct = 0.5;
        let runsPct = 0.2;
        let ballsPct = 0.2;

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
        let runStyles = Utils.extend(styles, Styles.scoreStyles, {
            fill: "#000",
        });
        textAndStyles.push(
            {
                text: "R",
                styles: Utils.extend(runStyles, {
                    "font-size": Styles.labelTextSize,
                    x: leftPadding + w * namePct,
                }),
            },
            {
                text: "999",
                styles: runStyles,
                label: "runs",
            }
        );

        // Balls
        let ballStyles = Utils.extend(styles, Styles.numberStyles, {
            fill: "#000",
            "font-size": "x-small",
        });
        textAndStyles.push(
            {
                text: " (",
                styles: ballStyles,
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
