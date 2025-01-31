var preview = document.getElementById("websitepreview");
var jseditor = document.getElementById("jseditor");
var togglemode = document.getElementById("togglemodebutton");
var itemsbar = document.getElementById("itemssidebar");
var navbar = document.getElementById("navigationbar");
var previewjs = document.getElementById("websitepreviewjs");
var jseditorcode = document.getElementById("jscode");

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
    preview.innerHTML = sitecontent;
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

function save() {
    if(preview.innerHTML) {
        showPrompt("Enter the site's name below:", save2);
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
        <body class="has-text-centered">
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
        if (name) {
            showPrompt("Setting (Property): ", function(setting) {
                if (setting) {
                    showPrompt("Setting (Property) new value: ", function(settingValue) {
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
                        showPrompt("Text: ", function(text) {
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
                        showPrompt("Text: ", function(text) {
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
                        showPrompt("Text: ", function(text) {
                            var element = document.createElement("p");
                            element.id = name;
                            element.innerText = text;
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "link":
                    showPrompt("Name: ", function(name) {
                        showPrompt("Text: ", function(text) {
                            showPrompt("Link: ", function(link) {
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
                        showPrompt("Text: ", function(text) {
                            showPrompt("Link: ", function(link) {
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
                        showPrompt("Placeholder: ", function(placeholder) {
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
                        showPrompt("Placeholder: ", function(placeholder) {
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
                        showPrompt("Copyright notice (use &copy; for the copyright sign): ", function(copyrightnotice) {
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
                        showPrompt("Image URL: ", function(image) {
                            showPrompt("Image width: ", function(width) {
                                showPrompt("Image height: ", function(height) {
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
                        showPrompt("Website URL: ", function(website) {
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
                        showPrompt("Custom HTML: ", function(html) {
                            var element = document.createElement("div");
                            element.id = name;
                            element.innerHTML = html;
                            preview.appendChild(element);
                        });
                    });
                    break;
                case "checkbox":
                    showPrompt("Name: ", function(name) {
                        showPrompt("Label: ", function(label) {
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
                        showPrompt("Title: ", function(title) {
                            showPrompt("Content (You can use HTML): ", function(content) {
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
                        showPrompt("Amount (set to 0 if you want an animation to play): ", function(amount) {
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