(function(PV) {
    "use strict";

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "filterMounth",
        displayName: "Filtro x Mes",
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/search.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                Height: 30,
                Width: 400,
                fontSize: 14
            };
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'default'
            }];
        },
    };

    // Lista de meses
    const months = [
        { name: 'Enero', id: 0 },
        { name: 'Febrero', id: 1 },
        { name: 'Marzo', id: 2 },
        { name: 'Abril', id: 3 },
        { name: 'Mayo', id: 4 },
        { name: 'Junio', id: 5 },
        { name: 'Julio', id: 6 },
        { name: 'Agosto', id: 7 },
        { name: 'Septiembre', id: 8 },
        { name: 'Octubre', id: 9 },
        { name: 'Noviembre', id: 10 },
        { name: 'Diciembre', id: 11 }
    ];

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        scope.config.months = months;

        scope.timeED = {
            month: null,
            year: null
        };

        scope.search = function() {
            var timeED = getStartEndTime(scope.timeED.month, scope.timeED.year);
            timeProvider.requestNewTime(timeED.startTime, timeED.endTime, true);
        };

        function getStartEndTime(monthId, year) {
            var month = parseInt(monthId);
            if (year < 2018 || year > 2050 || isNaN(year)) {
                year = new Date().getFullYear();
                scope.timeED.year = year;
            }
            var startTime = new Date(year, month + 1, 0, 0, 0, 0);
            var endTime = new Date(year, month + 1, 0, 0, 0, 0);
            startTime.setDate(endTime.getDate() - 1);


            return {
                startTime: startTime,
                endTime: endTime
            };
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);