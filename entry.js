// Support hot reloading
if (process.env.NODE_ENV !== 'production') {
	// In development, it loads JSON file and supports WDS's hot reloading
	fetch('make-rpg.json');
}

// Offline plugin
require('offline-plugin/runtime').install();
