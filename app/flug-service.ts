import { Injectable } from 'decorators/injectable';

@Injectable({})
export class FlugService {
	
	$http: ng.IHttpService;
	baseUrl : string;
	
	constructor($http: ng.IHttpService, baseUrl: string) {
		this.$http = $http;
		this.baseUrl = baseUrl;
	}
	
	byId(id: number) {
		
		var urlParams = {
			flugNummer: id
		};
	
		var url = this.baseUrl + '/api/flug';
		return this
			.$http
			.get(url, { params: urlParams });
		
	}
	
	save(flug) {
		
		var url = this.baseUrl + '/api/flug';
		return this.$http.post(url, flug);
		
	}
	
	suchen(von: string, nach: string) {
		
		var urlParams = {
			abflugOrt: von,
			zielOrt: nach
		};
	
		var url = this.baseUrl + '/api/flug';
		return this
			.$http
			.get(url, { params: urlParams })
			
		
	}
	
}