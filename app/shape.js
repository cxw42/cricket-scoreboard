// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require("snapsvg");
const Utils = require("utils");
require("3rdparty/snap.svg.free_transform");

/**
 * A shape anchored at a point.
 *
 * @class Shape
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 */
class Shape {
    /**
     * The SnapSVG instance we belong to
     *
     * @protected
     * @property svg
     */
    //svg = null;

    /**
     * Our bounding box
     *
     * @protected
     * @property bbox
     */
    //bbox = {};

    /**
     * The free transform for `group`.
     *
     * You can use this to move, rotate, &c. the Shape as a whole.
     *
     * @protected
     * @property ft
     */
    //ft = null;

    //outline; // visible outline --- TODO addme?

    constructor(svg, x, y, w, h, corner) {
        this.svg = svg;

        /**
         * Our top-level SVG element.
         *
         * Anything added by a subclass should be added to this group.
         *
         * @protected
         * @property group
         */
        this.group = svg.g();

        this.group.addClass(this.constructor.name);
        this.bbox = Utils.getBBox(x, y, w, h, corner);
        this.ft = Utils.freeTransformTo(
            this.group,
            this.bbox.ulx,
            this.bbox.uly
        );

        svg.add(this.group);
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

    /**
     * Move or resize this shape
     *
     * @method
     */
    setBBox(x, y, w, h, corner) {
        this.bbox = Utils.getBBox(x, y, w, h, corner);
        this.ft.attrs.translate.x = this.bbox.ulx;
        this.ft.attrs.translate.y = this.bbox.uly;
        this.ft.apply();
    }
}

module.exports = Shape;
