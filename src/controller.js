export var _scope = null;
export var _timeout = null;

var $$element;

export const controller = ($scope, $element, $timeout) => {

    $$element = $element;

    $scope.items = []

    $scope.$watch('$parent.$parent.layout.props.style.menuLayout',(e,i)=>{
        $scope.isVertical = $scope.$parent.$parent.layout.props.style.menuLayout == 'bs-vertical-pills'
        $scope.isHorizontal = !$scope.isVertical
        $scope.class = [
            $scope.$parent.$parent.layout.props.style.menuLayout == 'bs-vertical-pills' ? 'nav-stacked' : 'nav-horizontal'
        ]
    })

    $scope.$parent.$parent._scope = $scope
    _scope = $scope;
    _timeout = $timeout;
}

controller['$inject'] = ['$scope', '$element', '$timeout']


if (module.hot) {

    
    module.hot.accept('./definition.js',()=> {
      var {definition} = require('./definition')
     
      if ($$element){
        var _scope = $$element.scope()
        _scope.ext.mappedDefinition = definition
        _scope.ext.definition = definition
        _scope.object.reloadContent()
      }
    });
  
    module.hot.accept('./template.html',()=> {
      var _template = require('./template.html');
      if ($$element){
        var _scope = $$element.scope()
        _scope.ext.template = _template
        _scope.object.reloadContent()
      }
    });

  }
