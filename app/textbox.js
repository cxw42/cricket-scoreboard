// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

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
class Textbox {
    group; // the group of shapes
    outline; // visible outline
    text; // Two.Text instance

    constructor(svg, x, y, w, h, corner, textAndStyles, opts = {}) {
        opts.background = opts.background || {};
        if (typeof textAndStyles !== typeof []) {
            textAndStyles = [textAndStyles];
        }

        // always put the text on the baseline
        let localStyles = {};
        localStyles.baseline = "baseline";

        corner = corner.toLowerCase();

        // Get the upper-left corner
        let ulx, uly;
        if (corner.includes("l")) {
            ulx = x;
            localStyles.alignment = "start";
        } else if (corner.includes("c")) {
            ulx = x - w / 2;
            localStyles.alignment = "middle";
        } else if (corner.includes("r")) {
            ulx = x - w;
            localStyles.alignment = "end";
        } else {
            throw "corner must specify l, c, or r";
        }

        if (corner.includes("t")) {
            uly = y;
        } else if (corner.includes("m")) {
            uly = y - h / 2;
        } else if (corner.includes("b")) {
            uly = y - h;
        } else {
            throw "corner must specify t, m, or b";
        }

        // Create a temporary canvas we will use
        let canvas = Snap();
        canvas.hide();

        // Create the group and position it at the given place
        this.group = svg.g().addClass("Textbox");
        let ftg = svg.freeTransform(this.group);
        ftg.hideHandles();
        ftg.attrs.translate.x = ulx;
        ftg.attrs.translate.y = uly;
        ftg.apply();

        // Outline
        this.outline = svg.rect(0, 0, w, h).attr(
            Utils.extend(
                {
                    fill: "none",
                    stroke: "none",
                },
                opts.background
            )
        );
        this.group.add(this.outline);

        // Create the text and position it horizontally
        localStyles["text-align"] = localStyles["text-anchor"] =
            localStyles.alignment;
        this.text = svg.text(
            0,
            0,
            textAndStyles.map((o) => Utils.extend(o.text, localStyles))
        );
        const kids = this.text.children();
        for (let i = 0; i < textAndStyles.length; ++i) {
            kids[i].attr(
                Utils.extend(textAndStyles[i].styles || {}, localStyles)
            );
        }

        // Position the text
        const where = this.text.getBBox();
        let ftt = svg.freeTransform(this.text);
        ftt.hideHandles();
        ftt.attrs.translate.x = x - ulx;

        let translateY;
        if (corner.includes("t")) {
            translateY = -where.y; // shift baseline down
        } else if (corner.includes("m")) {
            translateY = h / 2 - where.cy;
        } else if (corner.includes("b")) {
            translateY = h - where.y2;
        }

        ftt.attrs.translate.y = translateY;
        ftt.apply();

        this.group.add(this.text);

        // Copy the group to `svg`
        svg.add(this.group);
        canvas = null;
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

    setValue(value) {
        this.text.attr({
            text: value,
        });
    }
}

module.exports = Textbox;
