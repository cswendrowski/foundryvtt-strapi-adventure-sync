import StrapiAPI from "./StrapiAPI.mjs";
import StrapiConverter from "./StrapiConverter.mjs";
import {MODULE_ID} from "../CONST.mjs";

export default class StrapiSyncer {

    constructor() {
        this.api = new StrapiAPI();

        this.syncAdventure(game.settings.get(MODULE_ID, "adventureId"));

        window.setInterval(() => {
            this.syncAdventure(game.settings.get(MODULE_ID, "adventureId"));
        }, 1 * 60 * 1000);
    }

    async syncAdventure(id) {
        console.log(`Syncing adventure ${id}`);
        let adventure = await this.api.getAdventure(id);
        console.dir(adventure);

        const converter = new StrapiConverter(adventure);

        // Journals
        let journals = [];
        for (let j of adventure.attributes.journals.data) {
            let journal = await this.api.getJournal(j.id);
            journals.push(journal);
        }
        console.dir(journals);

        for ( let j of journals ) {
            await converter.createOrUpdateJournal(j);
        }

        // Scenes
        let scenes = [];
        for (let s of adventure.attributes.scenes.data) {
            let scene = await this.api.getScene(s.id);
            scenes.push(scene);
        }
        console.dir(scenes);

        for ( let s of scenes ) {
            await converter.createOrUpdateScene(s);
        }
    }
}
