(function(BS) {
    function symbolVis() {}
    BS.deriveVisualizationFromBase(symbolVis);

    const myCustomSymbolDefinition = {
        typeName: 'gaviotaV3',
        displayName: 'Gaviota V3',
        datasourceBehavior: BS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        inject: ['timeProvider'],
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/cmp_gaviota.png',
        supportsCollections: true,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                FormatType: null,
                Height: 500,
                Width: 1000,
                fontSize: 14,
                fontSizeAxis: 14,
                fontSizeValues: 12,
                fontSizeBalloon: 14,
                customTitle: '',
                colorTitle: 'black',
                fontSizeTitle: 18,
                boldTitel: 'false',
                boldAxis: 'false',
                lineColor: 'black',
                lineColorTargetH: 'yellow',
                lineColorTargetHH: 'red',
                lineThickness: 5,
                colorTextAxis: 'black',
                colorTextValues: 'black',
                colorCursor: 'grey',
                legendTitle: 'Total',
                bulletSize: 5,
                bulletEnabled: false,
                loadDays: '*-30d',
                setInterval: '*-1d',
                shape: 'round',
                isAnimated: true,
                legendEnabled: true,
                targetHigh: 0,
                targetHHigh: 0,
                hiddenTHigh: false,
                hiddenTHiHi: false,
                targetThickness: 1.5,
                typeLine: "line",
                showAllValueLabels: false,
                enabledCursor: false,
                decimalPlaces: 1,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                setInitHour: 8,
                setEndHour: 20,
            };
        },

        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    const setConfigChart = (chart, scope) => {
        chart.addClassNames = scope.config.isAnimated,
            chart.precision = scope.config.decimalPlaces;
        chart.decimalSeparator = scope.config.decimalSeparator || ',',
            chart.thousandsSeparator = scope.config.thousandsSeparator || '.',
            chart.titles = createChartTitles(scope);
        chart.legend.enabled = scope.config.legendEnabled;
        setConfigAxis(chart.categoryAxis, scope);
        setConfigGraphs(chart.graphs[0], scope);
        setConfigTarget(chart.graphs[1], scope.config.lineColorTargetH, scope.config.hiddenTHigh, scope.config.targetThickness);
        setConfigTarget(chart.graphs[2], scope.config.lineColorTargetHH, scope.config.hiddenTHiHi, scope.config.targetThickness);
        setConfigValueAxes(chart.valueAxes[0], scope);
        chart.validateData();
        chart.validateNow();
    }

    const setConfigAxis = (axis, scope) => {
        axis.fontSize = scope.config.fontSizeAxis;
        axis.boldLabels = scope.config.boldAxis;
        axis.color = scope.config.colorTextAxis;
    }

    const setConfigTarget = (graph, LineColor, isHidden, thickness) => {
        graph.lineColor = LineColor;
        graph.hidden = !isHidden;
        graph.lineThickness = thickness
    }

    const setConfigGraphs = (graph, scope) => {
        graph.lineColor = scope.config.lineColor;
        graph.color = scope.config.colorTextValues;
        graph.labelText = scope.config.showAllValueLabels ? "[[value]]" : null;
        graph.fontSize = scope.config.fontSizeValues;
        graph.bullet = scope.config.bulletEnabled ? scope.config.shape : null;
        graph.bulletSize = scope.config.bulletSize;
        graph.title = scope.config.legendTitle;
        graph.lineThickness = scope.config.lineThickness;
        graph.type = scope.config.typeLine;
        graph.balloonText = scope.config.enabledCursor ? (
            `<span style='color:[[color]]'>[[category]]</span><br><b style='font-size:${scope.config.fontSizeBalloon}px;color:${scope.config.colorTextValues}'>[[value]]</b>`
        ) : '';
    }

    const setConfigValueAxes = (axes, scope) => {
        axes.fontSize = scope.config.fontSizeAxis;
        axes.color = scope.config.colorTextAxis;
        axes.boldLabels = scope.config.boldAxis;
    }

    const getNewChart = (scope, symbolContainerDiv, dataArray) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "type": "serial",
            "theme": "none",
            "hideCredits": true,
            "dataProvider": dataArray,
            "dataDateFormat": "HH",
            "startDuration": 0.3,
            "graphs": [{
                "id": "g1",
                "showAllValueLabels": true,
                "valueField": "value",
                "animationPlayed": true
            }, {
                "id": "g2",
                "title": "High",
                "valueField": "high",
                "animationPlayed": true
            }, {
                "id": "g3",
                "title": "Hi-Hi",
                "valueField": "hHigh",
                "animationPlayed": true
            }],
            "valueAxes": [{
                "axisAlpha": 0.5,
                "gridAlpha": 0,
                "position": "left"
            }],
            "categoryField": "hour",
            "categoryAxis": {
                "period": 'hh',
                "format": 'JJ:NN',
                "axisAlpha": 0.5,
                "gridAlpha": 0,
                "tickLength": 0
            },
            "legend": {
                "bulletType": "round",
                "equalWidths": true,
                "valueWidth": 50,
                "useGraphSettings": true,
            }
        });
        setConfigChart(chart, scope);
        return chart;
    }

    const createChartTitles = (scope) => {
        return [{
            "text": scope.config.customTitle,
            "size": scope.config.fontSizeTitle,
            "color": scope.config.colorTitle,
            "bold": scope.config.boldTitle
        }];
    }

    const loadDays = (timeProvider, days) => {
        timeProvider.requestNewTime(days, "*", true);
    };

    const setHourLegible = (time) => {
        return `${time.getHours()}:00`
    }

    const setOClockTime = (time, hour) => {
        time.setHours(hour);
        time.setMinutes(0);
        time.setSeconds(0);
    }

    const generateData = (valueData, iterateDay, scope) => {
        return {
            hour: setHourLegible(new Date(iterateDay)),
            value: valueData,
            high: scope.config.targetHigh,
            hHigh: scope.config.targetHHigh
        };
    }

    const getValues = (possibleValues) => possibleValues[0] ? possibleValues[0].Value : '';

    const getFilterValues = (dataValues, iterateDay) => {
        const possibleValues = dataValues.filter(
            item => iterateDay.getDate() == new Date(item.Time).getDate() &&
            iterateDay.getHours() == new Date(item.Time).getHours() &&
            iterateDay.getMonth() == new Date(item.Time).getMonth()
        );
        return getValues(possibleValues);
    }
    const getData = (scope, initTurn, endTurn) => {
        const iterateDay = new Date(initTurn);
        const data = scope.dataLoaded;
        const provider = [];

        while (iterateDay.getTime() < endTurn.getTime()) {
            const value = getFilterValues(data.Data[0].Values, iterateDay);
            const newDataObject = generateData(value, iterateDay, scope);
            provider.push(newDataObject);
            iterateDay.setHours(iterateDay.getHours() + 1);
        }

        return provider;
    }

    const getNowHour = (timeProvider) => timeProvider.displayTime.end.includes('*') ? new Date() : new Date(timeProvider.displayTime.end);

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
        return getData(scope, initTurn, endTurn);
    }


    const setTargets = (scope, data) => {
        scope.config.targetHigh = data.Data[2] ? data.Data[2].Values.at(-1).Value : scope.config.targetHigh;
        scope.config.targetHHigh = data.Data[3] ? data.Data[3].Values.at(-1).Value : scope.config.targetHHigh;
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
        if (scope.isChangedData || scope.lastTimeProviderEnd != timeProvider.displayTime.end) {
            setTargets(scope, scope.data);
            chart.dataProvider = getDataProvider(scope, timeProvider);
            chart.validateData();
            chart.validateNow();
            scope.isChangedData = false;
            scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        }
    }

    const buildChart = (chart, scope, timeProvider, symbolContainerDiv) => {
        if (!chart) {
            setTargets(scope, scope.data);
            scope.dataLoaded = scope.data;
            const dataArray = getDataProvider(scope, timeProvider);
            chart = getNewChart(scope, symbolContainerDiv, dataArray);
            loadDays(timeProvider, scope.config.setInterval);
        }
        archiveData(scope, timeProvider);
        haveChanges(scope, chart, timeProvider);
        return chart;
    }

    symbolVis.prototype.init = function(scope, element, timeProvider) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChange;
        let chart = false;
        const symbolContainerDiv = element.find('#container')[0];
        symbolContainerDiv.id = "amChart_" + scope.symbol.Name;
        loadDays(timeProvider, scope.config.loadDays);
        scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        scope.isChangedData = false;

        function dataUpdate(data) {
            scope.data = data;
            if (data.Data[0].Values.length > 0) {
                chart = buildChart(chart, scope, timeProvider, symbolContainerDiv);
            }
        };

        function configChange(data) {
            if (chart) {
                chart = false
                chart = buildChart(chart, scope, timeProvider, symbolContainerDiv);
                chart.validateData();
                chart.validateNow();
            };
        }
    };

    BS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);