(function(CS) {

    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'Barras',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: '3 Barras y Target',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_barras.png',
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
                //includeElementName: false,
                showTitle: false,
                textColor: "black",
                fontSize: 12,
                backgroundColor: "transparent",
                gridColor: "transparent",
                plotAreaFillColor: "transparent",
                barColor1: "orange",
                barColor2: "yellow",
                barColor3: "blue",
                lineColor: "red",
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: "bottom",
                useColumns: false,
                decimalPlaces: 1,
                bulletSize: 8,
                customTitle: "",
                showAllValueLabels: true,
                gridColor1: "transparent",
                ignoreAxisWidth: false,
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
        const graficoId = "3Barras_" + Math.random().toString(36).substr(2, 16);
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
            // If there is indeed new data in the update

            var multiState = ["#7fff00", "#b5e61d", "#ffff00", "#ffa500", "#ff0000"];

            if (data !== null && data.Data) {
                dataArray = [];
                if (data.Data[0].Label) {
                    var label1 = data.Data[0].Label;
                    var posicion1 = label1.indexOf('|');
                    label1 = label1.substr(posicion1 + 1, label1.length);
                }
                // if (data.Data[0].Units) {
                //     var units1 = data.Data[0].Units;
                // }

                //para dos tags
                if (data.Data[1].Label) {
                    var label2 = data.Data[1].Label;
                    var posicion2 = label2.indexOf('|');
                    label2 = label2.substr(posicion2 + 1, label2.length);
                }
                // if (data.Data[1].Units) {
                //     var units2 = data.Data[0].Units;
                // }
                //para tres tags

                if (data.Data[2].Label) {
                    var label3 = data.Data[2].Label;
                    var posicion3 = label3.indexOf('|');
                    label3 = label3.substr(posicion3 + 1, label3.length);
                }
                // if (data.Data[2].Units) {
                //     var stringUnits3 = data.Data[2].Units;
                // }

                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var fechaValue = new Date(data.Data[0].Values[i].Time);
                    var fechaFormato = formatoFecha(fechaValue);

                    let valor0 = data.Data[0].Values.length > 0 ?
                        parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    let valor1 = data.Data[1].Values.length > 0 ?
                        parseFloat(("" + data.Data[1].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    let valor2 = data.Data[2].Values.length > 0 ?
                        parseFloat(("" + data.Data[2].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;

                    var newDataObject = {
                        "timestamp": fechaFormato,
                        "value1": valor0,
                        "value2": valor1,
                        "value3": valor2,
                        "value4": 10.7
                    };
                    dataArray.push(newDataObject);

                }

                console.log('dataArray', dataArray);


                // Create the custom visualization
                if (!chart) {
                    // Create the chart
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "hideCredits": true,
                        "type": "serial",
                        "categoryField": "timestamp",
                        "dateFormat": "YYYY-MM-DD HH:NN:SS",
                        //"showAllValueLabels": scope.config.showLabels,
                        "fontSize": scope.config.fontSize,
                        "precision": scope.config.decimalPlaces,
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
                            "fixedPosition": true,
                        },
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
                                "fillAlphas": 0.8,
                                "id": "AmGraph-1",
                                "balloonText": scope.config.enabledCursor,
                                //"balloonText": "[[category]]<br><b><span style='font-size:14px;'>value:[[value1]]</span></b>",
                                // "ballonText": scope.config.enabledCursor ? (
                                //     `<span style='color:[[color]]; font-size:${scope.config.fontSizeBalloon}px'>[[category]]</span><b style='font-size:${scope.config.fontSizeBalloon}px; color: ${scope.config.colorTextValues}'>: [[value]]</b>`
                                // ) : '',
                                "lineColor": scope.config.barColor1,
                                "title": label1,
                                "type": "column",
                                "labelText": "[[value1]]",
                                "showAllValueLabels": scope.config.showAllValueLabels,
                                "valueField": "value1",
                            },
                            {
                                "fillAlphas": 0.8,
                                "id": "AmGraph-2",
                                //"balloonText": "[[category]]<br><b><span style='font-size:14px;'>value:[[value2]]</span></b>",
                                "ballonText": scope.config.enabledCursor ? (
                                    "[[category]]<br><b><span style='font-size:14px;'>value:[[value2]]</span></b>"
                                ) : "",
                                "lineColor": scope.config.barColor2,
                                "title": label2,
                                "type": "column",
                                "labelText": "[[value2]]",
                                "showAllValueLabels": scope.config.showAllValueLabels,
                                "valueField": "value2",
                            },
                            {
                                "fillAlphas": 0.8,
                                "id": "AmGraph-3",
                                // "balloonText": "[[category]]<br><b><span style='font-size:14px;'>value:[[value3]]</span></b>",
                                "ballonText": scope.config.enabledCursor ? (
                                    "[[category]]<br><b><span style='font-size:14px;'>value:[[value3]]</span></b>"
                                ) : "",
                                "lineColor": scope.config.barColor3,
                                "title": label3,
                                "type": "column",
                                "labelText": "[[value3]]",
                                "showAllValueLabels": scope.config.showAllValueLabels,
                                "valueField": "value3",
                            },
                            {
                                "id": "AmGraph-4",
                                //"type": "ssmoothedLine",
                                //"balloonText": "[[category]]<br><b><span style='font-size:14px;'>value:[[value4]]</span></b>",

                                "lineColor": scope.config.lineColor,
                                "title": "Target",
                                "valueField": "value4",
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

                //Para cambiar el color del grafico
                if (chart.graphs[0].fillColors !== scope.config.barColor1) {
                    chart.graphs[0].fillColors = scope.config.barColor1;
                }
                if (chart.graphs[1].fillColors !== scope.config.barColor2) {
                    chart.graphs[1].fillColors = scope.config.barColor2;
                }
                if (chart.graphs[2].fillColors !== scope.config.barColor3) {
                    chart.graphs[2].fillColors = scope.config.barColor3;
                }
                //Para cambiar el color de la linea de contorno
                if (chart.graphs[0].lineColor !== scope.config.barColor1) {
                    chart.graphs[0].lineColor = scope.config.barColor1;
                }
                if (chart.graphs[1].lineColor !== scope.config.barColor2) {
                    chart.graphs[1].lineColor = scope.config.barColor2;
                }
                if (chart.graphs[2].lineColor !== scope.config.barColor3) {
                    chart.graphs[2].lineColor = scope.config.barColor3;
                }
                //Para hacer aparecer y desaparecer los valores de los gráficos
                if (chart.graphs[0].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[0].showAllValueLabels = scope.config.showAllValueLabels;
                }
                if (chart.graphs[1].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[1].showAllValueLabels = scope.config.showAllValueLabels;
                }
                if (chart.graphs[2].showAllValueLabels !== scope.config.showAllValueLabels) {
                    chart.graphs[2].showAllValueLabels = scope.config.showAllValueLabels;
                }

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