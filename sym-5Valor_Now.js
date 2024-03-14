//************************************
// Begin defining a new symbol
/*
Empresa: CONTAC INGENIEROS 
Ing. Henry Alejandro Gallardo Yntor
*/
//************************************
(function(CS) {

    var myCustomSymbolDefinition = {

        typeName: '5Valor_Now',
        displayName: '5 Valores | MTD (Now)',
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
                axesStackType: 'none',
                backgroundColor: 'transparent',
                gridColor: 'transparent',
                plotAreaFillColor: 'transparent',
                typeGraph1: 'line',
                typeGraph2: 'line',
                typeGraph3: 'line',
                typeGraph4: 'line',
                typeGraph5: 'line',
                showgraph1: 'true',
                showgraph2: 'true',
                showgraph3: 'true',
                showgraph4: 'true',
                showgraph5: 'true',
                seriesColor1: '#c03a6c',
                seriesColor2: '#005499',
                seriesColor3: '#f78f28',
                seriesColor4: '#00a2e8',
                seriesColor5: '#778899',
                bulletColor1: '#c03a6c',
                bulletColor2: '#005499',
                bulletColor3: '#f78f28',
                bulletColor4: '#00a2e8',
                bulletColor5: '#778899',
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
                showlabelText5: true,
                labelText1: '[[value1]]',
                labelText2: '[[value2]]',
                labelText3: '[[value3]]',
                labelText4: '[[value4]]',
                labelText5: '[[value4]]',
                showBulletColumn1: true,
                showBulletColumn2: true,
                showBulletColumn3: true,
                showBulletColumn4: true,
                showBulletColumn5: true,
                bulletShapeColumn1: 'square',
                bulletShapeColumn2: 'round',
                bulletShapeColumn3: 'round',
                bulletShapeColumn4: 'square',
                bulletShapeColumn5: 'square',
                fillAlphas1: 0,
                fillAlphas2: 0,
                fillAlphas3: 0,
                fillAlphas4: 0,
                fillAlphas5: 0,
                lineAlpha1: 1,
                lineAlpha2: 1,
                lineAlpha3: 1,
                lineAlpha4: 1,
                lineAlpha4: 1,
                bulletSize1: 3,
                bulletSize2: 3,
                bulletSize3: 3,
                bulletSize4: 3,
                bulletSize5: 3,
                lineThickness1: 1,
                lineThickness2: 1,
                lineThickness3: 1,
                lineThickness4: 1,
                lineThickness5: 1,
                labelOffset1: 0,
                labelOffset2: 0,
                labelOffset3: 0,
                labelOffset4: 0,
                labelOffset5: 0,
                labelPosition1: 'top',
                labelPosition2: 'top',
                labelPosition3: 'top',
                labelPosition4: 'top',
                labelPosition5: 'top',
                labelRotation1: 0,
                labelRotation2: 0,
                labelRotation3: 0,
                labelRotation4: 0,
                labelRotation5: 0,
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
    symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;
        var symbolContainerDiv = elem.find('#container')[0];
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;

        function myCustomDataUpdateFunction(data) {
            if (!data || !data.Data || !Array.isArray(data.Data) || data.Data.length >= 5) {
                //Data Inicial             
                var dataArray = [];
                var stringLabel1, stringUnits1, stringLabel2, stringUnits2, stringLabel3, stringUnits3, stringLabel4, stringUnits4, stringLabel5, stringUnits5;
                console.log("data nuevo gráfico de 5 en now:", data)
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
                if (data.Data[3].ErrorDescription) {
                    console.error("Error en la fuente de datos 4:", data.Data[3].ErrorDescription);
                }
                if (data.Data[4].ErrorDescription) {
                    console.error("Error en la fuente de datos 5:", data.Data[4].ErrorDescription);
                }

                // Obtener las etiquetas y unidades de ambas fuentes de datos
                if (data.Data[0].Label) {
                    stringLabel1 = data.Data[0].Label;
                }
                if (data.Data[0].Units) {
                    stringUnits1 = data.Data[0].Units;
                }
                if (data.Data[1].Label) {
                    stringLabel2 = data.Data[1].Label;
                }
                if (data.Data[1].Units) {
                    stringUnits2 = data.Data[1].Units;
                }
                if (data.Data[2].Label) {
                    stringLabel3 = data.Data[2].Label;
                }
                if (data.Data[2].Units) {
                    stringUnits3 = data.Data[2].Units;
                }
                if (data.Data[3].Label) {
                    stringLabel4 = data.Data[3].Label;
                }
                if (data.Data[3].Units) {
                    stringUnits4 = data.Data[3].Units;
                }
                if (data.Data[4].Label) {
                    stringLabel5 = data.Data[4].Label;
                }
                if (data.Data[4].Units) {
                    stringUnits5 = data.Data[3].Units;
                }


                //Serie de Tiempo Real
                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var today = data.Data[0].Values[i].Time;

                    // Crear un objeto de fecha a partir de la cadena
                    var dateObject = new Date(today);

                    // Obtener el día del mes
                    var day = dateObject.getDate();

                    // Obtener el mes (agregando 1 ya que los meses en JavaScript van de 0 a 11)
                    var month = dateObject.getMonth() + 1;

                    // Obtener el año
                    var year = dateObject.getFullYear();

                    // Obtener la hora en formato de 24 horas
                    var hours = dateObject.getHours();

                    // Obtener los minutos
                    var minutes = dateObject.getMinutes();

                    // Formatear el día, mes y minutos para asegurar que tengan dos dígitos
                    day = day < 10 ? '0' + day : day;
                    month = month < 10 ? '0' + month : month;
                    minutes = minutes < 10 ? '0' + minutes : minutes;

                    // Utilizar backticks para crear un template string
                    var fecha = `${day}-${month}-${year} ${hours}:${minutes}`;
                    var mes = `${day}/${month} ${hours}:${minutes}`;
                    var hora = `${hours}:${minutes}`;

                    // Imprimir el resultado en un solo console.log
                    // console.log("Fecha y hora:", fecha);
                    // Crear un nuevo objeto de datos

                    var valor1 = data.Data[0].Values.length > 0 ? parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    var valor2 = data.Data[1].Values.length > 0 ? parseFloat(("" + data.Data[1].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    var valor3 = data.Data[2].Values.length > 0 ? parseFloat(("" + data.Data[2].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    var valor4 = data.Data[3].Values.length > 0 ? parseFloat(("" + data.Data[3].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;
                    var valor5 = data.Data[4].Values.length > 0 ? parseFloat(("" + data.Data[4].Values[i].Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0;

                    var newDataObject = {
                        "timestamp": mes,
                        "value1": valor1,
                        "value2": valor2,
                        "value3": valor3,
                        "value4": valor4,
                        "value5": valor5,
                    };
                    dataArray.push(newDataObject);

                }
                // console.log("dataArray:", dataArray);
                // dataArray = selectData(data);

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
                            // "newStack": "stack1",
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
                            "lineThickness": scope.config.lineThickness2,
                            "lineColor": scope.config.seriesColor2,
                            "title": stringLabel2,
                            "valueAxis": "Axis1",
                            "valueField": "value2",
                            "labelPosition": scope.config.labelPosition2,
                            "labelOffset": scope.config.labelOffset2,
                            "labelRotation": scope.config.labelRotation2,
                            // "newStack": "stack2",
                        }, {
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
                            // "newStack": "stack3",
                        }, {
                            "id": "Graph4",
                            "type": scope.config.typeGraph4,
                            "fillAlphas": scope.config.fillAlphas4,
                            "lineAlpha": scope.config.lineAlpha4,
                            "balloonText": "[[title]]: <b>[[value4]] </b> </br> Fecha: <b>[[timestamp]]</b>",
                            "bullet": scope.config.showBulletColumn4 ? scope.config.bulletShapeColumn4 : "none",
                            "bulletSize": scope.config.bulletSize4,
                            "bulletColor": scope.config.bulletColor4,
                            "labelText": scope.config.showlabelText4 ? "[[value4]]" : null,
                            "color": scope.config.seriesColor4,
                            "lineThickness": scope.config.lineThickness4,
                            "lineColor": scope.config.seriesColor4,
                            "title": stringLabel4,
                            "valueAxis": "Axis1",
                            "valueField": "value4",
                            "labelPosition": scope.config.labelPosition4,
                            "labelOffset": scope.config.labelOffset4,
                            "labelRotation": scope.config.labelRotation4,
                            // "newStack": "stack4",
                        }, {
                            "id": "Graph5",
                            "type": scope.config.typeGraph5,
                            "fillAlphas": scope.config.fillAlphas5,
                            "lineAlpha": scope.config.lineAlpha5,
                            "balloonText": "[[title]]: <b>[[value5]] </b> </br> Fecha: <b>[[timestamp]]</b>",
                            "bullet": scope.config.showBulletColumn5 ? scope.config.bulletShapeColumn5 : "none",
                            "bulletSize": scope.config.bulletSize5,
                            "bulletColor": scope.config.bulletColor5,
                            "labelText": scope.config.showlabelText5 ? "[[value5]]" : null,
                            "color": scope.config.seriesColor5,
                            "lineThickness": scope.config.lineThickness5,
                            "lineColor": scope.config.seriesColor5,
                            "title": stringLabel5,
                            "valueAxis": "Axis1",
                            "valueField": "value5",
                            "labelPosition": scope.config.labelPosition5,
                            "labelOffset": scope.config.labelOffset5,
                            "labelRotation": scope.config.labelRotation5,
                            // "newStack": "stack5",
                        }],
                        "dataProvider": dataArray,
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
                    chart.dataProvider = dataArray;
                    chart.validateData();
                    chart.validateNow();
                }

            } else {
                console.log("Datos inválidos o insuficientes para la visualización.");
                // showErrorPopup();
                // return;                
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
                if (chart.graphs[0].lineThickness !== scope.config.lineThickness1) {
                    chart.graphs[0].lineThickness = scope.config.lineThickness1;
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
                if (chart.graphs[3].lineThickness !== scope.config.lineThickness4) {
                    chart.graphs[3].lineThickness = scope.config.lineThickness4;
                }
                if (chart.graphs[3].color !== scope.config.seriesColor4) {
                    chart.graphs[3].color = scope.config.seriesColor4;
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
                if (chart.graphs[4].lineThickness !== scope.config.lineThickness5) {
                    chart.graphs[4].lineThickness = scope.config.lineThickness5;
                }
                if (chart.graphs[4].color !== scope.config.seriesColor5) {
                    chart.graphs[4].color = scope.config.seriesColor5;
                }
                if (chart.graphs[4].type !== scope.config.typeGraph5) {
                    chart.graphs[4].type = scope.config.typeGraph5;
                }
                if (chart.graphs[4].labelText !== (scope.config.showlabelText5 ? "[[value5]]" : null)) {
                    chart.graphs[4].labelText = scope.config.showlabelText5 ? "[[value5]]" : null;
                }
                if (chart.graphs[4].labelPosition !== scope.config.labelPosition5) {
                    chart.graphs[4].labelPosition = scope.config.labelPosition5;
                }
                if (chart.graphs[4].labelRotation !== scope.config.labelRotation5) {
                    chart.graphs[4].labelRotation = scope.config.labelRotation5;
                }
                if (chart.graphs[4].labelOffset !== scope.config.labelOffset5) {
                    chart.graphs[4].labelOffset = scope.config.labelOffset5;
                }
                if (chart.graphs[4].bulletColor !== scope.config.bulletColor5) {
                    chart.graphs[4].bulletColor = scope.config.bulletColor5;
                }
                if (chart.graphs[4].bulletSize !== scope.config.bulletSize5) {
                    chart.graphs[4].bulletSize = scope.config.bulletSize3;
                }
                if (chart.graphs[4].bullet !== (scope.config.showBulletColumn5 ? scope.config.bulletShapeColumn5 : "none")) {
                    chart.graphs[4].bullet = scope.config.showBulletColumn5 ? scope.config.bulletShapeColumn5 : "none";
                }
                if (scope.config.showgraph5) {
                    chart.showGraph(chart.graphs[4]);
                } else {
                    chart.hideGraph(chart.graphs[4]);
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