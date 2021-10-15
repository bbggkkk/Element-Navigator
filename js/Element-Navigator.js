(function(){
    class ElementNavigator {
        constructor(root){
            this.root   = root;
            this.window = [];
            
            this.start     = 0;
            this.end       = () => document.documentElement.offsetWidth;
            
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
                item.classList.remove('removing');
                item.classList.remove('rebacking');
                item.gesture(false);
            });

            if(this.window.length > 0)
            this.bindWindowEvent(this.window,this.window.length-1);
        }

        bindWindowEvent($windowList,lng){
            const _this = this;
            const animation = 'window-backout';
            const $window   = $windowList[lng];
            const $windowBack = lng > 0 ? $windowList[lng-1] : null;
            $window.animation  = new KeyframeAnimation($window, window, animation, this.start, this.end);
            const gestureArea = $window.querySelector(':scope .gesture-area .back');

            if($windowBack !== null){
                $windowBack.animation = new KeyframeAnimation($windowBack, window, 'window-backin', this.start, this.end);
            }
            
            const dragOffset = 10;

            // $window.classList.add('notnew');
            
            let dragOn = false;
            if($windowBack !== null){
                $windowBack.gesture(false);
            }

            defineGesture();
            
            function defineGesture(){
                $window.gesture({
                    dragStart : (param,ele,evt) => {
                        $window.animation.goToAndStop(_this.start);
                        $window.classList.add('dragging');
                        if($windowBack !== null){
                            $windowBack.animation.goToAndStop(_this.start);
                            $windowBack.classList.add('dragging');
                        }
                        $window.addEventListener('transitionend',_this.endGesture);
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
                        if(!dragOn) return;
                        const [x, y]   = param.distance;
                        const [mx, my] = param.move;
                        const [dx, dy] = param.direction;

                        $window.gesture(false);
                        if($windowBack !== null){ 
                            $windowBack.gesture(false);
                        }
    
                        if((dx > 0 && mx > 20) || (mx <= 20 && x > document.documentElement.offsetWidth/2)){
                            _this.backWindow($window,$windowBack);
                        }else{
                            _this.rebackWindow($window,$windowBack);
                        }
    
                        dragOn = false;
                    }
                });
            }

            this.endGesture = (e) => {
                const ts = e.target;
                if($windowBack !== null){
                    $windowBack.classList.remove('removing');
                    $windowBack.classList.remove('rebacking');
                }
                if(ts.classList.contains('removing')){
                    ts.animation.unload();
                    ts.remove();
                }else{
                    defineGesture();
                    $window.classList.remove('removing');
                    $window.classList.remove('rebacking');
                }
            }

            // function reback($window,$windowBack){
            //     $window.classList.add('rebacking');
            //     $window.classList.remove('dragging');
                
            //     if($windowBack !== null){ 
            //         $windowBack.classList.add('recent');
            //         $windowBack.classList.add('rebacking');
            //         $windowBack.classList.remove('dragging');
            //     }

            // }
        }

        nodeToArray(node){
            const arr = [];
            for(let i=0; i<node.length; i++){
                arr.push(node[i]);
            }
            return arr;
        }
        back(){
            const $window = this.window[this.window.length-1];
            const $windowBack = this.window[this.window.length-2];
            if(this.window.length > 0){
                
                $window.gesture(false);
                if($windowBack !== null){ 
                    $windowBack.gesture(false);
                }
                $window.animation.goToAndStop(this.start);

                if($window !== null){
                    $window.animation.goToAndStop(this.start);
                }
                $window.addEventListener('transitionend',this.endGesture);
                this.backWindow($window,$windowBack);
            }
        }
        backWindow($window,$windowBack){
            $window.classList.add('removing');
            $window.classList.remove('dragging');

            if($windowBack !== null){ 
                $windowBack.classList.add('recent');
                $windowBack.classList.add('removing');
                $windowBack.classList.remove('dragging');
            }

        }
        reback(){
            this.rebackWindow(this.window[this.window.length-1],this.window[this.window.length-2]);
        }
        rebackWindow($window,$windowBack){
            $window.classList.add('rebacking');
            $window.classList.remove('dragging');
            
            if($windowBack !== null){ 
                $windowBack.classList.add('recent');
                $windowBack.classList.add('rebacking');
                $windowBack.classList.remove('dragging');
            }

        }
    }
    window.ElementNavigator = ElementNavigator;
})();
