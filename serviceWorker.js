"use strict";

const zonDebug = true;//DONT FORGET TO RUN ZonTextureManifestGenerator BEFORE PUBLISHING!!!!!!
const isWorkerContext = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

const CACHE_NAME = 'zon-game-cache-v0.0.7';
console.log(`CACHE version: ${CACHE_NAME} (${isWorkerContext ? 'Service Worker' : 'Game'}, ${zonDebug ? 'Debug' : 'Release'})`);

//ASSETS Start
const ASSETS = [
	'./',
	'./index.html',
	'./registerServiceWorker.js',
	'./serviceWorker.js',
	'./assets/css/style.css',
	'./assets/js/built/device.js',
	'./assets/js/built/game.js',
	'./assets/js/built/settings.js',
	'./assets/js/built/abilities/ability.js',
	'./assets/js/built/abilities/abilityController.js',
	'./assets/js/built/abilities/focus.js',
	'./assets/js/built/balls/ball.js',
	'./assets/js/built/balls/ballManager.js',
	'./assets/js/built/blocks/block.js',
	'./assets/js/built/blocks/blocksManager.js',
	'./assets/js/built/cores/coreManager.js',
	'./assets/js/built/cores/effects/aetherGained.js',
	'./assets/js/built/cores/effects/aetherNodePower.js',
	'./assets/js/built/cores/effects/creationPower.js',
	'./assets/js/built/cores/talents/talentManager.js',
	'./assets/js/built/crafting/blueprint.js',
	'./assets/js/built/crafting/craftingManager.js',
	'./assets/js/built/crafting/craftingTaskManager.js',
	'./assets/js/built/crafting/Item/item.js',
	'./assets/js/built/crafting/Item/itemID.js',
	'./assets/js/built/gameFlow/gameManager.js',
	'./assets/js/built/gameFlow/levelData.js',
	'./assets/js/built/gameFlow/processManager.js',
	'./assets/js/built/gameFlow/setup.js',
	'./assets/js/built/gameFlow/setupManager.js',
	'./assets/js/built/gameFlow/stageSmartReset.js',
	'./assets/js/built/gameFlow/start.js',
	'./assets/js/built/gameFlow/timeController.js',
	'./assets/js/built/gameState/gameState.js',
	'./assets/js/built/gameState/gameStateGame.js',
	'./assets/js/built/gameState/gameStateMainMenu.js',
	'./assets/js/built/gameState/gameStatePause.js',
	'./assets/js/built/general/health.js',
	'./assets/js/built/io/ioManager.js',
	'./assets/js/built/io/saveLoadHelper.js',
	'./assets/js/built/math/algebra.js',
	'./assets/js/built/math/collisions.js',
	'./assets/js/built/math/trig.js',
	'./assets/js/built/player/aetherBonusManager.js',
	'./assets/js/built/player/manaBar.js',
	'./assets/js/built/player/playerInventory.js',
	'./assets/js/built/player/playerLevel.js',
	'./assets/js/built/player/reincarnationManager.js',
	'./assets/js/built/player/resourceBar.js',
	'./assets/js/built/player/stageBonusManager.js',
	'./assets/js/built/player/staminaBar.js',
	'./assets/js/built/player/stats/playerStat.js',
	'./assets/js/built/progression/progressionManager.js',
	'./assets/js/built/struct/circle.js',
	'./assets/js/built/struct/color.js',
	'./assets/js/built/struct/dynamicRectangle.js',
	'./assets/js/built/struct/imageDataWrapper.js',
	'./assets/js/built/struct/queue.js',
	'./assets/js/built/struct/rectangle.js',
	'./assets/js/built/struct/triple.js',
	'./assets/js/built/struct/tripleTests.js',
	'./assets/js/built/struct/variables.js',
	'./assets/js/built/struct/vectors.js',
	'./assets/js/built/ui/aetherUI.js',
	'./assets/js/built/ui/combatUI.js',
	'./assets/js/built/ui/coreSelectButton.js',
	'./assets/js/built/ui/playerLevelBar.js',
	'./assets/js/built/ui/sideBar.js',
	'./assets/js/built/ui/uiElement.js',
	'./assets/js/built/ui/uiExtensions.js',
	'./assets/js/built/ui/uiStaticMethods.js',
	'./assets/js/built/ui/animations/slideAnimationHorizontal.js',
	'./assets/js/built/ui/uiStates/abilityUIState.js',
	'./assets/js/built/ui/uiStates/assemblersUIState.js',
	'./assets/js/built/ui/uiStates/closeButtonLinkedUIState.js',
	'./assets/js/built/ui/uiStates/coreUIState.js',
	'./assets/js/built/ui/uiStates/gameUIState.js',
	'./assets/js/built/ui/uiStates/inventoryUIState.js',
	'./assets/js/built/ui/uiStates/mainButtonsUIState.js',
	'./assets/js/built/ui/uiStates/mainDisplayUIState.js',
	'./assets/js/built/ui/uiStates/mainMenuUIState.js',
	'./assets/js/built/ui/uiStates/stageUIState.js',
	'./assets/js/built/ui/uiStates/uiState.js',
	'./assets/js/built/utilities/actions.js',
	'./assets/js/built/utilities/binaryHelper.js',
	'./assets/js/built/utilities/binaryTests.js',
	'./assets/js/built/utilities/dataStructureExtensions.js',
	'./assets/js/built/utilities/devCheats.js',
	'./assets/js/built/utilities/enum.js',
	'./assets/js/built/utilities/objectExtensions.js',
	'./assets/js/built/utilities/speedTesting.js',
	'./assets/js/built/utilities/staticUtil.js',
	'./assets/js/built/utilities/stringHelper.js',
	'./assets/textures/textureLoader.js',
	'./assets/textures/textureManifest.js',
	'./assets/textures/levels/ARMOR/monochrome-transparent_32_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_33_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_34_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_35_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_36_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_37_1.png',
	'./assets/textures/levels/ARMOR/monochrome-transparent_38_1.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_24_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_25_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_26_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_27_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_28_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_29_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_30_5.png',
	'./assets/textures/levels/BUGS/monochrome-transparent_31_5.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_32_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_33_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_34_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_35_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_36_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_37_0.png',
	'./assets/textures/levels/HELMETS/monochrome-transparent_38_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_25_6.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_26_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_27_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_27_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_28_2.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_28_3.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_29_1.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV2/monochrome-transparent_30_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_6.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_28_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_29_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_31_4.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV3/monochrome-transparent_31_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_29_9.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_2.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_30_6.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_31_0.png',
	'./assets/textures/levels/MONSTERS_ASSORTED_LV4/monochrome-transparent_31_6.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_25_2.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_25_3.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_26_2.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_26_3.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_27_2.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_27_3.png',
	'./assets/textures/levels/MONSTERS_DEMONS/monochrome-transparent_29_2.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_0.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_1.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_2.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_24_6.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_30_1.png',
	'./assets/textures/levels/MONSTERS_MAGES/monochrome-transparent_31_1.png',
	'./assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_26_6.png',
	'./assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_27_6.png',
	'./assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_27_8.png',
	'./assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_29_4.png',
	'./assets/textures/levels/MONSTERS_UNDEAD/monochrome-transparent_29_6.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_25_8.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_26_8.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_28_8.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_29_8.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_30_8.png',
	'./assets/textures/levels/MONSTERS_WILD_CREATURES/monochrome-transparent_31_8.png',
	'./assets/textures/ui/buttonSquare_grey_pressed_NoRips.png',
	'./assets/textures/ui/SideBarHideIcon.png',
	'./assets/textures/ui/SideBarShowIcon.png'
];//ASSETS End

if (isWorkerContext) {
	self.addEventListener('install', (event) => {
		console.log('[SW] Installing service worker and caching assets…');
		event.waitUntil(
			caches.open(CACHE_NAME).then(cache => {
				return cache.addAll(ASSETS);
			})
		);
		self.skipWaiting();
	});
	
	self.addEventListener('activate', (event) => {
		console.log('[SW] Activating service worker…');
		event.waitUntil(
			caches.keys().then(keys =>
				Promise.all(
					keys.map(key => {
						if (key !== CACHE_NAME) {
							console.log(`[SW] Cache version mismatch: deleting old cache "${key}"`);//TODO: make this an incomming version that's older.
							return caches.delete(key);
						}
					})
				)
			)
		);
		self.clients.claim();
	});
	
	self.addEventListener('fetch', (event) => {
		event.respondWith(
			caches.match(event.request).then(cached => {
				if (zonDebug)
					return fetch(event.request);

				if (cached)
					return cached;

				return fetch(event.request);
			})
		);
	});

	if (zonDebug) {
		console.log('[SW] Debug mode is enabled. Service worker will not use the cache.');
	}
}