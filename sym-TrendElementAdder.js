! function(n) {
    "use strict";
    var t, e, o;

    function a(t, e) { t._callbacks = { _dataUpdate: function(t) { console.log("NO DATA FUNCTION") }, _configChange: function(t) { console.log("NO CONFIG FUNCTION") }, _destroy: function(t) { console.log("NO DESTROY FUNCTION") }, _resize: function(t) { console.log("NO RESIZE FUNCTION") } }, t.elem = e, this.scope = t }
    t = o = o || {}, a.prototype.setConfigChangeFunc = function(t) { this.scope._callbacks._configChange = t }, a.prototype.setDataUpdateFunc = function(t) { this.scope._callbacks._dataUpdate = t }, a.prototype.setDestroyFunc = function(t) { this.scope._callbacks._destroy = t }, a.prototype.setResizeFunc = function(t) { this.scope._callbacks._resize = t }, a.prototype.onConfigChange = function(t, e) { this.scope._callbacks._configChange(this.scope, t, e) }, a.prototype.onDataUpdate = function(t, e, n) {
        if (t) {
            switch (this.scope.config.DataShape) {
                case "TimeSeries":
                    this.scope.data = t.Data[0], this.scope.dataT = t.Data;
                    break;
                case "Value":
                case "Trend":
                    this.scope.data = t;
                    break;
                default:
                    throw this.scope.data = t, new Error("Unrecognized DataShape")
            }
            this.scope.data.Label && (this.scope.symbol.Label = this.scope.data.Label), this.scope.data.Units && (this.scope.symbol.Units = this.scope.data.Units), this.scope.data.EndTime && (this.scope.symbol.EndTime = this.scope.data.EndTime), this.scope.data.StartTime && (this.scope.symbol.StartTime = this.scope.data.StartTime)
        }
        this.scope._callbacks._dataUpdate(this.scope)
    }, a.prototype.onDestroy = function() { this.scope._callbacks._destroy(this.scope) }, a.prototype.onResize = function(t, e) { this.scope._callbacks._resize(this.scope, t, e) }, e = a, t._Handlers = e, (o = o || {}).init = function(t) { t.instance.elem = t.elem.find("#container")[0], t.instance.elem.id = "Component_" + t.symbol.Name, t.config.dataSourcesObj.forEach(function(t) { t.active = !1 }), t.instance.trendPointEvent = new s.EventHandler(t, p), t.instance.trendPointEvent.startListener(), t.handler.setDataUpdateFunc(i.onDataUpdate), t.handler.setConfigChangeFunc(function() {}), t.handler.setResizeFunc(function() {}), t.handler.setDestroyFunc(function() {}) }, (o = o || {}).definition = function(t, e) { return { typeName: "TrendElementAdder", displayName: "Check", datasourceBehavior: e.Extensibility.Enums.DatasourceBehaviors.Multiple, visObjectType: t, iconUrl: "/Scripts/app/editor/symbols/ext/icons/cmp_check.png", getDefaultConfig: function() { return { DataShape: "Value", FormatType: null, DataType: !0, Height: 60, Width: 60, dataSourcesObj: [], showLabels: !1 } }, configOptions: function() { return [{ title: "configuración", mode: "format" }] } } }, (o = o || {}).isSorted = function(t) {
        for (var e = 0; e < t.length - 1; e++)
            if (t[e] > t[e + 1]) return !1;
        return !0
    };
    var i, s, c, r, p = "Radix_Trend_Event";

    function l(t, e) { void 0 === t && (t = ""), void 0 === e && (e = !1), this.path = t, this.state = e }

    function h(t, e) { this.scope = t, this.rootScope = t.$root, this.eventName = e, this.receiveEventCallback = function() {} }

    function d() {}(i = i || {}).onDataUpdate = function(t) {
        var i = t.config.dataSourcesObj,
            n = t.symbol.DataSources;
        i.forEach(function(e, t) { n.some(function(t) { return t === e.path }) || i.splice(t, 1) }), n.forEach(function(e, t) {
            if (!i.some(function(t) { return e === t.path })) {
                var n = e.lastIndexOf("\\"),
                    o = e.substring(n + 1),
                    a = { path: e, active: !1, label: o };
                i.splice(t, 0, a)
            }
        })
    }, (s = s || {}).dataFormat = l, c = s = s || {}, h.prototype.sendEvent = function(t, e) {
        var n = new c.dataFormat(t, e);
        this.rootScope.$emit(this.eventName, n)
    }, h.prototype.setReceiveCallback = function(t) { this.receiveEventCallback = t }, h.prototype.startListener = function() {
        var n = this;
        this.rootScope.$on(this.eventName, function(t, e) { n.receiveEventCallback(n.scope, e) })
    }, r = h, c.EventHandler = r, n.deriveVisualizationFromBase(d), d.prototype.init = function(t, e) { t.instance = Object.assign({}), t.elem = e, t.PV = n, t.handler = new o._Handlers(t, e), this.onDataUpdate = t.handler.onDataUpdate, this.onResize = t.handler.onResize, this.onDestroy = t.handler.onDestroy, this.onConfigChange = t.handler.onConfigChange, o.init(t) }, n.symbolCatalog.register(o.definition(d, n))
}(window.PIVisualization, d3);