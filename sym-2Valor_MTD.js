//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '2Valor_MTD',
        displayName: '2 Valores | (MTD)',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_2valores.png',
        visObjectType: symbolVis,
        inject: ['timeProvider', '$interval'],
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
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                typeGraph1: 'smoothedLine',
                typeGraph2: 'smoothedLine',
                seriesColor1: '#c03a6c',
                seriesColor2: '#005499',
                // Eje X
                axisColor: 'black',
                axisFontSize: 12,
                axisPosition: 'left',
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
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                showBulletColumn1: false,
                showBulletColumn2: false,
                bulletShapeColumn1: 'square',
                bulletShapeColumn2: 'square',
                fillAlphas1: 0.85,
                fillAlphas2: 0.85,
                lineAlpha1: 0.1,
                lineAlpha2: 0.1,
                bulletSize1: 3,
                bulletSize2: 3,
                bulletColor1: '#c03a6c',
                bulletColor2: '#005499',
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
            return [{
                title: 'Edit Graph',
                mode: 'format'
            }];
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

        // console.log("timeED", timeProvider.requestNewTime());


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

                // console.log("datos originales:", data.Data);

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
                    var lastDate = data2.Data0[data2.Data0.length - 1].Time;
                    var currentDate = new Date(lastDate);
                    var yearNow = currentDate.getFullYear();
                    var monthNow = currentDate.getMonth() + 1;
                    var dayNow = currentDate.getDate();
                    var daysOfMonth = getDaysOfMonth(monthNow, yearNow);



                    for (var i = 1; i <= daysOfMonth; i++) {
                        var newData = {
                            // "timestamp": "D" + i + "/" + monthNow,
                            //"timestamp": i + "/" + monthNow,
                            "timestamp": "D" + i,
                            "value1": null,
                            "value2": null
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
                        } else {
                            newData.value1 = null;
                            newData.value2 = null;
                        }

                        newArray2.push(newData);
                        // console.log("newArray2:", newArray2);
                    }
                } else {
                    var monthNow = 0;
                }




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
                            "autoWrap": true,
                        },
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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axis1",
                                "valueField": "value1",
                                "labelPosition": "top",
                                // "bulletOffset": 30,
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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor2,
                                "title": stringLabel2,
                                "valueAxis": "Axis1",
                                "valueField": "value2",
                                "labelPosition": "top",
                                // "bulletOffset": 30,

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
                if (chart.graphs[0].labelText !== (scope.config.showlabelText1 ? "[[value2]]" : null)) {
                    chart.graphs[0].labelText = scope.config.showlabelText1 ? "[[value2]]" : null;
                }
                if (chart.graphs[0].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[0].bulletColor = scope.config.bulletColor1;
                }
                if (chart.graphs[0].bullet !== (scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none")) {
                    chart.graphs[0].bullet = scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none";
                }
                if (chart.graphs[0].balloonText !== scope.config.balloonText) {
                    chart.graphs[0].balloonText = scope.config.balloonText;
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
                // if (chart.categoryAxis.position !== scope.config.axisPosition) {
                //     chart.categoryAxis.position = scope.config.axisPosition;
                // }
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
                // if (chart.valueAxes[0].position !== scope.config.axesPosition) {
                //     chart.valueAxes[0].position = scope.config.axesPosition;
                // }
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
                //console.log("Styling updated.");
            }
        }


    };


    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);