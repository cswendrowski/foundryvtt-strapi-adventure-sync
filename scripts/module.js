const MODULE_ID = "strapi-adventure-sync";

Hooks.once('init', async function() {
    console.log('Initializing Strapi Adventure Sync');
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

    let adventure = await getAdventure(1);
    console.dir(adventure);
    let journals = [];
    for (let j of adventure.attributes.journals.data) {
        let journal = await getJournal(j.id);
        journals.push(journal);
    }
    console.dir(journals);

    // Create Journals if they do not already exist
    for (let j of journals) {
        let journal = game.journal.find(journal => journal.flags[MODULE_ID].id === j.id);
        if (!journal) {
            await JournalEntry.create({
                name: j.attributes.Name,
                pages: j.attributes.text_pages.data.map(p => { return { "name": p.attributes.Name, "type": "text", "text": {"content": p.attributes.Content }, "flags": {
                    MODULE_ID: {
                        "id": p.id
                    }
                }}}),
                flags: {
                    MODULE_ID: {
                        "id": j.id
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
                        "text.content": p.attributes.Content,
                        sort: index
                    });
                }
                else {
                    newPages.push({
                        "name": p.attributes.Name,
                        "type": "text",
                        "text": {"content": p.attributes.Content },
                        sort: index,
                        "flags": {
                            MODULE_ID: {
                                "id": p.id
                            }
                        }
                    });
                }
            }
            await journal.updateEmbeddedDocuments("JournalEntryPage", updatedPages, {});
            await journal.createEmbeddedDocuments("JournalEntryPage", newPages, {});
        }
    }
});

async function getAdventure(id) {
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

async function getBattle(id) {
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

async function getJournal(id) {
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
