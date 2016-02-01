import {Injectable, Inject} from 'angular2/core';
import {Http, URLSearchParams} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

// Besser in Boot.ts; zur Vereinfachung hier
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FlugService {
    
    constructor(
        private http: Http) {
    }
    
    suchen(von: string, nach: string) {
        
        var url = "http://www.angular.at/api/flug";
        
        var params = new URLSearchParams();
        params.set('abflugOrt', von);
        params.set('zielOrt', nach);
        
        return this.http
                    .get(url, { search: params })
                    .map(resp => resp.json())
                    .map(fluege => { return {data: fluege}})
                    .toPromise();
          
    }
    
}