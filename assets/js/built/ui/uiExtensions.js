"use strict";

HTMLDivElement.prototype.setBorder = function(size, color = 'black', blurRadius = 0) {
    const colorString = color instanceof Struct.Color ? color.cssString : color;
    this.style.textShadow = `
        -${size}px -${size}px ${blurRadius}px ${colorString},
         ${size}px -${size}px ${blurRadius}px ${colorString},
        -${size}px  ${size}px ${blurRadius}px ${colorString},
         ${size}px  ${size}px ${blurRadius}px ${colorString}
    `
}

//HTMLCanvasElement