(function(){


    const eventMap = {
        dragStart   : ['touchstart', 'mousedown'],
        drag        : ['touchmove', 'mousemove'],
        dragEnd     : ['touchend', 'mouseup']
    };

    let gestureData = {
        start       : [0, 0],
        distance    : [0, 0, 0],
        move        : [0, 0, 0],
        prePosition : [0, 0],
        position    : [0, 0],
        direction   : [0, 0],
        distanceAll : 0,
        type        : ''
    };
    let globalEvent = {};
    let gestureEnd  = false;
    
    const util = {
        bind : function($this, event){
            const fn = this.getEvent($this, event);
            $this.addEventListener('touchstart', globalEvent.touchstart, {passive:false});
            $this.addEventListener('mousedown', globalEvent.mousedown, {passive:false});
        },
        unbind : function($this, event){
            const eventList   = event === undefined ? ['dragStart', 'drag', 'dragEnd'] : event;
            this.removeEvent($this, eventList);
            const removeEventList = eventList.reduce((acc,item) => {
                acc[item] = () => {};
                return acc;
            },[]);
            // this.bind($this, removeEventList);
        },
        removeEvent : function($this, eventNameList){
            eventNameList.forEach(item => {
                eventMap[item].forEach(eventName => {
                    $this.removeEventListener(eventName, globalEvent[eventName]);
                });
            });
        },
        getEvent : function($this, event){
            const fn = {
                touchstart : (e) => {
                    const callback = event.dragStart;
                    eventFn.touchstart(e, callback, $this);
                },
                touchmove : (e) => {
                    const callback = event.drag;
                    eventFn.touchmove(e, callback, $this);
                },
                touchend : (e) => {
                    const callback = event.dragEnd;
                    eventFn.touchend(e, callback, $this);
                },
                mousedown : (e) => {
                    const callback = event.dragStart;
                    eventFn.mousedown(e, callback, $this);
                },
                mousemove : (e) => {
                    const callback = event.drag;
                    eventFn.mousemove(e, callback, $this);
                },
                mouseup : (e) => {
                    const callback = event.dragEnd;
                    eventFn.mouseup(e, callback, $this);
                },
            }
            globalEvent = fn;
            return fn;
        }
    }
    const eventFn = {
        touchstart : (e, callback, $this) => {
            gestureEnd = false;
            e.preventDefault();
            const data = {
                start       : [e.touches[0].clientX, e.touches[0].clientY],
                distance    : [0, 0, 0],
                move        : [0, 0, 0],
                position    : [e.touches[0].clientX, e.touches[0].clientY],
                prePosition : [e.touches[0].clientX, e.touches[0].clientY],
                direction   : [0, 0],
                distanceAll : 0,
                type        : 'dragStart'
            }
            gestureData = data;
            callback(data, $this, e);
            document.addEventListener('touchmove', globalEvent['touchmove'], {capture:false, passive:false});
            document.addEventListener('touchend', globalEvent['touchend']), {capture:false, passive:false};
        },
        touchmove : (e, callback, $this) => {
            requestAnimationFrame(() => {
                if(gestureEnd) return;
                e.preventDefault();
                const clientX   = e.touches[0].clientX,
                      clientY   = e.touches[0].clientY,
                      moveX     = gestureData ? clientX - gestureData.position[0] : 0,
                      moveY     = gestureData ? clientY - gestureData.position[1] : 0;
                const distance1 = clientX - gestureData.start[0];
                const distance2 = clientY - gestureData.start[1];
                const distance3 = Math.sqrt(Math.abs(distance1 * distance1) + Math.abs(distance2 * distance2));
                const move3     = Math.sqrt(Math.abs(moveX * moveX) + Math.abs(moveY * moveY));


                const data = {
                    start       : [gestureData.start[0], gestureData.start[1]],
                    distance    : [distance1, distance2, distance3],
                    move        : [moveX, moveY, move3],
                    position    : [clientX, clientY],
                    prePosition : [gestureData ? gestureData.position[0] : clientX, gestureData ? gestureData.position[1] : clientY],
                    direction   : [moveX > 0 ? 1 : moveX < 0 ? -1 : 0, moveY > 0 ? 1 : moveY < 0 ? -1 : 0],
                    distanceAll : gestureData ? gestureData.distanceAll + move3 : 0,
                    type        : 'drag'
                }
                gestureData = data;
                callback(data, $this, e);

            });
        },
        touchend : (e, callback, $this) => {
            gestureEnd = true;
            document.removeEventListener('touchmove', globalEvent['touchmove']);
            document.removeEventListener('touchend', globalEvent['touchend']);
            const data = Object.assign({}, gestureData, {type:'dragEnd'})
            gestureData = data;
            callback(data, $this, e);
        },
        mousedown : (e, callback, $this) => {
            gestureEnd = false;
            const data = {
                start       : [e.clientX, e.clientY],
                distance    : [0, 0, 0],
                move        : [0, 0, 0],
                position    : [e.clientX, e.clientY],
                prePosition : [e.clientX, e.clientY],
                direction   : [0, 0],
                distanceAll : 0,
                type        : 'dragStart'
            }
            gestureData = data;
            callback(data, $this, e);
            document.addEventListener('mousemove', globalEvent['mousemove'], {passive:false});
            document.addEventListener('mouseup', globalEvent['mouseup']), {passive:false};
        },
        mousemove : (e, callback, $this) => {
            e.preventDefault();
            requestAnimationFrame(() => {
                if(gestureEnd) return;
                const clientX   = e.clientX,
                      clientY   = e.clientY,
                      moveX     = e.movementX,
                      moveY     = e.movementY;
                const distance1 = clientX - gestureData.start[0];
                const distance2 = clientY - gestureData.start[1];
                const distance3 = Math.sqrt(Math.abs(distance1 * distance1) + Math.abs(distance2 * distance2));
                const move3     = Math.sqrt(Math.abs(moveX * moveX) + Math.abs(moveY * moveY));

                const data = {
                    start       : [gestureData.start[0], gestureData.start[1]],
                    distance    : [distance1, distance2, distance3],
                    move        : [moveX, moveY, move3],
                    position    : [clientX, clientY],
                    prePosition : [gestureData ? gestureData.position[0] : clientX, gestureData ? gestureData.position[1] : clientY],
                    direction   : [moveX > 0 ? 1 : moveX < 0 ? -1 : 0, moveY > 0 ? 1 : moveY < 0 ? -1 : 0],
                    distanceAll : gestureData ? gestureData.distanceAll + move3 : 0,
                    type        : 'drag'
                }
                gestureData = data;
                callback(data, $this, e);

            });
        },
        mouseup : (e, callback, $this) => {
            gestureEnd = true;
            document.removeEventListener('mousemove', globalEvent['mousemove']);
            document.removeEventListener('mouseup', globalEvent['mouseup']);
            const data = Object.assign({}, gestureData, {type:'dragEnd'})
            gestureData = data;
            callback(data, $this, e);
        },
    }

    HTMLElement.prototype.gesture = function({
        dragStart   = () => {},
        drag        = () => {},
        dragEnd     = () => {}
    }){
        util.bind(this, {
            dragStart,
            drag,
            dragEnd
        });
        
        return util;
    }


})();