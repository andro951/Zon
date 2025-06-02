Zon.TextureLoader.makeTextureManifest = () => {
	if (Zon.allTextures) {
		console.warn("Texture manifest has already been created.  Creating it again would delete all images.");
		return;
	}

	Zon.allTextures = {
		"levels": {
			"ARMOR": {
				"monochrome-transparent_32_1": "assets/textures/levels/ARMOR/monochrome-transparent_32_1.png",
				"monochrome-transparent_33_1": "assets/textures/levels/ARMOR/monochrome-transparent_33_1.png",
				"monochrome-transparent_34_1": "assets/textures/levels/ARMOR/monochrome-transparent_34_1.png",
				"monochrome-transparent_35_1": "assets/textures/levels/ARMOR/monochrome-transparent_35_1.png",
				"monochrome-transparent_36_1": "assets/textures/levels/ARMOR/monochrome-transparent_36_1.png",
				"monochrome-transparent_37_1": "assets/textures/levels/ARMOR/monochrome-transparent_37_1.png",
				"monochrome-transparent_38_1": "assets/textures/levels/ARMOR/monochrome-transparent_38_1.png"
			},
			"BUGS": {
				"monochrome-transparent_24_5": "assets/textures/levels/BUGS/monochrome-transparent_24_5.png",
				"monochrome-transparent_25_5": "assets/textures/levels/BUGS/monochrome-transparent_25_5.png",
				"monochrome-transparent_26_5": "assets/textures/levels/BUGS/monochrome-transparent_26_5.png",
				"monochrome-transparent_27_5": "assets/textures/levels/BUGS/monochrome-transparent_27_5.png",
				"monochrome-transparent_28_5": "assets/textures/levels/BUGS/monochrome-transparent_28_5.png",
				"monochrome-transparent_29_5": "assets/textures/levels/BUGS/monochrome-transparent_29_5.png",
				"monochrome-transparent_30_5": "assets/textures/levels/BUGS/monochrome-transparent_30_5.png",
				"monochrome-transparent_31_5": "assets/textures/levels/BUGS/monochrome-transparent_31_5.png"
			},
			"HELMETS": {
				"monochrome-transparent_32_0": "assets/textures/levels/HELMETS/monochrome-transparent_32_0.png",
				"monochrome-transparent_33_0": "assets/textures/levels/HELMETS/monochrome-transparent_33_0.png",
				"monochrome-transparent_34_0": "assets/textures/levels/HELMETS/monochrome-transparent_34_0.png",
				"monochrome-transparent_35_0": "assets/textures/levels/HELMETS/monochrome-transparent_35_0.png",
				"monochrome-transparent_36_0": "assets/textures/levels/HELMETS/monochrome-transparent_36_0.png",
				"monochrome-transparent_37_0": "assets/textures/levels/HELMETS/monochrome-transparent_37_0.png",
				"monochrome-transparent_38_0": "assets/textures/levels/HELMETS/monochrome-transparent_38_0.png"
			},
			"MONSTERS_ASSORTED_LV2": {
				"monochrome-transparent_25_6": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_25_6.png",
				"monochrome-transparent_26_9": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_26_9.png",
				"monochrome-transparent_27_0": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_27_0.png",
				"monochrome-transparent_27_9": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_27_9.png",
				"monochrome-transparent_28_2": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_28_2.png",
				"monochrome-transparent_28_3": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_28_3.png",
				"monochrome-transparent_29_1": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_29_1.png",
				"monochrome-transparent_30_9": "assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_30_9.png"
			},
			"MONSTERS_ASSORTED_LV3": {
				"monochrome-transparent_28_0": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_0.png",
				"monochrome-transparent_28_6": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_6.png",
				"monochrome-transparent_28_9": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_9.png",
				"monochrome-transparent_29_0": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_29_0.png",
				"monochrome-transparent_31_4": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_31_4.png",
				"monochrome-transparent_31_9": "assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_31_9.png"
			},
			"MONSTERS_ASSORTED_LV4": {
				"monochrome-transparent_29_9": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_29_9.png",
				"monochrome-transparent_30_0": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_0.png",
				"monochrome-transparent_30_2": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_2.png",
				"monochrome-transparent_30_6": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_6.png",
				"monochrome-transparent_31_0": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_31_0.png",
				"monochrome-transparent_31_6": "assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_31_6.png"
			},
			"MONSTERS_DEMONS": {
				"monochrome-transparent_25_2": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_25_2.png",
				"monochrome-transparent_25_3": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_25_3.png",
				"monochrome-transparent_26_2": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_26_2.png",
				"monochrome-transparent_26_3": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_26_3.png",
				"monochrome-transparent_27_2": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_27_2.png",
				"monochrome-transparent_27_3": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_27_3.png",
				"monochrome-transparent_29_2": "assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_29_2.png"
			},
			"MONSTERS_MAGES": {
				"monochrome-transparent_24_0": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_0.png",
				"monochrome-transparent_24_1": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_1.png",
				"monochrome-transparent_24_2": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_2.png",
				"monochrome-transparent_24_6": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_6.png",
				"monochrome-transparent_30_1": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_30_1.png",
				"monochrome-transparent_31_1": "assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_31_1.png"
			},
			"MONSTERS_UNDEAD": {
				"monochrome-transparent_26_6": "assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_26_6.png",
				"monochrome-transparent_27_6": "assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_27_6.png",
				"monochrome-transparent_27_8": "assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_27_8.png",
				"monochrome-transparent_29_4": "assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_29_4.png",
				"monochrome-transparent_29_6": "assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_29_6.png"
			},
			"MONSTERS_WILD_CREATURES": {
				"monochrome-transparent_25_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_25_8.png",
				"monochrome-transparent_26_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_26_8.png",
				"monochrome-transparent_28_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_28_8.png",
				"monochrome-transparent_29_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_29_8.png",
				"monochrome-transparent_30_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_30_8.png",
				"monochrome-transparent_31_8": "assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_31_8.png"
			}
		},
		"ui": {
			"buttonSquare_grey_pressed_NoRips": "assets/textures/ui/buttonSquare_grey_pressed_NoRips.png",
			"SideBarHideIcon": "assets/textures/ui/SideBarHideIcon.png",
			"SideBarShowIcon": "assets/textures/ui/SideBarShowIcon.png"
		}
	};
}