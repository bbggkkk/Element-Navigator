(function(){
    const nv = document.body;
    const navigator = new ElementNavigator(nv);
    window.elementNavigator = navigator;

    // const element = document.querySelector('#test');
    // element.gesture({
    //     dragStart:(param, ele, evt) => {
    //         console.log(param.type, param)
    //     },
    //     drag:(param, ele, evt) => {
    //         console.log(param.type, param)
    //     },
    //     dragEnd:(param, ele, evt) => {
    //         console.log(param.type, param)
    //     }
    // });

    // const btn = document.querySelector('#button');
    // btn.addEventListener('click',(e) => {
    //     console.log(e);
    // });
})();