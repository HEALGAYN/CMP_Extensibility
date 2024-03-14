(function(PV) {
    "use strict";

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "menuOEE",
        displayname: "Menu OEE",
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_home.png',
        getDefaultConfig: function() {
            return {
                Height: 60,
                Width: 3160,

            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    }

    symbolVis.prototype.init = function(scope, elem) {



    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);