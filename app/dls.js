// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

//const Utils = require("utils");

// 50-over DLS table
//
// From https://icc-static-files.s3.amazonaws.com/ICC/document/2017/01/09/57272b5a-775e-4034-bb49-437052b5bee6/DuckworthLewis-Standard-Edition-Table.pdf
//
// Indexed by (50-oversRemaining) and then by wicketsLost
const DLS50 = [
    [100, 93.4, 85.1, 74.9, 62.7, 49, 34.9, 22, 11.9, 4.7],
    [99.1, 92.6, 84.5, 74.4, 62.5, 48.9, 34.9, 22, 11.9, 4.7],
    [98.1, 91.7, 83.8, 74, 62.2, 48.8, 34.9, 22, 11.9, 4.7],
    [97.1, 90.9, 83.2, 73.5, 61.9, 48.6, 34.9, 22, 11.9, 4.7],
    [96.1, 90, 82.5, 73, 61.6, 48.5, 34.8, 22, 11.9, 4.7],
    [95, 89.1, 81.8, 72.5, 61.3, 48.4, 34.8, 22, 11.9, 4.7],
    [93.9, 88.2, 81, 72, 61, 48.3, 34.8, 22, 11.9, 4.7],
    [92.8, 87.3, 80.3, 71.4, 60.7, 48.1, 34.7, 22, 11.9, 4.7],
    [91.7, 86.3, 79.5, 70.9, 60.3, 47.9, 34.7, 22, 11.9, 4.7],
    [90.5, 85.3, 78.7, 70.3, 59.9, 47.8, 34.6, 22, 11.9, 4.7],
    [89.3, 84.2, 77.8, 69.6, 59.5, 47.6, 34.6, 22, 11.9, 4.7],
    [88, 83.1, 76.9, 69, 59.1, 47.4, 34.5, 22, 11.9, 4.7],
    [86.7, 82, 76, 68.3, 58.7, 47.1, 34.5, 21.9, 11.9, 4.7],
    [85.4, 80.9, 75, 67.6, 58.2, 46.9, 34.4, 21.9, 11.9, 4.7],
    [84.1, 79.7, 74.1, 66.8, 57.7, 46.6, 34.3, 21.9, 11.9, 4.7],
    [82.7, 78.5, 73, 66, 57.2, 46.4, 34.2, 21.9, 11.9, 4.7],
    [81.3, 77.2, 72, 65.2, 56.6, 46.1, 34.1, 21.9, 11.9, 4.7],
    [79.8, 75.9, 70.9, 64.4, 56, 45.8, 34, 21.9, 11.9, 4.7],
    [78.3, 74.6, 69.7, 63.5, 55.4, 45.4, 33.9, 21.9, 11.9, 4.7],
    [76.7, 73.2, 68.6, 62.5, 54.8, 45.1, 33.7, 21.9, 11.9, 4.7],
    [75.1, 71.8, 67.3, 61.6, 54.1, 44.7, 33.6, 21.8, 11.9, 4.7],
    [73.5, 70.3, 66.1, 60.5, 53.4, 44.2, 33.4, 21.8, 11.9, 4.7],
    [71.8, 68.8, 64.8, 59.5, 52.6, 43.8, 33.2, 21.8, 11.9, 4.7],
    [70.1, 67.2, 63.4, 58.4, 51.8, 43.3, 33, 21.7, 11.9, 4.7],
    [68.3, 65.6, 62, 57.2, 50.9, 42.8, 32.8, 21.7, 11.9, 4.7],
    [66.5, 63.9, 60.5, 56, 50, 42.2, 32.6, 21.6, 11.9, 4.7],
    [64.6, 62.2, 59, 54.7, 49, 41.6, 32.3, 21.6, 11.9, 4.7],
    [62.7, 60.4, 57.4, 53.4, 48, 40.9, 32, 21.5, 11.9, 4.7],
    [60.7, 58.6, 55.8, 52, 47, 40.2, 31.6, 21.4, 11.9, 4.7],
    [58.7, 56.7, 54.1, 50.6, 45.8, 39.4, 31.2, 21.3, 11.9, 4.7],
    [56.6, 54.8, 52.4, 49.1, 44.6, 38.6, 30.8, 21.2, 11.9, 4.7],
    [54.4, 52.8, 50.5, 47.5, 43.4, 37.7, 30.3, 21.1, 11.9, 4.7],
    [52.2, 50.7, 48.6, 45.9, 42, 36.8, 29.8, 20.9, 11.9, 4.7],
    [49.9, 48.5, 46.7, 44.1, 40.6, 35.8, 29.2, 20.7, 11.9, 4.7],
    [47.6, 46.3, 44.7, 42.3, 39.1, 34.7, 28.5, 20.5, 11.8, 4.7],
    [45.2, 44.1, 42.6, 40.5, 37.6, 33.5, 27.8, 20.2, 11.8, 4.7],
    [42.7, 41.7, 40.4, 38.5, 35.9, 32.2, 27, 19.9, 11.8, 4.7],
    [40.2, 39.3, 38.1, 36.5, 34.2, 30.8, 26.1, 19.5, 11.7, 4.7],
    [37.6, 36.8, 35.8, 34.3, 32.3, 29.4, 25.1, 19, 11.6, 4.7],
    [34.9, 34.2, 33.4, 32.1, 30.4, 27.8, 24, 18.5, 11.5, 4.7],
    [32.1, 31.6, 30.8, 29.8, 28.3, 26.1, 22.8, 17.9, 11.4, 4.7],
    [29.3, 28.9, 28.2, 27.4, 26.1, 24.2, 21.4, 17.1, 11.2, 4.7],
    [26.4, 26, 25.5, 24.8, 23.8, 22.3, 19.9, 16.2, 10.9, 4.7],
    [23.4, 23.1, 22.7, 22.2, 21.4, 20.1, 18.2, 15.2, 10.5, 4.7],
    [20.3, 20.1, 19.8, 19.4, 18.8, 17.8, 16.4, 13.9, 10.1, 4.6],
    [17.2, 17, 16.8, 16.5, 16.1, 15.4, 14.3, 12.5, 9.4, 4.6],
    [13.9, 13.8, 13.7, 13.5, 13.2, 12.7, 12, 10.7, 8.4, 4.5],
    [10.6, 10.5, 10.4, 10.3, 10.2, 9.9, 9.5, 8.7, 7.2, 4.2],
    [7.2, 7.1, 7.1, 7, 7, 6.8, 6.6, 6.2, 5.5, 3.7],
    [3.6, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.2, 2.5],
];

