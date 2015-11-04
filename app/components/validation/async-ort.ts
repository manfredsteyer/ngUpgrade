

export class AsyncOrtValidatorFactory {
	
	static create($timeout, $q): ng.IDirective {
		
		var cities = ['Graz', 'Hamburg', 'Wien'];
		
		
		return {
        	require: 'ngModel',
        	link: function (scope, element, attrs, ngModel: any) {

            	ngModel.$asyncValidators.asyncOrt = function(value) {
					return $timeout(function() { 
						return $q.reject();
					}, 1000)
            	}

        	}
    	}
		
	}
	
}