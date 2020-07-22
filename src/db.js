/** @type {IDBDatabase} */
var db = null, failed = false;
var VERSION = 1;

var optrs = [];

if (typeof indexedDB !== 'undefined'){
    console.log('indexedDB is supported');
    var request = indexedDB.open('pearl-calculator', VERSION);
    request.addEventListener('upgradeneeded', function(e){
        db = e.target.result;
        if (!db.objectStoreNames.contains('misc')){
            db.createObjectStore('misc');
        }
        if (!db.objectStoreNames.contains('configs')){
            db.createObjectStore('configs');
        }
        if (!db.objectStoreNames.contains('result')){
            db.createObjectStore('result', {autoIncrement: true});
        }
        console.log('indexedDB upgraded');
    });
    request.addEventListener('success', function(e){
        db = e.target.result;
        console.log('indexedDB initialized');
        doPendingTasks();
    });
    request.addEventListener('error', function(e){
        console.log('Failed to open indexedDB');
        failed = true;
    });
}
else {
    console.log('indexedDB not supported');
    failed = true;
}

function doPendingTasks(){
    for (var i = 0, _a = optrs; i < _a.length; i++){
        _a[i]();
    }
}

function doAfterOpen(cb){
    if (!failed){
        if (db){
            cb();
        }
        else {
            optrs.push(cb);
        }
    }
}

export function addConfigData(data){
    doAfterOpen(function(){
        var key = data.type + '/' + data.name;
        var request = db.transaction(['configs'], 'readwrite')
            .objectStore('configs')
            .add(data, key);
        request.addEventListener('success', function(){
            console.log('successfully added config ' + key);
        });
        request.addEventListener('error', function(){
            console.log('failed to add config ' + key);
        });
    });
}
export function modifyConfigData(data){
    doAfterOpen(function(){
        var key = data.type + '/' + data.name;
        var request = db.transaction(['configs'], 'readwrite')
            .objectStore('configs')
            .put(data, key);
        request.addEventListener('success', function(){
            console.log('successfully modified config ' + key);
        });
        request.addEventListener('error', function(){
            console.log('failed to modify config ' + key);
        });
    });
}
export function removeConfigData(data){
    doAfterOpen(function(){
        var key = data.type + '/' + data.name;
        var request = db.transaction(['configs'], 'readwrite')
            .objectStore('configs')
            .delete(key);
        request.addEventListener('success', function(){
            console.log('successfully deleted config ' + key);
        });
        request.addEventListener('error', function(){
            console.log('failed to deleted config ' + key);
        });
    });
}
function getAllData(s, cb){
    doAfterOpen(function(){
        var request = db.transaction([s], 'readonly')
            .objectStore(s)
            .openCursor();
        request.addEventListener('success', function(e){
            var cursor = e.target.result;
            if (cursor){
                cb(cursor.value, cursor.key);
                cursor.continue();
            }
        });
    });
}
export function getAllConfigData(cb){
    getAllData('configs', cb);
}
export function addResultData(data, cb){
    doAfterOpen(function(){
        var request = db.transaction(['result'], 'readwrite')
            .objectStore('result')
            .add(data);
        request.addEventListener('success', function(e){
            console.log('successfully added result with key' + e.target.result);
            cb(e.target.result);
        });
        request.addEventListener('error', function(){
            console.log('failed to result');
        });
    });
}
export function modifyResultData(key, data){
    doAfterOpen(function(){
        var request = db.transaction(['result'], 'readwrite')
            .objectStore('result')
            .put(data, key);
        request.addEventListener('success', function(e){
            console.log('successfully modified result with key ' + key);
        });
        request.addEventListener('error', function(){
            console.log('failed to result');
        });
    });
}
export function removeResultData(key){
    doAfterOpen(function(){
        var request = db.transaction(['result'], 'readwrite')
            .objectStore('result')
            .delete(key);
        request.addEventListener('success', function(e){
            console.log('successfully delete result with key ' + key);
        });
        request.addEventListener('error', function(){
            console.log('failed to delete result');
        });
    });
}
export function getAllResultData(cb){
    getAllData('result', cb);
}