(function(){

    HTMLElement.prototype.gesture = function({
        dragStart,
        drag,
        dragEnd
    }){
        console.log(this);

    }

})();