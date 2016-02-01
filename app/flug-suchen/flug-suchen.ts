import { FlugService } from '../flug-service';
import {WarenkorbService} from '../services/warenkorb-service';

export class FlugSuchen {
	
	von: string = "Graz";
	nach: string = "Hamburg";
	fluege;
	message: string;
	selectedFlug;
    
	constructor(
        private $log: ng.ILogService, 
        private flugService: FlugService, 
        private warenkorbService: WarenkorbService) {
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
    
    select(flug) {
       this.selectedFlug = flug; 
       this.warenkorbService.flug = flug;
    }

	
}