var preview = document.getElementById("websitepreview");
var jseditor = document.getElementById("jseditor");
var togglemode = document.getElementById("togglemodebutton");
var itemsbar = document.getElementById("itemssidebar");
var navbar = document.getElementById("navigationbar");
var previewjs = document.getElementById("websitepreviewjs");
var jseditorcode = document.getElementById("jscode");

"use strict";const HtmlSanitizer=new function(){const e={A:!0,ABBR:!0,B:!0,BLOCKQUOTE:!0,BODY:!0,BR:!0,CENTER:!0,CODE:!0,DD:!0,DIV:!0,DL:!0,DT:!0,EM:!0,FONT:!0,H1:!0,H2:!0,H3:!0,H4:!0,H5:!0,H6:!0,HR:!0,I:!0,IMG:!0,LABEL:!0,LI:!0,OL:!0,P:!0,PRE:!0,SMALL:!0,SOURCE:!0,SPAN:!0,STRONG:!0,SUB:!0,SUP:!0,TABLE:!0,TBODY:!0,TR:!0,TD:!0,TH:!0,THEAD:!0,UL:!0,U:!0,VIDEO:!0},t={FORM:!0,"GOOGLE-SHEETS-HTML-ORIGIN":!0},n={align:!0,color:!0,controls:!0,height:!0,href:!0,id:!0,src:!0,style:!0,target:!0,title:!0,type:!0,width:!0},r={"background-color":!0,color:!0,"font-size":!0,"font-weight":!0,"text-align":!0,"text-decoration":!0,width:!0},l=["http:","https:","data:","m-files:","file:","ftp:","mailto:","pw:"],i={href:!0,action:!0},a=new DOMParser;function o(e,t){for(let n=0;n<t.length;n++)if(0==e.indexOf(t[n]))return!0;return!1}this.SanitizeHtml=function(s,d){if(""==(s=s.trim()))return"";if("<br>"==s)return"";-1==s.indexOf("<body")&&(s="<body>"+s+"</body>");let m=a.parseFromString(s,"text/html");"BODY"!==m.body.tagName&&m.body.remove(),"function"!=typeof m.createElement&&m.createElement.remove();let c=function a(s){let c;if(s.nodeType==Node.TEXT_NODE)c=s.cloneNode(!0);else if(s.nodeType==Node.ELEMENT_NODE&&(e[s.tagName]||t[s.tagName]||d&&s.matches(d))){c=t[s.tagName]?m.createElement("DIV"):m.createElement(s.tagName);for(let e=0;e<s.attributes.length;e++){let t=s.attributes[e];if(n[t.name])if("style"==t.name)for(let e=0;e<s.style.length;e++){let t=s.style[e];r[t]&&c.style.setProperty(t,s.style.getPropertyValue(t))}else{if(i[t.name]&&t.value.indexOf(":")>-1&&!o(t.value,l))continue;c.setAttribute(t.name,t.value)}}for(let e=0;e<s.childNodes.length;e++){let t=a(s.childNodes[e]);c.appendChild(t,!1)}if(("SPAN"==c.tagName||"B"==c.tagName||"I"==c.tagName||"U"==c.tagName)&&""==c.innerHTML.trim())return m.createDocumentFragment()}else c=m.createDocumentFragment();return c}(m.body);return c.innerHTML.replace(/<br[^>]*>(\S)/g,"<br>\n$1").replace(/div><div/g,"div>\n<div")},this.AllowedTags=e,this.AllowedAttributes=n,this.AllowedCssStyles=r,this.AllowedSchemas=l};

$(document).ready(function() {
    $("#websitepreview").sortable();
    $("#websitepreview").disableSelection();
    $("button").button();
    $(".button").button();
    $(document).tooltip();

    let urlParams = new URLSearchParams(window.location.search);
    let sitecontent = urlParams.get('sitecontent');
    urlParams.delete('sitecontent');

    let newUrl = window.location.origin + window.location.pathname + '?' + urlParams.toString();
    window.history.replaceState(null, '', newUrl);
    preview.innerHTML = HtmlSanitizer.SanitizeHtml(sitecontent);
});

if (!localStorage.getItem("setupCompleted")) {
    location.assign("config/index.html");
};

function switchCategory() {
    var selectedCategory = document.getElementById("categoryDropdown").value;
    var categories = document.getElementsByClassName("category");
    for (var i = 0; i < categories.length; i++) {
        categories[i].style.display = "none";
    }
    document.getElementById(selectedCategory + "Elements").style.display = "block";
}

function updateSettings() {
    var bgColor = HtmlSanitizer.SanitizeHtml(document.getElementById("bgColor").value);
    var mainColor = HtmlSanitizer.SanitizeHtml(document.getElementById("mainColor").value);
    var siteTitle = HtmlSanitizer.SanitizeHtml(document.getElementById("siteTitle").value);

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = mainColor;
    document.title = siteTitle;
}

