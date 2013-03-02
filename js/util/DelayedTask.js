/*global define */
define( function() {

	/**
	 * @class ui.util.DelayedTask
	 *
	 * The DelayedTask class provides a convenient way to "buffer" the execution of a method,
	 * performing setTimeout where a new timeout cancels the old timeout. When called, the
	 * task will wait the specified time period before executing. If during that time period,
	 * the task is called again, the original call will be cancelled. This continues so that
	 * the function is only called a single time for each iteration.
	 * 
	 * This method is especially useful for things like detecting whether a user has finished
	 * typing in a text field. An example would be performing validation on a keypress. You can
	 * use this class to buffer the keypress events for a certain number of milliseconds, and
	 * perform only if they stop for that amount of time.  Usage:
	 * 
	 *     var task = new DelayedTask( function() {
	 *         alert( document.getElementById( 'myInputField' ).value.length );
	 *     } );
	 *     
	 *     // Wait 500ms before calling our function. If the user presses another key 
	 *     // during that 500ms, it will be cancelled and we'll wait another 500ms.
	 *     document.getElementById( 'myInputField' ).onkeypress = function() {
	 *         task.delay( 500 ); 
	 *     } );
	 *     
	 * Note that we are using a DelayedTask here to illustrate a point. The configuration
	 * option `buffer` for {@link UI.util.Observable#addListener addListener/on} will
	 * also setup a delayed task for you to buffer events.
	 *  
	 * @constructor The parameters to this constructor serve as defaults and are not required.
	 * @param {Function} fn (optional) The default function to call.
	 * @param {Object} scope (optional) The default scope (The `this` reference) in which the
	 *   function is called. If not specified, `this` will refer to the browser window.
	 * @param {Array} args (optional) The default Array of arguments.
	 */
	var DelayedTask = function(fn, scope, args){
		var me = this,
		    id,
		    call = function(){
		        clearInterval(id);
		        id = null;
		        fn.apply(scope, args || []);
			};
			
		/**
		 * Cancels any pending timeout and queues a new one
		 * @param {Number} delay The milliseconds to delay
		 * @param {Function} newFn (optional) Overrides function passed to constructor
		 * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
		 * is specified, <code>this</code> will refer to the browser window.
		 * @param {Array} newArgs (optional) Overrides args passed to constructor
		 */
		me.delay = function(delay, newFn, newScope, newArgs){
			me.cancel();
			fn = newFn || fn;
			scope = newScope || scope;
			args = newArgs || args;
			id = setInterval(call, delay);
		};
	
		/**
		 * Cancel the last queued timeout
		 */
		me.cancel = function(){
			if(id){
				clearInterval(id);
				id = null;
			}
		};
		
		/**
		 * Determines if there is currently a pending timeout
		 */
		me.isPending = function() {
			return !!id;
		};
		
	};
	
	return DelayedTask;
} );