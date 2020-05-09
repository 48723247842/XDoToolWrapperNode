const XDoToolBase = require( "./BaseClass.js" );

class WindowName extends XDoToolBase {
	constructor( window_name ) {
		super();
		this.window_name = window_name;
		this.window_id = this.windowIDFromName();
		super.windowGeometry();
	}

	windowIDFromName() {
		//let x1 = this.exec( "xdotool search --name '" + this.window_name + "'" );
		let result = this.exec( "xdotool search --desktop 0 --name '" + this.window_name + "'" );
		if ( !result ) { return false; }
		result = result.split( "\n" );
		result = result[ 0 ];
		this.window_id = result;
		return result;
	}

	searchID() {
		const found_id = this.windowIDFromName();
		if ( !found_id ) { return false; }
		if ( found_id.length > 1 ) {
			return true;
		}
		return false;
	}

	ensureWindowNameIsReady() {
		return new Promise( async ( resolve , reject ) => {
			try {
				let found = false;
				setTimeout( () => {
					console.log( `XDoTool-Wrapper --> Ensuring ${ this.window_name } is Ready Timed Out` );
					resolve( false );
					return false;
				} , 10000 );
				while( !found ) {
					found = this.searchID();
					await this.sleep( 1000 );
				}
				console.log( "XDoTool-Wrapper --> X-Window READY !!! " + this.window_id );
				resolve( this.window_id );
				return;
			}
			catch( error ) { console.log( error ); resolve( false ); return; }
		});
	}

};

module.exports = WindowName;


// ( ()=> {
// 	// Disney+ Example
// 	// We Need a ChromeWrapper to sudo pkill any previous instance of chrome ,
// 	// then reopen chrome in kios/app mode
// 	// So the Procedural Flow ===
// 	// 1.) sudo pkill google-chrome
// 	// 2.) ChromeWrapper --> open link in kios/app mode
// 	// 3.) ChromeWrapper-->ensureWindowNameIsReady()
// 	// 4.) Click Center of Screen to Enter into "Context"
// 	// 5.) Click Very Bottom Left (guess) based on window geometry where the playback scrub bar is to ensure we start at begining
// 	// 6.) ChromeWrapper needs a WebSocket Server Addon , so that we can send update times to it
// 	//		in order to "sync" the desired time via keyboard arrow keys
// 	const wrapper = new WindowName( "Chrome" );
// 	// google-chrome --enable-extensions --app=https://www.disneyplus.com/video/e85916bf-5b05-4414-978d-a8c797a7d0c2
// 	console.log( wrapper );
// })();