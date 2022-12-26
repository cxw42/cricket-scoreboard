// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Marker = require("rules").Marker;

//const D3Color = require("3rdparty/d3-color.v2.min");
//const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

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
 * Invariant once created.
 *
 * @protected
 * @class DeliveryMarker
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} cx Center X
 * @param {int} cy Center Y
 * @param {int} r Radius
 * @param {int} totalRuns Total runs scored on this delivery
 * @param {String} marker Any markers (from enum Marker)
 */
class DeliveryMarker {
    svg = null;
    bbox = {};

    group; // the group of shapes

    constructor(svg, cx, cy, r, corner, totalRuns, marker = "") {
        const hasMarker = (marker || "").length > 0;
        this.group = svg.g();

        this.bbox = Utils.getBBox(cx, cy, r * 2, r * 2, "mc");

        let ball = svg.circle(cx, cy, r);
        ball.attr({
            fill: "#fff",
            "fill-opacity": "35%",
        });

        this.group.add(ball);
    }

    /**
     * Add this instance to an SVG element
     *
     * @method addTo
     * @param {Object} parent The element
     */
    addTo(parent) {
        parent.add(this.group);
    }

    /**
     * Remove this instance from the SVG
     *
     * @method remove
     */
    remove() {
        this.group.remove();
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
                this.ballRadius,
                0,
                ""
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
    }

    /**
     * Record a delivery, whether legal or not
     *
     * @method recordDelivery
     */
    recordDelivery(totalRuns, marker = "") {
        if (currDelivery >= 6) {
            // TODO add a new ball
        }

        this.marker[currDelivery] = marker;

        renderScoreInBall(this.balls[currDelivery], totalRuns, marker);

        ++currDelivery;
    }

    /**
     * Render the score inside a ball
     *
     * @method renderScoreInBall
     */
    renderScoreInBall(ball, totalRuns, marker) {}
}

module.exports = CurrentOverBox;
