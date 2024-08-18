/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "projecterp2v2/model/models",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (UIComponent, Device, models, ODataModel) {
    "use strict";

    return UIComponent.extend("projecterp2v2.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        // standaard component stuff.
        // Call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // Initialize the OData model
        try {
          var oModel = new ODataModel(
            "/sap/opu/odata/sap/ZAS_65_GAMES_SRV_SRV/"
          );
          this.setModel(oModel);
          console.log("OData Model initialized and set.");
        } catch (error) {
          console.error("Error initializing OData Model:", error);
        }

        // Enable routing
        this.getRouter().initialize();

        // Set the device model
        this.setModel(models.createDeviceModel(), "device");

        // Include custom CSS
       // jQuery.sap.includeStyleSheet("css/style.css");
      },
    });
  }
);
