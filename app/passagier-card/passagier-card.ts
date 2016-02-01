

export class PassagierCardFactory {
    
    static create(): ng.IDirective {
        
        return {
            templateUrl: 'app/passagier-card/passagier-card.html',
            controllerAs: 'vm',
            scope: {
                item: '=',
                selectedItem: '='
            },
            bindToController: true,
            controller: function() {
                this.select = () => {
                    this.selectedItem = this.item;
                }
            }
        }
        
    }
    
}