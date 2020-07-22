import { toggleClass, forEachClass, _, clear } from './util';
import { World } from './lib/pearl';
import { addResultData, modifyResultData, removeResultData, getAllResultData } from './db';
import { confirm } from './dialog';

import tntAmount from './calculators/tnt_amount';
import pearlTrajectory from './calculators/pearl_trajectory';

var world = new World();
var result = document.getElementById('result-container');
var calcs = {};
var PREC = 2;

function isVec3(a){
    return a.x !== void 0 && a.y !== void 0 && a.z !== void 0;
}

function convertTableItem(item){
    if (typeof item === 'string' || typeof item === 'number'){
        return item;
    }
    else if (Array.isArray(item)){
        var s = '[';
        for (var i = 0; i < item.length; i++){
            i > 0 && (s += ', ');
            s += item[i].toString();
        }
        s += ']';
        return s;
    }
    else if (isVec3(item)){
        return '(' + item.x.toFixed(PREC) + ', ' + item.y.toFixed(PREC) + ', ' + item.z.toFixed(PREC) + ')';
    }
}

var results = [];

function ResultItem(type, inputs, run){
    this.type = type;
    this.inputs = inputs;
    this.run = run;
    this.data = null;
    this.dataId = null;

    this.inputElements = {};

    var pl;
    this.res = _('div', pl = _('div', '未计算'));
    this.res.classList.add('result');
    pl.classList.add('placeholder');
}
ResultItem.prototype.render = function(root){
    var elem, header, res = this.res;
    root.appendChild(
        elem = _('li', header = _('div'), res)
    );
    header.classList.add('header');

    var inputElements = this.inputElements = {};
    for (var key in this.inputs){
        var e = this.inputs[key];
        var div, input;
        header.appendChild(
            div = _('div',
                _('span', e[0]),
                input = _('input')
            )
        );
        input.placeholder = e[1];
        input.type = 'text';
        div.classList.add('input-item');
        inputElements[key] = input;
    }
    var btn = _('button');
    var del = _('button');
    var collapse = _('button');
    btn.innerText = '计算';
    del.innerText = '删除';
    collapse.innerText = '显示/隐藏';
    var d;
    header.appendChild(
        d = _('div', btn, del, collapse)
    );
    d.classList.add('button-container');
    
    var cela = this;
    del.addEventListener('click', function(){
        confirm('是否删除？', function(){
            result.removeChild(elem);
            removeResultData(cela.dataId);
        });
    });
    btn.addEventListener('click', function(){
        var r = cela.run;
        var inputValues = {};
        for (var k in inputElements){
            inputValues[k] = Number(inputElements[k].value);
        }
        r = r(world, inputValues);
        r.type = cela.type;
        r.inputValues = inputValues;
        
        if (cela.data){
            modifyResultData(cela.dataId, r);
        }
        else {
            addResultData(r, function(key){
                cela.dataId = key;
            });
        }
        
        cela.data = r;
        cela.updateResult();
        res.classList.remove('hidden');
    });
    collapse.addEventListener('click', function(){
        toggleClass(res, 'hidden');
    });
}
ResultItem.prototype.updateInput = function(){
    for (var k in this.inputElements){
        this.inputElements[k].value = this.data.inputValues[k];
    }
}
ResultItem.prototype.updateResult = function(){
    var data = this.data;
    var info = _('div',
        '珍珠配置：',
        _('span', data.pearlConfigName),
        ', TNT配置：',
        _('span', data.tntConfigName)
    );
    info.classList.add('info');
    var rt = data.resultTable;
    var table = _('table');
    for (var i = 0; i < rt.length; i++){
        var tr = _('tr'), row = rt[i];
        for (var j = 0; j < row.length; j++){
            tr.appendChild(_(i === 0 ? 'th' : 'td', convertTableItem(row[j])));
        }
        table.appendChild(tr);
    }
    clear(this.res);
    this.res.appendChild(info);
    this.res.appendChild(table);
}
ResultItem.prototype.fromData = function(data){
    this.data = data;
    this.updateInput();
    this.updateResult();
}

var calcs = {};
function register(a){
    calcs[a.type] = a;
}
function createItem(type){
    var a = calcs[type];
    if (a){
        var item = new ResultItem(type, a.inputs, a.run);
        item.render(result);
        return item;
    }
}

register(tntAmount);
register(pearlTrajectory);

forEachClass('btn-compute', function(n){
    n.addEventListener('click', function(){
        var type = n.getAttribute('data-type');
        createItem(type);
    });
});

getAllResultData(function(data, key){
    var item = createItem(data.type);
    item.dataId = key;
    item.fromData(data);
});