/**
 * 
 * @version 0.1
 * 
 * @author Erick Wang
 * @email erick.wang@morningstar.com
 */

CurrentStyle = function(element){
	return element.currentStyle || document.defaultView.getComputedStyle(element, null);
};

jQuery.namespace('MORN.util');

MORN.util.Resize = function(selector, config){
   this.options = {
   		lock : false,
		limitMax:	false, //if true, [ mxLeft, mxRight, mxTop, mxBottom] or mxContainer will be available,
		mxContainer:"",
		mxLeft:		0,
		mxRight:	9999,
		mxTop:		0,
		mxBottom:	9999,
		limitMin:	false,//if true, [ minWidth, minHeight] will be available,
		minWidth:	50,
		minHeight:	50,
		scale:		false, // zooming 
		ratio:		0,// width/height
		onStart : $.noop,
		onResize:	$.noop,
		onStop : $.noop
    };
	this._obj = $(selector).get(0);
	
	this._styleWidth = this._styleHeight = this._styleLeft = this._styleTop = 0;//style params
	this._sideRight = this._sideDown = this._sideLeft = this._sideUp = 0;//coordinate params
	this._fixLeft = this._fixTop = 0;//postion params
	this._scaleLeft = this._scaleTop = 0;//coordinate coordinate
	
	this._mxSet = $.noop;//range setting function 
	this._mxRightWidth = this._mxDownHeight = this._mxUpHeight = this._mxLeftWidth = 0;//range params
	this._mxScaleWidth = this._mxScaleHeight = 0;//scale range params
	
	this._fun = $.noop;// execution function when resize
	
	//get the borders' width
	var _style = CurrentStyle(this._obj);
	this._borderX = (parseInt(_style.borderLeftWidth) || 0) + (parseInt(_style.borderRightWidth) || 0);
	this._borderY = (parseInt(_style.borderTopWidth) || 0) + (parseInt(_style.borderBottomWidth) || 0);
	
	//event object , use for binding or unbinding event
	this._fR = $.proxy(this.resize, this);
	this._fS = $.proxy(this.stop, this);
	
	$.extend(this.options, config);
	
	//max limit
	this.limitMax = !!this.options.limitMax;
	this._mxContainer = $(this.options.mxContainer).get(0) || null;
	this.mxLeft = Math.round(this.options.mxLeft);
	this.mxRight = Math.round(this.options.mxRight);
	this.mxTop = Math.round(this.options.mxTop);
	this.mxBottom = Math.round(this.options.mxBottom);
	
	//min limit
	this.limitMin = !!this.options.limitMin;
	this.minWidth = Math.round(this.options.minWidth);
	this.minHeight = Math.round(this.options.minHeight);
	
	//scale or ratio
	this.lock = !!this.options.lock;
	this.scale = !!this.options.scale;
	this.ratio = Math.max(this.options.ratio, 0);
	
	this.onResize = this.options.onResize;
	this.onStart = this.options.onStart;
	this.onStop = this.options.onStop;
	
	this._obj.style.position = "absolute";
	!this._mxContainer || CurrentStyle(this._mxContainer).position == "relative" || (this._mxContainer.style.position = "relative");
};

