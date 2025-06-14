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

HTMLDivElement.prototype.setBackgroundImage = function(path) {
    this.style.backgroundImage = `url(${path})`;
    this.style.backgroundSize = "100% 100%";
    this.style.backgroundRepeat = "no-repeat";
}

HTMLDivElement.prototype.addOnClick = function(onClick) {
    this.addEventListener('click', onClick);
}

HTMLDivElement.prototype.setScrollableColumnStyle = function() {
    this.style.overflowY = 'auto';
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
}

Zon.UI.UIElementDiv.prototype.addEmptyIcon = function() {
    const icon = document.createElement('div');
    this.icon = icon;
    this.icon.style.position = 'absolute';
    icon.style.top = '50%';
    icon.style.left = '50%';
    icon.style.transform = 'translate(-50%, -50%)';
    icon.style.width = '50%';
    icon.style.height = '50%';
    icon.style.pointerEvents = 'none';

    this.element.appendChild(icon);
}

//HTMLCanvasElement