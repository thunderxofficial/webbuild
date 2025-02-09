"use strict";

/* -----------------------------------------
   Sanitizer Code (Provided – do not modify)
-----------------------------------------*/
const HtmlSanitizer = new function () {
  const e = {
      A: !0, ABBR: !0, B: !0, BLOCKQUOTE: !0, BODY: !0, BR: !0, CENTER: !0,
      CODE: !0, DD: !0, DIV: !0, DL: !0, DT: !0, EM: !0, FONT: !0, H1: !0,
      H2: !0, H3: !0, H4: !0, H5: !0, H6: !0, HR: !0, I: !0, IMG: !0,
      LABEL: !0, LI: !0, OL: !0, P: !0, PRE: !0, SMALL: !0, SOURCE: !0,
      SPAN: !0, STRONG: !0, SUB: !0, SUP: !0, TABLE: !0, TBODY: !0, TR: !0,
      TD: !0, TH: !0, THEAD: !0, UL: !0, U: !0, VIDEO: !0
    },
    t = { FORM: !0, "GOOGLE-SHEETS-HTML-ORIGIN": !0 },
    n = {
      align: !0, color: !0, controls: !0, height: !0, href: !0,
      id: !0, src: !0, style: !0, target: !0, title: !0,
      type: !0, width: !0
    },
    r = {
      "background-color": !0, color: !0, "font-size": !0,
      "font-weight": !0, "text-align": !0, "text-decoration": !0, width: !0
    },
    l = ["http:", "https:", "data:", "m-files:", "file:", "ftp:", "mailto:", "pw:"],
    i = { href: !0, action: !0 },
    a = new DOMParser;
  function o(e, t) {
    for (let n = 0; n < t.length; n++) if (0 == e.indexOf(t[n])) return !0;
    return !1;
  }
  this.SanitizeHtml = function (s, d) {
    if ("" == (s = s.trim())) return "";
    if ("<br>" == s) return "";
    -1 == s.indexOf("<body") && (s = "<body>" + s + "</body>");
    let m = a.parseFromString(s, "text/html");
    "BODY" !== m.body.tagName && m.body.remove();
    "function" != typeof m.createElement && m.createElement.remove();
    let c = (function a(s) {
      let c;
      if (s.nodeType == Node.TEXT_NODE) c = s.cloneNode(!0);
      else if (
        s.nodeType == Node.ELEMENT_NODE &&
        (e[s.tagName] || t[s.tagName] || (d && s.matches(d)))
      ) {
        c = t[s.tagName] ? m.createElement("DIV") : m.createElement(s.tagName);
        for (let e = 0; e < s.attributes.length; e++) {
          let t = s.attributes[e];
          if (n[t.name])
            if ("style" == t.name)
              for (let e = 0; e < s.style.length; e++) {
                let t = s.style[e];
                r[t] && c.style.setProperty(t, s.style.getPropertyValue(t));
              }
            else {
              if (
                i[t.name] &&
                t.value.indexOf(":") > -1 &&
                !o(t.value, l)
              )
                continue;
              c.setAttribute(t.name, t.value);
            }
        }
        for (let e = 0; e < s.childNodes.length; e++) {
          let t = a(s.childNodes[e]);
          c.appendChild(t, !1);
        }
        if (
          ("SPAN" == c.tagName ||
            "B" == c.tagName ||
            "I" == c.tagName ||
            "U" == c.tagName) &&
          "" == c.innerHTML.trim()
        )
          return m.createDocumentFragment();
      } else c = m.createDocumentFragment();
      return c;
    })(m.body);
    return c.innerHTML
      .replace(/<br[^>]*>(\S)/g, "<br>\n$1")
      .replace(/div><div/g, "div>\n<div");
  };
  this.AllowedTags = e;
  this.AllowedAttributes = n;
  this.AllowedCssStyles = r;
  this.AllowedSchemas = l;
};

/* ---------------------------
   Global Variables & Initial Setup
---------------------------*/
let selectedElement = null;
const canvas = document.getElementById("canvas");

