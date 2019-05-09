document.addEventListener("DOMContentLoaded", function(event) {
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

    function isDefined(value) {
        return value !== undefined && value !== null;
    }
    function getFromStorage(itemName) {
        if (isLocalStorage) {
            return localStorage.getItem(itemName);
        } else if (isSessionStorage) {
            return sessionStorage.getItem(itemName);
        } else {
            return false;
        }
    }

    var actualPage = window.location.pathname, originPage = window.location.origin;
    actualPage = actualPage.split("/");
    var method = actualPage[2], journalName = actualPage[3];
    const months = [ 'ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince' ];

    var articles = new Array();
    var lastIndex = 0, group = 16, loading = false, sum = 0;
    var block = document.getElementById("content-articles");
    var loadIcon;

    //load params
    var params = getFromStorage("parse-" + method + "-" + journalName);
    if (params !== null) {
        params = JSON.parse(params);
    } else {
        window.location.replace(originPage);
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
    function toogle() {
        loading = !loading;
        var d = block.getElementsByClassName("center-block");
        if (d.length == 0) {
            block.appendChild(loadIcon);
        } else {
            d[0].parentElement.removeChild(d[0]);
        }
    }

    //get date
    function getDate(date) {
        if (date !== undefined && date !== null) {
            if (date !== "") {
                var nowDate = new Date();
                var artDate = new Date(date);
                if (nowDate.getDate() == artDate.getDate()) {
                    return "Dnes";
                }
                nowDate.setDate(nowDate.getDate() - 1);
                if (nowDate.getDate() == artDate.getDate()) {
                    return "Včera";
                } else {
                    return artDate.getDate() + ". " + months[artDate.getMonth()];
                }
            } else {
                return ""; 
            }
        } else {
            return "";
        }
    }

    //print article
    function printArticle(article) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-classic');
        var jName = journalName;
        var im = article.sim;
        if (im.length == 0) {
            im = "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + jName;
        }
        var str = '<img data-src="' + im + '" alt="icon-' + jName + '">'
                + '<div class="right-side">'
                + '<div class="top-info">'
                + '<a class="journal-link" href="' + params.url + '">' + jName + '</a>';
        if (getDate(article.dat) !== "") {
            str += '<span class="date">' + article.dat + '</span>';
        }
        str += '</div><h4><a href="' + article.lnk + '">' + article.tit + '</a></h4><p>' + article.per + '</p></div>';
        
        tag.innerHTML = str.slice(0);
        block.appendChild(tag);
    }

    //load next group
    function loadNext() {
        var len = articles.length, g = 0;
        toogle();
        for (let i = lastIndex; i < len; i++) {
            printArticle(articles[i]);
            lastIndex++;
            g++;
            if (g == group) {
                break;
            }
        }
        sum = lastIndex;
        lazyLoad();
    }

    //load content
    (function loadCon() {
        toogle();
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.articles)) {
                        let len = response.articles.length;
                        if (len > 0) {
                            articles = response.articles;
                            loadNext();
                        } else {
                            alert("Nebyl nalezen žádný článek.\nZkontrolujte zadané parametry deníku.");
                        }
                    } else {
                        alert("Při získávání článků došlo k chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("POST", originPage + '/get/own', true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send("params=" + JSON.stringify({ name: journalName, method: method, attr: params }));
    })();

    //call loadNext
    window.addEventListener("scroll", function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            if (!loading && sum > 0) {
                if (!loading && sum < articles.length) {
                    toogle();
                    loadNext();
                }
            }
        }
    });
});