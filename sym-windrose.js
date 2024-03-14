(function(PV) {
    'use strict';

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: "Windrose",
        iconUrl: '/Scripts/app/editor/symbols/ext/icons/cmp_windrose.png',
        visObjectType: symbolVis,
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        getDefaultConfig: function() {
            return {
                DataShape: 'TimeSeries',
                FormatType: null,
                Height: 450,
                Width: 650,
                showLegend: true,
                showTitle: true,
                chartTitle: 'Wind Rose',
                backgroundColor: 'transparent',
                textAxisColor: 'black',
                textTitleColor: 'black',
                axisColor: 'black',
                colors: ['#002299', '#113399', '#224499', '#335599', '#446699'],
                gridLineWidth: 1,
                fontSize: 12,
                fontSizeTitle: 14,
                legendAlign: 'right',
                legendLayout: 'vertical',
                legendValign: 'bottom',
                reversedStacks: false,
                rangeLimits: [500, 300, 50, 25, 0],
                totalRanges: 5,
            }
        },
        configOptions: function() {
            return [{
                title: "Format Symbol",
                mode: "format"
            }];
        }
    }

    const setAxisCOnfig = (scope) => {
        return {
            gridLineWidth: scope.config.gridLineWidth,
            gridLineColor: scope.config.axisColor,
            lineColor: scope.config.axisColor,
            labels: {
                style: {
                    color: scope.config.textAxisColor,
                    fontSize: scope.config.fontSize + 'px',
                }
            },
            reversedStacks: scope.config.reversedStacks
        }
    }

    const getUpdateSeries = (chart, scope) => {
        chart.update({
            series: scope.config.series,
        })
    }

    const getConfig = (chart, scope) => {
        chart.update({
            colors: scope.config.colors,
            title: {
                text: scope.config.showTitle ? scope.config.chartTitle : '',
                align: 'center',
                style: {
                    fontSize: scope.config.fontSizeTitle + 'px',
                    color: scope.config.textTitleColor
                }
            },
            legend: {
                enabled: scope.config.showLegend,
                align: scope.config.legendAlign,
                verticalAlign: scope.config.legendValign,
                layout: scope.config.legendLayout
            },
            xAxis: setAxisCOnfig(scope),
            yAxis: setAxisCOnfig(scope),
        });
    };

    const makeChart = (scope, container) => {
        return Highcharts.chart(container.id, {
            credits: { enabled: false },

            series: scope.config.series,
            colors: scope.config.colors,
            chart: {
                polar: true,
                type: 'column',
                backgroundColor: 'transparent'
            },

            xAxis: {
                tickmarkPlacement: 'on',
                categories: scope.directions,
            },

            yAxis: {
                min: 0,
                type: 'circle',
                endOnTick: false,
                showLastLabel: true,
                labels: {
                    formatter: function() { return this.value + '%' },
                },
            },

            tooltip: {
                valueSuffix: '%',
                valueDecimals: 1,
            },

            plotOptions: {
                series: {
                    stacking: 'normal',
                    shadow: false,
                    groupPadding: 0,
                    pointPlacement: 'on'
                }
            }
        });
    };

    const getIndexDirection = (angle) => {
        let min = 22.5;
        let max = 67.5;
        // 0 N, 1 NE, 2 E, 3 SE, 4 S, 5 SO, 6 O; 7 NO

        for (let i = 1; i <= 7; i++) {
            if (min < angle && angle <= max) return i;
            min = max;
            max += 45;
        }
        return 0;
    }

    const getRanges = (scope) => {
        const rangeLimits = scope.config.rangeLimits;

        if (scope.config.totalRanges > rangeLimits.length) {
            for (let index = rangeLimits.length - 1; index < scope.config.totalRanges; index++) {
                rangeLimits.push(0);
            }
        } else {
            rangeLimits.length = scope.config.totalRanges;
        }

        scope.series = setSerieslabel(scope);
    }

    const getIndexRange = (value, scope) => {
        getRanges(scope);
        const totalRanges = scope.config.totalRanges;
        for (let index = 0; index < totalRanges; index++) {
            if (value >= scope.config.rangeLimits[index]) return index
        }
    }

    const getPartial = (indexDirection, indexRange, scope) => {
        let sumator = 0;
        scope.data.forEach(item => {
            if (item[1] == indexDirection && item[3] == indexRange) {
                sumator += 1;
            }
        })
        return sumator;
    }

    const getSeriePartial = (scope) => {
        let partials = {};
        const haveData = scope.data[0].length == 0;
        const total = haveData ? 1 : scope.data[0].length;
        scope.directions.forEach((category, indexDir) => {
            scope.series.forEach((serie, indexCat) => {
                const partial = getPartial(indexDir, indexCat, scope);
                partials[`${indexDir}${indexCat}`] = partial / total; //*100;
            })
        })
        scope.partials = partials;
    }

    const getSerieData = (range, scope) => {
        const serieData = []

        scope.directions.forEach((direction, index) => {
            const partial = scope.partials[`${index}${range}`];
            serieData.push(partial)
        })

        return serieData;
    }

    const setSeries = (scope, haveData) => {
        const series = []
        scope.series.forEach((serie, index) => {
            series.push({
                name: serie,
                data: haveData ? getSerieData(index, scope) : 'notdatas',
            })
        })
        scope.config.series = series;
    }

    const generateData = (data, scope) => {
        const duplaValues = [];
        const measurements = data.Data[1].Values;

        data.Data[0].Values.forEach(item => {
            const result = measurements.filter(measure => measure.Time === item.Time);
            if (result.length != 0) {
                const direction = getIndexDirection(item.Value);
                const valueRange = result.at(-1).Value;
                const range = getIndexRange(valueRange, scope);
                duplaValues.push([item.Time, direction, item.Value, range, valueRange])
            }
        })
        return duplaValues;
    }

    const getData = (scope, data) => {
        if (data.Data[0].Values.length != 0 && data.Data[1].Values.length != 0) {
            scope.data = generateData(data, scope);
            getSeriePartial(scope);
            setSeries(scope, true);
        } else {
            setSeries(scope, false);
        }
    }

    const getUnits = (scope, data, chart) => {
        if (!chart) {
            scope.units = data.Data[1].Units || '';
            scope.series = setSerieslabel(scope);
        }
    }

    const build = (scope, data, chart, container) => {
        getUnits(scope, data, chart)
        getData(scope, data);
        if (!chart) {
            chart = makeChart(scope, container);
            getConfig(chart, scope);
        }

        return chart;
    }

    const setSerieslabel = (scope) => {
        const series = []
        scope.config.rangeLimits.forEach(item => {
            series.push('>= ' + item + ' ' + scope.units);
        })
        return series;
    }

    symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChange;
        scope.directions = ['N', 'N-E', 'E', 'S-E', 'S', 'S-O', 'O', 'N-O'];
        scope.lastTime = false;
        const container = elem.find("#container")[0];
        container.id = "windrose_" + scope.symbol.Name;
        let chart = false;

        function dataUpdate(data) {
            chart = build(scope, data, chart, container)
            getUpdateSeries(chart, scope);
        };

        function configChange() {
            if (chart) {
                chart = makeChart(scope, container);
                getConfig(chart, scope)
            }
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);