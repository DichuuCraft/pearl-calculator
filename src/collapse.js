import { forEachClass, toggleClass } from './util';

forEachClass('btn-toggle-collapse', function(e){
    e.addEventListener('click', function(){
        var elem = document.getElementById(this.getAttribute('data-target'));
        toggleClass(elem, 'collapsed');
    });
});