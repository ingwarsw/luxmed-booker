// ==UserScript==
// @name         LuxMed Auto Booker
// @namespace    http://ingwar.eu.org/
// @version      1.0
// @description  LuxMed Auto Booker
// @author       You
// @match        https://portalpacjenta.luxmed.pl/PatientPortal/Reservations/Reservation/Find
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

function checkVisits() {
    var foundDivs = document.getElementsByClassName("reserveButtonDiv");
    console.log("Found " + (foundDivs.length ? foundDivs.length : 0) + " visits..");

    if (foundDivs.length) {
        console.log("Filtering..");

        foundDivs = jQuery.map(foundDivs, filterNeeded);
    }

    console.log("Found " + (foundDivs.length ? foundDivs.length : 0) + " visits.. after filtering..");

    if (!autoEnabled()) {
        console.log("Auto search is disabled.. NOT accepting visit..");
        return;
    }

    if (foundDivs.length) {
        var found = foundDivs[0];

        found.click();
        setTimeout(acceptVisit, 10000);
    } else {
        console.log("NOT Found any visits, researching..");
        setTimeout(FilterFormSubmit, 10000);
    }
}

function filterNeeded(div) {
    var a = div.firstElementChild;
    var hour = parseInt(a.text.substring(0, 2));
//    console.log("Hour: " + hour);

    if (hour > GM_getValue("time_to")) {
        console.log("Hour: " + hour + " > " + GM_getValue("time_to") + " REMOVING from list");
        return null;
    }
    if (hour < GM_getValue("time_from")) {
        console.log("Hour: " + hour + " < " + GM_getValue("time_from") + " REMOVING from list");
        return null;
    }

    return a;
}

function acceptVisit() {
    var accept = document.getElementById("cbAccept");
    if (isHidden(accept)) {
        console.log("Element is hidden .. NOT Accepting visit..");
        return;
    }
    accept.click();
    document.getElementById("okButton").click();  

}

function addAutoSearch() {
    console.log("Adding auto search checkbox..");
    // var div = document.getElementsByClassName("withSubmit")[0];
    var filtersDiv = document.getElementById("filtersDiv");

    var div = document.createElement("div");
    div.style.background = "aquamarine";
    div.style.padding = "10px";
    
    addTextNode(div, "Auto search");

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = autoEnabled();
    input.onclick = switchAuto;
    div.appendChild(input);

    addTextNode(div, "Hours from to");

    var from = document.createElement("input");
    from.id = "time_from";
    from.max = 24;
    from.min = 0;
    from.type = "number";
    from.value = GM_getValue("time_from");
    from.onchange = setTimeFrom;
    div.appendChild(from);

    var to = document.createElement("input");
    to.id = "time_to";
    to.max = 24;
    to.min = 0;
    to.type = "number";
    to.value = GM_getValue("time_to");
    to.onchange = setTimeTo;
    div.appendChild(to);

    filtersDiv.appendChild(div);
}

function addTextNode(el, str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    el.appendChild(div);
}

function setTimeFrom() {
    var val = this.value;
    console.log("Setting FROM to: " + val);
    GM_setValue("time_from", val);
}

function setTimeTo() {
    var val = this.value;
    console.log("Setting TO to: " + val);
    GM_setValue("time_to", val);
}

function autoEnabled() {
    return GM_getValue("auto");
}

function switchAuto() {
    if (autoEnabled()) {
        console.log("Turning off auto");
        GM_setValue("auto", 0);
    } else {
        console.log("Turning on auto");
        GM_setValue("auto", 1);
    }
}

function isHidden(el) {
    return (el.offsetParent === null);
}

$(document).ready(function() {
    addAutoSearch();
    checkVisits();
});

