import {Component} from 'angular2/core';
import {WarenkorbService} from '../services/warenkorb-service';

@Component({
    selector: 'warenkorb',
    templateUrl: 'app/warenkorb/warenkorb.html'
})
export class Warenkorb {
    
    constructor(
        private warenkorbService: WarenkorbService
    ) { 
    }

    get flug() {
        return this.warenkorbService.flug;
    }    
    
    get passagier() {
        return this.warenkorbService.passagier;
    }
}