
export class OrtFilter {
	
	static createFilter($log) {
		
		// abflugOrt | ort:'short':'de'
		// Anmerkung: lang wird nicht verwendet
		return function(value, format, lang) {
			
			var short, long;
			
			switch(value) {
				
				case "Hamburg":
					short = "HAM";
					long = "Hamburg Fuhlsbüttel";
				break;
				
				case "Graz":
					short = "GRZ";
					long = "Graz Thalerhof";
				break;
				
				default:
					short = 'ROM';
					long = 'Rom';
			}
			
			if (format == 'short') {
				return short;
			}
			
			return long;
		
		}
		
	}
	
	
}