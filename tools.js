//is defined
function isDefined(value) {
    return value !== undefined && value !== null;
}
//is var string
function isString(string) {
    return typeof string === "string";
}
//get name of page by url
function getJournalName(string) {
    var out = "";
    if (typeof string === "string") {
        out = string.substring(string.indexOf("//") + 2);
        if (out.indexOf("/") != -1) {
            out = out.substring(0, out.indexOf("/"));
        }
        if (out.indexOf("www.") != -1) {
            out = out.substring(out.indexOf("www.") + 4);
        }
    } else {
        out = string;
    }
    return out;
}
//fix link
function fixLink(link, originAddress) {
    var outLink = "";
    if (isString(link) && isString(originAddress)) {
        link = link.trim();
        if (link.length > 0) {
            if (link.substring(0, 2) != "//" && link.substring(0, 4) != "http" && link.substring(0, 4) != "www.") {
                if (link[0] == "/") {
                    outLink = originAddress + link;
                } else if (link.substring(0, 2) == "./") {
                    outLink = originAddress + link.substring(1);
                } else if (link.substring(0, 3) == "../") {
                    outLink = originAddress + link.substring(2);
                } else {
                    outLink = originAddress + '/' + link;
                }
            } else {
                outLink = link;
            }
        } 
    }
    return outLink;
}
//get name of page
function getMainPage(link) {
    var count = 0;
    for (let i = 0; i < link.length; i++) {
        if (link[i] == "/") {
            count++;
            if (count == 3) {
                link = link.substring(0, i);
                break;
            }
        }
    }
    return link;
}
//cut with typeof check
function userCut(string) {
    var limit = 125;
    if (isString(string)) {
        string = string.trim();
        var length = string.length;
        if (length > limit) {
            var index = length - 1;
            for (let i = limit - 1; i < string.length; i++) {
                if (string[i] == " ") {
                    index = i;
                    break;
                }
            }
            string = string.substring(0, index).trim() + "...";
        }
    } else {
        string = "";
    }
    return string;
}
//trim with typeof check
function userTrim(string) {
    let str = "";
    if (typeof string === "string") {
        str = string.trim();
    }
    return str;
}


