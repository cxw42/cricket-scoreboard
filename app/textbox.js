// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require('snapsvg');
const Utils = require('utils');
require('3rdparty/snap.svg.free_transform');

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
 * @param {String|Array[String]} text Text per Snap.text()
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object} styles Styles per [Two.Text](https://two.js.org/docs/text/),
 *                        plus 'bgFill' which, if set, is used as a background
 *                        fill.
 */
class Textbox {
    // two.js coordinates
    twoX;
    twoY;

    group; // the group of shapes
    outline; // visible outline
    text; // Two.Text instance

    constructor(svg, x, y, w, h, text, corner = 'tl', styles = {}) {
        // Clone the styles since we are going to change params
        let bgFill = styles['bgFill'] || 'none';
        styles = structuredClone(styles);
        delete styles['bgfill'];

        corner = corner.toLowerCase();

        let ulx, uly;
        if (corner.includes('t')) {
            uly = y;
        } else if (corner.includes('m')) {
            uly = y - h / 2;
        } else if (corner.includes('b')) {
            uly = y - h;
        } else {
            throw "corner must specify t, m, or b";
        }

        // TODO handle right-justification
        if (corner.includes('l')) {
            ulx = x;
            styles.alignment = 'left';
        } else if (corner.includes('c')) {
            ulx = x - w / 2;
            styles.alignment = 'center';
        } else if (corner.includes('r')) {
            ulx = x - w;
            styles.alignment = 'right';
        } else {
            throw "corner must specify l, c, or r";
        }

        styles.baseline = 'baseline';
        styles['text-align'] = styles['text-anchor'] = 'start';
        this.text = svg.text(0, 0, text).attr(styles);
        this.group = svg.g();
        this.group.add(this.text);

        // TODO permit updating the styles before calling positionGroupAt()
        const pos = Utils.positionGroupAt(this.group, this.text, ulx, uly,
            w, h);
        this.outline = svg.rect(pos.xInGroup, pos.yInGroup, w, h).attr({
            fill: bgFill,
            stroke: '#0ff'
        });
        this.group.add(this.outline);
    }

    addTo(el) {
        el.add(this.group);
    }

    setValue(value) {
        this.text.attr({
            text: value
        });
    }

};

module.exports = Textbox;
