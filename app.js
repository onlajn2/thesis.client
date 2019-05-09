const app = require('express')();
const tools = require("./tools.js");
const mc = require('mongodb');

//constants
const request = require('request');
const cheerio = require('cheerio');
const _ = require('underscore');

//configuration
app.set('view engine', 'pug');
app.locals.pretty = true;
app.use('/public', require('express').static(require('path').join(__dirname, 'public')));
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('body-parser').json());

var homePage = "https://mikronews.herokuapp.com/";
var serverAddress = "https://mikroserver.herokuapp.com";
//var homePage = "//localhost:3000/";
//var serverAddress = "//localhost:5000";

//configuration mongodb
var MongoClient = mc.MongoClient;
var mongoUri = "mongodb+srv://mikroreader:mojeheslo1@mikro-database-ljvf6.mongodb.net/";

var globalCats = new Array(), gCatsIds = new Array(), gJournals = new Array(), gJournalCats = new Array();
var gClient = new Array(), specId = "";

//functions
//is defined
function isDefined(value) {
    return value !== undefined && value !== null;
}
//is var string
function isString(string) {
    return typeof string === "string";
}
//journal exist
function okJournal(journalName) {
    for (let i = 0; i < gJournals.length; i++) {
        if (gJournals[i].indexOf(journalName) != -1) {
            return true;
        }
    }
    return false;
}
//get collection name from journal name
function getCollectionName(str) {
    //super-stranka.cz -> super-stranka_cz
    return str.toLocaleLowerCase().split(".").join("_");
}
//return clear articles
function prepateArts(result) {
    var output = new Array();
    var len = result.length;
    for (let i = 0; i < len; i++) {
        delete result[i].con;
        delete result[i].tag;
        delete result[i].lnk;
        output.push(result[i]);
    }
    return output;
}
//get categories
function getCategories(journalName) {
    let len = gJournalCats.length;
    let list = new Array();
    for (let i = 0; i < len; i++) {
        if (gJournalCats[i].name === journalName) {
            list = gJournalCats[i].categories;
            break;
        }
    }
    return list;
}
//count matches
function findMatches(tags, str) {
    let len = tags.length, count = 0;
    for (let i = 0; i < len; i++) {
        count += str.split(tags[i]).length - 1;
    }
    return count;
}
//find tags in articles
function findArticles(tags, articles) {
    var out = new Array();
    var tl = tags.length;
    var limit = tl / 3 + 1;

    var len = articles.length;
    for (let i = 0; i < len; i++) {
        let c = 0;
        c += findMatches(tags, articles[i].con.toLocaleLowerCase());
        c += findMatches(tags, articles[i].tit.toLocaleLowerCase());

        if (articles[i].per.indexOf("...") === -1) {
            c += findMatches(tags, articles[i].per.toLocaleLowerCase());
        }
        if (c >= limit) {
            out.push({ 'c': c, 'a': articles[i] });
        }
    }
    return out;
}


//view parameters
function viewObj(str) {
    let m = { gClient: gClient, homePage: homePage, addr: serverAddress };
    m.title = str;
    return m;
}

