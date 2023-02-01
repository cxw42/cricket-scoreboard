// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Styles = require("styles");

const BGCOLOR = "#cdae6f"; // a tan color
const FGCOLOR = Styles.gray9;
const PADDING = 3; // padding inside the background

const Marker = require("rules").Marker;

//const D3Color = require("3rdparty/d3-color.v2.min");
//const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const ScoreReadout = require("score-readout");
const Shape = require("shape");
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

        /*
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
        this.label.svgText.children()[0].attr({ x: 1, y: 3 });
        if (hasMarker) {
            this.label.svgText.children()[1].attr({ x: 3, y: 11 });
        }
        */

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

    background;
    content; // the content in front of the background

    // Ball-size parameters
    ballRadius = 0;
    ballSpacing = 0;

    // Individual deliveries
    balls; // shapes
    currDelivery; // which delivery we are on, starting from 0

    constructor(svg, x, y, h, corner) {
        let currWidth;

        // Initialize with a placeholder width.  We will update it later
        // based on currWidth.
        super(svg, x, y, 1, h, corner);
        this.content = svg.g().addClass("CurrentOverBox-Content");

        this.label = new TextBox(svg, 0, 0, 100, rowHeight, "tl", [
            {
                text: "THIS",
                styles: CurrentOverBox.labelStyles,
            },
            {
                text: "OVER",
                styles: CurrentOverBox.labelStyles,
            },
        ]);

        // TODO clean this up --- it's currently empirical
        this.label.svgText.children()[0].attr({ x: 1, y: 3 });
        this.label.svgText.children()[1].attr({ x: 0, y: 11 });

        this.label.addTo(this.content);

        // TODO set currWidth to the width of this.label plus padding
        currWidth = 25;

        // Add the DeliveryMarker instances for the first six balls of the over
        this.ballRadius = h * 0.45;
        this.ballSpacing = this.ballRadius * 0.25;
        this.balls = [];

        for (let i = 0; i < 6; ++i) {
            let ball = new DeliveryMarker(
                svg,
                currWidth +
                    i * (this.ballRadius * 2 + this.ballSpacing) +
                    this.ballRadius,
                h / 2,
                this.ballRadius
            );
            ball.addTo(this.content);
            this.balls.push(ball);
        }

        this.newOver();

        // Finish computing the natural width of the group
        currWidth +=
            6 * (this.ballRadius * 2 + this.ballSpacing) - this.ballSpacing;

        // A single "R" label at the right rather than one per marker
        this.labelRight = new TextBox(
            svg,
            currWidth,
            h / 2,
            -1,
            rowHeight,
            "ml",
            [
                {
                    text: "R",
                    styles: Utils.extend(Styles.scoreStyles, { fill: FGCOLOR }),
                },
            ]
        );
        // Shrink the R label down
        let bbox = this.labelRight.bbox;
        this.labelRight.svgText.children()[0].attr({
            "font-size": Styles.labelTextSize,
        });
        this.labelRight.setBBox(
            bbox.ulx + PADDING,
            bbox.uly + bbox.h,
            bbox.w,
            bbox.h,
            "bl"
        );
        this.labelRight.addTo(this.content);

        // Update the bbox now that we have the width
        this.setBBox(x, y, currWidth + this.labelRight.bbox.w, h, corner);

        // Make the background
        this.background = svg.rect(
            -PADDING,
            -PADDING,
            this.bbox.w + 2 * PADDING,
            this.bbox.h + 2 * PADDING
        );
        this.background.attr({ fill: BGCOLOR, "fill-opacity": "50%" });

        // Assemble
        this.group.add(this.background);
        this.group.add(this.content);
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
