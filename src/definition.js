import qlik from 'qlik';
import $q from 'ng!$q';

import {
  sortBy as _sortBy,
  get as _get
} from 'lodash';

var app = qlik.currApp();

// ****************************************************************************************
// Helper Promises
// ****************************************************************************************
var getBookmarkList = function () {
  var defer = $q.defer();

  app.getList('BookmarkList', function (items) {
    defer.resolve(items.qBookmarkList.qItems.map(function (item) {
      return {
        value: item.qInfo.qId,
        label: item.qData.title
      }
    }));
  });
  return defer.promise;
};

var _sheetList;

var getSheetList = function () {

  var defer = $q.defer();
  if (_sheetList) {
    // console.log('gettings sheets from cache')
    defer.resolve(_sheetList)
  } else {
    // console.log('gettings sheets from engine',_sheetList)
    app.getAppObjectList(function (data) {
      var sheets = [];
      var sortedData = _sortBy(data.qAppObjectList.qItems, function (item) {
        return item.qData.rank;
      });
      sortedData.forEach(function (item) {
        sheets.push({
          value: item.qInfo.qId,
          label: item.qMeta.title
        });
      });
      _sheetList = sheets;
      app.destroySessionObject(data.qInfo.qId)
      return defer.resolve(sheets);
    })
  }

  return defer.promise;
};

var getStoryList = function () {

  var defer = $q.defer();

  app.getList('story', function (data) {
    var stories = [];
    if (data && data.qAppObjectList && data.qAppObjectList.qItems) {
      data.qAppObjectList.qItems.forEach(function (item) {
        stories.push({
          value: item.qInfo.qId,
          label: item.qMeta.title
        });
      })
    }
    return defer.resolve(_sortBy(stories, function (item) {
      return item.label;
    }));

  });

  return defer.promise;

};

// ****************************************************************************************
// Layout
// ****************************************************************************************

var textAlign = {
  ref: "props.textAlign",
  label: "Text Alignment",
  type: "string",
  component: "dropdown",
  defaultValue: "center",
  show: (e) => {
    return e.props.objectType == 'button'
  },
  options: [{
      value: "center",
      label: "Center"
    },
    {
      value: "left",
      label: "Left"
    },
    {
      value: "right",
      label: "Right"
    }
  ],
  
};

var verticalAlign = {
  ref: "props.verticalAlign",
  label: "Vertical Alignment",
  type: "string",
  component: "dropdown",
  defaultValue: "align-center",
  options: [{
      value: "align-top",
      label: "Top"
    },
    {
      value: "align-center",
      label: "Center"
    },
    {
      value: "align-bottom",
      label: "Bottom"
    }
  ]
};

var wrapButtonText = {
  ref: "props.wrapButtonText",
  label: "Wrap Button Text",
  type: 'boolean',
  defaultValue: true,
  show: (e) => {
    return e.props.objectType == 'button'
  }
};

var buttonLabel = {
  ref: "buttonLabel",
  label: "Label",
  type: "string",
  expression: "optional",
  defaultValue: "My Button"
};

var showCondition = {
  ref: "showCondition",
  label: "Show Condition",
  type: "string",
  expression: "optional",
  defaultValue: ""
};

// ****************************************************************************************
// Behavior
// ****************************************************************************************
var actionNav = {
  ref: "action",
  label: "Navigation Action",
  type: "string",
  component: "dropdown",
  default: "nextSheet",
  options: [{
      value: "none",
      label: "None"
    },
    {
      value: "nextSheet",
      label: "Go to next sheet"
    },
    {
      value: "prevSheet",
      label: "Go to previous sheet"
    },
    {
      value: "gotoSheet",
      label: "Go to a specific sheet"
    },
    {
      value: "gotoSheetById",
      label: "Go to a sheet (defined by Sheet Id)"
    },
    {
      value: "gotoStory",
      label: "Go to a story"
    },
    {
      value: "openWebsite",
      label: "Open website"
    }
  ]
};

