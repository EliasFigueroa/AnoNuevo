$(document).ready(function() {
  var flip = new FlipClock({
    isCountdown: true,
    startTime: '00:00:00:10',
    containerElement: $('.countdown'),
    face: {
      days: {
        maxValue: 31
      },
      hours: {
        maxValue: 23
      },
      minutes: {
        maxValue: 59
      },
      seconds: {
        maxValue: 59
      }
    }
  });
  //aca

});

/**
 * FlipClock
 * @param options
 * @constructor
 */
FlipClock = function (options) {
    this.tickInterval = false;
    this.digitSelectors = [];
    this.options = this.createConfig(options);

    this.init();
};

/**
 * returns merged config based on passed config + default config
 * @param options - config object
 * @returns options merged config objects
 */
FlipClock.prototype.createConfig = function(options) {
    return $.extend( {}, this.getDefaultConfig(), options );
};

/**
 * returns default config object
 */
FlipClock.prototype.getDefaultConfig = function() {
    return {
        tickDuration: 1000,
        isCountdown: false,
        startTime: '23:59:51',
        maxTime: '23:59:59',
        minTime: '00:00:00',
        containerElement: $('.container'),
        segmentSelectorPrefix: 'flipclock-',
        face: {
            hours: {
                maxValue: 23
            },
            minutes: {
                maxValue: 59
            },
            seconds: {
                maxValue: 59
            }
        }
    };
};

/**
 * check browser feature support
 */
FlipClock.prototype.initFeatureDetection = function() {
    $.support.transition = (function(){
        var thisBody = document.body || document.documentElement,
            thisStyle = thisBody.style,
            support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
        return support;
    })();
};

/**
 * return browser support for given feature
 * @param feature
 * @returns {*}
 */
FlipClock.prototype.isFeatureSupported = function(feature) {
    if(feature && typeof $.support !== undefined && typeof $.support[feature] !== undefined) {
        return $.support[feature];
    }

    return false;
};

/**
 * init
 */
FlipClock.prototype.init = function() {
    this.options.containerElement.empty();

    if (this.tickInterval !== false) {
        clearInterval(this.tickInterval);
        this.tickInterval = false;
    }

    this.appendMarkupToContainer();
    this.setDimensions();

    this.setupFallbacks();

    this.start();
};

/**
 * setupFallbacks
 */
FlipClock.prototype.setupFallbacks = function() {
    this.initFeatureDetection();

    if (this.isFeatureSupported('transition')) {
        $('ul.flip li:first-child', this.options.containerElement).css("z-index", 2);
    } else {
        // < IE9 can't do css animations (@keyframe) - need to fix z-index here since we're setting z-indices inside the keyframe-steps
        $('ul.flip li:first-child', this.options.containerElement).css("z-index", 3);

        // < IE9 doesn't understand nth-child css selector => fallback class that has to be addressed via css separatly
        $('ul.flip:nth-child(2n+2):not(:last-child)', this.options.containerElement).addClass('nth-child-2np2-notlast');
    }
};

/**
 * Sets digit dimensions based on its containers height
 */
FlipClock.prototype.setDimensions = function() {
    var flipHeight = this.options.containerElement.height(),
        flipWidth = flipHeight/1.5;

    $('ul.flip', this.options.containerElement).css({
        width: flipWidth,
        fontSize: (flipHeight - 10) + 'px'
    }).find('li').css({
        lineHeight: (flipHeight) + 'px'
    });
};

/**
 * Creates segments out of 'digits', calculates ticks per digit based on segment maxValue
 * @param faceSegmentGroupName
 * @returns {Array}
 */
FlipClock.prototype.createSegment = function(faceSegmentGroupName) {
    var faceSegmentGroup = this.options.face[faceSegmentGroupName],
        segmentSelectorAddons = ['-ten', '-one'],
        rounded = Math.ceil(faceSegmentGroup.maxValue/10),
        segment = [];

    if (faceSegmentGroup.maxValue/10 > 1) {
        segment = [
            {
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[0],
                ticks: rounded
            },{
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
                ticks: 10
            }
        ];
    } else {
        segment = [
            {
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
                ticks: 10
            }
        ]
    }

    return segment;
};