//database functions
function getJournals() {
    MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
        if (error) {
            console.log("getJournals: Problém s připojením k databázi.");
        } else {
            let configureDatabase = client.db("configure-database");

            //get categories
            configureDatabase.collection("categories").find({}).sort( { _id: -1 } ).toArray(function(err1, res1) {
                if (err1) {
                    console.log("getJournals : kategorie : Problém s připojením k databázi.");
                    client.close();
                } else {
                    let tempIds = new Array();
                    let tempArr = new Array();
                    let p = res1.length;
                    while (p--) {
                        if (res1[p].ur !== "nezarazene") {
                            tempIds.push("" + res1[p]._id);
                            tempArr.push({ category: { _id: res1[p]._id, cz: res1[p].cz, ur: res1[p].ur }, journals: new Array()});
                        } else {
                            specId = "" + res1[p]._id;
                        }
                    }
                    globalCats = res1.slice(0);
                    gCatsIds = tempIds.slice(0);

                    configureDatabase.collection("requests").find({}).sort( { _id: 1 } ).toArray(function(err2, res2) {
                        if (err2) {
                            console.log("getJournals : requests : Problém s připojením k databázi.");
                        } else {
                            let temp = new Array(), len = res2.length;
                            let tempJournalCats = new Array();
                            for (let i = 0; i < len; i++) {
                                temp.push(res2[i].name);
                                let cats = res2[i].categories;
                                tempJournalCats.push({ name: res2[i].name, categories: cats });
                                for (let j = 0; j < cats.length; j++) {
                                    let id = cats[j];
                                    if (id !== specId) {
                                        let index = gCatsIds.indexOf(id);
                                        if (index !== -1) {
                                            tempArr[index].journals.push({ name: res2[i].name, link: res2[i].link });
                                        }
                                    }
                                }
                            }

                            for (let i = 0; i < tempArr.length; i++) {
                                tempArr[i].journals.sort((a, b) => {
                                    return a.name.localeCompare(b.name);
                                });
                            }
                            gClient = tempArr.slice(0);
                            gJournals = temp.slice(0);
                            gJournalCats = tempJournalCats.slice(0);
                            console.log("getJournals : Data na serveru byla aktualizována.");
                        }
                        client.close();
                    });
                }
            });
        }
    });
}


//requests
//main page
app.get('/', function(req, res) {
    res.render('_index', viewObj('Hlavní stránka'));
});
//get main page articles
app.post('/get/all', function(req, res) {
    var articles = new Array(), finishes = new Array();
    var params = JSON.parse(req.body.params);
    var l = gClient.length;
    
    var end = _.after(l, function() {
        for (let i = 0; i < l; i++) {
            articles[i] = prepateArts(_.sortBy(articles[i], 'dat').reverse());
        }
        for (let k = 0; k < params.length; k++) {
            for (let j = 0; j < gClient.length; j++) {
                if (gClient[j].category.cz === params[k]) {
                    articles[j] = null;
                }
            }
        }
        
        res.send({ articles: articles, categories: gClient });
    });

    for (let j = 0; j < l; j++) {
        let list = gClient[j].journals;
        let category = gClient[j].category._id;
        let len = list.length;
        articles.push(new Array());
        finishes.push(_.after(len, function() { end(); }));
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                let journalName = list[i].name;
                let cat = getCategories(journalName).length === 1 ? "" : "" + category;
    
                MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
                    if (error) {
                        console.log("getAll: Problém s připojením k databázi.");
                    } else {
                        let articlesDatabase = client.db("articles-database");

                        articlesDatabase.collection(getCollectionName(journalName)).find({ cat: cat }).sort( { _id : -1 } ).limit(1).toArray(function(err1, res1) {
                            if(err1) {
                                console.log("getAll : Problém při získávání článků u deníku " + journalName + ".");
                            } else {
                                if (res1.length === 1) {
                                    articles[j].push(res1[0]);
                                }
                            }
                            finishes[j]();
                            client.close();
                        });
                    }
                });
            }
        } else {
            finishes[j]();
        }
    }
});

