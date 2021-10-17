(function(){
    class ElementNavigator {
        constructor(root){
            this.root   = root;
            this.window = [];
            
            this.duration  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed'))*1000; 
            this.start     = 0;
            this.isTransition = false;
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

            if(this.window.length > 0){
                this.topWindow.onloaded();
                this.bindWindowEvent(this.topWindow, this.backWindow);
            }
        }
        bindWindowEvent(top, back){
            const isBack        = back !== undefined;
            const animation     = top.getAttribute('data-window-in') ? top.getAttribute('data-window-in') : 'window-backout';
            const bAnimation    = top.getAttribute('data-window-out') ? top.getAttribute('data-window-out') : 'window-backin';

            const topAnimation  = new KeyframeAnimation(top, window, animation, this.start, this.end);
            const gestureArea   = top.querySelector(':scope .gesture-area-back');
            const backAnimation = isBack ? new KeyframeAnimation(back, window, bAnimation, this.start, this.end) : undefined;

            this.topGestureArea = gestureArea;

            this.window.forEach(item => {
                item.removeEventListener('transitionend', this.endTransitionWrap);
                item.classList.remove('dragging');
                item.classList.remove('removing');
                item.classList.remove('rebacking');
                this.unbindGesture(item);
            })
            

            const itemTopAnimation = this.nodeToArray(top.querySelectorAll(':scope .data-navigating-animation')).map(item => {
                item.animation = new KeyframeAnimation(item, window, item.getAttribute('data-navigating-animation-out'), this.start, this.end);
                return item;
            });
            let itemBackAnimation = []; 
            const dragOffset    = 10;

            if(isBack){
                itemBackAnimation = this.nodeToArray(back.querySelectorAll(':scope .data-navigating-animation')).map(item => {
                    item.animation.unload();
                    item.animation = new KeyframeAnimation(item, window, item.getAttribute('data-navigating-animation-in'), this.start, this.end);
                    return item;
                });
            }

            this.topAnimation = topAnimation;
            this.backAnimation = backAnimation;
            this.itemTopAnimation = itemTopAnimation;
            this.itemBackAnimation = itemBackAnimation;
            
            top.addEventListener('transitionend', this.endTransitionWrap);
            this.endTransition();
            if(!top.classList.contains('recent')){
                top.addEventListener('animationend', this.endAnimationWrap);
                this.isTransition  = true;
            }
            this.bindGesture(top, back, topAnimation, backAnimation, gestureArea, dragOffset, isBack, itemTopAnimation, itemBackAnimation);
        }
        bindGesture(top, back, topAnimation, backAnimation, gestureArea, dragOffset, isBack, itemTopAnimation, itemBackAnimation){
            let isDrag        = false;

            top.gst = gestureArea.gesture({
                dragStart : (param,ele,evt) => {
                    if(this.isTransition)       return;
                    top.classList.add('dragging');
                    topAnimation.goToAndStop(this.start);
                    if(isBack){
                        back.classList.add('dragging');
                        backAnimation.goToAndStop(this.start);
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
                    if(this.isTransition)       return;
                    if(!isDrag)                 return;
                    this.isTransition = true;

                    const [x, y]   = param.distance;
                    const [mx, my] = param.move;
                    const [dx, dy] = param.direction;

                    if((dx > 0 && mx > 10) || (mx <= 10 && x > document.documentElement.offsetWidth/2)){
                        this.removeWindow(top, back);
                    }else{
                        this.rebackWindow(top,back);
                    }
                    isDrag = false;
                }
            });
        }
        unbindGesture(back){
            if(back.gst !== undefined){
                back.gst.unbind(back.querySelector(':scope .gesture-area-back'));
                back.gst = undefined;
            }
        }
        
        endAnimationWrap = () => {
            this.endAnimation();
        }
        endAnimation(){
            this.isTransition = false;
            top.removeEventListener('animationend', this.endAnimationWrap);
        }

        endTransitionWrap = () => {
            this.endTransition();    
        }
        endTransition(){
            if(this.backWindow !== undefined){
                this.backWindow.classList.remove('rebacking');
                this.backWindow.classList.remove('removing');
                this.backWindow.classList.remove('dragging');
            }
            if(this.topWindow.classList.contains('removing')){
                this.topWindow.removeEventListener('transitionend', this.endTransitionWrap);
                this.topWindow.remove();
            }else{
                this.topWindow.classList.remove('dragging');
                this.topWindow.classList.remove('rebacking');
            }
            this.isTransition = false;
        }

        removeWindow(top, back){
            this.unbindGesture(top);
            top.classList.remove('dragging');
            this.topAnimation.goToAndStop(this.topAnimation.scrollDiff);
            top.classList.add('removing');
            
            if(back !== undefined){ 
                back.classList.remove('dragging');
                back.classList.add('recent');
                this.backAnimation.goToAndStop(this.backAnimation.scrollDiff);
                back.classList.add('removing');
            }

            this.itemTopAnimation.forEach(item => {
                const ani   = item.animation;
                ani.goToAndStop(ani.scrollDiff);
            });
            this.itemBackAnimation.forEach(item => {
                const ani   = item.animation;
                ani.goToAndStop(ani.scrollDiff);
            });
        }
        rebackWindow(top, back){
            top.classList.remove('dragging');
            top.classList.add('rebacking');
            this.topAnimation.goToAndStop(0);
            
            if(back !== undefined){ 
                back.classList.remove('dragging');
                back.classList.add('recent');
                this.backAnimation.goToAndStop(0);
                back.classList.add('rebacking');
            }
            this.itemTopAnimation.forEach(item => {
                const ani   = item.animation;
                ani.goToAndStop(0);
            });
            this.itemBackAnimation.forEach(item => {
                const ani   = item.animation;
                ani.goToAndStop(0);
            });
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
