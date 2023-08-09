//Graph whit interval the time 
//
(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "ganttchartv2",
        DisplayName: "Graphic Gantt v2",
        visObjectType: symbolVis,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/gantchart.png',
        inject: ['webServices', 'timeProvider'],
        supportsCollections: true,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        getDefaultConfig: function() {
            return {
                DataShape: "Timeseries",
                FormatType: null,
                Height: 150,
                Width: 400,
                colors: [],
                loadDays: '-7d',
                setInitHour: 8,
                setEndHour: 8,
                setInterval: '-1d',
                fontSizeLegend: 12,
                showLegend: false,
                markerSize: 12,
                fontSizeBalloon: 12,
                fontSizeAxis: 10,
                colorTextBalloon: 'black',
                colorTextLegend: 'black',
                colorAxis: 'black'
            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'default'
            }];
        },

    };

    const getConfig = (legend, scope) => {
        return {
            "type": "gantt",
            "hideCredits": true,
            "theme": "light",
            "marginRight": 70,
            "period": "ss",
            "dataDateFormat": "HH",
            "columnWidth": 0.5,
            "valueAxis": {
                "type": "date",
                "minPeriod": "ss",
                "ignoreAxisWidth": true,
                "labelEnabled": true,
                "color": scope.config.colorAxis,
                "fontSize": scope.config.fontSizeAxis
            },
            "graph": {
                "lineAlpha": 0,
                "lineColor": "#fff",
                "fillAlphas": 0.85,
                "balloonText": `<b style='font-size:${scope.config.fontSizeBalloon}px; color:${scope.config.colorTextBalloon}'>[[state]]<br/>[[hStart]] - [[hEnd]]`
            },
            "rotate": true,
            "categoryField": "category",
            "segmentsField": "segments",
            "colorField": "color",
            "startDateField": "start",
            "endDateField": "end",
            "dataProvider": "",
            "legend": legend
        }
    };

    const setColors = (scope) => {
        const iterations = scope.config.states.length;
        if (scope.config.colors.length == 0) {
            for (let i = 0; i < iterations; i++) {
                scope.config.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
            }
        }
    };

    const setStates = (webServices, scope) => {
        webServices.getDefaultStates(scope.symbol.DataSources[0]).promise.then((response) => {
            scope.config.states = response.data.States;
            setColors(scope);
        });
    };

    const getNowHour = (timeProvider) => {
        return timeProvider.displayTime.end.includes('*') || new Date(timeProvider.displayTime.end) >= new Date() ?
            new Date() :
            new Date(timeProvider.displayTime.end);
    }

    const getLastTime = (index, valArray, timeProvider) => {
        const dataCurrent = getNowHour(timeProvider);
        const auxTime = dataCurrent >= new Date() ? dataCurrent : new Date(valArray[index].Time)
        return index == valArray.length - 1 ?
            auxTime :
            new Date(valArray[index + 1].Time);
    }

    const getHoursPeriod = (time) => `${new Date(time).toLocaleDateString()} ${time.getHours()}:${time.getMinutes() < 10 ? '0'+ time.getMinutes() : time.getMinutes() }`


    const setFormatSegments = (segments, start, end, color, state) => {
        segments.push({
            "start": start,
            "end": end,
            "color": color,
            "state": state,
            "hStart": getHoursPeriod(start),
            "hEnd": getHoursPeriod(end)
        })
    }

    const getSegments = (valArray, segments, timeProvider, scope, initTurn) => {
        valArray.forEach((item, index) => {
            const endTime = getLastTime(index, valArray, timeProvider);
            const colorIndex = scope.config.states.findIndex(state => state.Name == item.Value);
            const color = scope.config.colors[colorIndex];
            if (index == 0) { setFormatSegments(segments, initTurn, endTime, color, item.Value) } else {
                if (valArray[index - 1] && item.Value == valArray[index - 1].Value) {
                    segments[segments.length - 1].end = endTime;
                } else {
                    const start = new Date(item.Time);
                    const state = item.Value
                    setFormatSegments(segments, start, endTime, color, state);
                }
            };
        });
    }

    const convertToChartDataFormat = (data, scope, initTurn, endTurn, timeProvider) => {
        const valArray = data;
        const segments = [];

        setFormatSegments(segments, initTurn, endTurn, 'transparent', '');
        if (valArray.length > 0) getSegments(valArray, segments, timeProvider, scope, initTurn);

        if (segments.at(-1).end < endTurn) {
            setFormatSegments(segments, segments.at(-1).end, endTurn, 'transparent', '');
        }
        return [{
            "category": "",
            "segments": segments
        }];

    };

    const getFirstOfDay = (scope, initTurn) => {
        const values = scope.dataLoaded.Data[0].Values.filter(
            item => new Date(item.Time).getTime() <= initTurn.getTime()
        )
        return values.at(-1) ? values.at(-1) : {};
    }

    const getData = (scope, initTurn, endTurn, timeProvider) => {
        const firstofDay = getFirstOfDay(scope, initTurn);
        const dataValues = scope.dataLoaded.Data[0].Values.filter(
            item => new Date(item.Time).getTime() >= initTurn.getTime() &&
            new Date(item.Time).getTime() <= endTurn.getTime()
        )
        dataValues.unshift(firstofDay);
        return convertToChartDataFormat(dataValues, scope, initTurn, endTurn, timeProvider);
    }

    const setOClockTime = (time, hour) => {
        time.setHours(hour);
        time.setMinutes(0);
        time.setSeconds(0);
    }

    const getDataProvider = (scope, timeProvider) => {

        const endTurn = getNowHour(timeProvider);
        const initTurn = new Date(endTurn);

        const startTurnA = new Date(endTurn);
        const startTurnB = new Date(endTurn);

        setOClockTime(startTurnA, scope.config.setInitHour);
        setOClockTime(startTurnB, scope.config.setEndHour);

        if (startTurnA < endTurn && endTurn < startTurnB) {
            setOClockTime(initTurn, scope.config.setInitHour);
            setOClockTime(endTurn, scope.config.setEndHour);
        } else {
            endTurn < startTurnA ?
                initTurn.setDate(initTurn.getDate() - 1) :
                endTurn.setDate(endTurn.getDate() + 1);
            setOClockTime(initTurn, scope.config.setEndHour);
            setOClockTime(endTurn, scope.config.setInitHour);
        }
        scope.endTurn = endTurn;
        return getData(scope, initTurn, endTurn, timeProvider);
    }

    const archiveData = (scope, timeProvider) => {
        if (timeProvider.displayTime.end == '*') {
            let i = 0;
            const limit = scope.dataLoaded.Data.length;
            for (i = 0; i < limit; i++) {
                if (scope.data.Data[i].Values.at(-1).Time != scope.dataLoaded.Data[i].Values.at(-1).Time) {
                    scope.dataLoaded.Data[i].Values.push(scope.data.Data[i].Values.at(-1));
                    scope.isChangedData = true;
                }
            }
        }
    }

    const haveChanges = (scope, chart, timeProvider) => {
        if (scope.endTurn <= new Date()) scope.isChangedData = true;
        if (scope.isChangedData || scope.lastTimeProviderEnd != timeProvider.displayTime.end) {
            chart.dataProvider = getDataProvider(scope, timeProvider);
            chart.validateData();
            scope.isChangedData = false;
            scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        }
    }

    const setLegend = (scope) => {
        const legend = [];
        scope.config.states.forEach((item, index) => {
            legend.push({
                "title": item.Name,
                "color": scope.config.colors[index]
            });
        })

        return {
            "data": legend,
            "fontSize": scope.config.fontSizeLegend,
            "enabled": scope.config.showLegend,
            "markerSize": scope.config.markerSize,
            "color": scope.config.colorTextLegend
        }
    }

    const buildChart = (scope, chart, containerDiv, timeProvider) => {
        if (!scope.config.states.length > 0) return;
        if (!chart) {
            const chartConfig = getConfig(setLegend(scope), scope);
            scope.dataLoaded = scope.data;
            loadDays(timeProvider, scope.config.setInterval);
            chart = AmCharts.makeChart(containerDiv.id, chartConfig);
            chart.dataProvider = getDataProvider(scope, timeProvider);
            chart.validateData();
        }
        chart.dataProvider[0].segments[chart.dataProvider[0].segments.length - 2].end = new Date();
        archiveData(scope, timeProvider);
        haveChanges(scope, chart, timeProvider);
        return chart;
    }

    const loadDays = (timeProvider, days) => timeProvider.requestNewTime(days, '*');

    symbolVis.prototype.init = function(scope, elem, webServices, timeProvider) {
        setStates(webServices, scope);
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = changeUpdate;

        const containerDiv = elem.find("#container")[0];
        containerDiv.id = "gantt_" + scope.symbol.Name;

        let chart = false;

        loadDays(timeProvider, scope.config.loadDays);
        scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        scope.isChangedData = false;
        scope.endTurn = new Date();

        function dataUpdate(data) {
            scope.data = data;
            if (data.Data[0].Values.length > 0) {
                chart = buildChart(scope, chart, containerDiv, timeProvider);
            }
        }

        function changeUpdate() {
            if (chart) {
                chart = false;
                chart = buildChart(scope, chart, containerDiv, timeProvider);
            }
        }
    }

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);