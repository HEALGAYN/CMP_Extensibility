(function(PV) {
    "use strict";

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "filterTime",
        displayName: "Filtro de Tiempos",
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_search.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                Height: 30,
                Width: 400,
                fontSize: 14,
                HoraStartTime: 0,
                HoraEndTime: 0,
                DayStartTime: 0,
                DayEndTime: 0,
                selectedView: 'monthyear',
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

    // Lista de años
    const years = [
        { name: '2020', id: 2020 },
        { name: '2021', id: 2021 },
        { name: '2022', id: 2022 },
        { name: '2023', id: 2023 },
        { name: '2024', id: 2024 },
        { name: '2025', id: 2025 },
        { name: '2026', id: 2026 },
        { name: '2027', id: 2027 },
    ];

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        scope.config.months = months;
        scope.config.years = years;

        scope.timeED = {
            month: null,
            year: null
        };

        scope.yearED = {
            year: null
        };

        scope.search = function() {
            if (scope.config.selectedView === 'monthyear') {
                if (scope.timeED) {
                    var timeED = getStartEndTime(scope.timeED.month, scope.timeED.year, scope.config);
                    if (timeED) {
                        timeProvider.requestNewTime(timeED.startTime, timeED.endTime, true);
                    }
                }
            } else if (scope.config.selectedView === 'year') {
                if (scope.yearED) {
                    var yearED = getFullYearRange(scope.yearED.year, scope.config);
                    if (yearED) {
                        timeProvider.requestNewTime(yearED.startTime, yearED.endTime, true);
                    }
                }
            }
        };

        function getStartEndTime(monthId, year, config) {
            var month = monthId !== null ? parseInt(monthId) : 0;

            if (year < 2018 || year > 2050 || isNaN(year)) {
                year = new Date().getFullYear();
                scope.timeED.year = year;
            }

            var lastDayOfLastMonth = new Date(year, month, 0).getDate();
            var newStartDay = lastDayOfLastMonth + config.DayStartTime;

            var lastDayOfCurrentMonth = new Date(year, month + 1, 0).getDate();
            var newEndDay = lastDayOfCurrentMonth + config.DayEndTime;

            var startTime = new Date(year, month - 1, newStartDay, config.HoraStartTime, 0, 0);
            var endTime = new Date(year, month, newEndDay, config.HoraEndTime, 0, 0);

            return {
                startTime: startTime,
                endTime: endTime
            };
        }

        function getFullYearRange(year, config) {
            var selectedYear = year !== null ? parseInt(year) : new Date().getFullYear();

            // Verificar si el año seleccionado está en la lista permitida
            var isValidYear = years.some(function(allowedYear) {
                return allowedYear.id === selectedYear;
            });

            // Si no es un año válido, seleccionar el año actual por defecto
            if (!isValidYear) {
                selectedYear = new Date().getFullYear();
                scope.yearED.year = selectedYear;
            }

            var lastDayOfLastMonth = new Date(selectedYear, 0, 0).getDate();
            var newStartDay = lastDayOfLastMonth + config.DayStartTime;

            var lastDayOfCurrentMonth = new Date(selectedYear, 11 + 1, 0).getDate();
            var newEndDay = lastDayOfCurrentMonth + config.DayEndTime;

            var startTime = new Date(selectedYear, 0 - 1, newStartDay, config.HoraStartTime, 0, 0);
            var endTime = new Date(selectedYear, 11, newEndDay, config.HoraEndTime, 0, 0);

            return {
                startTime: startTime,
                endTime: endTime
            };
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);