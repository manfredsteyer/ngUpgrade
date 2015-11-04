import { app } from '../app-module';

export function Controller(options) {

    return function(target) {
		
		if (!options) options = {};
		if (!options.selector) options.selector = target.name; 
		
        app.controller(options.selector, target);
    }
}
