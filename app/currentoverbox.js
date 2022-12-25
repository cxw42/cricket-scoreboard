// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

//const D3Color = require("3rdparty/d3-color.v2.min");
//const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const Styles = require("styles");
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

    balls;          // shapes
    runs;           // total runs scored, one item per ball
    markers;        // one per ball, e.g., W, B, NB, ...

    constructor(svg, x, y, h, corner) {
        let w;
        this.svg = svg;
        this.group = svg.g();

        const labelStyles = Utils.extend(Styles.textStyles, {
            "font-style": "normal",
            "font-size": Styles.labelTextSize,
            fill: "#fff",
            "fill-opacity": "35%",
        });
        this.label = new TextBox(svg, 0, 0, 100, rowHeight, "tl", [
            {
                text: "THIS",
                styles: labelStyles,
            },
            {
                text: "OVER",
                styles: labelStyles,
            },
        ]);

        // TODO clean this up --- it's currently empirical
        this.label.text.children()[0].attr({ x: 1, y: 3 });
        this.label.text.children()[1].attr({ x: 0, y: 11 });

        this.label.addTo(this.group);

        // TODO set w to the width of this.label plus padding
        w = 25;

        const ballRadius = h * 0.45;
        const ballSpacing = ballRadius * 0.25;
        this.balls = [];
        for (let i = 0; i < 6; ++i) {
            let ball = svg.circle(
                w + i * (ballRadius * 2 + ballSpacing) + ballRadius,
                h / 2,
                ballRadius
            );
            ball.attr({
                fill: "#fff",
                "fill-opacity": "35%",
            });
            this.group.add(ball);
            this.balls.push(ball);
        }

        // The natural width of the group
        w += 6 * (ballRadius * 2 + ballSpacing) - ballSpacing;

        this.bbox = Utils.getBBox(x, y, w, h, corner);
        Utils.freeTransformTo(this.group, this.bbox.ulx, this.bbox.uly);

        this.newOver();
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

    /*!
     * Start a new over
     *
     * @method newOver
     */
    newOver() {
        if(this.balls.length>6) {
            this.balls.slice(6).forEach((shape)=>{/*TODO remove shape*/});
            this.balls = this.balls.slice(0, 6);
        }
        this.markers = Array(6).fill('');
        this.runs = Array(6).fill(0);
    }

}

module.exports = CurrentOverBox;
