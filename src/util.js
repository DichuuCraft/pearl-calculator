/**
 * @param {string} c 
 * @param {(n: HTMLElement) => any} cb 
 */
export function forEachClass(c, cb){
    for (var i = 0, _a = document.getElementsByClassName(c); i < _a.length; i++){
        cb(_a[i]);
    }
}
/**
 * @param {HTMLElement} n 
 */
export function clear(n){
    var c;
    while (c = n.lastChild) n.removeChild(c);
}
/** @returns {HTMLElement} */
export function _(name){
    var ret = document.createElement(name);
    for (var i = 1, _a = arguments; i < _a.length; i++){
        var e = _a[i];
        if (typeof e === 'string' || typeof e === 'number'){
            e = document.createTextNode(e);
        }
        ret.appendChild(e);
    }
    return ret;
}
/**
 * @param {HTMLElement} elem 
 * @param {string} cls 
 */
export function toggleClass(elem, cls){
    if (elem.classList.contains(cls)){
        elem.classList.remove(cls);
    }
    else {
        elem.classList.add(cls);
    }
}