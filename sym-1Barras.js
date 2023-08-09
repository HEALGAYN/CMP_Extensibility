(function(CS) {
    'use strict';

    const definition = {
        typeName: '1Barras',
        displayName: '1 Barras vs Target',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barras.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                Height: 350,
                Width: 450,
                Intervals: 1000,
                enabledCursor: true,
                colors: ['#086996', '#ff0000'],
                showTitle: false,
                boldTitle: true,
                fontSizeTitle: 14,
                title: "Gráfico Barras",
                colorTitle: 'black',
                textColor: 'black',
                fontSize: 12,
                axisTextColor: 'black',
                axisColor: 'black',
                gridColor: 'transparent',
                gridAlpha: 0,
                colorLegend: 'black',
                showLegend: true,
                alignLegend: 'center',
                legendPosition: 'bottom',
                fontSizeLegend: 12,
                arrays: [true, true],
                decimalPlaces: 1,
                showValues: true,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                columnWidth: 0.3
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

    const setTitle = (title, scope) => {
        title.enabled = scope.config.showTitle;
        title.text = scope.config.title;
        title.size = scope.config.fontSizeTitle;
        title.color = scope.config.colorTitle;
        title.bold = scope.config.boldTitle;
    }

    const setLegend = (chart, scope) => {
        const dataLegend = [];

        scope.config.labels.forEach((label, index) => {
            dataLegend.push({ 'title': label, 'color': scope.config.colors[index] })
        });

        chart.legend.data = dataLegend;
        chart.legend.fontSize = scope.config.fontSizeLegend;
        chart.legend.position = scope.config.legendPosition;
        chart.legend.enabled = scope.config.showLegend;
        chart.legend.align = scope.config.alignLegend;
        chart.legend.color = scope.config.colorLegend;
    }

    const configAxis = (axis, scope) => {
        axis.color = scope.config.axisTextColor;
        axis.axisColor = scope.config.axisColor;
        axis.gridColor = scope.config.gridColor;
        axis.gridAlpha = scope.config.gridAlpha;
    }

    const configGraph = (graph, scope, index) => {

        graph.balloonText = "[[category]]<br><b><span style='font-size:14px;'>value: [[value]]</span></b>";
        graph.lineColor = scope.config.colors[index];
        graph.title = scope.config.labels[index];
        graph.labelText = scope.config.arrays[index] ? "[[value]]" : '';
        graph.showAllValueLabels = scope.config.showValues;
        graph.fontSize = scope.config.fontSize;
        graph.color = scope.config.textColor;
    }

    const setConfig = (chart, scope) => {
        setTitle(chart.titles[0], scope);
        setLegend(chart, scope);
        configAxis(chart.categoryAxis, scope);
        configAxis(chart.valueAxes[0], scope);
        configGraph(chart.graphs[0], scope, 1);
        configGraph(chart.graphs[1], scope, 0);
        chart.graphs[1].columnWidth = scope.config.columnWidth;
        chart.precision = scope.config.decimalPlaces;
        chart.decimalSeparator = scope.config.decimalSeparator || ',';
        chart.thousandsSeparator = scope.config.thousandsSeparator || '.';
    }

    const buildChart = (container, scope, dataArray) => {
        const chart = AmCharts.makeChart(container.id, {
            "hideCredits": true,
            "type": "serial",
            "categoryField": "timestamp",
            "dateFormat": "MM-DD HH:NN:SS",
            "plotAreaBorderAlpha": 0,
            "marginLeft": 0,
            "marginBottom": 0,
            "categoryAxis": {
                "minPeriod": "MM",
                "parseDates": true,
                "gridPosition": "start",
                "position": "left",
            },
            "balloon": {
                "fixedPosition": true,
            },
            "graphs": [{
                "id": "g0",
                "fillAlphas": 0.8,
                "bullet": 'round',
                "bulletSize": 0,
                "lineAlpha": 0.5,
                "valueField": "value2",
            }, {
                "fillAlphas": 1,
                "id": "g1",
                "type": "column",
                "valueField": "value1",
            }],
            "valueAxes": [{
                "id": "ValueAxis-1",
            }],
            "legend": {
                "equalWidths": false,
                "horizontalGap": 10,
                "markerSize": 10,
            },
            "titles": [{
                "id": "title",
                "size": 15,
                "text": "Real x Target",
            }],
            "dataProvider": dataArray,
        });
        setConfig(chart, scope);
        chart.validateData();
        chart.validateNow();
        return chart;
    }

    const getUnits = (scope) => {
        scope.units = []
        scope.data.Data.map(data => scope.units.push(data.Units || ''));
    }

    const getLabels = (scope) => {
        if (scope.data.Data[0].Units) {
            scope.config.labels = [];
            const metaData = scope.symbol.DataSources;
            getUnits(scope);
            metaData.forEach((item, index) => {
                const unit = scope.units[index] || '';
                const label = item.split('|').at(-1).split('?')[0] + ': ' + unit;
                scope.config.labels.push(label);
            })
        }
    }

    const getDataProvider = (scope) => {
        const dataArray = [];

        if (scope.data.Data[0].Values.length != 0) {
            scope.data.Data[0].Values.forEach(item => {
                const date = new Date(item.Time) //.toLocaleString();
                const realValue = item.Value;
                const findTarget = scope.data.Data[1].Values.filter(target => target.Time === item.Time);

                const targetValue = findTarget.length != 0 ? findTarget.at(-1).Value : 0;
                dataArray.push({
                    "timestamp": date,
                    "value1": realValue,
                    "value2": targetValue,
                })
            })
        } else {
            if (scope.data.Data[1].Values.length != 0) {
                scope.data.Data[1].Values.forEach(item => {
                    const date = new Date(item.Time) //.toLocaleString();
                    const targetValue = 2 //item.Value;
                        //const findTarget = scope.data.Data[0].Values.filter( target => target.Time === item.Time);

                    const realValue = 0 //findTarget.length != 0 ? findTarget.at(-1).Value : 0;
                    dataArray.push({
                        "timestamp": date,
                        "value1": realValue,
                        "value2": targetValue,
                    })
                })

            }

        }
        console.log('dataarray: ', dataArray)
        return dataArray;
    }

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);

    symbolVis.prototype.init = function(scope, elem) {

        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChange;

        const container = elem.find('#container')[0];
        container.id = "Barra_Area_" + scope.symbol.Name;

        let chart = false;

        scope.config.labels = [];

        function dataUpdate(data) {

            scope.data = data;
            getLabels(scope);
            if (data.Data.length == 2) {
                const dataArray = getDataProvider(scope);
                if (!chart) {
                    chart = buildChart(container, scope, dataArray);
                    console.log('provider: ', chart.dataProvider)
                }
                chart.dataProvider = dataArray;
                chart.validateData();
                chart.validateNow();

            }
        }

        function configChange(data) {
            if (chart) {
                setConfig(chart, scope);
                chart.validateNow();
            }
        }
    };

    CS.symbolCatalog.register(definition);

})(window.PIVisualization);