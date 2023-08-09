(function(BS) {
    function symbolVis() {}
    BS.deriveVisualizationFromBase(symbolVis);

    const myCustomSymbolDefinition = {
        typeName: 'Ranking',
        displayName: 'Ranking',
        datasourceBehavior: BS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/ranking.png',
        supportsCollections: true,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                FormatType: null,
                Height: 500,
                Width: 1000,
                customTitle: 'Ranking',
                fontSizeTitle: 14,
                boldTitle: false,
                colotTitle: 'black',
                colorBars: '#2b61a2',
                fontSizeAxis: 14,
                boldAxis: false,
                colorTextAxis: 'black',
                fontSizeBalloon: 20,
                fontSizeValues: 14,
                colorTextValues: 'black',
                columnWidth: 0.5,
                isInverted: false,
                labelRotation: 0,
                isRotate: false,
                showAllValueLabels: false,
                decimalPlaces: 1,
                enabledCursor: false,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                topValues: 10,
            };
        },

        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    class ObjtProvider {
        constructor(label, value) {
            this.label = label;
            this.totals = value;
        }
    }

    const createChartTitles = (scope) => {
        return [{
            "text": scope.config.customTitle,
            "size": scope.config.fontSizeTitle,
            "color": scope.config.colorTitle,
            "bold": scope.config.boldTitle
        }];
    }

    const setConfigAxis = (axis, scope) => {
        axis.fontSize = scope.config.fontSizeAxis;
        axis.boldLabels = scope.config.boldAxis;
        axis.color = scope.config.colorTextAxis;
        axis.labelRotation = scope.config.labelRotation;
    }

    const setConfigGraphs = (graph, scope) => {
        graph.fontSize = scope.config.fontSizeValues;
        graph.color = scope.config.colorTextValues;
        graph.labelText = scope.config.showAllValueLabels ? "[[value]]" : null;
        graph.lineColor = scope.config.colorBars;
        graph.bullet = scope.config.bulletEnabled ? scope.config.shape : null;
        graph.bulletSize = scope.config.bulletSize;
        graph.balloonText = scope.config.enabledCursor ? (
            `<span style='color:[[color]]; font-size:${scope.config.fontSizeBalloon}px'>[[category]]</span><b style='font-size:${scope.config.fontSizeBalloon}px; color: ${scope.config.colorTextValues}'>: [[value]]</b>`
        ) : '';
    }

    const setConfigsChart = (chart, scope) => {
        chart.titles = createChartTitles(scope);
        chart.rotate = scope.config.isRotate;
        setConfigAxis(chart.categoryAxis, scope);
        setConfigGraphs(chart.graphs[0], scope);
        chart.columnWidth = scope.config.columnWidth;
        chart.validateData();
        chart.validateNow();
    }

    const getNewChart = (scope, symbolContainerDiv, dataProvider) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "type": "serial",
            "theme": "none",
            "rotate": scope.config.isRotate,
            "hideCredits": true,
            "dataProvider": dataProvider.slice(0, scope.config.topValues),
            "precision": scope.config.decimalPlaces,
            "decimalSeparator": scope.config.decimalSeparator || ' ',
            "thousandsSeparator": scope.config.thousandsSeparator || ' ',
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left",
                "gridAlpha": 0,
                "labelsEnabled": false,
            }],
            "startDuration": 1.5,
            "graphs": [{
                "showAllValueLabels": true,
                "labelText": "[[totals]]",
                "fillAlphas": 0.9,
                "lineAlpha": 0.2,
                "type": "column",
                "valueField": "totals",
            }],
            "categoryField": "label",
            "categoryAxis": {
                "gridAlpha": 0,
                "gridPosition": "start"
            }
        });
        setConfigsChart(chart, scope);
        return chart;
    }

    const isDifferent = (arr1, arr2) => {
        const diffValues = arr1.filter(item => !arr2.includes(item));
        return diffValues.length != 0;
    }

    const getLabels = (sourceData) => {
        const labelArray = []
        for (const iterator of sourceData) {
            labelArray.push(iterator.Label.split('|').at(-1).toUpperCase());
        }
        return labelArray;
    }

    const getOnlyValues = (sourceData) => {
        const values = [];
        for (const iterator of sourceData) {
            values.push(iterator.Value)
        }
        return values;
    }

    const getNumbValue = (source) => {
        return source && !isNaN(source.Value) ? source.Value : 0;
    }

    const getDataProvider = (sourceData, scope) => {
        let iterator = 0;
        const sizeData = sourceData.length;
        const dataProvider = [];
        for (iterator; iterator < sizeData; iterator++) {
            const valueItem = getNumbValue(sourceData[iterator]);
            dataProvider.push(new ObjtProvider(scope.labels[iterator], valueItem));
        }

        return getSortedData(dataProvider, scope.config.isInverted);
    }

    const getSortedData = (dataProvider, isInverted) => {
        dataProvider.sort((a, b) => isInverted ? a.totals - b.totals : b.totals - a.totals);
        return dataProvider;
    }
    symbolVis.prototype.init = function(scope, element) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomChangeFunction;

        const symbolContainerDiv = element.find('#container')[0];
        symbolContainerDiv.id = "amChart_" + scope.symbol.Name;
        let chart = false,
            oldValues = [];

        function myCustomDataUpdateFunction(data) {
            if (!data.Rows) return;
            scope.data = data;
            const onlyValues = getOnlyValues(data.Rows);
            if (isDifferent(onlyValues, oldValues)) {
                chart = false;
                scope.labels = getLabels(data.Rows);
                const dataProvider = getDataProvider(scope.data.Rows, scope);
                chart = getNewChart(scope, symbolContainerDiv, dataProvider);
                oldValues = onlyValues;
            }
        };

        function myCustomChangeFunction(data) {
            if (chart) {
                const dataProvider = getDataProvider(scope.data.Rows, scope);
                chart = getNewChart(scope, symbolContainerDiv, dataProvider);
                chart.validateData();
            };
        }
    };

    BS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);