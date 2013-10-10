/**
 * @class Function
 * These functions are available on every Function object (any JavaScript function).
 */
$.extend(Function.prototype, {
     /**
     * Creates an interceptor function. The passed function is called before the original one. If it returns false,
     * the original one is not called. The resulting function returns the results of the original function.
     * The passed function is called with the parameters of the original function. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

sayHi('Fred'); // alerts "Hi, Fred"

// create a new function that validates input without
// directly modifying the original function:
var sayHiToFriend = sayHi.createInterceptor(function(name){
    return name == 'Brian';
});

sayHiToFriend('Fred');  // no alert
sayHiToFriend('Brian'); // alerts "Hi, Brian"
</code></pre>
     * @param {Function} fcn The function to call before the original
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the passed function is executed.
     * <b>If omitted, defaults to the scope in which the original function is called or the browser window.</b>
     * @return {Function} The new function
     */
    createInterceptor : function(fcn, scope){
        var method = this;
        return !$.isFunction(fcn) ?
                this :
                function() {
                    var me = this,
                        args = arguments;
                    fcn.target = me;
                    fcn.method = method;
                    return (fcn.apply(scope || me || window, args) !== false) ?
                            method.apply(me || window, args) :
                            null;
                };
    },

     /**
     * Creates a callback that passes arguments[0], arguments[1], arguments[2], ...
     * Call directly on any function. Example: <code>myFunction.createCallback(arg1, arg2)</code>
     * Will create a function that is bound to those 2 args. <b>If a specific scope is required in the
     * callback, use {@link #createDelegate} instead.</b> The function returned by createCallback always
     * executes in the window scope.
     * <p>This method is required when you want to pass arguments to a callback function.  If no arguments
     * are needed, you can simply pass a reference to the function as a callback (e.g., callback: myFn).
     * However, if you tried to pass a function with arguments (e.g., callback: myFn(arg1, arg2)) the function
     * would simply execute immediately when the code is parsed. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// clicking the button alerts "Hi, Fred"
new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody(),
    handler: sayHi.createCallback('Fred')
});
</code></pre>
     * @return {Function} The new function
    */
    createCallback : function(/*args...*/){
        // make args available, in function below
        var args = arguments,
            method = this;
        return function() {
            return method.apply(window, args);
        };
    },

    /**
     * Creates a delegate (callback) that sets the scope to obj.
     * Call directly on any function. Example: <code>this.myFunction.createDelegate(this, [arg1, arg2])</code>
     * Will create a function that is automatically scoped to obj so that the <tt>this</tt> variable inside the
     * callback points to obj. Example usage:
     * <pre><code>
		var sayHi = function(name){
		    // Note this use of "this.text" here.  This function expects to
		    // execute within a scope that contains a text property.  In this
		    // example, the "this" variable is pointing to the btn object that
		    // was passed in createDelegate below.
		    alert('Hi, ' + name + '. You clicked the "' + this.text + '" button.');
		}
		
		var btn = new Button({...});
		
		// This callback will execute in the scope of the
		// button instance. Clicking the button alerts
		// "Hi, Fred. You clicked the "Say Hi" button."
		btn.on('click', sayHi.createDelegate(btn, ['Fred']));
	</code></pre>
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Function} The new function
     */
    createDelegate : function(obj, args, appendArgs){
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true){
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }else if (typeof appendArgs === 'number' && isFinite(appendArgs)){//isNumber
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },

    /**
     * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
     * <pre><code>
		var sayHi = function(name){
		    alert('Hi, ' + name);
		}
		
		// executes immediately:
		sayHi('Fred');
		
		// executes after 2 seconds:
		sayHi.defer(2000, this, ['Fred']);
		
		// this syntax is sometimes useful for deferring
		// execution of an anonymous function:
		(function(){
		    alert('Anonymous');
		}).defer(100);
		</code></pre>
     * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Number} The timeout id that can be used with clearTimeout
     */
    defer : function(millis, obj, args, appendArgs){
        var fn = this.createDelegate(obj, args, appendArgs);
        if(millis > 0){
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    },
    createSequence : function(fcn, scope){
        var method = this;
        return !$.isFunction(fcn) ?
                this :
                function(){
                    var retval = method.apply(this || window, arguments);
                    fcn.apply(scope || this || window, arguments);
                    return retval;
                };
    }
});

$.extend(Array.prototype, {
    /**
     * Checks whether or not the specified object exists in the array.
     * @param {Object} o The object to check for
     * @param {Number} from (Optional) The index at which to begin the search
     * @return {Number} The index of o in the array (or -1 if it is not found)
     */
    indexOf : function(o, from){
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len : 0;
        for (; from < len; ++from){
            if(this[from] === o){
                return from;
            }
        }
        return -1;
    },
    remove : function(o){
        var index = this.indexOf(o);
        if(index != -1){
            this.splice(index, 1);
        }
        return this;
    },
    
    contains : function(o){
    	return this.indexOf(o) > -1 ? true : false;
    },
    
    append : function(v){
    	this.push(v);
    	return this;
    },
	
	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length >>> 0; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	}
	
});

