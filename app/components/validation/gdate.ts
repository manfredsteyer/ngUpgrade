declare var Globalize: any;

// app.directive('gdate', GDateValidatorFactory.create);

// app.directive('gdate', function() { return { }});

export class GDateValidatorFactory {

	static create () {
	
		// <input ng-model="..." gdata="d">
		return { // DTO
			require: 'ngModel',
			link: function (scope, elm, attrs, ctrl) {
	
				// Den Wert des Attributes auslesen
				// Beim Einsatz von <input gdate="d" ...> wird
				// hier somit "d" ausgelesen ...
				var fmt = attrs.gdate;
				
				ctrl.$parsers.unshift(function (viewValue) {
				
					var d = Globalize.parseDate(viewValue);
	
					if (d) {
						ctrl.$setValidity('gdate', true);
						return d;
					}
					else {
						ctrl.$setValidity('gdate', false);
						return undefined;
					}
	
				});
	
				ctrl.$formatters.unshift(function (value) {
	
					if (!value) return value;
	
					if (typeof value == "string") {
						value = new Date(value);
					}
	
					var formatted = Globalize.format(value, fmt);
					return formatted;
				});
	
			}
		};
	
	};
	
	
}
