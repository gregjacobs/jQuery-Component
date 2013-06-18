/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'jqc/Jqc',
	'jqc/anim/Animation',
	'jqc/Component',
	'jqc/panel/Panel',
	'jquery-ui.position'  // jQuery UI's `position` plugin
], function( jQuery, _, Class, Jqc, Animation, Component, Panel ) {
	
	/**
	 * @abstract
	 * @class jqc.Overlay
	 * @extends jqc.panel.Panel
	 *
	 * Base class for UI elements that "float" on top of the document (most notably: {@link jqc.window.Window}).
	 * This can be positioned by {@link #x} and {@link #y} values, or positioned relative to other elements using the 
	 * {@link #anchor} config.
	 */
	var Overlay = Panel.extend( {
		abstractClass : true,
		
		
		/**
		 * @cfg {Boolean} autoShow
		 * 
		 * Set to `true` to automatically show the Overlay when it is instantiated. If false, a call to {@link #method-show} is
		 * required to show the overlay.
		 */
		autoShow : false,
		
		/**
		 * @cfg {Object} showAnim
		 * 
		 * A {@link jqc.anim.Animation} configuration object to animate the "show" transition. You do not need to specify
		 * the {@link jqc.anim.Animation#target} parameter however, as it will be set to this Overlay.
		 * 
		 * This config is to provide a default animation that the Overlay always shows with. If the animation is to be
		 * different for different calls to {@link #method-show}, one may supply the animation config in the `anim` option
		 * to the {@link #method-show} method. Note that an `anim` option provided to the {@link #method-show} method 
		 * always overrides this config for that call.
		 */
		
		/**
		 * @cfg {Object} hideAnim
		 * 
		 * A {@link jqc.anim.Animation} configuration object to animate the "hide" transition. You do not need to specify
		 * the {@link jqc.anim.Animation#target} parameter however, as it will be set to this Overlay.
		 * 
		 * This config is to provide a default animation that the Overlay always hides with. If the animation is to be
		 * different for different calls to {@link #method-hide}, one may supply the animation config in the `anim` option
		 * to the {@link #method-hide} method. Note that an `anim` option provided to the {@link #method-hide} method 
		 * always overrides this config for that call
		 * 
		 * This config is especially useful with the {@link jqc.window.Window#closeOnEscape} config of the
		 * {@link jqc.window.Window Window} subclass, as the call to the {@link #method-hide} method is made behind the scenes 
		 * in this case.
		 */
	
	
	
		// Positioning Configs
	
		/**
		 * @cfg {Object} anchor
		 * An anchoring configuration object, to anchor the overlay to another element on the page.
		 * This is an object with the following properties:
		 *
		 * @cfg {String} anchor.my
		 *   Where on the overlay itself to position against the target `element`. Accepts a string in the
		 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
		 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
		 *   "left", "right". Example: "left top" or "center center".  So, if "left top", the top left of the overlay
		 *   will be positioned to the target `element`. Defaults to "left top".
		 *
		 * @cfg {String} anchor.at
		 *   Where at the target `element` the overlay should be positioned against. Accepts a string in the
		 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
		 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
		 *   "left", "right". Example: "left top" or "center center".  So, if "left bottom", the overlay will be
		 *   positioned against the bottom left of the target `element`. Defaults to "left bottom".
		 *
		 * @cfg {HTMLElement/jQuery/jqc.Component} anchor.of
		 *   The HTMLElement or {@link jqc.Component} to anchor the overlay to. Can either be defined as either "of" (following
		 *   jQuery UI) or "element". Required unless the `element` property is provided.
		 *
		 * @cfg {HTMLElement/jQuery/jqc.Component} [anchor.element]
		 *   Synonym of `of` property, which may replace it where it makes more sense in calling code.
		 *
		 * @cfg {String} [anchor.offset]
		 *   Adds these left-top values to the calculated position. Ex: "50 50" (left top). A single value
		 *   given in the string will apply to both left and top values.
		 *
		 * @cfg {String} [anchor.collision]
		 *   When the positioned element overflows the window in some direction, move it to an alternative position. Similar to `my` and `at`,
		 *   this accepts a single value or a pair for horizontal/vertical, eg. "flip", "fit", "fit flip", "fit none". Defaults to 'flip'.
		 *
		 *   - __flip__: (the default) to the opposite side and the collision detection is run again to see if it will fit. If it won't fit in either position, the center option should be used as a fall back.
		 *   - __fit__: so the element keeps in the desired direction, but is re-positioned so it fits.
		 *   - __flipfit__: first flips, then tries to fit as much as possible on the screen.
		 *   - __none__: do not do collision detection.
		 */
	
		/**
		 * @cfg {Number/String} x
		 * 
		 * The initial x position of the Overlay. This can be a number defining how many pixels from the left of the screen,
		 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
		 * This can also be a negative integer, in which case it will be taken as the number of pixels from the right side of
		 * the screen. Ex: A value of -50 will position the right side of the Overlay 50px from the right side of the screen.
		 *
		 * Note that this config will not be used if {@link #anchor} is provided.
		 */
	
		/**
		 * @cfg {Number/String} y
		 * 
		 * The initial y position of the Overlay. This can be a number defining how many pixels from the top of the screen,
		 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
		 * This can also be a negative integer, in which case it will be taken as the number of pixels from the bottom of
		 * the screen. Ex: A value of -50 will position the bottom of the Overlay 50px from the bottom of the screen.
		 *
		 * Note that this config will not be used if {@link #anchor} is provided.
		 */
		
		/**
		 * @cfg {Boolean} constrainToViewport
		 * 
		 * When using {@link #x}/{@link #y} positioning, this config makes sure that the Overlay is constrained to be in the 
		 * viewable area of the browser's viewport (at least as much as possible).
		 */
		constrainToViewport : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-overlay',
		
		/**
		 * @hide
		 * @cfg {jQuery/HTMLElement} renderTo
		 * 
		 * This config should not be specified for this subclass. The Overlay will
		 * automatically be rendered into the document body when it is opened.
		 */
		
		
		/**
		 * @protected
		 * @property {jQuery} $contentContainer
		 * 
		 * The inner overlay container, where either content HTML or child {@link jqc.Component Components} are added.
		 */
	
		/**
		 * @private
		 * @property {Function} windowResizeHandler
		 * 
		 * The scope wrapped function for handling window resizes (which calls the method to resize the overlay accordingly).
		 * This is needed as a property so that we can unbind the window's resize event from the Overlay when the Overlay
		 * is destroyed.
		 */
	
	
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Call superclass initComponent
			this._super( arguments );
			
			// Overlays are always hidden to start, as they rely on the show() logic to be properly shown w/ a position and size
			this.hidden = true;
	
			// If the autoShow config has been set to true, show the overlay immediately
			if( this.autoShow ) {
				this.show();
			}
		},
	
	
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );			
			
			// Set up an event handler for the window's resize event, to re-size and re-position the overlay based on the
			// new viewport's size.  The handler for this event is "debounced" just a little, so that the many resize events
			// that are fired while a window is being dragged don't cause the resize calculations to run each and every time.
			// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Overlay is 
			// destroyed.
			this.windowResizeHandler = _.debounce( _.bind( this.onWindowResize, this ), 150 );
			jQuery( window ).on( 'resize', this.windowResizeHandler );
		},
	
	
		// -----------------------------------------
	
		
		/**
		 * Shows the Overlay, rendering it if it has not yet been rendered. This method inherits all of the `options` of
		 * its superclass method, and adds Overlay-specific ones as well.
		 *
		 * @param {Object} [options] An object which may contain the following properties, in addition to the options available
		 *   from its superclass. Note that providing any options that are configs as well will overwrite those configs of the same 
		 *   name.
		 * @param {Object} [options.anchor] An {@link #anchor} config to set on the call to open. Note that subsequent calls to
		 *   open() will use this config unless changed by a call to {@link #setAnchor}.
		 * @param {Number/String} [options.x] An {@link #x} config to set on the call to open. Note that subsequent calls to open()
		 *   will use this config unless changed by a call to {@link #setPosition}. See {@link #x} for more details. Note that
		 *   providing an `anchor` will override this value.
		 * @param {Number/String} [options.y] A {@link #y} config to set on the call to open. Note that subsequent calls to open()
		 *   will use this config unless changed by a call to {@link #setPosition}.  See {@link #y} for more details. Note that
		 *   providing an `anchor` will override this value.
		 * @param {Object/Boolean} [options.anim] An {@link jqc.anim.Animation Animation} config object (minus the 
		 *   {@link jqc.anim.Animation#target target} property) for animating the showing of the Overlay. If this is not provided,
		 *   it defaults to using the {@link #showAnim} config.
		 *   
		 *   This property may also be set to the boolean `false` to prevent the {@link #showAnim} from running on this call to 
		 *   `show`. (`true` will allow the {@link #showAnim} to run as usual.) If set to a config object, the config object will only
		 *   be used for this call to `show` only. It does not overwrite the {@link #showAnim} config.
		 */
		show : function( options ) {
			options = options || {};
			
			var anim = options.anim;
			if( anim === false ) {
				delete options.anim;
			} else if( anim === undefined || anim === true ) {
				options.anim = this.showAnim;
			}
			
			// If the overlay has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			this._super( [ options ] );
		},
		
		
		/**
		 * Implementation of hook method from superclass, which positions the Overlay, and updates any configs
		 * provided in the `options` object to {@link #method-show}.
		 * 
		 * @protected
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShow : function( options ) {
			this._super( arguments );
			
			// Position the overlay now that it is shown. If new positioning information was provided, use that.
			// Otherwise, position based on the last set values.
			if( options.anchor ) {
				this.setAnchor( options.anchor );

			} else if( options.hasOwnProperty( 'x' ) || options.hasOwnProperty( 'y' ) ) {
				var x = ( typeof options.x !== 'undefined' ) ? options.x : this.x;  // if one was provided, but not the other,
				var y = ( typeof options.y !== 'undefined' ) ? options.y : this.y;  // use the current value for the other
				this.setPosition( x, y );

			} else {
				// No new `anchor` or x/y configs provided in the call to this method, position the Overlay based on any 
				// pre-configured values
				this.updatePosition();
			}
		},
		
		
		/**
		 * Sets the position of the Overlay (more specifically, the {@link #x} and {@link #y} configs), and refreshes the Overlay's
		 * position (if it is currently open). Note: by running this method, any {@link #anchor} config is nulled out.
		 *
		 * @param {Number/String} x The new x position of the Overlay. See the {@link #x} config for details.
		 * @param {Number/String} y The new y position of the Overlay. See the {@link #y} config for details.
		 */
		setPosition : function( x, y ) {
			// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
			// (This is mainly needed for when this method is called externally, and not from within the Overlay.)
			this.x = x;
			this.y = y;
	
			// Make sure there is no 'anchor' if we want x/y positioning
			this.anchor = null;
	
			this.updatePosition();
		},
		
	
		/**
		 * Retrieves the position of the Overlay. This can only be retrieved if the Overlay is currently {@link #isVisible visible}. 
		 * If the Overlay is not visible, all values will be 0.
		 * 
		 * @return {Object} An object with the following properties:
		 * @return {Number} return.x The position of the left side of the dialog, relative to the left side of the screen. Same as `left`.
		 * @return {Number} return.y The position of the top of the dialog, relative to the top of the screen. Same as `top`.
		 * @return {Number} return.left The position of the left side of the dialog, relative to the left side of the screen. Same as `x`.
		 * @return {Number} return.top The position of the left side of the dialog, relative to the left side of the screen. Same as `y`.
		 * @return {Number} return.right The position of the right side of the dialog, relative to the right side of the screen.
		 * @return {Number} return.bottom The position of the bottom of the dialog, relative to the bottom of the screen.
		 */
		getPosition : function() {
			if( this.isHidden() ) {
				return {
					x      : 0,
					y      : 0,
					left   : 0,
					top    : 0,
					right  : 0,
					bottom : 0
				};
				
			} else {
				var $window  = jQuery( window ),
				    position = this.$el.position(),
				    left     = position.left,
				    top      = position.top,
				    right    = $window.width() - ( position.left + this.getWidth() ),
				    bottom   = $window.height() - ( position.top + this.getHeight() );
				
				return {
					x      : left,
					y      : top,
					left   : left,
					top    : top,
					right  : right,
					bottom : bottom
				};
			}
		},
	
	
		/**
		 * Sets the {@link #anchor} config, and refreshes the Overlay's position (if it is currently open).
		 *
		 * @param {Object} anchor See the {@link #anchor} config for details.
		 */
		setAnchor : function( anchor ) {
			this.anchor = anchor;
			this.updatePosition();
		},
	
	
		/**
		 * Resets the position of the Overlay to match the {@link #anchor} config if one exists, or otherwise uses the
		 * {@link #x} and {@link #y} configs.
		 *
		 * @protected
		 */
		updatePosition : function() {
			if( this.isVisible() ) {
				var my, at, of, collision,
				    $el = this.$el;
	
				if( this.anchor ) {
					// Anchor config provided, or set with setAnchor(), use that
					var anchor = this.anchor,
					    offset = anchor.offset;  // to support legacy config
					
					my = anchor.my || 'left top';
					at = anchor.at || 'left bottom';
					
					if( offset ) {
						// The new jQuery UI Position plugin does not accept an 'offset' option. Instead, it expects
						// the offsets to be placed inline with the 'my' option. Example `my`: "left+100 top+200"
						my = my.split( /\s+/ );
						offset = offset.split( /\s+/ ); 
						
						my[ 0 ] += '+' + offset[ 0 ];
						my[ 1 ] += '+' + offset[ 1 ] || offset[ 0 ];  // if there is no second value, use the first value again
						my = my.join( " " );  // rejoin with a space, to separate the horizontal/vertical values
					}
					
					of = anchor.element || anchor.of;  // accept either 'element' or 'of' from the anchor config
					collision = anchor.collision || 'flip';  // even though this seems to be the default 'collision' value in jQuery UI, we need this default value for a later if statement to check if 'flip' was used (as a short circuit to checking the classes on the element itself)
	
					// Handle the anchor element being a jqc.Component, by grabbing the Component's DOM element
					if( of instanceof Component ) {
						of = of.getEl();
					}
	
				} else {
					// no 'anchor' config provided, use x/y relative to the window
					var x = this.x,
					    y = this.y,
					    xSide = x,  // default these to the values of the 'x' and 'y' configs, in the case that
					    ySide = y,  // they are strings. They will be overwritten with side+offset if numbers
					    atXSide = 'center',
					    atYSide = 'center';
					
					if( typeof x === 'number' ) {
					    xSide = ( x > 0 ? 'left' : 'right' ) + '+' + x;  // Position from right if this.x < 0. Forms a string like: "left+100"
					    atXSide = 'left';
					}
					if( typeof y === 'number' ) {
					    ySide = ( y > 0 ? 'top' : 'bottom' ) + '+' + y;  // Position from bottom if this.y < 0. Forms a string like: "top+100"
					    atYSide = 'top';
					}
					
					my = xSide + ' ' + ySide;      // forms a string like: "left+200 top+100" or "center center"
					at = atXSide + ' ' + atYSide;  // forms a string like: "center center" or "left top"
					of = window;
					
					if( this.constrainToViewport ) {
						collision = 'fit';
					}
				}
				
				// Position the Overlay
				$el.position( {
					my: my,
					at: at,
					of: of,
					collision: collision
				} );
			}
		},
	
	
		/**
		 * Event handler for the browser window's resize event, in which the Overlay is re-positioned.
		 *
		 * @protected
		 */
		onWindowResize : function() {
			this.updatePosition();
		},
		
		
		// -----------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			// Unbind our window resize handler, but only if it's rendered, as the windowResizeHandler is set up in onRender(). 
			// Otherwise, if the windowResizeHandler is undefined when we call unbind, we'd end up unbinding *all* window resize handlers!)
			if( this.rendered ) {
				jQuery( window ).off( 'resize', this.windowResizeHandler );
			}
	
			this._super( arguments );
		}
	
	} );
	
	return Overlay;

} );