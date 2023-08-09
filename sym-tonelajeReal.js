(function(CS) {
    'use strict';

    const myCustomSymbolDefinition = {
        typeName: 'tonelajeReal',
        displayName: 'Tonelaje Real',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/tonelajeReal.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModePlotValues,
                FormatType: null,
                Height: 140,
                Width: 280,
                Intervals: 1000,
                textColor: "black",
                fontSize: 12,
                fontSizeTitle: 14,
                colorTitle: 'black',
                boldTitle: false,
                lineColor: "black",
                showTitle: false,
                decimalPlaces: 1,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                customTitle: "",
                showLabelAxes: false,
                columnWidth: 0.5,
                ydiff: 38,
                colorBarMax: 'white',
                colorBarReal: '#cdd0db',
                colorGraphPositive: '#22b14c',
                colorGraphNegative: '#ed1c24',
                colorLimits: 'black',
                labelOffset: 20,
                labelOffsetLimits: 25,
                labelOffsetXreal: 5,
                labelOffsetYreal: 25,
                columnWidth: 0.5,
                showLabelsLimits: true,
                boldLabels: true,
                stepRisers: true,
                showBalloon: true,
                showBullet: true,
                sizeBullet: 0,
                fontSizeLalbelReal: 14
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

    const createChartTitles = (scope) => {
        return [{
            "text": scope.config.customTitle,
            "size": scope.config.fontSizeTitle,
            "color": scope.config.colorTitle,
            "bold": scope.config.boldTitle,
            "enabled": scope.config.showTitle
        }];
    }

    const setConfigAxes = (axes, scope) => {
        axes.maximum = scope.valueMax;
        axes.labelsEnabled = scope.config.showLabelAxes;
    }

    const setCommunConfigGraphs = (graph, scope) => {
        graph.fontSize = scope.config.fontSize;
        graph.columnWidth = scope.config.columnWidth;
        graph.showBalloon = scope.config.showBalloon;
    }

    const setConfigGraphs = (chart, scope) => {
        setCommunConfigGraphs(chart.graphs[0], scope);
        setCommunConfigGraphs(chart.graphs[1], scope);
        setCommunConfigGraphs(chart.graphs[2], scope);
        setCommunConfigGraphs(chart.graphs[3], scope);
        setCommunConfigGraphs(chart.graphs[4], scope);
    }

    const setConfigChart = (chart, scope) => {
        chart.addClassNames = scope.config.boldLabels;
        chart.titles = createChartTitles(scope);
        setConfigAxes(chart.valueAxes[0], scope);
        setConfigGraphs(chart, scope);
        chart.precision = scope.config.decimalPlaces;
        chart.decimalSeparator = scope.config.decimalSeparator != '' ? scope.config.decimalSeparator : ',';
        chart.thousandsSeparator = scope.config.thousandsSeparator != '' ? scope.config.thousandsSeparator : '.';
        chart.fontSize = scope.config.fontSize;
        chart.validateData();
        chart.validateNow();
    };

    const getNewChart = (scope, symbolContainerDiv, dataArray) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "type": "serial",
            "hideCredits": true,
            "rotate": true,
            "precision": scope.config.decimalPlaces,
            "theme": "none",
            "autoMargins": true,
            "dataProvider": dataArray,
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0,
                "position": "left",
                "axisAlpha": 0
            }],
            "graphs": [{
                "id": "labelMin",
                "columnWidth": 0.4,
                "lineThickness": 2,
                "stackable": true,
                "type": "column",
                "linecolor": 'transparent',
                "fillColors": "transparent",
                "valueField": "minimum",
                "labelText": scope.config.showLabelsLimits ? "[[value]]" : '',
                "labelPosition": "bottom",
                "lineAlpha": 0,
                "fillAlphas": 0,
                "labelOffset": scope.config.labelOffsetLimits,
                "color": scope.config.colorLimits
            }, {
                "id": "labelMax",
                "clustered": 0,
                "valueField": "maximum",
                "type": "column",
                "columnWidth": 0.4,
                "lineAlpha": 1,
                "stackable": false,
                "fillAlphas": 1,
                "labelPosition": "bottom",
                "labelText": scope.config.showLabelsLimits ? "[[value]]" : '',
                "color": scope.config.colorLimits,
                "fillColors": scope.config.colorBarMax,
                "lineColor": scope.config.lineColor,
                "labelOffset": scope.config.labelOffsetLimits
            }, {
                "id": "labelReal",
                "clustered": 0,
                "columnWidth": 0.4,
                "fillAlphas": 1,
                "openField": "minimum",
                "stackable": true,
                "type": "column",
                "valueField": "real",
                "showAllLabels": true,
                "labelPosition": "middle",
                "color": scope.config.textColor,
                "fillColors": scope.config.colorBarReal,
                "lineColor": scope.config.colorBarReal,
            }, {
                "clustered": 0,
                "columnWidth": 0.4,
                "lineColor": scope.colorDiffResult,
                "fillAlphas": 1,
                "openField": "real",
                "stackable": true,
                "type": "column",
                "valueField": "diff",
                "showAllLabels": true,
                "labelPosition": "middle",
                "color": scope.colorDiffResult,
                "fillColors": scope.colorDiffResult,
                "linecolor": scope.colorDiffResult
            }, {
                "id": "labelForecast",
                "columnWidth": 0.4,
                "lineColor": scope.colorDiffResult,
                "lineThickness": 2,
                "noStepRisers": scope.config.stepRisers,
                "stackable": false,
                "type": "step",
                "valueField": "forecast",
                "bullet": scope.config.showBullet ? 'circle' : 'none',
                "bulletSize": scope.config.sizeBullet,
                "labelText": "Forecast [[value]]",
                "showAllLabels": true,
                "labelPosition": "top",
                "dashLength": 0.5,
                "color": scope.colorDiffResult,
                "fillColors": scope.colorDiffResult,
                "linecolor": scope.colorDiffResult,
                "labelOffset": scope.config.labelOffset
            }],
            "columnWidth": scope.config.columnWidth + 0.01,
            "categoryField": "category",
            "categoryAxis": {
                "gridAlpha": 0,
                "position": "left",
                "labelsEnabled": false,
                "axisAlpha": 0
            },
            "allLabels": [{
                "text": getNumber(scope.valueResult, scope),
                "x": 5,
                "y": scope.config.ydiff,
                "color": scope.colorDiffResult,
                "bold": scope.config.boldLabels
            }, {
                "text": `Realizado ${scope.etReal} de ${scope.etMax}`,
                "size": scope.config.fontSizeLalbelReal,
                "x": scope.config.labelOffsetXreal,
                "y": scope.config.labelOffsetYreal,
                "color": scope.config.textColor,
                "bold": scope.config.boldLabels
            }]
        });
        setConfigChart(chart, scope);
        return chart;
    }

    const getNumber = (displayValue, scope) => {
        const formatter = {
            precision: scope.config.decimalPlaces,
            decimalSeparator: scope.config.decimalSeparator,
            thousandsSeparator: scope.config.thousandsSeparator
        };
        return AmCharts.formatNumber(displayValue, formatter, scope.config.decimalPlaces);
    }

    const getDataProvider = (dataRows, scope) => {
        scope.valueResult = (dataRows[2].Value - dataRows[0].Value)
        scope.colorDiffResult = scope.valueResult >= 0 ?
            scope.config.colorGraphPositive :
            scope.config.colorGraphNegative;
        scope.valueMax = dataRows[0].Value;
        scope.etMax = getNumber(scope.valueMax, scope);
        scope.etReal = getNumber(dataRows[1].Value, scope);
        return [{
            "category": "Ton",
            "minimum": 0,
            "maximum": scope.valueMax,
            "real": dataRows[1].Value,
            "forecast": dataRows[2].Value,
            "diff": Math.abs(scope.valueResult),
        }]
    }

    const buildChart = (isFirstLoad, chart, scope, symbolContainerDiv) => {
        if (isFirstLoad) {
            chart = getNewChart(scope, symbolContainerDiv, getDataProvider(scope.data.Rows, scope));
            isFirstLoad = false;
        }
        if (scope.haveChanges) {
            chart.dataProvider = getDataProvider(scope.data.Rows, scope);
            scope.haveChanges = false;
        }
        return chart;
    }

    const haveDataChange = (scope, data) => {
        if (!scope.data) {
            scope.data = data;
            return;
        }
        for (let i = 0; i < data.Rows.length; i++) {
            if (scope.data.Rows[i].Value != data.Rows[i].Value) {
                scope.data = data;
                scope.haveChanges = true;
            }
        }
    }

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);

    symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configurationChange;
        let isFirstLoad = true;
        let chart = false;
        const symbolContainerDiv = elem.find('#container')[0];
        symbolContainerDiv.id = "TonReal" + scope.symbol.Name;

        function dataUpdate(data) {
            if (data.Rows.length > 2) {
                haveDataChange(scope, data);
                chart = buildChart(isFirstLoad, chart, scope, symbolContainerDiv);
            }
        }

        function configurationChange() {
            if (chart) {
                isFirstLoad = true;
                chart = buildChart(isFirstLoad, chart, scope, symbolContainerDiv);
                setConfigChart(chart, scope);
            }
        }
    };

    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);