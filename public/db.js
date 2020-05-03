
// TODO: open  indexedDB
const indexedDB = 
window.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    // create object store called "pending" and set autoIncrement to true
    db.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
    });
};
request.onsuccess = function({ target }) {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};
request.onerror = function(event) {
    // log error here
    console.log(event.error);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const budgetStore = transaction.objectStore("pending");
    // const statusIndex = budgetStore.index("statusIndex");
    // add record to your store with add method.
    budgetStore.add(record);
}

function checkDatabase(record) {
    // open a transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const budgetStore = transaction.objectStore("pending");
    // get all records from store and set to a variable
    const allBudget = budgetStore.getAll(record);
    // let getAll;
    allBudget.onsuccess = function() {
        if (allBudget.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(allBudget.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then((response) => response.json())
                .then((response) => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(["pending"], "readwrite");
                    // access your pending object store
                    const budgetStore = transaction.objectStore("pending");
                    // clear all items in your store
                    budgetStore.clear(response);
                });
        }
    };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);
