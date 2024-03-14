//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '3Valor_YTD',
        displayName: '3 Valores | (YTD)',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_3valores.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                Height: 300,
                Width: 1000,
                numDias: 0,
                Intervals: 1000,
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: 'black',
                fontSize: 14,
                terceraDimension: 1,
                angulo: 1,
                stackType: 'regular',
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                typeGraph1: 'smoothedLine',
                typeGraph2: 'smoothedLine',
                typeGraph3: 'smoothedLine',
                // typeLine1: "line",
                // typeLine2: "smoothedLine",

                seriesColor1: '#c03a6c',
                seriesColor2: '#005499',
                seriesColor3: '#f78f28',
                // seriesColor4: '#00a2e8',
                // seriesColor5: 'black',
                axisColor: 'black',

                useColumns: false,
                decimalPlaces: 1,
                showlabelText1: false,
                showlabelText2: false,
                showlabelText3: false,
                // showlabelText4: false,
                // showlabelText5: false,
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                labelText3: '[[value3]]',
                showBulletColumn1: false,
                showBulletColumn2: false,
                showBulletColumn3: false,
                bulletShapeColumn1: 'square',
                bulletShapeColumn2: 'square',
                bulletShapeColumn3: 'square',
                // bulletShapeTarget1: 'round',
                // bulletShapeTarget2: 'round',
                fillAlphas1: 0.85,
                fillAlphas2: 0.85,
                fillAlphas3: 0.85,
                // fillAlphas4: 0,
                // fillAlphas5: 0,
                lineAlpha1: 0.1,
                lineAlpha2: 0.1,
                lineAlpha3: 0.1,
                // lineAlpha4: 1,
                // lineAlpha5: 1,
                bulletSize1: 3,
                bulletSize2: 3,
                bulletSize3: 3,
                // bulletSize4: 6,
                // bulletSize5: 6,
                bulletColor1: '#c03a6c',
                bulletColor2: '#005499',
                bulletColor3: '#f78f28',
                // bulletColor4: '#00a2e8',
                // bulletColor5: 'black',
                lineThickness1: 3,
                lineThickness2: 3,
                lineThickness3: 3,
                showLegend: true,
                fontSizeLegend: 12,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                customTitle: ''
            };
        },
        supportsCollections: true,
        configOptions: function() {
            return [{
                title: 'Edit Graph',
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


            if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length >= 2) {
                //Data Inicial             
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3;
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

                //Fin Data inicial   
                // console.log("data", data);
                var newArray = [];
                var newObject = {};
                for (var i = 0; i < data.Data.length; i++) {
                    var newObjetPrincipal = data.Data[i].Values.map(x => {
                        var fechaInicial = new Date(x.Time);
                        var nuevaFecha = agregarDias(fechaInicial, scope.config.numDias); // sumamos un día
                        x.Time = nuevaFecha.toISOString();
                        return {...x };
                    });
                    var nombrePropiedad = "Data" + i;
                    newObject[nombrePropiedad] = newObjetPrincipal;
                }
                // debugger;
                if (newObject.Data0.length > 0) {
                    //var lastDate = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                    var lastDate = newObject.Data0[newObject.Data0.length - 1].Time;
                    //lastDate = endtime
                    var currentDate = new Date(lastDate);
                    var year = currentDate.getFullYear();
                    var monthNow = currentDate.getMonth() + 1;
                    var dayNow = currentDate.getDate();
                    var daysOfMonth = getDaysOfMonth(monthNow, year);
                    var monthsData = getMonthsOfYear(year);

                    for (var i = 1; i <= monthsData.number; i++) {
                        var monthName = monthsData.names[i - 1];
                        var newObject = {
                            "timestamp": monthName,
                            "value1": null,
                            "value2": null,
                            "value3": null
                        };

                        if (i <= monthNow) {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueMonth = new Date(data.Data[0].Values[j].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newObject.value1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newObject.value1 < 0 || newObject.value1 === null) {
                                        newObject.value1 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueMonth = new Date(data.Data[1].Values[k].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newObject.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newObject.value2 < 0 || newObject.value2 === null) {
                                        newObject.value2 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueMonth = new Date(data.Data[2].Values[l].Time).getMonth() + 1;
                                if (valueMonth === i) {
                                    newObject.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newObject.value3 < 0 || newObject.value3 === null) {
                                        newObject.value3 = 0;
                                    }
                                    break;
                                }
                            }

                        } else {
                            newObject.value1 = null;
                            newObject.value2 = null;
                            newObject.value3 = null;
                        }
                        newArray.push(newObject);
                        // console.log("newArray", newArray);

                    }
                } else {
                    var monthNow = 0;
                }

                //Crear o actualizar el gráfico
                // createOrUpdateChart(newObject);
                if (!chart) {
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "type": "serial",
                        "theme": "light",
                        "depth3D": scope.config.terceraDimension,
                        "angle": scope.config.angulo,
                        "marginRight": 10,
                        "marginLeft": 10,
                        "autoMarginOffset": 10,
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
                            "stackType": scope.config.stackType,
                            "position": "left"
                        }],
                        "categoryAxis": {
                            "axisColor": scope.config.axisColor, // Linea eje x color    
                            "axisAlpha": 1,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                            "id": "Graph1",
                            "fillAlphas": scope.config.fillAlphas1,
                            "lineAlpha": scope.config.lineAlpha1,
                            "type": scope.config.typeGraph1,
                            "balloonText": "[[title]]: <b>[[value1]]</b> </br> Fecha: <b>[[timestamp]]</b>",
                            "bullet": scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none",
                            "bulletSize": scope.config.bulletSize1,
                            "bulletColor": scope.config.bulletColor1,
                            "labelText": scope.config.showlabelText1 ? "[[value1]]" : null,
                            "color": scope.config.seriesColor1,
                            "lineThickness": scope.config.lineThickness1,
                            "lineColor": scope.config.seriesColor1,
                            "title": stringLabel1,
                            "valueAxis": "Axis1",
                            "valueField": "value1",
                        }, {
                            "id": "Graph2",
                            "type": scope.config.typeGraph2,
                            "fillAlphas": scope.config.fillAlphas2,
                            "lineAlpha": scope.config.lineAlpha2,
                            "balloonText": "[[title]]: <b>[[value2]]</b> </br> Fecha: <b>[[timestamp]]</b>",
                            "bullet": scope.config.showBulletColumn2 ? scope.config.bulletShapeColumn2 : "none",
                            "bulletSize": scope.config.bulletSize2,
                            "bulletColor": scope.config.bulletColor2,
                            "labelText": scope.config.showlabelText2 ? "[[value2]]" : null,
                            "color": scope.config.seriesColor2,
                            "lineThickness": scope.config.lineThickness2,
                            "lineColor": scope.config.seriesColor2,
                            "title": stringLabel2,
                            "valueAxis": "Axis1",
                            "valueField": "value2",
                        }, {
                            "id": "Graph3",
                            "type": scope.config.typeGraph3,
                            "fillAlphas": scope.config.fillAlphas3,
                            "lineAlpha": scope.config.lineAlpha3,
                            "balloonText": "[[title]]: <b>[[value3]]</b> </br> Fecha: <b>[[timestamp]]</b>",
                            "bullet": scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none",
                            "bulletSize": scope.config.bulletSize3,
                            "bulletColor": scope.config.bulletColor3,
                            "labelText": scope.config.showlabelText3 ? "[[value3]]" : null,
                            // "topRadius": 1,
                            "color": scope.config.seriesColor3,
                            "lineThickness": scope.config.lineThickness3,
                            "lineColor": scope.config.seriesColor3,
                            "title": stringLabel3,
                            "valueAxis": "Axis1",
                            "valueField": "value3",
                        }],
                        "dataProvider": newArray,
                        "categoryField": "timestamp",
                        "chartScrollbar": {
                            "graph": "g1",
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
                console.log("Datos inválidos o insuficientes para la visualización.");
                // showErrorPopup();
                // return;                
            }
        }

        function agregarDias(fecha, dias) {
            var nuevaFecha = new Date(fecha.valueOf());
            nuevaFecha.setDate(nuevaFecha.getDate() + dias);
            return nuevaFecha;
        }

        function getDaysOfMonth(numMonth, numYear) {
            numMonth = parseInt(numMonth);
            numYear = parseInt(numYear);

            if (numMonth === 4 || numMonth === 6 || numMonth === 9 || numMonth === 11) {
                return 30; // Abril, Junio, Septiembre y Noviembre tienen 30 días
            } else if (numMonth === 2) {
                // Si el año es divisible por 4 y no es divisible por 100 (a menos que también sea divisible por 400), Febrero tiene 29 días
                return (numYear % 4 === 0 && (numYear % 100 !== 0 || numYear % 400 === 0)) ? 29 : 28;
            } else {
                return 31; // El resto de los meses tiene 31 días por defecto
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
                //Graph 1
                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                }
                if (chart.graphs[0].fillAlphas !== scope.config.fillAlphas1) {
                    chart.graphs[0].fillAlphas = scope.config.fillAlphas1;
                }
                if (chart.graphs[0].lineAlpha !== scope.config.lineAlpha1) {
                    chart.graphs[0].lineAlpha = scope.config.lineAlpha1;
                }
                if (chart.graphs[0].lineThickness !== scope.config.lineThickness1) {
                    chart.graphs[0].lineThickness = scope.config.lineThickness1;
                }
                if (chart.graphs[0].color !== scope.config.seriesColor1) {
                    chart.graphs[0].color = scope.config.seriesColor1;
                }
                if (chart.graphs[0].type !== scope.config.typeGraph1) {
                    chart.graphs[0].type = scope.config.typeGraph1;
                }
                if (chart.graphs[0].labelText !== (scope.config.showlabelText1 ? "[[value1]]" : null)) {
                    chart.graphs[0].labelText = scope.config.showlabelText1 ? "[[value1]]" : null;
                }
                if (chart.graphs[0].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[0].bulletColor = scope.config.bulletColor1;
                }
                if (chart.graphs[0].bullet !== (scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none")) {
                    chart.graphs[0].bullet = scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none";
                }
                //Graph 2
                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                }
                if (chart.graphs[1].fillAlphas !== scope.config.fillAlphas2) {
                    chart.graphs[1].fillAlphas = scope.config.fillAlphas2;
                }
                if (chart.graphs[1].lineAlpha !== scope.config.lineAlpha2) {
                    chart.graphs[1].lineAlpha = scope.config.lineAlpha2;
                }
                if (chart.graphs[1].lineThickness !== scope.config.lineThickness2) {
                    chart.graphs[1].lineThickness = scope.config.lineThickness2;
                }
                if (chart.graphs[1].color !== scope.config.seriesColor2) {
                    chart.graphs[1].color = scope.config.seriesColor2;
                }
                if (chart.graphs[1].type !== scope.config.typeGraph2) {
                    chart.graphs[1].type = scope.config.typeGraph2;
                }
                if (chart.graphs[1].labelText !== (scope.config.showlabelText2 ? "[[value2]]" : null)) {
                    chart.graphs[1].labelText = scope.config.showlabelText2 ? "[[value2]]" : null;
                }
                if (chart.graphs[1].bulletColor !== scope.config.bulletColor2) {
                    chart.graphs[1].bulletColor = scope.config.bulletColor2;
                }
                if (chart.graphs[1].bullet !== (scope.config.showBulletColumn2 ? scope.config.bulletShapeColumn2 : "none")) {
                    chart.graphs[1].bullet = scope.config.showBulletColumn2 ? scope.config.bulletShapeColumn2 : "none";
                }
                //Graph 3
                if (chart.graphs[2].lineColor !== scope.config.seriesColor3) {
                    chart.graphs[2].lineColor = scope.config.seriesColor3;
                }
                if (chart.graphs[2].fillAlphas !== scope.config.fillAlphas3) {
                    chart.graphs[2].fillAlphas = scope.config.fillAlphas3;
                }
                if (chart.graphs[2].lineAlpha !== scope.config.lineAlpha3) {
                    chart.graphs[2].lineAlpha = scope.config.lineAlpha3;
                }
                if (chart.graphs[2].lineThickness !== scope.config.lineThickness3) {
                    chart.graphs[2].lineThickness = scope.config.lineThickness3;
                }
                if (chart.graphs[2].color !== scope.config.seriesColor3) {
                    chart.graphs[2].color = scope.config.seriesColor3;
                }
                if (chart.graphs[2].type !== scope.config.typeGraph3) {
                    chart.graphs[2].type = scope.config.typeGraph3;
                }
                if (chart.graphs[2].labelText !== (scope.config.showlabelText3 ? "[[value3]]" : null)) {
                    chart.graphs[2].labelText = scope.config.showlabelText3 ? "[[value3]]" : null;
                }
                if (chart.graphs[2].bulletColor !== scope.config.bulletColor3) {
                    chart.graphs[2].bulletColor = scope.config.bulletColor3;
                }
                if (chart.graphs[2].bullet !== (scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none")) {
                    chart.graphs[2].bullet = scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none";
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
                if (chart.valueAxes[0].stackType !== scope.config.stackType) {
                    chart.valueAxes[0].stackType = scope.config.stackType;
                }
                // Update the scroll bar
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