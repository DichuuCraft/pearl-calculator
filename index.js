/// <reference path="./pearl.js"/>

(function(){
    'use strict';
    var PREC = 2;
    var Vec3 = pearl.Vec3;
    var Pearl = pearl.Pearl;
    var World = pearl.World;
    /**
     * 
     * @param {string} c 
     * @param {(n: HTMLElement) => any} cb 
     */
    function forEachClass(c, cb){
        for (var i = 0, _a = document.getElementsByClassName(c); i < _a.length; i++){
            cb(_a[i]);
        }
    }
    /**
     * 
     * @param {HTMLElement} n 
     */
    function clear(n){
        var c;
        while (c = n.lastChild) n.removeChild(c);
    }
    /** @returns {HTMLElement} */
    function _(name){
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
    forEachClass('btn-toggle-collapse', function(e){
        e.addEventListener('click', function(){
            var elem = document.getElementById(this.getAttribute('data-target'));
            if (elem.classList.contains('collapsed')){
                elem.classList.remove('collapsed');
            }
            else {
                elem.classList.add('collapsed');
            }
        });
    });

    var config = (function(){
        var container = document.getElementById('config-container');
        var configs = {};

        function getConfigElement(type, name){
            for (var i = 0, _a = container.children; i < _a.length; i++){
                var e = _a[i];
                if (e.getAttribute('data-type') === type && e.getAttribute('data-name') === name){
                    return e;
                }
            }
            return null;
        }
        function getConfig(type, name){
        }
        function getSelected(type){
            var elem = container.querySelector('.selected[data-type="' + type + '"]');
            if (elem){
                return configs[type][elem.getAttribute('data-name')];
            }
            return null;
        }

        function addConfig(type, name, data){
            var e = getConfigElement(type, name);
            if (!e){
                e = _('li');
                container.appendChild(e);
            }
            clear(e);
            e.setAttribute('data-type', type);
            e.setAttribute('data-name', name);
            (configs[type] = configs[type] || {})[name] = data;

            var select = _('button');
            select.innerText = name;
            select.classList.add('select');
            var edit = _('button');
            edit.innerText = '编辑';
            var del = _('button');
            del.innerText = '删除';
            del.addEventListener('click', function(){
                container.removeChild(e);
                delete configs[type][name];
            });
            select.addEventListener('click', function(){
                for (var i = 0, _a = container.querySelectorAll('[data-type="' + type + '"]'); i < _a.length; i++){
                    _a[i].classList.remove('selected');
                }
                e.classList.add('selected');
            });
            edit.addEventListener('click', function(){
                dialog.openEditDialog(type, data);
            });

            e.appendChild(select);
            e.appendChild(edit);
            e.appendChild(del);
            container.appendChild(e);
        }

        return {
            getConfig: getConfig,
            addConfig: addConfig,
            configExists: function(type, name){
                return getConfigElement(type, name) !== null;
            },
            getSelected: getSelected
        };
    })();

    var dialog = (function(){
        var modalOverlay = document.getElementById('modal-overlay');
        var dialogCBs = {};
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
        function openEditDialog(type, data){
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
        forEachClass('btn-show-dialog', function(e){
            e.addEventListener('click', function(){
                openDialog(document.getElementById(this.getAttribute('data-target')));
            });
        });

        forEachClass('dialog', function(e){
            e.getElementsByClassName('btn-dialog-close')[0].addEventListener('click', closeAll);
            var type = e.getAttribute('data-type');
            e.getElementsByClassName('btn-dialog-confirm')[0].addEventListener('click', function(){
                var data = {};
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
                        else if (!edit && config.configExists(type, value)){
                            elem.classList.add('error');
                            elem.nextElementSibling.innerText = '该名称已存在';
                            error = true;
                        }
                    }
                    data[elem.getAttribute('data-prop-name')] = value;
                }
                if (!error){
                    // config.addConfig(type, data.name, data);
                    dialogCBs[type] && dialogCBs[type](type, data);
                    closeAll();
                }
            });
        });

        return {
            openEditDialog: openEditDialog,
            /** @param {(type:string, data: any) => any} cb */
            onDialog: function(type, cb){
                dialogCBs[type] = cb;
            }
        };
    })();

    (function(){
        var world = new World();
        var result = document.getElementById('result-container');
        function appendInputItem(container, desc, placeholder){
            var div = document.createElement('div');
            var input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            var span = document.createElement('span');
            span.innerText = desc;
            div.appendChild(span);
            div.appendChild(input);
            div.classList.add('input-item');
            container.appendChild(div);
            return input;
        }
        function inputItem(desc, placeholder){
            var input = _('input');
            input.type = 'text';
            input.placeholder = placeholder;
            return input;
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
            else if (item instanceof Vec3){
                return '(' + item.x.toFixed(PREC) + ', ' + item.y.toFixed(PREC) + ', ' + item.z.toFixed(PREC) + ')';
            }
        }
        /** @param {HTMLElement} container */
        function convertResult(container, result){
            var info = _('div',
                '珍珠配置：',
                _('span', result.pearlConfigName),
                ', TNT配置：',
                _('span', result.tntConfigName)
            );
            var rt = result.resultTable;
            var table = _('table');
            for (var i = 0; i < rt.length; i++){
                var tr = _('tr'), row = rt[i];
                for (var j = 0; j < row.length; j++){
                    tr.appendChild(_(i === 0 ? 'th' : 'td', convertTableItem(row[j])));
                }
                table.appendChild(tr);
            }
            container.appendChild(info);
            container.appendChild(table);
        }

        function createResultItem(inputs, onClick){
            var elem, header, res, pl;
            result.appendChild(
                elem = _('li', header = _('div'), res = _('div', pl = _('div', '未计算')))
            );
            header.classList.add('header');
            res.classList.add('result');
            pl.classList.add('placeholder');

            var inputElements = {};
            for (var key in inputs){
                var e = inputs[key];
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
            
            del.addEventListener('click', function(){
                result.removeChild(elem);
            });
            btn.addEventListener('click', function(){
                onClick(inputElements, res);
            });
            collapse.addEventListener('click', function(){
                if (res.classList.contains('hidden')){
                    res.classList.remove('hidden');
                }
                else {
                    res.classList.add('hidden');
                }
            });
        }
        document.getElementById('btn-compute-tnt').addEventListener('click', function(){
            createResultItem({
                'px': ['目标x坐标', 'x'],
                'pz': ['目标z坐标', 'z'],
                'ticks': ['最大游戏刻数', 'ticks']
            }, function(inputs, res){
                var tntConfig = config.getSelected('tnt-config');
                var pearlConfig = config.getSelected('pearl-config');
                var pearl = world.createPearl(
                    new Vec3(pearlConfig.x, pearlConfig.y, pearlConfig.z),
                    new Vec3(pearlConfig.vx, pearlConfig.vy, pearlConfig.vz)
                ).step();
                var distination = new Vec3(Number(inputs.px.value), /* dummy */0, Number(inputs.pz.value));
                var tnt = world.createTntLauncher(pearl, new Vec3(tntConfig.x1, tntConfig.y1, tntConfig.z1), new Vec3(tntConfig.x2, tntConfig.y2, tntConfig.z2));
                
                var resultTable = [
                    ['游戏刻', '初速度', 'TNT用量', '实际到达坐标', '误差距离']
                ];
                for (var i = 1; i <= Number(inputs.ticks.value); i++){
                    var velocity = tnt.solveInitialVelocity(distination, i);
                    var tntAmount = tnt.solveTNTAmount(velocity);
                    var n1 = tntAmount[0], n2 = tntAmount[1];
                    if (n1 >= 0 && n2 >= 0){
                        n1 |= 0;
                        n2 |= 0;
                        var tntAmounts = [
                            [n1, n2], [n1 + 1, n2], [n1, n2 + 1], [n1 + 1, n2 + 1]
                        ];
                        var selected = 0, selectedDistance = 0, selectedPos;
                        for (var j = 0, _a = tntAmounts; j < _a.length; j++){
                            var v = tnt.getInitialVelocity(_a[j][0], _a[j][1]);
                            var actualPos = world.createPearlTrajectory(pearl.r0, v).getPosition(i);
                            var d = actualPos.distance2d2(distination);
                            if (j === 0 || d < selectedDistance){
                                velocity = v;
                                selected = j;
                                selectedDistance = d;
                                selectedPos = actualPos;
                            }
                        }
                        resultTable.push([
                            i, velocity, tntAmounts[selected], selectedPos, Math.sqrt(selectedDistance)
                        ]);
                    }
                    else {
                        resultTable.push([
                            i, velocity, tntAmount, '(无意义)', '(无意义)'
                        ]);
                    }
                }
                var result = {
                    type: 'compute-tnt',
                    tntConfigName: tntConfig.name,
                    pearlConfigName: pearlConfig.name,
                    resultTable: resultTable
                };
                clear(res);

                convertResult(res, result);
            });
        });
        document.getElementById('btn-compute-pearl-trajectory').addEventListener('click', function(){
            createResultItem({
                'n1': ['TNT数量1', 'TNT 1'],
                'n2': ['TNT数量2', 'TNT 2'],
                'ticks': ['游戏刻数', 'ticks']
            }, function(inputs, res){
                var tntConfig = config.getSelected('tnt-config');
                var pearlConfig = config.getSelected('pearl-config');
                var pearl = world.createPearl(
                    new Vec3(pearlConfig.x, pearlConfig.y, pearlConfig.z),
                    new Vec3(pearlConfig.vx, pearlConfig.vy, pearlConfig.vz)
                ).step();
                var tnt = world.createTntLauncher(pearl, new Vec3(tntConfig.x1, tntConfig.y1, tntConfig.z1), new Vec3(tntConfig.x2, tntConfig.y2, tntConfig.z2));
                var v0 = tnt.getInitialVelocity(Number(inputs.n1.value), Number(inputs.n2.value));
                var traj = world.createPearlTrajectory(pearl.r0, v0.add(pearl.v0));
                var resultTable = [
                    ['游戏刻', '速度', '位置', '区块位置']
                ];
                for (var i = 0; i <= Number(inputs.ticks.value); i++){
                    var v = traj.getVelocity(i), pos = traj.getPosition(i);
                    resultTable.push([i, v, pos, [pos.x >> 4, pos.z >> 4]]);
                }
                var result = {
                    type: 'compute-trajectory',
                    tntConfigName: tntConfig.name,
                    pearlConfigName: pearlConfig.name,
                    resultTable: resultTable
                };
                clear(res);

                convertResult(res, result);
            });
        });
    })();

    forEachClass('popup-container', function(c){
        var target = c.getElementsByTagName('ul')[0];
        c.getElementsByTagName('button')[0].addEventListener('click', function(){
            if (target.classList.contains('show')){
                target.classList.remove('show');
            }
            else {
                target.classList.add('show');
            }
        });
    });

    function showAlert(msg, delay){
        var m = document.getElementById('alert-message');
        m.innerText = msg;
        m.classList.add('show');
        setTimeout(function(){
            m.classList.remove('show');
        }, delay || 5);
    }
    
    var tntConfigName2Prop = {
        'tnt-config-x1': 'x1'
    };

    for (var i = 0, _a = ['tnt-config', 'pearl-config']; i < _a.length; i++){
        dialog.onDialog(_a[i], function(type, data){
            config.addConfig(type, data.name, data);
        });
    }


})();