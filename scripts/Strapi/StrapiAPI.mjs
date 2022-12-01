import {MODULE_ID} from "../CONST.mjs";

export default class StrapiAPI {
    async getAdventure(id) {
        let baseUrl = game.settings.get(MODULE_ID, 'baseUrl');
        let bearer = game.settings.get(MODULE_ID, 'bearer');
        const response = await fetch(`${baseUrl}/api/adventures/${id}?populate=%2A`, {
            headers: {
                Authorization: `Bearer ${bearer}`
            }
        });
        const adventure = await response.json();
        return adventure.data;
    }

    async getBattle(id) {
        let baseUrl = game.settings.get(MODULE_ID, 'baseUrl');
        let bearer = game.settings.get(MODULE_ID, 'bearer');
        const response = await fetch(`${baseUrl}/api/battles/${id}?populate=%2A`, {
            headers: {
                Authorization: `Bearer ${bearer}`
            }
        });
        const battle = await response.json();
        return battle;
    }

    async getJournal(id) {
        let baseUrl = game.settings.get(MODULE_ID, 'baseUrl');
        let bearer = game.settings.get(MODULE_ID, 'bearer');
        const response = await fetch(`${baseUrl}/api/journals/${id}?populate=%2A`, {
            headers: {
                Authorization: `Bearer ${bearer}`
            }
        });
        const journal = await response.json();
        return journal.data;
    }
}
