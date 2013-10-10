/**
 * 
 * @version 0.1
 * 
 * @author Erick Wang
 * @email erick.wang@morningstar.com
 */
(function () {
	jQuery.namespace('MORN.util');

//	if (!MORN) {
//		var MORN = {};
//	}
//	
//	if (!MORN.util) {
//		MORN.util = {};
//	}
	/**
	 * @author Erick Wang
	 * @update 2010-08-18
	 * @version 0.10
	 * 
	 * @param {} id
	 * @param {} config
	 * 
	 */
	MORN.util.Drag = function (selector, config) {
		var defaultConfig = {
			dragHandle:			"", // drag handle, defalult use the whole container
			limit:			false,// if true, [ mxLeft, mxRight, mxTop, mxBottom] or mxContainer will be available, and the values can be negative
			mxLeft:			0,
			mxRight:		4999,
			mxTop:			0,
			mxBottom:		4999,
			mxContainer:	"",//limit to the container
			lockX:			false,// horizontal direction is forbidden
			lockY:			false,// vertical direction is forbidden
			lock:			false,// unmovable 
			transparent:	false,// transparent , but now seens no effect here
			onStart:		$.noop,// the callback 
			onMove:			$.noop,// the callback
			onStop:			$.noop,//  the callback
			delay4drag :	false,
			delay:			300,
			xStep :			10,
			yStep :			10,
			useXTicks		: false,
			useYTicks		: false
		};
		
		this.dragSource = $(selector);
		this.dragEl = this.dragSource.get(0);
		
		this._x = this._y = 0;//the position of mouse
		this._marginLeft = this._marginTop = 0;//margin
	
		this._handleMoving = $.proxy(this.move, this); // handler, use to bind a event
		this._handleStop = $.proxy(this.stop, this);  //handler, use to bind a event 
		
		$.extend(this, defaultConfig, config);
		
		this.mxLeft = Math.floor(this.mxLeft);
		this.mxRight = Math.floor(this.mxRight);
		this.mxTop = Math.floor(this.mxTop);
		this.mxBottom = Math.floor(this.mxBottom);
	
		this._handle = $(this.dragHandle || this.dragEl);
		this._handleEl = this._handle.get(0);
		
		this._mxContainer = this.mxContainer ? $(this.mxContainer) : null;
		this._mxContainerEl = this._mxContainer ? this._mxContainer.get(0) : null;
		
		this.dragEl.style.position = "absolute";
		
		if ($.browser.isIE  && this.transparent) {
			this._handle.append('<div style="width:100%; height:100%; backgroundColor:#ffffff; filter:alpha(opacity:0); fontSize:0;"></div>');
		}

		this.repair();
		if (this.delay4drag) {
			this._handle.bind("mousedown.drag", $.proxy(this.getDragStarHandle, this));
			this._handle.bind("mouseup.drag", $.proxy(this.getDragStopHandle, this));
		} else {
			this._handle.bind("mousedown.drag", $.proxy(this.start, this));
			this._handle.bind("mouseup.drag", this._handleStop);
		}
		
		
		if (this.useXTicks) {
			this.setXTicks(this.xStep || 10);
		}
		if (this.useYTicks) {
			this.setYTicks(this.yStep || 10);
		}
	};
	
	MORN.util.Drag.prototype = {
		
		getDragStarHandle : function (oEvent) {
			var self = this;
			if (this._dragStopTimeout) {
				clearTimeout(this._dragStopTimeout);
			}
			this._dragStartTimeout = setTimeout(function () {
				self._canStart = true;
				self.start(oEvent);
			}, this.delay);
		},
		
		getDragStopHandle : function () {
			var self = this;
			if (this._dragStartTimeout) {
				clearTimeout(this._dragStartTimeout);
			}
			this._dragStopTimeout = setTimeout(function () {
				self._canStart = false;
				self.stop();
			}, this.delay);
			this.stop();
		},
		
	//  getCurrentStyle : function(element){
	//		return element.currentStyle || document.defaultView.getComputedStyle(element, null);
	//  },
		getHande : function () {
			return this._handle;
		},
			  
		getElLocation : function () {
			//var p = $(this.dragEl).position();
			var p2 = {
				left : this.dragEl.style.left,
				top : this.dragEl.style.top
			};
			return p2;
		},

		start: function (oEvent) {//prepare to move
			if (this.lock) {
				return false;
			}
		
			if (this.delay4drag && !this._canStart) {
				return false;
			}
		
			var p1 = this.getElLocation();
			if (this.onStart(p1, oEvent) === false) {//if hascallback
				return false;
			}
		
			//this.repair();
	
			this._x = oEvent.clientX - this.dragEl.offsetLeft;
			this._y = oEvent.clientY - this.dragEl.offsetTop;
	
			if ($.browser.isIE8) {//exclude the container's border width in IE8
				var _bMap = { 
					thin:  "0px", 
					medium: "0px",
					thick: "0px"
				}; 
				var _getBorderWidth = function (dom, dir) {
					dir = dir || "";
					var _w = $.curCSS(dom, 'border' + dir + 'Width');
					if (_bMap[_w]) {
						return _bMap[_w];
					}
					return _w;
				};
				var _p = this.dragSource.parent();
				var parentDom = _p.size() === 1 ? _p.get(0) : null;
				if (parentDom) {
					var _bLeft = _getBorderWidth(parentDom, "Left");
					var _bTop = _getBorderWidth(parentDom, "Top");
					var _b = _getBorderWidth(parentDom, "");
					this._x = this._x + parseInt(_bLeft ? _bLeft : _b, 10);
					this._y = this._y + parseInt(_bTop ? _bTop : _bTop, 10);
				}
			}
		
			this._marginLeft = parseInt($.curCSS(this.dragEl, 'marginLeft'), 10) || 0;
			this._marginTop = parseInt($.curCSS(this.dragEl, 'marginTop'), 10) || 0;
	
			$(document).bind("mousemove.drag", this._handleMoving);
			$(document).bind("mouseup.drag", this._handleStop);
			if ($.browser.isIE) {
//				this._handle.bind("losecapture", this._handleStop);
				this._handleEl.setCapture();
			} else {
				$(window).bind("blur", this._handleStop);
				return false;
				//oEvent.preventDefault();
			}
		
		},
	  
		//repair the range	 
		repair: function () {
			if (this.limit) {
				this.mxRight = Math.max(this.mxRight, this.mxLeft + this.dragEl.offsetWidth);
				this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.dragEl.offsetHeight);
				//if we get a container, the container's position value should be 'relative' or 'absolute', and the value should be set before getting the value of offset
				if (this._mxContainerEl && 
					$.curCSS(this._mxContainerEl, 'position') !== "relative" && 
					$.curCSS(this._mxContainerEl, 'position') !== "absolute") {
					$(this._mxContainerEl).css('position', "relative");
				}
			}
		},

	 
		move: function (oEvent) {
			if (this.lock) {
				this.stop(); 
				return; 
			}
			if (this.delay4drag && !this._canStart) {
				this.stop(); 
				return; 
			}
//		if($.browser.isIE && !oEvent.button ){
//			this.stop(); 
//			return;
//		}
		
		//clear the selection
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			} else {
				document.selection.empty();
			}
		
		
			var p1 = this.getElLocation();
			//set up the params of move
			var iLeft = oEvent.clientX - this._x, iTop = oEvent.clientY - this._y;

			if (this.limit) {
				var mxLeft = this.mxLeft, mxRight = this.mxRight, mxTop = this.mxTop, mxBottom = this.mxBottom;
				if (!!this._mxContainerEl) {//if moving only in container
					mxLeft = Math.max(mxLeft, 0);
					mxTop = Math.max(mxTop, 0);
					mxRight = Math.min(mxRight, this._mxContainerEl.clientWidth);
					mxBottom = Math.min(mxBottom, this._mxContainerEl.clientHeight);
				}
				//repair range
				iLeft = Math.max(Math.min(iLeft, mxRight - this.dragEl.offsetWidth), mxLeft);
				iTop = Math.max(Math.min(iTop, mxBottom - this.dragEl.offsetHeight), mxTop);
			}
			var tx, ty;
			if (this.useXTicks) {
				tx = this.getTick(iLeft, this.xTicks);
			} else {
				tx = iLeft - this._marginLeft;
			}
			if (this.useYTicks) {
				ty = this.getTick(iTop, this.yTicks);
			} else {
				ty = iTop - this._marginTop;
			}

			//margin
			if (!this.lockX) {
				this.dragEl.style.left = tx + "px";
			}
			if (!this.lockY) {
				this.dragEl.style.top = ty + "px";
			}
			var p2 = this.getElLocation();

			if (this.onMove(p1, p2) === false) {//if has callback
				this.stop();
			}
		},
	  
		stop: function (oEvent) {
			var p2 = this.getElLocation();
			$(document).unbind("mousemove.drag");
			$(document).unbind("mouseup.drag");
			
			if ($.browser.isIE) {
				this._handle.unbind("mouseup.drag");
				this._handleEl.releaseCapture();
			} else {
				$(window).unbind("blur");
			}
			
			this.onStop(p2, oEvent);//if has callback
//			console.log('stop');
			this._canStart = false;
			if (this._dragStartTimeout) {
				clearTimeout(this._dragStartTimeout);
			}
		},
	  
		getTargetCoord: function (iPageX, iPageY) {
			var x = iPageX, 
				y = iPageY, 
				minX = this.mxLeft, 
				maxX = this.mxRight, 
				minY = this.mxTop, 
				maxY = this.mxBottom;

			if (this.constrainX) {
				if (x < minX) {
					x = minX;
				}
				if (x > maxX) {
					x = maxX;
				}
			}

			if (this.constrainY) {
				if (y < minY) {
					y = minY;
				}
				if (y > maxY) {
					y = maxY;
				}
			}
			x = this.getTick(x, this.xTicks);
			y = this.getTick(y, this.yTicks);

			return {
				x : x,
				y : y
			};
		},
		
		setXTicks: function (iTickSize, iStartX) {
			this.xTicks = [];
			this.xTickSize = iTickSize || 1;
			var minX = this.mxLeft, maxX = this.mxRight, tickMap = {};
			if (typeof iStartX === "undefined") {
				iStartX = parseInt(this.getElLocation().left || 0, 10);
			}

			for (var i = iStartX; i >= minX; i = i - iTickSize) {
				if (!tickMap[i]) {
					this.xTicks[this.xTicks.length] = i;
					tickMap[i] = true;
				}
			}

			for (i = iStartX; i <= maxX; i = i + iTickSize) {
				if (!tickMap[i]) {
					this.xTicks[this.xTicks.length] = i;
					tickMap[i] = true;
				}
			}

			this.xTicks.sort(function (a, b) {
				return (a - b);
			});
		},
	    
		setYTicks: function (iTickSize, iStartY) {
			this.yTicks = [];
			this.yTickSize = iTickSize || 1;
			var minY = this.mxTop, maxY = this.mxBottom, tickMap = {};
			if (typeof iStartY === "undefined") {
				iStartY = parseInt(this.getElLocation().top || 0, 10);
			}

			for (var i = iStartY; i >= minY; i = i - iTickSize) {
				if (!tickMap[i]) {
					this.yTicks[this.yTicks.length] = i;
					tickMap[i] = true;
				}
			}

			for (i = iStartY; i <= maxY; i = i + iTickSize) {
				if (!tickMap[i]) {
					this.yTicks[this.yTicks.length] = i;
					tickMap[i] = true;
				}
			}

			this.yTicks.sort(function (a, b) {
				return (a - b);
			});
		},
	    
		getTick: function (val, tickArray) {
			if (!tickArray) {
				// If tick interval is not defined, it is effectively 1 pixel,
				// so we return the value passed to us.
				return val;
			} else if (tickArray[0] >= val) {
				// The value is lower than the first tick, so we return the first
				// tick.
				return tickArray[0];
			} else {
				for (var i = 0, len = tickArray.length; i < len; ++i) {
					var next = i + 1;
					if (tickArray[next] && tickArray[next] >= val) {
						var diff1 = val - tickArray[i];
						var diff2 = tickArray[next] - val;
						return (diff2 > diff1) ? tickArray[i] : tickArray[next];
					}
				}

				// The value is larger than the last tick, so we return the last
				// tick.
				return tickArray[tickArray.length - 1];
			}
		}

	};

})();