sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("projecterp2v2.controller.Home", {
    onInit: function () {
     
    },

    onNavToGames: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteGames"); 
    },

    onNavToStudents: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteStudents"); 
    },
  });
});
