(function(CS) {
    'use strict';
    const myCustomSymbolDefinition = {
        typeName: 'pie',
        displayName: 'Pie Chart',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/Donut.png',
        visObjectType: symbolVis,

        getDefaultConfig: function() {
            return {
                DataShape: 'Table',
                FormatType: null,
                Height: 300,
                Width: 800,
                fontsize: 16,
                textColor: "black",
                backgroundColor: "white",
                outlineColor: "white",
                showTitle: false,
                showLabels: false,
                showLegend: true,
                donut: false,
                portionColor1: "#122532",
                portionColor2: "#124353",
                portionColor3: "#12697e",
                portionColor4: "#1aa3ac",
                portionColor5: "#20dad8",
                decimalPlaces: 1,
                decimalSeparator: ',',
                thousandsSeparator: '.',
                legendPosition: "bottom",
                showBullets: false,
            };
        },

        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    // Make title of chart
    const createArrayOfChartTitles = (dataArray, scope) => {

        let titleText = dataArray[0].Label.split('|').at(-1).toUpperCase();
        for (var i = 1; i < dataArray.length; i++) {
            titleText += (" vs. " + dataArray[i].Label.split('|').at(-1).toUpperCase());
        }

        const titlesArray = [{
            "text": titleText,
            "size": scope.config.fontSize + 5,

        }];
        return titlesArray;
    }

    const setConfigNumbers = (chart, scope) => {
        chart.precision = scope.config.decimalPlaces;
        chart.decimalSeparator = scope.config.decimalSeparator || ' ';
        chart.thousandsSeparator = scope.config.thousandsSeparator || ' ';
    }

    const setConfigLegend = (chart, scope) => {
        chart.legend.fontSize = scope.config.fontSize - 5;
        chart.legend.color = scope.config.textColor;
        chart.legend.enabled = scope.config.showLegend;
        chart.legend.position = scope.config.legendPosition;
    }

    const setConfigBallon = (chart, scope) => {
            chart.balloonText = scope.config.showBullets ? "[[title]]<br><b>[[value]]</b>[[description]] <br>([[Percent]]%)" : '';
            chart.balloon = { "fixedPosition": true };
        }
        // Set personalized configs to chart  
    const setConfigsChart = (chart, scope) => {

        const colorsPortions = [
            scope.config.portionColor1,
            scope.config.portionColor2,
            scope.config.portionColor3,
            scope.config.portionColor4,
            scope.config.portionColor5
        ];

        setConfigLegend(chart, scope);
        setConfigBallon(chart, scope);
        setConfigNumbers(chart, scope);

        chart.colors = colorsPortions;
        chart.fontSize = scope.config.fontSize;
        chart.color = scope.config.textColor;
        chart.backgroundColor = scope.config.backgroundColor;
        chart.outlineColor = scope.config.outlineColor;

        scope.config.showTitle ? chart.titles = createArrayOfChartTitles(chart.dataProvider, scope) : chart.titles = '';
        chart.labelsEnabled = scope.config.showLabels;
        scope.config.donut ? chart.innerRadius = "60%" : chart.innerRadius = 0;
        chart.validateNow();
        chart.validateData();
    }

    //Make structure of Chart
    const getMakeChart = (scope, dataArray, symbolContainerDiv) => {
        const chart = AmCharts.makeChart(symbolContainerDiv.id, {
            "type": "pie",
            "dataProvider": dataArray,
            "valueField": "Value",
            "autoMargins": true,
            "minRadius": 30,
            "hideCredits": true,
            "titleField": "Label",
            "descriptionField": "Units",

            "labelText": "[[value]]\n([[Percent]]%)",
            "outlineAlpha": 1,
            "outlineThickness": 1,
            "legend": {
                "align": "center",
                "position": "right",
                "labelWidth": 150
            },
        });
        setConfigsChart(chart, scope);
        return chart;
    }

    const getTotalPie = (dataRows) => {
        let acumulator = 0;
        for (const iterator of dataRows) {
            acumulator += parseFloat(iterator.Value)
        }
        return acumulator;
    }

    const getNumber = (displayValue, decimal, dSeparator, tSeparator) => {
        const formatter = { precision: decimal, decimalSeparator: dSeparator, thousandsSeparator: tSeparator }
        return AmCharts.formatNumber(displayValue, formatter, decimal);
    }

    const getPercent = (value, total, scope) => {
        const percent = value * 100 / total;
        return getNumber(percent, scope.config.decimalPlaces, scope.config.decimalSeparator, scope.config.thousandsSeparator);
    }

    //Get data from source AF to chart dataProvider 
    const getDataProvider = (data, dataArray, scope) => {
        let iterator = 0;
        const size = data.Rows.length;
        const totalPie = getTotalPie(data.Rows);
        for (iterator; iterator < size; iterator++) {
            if (dataArray[iterator]) {
                dataArray[iterator].Time = data.Rows[iterator].Time;
                dataArray[iterator].Value = data.Rows[iterator].Value;
                dataArray[iterator].Percent = getPercent(data.Rows[iterator].Value, totalPie, scope)
                if (data.Rows[iterator].Units) {
                    dataArray[iterator].Units = data.Rows[iterator].Units;
                }
                if (data.Rows[iterator].Label) {
                    dataArray[iterator].Label = data.Rows[iterator].Label.split('|').at(-1).toUpperCase();
                }
            } else {
                dataArray[iterator] = {
                    "Label": data.Rows[iterator].Label.split('|').at(-1).toUpperCase(),
                    "Time": data.Rows[iterator].Time,
                    "Units": data.Rows[iterator].Units,
                    "Value": data.Rows[iterator].Value,
                    "Percent": getPercent(data.Rows[iterator].Value, totalPie, scope)
                };
            }
        }
    }

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;

        // Get the element div container from DOM
        const symbolContainerDiv = elem.find('#container')[0];
        symbolContainerDiv.id = "myCustomSymbol_" + scope.symbol.Name + Math.random().toString(36).substr(2, 16);

        let chart = false,
            dataArray = [];

        function myCustomDataUpdateFunction(data) {
            if (!data) return;
            getDataProvider(data, dataArray, scope);

            if (!chart) {
                chart = getMakeChart(scope, dataArray, symbolContainerDiv);
            }

            chart.dataProvider = dataArray;
            chart.validateData();
            chart.validateNow();
        }

        function myCustomConfigurationChangeFunction(data) {
            if (chart) {
                for (const iterator of dataArray) {
                    const totalPie = getTotalPie(dataArray);
                    iterator.Percent = getPercent(iterator.Value, totalPie, scope)
                }
                setConfigsChart(chart, scope);
            }
        }
    }

    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);