export default class JournalConverter {
    static async createOrUpdateJournalFromData(scene, categories, nearby, folderId) {
        let journal = JournalConverter._createOrGetJournalByDscrybId(scene.id, scene.title.rendered, folderId, "scene_id");
        ////console.log(journal);

        journal.flags.core["sheetClass"] = "strapi-adventure-sync.Hackventure";

        journal.name = JournalConverter._toTitleCase(title);
        journal.content = scene.content.rendered;
        //journal.folder = folderId;

        return journal;
    }

    static _toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    static _cleanHtml(text) {
        if (text.includes("<") && text.includes(">")) return this._decodeHtml(text);
        return text;
    }

    static _decodeHtml(html) {
        let div = document.createElement("div");
        div.innerHTML = html;
        return div.innerText;
    }

    static _getDaysBetween(d1, d2) {
        var diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    }

    static async createOrGetFolder(folderName, parent = null) {
        let folder = game.folders
            .filter(x => x.type == "JournalEntry")
            .find(x => x.name == folderName);

        if (folder == undefined) {
            folder = await Folder.create({name: folderName, type: "JournalEntry", parent: parent});
        }
        return folder;
    }

    static async createOrGetSceneFolder(folderName, parent = null) {
        let folder = game.folders
            .filter(x => x.type == "Scene")
            .find(x => x.name == folderName);

        if (folder == undefined) {
            folder = await Folder.create({name: folderName, type: "Scene", parent: parent});
        }
        return folder;
    }

    static _createOrGetJournalByStrapiId(id, name, folderId) {
        let journal = game.journal.find(x => x.data.flags["strapi-adventure-sync"]["id"] == id);

        if (journal == undefined) {
            journal = {
                name: JournalConverter._toTitleCase(name),
                folder: folderId,
                flags: {
                    "strapi-adventure-sync": {},
                    core: {}
                }
            };

            journal.flags["strapi-adventure-sync"].id = id;
            return journal;
        }
        return journal.data;
    }
}
