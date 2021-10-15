(function(){
    const nv = document.body;
    const navigator = new ElementNavigator(nv);
    window.navigator = navigator;
    console.log(navigator);
})();