/* --- Undo/Redo Functionality --- */
let undoStack = [];
let redoStack = [];
let isUndoRedo = false;
function recordState() {
  if (!isUndoRedo) {
    undoStack.push(canvas.innerHTML);
    redoStack = [];
  }
}
document.getElementById("undo-btn").addEventListener("click", function () {
  if (undoStack.length > 0) {
    isUndoRedo = true;
    redoStack.push(canvas.innerHTML);
    const prevState = undoStack.pop();
    canvas.innerHTML = prevState;
    rebindComponentListeners();
    isUndoRedo = false;
  }
});
document.getElementById("redo-btn").addEventListener("click", function () {
  if (redoStack.length > 0) {
    isUndoRedo = true;
    undoStack.push(canvas.innerHTML);
    const nextState = redoStack.pop();
    canvas.innerHTML = nextState;
    rebindComponentListeners();
    isUndoRedo = false;
  }
});
const recordTimeoutDelay = 500;
let recordTimeout;
const observer = new MutationObserver(function () {
  clearTimeout(recordTimeout);
  recordTimeout = setTimeout(() => {
    recordState();
    if (autoSaveToggle.checked) autoSave();
  }, recordTimeoutDelay);
});
observer.observe(canvas, { childList: true, subtree: true });

/* --- Pages Management --- */
let pages = [];
let currentPageIndex = 0;
function generateDefaultPageName() {
  let num = Math.floor(Math.random() * 1e9)
    .toString()
    .padStart(9, "0");
  return "Untitled-" + num;
}
if (!document.getElementById("site-title").value) {
  document.getElementById("site-title").value = generateDefaultPageName();
}
pages.push({ name: "Home", content: "", js: "", css: "", password: "" });
currentPageIndex = 0;
updatePagesNav();
function updatePagesNav() {
  const nav = document.getElementById("pages-nav");
  nav.innerHTML = "";
  pages.forEach((page, index) => {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.innerText = page.name + (page.password ? " 🔒" : "");
    btn.addEventListener("click", function () {
      switchPage(index);
    });
    nav.appendChild(btn);
  });
  const addBtn = document.createElement("button");
  addBtn.id = "add-page-btn";
  addBtn.className = "btn";
  addBtn.innerText = "Add Page";
  addBtn.addEventListener("click", function () {
    document.getElementById("newpage-modal").style.display = "flex";
  });
  nav.appendChild(addBtn);
  const toggleLabel = document.createElement("label");
  toggleLabel.innerHTML =
    '<input type="checkbox" id="toggle-nav" checked /> Show Navigation';
  nav.appendChild(toggleLabel);
}
function switchPage(index) {
  pages[currentPageIndex].content = canvas.innerHTML;
  pages[currentPageIndex].js = jsEditor.getValue();
  pages[currentPageIndex].css = cssEditor.getValue();
  currentPageIndex = index;
  canvas.innerHTML = pages[currentPageIndex].content;
  jsEditor.setValue(pages[currentPageIndex].js);
  cssEditor.setValue(pages[currentPageIndex].css);
  undoStack = [];
  redoStack = [];
  rebindComponentListeners();
}
document
  .getElementById("newpage-password-toggle")
  .addEventListener("change", function (e) {
    document.getElementById("newpage-password-container").style.display =
      e.target.checked ? "block" : "none";
  });
document.getElementById("create-page-btn").addEventListener("click", function () {
  const name =
    document.getElementById("newpage-name").value.trim() || "New Page";
  const password = document.getElementById("newpage-password-toggle").checked
    ? document.getElementById("newpage-password").value
    : "";
  pages.push({ name, content: "", js: "", css: "", password });
  updatePagesNav();
  document.getElementById("newpage-modal").style.display = "none";
});
document
  .getElementById("cancel-newpage")
  .addEventListener("click", function () {
    document.getElementById("newpage-modal").style.display = "none";
  });

/* --- CodeMirror Editors --- */
const jsEditor = CodeMirror.fromTextArea(
  document.getElementById("js-code"),
  {
    lineNumbers: true,
    mode: "javascript",
    theme: "neo",
  }
);
const cssEditor = CodeMirror.fromTextArea(
  document.getElementById("css-code"),
  {
    lineNumbers: true,
    mode: "css",
    theme: "neo",
  }
);

/* --- Top-Level Tab Switching --- */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const tabName = tab.getAttribute("data-tab");
    document.getElementById("designer-container").style.display =
      tabName === "designer" ? "block" : "none";
    document.getElementById("javascript-container").style.display =
      tabName === "javascript" ? "block" : "none";
    document.getElementById("css-container").style.display =
      tabName === "css" ? "block" : "none";
  });
});