/**
 * Appends the markup for each digit to the container
 */
FlipClock.prototype.appendMarkupToContainer = function() {
    var baseZIndex = 0;
    
    for (var faceSegmentGroup in this.options.face) {
        this.options.face[faceSegmentGroup].segments = this.createSegment(faceSegmentGroup);

        for (var i=0; i < this.options.face[faceSegmentGroup].segments.length; i++) {
            var faceSegmentElement = this.createFaceSegment( this.options.face[faceSegmentGroup].segments[i] );

            this.digitSelectors.push(this.options.face[faceSegmentGroup].segments[i].selector);
            this.options.containerElement.append( faceSegmentElement );

            // assign common data-attribute to segments of the same group
            faceSegmentElement.data('face-segment-group', faceSegmentGroup);
            faceSegmentElement.addClass(faceSegmentGroup);
            faceSegmentElement.css("z-index", baseZIndex++);
        }
    }

    this.digitSelectors.reverse();

//    var self = this;
//    $(document).on('keyup', function(e) {
//        if(e.keyCode === 13) {
//            self.stop();
//        }
//    });
};

/**
 * Creates face segments
 * @param faceSegment
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.createFaceSegment = function(faceSegment) {
    var faceElement = $('<ul>', {
        "class": "flip " + faceSegment.selector
    });

    for (var i = 0; i < faceSegment.ticks; i++) {
        var digit = i;

        faceElement.append( this.createFaceDigit(digit) );
    }

    return faceElement;
};

/**
 * Creates digit markup
 * @param digit
 * @returns {string}
 */
FlipClock.prototype.createFaceDigit = function(digit) {
    var digitInnerFragment = '<div class="shadow"></div><div class="inn">' + digit + '</div>';

    return '<li data-digit=' + digit + ' ><span>' +
            '<div class="up">' + digitInnerFragment + '</div>' +
            '<div class="down">' + digitInnerFragment + '</div>' +
           '</span></li>';
};

/**
 * Starts the clock
 */
FlipClock.prototype.start = function() {
    this.setToTime(this.options.startTime);

    var self = this;

    this.tickInterval = setInterval(function () {
        self.tick();
    }, this.options.tickDuration);
};

/**
 * Stops the Clock after the current interval is finished
 */
FlipClock.prototype.stop = function() {
    clearInterval(this.tickInterval);
    var audio = new Audio("mp3/unAnoMas.mp3")
    audio.play();
    iniciaFuegos();
    muestraTxt();

};

/**
 * Resets to 00:00:00....
 * needed when using this as an actual clock - e.g. can reset to 0 after 23:59:59
 */
FlipClock.prototype.resetDigits = function() {
    this.options.containerElement.removeClass('play');

    for (var i=0; i<this.digitSelectors.length; i++) {
        var active = $(this.getDigitSelectorByIndex(i) + ".current", this.options.containerElement),
            all = $(this.getDigitSelectorByIndex(i), this.options.containerElement),
            first = $(this.getDigitSelectorByIndex(i) + ":first-child", this.options.containerElement);

        all.eq(0).addClass("clockFix");
        all.removeClass("current");

        first.addClass("current");

        all.removeClass("previous");
        active.addClass("previous");
    }

    this.options.containerElement.addClass('play');
};

/**
 * Sets the clock to a time based on passed string
 * @param time {string} 00:00:00...
 */
FlipClock.prototype.setToTime = function(time) {
    var timeArray = time.replace(/:/g, '').split('').reverse();

    for (var i=0; i<this.digitSelectors.length; i++) {
        var digit = $(this.getDigitSelectorByIndex(i), this.options.containerElement).eq(parseInt(timeArray[i]));

        this.options.containerElement.removeClass('play');

        digit.addClass("current");
        this.options.containerElement.addClass('play');
    }
};

