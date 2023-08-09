(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "filterSeleccion",
        displayName: "Filter x Selección",
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['timeProvider', '$interval'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                FormatType: null,
                Height: 25,
                Width: 480,
                startTurnA: 20,
                startTurnB: 8,

            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'default'
            }];
        },
    }

    const monthlyArray = [{
            month: 'Enero',
            trim: '1ero'
        },
        {
            month: 'Febrero',
            trim: '1ero'
        },
        {
            month: 'Marzo',
            trim: '1ero'
        },
        {
            month: 'Abril',
            trim: '2ndo'
        },
        {
            month: 'Mayo',
            trim: '2ndo'
        },
        {
            month: 'Junio',
            trim: '2ndo'
        },
        {
            month: 'Julio',
            trim: '3ero'
        }, {
            month: 'Agosto',
            trim: '3ero'
        },
        {
            month: 'Setiembre',
            trim: '3ero'
        },
        {
            month: 'Octubre',
            trim: '4rto'
        },
        {
            month: 'Noviembre',
            trim: '4rto'
        },
        {
            month: 'Diciembre',
            trim: '4rto'
        }
    ];

    const trimArray = [
        { start: 0, end: 2, name: '1ero' },
        { start: 3, end: 5, name: '2ndo' },
        { start: 6, end: 8, name: '3ero' },
        { start: 9, end: 11, name: '4rto' },
    ];

    const setOclockTime = (time, hour) => {
        time.setHours(hour);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
    }

    const getWorkShift = (currentDay, scope) => {
        const shiftA = new Date(currentDay);
        const shiftB = new Date(currentDay);

        setOclockTime(shiftA, scope.config.startTurnA);
        setOclockTime(shiftB, scope.config.startTurnB);

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
        console.log(range);
        return range;
    }

    const getCurrentDate = (timeProvider) => {
        return timeProvider.displayTime.end.includes('*') || timeProvider.displayTime.end.includes('+') ?
            new Date() :
            new Date(timeProvider.displayTime.end);
    }

    const setShift = (currentDate, scope, timeProvider, haveSelection) => {
        const workShift = getWorkShift(currentDate, scope);
        console.log(workShift);
        if (!haveSelection) scope.timeSelection = currentDate <= workShift.shiftB ? 'A' : 'B';
        const ranges = getRangeTime(scope.timeSelection, workShift);
        timeProvider.requestNewTime(ranges.start, ranges.end, true);
    }

    const setRangeDates = (timeProvider, scope, start, end) => {
        start.setDate(0);
        end.setDate(0);

        setOclockTime(start, scope.config.startTurnA);
        setOclockTime(end, scope.config.startTurnA);

        timeProvider.requestNewTime(start.toISOString(), end.toISOString(), true);
    }

    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        scope.config.monthlyArray = monthlyArray;
        scope.config.trimArray = trimArray;

        const currentDate = getCurrentDate(timeProvider);
        setShift(currentDate, scope, timeProvider, false);

        scope.month = monthlyArray[currentDate.getMonth()].month;
        scope.trim = monthlyArray[currentDate.getMonth()].trim;


        scope.search = () => {
            if (scope.timeSelection) {
                const currentDay = getCurrentDate(timeProvider);
                setShift(currentDay, scope, timeProvider, true);
            }
        }

        scope.searchTrim = (index) => {
            const startTrim = new Date(currentDate.setMonth(trimArray[index].start));
            const endTrim = new Date(currentDate.setMonth(trimArray[index].end + 1));
            setRangeDates(timeProvider, scope, startTrim, endTrim);
            const indexMonth = startTrim.getMonth() + 1 > 11 ? 0 : startTrim.getMonth() + 1;
            scope.month = monthlyArray[indexMonth].month;
        }

        scope.searchMonth = (index) => {
            const startMonth = new Date(currentDate.setMonth(index));
            const endMonth = new Date(currentDate.setMonth(index + 1));
            setRangeDates(timeProvider, scope, startMonth, endMonth);
            scope.trim = monthlyArray[index].trim;
        }
    }

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);