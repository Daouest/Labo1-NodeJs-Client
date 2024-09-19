//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let selectedCategory = "";
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    function updateDropDownMenu(categories) {
        let DDMenu = $("#DDMenu");
        let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
        DDMenu.empty();
        DDMenu.append($(` 
            <div class="dropdown-item menuItemLayout" id="allCatCmd"> 
                <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories 
            </div> 
        `));
        DDMenu.append($(`<div class="dropdown-divider"></div>`));
        categories.forEach(category => {
            selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
            DDMenu.append($(` 
                <div class="dropdown-item menuItemLayout category" id="allCatCmd"> 
                    <i class="menuIcon fa ${selectClass} mx-2"></i> ${category} 
                </div> 
            `));
        });
        DDMenu.append($(`<div class="dropdown-divider"></div>`));
        DDMenu.append($(` 
            <div class="dropdown-item menuItemLayout" id="aboutCmd"> 
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos... 
            </div> 
        `));
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
        $('#allCatCmd').on("click", function () {
            selectedCategory = "";
            renderBookmarks();
        });
        $('.category').on("click", function () {
            selectedCategory = $(this).text().trim();
            rendreByCategory(selectedCategory);
        });
    }

    async function fetchAndPopulateCategories() {
        try {
            let bookmarks = await API_GetBookmarks();
            let categories = [...new Set(bookmarks.map(bookmark => bookmark.Category))];
            updateDropDownMenu(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    fetchAndPopulateCategories();
}


function renderAbout(){
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Luciano Gomez
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}
async function renderBookmarks(){
    showWaitingGif();
    $("#actionTitle").text("Liste des bookmarks");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
async function rendreByCategory(category){
    showWaitingGif();
    $("#actionTitle").text("Liste des bookmarks");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarkByCategories();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            if (bookmark.Category === category)
                $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer">
            <div class="bookmarkLayout">
            <div class="bookmarkTitleAndIcon">
                <img src=https://s2.googleusercontent.com/s2/favicons?domain=${bookmark.Url}>
                <span class="bookmarkTitle">${bookmark.Title}</span>
            </div>
            <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
        </div>
    </div>  
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Bookmark introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <label for="Title" class="form-label">Title </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Title"
                required
                RequireMessage="Veuillez entrer un Title"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer un Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Categorie </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer une categorie" 
                InvalidMessage="Veuillez entrer une categorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`
     <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer">
            <div class="bookmarkLayout">
                <div class="bookmarkTitleAndIcon">
                    <img src=https://s2.googleusercontent.com/s2/favicons?domain=${bookmark.Url}>
                    <span class="bookmarkTitle">${bookmark.Title}</span>
                </div>
                <a href="${bookmark.Url}" target="_blank">${bookmark.Category}</a>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Name}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Name}"></span>
            </div>
        </div>
    </div>           
    `);
}