export const PLAYER_LINE_OPTIONS = {
    roughness: 2, // Numerical value indicating how rough the drawing is. A rectangle with the roughness of 0 would be a perfect rectangle. Default value is 1. There is no upper limit to this value, but a value over 10 is mostly useless.

    //Numerical value indicating how curvy the lines are when drawing a sketch. A value of 0 will cause straight lines. Default value is 1.
    bowing: 2,

    //String value representing the color of the drawn objects. Default value is black (#000000). If the this is set to none, the shape vectors do not contain a stroke (This is different from having a transparent stroke).
    stroke: "#000000",

    // Numerical value to set the width of the strokes (in pixels). Default value is 1.
    strokeWidth: 4,

    // fill: '',
    // String value representing the color used to fill a shape. In hachure style fills, this represents the color of the hachure lines. In dots style, it represents the color of the dots.
    // Rough.js supports the following styles (Default value is hachure):
    // hachure draws sketchy parallel lines with the same roughness as defined by the roughness and the bowing properties of the shape. It can be further configured using the fillWeight, hachureAngle, and hachureGap properties.
    // solid is more like a conventional fill.
    // zigzag draws zig-zag lines filling the shape
    // cross-hatch Similar to hachure, but draws cross hatch lines (akin to two hachure fills 90 degrees from each other).
    // dots Fills the shape with sketchy dots.
    // dashed Similar to hachure but the individual lines are dashed. Dashes can be configured using the dashOffset and dashGap properties.
    // zigzag-line Similar to hachure but individual lines are drawn in a zig-zag fashion. The size of the zig-zag can be configured using the zigzagOffset proeprty
    // fillStyle:

    // curveFitting
    // When drawing ellipses, circles, and arcs, Let RoughJS know how close should the rendered dimensions be when compared to the specified one. Default value is 0.95 - which means the rendered dimensions will be at least 95% close to the specified dimensions. A value of 1 will ensure that the dimensions are almost 100% accurate.
};
