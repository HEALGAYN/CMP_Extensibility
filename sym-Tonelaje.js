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
        typeName: 'Tonelaje',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'Tonelajes Mes completo (F&B)',
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
                // Allow large queries
                Intervals: 1000,
                // Specify the value of custom configuration options
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: 'black',
                fontSize: 14,
                depth3D: 10, // Valor predeterminado para "depth3D" (puedes cambiarlo según tus necesidades)
                angle: 10, // Valor predeterminado para "angle" (puedes cambiarlo según tus necesidades)               
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
        //var dataArray = [];
        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            // If there is indeed new data in the update
            //if (data !== null && data.Data) {
            if (data && data.Data && Array.isArray(data.Data) && data.Data.length >= 2) {
                var dataArray = [];
                // dataArray.push(newData);
                var newArray = [];
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3;

                // Manejar errores en ambas fuentes de datos
                if (data.Data[0].ErrorDescription) {
                    console.error("Error en la fuente de datos 1:", data.Data[0].ErrorDescription);
                }
                if (data.Data[1].ErrorDescription) {
                    console.error("Error en la fuente de datos 2:", data.Data[1].ErrorDescription);
                }
                if (data.Data[2].ErrorDescription) {
                    console.error("Error en la fuente de datos 3:", data.Data[2].ErrorDescription);
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

                //creando el nuevo objeto
                if (data.Data[0].Values.length > 0) {
                    var today = data.Data[0].Values[data.Data[0].Values.length - 1].Time;
                    var currentDate = new Date(today);
                    // Get the year, month, and day from the Date object
                    var yearNow = currentDate.getFullYear();
                    var monthNow = currentDate.getMonth() + 1;
                    var dayNow = currentDate.getDate();
                    // console.log("yearNow: ", yearNow);
                    //console.log("monthNow: ", monthNow);
                    // console.log("dayNow: ", dayNow);

                    var daysOfMonth = getDaysOfMonth(monthNow, yearNow);
                    // console.log("daysOfMonth: ", daysOfMonth);


                    for (var i = 1; i <= daysOfMonth; i++) {
                        //console.log("daysOfMonth en la variable i: ", i);
                        var newData = {
                            "timestamp": "D" + i,
                            "value1": null,
                            "value2": null,
                            "value3": null,
                        };

                        if (i <= dayNow) {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueDate = new Date(data.Data[0].Values[j].Time).getDate();
                                if (valueDate === i) {
                                    //newData.value1 = data.Data[0].Values[j].Value;
                                    newData.value1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[j].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value1 > 100000 || newData.value1 < 0) {
                                        newData.value1 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }

                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueDate = new Date(data.Data[1].Values[k].Time).getDate();
                                if (valueDate === i) {
                                    newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value2 > 100000 || newData.value2 < 0) {
                                        newData.value2 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueDate = new Date(data.Data[2].Values[l].Time).getDate();
                                if (valueDate === i) {
                                    newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value3 > 100000 || newData.value3 < 0) {
                                        newData.value3 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }

                        } else {
                            for (var j = 0; j < data.Data[0].Values.length; j++) {
                                var valueDate = 0;


                            }

                            for (var k = 0; k < data.Data[1].Values.length; k++) {
                                var valueDate = new Date(data.Data[1].Values[k].Time).getDate();
                                if (valueDate === i) {
                                    newData.value2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[k].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value2 > 100000 || newData.value2 < 0) {
                                        newData.value2 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }
                            for (var l = 0; l < data.Data[2].Values.length; l++) {
                                var valueDate = new Date(data.Data[2].Values[l].Time).getDate();
                                if (valueDate === i) {
                                    newData.value3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[l].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                                    if (newData.value3 > 100000 || newData.value3 < 0) {
                                        newData.value3 = 0;
                                    }
                                    break; // No es necesario seguir recorriendo el arreglo si encontramos el valor.
                                }
                            }


                        }

                        newArray.push(newData);
                        //console.log("newArray" + newUniqueIDString, newArray);

                    }



                } else {
                    var monthNow = 0;
                }


                // Crear o actualizar el gráfico
                if (!chart) {
                    // Crear el gráfico
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        // Propiedades del gráfico
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
                            //"axisAlpha": 1,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Ton1",
                                "fillAlphas": 0.85,
                                "lineAlpha": 0.1,
                                //"type": "column",
                                "type": scope.config.typeGraph,
                                "balloonText": "[[title]]: <b>[[value1]]</b>",
                                "labelPosition": "top",
                                //"labelText": "[[value]]",
                                //"topRadius": 1,
                                //"bullet": "square",
                                "color": scope.config.seriesColor1,
                                //"lineThickness": 1,
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
                                "labelText": "",
                                //"labelText": scope.config.labelText2,
                                //"fontSize": scope.config.fontSize,
                                // Muestra el marcador si showBulletTarget es verdadero, de lo contrario, no muestra ningún marcador ("none")
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
            // console.log(" Datos principales: ", data);
            // var temporal = {};
            // if (data.Data.length > 0) {
            //     for (var i = 0; i < data.Data.length; i++) { // Cambiado <= por <
            //         //console.log("Test: ", data.Data[i].Values)
            //         // new Date(data.Data[0].Values[j].Time).getDate();
            //         var newObjetPrincipal = data.Data[i].Values.map(x => {
            //             var fechaInicial = new Date(x.Time);
            //             var nuevaFecha = agregarDias(fechaInicial, 1); // sumamos un día                               
            //             x.Time = nuevaFecha.toISOString();
            //             return {...x };
            //         });
            //         var nombrePropiedad = "lista" + i;
            //         temporal[nombrePropiedad] = newObjetPrincipal;
            //     }
            //     //     //console.log("daysOfMonth en la variable i: ", i);
            //     //     //console.log("temporal: ", temporal);
            //     console.log("temporal: ", temporal);

            // }
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
                if (chart.graphs[1].bulletColor !== scope.config.bulletColor1) {
                    chart.graphs[1].bulletColor = scope.config.bulletColor1;
                }
                // Update the bullet shape and visibility
                if (chart.graphs[1].bullet !== (scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none")) {
                    chart.graphs[1].bullet = scope.config.showBulletTarget1 ? scope.config.bulletShapeTarget1 : "none";
                }

                //Para hacer aparecer y desaparecer los valores de los gráficos

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