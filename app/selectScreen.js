/*
 * JS for selectScreen generated by Appery.io
 */

Apperyio.getProjectGUID = function() {
    return '571c8f48-30e4-4f79-bcd1-002410b6b1dd';
};

function navigateTo(outcome, useAjax) {
    Apperyio.navigateTo(outcome, useAjax);
}

// Deprecated


function adjustContentHeight() {
    Apperyio.adjustContentHeightWithPadding();
}

function adjustContentHeightWithPadding(_page) {
    Apperyio.adjustContentHeightWithPadding(_page);
}

function setDetailContent(pageUrl) {
    Apperyio.setDetailContent(pageUrl);
}

Apperyio.AppPages = [{
    "name": "startScreen",
    "location": "startScreen.html"
}, {
    "name": "profile",
    "location": "profile.html"
}, {
    "name": "selectScreen",
    "location": "selectScreen.html"
}];

selectScreen_js = function(runBeforeShow) {

    /* Object & array with components "name-to-id" mapping */
    var n2id_buf = {
        'spacer_4': 'selectScreen_spacer_4',
        'mobilebutton_1': 'selectScreen_mobilebutton_1',
        'spacer_2': 'selectScreen_spacer_2',
        'mobilebutton_3': 'selectScreen_mobilebutton_3'
    };

    if ("n2id" in window && window.n2id !== undefined) {
        $.extend(n2id, n2id_buf);
    } else {
        window.n2id = n2id_buf;
    }

    if (navigator.userAgent.indexOf("IEMobile") != -1) {
        //Fix for jQuery Mobile's footer in Cordova webview on WP8 devices
        var msViewportStyle = document.createElement("style");
        msViewportStyle.appendChild(
        document.createTextNode("@media screen and (orientation: portrait){@-ms-viewport {width: 320px; height: 536px;user-zoom: fixed;max-zoom: 1;min-zoom: 1;}}" + "@media screen and (orientation:landscape){@-ms-viewport{width:480px;user-zoom:fixed;max-zoom:1;min-zoom:1;}}"));
        document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
    }

    Apperyio.CurrentScreen = 'selectScreen';

    /*
     * Nonvisual components
     */
    var datasources = [];

    /*
     * Events and handlers
     */

    // Before Show
    var selectScreen_beforeshow = function() {
            Apperyio.CurrentScreen = "selectScreen";
            for (var idx = 0; idx < datasources.length; idx++) {
                datasources[idx].__setupDisplay();
            }
        };

    // On Load
    var selectScreen_onLoad = function() {
            selectScreen_elementsExtraJS();

            // TODO fire device events only if necessary (with JS logic)
            selectScreen_deviceEvents();
            selectScreen_windowEvents();
            selectScreen_elementsEvents();
        };

    // screen window events
    var selectScreen_windowEvents = function() {

            $('#selectScreen').bind('pageshow orientationchange', function() {
                var _page = this;
                adjustContentHeightWithPadding(_page);
            });

        };

    // device events
    var selectScreen_deviceEvents = function() {
            document.addEventListener("deviceready", function() {

            });
        };

    // screen elements extra js
    var selectScreen_elementsExtraJS = function() {
            // screen (selectScreen) extra code

        };

    // screen elements handler
    var selectScreen_elementsEvents = function() {
            $(document).on("click", "a :input,a a,a fieldset label", function(event) {
                event.stopPropagation();
            });

            $(document).off("click", '#selectScreen_mobilecontainer [name="mobilebutton_1"]').on({
                click: function() {
                    if (!$(this).attr('disabled')) {
                        Apperyio.navigateTo('profile', {
                            transition: 'slide',
                            reverse: false
                        });

                    }
                },
            }, '#selectScreen_mobilecontainer [name="mobilebutton_1"]');

        };

    $(document).off("pagebeforeshow", "#selectScreen").on("pagebeforeshow", "#selectScreen", function(event, ui) {
        selectScreen_beforeshow();
    });

    if (runBeforeShow) {
        selectScreen_beforeshow();
    } else {
        selectScreen_onLoad();
    }
};

$(document).off("pagecreate", "#selectScreen").on("pagecreate", "#selectScreen", function(event, ui) {
    Apperyio.processSelectMenu($(this));
    selectScreen_js();
});