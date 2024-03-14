(function(BS) {
    function symbolVis() {}
    BS.deriveVisualizationFromBase(symbolVis);

    const myCustomSymbolDefinition = {
        typeName: 'esperaCola',
        displayName: 'Espera en Cola',
        datasourceBehavior: BS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/cmp_versus.png',
        supportsCollections: true,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                FormatType: null,
                Height: 500,
                Width: 1000,
                customTitle: 'Tiempo en Cola y Espera - Camiones',
                fontSizeTitle: 14,
                boldTitle: false,
                colotTitle: 'black',
                colorBars1: '#2b61a2',
                colorBars2: '#ffc90e',
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
                topValues: 20,
                typeLabel: 2,
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
        constructor(label, waiting, tail) {
            this.label = label;
            this.waiting = waiting;
            this.tail = tail
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

    const setBalloonText = (graph, scope, index) => {
        graph.balloonText = scope.config.enabledCursor ? (
            `<span style='color:[[color]]; font-size:${scope.config.fontSizeBalloon}px'>[[category]] ${scope.textBalloon[index]}</span><b style='font-size:${scope.config.fontSizeBalloon}px; color: ${scope.config.colorTextValues}'>: [[value]]</b>`
        ) : '';
    }

    const setConfigGraphs = (graph, scope, index) => {
        graph.fontSize = scope.config.fontSizeValues;
        graph.color = scope.config.colorTextValues;
        graph.labelText = scope.config.showAllValueLabels ? "[[value]]" : null;
        graph.bullet = scope.config.bulletEnabled ? scope.config.shape : null;
        graph.bulletSize = scope.config.bulletSize;
        setBalloonText(graph, scope, index);
    }

    const setConfigsChart = (chart, scope) => {
        chart.titles = createChartTitles(scope);
        chart.rotate = scope.config.isRotate;
        setConfigAxis(chart.categoryAxis, scope);
        setConfigGraphs(chart.graphs[0], scope, 0);
        setConfigGraphs(chart.graphs[1], scope, 1);

        chart.graphs[0].lineColor = scope.config.colorBars1;
        chart.graphs[1].lineColor = scope.config.colorBars2;

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
                "id": 'a01',
                "axisAlpha": 1,
                "position": "left",
                "gridAlpha": 0,
                "labelsEnabled": true,
                "minimum": 0,
                "maximum": 10
            }, {
                "id": 'a02',
                "axisAlpha": 1,
                "position": "right",
                "reversed": true,
                "gridAlpha": 0,
                "labelsEnabled": true,
                "minimum": 0,
                "maximum": 10
            }],
            "startDuration": 1.5,
            "graphs": [{
                    "showAllValueLabels": true,
                    "labelText": "[[waiting]]",
                    "valueAxis": 'a01',
                    "fillAlphas": 0.9,
                    "lineAlpha": 0.2,
                    "type": "column",
                    "valueField": "waiting",
                },
                {
                    "showAllValueLabels": true,
                    "labelText": "[[tail]]",
                    "valueAxis": 'a02',
                    "fillAlphas": 0.9,
                    "lineAlpha": 0.2,
                    "clustered": false,
                    "type": "column",
                    "valueField": "tail",
                }
            ],
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

    const getPath = (namestream) => {
        const isAttribute = /af:/.test(namestream);
        let fullPath, path;
        if (isAttribute) {
            fullPath = namestream.replace(/af\:(.*)/, '$1');
            path = fullPath.split("?")[0] + "|" + (fullPath.split("?")[1]).split("|")[1];
        } else {
            fullPath = namestream.replace(/pi\:(\\\\.*)\?{1}.*(\\.*)\?{1}.*/, '$1$2');
            path = fullPath.split("?")[0];
        }

        return path;
    }

    const getLabels = (scope) => {
        scope.labels = [];
        scope.textBalloon = [];
        const metaData = scope.symbol.DataSources;
        metaData.forEach((item) => {
            const path = getPath(item, scope);
            scope.textBalloon.push(path.split('\\').at(-1).split('|')[1])
            if (scope.config.typeLabel == 1) scope.labels.push(path.split('\\').at(-1));
            if (scope.config.typeLabel == 2) scope.labels.push(path.split('\\').at(-1).split('|')[0]);
            if (scope.config.typeLabel == 3) scope.labels.push(path.split('\\').at(-1).split('|')[1]);
        })
    }

    const getOnlyValues = (sourceData) => {
        const values = [];
        for (const iterator of sourceData) {
            values.push(iterator.Value)
        }
        return values;
    }

    const getSortedData = (dataProvider, isInverted) => {
        dataProvider.sort((a, b) => isInverted ? a.waiting - b.waiting : b.waiting - a.waiting);
        return dataProvider;
    }

    const getDataProvider = (sourceData, scope) => {
        let iterator = 0;
        const sizeData = sourceData.length;
        const dataProvider = [];
        for (iterator; iterator < sizeData; iterator = iterator + 2) {
            const waiting = sourceData[iterator].Value || 0;
            const tail = sourceData[iterator + 1] ? sourceData[iterator + 1].Value : 0;
            dataProvider.push(new ObjtProvider(scope.labels[iterator], waiting, tail))
        }
        return getSortedData(dataProvider, scope.config.isInverted);
    }


    symbolVis.prototype.init = function(scope, element) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = changeFunction;

        const symbolContainerDiv = element.find('#container')[0];
        symbolContainerDiv.id = "amChart_" + scope.symbol.Name;
        getLabels(scope);

        let chart = false,
            oldValues = [];

        function dataUpdate(data) {
            if (!data.Rows) return;
            scope.data = data;
            const onlyValues = getOnlyValues(data.Rows);
            if (isDifferent(onlyValues, oldValues)) {
                getLabels(scope);
                chart = false;
                const dataProvider = getDataProvider(scope.data.Rows, scope);
                chart = getNewChart(scope, symbolContainerDiv, dataProvider);
                oldValues = onlyValues;
            }
        };

        function changeFunction(data) {
            if (chart) {
                getLabels(scope);
                const dataProvider = getDataProvider(scope.data.Rows, scope);
                chart = getNewChart(scope, symbolContainerDiv, dataProvider);
                chart.validateData();
            };
        };
    };

    BS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);