function save() {
    if(preview.innerHTML) {
        showPrompt("Enter the site's name below:", function(input) {
            input = HtmlSanitizer.SanitizeHtml(input);
            save2(input);
        });
    } else {
        showAlert("Error: no items added to the website.")
    }
    
    function save2(input) {
        let sites = JSON.parse(localStorage.getItem("sites")) || [];
        const siteExists = sites.some(site => site[0] === input);
    
        if (!siteExists) {
            sites.push([input, preview.innerHTML]);
    
            localStorage.setItem("sites", JSON.stringify(sites));
    
            console.log(`Site '${input}' added successfully.`);
        } else {
            console.log(`Site '${input}' already exists.`);
        }
    }
}

function showAlert(message) {
    $("#alertMessage").text(message);
    $("#alertDialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function showConfirm(message, callback) {
    $("#confirmMessage").text(message);
    $("#confirmDialog").dialog({
        modal: true,
        buttons: {
            Yes: function() {
                $(this).dialog("close");
                callback(true);
            },
            No: function() {
                $(this).dialog("close");
                callback(false);
            }
        }
    });
}

function showPrompt(message, callback) {
    $("#promptMessage").text(message);

    $("#promptInput").val('');
    $("#promptDialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                var input = $("#promptInput").val();
                input = HtmlSanitizer.SanitizeHtml(input);
                $(this).dialog("close");
                callback(input);
            },
            Cancel: function() {
                $(this).dialog("close");
                callback(null);
            }
        }
    });
}

function deleteItem() {
    if (preview.innerHTML != "") {
        showPrompt("Name: ", function(name) {
            name = HtmlSanitizer.SanitizeHtml(name);
            if (name) {
                var item = document.getElementById(name);
                if (item) {
                    showConfirm("Are you sure to delete that item?", function(confirm1) {
                        if (confirm1) {
                            preview.removeChild(item);
                        }
                    });
                } else {
                    showAlert("Error: That item does not exist.");
                }
            }
        });
    } else {
        showAlert("Error: no items added to the website.");
    }
}

