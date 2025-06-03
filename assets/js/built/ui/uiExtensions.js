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

HTMLDivElement.prototype.setBackgroundImage = function(name) {
    const imageString = `url(${Zon.allTextures.ui[name].img().src})`;
    this.style.backgroundImage = imageString;
    // this.style.backgroundSize = "cover";
    this.style.backgroundSize = "100% 100%";
    this.style.backgroundRepeat = "no-repeat";
}

HTMLDivElement.prototype.addOnClick = function(onClick) {
    this.addEventListener('click', onClick);
}

//HTMLCanvasElement