/* --- Save & Auto‑Save --- */
document.getElementById("save-site").addEventListener("click", save);
function save() {
  let siteName = document.getElementById("site-title").value.trim();
  if (!siteName) {
    showPrompt("Enter the site's name below:", function (input) {
      siteName = HtmlSanitizer.SanitizeHtml(input);
      document.getElementById("site-title").value = siteName;
      savePage(siteName);
    });
  } else {
    savePage(siteName);
  }
}
function savePage(siteName) {
  pages[currentPageIndex].content = canvas.innerHTML;
  pages[currentPageIndex].js = jsEditor.getValue();
  pages[currentPageIndex].css = cssEditor.getValue();
  let sites = JSON.parse(localStorage.getItem("sites")) || [];
  const siteExists = sites.some((site) => site[0] === siteName);
  if (!siteExists) {
    sites.push([siteName, pages]);
    localStorage.setItem("sites", JSON.stringify(sites));
    console.log(`Site '${siteName}' added successfully.`);
  } else {
    sites = sites.map((site) =>
      site[0] === siteName ? [siteName, pages] : site
    );
    localStorage.setItem("sites", JSON.stringify(sites));
    console.log(`Site '${siteName}' updated successfully.`);
  }
}
const autoSaveToggle = document.getElementById("auto-save-toggle");
const autoSaveIndicator = document.getElementById("auto-save-indicator");
function autoSave() {
  let siteName = document.getElementById("site-title").value.trim();
  if (!siteName) return;
  pages[currentPageIndex].content = canvas.innerHTML;
  pages[currentPageIndex].js = jsEditor.getValue();
  pages[currentPageIndex].css = cssEditor.getValue();
  let sites = JSON.parse(localStorage.getItem("sites")) || [];
  let found = false;
  for (let i = 0; i < sites.length; i++) {
    if (sites[i][0] === siteName) {
      sites[i][1] = pages;
      found = true;
      break;
    }
  }
  if (!found) {
    sites.push([siteName, pages]);
  }
  localStorage.setItem("sites", JSON.stringify(sites));
  autoSaveIndicator.innerText =
    "Auto‑saved at " + new Date().toLocaleTimeString();
}

/* --- Rebind Listeners for Components --- */
function rebindComponentListeners() {
  const comps = canvas.querySelectorAll("[data-type]");
  comps.forEach((el) => {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      setSelectedElement(el);
    });
  });
}

/* --- Custom Modal Functions --- */
function showPrompt(message, callback) {
  document.getElementById("site-name-input").value = "";
  document.getElementById("prompt-modal").style.display = "flex";
  const saveBtn = document.getElementById("save-prompt");
  const cancelBtn = document.getElementById("cancel-prompt");
  function onSave() {
    let value = document.getElementById("site-name-input").value;
    document.getElementById("prompt-modal").style.display = "none";
    cleanup();
    callback(value);
  }
  function onCancel() {
    document.getElementById("prompt-modal").style.display = "none";
    cleanup();
  }
  function cleanup() {
    saveBtn.removeEventListener("click", onSave);
    cancelBtn.removeEventListener("click", onCancel);
  }
  saveBtn.addEventListener("click", onSave);
  cancelBtn.addEventListener("click", onCancel);
}
function showAlert(message) {
  document.getElementById("alert-message").innerText = message;
  document.getElementById("alert-modal").style.display = "flex";
  const okBtn = document.getElementById("alert-ok");
  function onOk() {
    document.getElementById("alert-modal").style.display = "none";
    okBtn.removeEventListener("click", onOk);
  }
  okBtn.addEventListener("click", onOk);
}
document.querySelectorAll(".close-button").forEach((btn) => {
  btn.addEventListener("click", function () {
    const modalId = btn.getAttribute("data-modal");
    document.getElementById(modalId).style.display = "none";
  });
});

