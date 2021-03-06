(function() {
    "use strict";
    window.Util = {
        randint: function(n) {
            return ~~(Math.random() * n)
        }
    };
    if (!("bind" in Function)) {
        Function.prototype.bind = function(context) {
            var self = this;
            return function() {
                return self.apply(context, arguments)
            }
        }
    }
    var $ = Class.extend({
        init: function(id) {
            this.elem = document.getElementById(id)
        }
    });
    var addEvent = function(elem, event, callback) {
        if (document.addEventListener) {
            return function(elem, type, callback) {
                elem.addEventListener(type, callback, false)
            }
        } else {
            return function(elem, type, callback) {
                elem.attachEvent("on" + type, function(e) {
                    e = e || event;
                    e.preventDefault = e.preventDefault || function() {
                        this.returnValue = false
                    };
                    e.stopPropagation = e.stopPropagation || function() {
                        this.cancelBubble = true
                    };
                    return callback.call(e.target || e.srcElement, e)
                })
            }
        }
    }();
    var events = ("mousemove mouseover mouseout mousedown mouseup click touchstart " + "dblclick focus blur submit change").split(" ");
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        $.prototype[event] = function(event) {
            return function(selector, fn) {
                if (typeof selector == "function") {
                    addEvent(this.elem, event, selector)
                } else {
                    addEvent(this.elem, event, function(e) {
                        var elem = e.target || e.srcElement;
                        if (elem.tagName.toLowerCase() == selector) {
                            e.stopPropagation();
                            fn.call(elem, e)
                        }
                    }, false)
                }
            }
        }(event)
    }
    Util.fullScreen = function() {
        if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio) {
            document.body.style.height = window.outerHeight / window.devicePixelRatio + 1 + "px";
            setTimeout(function() {
                window.scrollTo(1, 1)
            }, 0)
        } else {
            window.scrollTo(1, 1)
        }
    };
    Util.getContext = function(canvas) {
        if (!canvas.getContext && window.G_vmlCanvasManager) {
            G_vmlCanvasManager.initElement(canvas)
        }
        return canvas.getContext("2d")
    };
    Util.extend = function(orig, obj) {
        var attr;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr) && !(attr in orig)) {
                orig[attr] = obj[attr]
            }
        }
        return orig
    };
    Util.calcPieces = function(img, tmpl) {
        var w = img.width,
            h = img.height,
            options = [],
            select = document.getElementById("set-parts"),
            selected = select.selectedIndex,
            option, size, cols, rows, parts;
        select.innerHTML = "";
        for (var i = 10; i <= 100; i += 10) {
            var size = ~~Math.sqrt(w * h / i),
                cols = ~~(w / size),
                rows = ~~(h / size);
            while (cols * rows < i) {
                size--;
                cols = ~~(w / size);
                rows = ~~(h / size)
            }
            if (parts != cols * rows) {
                parts = cols * rows;
                option = document.createElement("option");
                option.value = i;
                option.innerHTML = tmpl.replace("%d", parts);
                select.appendChild(option)
            }
        }
        select.selectedIndex = selected >= 0 ? selected : 0
    };
    Util.addEvent = addEvent;
    Util.$ = function() {
        var _ = $();
        return function(id) {
            _.elem = document.getElementById(id);
            return _
        }
    }()
})();
(function() {
    "use strict";
    var ctx = Util.getContext(document.createElement("canvas")),
        abs = Math.abs;
    var pixelRatio = window.devicePixelRatio || 1;

    function check_position(f1, f2) {
        if (f1.rotation % 360 || f2.rotation % 360 || f2.hide || f1.hide || f1.row != f2.row && f1.col != f2.col) {
            return
        }
        var diff_x = f1.tx - f2.tx,
            diff_y = f1.ty - f2.ty,
            diff_col = f1.col - f2.col,
            diff_row = f1.row - f2.row,
            w = f1.width,
            h = f1.height,
            s = f1.size;
        if ((diff_col == -1 && diff_x < 0 && abs(diff_x + w) < 10 || diff_col == 1 && diff_x >= 0 && abs(diff_x - w) < 10) && (diff_y <= 10 && diff_y >= -10)) {
            return [f1.col > f2.col ? -abs(diff_x) + w : abs(diff_x) - w, f2.ty - f1.ty]
        } else if ((diff_row == -1 && diff_y < 0 && abs(diff_y + h) < 10 || diff_row == 1 && diff_y >= 0 && abs(diff_y - h) < 10) && (diff_x <= 10 && diff_x >= -10)) {
            return [f2.tx - f1.tx, f1.row > f2.row ? -abs(diff_y) + h : abs(diff_y) - h]
        }
    }
    var Piece = Cevent.Shape.extend({
            type: "piece",
            init: function(x, y, img, width, height, edges) {
                this._super(x, y);
                this.img = img;
                this.size = Math.max(width, height);
                this.width = width;
                this.height = height;
                this.edges = edges;
                var half_s = this.size / 2;
                this.tx = this.x + this.width / 2;
                this.ty = this.y + this.height / 2;
                this.x = -this.width / 2;
                this.y = -this.height / 2
            },
            draw_path: function(ctx) {
                var s = this.size,
                    fn, i = 0;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                for (; i < 4; i++) {
                    fn = this.edges[i];
                    s = i % 2 ? this.height : this.width;
                    var w = i % 2 ? this.height : this.width;
                    var h = i % 2 ? this.width : this.height;
                    var x = i % 2 ? this.y : this.x;
                    var y = i % 2 ? this.x : this.y;
                    if (fn) {
                        var cx = this[fn](ctx, w, h, x, y)
                    } else {
                        ctx.lineTo(x + s, y)
                    }
                    ctx.rotate(Math.PI / 2)
                }
                ctx.closePath()
            },
            render: function(ox, oy) {
                ox = ox || this.ox || 0;
                oy = oy || this.oy || 0;
                var ctx = Util.getContext(document.createElement("canvas")),
                    s = this.size + .5;
                ctx.canvas.width = s * 2;
                ctx.canvas.height = s * 2;
                ctx.save();
                this.applyStyle(ctx);
                ctx.lineWidth = .5;
                ctx.translate(this.width, this.height);
                this.draw_path(ctx);
                ctx.clip();
                ctx.drawImage(this.img, -this.tx - ox, -this.ty - oy);
                if (this.stroke) {
                    ctx.globalCompositeOperation = "lighter";
                    ctx.shadowOffsetY = 1.5;
                    ctx.shadowOffsetX = 1.5;
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = "rgba(255, 255, 255, .4)";
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = "rgba(0, 0, 0, .4)";
                    ctx.stroke();
                    ctx.globalCompositeOperation = "darken";
                    ctx.shadowBlur = 1;
                    ctx.shadowOffsetY = -1;
                    ctx.shadowOffsetX = -1;
                    ctx.shadowBlur = 2;
                    ctx.shadowColor = "rgba(0, 0, 0, .2)";
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "rgba(0, 0, 0, .4)";
                    ctx.stroke();
                    ctx.clip()
                }
                ctx.restore();
                this.tx += this.offset;
                this.img = ctx.canvas
            },
            outside: function(ctx, w, h, cx, cy) {
                ctx.lineTo(cx + w * .34, cy);
                ctx.bezierCurveTo(cx + w * .5, cy, cx + w * .4, cy + h * -.15, cx + w * .4, cy + h * -.15);
                ctx.bezierCurveTo(cx + w * .3, cy + h * -.3, cx + w * .5, cy + h * -.3, cx + w * .5, cy + h * -.3);
                ctx.bezierCurveTo(cx + w * .7, cy + h * -.3, cx + w * .6, cy + h * -.15, cx + w * .6, cy + h * -.15);
                ctx.bezierCurveTo(cx + w * .5, cy, cx + w * .65, cy, cx + w * .65, cy);
                ctx.lineTo(cx + w, cy)
            },
            inside: function(ctx, w, h, cx, cy) {
                ctx.lineTo(cx + w * .35, cy);
                ctx.bezierCurveTo(cx + w * .505, cy + .05, cx + w * .405, cy + h * .155, cx + w * .405, cy + h * .1505);
                ctx.bezierCurveTo(cx + w * .3, cy + h * .3, cx + w * .5, cy + h * .3, cx + w * .5, cy + h * .3);
                ctx.bezierCurveTo(cx + w * .7, cy + h * .29, cx + w * .6, cy + h * .15, cx + w * .6, cy + h * .15);
                ctx.bezierCurveTo(cx + w * .5, cy, cx + w * .65, cy, cx + w * .65, cy);
                ctx.lineTo(cx + w, cy)
            },
            draw: function(ctx) {
                if (this.hide) {
                    return
                }
                this.setTransform(ctx);
                ctx.drawImage(this.img, this.x - this.width / 2 - .5, this.y - this.height / 2 - .5)
            },
            check: function(other) {
                var r;
                if (other.type == "piece") {
                    r = check_position(this, other)
                } else {
                    var i, l = other.pieces.length;
                    for (i = 0; i < l; i++) {
                        if (r = check_position(this, other.pieces[i])) {
                            break
                        }
                    }
                }
                if (r) {
                    this.rmove(r[0], r[1])
                }
                return r
            },
            hitTest: function(point) {
                if (this.hide) {
                    return
                }
                ctx.save();
                this.setTransform(ctx);
                this.draw_path(ctx);
                ctx.restore();
                return ctx.isPointInPath(point.x * pixelRatio, point.y * pixelRatio)
            }
        }),
        Group = Cevent.Shape.extend({
            type: "group",
            init: function() {
                this.pieces = [];
                this._super(0, 0)
            },
            draw: function(ctx) {
                if (this.hide) {
                    return
                }
                var i, l = this.pieces.length;
                for (i = 0; i < l; i++) {
                    this.pieces[i].draw(ctx)
                }
            },
            hitTest: function(point) {
                var i, l = this.pieces.length;
                for (i = 0; i < l; i++) {
                    if (this.pieces[i].hitTest(point)) {
                        this._current = this.pieces[i];
                        this.tx = this._current.tx;
                        this.ty = this._current.ty;
                        return true
                    }
                }
            },
            check: function(other) {
                var i, l = this.pieces.length,
                    r;
                if (other.type == "piece") {
                    for (i = 0; i < l; i++) {
                        if (r = check_position(this.pieces[i], other)) {
							
                            this.rmove(r[0], r[1]);
                            return true
                        }
                    }
                } else {
                    var j, l2 = other.pieces.length;
                    for (i = 0; i < l; i++) {
                        for (j = 0; j < l2; j++) {
                            if (r = check_position(this.pieces[i], other.pieces[j])) {
                                this.rmove(r[0], r[1]);
                                return true
                            }
                        }
                    }
                }
            },
            rmove: function(x, y) {
                var i, l = this.pieces.length;
                for (i = 0; i < l; i++) {
                    this.pieces[i].rmove(x, y)
                }
			
               this.tx = this._current.tx;
               this.ty = this._current.ty
            },
            add: function() {
                this.pieces = this.pieces.concat.apply(this.pieces, arguments)
            }
        });
    Cevent.register("group", Group);
    Cevent.register("piece", Piece)
})();
(function() {
    "use strict";
    var IN = "inside",
        OUT = "outside",
        NONE = null,
        DEFAULT_IMAGE, EDGES = [IN, OUT],
        uuid = 0,
        default_opts = {
            spread: 0.9,
            offsetTop: 0,
            maxWidth: 500,
            maxHeight: 200,
            defaultImage: "images/puzzle/scottwills_meercats.jpg",
            piecesNumberTmpl: "%d Pieces",
            redirect: "",
            border: true,
            defaultPieces: 10,
            shuffled: true,
            rotatePieces: false
        },
        TOOLBAR_HEIGHT = 45,
        docElement = document.documentElement,
        pixelRatio = window.devicePixelRatio || 1;

    function random_edge() {
        return EDGES[Util.randint(2)]
    }

    function $(id) {
        return document.getElementById(id)
    }
    window.jigsaw = {};
    jigsaw.Jigsaw = Class.extend({
        init: function(opts) {
            var eventBus = new EventEmitter,
                self = this;
            this.opts = opts = Util.extend(opts || {}, default_opts);
            this.max_width = 1000;
            this.max_height = 700;
            $("redirect-form").action = opts.redirect;
            DEFAULT_IMAGE = opts.defaultImage;
            this.eventBus = eventBus;
            this.ce = new Cevent("canvas");
            this.ui = new jigsaw.UI(eventBus, 16);
            this.tmp_img = document.createElement("img");
            this.img = document.getElementById("image");
            this.ctx = Util.getContext(this.img);
            this.preview = document.getElementById("image-preview");
            this.previewCtx = Util.getContext(this.preview);
            this.parts = 16;
            this.tmp_img.onload = function() {
                self.original = this;
                self.max_width = this.width;
                self.max_height = this.height;
                self.draw_image(this);
                Util.calcPieces(self.img, self.opts.piecesNumberTmpl, self.parts);
                self.render()
            };
            this.tmp_img.onerror = function() {
                if (DEFAULT_IMAGE) {
                    self.set_image(DEFAULT_IMAGE)
                }
            };
            jigsaw_events(this.ce, eventBus, this.opts.rotatePieces);
            eventBus.on(jigsaw.Events.JIGSAW_COMPLETE, function() {
                self.ui.stop_clock();
                if (opts.redirect) {
                    self.redirect()
                } else {
                    self.ui.show_time()
                }
            });
            if (opts.shuffled) {
                eventBus.on(jigsaw.Events.RENDER_FINISH, this.shuffle.bind(this))
            }
            eventBus.on(jigsaw.Events.PARTS_NUMBER_CHANGED, this.set_parts.bind(this));
            eventBus.on(jigsaw.Events.RENDER_REQUEST, this.render.bind(this));
            eventBus.on(jigsaw.Events.JIGSAW_SHUFFLE, this.shuffle.bind(this));
            eventBus.on(jigsaw.Events.JIGSAW_SET_IMAGE, this.set_image.bind(this));
            eventBus.on(jigsaw.Events.SHOW_EDGE, function() {
                self.ce.find("#middle").attr("hide", true);
                self.ce.find("#edge").attr("hide", false);
                self.ce.redraw()
            });
            eventBus.on(jigsaw.Events.SHOW_MIDDLE, function() {
                self.ce.find("#middle").attr("hide", false);
                self.ce.find("#edge").attr("hide", true);
                self.ce.redraw()
            });
            eventBus.on(jigsaw.Events.SHOW_ALL, function() {
                self.ce.find("*").attr("hide", false);
                self.ce.redraw()
            });
            Util.addEvent(window, "resize", this.resize.bind(this));
            this.resize();
            this.set_image()
        },
        resize: function resizeView() {
          var canvas = this.ce.cv;
          
			
			    var winHeight=document.getElementById("sidenav").clientHeight;
			    document.getElementById("game-container").style.height=parseInt(winHeight)+30+"px";
			  var  maxWidth = document.getElementById("game-container").clientWidth-(document.getElementById("game-container").clientWidth*0.08);
				    
				var maxHeight = document.getElementById("game-container").style.height;
				
            canvas.width = maxWidth * pixelRatio;
            canvas.height = maxHeight * pixelRatio;
            canvas.style.width = maxWidth + "px";
            canvas.style.height = maxHeight + "px";
		 
            this.ce.redraw();
            if (Cevent.isTouchDevice) {
                Util.fullScreen()
            }
        },
        redirect: function() {
            $("t").value = this.ui.time();
            $("p").value = this.parts;
            $("redirect-form").submit()
        },
        set_parts: function(n) {
            this.parts = n
        },
        set_image: function(src) {
            this.ce.cv.className = "loading";
            this.tmp_img.src = src || DEFAULT_IMAGE
        },
        draw_image: function(img, w, h) {
            var max_w = w || this.max_width * pixelRatio,
                max_h = h || this.max_height * pixelRatio,
                width, height, ctx = this.ctx;
            if (max_w > window.innerWidth || max_h > window.innerHeight - 50) {
                var ratio = Math.min(window.innerWidth / max_w, (window.innerHeight - 50) / max_h);
                max_w *= ratio;
                max_h *= ratio
            }
            /*    if (img.width > max_w || img.height > max_h) {
                var rate = Math.min(max_w / img.width, max_h / img.height);
                width = ~~(img.width * rate) * pixelRatio;
                height = ~~(img.height * rate) * pixelRatio;
				
				if(pixelRatio>1)
				{
				ctx.canvas.width = 550 ;
                ctx.canvas.height = 350;		
				}
				else{
				ctx.canvas.width = 300;
                ctx.canvas.height = 200;	
				}
                
				
                ctx.drawImage(img, 0, 0);
            } */ 
				var mWidth,mHeight,refHeight=window.innerHeight ;
				if(window.innerWidth<901){
					mWidth=210;
					mHeight=150;
				}
				else{
					if(refHeight<700){
						mWidth=280;
					mHeight=200;	
					}
					if(refHeight>=700 && refHeight<800){
					mWidth=300;
					mHeight=214;
				}
				if(refHeight>=800 && refHeight<901){
					mWidth=350;
					mHeight=250;
				}
				if(refHeight>=901 && refHeight < 1001){
					mWidth=400;
					mHeight=285;
				}
				if(refHeight>=1001 && refHeight < 1200){
					mWidth=490;
					mHeight=350;
				}
				
				if(refHeight>=1200 && refHeight < 1400){
					mWidth=550;
					mHeight=350;
				}
				if(refHeight>=1400 && refHeight < 2000){
					mWidth=650;
					mHeight=450;
				}
				if(refHeight>=2000){
					mWidth=790;
					mHeight=505;
				}
		}
				
                
				if(pixelRatio>1)
				{
				mWidth=mWidth * 2;
				mHeight=mHeight * 2;
				}
				ctx.canvas.width = mWidth;
                ctx.canvas.height = mHeight;
                ctx.drawImage(img, 0, 0);
        },
        clear: function() {
            this.ce._shapes = []
        },
        shuffle: function() {
            var T = this.ce.getAll("piece");
            if (!this.__pieces) {
                return
            } else {
                this.ce._shapes = T = this.__pieces.slice(0)
            }
            var i, l = T.length,
                F, s = T[0].size,
                ratio = 0.5,
                width = document.getElementById("canvas").clientWidth* pixelRatio,
                height = (document.getElementById("canvas").clientHeight) * pixelRatio,
                w = document.getElementById("canvas").clientWidth * ratio,
                h = (document.getElementById("canvas").clientHeight) * ratio,
                padx = ~~((width - w) / 2);
               var compArea=(document.getElementById("masthead").clientHeight)+30+parseInt(document.getElementById("image-preview").style.height);
				var selectedArea=(document.getElementById("canvas").clientHeight) - (parseInt(document.getElementById("image-preview").style.height)+50);
				var midArea=selectedArea/2;
				var calcY1=(parseInt(selectedArea)+((T[0].height)/2))*pixelRatio;
				var calcY2=calcY1 + (T[0].height)+20;
								var rand_index=Math.floor(Math.random()*4),counter=0,counter2=0;
				var woffset=((width/2)-(T[0].width*4))+((T[0].width/3));	

if(window.devicePixelRatio >1){
               calcY1=calcY1-50;
			   calcY2=calcY2-50;
			}
				
				var wff=woffset;
				var xx=[woffset,woffset+(T[0].width*3)+15,woffset+(T[0].width*7)+35,woffset+(T[0].width)+5,woffset+(T[0].width*6)+30,woffset+(T[0].width*2)+10,woffset+(T[0].width*4)+20,woffset+(T[0].width*5)+25];
				var xxx=[woffset,woffset+(T[0].width*3)+15,woffset+(T[0].width*7)+35,woffset+(T[0].width)+5,woffset+(T[0].width*6)+30,woffset+(T[0].width*2)+10,woffset+(T[0].width*4)+20,woffset+(T[0].width*5)+25];
				var rand_index2=Math.floor(Math.random()*7),counter=0;
            for (i = 0; i < l; i++) {
                 F = T[i];
				if(i<8){
				F.ty = calcY1;
				
                if(i==0){
				F.tx =xx[rand_index];
				xx[rand_index]=0;   
			   }
			   else{
				    if(xx[counter]==0){
					    counter++;
						
						
					}
					
					 F.tx=xx[counter];
					 xx[counter]=0;
					 counter++;
			   }
			   
				}
				else{
				F.ty = calcY2;
				 
               if(i==8){
				F.tx =xxx[rand_index2];
				xxx[rand_index2]=0;   
			   }
			   else{
				    if(xxx[counter2]==0){
					    counter2++;
					}
					
					 F.tx=xxx[counter2];
					 xxx[counter2]=0;
					 counter2++;
			   }	
			  
				}
			
              
                
				if (this.opts.rotatePieces) {
                    F.rotation = Util.randint(4) * 90
                }
            }
            if (this.opts.shuffled) {
                this.ce.cv.className = "";
                this.ui.init_clock()
            }
            this.ce.shuffled = true;
            this.ce.redraw()
        },
        render: function() {
            if (this.opts.shuffled) {
                this.ce.cv.className = "loading";
                this.ce.clear();
                this.ui.stop_clock()
            } else {
                this.ce.cv.className = ""
            }
            this.ce.shuffled = false;
            var top, right, bottom, left, current_right = [],
                last_right = [],
                w = this.img.width,
                h = this.img.height,
                size = ~~Math.sqrt(w * h / this.parts),
                cols=~~Math.sqrt(this.parts),		
			   rows=~~Math.sqrt(this.parts),
                i = 0,
                j = 0,
                flag = ++uuid,
                offset;
            this.flag = flag;
            while (cols * rows < this.parts) {
                size--;
                cols = ~~(w / size);
                rows = ~~(h / size)
            }
            var width = ~~(w / cols);
            var height = ~~(h / rows);
            width = width % 2 ? width : width - 1;
            height = height % 2 ? height : height - 1;
            offset = ~~(document.documentElement.clientWidth / 2 * pixelRatio - width * cols / 2);
            this.clear();
            var ox = ~~((w - cols * width) / 2),
                oy = ~~((h - rows * height) / 2);
            ox = ox >= 0 ? ox : 0;
            oy = oy >= 0 ? oy : 0;
            window.a = this;
            this.preview.style.marginTop = 30+ "px";
            this.preview.width = width * cols;
            this.preview.height = height * rows;
            this.preview.style.width = this.preview.width/pixelRatio + "px";
            this.preview.style.height = this.preview.height/pixelRatio + "px";
			this.preview.style.marginLeft = -(this.preview.width / 2/pixelRatio) + "px";
            this.previewCtx.drawImage(this.img, ox, oy, width * cols, height * rows, 0, 0, width * cols, height * rows);
            (function F() {
                if (i < cols && flag == this.flag) {
                    if (j < rows) {
                        top = j == 0 ? NONE : bottom == IN ? OUT : IN;
                        right = i == cols - 1 ? NONE : random_edge();
                        bottom = j == rows - 1 ? NONE : random_edge();
                        left = i == 0 ? 0 : last_right[j] == IN ? OUT : IN;
                        this.ce.piece(width * i, height * j + this.opts.offsetTop, window.G_vmlCanvasManager ? this.tmp_img : this.img, width, height, [top, right, bottom, left]).attr({
                            col: i,
                            row: j,
                            offset: offset,
                            stroke: this.opts.border ? "black" : ""
                        }).get(-1).render(ox, oy - this.opts.offsetTop);
                        if (!this.opts.shuffled) {
                            this.ce.redraw()
                        }
                        if (j == 0 || i == 0 || i == cols - 1 || j == rows - 1) {
                            this.ce.addId("edge")
                        } else {
                            this.ce.addId("middle")
                        }
                        current_right.push(right);
                        j++
                    } else {
                        i++;
                        j = 0;
                        last_right = current_right;
                        current_right = []
                    }
                    setTimeout(F.bind(this), 20);
                    return
                } else if (this.flag == flag) {
                    this.__pieces = this.ce.get().slice(0);
                    this.ce.redraw();
                    this.eventBus.emit(jigsaw.Events.RENDER_FINISH)
                }
            }).bind(this)()
        }
    });

    function jigsaw_events(ce, eventBus, rotate) {
        ce.drag("*", {
            start: function(c, e) {
				
                c.cv.style.cursor = "move";
                c.lastX *= pixelRatio;
                c.lastY *= pixelRatio;
                this.handleX = c.lastX - this.tx;
                this.handleY = c.lastY - this.ty
            },
            move: function(c, e) {
                c.x *= pixelRatio;
                c.y *= pixelRatio;
                c.x += c.lastX - this.tx - this.handleX;
                c.y += c.lastY - this.ty - this.handleY;
                var deltaX = c.x - c.lastX,
                    deltaY = c.y - c.lastY,
                    newX, newY, pieces = this.pieces || [this],
                    piece, width = c.cv.width,
                    height = c.cv.height,
                    size = pieces[0].size;
                for (var i = 0; i < pieces.length; i++) {
                    piece = pieces[i];
                    newX = piece.x + piece.tx + deltaX;
                    newY = piece.y + piece.ty + deltaY;
                    if (newX < 0 && deltaX < 0 || newX + size > width && deltaX > 0) c.lastX = c.x;
                    if (newY < 0 && deltaY < 0 || newY + size > height && deltaY > 0) c.lastY = c.y
                }
            },
            end: function(c, e) {
                c.cv.style.cursor = "default";
                if (!c.shuffled) {
                    return
                }
                var all = c.getAll("piece").concat(c.getAll("group")),
                    i = 0,
                    l = all.length,
                    that = this;
                for (; i < l; i++) {
                    if (all[i] === this) {
						
                    }
                    if (that.check(all[i])) {
						var audio = new Audio('magic.mp3');
                         audio.play();
                        c.remove(that);
                        c.remove(all[i]);
                        c._curHover = c.group().get(-1);
                        c._curHover.add(that.pieces || that, all[i].pieces || all[i]);
                        that = c._curHover;
                        c.focused = null
                    }
                }
                if (!ce.getAll("piece").length && ce.getAll("group").length == 1 && ce.shuffled) {
					document.getElementById("image-preview").style.display="none";
                    ce.shuffled = false;
                    		var audio = new Audio('tada.mp3');
                         audio.play();
					setTimeout(function(){ eventBus.emit(jigsaw.Events.JIGSAW_COMPLETE)}, 1000);
                }
                if (that.type == "group") {
                    c.remove(that);
                    c._shapes.unshift(that)
                }
            }
        }).focus("*", function(c, e) {
	
            c.remove(this);
            c._shapes.push(this)
        });
        Util.addEvent(ce.cv, "contextmenu", function(e) {
            if (rotate && ce.focused) {
                ce.focused.rotation = (ce.focused.rotation + 45) % 360;
                ce.redraw()
            }
            e.preventDefault()
        });
        if (!rotate) {
            return
        }
        ce.keydown("right", function() {
            if (this.focused) {
                this.focused.rotation = (this.focused.rotation + 45) % 360
            }
            return false
        }).keydown("left", function() {
		
            if (this.focused) {
                this.focused.rotation = (this.focused.rotation - 45) % 360
            }
            return false
        });
        ce.tap("*", function(c, e) {
		
            if (Cevent.isTouchDevice && ce.focused) {
                ce.focused.rotation = (ce.focused.rotation + 45) % 360;
                ce.redraw()
            }
        })
    }
    EventEmitter.mixin(jigsaw.Jigsaw)
})();
(function() {
    "use strict";
    var $ = function(id) {
            return document.getElementById(id)
        },
        uuid = 0,
        deviceRatio = window.devicePixelRatio || 1;
    jigsaw.UI = Class.extend({
        init: function(eventBus, parts) {
            var self = this;
            this.eventBus = eventBus;
            this.clock = $("clock");
            $("set-parts").value = parts;
            init_events(this, eventBus);
            eventBus.on(jigsaw.Events.JIGSAW_SHUFFLE, this.init_clock.bind(this));
            eventBus.on(jigsaw.Events.SHOW_PREVIEW, this.show_preview.bind(this));
            eventBus.on(jigsaw.Events.SHOW_HELP, this.show_help.bind(this));
            eventBus.on(jigsaw.Events.SHOW_FILEPICKER, this.show_filepicker.bind(this))
        },
        stop_clock: function() {
            uuid++
        },
        init_clock: function() {
            var self = this;
            this.ini = (new Date).getTime();
            this.uuid = uuid;
            (function F() {
                if (self.uuid == uuid) {
                    self.clock.innerHTML = self.time();
                    setTimeout(F, 1e3)
                }
            })()
        },
        show_preview: function() {
            var canvas = $("image-preview");
            canvas.className = canvas.className == "show" ? "hide" : "show";
            canvas.style.marginLeft = -(canvas.width / 2 / deviceRatio) + "px"
        },
        show_time: function() {
          //  this.show_modal("congrat");
            $("time").innerHTML = this.clock.innerHTML;
          //  $("time-input").value = this.clock.innerHTML;
		    var audio = new Audio('music.mp3');
                         audio.play();
			document.getElementById("myModal").classList.remove("hide");		
			document.getElementById("overlay").classList.remove("hide");
        },
        time: function() {
            var t = ~~(((new Date).getTime() - this.ini) / 1e3),
                s = t % 60,
                m = ~~(t / 60),
                h = ~~(m / 60);
            m %= 60;
            return  (m > 9 ? m : "0" + m % 60) + ":" + (s > 9 ? s : "0" + s)
        },
        show_modal: function(id) {
            game.Modal.open(id)
        },
        show_filepicker: function() {
            this.show_modal("create-puzzle")
        },
        show_help: function() {
            this.show_modal("help")
        }
    });

    function init_events(self, eventBus) {
        function handleFiles(files) {
            var file = files[0];
            if (!file.type.match(/image.*/)) {
                $("image-error").style.display = "block";
                return
            }
            var reader = new FileReader;
            reader.onloadend = function(e) {
                eventBus.emit(jigsaw.Events.JIGSAW_SET_IMAGE, this.result);
                close_lightbox()
            };
            reader.readAsDataURL(file)
        }
        if (window.FileReader && (new FileReader).onload === null) {
            $("create").style.display = "block";
            Util.$("image-input").change(function() {
                handleFiles(this.files)
            });
            if ("ondragenter" in window && "ondrop" in window) {
                $("dnd").style.display = "block";
                document.addEventListener("dragenter", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false
                }, false);
                document.addEventListener("dragover", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false
                }, false);
                document.addEventListener("drop", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var dt = e.dataTransfer;
                    handleFiles(dt.files)
                }, false)
            }
        }

        function close_lightbox() {
            game.Modal.close();
            return false
        }
        Util.$("set-parts").change(function() {
            eventBus.emit(jigsaw.Events.PARTS_NUMBER_CHANGED, +this.value);
            eventBus.emit(jigsaw.Events.RENDER_REQUEST)
        });
        Util.$("game-options")[Cevent.isTouchDevice ? "touchstart" : "click"]("a", function(e) {
            if (jigsaw.Events[this.id]) {
                e.preventDefault();
                eventBus.emit(jigsaw.Events[this.id])
            }
        })
    }
})();
(function() {
    jigsaw.Events = {
        PARTS_NUMBER_CHANGED: "PartsNumberChanged",
        RENDER_REQUEST: "RenderRequestEvent",
        RENDER_FINISH: "RenderFinishEvent",
        JIGSAW_RENDERED: "JigsawRenderedEvent",
        JIGSAW_SET_IMAGE: "JigsawSetImageEvent",
        JIGSAW_SHUFFLE: "JigsawShuffleEvent",
        SHOW_PREVIEW: "JigsawShowPreview",
        SHOW_HELP: "JigsawShowHelp",
        SHOW_FILEPICKER: "JigsawShowFilepicker",
        SHOW_EDGE: "ShowEdgeEvent",
        SHOW_MIDDLE: "ShowMiddleEvent",
        SHOW_ALL: "ShowAllEvent",
        JIGSAW_COMPLETE: "JigsawCompleteEvent"
    }
})();
(function(document, window, undefined) {
    "use strict";
    var $ = function(id) {
            return document.getElementById(id)
        },
        $modal = $("modal-window"),
        $msg = $("modal-window-msg"),
        $close = $("modal-window-close"),
        $overlay = $("overlay");

    function replace(text, tmpl) {
        var i;
        for (i in tmpl) {
            if (tmpl.hasOwnProperty(i)) {
                text = text.replace(new RegExp("{{" + i + "}}", "gi"), tmpl[i])
            }
        }
        return text
    }

    function showModal(id, tmpl) {
        var style = $modal.style,
            elem = $(id);
        elem.className = "";
        game.Modal.currentContent = elem;
        $msg.appendChild(elem);
        var width = $modal.offsetWidth;
        style.marginLeft = -width / 2 + "px";
        $modal.className = "modal";
        $overlay.className = ""
    }

    function closeModal(e) {
        e && e.preventDefault();
        $modal.className = "modal hide";
        $overlay.className = "hide";
        var current = game.Modal.currentContent;
        setTimeout(function() {
            if (!current) return;
            current.className = "hide";
            document.body.appendChild(current)
        }, 600);
        return false
    }
    var event = Cevent.isTouchDevice ? "touchstart" : "click";
    Cevent.addEventListener($overlay, event, closeModal);
    Cevent.addEventListener($close, event, closeModal);
    window.game = window.game || {};
    game.Modal = {
        open: showModal,
        close: closeModal
    }
})(document, window);
(function(document, window, undefined) {
    function parseQueryString() {
        if (location.query) {
            return
        }
        var parts = location.search.replace(/^[?]/, "").split("&"),
            i = 0,
            l = parts.length,
            GET = {};
        for (; i < l; i++) {
            if (!parts[i]) {
                continue
            }
            part = parts[i].split("=");
            GET[unescape(part[0])] = unescape(part[1])
        }
        return GET
    }
    jigsaw.GET = parseQueryString()
})(document, window);