import StrapiSyncer from "./Strapi/StrapiSyncer.mjs";
import {MODULE_ID} from "./CONST.mjs";


Hooks.once('init', async function() {
    console.log('Initializing Strapi Adventure Sync');

    game.settings.register(MODULE_ID, 'adventureId', {
        name: 'Adventure ID',
        hint: 'The Strapi adventure ID to sync',
        scope: 'world',
        config: true,
        type: Number,
        default: 1
    });

    game.settings.register(MODULE_ID, 'bearer', {
        name: 'API Token',
        hint: 'The API bearer token to use for authentication',
        scope: 'world',
        config: true,
        type: String,
        default: ''
    });

    game.settings.register(MODULE_ID, 'baseUrl', {
        name: 'Base URL',
        hint: 'The base URL of the Strapi instance',
        scope: 'world',
        config: true,
        type: String,
        default: 'http://localhost:1337'
    });
});

Hooks.once('ready', async function() {
    new StrapiSyncer();
});
