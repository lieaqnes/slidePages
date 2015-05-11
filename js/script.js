function Slider(container) {
    // quit if no root element
    if (!container) return;// check browser capabilities
    var browser = {
        addEventListener: !!window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transitions: (function (temp) {
            var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
            for (var i in props) if (temp.style[ props[i] ] !== undefined) return true;
            return false;
        })(document.createElement('swipe'))
    };
    var element = this.element = container.children[0];

    var slides, slidePos, height;
    var index = 0;
    var speed = 300;

    // setup event capturing
    var events = {
        handleEvent: function (event) {
            switch (event.type) {
                case 'touchstart':
                    this.start(event);
                    break;
                case 'touchmove':
                    this.move(event);
                    break;
                case 'touchend':
                    this.end(event);
                    break;
            }
            event.stopPropagation();
        },
        context: {
            start: {},
            delta: {}
        },
        start: function (event) {
            var touches = event.touches[0];
            // measure start values
            this.context.start = {
                // get initial touch coords
                x: touches.pageX,
                y: touches.pageY,
                // store time to determine touch duration
                time: +new Date
            };
            // reset delta and end measurements
            this.context.delta = {};

            // attach touchmove and touchend listeners
            element.addEventListener('touchmove', this, false);
            element.addEventListener('touchend', this, false);

        },
        move: function (event) {
            //alert("move");
            // ensure swiping with one touch and not pinching
            if (event.touches.length > 1 || event.scale && event.scale !== 1) return;

            //if (options.disableScroll)
            event.preventDefault();

            var touches = event.touches[0];

            // measure change in x and y
            this.context.delta = {
                x: touches.pageX - this.context.start.x,
                y: touches.pageY - this.context.start.y
            };

            this.context.delta.y =
                this.context.delta.y /
                ( (!index && this.context.delta.y > 0               // if first slide and sliding left
                    || index == slides.length - 1        // or if last slide and sliding right
                    && this.context.delta.y < 0                       // and if sliding at all
                    ) ?
                    ( Math.abs(this.context.delta.y) / height + 1 )      // determine resistance level
                    : 1 );                                 // no resistance if false

            // translate 1:1
            translateY(index - 1, this.context.delta.y + slidePos[index - 1], 0);
            translateY(index, this.context.delta.y + slidePos[index], 0);
            translateY(index + 1, this.context.delta.y + slidePos[index + 1], 0);
        },
        end: function (event) {
            // measure duration
            var duration = +new Date - this.context.start.time;

            // determine if slide attempt triggers next/prev slide
            var isValidSlide =
                Number(duration) < 250               // if slide duration is less than 250ms
                && Math.abs(this.context.delta.y) > 20            // and if slide amt is greater than 20px
                || Math.abs(this.context.delta.y) > height / 2;      // or if slide amt is greater than half the height

            // determine if slide attempt is past start and end
            var isPastBounds =
                !index && this.context.delta.y > 0                            // if first slide and slide amt is greater than 0
                || index == slides.length - 1 && this.context.delta.y < 0;    // or if last slide and slide amt is less than 0

            // determine direction of swipe (true:bottom, false:top)
            var direction = this.context.delta.y < 0;

            if (isValidSlide && !isPastBounds) {
                var reg = new RegExp('(\\s|^)' + 'active' + '(\\s|$)');
                slides[index].className = slides[index].className.replace(reg, ' ');
                if (direction) {
                    move(index - 1, -height, 0);
                    move(index, slidePos[index] - height, speed);
                    move((index + 1), slidePos[(index + 1)] - height, speed);
                    index = (index + 1);

                } else {
                    move(index + 1, height, 0);
                    move(index, slidePos[index] + height, speed);
                    move((index - 1), slidePos[(index - 1)] + height, speed);
                    index = (index - 1);

                }
                slides[index].className += " " + "active";

            } else {
                move(index - 1, -height, speed);
                move(index, 0, speed);
                move(index + 1, height, speed);
            }

            // kill touchmove and touchend event listeners until touchstart called again
            element.removeEventListener('touchmove', events, false);
            element.removeEventListener('touchend', events, false);
        }
    };

    function move(index, dist, speed) {
        translateY(index, dist, speed);
        slidePos[index] = dist;
    }

    function translateY(index, dist, speed) {
        var slide = slides[index];
        var style = slide && slide.style;
        if (!style) return;
        style.webkitTransitionDuration =
            style.MozTransitionDuration =
                style.msTransitionDuration =
                    style.OTransitionDuration =
                        style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(0,' + dist + 'px)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
                style.OTransform = 'translateY(' + dist + 'px)';
    }

    /*
     * initialize
     */
    // cache slides
    slides = element.children;
    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);
    // determine height of each slide
    height = container.getBoundingClientRect().height || container.offsetHeight;

    element.style.height = (slides.length * height) + 'px';

    // stack elements
    var pos = slides.length;
    while (pos--) {
        var slide = slides[pos];

        slide.style.height = height + 'px';
        slide.setAttribute('data-index', pos + '');

        if (browser.transitions) {
            slide.style.top = (pos * -height) + 'px';
            move(pos, index > pos ? -height : (index < pos ? height : 0), 0, 0);
        }
    }
    //slides[index].className.match(new RegExp('(\\s|^)' +'active'+ '(\\s|$)'))
    slides[index].className += " " + "active";
    container.style.visibility = 'visible';

    // add event listeners
    if (browser.addEventListener) {
        // set touchstart event on element
        if (browser.touch) this.element.addEventListener('touchstart', events, false);
    }
}

var elem = document.getElementById('pages');
new Slider(elem);
function playmusic() {
    document.getElementById("speak").play();
}
function goal() {
    var p = document.getElementById("phone");

    if (!validPhone(p.value)) {
        document.getElementById("content").innerHTML = "手机号码有误，请填写正确";
    } else {
        document.getElementById("content").innerHTML = "<span class='msgtitle'>预约成功</span><br/>恭喜您抢得先机，排队<span class='number'>2348</span>位";
    }
    document.getElementById("alert").style.display = "block";
    document.getElementById("msg-window").style.display = "block";
}
function ok() {
    document.getElementById("alert").style.display = "none";
    document.getElementById("msg-window").style.display = "none";
}
function validPhone(num) {
    if (/^(13|14|15|18)\d{9}$/.test(num)) {
        return true;
    } else {
        return false;
    }
}
document.getElementById("goal").addEventListener('click', goal, false);
document.getElementById("ok").addEventListener('click', ok, false);
Array.prototype.forEach.call(document.getElementsByClassName('sound'), function (el) {
    el.addEventListener && el.addEventListener('click', playmusic, false);
});