$.extend(String, {
    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = String.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
     * </code></pre>
     * @param {String} string The tokenized string to be formatted
     * @param {String} value1 The value to replace token {0}
     * @param {String} value2 Etc...
     * @return {String} The formatted string
     * @static
     */
    format : function(format){
    	var args = null;
    	if($.browser.msie){
    		res = [];
             for(var i = 0, len = arguments.length; i < len; i++) {
                 res.push(arguments[i]);
             }
             args = res.slice(1);
    	}else{
    		args =  Array.prototype.slice.call(arguments, 1, arguments.length);
    	}
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    },
        /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Pads the left side of a string with a specified character.  This is especially useful
     * for normalizing number and date strings.  Example usage:
     * <pre><code>
		var s = String.leftPad('123', 5, '0');
		// s now contains the string: '00123'
     * </code></pre>
     * @param {String} string The original string
     * @param {Number} size The total length of the output string
     * @param {String} char (optional) The character with which to pad the original string (defaults to empty string " ")
     * @return {String} The padded string
     * @static
     */
    leftPad : function (val, size, ch) {
        var result = String(val);
        if(!ch) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    }
});

/**
 * Utility function that allows you to easily switch a string between two alternating values.  The passed value
 * is compared to the current string, and if they are equal, the other value that was passed in is returned.  If
 * they are already different, the first value passed in is returned.  Note that this method returns the new value
 * but does not change the current string.
 * <pre><code>
// alternate sort directions
sort = sort.toggle('ASC', 'DESC');

// instead of conditional logic:
sort = (sort == 'ASC' ? 'DESC' : 'ASC');
</code></pre>
 * @param {String} value The value to compare to the current string
 * @param {String} other The new value to use if the string already equals the first value passed in
 * @return {String} The new value
 */
String.prototype.toggle = function(value, other){
    return this == value ? other : value;
};

/**
 * Trims whitespace from either end of a string, leaving spaces within the string intact.  Example:
 * <pre><code>
var s = '  foo bar  ';
alert('-' + s + '-');         //alerts "- foo bar -"
alert('-' + s.trim() + '-');  //alerts "-foo bar-"
</code></pre>
 * @return {String} The trimmed string
 */
String.prototype.trim = function(){
    var re = /^\s+|\s+$/g;
    return function(){ return this.replace(re, ""); };
}();

String.prototype.endWith=function(oString){  
	var   reg = new RegExp(oString+"$");  
	return   reg.test(this); 
};

String.prototype.startWith=function(oString){  
	var   reg = new RegExp("^" + oString);  
	return   reg.test(this); 
};

$.extend(Number.prototype, {
    /**
     * Checks whether or not the current number is within a desired range.  If the number is already within the
     * range it is returned, otherwise the min or max value is returned depending on which side of the range is
     * exceeded.  Note that this method returns the constrained value but does not change the current number.
     * @param {Number} min The minimum number in the range
     * @param {Number} max The maximum number in the range
     * @return {Number} The constrained value if outside the range, otherwise the current value
     */
    constrain : function(min, max){
        return Math.min(Math.max(this, min), max);
    }
});


