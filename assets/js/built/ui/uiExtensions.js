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

HTMLDivElement.prototype.setBackgroundImage = function(path, stretchToFit = true) {
    this.style.backgroundImage = `url(${path})`;
    this.style.backgroundSize = stretchToFit ? "100% 100%" : "contain";
    this.style.backgroundRepeat = "no-repeat";
    this.style.backgroundPosition = "center center";
}

HTMLDivElement.prototype.addOnClick = function(onClick) {
    this.addEventListener('click', onClick);
}

HTMLDivElement.prototype.setScrollableColumnStyle = function(alwaysShowScrollBar = true) {
    this.style.overflowY = alwaysShowScrollBar ? 'scroll' : 'auto';
    this.style.overflowX = 'hidden';
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
}
HTMLDivElement.prototype.setScrollableRowStyle = function(alwaysShowScrollBar = true) {
    this.style.overflowX = alwaysShowScrollBar ? 'scroll' : 'auto';
    this.style.overflowY = 'hidden';
    this.style.display = 'flex';
    this.style.flexDirection = 'row';
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