// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const TextBox = require("textbox");
const Utils = require("utils");

// Basic text style
const textStyles = {
    "font-family": "Rubik, 'Atkinson Hyperlegible', sans-serif",
    "font-style": "oblique",
    weight: 700,
    size: "0.9em",
    "letter-spacing": "1", // empirical
    fill: "#fff", // XXX
};
const labelTextSize = "50%";
const powerplayTextSize = "75%";
const scoreTextSize = "x-large";

// Grid: vertical
const rowHeight = 20;
const cy = rowHeight / 2;
const margin = 2;
const nrows = 3;
const rowY = [...Array(nrows + 1).keys()].map((i) => (rowHeight + margin) * i);

// Grid: horizontal
const w = 150;
const homeX = margin;
const tossX = margin + rowHeight;
const nameX = margin + rowHeight * 2;
const scoreX = margin + rowHeight * 4.5;

/**
 * This over
 *
 * @class CurrentOverBox
 */
class CurrentOverBox {
    svg = null; // note: brunch doesn't do `#private`
    bbox = {};
    battingTeams = [];

    constructor(svg, x, y, h, corner) {
        let w;
        this.svg = svg;
        this.group = svg.g();

        /*
        this.label = new TextBox(
            svg,
            0,
            0,
            100,
            rowHeight,
            "tl",
            [
                {
                    text: "OVERS ",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                */
        const ballRadius = h * 0.45;
        const ballSpacing = ballRadius * 0.25;
        for (let i = 0; i < 6; ++i) {
            let ball = svg.circle(
                i * (ballRadius * 2 + ballSpacing) + ballRadius,
                h / 2,
                ballRadius
            );
            ball.attr({
                fill: "#fff",
                "fill-opacity": "35%",
            });
            this.group.add(ball);
        }

        // The natural width of the group
        w = 6 * (ballRadius * 2 + ballSpacing) - ballSpacing;

        this.bbox = Utils.getBBox(x, y, w, h, corner);
        Utils.freeTransformTo(this.group, this.bbox.ulx, this.bbox.uly);
    } // ctor

    /**
     * Return a text color contrasting with the given color
     *
     * @method getTextColor
     * @param {string} color The color, as a hex string, e.g., `#123456`.
     */
    getTextColor(color) {
        if (WcagContrast.hex(color, "#000") > WcagContrast.hex(color, "#fff")) {
            return "#000";
        } else {
            return "#fff";
        }
    }

    update(score) {
        this.batterOnStrike.name = score.battingOrder[0]; // XXX
        this.batterOnStrike.runs = 64;
        this.batterOnStrike.balls = 118;
        this.batterNotOnStrike.name = score.battingOrder[1]; // XXX
        this.batterNotOnStrike.runs = 14;
        this.batterNotOnStrike.balls = 22;
        this.bowler.name = score.bowler;
        this.bowler.wickets = 1;
        this.bowler.runs = 43;
        this.bowler.balls = 12 * 6 + 2; // 12.2 ov.
    }
}

module.exports = CurrentOverBox;
