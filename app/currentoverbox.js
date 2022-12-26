// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Marker = require("rules").Marker;

//const D3Color = require("3rdparty/d3-color.v2.min");
//const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

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
 * The graphical representation of a delivery.
 *
 * @protected
 * @class DeliveryMarker
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} cx Center X
 * @param {int} cy Center Y
 * @param {int} r Radius
 */
class DeliveryMarker extends Shape {
    label; // the label

    constructor(svg, cx, cy, r, totalRuns = null, markers = []) {
        super(svg, cx, cy, r * 2, r * 2, "mc");

        let ball = svg.circle(r, r, r);
        ball.attr({
            fill: "#fff",
            "fill-opacity": "35%",
        });

        this.group.add(ball);

        if (totalRuns !== null) {
            this.setScore(totalRuns, markers);
        }
    }

    /**
     * Render a score in this element
     *
     * @method setScore
     * @param {int} totalRuns Total runs scored on this delivery
     * @param {Array} markers Any markers (from enum Marker)
     */
    setScore(totalRuns, markers) {
        const hasMarker = (markers || []).length > 0;

        if (this.label) {
            this.label.remove();
        }

        // TODO fixme --- this is very hackish
        let textAndStyles = [
            {
                text: totalRuns.toString() + "R",
                styles: Styles.scoreStyles,
            },
        ];

        if (hasMarker) {
            textAndStyles.push({
                text: markers.map((o) => o.label).join(" "),
                styles: Utils.extend(Styles.textStyles, {
                    "font-size": Styles.labelTextSize,
                }),
            });
        }

        this.label = new TextBox(
            this.svg,
            0,
            0,
            this.bbox.w,
            this.bbox.h,
            "tl",
            textAndStyles
        );

        // TODO clean this up --- it's currently empirical
        this.label.text.children()[0].attr({ x: 1, y: 3 });
        if (hasMarker) {
            this.label.text.children()[1].attr({ x: 3, y: 11 });
        }

        this.label.addTo(this.group);
    }
}

/**
 * This over
 *
 * @class CurrentOverBox
 */
class CurrentOverBox {
    svg = null; // note: brunch doesn't do `#private`
    bbox = {};

    // Ball-size parameters
    ballRadius = 0;
    ballSpacing = 0;

    // Individual deliveries
    balls; // shapes
    currDelivery; // which delivery we are on, starting from 0

    constructor(svg, x, y, h, corner) {
        let w;
        this.svg = svg;
        this.group = svg.g();

        const labelStyles = Utils.extend(Styles.textStyles, {
            "font-style": "normal",
            "font-size": Styles.labelTextSize,
            fill: "#fff",
            "fill-opacity": "35%",
            weight: 700,
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

        this.ballRadius = h * 0.45;
        this.ballSpacing = this.ballRadius * 0.25;
        this.balls = [];

        for (let i = 0; i < 6; ++i) {
            let ball = new DeliveryMarker(
                svg,
                w +
                    i * (this.ballRadius * 2 + this.ballSpacing) +
                    this.ballRadius,
                h / 2,
                this.ballRadius
            );
            ball.addTo(this.group);
            this.balls.push(ball);
        }

        // The natural width of the group
        w += 6 * (this.ballRadius * 2 + this.ballSpacing) - this.ballSpacing;

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

    /**
     * Start a new over
     *
     * @method newOver
     */
    newOver() {
        // Back down to 6 balls if the previous over had more
        this.balls.splice(6).forEach((shape) => {
            shape.remove();
        });
        this.currDelivery = 0;
    }

    /**
     * Record a delivery, whether legal or not
     *
     * @method recordDelivery
     */
    recordDelivery(totalRuns, markers = []) {
        if (this.currDelivery >= 6) {
            // TODO add a new ball
        }

        this.balls[this.currDelivery++].setScore(totalRuns, markers);
    }
}

module.exports = CurrentOverBox;
