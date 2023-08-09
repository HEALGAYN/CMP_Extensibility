(function(PV) {
    "use strict";

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "highchart",
        //iconUrl: 'Images/chrome.highchart.svg',
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        getDefaultConfig: function() {
            return {
                DataShape: 'Trend',
                Height: 150,
                Width: 150,
                typeChart: 'bar'
            }
        },
        configOptions: function() {
            return [{ title: "Format Symbol", mode: "format" }];
        }
    }

    function getConfig(tipo, datos, ejeY) {
        return {
            chart: {
                backgroundColor: '#FFFFFF00',
                type: tipo
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: ejeY,
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: datos
        };
    };

    symbolVis.prototype.init = function(scope, elem) {
        var grafico = [];
        var Yaxis = {
            title: {
                text: null
            },
            maxZoom: 0.1,
            min: 0
        }
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = unitChanged;
        var symbolContainerDiv = elem.find("#container")[0];
        symbolContainerDiv.id = "Chart_" + scope.symbol.Name;
        var chart = Highcharts.chart(symbolContainerDiv.id, getConfig(scope.config.typeChart, grafico, Yaxis));

        function unitChanged() {
            var chart = Highcharts.chart(symbolContainerDiv.id, getConfig(scope.config.typeChart, grafico, Yaxis));
        }

        function updateLabel(data) {
            return data.Traces.map(function(item) {
                return item.Label;
            });
        }

        function saveLabel(grafico) {
            let lista = [];
            grafico.forEach(element => {
                lista.push(element.name);
            });
            return lista;
        }

        function dataUpdate(data) {
            if (!data) return;

            var pastLabels = saveLabel(grafico);
            var label = updateLabel(data)

            var min = parseFloat(data.ValueScaleLimits[0]);
            var max = parseFloat(data.ValueScaleLimits[1]);
            Yaxis.min = min;
            Yaxis.max = max;

            grafico = [];
            data.Traces.forEach(function(trace, index) {

                var lista = []
                var elemento = {};

                var segmentos = trace.LineSegments[0].split(' ');
                segmentos.forEach(function(seccion) {
                    var valor = parseFloat(seccion.substring(seccion.indexOf(',') + 1));
                    var resultado = valor * max / 100;
                    lista.push(resultado);
                })

                elemento.data = lista

                if (label[index] != undefined) {
                    elemento.name = label[index];
                } else {
                    elemento.name = pastLabels[index];
                }
                //elemento.pointInterval = 24 * 3600 * 1000,
                elemento.pointInterval = 24 * 3600 * 1000,

                    grafico.push(elemento);

            });

            var chart = Highcharts.chart(symbolContainerDiv.id, getConfig(scope.config.typeChart, grafico, Yaxis));
            console.log(data);

        };

    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);