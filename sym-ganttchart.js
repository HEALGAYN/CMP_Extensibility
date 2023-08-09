(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "ganttchart",
        visObjectType: symbolVis,
        inject: ['webServices', 'timeProvider'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/gantchart.png',
        supportsCollections: true,
        getDefaultConfig: function() {
            return {
                DataQueryMode: PV.Extensibility.Enums.DataQueryMode.ModePlotValues,
                DataShape: "Timeseries",
                FormatType: null,
                Height: 150,
                Width: 400,
                colors: [],
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
    }

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
        const dateCurrent = getNowHour(timeProvider);
        const auxTime = dateCurrent >= new Date() ? dateCurrent : new Date(valArray[index].Time)
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

    const validateSegments = (valArray, segments, index, start, endTime, color, item) => {
        if (index == 0) {
            setFormatSegments(segments, start, endTime, color, item.Value)
        } else {
            if (valArray[index - 1] && item.Value == valArray[index - 1].Value) {
                segments[segments.length - 1].end = endTime;
            } else {
                const start = new Date(item.Time);
                const state = item.Value
                setFormatSegments(segments, start, endTime, color, state);
            }
        };
    }

    const getSegments = (valArray, segments, timeProvider, scope, start) => {
        valArray.forEach((item, index) => {
            const endTime = getLastTime(index, valArray, timeProvider);
            const colorIndex = scope.config.states.findIndex(state => state.Name == item.Value);
            const color = scope.config.colors[colorIndex];
            validateSegments(valArray, segments, index, start, endTime, color, item)
        });
    }

    const setDataSegments = (valArray, start, timeProvider, scope) => {
        const segments = [];
        if (valArray.length > 0) {
            getSegments(valArray, segments, timeProvider, scope, start);
        }
        return segments;
    }

    const getDataProvider = (scope, timeProvider) => {
        const valArray = scope.data.Data[0].Values.length > 0 ? scope.data.Data[0].Values : [];
        const initTurn = new Date(scope.startTime);
        const start = valArray[0] ? new Date(valArray[0].Time) : initTurn;
        const segments = setDataSegments(valArray, start, timeProvider, scope);

        return [{
            "category": "",
            "segments": segments
        }];
    };

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

    const buildChart = (chart, scope, data, container, timeProvider) => {
        if (scope.config.states.length > 0) {
            if (!chart) {
                const chartConfig = getConfig(setLegend(scope), scope);
                chart = AmCharts.makeChart(container.id, chartConfig)
            }
            if (data) {
                scope.data = data;
                scope.startTime = data.Data[0].StartTime;
            }
            chart.dataProvider = getDataProvider(scope, timeProvider);
            chart.validateData();
        }
        return chart;
    }

    symbolVis.prototype.init = function(scope, elem, webServices, timeProvider) {
        setStates(webServices, scope);

        const container = elem.find("#container")[0];
        container.id = "barChart_" + scope.symbol.Name;
        let chart = false;
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = changeUpdate;

        function dataUpdate(data) {
            console.log(data)
            chart = buildChart(chart, scope, data, container, timeProvider);
        }

        function changeUpdate() {
            if (chart) {
                chart = false;
                chart = buildChart(chart, scope, false, container, timeProvider);
            }
        }
    }

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);