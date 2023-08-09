//************************************
// Begin defining a new symbol
/*
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(PV) {
    "use strict";

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "filtroMes",
        displayName: "filtro por Mes",
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/search.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                Height: 20,
                Width: 320,
                fontSize: 14
            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'default'
            }];
        },
    }

    //lIST OF MONTHS
    const listMounths = [{
            month: 'Enero',
            id: 0,
        },
        {
            month: 'Febrero',
            id: 1,
        },
        {
            month: 'Marzo',
            id: 2,
        },
        {
            month: 'Abril',
            id: 3,
        },
        {
            month: 'Mayo',
            id: 4,
        },
        {
            month: 'Junio',
            id: 5,
        },
        {
            month: 'Julio',
            id: 6,
        }, {
            month: 'Agosto',
            id: 7,
        },
        {
            month: 'Setiembre',
            id: 8,
        },
        {
            month: 'Octubre',
            id: 9,
        },
        {
            month: 'Noviembre',
            id: 10,
        },
        {
            month: 'Diciembre',
            id: 11,
        }
    ];

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        scope.config.listMounths = listMounths;

        scope.timeED = {
            month: "",
            year: ""
        }

        scope.search = function() {
            var stringTimeED = {
                start: "", //"2018-01-02T11:37:38Z",
                end: "" //"2018-02-01T19:37:38Z"
            };
            stringTimeED = getStartEndTime(scope.timeED.month, scope.timeED.year);
            // console.log("ST: ", stringTimeED.startTimeED);
            // console.log("ED: ", stringTimeED.endTimeED);
            timeProvider.requestNewTime(stringTimeED.startTimeED, stringTimeED.endTimeED, true);
        }

        function getStartEndTime(monthIn, year) {
            var month = parseInt(monthIn);
            var stringTimeED = {
                startTimeED: null,
                endTimeED: null
            };

            if (year < 2018 || year > 2050 || isNaN(year)) {
                year = new Date(Date.now()).getFullYear();
                scope.timeED.year = year;
            }

            //es el último día del mes actual a las 08:00pm
            var lastDay = new Date(year, month + 1, 0, 19, 59, 59);
            //1er dia del mes es el último día del mes anterior a las 8:00 pm        
            var firstDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), 0, 20, 0, 0);
            stringTimeED.startTimeED = formatDate(firstDay);
            stringTimeED.endTimeED = formatDate(lastDay);
            return stringTimeED;
        }

        function formatDate(date) {
            // Time format "06/04/2023 00:00:00"
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            return year + '-' +
                (month < 10 ? '0' + month : month) + '-' +
                (day < 10 ? '0' + day : day) + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second);

        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);