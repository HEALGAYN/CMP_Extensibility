(function(CS) {
    'use strict';

    const myCustomSymbolDefinition = {
        typeName: 'tonhora',
        displayName: 'Toneladas vs Target',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        inject: ['timeProvider'],
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barras.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModePlotValues,
                FormatType: null,
                Height: 700,
                Width: 900,
                Intervals: 5000,
                minimumYValue: 0,
                maximumYValue: 100,
                showTitle: false,
                textColor: "black",
                fontSize: 12,
                fontSizeTitle: 14,
                fontSizeAxis: 12,
                fontSizeLegend: 12,
                fontSizeValTon: 12,
                fontSizeValDiff: 12,
                fontSizeValTarget: 12,
                fontSizeBalloon: 12,
                boldTitle: false,
                boldAxis: false,
                barColor1: "#086996",
                barColor2: "green",
                barColor3: "red",
                lineColor: "black",
                showLegend: true,
                legendPosition: "bottom",
                decimalPlaces: 1,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                customTitle: "",
                showLabelTon: false,
                showLabelDiff: false,
                showLabelTarget: false,
                gridColor: "red",
                gridColor1: "red",
                enabledCursor: false,
                minDataPoints: 3,
                useCustomTitle: false,
                lineValue: 20,
                colorTextTon: 'black',
                colorTextDiff: 'red',
                colorTextTarget: 'white',
                colorTitle: 'black',
                colorLegend: 'black',
                colorAxis: 'black',
                loadDays: '*-30d',
                setInterval: '*-1d',
                setInitHour: 8,
                setEndHour: 20,
                setDurationTurn: 12,
                showBulletTarget: true,
                bulletShapeTarget: 'round',
                showBulletTotal: true,
                bulletShapeTotal: 'square',
                showBulletDiff: true,
                bulletShapeDiff: 'diamond',
                bulletSize: 5,
                positionAxis: 'top',
                columnWidth: 0.5,
                typeGraph: 'column',
                isAnimated: false,
                typeLine: "line",
                showBalloon: true
            };
        },
        supportsCollections: true,
        configOptions: function() {
            return [{
                title: 'Editar Formato',
                mode: 'format'
            }];
        }
    };

    const setConfigAxis = (chart, scope) => {
        chart.categoryAxis.fontSize = scope.config.fontSizeAxis;
        chart.categoryAxis.boldLabels = scope.config.boldAxis;
        chart.categoryAxis.color = scope.config.colorAxis;
        chart.categoryAxis.position = scope.config.positionAxis;
    }

    const setConfigLegend = (chart, scope) => {
        chart.legend.fontSize = scope.config.fontSizeLegend;
        chart.legend.position = scope.config.legendPosition;
        chart.legend.enabled = scope.config.showLegend;
        chart.legend.color = scope.config.colorLegend;
    }

    const setBallonText = (graph, scope) => {
        graph.balloonText = scope.config.showBalloon ?
            (`<span style='font-size:${scope.config.fontSizeBalloon}px'><b>[[etTime]]</b></br>Tonelaje: <b style='color:${scope.config.colorTextTon}'>[[et1]]</b></br> Diferencia: <b style='color:${scope.config.colorTextDiff}'>[[et3]]</b></br> Target: <b style='color:${scope.config.colorTextTarget}'>[[et2]]</b> </span>`) :
            ''
    }

    const setConfigGraphs = (chart, scope) => {
        chart.graphs[0].bullet = scope.config.showBulletTotal ? scope.config.bulletShapeTotal : null;
        chart.graphs[0].bulletSize = scope.config.bulletSize;
        chart.graphs[0].lineColor = scope.config.barColor1;
        chart.graphs[0].fillColors = scope.config.barColor1;
        chart.graphs[0].labelText = scope.config.showLabelTon ? "[[et1]]" : null;
        chart.graphs[0].fontSize = scope.config.fontSizeValTon;
        chart.graphs[0].title = 'Tonelaje';
        chart.graphs[0].color = scope.config.colorTextTon;
        chart.graphs[0].columnWidth = scope.config.columnWidth;
        chart.graphs[0].type = scope.config.typeGraph;

        chart.graphs[1].bullet = scope.config.showBulletDiff ? scope.config.bulletShapeDiff : null;
        chart.graphs[1].bulletSize = scope.config.bulletSize;
        chart.graphs[1].lineColor = scope.config.barColor2;
        chart.graphs[1].fillColors = scope.config.barColor3;
        chart.graphs[1].negativeFillColors = scope.config.barColor3;
        chart.graphs[1].negativeLineColor = scope.config.barColor3;
        chart.graphs[1].labelText = scope.config.showLabelDiff ? "[[et3]]" : null;
        chart.graphs[1].fontSize = scope.config.fontSizeValDiff;
        chart.graphs[1].title = "Diferencia";
        chart.graphs[1].color = scope.config.colorTextDiff;
        chart.graphs[1].columnWidth = scope.config.columnWidth - 0.02;
        chart.graphs[1].type = scope.config.typeGraph;

        chart.graphs[2].bullet = scope.config.showBulletTarget ? scope.config.bulletShapeTarget : null;
        chart.graphs[2].bulletSize = scope.config.bulletSize;
        chart.graphs[2].bulletSize = scope.config.bulletSize;
        chart.graphs[2].lineColor = scope.config.lineColor;
        chart.graphs[2].labelText = scope.config.showLabelTarget ? "[[et2]]" : null;
        chart.graphs[2].fontSize = scope.config.fontSizeValTarget;
        chart.graphs[2].title = "Target";
        chart.graphs[2].color = scope.config.colorTextTarget;
        chart.graphs[2].type = scope.config.typeLine;

        setBallonText(chart.graphs[0], scope);
        setBallonText(chart.graphs[1], scope);
        setBallonText(chart.graphs[2], scope);
    }

    const setConfigTitle = (chart, scope) => {
        chart.titles[0].text = scope.config.customTitle;
        chart.titles[0].size = scope.config.fontSizeTitle;
        chart.titles[0].bold = scope.config.boldTitle;
        chart.titles[0].color = scope.config.colorTitle;
    }

    const setConfigChart = (chart, scope) => {
        chart.addClassNames = scope.config.isAnimated,
            chart.precision = scope.config.decimalPlaces;
        chart.decimalSeparator = scope.config.decimalSeparator;
        chart.thousandsSeparator = scope.config.thousandsSeparator;
        chart.fontSize = scope.config.fontSize;
        setConfigTitle(chart, scope);
        setConfigAxis(chart, scope);
        setConfigLegend(chart, scope);
        setConfigGraphs(chart, scope);
        chart.validateData();
        chart.validateNow();
    };

    const getNewChart = (scope, symbolContainerDiv, dataArray) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "hideCredits": true,
            "type": "serial",
            "dataProvider": dataArray,
            "categoryField": "timestamp",
            "dateFormat": "HH",
            "theme": "none",
            "categoryAxis": {
                "minPeriod": "hh",
                "gridPosition": "start",
                "position": "left",
                "gridAlpha": 0,
                "includeAllValues": true,
                "labelsEnabled ": true,
                "format": 'JJ:NN',
                "labelOffset": true,
            },
            "graphs": [{
                    "id": "AmGraph-1",
                    "type": "column",
                    "fillAlphas": 0.9,
                    "lineAlpha": 1,
                    "valueField": "value1",
                    "labelPosition": "top",
                },
                {
                    "id": "AmGraph-2",
                    "closeField": "value3",
                    "lineAlpha": 0.8,
                    "fillAlphas": 0.9,
                    "openField": "value2",
                    "clustered": false,
                    "type": "column",
                    "valueField": "value1",
                    "fontSize": 10,
                    "labelPosition": "bottom",
                    "lineColorField": "lineColor",
                    "fillColorsField": "lineColor"
                },
                {
                    "id": "AmLine-1",
                    "type": "line",
                    "lineThickness": 3,
                    "bullet": "round",
                    "bulletColor": "#FFFFFF",
                    "useLineColorForBulletBorder": true,
                    "bulletBorderThickness": 3,
                    "valueField": "value2",
                    "animationPlayed": true,
                    "labelPosition": "bottom",
                }
            ],
            "valueAxes": [{
                "id": "ValueAxis-1",
                "axisAlpha": 0,
                "position": "left",
                "gridAlpha": 0,
                "labelsEnabled": false,
            }],
            "legend": {
                "equalWidths": false,
                "valueAlign": "right",
                "horizontalGap": 10,
                "useGraphSettings": true,
                "markerSize": 10
            },
            "titles": [{
                "id": "Title-1",
            }],
        });
        setConfigChart(chart, scope);
        return chart;
    }

    const setOClockTime = (time, hour) => {
        time.setHours(hour);
        time.setMinutes(0);
        time.setSeconds(0);
    }

    const getNumber = (displayValue, scope) => {
        const formatter = {
            precision: scope.config.decimalPlaces,
            decimalSeparator: scope.config.decimalSeparator,
            thousandsSeparator: scope.config.thousandsSeparator
        };
        return AmCharts.formatNumber(displayValue, formatter, scope.config.decimalPlaces);
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

    const setHourLegible = (time) => {
        return `${time.getHours()}:00`
    }

    const getData = (scope, initTurn, endTurn) => {
        const iterateDay = new Date(initTurn);
        const data = scope.dataLoaded;
        const provider = [];

        while (iterateDay.getTime() < endTurn.getTime()) {
            const value1 = getFilterValues(data.Data[0].Values, iterateDay);
            const value2 = getFilterValues(data.Data[1].Values, iterateDay);
            const value3 = value1 - value2;

            const newDataObject = {
                "timestamp": setHourLegible(new Date(iterateDay)),
                "etTime": new Date(iterateDay).toLocaleString(),
                "value1": value1,
                "et1": getNumber(value1, scope),
                "value2": value2,
                "et2": getNumber(value2, scope),
                "diferencia": value3,
                "et3": getNumber(value3, scope),
                "lineColor": value3 >= 0 ? scope.config.barColor2 : scope.config.barColor3
            };
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

    const loadDays = (timeProvider, days) => {
        timeProvider.requestNewTime(days, '*', true);
    };

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
            chart.dataProvider = getDataProvider(scope, timeProvider);
            chart.validateData();
            chart.validateNow();
            scope.isChangedData = false;
            scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        }
    }

    const buildChart = (chart, data, scope, timeProvider, symbolContainerDiv) => {
        scope.data = data;

        if (!chart) {
            scope.dataLoaded = data;
            const dataArray = getDataProvider(scope, timeProvider);
            chart = getNewChart(scope, symbolContainerDiv, dataArray);
            loadDays(timeProvider, scope.config.setInterval);
        }
        archiveData(scope, timeProvider);
        haveChanges(scope, chart, timeProvider);

        return chart;
    }

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);

    symbolVis.prototype.init = function(scope, elem, timeProvider) {

        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configurationChange;

        let chart = false;
        const symbolContainerDiv = elem.find('#container')[0];
        symbolContainerDiv.id = "TonHours" + scope.symbol.Name;
        loadDays(timeProvider, scope.config.loadDays);
        scope.lastTimeProviderEnd = timeProvider.displayTime.end;
        scope.isChangedData = false;

        function dataUpdate(data) {
            if (data.Data.length > 1) {
                chart = buildChart(chart, data, scope, timeProvider, symbolContainerDiv);
            }
        }

        function configurationChange() {
            if (chart) {
                scope.isChangedData = true;
                setConfigChart(chart, scope);
                haveChanges(scope, chart, timeProvider);
            }
        }
    };

    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);