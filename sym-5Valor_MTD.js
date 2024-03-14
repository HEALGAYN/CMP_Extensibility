//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '5Valor_MTD',
        displayName: '5 Valores | (MTD)',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_5valores.png',
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
                axesStackType: 'regular',
                typeGraph1: 'column',
                typeGraph2: 'column',
                typeGraph3: 'column',
                typeLine1: "line",
                typeLine2: "smoothedLine",
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                seriesColor1: '#c03a6c',
                seriesColor2: '#005499',
                seriesColor3: '#f78f28',
                seriesColor4: '#00a2e8',
                seriesColor5: 'black',
                // Eje X
                axisColor: 'black',
                axisFontSize: 12,
                axisPosition: 'left',
                //Eje Y
                axesColor: 'black',
                axesFontSize: 12,
                axesPosition: 'bottom',

                showLegend: true,
                fontSizeLegend: 12,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                useColumns: false,
                decimalPlaces: 1,
                showlabelText1: false,
                showlabelText2: false,
                showlabelText3: false,
                showlabelText4: false,
                showlabelText5: false,
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                labelText3: '[[value3]]',
                labelText4: '[[value4]]',
                labelText5: '[[value5]]',
                showBulletColumn1: false,
                showBulletColumn2: false,
                showBulletColumn3: false,
                showBulletTarget1: true,
                showBulletTarget2: true,
                bulletShapeColumn1: 'square',
                bulletShapeColumn2: 'square',
                bulletShapeColumn3: 'square',
                bulletShapeTarget1: 'round',
                bulletShapeTarget2: 'round',
                fillAlphas1: 0.85,
                fillAlphas2: 0.85,
                fillAlphas3: 0.85,
                fillAlphas4: 0,
                fillAlphas5: 0,
                lineAlpha1: 0.1,
                lineAlpha2: 0.1,
                lineAlpha3: 0.1,
                lineAlpha4: 1,
                lineAlpha5: 1,
                bulletSize1: 3,
                bulletSize2: 3,
                bulletSize3: 3,
                bulletSize4: 6,
                bulletSize5: 6,
                bulletColor1: '#c03a6c',
                bulletColor2: '#005499',
                bulletColor3: '#f78f28',
                bulletColor4: '#00a2e8',
                bulletColor5: 'black',
                textColorLegend: 'black',
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
            if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length >= 4) {
                //Data Inicial
                // console.log("Datos Originales: ", data);
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3, stringLabel4, stringUnits4, stringLabel5, stringUnits5;
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
                //Fin Data inicial              
                var newArray2 = [];
                var data2 = {};
                for (var i = 0; i < data.Data.length; i++) {
                    var newObjetPrincipal = data.Data[i].Values.map(x => {
                        var fechaInicial = new Date(x.Time);
                        var nuevaFecha = agregarDias(fechaInicial, scope.config.numDias); // sumamos un día
                        x.Time = nuevaFecha.toISOString();
                        return {...x };
                    });
                    var nombrePropiedad = "Data" + i;
                    data2[nombrePropiedad] = newObjetPrincipal;
                }

                if (data2.Data0.length > 0) {
                    //var lastDate = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                    var lastDate = data2.Data0[data2.Data0.length - 1].Time;
                    //lastDate = endtime
                    var currentDate2 = new Date(lastDate);
                    // console.log("currentDate2", currentDate2);
                    var yearNow2 = currentDate2.getFullYear();
                    var monthNow2 = currentDate2.getMonth() + 1;
                    var dayNow2 = currentDate2.getDate();
                    var daysOfMonth2 = getDaysOfMonth(monthNow2, yearNow2);

                    for (var i = 1; i <= daysOfMonth2; i++) {
                        var newData2 = {
                            "timestamp": "D" + i,
                            "value1": null,
                            "value2": null,
                            "value3": null,
                            "value4": null,
                            "value5": null,
                        };

                        if (i <= dayNow2) {
                            for (var j = 0; j < data2.Data0.length; j++) {
                                var valueDate2 = new Date(data2.Data0[j].Time).getDate();
                                if (valueDate2 === i) {
                                    newData2.value1 = data2.Data0.length > 0 ? parseFloat(("" + data2.Data0[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value1 < 0 || newData2.value1 > 1000000) {
                                        newData2.value1 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var k = 0; k < data2.Data1.length; k++) {
                                var valueDate2 = new Date(data2.Data1[k].Time).getDate();
                                if (valueDate2 === i) {
                                    newData2.value2 = data2.Data1.length > 0 ? parseFloat(("" + data2.Data1[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value2 < 0 || newData2.value2 > 1000000) {
                                        newData2.value2 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var l = 0; l < data2.Data2.length; l++) {
                                var valueDate2 = new Date(data2.Data2[l].Time).getDate();
                                if (valueDate2 === i) {
                                    newData2.value3 = data2.Data2.length > 0 ? parseFloat(("" + data2.Data2[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value3 < 0 || newData2.value3 > 1000000) {
                                        newData2.value3 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var m = 0; m < data2.Data3.length; m++) {
                                var valueDate2 = new Date(data2.Data2[m].Time).getDate();
                                if (valueDate2 === i) {
                                    newData2.value4 = data2.Data3.length > 0 ? parseFloat(("" + data2.Data3[m].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value4 < 0 || newData2.value4 > 1000000) {
                                        newData2.value4 = 0;
                                    }
                                    break;
                                }
                            }
                            for (var n = 0; n < data2.Data4.length; n++) {
                                //data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data2[n].Time).getDate();
                                if (valueDate2 === i) {
                                    newData2.value5 = data2.Data4.length > 0 ? parseFloat(("" + data2.Data4[n].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value5 < 0 || newData2.value5 > 1000000) {
                                        newData2.value5 = 0;
                                    }
                                    break;
                                }
                            }

                        } else {
                            newData2.value1 = null;
                            newData2.value2 = null;
                            newData2.value3 = null;
                            newData2.value4 = null;
                            newData2.value5 = null;
                        }
                        newArray2.push(newData2);
                        //console.log("newArray2: ", newArray2);                        
                    }
                } else {
                    var monthNow2 = 0;
                }

                //Crear o actualizar el gráfico
                // createOrUpdateChart(newData2);
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
                            "id": "Axes1",
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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axes1",
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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor2,
                                "title": stringLabel2,
                                "valueAxis": "Axes1",
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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor3,
                                "title": stringLabel3,
                                "valueAxis": "Axes1",
                                "valueField": "value3",
                            },
                            {
                                "id": "Graph4",
                                "type": scope.config.typeLine1,
                                "fillAlphas": scope.config.fillAlphas4,
                                "lineAlpha": scope.config.lineAlpha4,
                                "balloonText": "[[title]]: <b>[[value4]]</b></br> Fecha: <b>[[timestamp]]</b>",
                                "labelPosition": "top",
                                "labelText": scope.config.showlabelText4 ? "[[value4]]" : null,
                                "fontSize": scope.config.fontSize,
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none",
                                "bulletSize": scope.config.bulletSize4,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor4,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "lineColor": scope.config.seriesColor4,
                                "color": scope.config.seriesColor4,
                                "title": stringLabel4,
                                "valueAxis": "Axes1",
                                "valueField": "value4",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            },
                            {
                                "id": "Graph5",
                                "type": scope.config.typeLine2,
                                "lineAlpha": scope.config.lineAlpha5,
                                "lineColor": scope.config.seriesColor5,
                                "balloonText": "[[title]]: <b>[[value5]]</b></br> Fecha: <b>[[timestamp]]</b>",
                                "labelPosition": "top",
                                "labelText": scope.config.showlabelText5 ? "[[value5]]" : null,
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none",
                                "bulletSize": scope.config.bulletSize5,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor5,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": scope.config.fillAlphas5,
                                "color": scope.config.seriesColor5,
                                "title": stringLabel5,
                                "valueAxis": "Axes1",
                                "valueField": "value5",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            }
                        ],
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

                //Graph 4
                if (chart.graphs[3].lineColor !== scope.config.seriesColor4) {
                    chart.graphs[3].lineColor = scope.config.seriesColor4;
                }
                if (chart.graphs[3].fillAlphas !== scope.config.fillAlphas4) {
                    chart.graphs[3].fillAlphas = scope.config.fillAlphas4;
                }
                if (chart.graphs[3].lineAlpha !== scope.config.lineAlpha4) {
                    chart.graphs[3].lineAlpha = scope.config.lineAlpha4;
                }
                if (chart.graphs[3].bulletSize !== scope.config.bulletSize4) {
                    chart.graphs[3].bulletSize = scope.config.bulletSize4;
                }
                if (chart.graphs[3].type !== scope.config.typeLine1) {
                    chart.graphs[3].type = scope.config.typeLine1;
                }
                if (chart.graphs[3].bulletColor !== scope.config.bulletColor4) {
                    chart.graphs[3].bulletColor = scope.config.bulletColor4;
                }
                if (chart.graphs[3].labelText !== (scope.config.showlabelText4 ? "[[value4]]" : null)) {
                    chart.graphs[3].labelText = scope.config.showlabelText4 ? "[[value4]]" : null;
                }
                if (chart.graphs[3].bullet !== (scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none")) {
                    chart.graphs[3].bullet = scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none";
                }

                //Graph 5
                if (chart.graphs[4].lineColor !== scope.config.seriesColor5) {
                    chart.graphs[4].lineColor = scope.config.seriesColor5;
                }
                if (chart.graphs[4].fillAlphas !== scope.config.fillAlphas5) {
                    chart.graphs[4].fillAlphas = scope.config.fillAlphas5;
                }
                if (chart.graphs[4].lineAlpha !== scope.config.lineAlpha5) {
                    chart.graphs[4].lineAlpha = scope.config.lineAlpha5;
                }
                if (chart.graphs[4].bulletSize !== scope.config.bulletSize5) {
                    chart.graphs[4].bulletSize = scope.config.bulletSize5;
                }
                if (chart.graphs[4].type !== scope.config.typeLine2) {
                    chart.graphs[4].type = scope.config.typeLine2;
                }
                if (chart.graphs[4].bulletColor !== scope.config.bulletColor5) {
                    chart.graphs[4].bulletColor = scope.config.bulletColor5;
                }
                if (chart.graphs[4].labelText !== (scope.config.showlabelText5 ? "[[value5]]" : null)) {
                    chart.graphs[4].labelText = scope.config.showlabelText5 ? "[[value5]]" : null;
                }
                if (chart.graphs[4].bullet !== (scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none")) {
                    chart.graphs[4].bullet = scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none";
                }

                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
                }
                //para eje X
                if (chart.categoryAxis.gridColor !== scope.config.axisColor) {
                    chart.categoryAxis.gridColor = scope.config.axisColor;
                }
                if (chart.categoryAxis.fontSize !== scope.config.axisFontSize) {
                    chart.categoryAxis.fontSize = scope.config.axisFontSize;
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