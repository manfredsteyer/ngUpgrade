import { Controller } from '../decorators/controller';

@Controller({
	selector: 'home'
})
export class Home {
	
	info = "Willkommen bei dieser Demo-Anwendung!";
	
}