// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Snap = require("snapsvg");
const Utils = require("utils");
require("3rdparty/snap.svg.free_transform");

/**
 * A text box anchored at a point
 *
 * @class Textbox
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object|Array[Object]} textAndStyles: array of {text, styles}, where
 *                               styles are per
 *                               [Two.Text](https://two.js.org/docs/text/).
 * @param {Object} opts Options.  Keys include:
 *      - `background`: styles for the background
 */
class Textbox extends Shape {
    svgGroup; // the group of shapes - svg <g>
    svgOutline; // visible outline or background - svg <rect>
    svgText; // svg <text> node

    constructor(svg, x, y, w, h, corner, textAndStyles, opts = {}) {
        super(svg, x, y, w, h, corner);

        opts.background = opts.background || {};
        if (typeof textAndStyles !== typeof []) {
            textAndStyles = [textAndStyles];
        }

        // always put the text on the baseline
        let localStyles = {};
        localStyles.baseline = "baseline";

        corner = corner.toLowerCase();

        // Get the text alignment based on the reference corner
        if (corner.includes("l")) {
            localStyles.alignment = "start";
        } else if (corner.includes("c")) {
            localStyles.alignment = "middle";
        } else if (corner.includes("r")) {
            localStyles.alignment = "end";
        } else {
            throw "corner must specify l, c, or r";
        }

        // Create a temporary canvas we will use
        let canvas = Snap();
        canvas.hide();

        // Create the group and position it at the given place
        this.svgGroup = svg.g().addClass("Textbox");
        let ftg = svg.freeTransform(this.svgGroup);
        ftg.hideHandles();
        ftg.attrs.translate.x = this.bbox.ulx;
        ftg.attrs.translate.y = this.bbox.uly;
        ftg.apply();

        // Outline
        this.svgOutline = svg.rect(0, 0, w, h).attr(
            Utils.extend(
                {
                    fill: "none",
                    stroke: "none",
                },
                opts.background
            )
        );
        this.svgGroup.add(this.svgOutline);

        // Create the text and position it horizontally
        localStyles["text-align"] = localStyles["text-anchor"] =
            localStyles.alignment;
        this.svgText = svg.text(
            0,
            0,
            textAndStyles.map((o) => Utils.extend(o.text, localStyles))
        );
        const kids = this.svgText.children();
        for (let i = 0; i < textAndStyles.length; ++i) {
            kids[i].attr(
                Utils.extend(textAndStyles[i].styles || {}, localStyles)
            );
        }

        // Position the text
        const textBBox = this.svgText.getBBox();
        let ftt = svg.freeTransform(this.svgText);
        ftt.hideHandles();
        ftt.attrs.translate.x = x - this.bbox.ulx;

        let translateY;
        if (corner.includes("t")) {
            translateY = -textBBox.y; // shift baseline down
        } else if (corner.includes("m")) {
            translateY = h / 2 - textBBox.cy;
        } else if (corner.includes("b")) {
            translateY = h - textBBox.y2;
        }

        ftt.attrs.translate.y = translateY;
        ftt.apply();

        this.svgGroup.add(this.svgText);

        // Copy the group to `svg`
        svg.add(this.svgGroup);
        canvas = null;
    }

    /**
     * Add this instance to an SVG element
     *
     * @method addTo
     * @param {Object} parent The element
     */
    addTo(parent) {
        parent.add(this.svgGroup);
    }

    /**
     * Remove this instance from the SVG
     *
     * @method remove
     */
    remove() {
        this.svgGroup.remove();
    }

    setValue(value) {
        this.svgText.attr({
            text: value,
        });
    }
}

module.exports = Textbox;