var sheetId = {
  ref: "sheetId",
  label: "Sheet ID",
  type: "string",
  expression: "optional",
  show: function (data) {
    return data.action === 'gotoSheetById';
  }
};

var sheetList = {
  type: "string",
  component: "dropdown",
  label: "Select Sheet",
  ref: "selectedSheet",
  options: function () {
    return getSheetList().then(function (items) {
      return items;
    });
  },
  show: function (data) {
    return data.action === 'gotoSheet';
  }
};

var storyList = {
  type: "string",
  component: "dropdown",
  label: "Select Story",
  ref: "selectedStory",
  options: function () {
    return getStoryList().then(function (items) {
      return items;
    });
  },
  show: function (data) {
    return data.action === 'gotoStory'
  }
};

var websiteUrl = {
  ref: "websiteUrl",
  label: "Website Url:",
  type: "string",
  expression: "optional",
  show: function (data) {
    return data.action === 'openWebsite';
  }

};

const sameWindow = {
  ref: 'sameWindow',
  label: 'Open in same window',
  type: 'boolean',
  defaultValue: true,
  show: function (data) {
    return data.action === 'openWebsite';
  }
};

// ****************************************************************************************
// Actions
// ****************************************************************************************

var actionOptions = [{
    value: "none",
    label: "None"
  },
  {
    value: "applyBookmark",
    label: "Apply Bookmark"
  },
  {
    value: "clearAll",
    label: "Clear All Selections"
  },
  {
    value: "clearField",
    label: "Clear Selection in Field"
  },
  {
    value: "lockField",
    label: "Lock Field"
  },
  {
    value: "selectExcluded",
    label: "Select Excluded Values"
  },
  {
    value: "selectAlternative",
    label: "Select Alternative Values"
  },
  {
    value: "selectandLockField",
    label: "Select and Lock in Field"
  },
  {
    value: "selectField",
    label: "Select Value in Field"
  },
  {
    value: "selectValues",
    label: "Select Multiple Values in Field"
  },
  {
    value: "setVariable",
    label: "Set Variable Value"
  },
  {
    value: "lockAll",
    label: "Lock All Selections"
  },
  {
    value: "unlockAll",
    label: "Unlock All Selections"
  }
];

var action = {
  type: "string",
  component: "dropdown",
  label: "Action",
  ref: "action",
  defaultValue: "none",
  options: actionOptions
};


var fieldEnabler = ['selectField', 'selectValues', 'clearField', 'selectandLockField', 'lockField', 'selectAlternative', 'selectExcluded'];
var field = {
  type: "string",
  ref: "field",
  label: "Field",
  expression: "optional",
  show: function (data) {
    return fieldEnabler.indexOf(data.action) > -1;
  }
};

var bookmarkEnabler = ['applyBookmark'];
var bookmark = {
  type: "string",
  ref: "bookmark",
  label: "Bookmark Id",
  expression: "optional",
  show: function (data) {
    return bookmarkEnabler.indexOf(data.action) > -1;
  }
};

var variableEnabler = ['setVariable'];
var variable = {
  type: "string",
  ref: "variable",
  label: "Variable Name",
  expression: "optional",
  show: function (data) {
    return variableEnabler.indexOf(data.action) > -1
  }
};


var valueEnabler = ['selectField', 'selectValues', 'setVariable', 'selectandLockField'];
var value = {
  type: "string",
  ref: "value",
  label: "Value",
  expression: "optional",
  show: function (data) {
    return valueEnabler.indexOf(data.action) > -1;
  }
};

var valueDescEnabler = ['selectValues'];
var valueDesc = {
  type: "text",
  component: "text",
  ref: "valueDesc",
  label: "Define multiple values separated with a semi-colon (;).",
  show: function (data) {
    return valueDescEnabler.indexOf(data.action) > -1;
  }
};


var bookmark1Enabler = ['applyBookmark'];
var bookmark = {
  type: "string",
  component: "dropdown",
  label: "Select Bookmark",
  ref: "bookmark",
  options: function () {
    return getBookmarkList()
      .then(function (items) {
        return items;
      });
  },
  show: function (data) {
    return bookmark1Enabler.indexOf(data.action) > -1;
  }
};

