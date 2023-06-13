const express = require(`express`);
const path = require(`path`);
const logger = require(`morgan`);
const wrap = require(`express-async-wrap`);
const _ = require(`lodash`);
const uuid = require(`uuid-by-string`);
const spacetime = require(`spacetime`);
const {DateTime,Interval} = require("luxon");
const ISO6391 = require('iso-639-1');

const app = express();
app.use(logger(`dev`));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.get(`/logo`, (req, res) => res.sendFile(path.resolve(__dirname, `logo.svg`)));

const appConfig = require(`./config.app.json`);
app.get(`/`, (req, res) => res.json(appConfig));

app.post(`/validate`, (req, res) => res.json({
    name: `Public`
}));

const syncConfig = require(`./config.sync.json`);
app.post(`/api/v1/synchronizer/config`, (req, res) => res.json(syncConfig));

const schema = require(`./schema.json`);
app.post(`/api/v1/synchronizer/schema`, (req, res) => res.json(schema));

app.post(`/api/v1/synchronizer/data`, wrap(async (req, res) => {
    const {
        requestedType,
        filter
    } = req.body;
    if (requestedType !== `ext`) {
        throw new Error(`Only this database can be synchronized`);
    }
    
    if (requestedType == `ext`) {
        
        let items = [];
        let item = {};
        item.name = "Single";
        item.id = uuid(JSON.stringify(item.name));
        items.push(item);

        return res.json({
            items
        });
    }
}));

app.post(`/api/v1/automations/action/execute`, wrap(async (req, res) => {

    let {action, account} = req.body;
    /*
    let req_opts = {headers: {
        "Zotero-API-Key" : account.token
     }
    };

    let prefix = "users";
    if (account.librarytype) {
        prefix = "groups";
    }
    */
    
    if (action.action == "add-new-note") {

        /*
        const url = "https://api.zotero.org/items/new?itemType=note";        
        const response = await (got(url, req_opts));
        
        if (await handleBackoff(response.headers) > 0) {
            return res.json({message: "Rate limits exceeded", tryLater:true});
        }
        const json_obj = JSON.parse(response.body);
        
        json_obj.note = action.args.note;
        json_obj.parentItem = action.args.parent;
        */
        
        console.log(action);
        console.log(account);
        /*
        const new_url = `https://api.zotero.org/${prefix}/${account.libraryid}/items/`;
        const result = await got(new_url, {
            method: "POST",
            headers: {
                'Zotero-API-Key': account.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([json_obj])
        });
        const result_json =  JSON.parse(result.body);
        */
        return res.json({"message":"done"});;  
        
    }
    return res.json({"message":"invalid action"});

}));

app.use(function(req, res, next) {
    const error = new Error(`Not found`);
    error.status = 404;
    next(error);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
    res.json({
        message: err.message,
        code: err.status || 500
    });
});

module.exports = app;
