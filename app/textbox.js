// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

let Two = require('two.js');

/**
 * A text box anchored at one corner
 *
 * @class Textbox
 * @constructor
 * @param {int} x Corner X
 * @param {int} y Corner Y
 * @param {int} w Width
 * @param {int} h Height
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

    constructor(x, y, w, h, corner = 'tl', styles = {}) {
        // Clone the styles since we are going to change params
        let bgFill = styles['bgFill'] || 'none';
        styles = structuredClone(styles);
        delete styles['bgfill'];

        corner = corner.toLowerCase();

        if (corner.includes('t')) {
            this.twoY = y + h / 2;
        } else if (corner.includes('m')) {
            this.twoY = y;
        } else if (corner.includes('b')) {
            this.twoY = y - h / 2;
        } else {
            throw "corner must specify t, m, or b";
        }

        if (corner.includes('l')) {
            this.twoX = x + w / 2;
            styles.alignment = 'left';
        } else if (corner.includes('c')) {
            this.twoX = x;
            styles.alignment = 'center';
        } else if (corner.includes('r')) {
            this.twoX = x - w / 2;
            styles.alignment = 'right';
        } else {
            throw "corner must specify l, c, or r";
        }

        this.text = new Two.Text('', this.twoX, this.twoY, styles);
        this.outline = new Two.Rectangle(this.twoX, this.twoY, w, h);
        this.outline.fill = bgFill;
        this.group = new Two.Group(this.outline, this.text);
    }

    addTo(two) {
        this.group.addTo(two)
    }

    setValue(value) {
        this.text.value = value;
    }

};

module.exports = Textbox;
