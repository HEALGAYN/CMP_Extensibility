(function(CS) {

    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'barline-interval',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'Barras y Linea Intervalo',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/barline.png',
        visObjectType: symbolVis,
        // Specify default configuration for this symbol
        getDefaultConfig: function() {
            return {
                backgroundColor: "transparent",
                bulletSize: 8,
                colorLinea: "red",
                customTitle: "",
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                DataShape: 'TimeSeries',
                decimalPlaces: 1,
                fontSize: 16,
                FormatType: null,
                gridColor: "transparent",
                gridColor1: "transparent",
                // Specify the default height and width of this symbol
                Height: 700,
                ignoreAxisWidth: false,
                // Allow large queries
                Intervals: 1000,
                legendPosition: "bottom",
                // Specify the value of custom configuration options
                maximumYValue: 100,
                minDataPoints: 3,
                minimumYValue: 0,
                plotAreaFillColor: "transparent",
                rangoDefaultColor: "pink",
                rangoGreenColor: "green",
                rangoLimeColor: "lime",
                rangoOrangeColor: "orange",
                rangoRedColor: "red",
                rangoYellowColor: "yellow",
                showAllValueLabels: true,
                showChartScrollBar: false,
                showLegend: true,
                //includeElementName: false,
                showTitle: false,
                textColor: "black",
                useColumns: false,
                useCustomTitle: false,
                valorLinea: 10.7,
                Width: 900,

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
        const graficoId = "barLine_" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = graficoId;
        var chart = false;
        var dataArray = [];

        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            // console.log(scope);
            // console.log(data);

            if (scope.symbol.DataSources.length === scope.config.minDataPoints) {
                // If there is indeed new data in the update
                console.log(`Data ${graficoId}>: `, data);

                if (data !== null && data.Data) {
                    dataArray = [];

                    try {
                        let tagLabel1 = getLabel(data, 0);
                        let tagLabel2 = getLabel(data, 1);
                        let tagLabel3 = getLabel(data, 2);

                        for (var i = 0; i < data.Data[0].Values.length; i++) {
                            var fechaValue = new Date(data.Data[0].Values[i].Time);
                            var fechaFormato = formatoFecha(fechaValue);

                            let tagValue1 = getValue(data, 0, i);
                            let tagBarColor1 = getColorBar(tagValue1);
                            let tagValue2 = getValue(data, 1, i);
                            let tagBarColor2 = getColorBar(tagValue2);
                            let tagValue3 = getValue(data, 2, i);
                            let tagBarColor3 = getColorBar(tagValue3);

                            var newDataObject = {
                                "timestamp": fechaFormato,
                                "tagValue1": tagValue1,
                                "tagBarColor1": tagBarColor1,
                                "tagValue2": tagValue2,
                                "tagBarColor2": tagBarColor2,
                                "tagValue3": tagValue3,
                                "tagBarColor3": tagBarColor3,
                                "colorLinea": scope.config.colorLinea,
                                "valorLinea": scope.config.valorLinea,
                            };
                            dataArray.push(newDataObject);

                        }

                        console.log('dataArray', dataArray);

                        // Create the custom visualization
                        if (!chart) {
                            // Create the chart
                            chart = AmCharts.makeChart(symbolContainerDiv.id, {
                                "type": "serial",
                                "categoryField": "timestamp",
                                "dateFormat": "YYYY-MM-DD HH:NN:SS",
                                "backgroundAlpha": 0.18,
                                "backgroundColor": scope.config.backgroundColor,
                                "pathToImages": "Scripts/app/editor/symbols/ext/images/",
                                "theme": "none",
                                "categoryAxis": {
                                    "minPeriod": "MM",
                                    "parseDates": true,
                                    "gridColor": scope.config.gridColor,
                                    "gridPosition": "start",
                                    "position": "left",
                                },
                                "balloon": {
                                    "borderThickness": 1,
                                    "shadowAlpha": 0
                                },
                                "chartCursor": {
                                    "valueLineEnabled": true,
                                    "valueLineBalloonEnabled": true,
                                    "cursorAlpha": 0,
                                    "zoomable": false,
                                    "valueZoomable": true,
                                    "valueLineAlpha": 0.5,
                                    "cursorColor": "#000000",
                                    "categoryBalloonDateFormat": "HH:NN, DD MMMM"
                                },
                                "trendLines": [],
                                "graphs": [{
                                        "fillAlphas": 0.8,
                                        "id": "AmGraph-1",
                                        "lineColor": "tagBarColor1",
                                        "lineColorField": "tagBarColor1",
                                        "fillColorsField": "tagBarColor1",
                                        "title": tagLabel1,
                                        "type": "column",
                                        "valueField": "tagValue1",
                                    },
                                    {
                                        "fillAlphas": 0.8,
                                        "id": "AmGraph-2",
                                        "lineColor": "tagBarColor2",
                                        "lineColorField": "tagBarColor2",
                                        "fillColorsField": "tagBarColor2",
                                        "title": tagLabel2,
                                        "type": "column",
                                        "valueField": "tagValue2",
                                    },
                                    {
                                        "fillAlphas": 0.8,
                                        "id": "AmGraph-3",
                                        "lineColor": "tagBarColor3",
                                        "lineColorField": "tagBarColor3",
                                        "fillColorsField": "tagBarColor3",
                                        "title": tagLabel3,
                                        "type": "column",
                                        "valueField": "tagValue3",
                                    },
                                    {
                                        "id": "AmGraph-4",
                                        "lineColor": "colorLinea",
                                        "lineColorField": "colorLinea",
                                        "fillColorsField": "colorLinea",
                                        "title": "Target",
                                        "valueField": "valorLinea",
                                    }
                                ],
                                "guides": [],
                                "valueAxes": [{
                                    "id": "ValueAxis-1",
                                    //"title": "Axis title",
                                    "gridAlpha": 1,
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
                                    "selectedBackgroundColor": "#888888",
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


                    } catch (error) {
                        console.error(error);
                    }
                }

            } else {
                // mostrar la cantidad faltante para que cumpla la condicion del if
                console.warn("No hay suficientes datos para mostrar el grafico, faltan " + (scope.config.minDataPoints - scope.symbol.DataSources.length) + " datos.");

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
                    "text": "" /*+ convertMonthToString(monthNow)*/ ,
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
                if (chart.plotAreaFillColors !== scope.config.plotAreaFillColor) {
                    chart.plotAreaFillColors = scope.config.plotAreaFillColor;
                }
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

                // las dos siguientes if no se necesitan, ya que el color es segun el rango
                //Para cambiar el color del grafico
                // if (chart.graphs[0].fillColors !== scope.config.barColor1) {
                //     chart.graphs[0].fillColors = scope.config.barColor1;
                // }
                //Para cambiar el color de la linea de contorno
                // if (chart.graphs[0].lineColor !== scope.config.barColor1) {
                //     chart.graphs[0].lineColor = scope.config.barColor1;
                // }
                //Para hacer aparecer y desaparecer los valores de los gráficos

                if (chart.graphs[0].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[0].showAllValueLabels = scope.config.showAllValueLabels;
                }

                // Update the scroll bar
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }
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

        const getLabel = (data, index) => {
            const label = data.Data[index].Label;
            if (label) {
                var posicion = label.indexOf('|');
                return label.substr(posicion + 1, label.length);
            } else {
                return '';
            }
        }

        const getValue = (data, index, i) => {
            const valores = data.Data[index].Values;
            return valores.length > 0 ? parseFloat(("" + valores[i].Value).replace(",", ".")) : 0;
        }

        const getColorBar = (valor) => {
            let color = '';

            switch (true) {
                case (valor <= 25 && valor > 20):
                    color = scope.config.rangoRedColor;
                    break;
                case (valor <= 20 && valor > 16):
                    color = scope.config.rangoOrangeColor;
                    break;
                case (valor <= 16 && valor > 10):
                    color = scope.config.rangoYellowColor;
                    break;
                case (valor <= 10 && valor > 5):
                    color = scope.config.rangoGreenColor;
                    break;
                case (valor <= 5 && valor > 0):
                    color = scope.config.rangoLimeColor;
                    break;
                default:
                    color = scope.config.rangoDefaultColor;
                    break;
            }

            return color;
        }

    };

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);