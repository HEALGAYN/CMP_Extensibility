(function(CS) {
    'use strict';
    var myCustomSymbolDefinition = {
        typeName: 'TonelajeAnual',
        displayName: 'Tonelajes Anual completo',
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
                depth3D: 10,
                angle: 10,
                typeGraph: 'column',
                typeLine1: "line",
                typeLine2: "smoothedLine",
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                seriesColor1: '#086996',
                seriesColor2: 'red',
                seriesColor3: 'black',
                axisColor: 'black',
                showLegend: true,
                fontSizeLegend: 12,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                useColumns: false,
                decimalPlaces: 1,
                showBulletTarget1: true,
                showBulletTarget2: true,
                bullet: 'round',
                bulletSize1: 6,
                bulletSize2: 6,
                bulletColor1: 'red',
                bulletColor2: 'black',
                customTitle: ''
            };
        },
        // Allow use in collections! !!!!!!!!!!!!!!!!!!!!!!!!!
        supportsCollections: true,

        configOptions: function() {
            return [{
                title: 'Editar Formato',
                mode: 'format'
            }];
        }

    };

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;
        var symbolContainerDiv = elem.find('#container')[0];
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;

        function myCustomDataUpdateFunction(data) {
            // console.log(" Datos principales: ", data);
            if (data && data.Data && Array.isArray(data.Data) && data.Data.length >= 3) {
                var dataArray = [];
                var newArray = [];
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3;
                if (data.Data[0].ErrorDescription) {
                    console.error("Error en la fuente de datos 1:", data.Data[0].ErrorDescription);
                }
                if (data.Data[1].ErrorDescription) {
                    console.error("Error en la fuente de datos 2:", data.Data[1].ErrorDescription);
                }
                if (data.Data[2].ErrorDescription) {
                    console.error("Error en la fuente de datos 3:", data.Data[2].ErrorDescription);
                }
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

                //creando el nuevo objeto
                if (data.Data[0].Values.length > 0) {
                    var today2 = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                    var currentDate = new Date(today2);
                    var yearNow2 = currentDate.getFullYear();
                    var monthNow2 = currentDate.getMonth() + 1;
                    var dayNow2 = currentDate.getDate();
                    var daysOfMonth = getDaysOfMonth(monthNow2, yearNow2);
                    var year = yearNow2;
                    var monthsData = getMonthsOfYear(year);
                    //console.log(monthsData);
                    for (var i = 1; i <= monthsData.number; i++) {
                        var monthName = monthsData.names[i - 1];
                        var newData = {
                            "timestamp": monthName,
                            "value1": null,
                            "value2": null,
                            "value3": null,
                        };
                        if (i <= dayNow2) {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueMonth = new Date(data.Data[0].Values[j].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newData.value1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value1 < 0 || newData.value1 === null) {
                                        newData.value1 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueMonth = new Date(data.Data[1].Values[k].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value2 < 0 || newData.value2 === null) {
                                        newData.value2 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueMonth = new Date(data.Data[2].Values[l].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value3 < 0 || newData.value3 === null) {
                                        newData.value3 = 0;
                                    }
                                    break;
                                }
                            }

                        } else {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueDate = 0;
                            }

                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueMonth = new Date(data.Data[1].Values[k].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value2 < 0 || newData.value2 === null) {
                                        newData.value2 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueMonth = new Date(data.Data[2].Values[l].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value3 < 0 || newData.value3 === null) {
                                        newData.value3 = 0;
                                    }
                                    break;
                                }
                            }
                        }
                        newArray.push(newData);
                        // console.log("newArray", newArray);
                    }

                } else {
                    var monthNow2 = 0;
                }
                // Crear o actualizar el gráfico
                if (!chart) {
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
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
                            "position": "left"
                        }],
                        "categoryAxis": {
                            "axisColor": scope.config.axisColor,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Ton1",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                "type": scope.config.typeGraph,
                                "balloonText": "[[title]]: <b>[[value1]]</b>",
                                "labelPosition": "top",
                                "color": scope.config.seriesColor1,
                                "lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axis1",
                                "valueField": "value1",
                            },
                            {
                                "id": "Ton2",
                                "type": "line",
                                "balloonText": "[[title]]: <b>[[value2]]</b></br>[[stringUnits2]]",
                                "labelPosition": "top",
                                //"labelText": "value2",
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none",
                                "bulletSize": scope.config.bulletSize1,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor1,
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
                            },
                            {
                                "id": "Ton3",
                                "type": "smoothedLine",
                                "balloonText": "[[title]]: <b>[[value2]]</b></br>[[stringUnits3]]",
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
                                "lineColor": scope.config.seriesColor3,
                                "color": scope.config.seriesColor3,
                                "title": stringLabel3,
                                "valueAxis": "Axis1",
                                "valueField": "value3",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            }
                        ],
                        "dataProvider": newArray,
                        "categoryField": "timestamp",
                        "chartScrollbar": {
                            "graph": "Ton1",
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
            if (numMonth === 4 || numMonth === 6 || numMonth === 9 || numMonth === 11) {} else if (numMonth === 2) {
                return (numYear % 4 === 0 && (numYear % 100 !== 0 || numYear % 400 === 0)) ? 29 : 28;
            } else {
                return 31;
            }
        }

        function getMonthsOfYear(numYear) {
            numYear = parseInt(numYear);
            var leapYear = (numYear % 4 === 0 && (numYear % 100 !== 0 || numYear % 400 === 0));
            var monthNames = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            if (leapYear) {
                monthNames.unshift("Año Bisiesto");
            }
            var monthsData = {
                number: leapYear ? 13 : 12,
                names: monthNames
            };
            return monthsData;
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
                if (scope.config.showTitle) {
                    chart.titles = createArrayOfChartTitles();
                } else {
                    chart.titles = null;
                }
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
                if (chart.depth3D !== scope.config.terceraDimension) {
                    chart.depth3D = scope.config.terceraDimension;
                }
                if (chart.angle !== scope.config.angulo) {
                    chart.angle = scope.config.angulo;
                }

                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                }
                if (chart.graphs[0].color !== scope.config.seriesColor1) {
                    chart.graphs[0].color = scope.config.seriesColor1;
                }
                if (chart.graphs[0].type !== scope.config.typeGraph) {
                    chart.graphs[0].type = scope.config.typeGraph;
                }
                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                }
                if (chart.graphs[1].bulletSize !== scope.config.bulletSize1) {
                    chart.graphs[1].bulletSize = scope.config.bulletSize1;
                }

                if (chart.graphs[1].type !== scope.config.typeLine1) {
                    chart.graphs[1].type = scope.config.typeLine1;
                }
                if (chart.graphs[1].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[1].bulletColor = scope.config.bulletColor1;
                }
                if (chart.graphs[1].bullet !== (scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none")) {
                    chart.graphs[1].bullet = scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none";
                }
                if (chart.graphs[2].lineColor !== scope.config.seriesColor3) {
                    chart.graphs[2].lineColor = scope.config.seriesColor3;
                }
                if (chart.graphs[2].bulletSize !== scope.config.bulletSize2) {
                    chart.graphs[2].bulletSize = scope.config.bulletSize2;
                }
                if (chart.graphs[2].type !== scope.config.typeLine2) {
                    chart.graphs[2].type = scope.config.typeLine2;
                }
                if (chart.graphs[2].bulletColor !== scope.config.bulletColor2) {
                    chart.graphs[2].bulletColor = scope.config.bulletColor2;
                }
                if (chart.graphs[2].bullet !== (scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none")) {
                    chart.graphs[2].bullet = scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none";
                }
                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
                }
                if (chart.categoryAxis.gridColor !== scope.config.axisColor) {
                    chart.categoryAxis.gridColor = scope.config.axisColor;
                }
                if (chart.valueAxes[0].gridColor !== scope.config.axisColor) {
                    chart.valueAxes[0].gridColor = scope.config.axisColor;
                }
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }
                chart.legend.enabled = scope.config.showLegend;
                chart.legend.fontSize = scope.config.fontSizeLegend;
                chart.legend.position = scope.config.legendPosition;
                chart.validateData();
                chart.validateNow();
                //console.log("Styling updated.");
            }
        }

    };
    CS.symbolCatalog.register(myCustomSymbolDefinition);
})(window.PIVisualization);