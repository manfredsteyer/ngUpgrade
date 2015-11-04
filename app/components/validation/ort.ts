

export class OrtValidatorFactory {
	
	static create(): ng.IDirective {
		
		var cities = ['Graz', 'Hamburg', 'Wien'];
		
		
		return {
        	require: 'ngModel',
        	link: function (scope, element, attrs, ngModel: any) {

            	ngModel.$validators.ort = function(value) {
					
					var count = cities
									.filter(c => c == value)
									.length;
					
                	if (count > 0) {
						return true;
					}
					else {
						return false;
					}
            	}

        	}
    	}
		
	}
	
}