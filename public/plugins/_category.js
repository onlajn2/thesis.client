document.addEventListener("DOMContentLoaded", function(event) {
    var actualPage = window.location.pathname.split("/")[2];
    var originPage = window.location.origin;

    var optionsT = { month: 'long', day: 'numeric' };
    var count = 48, lastIndex = 0, group = 16, loading = false, end = false;
    var articles = new Array(), lastIds = new Array();
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
    function toogle() {
        loading = !loading;
        var d = block.getElementsByClassName("center-block");
        if (d.length == 0) {
            block.appendChild(loadIcon);
        } else {
            d[0].parentElement.removeChild(d[0]);
        }
    }

    //load next group
    function loadNext() {
        var g = 0;
        var len = articles.length;
        toogle();
        
        for (let i = lastIndex; i < len; i++) {
            printArticle(articles[i]);
            lastIndex = i + 1;
            
            g++;
            if (g == group) {
                break;
            }
        }
        lazyLoad();
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
    function printArticle(article) {
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

    //load content
    function loadCon() {
        toogle();
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.articles) && isDefined(response.lastIds)) {
                        let len = response.articles.length;
                        if (len > 0) {
                            lastIds = response.lastIds;
                            if (len < count) {
                                end = true;
                            }
                            
                            for (let i = 0; i < len; i++) {
                                articles.push(response.articles[i]);
                            }
                            loadNext();
                        } else {
                            toogle();
                            alert("Omlouváme se.\nNebyly nalezeny žádné články.");
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("POST", originPage + '/get/kategorie', true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send("params=" + JSON.stringify({ category: actualPage, count: count, ids: lastIds }));
    }

    //call loadNext
    window.addEventListener("scroll", function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            var sum = block.getElementsByTagName("article").length;
            
            if (!end && !loading) {
                if (sum > 0 && !loading) {
                    if (sum % count == 0 && sum == articles.length && !loading) {
                        loadCon();
                    } else {
                        toogle();
                        loadNext();
                    }
                }
            } else if (sum < articles.length) {
                toogle();
                loadNext();
            }
            
        }
    });

    loadCon();
});