var softLockEnabler = ['selectAlternative', 'selectExcluded'];
var softlock = {
  type: "boolean",
  label: "Soft Lock",
  ref: "softlock",
  defaultValue: false,
  show: function (data) {
    return softLockEnabler.indexOf(data.action) > -1;
  }
};

var parentItem = {
  type: "string",
  component: "dropdown",
  label: "Parent Menu Item",
  ref: "parentMenuItemId",
  options: function (data, obj, _obj) {
    var items = [
      {
        value: null,
        label: '<Select a value>'
      }
    ]
    _obj.layout.menuItems.forEach((e) => {
      items.push({
        value: e.cId,
        label: e.buttonLabel
      })
    })
    return items
  },
  change: (e) => {
    if (e.cId == e.parentMenuItemId) {
      e.parentMenuItemId = ''
    }
  }
};

var menuLayout = {
  type: "string",
  component: "dropdown",
  label: "Menu Layout",
  ref: "props.style.menuLayout",
  options: [{
      value: 'bs-vertical-pills',
      label: 'Vertical'
    },
    {
      value: 'bs-horizontal-pills',
      label: 'Horizontal'
    },
  ],
  defaultValue: 'bs-horizontal-pills'
};

var type = {
  type: "string",
  component: "dropdown",
  label: "Type",
  ref: "props.objectType",
  options: [{
      value: 'button',
      label: 'Buttons'
    },
    {
      value: 'checkbox',
      label: 'Checkbox'
    },
    // {
    //   value: 'switch',
    //   label: 'Switch'
    // },
    // {
    //   value: 'radio',
    //   label: 'Radio'
    // },
  ],
  defaultValue: 'button'
};

var buttonSize = {
  type: "string",
  component: "dropdown",
  label: "Button Size",
  ref: "props.style.buttonSize",
  options: [
    {
      value: 'custom',
      label: 'Custom'
    },
    {
      value: 'auto',
      label: 'Auto'
    },
    {
      value: 'mini',
      label: 'Mini'
    },
    {
      value: 'tiny',
      label: 'Tiny'
    },
    {
      value: 'small',
      label: 'Small'
    },
    {
      value: 'medium',
      label: 'Medium'
    },
    {
      value: 'large',
      label: 'Large'
    },
    {
      value: 'big',
      label: 'Big'
    },
    {
      value: 'huge',
      label: 'huge'
    },
    {
      value: 'massive',
      label: 'massive'
    }
  ],
  defaultValue: 'tiny',
  show: (e) => {
    return e.props.objectType == 'button'
  }
};


var customButtonSize = {
  type: "string",
  label: "Button Height (ex 23px)",
  ref: "props.style.buttonSizeCustom",
  expression: "optional",
  defaultValue: '23px',
  show: (e)=>{
    return e.props.style.buttonSize == 'custom'
  }
};



var isActiveItem = {
  type: "string",
  ref: "isActiveItem",
  label: "Active Item Condition",
  expression: "optional",
  defaultValue: ''
};

var menuListItems = {
  label: buttonLabel,
  showCondition,
  isActiveItem,
  // parentItem,
  layout: {
    type: "items",
    component: "expandable-items",
    items: {
      behavior: {
        type: "items",
        label: "Navigation Behavior",
        items: {
          actionNav,
          sheetId,
          sheetList,
          // refreshList,
          storyList,
          websiteUrl,
          sameWindow
        }
      },
      actionsBefore: {
        type: "array",
        ref: "actions",
        allowAdd: true,
        allowRemove: true,
        itemTitleRef: "action",
        addTranslation: "Add Action",
        label: "Actions",
        items: {
          action,
          field,
          variable,
          value,
          valueDesc,
          bookmark,
          softlock,
        }
      },
    }
  }
}