//auto parse
function autoParse(html, url) {
    const cheerio = require('cheerio');
    var $ = cheerio.load(html);

    var originAddress = getMainPage(url);
    var journalName = getJournalName(url), journalLink = originAddress;
    var articles = new Array();
    
    //get tagName
    var tagName = '', max = 0;
    for (let i = 1; i < 7; i++) {
        let ttt = $('h' + i);
        if (isDefined(ttt)) {
            var count = ttt.length;
            if (count > max) {
                max = count;
                tagName = 'h' + i;
            }
        }
    }

    if (tagName.length > 0) {
        $(tagName).each(function(i, element) {
            var article = {};
            article.tag = tagName;
            //articleTitle
            article.tit = $(this).text().trim();

            //find outer tag
            var selector = '';
            $(this).parentsUntil('body').each(function(i, element) {
                if ($(this).find(tagName).length > 1) {
                    return false;
                }
                var outId = $(this).attr('id');
                var outClass = $(this).attr('class');
                selector = $(this).prop('tagName').toLowerCase();
                if (isDefined(outId)) {
                    selector += '#' + outId;
                }
                if (isDefined(outClass)) {
                    let tmp = outClass.trim().split(" ");
                    for (let k = 0; k < tmp.length; k++) {
                        if (tmp[k].length > 0) {
                            selector += '.' + tmp[k];
                        }
                    }
                }
            });
            article.sel = selector;
            
            if (article.sel.length > 0) {

                //articleImage
                article.sim = "";
                if (isDefined($(this).parents(article.sel).find('img'))) {
                    if ($(this).parents(selector).find('img').length > 0) {
                        article.sim = fixLink($(this).parents(article.sel).find('img').first().attr('src'), originAddress);
                    }
                }

                //trueLink
                article.lnk = "";
                article.int = false;
                if ($(this).find('a').length > 0) {
                    article.lnk = fixLink($(this).find('a').first().attr('href'), originAddress);
                    article.int = true;
                } else if ($(this).parents(article.sel).find('a').length > 0) {
                    article.lnk = fixLink($(this).parents(article.sel).find('a').first().attr('href'), originAddress);
                }

                //articleText
                article.per = "";
                $(this).parents(article.sel).find('p').each(function(i, element) {
                    var text = userCut($(this).text());
                    if (text.length > 30) {
                        article.per = text;
                        return false;
                    }
                });

                //push
                if (article.tit.length > 0) {
                    article.jrn = journalName;
                    article.jln = journalLink;
                    articles.push(article);
                }
            }
        });
    }
    return articles;
}
//manual parse
function manualParse(html, params) {
    const cheerio = require('cheerio');
    const _ = require('underscore');
    var $ = cheerio.load(html);
    var articles = new Array();

    if (isString(params.url) && isDefined(params.sel) && isDefined(params.tit) && isDefined(params.per)
        && isDefined(params.dat) && isDefined(params.sim) && isDefined(params.lnk)) {
        var url = params.url;
        var originAddress = getMainPage(url);
        var journalName = getJournalName(url), journalLink = originAddress;
    
        var parentSelector = params.sel;
        var titleSelector = params.tit[0];

        $(titleSelector).each(function(i, element) {
            //outerTag
            var parent = $(this).closest(parentSelector);
            var article = {};

            //articleTitle
            article.tit = "";
            if (params.tit[1].toLowerCase().trim() === "text" || params.tit[1].length === 0) {
                article.tit = userTrim($(this).text());
            } else {
                article.tit = userTrim($(this).attr(params.tit[1].toLowerCase().trim()));
            }
            if (article.tit === null || article.tit === undefined || article.tit === "") {
                article.tit = userTrim($(this).text());
            }

            //articleText
            article.per = "";
            if (params.per[0].length > 0) {
                let tag = params.per[0];
                if (params.per[1].toLowerCase().trim() === "text" || params.per[1].length === 0) {
                    article.per = userCut(parent.find(tag).first().text());
                } else {
                    article.per = userCut(parent.find(tag).first().attr(params.per[1].toLowerCase().trim()));
                }
            }

            //articleDate
            article.dat = "";
            if (params.dat[0].length > 0) {
                let tag = params.dat[0];
                if (params.dat[1].toLowerCase().trim() === "text" || params.dat[1].length === 0) {
                    article.dat = userTrim(parent.find(tag).first().text());
                } else {
                    article.dat = userTrim(parent.find(tag).first().attr(params.dat[1].toLowerCase().trim()));
                }
            }

            //articleImg
            article.sim = "";
            if (params.sim[0].length > 0) {
                let tag = params.sim[0];
                if (params.sim[1].toLowerCase().trim() === "text") {
                    article.sim = fixLink(parent.find(tag).first().text(), originAddress);
                } else if (params.sim[1].length === 0) {
                    article.sim = fixLink(parent.find(tag).first().attr("src"), originAddress);
                } else {
                    article.sim = fixLink(parent.find(tag).first().attr(params.sim[1].toLowerCase().trim()), originAddress);
                }
            }

            //trueLink
            article.lnk = "";
            if (params.lnk[0].length > 0) {
                let tag = params.lnk[0];
                if (params.lnk[1].toLowerCase().trim() === "text") {
                    article.lnk = fixLink(parent.find(tag).first().text(), originAddress);
                } else if (params.lnk[1].length === 0) {
                    article.lnk = fixLink(parent.find(tag).first().attr("href"), originAddress);
                } else {
                    article.lnk = fixLink(parent.find(tag).first().attr(params.lnk[1].toLowerCase().trim()), originAddress);
                }
            }

            //push
            if (article.tit.length > 0) {
                article.jrn = journalName;
                article.jln = journalLink;
                articles.push(article);
            }
        });
    } else {
        console.log("Manuální parsování : špatně zadané parametry.");
    }
    return articles;
}


module.exports = {
    getAutoArticles: function(res, url, coding, limit) {
        const request = require('request');

        var loopCount = 0;
        (function loop() {
            request({ url: url, forever: true, encoding: null, gzip: true }, function (error, response, body) {
                //check failure
                if (!isDefined(body)) {
                    loopCount++;
                    if (loopCount < 8) {
                        loop();
                    } else {
                        res.send({ articles: null });
                    }
                } else {
                    loopCount = 0;
                
                    var html = require('iconv-lite').decode(body, coding);
                    //add check inputs
                    var articles = autoParse(html, url);
                    if (articles.length > 0) {
                        if (limit == 0) {
                            res.send({ articles: articles });
                        } else {
                            res.send({ article: articles[0], count: articles.length });
                        }
                    } else {
                        res.send({ articles: [] });
                    }
                }
            });
        })();
    },

    getManualArticles: function(res, params, limit) {
        const request = require('request');
        
        if (isDefined(params.url) && isDefined(params.cod)) {
            var loopCount = 0;
            (function loop() {
                request({ url: params.url, forever: true, encoding: null, gzip: true }, function (error, response, body) {
                    //check failure
                    if (!isDefined(body)) {
                        loopCount++;
                        if (loopCount < 8) {
                            loop();
                        } else {
                            res.send({ articles: null });
                        }
                    } else {
                        loopCount = 0;
                    
                        var html = require('iconv-lite').decode(body, params.cod);
                        //add check inputs
                        var articles = manualParse(html, params);
                        if (articles.length > 0) {
                            if (limit === 0) {
                                res.send({ articles: articles });
                            } else {
                                res.send({ article: articles[0], count: articles.length });
                            }
                        } else {
                            res.send({ articles: [] });
                        }
                    }
                });
            })();
        } else {
            res.send({ articles: [] });
        }
    }
}