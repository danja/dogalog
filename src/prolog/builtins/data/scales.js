/**
 * Musical scale definitions
 * Each scale is an array of semitone intervals from the root
 */
export const scales = {
  ionian:      [0, 2, 4, 5, 7, 9, 11], // major
  dorian:      [0, 2, 3, 5, 7, 9, 10],
  phrygian:    [0, 1, 3, 5, 7, 8, 10],
  lydian:      [0, 2, 4, 6, 7, 9, 11],
  mixolydian:  [0, 2, 4, 5, 7, 9, 10],
  aeolian:     [0, 2, 3, 5, 7, 8, 10], // natural minor
  locrian:     [0, 1, 3, 5, 6, 8, 10],
  major_pent:  [0, 2, 4, 7, 9],
  minor_pent:  [0, 3, 5, 7, 10],
  blues:       [0, 3, 5, 6, 7, 10]
};
