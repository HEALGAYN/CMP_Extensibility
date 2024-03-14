(function(CS) {

    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'difhora',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'Diferencia x Hora',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_diferencia.png',
        visObjectType: symbolVis,
        // Specify default configuration for this symbol
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                // Specify the default height and width of this symbol
                Height: 700,
                Width: 900,
                // Allow large queries
                Intervals: 1000,
                // Specify the value of custom configuration options
                minimumYValue: 0,
                maximumYValue: 100,
                numDias: 0,
                //includeElementName: false,
                showTitle: false,
                textColor: "black",
                fontSize: 12,
                backgroundColor: "transparent",
                //plotAreaFillColor: "transparent",
                barColor1: "lead",
                lineColor: "black",
                barColor2: "green",
                barColor3: "red",
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: "bottom",
                decimalPlaces: 1,
                bulletSize: 4,
                customTitle: "",
                showAllValueLabels: false,
                gridColor: "transparent",
                gridColor1: "transparent",
                enabledCursor: false,
                //ignoreAxisWidth: false,
                minDataPoints: 3,
                useCustomTitle: false,
                lineValue: 20,

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
        //var labels = getLabels(scope.symbol.DataSources);

        // Locate the html div that will contain the symbol, using its id, which is "container" by default
        var symbolContainerDiv = elem.find('#container')[0];
        // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
        const graficoId = "4Barras_" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = graficoId;
        var chart = false;
        var dataArray = [];


        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            console.log(scope);
            // console.log(data);
            // If there is indeed new data in the update

            var multiState = ["#7fff00", "#b5e61d", "#ffff00", "#ffa500", "#ff0000"];

            if (data !== null && data.Data) {
                dataArray = [];
                if (data.Data[0].Label) {
                    var label1 = data.Data[0].Label;
                    var posicion1 = label1.indexOf('|');
                    label1 = label1.substr(posicion1 + 1, label1.length);
                }

                //para dos tags
                if (data.Data[1].Label) {
                    var label2 = data.Data[1].Label;
                    var posicion2 = label2.indexOf('|');
                    label2 = label2.substr(posicion2 + 1, label2.length);
                }

                //Datos en Tiempo Real

                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var fechaValue = new Date(data.Data[0].Values[i].Time);
                    var fechaFormato = formatoFecha(fechaValue);

                    let valor1 = data.Data[0].Values.length > 0 ?
                        parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    let valor2 = data.Data[1].Values.length > 0 ?
                        parseFloat(("" + data.Data[1].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    let valor3 = (valor1 - valor2) ?
                        parseFloat(("" + (valor1 - valor2)).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;

                    var newDataObject = {
                        "timestamp": fechaFormato,
                        "value1": valor1,
                        "value2": valor2,
                        "diferencia": valor3,
                    };
                    dataArray.push(newDataObject);

                }

                // console.log('dataArray', dataArray);

                // Create the custom visualization
                if (!chart) {
                    // Create the chart
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "hideCredits": true,
                        "type": "serial",
                        "categoryField": "timestamp",
                        "dateFormat": "YYYY-MM-DD HH:NN:SS",
                        "fontSize": scope.config.fontSize,
                        "precision": scope.config.decimalPlaces,
                        "backgroundColor": scope.config.backgroundColor,
                        "pathToImages": "Scripts/app/editor/symbols/ext/images/",
                        "precision": scope.config.decimalPlaces,
                        "categoryAxis": {
                            "minPeriod": "DD",
                            "parseDates": true,
                            "gridColor": scope.config.gridColor,
                            "gridPosition": "start",
                            "position": "left",
                        },
                        // "balloon": {
                        //     "fixedPosition": true,
                        // },
                        "chartCursor": {
                            "valueLineEnabled": true,
                            "valueLineBalloonEnabled": true,
                            "cursorAlpha": 0,
                            "zoomable": false,
                            "valueZoomable": true,
                            "valueLineAlpha": 0.5,
                            "cursorColor": "#000000",
                            "categoryBalloonDateFormat": "DD MMMM",
                        },
                        "trendLines": [],
                        "graphs": [{
                                "id": "AmGraph-1",
                                //"ballonText": scope.config.enabledCursor ? ("Realizado:<b>[[close]]</b><br>") : "",
                                "balloonText": "Tonelaje:<b>[[value1]]</b>",
                                "fillColors": scope.config.barColor1,
                                "lineColor": scope.config.barColor1,
                                "title": label1,
                                "type": "column",
                                "fillAlphas": 1,
                                "lineAlpha": 1,
                                "lineThickness": 1,
                                //"labelText": "[[value1]]",
                                "valueField": "value1",
                                "showAllValueLabels": true,
                            },
                            {
                                "id": "AmLine-1",
                                //"ballonText": scope.config.enabledCursor ? ("Target:<b>[[open]]</b><br>") : "",
                                "balloonText": "Target:<b>[[value2]]</b>",
                                "lineColor": scope.config.lineColor,
                                "title": label2,
                                "type": "line",
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineThickness": 1,
                                "bullet": "round",
                                "bulletColor": "#FFFFFF",
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 3,
                                //"labelText": "[[value2]]",
                                "valueField": "value2",
                                "showAllValueLabels": false,
                            },
                            {
                                "id": "AmGraph-2",
                                //"balloonText": "Target:<b>[[open]]</b><br>Realizado:<b>[[close]]</b><br>Diferencia:<b>[[diferencia]]</b>",
                                "balloonText": "Diferencia:<b>[[diferencia]]</b>",
                                //"closeField": "close",
                                "closeField": "value1",
                                "fillColors": scope.config.barColor2,
                                "lineColor": scope.config.barColor2,
                                "negativeFillColors": scope.config.barColor3,
                                "negativeLineColor": scope.config.barColor3,
                                //"openField": "open",
                                "fillAlphas": 1,
                                "lineAlpha": 1,
                                "lineThickness": 1,
                                "openField": "value2",
                                "title": "Diferencia",
                                "type": "candlestick",
                                //"valueField": "close"                                
                                "valueField": "value1",
                                "labelText": "[[diferencia]]",
                            }
                        ],
                        "guides": [],
                        "valueAxes": [{
                            "id": "ValueAxis-1",
                            "axisAlpha": 0,
                            "position": "left",
                            "gridAlpha": 0,
                            "labelsEnabled": false,
                            "gridColor": scope.config.gridColor1
                        }],
                        "allLabels": [],
                        "legend": {
                            "fontSize": scope.config.fontSize,
                            "position": scope.config.legendPosition,
                            "equalWidths": false,
                            "enabled": scope.config.showLegend,
                            "valueAlign": "right",
                            "horizontalGap": 10,
                            "useGraphSettings": true,
                            "markerSize": 10
                        },
                        "titles": [{
                            "id": "Title-1",
                            "size": 15,
                            "text": ""
                        }],
                        "export": {
                            "enabled": true,
                            "menuReviver": function(item, li) {
                                if (item.format == "XLSX") {
                                    item.name = "My sheet";
                                }
                                return li;
                            }
                        },
                        "chartScrollbar": {
                            "enabled": scope.config.showChartScrollBar,
                            "dragIcon": "dragIconRectSmall",
                            "graph": "AmGraph-1",
                            "scrollbarHeight": 80,
                            "backgroundAlpha": 0,
                            "selectedBackgroundAlpha": 0.1,
                            "selectedBackgroundColor": scope.config.BackgroundColor,
                            "graphFillAlpha": 0,
                            "graphLineAlpha": 0.5,
                            "selectedGraphFillAlpha": 0,
                            "selectedGraphLineAlpha": 1,
                            "autoGridCount": true,
                            "color": "#AAAAAA"
                        },
                        "dataProvider": dataArray,
                    });
                } else {
                    // Update the title
                    if (scope.config.showTitle) {
                        chart.titles = createArrayOfChartTitles();
                    } else {
                        chart.titles = null;
                    } // Refresh the graph					
                    chart.dataProvider = dataArray;
                    chart.validateData();
                    chart.validateNow();
                }
            }

            chart.addListener("dataUpdated", zoomChart);
            // when we apply theme, the dataUpdated event is fired even before we add listener, so
            // we need to call zoomChart here
            zoomChart();
            // this method is called when chart is first inited as we listen for "dataUpdated" event
            function zoomChart() {
                // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
                chart.zoomToIndexes(dataArray.length - 250, dataArray.length - 0);
            }
        }

        function agregarDias(fecha, dias) {
            var nuevaFecha = new Date(fecha.valueOf());
            nuevaFecha.setDate(nuevaFecha.getDate() + dias);
            return nuevaFecha;
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
                    "text": "",
                    "bold": true,
                    "size": (scope.config.fontSize + 3)
                }];
            }
            return titlesArray;
        }
        //var oldLabelSettings;
        function myCustomConfigurationChangeFunction(data) {
            /* if (oldLabelSettings != scope.config.includeElementName) {
                 oldLabelSettings == scope.config.includeElementName;
                 labels = getLabels(scope.symbol.DataSources);
             }*/
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
                // if (chart.plotAreaFillColors !== scope.config.plotAreaFillColor) {
                //     chart.plotAreaFillColors = scope.config.plotAreaFillColor;
                // }
                //para el grid del eje X
                if (chart.categoryAxis.gridColor !== scope.config.gridColor) {
                    chart.categoryAxis.gridColor = scope.config.gridColor;
                }
                //para el grid del eje Y
                if (chart.valueAxes[0].gridColor !== scope.config.gridColor1) {
                    chart.valueAxes[0].gridColor = scope.config.gridColor1;
                }
                // para hacer aparecer y desaparecer los axes
                chart.valueAxes[0].ignoreAxisWidth !== scope.config.ignoreAxisWidth
                chart.valueAxes[0].ignoreAxisWidth = scope.config.ignoreAxisWidth;

                //Para cambiar el color del grafico
                if (chart.graphs[0].fillColors !== scope.config.barColor1) {
                    chart.graphs[0].fillColors = scope.config.barColor1;
                }
                //Para cambiar el color de la lineas
                if (chart.graphs[0].lineColor !== scope.config.barColor1) {
                    chart.graphs[0].lineColor = scope.config.barColor1;
                }
                if (chart.graphs[1].fillColors !== scope.config.barColor2) {
                    chart.graphs[1].fillColors = scope.config.barColor2;
                }
                if (chart.graphs[1].lineColor !== scope.config.barColor2) {
                    chart.graphs[1].lineColor = scope.config.barColor2;
                }
                if (chart.graphs[2].negativeFillColors !== scope.config.barColor3) {
                    chart.graphs[2].negativeFillColors = scope.config.barColor3;
                }
                if (chart.graphs[2].negativeLineColor !== scope.config.barColor3) {
                    chart.graphs[2].negativeLineColor = scope.config.barColor3;
                }
                if (chart.graphs[2].lineColor !== scope.config.lineColor) {
                    chart.graphs[2].lineColor = scope.config.lineColor;
                }
                // if (chart.graphs[3].lineColor !== scope.config.barColor4) {
                //     chart.graphs[3].lineColor = scope.config.barColor4;
                // }
                //Para hacer aparecer y desaparecer los valores de los gráficos
                if (chart.graphs[0].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[0].showAllValueLabels = scope.config.showAllValueLabels;
                }
                if (chart.graphs[1].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[1].showAllValueLabels = scope.config.showAllValueLabels;
                }
                // if (chart.graphs[2].showAllValueLabels !== scope.config.showAllValueLabels) {
                //     chart.graphs[2].showAllValueLabels = scope.config.showAllValueLabels;
                // }

                // Update the scroll bar
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }
                //Decimal Places 
                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
                }
                // showLabels1 
                // if (scope.config.enabledCursor) {
                //     chart.graphs[0].ballonText = "[[Value1]]";
                //     chart.graphs[1].ballonText = "[[Value2]]";
                //     chart.graphs[2].ballonText = "[[Value3]]";
                // } else {
                //     chart.graphs[0].ballonText = null;
                //     chart.graphs[1].ballonText = null;
                //     chart.graphs[2].ballonText = null;
                // }

                chart.legend.enabled = scope.config.showLegend;
                chart.legend.position = scope.config.legendPosition;
                // Commit updates to the chart
                chart.validateNow();
                //console.log("Styling updated.");
            }
        }

        /**
         * Dar formato a la fecha del valor
         * @param {fechaValue} date 
         * @returns 2023-1-7 17:0:0
         */
        const formatoFechaAlternativo = (date) => {
            // `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
            return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate() + ' ' +
                date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }

        /**
         * Dar formato a la fecha del valor
         * @param {fechaValue} date 
         * @returns 2023-01-07 17:00:00
         */
        const formatoFecha = (date) => {
            date = date.toString();
            var fechaCompleta = date.substr(4, 20);
            var mes = fechaCompleta.substr(0, 3);
            var dia = fechaCompleta.substr(3, 4);
            dia = dia.trim();
            var anio = fechaCompleta.substr(6, 6);
            anio = anio.trim();
            var hora = fechaCompleta.substr(12, 2);
            var minuto = fechaCompleta.substr(15, 2);
            var segundo = fechaCompleta.substr(18, 2);

            switch (mes) {
                case "Jan":
                    mes = "01";
                    break;
                case "Feb":
                    mes = "02";
                    break;
                case "Mar":
                    mes = "03";
                    break;
                case "Apr":
                    mes = "04";
                    break;
                case "May":
                    mes = "05";
                    break;
                case "Jun":
                    mes = "06";
                    break;
                case "Jul":
                    mes = "07";
                    break;
                case "Aug":
                    mes = "08";
                    break;
                case "Sep":
                    mes = "09";
                    break;
                case "Oct":
                    mes = "10";
                    break;
                case "Nov":
                    mes = "11";
                    break;
                case "Dec":
                    mes = "12";
                    break;

                    // default:
                    //     break;
            }

            return `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
        }

    };

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);