(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "menuCMP",
        displayname: "Menu Criticidad x 3120",
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_home.png',
        getDefaultConfig: function() {
            return {
                Height: 1,
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
    symbolVis.prototype.init = function(scope, elem) {};
    PV.symbolCatalog.register(definition);
})(window.PIVisualization);