/* --- Export HTML --- */
document.getElementById("export-html").addEventListener("click", function () {
  pages[currentPageIndex].content = canvas.innerHTML;
  pages[currentPageIndex].js = jsEditor.getValue();
  pages[currentPageIndex].css = cssEditor.getValue();
  const exportContainer = document.getElementById("export-contents");
  exportContainer.innerHTML = "";
  const globalAnimationCSS = `
/* Animations */
@keyframes slideFromLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.anim-slideFromLeft-onLoad { animation: slideFromLeft 1s ease forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.anim-fadeIn-onLoad { animation: fadeIn 1s ease forwards; }
@keyframes zoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.anim-zoomIn-onLoad { animation: zoomIn 1s ease forwards; }
@keyframes rotateIn { from { transform: rotate(-180deg); opacity: 0; } to { transform: rotate(0); opacity: 1; } }
.anim-rotateIn-onLoad { animation: rotateIn 1s ease forwards; }
@keyframes bounceIn { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.anim-bounceIn-onLoad { animation: bounceIn 1s ease forwards; }
/* On Hover */
.anim-slideFromLeft-onHover:hover { animation: slideFromLeft 1s ease forwards; }
.anim-fadeIn-onHover:hover { animation: fadeIn 1s ease forwards; }
.anim-zoomIn-onHover:hover { animation: zoomIn 1s ease forwards; }
.anim-rotateIn-onHover:hover { animation: rotateIn 1s ease forwards; }
.anim-bounceIn-onHover:hover { animation: bounceIn 1s ease forwards; }
/* Effects */
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.effect-shake { animation: shake 0.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.effect-pulse { animation: pulse 1s infinite; }
@keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 75% { transform: rotate(-3deg); } }
.effect-wiggle { animation: wiggle 0.5s infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.effect-spin { animation: spin 2s infinite linear; }
@keyframes glow { from { box-shadow: 0 0 5px #fff; } to { box-shadow: 0 0 20px #ff0; } }
.effect-glow { animation: glow 1s infinite alternate; }
  `;
  pages.forEach((page) => {
    const textarea = document.createElement("textarea");
    let navHTML = "";
    if (pages.length > 1 && document.getElementById("toggle-nav").checked) {
      navHTML = `<nav style="background:#007aff;padding:10px;text-align:center;">` +
        pages
          .map((p) => {
            let lock = p.password ? "🔒" : "";
            return `<a href="${p.name.replace(/\s+/g, "_")}.html" style="margin:0 10px;color:#fff;text-decoration:none;">${p.name} ${lock}</a>`;
          })
          .join("") +
        `</nav>`;
    }
    let passwordScript = "";
    if (page.password) {
      // Insert an inline password modal script that runs only if not in preview mode.
      passwordScript = `<script>
(function(){
  var pagePassword = ${JSON.stringify(page.password)};
  if(pagePassword && !window.location.search.includes("preview=true")){
    var modal = document.createElement('div');
    modal.style.position='fixed';
    modal.style.top='0';
    modal.style.left='0';
    modal.style.width='100%';
    modal.style.height='100%';
    modal.style.backgroundColor='rgb(0, 0, 0)';
    modal.style.display='flex';
    modal.style.alignItems='center';
    modal.style.justifyContent='center';
    var box = document.createElement('div');
    box.style.background='#fff';
    box.style.padding='20px';
    box.style.borderRadius='8px';
    box.style.textAlign='center';
    var input = document.createElement('input');
    input.type='password';
    input.placeholder='Enter password';
    input.style.padding='10px';
    input.style.margin='10px';
    var button = document.createElement('button');
    button.textContent='Submit';
    button.style.padding='10px';
    var errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.marginTop = '10px';
    box.appendChild(document.createTextNode('This page is password protected.'));
    box.appendChild(document.createElement('br'));
    box.appendChild(input);
    box.appendChild(document.createElement('br'));
    box.appendChild(button);
    box.appendChild(errorMsg);
    modal.appendChild(box);
    document.body.appendChild(modal);
    button.addEventListener('click', function(){
       if(input.value === pagePassword){
          document.body.removeChild(modal);
       } else {
          errorMsg.textContent = 'Incorrect password. Try again.';
       }
    });
  }
})();
</script>`;
    }
    const exportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${document.getElementById("site-title").value} - ${page.name}</title>
  <link rel="stylesheet" href="https://webbuild.js.org/builder/betabuilder/style.css">
  <style>
  body {
    background-image: url(${document.getElementById("canvas-bg-image").value});
    background-color: ${document.getElementById("canvas-bg-color").value};
  }
  ${globalAnimationCSS}
  ${page.css}
  </style>
</head>
<body>
${navHTML}
${page.content}
<script>
${page.js}
console.log("WebBuild");
document.querySelectorAll('[class*="-onClick"]').forEach(el => {
  el.addEventListener('click', () => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
});
</script>
${passwordScript}
</body>
</html>`;
    const header = document.createElement("h3");
    header.innerText = "Page: " + page.name;
    exportContainer.appendChild(header);
    textarea.value = exportHTML;
    exportContainer.appendChild(textarea);
  });
  document.getElementById("export-modal").style.display = "flex";
});

/* --- Clear Canvas Confirmation --- */
document.getElementById("clear-canvas").addEventListener("click", function () {
  document.getElementById("clear-modal").style.display = "flex";
  const confirmClear = document.getElementById("confirm-clear");
  const cancelClear = document.getElementById("cancel-clear");
  function onConfirmClear() {
    canvas.innerHTML = "";
    setSelectedElement(null);
    document.getElementById("clear-modal").style.display = "none";
    confirmClear.removeEventListener("click", onConfirmClear);
    cancelClear.removeEventListener("click", onCancelClear);
  }
  function onCancelClear() {
    document.getElementById("clear-modal").style.display = "none";
    confirmClear.removeEventListener("click", onConfirmClear);
    cancelClear.removeEventListener("click", onCancelClear);
  }
  confirmClear.addEventListener("click", onConfirmClear);
  cancelClear.addEventListener("click", onCancelClear);
});

/* --- Component Creation & Selection --- */
function setSelectedElement(element) {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
  }
  selectedElement = element;
  if (selectedElement) {
    selectedElement.classList.add("selected");
  }
  updateSettingsPanel();
}
canvas.addEventListener("click", function (e) {
  if (e.target === canvas) {
    setSelectedElement(null);
  }
});
function createComponent(type) {
  let element;
  switch (type) {
    case "heading":
      element = document.createElement("h1");
      element.textContent = "Heading";
      element.style.fontSize = "32px";
      break;
    case "subheading":
      element = document.createElement("h2");
      element.textContent = "Subheading";
      element.style.fontSize = "24px";
      break;
    case "paragraph":
      element = document.createElement("p");
      element.textContent = "Paragraph text...";
      element.style.fontSize = "16px";
      break;
    case "quote":
      element = document.createElement("blockquote");
      element.textContent = "Quote text...";
      element.style.fontStyle = "italic";
      break;
    case "codeblock":
      element = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.textContent = "Code goes here...";
      element.appendChild(codeEl);
      break;
    case "image":
      element = document.createElement("img");
      element.src = "https://via.placeholder.com/300";
      element.alt = "Placeholder Image";
      element.style.width = "100%";
      break;
    case "video":
      element = document.createElement("video");
      element.controls = true;
      const sourceEl = document.createElement("source");
      sourceEl.src = "https://www.w3schools.com/html/mov_bbb.mp4";
      sourceEl.type = "video/mp4";
      element.appendChild(sourceEl);
      element.style.width = "100%";
      break;
    case "button":
      element = document.createElement("button");
      element.textContent = "Button";
      break;
    case "link":
      element = document.createElement("a");
      element.textContent = "Link";
      element.href = "#";
      break;
    case "form":
      element = document.createElement("form");
      element.innerHTML = `<input type="text" placeholder="Your name" /><button type="submit">Submit</button>`;
      break;
    case "divider":
      element = document.createElement("hr");
      break;
    case "container":
      element = document.createElement("div");
      element.textContent = "Container content...";
      element.style.border = "1px dashed #ccc";
      element.style.padding = "1rem";
      break;
    case "list":
      element = document.createElement("ul");
      element.innerHTML = "<li>Item 1</li><li>Item 2</li><li>Item 3</li>";
      break;
    default:
      return;
  }
  element.setAttribute("data-type", type);
  element.addEventListener("click", function (e) {
    e.stopPropagation();
    setSelectedElement(element);
  });
  canvas.appendChild(element);
  setSelectedElement(element);
}
document.querySelectorAll(".add-component").forEach((button) => {
  button.addEventListener("click", function () {
    const type = button.getAttribute("data-type");
    createComponent(type);
  });
});
document
  .getElementById("canvas-settings-btn")
  .addEventListener("click", function () {
    setSelectedElement(null);
  });

/* --- Update Settings Panel --- */
function updateSettingsPanel() {
  const settingsContent = document.getElementById("settings-content");
  settingsContent.innerHTML = "";
  if (!selectedElement) {
    settingsContent.innerHTML = `<h3>Canvas Settings</h3>
      <label for="canvas-bg-color">Background Color</label>
      <input type="color" id="canvas-bg-color" value="#ffffff">
      <label for="canvas-bg-image">Background Image URL</label>
      <input type="text" id="canvas-bg-image" placeholder="Enter image URL">
      <label for="canvas-bg-file">Or upload file:</label>
      <input type="file" id="canvas-bg-file">`;
    document
      .getElementById("canvas-bg-color")
      .addEventListener("input", function (e) {
        canvas.style.backgroundColor = e.target.value;
      });
    document
      .getElementById("canvas-bg-image")
      .addEventListener("input", function (e) {
        const url = e.target.value.trim();
        if (url !== "") {
          canvas.style.backgroundImage = `url(${url})`;
          canvas.style.backgroundSize = "cover";
        } else {
          canvas.style.backgroundImage = "none";
        }
      });
    document
      .getElementById("canvas-bg-file")
      .addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            document.getElementById("canvas-bg-image").value = evt.target.result;
            canvas.style.backgroundImage = `url(${evt.target.result})`;
            canvas.style.backgroundSize = "cover";
          };
          reader.readAsDataURL(file);
        }
      });
  } else {
    const type = selectedElement.getAttribute("data-type");
    let html = `<h3>${type.charAt(0).toUpperCase() + type.slice(1)} Settings</h3>`;
    if (
      type === "heading" ||
      type === "subheading" ||
      type === "paragraph" ||
      type === "quote"
    ) {
      html += `<label for="text-content">Text</label>
               <input type="text" id="text-content" value="${selectedElement.textContent}">
               <label for="font-size">Font Size (px)</label>
               <input type="number" id="font-size" value="${parseInt(
                 window.getComputedStyle(selectedElement).fontSize
               )}">
               <label for="text-color">Text Color</label>
               <input type="color" id="text-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).color
               )}">`;
    } else if (type === "image") {
      html += `<label for="img-src">Image URL</label>
               <input type="text" id="img-src" value="${selectedElement.src}">
               <label for="img-file">Or upload file:</label>
               <input type="file" id="img-file">
               <label for="img-alt">Alt Text</label>
               <input type="text" id="img-alt" value="${selectedElement.alt}">
               <label for="img-width">Width (px or %)</label>
               <input type="text" id="img-width" value="${selectedElement.style.width || ''}">`;
    } else if (type === "button") {
      html += `<label for="btn-text">Button Text</label>
               <input type="text" id="btn-text" value="${selectedElement.textContent}">
               <label for="btn-bg-color">Background Color</label>
               <input type="color" id="btn-bg-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).backgroundColor
               )}">
               <label for="btn-text-color">Text Color</label>
               <input type="color" id="btn-text-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).color
               )}">`;
    } else if (type === "link") {
      html += `<label for="link-text">Link Text</label>
               <input type="text" id="link-text" value="${selectedElement.textContent}">
               <label for="link-url">URL</label>
               <input type="text" id="link-url" value="${selectedElement.href}">
               <label for="link-color">Text Color</label>
               <input type="color" id="link-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).color
               )}">`;
    } else if (type === "divider") {
      html += `<label for="divider-color">Divider Color</label>
               <input type="color" id="divider-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).borderTopColor
               )}">
               <label for="divider-thickness">Thickness (px)</label>
               <input type="number" id="divider-thickness" value="${parseInt(
                 window.getComputedStyle(selectedElement).borderTopWidth
               )}">`;
    } else if (type === "codeblock") {
      html += `<label for="code-content">Code</label>
               <textarea id="code-content" rows="5">${selectedElement.querySelector(
                 "code"
               ).textContent}</textarea>
               <label for="font-size">Font Size (px)</label>
               <input type="number" id="font-size" value="${parseInt(
                 window.getComputedStyle(selectedElement).fontSize
               )}">
               <label for="text-color">Text Color</label>
               <input type="color" id="text-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).color
               )}">`;
    } else if (type === "video") {
      let sourceEl = selectedElement.querySelector("source");
      html += `<label for="video-src">Video URL</label>
               <input type="text" id="video-src" value="${sourceEl ? sourceEl.src : ''}">
               <label for="video-file">Or upload file:</label>
               <input type="file" id="video-file">
               <label for="video-width">Width (px or %)</label>
               <input type="text" id="video-width" value="${selectedElement.style.width || ''}">`;
    } else if (type === "form") {
      html += `<label for="form-html">Form HTML</label>
               <textarea id="form-html" rows="5">${selectedElement.innerHTML}</textarea>`;
    } else if (type === "container") {
      html += `<label for="container-text">Text</label>
               <input type="text" id="container-text" value="${selectedElement.textContent}">
               <label for="border-color">Border Color</label>
               <input type="color" id="border-color" value="${rgbToHex(
                 window.getComputedStyle(selectedElement).borderColor
               )}">`;
    } else if (type === "list") {
      let listItems = Array.from(
        selectedElement.querySelectorAll("li")
      )
        .map((li) => li.textContent)
        .join("\n");
      html += `<label for="list-items">List Items (one per line)</label>
               <textarea id="list-items" rows="5">${listItems}</textarea>`;
    }
    // Append Animate, Effects, and Delete buttons.
    html += `<button id="animate-btn" class="btn">Animate</button>
             <button id="effects-btn" class="btn">Effects</button>
             <button id="delete-component" class="btn delete-btn">Delete</button>`;
    settingsContent.innerHTML = html;
    // Attach property listeners as before…
    if (
      type === "heading" ||
      type === "subheading" ||
      type === "paragraph" ||
      type === "quote"
    ) {
      document
        .getElementById("text-content")
        .addEventListener("input", function (e) {
          selectedElement.textContent = e.target.value;
        });
      document
        .getElementById("font-size")
        .addEventListener("input", function (e) {
          selectedElement.style.fontSize = e.target.value + "px";
        });
      document
        .getElementById("text-color")
        .addEventListener("input", function (e) {
          selectedElement.style.color = e.target.value;
        });
    } else if (type === "image") {
      document.getElementById("img-src").addEventListener("input", function (e) {
        selectedElement.src = e.target.value;
      });
      document
        .getElementById("img-file")
        .addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
              document.getElementById("img-src").value = evt.target.result;
              selectedElement.src = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      document.getElementById("img-alt").addEventListener("input", function (e) {
        selectedElement.alt = e.target.value;
      });
      document
        .getElementById("img-width")
        .addEventListener("input", function (e) {
          selectedElement.style.width = e.target.value;
        });
    } else if (type === "button") {
      document.getElementById("btn-text").addEventListener("input", function (e) {
        selectedElement.textContent = e.target.value;
      });
      document
        .getElementById("btn-bg-color")
        .addEventListener("input", function (e) {
          selectedElement.style.backgroundColor = e.target.value;
        });
      document
        .getElementById("btn-text-color")
        .addEventListener("input", function (e) {
          selectedElement.style.color = e.target.value;
        });
    } else if (type === "link") {
      document.getElementById("link-text").addEventListener("input", function (e) {
        selectedElement.textContent = e.target.value;
      });
      document.getElementById("link-url").addEventListener("input", function (e) {
        selectedElement.href = e.target.value;
      });
      document
        .getElementById("link-color")
        .addEventListener("input", function (e) {
          selectedElement.style.color = e.target.value;
        });
    } else if (type === "divider") {
      document
        .getElementById("divider-color")
        .addEventListener("input", function (e) {
          selectedElement.style.borderTopColor = e.target.value;
        });
      document
        .getElementById("divider-thickness")
        .addEventListener("input", function (e) {
          selectedElement.style.borderTopWidth = e.target.value + "px";
        });
    } else if (type === "codeblock") {
      document
        .getElementById("code-content")
        .addEventListener("input", function (e) {
          selectedElement.querySelector("code").textContent = e.target.value;
        });
      document
        .getElementById("font-size")
        .addEventListener("input", function (e) {
          selectedElement.style.fontSize = e.target.value + "px";
        });
      document
        .getElementById("text-color")
        .addEventListener("input", function (e) {
          selectedElement.style.color = e.target.value;
        });
    } else if (type === "video") {
      document
        .getElementById("video-src")
        .addEventListener("input", function (e) {
          const sourceEl = selectedElement.querySelector("source");
          if (sourceEl) {
            sourceEl.src = e.target.value;
            selectedElement.load();
          }
        });
      document
        .getElementById("video-file")
        .addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
              document.getElementById("video-src").value = evt.target.result;
              const sourceEl = selectedElement.querySelector("source");
              if (sourceEl) {
                sourceEl.src = evt.target.result;
                selectedElement.load();
              }
            };
            reader.readAsDataURL(file);
          }
        });
      document
        .getElementById("video-width")
        .addEventListener("input", function (e) {
          selectedElement.style.width = e.target.value;
        });
    } else if (type === "form") {
      document
        .getElementById("form-html")
        .addEventListener("input", function (e) {
          selectedElement.innerHTML = e.target.value;
        });
    } else if (type === "container") {
      document
        .getElementById("container-text")
        .addEventListener("input", function (e) {
          selectedElement.textContent = e.target.value;
        });
      document
        .getElementById("border-color")
        .addEventListener("input", function (e) {
          selectedElement.style.borderColor = e.target.value;
        });
    } else if (type === "list") {
      document
        .getElementById("list-items")
        .addEventListener("input", function (e) {
          const items = e.target.value
            .split("\n")
            .filter((line) => line.trim() !== "");
          selectedElement.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
        });
    }
    // Animate button
    document.getElementById("animate-btn").addEventListener("click", function () {
      document.getElementById("animation-modal").style.display = "flex";
    });
    // Effects button
    document.getElementById("effects-btn").addEventListener("click", function () {
      document.getElementById("effects-modal").style.display = "flex";
    });
    // Delete button
    document
      .getElementById("delete-component")
      .addEventListener("click", function () {
        document.getElementById("delete-modal").style.display = "flex";
        const confirmBtn = document.getElementById("confirm-delete");
        const cancelBtn = document.getElementById("cancel-delete");
        function onConfirm() {
          if (selectedElement && selectedElement.parentNode === canvas) {
            canvas.removeChild(selectedElement);
            setSelectedElement(null);
          }
          document.getElementById("delete-modal").style.display = "none";
          confirmBtn.removeEventListener("click", onConfirm);
          cancelBtn.removeEventListener("click", onCancel);
        }
        function onCancel() {
          document.getElementById("delete-modal").style.display = "none";
          confirmBtn.removeEventListener("click", onConfirm);
          cancelBtn.removeEventListener("click", onCancel);
        }
        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
      });
  }
}
/* --- Helper: Convert rgb string to hex --- */
function rgbToHex(rgb) {
  if (rgb.indexOf("#") === 0) return rgb;
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  return result
    ? "#" +
        ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(result[3], 10).toString(16)).slice(-2)
    : rgb;
}

