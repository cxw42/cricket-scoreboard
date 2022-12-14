// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Utils = require("utils");

// Basic text style
const textStyles = {
    "font-family": "Rubik, 'Atkinson Hyperlegible', sans-serif",
    "font-style": "oblique",
    size: "0.9em",
    "letter-spacing": "1", // empirical
    fill: "#fff", // XXX
};
const iconStyles = Utils.extend(textStyles, {
    "font-style": "normal",
    "font-size": "0.75em",
});
const labelTextSize = "50%";
const powerplayTextSize = "75%";
const scoreTextSize = "x-large";

module.exports = {
    textStyles,
    iconStyles,
    labelTextSize,
    powerplayTextSize,
    scoreTextSize,
};
