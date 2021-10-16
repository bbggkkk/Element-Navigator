(function(){

    HTMLElement.prototype.gesture = ({
        dragStart,
        drag,
        dragEnd
    }) => {
        console.log(this);

    }

})();