import {MODULE_ID} from "../CONST.mjs";

export default class StrapiConverter {

    constructor() {
        this.sd = new showdown.Converter({
            noHeaderId: true,
            simplifiedAutoLink: true,
            openLinksInNewWindow: true,
            tables: true
        });
    }

    async createOrUpdateJournal(j) {
        let journal = game.journal.find(journal => journal.flags[MODULE_ID].id === j.id);
        if (!journal) {
            await JournalEntry.create({
                name: j.attributes.Name,
                pages: j.attributes.text_pages.data.map(p => { return { "name": p.attributes.Name, "type": "text", "text": {"content": p.attributes.Content }, "flags": {
                        MODULE_ID: {
                            "id": p.id,
                            "updated_at": j.attributes.updatedAt
                        }
                    }}}),
                flags: {
                    MODULE_ID: {
                        "id": j.id,
                        "updated_at": j.attributes.updatedAt
                    }
                }
            });
        }
        else {
            // Update
            await journal.update({
                name: j.attributes.name
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
                            MODULE_ID: {
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
                            MODULE_ID: {
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
}
