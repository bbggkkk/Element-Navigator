(function(){
    const nv = document.body;
    const navigator = new ElementNavigator(nv);
    window.elementNavigator = navigator;
    
    HTMLElement.prototype.onloaded = function(){
        const bindEventItems = Array.from(this.querySelectorAll('[bind-event]'));
        bindEventItems.forEach(item => {
            item.bindClick(new Function(item.getAttribute('bind-event')).bind(item));
        });
    }
    
    HTMLElement.prototype.bindClick = function(fn){
        let isClicked = false;
        const clickEvent = (e) => {
            if(e.type === 'touchend'){
                const touchTarget =  e.changedTouches[0];
                if(document.elementFromPoint(touchTarget.clientX, touchTarget.clientY) !== this){
                    isClicked = false;
                }
            }
            if(isClicked) {
                fn(e);
            }
            isClicked = false;
        }
        this.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isClicked = true;
        });
        this.addEventListener('touchend', clickEvent);
    
        this.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isClicked = true;
        });
        this.addEventListener('mouseup', clickEvent);
    }

    document.querySelector('#button').bindClick((e) => {
        if(window.elementNavigator.isTransition)    return;
        document.body.append(document.importNode(document.querySelector('template#x').content,true));
    });
    document.querySelector('#button-y').bindClick((e) => {
        if(window.elementNavigator.isTransition)    return;
        document.body.append(document.importNode(document.querySelector('template#y').content,true));
    });

})();