// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Utils = require("utils");

// Basic text style
const textStyles = {
    "font-family": "'Atkinson Hyperlegible', Rubik, sans-serif",
    size: "0.9em",
    "letter-spacing": "0.5", // empirical
    fill: "#fff", // XXX
};
const iconStyles = Utils.extend(textStyles, {
    "font-style": "normal",
    "font-size": "0.75em",
});
const numberStyles = {
    "font-family": "Rubik, 'Atkinson Hyperlegible', sans-serif",
};
const scoreStyles = {
    "font-family": "Rubik, 'Atkinson Hyperlegible', sans-serif",
    "font-style": "oblique",
    "letter-spacing": "1", // empirical
};
const labelTextSize = "50%";
const powerplayTextSize = "75%";
const scoreTextSize = "x-large";

// Useful constants

// Thanks for code values to
// <https://www.greatphotography.com/blog/2016/6/14/18-gray-the-middle-value>
const gray9 = "#5c5c5c";
const gray18 = "#737373";
const gray36 = "#c9c9c9";

module.exports = {
    textStyles,
    iconStyles,
    numberStyles,
    scoreStyles,
    labelTextSize,
    powerplayTextSize,
    scoreTextSize,

    gray9,
    gray18,
    gray36,
};