/**
 Returns the number of milliseconds between this date and date
 @param {Date} date (optional) Defaults to now
 @return {Number} The diff in milliseconds
 @member Date getElapsed
 */
Date.prototype.getElapsed = function(date) {
    return Math.abs((date || new Date()).getTime()-this.getTime());
};


Date.prototype.pattern = function(fmt) {     
	    var o = {     
	    "M+" : this.getMonth()+1, 
	    "d+" : this.getDate(), 
	    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, 
	    "H+" : this.getHours(), 
	    "m+" : this.getMinutes(), 
	    "s+" : this.getSeconds(),
	    "q+" : Math.floor((this.getMonth()+3)/3),
	    "S" : this.getMilliseconds()     
	    };     
	    var week = {     
	    "0" : "\u65e5",     
	    "1" : "\u4e00",     
	    "2" : "\u4e8c",     
	    "3" : "\u4e09",     
	    "4" : "\u56db",     
	    "5" : "\u4e94",     
	    "6" : "\u516d"    
	    };     
	    if(/(y+)/.test(fmt)){     
	        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));     
	    }     
	    if(/(E+)/.test(fmt)){     
	        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);     
	    }     
	    for(var k in o){     
	        if(new RegExp("("+ k +")").test(fmt)){     
	            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));     
	        }     
	    }     
	    return fmt;     
	} ;

/**
 * 
 * @version 0.1
 * 
 * @author Erick Wang
 * @email erick.wang@morningstar.com
 */

