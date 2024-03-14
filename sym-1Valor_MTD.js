(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '1Valor_MTD',
        displayName: '1 Valor | (MTD)',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_1valor.png',
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
                typeGraph1: 'line',
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                seriesColor1: '#c03a6c',
                axisColor: 'black',
                showLegend: true,
                fontSizeLegend: 12,
                showChartScrollBar: false,
                legendPosition: 'bottom',
                useColumns: false,
                decimalPlaces: 1,
                showlabelText1: false,
                labelText1: '[[value1]]',
                showBulletColumn1: true,
                bulletShapeColumn1: 'round',
                fillAlphas1: 0.1,
                lineAlpha1: 1,
                bulletSize1: 3,
                bulletColor1: '#c03a6c',
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
            if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length >= 1) {
                //Data Inicial                
                var stringLabel1, stringUnits1;
                if (data.Data[0].Label) {
                    stringLabel1 = data.Data[0].Label.split('|').at(-1).toUpperCase();
                }
                if (data.Data[0].Units) {
                    stringUnits1 = data.Data[0].Units;
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

                    var yearNow2 = currentDate2.getFullYear();
                    var monthNow2 = currentDate2.getMonth() + 1;
                    var dayNow2 = currentDate2.getDate();
                    var daysOfMonth2 = getDaysOfMonth(monthNow2, yearNow2);

                    for (var i = 1; i <= daysOfMonth2; i++) {
                        var newData2 = {
                            "timestamp": "D" + i,
                            "value1": null,
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


                        } else {
                            newData2.value1 = null;

                        }
                        newArray2.push(newData2);

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
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor1,
                                "title": stringLabel1,
                                "valueAxis": "Axis1",
                                "valueField": "value1",
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

            }
        }


    };


    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);