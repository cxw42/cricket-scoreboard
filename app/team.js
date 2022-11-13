// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

// A team in a match
class Team {
    name = "Unknown";
    color = "#5784E4";
    constructor(name, color) {
        if (name) {
            this.name = name;
        }
        if (color) {
            this.color = color;
        }
    }
};

module.exports = Team;
