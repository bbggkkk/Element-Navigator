(function(){
    class ElementNavigator {
        constructor(root){
            this.root   = root;
            this.window = [];
            this.init();
        }

        init(){
            const DOMObserver = new MutationObserver(this.defineWindow);
            DOMObserver.observe(this.root,{
                childList : true
            });
        }
        defineWindow = (changed) => {
            this.define(changed);
        }
        define(changed){
            this.windowNode    = this.root.querySelectorAll(':scope > .window');
            this.window        = this.nodeToArray(this.windowNode);

            this.window.forEach((item, idx) => {
                item.idx = idx;
                this.nodeToArray(item.querySelectorAll('[data-bind="idx"]')).forEach($item => {
                    $item.innerText = idx;
                });
            });

            if(this.window.length)
            this.bindWindowEvent(this.window,this.window.length-1);
        }

        bindWindowEvent($windowList,lng){
            const animation = 'window-backout';
            const start      = 0;
            const end       = () => document.documentElement.offsetWidth;
            const $window   = $windowList[lng];
            const $windowBack = lng > 0 ? $windowList[lng-1] : null;
            $window.animation  = new KeyframeAnimation($window, window, animation, start, end);
            const gestureArea = $window.querySelector(':scope .gesture-area .back');

            if($windowBack !== null){
                $windowBack.animation = new KeyframeAnimation($windowBack, window, 'window-backin', start, end);
            }
            
            const dragOffset = 10;

            // $window.classList.add('notnew');
            
            let dragOn = false;
            if($windowBack !== null){
                $windowBack.gesture(false);
            }
            $window.gesture({
                dragStart : (param,ele,evt) => {
                    $window.animation.goToAndStop(start);
                    $window.classList.add('dragging');
                    if($windowBack !== null){
                        $windowBack.animation.goToAndStop(start);
                        $windowBack.classList.add('dragging');
                    }
                    $window.addEventListener('transitionend',endGesture);
                },
                drag      : (param,ele,evt) => {
                    const [x, y] = param.distance;
                    const frame  = Math.round(x);
                    if(Math.abs(x) > dragOffset){ dragOn = true; }
                    if(dragOn){
                        $window.animation.goToAndStop(frame);
                        if($windowBack !== null){
                            $windowBack.animation.goToAndStop(frame);
                        }
                    }
                },
                dragEnd   : (param,ele,evt) => {
                    dragOn = false;
                    
                    const [x, y]   = param.distance;
                    const [mx, my] = param.move;
                    const [dx, dy] = param.direction;

                    if((dx > 0 && mx > 20) || (mx <= 20 && x > document.documentElement.offsetWidth/2)){
                        back($window,$windowBack);
                    }else{
                        reback($window,$windowBack);
                    }

                }
            });

            function endGesture(e){
                const ts = e.target;
                if($windowBack !== null){
                    $windowBack.classList.remove('removing');
                    $windowBack.classList.remove('rebacking');
                }
                if(ts.classList.contains('removing')){
                    ts.animation.unload();
                    $windowBack.gesture(false);
                    ts.remove();
                }else{
                    $window.classList.remove('removing');
                    $window.classList.remove('rebacking');
                }
            }
            function back($window,$windowBack){
                $window.classList.add('removing');
                $windowBack.classList.add('recent');
                $windowBack.classList.add('removing');

                $window.classList.remove('dragging');
                $windowBack.classList.remove('dragging');
            }
            function reback($window,$windowBack){
                $window.classList.add('rebacking');
                
                if($windowBack !== null){ 
                    $windowBack.classList.add('recent');
                    $windowBack.classList.add('rebacking');
                    $windowBack.classList.remove('dragging');
                }

                $window.classList.remove('dragging');
            }
        }

        nodeToArray(node){
            const arr = [];
            for(let i=0; i<node.length; i++){
                arr.push(node[i]);
            }
            return arr;
        }
    }
    window.ElementNavigator = ElementNavigator;
})();