//journal
app.get('/denik/:name', function(req, res) {
    if (okJournal(req.params.name)) {
        res.render('_journal', viewObj(req.params.name));
    } else {
        res.redirect("/");
    }
});
//get journal
app.get('/get/denik/:name/:count/:lastid', function(req, res) {
    var journalName = req.params.name, lastId = req.params.lastid;
    var count = Number(req.params.count);

    //check existing name
    if (okJournal(journalName)) {
        let end = false;
        var cats = new Array(), kats = new Array();
        let id = lastId;
        if (lastId === "0") {
            id = "FFFFFFFFFFFFFFFFFFFFFFFF";
        }

        MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
            if (error) {
                console.log("getJournalArticles : Problém s připojením k databázi.");
            } else {
                let articlesDatabase = client.db("articles-database");

                articlesDatabase.collection(getCollectionName(journalName)).find({ _id: { $lt: mc.ObjectID(id) } }).sort( { _id : -1 } ).limit(count).toArray(function(err1, result) {
                    if (err1) {
                        console.log("getJournalArticles : články : Problém s připojením k databázi.");
                        res.send({ end: {}, count: {}, categories: [], articles: [] });
                        client.close();
                    } else {
                        let articles = prepateArts(result);
                        if (articles.length < count) end = true;
                        if (lastId === "0") {
                            for (let i = 0; i < gJournalCats.length; i++) {
                                if (gJournalCats[i].name === journalName) {
                                    cats = gJournalCats[i].categories;
                                    break;
                                }
                            }
                            //kats
                            let l = cats.length, gl = globalCats.length;
                            for (let i = 0; i < l; i++) {
                                let tid = cats[i];
                                for (let j = 0; j < gl; j++) {
                                    if (tid === "" + globalCats[j]._id) {
                                        kats.push(globalCats[j].cz);
                                        break;
                                    }
                                }
                            }
                            articlesDatabase.collection(getCollectionName(journalName)).countDocuments({}, function(err2, res2) {
                                if(err2) {
                                    console.log("getJournalArticles : počet článků : Problém s připojením k databázi.");
                                    res.send({ end: {}, count: {}, categories: [], kategorie: [], articles: [] });
                                } else {
                                    res.send({ end: end, count: res2, categories: cats, kategorie: kats, articles: articles });
                                }
                                client.close();
                            });
                        } else {
                            res.send({ end: end, count: 0, categories: cats, kategorie: kats, articles: articles });
                            client.close();
                        }
                    }
                });
            }
        });
    } else {
        res.send({ end: {}, count: {}, categories: [], kategorie: [], articles: [] });
    }
});

//category
app.get('/kategorie/:name', function(req, res) {
    let name = req.params.name;
    let ok = false;
    let len = globalCats.length;
    for (let i = 0; i < len; i++) {
        if (name !== "nezarazene" && globalCats[i].ur === name) {
            ok = true;
            break;
        }
    }
    if (ok) {
        res.render('_category', viewObj(name));
    } else {
        res.redirect("/");
    }
});
//get category
app.post('/get/kategorie', function(req, res) {
    var b = JSON.parse(req.body.params);
    if (isDefined(b.category) && isDefined(b.count) && isDefined(b.ids)) {
        var category = b.category; //ur
        var count = parseInt(b.count);
        var lastIds = b.ids; //date (find older articles)
        let ok = false;

        for (let i = 0; i < globalCats.length; i++) {
            if (globalCats[i].ur === category) {
                category = "" + globalCats[i]._id;
                ok = true;
                break;
            }
        }
        if (!ok) {
            res.send({ lastIds: "", articles: [] });
            return;
        }

        var journalNames = new Array();
        var jLen = gJournalCats.length;
        for (let i = 0; i < jLen; i++) {
            if (gJournalCats[i].categories.indexOf(category) !== -1) {
                journalNames.push({ name: gJournalCats[i].name, cats: gJournalCats[i].categories });
            }
        }
        
        var l = journalNames.length;
        var articles = new Array();

        var finished = _.after(l, function() {
            arts = _.sortBy([].concat(...articles), 'dat').reverse().slice(0, count);
            var len = arts.length;
            if (len > 0) {
                lastIds = arts[len - 1].dat;
            }
            res.send({ lastIds: lastIds, articles: arts });
        });
        
        for (let i = 0; i < l; i++) {
            let journalName = journalNames[i].name;
            let cat = journalNames[i].cats.length === 1 ? "" : category;
            
            if (lastIds.length === 0) {
                lastIds = new Date();
                lastIds.setDate(lastIds.getDate() + 1);
            } else {
                lastIds = new Date(lastIds);
            }

            MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
                if (error) {
                    console.log("getCategoryArticles : Problém s připojením k databázi.");
                } else {
                    let articlesDatabase = client.db("articles-database");

                    articlesDatabase.collection(getCollectionName(journalName)).find({ dat: { $lt: lastIds }, cat: cat }).sort( { _id : -1 } ).toArray(function(err1, res1) {   
                        if (err1) {
                            console.log("getCategoryArticles : Problémpři získávání článků deníku " + journalName + ".");
                            articles.push(new Array());
                        } else {
                            articles.push(prepateArts(res1));
                        }
                        finished();
                        client.close();
                    });
                }
            });
        }
    } else {
        res.send({ lastIds: "", articles: [] });
    }
});

