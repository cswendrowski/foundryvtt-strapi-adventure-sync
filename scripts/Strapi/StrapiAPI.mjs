import {MODULE_ID} from "../CONST.mjs";

export default class StrapiAPI {

    async _getData(path, id) {
        let baseUrl = game.settings.get(MODULE_ID, 'baseUrl');
        let bearer = game.settings.get(MODULE_ID, 'bearer');
        const response = await fetch(`${baseUrl}/api/${path}/${id}?populate=%2A`, {
            headers: {
                Authorization: `Bearer ${bearer}`
            }
        });
        const data = await response.json();
        return data.data;
    }

    async getImage(fileName, url) {
        console.log("Downloading " + fileName);
        let baseUrl = game.settings.get(MODULE_ID, 'baseUrl');
        let bearer = game.settings.get(MODULE_ID, 'bearer');
        let response = await fetch(baseUrl + url, {
            headers: {
                Authorization: `Bearer ${bearer}`
            }
        });
        let blob = await response.blob();
        let file = new File([blob], fileName);
        return file;
    }

    async getAdventure(id) {
        return await this._getData('adventures', id);
    }

    async getBattle(id) {
        return await this._getData('battles', id);
    }

    async getJournal(id) {
        return await this._getData('journals', id);
    }

    async getScene(id) {
        return await this._getData('scenes', id);
    }
}
