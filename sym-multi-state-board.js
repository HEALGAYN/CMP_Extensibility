(function(PV) {
    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis)
    const definition = {
        typeName: 'multi-state-board',
        displayName: 'State Board',
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/botonAlarma.png',
        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                backgroundColor: '#18365c',
                boardWidth: 80,
                circleWidth: 67,
                boardHeight: 20,
                borderShape: 6,
                fontSize: 16,
                fontSizePopUp: 14,
                textColor: 'white',
                colorStatus: 'transparent',
                Height: 20,
                Width: 80,
                popUpBackgroundColor: 'black',
                popUpTextColor: 'white',
                popUpWidth: 240,
                shape: 'shape-square',
                colorsCritic: {
                    errorColor: '#ff00ff',
                    criticA: '#ff0000',
                    criticB: '#ffa500',
                    criticC: '#ffff00',
                    criticD: '#b5e61d',
                    criticE: '#7fff00',
                }
            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }]
        },
    }

    const getTimeReadable = (timeOfuscated) => {
        const timeDate = `${(new Date(timeOfuscated))}`.split(' ');
        timeDate.length = timeDate.length - 5;
        return timeDate.join(' ');
    }

    const getValidatedValue = (position, data, isTime) => {
        if (!data.Rows[position]) return 'No hay Datos';
        return isTime ? getTimeReadable(data.Rows[position].Time) : data.Rows[position].Value;
    }

    const getElemenContainer = (element, identificator) => {
        const containerElement = element.find($(`#${identificator}`))[0].id = "smb" + identificator + '_' + Math.random().toString(36).substr(2, 16);
        return $(`#${containerElement}`);
    }

    const getColorsStatus = (statusLevels, keys, values) => {
        for (let iterator = 0; iterator < keys.length; iterator++) {
            statusLevels[keys[iterator]] = values[iterator];
        };
    }

    const getColorOfStatus = (status) => {
        if (status < 5) return 'E';
        if (status < 10) return 'D';
        if (status < 13) return 'C';
        if (status < 20) return 'B';
        if (status < 26) return 'A';
        return 'No hay datos'
    }

    symbolVis.prototype.init = function(scope, element) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;
        scope.config.FormatType = null;

        const statusLevels = {
            'No hay datos': scope.config.colorsCritic.errorColor,
            'A': scope.config.colorsCritic.criticA,
            'B': scope.config.colorsCritic.criticB,
            'C': scope.config.colorsCritic.criticC,
            'D': scope.config.colorsCritic.criticD,
            'E': scope.config.colorsCritic.criticE
        };

        const keysStatusLevel = Object.keys(statusLevels);
        const boxBoardContainer = getElemenContainer(element, 'board');
        const boxStringStatus = getElemenContainer(element, 'status');
        const boxStringPrevStatus = getElemenContainer(element, 'prev');
        const boxStringPrevTime = getElemenContainer(element, 'prevTime');

        function myCustomDataUpdateFunction(data) {
            const status = getValidatedValue(0, data, false);
            const prevStatus = getValidatedValue(1, data, false);
            const timePrevStatus = getValidatedValue(1, data, true);
            const statusPublic = !isNaN(status) ? Math.round(status) : status;
            const colorOfStatus = !isNaN(status) ? getColorOfStatus(status) : status;


            scope.config.colorStatus = statusLevels[colorOfStatus];
            boxBoardContainer[0].className = (`origin ${scope.config.shape}`);
            boxBoardContainer.css({ 'border-color': scope.config.colorStatus });
            boxStringStatus.html(statusPublic);
            boxStringPrevStatus.html(prevStatus);
            boxStringPrevTime.html(timePrevStatus);
        }

        function myCustomConfigurationChangeFunction() {
            boxBoardContainer[0].className = (`origin ${scope.config.shape}`);
            const valuesStatusLevel = Object.values(scope.config.colorsCritic);
            getColorsStatus(statusLevels, keysStatusLevel, valuesStatusLevel);
        }
    }

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);