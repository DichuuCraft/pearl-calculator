import { openEditDialog, onDialog, confirm } from './dialog';
import { _, clear } from './util';
import { addConfigData, getAllConfigData, modifyConfigData, removeConfigData } from './db';

var container = document.getElementById('config-container');
var configs = {};

function getConfigElement(type, name){
    return container.querySelector('li[data-type="' + type + '"][data-name="' + name + '"]');
}
function getConfig(type, name){
}
export function getSelected(type){
    var elem = container.querySelector('li.selected[data-type="' + type + '"]');
    if (elem){
        return configs[type][elem.getAttribute('data-name')];
    }
    return null;
}

export function addConfig(data, updateDB){
    updateDB = updateDB === void 0 ? true : updateDB;
    var type = data.type, name = data.name;
    var e = getConfigElement(type, name);
    if (e === null){
        e = _('li');
        if (!container.querySelector('li[data-type="' + type + '"]')){
            e.classList.add('selected');
        }
        container.appendChild(e);
    }
    clear(e);
    e.setAttribute('data-type', type);
    e.setAttribute('data-name', name);
    var cfg = configs[type] = configs[type] || {};
    if (updateDB){
        if (cfg[name]){
            modifyConfigData(data);
        }
        else {
            addConfigData(data);
        }
    }
    cfg[name] = data;

    var select = _('button');
    select.innerText = name;
    select.classList.add('select');
    var edit = _('button');
    edit.innerText = '编辑';
    var del = _('button');
    del.innerText = '删除';
    del.addEventListener('click', function(){
        confirm('确定要删除配置' + name + '?', function(){
            container.removeChild(e);
            removeConfigData(configs[type][name]);
            delete configs[type][name];
        });
    });
    select.addEventListener('click', function(){
        for (var i = 0, _a = container.querySelectorAll('[data-type="' + type + '"]'); i < _a.length; i++){
            _a[i].classList.remove('selected');
        }
        e.classList.add('selected');
    });
    edit.addEventListener('click', function(){
        openEditDialog(type, data);
    });

    e.appendChild(select);
    e.appendChild(edit);
    e.appendChild(del);
}

function configExists(type, name){
    return getConfigElement(type, name) !== null;
}

for (var i = 0, _a = ['tnt-config', 'pearl-config']; i < _a.length; i++){
    onDialog(_a[i], { 
        checkExists: configExists,
        run: function(data){
            addConfig(data);
        }
    });
}

getAllConfigData(function(data){
    addConfig(data, false);
});