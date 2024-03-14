//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '3Valor_MTD_Dif',
        displayName: 'Diferencia, 3 Valores | (MTD)',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_diferencia.png',
        visObjectType: symbolVis,
        //inject: ['timeProvider', '$interval'],
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
                axesStackType: 'none',
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                typeGraph1: 'column',
                typeGraph2: 'line',
                typeGraph3: 'line',
                typeGraph4: 'column',
                showgraph1: 'true',
                showgraph2: 'true',
                showgraph3: 'true',
                showgraph4: 'true',
                seriesColor1: '#005499',
                seriesColor2: '#000000',
                seriesColor3: '#f78f28',
                seriesColor4: '#22b14c',
                NegativeColor: '#ed1c24',
                // Eje X
                axisColor: 'black',
                axisFontSize: 12,
                axisPosition: 'left',
                axisRotation: 0,
                //Eje Y
                axesColor: 'black',
                axesFontSize: 12,
                axesPosition: 'bottom',
                //Graps
                fontSizeBalloon: '16',

                // useColumns: false,
                decimalPlaces: 1,
                showlabelText1: false,
                showlabelText2: false,
                showlabelText3: false,
                showlabelText4: true,
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                labelText3: '[[value3]]',
                labelText4: '[[value4]]',
                showBulletColumn1: true,
                showBulletColumn2: true,
                showBulletColumn3: true,
                showBulletColumn4: true,
                bulletShapeColumn1: 'square',
                bulletShapeColumn2: 'round',
                bulletShapeColumn3: 'round',
                bulletShapeColumn4: 'square',
                fillAlphas1: 0.85,
                fillAlphas2: 0,
                fillAlphas3: 0,
                fillAlphas4: 0.85,
                lineAlpha1: 1,
                lineAlpha2: 1,
                lineAlpha3: 1,
                lineAlpha4: 1,
                bulletSize1: 5,
                bulletSize2: 3,
                bulletSize3: 3,
                bulletSize4: 3,
                lineThickness1: 1,
                lineThickness2: 1,
                lineThickness3: 1,
                lineThickness4: 1,
                bulletColor1: '#005499',
                bulletColor2: '#000000',
                bulletColor3: '#f78f28',
                bulletColor4: '#22b14c',

                labelOffset1: 0,
                labelOffset2: 0,
                labelOffset3: 0,
                labelOffset4: 0,

                labelPosition1: 'top',
                labelPosition2: 'top',
                labelPosition3: 'top',
                labelPosition4: 'top',

                labelRotation1: 0,
                labelRotation2: 0,
                labelRotation3: 0,
                labelRotation4: 0,

                showLegend: true,
                fontSizeLegend: 14,
                textColorLegend: 'black',
                showChartScrollBar: false,
                legendPosition: 'bottom',
                customTitle: ''
            };
        },
        supportsCollections: true,
        configOptions: function() {
            return [{ title: 'Edit Graph', mode: 'format' }];
        }

    };

    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function(scope, elem, timeProvider, $interval) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;
        var symbolContainerDiv = elem.find('#container')[0];
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;

        function myCustomDataUpdateFunction(data) {
            // console.log(data.Data.length);
            if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length >= 3) {
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

                // console.log("datos originales:", data.Data);

                //Fin Data inicial              
                var newArray2 = [];
                var data2 = {};
                for (var i = 0; i < data.Data.length; i++) {
                    var newObjectPrincipal = data.Data[i].Values.map(x => {
                        var fechaInicial = new Date(x.Time);
                        var nuevaFecha = agregarDias(fechaInicial, scope.config.numDias); // sumamos un día
                        x.Time = nuevaFecha.toISOString();
                        return {...x };
                    });
                    var nombrePropiedad = "Data" + i;
                    data2[nombrePropiedad] = newObjectPrincipal;
                }

                if (data2.Data0.length > 0) {
                    var lastDate = data2.Data0[data2.Data0.length - 1].Time;
                    var currentDate = new Date(lastDate);
                    var yearNow = currentDate.getFullYear();
                    var monthNow = currentDate.getMonth() + 1;
                    var dayNow = currentDate.getDate();
                    var daysOfMonth = getDaysOfMonth(monthNow, yearNow);


                    for (var i = 1; i <= daysOfMonth; i++) {
                        var newData = {
                            "timestamp": "D" + i,
                            "value1": null,
                            "value2": null,
                            "value3": null,
                            "value4": null, // Diferencia
                        };

                        if (i <= dayNow) {
                            for (var j = 0; j < data2.Data0.length; j++) {
                                var valueDate2 = new Date(data2.Data0[j].Time);
                                if (valueDate2.getDate() === i && valueDate2.getMonth() + 1 === monthNow) {
                                    newData.value1 = parseFloat(("" + data2.Data0[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) || 0;
                                    newData.value1 = Math.min(1000000, Math.max(0, newData.value1)); // Clamping value between 0 and 1000000
                                    break;
                                }
                            }

                            for (var k = 0; k < data2.Data1.length; k++) {
                                var valueDate2 = new Date(data2.Data1[k].Time);
                                if (valueDate2.getDate() === i && valueDate2.getMonth() + 1 === monthNow) {
                                    newData.value2 = parseFloat(("" + data2.Data1[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) || 0;
                                    newData.value2 = Math.min(1000000, Math.max(0, newData.value2)); // Clamping value between 0 and 1000000
                                    break;
                                }
                            }
                            // Buscar el valor correspondiente en data2.Data0 para calcular la diferencia
                            // for (var l = 0; l < data2.Data0.length; l++) {
                            //     var valueDate2 = new Date(data2.Data0[l].Time);
                            //     if (valueDate2.getDate() === i && valueDate2.getMonth() + 1 === monthNow) {
                            //         if (data2.Data0[j] && data2.Data1[k]) {
                            //             newData.value3 = (parseFloat(("" + data2.Data0[j].Value).replace(",", ".")) - parseFloat(("" + data2.Data1[k].Value).replace(",", "."))).toFixed(scope.config.decimalPlaces) || 0;
                            //             //newData.value3 = Math.min(1000000, newData.value3); // Clamping value between 0 and 1000000
                            //         }
                            //         break;
                            //     }
                            // }
                            for (var l = 0; l < data2.Data2.length; l++) {
                                var valueDate2 = new Date(data2.Data2[l].Time);
                                if (valueDate2.getDate() === i && valueDate2.getMonth() + 1 === monthNow) {
                                    newData.value3 = parseFloat(("" + data2.Data2[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) || 0;
                                    newData.value3 = Math.min(1000000, Math.max(0, newData.value3)); // Clamping value between 0 and 1000000
                                    break;
                                }
                            }
                            for (var m = 0; m < data2.Data0.length; m++) {
                                var valueDate2 = new Date(data2.Data0[m].Time);
                                if (valueDate2.getDate() === i && valueDate2.getMonth() + 1 === monthNow) {
                                    if (data2.Data0[j] && data2.Data1[k]) {
                                        newData.value4 = (parseFloat(("" + data2.Data0[j].Value).replace(",", ".")) - parseFloat(("" + data2.Data1[k].Value).replace(",", "."))).toFixed(scope.config.decimalPlaces) || 0;
                                        newData.value4 = Math.min(1000000, newData.value4); // Clamping value between 0 and 1000000
                                    }
                                    break;
                                }
                            }
                        } else {
                            newData.value1 = null;
                            newData.value2 = null;
                            newData.value3 = null;
                            newData.value4 = null;
                        }

                        newArray2.push(newData);

                    }

                } else {
                    var monthNow = 0;
                }
                // console.log('newArray2: ', newArray2);

                //Crear o actualizar el gráfico
                // createOrUpdateChart(newData);
                if (!chart) {
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "type": "serial",
                        "theme": "light",
                        "depth3D": scope.config.terceraDimension,
                        "angle": scope.config.angulo,
                        "marginRight": 10,
                        "marginLeft": 10,
                        "autoMarginOffset": 10,
                        // "rotate": scope.config.isRotate,
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
                            "axisColor": scope.config.axesColor,
                            "gridAlpha": 0,
                            "fontSize": scope.config.axesFontSize,
                            "stackType": scope.config.axesStackType,
                            "position": scope.config.axesPosition,
                        }],
                        "categoryAxis": {
                            "position": scope.config.axisPosition,
                            // "inside": true,
                            "gridPosition": "start",
                            "axisColor": scope.config.axisColor, // Linea eje x color    
                            "axisAlpha": 1,
                            "gridAlpha": 0,
                            "fontSize": scope.config.axisFontSize,
                            "labelRotation": scope.config.axisRotation,
                            "autoWrap": true,
                        },
                        "trendLines": [],
                        "guides": [],
                        "graphs": [{
                                "id": "Graph1",
                                "type": scope.config.typeGraph1,
                                "fillAlphas": scope.config.fillAlphas1,
                                "lineAlpha": scope.config.lineAlpha1,
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
                                "labelPosition": scope.config.labelPosition1,
                                "labelOffset": scope.config.labelOffset1,
                                "labelRotation": scope.config.labelRotation1,
                                "newStack": "stack1",
                            },
                            {
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
                                "labelPosition": scope.config.labelPosition2,
                                "labelOffset": scope.config.labelOffset2,
                                "labelRotation": scope.config.labelRotation2,
                                "newStack": "stack2",
                            },
                            {
                                "id": "Graph3",
                                "type": scope.config.typeGraph3,
                                "fillAlphas": scope.config.fillAlphas3,
                                "lineAlpha": scope.config.lineAlpha3,
                                "balloonText": "[[title]]: <b>[[value3]] </b> </br> Fecha: <b>[[timestamp]]</b>",
                                "bullet": scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none",
                                "bulletSize": scope.config.bulletSize3,
                                "bulletColor": scope.config.bulletColor3,
                                "labelText": scope.config.showlabelText3 ? "[[value3]]" : null,
                                "color": scope.config.seriesColor3,
                                "lineThickness": scope.config.lineThickness3,
                                "lineColor": scope.config.seriesColor3,
                                "title": stringLabel3,
                                "valueAxis": "Axis1",
                                "valueField": "value3",
                                "labelPosition": scope.config.labelPosition3,
                                "labelOffset": scope.config.labelOffset3,
                                "labelRotation": scope.config.labelRotation3,
                                "newStack": "stack3",
                            },
                            {
                                "id": "Graph4",
                                "type": scope.config.typeGraph4,
                                "fillAlphas": scope.config.fillAlphas4,
                                "lineAlpha": scope.config.lineAlpha4,
                                "balloonText": "[[title]]: <b>[[value4]]</b> </br> Fecha: <b>[[timestamp]]</b>",
                                "balloonColor": "transparent",
                                "bullet": scope.config.showBulletColumn4 ? scope.config.bulletShapeColumn4 : "none",
                                "bulletSize": scope.config.bulletSize4,
                                "bulletColor": scope.config.bulletColor4,
                                "labelText": scope.config.showlabelText4 ? "[[value4]]" : null,
                                "color": scope.config.textColor,
                                "lineColor": scope.config.seriesColor4,
                                "negativeFillAlphas": 0,
                                "negativeFillColors": scope.config.NegativeColor,
                                "negativeLineAlpha": 0,
                                "negativeLineColor": scope.config.NegativeColor,
                                "openField": "value2",
                                "closeField": "value1",
                                "valueField": "value1",
                                "lineThickness": scope.config.lineThickness4,
                                "title": "Diferencia",
                                //"clustered": true,
                                "labelPosition": scope.config.labelPosition4,
                                "labelOffset": scope.config.labelOffset4,
                                "labelRotation": scope.config.labelRotation4,
                                "newStack": "stack4",
                            }

                        ],
                        // "responsive": { "enabled": true },
                        "dataProvider": newArray2,
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
                            "color": scope.config.textColorLegend,
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
                    // if (scope.config.showgraph1) {
                    //     chart.showGraph(chart.graphs[0]);
                    // } else {
                    //     chart.hideGraph(chart.graphs[0]);
                    // }
                    // if (scope.config.showgraph2) {
                    //     chart.showGraph(chart.graphs[1]);
                    // } else {
                    //     chart.hideGraph(chart.graphs[1]);
                    // }
                    // if (scope.config.showgraph3) {
                    //     chart.showGraph(chart.graphs[2]);
                    // } else {
                    //     chart.hideGraph(chart.graphs[2]);
                    // }


                    chart.dataProvider = newArray2;
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
                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
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
                if (chart.graphs[0].labelText !== (scope.config.showlabelText1 ? "[[value2]]" : null)) {
                    chart.graphs[0].labelText = scope.config.showlabelText1 ? "[[value2]]" : null;
                }
                if (chart.graphs[0].labelPosition !== scope.config.labelPosition1) {
                    chart.graphs[0].labelPosition = scope.config.labelPosition1;
                }
                if (chart.graphs[0].labelOffset !== scope.config.labelOffset1) {
                    chart.graphs[0].labelOffset = scope.config.labelOffset1;
                }
                if (chart.graphs[0].labelRotation !== scope.config.labelRotation1) {
                    chart.graphs[0].labelRotation = scope.config.labelRotation1;
                }
                if (chart.graphs[0].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[0].bulletColor = scope.config.bulletColor1;
                }
                if (chart.graphs[0].bulletSize !== scope.config.bulletSize1) {
                    chart.graphs[0].bulletSize = scope.config.bulletSize1;
                }
                if (chart.graphs[0].bullet !== (scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none")) {
                    chart.graphs[0].bullet = scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none";
                }
                if (chart.graphs[0].balloonText !== scope.config.balloonText) {
                    chart.graphs[0].balloonText = scope.config.balloonText;
                }
                if (scope.config.showgraph1) {
                    chart.showGraph(chart.graphs[0]);
                } else {
                    chart.hideGraph(chart.graphs[0]);
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
                if (chart.graphs[1].labelPosition !== scope.config.labelPosition2) {
                    chart.graphs[1].labelPosition = scope.config.labelPosition2;
                }
                if (chart.graphs[1].labelRotation !== scope.config.labelRotation2) {
                    chart.graphs[1].labelRotation = scope.config.labelRotation2;
                }
                if (chart.graphs[1].labelOffset !== scope.config.labelOffset2) {
                    chart.graphs[1].labelOffset = scope.config.labelOffset2;
                }
                if (chart.graphs[1].bulletColor !== scope.config.bulletColor2) {
                    chart.graphs[1].bulletColor = scope.config.bulletColor2;
                }
                if (chart.graphs[1].bulletSize !== scope.config.bulletSize2) {
                    chart.graphs[1].bulletSize = scope.config.bulletSize2;
                }
                if (chart.graphs[1].bullet !== (scope.config.showBulletColumn2 ? scope.config.bulletShapeColumn2 : "none")) {
                    chart.graphs[1].bullet = scope.config.showBulletColumn2 ? scope.config.bulletShapeColumn2 : "none";
                }
                if (scope.config.showgraph2) {
                    chart.showGraph(chart.graphs[1]);
                } else {
                    chart.hideGraph(chart.graphs[1]);
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
                if (chart.graphs[2].labelPosition !== scope.config.labelPosition3) {
                    chart.graphs[2].labelPosition = scope.config.labelPosition3;
                }
                if (chart.graphs[2].labelRotation !== scope.config.labelRotation3) {
                    chart.graphs[2].labelRotation = scope.config.labelRotation3;
                }
                if (chart.graphs[2].labelOffset !== scope.config.labelOffset3) {
                    chart.graphs[2].labelOffset = scope.config.labelOffset3;
                }
                if (chart.graphs[2].bulletColor !== scope.config.bulletColor3) {
                    chart.graphs[2].bulletColor = scope.config.bulletColor3;
                }
                if (chart.graphs[2].bulletSize !== scope.config.bulletSize3) {
                    chart.graphs[2].bulletSize = scope.config.bulletSize3;
                }
                if (chart.graphs[2].bullet !== (scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none")) {
                    chart.graphs[2].bullet = scope.config.showBulletColumn3 ? scope.config.bulletShapeColumn3 : "none";
                }
                if (scope.config.showgraph3) {
                    chart.showGraph(chart.graphs[2]);
                } else {
                    chart.hideGraph(chart.graphs[2]);
                }

                //Graph4
                if (chart.graphs[3].negativeLineColor !== scope.config.negativeLineColor) {
                    chart.graphs[3].negativeLineColor = scope.config.negativeLineColor;
                }
                if (chart.graphs[3].negativeFillColors !== scope.config.negativeFillColors) {
                    chart.graphs[3].negativeFillColors = scope.config.negativeFillColors;
                }
                if (chart.graphs[3].lineColor !== scope.config.seriesColor4) {
                    chart.graphs[3].lineColor = scope.config.seriesColor4;
                }
                if (chart.graphs[3].fillAlphas !== scope.config.fillAlphas4) {
                    chart.graphs[3].fillAlphas = scope.config.fillAlphas4;
                }
                if (chart.graphs[3].lineAlpha !== scope.config.lineAlpha4) {
                    chart.graphs[3].lineAlpha = scope.config.lineAlpha4;
                }
                if (chart.graphs[3].lineThickness !== scope.config.lineThickness4) {
                    chart.graphs[3].lineThickness = scope.config.lineThickness4;
                }
                if (chart.graphs[3].color !== scope.config.textColor) {
                    chart.graphs[3].color = scope.config.textColor;
                }
                if (chart.graphs[3].type !== scope.config.typeGraph4) {
                    chart.graphs[3].type = scope.config.typeGraph4;
                }
                if (chart.graphs[3].labelText !== (scope.config.showlabelText4 ? "[[value4]]" : null)) {
                    chart.graphs[3].labelText = scope.config.showlabelText4 ? "[[value4]]" : null;
                }
                if (chart.graphs[3].labelPosition !== scope.config.labelPosition4) {
                    chart.graphs[3].labelPosition = scope.config.labelPosition4;
                }
                if (chart.graphs[3].labelRotation !== scope.config.labelRotation4) {
                    chart.graphs[3].labelRotation = scope.config.labelRotation4;
                }
                if (chart.graphs[3].labelOffset !== scope.config.labelOffset4) {
                    chart.graphs[3].labelOffset = scope.config.labelOffset4;
                }
                if (chart.graphs[3].bulletColor !== scope.config.bulletColor4) {
                    chart.graphs[3].bulletColor = scope.config.bulletColor4;
                }
                if (chart.graphs[3].bulletSize !== scope.config.bulletSize4) {
                    chart.graphs[3].bulletSize = scope.config.bulletSize4;
                }
                if (chart.graphs[3].bullet !== (scope.config.showBulletColumn4 ? scope.config.bulletShapeColumn4 : "none")) {
                    chart.graphs[3].bullet = scope.config.showBulletColumn4 ? scope.config.bulletShapeColumn4 : "none";
                }
                if (scope.config.showgraph4) {
                    chart.showGraph(chart.graphs[3]);
                } else {
                    chart.hideGraph(chart.graphs[3]);
                }

                //para eje X
                if (chart.categoryAxis.gridColor !== scope.config.axisColor) {
                    chart.categoryAxis.gridColor = scope.config.axisColor;
                }
                if (chart.categoryAxis.fontSize !== scope.config.axisFontSize) {
                    chart.categoryAxis.fontSize = scope.config.axisFontSize;
                }
                if (chart.categoryAxis.labelRotation !== scope.config.axisRotation) {
                    chart.categoryAxis.labelRotation = scope.config.axisRotation;
                }
                chart.categoryAxis.position = scope.config.axisPosition;
                //para eje Y

                if (chart.valueAxes[0].gridColor !== scope.config.axesColor) {
                    chart.valueAxes[0].gridColor = scope.config.axesColor;
                }
                if (chart.valueAxes[0].fontSize !== scope.config.axesFontSize) {
                    chart.valueAxes[0].fontSize = scope.config.axesFontSize;
                }
                if (chart.valueAxes[0].stackType !== scope.config.axesStackType) {
                    chart.valueAxes[0].stackType = scope.config.axesStackType;
                }
                chart.valueAxes[0].position = scope.config.axesPosition;
                // Update the scroll bar
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }

                chart.legend.enabled = scope.config.showLegend;
                chart.legend.fontSize = scope.config.fontSizeLegend;
                chart.legend.textColorLegend = scope.config.textColorLegend;
                chart.legend.position = scope.config.legendPosition;

                chart.validateData();
                chart.validateNow();

            }
        }
    };

    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);