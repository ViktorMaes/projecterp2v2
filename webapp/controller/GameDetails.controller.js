sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("projecterp2v2.controller.GameDetails", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteGameDetails")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        var sGameId = oEvent.getParameter("arguments").gameId;
        var iGameId = parseInt(sGameId, 10); 
        var sPath = "/gameSet(" + iGameId + ")";
        this.getView().bindElement({
          path: sPath,
          events: {
            change: this._onBindingChange.bind(this),
          },
        });

        this._fetchFavoriteStudents(iGameId);
      },

      _onBindingChange: function () {
        var oView = this.getView();
        var oElementBinding = oView.getElementBinding();

        if (!oElementBinding.getBoundContext()) {
          return;
        }

        var oContext = oElementBinding.getBoundContext();
        var oData = oContext.getObject();
        var sFormattedDate = this._formatDate(oData.Releasedate);
        oView
          .byId("gameReleaseDate")
          .setText("Release Date: " + sFormattedDate);
      },

      _formatDate: function (sDate) {
        if (sDate) {
          var oDate = new Date(sDate);
          var oOptions = { year: "numeric", month: "short", day: "numeric" };
          return oDate.toLocaleDateString("en-US", oOptions);
        }
        return sDate;
      },

      _fetchFavoriteStudents: function (iGameId) {
        var oModel = this.getView().getModel();

        oModel.read("/FavGamesSet", {
          success: function (oData) {
            var aStudentIds = oData.results
              .filter(function (game) {
                return game.Gameid === iGameId;
              })
              .map(function (game) {
                return game.Studentid;
              });

            if (aStudentIds.length > 0) {
              this._fetchStudentNamesAndCount(aStudentIds);
            } else {
              this.getView()
                .byId("favoritesTitle")
                .setText("No students have favorited this game.");
              this.getView().byId("favoriteStudents").setText("");
            }
          }.bind(this),
          error: function (oError) {
            console.error("Error fetching favorite students:", oError);
            this.getView()
              .byId("favoritesTitle")
              .setText("Error fetching student data");
            this.getView().byId("favoriteStudents").setText("");
          }.bind(this),
        });
      },

      _fetchStudentNamesAndCount: function (aStudentIds) {
        var oModel = this.getView().getModel();
        var aFilters = aStudentIds.map(function (sStudentId) {
          return new Filter("Studentid", FilterOperator.EQ, sStudentId);
        });

        oModel.read("/studentSet", {
          filters: aFilters,
          success: function (oData) {
            var aStudentNames = oData.results.map(function (student) {
              return student.Forname + " " + student.Surname;
            });

            this.getView()
              .byId("favoritesTitle")
              .setText(
                aStudentIds.length + " students have favorited this game."
              );
            this.getView()
              .byId("favoriteStudents")
              .setText(
                "Students who favorited this game: " + aStudentNames.join(", ")
              );
          }.bind(this),
          error: function (oError) {
            console.error("Error fetching student names:", oError);
            this.getView()
              .byId("favoritesTitle")
              .setText("Error fetching student data");
            this.getView().byId("favoriteStudents").setText("");
          }.bind(this),
        });
      },
    });
  }
);
