(function(CS) {
    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'LineaConIntervalo',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: 'Valor Con Límites',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/line.png',
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
                barColor1: "red",
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: "bottom",
                useColumns: false,
                decimalPlaces: 1,
                bulletSize: 8,
                customTitle: "",
                showAllValueLabels: true,
                gridColor1: "transparent",
                ignoreAxisWidth: false

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
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;
        var dataArray = [];



        //************************************
        // Extract the data item labels from a new update
        //************************************
        /*function getLabels(datasources) {
        	return datasources.map(function(item){
        		var isAttribute = /af:/.test(item);
        		var label = isAttribute ? item.match(/\w*\|.*$/)[0] : item.match(/\w+$/)[0];
        		if (!scope.config.includeElementName && (label.indexOf("|") !== -1)) {
        			label = label.split("|")[label.split("|").length - 1];
        		}
        		return {
        			Label: label
        		};
        	});	
        }*/
        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            var a;
            // If there is indeed new data in the update
            console.log("New data received: ", data);
            if (data !== null && data.Data) {
                dataArray = [];
                if (data.Data[0].Label) {
                    var stringLabel1 = data.Data[0].Label;
                    var posicion = stringLabel1.indexOf('|');
                    stringLabel1 = stringLabel1.substr(posicion + 1, stringLabel1.length);
                }
                if (data.Data[0].Units) {
                    var stringUnits1 = data.Data[0].Units;
                }

                //para dos tags

                if (data.Data[1].Label) {
                    var stringLabel2 = data.Data[1].Label;
                    var posicion = stringLabel1.indexOf('|');
                    stringLabel2 = stringLabel1.substr(posicion + 1, stringLabel2.length);
                }
                if (data.Data[1].Units) {
                    var stringUnits2 = data.Data[0].Units;
                }


                var b;
                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var today = new Date(data.Data[0].Values[i].Time);
                    today = today.toString();
                    var FechaCompleta = today.substr(4, 20);
                    var Mes = FechaCompleta.substr(0, 3);
                    if (Mes == "Jan") {
                        Mes = "01";
                    }
                    if (Mes == "Feb") {
                        Mes = "02";
                    }
                    if (Mes == "Mar") {
                        Mes = "03";
                    }
                    if (Mes == "Apr") {
                        Mes = "04";
                    }
                    if (Mes == "May") {
                        Mes = "05";
                    }
                    if (Mes == "Jun") {
                        Mes = "06";
                    }
                    if (Mes == "Jul") {
                        Mes = "07";
                    }
                    if (Mes == "Aug") {
                        Mes = "08";
                    }
                    if (Mes == "Sep") {
                        Mes = "09";
                    }
                    if (Mes == "Oct") {
                        Mes = "10";
                    }
                    if (Mes == "Nov") {
                        Mes = "11";
                    }
                    if (Mes == "Dec") {
                        Mes = "12";
                    }
                    var Dia = FechaCompleta.substr(3, 4);
                    Dia = Dia.trim();
                    var Anio = FechaCompleta.substr(6, 6);
                    Anio = Anio.trim();
                    var Hora = FechaCompleta.substr(12, 2);
                    var Minuto = FechaCompleta.substr(15, 2);
                    var Segundo = FechaCompleta.substr(18, 2);
                    var FechaFormato = Anio + "-" + Mes + "-" + Dia + " " + Hora + ":" + Minuto + ":" + Segundo;
                    //console.log("Aca:"+FechaFormato);
                    //console.log(FechaCompleta);
                    //console.log("Aca:"+Segundo);
                    //var monthNow = today.slice(today.indexOf("-") + 1, today.indexOf("-", today.indexOf("-") + 1));
                    //console.log(today);
                    //var dayNow = today.slice(today.indexOf("-") + 4, today.indexOf("T"));

                    //console.log(dayNow);
                    //var yearNow = today.substr(today.indexOf("/", today.indexOf("/") + 1) + 1, 4);
                    //var Hora = today.slice(today.indexOf("T")+1,today.indexOf("Z")-6);
                    //var MinutoSegunda = today.slice(today.indexOf("T")+4,today.indexOf("Z"));
                    //Hora = Hora - 5;
                    //a=dayNow+"/"+monthNow+"/"+yearNow;
                    //a=yearNow+"-"+monthNow+"-"+dayNow+" "+Hora+":"+MinutoSegunda;

                    //b = HoraMinuto;

                    //a= new Date(Date.parse(a)).toUTCString()
                    //console.log("Aca   "+MinutoSegunda)
                    //console.log("aca"+b);
                    //console.log(firstDate);
                    //var today=data.Data[3].Values[i].Time;
                    //var newDate = new Date(firstDate);
                    //newDate.setDate(newDate.getDate() + i);
                    // Create a new event object
                    var newDataObject = {
                        "timestamp": FechaFormato,
                        "hora": b,
                        "value": parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ".")),
                        "value1": parseFloat(("" + data.Data[1].Values[i].Value).replace(",", "."))
                            //"value1":50	   
                    };
                    dataArray.push(newDataObject);

                }


                // Create the custom visualization
                if (!chart) {
                    // Create the chart
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "type": "serial",
                        "categoryField": "date",
                        "dateFormat": "YYYY-MM-DD HH:NN:SS",
                        "backgroundAlpha": 0.18,
                        "backgroundColor": scope.config.backgroundColor,
                        "pathToImages": "Scripts/app/editor/symbols/ext/images/",
                        "theme": "none",
                        "categoryAxis": {
                            "minPeriod": "mm",
                            "parseDates": true,
                            "gridAlpha": 0.89,
                            "gridColor": scope.config.gridColor
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
                                "id": "AmGraph-1",
                                "fillAlphas": 0.2,
                                "bullet": "round",
                                "bulletBorderAlpha": 1,
                                "bulletColor": "#FFFFFF",
                                "bulletSize": 5,
                                "hideBulletsCount": 50,
                                "lineThickness": 2,
                                "title": stringLabel1,
                                "useLineColorForBulletBorder": true,
                                "valueField": "value",
                                "lineColor": scope.config.barColor1

                            },

                            {
                                "id": "AmGraph-2",
                                "lineColor": "#000000",
                                "title": "Tarjet",
                                "valueField": "value1"
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
                            "text": "Chart Title"
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
                        "categoryField": "timestamp",
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
                    "text": " " /*+ convertMonthToString(monthNow)*/ ,
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
                //Para cambiar el color de la linea de contorno
                if (chart.graphs[0].lineColor !== scope.config.barColor1) {
                    chart.graphs[0].lineColor = scope.config.barColor1;
                }
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

    };

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);