import {FlugService} from '../flug-service';
import { Controller } from '../decorators/controller';

@Controller({
	selector: 'flugEdit'
})
export class FlugEdit {
	
	id;
	flugService: FlugService;
	flug;
	message;
	
	
	constructor($stateParams, flugService: FlugService) {
		var id = $stateParams.id;
		this.id = id;
		this.flugService = flugService;
		
		flugService
			.byId(id)
			.then((result) => {
				this.flug = result.data;
				this.message = "";
			})
			.catch((result) => {
				this.message = "Fehler beim Laden von Daten";
			});
	}
	
	save() {
		this.flugService
			.save(this.flug)
			.then((result) => {
				this.message = "Erfolgreich gespeichert!";
			})
			.catch((result) => {
				this.message = "Fehler beim Speichern: " + result.data;
			});
	}
	
	
	
}