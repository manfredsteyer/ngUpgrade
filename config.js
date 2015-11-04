System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "none",
  paths: {
    "*": "app/*.js",
    "angular-i18n/*": "bower_components/angular-i18n/*.js",
    "github:*": "jspm_packages/github/*"
  },

  map: {
    "angular": "github:angular/bower-angular@1.4.7",
    "angular-ui-router": "github:angular-ui/ui-router@0.2.15",
    "bootstrap": "github:twbs/bootstrap@3.3.5",
    "github:angular-ui/ui-router@0.2.15": {
      "angular": "github:angular/bower-angular@1.4.7"
    },
    "github:twbs/bootstrap@3.3.5": {
      "jquery": "github:components/jquery@2.1.4"
    }
  }
});
