let platforms, visiblePlatforms, gamesArray, filteredArray = [];
let isDescendingSorting = true;

const mainSection = document.querySelector(".data");
const filtersContainer = document.querySelector("#platform-filters__container");

async function readExcel(fileContent) {
    mainSection.classList.add("loading");
    await new Promise(resolve => setTimeout(resolve, 75));
    const workbook = XLSX.read(fileContent, { type: 'binary' });
    platforms = workbook.SheetNames;
    platforms.shift();
    visiblePlatforms = platforms;
    const mergedData = platforms.reduce((data, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            .reduce((data, row) => {
                const parsedDate = new Date(row[2])
                if (isNaN(parsedDate)) return data;
                const gameObject = {
                    Platform: sheetName,
                    GameID: row[0],
                    Name: row[1],
                    Date: row[2],
                    ParsedDate: parsedDate,
                    Producer: row[3],
                    Serial: row[4],
                    Link: `<a href='https://retroachievements.org/game/${row[0]}' target='__blanc'>${row[1]}</a>`,
                    Rating: row[6],
                    Comment: row[7]
                }
                data.push(gameObject);
                return data;
            }, []);
        sheetData.shift();
        return [...data, ...sheetData];
    }, []);
    gamesArray = mergedData
        .sort(
            (a, b) => a.ParsedDate - b.ParsedDate
        );;
    generateControls();
    // generateTable();
}
function fileSelectedHandler() {
    const input = document.getElementById('fileInput');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            readExcel(fileContent)
        };
        reader.readAsArrayBuffer(file);
    } else {
        console.log('Some Error.');
    }
}
function platfomsChangedHandler() {
    visiblePlatforms = [];
    filtersContainer.querySelectorAll(".platform-filter")
        .forEach(
            checkbox => checkbox.checked && visiblePlatforms.push(checkbox.dataset.value)
        )
    generateTable();
}
function selectAllPlatforms() {
    filtersContainer.querySelectorAll(".platform-filter")
        .forEach(
            checkbox => checkbox.checked = true
        )
}
function selectNonePlatforms() {
    filtersContainer.querySelectorAll(".platform-filter")
        .forEach(
            checkbox => checkbox.checked = false
        )
}
function sortChangeHandler(checkbox) {
    isDescendingSorting = !checkbox.checked;
    generateTable();
}
function applySort() {
    const reverseMult = isDescendingSorting ? 1 : -1;
    filteredArray = filteredArray.sort(
        (a, b) => reverseMult * (a.ParsedDate - b.ParsedDate)
    )
};
function applyFilter() {
    filteredArray = gamesArray.filter(
        game => visiblePlatforms.includes(game.Platform)
    )
};
async function generateTable() {
    mainSection.classList.add("loading");
    await new Promise(resolve => setTimeout(resolve, 75));
    applyFilter();
    applySort();
    const header = `
        <li class='row'>
            <ul class='row-items'>
                <li class="row-item">Name</li>
                <li class="row-item">Platform</li>
                <li class="row-item">Date</li>
                <li class="row-item">GameID</li>
                <li class="row-item">Producer</li>
                <li class="row-item">Rating</li>
                <li class="row-item">Comment</li>
            </ul>
        </li>`;

    mainSection.innerHTML = `
        <ul class='games-table'>
            ${header}
            ${filteredArray.map(game =>
        `<li class='row'>
                    <ul class='row-items'>
                        <li class="row-item">${game.Link ?? " "}</li>
                        <li class="row-item">${game.Platform ?? " "}</li>
                        <li class="row-item">${game.Date ?? " "}</li>
                        <li class="row-item">${game.GameID ?? " "}</li>
                        <li class="row-item">${game.Producer ?? " "}</li>
                        <li class="row-item">${game.Rating ?? " "}</li>
                        <li class="row-item">${game.Comment ?? " "}</li>
                    </ul>
                </li>`
    ).join("")}
        </ul>
    `;
    mainSection.classList.remove("loading");
}
function generateControls() {
    filtersContainer.innerHTML = platforms.map(platform =>
        `<div>
                <input class="platform-filter" type="checkbox" name="filter-platform__${platform}" id="filter-platform__${platform}" data-value="${platform}" checked>
                <label for="filter-platform__${platform}">${platform}</label>
        </div>`
    ).join("") + `
            <button class="button" onclick="selectAllPlatforms()">All</button>
            <button class="button" onclick="selectNonePlatforms()">None</button>
            <button class="button" onclick="platfomsChangedHandler()">Apply</button>
            <div>
                <input type="checkbox" name="sort-by-descending" id="sort-by-descending" onchange="sortChangeHandler(this)">
                <label for="sort-by-descending">Sort by descending</label>
            </div>
    `;
    platfomsChangedHandler();
}