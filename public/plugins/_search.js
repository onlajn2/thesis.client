document.addEventListener("DOMContentLoaded", function(event) {
    var originPage = window.location.origin;
    var term = decodeURIComponent(window.location.pathname.split("/")[2]);

    var optionsT = { month: 'long', day: 'numeric' };
    var count = 96, lastIndex = 0, group = 16, loading = false;
    var articles = new Array(), terms = new Array();
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
        tag.innerHTML = '<img src="' + im + '" alt="icon-' + jName + '">'
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
                    if (isDefined(response.arts) && isDefined(response.terms)) {
                        let len = response.arts.length;
                        if (len > 0) {
                            terms = response.terms;
                            
                            //articles
                            for (let i = 0; i < len; i++) {
                                articles.push(response.arts[i]);
                            }
                            loadNext();
                        } else {
                            toogle();
                            alert("Žádné články nebyly nalezeny.");
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("POST", originPage + '/get/hledat', true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send("term=" + term + "&count=" + count);
    }

    //call loadNext
    window.addEventListener("scroll", function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            var sum = block.getElementsByTagName("article").length;
            if (sum < articles.length && !loading) {
                toogle();
                loadNext();
            }            
        }
    });

    loadCon();
});