//************************************
// Begin defining a new symbol
/*
Empresa: Piper Ingenieros SAC
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {
    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'Barravstarget',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'Barra vs target (now)',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        //iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barravstarget.png',
        visObjectType: symbolVis,
        // Specify default configuration for this symbol
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                // Specify the default height and width of this symbol
                Height: 300,
                Width: 1000,
                // Allow large queries
                Intervals: 1000,
                // Specify the value of custom configuration options
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: "black",
                fontSize: 12,
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                seriesColor1: '#086996',
                seriesColor2: 'black',
                axisColor: 'black',
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                useColumns: false,
                decimalPlaces: 1,
                bulletSize: 8,
                customTitle: ''
            };
        },
        // Allow use in collections! !!!!!!!!!!!!!!!!!!!!!!!!!
        supportsCollections: true,
        // By including this, you're specifying that you want to allow configuration options for this symbol
        configOptions: function() {
                return [{
                    // Add a title that will appear when the user right-clicks a symbol
                    title: 'Editar Formato',
                    // Supply a unique name for this cofiguration setting, so it can be reused, if needed
                    mode: 'format'
                }];
            }
            // Specify the name of the function that will be called to initialize the symbol
            //init: myCustomSymbolInitFunction
    };
    //************************************
    // Function called to initialize the symbol
    //************************************
    //function myCustomSymbolInitFunction(scope, elem) {
    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function(scope, elem) {
        // Specify which function to call when a data update or configuration change occurs 
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;

        // Locate the html div that will contain the symbol, using its id, which is "container" by default
        var symbolContainerDiv = elem.find('#container')[0];
        // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;
        var dataArray = [];
        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            // If there is indeed new data in the update
            //console.log("New data received: ", data);
            //if (data !== null && data.Data) {
            if (data && data.Data && Array.isArray(data.Data) && data.Data.length >= 2) {
                var dataArray = [];
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2;

                // Manejar errores en ambas fuentes de datos
                if (data.Data[0].ErrorDescription) {
                    console.error("Error en la fuente de datos 1:", data.Data[0].ErrorDescription);
                }
                if (data.Data[1].ErrorDescription) {
                    console.error("Error en la fuente de datos 2:", data.Data[1].ErrorDescription);
                }

                // Obtener las etiquetas y unidades de ambas fuentes de datos
                if (data.Data[0].Label) {
                    stringLabel1 = data.Data[0].Label;
                }
                if (data.Data[0].Units) {
                    stringUnits1 = data.Data[0].Units;
                }
                if (data.Data[1].Label) {
                    stringLabel2 = data.Data[1].Label;
                }
                if (data.Data[1].Units) {
                    stringUnits2 = data.Data[1].Units;
                }

                //var arrayOfValidReadings = [];
                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var today = data.Data[0].Values[i].Time;
                    var yearNow = today.substr(today.indexOf("/", today.indexOf("/") + 1) + 1, 4);
                    var monthNow = today.slice(today.indexOf("-") + 1, today.indexOf("-", today.indexOf("-") + 1));
                    var dayNow = today.slice(today.indexOf("-") + 4, today.indexOf("T"));
                    var hourNow = today.slice(today.indexOf(" "), today.indexOf(":"));
                    //console.log("fecha:" + hourNow + "/" + dayNow + "/" + monthNow + "/" + yearNow);
                    // Crear un nuevo objeto de datos

                    let valor1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    let valor2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;

                    var newDataObject = {
                        "timestamp": dayNow,
                        "value": valor1,
                        "value2": valor2,
                    };
                    dataArray.push(newDataObject);

                }

                // Crear o actualizar el gráfico
                if (!chart) {
                    // Crear el gráfico
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        // Propiedades del gráfico
                        "type": "serial",
                        "theme": "light",
                        "depth3D": 20,
                        "angle": 10,
                        "marginRight": 10,
                        "marginLeft": 10,
                        "autoMarginOffset": 10,
                        "addClassNames": true,
                        "titles": createArrayOfChartTitles(),
                        "fontSize": 12,
                        "backgroundAlpha": 1,
                        "backgroundColor": scope.config.backgroundColor,
                        "plotAreaFillAlphas": 0.1,
                        "plotAreaFillColors": scope.config.plotAreaFillColor,
                        "color": scope.config.textColor,
                        "pathToImages": "Scripts/app/editor/symbols/ext/images/",
                        "precision": scope.config.decimalPlaces,
                        "valueAxes": [{
                            "id": "Axis1",
                            "axisColor": scope.config.axisColor,
                            "gridAlpha": 0,
                            "position": "left"
                        }],
                        "categoryAxis": {
                            "axisColor": scope.config.axisColor, // Linea eje x color    
                            //"axisAlpha": 1,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Ton1",
                                "fillAlphas": 0.9,
                                "lineAlpha": 0.2,
                                "type": "column",
                                "balloonText": "[[title]]: <b>[[value]]</b>",
                                "labelPosition": "top",
                                //"labelText": "[[value]]",
                                "bullet": "square",
                                "fontSize": scope.config.fontSize,
                                "color": scope.config.seriesColor1,
                                //"lineThickness": 1,
                                //"lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axis1",
                                "valueField": "value",
                                //"showBalloon": true,
                                // "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            },
                            {
                                "id": "Ton2",
                                "type": "line",
                                "clustered": false,
                                "balloonText": "[[title]]: <b>[[value2]]</b>",
                                "labelPosition": "top",
                                "labelText": "[[value2]]",
                                //"labelText": scope.config.labelText2,
                                "fontSize": scope.config.fontSize,
                                "color": scope.config.seriesColor2,
                                "bullet": "round",
                                "lineThickness": 2,
                                "bulletSize": 6,
                                "bulletBorderAlpha": 1,
                                "bulletColor": "#ffffff",
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor2,
                                "color": scope.config.seriesColor2,
                                "title": stringLabel2,
                                "valueAxis": "Axis1",
                                "valueField": "value2",
                                "animationPlayed": true,

                                "dashLengthField": "dashLengthLine"
                            }
                        ],
                        "dataProvider": dataArray,
                        "categoryField": "timestamp",
                        "chartScrollbar": {
                            //"graph": "g1",
                            "graphType": "line",
                            "position": "bottom",
                            "scrollbarHeight": 20,
                            "autoGridCount": true,
                            "enabled": scope.config.showChartScrollBar,
                            "dragIcon": "dragIconRectSmall",
                            "backgroundAlpha": 1,
                            "backgroundColor": scope.config.plotAreaFillColor,
                            "selectedBackgroundAlpha": 0.2
                        },
                        "legend": {
                            "position": scope.config.legendPosition,
                            "equalWidths": false,
                            "color": scope.config.textColor,
                            "fontSize": 12,
                            "enabled": scope.config.showLegend,
                            "valueAlign": "right",
                            "horizontalGap": 10,
                            "useGraphSettings": true,
                            "markerSize": 10
                        },
                        "dataDateFormat": "YYYY-MM-DD",
                        "zoomOutButtonImage": ""
                    });
                } else {
                    // Actualizar el gráfico
                    if (scope.config.showTitle) {
                        chart.titles = createArrayOfChartTitles();
                    } else {
                        chart.titles = null;
                    }
                    chart.dataProvider = dataArray;
                    chart.validateData();
                    chart.validateNow();
                }

            } else {
                console.error("Datos inválidos o insuficientes para la visualización.");
            }
        }

        function createArrayOfChartTitles() {
            // Build the titles array
            var titlesArray;
            if (scope.config.useCustomTitle) {
                titlesArray = [{
                    "text": scope.config.customTitle,
                    "size": (scope.config.fontSize + 3)
                }];
            } else {
                titlesArray = [{
                    "text": "Real vs Target" /*+ convertMonthToString(monthNow)*/ ,
                    "bold": true,
                    "size": (scope.config.fontSize + 3)
                }];
            }
            return titlesArray;
        }

        function myCustomConfigurationChangeFunction(data) {
            // If the visualization exists...
            if (chart) {
                // Update the title
                if (scope.config.showTitle) {
                    chart.titles = createArrayOfChartTitles();
                } else {
                    chart.titles = null;
                }
                // Update colors and fonts
                if (chart.color !== scope.config.textColor) {
                    chart.color = scope.config.textColor;
                }
                if (chart.backgroundColor !== scope.config.backgroundColor) {
                    chart.backgroundColor = scope.config.backgroundColor;
                }
                if (chart.plotAreaFillColors !== scope.config.plotAreaFillColor) {
                    chart.plotAreaFillColors = scope.config.plotAreaFillColor;
                }
                if (chart.fontSize !== scope.config.fontSize) {
                    chart.fontSize = scope.config.fontSize;
                    chart.titles = createArrayOfChartTitles();
                }
                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                }
                //Para hacer aparecer y desaparecer los valores de los gráficos

                chart.graphs[0].color = scope.config.seriesColor1;
                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                }
                chart.graphs[1].color = scope.config.seriesColor2;

                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
                }
                //para el grid del eje X
                if (chart.categoryAxis.gridColor !== scope.config.axisColor) {
                    chart.categoryAxis.gridColor = scope.config.axisColor;
                }
                //para el grid del eje Y
                if (chart.valueAxes[0].gridColor !== scope.config.axisColor) {
                    chart.valueAxes[0].gridColor = scope.config.axisColor;
                }
                // Update the scroll bar
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }
                chart.legend.enabled = scope.config.showLegend;
                chart.legend.position = scope.config.legendPosition;
                // Commit updates to the chart
                chart.validateData();
                chart.validateNow();
                //console.log("Styling updated.");
            }
        }

    };

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);