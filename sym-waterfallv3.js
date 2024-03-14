(function(BS) {
    function symbolVis() {}
    BS.deriveVisualizationFromBase(symbolVis);

    const myCustomSymbolDefinition = {
        typeName: 'waterfallv3',
        displayName: 'Grafico de Cascada',
        datasourceBehavior: BS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/cmp_cascada.png',
        supportsCollections: true,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                FormatType: null,
                Height: 500,
                Width: 1000,
                fontSizeTitle: 14,
                columnWidth: 0.5,
                customTitle: 'waterfall graphic',
                colorTitle: 'black',
                decimalPlaces: 0,
                fontSizeAxis: 16,
                colorTextAxis: 'black',
                fontSizeValues: 14,
                colorTextValues: 'black',
                fontSizeBalloon: 20,
                boldAxis: false,
                boldTitle: false,
                dash: 3,
                lineColor: '#888888',
                initialColor: '#fff200',
                positiveColor: '#54cb6a',
                negativeColor: '#cc4b48',
                totalColor: '#1c8ceb',
                showAllValueLabels: true,
                bulletEnabled: false,
                shape: 'circle',
                bulletSize: 3,
                enabledCursor: false,
                decimalPlaces: 1,
                decimalSeparator: ',',
                thousandsSeparator: '.'
            };
        },

        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    const getNumber = (displayValue, decimal, dSeparator, tSeparator) => {
        const formatter = { precision: decimal, decimalSeparator: dSeparator, thousandsSeparator: tSeparator }
        return AmCharts.formatNumber(displayValue, formatter, decimal);
    }

    class valueProvider {
        constructor(open, close, displayValue, scope, position) {
            this.name = scope.mylabels[position];
            this.open = open;
            this.close = close;
            this.displayValue = displayValue;
            this.balloonValue = getNumber(displayValue, scope.config.decimalPlaces, scope.config.decimalSeparator, scope.config.thousandsSeparator);
            this.color = getColorValue((this.balloonValue), scope, position);
            this.position = position
        }
    }

    class trendProvider {
        constructor(scope, final, start, value) {
            this.dashLength = scope.config.dash;
            this.finalCategory = final;
            this.finalValue = value;
            this.initialCategory = start;
            this.initialValue = value;
            this.lineColor = scope.config.lineColor;
        }
    }

    const setConfigChart = (chart, scope) => {
        chart.titles = createChartTitles(scope);
        chart.precision = scope.config.decimalPlaces;
        chart.columnWidth = scope.config.columnWidth;
        chart.trendLines = setTrendLines(chart.dataProvider, scope);
        setConfigAxis(chart.categoryAxis, scope);
        setConfigGraphs(chart.graphs[0], scope);
        setConfigValueAxes(chart.valueAxes[0], scope);
    }

    const setConfigAxis = (axis, scope) => {
        axis.fontSize = scope.config.fontSizeAxis;
        axis.boldLabels = scope.config.boldAxis;
        axis.color = scope.config.colorTextAxis;
    }

    const setConfigGraphs = (graph, scope) => {
        graph.fontSize = scope.config.fontSizeValues;
        graph.color = scope.config.colorTextValues;
        graph.labelText = scope.config.showAllValueLabels ? "[[balloonValue]]" : null;
        graph.bullet = scope.config.bulletEnabled ? scope.config.shape : null;
        graph.bulletSize = scope.config.bulletSize;
        graph.balloonText = scope.config.enabledCursor ? (
            `<span style='color:[[color]]'>[[category]]</span><br><b style='font-size:${scope.config.fontSizeBalloon}px;color: ${scope.config.colorTextValues}'>[[balloonValue]]</b>`
        ) : '';
    }

    const setConfigValueAxes = (axes, scope) => {
        axes.fontSize = scope.config.fontSizeAxis;
        axes.color = scope.config.colorTextAxis;
        axes.boldLabels = scope.config.boldAxis;
    }

    const setTrendLines = (dataArray, scope) => {
        let iterator = 0;
        const lengthArray = dataArray.length - 1;
        const objTrends = [];
        for (iterator; iterator < lengthArray; iterator++) {
            const startLabel = dataArray[iterator].name;
            const finalLabel = dataArray[iterator + 1].name;
            const value = dataArray[iterator].close;
            objTrends.push(new trendProvider(scope, finalLabel, startLabel, value));
        }
        return objTrends;
    }

    const getNewChart = (scope, symbolContainerDiv, dataArray) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "type": "serial",
            "hideCredits": true,
            "theme": "none",
            "dataProvider": dataArray,
            "precision": scope.config.decimalPlaces,
            "decimalSeparator": ',',
            "thousandsSeparator": '.',
            "valueAxes": [{
                "axisAlpha": 0,
                "gridAlpha": 0.1,
                "position": "left"
            }],
            "startDuration": 1,
            "graphs": [{
                "showAllValueLabels": true,
                "colorField": "color",
                "fillAlphas": 0.8,
                "lineColor": "#BBBBBB",
                "openField": "open",
                "type": "column",
                "valueField": "close",
            }],
            "categoryField": "name",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "gridAlpha": 0.1
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

    const getItemValue = (dataSource, iterator) => parseFloat(dataSource[iterator].Value);
    const getOpenValue = (isTheLast, prevValue, iterator) => isTheLast ? 0 : prevValue[iterator];

    const getColorValue = (result, scope, position) => {
        const colors = {
            '0': scope.config.initialColor,
            'positive': scope.config.positiveColor,
            'negative': scope.config.negativeColor,
        }
        colors[scope.sizeOfData - 1] = scope.config.totalColor;
        return colors[position] || (parseFloat(result) > 0 ? colors['positive'] : colors['negative']);
    }
    const getAcummulatedValues = (dataSource, lengthData) => {
        let iterator = 0,
            acumulator = 0;
        const values = [0];
        for (iterator; iterator < lengthData; iterator++) {
            acumulator += getItemValue(dataSource, iterator)
            values.push(acumulator);
        }
        return values;
    }
    const getProvider = (dataSource, acummulatedValues, scope) => {
        const objProvider = [];
        const lengthData = dataSource.length - 1;
        let iterator = 0;
        for (iterator; iterator <= lengthData; iterator++) {
            const isTheLast = iterator === lengthData;
            const open = getOpenValue(isTheLast, acummulatedValues, iterator);
            const displayValue = getItemValue(dataSource, iterator);
            const close = isTheLast ? displayValue : acummulatedValues[iterator + 1];
            objProvider.push(new valueProvider(open, close, displayValue, scope, iterator));
        }
        return objProvider;
    }
    const isEqual = (arr1, arr2) => {
        const diffValues = arr1.filter(item => !arr2.includes(item));
        return diffValues.length != undefined && diffValues.length === 0;
    }

    const getLabels = (sourceData) => {
        const labelArray = []
        for (const iterator of sourceData) {
            labelArray.push(iterator.Label.split('|').at(-1).toUpperCase());
        }
        return labelArray;
    }

    symbolVis.prototype.init = function(scope, element) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomChangeFunction;

        let valuesInit = [],
            chart = false;
        const symbolContainerDiv = element.find('#container')[0];
        symbolContainerDiv.id = "amChart_" + scope.symbol.Name;

        function myCustomDataUpdateFunction(data) {
            if (!data.Rows) return;
            const dataSource = data.Rows;
            const sizeData = dataSource.length;
            const acummulatedValues = getAcummulatedValues(dataSource, sizeData);

            if (!chart) {
                scope.mylabels = getLabels(dataSource);
                scope.sizeOfData = sizeData;
                const dataArray = getProvider(dataSource, acummulatedValues, scope);
                chart = getNewChart(scope, symbolContainerDiv, dataArray);
            }

            if (!isEqual(acummulatedValues, valuesInit)) {
                chart.dataProvider = getProvider(dataSource, acummulatedValues, scope);
                chart.trendLines = setTrendLines(chart.dataProvider, scope);
                valuesInit = acummulatedValues;
            }

            chart.validateData();
            chart.validateNow();
        };

        function myCustomChangeFunction(data) {
            if (chart) {
                for (const iterator of chart.dataProvider) {
                    iterator.balloonValue = getNumber(iterator.displayValue, scope.config.decimalPlaces, scope.config.decimalSeparator, scope.config.thousandsSeparator);
                    iterator.color = getColorValue((iterator.balloonValue), scope, iterator.position);
                }
                for (const iterator of chart.trendLines) {
                    iterator.dashLength = scope.config.dash;
                    iterator.lineColor = scope.config.lineColor;
                }
                setConfigChart(chart, scope);
                chart.validateData();
                chart.validateNow();
            };
        }
    };

    BS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);