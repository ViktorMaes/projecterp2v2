sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("projecterp2v2.controller.StudentDetails", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteStudentDetails")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        var sStudentId = oEvent.getParameter("arguments").studentId;
        var sPath = "/studentSet(" + sStudentId + ")";
        this.getView().bindElement(sPath);

        this.sStudentId = sStudentId;
        this._bindFavoriteGamesList();
      },

      _bindFavoriteGamesList: function () {
        var oFavGamesList = this.byId("favoriteGamesList");
        var oBinding = oFavGamesList.getBinding("items");
        if (oBinding && this.sStudentId) {
          var iStudentId = parseInt(this.sStudentId, 10);
          if (!isNaN(iStudentId)) {
            var oModel = this.getView().getModel();
            oModel.read("/FavGamesSet", {
              success: function (oData) {
                var aFilteredGames = oData.results.filter(function (game) {
                  return game.Studentid === iStudentId;
                });

                var oFavGamesModel = new JSONModel(aFilteredGames);
                oFavGamesList.setModel(oFavGamesModel);
                oFavGamesList.bindItems({
                  path: "/",
                  template: oFavGamesList.getBindingInfo("items").template,
                });
              }.bind(this),
              error: function (oError) {
                console.error("Error fetching favorite games:", oError);
              },
            });
          } else {
            console.error("Invalid Student ID");
          }
        } else {
          console.warn("Binding or StudentId not available.");
        }
      },

      onAddFavoriteGame: function () {
        var oView = this.getView();
        var sStudentId = oView.getBindingContext().getProperty("Studentid");

        this._openAddFavoriteGameDialog(sStudentId);
      },

      _openAddFavoriteGameDialog: function (sStudentId) {
        var oView = this.getView();

        if (!this._pDialog) {
          this._pDialog = Fragment.load({
            id: oView.getId(),
            name: "projecterp2v2.view.addFavoriteGame",
            controller: this,
          }).then(
            function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.setModel(
                new JSONModel({ studentId: sStudentId }),
                "dialogModel"
              );
              return oDialog;
            }.bind(this)
          );
        } else {
          this._pDialog.then(function (oDialog) {
            oDialog
              .getModel("dialogModel")
              .setProperty("/studentId", sStudentId);
          });
        }

        this._pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onAddFavoriteGameConfirm: function () {
        var oDialog = this.byId("addFavoriteGame");
        var oModel = this.getView().getModel();
        var oDialogModel = oDialog.getModel("dialogModel");
        var oData = oDialogModel.getData();

        var sSelectedGameId = this.byId("gameSelect").getSelectedKey();

        if (!sSelectedGameId) {
          sap.m.MessageToast.show("Please select a game");
          return;
        }

        var oPayload = {
          Gameid: parseInt(sSelectedGameId, 10),
          Studentid: parseInt(oData.studentId, 10),
        };

        oModel.create("/FavGamesSet", oPayload, {
          success: function () {
            sap.m.MessageToast.show("Game added successfully to favorites");
            this._bindFavoriteGamesList();
          }.bind(this),
          error: function () {
            sap.m.MessageToast.show(
              "You already added this game to favorites!"
            );
          },
        });

        oDialog.close();
      },

      onRemoveFavoriteGame: function (oEvent) {
        var oItem = oEvent.getSource().getParent();
        var oBindingContext = oItem.getBindingContext();
        var sGameId = oBindingContext.getProperty("Gameid");
        var sStudentId = oBindingContext.getProperty("Studentid");
        var oModel = this.getView().getModel();

        if (sGameId && sStudentId) {
          var sFullPath =
            "/FavGamesSet(Gameid=" + sGameId + ",Studentid=" + sStudentId + ")";

          oModel.remove(sFullPath, {
            success: function () {
              sap.m.MessageToast.show(
                "Game has been successfully removed from favorites!"
              );
              this._bindFavoriteGamesList();
            }.bind(this),
            error: function (oError) {
              sap.m.MessageToast.show(
                "You don't have this game in your favorites anymore, please reload!"
              );
              console.error("Error removing favorite game:", oError);
            },
          });
        } else {
          console.error("Invalid Gameid or Studentid:", sGameId, sStudentId);
          sap.m.MessageToast.show("Error: Game/Student don't match.");
        }
      },

      onCancelDialog: function () {
        this.byId("addFavoriteGameDialog").close();
      },

      formatGameName: function (sGameId) {
        if (!sGameId) {
          return "";
        }

        var oModel = this.getView().getModel();
        var sPath = "/gameSet(" + sGameId + ")";

        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData.Name);
            },
            error: function (error) {
              resolve(sGameId);
            },
          });
        });
      },

      onNavToGameDetails: function (oEvent) {
        var oItem = oEvent.getSource();
        var sGameId = oItem.getBindingContext().getProperty("Gameid");
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteGameDetails", {
          gameId: sGameId,
        });
      },
    });
  }
);