MORN.util.Resize.prototype = {

  //setting the drag source's start points
  set: function(resize, side) {
	var oResize = $(resize), fun;
	if(!oResize || oResize.length==0) return;
	//根据方向设置
	switch (side.toLowerCase()) {
	case "up" :
		fun = this.up;
		break;
	case "down" :
		fun = this.down;
		break;
	case "left" :
		fun = this.left;
		break;
	case "right" :
		fun = this.right;
		break;
	case "left-up" :
		fun = this.leftUp;
		break;
	case "right-up" :
		fun = this.rightUp;
		break;
	case "left-down" :
		fun = this.leftDown;
		break;
	case "right-down" :
	default :
		fun = this.rightDown;
	};
	//oResize.bind("mousedown", BindAsEventListener(this, this.start, fun));
	oResize.bind("mousedown.resize", function(fn, scope) {
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function(event) {
			return fn.apply(scope, [event || window.event].concat(args));
		};
	}(this.start, this, fun));
  },
  //prepare to resize
  start: function(e, fun, touch) {
	
	e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
	if(this.lock){
  		return false;
  	}
  	var p1 = this.getElLocation();
	if(this.onStart(p1)===false){
		return false;
	}
	//setting execution
	this._fun = fun;
	//sytle params values 
	this._styleWidth = this._obj.clientWidth;
	this._styleHeight = this._obj.clientHeight;
	this._styleLeft = this._obj.offsetLeft;
	this._styleTop = this._obj.offsetTop;
	if($.browser.isIE8){//exclude the container's border width in IE8
		var parentDom = $(this._obj).parent().size()==1 ? $(this._obj).parent().get(0) : null;
		var _bMap = { 
			/**                IE8  Firefox  **/
			thin:  "0px",  // ["1px","2px"], 
			medium: "0px", // ["3px","4px"], 
			thick: "0px"   // ["5px","6px"] 
		}; 
		var _getBorderWidth = function(curCSS, dir){
			dir = dir || "";
			var _w = curCSS['border'+dir+'Width'];
			if(_bMap[_w]){
				return _bMap[_w];
			}
			return _w;
		};
		if(parentDom){
			var _curCSS = CurrentStyle(parentDom);
			var _bLeft = _getBorderWidth(_curCSS, "Left");
			var _bTop = _getBorderWidth(_curCSS, "Top");
			var _b = _getBorderWidth(_curCSS, "");
			this._styleLeft = this._styleLeft - parseInt(_bLeft ? _bLeft : _b);
			this._styleTop = this._styleTop -parseInt(_bTop ? _bTop : _b);
		}
	}
	
	//setting the postion of four sides 
	this._sideLeft = e.clientX - this._styleWidth;
	this._sideRight = e.clientX + this._styleWidth;
	this._sideUp = e.clientY - this._styleHeight;
	this._sideDown = e.clientY + this._styleHeight;
	//left and top of the position 
	this._fixLeft = this._styleLeft + this._styleWidth;
	this._fixTop = this._styleTop + this._styleHeight;

	if(this.scale){
		this.ratio = Math.max(this.ratio, 0) || this._styleWidth / this._styleHeight;
		//left and top of the position 
		this._scaleLeft = this._styleLeft + this._styleWidth / 2;
		this._scaleTop = this._styleTop + this._styleHeight / 2;
	};
	//limit max
	if(this.limitMax){
		var mxLeft = this.mxLeft, mxRight = this.mxRight, mxTop = this.mxTop, mxBottom = this.mxBottom;
		//limit to container
		if(!!this._mxContainer){
			mxLeft = Math.max(mxLeft, 0);
			mxTop = Math.max(mxTop, 0);
			mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
			mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
		};
		//reparing according the min value
		mxRight = Math.max(mxRight, mxLeft + (this.limitMin ? this.minWidth : 0) + this._borderX);
		mxBottom = Math.max(mxBottom, mxTop + (this.limitMin ? this.minHeight : 0) + this._borderY);
		//function reset in case turn around 
		this._mxSet = function(){
			this._mxRightWidth = mxRight - this._styleLeft - this._borderX;
			this._mxDownHeight = mxBottom - this._styleTop - this._borderY;
			this._mxUpHeight = Math.max(this._fixTop - mxTop, this.limitMin ? this.minHeight : 0);
			this._mxLeftWidth = Math.max(this._fixLeft - mxLeft, this.limitMin ? this.minWidth : 0);
		};
		this._mxSet();
		//special limit when scale
		if(this.scale){
			this._mxScaleWidth = Math.min(this._scaleLeft - mxLeft, mxRight - this._scaleLeft - this._borderX) * 2;
			this._mxScaleHeight = Math.min(this._scaleTop - mxTop, mxBottom - this._scaleTop - this._borderY) * 2;
		};
	};
	
	$(document).bind("mousemove.resize", this._fR);
	$(document).bind("mouseup.resize", this._fS);
	if($.browser.msie){
		$(this._obj).bind("losecapture", this._fS);
		this._obj.setCapture();
	}else{
		$(window).bind("blur", this._fS);
		e.preventDefault();
	};
	return false;
  },

  resize: function(e) {
  	if(this.lock){
  		return false;
  	}
	//clear selection
	window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
	//position before resizing
	var p1 = this.getElLocation();
	//execute resize
	this._fun(e);
	//setting the style, the value must greater than or equal 0, or error in IE
	with(this._obj.style){
		width = this._styleWidth + "px"; height = this._styleHeight + "px";
		top = this._styleTop + "px"; left = this._styleLeft + "px";
	}
	//position after resizing
	var p2 = this.getElLocation();
	this.onResize(p1, p2);
	return false;
  },
  getElLocation : function(){
  		return {
		width : this._styleWidth,
		height : this._styleHeight,
		top : this._styleTop,
		left : this._styleLeft
	};
  },
  stop: function() {
	$(document).unbind("mousemove.resize", this._fR);
	$(document).unbind("mouseup.resize", this._fS);
	if($.browser.msie){
		$(this._obj).unbind("losecapture", this._fS);
		$(this._obj).get(0).releaseCapture();
	}else{
		$(window).unbind("blur", this._fS);
	}
	var p2 = this.getElLocation();
	this.onStop(p2);
	return false;
  },
  //resize functions [up, down, right, left, rightDown, rightUp, leftDown, leftUp] 
  up: function(e) {
	this.repairY(this._sideDown - e.clientY, this._mxUpHeight);
	this.repairTop();
	this.turnDown(this.down);
	return false;
  },
  down: function(e) {
	this.repairY(e.clientY - this._sideUp, this._mxDownHeight);
	this.turnUp(this.up);
	return false;
  },
  right: function(e) {
	this.repairX(e.clientX - this._sideLeft, this._mxRightWidth);
	this.turnLeft(this.left);
	return false;
  },
  left: function(e) {
	this.repairX(this._sideRight - e.clientX, this._mxLeftWidth);
	this.repairLeft();
	this.turnRight(this.right);
	return false;
  },
  rightDown: function(e) {
	this.repairAngle(
		e.clientX - this._sideLeft, this._mxRightWidth,
		e.clientY - this._sideUp, this._mxDownHeight
	);
	this.turnLeft(this.leftDown) || this.scale || this.turnUp(this.rightUp);
	return false;
  },
  rightUp: function(e) {
	this.repairAngle(
		e.clientX - this._sideLeft, this._mxRightWidth,
		this._sideDown - e.clientY, this._mxUpHeight
	);
	this.repairTop();
	this.turnLeft(this.leftUp) || this.scale || this.turnDown(this.rightDown);
	return false;
  },
  leftDown: function(e) {
	this.repairAngle(
		this._sideRight - e.clientX, this._mxLeftWidth,
		e.clientY - this._sideUp, this._mxDownHeight
	);
	this.repairLeft();
	this.turnRight(this.rightDown) || this.scale || this.turnUp(this.leftUp);
	return false;
  },
  leftUp: function(e) {
	this.repairAngle(
		this._sideRight - e.clientX, this._mxLeftWidth,
		this._sideDown - e.clientY, this._mxUpHeight
	);
	this.repairTop(); this.repairLeft();
	this.turnRight(this.rightUp) || this.scale || this.turnDown(this.leftDown);
	return false;
  },
  // reparing functions [repairX, repairY, repairAngle, repairTop, repairLeft, repairHeight, repairWidth, repairScaleHeight, repairScaleWidth] 
  repairX: function(iWidth, mxWidth) {//horizontal
	iWidth = this.repairWidth(iWidth, mxWidth);
	if(this.scale){
		var iHeight = this.repairScaleHeight(iWidth);
		if(this.limitMax && iHeight > this._mxScaleHeight){
			iHeight = this._mxScaleHeight;
			iWidth = this.repairScaleWidth(iHeight);
		}else if(this.limitMin && iHeight < this.minHeight){
			var tWidth = this.repairScaleWidth(this.minHeight);
			if(tWidth < mxWidth){ iHeight = this.minHeight; iWidth = tWidth; }
		}
		this._styleHeight = iHeight;
		this._styleTop = this._scaleTop - iHeight / 2;
	}
	this._styleWidth = iWidth;
  },
  repairY: function(iHeight, mxHeight) {//vertical
	iHeight = this.repairHeight(iHeight, mxHeight);
	if(this.scale){
		var iWidth = this.repairScaleWidth(iHeight);
		if(this.limitMax && iWidth > this._mxScaleWidth){
			iWidth = this._mxScaleWidth;
			iHeight = this.repairScaleHeight(iWidth);
		}else if(this.limitMin && iWidth < this.minWidth){
			var tHeight = this.repairScaleHeight(this.minWidth);
			if(tHeight < mxHeight){ iWidth = this.minWidth; iHeight = tHeight; }
		}
		this._styleWidth = iWidth;
		this._styleLeft = this._scaleLeft - iWidth / 2;
	}
	this._styleHeight = iHeight;
  },
  repairAngle: function(iWidth, mxWidth, iHeight, mxHeight) {//opposite angles
	iWidth = this.repairWidth(iWidth, mxWidth);	
	if(this.scale){
		iHeight = this.repairScaleHeight(iWidth);
		if(this.limitMax && iHeight > mxHeight){
			iHeight = mxHeight;
			iWidth = this.repairScaleWidth(iHeight);
		}else if(this.limitMin && iHeight < this.minHeight){
			var tWidth = this.repairScaleWidth(this.minHeight);
			if(tWidth < mxWidth){ iHeight = this.minHeight; iWidth = tWidth; }
		}
	}else{
		iHeight = this.repairHeight(iHeight, mxHeight);
	}
	this._styleWidth = iWidth;
	this._styleHeight = iHeight;
  },
  repairTop: function() {//top
	this._styleTop = this._fixTop - this._styleHeight;
  },
  repairLeft: function() { //left
	this._styleLeft = this._fixLeft - this._styleWidth;
  },
  repairHeight: function(iHeight, mxHeight) { //height
	iHeight = Math.min(this.limitMax ? mxHeight : iHeight, iHeight);
	iHeight = Math.max(this.limitMin ? this.minHeight : iHeight, iHeight, 0);
	return iHeight;
  },
  repairWidth: function(iWidth, mxWidth) { //width
	iWidth = Math.min(this.limitMax ? mxWidth : iWidth, iWidth);
	iWidth = Math.max(this.limitMin ? this.minWidth : iWidth, iWidth, 0);
	return iWidth;
  },
  repairScaleHeight: function(iWidth) {//scaleHeight
	return Math.max(Math.round((iWidth + this._borderX) / this.ratio - this._borderY), 0);
  },
  repairScaleWidth: function(iHeight) {//scaleWidth
	return Math.max(Math.round((iHeight + this._borderY) * this.ratio - this._borderX), 0);
  },
  //turn around functions [turnRight, turnLeft, turnUp, turnDown]
  turnRight: function(fun) {
	if(!(this.limitMin || this._styleWidth)){
		this._fun = fun;
		this._sideLeft = this._sideRight;
		this.limitMax && this._mxSet();
		return true;
	}
  },
  turnLeft: function(fun) {
	if(!(this.limitMin || this._styleWidth)){
		this._fun = fun;
		this._sideRight = this._sideLeft;
		this._fixLeft = this._styleLeft;
		this.limitMax && this._mxSet();
		return true;
	}
  },
  turnUp: function(fun) {
	if(!(this.limitMin || this._styleHeight)){
		this._fun = fun;
		this._sideDown = this._sideUp;
		this._fixTop = this._styleTop;
		this.limitMax && this._mxSet();
		return true;
	}
  },
  turnDown: function(fun) {
	if(!(this.limitMin || this._styleHeight)){
		this._fun = fun;
		this._sideUp = this._sideDown;
		this.limitMax && this._mxSet();
		return true;
	}
  }
};