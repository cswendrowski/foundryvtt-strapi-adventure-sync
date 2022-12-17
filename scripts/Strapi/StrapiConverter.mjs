import {MODULE_ID} from "../CONST.mjs";
import StrapiAPI from "./StrapiAPI.mjs";

export default class StrapiConverter {

    constructor(adventure) {
        this.sd = new showdown.Converter({
            noHeaderId: true,
            simplifiedAutoLink: true,
            openLinksInNewWindow: true,
            tables: true
        });
        this.adventure = adventure;
    }

    /* -------------------------------------------- */

    _findByStrapiId(collection, id) {
        return collection.find(c => {
            if ( c.flags === undefined || c.flags[MODULE_ID] === undefined ) return false;
            return c.flags[MODULE_ID].id == id;
        });
    }

    /* -------------------------------------------- */

    async _createFileFolderIfMissing(folderPath) {
        let source = "data";
        if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
            source = "forgevtt";
        }
        try
        {
            await FilePicker.browse(source, folderPath);
        }
        catch (error)
        {
            await FilePicker.createDirectory(source, folderPath);
        }
    }

    /* -------------------------------------------- */

    async createOrGetFolder(folderName, type, parent = null) {
        let folder = game.folders
            .filter(x => x.type == type)
            .find(x => x.name == folderName);

        if (folder == undefined) {
            folder = await Folder.create({name: folderName, type: type, parent: parent});
        }
        return folder;
    }

    /* -------------------------------------------- */

    async createOrGetImage(fileName, url) {
        await this._createFileFolderIfMissing(MODULE_ID);
        let source = "data";
        if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
            source = "forgevtt";
        }

        let fileFolder = await FilePicker.browse(source, MODULE_ID);
        let matchingFile = fileFolder.files.find(x => x.endsWith(fileName));
        if (matchingFile) {
            return matchingFile;
        } else {
            let file = await new StrapiAPI().getImage(fileName, url);
            let fileResponse = await FilePicker.upload(source, MODULE_ID, file, {});
            return fileResponse.path;
        }
    }

    /* -------------------------------------------- */

    async createOrUpdateJournal(j) {
        let folder = await this.createOrGetFolder(this.adventure.attributes.Name, "JournalEntry");
        let journal = this._findByStrapiId(game.journal, j.id);
        if (!journal) {
            await JournalEntry.create({
                name: j.attributes.Name,
                folder: folder._id,
                pages: j.attributes.text_pages.data.map(p => {
                    return {
                        "name": p.attributes.Name,
                        "type": "text",
                        "text": {"content": this.sd.makeHtml(p.attributes.Content) },
                        "folder": folder.id,
                        "flags": {
                            "strapi-adventure-sync": {
                                "id": p.id,
                                "updated_at": j.attributes.updatedAt
                            }
                        }}}),
                flags: {
                    "strapi-adventure-sync": {
                        "id": j.id,
                        "updated_at": j.attributes.updatedAt
                    }
                }
            });
        }
        else {
            // Update only if the journal has been updated
            if (journal.flags[MODULE_ID].updated_at == j.attributes.updatedAt) return;
            await journal.update({
                name: j.attributes.name,
                folder: folder._id,
            });
            let updatedPages = [];
            let newPages = [];
            let index = 0;
            for (let p of j.attributes.text_pages.data) {
                index++;
                let page = journal.pages.find(jp => jp.flags[MODULE_ID].id == p.id);
                if (page) {
                    updatedPages.push({
                        "_id": page._id,
                        name: p.attributes.Name,
                        "text.content": this.sd.makeHtml(p.attributes.Content),
                        sort: index,
                        "flags": {
                            "strapi-adventure-sync": {
                                "updated_at": j.attributes.updatedAt
                            }
                        }
                    });
                }
                else {
                    newPages.push({
                        "name": p.attributes.Name,
                        "type": "text",
                        "text": {"content": this.sd.makeHtml(p.attributes.Content) },
                        sort: index,
                        "flags": {
                            "strapi-adventure-sync": {
                                "id": p.id,
                                "updated_at": j.attributes.updatedAt
                            }
                        }
                    });
                }
            }
            await journal.updateEmbeddedDocuments("JournalEntryPage", updatedPages, {});
            await journal.createEmbeddedDocuments("JournalEntryPage", newPages, {});
        }
    }

    /* -------------------------------------------- */

    async createOrUpdateScene(scene) {
        const map = scene.attributes.Map.data;
        if ( !map ) return;

        let folder = await this.createOrGetFolder(this.adventure.attributes.Name, "Scene");
        console.log(folder);
        let fvttScene = this._findByStrapiId(game.scenes, scene.id);
        const image = await this.createOrGetImage(map.attributes.name, map.attributes.url);
        if ( !fvttScene ) {
            const created = await Scene.create({
                name: scene.attributes.Name,
                folder: folder._id,
                background: {
                  "src": image
                },
                width: map.attributes.width,
                height: map.attributes.height,
                padding: 0,
                grid: {
                    size: scene.attributes.GridSize,
                },
                flags: {
                    "strapi-adventure-sync": {
                        "id": scene.id,
                        "updated_at": scene.attributes.updatedAt
                    }
                }
            });
            created.createThumbnail().then(data => {
                created.update({thumb: data.thumb}, {diff: false});
            });
        }
        else {
            // Update
            if (fvttScene.flags[MODULE_ID].updated_at == scene.attributes.updatedAt) return;
            await fvttScene.update({
                name: scene.attributes.Name,
                background: {
                    "src": image
                },
                folder: folder,
                width: map.attributes.width,
                height: map.attributes.height,
                padding: 0,
                grid: {
                    size: scene.attributes.GridSize,
                },
                flags: {
                    "strapi-adventure-sync": {
                        "updated_at": scene.attributes.updatedAt
                    }
                }
            });
        }
    }
}
