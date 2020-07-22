import { forEachClass, toggleClass } from './util';

function onclick(){

}

forEachClass('popup-container', function(c){
    var target = c.getElementsByTagName('ul')[0];
    function onclick(){
        target.classList.remove('show');
        window.removeEventListener('click', onclick);
    }
    c.getElementsByTagName('button')[0].addEventListener('click', function(){
        target.classList.add('show');
        setTimeout(function() {
            window.addEventListener('click', onclick);
        }, 0);
        return true;
    });
});