function exportToHTML() {
    if (preview.innerHTML) {
        const htmlContent = `<!DOCTYPE html>
        <!-- Built using WebBuild -->
        <!-- https://fiftys7vencode.github.io/webbuild -->
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"
            >
            <title>Website</title>
        </head>
        <body class="has-text-centered" style="background-color: ${document.body.style.backgroundColor}; color: ${document.body.style.color};">
            ${preview.innerHTML}
        </body>
        </html>`;
        
        const encodedHtml = encodeURIComponent(htmlContent);
        const dataUri = `data:text/plain;charset=utf-8,${encodedHtml}`;
        const newWindow = window.open();
        newWindow.document.write(`<style>body{font-family:sans-serif;text-align:center;}</style> <title>Export to HTML</title> <h1>Export to HTML</h1> <p>Your exported HTML code is written below.</p> <iframe src="${dataUri}" frameborder="0" style="border:none; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
        showAlert("Error: no items added to the website.");
    }
}

function saveCode() {
    previewjs.innerHTML = jseditorcode.value;
}

function editSetting() {
    showPrompt("Name: ", function(name) {
        name = HtmlSanitizer.SanitizeHtml(name);
        if (name) {
            showPrompt("Setting (Property): ", function(setting) {
                setting = HtmlSanitizer.SanitizeHtml(setting);
                if (setting) {
                    showPrompt("Setting (Property) new value: ", function(settingValue) {
                        settingValue = HtmlSanitizer.SanitizeHtml(settingValue);
                        if (settingValue) {
                            document.getElementById(name)[setting] = settingValue;
                        }
                    });
                }
            });
        }
    });
}

function addItem(item) {
    showConfirm("Are you sure to add a " + item + "?", function(confirm1) {
        if (confirm1) {
            switch(item) {
                case "heading1":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Text: ", function(text) {
                            text = HtmlSanitizer.SanitizeHtml(text);
                            var element = document.createElement("h1");
                            element.id = name;
                            element.innerText = text;
                            element.classList.add("title");
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "heading2":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Text: ", function(text) {
                            text = HtmlSanitizer.SanitizeHtml(text);
                            var element = document.createElement("h2");
                            element.id = name;
                            element.innerText = text;
                            element.classList.add("subtitle");
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "text":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Text: ", function(text) {
                            text = HtmlSanitizer.SanitizeHtml(text);
                            var element = document.createElement("p");
                            element.id = name;
                            element.innerText = text;
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "link":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Text: ", function(text) {
                            text = HtmlSanitizer.SanitizeHtml(text);
                            showPrompt("Link: ", function(link) {
                                link = HtmlSanitizer.SanitizeHtml(link);
                                var element = document.createElement("p");
                                element.id = name;
                                var linkElement = document.createElement("a");
                                linkElement.innerText = text;
                                linkElement.href = link;
                                linkElement.target = "_blank";
                                element.appendChild(linkElement);
                                preview.appendChild(element);
                            });
                        });
                    });
                    break;
                case "button":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Text: ", function(text) {
                            text = HtmlSanitizer.SanitizeHtml(text);
                            showPrompt("Link: ", function(link) {
                                link = HtmlSanitizer.SanitizeHtml(link);
                                var buttonElement = document.createElement("a");
                                buttonElement.id = name;
                                buttonElement.innerText = text;
                                buttonElement.href = link;
                                buttonElement.target = "_blank";
                                buttonElement.classList.add("button");
                                preview.appendChild(buttonElement);
                                });
                            });
                    });                    
                    break;
                case "inputfield":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Placeholder: ", function(placeholder) {
                            placeholder = HtmlSanitizer.SanitizeHtml(placeholder);
                            var element = document.createElement("input");
                            element.id = name;
                            element.placeholder = placeholder;
                            element.classList.add("input");
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "inputbox":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Placeholder: ", function(placeholder) {
                            placeholder = HtmlSanitizer.SanitizeHtml(placeholder);
                            var element = document.createElement("textarea");
                            element.id = name;
                            element.placeholder = placeholder;
                            element.classList.add("textarea");
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "footer":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Copyright notice (use &copy; for the copyright sign): ", function(copyrightnotice) {
                            copyrightnotice = HtmlSanitizer.SanitizeHtml(copyrightnotice);
                            var element = document.createElement("footer");
                            element.id = name;
                            element.innerText = copyrightnotice;
                            element.classList.add("footer");
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "separator":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        var element = document.createElement("hr");
                        element.id = name;
                        preview.appendChild(element);
                    });
                    break;
                case "table":
                    showAlert("it is broken, sorry :(");
                    break;
                case "image":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Image URL: ", function(image) {
                            image = HtmlSanitizer.SanitizeHtml(image);
                            showPrompt("Image width: ", function(width) {
                                width = HtmlSanitizer.SanitizeHtml(width);
                                showPrompt("Image height: ", function(height) {
                                    height = HtmlSanitizer.SanitizeHtml(height);
                                    var element = document.createElement("img");
                                    element.id = name;
                                    element.src = image;
                                    element.width = width;
                                    element.height = height;
                                    preview.appendChild(element);
                                });
                            });
                        });
                    });
                    break;
                case "websiteembed":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Website URL: ", function(website) {
                            website = HtmlSanitizer.SanitizeHtml(website);
                            var element = document.createElement("iframe");
                            element.id = name;
                            element.frameborder = "0px";
                            element.src = website;
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "customhtml":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Custom HTML: ", function(html) {
                            html = HtmlSanitizer.SanitizeHtml(html);
                            var element = document.createElement("div");
                            element.id = name;
                            element.innerHTML = html;
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "checkbox":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Label: ", function(label) {
                            label = HtmlSanitizer.SanitizeHtml(label);
                            var element = document.createElement("div");
                            element.id = name;
                            var labelElement = document.createElement("label");
                            labelElement.classList.add("checkbox");
                            var input = document.createElement("input");
                            input.type = "checkbox";
                            labelElement.insertBefore(input, labelElement.firstChild);
                            labelElement.appendChild(document.createTextNode(label));
                            element.appendChild(labelElement);
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "card":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Title: ", function(title) {
                            title = HtmlSanitizer.SanitizeHtml(title);
                            showPrompt("Content (You can use HTML): ", function(content) {
                                content = HtmlSanitizer.SanitizeHtml(content);
                                var element = document.createElement("div");
                                element.id = name;
                                element.classList.add("card");
                                var titleElement = document.createElement("h1");
                                titleElement.innerText = title;
                                titleElement.classList.add("title");
                                var contentElement = document.createElement("p");
                                contentElement.innerText = content;
                                element.appendChild(titleElement);
                                element.appendChild(contentElement);
                                preview.appendChild(element);
                            });
                        });
                    });
                    break;
                case "progressbar":
                    showPrompt("Name: ", function(name) {
                        name = HtmlSanitizer.SanitizeHtml(name);
                        showPrompt("Amount (set to 0 if you want an animation to play): ", function(amount) {
                            amount = HtmlSanitizer.SanitizeHtml(amount);
                            var element = document.createElement("progress");
                            element.id = name;
                            element.max = 100;
                            if (amount != 0) {
                                element.value = amount;
                            }
                            element.classList.add("progress");
                            preview.appendChild(element);
                        });
                    });
                    break;
            }
        }
    });
}