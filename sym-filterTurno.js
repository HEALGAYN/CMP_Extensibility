(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "filterTurno",
        displayName: "Filtro x Turno",
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/search.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                FormatType: null,
                Height: 25,
                Width: 300,
                startShiftA: 20,
                startShiftB: 8
            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'default'
            }];
        },
    }

    const getDay = (timeProvider) => new Date(timeProvider.model.state.serverEndTimeLabel);

    const setOclockTime = (time, hour) => {
        time.setHours(hour);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
    }

    const getWorkShift = (timeProvider, scope) => {
        const currentDay = getDay(timeProvider);
        const shiftA = new Date(currentDay);
        const shiftB = new Date(currentDay);

        setOclockTime(shiftA, scope.config.startShiftA);
        setOclockTime(shiftB, scope.config.startShiftB);

        currentDay <= shiftB || currentDay <= shiftA ?
            shiftA.setDate(shiftA.getDate() - 1) :
            shiftB.setDate(shiftB.getDate() + 1)

        return { shiftA, shiftB }
    }

    const getRangeTime = (selection, workShift) => {
        const range = {}

        range.start = selection == 'B' ?
            new Date(workShift.shiftB).toISOString() :
            new Date(workShift.shiftA).toISOString();

        range.end = selection == 'C' ?
            '+1d' :
            '+12h';

        return range;
    }

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        scope.search = () => {
            if (scope.timeSelection) {
                const workShift = getWorkShift(timeProvider, scope);
                const ranges = getRangeTime(scope.timeSelection, workShift);
                timeProvider.requestNewTime(ranges.start, ranges.end, true);
                scope.timeSelection = undefined;
            }
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);