//article
app.get('/clanek/:journal/:id/:title', function(req, res) {
    if (okJournal(req.params.journal)) {
        res.render('_article', viewObj(decodeURIComponent(req.params.title)));
    } else {
        res.redirect("/");
    }
});
//get article
app.get('/get/clanek/:journal/:id', function(req, res) {
    var journalName = req.params.journal, id = req.params.id;
    if (okJournal(journalName)) {
        MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
            if (error) {
                console.log("getArticle : Problém s připojením k databázi.");
            } else {
                let articlesDatabase = client.db("articles-database");
                
                articlesDatabase.collection(getCollectionName(journalName)).findOne({ _id: mc.ObjectID(id) }, function(err1, res1) {
                    if (err1) {
                        console.log("getArticle : Problém se získáním článku z databáze.");
                        res.send({});
                    } else {
                        delete res1._id;
                        delete res1.jrn;
                        delete res1.tag;
                        res.send(res1);
                    }
                    client.close();
                });
            }
        });
    } else {
        res.send({});
    }
});
//get similar articles
app.get('/get/podobne/:journal/:id', function(req, res) {
    var journalName = req.params.journal, id = req.params.id;

    if (okJournal(journalName)) {
        MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
            if (error) {
                console.log("getSimilarArticles : Problém s připojením k databázi.");
            } else {
                let articlesDatabase = client.db("articles-database");
                
                articlesDatabase.collection(getCollectionName(journalName)).findOne({ _id: mc.ObjectID(id) }, function(err1, res1) {
                    if (err1) {
                        console.log("getSimilarArticles : Problém se získáním článku.");
                        res.send([]);
                        client.close();
                    } else {
                        var articles = new Array();
                        var tags = res1.tag, category = res1.cat;
                        if (category.length === 0) {
                            category = getCategories(journalName)[0];
                        }
                        
                        var journalNames = new Array();
                        let len = gJournalCats.length;
                        for (let i = 0; i < len; i++) {
                            if (gJournalCats[i].categories.indexOf(category) !== -1) {
                                journalNames.push({ name: gJournalCats[i].name, cats: gJournalCats[i].categories });
                            }
                        }
                
                        len = journalNames.length;
                        var finished = _.after(len, function() {
                            client.close();
                            articles = _.sortBy(findArticles(tags, [].concat(...articles)), 'c').reverse().slice(0, 6);
                            for (let i = 0; i < articles.length; i++) {
                                articles[i] = articles[i].a;
                                delete articles[i].con;
                                delete articles[i].tag;
                                delete articles[i].dat;
                                delete articles[i].per;
                                delete articles[i].cat;
                                delete articles[i].rdt;
                            }
                            res.send(articles);
                        });
                
                        //now find similar
                        for (let i = 0; i < len; i++) {
                            let jrnName = journalNames[i].name;
                            let cat = journalNames[i].cats.length === 1 ? "" : category;
                
                            articlesDatabase.collection(getCollectionName(jrnName)).find({ cat: cat }).toArray(function(err2, res2) {   
                                if (err2) {
                                    console.log("getSimilarArticles : Problém se získáním článku z deníku " + jrnName + ".");
                                    articles.push(new Array());
                                } else {
                                    articles.push(res2);
                                }
                                finished();
                            });
                        }
                    }
                });
            }
        });
    } else {
        res.send([]);
    }
});

