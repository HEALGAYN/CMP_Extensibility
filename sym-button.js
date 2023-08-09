(function(PV) {
    'use strict'

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis)
    const definition = {
        typeName: 'button',
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/boton.png',
        getDefaultConfig: function() {
            return {
                backgroundColor: 'white',
                borderColor: 'transparent',
                buttonWidth: 'auto',
                buttonHeight: 'auto',
                fontSize: 14,
                hoverBackgroundColor: 'black',
                hoverTextColor: 'white',
                shadowColor1: 'black',
                shadowColor2: 'white',
                Height: 20,
                Width: 180,
                Links: [],
                textColor: 'black',
                headerLink: { Name: 'Button', Url: '', IsNewTab: true }
            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }]
        },
    }

    symbolVis.prototype.init = function(scope) {}

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);