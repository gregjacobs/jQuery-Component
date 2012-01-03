/**
 * @class ui.Overlay
 * @extends ui.AbstractOverlay
 * 
 * A simple overlay panel that can sit on top of other elements and be easily positioned based on x/y positioning, or the location
 * of other elements.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Overlay = Kevlar.extend( ui.AbstractOverlay, {
		
	/**
	 * @cfg {Object} arrow
	 * A position for an arrow on the overlay. This is an object (hash) which should have the following properties:
	 * @cfg {String} arrow.side The side that the arrow should be placed on the overlay. This can be one of: `top`, `bottom`, `right`, `left`. 
	 * @cfg {Number} [arrow.offset=10] Where to position the arrow on the `side`. Positive values come from the top or left,
	 *   while negative values come from the bottom or right (depending on the `side` specified).
	 * 
	 * Example config:
	 *     {
	 *         side : 'top',
	 *         offset : -20
	 *     }
	 * 
	 * This will place the arrow at the top of the Overlay, 20 pixels from the right.
	 * 
	 * NOTE: At this time, only 'top' and 'bottom' are accepted for the `side`.
	 * 
	 * Note that the position of the arrow may be changed after the initial rendering using the {@link #setArrowPosition} method. 
	 */
	arrow : null,
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery} dontCloseOn
	 * A selector, element, or jQuery wrapped set of elements that when clicked on, should prevent the automatic-closing feature
	 * of the Overlay. Normally, when the user clicks anywhere outside of the Overlay, the Overlay is automatically closed. Providing
	 * this will make sure that the Overlay is not closed when these element(s) (outside of the Overlay's markup) are clicked on.
	 * Clicking anywhere else in the document besides the Overlay itself, and these element(s), will close the overlay.
	 */
	
	
	
	// protected
	initComponent : function() {
		// Add the ui-overlay class and the jux/jux-dialog classes to this component's element. 
		// jux and jux-dialog are needed for form fields and such to be styled correctly within it.
		this.cls += ' ui-overlay';
		
		// Overlay should be instantiated hidden (ui.Component config)
		this.hidden = true;
		
		// Run setArrow() to normalize any arrow value
		if( this.value ) {
			this.setArrow( this.arrow );
		}
		
		// Call superclass initComponent
		ui.Overlay.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Extension of onRender which is used to create Overlay and its inner overlay content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.Overlay.superclass.onRender.apply( this, arguments );
		
		// Create a div element for the arrow, if one was specified
		if( this.arrow ) {
			this.renderArrow( this.arrow );
		}
	},
	
	
	/**
	 * Renders the arrow at the given `position` on the Overlay. The `position`
	 * parameter is the same format as the {@link #arrow} config.
	 * 
	 * @private
	 * @method renderArrow
	 * @param {Object} arrow An {@link #arrow} config to render an arrow with. This is passed in so it can be different from the
	 *   actual {@link #arrow} config in case of a collision (see {@link #onCollision}). 
	 */
	renderArrow : function( arrow ) {
		// Remove any previous arrow
		if( this.$arrow ) {
			this.$arrow.remove();
			this.$arrow = null;
		}
		
		if( arrow ) {
			var arrowOffset = arrow.offset,
			    offsetProp = ( arrowOffset < 0 ? 'right: ' : 'left: ' ) + Math.abs( arrowOffset ) + 'px';
			
			this.$arrow = jQuery( '<div class="ui-overlay-arrow ui-overlay-arrow-' + arrow.side + '" style="' + offsetProp + '"></div>' )
				.prependTo( this.$el );
		}
	},
	
	
	// ------------------------------------------
	
	
	
	/**
	 * Opens the Overlay, rendering it if it has not yet been rendered. The overlay is rendered here
	 * so all Components can be added to it first before rendering it.<br><br>
	 *
	 * See the superclass {@link ui.AbstractOverlay#open} method for more details.  
	 * 
	 * @method open
	 * @param {Object} options (optional) Any of the options provided by the superclass {@link ui.AbstractOverlay#open} method, 
	 * as well as any of the following properties for this subclass:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>dontCloseOn</b> : String|HTMLElement|jQuery
	 *       <div class="sub-desc">
	 *         A {@link #dontCloseOn} config to set on the call to open. Note that subsequent calls to open() will use 
	 *         this config unless changed by a call to {@link #setDontCloseOn}.  See {@link #dontCloseOn} for more details.
	 *       </div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	open : function( options ) {
		options = options || {};
		
		// Set any dontCloseOn config provided
		if( options.dontCloseOn ) {
			this.dontCloseOn = options.dontCloseOn;
		}
		
		// Call the superclass open method
		ui.Overlay.superclass.open.call( this, options );
		
		
		// Set up an event handler to close the overlay if the user clicks somewhere other than the overlay
		this.docBodyClickHandler = function( evt ) { this.onDocBodyClick( evt ); }.createDelegate( this );
		window.setTimeout( function() {   // must be done after the overlay has opened and the original mousedown event has finished bubbling, or the handler will immediately close the Overlay
			jQuery( document.body ).bind( 'mousedown touchend', this.docBodyClickHandler );
		}.createDelegate( this ), 10 );
	},
	
	
	/**
	 * Sets the {@link #arrow}.
	 * 
	 * @method setArrow
	 * @param {Object} arrow See the {@link #arrow} config for details. Pass null to remove the arrow completely. 
	 */
	setArrow : function( arrow ) {
		this.arrow = arrow;
		
		// Set default value for offset (if it is not null)
		if( arrow && typeof arrow.offset === 'undefined' ) {
			arrow.offset = 10;
		}
		
		if( this.rendered ) {
			this.renderArrow( arrow );
		}
	},
	
	
	/**
	 * Sets the {@link #dontCloseOn} config value after instantiation. The the {@link #dontCloseOn} config for details.
	 * 
	 * @method setDontCloseOn
	 * @param {String/HTMLElement/jQuery} dontCloseOn See the {@link #dontCloseOn} config for details.
	 */
	setDontCloseOn : function( dontCloseOn ) {
		this.dontCloseOn = dontCloseOn;
	},
	
	
	/**
	 * @protected
	 * @method onCollision
	 * @inheritdoc
	 */
	onCollision : function( collisionType, collisionDirections ) {
		ui.Overlay.superclass.onCollision.apply( this, arguments );
		
		// Determine if the Overlay has been "flipped" (by collision === 'flip', which is also the default). If so, we need to 
		// move the arrow to the other side (if there is an arrow)
		var arrow = Kevlar.Object.clone( this.arrow );  // make a copy. don't actually want to overwrite the config if it is re-positioned again
		if( arrow && collisionType === 'flip' ) {
			var arrowSide = arrow.side;
			    
			if( collisionDirections.top || collisionDirections.bottom ) {
				if( arrowSide === 'top' || arrowSide === 'bottom' ) {
					arrow.side = ( arrowSide === 'top' ) ? 'bottom' : 'top';
				}
				
				if( arrowSide === 'left' || arrowSide === 'right' ) {
					arrow.offset *= -1;  // reverse the arrow
				}
			}
			
			if( collisionDirections.left || collisionDirections.right ) {
				if( arrowSide === 'left' || arrowSide === 'right' ) {
					arrow.side = ( arrowSide === 'left' ) ? 'right' : 'top';
				}
				
				if( arrowSide === 'top' || arrowSide === 'bottom' ) {
					arrow.offset *= -1;  // reverse the arrow
				}
			}
			
			this.renderArrow( arrow );
		}
	},
	
	
	
	/**
	 * Tests if the click to the document body was outside of the Overlay. If it was, the Overlay is closed. 
	 * The Overlay will not be closed however if the element clicked on was the {@link #dontCloseOn} element(s).
	 * Fires the {@link #beforeblurclose} event if the Overlay is to be closed.
	 * 
	 * @private
	 * @method onDocBodyClick
	 * @param {jQuery.Event} evt The click event.
	 */
	onDocBodyClick : function( evt ) {
		// there was a click to some other place in the document than the overlay, then close the overlay
		var $parentEls = jQuery( evt.target ).parents().andSelf();  // make sure the element that was clicked on itself is included
		
		// If one of the parent elements is not the Overlay element, and one of the parents is not any dontCloseOn element(s) provided,
		// then the user must have clicked somewhere else in the document. Close the Overlay in this case.
		if( !$parentEls.is( this.$el ) && !$parentEls.is( this.dontCloseOn ) ) {
			if( this.fireEvent( 'beforeblurclose', this, evt ) !== false ) {   // allow handlers to cancel the closing of the Overlay from a document click, based on their own conditions
				this.close();
			}
		}
	},
	
	
	/**
	 * Template method that is run just before the Overlay is to be closed (before any {@link #closeAnim} has started).
	 * 
	 * @protected
	 * @method onBeforeClose
	 */
	onBeforeClose : function() {
		// Remove the document body handler, which closes the overlay when clicking off of it
		jQuery( document.body )
			.unbind( 'mousedown', this.docBodyClickHandler )
			.unbind( 'touchend', this.docBodyClickHandler );
		this.docBodyClickHandler = null;
	}
	
} );