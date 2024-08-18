sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],
  function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator,
    Sorter
  ) {
    "use strict";

    return Controller.extend("projecterp2v2.controller.Students", {
      onInit: function () {
        var oModel = this.getOwnerComponent().getModel();
        if (!oModel) {
          console.error("OData model is not defined");
        } else {
          this.getView().setModel(oModel);
        }

        var oRouter = UIComponent.getRouterFor(this);
        oRouter
          .getRoute("RouteACStudent")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var oArgs = oEvent.getParameter("arguments");
        var oViewModel = new JSONModel({
          isEdit: oArgs.isEdit === "true",
          Forname: "",
          Surname: "",
        });
        this.getView().setModel(oViewModel, "viewModel");

        if (oArgs.isEdit === "true") {
          this._loadStudentData(oArgs.studentId);
        }
      },

      _loadStudentData: function (studentId) {
        var oModel = this.getView().getModel();
        var sPath = "/studentSet(" + studentId + ")";

        oModel.read(sPath, {
          success: function (oData) {
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setData({
              isEdit: true,
              Forname: oData.Forname,
              Surname: oData.Surname,
              Studentid: oData.Studentid,
            });
          }.bind(this),
          error: function () {
            MessageToast.show("Error loading student data.");
          },
        });
      },

      onAddStudent: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteACStudent", {
          isEdit: false,
        });
      },

      onDeleteStudent: function (oEvent) {
        var oItem = oEvent.getSource().getParent().getParent();
        var sPath = oItem.getBindingContext().getPath();
        var oModel = this.getView().getModel();
        oModel.remove(sPath, {
          success: function () {
            sap.m.MessageToast.show("Student deleted successfully!");
          },
          error: function () {
            sap.m.MessageToast.show(
              "Error deleting student, contact the administrator!"
            );
          },
        });
      },

      onViewDetails: function (oEvent) {
        var oItem = oEvent.getSource().getParent().getParent();
        var sPath = oItem.getBindingContext().getPath();
        var sStudentId = this.getView()
          .getModel()
          .getProperty(sPath + "/Studentid");

        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteStudentDetails", {
          studentId: sStudentId,
        });
      },

      onSaveStudent: function () {
        var oView = this.getView();
        var oModel = oView.getModel();
        var oRouter = UIComponent.getRouterFor(this);

        if (!oModel) {
          MessageToast.show("Model is not available.");
          return;
        }

        var oData = oView.getModel("viewModel").getData();

        var oPayload = Object.assign({}, oData);
        delete oPayload.isEdit;

        if (!oData.isEdit) {
          delete oPayload.Studentid;
        }

        if (oData.isEdit) {
          var sPath = "/studentSet(" + oData.Studentid + ")";
          oModel.update(sPath, oPayload, {
            success: function () {
              MessageToast.show("Student updated successfully!");
              oRouter.navTo("RouteStudents");
            },
            error: function () {
              MessageToast.show(
                "Error updating student, contact the administrator!"
              );
            },
          });
        } else {
          oModel.create("/studentSet", oPayload, {
            success: function () {
              MessageToast.show("Student added successfully to the system!");
              oRouter.navTo("RouteStudents");
            },
            error: function (oError) {
              console.error("Error adding student:", oError);
              MessageToast.show(
                "Error adding student, contact the administrator!"
              );
            },
          });
        }
      },

      onCancel: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteStudents");
      },

      // onFilterStudents: function (oEvent) {
      //   var sQuery =
      //     oEvent.getParameter("query") || oEvent.getParameter("newValue");
      //   var aFilters = [];

      //   if (sQuery && sQuery.length > 0) {
      //     var sWildcardQuery = "*" + sQuery + "*"; // Wildcard aan beide kanten van de query
      //     aFilters.push(
      //       new Filter({
      //         filters: [
      //           new Filter("Studentid", FilterOperator.EQ, sWildcardQuery),
      //           new Filter("Surname", FilterOperator.EQ, sWildcardQuery),
      //           new Filter("Forname", FilterOperator.EQ, sWildcardQuery),
      //         ],
      //         and: false,
      //       })
      //     );
      //   }

      //   var oTable = this.byId("studentTable");
      //   var oBinding = oTable.getBinding("items");
      //   oBinding.filter(aFilters);
      // },
    });
  }
);
