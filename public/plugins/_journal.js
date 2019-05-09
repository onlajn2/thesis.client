document.addEventListener("DOMContentLoaded", function(event) {
    var actualPage = window.location.pathname.split("/")[2];
    var originPage = window.location.origin;

    var optionsT = { month: 'long', day: 'numeric' };
    var count = 48, lastId = 0, end = false, lastIndex = 0, group = 16, loading = false;
    var gCategories = new Array(), gKategorie = new Array(), articles = new Array(), sel = 0;
    var countArticles = 0, countDownloadArticles = 0;
    var block = document.getElementById("content-articles");
    var loadIcon, nextButton;
    
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
    function setInStorage(itemName, itemValue) {
        if (isLocalStorage) {
            localStorage.setItem(itemName, itemValue);
        } else if (isSessionStorage) {
            sessionStorage.setItem(itemName, itemValue);
        }
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

    //toogle category
    var selc = document.getElementsByClassName("content-tools-left")[0];
    selc.addEventListener('click', function(event) {
        if (event.target.className.length == 0 && articles.length > 0) {
            //change active
            selc.getElementsByClassName("active")[0].classList.remove("active");
            event.target.className = "active";
            
            //change content
            var bt = document.getElementsByClassName("center-button");
            if (bt.length > 0) bt[0].parentElement.removeChild(bt[0]);

            var i = document.getElementsByTagName("article").length;
            while (i--) {
                block.removeChild(block.lastChild);
            }
            
            lastIndex = 0;
            sel = gKategorie.indexOf(event.target.textContent) + 1;
            toogle();
            loadNext();

            if (sel != 0 && !end) {
                block.appendChild(nextButton);
            }
        }
    });

    //create load and button
    (function create() {
        loadIcon = document.createElement("div");
        loadIcon.setAttribute("class", "center-block");
        loadIcon.innerHTML = '<div class="lds-dual-ring"></div>';
        nextButton = document.createElement("div");
        nextButton.setAttribute("class", "center-button");
        var temp = document.createElement("button");
        temp.onclick = afterClick;
        temp.textContent = "Stáhnout další články";
        nextButton.appendChild(temp);
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

    //print categories
    function printCategories() {
        var len = gKategorie.length;
        if (len > 1) {
            var ulBlock = document.getElementsByClassName("content-tools-left")[0];
            ulBlock.innerHTML += '<li class="active">Vše</li>';
            for (let i = 0; i < len; i++) {
                ulBlock.innerHTML += '<li>' + gKategorie[i] + '</li>';
            }
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

    //load next group
    function loadNext() {
        var g = 0;
        var len = articles.length;
        toogle();
        for (let i = lastIndex; i < len; i++) {
            if (sel != 0) {
                var cat = gCategories[sel - 1];
                if (articles[i].cat !== cat) {
                    continue;
                }
            }
            printArticle(articles[i]);
            lastIndex = i + 1;
            
            if (sel == 0) {
                g++;
                if (g == group) {
                    break;
                }
            }
        }
        lazyLoad();
    }

    //load content
    function loadCon() {
        toogle();
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.articles) && isDefined(response.end) && isDefined(response.categories) && isDefined(response.kategorie) && isDefined(response.count)) {
                        let len = response.articles.length;
                        if (len > 0) {
                            //countDownloadArticles += len;
                            if (gCategories.length == 0) {
                                //first call
                                gCategories = response.categories;
                                gKategorie = response.kategorie;
                                countArticles = response.count;
    
                                //first check, if is journal in favorite
                                let f = getFromStorage("favorites"), cf = "cont-favo-none", ct = "Přidat do oblíbených";
                                f = JSON.parse(f);
                                if (f.length > 0) {
                                    if (f.indexOf(actualPage.toLowerCase().trim()) !== -1) {
                                        cf = "cont-favo-favo";
                                        ct = "Odebrat z oblíbených";
                                    }
                                }
    
                                var info = document.getElementsByClassName("content-info")[0];
                                info.innerHTML = //'<span class="count-articles">'
                                                //+ '<span class="cb-b" title="Počet stažených článků">' + countDownloadArticles + '</span>'
                                                //+ '<span class="cb-c" title="Počet všech článků">' + countArticles + '</span>'
                                                //+ '</span>'
                                                 '<span class="content-favorite ' + cf + '" title="' + ct + '"></span>'
                                                + '<a class="content-link" href="https://' + actualPage + '">' + actualPage + '</a>'
                                                + '<span class="count-articles cb2">'
                                                + '<span class="cb-c" title="Počet všech článků">(' + countArticles + ')</span>'
                                                + '</span>';
                                printCategories();
                            }
                            end = response.end;
                            
                            //articles
                            for (let i = 0; i < len; i++) {
                                articles.push(response.articles[i]);
                            }
                            lastId = articles[articles.length - 1]._id;
                            loadNext();
                            if (sel != 0 && !end) {
                                block.appendChild(nextButton);
                            }
                            //document.getElementsByClassName("cb-b")[0].textContent = countDownloadArticles;
    
                            //favorite journal
                            var cf = document.getElementsByClassName("content-favorite")[0];
                            cf.addEventListener("click", function(e) {
                                let tar = e.target;
                                if (tar.classList.contains("cont-favo-none")) {
                                    let f = getFromStorage("favorites");
                                    f = JSON.parse(f);
                                    let name = actualPage.toLowerCase().trim();
                                    if (f.indexOf(name) === -1) {
                                        f.push(name);
                                        setInStorage("favorites", JSON.stringify(f));
    
                                        let list = document.getElementById("submenu-favorite");
                                        let subs = list.getElementsByTagName("a");
                                        let i = 0;
                                        for (i = 0; i < subs.length; i++) {
                                            if (name < subs[i].textContent) {
                                                break;
                                            }
                                        }
                                        //create new link
                                        let item = document.createElement("a");
                                        item.classList.add("whole");
                                        item.href = originPage + "/denik/" + name;
                                        item.innerHTML = '<img src="https://www.google.com/s2/favicons?domain=' + name + '" alt="icon-' + name + '">' + name;

                                        //paste link to submenu
                                        if (subs.length === 0) {
                                            list.innerHTML = "";
                                            list.appendChild(item);
                                        } else if (subs.length === i) {
                                            list.appendChild(item);
                                        } else {
                                            list.insertBefore(item, list.childNodes[i]);
                                        }

                                        tar.classList.remove("cont-favo-none");
                                        tar.classList.add("cont-favo-favo");
                                        tar.title = "Odebrat z oblíbených";
                                    }
                                } else {
                                    let f = getFromStorage("favorites");
                                    f = JSON.parse(f);
                                    let name = actualPage.toLowerCase().trim();
                                    let ind = f.indexOf(name);
                                    if (ind !== -1) {
                                        f.splice(ind, 1);
                                        setInStorage("favorites", JSON.stringify(f));
                                        
                                        //remove from submenu
                                        let list = document.getElementById("submenu-favorite");
                                        let subs = list.getElementsByTagName("a");
                                        for (let i = 0; i < subs.length; i++) {
                                            if (name === subs[i].textContent) {
                                                list.removeChild(list.childNodes[i]);
                                                break;
                                            }
                                        }
                                        if (list.getElementsByTagName("a").length === 0) {
                                            list.innerHTML = '<span class="submenu-none-favo">Žádné oblíbené deníky...</span>';
                                        }
                                        tar.classList.remove("cont-favo-favo");
                                        tar.classList.add("cont-favo-none");
                                        tar.title = "Přidat do oblíbených";
                                    }
                                }
                            });
                        } else {
                            toogle();
                            alert("Omlouváme se.\nDeník neobsahuje žádné články.");
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhttp.open("GET", originPage + '/get/denik/' + actualPage + "/" + count + "/" + lastId, true);
        xhttp.send();
    }

    //call loadNext
    window.addEventListener("scroll", function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            var sum = block.getElementsByTagName("article").length;
            if (sel == 0 && !loading) {
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
        }
    });

    //click call
    function afterClick() {
        var bt = document.getElementsByClassName("center-button");
        if (bt.length > 0) bt[0].parentElement.removeChild(bt[0]);
        loadCon();
    }
    
    loadCon();
});