/**
 * Set Segment to its maximum value
 * @param segmentGroupName
 */
FlipClock.prototype.setFaceSegmentGroupMaxValue = function(segmentGroupName) {
    var self = this;
    var group = this.getFaceSegmentGroupDom(segmentGroupName);

    group.each(function(idx) {
        self.options.containerElement.removeClass('play');

        var maxValue = self.options.face[segmentGroupName].maxValue.toString().split('');

        $(this).find('li.current').removeClass('current');
        $(this).find('li[data-digit="'+maxValue[idx]+'"]').addClass('current');

        self.options.containerElement.addClass('play');
    });
};

/**
 * actual callback for the tick/interval
 */
FlipClock.prototype.tick = function() {
    this.doTick(0);
};

/**
 * Returns current time as int
 * @returns {Number}
 */
FlipClock.prototype.getCurrentTime = function() {
    var currentTime = [];

    $('li.current', this.options.containerElement).each(function() {
        currentTime.push($(this).data('digit'));
    });

    return parseInt(currentTime.join(''), 10);
};

/**
 * gets digit selector string for the given index in the digitselectors array
 * @param digitIndex
 * @returns {string}
 */
FlipClock.prototype.getDigitSelectorByIndex = function(digitIndex) {
    return 'ul.' + this.digitSelectors[digitIndex] + ' li';
};

/**
 * Return the segment group name for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentGroupNameByDigitElement = function(digitElement) {
    return digitElement.parent().data('face-segment-group');
};

/**
 * Return the segment group object for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentByDigitElement = function(digitElement) {
    return this.options.face[this.getFaceSegmentGroupNameByDigitElement(digitElement)];
};

/**
 * Return segment group dom objects by segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getFaceSegmentGroupDom = function(segmentGroupName) {
    return $('.' + segmentGroupName, this.options.containerElement)
};

/**
 * Return dom object for the currently active digit for a segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getCurrentDigitDom = function(segmentGroupName) {
    return $('.' + segmentGroupName + ' li.current', this.options.containerElement)
};

/**
 * Returns the value a segment group is currently representing selected by digit element
 * @param digitElement
 * @returns {string}
 */
FlipClock.prototype.getCurrentFaceSegmentGroupValue = function(digitElement) {
    var segmentGroupName = this.getFaceSegmentGroupNameByDigitElement(digitElement),
        values = [];

    this.getCurrentDigitDom(segmentGroupName).each(function(idx) {
        values[idx] = $(this).data('digit');
    });

    return values.join('');
};

/**
 * handles the tick logic
 * @param digitIndex
 */
FlipClock.prototype.doTick = function(digitIndex) {
    var nextDigit, pseudoSelector;

    // check if we reached maxTime and start over at 00:00:00
    if ( this.options.isCountdown === false && this.isMaxTimeReached() ) {
        this.resetDigits();
        return;
    }

    this.options.containerElement.removeClass('play');

    if ( this.options.isCountdown === true ) {
        pseudoSelector = ":first-child";
    } else {
        pseudoSelector = ":last-child";
    }

    var activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ".current", this.options.containerElement);

    if (activeDigit.html() == undefined) {
        if (this.options.isCountdown) {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
            nextDigit = activeDigit.prev("li");
        } else {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
            nextDigit = activeDigit.next("li");
        }

        activeDigit.addClass("previous").removeClass("current");

        nextDigit.addClass("current");
    } else if (activeDigit.is(pseudoSelector)) {
        $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

        // countdown target reached, halt
        if (this.options.isCountdown === true && this.isMinTimeReached()) {
            this.stop();
            return;
        }

        activeDigit.addClass("previous").removeClass("current");

        if (this.options.isCountdown === true) {
            activeDigit.addClass("countdownFix");
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
        } else {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
            activeDigit.addClass("clockFix");
        }

        activeDigit.addClass("current");

        // animate the next segment once (if there is one)
        if (typeof this.digitSelectors[digitIndex + 1] !== "undefined") {
            this.doTick(digitIndex + 1);
        }
    } else {
        $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

        activeDigit.addClass("previous").removeClass("current");

        if (this.options.isCountdown === true ) {
            nextDigit = activeDigit.prev("li");
        } else {
            nextDigit = activeDigit.next("li");
        }

        nextDigit.addClass("current");
    }

    // set segment to maxValue if it would move past it
    var group = this.getFaceSegmentByDigitElement(activeDigit);
    if (this.getCurrentFaceSegmentGroupValue(activeDigit) > group.maxValue) {
        this.setFaceSegmentGroupMaxValue(this.getFaceSegmentGroupNameByDigitElement(activeDigit));
    }

    this.options.containerElement.addClass('play');
    this.cleanZIndexFix(activeDigit, this.digitSelectors[digitIndex]);
};

