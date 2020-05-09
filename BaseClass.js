//const exec = require( "child_process" ).execSync;
require( "shelljs/global" );

class XDoToolBase {

	constructor() {
		this.monitors = this.getMonitors();
		this.window_id = false;
		this.window_geometry = false;
	}

	sleep( milliseconds ) {
		return new Promise( ( resolve ) => { setTimeout( resolve , milliseconds ); } );
	}

	exec( bash_command ) {
		try {
			const result = exec( bash_command , { silent: true } );
			if ( !!result.code ) {
				if ( result.code !== 0 ) {
					console.log( result.stderr );
					return false;
				}
			}
			else if ( result.stderr.length > 1 ) {
				console.log( result.stderr );
				return false;
			}
			return result.stdout.trim();
		}
		catch( error ) { console.log( error ); return false; }
	}

	execAndGetLines( bash_command ) {
		try {
			let result = this.exec( bash_command );
			if ( !result ) { return false; }
			result = result.split( "\n" );
			let lines = [];
			for ( let i = 0; i < result.length; ++i ) {
				const item = result[ i ].replace( /\t/g , " " );
				const items = item.split( " " );
				lines.push( items );
			}
			if ( lines.length < 1 ) { return false; }
			return lines;
		}
		catch( error ) { console.log( error ); return false; }
	}

	// HDMI-1 connected primary 1600x900+0+0 (normal left inverted right x axis y axis) 885mm x 498mm
	// DP-1 disconnected (normal left inverted right x axis y axis)
	// HDMI-2 disconnected (normal left inverted right x axis y axis)
	getMonitors() {
		let connected = this.execAndGetLines( "xrandr --prop | grep connected" );
		if ( !connected ) { return false; }
		let result = { primary: { x: false , y: false } };
		for ( let i = 0; i < connected.length; ++i ) {
			const name = connected[ i ][ 0 ];
			const state = connected[ i ][ 1 ];
			const order = connected[ i ][ 2 ];
			if ( state === "connected" ) {
				if ( order === "primary" ) {
					const size = connected[ i ][ 3 ];
					const x = size.split( "x" )[ 0 ];
					const y = size.split( "x" )[ 1 ].split( "+" )[ 0 ];
					result.primary.x = x;
					result.primary.y = y;
				}
				else if ( order === "secondary" ) {
					result.secondary = {};
					const size = connected[ i ][ 3 ];
					const x = size.split( "x" )[ 0 ];
					const y = size.split( "x" )[ 1 ].split( "+" )[ 0 ];
					result.secondary.x = x;
					result.secondary.y = y;
				}
				else {
					console.log( "wadu" );
				}
			}
			else if ( state === "disconnected" ) {
				//console.log( "wadu" );
			}
		}
		return result;
	}

	activateWindow() {
		if ( !this.window_id ) { return; }
		return this.exec( "xdotool windowactivate " + this.window_id );
	}

	focusWindow() {
		if ( !this.window_id ) { return; }
		return this.exec( "xdotool windowfocus " + this.window_id );
	}

	async refocusWindow() {
		if ( !this.window_id ) { return; }
		this.activateWindow();
		await this.sleep( 300 );
		this.focusWindow();
		await this.sleep( 500 );
		return;
	}

	raiseWindow() {
		if ( !this.window_id ) { return; }
		return this.exec( "xdotool windowraise " + this.window_id );
	}

	windowGeometry() {
		if ( !this.window_id ) { return; }
		this.refocusWindow();
		let result = this.exec( "xdotool getactivewindow getwindowgeometry" );
		result = result.split( "\n" );
		if ( result.length < 3 ) { return; }
		let pos = result[ 1 ].split( "  Position: " )[ 1 ].split( " (screen" )[ 0 ].split( "," );
		let geom = result[ 2 ].split( "  Geometry: " )[ 1 ].split( "x" );
		let centerX = ( parseInt( pos[ 0 ] ) + ( parseInt( pos[ 0 ] ) / 2 ) ).toString();
		let centerY = ( parseInt( geom[ 1 ] ) / 2 ).toString();
		this.window_geometry = {
			position: { x: pos[ 0 ] , y: pos[ 1 ] } ,
			geometry: { x: geom[ 0 ] , y: geom[ 1 ] } ,
			center: { x: centerX , y: centerY }
		};
		return this.window_geometry;
	}

	unmaximizeWindow() {
		if ( !this.window_id ) { return; }
		this.refocusWindow();
		return this.exec( "wmctrl -ir " + this.window_id + " -b remove,maximized_ver,maximized_horz" );
	}

	maximizeWindow() {
		if ( !this.window_id ) { return; }
		this.refocusWindow();
		return this.exec( "xdotool key F11" );
	}

	fullScreen() {
		this.maximizeWindow();
	}

	moveMouse( x , y ) {
		this.refocusWindow();
		x = x.toString() || "0";
		y = y.toString() || "0";
		return this.exec( "xdotool mousemove " + x + " " + y );
	}

	leftClick() {
		this.refocusWindow();
		return this.exec( "xdotool click 1" );
	}

	rightClick() {
		this.refocusWindow();
		return this.exec( "xdotool click 2" );
	}

	doubleClick() {
		this.refocusWindow();
		return this.exec( "xdotool click --repeat 2 --delay 200 1" );
	}

	centerMouse() {
		if ( !this.window_geometry ) { return; }
		this.refocusWindow();
		this.moveMouse( this.window_geometry.center.x , this.window_geometry.center.y );
	}

	pressKeyboardKey( wKey ) {
		this.refocusWindow();
		return this.exec( "xdotool key '" + wKey + "'" );
	}

};

module.exports = XDoToolBase;