document.addEventListener("DOMContentLoaded", function(event) {
    var originPage = window.location.origin;
    var parts = window.location.pathname.split("/");
    var journal = parts[2], id = parts[3];

    var loading = false;
    var block = document.getElementById("content-articles");
    var loadIcon;

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
        var d = block.getElementsByClassName("center-block");
        if (d.length == 0) {
            if (par === null) {
                block.appendChild(loadIcon);
            } else {
                par.appendChild(loadIcon);
            }
        } else {
            d[0].parentElement.removeChild(d[0]);
        }
    }

    //print article
    function printArticle(article) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-full');
        let imgLink = article.mim.length > 0 ? article.mim : article.sim.length > 0 ? article.sim : "";

        tag.innerHTML = '<h1><a href="' + article.lnk +'">' + article.tit + '</a></h1>';
        if (article.per.slice(-3) !== "...") {
            tag.innerHTML += '<p class="perex">' + article.per + '</p>';
        }
        if (imgLink.length > 0) {
            tag.innerHTML += '<img class="main" data-src="' + imgLink + '" alt="img-article">';
        }
        tag.innerHTML += article.con;

        tag.innerHTML += '<div class="wid"><a href="' + article.lnk + '">Přejít na celý článek</a></div>';
        document.getElementById("cont-main-art").appendChild(tag);
        lazyLoad();
    }

    //print button
    function printBottom(link) {
        var tag = document.createElement("div");
        tag.setAttribute('class', 'bottom-block');
        tag.innerHTML = '<h3 class="similar-title">Mohlo by vás zajímat</h3>' + '<div class="sim-arts"></div>';
        document.getElementById("cont-main-art").appendChild(tag);
    }

    //print siliar articles
    function printSimilarArticles(articles) {
        var simBlock = document.getElementsByClassName("sim-arts")[0];
        var len = articles.length;
        if (len > 0) {
            let k = 0;
            for (let i = 0; i < len; i++) {
                if (id !== articles[i]._id && k < 5) {
                    var tag = document.createElement("article");
                    tag.setAttribute('class', 'article-sim');
                    var link = originPage + "/clanek/" + articles[i].jrn + "/" + articles[i]._id + "/" + encodeURIComponent(articles[i].tit);
                    var imgLink = articles[i].sim.length > 0 ? articles[i].sim : articles[i].mim.length > 0 ? articles[i].mim : "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + articles[i].jrn;
        
                    tag.innerHTML = '<a href="' + link + '">'
                                    + '<div class="im-block"><img data-src="' + imgLink + '" alt="img-' + articles[i].tit.substring(0, 5) + '">'
                                    + '<h4>' + articles[i].tit + '</h4></div>'
                                    + '</a>';
                    
                    simBlock.appendChild(tag);
                    k++;
                }
            }
            lazyLoad();
        } else {
            simBlock.innerHTML = '<span class="no-sim-art">Žádné podobné články...</span>';
        }
    }

    //load content
    function loadCon() {
        toogle(null);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (Object.keys(response).length > 0) {
                        printArticle(response);
                        toogle(null);
                        printBottom(response.lnk);
                        toogle(document.getElementsByClassName("bottom-block")[0]);
                        loadSim();
                    } else {
                        alert("Nebyl nalezen žádný článek.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("GET", originPage + '/get/clanek/' + journal + '/' + id, true);
        xhttp.send();
    }

    //load content
    function loadSim() {
        var xhttps = new XMLHttpRequest();
        xhttps.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    printSimilarArticles(JSON.parse(this.responseText));
                    toogle();
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttps.open("GET", originPage + '/get/podobne/' + journal + '/' + id, true);
        xhttps.send();
    }

    loadCon();
});