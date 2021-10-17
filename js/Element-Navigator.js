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
        defineWindow = (mutationEvent) => {
            this.windowNode    = this.root.querySelectorAll(':scope > .window');
            this.window        = this.nodeToArray(this.windowNode);
            this.topWindow     = this.window[this.window.length-1];
            this.backWindow    = this.window[this.window.length-2];

            this.window.forEach((item, idx) => {
                item.idx = idx;
                this.nodeToArray(item.querySelectorAll('[data-bind="idx"]')).forEach($item => {
                    $item.innerText = idx;
                });
                item.classList.remove('removing');
                item.classList.remove('rebacking');
                // item.gesture(false);
            });

            if(this.window.length > 0)
            this.bindWindowEvent(this.topWindow, this.backWindow);
        }
        bindWindowEvent(top, back){
            const isBack        = back !== undefined;
            const animation     = 'window-backout';
            const bAnimation    = 'window-backin';

            const topAnimation  = new KeyframeAnimation(top, window, animation, this.start, this.end);
            const gestureArea   = top.querySelector(':scope .gesture-area .back');
            const backAnimation = isBack ? new KeyframeAnimation(back, window, bAnimation, this.start, this.end) : undefined;

            const itemTopAnimation = this.nodeToArray(top.querySelectorAll(':scope .navigator-animation-item')).map(item => {
                item.animation = new KeyframeAnimation(item, window, animation+'-item', this.start, this.end);
                return item;
            });
            let itemBackAnimation = []; 
            const dragOffset    = 10;

            if(isBack){
                back.removeEventListener('transitionend',   this.endTransitionWrap);
                back.gst.unbind(back);
                itemBackAnimation = this.nodeToArray(back.querySelectorAll(':scope .navigator-animation-item')).map(item => {
                    item.animation = new KeyframeAnimation(item, window, bAnimation+'-item', this.start, this.end);
                    return item;
                });
            }

            this.itemTopAnimation = itemTopAnimation;
            this.itemBackAnimation = itemBackAnimation;
            
            top.addEventListener('transitionend',   this.endTransitionWrap);
            this.bindGesture(top, back, topAnimation, backAnimation, gestureArea, dragOffset, isBack, itemTopAnimation, itemBackAnimation);
            
        }
        bindGesture(top, back, topAnimation, backAnimation, gestureArea, dragOffset, isBack, itemTopAnimation, itemBackAnimation){
            let isDrag        = false;
            this.isTransition = false;
            
            top.gst = gestureArea.gesture({
                dragStart : (param,ele,evt) => {
                    if(this.isTransition)    return;
                    topAnimation.goToAndStop(this.start);
                    top.classList.add('dragging');
                    if(isBack){
                        backAnimation.goToAndStop(this.start);
                        back.classList.add('dragging');
                    }

                    itemTopAnimation.forEach(item => item.animation.goToAndStop(this.start));
                    itemBackAnimation.forEach(item => item.animation.goToAndStop(this.start));
                },
                drag      : (param,ele,evt) => {
                    if(this.isTransition)    return;
                    const [x, y] = param.distance;
                    const frame  = Math.round(x);
                    if(Math.abs(x) > dragOffset){
                        isDrag = true;
                    }
                    if(isDrag){
                        topAnimation.goToAndStop(frame);
                        if(isBack){
                            backAnimation.goToAndStop(frame);
                        }
                        itemTopAnimation.forEach(item => item.animation.goToAndStop(frame));
                        itemBackAnimation.forEach(item => item.animation.goToAndStop(frame));
                    }
                },
                dragEnd   : (param,ele,evt) => {
                    if(this.isTransition)    return;
                    if(!isDrag) return;

                    const [x, y]   = param.distance;
                    const [mx, my] = param.move;
                    const [dx, dy] = param.direction;

                    if((dx > 0 && mx > 10) || (mx <= 10 && x > document.documentElement.offsetWidth/2)){
                        this.removeWindow(top, back);
                    }else{
                        this.rebackWindow(top,back);
                    }
                    this.isTransition = true;
                    isDrag = false;
                }
            });

        }
        
        endTransitionWrap = () => {
            this.endTransition();    
        }
        endTransition(){
            if(this.topWindow.classList.contains('removing')){
                this.topWindow.removeEventListener('transitionend', this.endTransitionWrap);
                this.topWindow.remove();
            }else{
                this.topWindow.classList.remove('rebacking');
                if(this.backWindow !== undefined){
                    this.backWindow.classList.remove('rebacking');
                }
            }
            this.isTransition = false;
        }

        removeWindow(top, back){
            top.classList.add('removing');
            top.classList.remove('dragging');
            
            if(back !== undefined){ 
                back.classList.add('recent');
                back.classList.add('removing');
                back.classList.remove('dragging');
            }
        }
        rebackWindow(top, back){
            top.classList.add('rebacking');
            top.classList.remove('dragging');
            
            if(back !== undefined){ 
                back.classList.add('recent');
                back.classList.add('rebacking');
                back.classList.remove('dragging');
            }
        }

        back(){
            this.removeWindow(this.topWindow, this.backWindow);
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
