"use strict";

Zon.TextureFolders = {
    levels: "levels",
    ui: "ui",
}

Zon.TextureLoader = {};

//Contains a map of all the textures in the game, organized by folder.
// (Contains the texture file paths when Zon.TextureLoader.makeTextureManifest() is called)
// (Converts the texture file paths to Struct.ImageDataWrapper's in Zon.TextureLoader.loadTextures())
// Access them like this:
// const imageDataWrapper = Zon.allTextures.levels.ARMOR["monochrome-transparent_32_1"];
// OR
// const imageDataWrapper = Zon.allTextures[Zon.TextureFolders.levels][Zon.StageIDNames[Zon.StageID.ARMOR]]["monochrome-transparent_32_1"];//This way is better.
// if you want direct access to the image instead of the Struct.ImageDataWrapper, just do imageDataWrapper.img().
Zon.allTextures;
Zon.TextureLoader.allTexturesLoadedPromise;

Zon.TextureLoader.startAsyncLoading = () => {
    if (Zon.allTextures) {
        console.error("Zon.allTextures has already been created.   Zon.TextureLoader.startAsyncLoading() shouldn't be called again.");
        return;
    }

    Zon.TextureLoader.makeTextureManifest();
    Zon.TextureLoader.addTextureActions.call(Zon.allTextures);
    Zon.TextureLoader.allTexturesLoadedPromise = Zon.TextureLoader.loadTextures();
}

Zon.TextureLoader.addTextureActions = new Actions.Action();

Zon.TextureLoader.loadTextures = async () => {
    console.log("Loading all textures...");
    await Zon.TextureLoader.convertPathsToImages(Zon.allTextures);
    Zon.LevelData.postLoadTextures();
    console.log("Finished loading all textures.");
}

Zon.TextureLoader.convertPathsToImages = async (obj) => {
    //Goes through Zon.allTextures which is currently a map of image file paths, and replaces the paths with the actual image objects
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === "string") {
			const img = new Image();
            img.crossOrigin = "anonymous";
			img.src = value;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

			obj[key] = new Struct.ImageDataWrapper(img);
		} else if (typeof value === "object" && value !== null) {
			await Zon.TextureLoader.convertPathsToImages(value);
		}
	}
};