(function(CS) {
    'use strict';

    var myCustomSymbolDefinition = {
        typeName: 'Tonelaje2',
        displayName: 'Tonelajes x Valle Mes completo',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barravstarget.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                Height: 300,
                Width: 1000,
                Intervals: 1000,
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: 'black',
                fontSize: 14,
                fontSizeLegend: 12,
                depth3D: 10,
                angle: 10,
                typeGraph1: 'column',
                typeGraph2: 'column',
                typeGraph3: 'column',
                typeLine1: 'line',
                typeLine2: 'smoothedLine',
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                seriesColor1: '#812749',
                seriesColor2: '#002060',
                seriesColor3: '#b86007',
                seriesColor4: 'red',
                seriesColor5: 'black',
                axisColor: 'black',
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                useColumns: false,
                decimalPlaces: 1,
                showBulletTarget: true,
                bullet: 'round',
                bulletSize1: 4,
                bulletSize2: 4,
                bulletColor1: 'red',
                bulletColor2: 'black',
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
        var newUniqueIDString = "myCustomSymbol_" + "Tonelaje2" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;
        //var dataArray = [];
        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            //console.log("data.Data", data.Data);
            if (data && data.Data && Array.isArray(data.Data) && data.Data.length >= 5) {
                //var dataArray = [];
                var newArray = [];
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3, stringLabel4, stringUnits4, stringLabel5, stringUnits5;

                // Manejar errores en ambas fuentes de datos
                if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length === 0) {
                    console.error("Datos inválidos para la visualización.");
                    return;
                }

                // Obtener las etiquetas y unidades de ambas fuentes de datos
                if (data.Data[0].Label) {
                    stringLabel1 = data.Data[0].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[0].Units) {
                    stringUnits1 = data.Data[0].Units;
                }
                if (data.Data[1].Label) {
                    stringLabel2 = data.Data[1].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[1].Units) {
                    stringUnits2 = data.Data[1].Units;
                }
                if (data.Data[2].Label) {
                    stringLabel3 = data.Data[2].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[2].Units) {
                    stringUnits3 = data.Data[2].Units;
                }
                if (data.Data[3].Label) {
                    stringLabel4 = data.Data[3].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[3].Units) {
                    stringUnits4 = data.Data[3].Units;
                }
                if (data.Data[4].Label) {
                    stringLabel5 = data.Data[4].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[4].Units) {
                    stringUnits5 = data.Data[4].Units;
                }
                var datalength = data.Data[0].Values.length;
                //console.log("datalength", datalength);

                //creando el nuevo objeto
                if (datalength = data.Data[0].Values.length > 0) {
                    var today2 = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                    var currentDate = new Date(today2);
                    var yearNow2 = currentDate.getFullYear();
                    var monthNow2 = currentDate.getMonth() + 1;
                    var dayNow2 = currentDate.getDate();
                    var daysOfMonth = getDaysOfMonth(monthNow2, yearNow2);


                    for (var i = 1; i <= daysOfMonth; i++) {
                        var newData = {
                            "timestamp": "D" + i,
                            "value1": null, //Valle1
                            "value2": null, //Valle2
                            "value3": null, //Valle3
                            "value4": null, //Forecast
                            "value5": null, //Budget
                        };

                        if (i <= dayNow2) {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueDate = new Date(data.Data[0].Values[j].Time).getDate();
                                if (valueDate === i) {
                                    newData.value1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value1 < 0 || newData.value1 === null) {
                                        newData.value1 = 0;
                                    }
                                    break;
                                }
                            }

                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueDate = new Date(data.Data[1].Values[k].Time).getDate();
                                if (valueDate === i) {
                                    newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value2 < 0 || newData.value2 === null) {
                                        newData.value2 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueDate = new Date(data.Data[2].Values[l].Time).getDate();
                                if (valueDate === i) {
                                    newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value3 < 0 || newData.value3 === null) {
                                        newData.value3 = 0;
                                    }
                                    break;
                                }
                            }

                            for (var m = 0; m < data.Data[3].Values.length; m++) {
                                var valueDate = new Date(data.Data[3].Values[m].Time).getDate();
                                if (valueDate === i) {
                                    newData.value4 = data.Data[3].Values.length > 0 ? parseFloat(("" + data.Data[3].Values[m].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value4 < 0 || newData.value4 === null) {
                                        newData.value4 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var n = 0; n < data.Data[4].Values.length; n++) {
                                var valueDate = new Date(data.Data[4].Values[n].Time).getDate();
                                if (valueDate === i) {
                                    newData.value5 = data.Data[4].Values.length > 0 ? parseFloat(("" + data.Data[4].Values[n].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value5 < 0 || newData.value5 === null) {
                                        newData.value5 = 0;
                                    }
                                    break;
                                }
                            }

                        } else {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                //newData.value1 = 0;
                                valueDate = 0;
                            }
                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                //newData.value2 = 0;
                                valueDate = 0;
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                //newData.value3 = 0;
                                valueDate = 0;
                            }

                            for (var m = 0; m < data.Data[3].Values.length; m++) {
                                var valueDate = new Date(data.Data[3].Values[m].Time).getDate();
                                if (valueDate === i) {
                                    newData.value4 = data.Data[3].Values.length > 0 ? parseFloat(("" + data.Data[3].Values[m].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value4 < 0 || newData.value4 === null) {
                                        newData.value4 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var n = 0; n < data.Data[4].Values.length; n++) {
                                var valueDate = new Date(data.Data[4].Values[n].Time).getDate();
                                if (valueDate === i) {
                                    newData.value5 = data.Data[4].Values.length > 0 ? parseFloat(("" + data.Data[4].Values[n].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value5 < 0 || newData.value5 === null) {
                                        newData.value5 = 0;
                                    }
                                    break;
                                }
                            }
                        }
                        newArray.push(newData);
                        //console.log("newArray" + newUniqueIDString, newArray);

                    }



                } else {
                    var monthNow2 = 0;
                }

                // if (data.Data[0].Values.length > 0) {
                //     var today2 = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                //     var currentDate = new Date(today2);
                //     var yearNow2 = currentDate.getFullYear();
                //     var monthNow2 = currentDate.getMonth() + 1;
                //     var dayNow2 = currentDate.getDate();
                //     var daysOfMonth = getDaysOfMonth(monthNow2, yearNow2);

                //     for (var i = 1; i <= daysOfMonth; i++) {
                //         var newData = {
                //             "timestamp": "D" + i,
                //             "value1": null, //Valle1
                //             "value2": null, //Valle2
                //             "value3": null, //Valle3
                //             "value4": null, //Forecast
                //             "value5": null, //Budget
                //         };

                //         var nextDay = i + 1; // Obtenemos el día siguiente al día actual

                //         if (nextDay <= dayNow2) {
                //             for (var j = 0; j < data.Data[0].Values.length; j++) {
                //                 var valueDate = new Date(data.Data[0].Values[j].Time).getDate();
                //                 if (valueDate === nextDay) { // Buscamos los valores del día siguiente
                //                     newData.value1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                //                     if (newData.value1 < 0 || newData.value1 === null) {
                //                         newData.value1 = 0;
                //                     }
                //                     break;
                //                 }
                //             }

                //             for (var k = 0; k < data.Data[1].Values.length; k++) {
                //                 var valueDate = new Date(data.Data[1].Values[k].Time).getDate();
                //                 if (valueDate === nextDay) {
                //                     newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                //                     if (newData.value2 < 0 || newData.value2 === null) {
                //                         newData.value2 = 0;
                //                     }
                //                     break;
                //                 }
                //             }

                //             for (var l = 0; l < data.Data[2].Values.length; l++) {
                //                 var valueDate = new Date(data.Data[2].Values[l].Time).getDate();
                //                 if (valueDate === nextDay) {
                //                     newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                //                     if (newData.value3 < 0 || newData.value3 === null) {
                //                         newData.value3 = 0;
                //                     }
                //                     break;
                //                 }
                //             }

                //             for (var m = 0; m < data.Data[3].Values.length; m++) {
                //                 var valueDate = new Date(data.Data[3].Values[m].Time).getDate();
                //                 if (valueDate === nextDay) {
                //                     newData.value4 = data.Data[3].Values.length > 0 ? parseFloat(("" + data.Data[3].Values[m].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                //                     if (newData.value4 < 0 || newData.value4 === null) {
                //                         newData.value4 = 0;
                //                     }
                //                     break;
                //                 }
                //             }

                //             for (var n = 0; n < data.Data[4].Values.length; n++) {
                //                 var valueDate = new Date(data.Data[4].Values[n].Time).getDate();
                //                 if (valueDate === nextDay) {
                //                     newData.value5 = data.Data[4].Values.length > 0 ? parseFloat(("" + data.Data[4].Values[n].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                //                     if (newData.value5 < 0 || newData.value5 === null) {
                //                         newData.value5 = 0;
                //                     }
                //                     break;
                //                 }
                //             }
                //         } else {
                //             // No es necesario hacer nada en el "else" ya que los valores por defecto son null
                //         }
                //         newArray.push(newData);
                //         //console.log("newArray" + newUniqueIDString, newArray);
                //     }
                // } else {
                //     var monthNow2 = 0;
                // }




                // Crear o actualizar el gráfico
                if (!chart) {
                    // Crear el gráfico
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        // Propiedades del gráfico
                        "type": "serial",
                        "theme": "light",
                        "depth3D": 1,
                        "angle": 1,
                        "marginRight": 10,
                        "marginLeft": 10,
                        "autoMarginOffset": 10,
                        "addClassNames": true,
                        "titles": createArrayOfChartTitles(),
                        "fontSize": scope.config.fontSize,
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
                            "stackType": "regular",
                            "position": "left"
                        }],
                        "categoryAxis": {
                            "axisColor": scope.config.axisColor,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Graph1",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                "type": "column",
                                //"type": scope.config.typeGraph1,
                                "balloonText": "[[title]]: <b>[[value1]]</b>",
                                "labelPosition": "top",
                                "color": scope.config.seriesColor1,
                                "lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axis1",
                                "valueField": "value1",
                            }, {
                                "id": "Graph2",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                "type": "column",
                                //"type": scope.config.typeGraph2,
                                "balloonText": "[[title]]: <b>[[value2]]</b>",
                                "labelPosition": "top",
                                "color": scope.config.seriesColor2,
                                "lineColor": scope.config.seriesColor2,
                                "title": stringLabel2,
                                "valueAxis": "Axis1",
                                "valueField": "value2",
                            }, {
                                "id": "Graph3",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                //"type": "column",
                                "type": scope.config.typeGraph3,
                                "balloonText": "[[title]]: <b>[[value3]]</b>",
                                "labelPosition": "top",
                                //"labelText": "[[value]]",                               
                                "color": scope.config.seriesColor3,
                                //"lineThickness": 1,
                                "lineColor": scope.config.seriesColor3,
                                "title": stringLabel3,
                                "valueAxis": "Axis1",
                                "valueField": "value3",
                            },
                            {
                                "id": "Grap4",
                                "type": "line",
                                "balloonText": "[[title]]: <b>[[value4]]</b></br>[[stringUnits4]]",
                                "labelPosition": "top",
                                "labelText": "",
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none",
                                "bulletSize": scope.config.bulletSize1,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor1,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor4,
                                "color": scope.config.seriesColor4,
                                "title": stringLabel4,
                                "valueAxis": "Axis1",
                                "valueField": "value4",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            }, {
                                "id": "Grap5",
                                "type": "line",
                                "balloonText": "[[title]]: <b>[[value5]]</b></br>[[stringUnits5]]",
                                "labelPosition": "top",
                                "labelText": "",
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none",
                                "bulletSize": scope.config.bulletSize2,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor2,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor5,
                                "color": scope.config.seriesColor5,
                                "title": stringLabel5,
                                "valueAxis": "Axis1",
                                "valueField": "value5",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            }
                        ],
                        "dataProvider": newArray,
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
                        "export": {
                            "enabled": true
                        },
                        "legend": {
                            "position": scope.config.legendPosition,
                            "equalWidths": false,
                            "color": scope.config.textColor,
                            "fontSize": scope.config.fontSizeLegend,
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
                    chart.dataProvider = newArray;
                    chart.validateData();
                    chart.validateNow();
                }

            } else {
                console.error("Datos inválidos o insuficientes para la visualización.");
            }
        }

        function getDaysOfMonth(numMonth, numYear) {
            numMonth = parseInt(numMonth);
            numYear = parseInt(numYear);

            if (numMonth === 4 || numMonth === 6 || numMonth === 9 || numMonth === 11) {
                return 30;
            } else if (numMonth === 2) {
                return (numYear % 4 === 0 && (numYear % 100 !== 0 || numYear % 400 === 0)) ? 29 : 28;
            } else {
                return 31;
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
                    "text": " " /*+ convertMonthToString(monthNow)*/ ,
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
                //
                if (chart.depth3D !== scope.config.terceraDimension) {
                    chart.depth3D = scope.config.terceraDimension;
                }
                if (chart.angle !== scope.config.angulo) {
                    chart.angle = scope.config.angulo;
                }
                //Gráfico 1
                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                }
                if (chart.graphs[0].color !== scope.config.seriesColor1) {
                    chart.graphs[0].color = scope.config.seriesColor1;
                }
                if (chart.graphs[0].type !== scope.config.typeGraph1) {
                    chart.graphs[0].type = scope.config.typeGraph1;
                }
                //Gráfico 2
                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                }
                if (chart.graphs[1].color !== scope.config.seriesColor2) {
                    chart.graphs[1].color = scope.config.seriesColor2;
                }
                if (chart.graphs[1].type !== scope.config.typeGraph2) {
                    chart.graphs[1].type = scope.config.typeGraph2;
                }
                //Gráfico 3
                if (chart.graphs[2].lineColor !== scope.config.seriesColor3) {
                    chart.graphs[2].lineColor = scope.config.seriesColor3;
                }
                if (chart.graphs[2].color !== scope.config.seriesColor3) {
                    chart.graphs[2].color = scope.config.seriesColor3;
                }
                if (chart.graphs[2].type !== scope.config.typeGraph3) {
                    chart.graphs[2].type = scope.config.typeGraph3;
                }

                //Gráfico 4 - Line 1
                if (chart.graphs[3].lineColor !== scope.config.seriesColor4) {
                    chart.graphs[3].lineColor = scope.config.seriesColor4;
                }
                if (chart.graphs[3].bulletSize !== scope.config.bulletSize1) {
                    chart.graphs[3].bulletSize = scope.config.bulletSize1;
                }
                if (chart.graphs[3].type !== scope.config.typeLine1) {
                    chart.graphs[3].type = scope.config.typeLine1;
                }
                if (chart.graphs[3].bulletColor !== scope.config.bulletColo1) {
                    chart.graphs[3].bulletColor = scope.config.bulletColor1;
                }
                // Update the bul3et shape and visibility
                if (chart.graphs[3].bullet !== (scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none")) {
                    chart.graphs[3].bullet = scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none";
                }

                //Gráfico 4 - Line 2
                if (chart.graphs[4].lineColor !== scope.config.seriesColor5) {
                    chart.graphs[4].lineColor = scope.config.seriesColor5;
                }
                if (chart.graphs[4].bulletSize !== scope.config.bulletSize2) {
                    chart.graphs[4].bulletSize = scope.config.bulletSize2;
                }

                if (chart.graphs[4].type !== scope.config.typeLine2) {
                    chart.graphs[4].type = scope.config.typeLine2;
                }
                if (chart.graphs[4].bulletColor !== scope.config.bulletColo2) {
                    chart.graphs[4].bulletColor = scope.config.bulletColor2;
                }
                // Update the bul4et shape and visibility
                if (chart.graphs[4].bullet !== (scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none")) {
                    chart.graphs[4].bullet = scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none";
                }

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
                chart.legend.fontSize = scope.config.fontSizeLegend;
                chart.legend.position = scope.config.legendPosition;
                // Commit updates to the chart
                chart.validateData();
                chart.validateNow();
                //console.log("Styling updated.");
            }
        }

    };
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);