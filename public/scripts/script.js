document.addEventListener("DOMContentLoaded", function(globalEvent) {
    var originPage = window.location.origin, submenuItems = [], sbl = false, scrollBtn = false;

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
    function removeFromStorage(itemName) {
        if (isLocalStorage) {
            localStorage.removeItem(itemName);
        } else if (isSessionStorage) {
            sessionStorage.removeItem(itemName);
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

    //create submenu structure
    function struct(el) {
        let rem = el.getElementsByClassName("long-none")[0];
        rem.parentNode.removeChild(rem);
        let d = document.createElement("div");
        d.classList.add("own-columns");
        let dc = document.createElement("div");
        dc.classList.add("column");
        let cr = document.createElement("ul");
        cr.classList.add("column-row");
        dc.appendChild(cr);
        let dc2 = dc.cloneNode(true);
        d.appendChild(dc);
        d.appendChild(dc2);
        el.appendChild(d);
    }
    //after start
    (function run() {
        if (!isLocalStorage && !isSessionStorage) {
            alert("Je nám líto.\nVáš prohlížeč nepodporuje úložiště Web Storage.\nPro správné fungování této stránky použijte jiný prohlížeč.");
        }
        //first: color
        var storageColor = getFromStorage("theme-color");
        if (storageColor === null) {
            setInStorage("theme-color", "sample-color-1");
            storageColor = "sample-color-1";
        }
        //apply color
        document.getElementsByTagName("head")[0].innerHTML += '<link rel="stylesheet" href="/public/colors/' + storageColor + '.css" id="theme-color">';
        var tmpColors = document.getElementsByClassName("sample-color");
        for (let i = 0; i < tmpColors.length; i++) {
            if (tmpColors[i].classList.contains(storageColor)) {
                tmpColors[i].classList.add("sample-color-select");
            }
        }

        //first: notifications
        var ntfs = getFromStorage("notifications");
        if (ntfs === null) {
            setInStorage("notifications", JSON.stringify([]));
            document.getElementsByClassName("side-toolbar-content")[0].innerHTML = '<span class="none-note">Žádné notifikace...</span>';
        } else {
            //load notifications
            ntfs = JSON.parse(ntfs);
            var len = ntfs.length;
            if (len === 0) {
                document.getElementsByClassName("side-toolbar-content")[0].innerHTML = '<span class="none-note">Žádné notifikace...</span>';
            } else {
                while (len--) {
                    let ntf = ntfs[len];
                    let div = document.createElement("div");
                    div.classList.add("info-note");
                    div.innerHTML = '<span class="cls-note" data-id="' + len + '"></span>'
                                    + '<h5 class="info-tit">' + ntf.t + '</h5>' + '<p class="info-tex">' + ntf.m + '</p>';
                    document.getElementsByClassName("side-toolbar-content")[0].appendChild(div);
                }
            }
        }
        //close notifications
        var cls = document.getElementsByClassName("cls-note");
        for (let i = 0; i < cls.length; i++) {
            let cl = cls[i];
            cl.addEventListener("click", function(event) {
                event.stopPropagation();
                let nts = getFromStorage("notifications");
                if (nts === null) {
                    alert("Vyskytly se naznámé potíže při mazání z Web Storage.");
                } else {
                    nts = JSON.parse(nts);
                    clParent = cl.parentNode;

                    //edit nts
                    let len = nts.length;
                    let newNt = [], temp = false;
                    for (let i = 0; i < len; i++) {
                        let nt = nts[i];
                        if (temp || clParent.getElementsByTagName("h5")[0].textContent !== nt.t || clParent.getElementsByTagName("p")[0].textContent !== nt.m) {
                            newNt.push(nt);
                        } else {
                            temp = true;
                        }
                    }

                    //remove
                    setInStorage("notifications", JSON.stringify(newNt));
                    clParent.parentNode.removeChild(clParent);

                    //check empty field
                    if (document.getElementsByClassName("cls-note").length === 0) {
                        document.getElementsByClassName("side-toolbar-content")[0].innerHTML = '<span class="none-note">Žádné notifikace...</span>';
                    }
                }
            });
        }

        //display categories
        var disCat = getFromStorage("display-categories");
        if (disCat === null) {
            setInStorage("display-categories", JSON.stringify([]));
        } else {
            disCat = JSON.parse(disCat);
            var len = disCat.length;
            let selLis = document.getElementById("selector").getElementsByTagName("li");
            let newLis = new Array(), newCat = new Array();
            for (let c = 0; c < selLis.length; c++) {
                newLis.push(selLis[c].textContent);
            }
            for (let b = 0; b < len; b++) {
                if (newLis.indexOf(disCat[b]) !== -1) {
                    newCat.push(disCat[b]);
                    selLis[newLis.indexOf(disCat[b])].classList.add("disabled");
                }
            }
            setInStorage("display-categories", JSON.stringify(newCat));
        }

        //parse list
        let keys = [];
        if (isLocalStorage) {
            keys = Object.keys(localStorage);
        } else if (isSessionStorage) {
            keys = Object.keys(sessionStorage);
        }
        if (keys.length > 0) {
            let len = keys.length;
            let parseA = [], parseM = [];
    
            while (len--) {
                let key = keys[len];
                if (key.substring(0, 6) === "parse-") {
                    if (key[6] === "a") {
                        parseA.push(key);
                    } else if (key[6] === "m") {
                        parseM.push(key);
                    }
                }
            }
    
            if (parseA.length > 0) {
                let ll = document.getElementsByClassName("long-column")[0];
                struct(ll);
                let lf = ll.getElementsByClassName("column-row")[0];
                let ls = ll.getElementsByClassName("column-row")[1];
                parseA.sort();
                let l = parseA.length;
                for (let i = 0; i < l; i++) {
                    let key = parseA[i];
                    let adr = getFromStorage(key), name = key.substr(8);
                    if (adr !== null) {
                        adr = JSON.parse(adr);
                        let item = document.createElement("li");
                        item.innerHTML = '<a href="/vlastni/a/' + name + '">'
                            + '<img src="https://www.google.com/s2/favicons?domain=' + adr.url + '" alt="icon ' + name + '">' + name + '</a>'
                            + '<span class="cls-own" title="Smazat ' + name + '"></span>';
    
                        if (i % 2 == 0) {
                            lf.appendChild(item);
                        } else {
                            ls.appendChild(item);
                        }
                    }
                }
            }
            
            if (parseM.length > 0) {
                let ll = document.getElementsByClassName("long-column")[1];
                struct(ll);
                let lf = ll.getElementsByClassName("column-row")[0];
                let ls = ll.getElementsByClassName("column-row")[1];
                parseM.sort();
                let l = parseM.length;
                for (let i = 0; i < l; i++) {
                    let key = parseM[i];
                    let adr = getFromStorage(key), name = key.substr(8);
                    if (adr !== null) {
                        adr = JSON.parse(adr);
                        let item = document.createElement("li");
                        item.innerHTML = '<a href="/vlastni/m/' + name + '">'
                            + '<img src="https://www.google.com/s2/favicons?domain=' + adr.url + '" alt="icon ' + name + '">' + name + '</a>'
                            + '<span class="cls-own" title="Smazat ' + name + '"></span>';
    
                        if (i % 2 == 0) {
                            lf.appendChild(item);
                        } else {
                            ls.appendChild(item);
                        }
                    }
                }
            }
        }
        //remove parse
        let clso = document.getElementsByClassName("cls-own");
        for (let i = 0; i < clso.length; i++) {
            clso[i].addEventListener("click", function(event) {
                event.stopPropagation();
                let name = event.target.parentNode.textContent;
                let r = confirm("Opravdu chcete vlastní deník " + name + " smazat?");
                if (r) {
                    if (document.getElementsByClassName("long-column")[0].contains(event.target)) {
                        name = "parse-a-" + name;
                    } else {
                        name = "parse-m-" + name;
                    }
                    removeFromStorage(name);
                    //alert("Deník byl úspěšně smazán.");
                    window.location.reload();
                }
            });
        }

        //first: favorite
        var favs = getFromStorage("favorites");
        if (favs === null) {
            setInStorage("favorites", JSON.stringify([]));
        } else {
            //print favorites
            favs = JSON.parse(favs);
            var len = favs.length;
            let bl = document.getElementById("submenu-favorite");
            if (len === 0) {
                bl.innerHTML = '<span class="submenu-none-favo">Žádné oblíbené deníky...</span>';
            } else {
                favs.sort();
                for (let i = 0; i < len; i++) {
                    let a = document.createElement("a");
                    a.classList.add("whole");
                    a.href = originPage + "/denik/" + favs[i];
                    a.innerHTML = '<img src="https://www.google.com/s2/favicons?domain=' + favs[i] + '" alt="icon-' + favs[i] + '">' + favs[i];
                    bl.appendChild(a);
                }
            }
        }

        //save submenu items
        var cs = document.getElementById("grid-tap").getElementsByClassName("empt");
        for (let i = 0; i < cs.length; i++) {
            submenuItems.push(cs[i].innerHTML);
        }
    })();

    //only open toolbar row
    function openObject(object) {
        var content = object.getElementsByClassName("side-toolbar-content")[0];
        var clickImage = object.getElementsByClassName("toolbar-click")[0];
        if (!content.classList.contains("visibled")) {
            content.classList.add("visibled");
            clickImage.classList.remove("side-toolbar-open");
            clickImage.classList.add("side-toolbar-hide");
        }
    }
    //only close toolbar row
    function closeObject(object) {
        var content = object.getElementsByClassName("side-toolbar-content")[0];
        var clickImage = object.getElementsByClassName("toolbar-click")[0];
        if (content.classList.contains("visibled")) {
            content.classList.remove("visibled");
            clickImage.classList.remove("side-toolbar-hide");
            clickImage.classList.add("side-toolbar-open");
        }
    }

    //close panels
    function closeSearch(t) {
        var field = document.getElementById("header-search-field");
        if (field.classList.contains("visibled")) {
            if (t.className !== "header-icon-searc" && t.id !== "header-search-field") {
                field.classList.remove("visibled");
                field.blur();
            }
        }
    }
    function closeSidebar(t) {
        var sb = document.getElementById("side-toolbar");
        if (sb.classList.contains("visibled")) {
            if (!sb.contains(t)) {
                sb.classList.remove("visibled");
                let rows = document.getElementsByClassName("side-toolbar-row");
                for (let i = 0; i < rows.length; i++) {
                    closeObject(rows[i]);
                }
            }
        }
    }
    function closeSubmenu(t) {
        if (sbl) {
            var submenus = document.getElementsByClassName("header-list-ul")[0].getElementsByTagName("li");
            var len = submenus.length;
            for (let i = 0; i < len; i++) {
                if (submenus[i].classList.contains("visibled")) {
                    if (!submenus[i].getElementsByClassName("header-submenu")[0].contains(t)) {
                        submenus[i].classList.remove("visibled");
                        sbl = false;
                        break;
                    }
                }
            }
        }
    }

    //document click (close submenu, sidebar, search)
    document.addEventListener("click", function(e) {
        var t = e.target;
        closeSearch(t);
        closeSidebar(t);
        closeSubmenu(t);
    });
    //show toolbar colors
    document.getElementsByClassName("header-icon-setti")[0].addEventListener("click", function (event) {
        event.stopPropagation();
        var sidebar = document.getElementById("side-toolbar");
        if (!sidebar.classList.contains("visibled")) {
            sidebar.classList.add("visibled");
            closeSearch(event.target);
            closeSubmenu(event.target);
            openObject(document.getElementsByClassName("toolbar-colors")[0]);
        } else {
            sidebar.classList.remove("visibled");
        }
    });
    //show toolbar notifications
    document.getElementsByClassName("header-icon-notif")[0].addEventListener("click", function (event) {
        event.stopPropagation();
        var sidebar = document.getElementById("side-toolbar");
        if (!sidebar.classList.contains("visibled")) {
            sidebar.classList.add("visibled");
            closeSearch(event.target);
            closeSubmenu(event.target);
            openObject(document.getElementsByClassName("toolbar-notification")[0]);
        } else {
            sidebar.classList.remove("visibled");
        }
    });
    //show toolbar admin
    document.getElementsByClassName("header-icon-admin")[0].addEventListener("click", function (event) {
        event.stopPropagation();
        var sidebar = document.getElementById("side-toolbar");
        if (!sidebar.classList.contains("visibled")) {
            sidebar.classList.add("visibled");
            closeSearch(event.target);
            closeSubmenu(event.target);
            openObject(document.getElementsByClassName("toolbar-admin")[0]);
        } else {
            sidebar.classList.remove("visibled");
        }
    });

    //show toolbar display
    let tempDisplay = document.getElementById("showing");
    if (tempDisplay !== null && tempDisplay !== undefined) {
        tempDisplay.addEventListener("click", function (event) {
            event.stopPropagation();
            var sidebar = document.getElementById("side-toolbar");
            if (!sidebar.classList.contains("visibled")) {
                sidebar.classList.add("visibled");
                closeSearch(event.target);
                closeSubmenu(event.target);
                openObject(document.getElementsByClassName("toolbar-display")[0]);
            } else {
                sidebar.classList.remove("visibled");
            }
        });
    }
    //toolbar display selector
    let selLis = document.getElementById("selector").getElementsByTagName("li");
    let tool = document.getElementsByClassName("toolbar-display")[0].getElementsByClassName("side-toolbar-content")[0];
    for (let a = 0; a < selLis.length; a++) {
        selLis[a].addEventListener("click", function(ev) {
            if (!ev.target.classList.contains("disabled")) {
                ev.target.classList.add("disabled");
                let disCat = getFromStorage("display-categories");
                disCat = JSON.parse(disCat);

                disCat.push(ev.target.textContent);
                
                setInStorage("display-categories", JSON.stringify(disCat));
            } else {
                ev.target.classList.remove("disabled");

                let dis = getFromStorage("display-categories");
                dis = JSON.parse(dis);

                let inn = dis.indexOf(ev.target.textContent);
                if (inn !== -1) {
                    dis.splice(inn, 1);
                }
                
                setInStorage("display-categories", JSON.stringify(dis));
            }

            //print button
            if (document.getElementById("ref-btn") === null) {
                let div = document.createElement("div");
                div.classList.add("dis-blc");
                div.innerHTML = '<button id="ref-btn">Aktualizovat stránku</button>';
                tool.appendChild(div);

                document.getElementById("ref-btn").addEventListener("click", function() {
                    location.reload();
                });
            }
        });
    }

    //close toolbar
    document.getElementsByClassName("side-toolbar-close")[0].addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById("side-toolbar").classList.remove("visibled");
        var rows = document.getElementsByClassName("side-toolbar-row");
        for (let i = 0; i < rows.length; i++) {
            closeObject(rows[i]);
        }
    });
    
    //show/hide toolbar row
    function showHideToolbarRow(object) {
        var content = object.getElementsByClassName("side-toolbar-content")[0];

        if (!content.classList.contains("visibled")) {
            var rows = document.getElementsByClassName("side-toolbar-row");
            for (let i = 0; i < rows.length; i++) {
                closeObject(rows[i]);
            }
            openObject(object);
        } else {
            closeObject(object);
        }
    }
    document.body.addEventListener("click", function(event) {
        if (event.target.classList.contains("sidebar-row-top")) {
            showHideToolbarRow(event.target.parentElement);
        } else if (event.target.parentElement !== null) {
            if (event.target.parentElement.classList.contains("sidebar-row-top")) {
                showHideToolbarRow(event.target.parentElement.parentElement);
            }
        }
        
    });

    //change color
    var colors = document.getElementsByClassName("sample-color");
    for (let i = 0; i < colors.length; i++) {
        colors[i].addEventListener("click", function (event) {
            if (!event.target.classList.contains("sample-color-select")) {
                for (let j = 0; j < colors.length; j++) {
                    if (colors[j].classList.contains("sample-color-select")) {
                        colors[j].classList.remove("sample-color-select");
                        break;
                    }
                }
                var newClass = event.target.className.trim().split(" ")[1];
                document.getElementById("theme-color").href = "/public/colors/" + newClass + ".css";
                event.target.classList.add("sample-color-select");
                setInStorage("theme-color", newClass);
            }
        });
    }

    //find term
    function findTerm() {
        var field = document.getElementById("header-search-field");
        var term = field.value.trim();
        term = term.replace(/\/\\:?/g, ' ');
        window.location.replace(originPage + "/hledat/" + encodeURIComponent(term));
    }
    //show search input
    document.getElementsByClassName("header-icon-searc")[0].addEventListener("click", function (event) {
        event.stopPropagation();
        var field = document.getElementById("header-search-field");
        if (!field.classList.contains("visibled")) {
            field.classList.add("visibled");
            field.focus();
            closeSidebar(event.target);
            closeSubmenu(event.target);
        } else {
            if (field.value.trim().length > 2) {
                findTerm();
            } else {
                field.classList.remove("visibled");
                field.blur();
            }
        }
    });
    document.getElementById('header-search-field').addEventListener('keypress', function (e) {
        let key = e.which || e.keyCode;
        if (key === 13) {
            if (document.getElementById('header-search-field').value.trim().length > 2) {
                findTerm();
            } else {
                alert("Musíte zadat minimálně 3 znaky.");
            }
        }
    });

    //show/hide submenu
    var submenuLis = document.getElementsByClassName("header-list-ul")[0].getElementsByTagName("li");
    for (let i = 0; i < submenuLis.length; i++) {
        submenuLis[i].addEventListener("click", function(event) {
            event.stopPropagation();
            var submenu = submenuLis[i].getElementsByClassName("header-submenu");
            if (submenu.length > 0) {
                if (!submenuLis[i].classList.contains("visibled")) {
                    for (let j = 0; j < submenuLis.length; j++) {
                        submenuLis[j].classList.remove("visibled");
                    }
                    submenuLis[i].classList.add("visibled");
                    sbl = true;
                    closeSearch(event.target);
                    closeSidebar(event.target);
                } else {
                    if (!submenu[0].contains(event.target)) {
                        submenuLis[i].classList.remove("visibled");
                        sbl = false;
                    }
                }
            }
        });
    }

    //responsive submenu
    //submenu change content
    function changeCont(il) {
        document.getElementsByClassName("submenu-5")[0].style.gridTemplateColumns = "repeat(" + il +", 1fr)";
        var g = document.getElementById("grid-tap");
        var len = submenuItems.length;
        g.innerHTML = "";

        for (let i = 0; i < il; i++) {
            var d = document.createElement("div");
            d.classList.add("column");
            g.appendChild(d);
        }
        var cls = g.getElementsByClassName("column");
        var sl = Math.floor(len / il), sd = len % il;

        //sl
        for (let i = 0; i < il; i++) {
            var cl = cls[i];
            for (let j = 0; j < sl; j++) {
                var n = document.createElement("div");
                n.classList.add("empt");
                n.innerHTML = submenuItems[i * sl + j];
                cl.appendChild(n);
            }
        }

        //sd
        var ind = 0;
        for (let i = 0; i < sd; i++) {
            var cl = cls[ind];
            var n = document.createElement("div");
            n.classList.add("empt");
            n.innerHTML = submenuItems[il * sl + i];
            cl.appendChild(n);
            ind++;
        }
    }

    //submenu responsive
    function resFunction() {
        if (window.matchMedia("(min-width: 1101px)").matches) {
            changeCont(5);
        }
        if (window.matchMedia("(max-width: 1100px)").matches) {
            changeCont(4);
        }
        if (window.matchMedia("(max-width: 768px)").matches) {
            changeCont(3);
        }
        if (window.matchMedia("(max-width: 640px)").matches) {
            changeCont(2);
        }
    }
    resFunction();
    window.matchMedia("(min-width: 1101px)").addListener(resFunction);
    window.matchMedia("(max-width: 1100px)").addListener(resFunction);
    window.matchMedia("(max-width: 768px)").addListener(resFunction);
    window.matchMedia("(max-width: 640px)").addListener(resFunction);

    //scroll
    function scrollToTop() {
        var cosParameter = window.scrollY / 2, scrollCount = 0, oldTimestamp = performance.now();
        function step (newTimestamp) {
            scrollCount += Math.PI / (1000 / (newTimestamp - oldTimestamp));
            if (scrollCount >= Math.PI) window.scrollTo(0, 0);
            if (window.scrollY === 0) return;
            window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)));
            oldTimestamp = newTimestamp;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }
    function scrollFunction() {
        if (document.body.scrollTop > 1440 || document.documentElement.scrollTop > 1440) {
            if (!scrollBtn) {
                //print button
                var d = document.createElement("div");
                d.setAttribute("id", "scroll-button");
                document.body.appendChild(d);
                document.getElementById("scroll-button").addEventListener("click", function(event) {
                    event.stopPropagation();
                    scrollToTop();
                });
                scrollBtn = true;
            }
        } else {
            if (scrollBtn) {
                var d = document.getElementById("scroll-button");
                if (d !== null) {
                    d.parentNode.removeChild(d);
                }
                scrollBtn = false;
            }
        }
    }
    window.onscroll = function() {scrollFunction()};
});