import { Input, Component, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import { Output, EventEmitter } from 'angular2/core';

// <flug-card [item]="f" 
//            [selectedItem]="..." 
//            (selectedItemChange)="...">
// </flug-card>
@Component({
	selector: 'flug-card',
	directives: [CORE_DIRECTIVES],
	templateUrl: 'app/flug-card/flug-card.html'
})
export class FlugCard {
	
	@Input('item') flug;
	@Input() selectedItem;
	@Output() selectedItemChange = new EventEmitter();
	
	select() {
		this.selectedItemChange.next(this.flug);
	}
}