/* --- Animation Modal --- */
document
  .getElementById("apply-animation")
  .addEventListener("click", function () {
    const animType = document.getElementById("animation-type").value;
    const animTrigger = document.getElementById("animation-trigger").value;
    if (selectedElement) {
      selectedElement.dataset.animation = JSON.stringify({
        type: animType,
        trigger: animTrigger,
      });
      selectedElement.classList.remove(
        "anim-slideFromLeft-onLoad",
        "anim-fadeIn-onLoad",
        "anim-zoomIn-onLoad",
        "anim-rotateIn-onLoad",
        "anim-bounceIn-onLoad",
        "anim-slideFromLeft-onClick",
        "anim-fadeIn-onClick",
        "anim-zoomIn-onClick",
        "anim-rotateIn-onClick",
        "anim-bounceIn-onClick",
        "anim-slideFromLeft-onHover",
        "anim-fadeIn-onHover",
        "anim-zoomIn-onHover",
        "anim-rotateIn-onHover",
        "anim-bounceIn-onHover"
      );
      let cls = "anim-" + animType + "-" + animTrigger;
      selectedElement.classList.add(cls);
    }
    document.getElementById("animation-modal").style.display = "none";
  });
document
  .getElementById("cancel-animation")
  .addEventListener("click", function () {
    document.getElementById("animation-modal").style.display = "none";
  });
/* --- Effects Modal --- */
document
  .getElementById("apply-effect")
  .addEventListener("click", function () {
    const effectType = document.getElementById("effect-type").value;
    if (selectedElement) {
      selectedElement.dataset.effect = JSON.stringify({ type: effectType });
      selectedElement.classList.remove(
        "effect-shake",
        "effect-pulse",
        "effect-wiggle",
        "effect-spin",
        "effect-glow"
      );
      selectedElement.classList.add("effect-" + effectType);
    }
    document.getElementById("effects-modal").style.display = "none";
  });
document
  .getElementById("cancel-effect")
  .addEventListener("click", function () {
    document.getElementById("effects-modal").style.display = "none";
  });