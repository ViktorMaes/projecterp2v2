/*global QUnit*/

sap.ui.define([
	"projecterp2v2/controller/APP.controller"
], function (Controller) {
	"use strict";

	QUnit.module("APP Controller");

	QUnit.test("I should test the APP controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
