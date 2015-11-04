import { FlugService } from '../flug-service';
import { Controller } from '../decorators/controller';

@Controller({
	selector: 'flugSuchen'
})
export class FlugSuchen {
	
	von: string;
	nach: string;
	fluege;
	message: string;
	$log : ng.ILogService;
	flugService: FlugService;
	
	constructor($log: ng.ILogService, flugService: FlugService) {
		this.$log = $log;
		this.flugService = flugService;
	}
	
	suchen() {
		
		this
			.flugService
			.suchen(this.von, this.nach)
			.then((response) => { 
				this.fluege = response.data;
			}).catch((response) => {
				this.message = "Fehler beim Laden!";
			})
		
	}

	
}