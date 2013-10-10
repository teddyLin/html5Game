(function( window, undefined ) {
	//definition
	var Lamp = function(){
		return new Lamp.fn.init( );
	},
	
	_L = window.L,
	_jQuery = window.jQuery,
	_$ = window.$,
	document = window.document,
	
	toString = Object.prototype.toString;
	
	//prototype
	Lamp.fn = Lamp.prototype = {
		init : function(){
			return this;
		}
	};
	
	
	//static methods
	/**
	 * Copies all the properties of config to obj.
	 * @param {Object} obj The receiver of the properties
	 * @param {Object} config The source of the properties
	 * @param {Object} defaults A different object that will also be applied for default values
	 * @return {Object} returns obj
	 * @member Ext apply
	 */
	Lamp.apply = Lamp.fn.apply = function(o, c, defaults){
	    // no "this" reference for friendly out of scope calls
	    if(defaults){
	        Lamp.apply(o, defaults);
	    }
	    if(o && c && typeof c == 'object'){
	        for(var p in c){
	            o[p] = c[p];
	        }
	    }
	    return o;
	};

	Lamp.apply(Lamp, {
		USE_NATIVE_JSON : false
	});
	
	Lamp.apply(Lamp, {
		isEmpty : function(v, allowBlank){
            return v === null || v === undefined || ((Lamp.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
        },
        isDate : function(v){
            return toString.apply(v) === '[object Date]';
        },
        isObject : function(v){
            return !!v && Object.prototype.toString.call(v) === '[object Object]';
        },
        isPrimitive : function(v){
            return Lamp.isString(v) || Lamp.isNumber(v) || Lamp.isBoolean(v);
        },
        isFunction : function(v){
        	return toString.apply(v) === '[object Function]';
        },
        isNumber : function(v){
            return typeof v === 'number' && isFinite(v);
        },
        isString : function(v){
            return typeof v === 'string';
        },
        isBoolean : function(v){
            return typeof v === 'boolean';
        },
        isElement : function(v) {
            return v ? !!v.tagName : false;
        },
        isDefined : function(v){
            return typeof v !== 'undefined';
        },
        isArray : function(v){
            return toString.apply(v) === '[object Array]';
        },
        isIterable : function(v){
            //check for array or arguments
            if(Lamp.isArray(v) || v.callee){
                return true;
            }
            //check for node list type
            if(/NodeList|HTMLCollection/.test(toString.call(v))){
                return true;
            }
            //NodeList has an item and length property
            //IXMLDOMNodeList has nextNode method, needs to be checked first.
            return ((typeof v.nextNode != 'undefined' || v.item) && Lamp.isNumber(v.length));
        }
	});
	
	//utils
	var idSeed = 0,
	ua = navigator.userAgent.toLowerCase(),
	DOC = document,
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
    if(!Lamp.browser){
    	Lamp.browser = {};
    }
    Lamp.apply(Lamp.browser, {
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
    if(!Lamp.os){
    	Lamp.os = {};
    }
	Lamp.apply(Lamp.os, {
		isWindows : check(/windows|win32/),
	   	isMac : check(/macintosh|mac os x/),
	    isAir : check(/adobeair/),
	    isLinux : check(/linux/)
	} );
	
	//extends
	Lamp.apply(Lamp, {
		id : function(el, prefix, isEl){
	    	var DEFAULT_PREFIX = 'Lamp-gen';
	    	if(!el){
	    		return (prefix || DEFAULT_PREFIX) + (++idSeed);
	    	}
	    	if(isEl==undefined || isEl===true){//is element, default true
	    		var jE = jQuery(el);
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
	    },
	    
	    getDom : function(el){
            if(!el){
                return null;
            }
            if (el.dom){
                return el.dom;
            } else {
            	var e = jQuery(el);
            	return e.size()>0 ? e.get(0) : null;
            }
        },
	    
	   /**
         * <p>Extends one class to create a subclass and optionally overrides members with the passed literal. This method
         * also adds the function "override()" to the subclass that can be used to override members of the class.</p>
         * For example, to create a subclass of Ext GridPanel:
         * <pre><code>
			MyGridPanel = Ext.extend(Ext.grid.GridPanel, {
			    constructor: function(config) {
			
			//      Create configuration for this Grid.
			        var store = new Ext.data.Store({...});
			        var colModel = new Ext.grid.ColumnModel({...});
			
			//      Create a new config object containing our computed properties
			//      *plus* whatever was in the config parameter.
			        config = Ext.apply({
			            store: store,
			            colModel: colModel
			        }, config);
			
			        MyGridPanel.superclass.constructor.call(this, config);
			
			//      Your postprocessing here
			    },
			
			    yourMethod: function() {
			        // etc.
			    }
			});
			</code></pre>
         *
         * <p>This function also supports a 3-argument call in which the subclass's constructor is
         * passed as an argument. In this form, the parameters are as follows:</p>
         * <div class="mdetail-params"><ul>
         * <li><code>subclass</code> : Function <div class="sub-desc">The subclass constructor.</div></li>
         * <li><code>superclass</code> : Function <div class="sub-desc">The constructor of class being extended</div></li>
         * <li><code>overrides</code> : Object <div class="sub-desc">A literal with members which are copied into the subclass's
         * prototype, and are therefore shared among all instances of the new class.</div></li>
         * </ul></div>
         *
         * @param {Function} superclass The constructor of class being extended.
         * @param {Object} overrides <p>A literal with members which are copied into the subclass's
         * prototype, and are therefore shared between all instances of the new class.</p>
         * <p>This may contain a special member named <tt><b>constructor</b></tt>. This is used
         * to define the constructor of the new class, and is returned. If this property is
         * <i>not</i> specified, a constructor is generated and returned which just calls the
         * superclass's constructor passing on its parameters.</p>
         * <p><b>It is essential that you call the superclass constructor in any provided constructor. See example code.</b></p>
         * @return {Function} The subclass constructor from the <code>overrides</code> parameter, or a generated one if not provided.
         */
        extend : function(){
            // inline overrides
            var io = function(o){
                for(var m in o){
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides){
                if(Lamp.isObject(sp)){
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function(){sp.apply(this, arguments);};
                }
                var F = function(){},
                    sbp,
                    spp = sp.prototype;

                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor=sb;
                sb.superclass=spp;
                if(spp.constructor == oc){
                    spp.constructor=sp;
                }
                sb.override = function(o){
                    Lamp.override(sb, o);
                };
                sbp.superclass = sbp.supr = (function(){
                    return spp;
                });
                sbp.override = io;
                Lamp.override(sb, overrides);
                sb.extend = function(o){return Lamp.extend(sb, o);};
                return sb;
            };
        }(),
        
        extendX : function(supr, fn){
            return Lamp.extend(supr, fn(supr.prototype));
        },
        
		 /**
         * Copies all the properties of config to obj if they don't already exist.
         * @param {Object} obj The receiver of the properties
         * @param {Object} config The source of the properties
         * @return {Object} returns obj
         */
		applyIf : function(o, c){
            if(o){
                for(var p in c){
                    if(!Lamp.isDefined(o[p])){
                        o[p] = c[p];
                    }
                }
            }
            return o;
        },
		/**
         * Adds a list of functions to the prototype of an existing class, overwriting any existing methods with the same name.
         * Usage:<pre><code>
			jQuery.override(MyClass, {
			    newMethod1: function(){
			        // etc.
			    },
			    newMethod2: function(foo){
			        // etc.
			    }
			});
			</code></pre>
         * @param {Object} origclass The class to override
         * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
         * containing one or more methods.
         * @method override
         */
		override : function(origclass, overrides){
            if(overrides){
                var p = origclass.prototype;
                Lamp.apply(p, overrides);
                if(isIE && overrides.hasOwnProperty('toString')){
                    p.toString = overrides.toString;
                }
            }
        },
        
        
		namespace : function(){
	        var o, d;
	        Lamp.each(arguments, function(v) {
	            d = v.split(".");
	            o = window[d[0]] = window[d[0]] || {};
	            Lamp.each(d.slice(1), function(v2){
	                o = o[v2] = o[v2] || {};
	            });
	        });
	        return o;
	    },

         toArray : function(){
             return isIE ?
                 function(a, i, j, res){
                     res = [];
                     for(var x = 0, len = a.length; x < len; x++) {
                         res.push(a[x]);
                     }
                     return res.slice(i || 0, j || res.length);
                 } :
                 function(a, i, j){
                     return Array.prototype.slice.call(a, i || 0, j || a.length);
                 }
         }(),

         each : function(array, fn, scope){
            if(Lamp.isEmpty(array, true)){
                return;
            }
            if(!Lamp.isIterable(array) || Lamp.isPrimitive(array)){
                array = [array];
            }
            for(var i = 0, len = array.length; i < len; i++){
                if(fn.call(scope || array[i], array[i], i, array) === false){
                    return i;
                };
            }
        },

        iterate : function(obj, fn, scope){
            if(Lamp.isEmpty(obj)){
                return;
            }
            if(Lamp.isIterable(obj)){
                Lamp.each(obj, fn, scope);
                return;
            }else if(Lamp.isObject(obj)){
                for(var prop in obj){
                    if(obj.hasOwnProperty(prop)){
                        if(fn.call(scope || obj, prop, obj[prop], obj) === false){
                            return;
                        };
                    }
                }
            }
        }
	});
	
	//more
	Lamp.apply(Lamp, {
		
		/**
         * URL to a 1x1 transparent gif image used by Ext to create inline icons with CSS background images. 
         * In older versions of IE, this defaults to "http://extjs.com/s.gif" and you should change this to a URL on your server.
         * For other browsers it uses an inline data URL.
         * @type String
         */
        BLANK_IMAGE_URL : Lamp.isIE6 || Lamp.isIE7 || Lamp.isAir ?
                            'http:/' + '/extjs.com/s.gif' :
                            'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
		
        emptyFn : function(){},
        falseFn : function(){return false;},
        trueFn : function(){return true;},
        
		num : function(v, defaultValue){
            v = Number(Lamp.isEmpty(v) || Lamp.isArray(v) || Lamp.isBoolean(v) || (Lamp.isString(v) && v.trim().length == 0) ? NaN : v);
            return isNaN(v) ? defaultValue : v;
        },
        value : function(v, defaultValue, allowBlank){
            return Lamp.isEmpty(v, allowBlank) ? defaultValue : v;
        },
        /**
         * Escapes the passed string for use in a regular expression
         * @param {String} str
         * @return {String}
         */
        escapeRe : function(s) {
            return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
        },
        copyTo : function(dest, source, names){
            if(Lamp.isString(names)){
                names = names.split(/[,;\s]/);
            }
            Lamp.each(names, function(name){
                if(source.hasOwnProperty(name)){
                    dest[name] = source[name];
                }
            }, this);
            return dest;
        },
        
        destroy : function(){
            Lamp.each(arguments, function(arg){
                if(arg){
                    if(Lamp.isArray(arg)){
                        this.destroy.apply(this, arg);
                    }else if(Lamp.isFunction(arg.destroy)){
                        arg.destroy();
                    }else if(arg.dom){
                        arg.remove();
                    }    
                }
            }, this);
        },
        
        destroyMembers : function(o, arg1, arg2, etc){
            for(var i = 1, a = arguments, len = a.length; i < len; i++) {
                Lamp.destroy(o[a[i]]);
                delete o[a[i]];
            }
        },
        
        clean : function(arr){
            var ret = [];
            Lamp.each(arr, function(v){
                if(!!v){
                    ret.push(v);
                }
            });
            return ret;
        },
        unique : function(arr){
            var ret = [],
                collect = {};

            Lamp.each(arr, function(v) {
                if(!collect[v]){
                    ret.push(v);
                }
                collect[v] = true;
            });
            return ret;
        },
        
        flatten : function(arr){
            var worker = [];
            function rFlatten(a) {
                Lamp.each(a, function(v) {
                    if(Lamp.isArray(v)){
                        rFlatten(v);
                    }else{
                        worker.push(v);
                    }
                });
                return worker;
            }
            return rFlatten(arr);
        },
         min : function(arr, comp){
            var ret = arr[0];
            comp = comp || function(a,b){ return a < b ? -1 : 1; };
            Ext.each(arr, function(v) {
                ret = comp(ret, v) == -1 ? ret : v;
            });
            return ret;
        },
        max : function(arr, comp){
            var ret = arr[0];
            comp = comp || function(a,b){ return a > b ? 1 : -1; };
            Lamp.each(arr, function(v) {
                ret = comp(ret, v) == 1 ? ret : v;
            });
            return ret;
        },
         mean : function(arr){
           return arr.length > 0 ? Lamp.sum(arr) / arr.length : undefined;
        },
        sum : function(arr){
           var ret = 0;
           Lamp.each(arr, function(v) {
               ret += v;
           });
           return ret;
        },
        partition : function(arr, truth){
            var ret = [[],[]];
            Lamp.each(arr, function(v, i, a) {
                ret[ (truth && truth(v, i, a)) || (!truth && v) ? 0 : 1].push(v);
            });
            return ret;
        },
        invoke : function(arr, methodName){
            var ret = [],
                args = Array.prototype.slice.call(arguments, 2);
            Lamp.each(arr, function(v,i) {
                if (v && Lamp.isFunction(v[methodName])) {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            });
            return ret;
        },
        pluck : function(arr, prop){
            var ret = [];
            Lamp.each(arr, function(v) {
                ret.push( v[prop] );
            });
            return ret;
        },
        zip : function(){
            var parts = Lamp.partition(arguments, function( val ){ return !Lamp.isFunction(val); }),
                arrs = parts[0],
                fn = parts[1][0],
                len = Lamp.max(Lamp.pluck(arrs, "length")),
                ret = [];

            for (var i = 0; i < len; i++) {
                ret[i] = [];
                if(fn){
                    ret[i] = fn.apply(fn, Lamp.pluck(arrs, i));
                }else{
                    for (var j = 0, aLen = arrs.length; j < aLen; j++){
                        ret[i].push( arrs[j][i] );
                    }
                }
            }
            return ret;
        },
        
        intercept : function(o, name, fn, scope){
            o[name] = o[name].createInterceptor(fn, scope);
        },

        // internal
        callback : function(cb, scope, args, delay){
            if(Lamp.isFunction(cb)){
                if(delay){
                    cb.defer(delay, scope, args || []);
                }else{
                    cb.apply(scope, args || []);
                }
            }
        },
        sequence : function(o, name, fn, scope){
            o[name] = o[name].createSequence(fn, scope);
        }
	});
	
	//short cuts and alias
	jQuery.getId = Lamp.id;
	jQuery.browser = Lamp.browser;
	jQuery.os = Lamp.os;
	jQuery.ns = Lamp.ns = Lamp.namespace;
	
	//public the functions or objects
	window.jQuery = window.$ = jQuery;
	window.Lamp = window.L = Lamp;
})(window);

(function(){
	var gIndex = 0;
	Lamp.Logger = function(options){
		this.id = 'lamp-log';
		this.css = {
					border:'1px solid #990000',
					width : 'auto',
					height : '135px',
					padding : '10px',
					overflow : 'scroll',
					'line-height' : '1.5em',
					'background-color' : '#EFEFEF'
	        	};
	    this.wrapperCss = {
	    	clear : 'both',
	    	padding : '5px',
	    	width : '98%',
	    	height : '150px',
	    	margin : 0,
	    	position : 'absolute',
			bottom: '5px',
			'z-index' : 99999
	    },
		this.max = 500;
		this.debuggable = true;
		this.level = 'debug';
		this.levels = ['debug', 'warn', 'error'];
		this.filter = function(oMsg, level, logger){
			return true;
		};
		this.limit = function(logger){
			var level = logger.level;
			var levels = logger.levels;
			var idx = levels.indexOf(level);
			var hideLevels = $.map(levels.slice(idx+1), function(v){
				return '.log-'+v;
			});
			logger.el.find(hideLevels.join(', ')).hide();
			logger.el.find('.'+level+':gt('+this.max+')').hide();
		};
		this.zebra = true;
		this.zebraStyle = {
			'background-color' : '#e9edef'
		};
		this.useGrobalIndex = false;
		this.index = 0;
		
		$.extend(true, this, options);
		if(this.debuggable){
			this._init();
		}
	};
	
	Lamp.Logger.prototype = {
		_init : function(){
			if(this._initialized){
				return;
			}
			if(this.el && this.el.length){
				return;
			}
			this.el = $('#'+this.id);
			if(!this.el.length){
				this.wrapper = $('<div class="logger-wrapper"></div>').appendTo($('body'));
				this.wrapper.css(this.wrapperCss);
				this.el = $('<div id="'+ this.id +'" class="logger"></div>').appendTo(this.wrapper);
				this.el.css(this.css);
				if(!($('#'+this.id).length)){
					alert('please setup a logger first. use '+this.id+' as ID ');
				}
			}
			this._initialized = true;
		},
		setDebuggable : function(value){
			this.debuggable = value;
			if(this.debuggable === true){
				this._init();
			}
		},
		hide : function(){
			if(!this.el.length){
				return ;
			}
			this.el.hide();
		},
		show : function(){
			if(!this.el.length){
				return ;
			}
			this.el.show();
		},
		log : function (msg , level, noIndex){
			if(!this.debuggable){ return ;}
			this.index++
			msg = ' ['+level+'] :: ' +msg + '<br/>';
			!noIndex && (msg = this.index + msg);
			
			msg = $('<div class="log-item log-'+ level +'">'+ msg + '</div>');
			
			if(this.zebra && this.index%2==1){
				msg.css(this.zebraStyle);
			}
			if(this.filter(msg, level, this)){
				this.el.prepend(msg);
				this.limit(this);
			}
		},
		debug : function(msg , noIndex){
			return this.log(msg, 'debug', noIndex);
		},
		warn : function(msg , noIndex){
			return this.log(msg, 'warn', noIndex);
		},
		error : function(msg , noIndex){
			return this.log(msg, 'error', noIndex);
		}
	};
	$(function(){
		L.logger = new Lamp.Logger({
			debuggable : false
		});
		L.setDebug = L.setDebuggable = $.proxy(L.logger.setDebuggable, L.logger);
		L.debug = $.proxy(L.logger.debug, L.logger);
		L.warn = $.proxy(L.logger.warn, L.logger);
		L.error = $.proxy(L.logger.error, L.logger);
	});
})();