/**
 * isMaxTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMaxTimeReached = function() {
    return this.getCurrentTime() >= parseInt(this.options.maxTime.replace(/:/g, ''), 10);
};

/**
 * isMinTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMinTimeReached = function() {
    return this.getCurrentTime() <= parseInt(this.options.minTime.replace(/:/g, ''), 10);
};

/**
 * Fixes flickering top half of digit
 *
 * @param activeDigit
 * @param selector
 */
FlipClock.prototype.cleanZIndexFix = function(activeDigit, selector) {
    if (this.options.isCountdown === true) {
        var fix = $('.' + selector + ' .countdownFix', this.options.containerElement);

        if (fix.length > 0 && !fix.hasClass("previous") && !fix.hasClass("current")) {
            fix.removeClass("countdownFix");
        }
    } else {
        activeDigit.siblings().removeClass("clockFix");
    }
};
//http://bloggersviet.blogspot.com
var bits=190; // how many bits
var speed=33; // how fast - smaller is faster
var bangs=10; // how many can be launched simultaneously (note that using too many can slow the script down)
var colours=new Array("#03f", "#f03", "#0e0", "#93f", "#0cf", "#f93", "#f0c","#bf6bbf","#83d495","#d29b46");
//                     blue    red     green   purple  cyan    orange  pink
/****************************
*      Fireworks Effect     *
*(c)2004-11 mf2fm web-design*
*  http://www.mf2fm.com/rv  *
* DON'T EDIT BELOW THIS BOX *
****************************/
var bangheight=new Array();
var intensity=new Array();
var colour=new Array();
var Xpos=new Array();
var Ypos=new Array();
var dX=new Array();
var dY=new Array();
var stars=new Array();
var decay=new Array();
var swide=800;
var shigh=600;
var boddie;
/*window.onload=*/
function iniciaFuegos() { if (document.getElementById) {
  var i;
  boddie=document.createElement("div");
  boddie.style.position="fixed";
  boddie.style.top="0px";
  boddie.style.left="0px";
  boddie.style.overflow="visible";
  boddie.style.width="1px";
  boddie.style.height="1px";
  boddie.style.backgroundColor="transparent";
  document.body.appendChild(boddie);
  set_width();
  for (i=0; i<bangs; i++) {
    write_fire(i);
    launch(i);
    setInterval('stepthrough('+i+')', speed);
  }
}}
function write_fire(N) {
  var i, rlef, rdow;
  stars[N+'r']=createDiv('|', 12);
  boddie.appendChild(stars[N+'r']);
  for (i=bits*N; i<bits+bits*N; i++) {
    stars[i]=createDiv('*', 13);
    boddie.appendChild(stars[i]);
  }
}
function createDiv(char, size) {
  var div=document.createElement("div");
  div.style.font=size+"px monospace";
  div.style.position="absolute";
  div.style.backgroundColor="transparent";
  div.appendChild(document.createTextNode(char));
  return (div);
}
function launch(N) {
  colour[N]=Math.floor(Math.random()*colours.length);
  Xpos[N+"r"]=swide*0.5;
  Ypos[N+"r"]=shigh-5;
  bangheight[N]=Math.round((0.5+Math.random())*shigh*0.4);
  dX[N+"r"]=(Math.random()-0.5)*swide/bangheight[N];
  if (dX[N+"r"]>1.25) stars[N+"r"].firstChild.nodeValue="/";
  else if (dX[N+"r"]<-1.25) stars[N+"r"].firstChild.nodeValue="\\";
  else stars[N+"r"].firstChild.nodeValue="|";
  stars[N+"r"].style.color=colours[colour[N]];
}
function bang(N) {
  var i, Z, A=0;
  for (i=bits*N; i<bits+bits*N; i++) {
    Z=stars[i].style;
    Z.left=Xpos[i]+"px";
    Z.top=Ypos[i]+"px";
    if (decay[i]) decay[i]--;
    else A++;
    if (decay[i]==15) Z.fontSize="10px";
    else if (decay[i]==7) Z.fontSize="10px";
    else if (decay[i]==1) Z.visibility="hidden";
    Xpos[i]+=dX[i];
    Ypos[i]+=(dY[i]+=1.25/intensity[N]);
  }
  if (A!=bits) setTimeout("bang("+N+")", speed);
}
function stepthrough(N) {
  var i, M, Z;
  var oldx=Xpos[N+"r"];
  var oldy=Ypos[N+"r"];
  Xpos[N+"r"]+=dX[N+"r"];
  Ypos[N+"r"]-=4;
  if (Ypos[N+"r"]<bangheight[N]) {
    M=Math.floor(Math.random()*3*colours.length);
    intensity[N]=5+Math.random()*4;
    for (i=N*bits; i<bits+bits*N; i++) {
      Xpos[i]=Xpos[N+"r"];
      Ypos[i]=Ypos[N+"r"];
      dY[i]=(Math.random()-0.5)*intensity[N];
      dX[i]=(Math.random()-0.5)*(intensity[N]-Math.abs(dY[i]))*1.25;
      decay[i]=16+Math.floor(Math.random()*16);
      Z=stars[i];
      if (M<colours.length) Z.style.color=colours[i%2?colour[N]:M];
      else if (M<2*colours.length) Z.style.color=colours[colour[N]];
      else Z.style.color=colours[i%colours.length];
      Z.style.fontSize="13px";
      Z.style.visibility="visible";
    }
    bang(N);
    launch(N);
  }
  stars[N+"r"].style.left=oldx+"px";
  stars[N+"r"].style.top=oldy+"px";
}
window.onresize=set_width;
function set_width() {
  var sw_min=999999;
  var sh_min=999999;
  if (document.documentElement && document.documentElement.clientWidth) {
    if (document.documentElement.clientWidth>0) sw_min=document.documentElement.clientWidth;
    if (document.documentElement.clientHeight>0) sh_min=document.documentElement.clientHeight;
  }
  if (typeof(self.innerWidth)!="undefined" && self.innerWidth) {
    if (self.innerWidth>0 && self.innerWidth<sw_min) sw_min=self.innerWidth;
    if (self.innerHeight>0 && self.innerHeight<sh_min) sh_min=self.innerHeight;
  }
  if (document.body.clientWidth) {
    if (document.body.clientWidth>0 && document.body.clientWidth<sw_min) sw_min=document.body.clientWidth;
    if (document.body.clientHeight>0 && document.body.clientHeight<sh_min) sh_min=document.body.clientHeight;
  }
  if (sw_min==999999 || sh_min==999999) {
    sw_min=800;
    sh_min=600;
  }
  swide=sw_min;
  shigh=sh_min;
}
function muestraTxt(){
    var options = {};
    options = { percent: 50 };
    $("#txt_ano").show("scale",options,1500);
};