// 20-over BGS table
//
// From https://www.sfu.ca/~tswartz/papers/perera.pdf
// Perera, H. and Swartz, T.B. (2013). Resource estimation in Twenty20 cricket.
// IMA Journal of Management Mathematics, 24(3), 337-347.
//
// Indexed by (20-oversRemaining) and then by wicketsLost
const BGS20 = [
    [100, 97.6, 97.3, 86.7, 78.8, 68.2, 54.5, 38.4, 22, 9.5],
    [98.5, 97.3, 97.1, 85.2, 76.6, 66.6, 53.5, 37.4, 21.6, 9.4],
    [97.5, 95.9, 94, 84.8, 75.3, 65, 52.6, 37, 21.3, 9.3],
    [95.3, 93, 91.4, 84.4, 75.1, 63.4, 51.5, 36.5, 21.1, 9.2],
    [91.5, 87.8, 84.2, 80.3, 75, 62.9, 50.4, 36.1, 21, 9.1],
    [86.8, 82.8, 80.9, 75.6, 73.7, 61.9, 49.1, 35.7, 20.8, 9],
    [77.2, 73.6, 70.7, 68.7, 63.9, 58.8, 47.7, 35.2, 20.7, 8.9],
    [74.6, 69, 64.6, 60.5, 56.5, 53, 46.1, 34.8, 20.6, 8.8],
    [64.7, 63, 58.9, 56.8, 53.9, 52.7, 44.3, 34.5, 20.4, 8.7],
    [61.4, 58.5, 52, 50, 47.6, 43.3, 43.1, 33.5, 20.2, 8.6],
    [55.1, 53.4, 48.8, 46.5, 43.8, 40.2, 38.1, 32.4, 20, 8.5],
    [52.6, 47, 41.7, 40.5, 38.2, 36.3, 34.3, 29.1, 19.7, 8.4],
    [47.3, 41.9, 37.8, 35.6, 33.9, 31.3, 29.2, 28.2, 19.2, 8.3],
    [42.4, 40.2, 33.4, 31.7, 29.2, 27.7, 26.4, 24.6, 18.5, 8.2],
    [37.2, 34.9, 29.8, 27.2, 26, 24.5, 21.7, 19.9, 17.8, 8.1],
    [32.4, 32.1, 24.6, 24.1, 22.3, 21.6, 19, 17.4, 17.2, 8],
    [27.9, 27.5, 21.1, 19.4, 18.3, 16.8, 16.3, 14.2, 10.8, 7.7],
    [20.2, 19.9, 16.8, 16.2, 15.2, 13.9, 12.8, 10.7, 9.8, 5.8],
    [14.8, 14.6, 10.5, 10.2, 9.5, 9.1, 8.9, 8.3, 6.9, 4.8],
    [8.8, 8.7, 7.8, 6.4, 6.2, 5.5, 5.2, 4.7, 4.5, 2.9],
];

