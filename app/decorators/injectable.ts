import { app } from '../app-module';

export function Injectable(options) {

    return function(target) {
        var name = toCamelCase(target.name);
        app.service(name, target);
    }
}

function toCamelCase(name) {
    if (name.length >= 2) {
        name = name.substr(0, 1).toLowerCase() + name.substr(1); 
    }
    return name;
}