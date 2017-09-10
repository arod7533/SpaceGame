/*!
	 @package makemecenter - jQuery Position Elements Centers Vertically and Horizontally Plugin
	 @version version: 0.1.0
	 @url https://github.com/tenbullstech/jquery-make-me-center
	 @documentation Examples and Documentation - https://github.com/tenbullstech/jquery-make-me-center
	 @contributors https://github.com/tenbullstech/jquery-make-me-center/graphs/contributors
	 @license Licensed under the MIT licenses: http://www.opensource.org/licenses/mit-license.php
	 @date Friday, May 22, 2015 11:36 AM 
	 @author Aman Bansal

	 ** If you found bug, please contact me via email <tenbulls007@gmail.com>
 */

(function($){
	$.fn.makemecenter = function(options) {
		var settings = $.extend({
			position : "absolute",
			horizontal : true,
			vertical : true,
			parentRelative : window,
			complete : null,
			
			marginLeft : null,
			marginRight : null,
			marginTop : null,
			paddingLeft : null,
			paddingRight : null,
			paddingTop : null,
			paddingBottom : null,

			is_onload : true,
			is_onresize : true,
			is_ondatachange : true,   // center it on text data or height change
			is_animate : false,


		},options)

		var self = this;


		$.fn.makemecenter.destroy = function() {
            return self.each(function(){
        		$(window).off('resize.makemecenter');
			});
    	}

		var adjustposition = function (elem) {
			var parent = $(settings.parentRelative);
			var parentHeight = $(parent).innerHeight();
			var parentWidth = $(parent).innerWidth();
			
			parent.css({
				position : "relative"
			});


			// Clear Element Margin and Padding to calculate actual dimensions
			elem.css({
				margin : "",
				padding : "",
				// display : "block",
			});


			elem.css({
				position : settings.position,
				"margin-left" : settings.marginLeft,
				"margin-right" : settings.marginRight,
				"margin-top" : settings.marginTop,
				"padding-left" : settings.paddingLeft,
				"padding-right" : settings.paddingRight,
				"padding-top" : settings.paddingTop,
				"padding-bottom" : settings.paddingBottom,
			});


			var contentWidth = elem.width();  // Getting applied element width before any margin and padding
			//console.log(contentWidth);

			// Adjust Horizonal Element Position
			if (settings.horizontal) {
				var set_left = (parentWidth - contentWidth- settings.marginLeft - settings.marginRight - settings.paddingLeft - settings.paddingRight) / 2;

				// if set_left is negative it means element is greater than or equal to parent width so set it from left 0 and prevent it from going -ve
				if (set_left <= 0) {
					 set_left = 0;
				} 

				elem.css({
					left : set_left,
				});
			}
			
			// Adjust Vertical Element Position
			var contentHeight = elem.height();  // Getting element Height after Width , margin and padding becasuse they affect height so getting height only after applying these prop

			if (settings.vertical) {
				// Padding does count on height for eg. if we have height = 200 and padding 10px top and bottom but height will count 200 always not 220
				var set_top = (parentHeight - contentHeight - settings.marginTop - settings.paddingTop - settings.paddingBottom) / 2;

				// if set_top is negative it means element is greater than or equal to parent width so set it from top 0 and prevent it from going -ve
				if (set_top <= 0) {
					 set_top = 0;
				} 

				var vertical_options = {
						top : set_top,
						"margin-bottom" : 0,
					}

				// if is_animate is true then position element using animation effect
				if (settings.is_animate) {
					elem.animate(vertical_options);
				} else {
					elem.css(vertical_options);
				}
			}

			if ($.isFunction(settings.complete)) {
				return settings.complete.call(elem);
			}
		}


		function makeitcenter(self){
			// console.log(self);
			// if (undefined==self) {
			// 	return false;
			// }	
			return self.each(function(){
				var $this   = $(this); // store the object
				adjustposition($this);
			});
		}


		function detect_datachange(self){

				return self.each(function(){
				var $this   = $(this); // store the object

				// create an observer instance
				var observer = new MutationObserver(function(mutations) {
				  //adjustposition($this);
				  mutations.forEach(function(mutation) {
					    console.log(mutation);
						//  console.log('old', mutation.oldValue);
						//  var props = mutation.oldValue.replace(/ /g, '').split(':');
						//  console.log(props);
						// 	console.log('new', mutation.target.style.cssText);
				  	    if (mutation.type === 'attributes' && mutation.attributeName=="style") {
				  	    	console.log("mutation");
					    }
				  });    
				});
				 
				// configuration of the observer:
				var config = { attributes: true,  attributeFilter: ["style"], attributeOldValue: true, childList: true, characterData: true , subtree : true};
				 
				// pass in the target node, as well as the observer options
				observer.observe(this, config);

				
			});

		}
		
		// Default Execution on Initiation
		makeitcenter(self);

		// if (settings.is_onload) {
		// 	detect_datachange(self);
		// }

		if (settings.is_onload) {
			$(window).load(function () {
				makeitcenter(self);
		  		//window.dispatchEvent(evt);
			});
		}

		if (settings.is_onresize) {
			$(window).on("resize.makemecenter",function() {
				makeitcenter(self);
			});
		}



	}


	

}(jQuery))