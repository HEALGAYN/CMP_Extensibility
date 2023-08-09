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
        typeName: "searchFilter",
        displayName: "Search Filter",
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/search.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                Height: 20,
                Width: 320
            }
        }
    }

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {

        scope.timeED = {
            month: "",
            year: ""
        }

        scope.search = function() {
            var stringTimeED = {
                start: "",
                //"2018-01-02T11:37:38Z",
                end: ""
                    //"2018-02-01T19:37:38Z"
            };
            stringTimeED = getStartEndTime(scope.timeED.month, scope.timeED.year);
            console.log(stringTimeED.startTimeED);
            console.log(stringTimeED.endTimeED);
            timeProvider.requestNewTime(stringTimeED.startTimeED, stringTimeED.endTimeED, true);
            scope.timeED.month = "";
            scope.timeED.year = "";
        }

        function getStartEndTime(month, year) {
            var stringTimeED = {
                startTimeED: null,
                endTimeED: null
            };
            var s = "";
            var e = "";
            if (year < 2020 || year > 2050 || isNaN(year)) {
                year = 2023;
            }
            switch (month) {
                case "ENERO":
                    s = "01";
                    e = "02"
                    break;
                case "FEBRERO":
                    s = "02";
                    e = "03"
                    break;
                case "MARZO":
                    s = "03";
                    e = "04"
                    break;
                case "ABRIL":
                    s = "04";
                    e = "05"
                    break;
                case "MAYO":
                    s = "05";
                    e = "06"
                    break;
                case "JUNIO":
                    s = "06";
                    e = "07"
                    break;
                case "JULIO":
                    s = "07";
                    e = "08"
                    break;
                case "AGOSTO":
                    s = "08";
                    e = "09"
                    break;
                case "SETIEMBRE":
                    s = "09";
                    e = "10"
                    break;
                case "OCTUBRE":
                    s = "10";
                    e = "11"
                    break;
                case "NOVIEMBRE":
                    s = "11";
                    e = "12"
                    break;
                case "DICIEMBRE":
                    s = "12";
                    e = "01"
                    break;
                default:
                    s = "05";
                    e = "06"
            }
            //stringTimeED.startTimeED = year + "-" + s + "-02T04:59:59Z";
            stringTimeED.startTimeED = year + "-" + s + "-01T05:00:00Z";
            if (s == 12) {
                year = year + 1;
            }
            stringTimeED.endTimeED = year + "-" + e + "-01T04:59:59Z";
            return stringTimeED;
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);