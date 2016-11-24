"use strict";
// TODO: Can we get rid of this __extends?
var __extends = (this && this.__extends) || function (d, b) { for (var p in b)
    if (b.hasOwnProperty(p))
        d[p] = b[p]; function __() { this.constructor = d; } d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __()); };
var UI = (function () {
    function UI() {
    }
    UI.IsNullOrEmpty = function (val) {
        return val == null || val == "";
    };
    UI.NewCbo = function (options) {
        // intialise settings with defaults
        var settings = {
            id: null,
            name: null,
            chosen: true,
            target: null,
            sproc: null,
            data: null,
            txt: null,
            val: null,
            attr: null,
            defaultItemText: null,
            defaultItemValue: null,
            selectedValue: null,
            autoDestroy: true,
            multiSelect: false
        };
        __extends(settings, options);
        if (settings.chosen && !settings.target) {
            throw "If chosen=true then a target container element needs to be specified.";
        }
        var $cbo;
        // TODO: Replace with DOM code??
        if (!settings.multiSelect)
            $cbo = $("<select style='width:100%'/>");
        else
            $cbo = $("<select style='width:100%' multiple/>");
        if (settings.id)
            $cbo.attr("id", settings.id);
        if (settings.name)
            $cbo.attr("name", settings.name);
        var waitForData = $.Deferred();
        waitForData.done(function (settings) {
            // process data
            if (settings.defaultItemText) {
                var $op = $("<option/>").text(settings.defaultItemText).attr("value", settings.defaultItemValue);
                $cbo.append($op);
            }
            if (settings.data) {
                var data = settings.data;
                if (data && typeof (data.Data) !== "undefined")
                    data = data.Data.Table0;
                for (var e in data) {
                    var row = data[e];
                    var txtVal = row[settings.txt];
                    if (txtVal == undefined && settings.txt == undefined)
                        txtVal = "settings.txt undefined";
                    var $op = $("<option/>").text(txtVal).attr("value", row[settings.val]);
                    $cbo.append($op);
                    // attach additional attributes if requested
                    if (settings.attr && settings.attr.length > 0) {
                        for (var i = 0; i < settings.attr.length; i++) {
                            var aName = settings.attr[i];
                            if (row[aName])
                                $op.data(aName, row[aName]);
                        }
                    }
                }
            }
            if (settings.target) {
                if (settings.id && settings.autoDestroy) {
                    $(settings.target).find("#" + settings.id).chosen("destroy").remove();
                    try {
                        $(settings.target).find("#" + settings.id + '_chzn').remove(); //10/11/2016, DA: hack to remove element as does not appear to be done on line above
                    }
                    catch (ignore) {
                        console.log(ignore);
                    }
                }
                $(settings.target).find(".l2CboLoading").remove();
                $(settings.target).append($cbo);
            }
            if (settings.selectedValue) {
                $cbo.val(settings.selectedValue);
            }
            if (settings.chosen) {
                $cbo.chosen({ width: "100%" });
            }
            setTimeout(function () {
                try {
                    $cbo.trigger("change");
                }
                catch (e) {
                    // TODO: handle with registered error handler?
                    throw e;
                }
            }, 0);
        });
        if (settings.sproc && settings.sproc.getExecPacket) {
            if (settings.target) {
                $(settings.target).append($('<div class="l2CboLoading">Loading, please wait...</div>'));
            }
            settings.sproc.then(function (results) {
                settings.data = results;
                waitForData.resolve(settings);
            });
        }
        else if (settings.data) {
            waitForData.resolve(settings);
        }
        return $cbo;
    };
    UI.A = function (options) {
        try {
            var settings = {
                text: "",
                href: null,
                visible: true,
                cssClass: null,
                target: null
            };
            __extends(settings, options);
            var $a = $("<a></a>");
            if (!UI.IsNullOrEmpty(settings.cssClass)) {
                $a.attr("class", settings.cssClass);
            }
            if (!UI.IsNullOrEmpty(settings.target)) {
                $a.attr("target", settings.target);
            }
            ////////////////
            // HREF
            ////////////////
            if (!UI.IsNullOrEmpty(settings.href)) {
                if (typeof (settings.href) === "string") {
                    $a.attr("href", settings.href);
                }
                else if (typeof (settings.href) === "object") {
                    if (typeof (settings.href.func) != "undefined") {
                        var parmCsv = "";
                        if (typeof (settings.href.parms) === "object" && typeof (settings.href.parms.join) != "undefined") {
                            var ar = [];
                            for (var e in settings.href.parms) {
                                ar.push(JSON.stringify(settings.href.parms[e]));
                            }
                            parmCsv = ar.join();
                        }
                        else if (typeof (settings.href.parms) != "undefined") {
                            parmCsv = settings.href.parms.toString();
                        }
                        $a.attr("href", "javascript:" + settings.href.func + "(" + parmCsv + ");");
                    }
                }
            }
            $a.text(settings.text);
            if (!settings.visible)
                $a.css({ display: "none" });
            return $a[0].outerHTML;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    UI.NewGrid = function (options) {
        try {
            var settings = {
                target: null,
                sproc: null,
                data: null,
                retrieve: true,
                paging: false,
                searching: false,
                info: false,
                autoGenerateColumns: false,
                autoDestroy: true,
                callBack: null
            };
            __extends(settings, options);
            var waitForData = $.Deferred();
            waitForData.done(function (settings) {
                // process data
                if (settings.data) {
                    // todo: Specify result set?
                    if (settings.sproc) {
                        var data = settings.data.Data.Table0;
                        //window.DAL.TransformResults(data);
                        settings.data = data;
                    }
                    // auto generate columns that are not specified
                    if (settings.autoGenerateColumns && settings.data.length > 0) {
                        var autoColumnsLookup = {};
                        for (var p in settings.data[0]) {
                            autoColumnsLookup[p] = { data: p };
                        }
                        if (settings.columns) {
                            for (var c in settings.columns) {
                                var col = settings.columns[c];
                                autoColumnsLookup[col.data] = col;
                            }
                        }
                        settings.columns = $.map(autoColumnsLookup, function (obj) { return obj; });
                    }
                    if (settings.autoDestroy && $.fn.dataTable.fnIsDataTable(settings.target)) {
                        $(settings.target).DataTable().destroy();
                        $(settings.target).html("");
                    }
                    if (settings.target && $(settings.target).is("TABLE")) {
                        if ($(settings.target).find("thead").length == 0) {
                            // create table header on demand
                            var $thead = $('<thead><tr class="gridHeader"></tr></thead>');
                            if (settings.columns != null) {
                                for (var i = 0; i < settings.columns.length; i++) {
                                    var col = settings.columns[i];
                                    if (typeof (col.visible) !== "undefined" && !col.visible)
                                        continue;
                                    var $th = $('<th></th>');
                                    if (typeof (col.title) !== "undefined")
                                        $th.text(col.title);
                                    else if (typeof (col.data) === "string")
                                        $th.text(col.data);
                                    else
                                        $th.text("Col " + i);
                                    $thead.find("tr").append($th);
                                }
                            }
                            $(settings.target).append($thead);
                        }
                    }
                    // this greatly upsets DataTables if present
                    delete settings.prototype;
                    $(settings.target).DataTable(settings);
                }
                if (settings.target) {
                    $(settings.target).find(".l2CboLoading").remove();
                }
            });
            // does this *look* like a DAL.Sproc object?
            if (settings.sproc && settings.sproc.getExecPacket) {
                if (settings.target) {
                    $(settings.target).append($('<div class="l2CboLoading">Loading, please wait...</div>'));
                }
                settings.sproc.then(function (results) {
                    settings.data = results;
                    waitForData.resolve(settings);
                });
            }
            else if (settings.data) {
                waitForData.resolve(settings);
            }
            if (settings.callBack != null) {
                settings.callBack();
            }
        }
        catch (ex) {
            console.error(ex);
            throw ex;
        }
    };
    return UI;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UI;
//# sourceMappingURL=L2.UI.js.map