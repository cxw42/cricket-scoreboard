// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
//const Snap = require("snapsvg");
const Utils = require("utils");
require("3rdparty/snap.svg.free_transform");

/**
 * A rectangle
 *
 * @class Rect
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} opts Options.  Keys include:
 *      - `background`: styles for the background (Object or 'none')
 */
class Rect extends Shape {
    svgRect; // svg <rect>

    constructor(svg, x, y, w, h, corner, opts = {}) {
        super(svg, x, y, w, h, corner);

        let background = opts.background || "none";
        if (background === "none") {
            background = {};
        }

        this.svgRect = svg.rect(0, 0, w, h).attr(
            Utils.extend(
                {
                    fill: "none",
                    stroke: "none",
                },
                background
            )
        );
        this.group.add(this.svgRect);
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

module.exports = Rect;
