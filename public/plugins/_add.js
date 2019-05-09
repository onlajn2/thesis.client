document.addEventListener("DOMContentLoaded", function(evente) {
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
    function removeFromStorage(itemName) {
        if (isLocalStorage) {
            localStorage.removeItem(itemName);
        } else if (isSessionStorage) {
            sessionStorage.removeItem(itemName);
        }
    }
    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    //params and values
    var originPage = window.location.origin;
    var loadIcon, loading = false, re = /^[a-zA-Z0-9.-]+$/;
    var allPairTags = new Array("a", "abbr", "address", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "body", "button",
        "canvas", "caption", "cite", "code", "colgroup", "data", "datalist", "dd", "del", "details", "dialog", "div", "dl", "dt", "dfn", "em",
        "fieldset", "figcaption", "figure", "footer", "form", "head", "header", "hgroup", "html", "h1", "h2", "h3", "h4", "h5", "h6", "i",
        "iframe", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meter", "menuitem", "nav", "noscript", "object",
        "ol", "optgroup", "option", "output", "p", "pre", "progress", "q", "ruby", "s", "samp", "script", "section", "select", "small",
        "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time",
        "title", "tr", "u", "ul", "var", "video");
    var allUnpairTags = new Array("area", "base", "col", "embed", "img", "input", "keygen", "link", "meta", "param", "source", "track");
    
    //auto
    var autoUrl = "", autoCoding = "utf8";
    //manual
    var manuUrl = "", manuCoding = "utf8";
    var manuSampSelc = "", manuSampAttr = new Array();
    //edit
    var storageArray = new Array(), storageIndex = -1;

    //create load and button
    (function create() {
        loadIcon = document.createElement("div");
        loadIcon.setAttribute("class", "center-block-2");
        loadIcon.innerHTML = '<div class="lds-dual-ring-2"></div>';
    })();

    //disable element
    let sss = document.getElementsByClassName("element");
    for (let i = 0; i < sss.length; i++) {
        sss[i].addEventListener("click", function(event) {
            event.preventDefault();
        });
    }

    //toogle load
    function toogle(block) {
        loading = !loading;
        var d = block.getElementsByClassName("center-block-2");
        if (d.length == 0) {
            block.appendChild(loadIcon);
        } else {
            d[0].parentElement.removeChild(d[0]);
        }
    }
    //is letter
    function isLetter(c) {
        return c.toLocaleLowerCase() !== c.toLocaleUpperCase();
    }
    //null content (by clicking)
    function nullContent() {
        //examples
        document.getElementById("parse-auto-sample").innerHTML = "";
        document.getElementById("parse-manu-sample").innerHTML = "";

        //selects
        document.getElementsByClassName("parse-selected")[0].getElementsByTagName("select")[1].innerHTML ='<option value="1" selected>atribut</option>';

        //html
        document.getElementById("sample-html").innerHTML = "";

        //inputs
        var ins = document.getElementById("content-articles").getElementsByTagName("input");
        for (let i = 0; i < ins.length; i++) {
            ins[i].value = "";
        }

        //manual block
        document.getElementsByClassName("parse-manu-link")[0].style.display = "grid";
        document.getElementById("manual-cont-block").style.display = "none";

        //null values
        autoUrl = "", manuUrl = "";
        autoCoding = "utf8", manuCoding = "utf8", storageIndex = -1;

        //edit block
        document.getElementsByClassName("parse-edit-link")[0].style.display = "grid";
        document.getElementsByClassName("parse-edit-link-2")[0].style.display = "none";

        //edit block values
        document.getElementById("edit-url").value = "";
        document.getElementById("edit-jrn").innerHTML = "";
        if (storageArray.length > 0) {
            for (let i = 0; i < storageArray.length; i++) {
                document.getElementById("edit-jrn").innerHTML += '<option value="' + i + '">' + storageArray[i].name + '</option>';
            }
        } else {
            document.getElementById("edit-jrn").innerHTML = '<option value="-1">Žádné deníky</option>';
        }
        
        //values coding
        document.getElementById("auto-coding").getElementsByTagName("option")[0].selected = true;
        document.getElementById("manu-coding").getElementsByTagName("option")[0].selected = true;
        document.getElementById("edit-coding").getElementsByTagName("option")[0].selected = true;
    }
    //toogle parse
    var selc = document.getElementsByClassName("content-tools-left")[0];
    selc.addEventListener('click', function(event) {
        if (event.target.className.length == 0) {
            //change active
            selc.getElementsByClassName("active")[0].classList.remove("active");
            event.target.className = "active";

            //change content
            if (event.target.textContent == "Manuální") {
                document.getElementById("parse-auto-block").style.display = "none";
                document.getElementById("parse-manu-block").style.display = "block";
                document.getElementById("parse-edit-block").style.display = "none";
                document.getElementById("parse-manu-block").getElementsByTagName("h1")[0].textContent = "Manuální vložení deníku";
            } else if (event.target.textContent == "Automatické") {
                document.getElementById("parse-auto-block").style.display = "block";
                document.getElementById("parse-manu-block").style.display = "none";
                document.getElementById("parse-edit-block").style.display = "none";
            } else {
                document.getElementById("parse-auto-block").style.display = "none";
                document.getElementById("parse-manu-block").style.display = "none";
                document.getElementById("parse-edit-block").style.display = "block";
                document.getElementById("parse-manu-block").getElementsByTagName("h1")[0].textContent = "Úprava deníku";
            }
            nullContent()
        }
    });


    /* AUTO PARSE ***************************************************************************************/
    //print article
    function printAutoArticle(block, article, count) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-classic');
        var jName = article.jrn;
        let per = (article.per === undefined) ? "" : article.per;
        var im = article.sim;
        if (im.length == 0) {
            im = "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + jName;
        }
        tag.innerHTML = '<img src="' + im + '" alt="img-' + jName + '">'
                        + '<div class="right-side">'
                        + '<div class="top-info">'
                        + '<a class="journal-link" href="' + article.jln + '">' + jName + '</a>'
                        + '</div>'
                        + '<h4><a href="' + article.lnk + '">' + article.tit + '</a></h4>'
                        + '<p>' + per + '</p>'
                        + '</div>';
        block.innerHTML = "<span>Bylo nalezeno: " + count + " článků</span>";
        block.appendChild(tag);
        block.innerHTML += '<div class="bottom-name"><div><span class="sample-name">Název deníku: </span>'
                            + '<input id="auto-name" type="text" autocomplete="off" spellcheck="false" value="' + jName + '"></div>'
                            + '<button id="save-auto">Uložit deník</button></div>';
    }
    //print auto sample
    function printAutoSample() {
        document.getElementById("parse-auto-sample").innerHTML = "";
        autoUrl = document.getElementById("auto-url").value.trim();
        var e = document.getElementById("auto-coding");
        autoCoding = e.options[e.selectedIndex].value;
        if (autoUrl.length > 0) {
            let btn = document.getElementById("auto-submit");
            btn.parentNode.removeChild(btn);
            toogle(document.getElementsByClassName("parse-auto-link")[0]);

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var response = JSON.parse(this.responseText);
                        if (isDefined(response.article) && isDefined(response.count)) {
                            if (Object.keys(response.article).length > 0) {
                                printAutoArticle(document.getElementById("parse-auto-sample"), response.article, response.count);
                                toogle(document.getElementsByClassName("parse-auto-link")[0]);
                                document.getElementsByClassName("parse-auto-link")[0].appendChild(btn);
            
                                //save sample
                                document.getElementById("save-auto").addEventListener("click", function(event) {
                                    let autoName = document.getElementById("auto-name").value.trim();
                                    if (autoName.length < 5) {
                                        alert("Název deníku musí mít délku minimálně 5 znaků.");
                                    } else if (!re.test(autoName)) {
                                        alert("Název musí obsahovat pouze písmena bez diakritiky, čísla, tečky a pomlčky.");
                                    } else if (autoName[0] === "." || autoName[0] === "-") {
                                        alert("Název musí začínat písmenem nebo číslem.");
                                    } else {
                                        //check exist name
                                        let tempName = autoName.slice(0);
                                        autoName = "parse-a-" + autoName;
                                        let attr = { url: autoUrl, cod: autoCoding };
                                        if (getFromStorage(autoName) !== null) {
                                            var r = confirm("Deník s tímto názvem již existuje.\nChcete tento deník nahradit?");
                                            if (r) {
                                                setInStorage(autoName, JSON.stringify(attr));
                                                var ntfs = JSON.parse(getFromStorage("notifications"));
                                                ntfs.push({ t: "Automatické parsování", m: "Deník s názvem " + tempName + " byl nahrazen." });
                                                setInStorage("notifications", JSON.stringify(ntfs));
                                                alert("Deník byl úspěšně uložen.\nStránka bude aktualizována.");
                                                window.location.reload();
                                              }
                                        } else {
                                            setInStorage(autoName, JSON.stringify(attr));
                                            var ntfs = JSON.parse(getFromStorage("notifications"));
                                            ntfs.push({ t: "Automatické parsování", m: "Deník s názvem " + tempName + " byl uložen." });
                                            setInStorage("notifications", JSON.stringify(ntfs));
                                            alert("Deník byl úspěšně uložen.\nStránka bude aktualizována.");
                                            window.location.reload();
                                        }
                                    }
                                });
                                
                            } else {
                                alert("Nebyl nalazen žádný článek.\nZkuste to prosím znovu");
                                toogle(document.getElementsByClassName("parse-auto-link")[0]);
                                document.getElementsByClassName("parse-auto-link")[0].appendChild(btn);
                            }
                        } else {
                            alert("Došlo k neznámě chybě.\nZkuste to prosím znovu.");
                            toogle(document.getElementsByClassName("parse-auto-link")[0]);
                            document.getElementsByClassName("parse-auto-link")[0].appendChild(btn);
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nZkuste to prosím znovu.");
                        toogle(document.getElementsByClassName("parse-auto-link")[0]);
                        document.getElementsByClassName("parse-auto-link")[0].appendChild(btn);
                    }
                }
            };
            xhttp.open("POST", originPage + '/get/sample/auto', true);
            xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhttp.send("link=" + autoUrl + "&coding=" + autoCoding);
        }
    }
    //click get auto sample
    document.getElementById("auto-submit").addEventListener("click", function(event) {
        event.preventDefault();
        printAutoSample();
        return false;
    });


    /* MANUAL PARSE *************************************************************************************/
    //convert html
    function convert(html) {
        html = html.replace(/>/g, "&gt;");
        html = html.replace(/</g, "&lt;");
        html = html.replace(/"/g, "&quot;");
        html = html.replace(/'/g, "&#039;");

        var htmlLength = html.length;
        for (let i = 0; i < htmlLength; i++) {
            if (html.substr(i, 4) == "&lt;") {
                var startIndex = i, endIndex = 0;
                var tempTag = "";
                for (let j = i + 4; j < htmlLength; j++) {
                    if (html[j] != " " && html.substr(j, 4) != "&gt;") {
                        tempTag += html[j];
                    } else {
                        break;
                    }
                }

                tempTag = tempTag.toLocaleLowerCase();
                if (allPairTags.indexOf(tempTag) !== -1) {
                    //find end tag
                    var tempCount = 0;
                    var tempStartTag = "&lt;" + tempTag, tempEndTag = "&lt;/" + tempTag;
                    var tempStartLength = tempStartTag.length, tempEndLength = tempStartLength + 1;
                    for (let j = i + 4 + tempTag.length; j < htmlLength; j++) {
                        if (html.substr(j, tempStartLength) == tempStartTag) {
                            tempCount++;
                        } else if (html.substr(j, tempEndLength) == tempEndTag) {
                            if (tempCount == 0) {
                                for (let k = j + tempEndLength; k < htmlLength; k++) {
                                    if (html.substr(k, 4) == "&gt;") {
                                        endIndex = k + 4;
                                        break;
                                    }
                                }
                                break;
                            } else {
                                tempCount--;
                            }
                        }
                    }
                } else if (allUnpairTags.indexOf(tempTag) != -1) {
                    for (let j = i + 4 + tempTag.length; j < htmlLength; j++) {
                        if (html.substr(j, 4) == "&gt;") {
                            endIndex = j + 4;
                            break;
                        }
                    }
                }

                if (endIndex > 0) {
                    //end
                    if (allUnpairTags.indexOf(tempTag) === -1) {
                        html = html.slice(0, endIndex) + "</b></span>" + html.slice(endIndex);
                        html = html.slice(0, endIndex - tempTag.length - 9) + "<b>" + html.slice(endIndex - tempTag.length - 9);
                        htmlLength += 13;
                    } else {
                        html = html.slice(0, endIndex) + "</span>" + html.slice(endIndex);
                        htmlLength += 7;
                    }
                    //start
                    if (allUnpairTags.indexOf(tempTag) === -1) {
                        let tin = html.substr(startIndex + tempTag.length + 4, 4) === "&gt;" ? 4 : 0;
                        html = html.slice(0, startIndex + tempTag.length + 4 + tin) + "</b>" + html.slice(startIndex + tempTag.length + 4 + tin);
                        html = html.slice(0, startIndex) + "<span><b>" + html.slice(startIndex);
                        htmlLength += 14 + tin;
                        i += 10;
                    } else {
                        html = html.slice(0, startIndex + tempTag.length + 4) + "</b>" + html.slice(startIndex + tempTag.length + 4);
                        html = html.slice(0, startIndex) + "<span><b>" + html.slice(startIndex);
                        htmlLength += 14;
                        i += 10;
                    }
                }
            }
        }
        return html;
    }
    //back convert html
    function backConvert(html) {
        html = html.split("&gt;").join(">");
        html = html.split("&lt;").join("<");
        html = html.split("&quot;").join('"');
        html = html.split("&#039;").join("'");
        return html;
    }
    //get attributtes
    function getAttr(html) {
        let startIndex = html.indexOf("<");
        let endIndex = html.indexOf(">");
        let obj = { tagname: "", attributes: new Array() };

        if (startIndex !== -1 && endIndex !== -1) {
            let elem = html.substring(startIndex + 1, endIndex).toLowerCase().trim();

            //name
            let ind = elem.indexOf(" ");
            obj.tagname = (ind !== -1) ? elem.substring(0, ind) : elem;

            if (ind !== -1) {
                elem = elem.substring(ind + 1).trim();
                let len = elem.length;
                let name = "", s = false, next = false;
                for (let i = 0; i < len; i++) {
                    if (elem[i] === "=") {
                        //got tag
                        name = name.trim();
                        let symb = "", symbStart = -1, symbEnd = -1;
                        for (let j = i + 1; j < len; j++) {
                            let el = elem[j];
                            if (el === '"' || el === "'") {
                                symb = el;
                                symbStart = j;
                                break;
                            }
                        }
                        if (symbStart === -1) {
                            break;
                        }
                        for (let j = symbStart + 1; j < len; j++) {
                            if (elem[j] === symb) {
                                symbEnd = j;
                                break;
                            }
                        }
                        if (symbEnd === -1) {
                            break;
                        }
                        obj.attributes.push(new Array(name, elem.substring(symbStart + 1, symbEnd).trim()));
                        
                        name = "";
                        s = false; next = false;
                        i = symbEnd + 1;
                    } else {
                        if (!s) {
                            if (isLetter(elem[i])) {
                                s = true;
                            }
                        }
                        if (s) {
                            if (elem[i] === " ") {
                                next = true;
                            } else if (isLetter(elem[i])) {
                                if (next) {
                                    obj.attributes.push(new Array(name.trim(), ""));
                                    name = elem[i];
                                    s = false; next = false;
                                } else {
                                    name += elem[i];
                                }
                            } else {
                                name += elem[i];
                            }
                        }
                    }
                }
            }

        }


        return obj;
    }
    //get text to sample form
    function toSample(specialhtml) {
        manuSampSelc = "", manuSampAttr = new Array();

        //own function
        let temp = getAttr(specialhtml);
        attributes = temp.attributes;
        tagName = temp.tagname;

        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i][0] == "id") {
                if (attributes[i][1].length > 0) {
                    tagName += "#" + attributes[i][1];
                }
            } else if (attributes[i][0] == "class") {
                if (attributes[i][1].length > 0) {
                    let temp = attributes[i][1].split(" ");
                    for (let j = 0; j < temp.length; j++) {
                        if (temp[j].trim().length > 0) {
                            tagName += "." + temp[j];
                        }
                    }
                }
            } else {
                manuSampAttr.push(attributes[i][0]);
            }
        }
        
        if (tagName.trim().length > 0) {
            manuSampSelc = tagName.trim();
        } else {
            manuSampAttr = new Array();
        }
        
        //set sample selector
        document.getElementById("sample-select").value = manuSampSelc;
        if (manuSampSelc.length > 0) {
            document.getElementById("manu-select-submit").classList.remove("disabled");
        } else {
            document.getElementById("manu-select-submit").classList.add("disabled");
        }

        //set sample attributes
        var s = document.getElementById("sample-attrs");
        s.innerHTML = '<option value="1" selected>atribut</option>';
        if (manuSampSelc.substring(0, 3) != "img") {
            s.innerHTML += '\n<option>text</option>';
        }
        for (let i = 0; i < manuSampAttr.length; i++) {
            s.innerHTML += '<option>' + manuSampAttr[i] + '</option>';
        }
    }
    //hover on html
    function sampleOver(event) {
        event.stopPropagation();
        if (event.target.nodeName === "B") {
            event.target.parentNode.style.backgroundColor = "rgba(10, 168, 158, 0.6)";
        } else {
            event.target.style.backgroundColor = "rgba(10, 168, 158, 0.6)";
        }
    }
    function sampleOut(event) {
        event.stopPropagation();
        if (event.target.nodeName === "B") {
            event.target.parentNode.style.backgroundColor = "transparent";
        } else {
            event.target.style.backgroundColor = "transparent";
        }
    }
    //click on html
    function sampleClick(event) {
        event.stopPropagation();
        var ss = document.getElementById("sample-html").getElementsByClassName("slc");
        for (let i = 0; i < ss.length; i++) {
            ss[i].classList.remove("slc");
        }
        if (event.target.nodeName === "B") {
            event.target.parentNode.classList.add("slc");
            toSample(backConvert(event.target.parentNode.textContent.split("<b>").join("").split("</b>").join("")));
        } else {
            event.target.classList.add("slc");
            toSample(backConvert(event.target.textContent.split("<b>").join("").split("</b>").join("")));
        }
    }
    //get auto sample to manual sample
    function getFirstSample(btn) {
        var xhtt = new XMLHttpRequest();
        xhtt.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.article)) {
                        if (Object.keys(response.article).length > 0) {
                            var article = response.article;
                            var rows = document.getElementById("manual-form").getElementsByClassName("row");
                            rows[0].getElementsByTagName("input")[0].value = article.sel;
                            rows[1].getElementsByTagName("input")[0].value = article.tag;
                            rows[1].getElementsByTagName("input")[1].value = "text";
    
                            //next with check
                            if (article.per.length > 0) {
                                rows[2].getElementsByTagName("input")[0].value = "p";
                                rows[2].getElementsByTagName("input")[1].value = "text";
                            }
                            if (article.sim.length > 0) {
                                rows[4].getElementsByTagName("input")[0].value = "img";
                                rows[4].getElementsByTagName("input")[1].value = "src";
                            }
                            if (article.lnk.length > 0) {
                                if (article.int) {
                                    rows[5].getElementsByTagName("input")[0].value = article.tag + " a";
                                    rows[5].getElementsByTagName("input")[1].value = "href";
                                } else {
                                    rows[5].getElementsByTagName("input")[0].value = "a";
                                    rows[5].getElementsByTagName("input")[1].value = "href";
                                }
                            }
                            document.getElementById("manual-cont-block").style.display = "grid";
                            document.getElementsByClassName("parse-manu-link")[0].style.display = "none";
            
                            //toogle
                            toogle(document.getElementsByClassName("parse-manu-link")[0]);
                            document.getElementsByClassName("parse-manu-link")[0].appendChild(btn);
                        } else {
                            alert("Nepodařilo se stáhnout žádný článek.");
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                }
            }
        };
        xhtt.open("POST", originPage + '/get/sample/auto', true);
        xhtt.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhtt.send("link=" + manuUrl + "&coding=" + manuCoding);
    }
    //get edit values from journal
    function getEditSample(btn) {
        if (storageIndex > -1) {
            let params = storageArray[storageIndex].param;
            
            document.getElementById("i1").value = params.sel;
            
            document.getElementById("i2").value = params.tit[0];
            document.getElementById("i222").value = params.tit[1];

            document.getElementById("i3").value = params.per[0];
            document.getElementById("i333").value = params.per[1];

            document.getElementById("i4").value = params.dat[0];
            document.getElementById("i444").value = params.dat[1];

            document.getElementById("i5").value = params.sim[0];
            document.getElementById("i555").value = params.sim[1];

            document.getElementById("i6").value = params.lnk[0];
            document.getElementById("i666").value = params.lnk[1];

            //toogle
            toogle(document.getElementsByClassName("parse-edit-link-2")[0]);
            document.getElementsByClassName("parse-edit-link-2")[0].appendChild(btn);
                        
            document.getElementById("parse-edit-block").style.display = "none";
            document.getElementById("parse-manu-block").style.display = "block";

            document.getElementsByClassName("parse-manu-link")[0].style.display = "none";
            document.getElementById("manual-cont-block").style.display = "grid";
        }
    }
    //get html
    function getHtml(edit) {
        if (!edit) {
            manuUrl = document.getElementById("manu-url").value.trim();
            var e = document.getElementById("manu-coding");
            manuCoding = e.options[e.selectedIndex].value;
        } else {
            manuUrl = document.getElementById("edit-url").value.trim();
            var e = document.getElementById("edit-coding");
            manuCoding = e.options[e.selectedIndex].value;
        }
        
        if (manuUrl.length > 0) {
            let btn;
            if (!edit) {
                btn = document.getElementById("manu-submit");
                btn.parentNode.removeChild(btn);
                toogle(document.getElementsByClassName("parse-manu-link")[0]);
            } else {
                btn = document.getElementById("edit-submit-2");
                btn.parentNode.removeChild(btn);
                toogle(document.getElementsByClassName("parse-edit-link-2")[0]);
            }

            var xhttps = new XMLHttpRequest();
            xhttps.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var response = JSON.parse(this.responseText);
                        if (isDefined(response.html)) {
                            if (response.html.length > 0) {
                                document.getElementById("sample-html").innerHTML = convert(response.html);
            
                                var spans = document.getElementById("sample-html").getElementsByTagName("span");
                                for (let i = 0; i < spans.length; i++) {
                                    spans[i].addEventListener("mouseover", sampleOver);
                                    spans[i].addEventListener("mouseout", sampleOut);
                                    spans[i].addEventListener("click", sampleClick);
                                }
                                if (!edit) {
                                    getFirstSample(btn);
                                } else {
                                    getEditSample(btn);
                                }
                            } else {
                                alert("Nepodařilo se stáhnout zdrojový kód stránky.\nAktualizujte prosím stránku.");
                            }
                        } else {
                            alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                        }
                    } else {
                        alert("Došlo k neznámě chybě.\nAktualizujte prosím stránku.");
                    }
                }
            };
            xhttps.open("POST", originPage + '/get/html', true);
            xhttps.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhttps.send("link=" + manuUrl + "&coding=" + manuCoding);
        }
    }
    //sample to array
    function sampleToArray() {
        //get data
        var e = document.getElementById("sample-type");
        var samTyp = parseInt(e.options[e.selectedIndex].value);
        var samSel = document.getElementById("sample-select").value;
        e = document.getElementById("sample-attrs");
        var samAtr = e.options[e.selectedIndex].text;

        //transfer to array
        var row = document.getElementById("manual-form").getElementsByClassName("row")[samTyp];
        var ins = row.getElementsByTagName("input");
        ins[0].value = samSel;
        if (ins.length > 1) {
            var sa = samAtr == "atribut" ? "" : samAtr;
            ins[1].value = sa;
        }
    }
    //print article
    function printManualArticle(block, article, count) {
        var tag = document.createElement("article");
        tag.setAttribute('class', 'article-classic');
        var jName = article.jrn;
        //edit name
        if (storageIndex !== -1) {
            jName = storageArray[storageIndex].name;
        }

        let per = (article.per === undefined) ? "" : article.per;
        var im = article.sim;
        if (im.length == 0) {
            im = "https://dummyimage.com/208x128/03a9f4/fff.png&text=" + jName;
        }
        tag.innerHTML = '<img src="' + im + '" alt="icon-' + jName + '">'
                        + '<div class="right-side">'
                        + '<div class="top-info">'
                        + '<a class="journal-link" href="' + article.jln + '">' + jName + '</a>'
                        + '</div>'
                        + '<h4><a href="' + article.lnk + '">' + article.tit + '</a></h4>'
                        + '<p>' + per + '</p>'
                        + '</div>';
        
        if (article.dat !== undefined) {
            if (article.dat.length > 0) {
                tag.getElementsByClassName("top-info")[0].innerHTML += '<span class="date">' + article.dat + '</span>';
            }
        }
        

        block.innerHTML = "<span>Bylo nalezeno: " + count + " článků</span>";
        block.appendChild(tag);
        block.innerHTML += '<div class="bottom-name"><div><span class="sample-name">Název deníku: </span>'
                        + '<input id="manu-name" maxlength="25" type="text" autocomplete="off" spellcheck="false" value="' + jName + '"></div>'
                        + '<button id="save-manu-2">Uložit deník</button></div>';

         //save manual journal
        document.getElementById("save-manu-2").addEventListener("click", function(event) {
            let manuName = document.getElementById("manu-name").value.trim();
            if (manuName.length < 5) {
                alert("Název deníku musí mít délku minimálně 5 znaků.");
            } else if (!re.test(manuName)) {
                alert("Název musí obsahovat pouze písmena bez diakritiky, čísla, tečky a pomlčky.");
            } else if (manuName[0] === "." || manuName[0] === "-") {
                alert("Název musí začínat písmenem nebo číslem.");
            } else {
                //check exist name
                let tempName = manuName.slice(0).toLocaleLowerCase();
                manuName = "parse-m-" + manuName;

                //get all attributtes
                var attr = {};
                attr.url = manuUrl;
                attr.sel = document.getElementById("i1").value.trim();
                var e = document.getElementById("i2");
                attr.tit = new Array(e.value, e.nextElementSibling.value);
                e = document.getElementById("i3");
                attr.per = new Array(e.value, e.nextElementSibling.value);
                e = document.getElementById("i4");
                attr.dat = new Array(e.value, e.nextElementSibling.value);
                e = document.getElementById("i5");
                attr.sim = new Array(e.value, e.nextElementSibling.value);
                e = document.getElementById("i6");
                attr.lnk = new Array(e.value, e.nextElementSibling.value);
                attr.cod = manuCoding;

                if (getFromStorage(manuName) !== null) {
                    var r;
                    if (storageIndex !== -1) {
                        if (storageArray[storageIndex].name.toLocaleLowerCase() === tempName) {
                            var r = confirm("Chcete aktualizovat tento deník?");
                        } else {
                            var r = confirm("Deník s tímto názvem již existuje.\nChcete tento deník nahradit?");
                        }
                    } else {
                        r = confirm("Deník s tímto názvem již existuje.\nChcete tento deník nahradit?");
                    }
                    if (r) {
                        setInStorage(manuName, JSON.stringify(attr));
                        var ntfs = JSON.parse(getFromStorage("notifications"));
                        ntfs.push({ t: "Manuální parsování", m: "Deník s názvem " + tempName + " byl nahrazen." });
                        setInStorage("notifications", JSON.stringify(ntfs));
                        alert("Deník byl úspěšně uložen.\nStránka bude aktualizována.");
                        window.location.reload();
                    }
                } else {
                    if (storageIndex !== -1) {
                        removeFromStorage("parse-m-" + storageArray[storageIndex].name);
                    }
                    setInStorage(manuName, JSON.stringify(attr));
                    var ntfs = JSON.parse(getFromStorage("notifications"));
                    ntfs.push({ t: "Manuální parsování", m: "Deník s názvem " + tempName + " byl uložen." });
                    setInStorage("notifications", JSON.stringify(ntfs));
                    alert("Deník byl úspěšně uložen.\nStránka bude aktualizována.");
                    window.location.reload();
                }
            }
        });
    }
    //print manual sample
    function printManualSample() {
        //get all attributtes
        var attr = {};
        attr.url = manuUrl;
        attr.sel = document.getElementById("i1").value.trim();
        var e = document.getElementById("i2");
        attr.tit = new Array(e.value, e.nextElementSibling.value);
        e = document.getElementById("i3");
        attr.per = new Array(e.value, e.nextElementSibling.value);
        e = document.getElementById("i4");
        attr.dat = new Array(e.value, e.nextElementSibling.value);
        e = document.getElementById("i5");
        attr.sim = new Array(e.value, e.nextElementSibling.value);
        e = document.getElementById("i6");
        attr.lnk = new Array(e.value, e.nextElementSibling.value);
        attr.cod = manuCoding;

        document.getElementById("parse-manu-sample").innerHTML = "";
        toogle(document.getElementById("parse-manu-sample"));

        //call manual sample
        var xht = new XMLHttpRequest();
        xht.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    if (isDefined(response.article) && isDefined(response.count)) {
                        printManualArticle(document.getElementById("parse-manu-sample"), response.article, response.count);
                    } else {
                        alert("Došlo k neznámě chybě.\nZkuste to prosím znovu.");
                        toogle(document.getElementById("parse-manu-sample"));
                    }
                } else {
                    alert("Došlo k neznámě chybě.\nZkuste to prosím znovu.");
                    toogle(document.getElementById("parse-manu-sample"));
                }
            }
        };
        xht.open("POST", originPage + '/get/sample/manual', true);
        xht.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xht.send("params=" + JSON.stringify(attr));
    }
    
    //click get manual html
    document.getElementById("manu-submit").addEventListener("click", function(event) {
        event.preventDefault();
        getHtml(false);
        return false;
    });
    //click sample to array
    document.getElementById("manu-select-submit").addEventListener("click", function(event) {
        event.preventDefault();
        sampleToArray();
        return false;
    });
    //get manual sample
    document.getElementById("get-manual").addEventListener("click", function(event) {
        event.preventDefault();
        printManualSample();
        return false;
    });


    /* EDIT PARSE **************************************************************************************/
    //load manu journals
    let itms;
    if (isLocalStorage) {
        itms = Object.keys(localStorage);
    } else if (isSessionStorage) {
        itms = Object.keys(sessionStorage);
    } else {
        alert("Váš prohlížeč neumožňuje používat Web Storage.");
    }
    for (let i = 0; i < itms.length; i++) {
        if (itms[i].indexOf("parse-m-") !== -1) {
            let param = getFromStorage(itms[i]);
            if (param !== null) {
                storageArray.push({ name: itms[i].substring(8), param: JSON.parse(param) });
            }
        }
    }
    if (storageArray.length > 0) {
        for (let i = 0; i < storageArray.length; i++) {
            document.getElementById("edit-jrn").innerHTML += '<option value="' + i + '">' + storageArray[i].name + '</option>';
        }
    } else {
        document.getElementById("edit-jrn").innerHTML = '<option value="-1">Žádné deníky</option>';
    }

    //load journal
    var sel1 = document.getElementById("edit-jrn");

    //choose edit journal
    document.getElementById("edit-submit").addEventListener("click", function(e) {
        e.preventDefault();

        let opt = parseInt(sel1.options[sel1.selectedIndex].value);
        if (opt > -1) {
            let par = storageArray[opt].param;
            manuUrl = par.url, manuCoding = par.cod, storageIndex = opt;
            
            //set params part 1
            document.getElementById("edit-url").value = manuUrl;
            let doct = document.getElementById("edit-coding").getElementsByTagName("option");
            for (let i = 0; i < doct.length; i++) {
                if (doct[i].value === manuCoding) {
                    doct[i].selected = true;
                    break;
                }
            }
    
            document.getElementsByClassName("parse-edit-link-2")[0].style.display = "grid";
        }
        return false;
    });

    //paste params
    document.getElementById("edit-submit-2").addEventListener("click", function(e) {
        e.preventDefault();
        getHtml(true);
        return false;
    });

    //help
    document.getElementById("help").addEventListener("click", function(e) {
        document.getElementById("help-block").style.right = "0";
    });
    document.getElementsByClassName("help-cls")[0].addEventListener("click", function(e) {
        document.getElementById("help-block").style.right = "-999em";
    });
});