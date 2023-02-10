// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Styles = require("styles");

const BGCOLOR = "#cdae6f"; // a tan color
const FGCOLOR = "#000";
const PADDING = 3; // padding inside the background

const Marker = require("rules").Marker;

//const D3Color = require("3rdparty/d3-color.v2.min");
//const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const ScoreReadout = require("score-readout");
const Shape = require("shape");
const TextBox = require("textbox");
const Utils = require("utils");

/**
 * The graphical representation of a delivery.
 *
 * @protected
 * @class DeliveryMarker
 * @extends Shape
 *
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} cx Center X
 * @param {int} cy Center Y
 * @param {int} r Radius
 * @param {int} totalRuns How many runs were scored, including extras
 * @param {Array} markers Any markers, e.g., w, wd, b, lb, nb.
 */
class DeliveryMarker extends Shape {
    radius; // ball radius
    labelRuns; // the number

    constructor(svg, cx, cy, r, totalRuns = null, markers = []) {
        super(svg, cx, cy, r * 2, r * 2, "mc");
        this.radius = r;

        let ball = svg.circle(r, r, r);
        ball.attr({
            fill: "none",
            stroke: FGCOLOR,
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

        if (this.labelRuns) {
            this.labelRuns.remove();
        }

        // Figure out what to show and the styles.  Special-case wickets.
        let text = totalRuns.toString();
        let styles = { fill: FGCOLOR };
        if (totalRuns == 0 && Marker.WICKET.foundIn(markers)) {
            text = Marker.WICKET.label;
            styles = Utils.extend(styles, { "font-style": "normal" });
        }
        // TODO highlight 4s and 6s

        // TODO make the font size follow the box size
        styles = Utils.extend(styles, { "font-size": "12px" });

        this.labelRuns = new ScoreReadout(
            this.svg,
            this.radius,
            this.radius,
            -1,
            -1,
            "mc",
            {
                background: "none",
                font: styles,
                labels: { r: false }, // no "R" label
            }
        );
        this.labelRuns.update(text);
        this.labelRuns.addTo(this.group);
    }
}

/**
 * This over
 *
 * @class CurrentOverBox
 * @extends Shape
 */
class CurrentOverBox extends Shape {
    static labelStyles = Utils.extend(Styles.textStyles, {
        "font-style": "normal",
        "font-size": Styles.labelTextSize,
        fill: FGCOLOR,
        "fill-opacity": "1", //"35%",
        weight: 700,
    });

    // Shapes inside self.group
    background;
    content; // the content in front of the background

    // Layout parameters
    newOverWidth = 0; // width at the start of an over
    ballRadius = 0;
    ballSpacing = 0;
    ball0Left = 0; // left side of ball 0

    // Individual deliveries
    balls; // DeliveryMarker instances
    currDelivery; // which delivery we are on, starting from 0

    addBall(i) {
        let ball = new DeliveryMarker(
            this.svg,
            this.ball0Left +
                i * (this.ballRadius * 2 + this.ballSpacing) +
                this.ballRadius,
            this.bbox.h / 2,
            this.ballRadius
        );
        ball.addTo(this.content);
        this.balls.push(ball);
    }

    constructor(svg, x, y, h, corner) {
        let currWidth;
        let innerH = h - 2 * PADDING;

        // Initialize with a placeholder width.  We will update it later
        // based on currWidth.
        super(svg, x, y, 1, h, corner);
        this.content = svg.g().addClass("CurrentOverBox-Content");

        this.label = new TextBox(svg, PADDING, PADDING, -1, h, "tl", [
            {
                text: "THIS",
                styles: CurrentOverBox.labelStyles,
            },
            {
                text: "OVER",
                styles: CurrentOverBox.labelStyles,
            },
        ]);

        // TODO clean this up and center it vertically --- it's currently empirical
        this.label.svgText.children()[0].attr({ x: 1, y: 0 });
        this.label.svgText.children()[1].attr({ x: 0, y: 8 });
        this.label.lineUp();

        this.label.addTo(this.content);

        this.ball0Left = currWidth =
            this.label.bbox.ulx + this.label.bbox.w + PADDING;

        // Add the DeliveryMarker instances for the first six balls of the over
        this.ballRadius = (h - 2 * PADDING) * 0.45;
        this.ballSpacing = this.ballRadius * 0.25;
        this.balls = [];

        for (let i = 0; i < 6; ++i) {
            this.addBall(i);
        }
        this.currDelivery = 0;

        // Finish computing the natural width of the group
        currWidth +=
            6 * (this.ballRadius * 2 + this.ballSpacing) - this.ballSpacing;
        this.newOverWidth = currWidth + 2 * PADDING;

        // Update the bbox now that we have the width
        this.setBBox(x, y, this.newOverWidth, h, corner);

        // Make the background
        this.background = svg.rect(0, 0, this.bbox.w, this.bbox.h);
        this.background.attr({
            //fill: BGCOLOR, "fill-opacity": "50%"
            fill: svg.gradient("l(0,0,0,1)#c0c0c0-#c0c0c0:50-#838996"),
        });

        // Assemble
        this.group.add(this.background);
        this.group.add(this.content);

        // TODO Move up so the bottom is where we expect --- the background hangs over.
        //this.setBBox(this.bbox.x, this.bbox.y - PADDING, this.background.getBBox().w,
        //    this.background.getBBox().h, this.bbox.corner);
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
        this.setBBox(
            this.origBBox.cornerX,
            this.origBBox.cornerY,
            this.newOverWidth,
            this.origBBox.h,
            this.origBBox.corner
        );
        this.background.attr({ width: this.newOverWidth });

        // Clear the scores
        this.balls.forEach((ball) => {
            ball.setScore("");
        });
    }

    /**
     * Record a delivery, whether legal or not
     *
     * @method recordDelivery
     */
    recordDelivery(totalRuns, markers = []) {
        if (this.currDelivery >= 6) {
            this.addBall(this.currDelivery);

            // resize the background, shape to hold the new ball
            let currWidth =
                this.ball0Left +
                (this.currDelivery + 1) *
                    (this.ballRadius * 2 + this.ballSpacing) -
                this.ballSpacing;

            // Update the bbox now that we have the width
            this.setBBox(
                this.origBBox.cornerX,
                this.origBBox.cornerY,
                currWidth,
                this.origBBox.h,
                this.origBBox.corner
            );
            this.background.attr({ width: this.bbox.w + 2 * PADDING });
        }

        this.balls[this.currDelivery++].setScore(totalRuns, markers);
    }
}

module.exports = CurrentOverBox;
