"use strict";
/**
 *
 *
필요값


drag

시작지점
startX,startY

시작으로부터 현재까지의 이동거리
distanceX,distanceY,distance

이전 틱과의 이동거리
moveX,moveY,move

현재 위치
positionX,positionY

이전 위치
prePositionX,prePositionY

속도 (기준 잡아야함 (ex. 초당 이동한 픽셀))
speedX,speedY,speed

이동 방향
direction

총 이동거리
distanceAll

*/
HTMLElement.prototype.gesture = function ($event) {
    var _this = this;
    var eventMap = {
        mousedown: 'dragStart',
        touchstart: 'dragStart',
        mousemove: 'drag',
        touchmove: 'drag',
        mouseup: 'dragEnd',
        touchend: 'dragEnd',
    };
    var type = Object.keys($event);
    this.gestureData = {};
    var md = function (event) {
        var mousemove = function (event) {
            requestAnimationFrame(function () {
                var clientX = event.clientX, clientY = event.clientY, moveX = event.movementX, moveY = event.movementY;
                var distance1 = clientX - _this.gestureData.dragStart.start[0];
                var distance2 = clientY - _this.gestureData.dragStart.start[1];
                var distance3 = Math.sqrt(Math.abs(distance1 * distance1) + Math.abs(distance2 * distance2));
                var move3 = Math.sqrt(Math.abs(moveX * moveX) + Math.abs(moveY * moveY));
                _this.gestureData.drag = {
                    start: _this.gestureData.dragStart.start,
                    // offset      : this.gestureData.dragStart.offset,
                    distance: [
                        distance1,
                        distance2,
                        distance3
                    ],
                    move: [
                        moveX,
                        moveY,
                        move3
                    ],
                    prePosition: [
                        _this.gestureData.drag ? _this.gestureData.drag.position[0] : clientX,
                        _this.gestureData.drag ? _this.gestureData.drag.position[1] : clientY
                    ],
                    position: [
                        clientX,
                        clientY
                    ],
                    direction: [
                        moveX > 0 ? 1 : moveX < 0 ? -1 : 0,
                        moveY > 0 ? 1 : moveY < 0 ? -1 : 0
                    ],
                    distanceAll: _this.gestureData.drag ? _this.gestureData.drag.distanceAll + move3 : 0,
                    type: 'drag'
                };
                if ($event[eventMap[event.type]] && eventMap[event.type] === 'drag') {
                    $event[eventMap[event.type]](_this.gestureData.drag, _this, event);
                }
            });
        };
        var mouseup = function (event) {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if ($event[eventMap[event.type]] && eventMap[event.type] === 'dragEnd') {
                _this.gestureData.dragEnd = _this.gestureData.drag ? _this.gestureData.drag : _this.gestureData.dragStart;
                _this.gestureData.dragEnd.type = 'dragEnd';
                $event[eventMap[event.type]](_this.gestureData.dragEnd, _this, event);
            }
            _this.gestureData.drag && (_this.gestureData.drag = undefined);
        };
        _this.gestureData.dragStart = {
            start: [event.clientX, event.clientY],
            // offset      : [event.offsetX,event.offsetY],
            distance: [0, 0, 0],
            move: [0, 0, 0],
            position: [event.clientX, event.clientY],
            prePosition: [event.clientX, event.clientY],
            direction: [0, 0],
            distanceAll: 0,
            type: 'dragStart'
        };
        if ($event[eventMap[event.type]] && eventMap[event.type] === 'dragStart') {
            $event[eventMap[event.type]](_this.gestureData.dragStart, _this, event);
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    };
    var td = function (event) {
        var touchmove = function (event) {
            requestAnimationFrame(function () {
                if (event.cancelable) {
                    event.preventDefault();
                }
                var clientX = event.touches[0].clientX;
                var clientY = event.touches[0].clientY;
                var moveX = _this.gestureData.drag ? clientX - _this.gestureData.drag.position[0] : 0;
                var moveY = _this.gestureData.drag ? clientY - _this.gestureData.drag.position[1] : 0;
                var distance1 = clientX - _this.gestureData.dragStart.start[0];
                var distance2 = clientY - _this.gestureData.dragStart.start[1];
                var distance3 = Math.sqrt(Math.abs(distance1 * distance1) + Math.abs(distance2 * distance2));
                var move3 = Math.sqrt(Math.abs(moveX * moveX) + Math.abs(moveY * moveY));
                _this.gestureData.drag = {
                    start: _this.gestureData.dragStart.start,
                    // offset      : this.gestureData.dragStart.offset,
                    distance: [
                        distance1,
                        distance2,
                        distance3
                    ],
                    move: [
                        moveX,
                        moveY,
                        move3
                    ],
                    prePosition: [
                        _this.gestureData.drag ? _this.gestureData.drag.position[0] : clientX,
                        _this.gestureData.drag ? _this.gestureData.drag.position[1] : clientY
                    ],
                    position: [
                        clientX,
                        clientY
                    ],
                    direction: [
                        moveX > 0 ? 1 : moveX < 0 ? -1 : 0,
                        moveY > 0 ? 1 : moveY < 0 ? -1 : 0
                    ],
                    distanceAll: _this.gestureData.drag ? _this.gestureData.drag.distanceAll + move3 : 0,
                    type: 'drag'
                };
                if ($event[eventMap[event.type]] && eventMap[event.type] === 'drag') {
                    $event[eventMap[event.type]](_this.gestureData.drag, _this, event);
                }
            });
        };
        var touchend = function (event) {
            // if (event.cancelable) {
            //     event.preventDefault();
            // }
            document.removeEventListener('touchmove', touchmove);
            document.removeEventListener('touchend', touchend);
            if ($event[eventMap[event.type]] && eventMap[event.type] === 'dragEnd') {
                // console.log(_this.gestureData,_this.gestureData.dragEnd);
                _this.gestureData.dragEnd = _this.gestureData.drag ? _this.gestureData.drag : _this.gestureData.dragStart;
                _this.gestureData.dragEnd.type = 'dragEnd';
                $event[eventMap[event.type]](_this.gestureData.dragEnd, _this, event);
            }
            _this.gestureData.drag && (_this.gestureData.drag = undefined);
        };
        var clientX = event.touches[0].clientX;
        var clientY = event.touches[0].clientY;
        _this.gestureData.dragStart = {
            start: [clientX, clientY],
            // offset      : [offsetX,offsetY],
            distance: [0, 0, 0],
            move: [0, 0, 0],
            position: [clientX, clientY],
            prePosition: [clientX, clientY],
            direction: [0, 0],
            distanceAll: 0,
            type: 'dragStart'
        };
        if ($event[eventMap[event.type]] && eventMap[event.type] === 'dragStart') {
            $event[eventMap[event.type]](_this.gestureData.dragStart, _this, event);
        }
        document.addEventListener('touchmove', touchmove);
        document.addEventListener('touchend', touchend);
    };
    if ($event === false) {
        this.removeEventListener('mousedown', md);
        this.removeEventListener('touchstart', td);
        return;
    }
    this.addEventListener('mousedown', md, { passive: true });
    this.addEventListener('touchstart', td, { passive: true });
};
//# sourceMappingURL=elementGesture.js.map