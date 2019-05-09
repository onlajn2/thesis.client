document.addEventListener("DOMContentLoaded", function(event) {
    var originPage = window.location.origin;

    var optionsT = { month: 'long', day: 'numeric' };
    var loading = false;
    var articles = new Array(), gCategories = new Array();
    var content = document.getElementById("content-articles");
    var loadIcon;

    var isLocalStorage = (function() {
        try {
            var mod = 'test';
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (exception) {
            return false;
        }
    }());
    var isSessionStorage = (function() {
        try {
            var mod = 'test';
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (exception) {
            return false;
        }
    }());

    //functions
    function getFromStorage(itemName) {
        if (isLocalStorage) {
            return localStorage.getItem(itemName);
        } else if (isSessionStorage) {
            return sessionStorage.getItem(itemName);
        } else {
            return false;
        }
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }
    //lazy loading
    function lazyLoad() {
        [].forEach.call(document.querySelectorAll('img[data-src]'), function(img) {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.onload = function() {
                img.removeAttribute('data-src');
            };
        });
    }

    //create load and button
    (function create() {
        loadIcon = document.createElement("div");
        loadIcon.setAttribute("class", "center-block");
        loadIcon.innerHTML = '<div class="lds-dual-ring"></div>';
    })();

    //toogle load
    function toogle(par) {
        loading = !loading;
        var d = content.getElementsByClassName("center-block");
        if (d.length == 0) {
            if (par) {
                content.insertBefore(loadIcon, document.getElementsByClassName("main-block")[0]);
            } else {
                content.appendChild(loadIcon);
            }
        } else {
            d[0].parentElement.removeChild(d[0]);
        }
    }

    //get date
    function getDate(date) {
        var nowDate = new Date();
        var artDate = new Date(date);
        
        if (nowDate.getDate() === artDate.getDate()) {
            let dif = nowDate.getHours() - artDate.getHours();
            if (dif > 1) {
                return "Před " + dif + " hodinami";
            } else if (dif === 1) {
                return "Před hodinou";
            } else {
                dif = nowDate.getMinutes() - artDate.getMinutes();
                if (dif > 4) {
                    return "Před " + dif + " minutami";
                } else {
                    return "Právě teď";
                }
            }
        }
        nowDate.setDate(nowDate.getDate() - 1);
        if (nowDate.getDate() == artDate.getDate()) {
            return "Včera";
        } else {
            return artDate.toLocaleDateString('cs-CZ', optionsT);
        }
    }

    //print article
    function printArticle(block, article) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-classic');
        var jName = article.jrn;
        var im = article.sim;
        if (im.length == 0) {
            im = article.mim;
            if (im.length == 0) {
                im = "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + jName;
            }
        }
        var link = originPage + "/clanek/" + jName + "/" + article._id + "/" + encodeURIComponent(article.tit);
        tag.innerHTML = '<img data-src="' + im + '" alt="icon-' + jName + '">'
                        + '<div class="right-side">'
                        + '<div class="top-info">'
                        + '<a class="journal-link" href="' + originPage + "/denik/" + jName + '">' + jName + '</a>'
                        + '<span class="date">' + getDate(article.dat) + '</span>'
                        + '<span class="read-time">' + article.rdt +'m čtení</span>'
                        + '</div>'
                        + '<h4><a href="' + link + '">' + article.tit + '</a></h4>'
                        + '<p>' + article.per + '</p>'
                        + '</div>';
        
        block.appendChild(tag);
    }

    //print manual article
    function printManuArticle(block, article, par, name) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-classic');
        var im = article.sim;
        if (im.length == 0) {
            im = "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + name;
        }
        tag.innerHTML = '<img data-src="' + im + '" alt="icon-' + name + '">'
                        + '<div class="right-side">'
                        + '<div class="top-info">'
                        + '<a class="journal-link" href="' + originPage + "/vlastni/" + par + "/" + name + '">' + name + '</a>'
                        + '</div>'
                        + '<h4><a href="' + article.lnk + '">' + article.tit + '</a></h4>'
                        + '<p>' + article.per + '</p>'
                        + '</div>';

        if (isDefined(article.dat)) {
            if (article.dat.length > 0) {
                tag.getElementsByClassName("top-info")[0].innerHTML += '<span class="date">' + article.dat + '</span>';
            }
        }

        block.appendChild(tag);
    }

    //printAll
    function printAll() {
        toogle(false);
        let j = 0;
        for (let i = 0; i < gCategories.length; i++) {
            if (gCategories[i].category.ur !== "nezarazene") {
                if (articles[i] === null || articles[i].length === 0) {
                    continue;
                }
                var tag = document.createElement("div");
                tag.setAttribute('class', 'main-block');
                tag.innerHTML = '<h1><a href="/kategorie/' + gCategories[i].category.ur + '">' + gCategories[i].category.cz + '</a></h1>';
                content.appendChild(tag);
                var block = document.getElementsByClassName("main-block")[j];
                var len = articles[i].length < 3 ? articles[i].length : 3;
                for (let j = 0; j < len; j++) {
                    printArticle(block, articles[i][j]);
                }
                j++;
                lazyLoad();
            }
        }
    }
    //load own articles
    function loadOwn() {
        //load own
        let itms;
        if (isLocalStorage) {
            itms = Object.keys(localStorage);
        } else if (isSessionStorage) {
            itms = Object.keys(sessionStorage);
        } else {
            return;
        }

        let arr = new Array();
        for (let i = 0; i < itms.length; i++) {
            let itm = itms[i];
            if (itm.substring(0, 6) === "parse-") {
                let param = getFromStorage(itm);
                if (param !== null) {
                    arr.push({ name: itm.substring(8), method: itm.substr(6, 1), attr: JSON.parse(param) });
                }
            }
        }

        //by cycle fix array
        let xhttpArr = new Array(arr.length), arts = new Array();
        if (arr.length > 0) {
            toogle(true);
            for (let i = 0; i < arr.length; i++) {
                xhttpArr[i] = new XMLHttpRequest();
                xhttpArr[i].onreadystatechange = function() {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let response = JSON.parse(this.responseText);
                            let art = response.article;
                            if (isDefined(art)) {
                                if (Object.keys(art).length > 0) {
                                    arts.push({ name: arr[i].name, art: art, par: arr[i].method });
                                } else {
                                    arts.push({});
                                }
                            } else {
                                arts.push({});
                            }
                        } else {
                            arts.push({});
                        }
                    }
                };
                if (arr[i].method === "m") {
                    xhttpArr[i].open("POST", originPage + '/get/sample/manual', true);
                    xhttpArr[i].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhttpArr[i].send("params=" + JSON.stringify(arr[i].attr));
                } else {
                    xhttpArr[i].open("POST", originPage + '/get/sample/auto', true);
                    xhttpArr[i].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhttpArr[i].send("link=" + arr[i].attr.url + "&coding=" + arr[i].attr.cod);
                }
            }
    
            //then print max 4 articles
            (function tempF() {
                if (arts.length === arr.length) {
                    let temp = new Array();

                    for (let i = 0; i < arts.length; i++) {
                        if (Object.keys(arts[i]).length > 0) {
                            temp.push(arts[i]);
                        }
                    }

                    if (temp.length > 0) {
                        var tag = document.createElement("div");
                        tag.setAttribute('class', 'main-block');
                        tag.classList.add("spec-block");
                        tag.innerHTML = '<h1><a>Vlastní</a></h1><div id="main-own"></div>';
                        content.insertBefore(tag, document.getElementsByClassName("main-block")[0]);
                        let block = document.getElementById("main-own");
        
                        toogle(true);

                        let len = temp.length < 4 ? temp.length : 4;
                        for (let i = 0; i < len; i++) {
                            printManuArticle(block, temp[i].art, temp[i].par, temp[i].name);
                        }
                        lazyLoad();

                    }
                } else {
                    setTimeout(function() {
                        tempF();
                    }, 50);
                }
            })();
        }
    }
    //load content
    function loadCon() {
        toogle(false);
        //get bad 
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.articles) && isDefined(response.categories)) {
                        let len = response.articles.length;
                        if (len > 0) {
                            articles = response.articles;
                            gCategories = response.categories;
                            printAll();
                            loadOwn();
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("POST",  originPage + '/get/all', true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send("params=" + getFromStorage("display-categories"));
    }
    
    loadCon();
});