/**
 * Resources remaining, 50-over match
 *
 * @method resourcesRemaining50
 * @param {int} oversLeft Overs remaining, which may include a decimal fraction (4.5 = 4 ov, 3 balls)
 * @param {int} wicketsLost Wickets lost
 * @return {float} The decimal fraction
 */
function resourcesRemaining(table, maxOvers, oversLeft, wicketsLost) {
    if (wicketsLost > 9 || oversLeft <= 0) {
        return 0;
    }

    if (Math.floor(oversLeft) == oversLeft) {
        return table[maxOvers - oversLeft][wicketsLost] / 100.0;
    } else {
        // Linear interpolation across an over rather than using the full 300-entry
        // ICC table for a 50-over match.
        let wholeOversLeft = Math.floor(oversLeft);
        let percentOfOverLeft = oversLeft - wholeOversLeft;
        let above = table[maxOvers - (wholeOversLeft + 1)][wicketsLost];
        let below = table[maxOvers - wholeOversLeft][wicketsLost];

        return (below + percentOfOverLeft * (above - below)) / 100.0;
    }
}

/**
 * Resources remaining, 50-over match
 *
 * @method resourcesRemaining50
 * @param {int} oversLeft Overs remaining, which may include a decimal fraction (4.5 = 4 ov, 3 balls)
 * @param {int} wicketsLost Wickets lost
 */
function resourcesRemaining50(oversLeft, wicketsLost) {
    return resourcesRemaining(DLS50, 50, oversLeft, wicketsLost);
}

/**
 * Resources remaining, 20-over match
 *
 * @method resourcesRemaining20
 * @param {int} oversLeft Overs remaining, which may include a decimal fraction (4.5 = 4 ov, 3 balls)
 * @param {int} wicketsLost Wickets lost
 */
function resourcesRemaining20(oversLeft, wicketsLost) {
    return resourcesRemaining(BGS20, 20, oversLeft, wicketsLost);
}

// Virtual runs?  An experiment.  This is something like what team 1 would have had to score
// to beat team2 if team2 had batted out its full 20 overs.
// A hack based on my reading of
// <https://icc-static-files.s3.amazonaws.com/ICC/document/2017/01/09/ca50a5e9-0241-494a-8773-d0cec059b31f/DuckworthLewis-Methodology.pdf>.
//
// E.g., <https://www.espncricinfo.com/series/bangladesh-premier-league-2022-23-1346160/sylhet-strikers-vs-chattogram-challengers-28th-match-1351079/full-scorecard>:
// Challengers batted first and made 174/6 in 20 overs.  Sylhet reached 177/3 in 18 overs,
// winning by seven wickets.  Sylhet had 10.2% of its resources left when it won,
// so had used 89.8%.  Therefore, batting a full 20 overs, Sylhet could have made
// 177 * (100/89.8) = 197 runs.  Accordingly, its virtual run victory over the
// Challengers was 197-174 = 23 runs.
function wonByVirtualRuns20(
    team1Score,
    team2Score,
    team2OversLeft,
    team2WicketsLost
) {
    // let team1ResourcesUsed = 100;   // assumption
    let team2ResourcesUsed =
        1 - resourcesRemaining20(team2OversLeft, team2WicketsLost);
    return team2Score / team2ResourcesUsed - team1Score; // TODO floor?
}

module.exports = {
    resourcesRemaining50,
    resourcesRemaining20,
    wonByVirtualRuns20,
};
