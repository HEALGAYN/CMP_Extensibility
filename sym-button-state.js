(function(PV) {
    'use strict'

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis)
    const definition = {
        typeName: 'button-state',
        displayName: 'Boton con estado',
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/cmp_boton.png',
        getDefaultConfig: function() {
            return {
                backgroundColor: 'white',
                borderColor: 'transparent',
                buttonWidth: 100,
                buttonHeight: 3,
                fontSize: 14,
                hoverBackgroundColor: 'black',
                hoverTextColor: 'white',
                shadowColor1: 'black',
                shadowColor2: 'white',
                Height: 20,
                Width: 100,
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

    const pathSource = "https://pisystem.cmp.cl/PIVision/Scripts/app/editor/symbols/ext/Icons/";
    const icons = ['icon-checked.svg', 'icon-warning.svg', 'icon-question.svg'];

    const statusIcon = {
        'Normal': `${pathSource}${icons[0]}`,
        'Alarma': `${pathSource}${icons[1]}`,
        'Error': `${pathSource}${icons[2]}`,
    }

    const getElemenContainer = (element, identificator) => {
        const containerElement = element.find($(`#${identificator}`))[0].id = "smb" + identificator + '_' + Math.random().toString(36).substr(2, 16);
        return $(`#${containerElement}`);
    }

    symbolVis.prototype.init = function(scope, element) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;
        scope.config.FormatType = null;

        const boxButtonContainer = getElemenContainer(element, 'imgstatus');

        function myCustomDataUpdateFunction(data) {
            boxButtonContainer[0].src = statusIcon[data.Value ? data.Value : 'Error'];
        }

        function myCustomConfigurationChangeFunction() {}
    }

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);