//search
app.get('/hledat/:term', function(req, res) {
    res.render('_search', viewObj("Vyhledávání"));
});
//get search articles
app.post('/get/hledat', function(req, res) {
    if (isDefined(req.body.term) && isDefined(req.body.count)) {
        var term = req.body.term, count = req.body.count;
        term = term.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' ').trim().split(" ");
        var tags = new Array();
        for (let i = 0; i < term.length; i++) {
            if (term[i].length > 2) {
                tags.push(term[i]);
            }
        }
        
        if (tags.length > 0) {
            var articles = new Array();

            let len = gJournals.length;
            var finished = _.after(len, function() {
                articles = _.sortBy(findArticles(tags, [].concat(...articles)), 'c').reverse().slice(0, count);
                for (let i = 0; i < articles.length; i++) {
                    articles[i] = articles[i].a;
                }
                res.send({ terms: tags, arts: prepateArts(articles) });
            });

            for (let i = 0; i < len; i++) {
                let journalName = gJournals[i];

                MongoClient.connect(mongoUri, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 }, function(error, client) {
                    if (error) {
                        console.log("search : Problém s připojením k databázi.");
                    } else {
                        let articlesDatabase = client.db("articles-database");

                        articlesDatabase.collection(getCollectionName(journalName)).find({}).toArray(function(err1, res1) {   
                            if (err1) {
                                console.log("search : Problém se získáním článků z deníku " + journalName + ".");
                                articles.push(new Array());
                            } else {
                                articles.push(res1);
                            }
                            finished();
                        });
                    }
                });
            }
        } else {
            res.send({ terms: [], arts: []});
        }
    } else {
        res.send({ terms: [], arts: []});
    }
});

//add
app.get('/pridat', function(req, res) {
    res.render('_add', viewObj("Přidat vlastní deník"));
});
//get html
app.post('/get/html', function(req, res) {
    if (isDefined(req.body.link) && isDefined(req.body.coding)) {
        var address = req.body.link, coding = req.body.coding;

        var loopCount = 0;
        (function loop() {
            request({ url: address, forever: true, encoding: null, gzip: true }, function (error, response, body) {
                //check failure
                if (!isDefined(body)) {
                    loopCount++;
                    if (loopCount < 8) {
                        loop();
                    } else {
                        res.send("");
                    }
                } else {
                    loopCount = 0;   
                    var html = require('iconv-lite').decode(body, coding);
    
                    if (isString(html)) {
                        var $ = cheerio.load(html);
                        $("head").first().html("");
                        $("script").remove();
                        $("noscript").remove();
                        res.send({ html: require('pretty')("<html>\n" + $("html").first().html()) + "\n</html>" });
                    } else {
                        res.send("");
                    }
                }
            });
        })();
    } else {
        res.send("");
    }
});
//get auto sample
app.post('/get/sample/auto', function(req, res) {
    if (isDefined(req.body.link) && isDefined(req.body.coding)) {
        tools.getAutoArticles(res, req.body.link, req.body.coding, 1);
    } else {
        res.send({ article: {}, count: 0 });
    }
});
//get manual sample
app.post('/get/sample/manual', function(req, res) {
    if (isDefined(req.body.params)) {
        tools.getManualArticles(res, JSON.parse(req.body.params), 1);
    } else {
        res.send({ article: {}, count: 0 });
    }
});


//own
app.get('/vlastni/:par/:name', function(req, res) {
    var par = req.params.par;
    if (par === "a" || par === "m") {
        res.render('_own', viewObj("Vlastní | " + req.params.name));
    } else {
        res.redirect("/");
    }
});
//get own articles
app.post('/get/own', function(req, res) {
    if (isDefined(req.body.params)) {
        var params = JSON.parse(req.body.params);
        if (params.method === "a") {
            tools.getAutoArticles(res, params.attr.url, params.attr.cod, 0);
        } else if (params.method === "m") {
            tools.getManualArticles(res, params.attr, 0);
        } else {
            res.send({ articles: [] });
        }
    } else {
        res.send({ articles: [] });
    }
});


//bad urls
app.get('/*', function(req, res) {
    res.redirect("/");
});
//from server -> update journals
app.get('/server/update', function(req, res) {
    getJournals();
    res.send({});
});


//start functions
getJournals();

//run server
app.listen(process.env.PORT || 3000, function() {
    console.log("Server je spuštěný...");
});