export const definition = {
  type: 'items',
  component: 'accordion',
  items: {
    MyList: {
      type: "array",
      ref: "menuItems",
      label: "Menu Items",
      itemTitleRef: (e, f, g) => {
        if (_get(e, 'parentMenuItemId')) {
          var parent = _get(g, 'layout.menuItems', []).find((h) => {
            return h.cId == _get(e, 'parentMenuItemId')
          })
          return `${_get(parent,'buttonLabel','')} - ${e.buttonLabel}`
        } else return e.buttonLabel
      },
      allowAdd: true,
      allowRemove: true,
      addTranslation: "Add Menu Item",
      items: menuListItems
    },
    appearance: {
      uses: 'settings',
      items: {
        menuStyling: {
          type: "items",
          grouped: true,
          label: "Menu Styling",
          items: {
            menuSettings: {
              type: 'items',
              items: {
                type,
                buttonProps: {
                  type: 'items',
                  show: (e) => { return e.props.objectType == 'button' },
                  items: {
                    menuLayout,
                    buttonSize,
                    customButtonSize,
                    verticalAlign,
                    wrapButtonText,
                    textAlign,
                  },
                },
                fieldLabel: {
                  type: 'items',
                  // grouped: true,
                  show: true,
                  // show: (e) => { return e.props.objectType !== 'button' },
                  items: {
                    showLabel:{
                      ref: "props.label.show",
                      label: "Show Label",
                      type: 'boolean',
                      defaultValue: true
                    },
                    formLabel: {
                      ref: "props.label.text",
                      label: "Label",
                      type: "string",
                      expression: "optional",
                      defaultValue: "",
                      show: (e) => { return e.props.label.show },
                    },
                    inlineLabel: {
                      ref: "props.label.inline",
                      label: "Inline label",
                      type: 'boolean',
                      defaultValue: true,
                      show: (e) => { return e.props.label.show && e.props.objectType !== 'button'}
                    },
                  
                  },
                },
                // fontSize:{
                //   ref: "props.fontSize",
                //   label: "Font Size",
                //   type: "integer",
                //   expression: "optional",
                //   defaultValue: 12
                // },
                colors: {
                  show: (e) => { return e.props.objectType == 'button' },
                  type: 'items',
                  items: {
                    menuBackgroundColor: {
                      ref: "props.style.menuBackgroundColor",
                      label: "Menu Background Color",
                      component: "color-picker",
                      dualOutput: true,
                      defaultValue: { index: -1, color: "#ffffff" }
                    }, 
                    parentMenuItemDefault: {
                      type: 'items',
                      show: (e) => {
                        return e.props.objectType == 'button'
                      },
                      items: {
                        parentMenuItemDefaultBackgroundColor: {
                          ref: "props.style.parentMenuItem.default.backgroundColor",
                          label: "Button Default Background Color",
                          component: "color-picker",
                          dualOutput: true,
                          defaultValue: { index: -1, color: "#E0E1E2" }
                        },

                        parentMenuItemDefaultFontColor: {
                          ref: "props.style.parentMenuItem.default.fontColor",
                          label: "Button Default Font Color",
                          component: "color-picker",
                          dualOutput: true,
                          defaultValue: { index: -1, color: "#000000" }
                        }, 

                      }
                    },

                    parentMenuItemSelected: {
                      type: 'items',
                      show: (e) => {
                        return e.props.objectType == 'button'
                      },
                      items: {
                        parentMenuItemSelectedBackgroundColor: {
                          "ref": "props.style.parentMenuItem.selected.backgroundColor",
                          "label": "Button Active Background Color",
                          component: "color-picker",
                          dualOutput: true,
                          defaultValue: { index: -1, color: "#7399c6" }
                        },
                        parentMenuItemSelectedFontColor: {
                          "ref": "props.style.parentMenuItem.selected.fontColor",
                          "label": "Button Active Font Color",
                          component: "color-picker",
                          dualOutput: true,
                          defaultValue: { index: -1, color: "#ffffff" }
                        },
                      }
                    },                   
                  }
                }
              }
            },
          }
        }
      }
    }
  }

};