//for back version support
(function (jQuery){
	var idSeed = 0,
	ua = navigator.userAgent.toLowerCase(),
    check = function(r){
        return r.test(ua);
    },
    isOpera = check(/opera/),
    isChrome = check(/\bchrome\b/),
    isWebKit = check(/webkit/),
    isSafari = !isChrome && check(/safari/),
    isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
    isSafari3 = isSafari && check(/version\/3/),
    isSafari4 = isSafari && check(/version\/4/),
    isIE = !isOpera && check(/msie/),
    isIE7 = isIE && check(/msie 7/),
    isIE8 = isIE && check(/msie 8/),
    isIE6 = isIE && !isIE7 && !isIE8,
    isGecko = !isWebKit && check(/gecko/),
    isGecko2 = isGecko && check(/rv:1\.8/),
    isGecko3 = isGecko && check(/rv:1\.9/);
    if(!jQuery.browser){
    	jQuery.browser = {};
    }
    $.extend(jQuery.browser, {
    	isOpera : isOpera,
	    isChrome : isChrome,
	    isWebKit : isWebKit,
	    isSafari : isSafari,
	    isSafari2 : isSafari2,
	    isSafari3 : isSafari3, 
	    isSafari4 :isSafari4,
	    isIE : isIE ,
	    isIE7 : isIE7,
	    isIE8 : isIE8,
	    isIE6 : isIE6,
	    isGecko : isGecko,
	    isGecko2 : isGecko2,
	    isGecko3 : isGecko3
    });
    if(!jQuery.os){
    	jQuery.os = {};
    }
    jQuery.os.isWindows = check(/windows|win32/);
    jQuery.os.isMac = check(/macintosh|mac os x/);
    jQuery.os.isAir = check(/adobeair/);
    jQuery.os.isLinux = check(/linux/);
    
    jQuery.getId = function(el, prefix, isEl){
    	var DEFAULT_PREFIX = 'morn-gen';
    	if(!el){
    		return (prefix || DEFAULT_PREFIX) + (++idSeed);
    	}
    	if(isEl==undefined || isEl===true){//is element, default true
    		var jE = $(el);
    		if(jE.size()==1){
    			var e = jE.get(0);
    			!e.id && (e.id = ((prefix || DEFAULT_PREFIX) + (++idSeed)));
    			return e.id;
    		}
    		return undefined;
    	}
    	if(isEl===false){ // when isEl != true
    		var o = el || {};
	        if (!o.id) {
	            o.id = (prefix || DEFAULT_PREFIX) + (++idSeed);
	        }
	        return o.id;
    	}
    	return undefined;
    };
    
	jQuery.namespace = function(){
		 var o, d;
		 jQuery.each(arguments, function(i, v) {
            d = v.split(".");
            o = window[d[0]] = window[d[0]] || {};
            jQuery.each(d.slice(1), function(i, v2){
                o = o[v2] = o[v2] || {};
            });
        });
        return o;
	};
	
	jQuery.EventUtil = {
		addEvent : function (el, event, fn) {
			jQuery(el).bind(event, fn);
		},
		
		/**
		 * Remove event added with addEvent
		 * @param {Object} el The object
		 * @param {String} eventType The event type. Leave blank to remove all events.
		 * @param {Function} handler The function to remove
		 */
		removeEvent : function(el, eventType, handler) {
			// workaround for jQuery issue with unbinding custom events:
			// http://forum.jquery.com/topic/javascript-error-when-unbinding-a-custom-event-using-jquery-1-4-2
			var func = document.removeEventListener ? 'removeEventListener' : 'detachEvent';
			if (doc[func] && !el[func]) {
				el[func] = function() {};
			}
			
			jQuery(el).unbind(eventType, handler);
		},
		
		fireEvent : function(el, type, eventArguments, defaultFunction) {
			var event = jQuery.Event(type),
				detachedType = 'detached'+ type;
			jQuery.extend(event, eventArguments);
			
			// Prevent jQuery from triggering the object method that is named the
			// same as the event. For example, if the event is 'select', jQuery
			// attempts calling el.select and it goes into a loop.
			if (el[type]) {
				el[detachedType] = el[type];
				el[type] = null;	
			}
			
			// trigger it
			jQuery(el).trigger(event);
			
			// attach the method
			if (el[detachedType]) {
				el[type] = el[detachedType];
				el[detachedType] = null;
			}
			
			if (defaultFunction && !event.isDefaultPrevented()) {
				defaultFunction(event);
			}	
		},
		
		getPosition : function(e){
			var d = {}, x, y;
			var targetDom = e.target || e.originalTarget || e.currentTarget;//this.targetEl.get(0);
			if( targetDom.innerHeight ) {
				d.pageYOffset = targetDom.pageYOffset;
				d.pageXOffset = targetDom.pageXOffset;
				d.innerHeight = targetDom.innerHeight;
				d.innerWidth = targetDom.innerWidth;
			} else if( document.documentElement &&
				document.documentElement.clientHeight ) {
				d.pageYOffset = document.documentElement.scrollTop;
				d.pageXOffset = document.documentElement.scrollLeft;
				d.innerHeight = document.documentElement.clientHeight;
				d.innerWidth = document.documentElement.clientWidth;
			} else if( document.body ) {
				d.pageYOffset = document.body.scrollTop;
				d.pageXOffset = document.body.scrollLeft;
				d.innerHeight = document.body.clientHeight;
				d.innerWidth = document.body.clientWidth;
			}
			(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
			(e.pageY) ? y = e.pageY : y = e.clientY + d.scrollTop;
			return {x : x, y:y, d : d};
		}
	};
	
    return jQuery;
})(jQuery);


(function(){

	
	jQuery.namespace('MORN');
	
	var objectPrototype = Object.prototype;
	
	$.extend(MORN,{
		isArray: function(value){
			return objectPrototype.toString.apply(value) === '[object Array]';
		},
		isObject:function(value){
			return !!value && !value.tagName && objectPrototype.toString.call(value) === '[object Object]';
		},
		isFunction:function(value){
			return objectPrototype.toString.apply(value) === '[object Function]';
		},
	    isString: function(value) {
	        return typeof value === 'string';
	    },
	    isEmptyObject : function(value){
	    	return $.isEmptyObject.call($,value);
	    },
	    isNumber : function(value){
	    	return objectPrototype.toString.apply(value) === '[object Number]' && isFinite(value);
	    },
	    isDate: function(value) {
	        return objectPrototype.toString.call(value) === '[object Date]';
	    },
	    isBoolean: function(value) {
	        return typeof value === 'boolean';
	    }
	});

})();
