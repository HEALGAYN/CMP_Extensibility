//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {
    // 'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'BarraFB',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'BarraFB',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barravstarget.png',
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
                numDias: 0,
                // Allow large queries
                Intervals: 1000,
                // Specify the value of custom configuration options
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: 'black',
                fontSize: 14,
                terceraDimension: 1,
                angulo: 1,
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
                showlabelText1: true,
                showlabelText2: false,
                showlabelText3: false,
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                labelText3: '[[value3]]',
                showBulletColumn1: false,
                showBulletTarget1: true,
                showBulletTarget2: true,
                bulletShapeColumn1: 'square',
                bulletShapeTarget1: 'round',
                bulletShapeTarget2: 'round',
                bulletSize1: 3,
                bulletSize2: 6,
                bulletSize3: 6,
                bulletColor1: '#086996',
                bulletColor2: 'red',
                bulletColor3: 'black',
                // showAllValueLabels: false,
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
        //************************************
        // When a data update occurs...
        //************************************

        function myCustomDataUpdateFunction(data) {
            if (data && data.Data && Array.isArray(data.Data) && data.Data.length >= 2) {
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
                    var currentDate2 = new Date(lastDate);
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
                        };

                        if (i <= dayNow2) {
                            for (var j = 0; j < data2.Data0.length; j++) {
                                data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data0[j].Time).getDate();
                                console.log("valueDate2", valueDate2);
                                if (valueDate2 === i) {
                                    newData2.value1 = data2.Data0.length > 0 ? parseFloat(("" + data2.Data0[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value1 < 0 || newData2.value1 > 1000000) {
                                        newData2.value1 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                            for (var k = 0; k < data2.Data1.length; k++) {
                                data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data1[k].Time).getDate();
                                console.log("valueDate2", valueDate2);
                                if (valueDate2 === i) {
                                    newData2.value2 = data2.Data1.length > 0 ? parseFloat(("" + data2.Data1[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value2 < 0 || newData2.value2 > 1000000) {
                                        newData2.value2 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                            for (var l = 0; l < data2.Data2.length; l++) {
                                data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data2[l].Time).getDate();
                                console.log("valueDate2", valueDate2);
                                if (valueDate2 === i) {
                                    newData2.value3 = data2.Data2.length > 0 ? parseFloat(("" + data2.Data2[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value3 < 0 || newData2.value3 > 1000000) {
                                        newData2.value3 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }



                        } else {
                            for (var j = 0; j < data2.Data0.length; j++) {
                                newData2.value1 = 0;
                            }
                            for (var k = 0; k < data2.Data1.length; k++) {
                                data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data1[k].Time).getDate();
                                console.log("valueDate2", valueDate2);
                                if (valueDate2 === i) {
                                    newData2.value2 = data2.Data1.length > 0 ? parseFloat(("" + data2.Data1[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value2 < 0 || newData2.value2 > 1000000) {
                                        newData2.value2 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                            for (var l = 0; l < data2.Data2.length; l++) {
                                data2.Data0[data2.Data0.length - 1].Time;
                                var valueDate2 = new Date(data2.Data2[l].Time).getDate();
                                console.log("valueDate2", valueDate2);
                                if (valueDate2 === i) {
                                    newData2.value3 = data2.Data2.length > 0 ? parseFloat(("" + data2.Data2[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData2.value3 < 0 || newData2.value3 > 1000000) {
                                        newData2.value3 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                        }
                        newArray2.push(newData2);
                        console.log("newArray2: ", newArray2);
                    }
                } else {
                    var monthNow2 = 0;
                }

                //Crear o actualizar el gráfico
                if (!chart) {
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "type": "serial",
                        "theme": "light",
                        "depth3D": scope.config.terceraDimension,
                        "angle": scope.config.angulo,
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
                            "axisColor": scope.config.axisColor, // Linea eje x color    
                            "axisAlpha": 1,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Ton1",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                "type": "column",
                                // "showAllValueLabels": true,
                                "balloonText": "[[title]]: <b>[[value1]]</b>",
                                "bullet": scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none",
                                "bulletSize": scope.config.bulletSize1,
                                "bulletColor": scope.config.bulletColor1,
                                //"labelPosition": "top",
                                "labelText": scope.config.showlabelText1 ? "[[value1]]" : null,
                                "topRadius": 1,
                                "bullet": "square",
                                "color": scope.config.seriesColor1,
                                "lineThickness": 1,
                                "lineColor": scope.config.seriesColor1,
                                "title": "Real",
                                "valueAxis": "Axis1",
                                "valueField": "value1",
                            },
                            {
                                "id": "Ton2",
                                "type": "line",
                                // "showAllValueLabels": false,
                                "balloonText": "[[title]]: <b>[[value2]]</b></br>",
                                "labelPosition": "top",
                                "labelText": scope.config.showlabelText2 ? "[[value2]]" : null,
                                "fontSize": scope.config.fontSize,
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none",
                                "bulletSize": scope.config.bulletSize2,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor2,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor2,
                                "color": scope.config.seriesColor2,
                                "title": "Forecast",
                                "valueAxis": "Axis1",
                                "valueField": "value2",
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
                            },
                            {
                                "id": "Ton3",
                                "type": "smoothedLine",
                                // "showAllValueLabels": false,
                                "balloonText": "[[title]]: <b>[[value3]]</b></br>",
                                "labelPosition": "top",
                                "labelText": scope.config.showlabelText3 ? "[[value3]]" : null,
                                "lineThickness": 2,
                                "bullet": scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none",
                                "bulletSize": scope.config.bulletSize3,
                                "bulletBorderAlpha": 1,
                                "bulletColor": scope.config.bulletColor3,
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor3,
                                "color": scope.config.seriesColor3,
                                "title": "Budget",
                                "valueAxis": "Axis1",
                                "valueField": "value3",
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
                console.error("Datos inválidos o insuficientes para la visualización.");
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

                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                }
                if (chart.graphs[0].color !== scope.config.seriesColor1) {
                    chart.graphs[0].color = scope.config.seriesColor1;
                }
                if (chart.graphs[0].type !== scope.config.typeGraph) {
                    chart.graphs[0].type = scope.config.typeGraph;
                }
                if (chart.graphs[0].labelText !== (scope.config.showlabelText1 ? "[[value1]]" : null)) {
                    chart.graphs[0].labelText = scope.config.showlabelText1 ? "[[value1]]" : null;
                }
                // Update the bullet shape and visibility
                if (chart.graphs[0].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[0].bulletColor = scope.config.bulletColor1;
                }
                if (chart.graphs[0].bullet !== (scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none")) {
                    chart.graphs[0].bullet = scope.config.showBulletColumn1 ? scope.config.bulletShapeColumn1 : "none";
                }
                //Para hacer aparecer y desaparecer los valores de los gráficos

                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                }
                if (chart.graphs[1].bulletSize !== scope.config.bulletSize1) {
                    chart.graphs[1].bulletSize = scope.config.bulletSize1;
                }

                if (chart.graphs[1].type !== scope.config.typeLine1) {
                    chart.graphs[1].type = scope.config.typeLine1;
                }
                if (chart.graphs[1].bulletColor !== scope.config.bulletColor2) {
                    chart.graphs[1].bulletColor = scope.config.bulletColor2;
                }
                if (chart.graphs[1].labelText !== (scope.config.showlabelText2 ? "[[value2]]" : null)) {
                    chart.graphs[1].labelText = scope.config.showlabelText2 ? "[[value2]]" : null;
                }
                // Update the bullet shape and visibility
                if (chart.graphs[1].bullet !== (scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none")) {
                    chart.graphs[1].bullet = scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none";
                }

                //Para hacer aparecer y desaparecer los valores de los gráficos

                if (chart.graphs[2].lineColor !== scope.config.seriesColor3) {
                    chart.graphs[2].lineColor = scope.config.seriesColor3;
                }
                if (chart.graphs[2].bulletSize !== scope.config.bulletSize3) {
                    chart.graphs[2].bulletSize = scope.config.bulletSize3;
                }

                if (chart.graphs[2].type !== scope.config.typeLine2) {
                    chart.graphs[2].type = scope.config.typeLine2;
                }
                if (chart.graphs[2].bulletColor !== scope.config.bulletColor3) {
                    chart.graphs[2].bulletColor = scope.config.bulletColor3;
                }
                if (chart.graphs[2].labelText !== (scope.config.showlabelText3 ? "[[value3]]" : null)) {
                    chart.graphs[2].labelText = scope.config.showlabelText3 ? "[[value3]]" : null;
                }
                // Update the bullet shape and visibility
                if (chart.graphs[2].bullet !== (scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none")) {
                    chart.graphs[2].bullet = scope.config.showBulletTarget2 ? scope.config.bulletShapeTarget2 : "none";
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

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);