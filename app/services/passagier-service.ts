
// ng1
export class PassagierService {
    
    constructor(
        private $http: ng.IHttpService) {
    }
    
    find(name): ng.IHttpPromise<any> {
        var url = "http://www.angular.at/api/passagier";
        
        var urlParams = { 
            name: name  
        };
        
        return this.$http.get(url, { params: urlParams });
    }
    
}