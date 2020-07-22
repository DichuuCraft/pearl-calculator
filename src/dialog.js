import { forEachClass } from './util';

var modalOverlay = document.getElementById('modal-overlay');
var dialogCBs = {};

var alertDialog = document.getElementById('dialog-alert');
var alertContent = alertDialog.getElementsByClassName('alert-msg')[0];
var alertCB = null;
alertDialog.getElementsByClassName('btn-dialog-close')[0].addEventListener('click', function(){
    closeAll();
});
alertDialog.getElementsByClassName('btn-dialog-confirm')[0].addEventListener('click', function(){
    if (alertCB){
        alertCB();
        alertCB = null;
        closeAll();
    }
});

export function confirm(msg, cb){
    alertCB = cb;
    alertContent.innerText = msg;
    openDialog(alertDialog);
}

function closeAll(){
    modalOverlay.classList.remove('show');
    forEachClass('dialog', function(e){
        e.classList.remove('show');
        e.classList.remove('edit');
    });
}
/** @param {HTMLElement} e */
function openDialog(e){
    modalOverlay.classList.add('show');
    e.classList.add('show');
    clearError(e);
}
/** @param {string} type */
export function openEditDialog(type, data){
    var e = document.querySelector('.dialog[data-type="' + type + '"]');
    e.classList.add('edit');
    for (var i = 0, _a = e.getElementsByTagName('input'); i < _a.length; i++){
        var k = _a[i].getAttribute('data-prop-name');
        _a[i].value = data[k];
    }
    openDialog(e);
}
/** @param {HTMLElement} a */
function clearError(a){
    for (var i = 0, _a = a.getElementsByClassName('error-msg'); i < _a.length; i++){
        _a[i].innerText = '';
    }
    for (var i = 0, _a = a.getElementsByTagName('input'); i < _a.length; i++){
        _a[i].classList.remove('error');
    }
}

export function showAlert(msg, delay){
    var m = document.getElementById('alert-message');
    m.innerText = msg;
    m.classList.add('show');
    setTimeout(function(){
        m.classList.remove('show');
    }, delay || 5);
}

forEachClass('btn-show-dialog', function(e){
    e.addEventListener('click', function(){
        openDialog(document.getElementById(this.getAttribute('data-target')));
    });
});

forEachClass('dialog-input', function(e){
    e.getElementsByClassName('btn-dialog-close')[0].addEventListener('click', closeAll);
    e.getElementsByClassName('btn-dialog-confirm')[0].addEventListener('click', function(){
        var type = e.getAttribute('data-type');
        var cb = dialogCBs[type];
        var data = {type: type};
        clearError(e);
        var error = false;
        var edit = e.classList.contains('edit');
        for (var i = 0, _a = e.getElementsByTagName('input'); i < _a.length; i++){
            var elem = _a[i];
            var check = elem.getAttribute('data-check'), value = elem.value;
            if (check === 'number' && Number.isNaN(value = Number.parseFloat(value))){
                elem.classList.add('error');
                elem.nextElementSibling.innerText = '该项须为数字';
                error = true;
            }
            else if (check === 'name'){
                if (value === ''){
                    elem.classList.add('error');
                    elem.nextElementSibling.innerText = '名称不能为空';
                    error = true;
                }
                else if (!edit && cb.checkExists(type, value)){
                    elem.classList.add('error');
                    elem.nextElementSibling.innerText = '该名称已存在';
                    error = true;
                }
            }
            data[elem.getAttribute('data-prop-name')] = value;
        }
        if (!error){
            // config.addConfig(type, data.name, data);
            cb.run(data);
            closeAll();
        }
    });
});

export function onDialog(type, cb){
    dialogCBs[type] = cb;
}