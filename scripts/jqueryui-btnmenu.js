(function($){

	jQuery.Color.fn.contrastColor = function() {
		var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
		//return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "black" : "white";
		return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "light" : "dark";
	};

	String.prototype.toXMLNode = function() { 
		if (!this) return null;
		var tmp = this.toXMLDoc();	//bspXMLDoc(this);
		var nd = tmp.firstChild.cloneNode(true);
		tmp=null;
		return nd;
	}
	
	String.prototype.toXMLDoc = function(vclean) { 
		var xmlDoc = null;
		var XMLDOM_IDS = ['Msxml2.DOMDocument.6.0','Msxml2.DOMDocument.5.0','Msxml2.DOMDocument.4.0','Msxml2.DOMDocument.3.0','Msxml2.DOMDocument','Microsoft.DOMDocument'];
		for (var i=0;i < XMLDOM_IDS.length; i++) {
			try {
				xmlDoc = new ActiveXObject(XMLDOM_IDS[i]);
				break;
			} catch(err) {}
		}
		if (xmlDoc) {
			vclean = vclean || false;
			xmlDoc.async=false;
			var docstr = this;
			if (vclean) {
				docstr = docstr.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=\".*\"(.*)>/g, "<$1$2>");	//remove namespaces
				docstr = docstr.replace(/<\?xml(.|[\n])*>/,"");									//remove declaration
				//docstr = docstr.replace(/01.01.1900 00:00:00/g, "");
				//docstr = docstr.replace(/01.01.1900/g, "");
				docstr = docstr.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})/g,"$3.$2.$1 $4:$5:$6");
			}
			xmlDoc.loadXML(docstr);
		} else {
			//if (document.implementation && document.implementation.createDocument) {
				//create the DOM Document the standards way
				//xmlDoc = document.implementation.createDocument("","", null);
			if (window.DOMParser) {
				var parser = new DOMParser();
				//parser.setPreserveWhitespace(false);
				xmlDoc = parser.parseFromString(this, "application/xml");		
				removeWhitespace(xmlDoc);
			} else {
				alert("XML Not Supported");
			}
		}
		return xmlDoc;
	}
	
	function removeWhitespace(node) {
		for (var i= node.childNodes.length; i-->0;) {
			var child= node.childNodes[i];
			if (child.nodeType===3 && child.data.match(/^\s*$/))
				node.removeChild(child);
			if (child.nodeType===1)
				removeWhitespace(child);
		}
	}	
	
	//var btnmenuitem2 = function(vparent, vdiv, vlayout, vdata, vicons, opts) {
	var dotrace = false;
	var contextcount = 0;
	
	var btnmenuitem2 = function(vparent, vdata, opts, refpos) {
		if (vdata==null || opts==null) return;		
		this.globals = opts;
		this.parent = vparent;
		//this.level = 0;
		this.showing=false;
		this.container = null;
		this.classname = (opts.classname || "") + " ";
		//this.colorscheme = opts.colorscheme || 'light';
		this.pulldown = null;
		this.children = [];
		this.childcount = 0;	//without cdata
		this.pulldown_hasicons = false;
		this.pulldown_hasarrow = false;
		this.show_icon = false;
		this.rtl = false;
		this.datanode = vdata;
		this.title = vdata.getAttribute("title");
		this.url = vdata.getAttribute("url") || "#";
		this.icon = vdata.getAttribute("icon");
		this.iconmap = vdata.getAttribute("iconmap");
		this.type = vdata.getAttribute("type");
		this.position = vdata.getAttribute("position");
		this.disabled = vdata.getAttribute("disabled")=="true"?true:false;
		this.layout = opts.layout;
		this.columns = 1;
		if (vdata.getAttribute("columns")) {		
			this.columns = vdata.getAttribute("columns")*1;
		}
this.iconelem = null;
this.arrowelem = null;
this.textelem = null;
		var cdata = "";
		var imgarrow = "";
		var icostr = "";		
		var elmstil = "";
		
		for (var x=0; x<this.datanode.childNodes.length; x++) {			
			var ndname = this.datanode.childNodes[x].nodeName;	
			if (ndname!="#text") {
				if (ndname!="#cdata-section") {
					var nd = this.datanode.childNodes[x];
					if (nd) {
					if (nd.getAttribute("title")!="-") {
						this.childcount++;
						if (this.datanode.childNodes[x].getAttribute("icon")!=null) this.pulldown_hasicons=true;
						if (this.globals.iconfile && this.datanode.childNodes[x].getAttribute("iconmap")!=null) this.pulldown_hasicons=true;
						if (this.datanode.childNodes[x].childNodes.length>1) this.pulldown_hasarrow = true;
						if (this.pulldown_hasarrow==false && this.datanode.childNodes[x].childNodes.length>0 && this.datanode.childNodes[x].childNodes[0].nodeName!="#cdata-section") this.pulldown_hasarrow = true;
					}
					}
				} else {
					cdata += this.datanode.childNodes[x].nodeValue;
				}
			}		
		}

		if (this.parent) {
			if (this.parent.disabled) this.disabled=true;
			this.level = this.parent.level + 1;
			if (!this.parent.parent) this.level=this.parent.level;
			this.index = (this.parent.index || 0) + "." + this.parent.children.length;
			
			if ((this.parent.pulldown && this.level>this.globals.showlevels) || this.globals.layout=="context") this.layout="vertical";
			//if (this.globals.layout=="context") this.layout="vertical";
			if (this.parent.pulldown) {
				this.container = this.parent.pulldown;
			} else { 
				this.container = this.parent.container;
			}
			if (this.container==null) return;
			if (this.globals.showicons && this.parent.pulldown_hasicons) this.show_icon=true;			
			if (this.title!="-" && this.parent.layout=="horizontal" && ((this.parent.position=="right" && this.layout=="vertical") || this.parent.rtl)) this.rtl=true;
			
			//if (this.layout=="horizontal") elmstil="display:inline-block; float:left;";
if (this.layout=="horizontal") elmstil="display:inline; float:left;";
//if (this.layout=="vertical") elmstil="display:block;";
			//if (this.layout=="horizontal") elmstil="display:table-cell;";
			//if (this.layout=="vertical") elmstil="display:table;";
			if (this.position=="right" && this.layout!="vertical") {
				elmstil += "float:right;";		
			}
			if (this.parent.position=="right" && this.globals.layout=="horizontal" && this.level<=this.globals.showlevels)	{ 	// && this.parent.layout=="horizontal") {
				this.position="right";
				elmstil += "float:right;";
			}
			elmstil+=vdata.getAttribute("style");
			if (this.title!="-" && this.globals.menuwidth>0) elmstil+="max-width:" + this.globals.menuwidth + "px !important;width:" + this.globals.menuwidth + "px !important;";
			if (this.title!="-" && this.globals.menuheight>0) elmstil+="max-height:" + this.globals.menuwidth + "px !important;height:" + this.globals.menuwidth + "px !important;";
			if (elmstil!="") elmstil = " style=\"" + elmstil + "\" ";
		
			if (this.title=="-") {
				this.element = $("<div class=\"" + this.classname + this.layout + " btn-menuitem-seperator\"" + elmstil + "></div>");
			} else {
				if (this.parent.pulldown_hasarrow) {
					if (this.layout!="horizontal") imgarrow = "<div class=\"btn-menuitem-arrow blank\"></div>";
					if (this.datanode.childNodes.length>0) {
						//if (this.level>0 || this.layout=="vertical") {
						if (this.layout=="vertical") {
							imgarrow = "<div class=\"btn-menuitem-arrow " + (this.rtl?"left ":"right ") + "\"></div>";
						} else {
							//if (this.level<=0 && this.layout=="horizontal") {
							if (this.layout=="horizontal") {
								imgarrow = "<div class=\"btn-menuitem-arrow down\"></div>";
							}
						}
					}
				}
				if (this.disabled==true && this.globals.hidedisabledchildren==true) {
					imgarrow = "<div class=\"btn-menuitem-arrow blank\"></div>";
				}
				//if (opts.showicons && this.show_icon && (((this.icon && this.layout=="horizontal") || (this.layout!="horizontal")))) {
				if (this.globals.showicons && this.show_icon && this.parent.pulldown_hasicons) {
					//icostr = "<div class=\"btn-menuitem-icon " + this.icon + "\">&nbsp;</div>";
					if (this.icon) {
						icostr = "<div class=\"btn-menuitem-icon\"><img src=\"" + this.icon + "\" width=\"" + this.globals.iconsize + "\" height=\"" + this.globals.iconsize + "\"></div>";
					} else {
						if (this.globals.iconfile && this.iconmap) {
							icostr = "<div class=\"btn-menuitem-icon\" style=\"background-image:url(" + this.globals.iconfile + "); background-position:" + this.iconmap + ";\">&nbsp;</div>";
						} else {
							if (this.parent.pulldown_hasicons && this.layout!="horizontal") icostr = "<div class=\"btn-menuitem-icon\">&nbsp;</div>";					
						}
					}
				/*} else {
					if (opts.showicons && this.show_icon && this.globals.iconfile && this.iconmap) {
						icostr = "<div class=\"btn-menuitem-icon\" style=\"background-image:url(" + this.globals.iconfile + "); background-position:" + this.iconmap + ";\">&nbsp;</div>";
					}
					*/
				}
				if (this.type=="label" || cdata) {
					this.element = $("<div btnlevel=\"" + this.level + "\" btnindex=\"" + this.index + "\" " +
									"class=\"" + this.classname + "btn-menuitem " + this.layout + " btn-menuitem-label\"" + 
									elmstil + ">" + 
										(this.rtl?imgarrow:"") + 
										"<div class=\"btn-menuitem-text\" " + (this.disabled?"disabled ":"") + vonclick + "href=\"#\">" +
											this.title + (cdata?cdata:"") +
										"</div>" + 
										(this.rtl?"":imgarrow) + 
									"</div>");
				} else {
					var vonclick = "";
					if (this.datanode.childNodes.length==0 && this.url) {
						vonclick=" onclick=\"location.href='" + this.url + "';\"";
					}
					this.element = $("<div btnlevel=\"" + this.level + "\" btnindex=\"" + this.index + "\" class=\"" + 
									this.classname + "btn-menuitem " + this.layout + "\"" + elmstil + ">" + 
									//"<div class=\"btn-menuitem-container\" style=\"display:table;\">" + 
										(this.rtl?imgarrow:icostr) + 
										"<div class=\"btn-menuitem-text\" " + (this.disabled?"disabled ":"") + vonclick + "href=\"#\">" +
											(this.globals.showindexes?"(" + this.level + " - " + this.index + ") ":"") + this.title + 
										"</div>" + 
										(this.rtl?icostr:imgarrow) + 
									//"</div>" +
									"</div>");
				}
			}
			if (refpos) {
				if (refpos.pos=="after") this.parent.children[refpos.ref].element.after(this.element);
				if (refpos.pos=="before") this.parent.children[refpos.ref].element.before(this.element);
				if (refpos.pos=="child") {
					//if (dotrace) alert(this.title);
					this.parent.children.push(this);
					this.parent.datanode.appendChild(this.datanode);
					//if (this.type!="label" && this.title!="-") 
					this.parent.childcount++;
					if (this.parent.pulldown) {
						this.parent.pulldown.append(this.element);
					} else {
						this.parent.pulldown_hasarrow=true;
						this.parent.createpulldown();
						this.parent.refresh();
					}
				}
			} else {
				this.container.append(this.element);
			}
			
			//if (this.title!="-") {
				var elmico = $(".btn-menuitem-icon", this.element);
				var elmlnk = $(".btn-menuitem-text", this.element);
				var elmarr = $(".btn-menuitem-arrow", this.element);
				this.iconelem = elmico;
				this.textelem = elmlnk;
				this.arrowelem = elmarr;
				
				/*var elmdiv = this.element.first().children();
				var elmico = null, elmlnk = null, elmarrow = null;
				if (elmdiv.first().hasClass("btn-menuitem-icon")) {
					elmico = elmdiv.first();		
					elmlnk = elmico.next();
					elmarrow = elmlnk.next();
				} else {
					elmico = null;
					elmlnk = elmdiv.first();
					elmarrow = elmlnk.next();
				}*/
				if (elmico.length>0) {
					elmico.height(elmlnk.innerHeight());
					elmico.width(elmlnk.innerHeight()+2);
				}
				if (this.childcount>0 || this.level<this.globals.showlevels) {
					if (!(this.disabled==true && this.globals.hidedisabledchildren==true)) {
						this.createpulldown();
						if (this.layout=="horizontal" && this.pulldown.width()<this.element.width()) this.pulldown.width(this.element.width());
					}
				}
				var othat = this;
				//if (this.type!="label") {
					if (this.globals.activation=="mouseover") {
						this.element.mouseout(function(event) {
							othat.setarrowcolor();
						});
						this.element.mouseover(function(event) {							
							var vindx = this.getAttribute("btnindex");
							var vpull = $(".btn-pulldown[btnindex='" + vindx + "']");
							var isvisi = false;
							if (vpull.length>0) isvisi = vpull.is(":visible");							
							if (!isvisi) {
								$(".btn-pulldown, .btn-levelmenu").hide();
								if (othat.globals.enabletrace) $(".btn-menuitem").removeClass("btn-trace");
								var opar = othat.parent;
								while (opar) {
									if (othat.globals.enabletrace && opar.element && opar.columns==1) opar.element.addClass("btn-trace");
									if (opar.pulldown) opar.pulldown.show();
									opar = opar.parent;
								}
								othat.showpulldown();
							}
							othat.setarrowcolor();
						});
					}
					if (this.globals.activation=="click") {
						this.element.first().click(function(event) {
							$(".btn-pulldown, .btn-levelmenu").hide();
							if (othat.globals.enabletrace) $(".btn-menuitem").removeClass("btn-trace");
							var opar = othat.parent;
							while (opar) {
								if (othat.globals.enabletrace && opar.element) opar.element.addClass("btn-trace");
								if (opar.pulldown) opar.pulldown.show();
								opar = opar.parent;
							}
							othat.showpulldown();
						});
					}
					this.setarrowcolor();
				//}
			//}
		}
	}
	btnmenuitem2.prototype.setarrowcolor=function() {
		var varr = $(".btn-menuitem-arrow",this.element);
		if (varr.length>0 && !varr.hasClass("blank")) {
			var vbackcl = this.element.css("background-color") || this.element.css("background");
			if (!vbackcl || vbackcl=="transparent" || vbackcl=="rgba(0, 0, 0, 0)") {
				vbackcl = "";
				this.element.parents().each(function(){								
					vbackcl = vbackcl || $(this).css("background-color") || $(this).css("background");
					if (!vbackcl || vbackcl=="transparent" || vbackcl=="rgba(0, 0, 0, 0)") vbackcl = "";
				});
			}
			if (!vbackcl || vbackcl=="transparent" || vbackcl=="rgba(0, 0, 0, 0)") vbackcl = "#ffffff";					
			var vtip = $.Color(vbackcl).contrastColor();
			//$("#dbg").html($("#dbg").html() + " -- " + this.title + " : " + vbackcl + " - " + vtip);
			varr.removeClass("light");
			varr.removeClass("dark");
			varr.addClass(vtip);
		}						
	}
	btnmenuitem2.prototype.refresh=function() {
		var pararrow = $(".btn-menuitem-arrow",this.element);
		if (this.children.length>0) {
			if (pararrow.length>0) {
				pararrow.removeClass("down left right blank");
				if (this.layout=="vertical") {
					pararrow.addClass((this.rtl?"left":"right"));
				} else {
					if (this.layout=="horizontal") {
						pararrow.addClass("down");
					}
				}
			} else {
				var parimgarrow = "<div class=\"btn-menuitem-arrow blank\"></div>";
				if (this.layout=="vertical") {
					parimgarrow = "<div class=\"btn-menuitem-arrow " + (this.rtl?"left ":"right ") + "\"></div>";	// border=\"0\" src=\"../admin/images/arrow_right.png\">";
				} else {
					//if (this.level<=0 && this.layout=="horizontal") {
					if (this.layout=="horizontal") {
						parimgarrow = "<div class=\"btn-menuitem-arrow down\"></div>";	// border=\"0\" src=\"../admin/images/arrow_down.png\">";
					}
				}
				$("a",this.element).after(parimgarrow);
			}
		} else {
			if (pararrow.length>0) {
				pararrow.removeClass("down left right blank");
				pararrow.addClass("blank");
			}
		}
	}
	btnmenuitem2.prototype.resize_pulldown_elements=function() {
		if (this.layout=="horizontal") return;
		var vcontainer = this.pulldown || this.container;
		if (vcontainer.length>0) {
			var mnmax = vcontainer.width();
			var txtmax = 0;
			var icomax = 0;
			var arrmax = 0;
			$(".btn-menuitem",vcontainer).each(function() {
				var $txt = $(".btn-menuitem-text", $(this));
				var $ico = $(".btn-menuitem-icon", $(this));
				var $arr = $(".btn-menuitem-arrow", $(this));
				var wt = 0, wi = 0, wa = 0;
				if ($txt.length>0) wt = $txt.width();
				if ($ico.length>0) wi = $ico.width();
				if ($arr.length>0) wa = $arr.width();
				txtmax = wt > icomax ? wt : icomax;
				icomax = wi > icomax ? wi : icomax;
				arrmax = wa > arrmax ? wa : arrmax;
				mnmax = $(this).width() > mnmax ? $(this).width() : mnmax;
			});
			var diffmax = mnmax - icomax - arrmax;
			txtmax = diffmax>txtmax?diffmax:txtmax;
			$(".btn-menuitem",vcontainer).each(function() {
				if (!($(this).hasClass("btn-menuitem-columngroup-header"))) {
				var $txt = $(".btn-menuitem-text", $(this));
				$(this).width(mnmax);
				if ($txt.length>0) $txt.width(txtmax);
				}
			});
		}
	}
	
	function xxxxxxxxxxxxxxxxxxx() {
		return;

		var vcontainer = this.pulldown || this.container;
		if (vcontainer.length>0) {
			var vmax = 0;
			var icomax = 0;
			var arrmax = 0;
			$(".btn-menuitem-text",vcontainer).each(function() {
				var $me = $(this);
				var w = $me.innerWidth(); 
				var wi = 0 || $me.prev().outerWidth(); 
				var wa = 0 || $me.next().outerWidth();
				vmax = w > vmax ? w : vmax;
				icomax = wi > icomax ? wi : icomax;
				arrmax = wa > arrmax ? wa : arrmax;
			});
			//alert(vmax + "\r\n" + this.pulldown.innerWidth() + "-" + icomax +  "-" + arrmax);
			//if (vmax<this.pulldown.innerWidth()-icomax-arrmax) vmax = this.pulldown.innerWidth()-icomax-arrmax;
			$(".btn-menuitem-text",vcontainer).each(function() {
				$(this).width(vmax);
			});
		}
		
		
		return;
		var maxwidth = 0;
		for (var x=0; x<this.children.length; x++) {
			if (this.children[x].title!="-") {
				var lnk = this.children[x].element.first().children().first();
				//if (lnk[0].nodeName!="A") lnk = lnk.next();
				if (lnk[0].className!="btn-menuitem-text") lnk = lnk.next();
				var lnkwid = lnk.outerWidth();
				if (lnkwid > maxwidth) maxwidth = lnkwid;
			}
		};		
		//if (this.pulldown.width()>maxwidth) maxwidth=this.pulldown.width();
		for (var x=0; x<this.children.length; x++) {
			if (this.children[x].title!="-") {
				var lnk = this.children[x].element.first().children().first();
				//if (lnk[0].nodeName!="A") lnk = lnk.next();
				if (lnk[0].className!="btn-menuitem-text") lnk = lnk.next();
				lnk.width(maxwidth);
			}
		}	
	}
	
	btnmenuitem2.prototype.getpulldowndirection=function() {
			var vdir = "up";
			if (this.layout!="horizontal") {
				vdir = (this.rtl?"right":"left");
			}
			return vdir;
	}
	btnmenuitem2.prototype.setpulldownposition=function() {
			var vdir = "up";
			if (this.layout=="horizontal") {
				this.pulldown.position({
					my:"left top",
					at:"left bottom-2",
					of:this.element
				});
			} else {
				if (this.rtl) {
					vdir = "right";
					this.pulldown.position({
						my:"right top",
						at:"left top",					
						of:this.element
					});
				} else {
					vdir = "left";
					this.pulldown.position({
						my:"left top",
						at:"right-2 top",
						of:this.element
					});
				}
			}
			return vdir;
	}
	
	btnmenuitem2.prototype.showpulldown=function() {
		if (this.level>0 && this.container) {
			this.container.show();
			this.container.css("z-index","900");
		}
		if (this.pulldown) {
			if (this.level<this.globals.showlevels) {
				var vlvl = this.level;
				var velm = this;
				while (vlvl<this.globals.showlevels) {
					velm.pulldown.show();
					if (velm.layout=="vertical") {
						velm.pulldown.css("clear","none");
						velm.pulldown.css("display","inline");
						velm.pulldown.css("float","left");
					}
					vlvl=vlvl+1;
					velm=velm.children[0];
				}
				return;
			}
			this.pulldown.show();
			var vdir = this.setpulldownposition();
			this.pulldown.css("z-index","900");
			this.pulldown.hide();
			var othat = this;			
			this.pulldown.show("slide",{direction:vdir}, 200, function() { 
				othat.setpulldownposition();
			});
		}
	}	
	
	btnmenuitem2.prototype.createpulldown=function(vdiv) {
			if (vdiv) {
				//this.level = 0;
				//this.pulldown = $("<div class=\"" + this.classname + "btn-pulldown\" style=\"position:absolute;\"></div>");
				if (this.globals.layout=="context") {
					this.layout = "vertical";
					//this.container = $("<div class=\"btn-menu vertical btn-context\" style=\"display:inline-block;z-index:900;\"></div>");
					this.container = $("<div class=\"btn-menu vertical btn-context\" style=\"ccdisplay:inline;z-index:900;\"></div>");
					this.context = true;
					//this.container.appendTo(vdiv);					
					vdiv.attr("btnindex",contextcount);
					this.container.attr("btnindex",contextcount);
					$("body").append(this.container);
					//this.container.hide();
					vdiv.bind("contextmenu", function(e) {
						var ctx = $(".btn-context[btnindex=" + $(this).attr("btnindex") + "]");
						ctx.show();	//css("visibility","visible");
						//alert(ctx.length);
						/*var x = e.pageX;	// + 20;
						var y = e.pageY;	// + 20;
						ctx.offset({ left: x, top: y });	*/
						ctx.position({
							my:"left top",
							at:"right top",
							of:e,
							offset:"-15 -15"
						});
						return false;
					});							
					contextcount++;					
				} else {
					this.context = false;
					//this.layout = this.globals.layout || "horizontal";
					var pull_level = this.level*1;
					var pull_index = this.index || 0;
					var lvlcss = "";
					if (pull_level>0) lvlcss=" btn-levelmenu";
					if (this.globals.layout=="vertical") {
						this.layout="vertical";
						//this.container = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + pull_index + "\" class=\"btn-menu " + this.layout + lvlcss + "\" style=\"clear:none; float:left; min-width:180px; display:inline-block;\"></div>");
						this.container = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + pull_index + "\" class=\"btn-menu " + this.layout + lvlcss + "\" style=\"clear:none; float:left; min-width:180px; display:inline;\"></div>");
					} else {
						this.container = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + pull_index + "\" class=\"btn-menu " + this.layout + lvlcss + "\"></div>");
					}
					this.container.appendTo(vdiv);
				}
			} else {
				var pull_level = this.level + 1;
				var lvlcss = "";
				if (pull_level>0) lvlcss=" btn-levelmenu";
				if (this.level>=this.globals.showlevels) {
					this.pulldown = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + this.index + "\" class=\"" + this.classname + "btn-pulldown" + (this.rtl?" btn-rtl":"") + "\" style=\"position:absolute;\"></div>");
					this.pulldown.appendTo($('body'));
					//lvlcss!="" && 
					if (this.globals.levelshading) {
						//$("#txtdbg").append($.Color(this.container.parent().css("background-color")).lightness(1-0.1*pull_level).toHexString() + "\r\n");
						this.pulldown.css("background-color",$.Color(this.pulldown.first().css("background-color")).lightness(1-0.075*pull_level).toHexString());
					}
				} else {
					this.layout=this.parent.layout;
					if (this.layout=="vertical" && lvlcss!="") {
						//this.pulldown = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + this.index + "\" class=\"btn-menu " + this.layout + (this.rtl?" btn-rtl":"") + lvlcss + "\" style=\"clear:none; float:left; min-width:180px; display:inline-block;\"></div>");
						this.pulldown = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + this.index + "\" class=\"btn-menu " + this.layout + (this.rtl?" btn-rtl":"") + lvlcss + "\" style=\"clear:none; float:left; min-width:180px; display:inline;\"></div>");
					} else {
						this.pulldown = $("<div btnlevel=\"" + pull_level + "\" btnindex=\"" + this.index + "\" style=\"clear:both;display:block;\" class=\"btn-menu " + this.layout + (this.rtl?" btn-rtl":"") + lvlcss + "\"></div>");
					}
					//alert(this.title + "\r\n" + this.level + " >= " + this.globals.showlevels);
					this.pulldown.appendTo(this.container.parent());
					//lvlcss!="" && 
					if (this.globals.levelshading) {
					//if (this.globals.layout=="context") alert("halo");
						//$("#txtdbg").append($.Color(this.container.parent().css("background-color")).lightness(1-0.1*pull_level).toHexString() + "\r\n");
						this.pulldown.css("background-color",$.Color(this.container.parent().css("background-color")).lightness(1-0.075*pull_level).toHexString());
					}
				}
					if (this.datanode.getAttribute("pulldownstyle")) {
						var vstil = this.pulldown.attr("style");
						this.pulldown.attr("style",vstil + this.datanode.getAttribute("pulldownstyle"));
						//alert(vstil);
					}
				//this.pulldown.appendTo(this.element);			
				var iconcontainer = null;
				if (this.pulldown_hasicons && this.globals.showicons) {
					iconcontainer = $("<div class=\"btn-pulldown-icon-container\">&nbsp;</div>");
					iconcontainer.width(28);
					this.pulldown.append(iconcontainer);
					//this.pulldown.css("background-image","url(../admin/images/menu_back.png)");
					//this.pulldown.css("background-repeat","repeat-y");
				}
				if (this.datanode.childNodes.length==0 && this.level<this.globals.showlevels) {
					//var clvl = this.level + 1;
					//clvl++;
					//var indstr = ".0";
					//var elm = this;
					//while (clvl<=this.globals.showlevels) {
						this.children.push(new btnmenuitem2(this, "<menuitem title=\"\" url=\"\"></menuitem>".toXMLNode(), this.globals));
						//elm = elm.children[0];
						/*var vpulldown = $("<div btnlevel=\"" + clvl + "\" btnindex=\"" + this.index + indstr + "\" style=\"clear:both;display:block;\" class=\"btn-menu " + this.layout + (this.rtl?" btn-rtl":"") + " btn-levelmenu\"></div>");
						//alert(this.title + "\r\n" + this.level + " >= " + this.globals.showlevels);
						vpulldown.append("&nbsp;");
						vpulldown.appendTo(this.container.parent());
						vpulldown.hide();
						indstr += ".0";*/
						//clvl++;
					//}
				}
			}
			//if (!vdiv) dotrace=true;
			for (var x=0; x<this.datanode.childNodes.length; x++) {
				if (this.datanode.childNodes[x].nodeName!="#cdata-section") {
					if (this.datanode.childNodes[x].nodeName=="menuitem" && this.datanode.childNodes[x].getAttribute("hidden")=="true") {
					} else {
						this.children.push(new btnmenuitem2(this, this.datanode.childNodes[x], this.globals));
					}
				}
			}
			if (this.layout!="horizontal") {
				if (iconcontainer && !vdiv) {
					iconcontainer.height(this.pulldown.height());
				}
				//if (this.globals.menuwidth==0) 
				this.resize_pulldown_elements();
			}
			
			if (!vdiv) {
				//if (this.level>=this.globals.showlevels)
					//resize_pulldown_menus(this.pulldown);
					$(this.pulldown).hide();
			} else {
				if (this.layout=="horizontal") {
				//this.resize_pulldown_elements();
					var vmax = 0;
					$(".btn-menuitem",this.container).each(function() {
						var h = $(this).outerHeight(); 
						vmax = h > vmax ? h : vmax;
					});					
					$(".btn-menuitem-seperator,.btn-menuitem",this.container).each(function() {
						$(this).height(vmax);
					});
				} else {
					//resize_pulldown_menus(this.container);
				}
				if (this.globals.layout=="context") this.container.hide();
			}
			if (this.columns>1) {			
				this.pulldown.height(this.pulldown.height()/this.columns);
				//this.pulldown.width((this.pulldown.width()*this.columns));
				
					//$(this.pulldown).show();
				var elemind = Math.round(this.children.length/this.columns);
				var wid = 0;
				for (var x=0; x<this.columns; x++) {
					var $grp = $("<div class=\"btn-menuitem-columngroup\"></div>");
					$grp.appendTo(this.pulldown);
					for (var y=1; y<=elemind; y++) {
						var vind = (x*elemind) + y;
						if (vind<=this.children.length) {
							this.children[vind-1].element.first().appendTo($grp);
						}
					}					
					wid += $grp.outerWidth();
				}
				//alert(wid);
				//this.pulldown.width(wid + this.columns);
				//$(this.pulldown).hide();
				this.pulldown.removeClass("btn-pulldown");
				this.pulldown.addClass("btn-menuitem-columngroup-container");
				this.element.mouseover(function() { });
				this.element.mouseout(function() { });
				/*this.pulldown.css("display","inline");
				this.pulldown.css("clear","both");
				this.pulldown.css("float","none");
				this.pulldown.css("height","auto");
				this.pulldown.css("position","relative");
				this.pulldown.css("margin","10px");*/
				$(this.pulldown).show();
				//alert(this.element[0].outerHTML);
				if (this.arrowelem) {
					if (this.arrowelem.length>0) {
						this.arrowelem.css("display","none");
					}
				}
				this.element.addClass("btn-menuitem-columngroup-header");
				this.pulldown.insertAfter(this.element);
				this.pulldown=null;
			}
	}
	
	btnmenuitem2.prototype.getchild=function(vbtnindex) {
		for (var x=0; x<this.children.length; x++) {
			if (this.children[x].index==vbtnindex) {
				return this.children[x];
			}
		}
		for (var x=0; x<this.children.length; x++) {
			var mn = this.children[x].getchild(vbtnindex);
			if (mn) return mn;			
		}	
		return null;
	}
	
	btnmenuitem2.prototype.getchild2=function(vbtnindex) {	
		var indarr = vbtnindex.split(".");		
		var chkmn = this;
		for (var x=1; x<indarr.length; x++) {
			var ind = parseInt(indarr[x]);
			if (chkmn.children.length>ind) {
				chkmn = chkmn.children[ind];
			} else {
				return null;
			}
		}
		return chkmn;
	}
	
	btnmenuitem2.prototype.hidemenu=function() {
	}
	
	btnmenuitem2.prototype.destroy=function() {
		this.element.remove();
		this.pulldown.remove();
		for (var x=0; x<this.children.length; x++) {
			this.children[x].destroy();
		}
		this.datanode.parentNode.removeChild(this.datanode);
		
	}
	
	btnmenuitem2.prototype.disable=function() {
		this.disabled=true;
		this.element.prop("disabled",true);
		for (var x=0; x<this.children.length; x++) {
			this.children[x].disable();
		}
		if (this.globals.hidedisabledchildren==true) {
		}		
	}
	
	btnmenuitem2.prototype.enable=function() {
		this.disabled=false;
		this.element.prop("disabled",false);
		$("a", this.element).prop("disabled",false);
		for (var x=0; x<this.children.length; x++) {
			this.children[x].enable();
		}
		if (this.globals.hidedisabledchildren==true) {
		}		
	}
	
	btnmenuitem2.prototype.showmenu=function() {		
		var vpull = this.parent.pulldown;	//$(".btn-pulldown[btnindex='" + vindx + "']");
		var isvisi = false;
		if (vpull.length>0) isvisi = vpull.is(":visible");
		//alert(vpull.css("display") + "\r\n" + vpull.is(":visible"));
		if (!isvisi) {
			this.showing=true;
			$(".btn-pulldown, .btn-levelmenu").hide();
			if (this.globals.enabletrace) $(".btn-menuitem").removeClass("btn-trace");
			var opar = this.parent;
			var cnt = 0;
			while (opar) {
				//alert(cnt);
				if (this.globals.enabletrace && opar.element && opar.columns==1) opar.element.addClass("btn-trace");
				if (opar.pulldown) {
					opar.pulldown.show();
				}
				opar = opar.parent;
				cnt++;
			}
		}
	}
	
 	var methods = {	
		hello:function() {
			alert("hello");
		},
		resizelements:function() {
			alert($(".btn-menuitem", this).length());
		},
		hide:function(vindex) {
			var rootmn = this.data("btnmenu_plugin");
			var mn = rootmn.getchild(vindex);
			mn.element.hide();
			return mn;
		},
		show:function(vindex) {
			var rootmn = this.data("btnmenu_plugin");
			var mn = rootmn.getchild(vindex);
			mn.element.show();
			return mn;
		},
		addmenuitem:function(obj) {
			//alert(JSON.stringify(obj));
			if (obj.ref) {
				var rootmn = this.data("btnmenu_plugin");
				var mn = rootmn.getchild(obj.ref);
				//alert(mn.length);
				if (obj.pos=="aschild" && obj.title) {
							dotrace=true;
					var newnd = ("<menuitem title=\"" + obj.title + "\"></menuitem>").toXMLNode();
					var newmn = new btnmenuitem2(mn, newnd, mn.globals, {
						ref:-1,
						pos:"child"
					});
					//mn.children.push(newmn);
					return newmn;
				}				
				if ((obj.pos=="after" || obj.pos=="before") && obj.title) {
					if (mn.parent) {
						var refpos = mn.parent.children.indexOf(mn);
						if (refpos>-1) {
							var newnd = ("<menuitem title=\"" + obj.title + "\"></menuitem>").toXMLNode();
							var newmn = new btnmenuitem2(mn.parent, newnd, mn.globals, {
								ref:refpos,
								pos:obj.pos
							});
							mn.parent.children.splice(refpos,0,newmn);
							return newmn;
						}
					}
				}				
			}
			return null;
		},
		remove: function(vindex) {
			var rootmn = this.data("btnmenu_plugin");
			var mn = rootmn.getchild(vindex);
			mn.destroy();
			//ensure_menulevel_visibility()
			return mn;
		},
		disable: function(vindex) {
			var rootmn = this.data("btnmenu_plugin");
			var mn = rootmn.getchild(vindex);
			mn.disable();
			return mn;
		},		
		enable: function(vindex) {
			var rootmn = this.data("btnmenu_plugin");
			var mn = rootmn.getchild(vindex);
			mn.enable();
			return mn;
		},		
 		init: function(options) {
			var defaults = {
				//horizontal, vertical, context
				layout : 'horizontal',
				showlevels:0,
				levelshading:false,
				activeitemindex:null,
				enabletrace:false,
				//xmlstring, xmldocument, json, html(nested div with attributes)
				datamode : 'xmlstring',
				dataobject : '<menuitems></menuitems>',
				activation : 'mouseover',
				//subclass
				classname : '',							
				//colorscheme : '',
				//disable all icon usage
				showicons:false,
				showindexes:false,
				hidedisabledchildren:false,
				//if single file for all icons is specified then position in each menuitem used (iconpos : { x:0, y:0 })
				iconfile:null,
				iconsize:16,
				iconmap:{},
				darkiconfile:null,
				lighticonfile:null,
				menuwidth:0,
				menuheight:0
			}
			var datasource = null,
			    options =  $.extend(defaults, options),
				contextcount = 0;
			//if (options.hidedisabledchildren=="true") { 
			
			return this.each(function() {
				var o = options;
				var obj = $(this);
				var vdata = null;
				switch (o.datamode) {
				case "xmldocument" :
					if (o.dataobject && o.dataobject.firstChild) vdata=o.dataobject;
					break;
				case "json":
					if (o.dataobject) {
						var vdatastr = "<menuitems>" + json2xml(o.dataobject) + "</menuitems>";						
						vdata = vdatastr.toXMLDoc();						
					}
					break;
				case "html":
					alert("underconstruction");
					return;
					break;
				case "xmlstring":
				default:
					if (o.dataobject && (typeof o.dataobject=="string")) vdata = o.dataobject.toXMLDoc();
					break;
				}
				$(this).html("");
				//if (o.dataobject) {
				//	vdata = o.dataobject.toXMLDoc();
				//} else {
					//load from obj content to xml --- should be nested ul-il
				//}				
				if (vdata && vdata.firstChild) {		//XML document cannot contain multiple root nodes
					//if (o.lighticonfile) changecss("background-image",".btn-menuitem-arrow.dark",o.lighticonfile);					
					var mn = new btnmenuitem2(null, vdata.firstChild, o);
					mn.level=0;
					mn.createpulldown(obj);
					if (o.showlevels>0) {
						$(".btn-levelmenu").show();
						//ensure_menulevel_visibility(mn,o,0);
						var maxw = 0;
						var maxh = 0;
						//alert($(".btn-levelmenu",obj).length);
						//$(".btn-levelmenu,.btn-menu",obj).each(function() {
						if (o.layout=="vertical") {
							maxh=(mn.pulldown || mn.container).height();
						}
						for (var x=1; x<=o.showlevels; x++) {
							var lvlcss = ".btn-levelmenu[btnlevel='" + x + "']"
							$(lvlcss, obj).each(function() {
								maxw = $(this).width()>maxw?$(this).width():maxw;
								maxh = $(this).outerHeight()>maxh?$(this).outerHeight():maxh;
							});
							/*var lvlcss2 = ".btn-levelmenu[btnlevel='" + x + "'] .btn-menuitem-text"
							$(lvlcss2, obj).each(function() {
								//maxw = $(this).width()>maxw?$(this).width():maxw;
								maxh2 = $(this).height()>maxh2?$(this).height():maxh2;
							});*/
							//alert("maxw=" + maxw + "\r\nmaxh=" + maxh);
							//$(".btn-levelmenu,.btn-menu",obj).each(function() {
							$(lvlcss, obj).each(function() {
								var wdiff = $(this).outerWidth() - $(this).width();
								var hdiff = $(this).outerHeight() - $(this).height();
								//var hdiff2 = $(this).outerHeight() - $(this).innerHeight();
								//alert(hdiff);
								//$(this).width(maxw-wdiff+16);
								if (o.layout!="horizontal") {
									wdiff=0;
									hdiff=hdiff-2;
								}
								//if (o.layout!="horizontal") wdiff=0;
								$(this).width(maxw-wdiff);
								//if (o.layout=="xxhorizontal") 
								$(this).height(maxh-hdiff);
								if (o.layout!="horizontal") resize_pulldown_menus(this);
								
								var maxh2 = 0;
								$(".btn-menuitem-text", $(this)).each(function() {
									var vhei = $(this).outerHeight() - $(this).height();
									maxh2 = vhei>maxh2?vhei:maxh2;
								});
								if (o.layout=="horizontal") $(this).css("line-height", maxh-maxh2-hdiff + "px");
								//var $lst = $(".btn-menuitem-text",$(this));
/*								$(".btn-menuitem-text", $(this)).each(function() {
									$(this).css("line-height", maxh2 + "px");
								});*/

								
							});
						}

						//mn.resize_pulldown_elements();


						
						$(".btn-levelmenu").hide();
						ensure_menulevel_visibility(mn,o,0);
						
						
						
						/*var active_elem = null;
						for (var x=0; x<mn.children.length; x++) {
							if (mn.children[x].type==null && mn.children[x].title!="-") {
								active_elem = mn.children[x];	//.index + " - " + mn.children[x].title);
								break;
							}
						}*/
						/*var cnt = 1;
						var vind="0." + cnt;
						var vmenu = $(".btn-menuitem[btnindex='" + vind + "']",$(this));
						while (vmenu.length==0 && cnt<10) {
							cnt++;
							vind="0." + cnt;
							vmenu = $(".btn-menuitem[btnindex='" + vind + "']",$(this));
						}
						alert("show default level for \r\n" + vmenu.length + "-" + vmenu.element.title);*/
						//var itm = getitem_toactivate(mn, '0');
		/*var cntind=0;
		$(".btn-menu",$(this)).each(function() {
			var ind = this.getAttribute("btnindex")*1;
			var lvl = this.getAttribute("btnlevel")*1;
			if (lvl<=o.showlevels && ) {
				alert(ind + " - " + lvl);								
			}
			cntind++;
		})*/
		
					}				
					$.data(this, 'btnmenu_plugin', mn);
					//mn.resize_pulldown_elements();
				}
    		});
    	}
	};
	
	$.fn.btnmenu2 = function(method) {
		if (methods[method]) {			
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			alert('Method ' +  method + ' does not exist on btnmenu');
		}
	};
	
	function resize_pulldown_menus(mn) {
		//alert("1");
		var mnmax = $(mn).width();
		/*$(".btn-menuitem",mn).each(function() {
			mnmax = $(this).width() > mnmax ? $(this).width() : mnmax;
		});
		$(".btn-menuitem",mn).each(function() {
			$(this).width(mnmax);
		});*/
		var txtmax = 0;
		var icomax = 0;
		var arrmax = 0;
		$(".btn-menuitem",mn).each(function() {
			mnmax = $(this).outerWidth() > mnmax ? $(this).outerWidth() : mnmax;
			var $txt = $(".btn-menuitem-text", $(this));
			var $ico = $(".btn-menuitem-icon", $(this));
			var $arr = $(".btn-menuitem-arrow", $(this));
			var wt = 0, wi = 0, wa = 0;
			if ($txt.length>0) wt = $txt.width();
			if ($ico.length>0) wi = $ico.width();
			if ($arr.length>0) wa = $arr.width();
			txtmax = wt > icomax ? wt : icomax;
			icomax = wi > icomax ? wi : icomax;
			arrmax = wa > arrmax ? wa : arrmax;
			//mnmax = $(this).width() > mnmax ? $(this).width() : mnmax;
		});
		var diffmax = mnmax - icomax - arrmax;
		txtmax = diffmax>txtmax?diffmax:txtmax;
		$(".btn-menuitem",mn).each(function() {
			$(this).width(mnmax);
			var $txt = $(".btn-menuitem-text", $(this));
			if ($txt.length>0) $txt.width(txtmax);
		});			
	}
	
	function ensure_menulevel_visibility(mn, opts, ind) {
		var cnt = opts.showlevels;
		var active_elem = null;
		for (var x=0; x<mn.children.length; x++) {
			if (mn.children[x].type==null && mn.children[x].title!="-" && mn.children[x].pulldown!=null) {	// && mn.children[x].pulldown.hasClass=="btn-menu") {
				if (mn.children[x].pulldown.hasClass("btn-levelmenu") && $.trim(mn.children[x].pulldown.first().text())!="") {
					active_elem = mn.children[x];					
					active_elem.pulldown.show();
					if (opts.enabletrace) active_elem.element.first().addClass("btn-trace");
					//active_elem.pulldown.css("float","left");
					//var lvl = mn.children[x].level*1;
					//alert(lvl + " < " + cnt + " = " + mn.children[x].level + " ---- " + mn.children[x].index + "\r\n\r\n" + mn.children[x].pulldown.first().text());
					break;
				}
			}
		}
		if (active_elem && ind+1<cnt) ensure_menulevel_visibility(active_elem, opts, ind+1);
	}

	function checkitemover(event) {
		var dbgstr = "";
		var dbgstr2= "";
		if (event.target) {
			if (event.target.className) dbgstr += " * " + event.target.className;
			if (event.target.parentNode && event.target.parentNode.className) {
				dbgstr += " ** " + event.target.parentNode.className;
				dbgstr2 += event.target.parentNode.getAttribute("btnindex");
			} 
			if (dbgstr.indexOf("btn-menu")==-1 && dbgstr.indexOf("btn-context")==-1 && dbgstr.indexOf("btn-menuitem-icon")==-1 && dbgstr.indexOf("btn-menuitem")==-1 && dbgstr.indexOf("btn-pulldown")==-1 && dbgstr.indexOf("btn-menuitem-arrow")==-1 && dbgstr.indexOf("btn-menuitem-seperator")==-1 && dbgstr.indexOf("btn-menuitem-label")==-1) {
				if ($(".btn-menulevel").length==0) $(".btn-menuitem").removeClass("btn-trace");
				dbgstr = "hide all because : -------- " + dbgstr;
				$(".btn-pulldown").hide();
				$('.btn-context').hide();
				/*
				var ctxlist = $('.btn-context');
				if (ctxlist.length>0) {
					dbgstr += " > " + ctxlist.attr("class") + "," +
									  ctxlist.css("display") + "," +
									  ctxlist.css("visibility") + "," +
									  ctxlist.css("width") + "," +
									  ctxlist.css("height") + "," +
									  ctxlist.is(":visible");
					if (ctxlist.css("display")!="none" && ctxlist.height()>30) {
						dbgstr += " ----------- should hide context";
						ctxlist.css("visibility","hidden");
					}
				}
				*/
				//event.stopPropogation();
				event.stopImmediatePropagation();
			}
		}
		//if ($("#dbg").length>0) $("#dbg").html(dbgstr + " ----------- " + dbgstr2);
		return false;
	}
	
	$('html').unbind("mousemove",checkitemover);					
	$('html').bind("mousemove",checkitemover);					
	
})(jQuery);