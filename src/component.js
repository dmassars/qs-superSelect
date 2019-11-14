
import qlik from 'qlik';
import $ from 'jquery';

import {
  get as _get,
  forEach as _forEach,
  isEmpty as _isEmpty,
  pull as _pull,
} from 'lodash';

import './styles/styles.scss';

import {_timeout} from './controller'

const app = qlik.currApp();

export const list_to_tree = function(list) {
  var map = {}, node, roots = [], i;
  for (i = 0; i < list.length; i += 1) {
      map[list[i].cId] = i; // initialize the map
      list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parentMenuItemId && node.parentMenuItemId.length > 0) {
          // if you have dangling branches check that map[node.parentId] exists
          list[map[node.parentMenuItemId]].children.push(node);
      } else {
          roots.push(node);
      }
  }
  return roots;
}

function generateCss(layout){

  const elemSelector = `[tid="${layout.qInfo.qId}"] .qv-object-superSelect`
  const style = layout.props.style

  function getColor(prop){
    var val = _get(style,prop,'initial')
    if (val.color) val = val.color
    return `${val} !important`
  }

  try {
    var sheet = $(`style#css${layout.qInfo.qId}`)
    if (sheet.length == 0){
      sheet = document.createElement(`style`)
      sheet.id = `css${layout.qInfo.qId}`
      document.body.appendChild(sheet);
    } else {
      sheet = sheet[0]
    }

    sheet.innerHTML = `

      ${elemSelector} nav {
        background-color: ${getColor('menuBackgroundColor')};
        border-color: ${getColor('menuBorderColor')};
      }

      ${elemSelector} a.main-item:hover {
        box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.2);
      }

      ${elemSelector} a.main-item.not-selected {
        background-color: ${getColor('parentMenuItem.default.backgroundColor')};
        color: ${getColor('parentMenuItem.default.fontColor')};
      }
  
      ${elemSelector} a.main-item.selected {
        background-color: ${getColor('parentMenuItem.selected.backgroundColor')};
        color: ${getColor('parentMenuItem.selected.fontColor')};
      }

    `;

  } catch (err) {
    console.log(err)
  }
}

async function doAction(item) {

  var actions = _get(item,'actions',[])
  if (actions.length == 0) return


  async function callAction(i){
    var a = actions[i]

    try {
      var fld = _get(a,'field');
      var val =  _get(a,'value');
      var bookmark =  _get(a,'bookmark');
      var variable =  _get(a,'variable');
      var softlock =  _get(a,'softlock');

      var _func;

      switch (a.action) {
        case "clearAll":
          await app.clearAll();
          break;
        case "lockAll":
          await app.lockAll();
          break;
        case "unlockAll":
          await app.unlockAll();
          break;
        case "clearField":
          if (!_isEmpty(fld)) {
            await app.field(fld).clear();
          }
          break;
        case "selectAlternative":
          if (!_isEmpty(fld)) {
            await app.field(fld).selectAlternative(softlock);
          }
          break;
        case "selectExcluded":
          if (!_isEmpty(fld)) {
            await app.field(fld).selectExcluded(softlock);
          }
          break;
        case "selectField":
          if (!_isEmpty(fld) && (!_isEmpty(val))) {
            await app.field(fld).selectMatch(val, false);
          }
          break;
        case "selectValues":
          if (!_isEmpty(fld) && (!_isEmpty(val))) {
            var vals = val.split(';')
            await app.field(fld).selectValues(vals, false);
          }
          break;
        case "selectandLockField":
          if (!_isEmpty(fld) && (!_isEmpty(val))) {
            await app.field(fld).selectMatch(val, true)
            await app.field(fld).lock()
          }
          break;
        case "lockField":
          if (!_isEmpty(fld)) {
            await app.field(fld).lock()
          }
          break;
        case "applyBookmark":
          if (!_isEmpty(bookmark)) {
            await app.bookmark.apply(bookmark);
          }
          break;
        case "setVariable":
          if (!_isEmpty(variable)) {
            await app.variable.setStringValue(variable, val)
          }
          break;
        default:
          break;
      }
      
    } catch (err){
      console.log(`${i}: ${a.action}  -- ERROR -- ${err}`)
    }

    // need this to be synchronous
    if ((i+1)<actions.length) callAction(i+1)

  }

  callAction(0)
};

function fixUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://') || (url.startsWith('mailto://'))) {
    return url;
  }
  return 'http://' + url;
}

export const setMenu = ($scope,layout)=>{

  _forEach($scope.layout.menuItems,(e)=>{

    e.classList = []
    e.parentClassList = []
    e.meta = {}

    var currentSheetId;

    if (_.has(layout,'sheetId')) currentSheetId = layout.sheetId
    else {
      try { currentSheetId = qlik.navigation.getCurrentSheetId().sheetId } 
      catch(e){    }
    }    

    e.navFunc = ()=>{}
    e.isActiveSheet = false
    
    if (_get(e,'action')) {
      switch (e.action){
        case "gotoSheet":
          e.isActiveSheet = (currentSheetId == e.selectedSheet)
          e.navFunc = ()=>{  qlik.navigation.gotoSheet(e.selectedSheet) }
          break;
        case "gotoSheetById":
          e.isActiveSheet = (currentSheetId == e.sheetId)
          e.navFunc = ()=>{  qlik.navigation.gotoSheet(e.sheetId) }
          break;
        case "openWebsite":
          var url = e.websiteUrl;
          e.navFunc = ()=>{  
            if (!_.isEmpty(url)) {
              window.open(fixUrl(url), (e.sameWindow ? '_self' : ''));
            }
          }
          break;
        case "nextSheet":
          e.navFunc = ()=>{  qlik.navigation.nextSheet() }
          break;
        case "prevSheet":
          e.navFunc = ()=>{  qlik.navigation.prevSheet() }
          break;
        case "gotoStory":
          e.navFunc = ()=>{  qlik.navigation.gotoStory(e.selectedStory) }
          break;
      }
    }

    e.go = function(){
      if (qlik.navigation.getMode()=='edit') return
      
      // if (_get(e,'actions',[]).length){
      //   $(`#${e.cId} .ui.button`).removeClass('is-active')
      //   $(`#${e.cId}`).addClass('loading')
      // }

      doAction(e)
      e.navFunc()
    }
  
    if (e.isActiveItem == '-1' || e.isActiveSheet) {
      e.classList.push('selected-item')
      e.classList.push('selected')
    } else {
      e.classList.push('not-selected')
    }
   
  })

  $scope.menu =  list_to_tree($scope.layout.menuItems)

  _forEach($scope.menu,(e)=>{
    e.styleUpdate = {};

    if ($scope.layout.props.style.buttonSize=='custom' && $scope.layout.props.style.buttonSizeCustom){
      e.styleUpdate.height = $scope.layout.props.style.buttonSizeCustom
    }

    e.meta['aria-haspopup'] = true;
    e.meta['aria-expanded'] = false;

    e.$isActiveItem = e.isActiveItem && e.isActiveItem.length && ['-1',-1,'1',1,'true',true].indexOf(e.isActiveItem) > -1
    
    e.hasActiveChild = e.children.filter((e)=>{
      return e.isActiveItem == '-1' || e.isActiveSheet
    }).length > 0

    if (e.isActiveItem == '-1'  || e.hasActiveChild || e.isActiveSheet) {
      _pull(e.classList,'not-selected')
      e.classList.push('selected')
      e.parentClassList.push('active')
    }
    
  })

  return $scope.menu
}

export const component = ($element, layout, isHot) => {
  var scope = $element.scope()

  var _scope = scope._scope

  _scope.layout = layout

  generateCss(layout)

  scope.isVertical = (layout.props.menuLayout == "bs-vertical-pills")
  scope.isHorizontal = (layout.props.menuLayout !== "bs-vertical-pills")

  if (!$element.hasClass('qv-object-superselect-ext')) $element.addClass('qv-object-superselect-ext')

  $(`[tid="${layout.qInfo.qId}"] .qv-object-nav [tid="nav-menu-zoom-in"]`).css('display','none')

  _timeout(()=>{
    _scope.items = angular.copy(setMenu(scope,layout))
    $element.find('.menu-section').show()
  })


}

export const paint = ($element, layout) => {

  component($element, layout);
  
  if (module.hot) {
    module.hot.accept('./component',()=> {
      component($element, layout, true);
    });
  }

  return qlik.Promise.resolve();
}

