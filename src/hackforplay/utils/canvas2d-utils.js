/**
 * @param {CanvasRenderingContext2D} context Context
 * @param {number} x       X
 * @param {number} y       Y
 * @param {number} w       Width
 * @param {number} h       Height
 * @param {number} radius  Radius
 */
export function roundRect(context, x, y, w, h, radius) {
	context.beginPath();
	context.arc(x + radius, y + radius, radius, -Math.PI, -0.5 * Math.PI, false);
	context.arc(x + w - radius, y + radius, radius, -0.5 * Math.PI, 0, false);
	context.arc(x + w - radius, y + h - radius, radius, 0, 0.5 * Math.PI, false);
	context.arc(x + radius, y + h - radius, radius, 0.5 * Math.PI, Math.PI, false);
	context.closePath();
	return context;
}
