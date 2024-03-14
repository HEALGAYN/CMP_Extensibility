/// <reference path="../_references.js" chutzpah-exclude="true" />

window.PIVisualization = window.PIVisualization || {};

(function (PV) {
    'use strict';

    PV.symbolCatalog.getDefinition('trend').getConfigFromLegacy = function (legacySym) {
        var trendDef = PV.symbolCatalog.getDefinition('trend');
        var config = trendDef.getDefaultConfig();

        if (legacySym.TrendMultiScaleState) {
            // 'true' or 'false'
            config.MultipleScales = (legacySym.TrendMultiScaleState === 'true');
        }

        if (legacySym.ScaleRange) {
            // '1' is Autorange, '2' is Database - map to 0 and 1
            config.ValueScaleSetting.MinType = config.ValueScaleSetting.MaxType = Number(legacySym.ScaleRange) - 1;
        }

        return config;
    };

})(window.PIVisualization);
