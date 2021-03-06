var gotomap = new classGotoMap();
var readget = '';
function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                readget = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
}
readTextFile("src/village.txt")
var data = readget.split('\n');
var cdata = [];
var checkArray = [];
console.log("edit0107-3")
for (i = 0; i < data.length; i++) {
    c = data[i].split('\t');

    var get = [parseInt(c[0]), c[1], c[2], parseInt(c[3]), c[4], parseInt(c[5]), parseFloat(c[6]), parseFloat(c[7]), c[8], c[9], c[10], c[11].split('、'), c[12].split('、')];
    cdata.push(get)
    checkArray.push(1);
}
// console.log('cdata: ', cdata);
// console.log('checkArray: ', checkArray);

var markbox = [];
function getdp(p1, p2) {
    return Math.pow(p1, 2) + Math.pow(p2, 2)
}

function showVal() {
    var inputYearVal = document.getElementById("exslider").value;
    var inputScaleVal = document.getElementById("exslider2").value;

    var upperYearVal;
    var lowerYearVal;
    var upperScaleVal;
    var lowerScaleVal;
    if (document.getElementById("flexCheckDefault").checked) {
        upperYearVal = parseInt(inputYearVal) + parseInt($("#inputyear").val());
        lowerYearVal = parseInt(inputYearVal);
        document.getElementById("valBox").innerHTML = "建立時間：" + lowerYearVal + "~" + upperYearVal;
    }
    else {
        upperYearVal = parseInt(inputYearVal);
        lowerYearVal = 1940;
        document.getElementById("valBox").innerHTML = "建立時間：至 " + upperYearVal + " 年";
    }
    if (document.getElementById("flexCheckDefault2").checked) {
        upperScaleVal = parseInt(inputScaleVal) + parseInt($("#inputscale").val());
        lowerScaleVal = parseInt(inputScaleVal);
        document.getElementById("valBox2").innerHTML = "眷村規模：" + lowerScaleVal + "~" + upperScaleVal;
    }
    else {
        upperScaleVal = parseInt(inputScaleVal);
        lowerScaleVal = 0;
        document.getElementById("valBox2").innerHTML = "眷村規模：小於 " + upperScaleVal + " 戶";
    }

    for (i = 0; i < markbox.length; i++) {
        if ((markbox[i].year > upperYearVal || markbox[i].year < lowerYearVal ||
            markbox[i].scale > upperScaleVal || markbox[i].scale < lowerScaleVal)
            && markbox[i].shown == 1)
            markbox[i].delete();
        else if (checkArray[i] == 0 && markbox[i].shown == 1)
            markbox[i].delete();
        else if (markbox[i].year >= lowerYearVal && markbox[i].year <= upperYearVal
            && markbox[i].scale >= lowerScaleVal && markbox[i].scale <= upperScaleVal
            && checkArray[i] == 1 && markbox[i].shown == 0)
            markbox[i].create();
    }
}

$('#flexCheckDefault').change(function () {
    showVal();
});
$("#inputyear").on('input', function () {
    showVal();
});
$('#flexCheckDefault2').change(function () {
    showVal();
});
$("#inputscale").on('input', function () {
    showVal();
});

$("#launch").hide()
var ken = '<datalist id="datalistOptions">';
var namelist = ['', ''];
var bookkendata = "";
var arrowtext = "";

function fillHtmlContent(name, index1, index2) {
    if (cdata[index1][index2] != "--"){
        $(name).html(cdata[index1][index2]);
        $('#'+index2).css('display', 'block');
    }
    else {
        $('#'+index2).css('display', 'none');
    }
}

for (i = 0; i < cdata.length; i++) {
    ken += '\n<option id="searchinput' + i + '" value="' + cdata[i][1] + '">'; //名稱
    var position = [parseFloat(cdata[i][7]), parseFloat(cdata[i][6])]; //經緯度
    var mark = new mapMark(position, parseInt(cdata[i][3]), parseInt(cdata[i][5])); //年代
    mark.addEvtClick(function (coordinate) {
        var pos = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        // console.log(pos);
        var distance2 = 0.0005;
        var distance1 = 0.001;
        var min_index = 0;
        for (j = 0; j < markbox.length; j++) {
            var dx = markbox[j].pos[0] - pos[0];
            var dy = markbox[j].pos[1] - pos[1];
            dx = dx < 0 ? -dx : dx;
            dy = dy < 0 ? -dy : dy;

            if (dx > distance1 || dy > distance1  || markbox[j].shown === 0) continue;
            var d = getdp(dx, dy);
            if (d < distance2) {
                min_index = j;
                distance2 = d;
            }
        }

        fillHtmlContent('#villageNo', min_index, 0);
        fillHtmlContent('#villageName', min_index, 1);
        fillHtmlContent('#villageTime', min_index, 3);
        fillHtmlContent('#villageAddress', min_index, 2);
        fillHtmlContent('#villageType', min_index, 4);
        fillHtmlContent('#villageScale', min_index, 5);
        fillHtmlContent('#villageContent', min_index, 8);
        fillHtmlContent('#villageHistory', min_index, 9);
        fillHtmlContent('#villageSpecial', min_index, 10);
        $('#villageRefernce').children().remove();
        $('#villageRefernce').html("")
        for (j = 0; j < cdata[min_index][11].length; j++) {
            if (cdata[min_index][11][j] != "--") {
                if (j == 0) content = "<a href=\"" + cdata[min_index][12][j] + "\">" + cdata[min_index][11][j] + "</a>";
                else content = "、<a href=\"" + cdata[min_index][12][j] + "\">" + cdata[min_index][11][j] + "</a>";
                $('#villageRefernce').append(content);
                $('#11').css('display', 'block');
            }
            else $('#11').css('display', 'none');
        }
        $("#staticBackdropLabel").html(cdata[min_index][1] + "（" + cdata[min_index][3] + "）");
        $("#launch").click();
    });
    mark.create();
    markbox.push(mark)
    map.on('pointermove', function (evt) {
        if (map.hasFeatureAtPixel(evt.pixel)) {
            map.getTargetElement().style.cursor = 'pointer';
            if (mark.hover == 0) {
                mark.hover = 1;
                var coordinate = evt.coordinate;
                $("#popup").css("display", "block");
                var container = document.getElementById('popup');
                var closer = document.getElementById('popup-closer');
                var popOverlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
                    element: container,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 50
                    },
                    offset: [1, -1]
                }));
                map.addOverlay(popOverlay);
                var pos = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                var distance = 0.0005;
                var minid;
                for (j = 0; j < markbox.length; j++) {
                    var dx = markbox[j].pos[0] - pos[0];
                    var dy = markbox[j].pos[1] - pos[1];
                    dx = dx < 0 ? -dx : dx;
                    dy = dy < 0 ? -dy : dy;

                    if (dx > 0.01 || dy > 0.01 || markbox[j].shown === 0) {
                        continue;
                    }
                    // console.log(dx, dy);
                    var d = getdp(dx, dy);
                    if (d < distance) {
                        minid = j;
                        distance = d;
                    }
                }
                $("#popup-content").html(cdata[minid][1] + "（" + cdata[minid][3] + "）");
                popOverlay.setPosition(coordinate);
                closer.onclick = function () {
                    popOverlay.setPosition(undefined);
                    closer.blur();
                    return false;
                };
            }
        } else {
            mark.hover = 0;
            $("#popup").hide();
            map.getTargetElement().style.cursor = '';
        }
    });
}

dragElement(document.getElementById("operation"));
$("#exampleDataList").html(ken + '\n</datalist>')
$("#exampleDataList").change(function () {
    for (i = 0; i < cdata.length + 1; i++) {
        if (i == cdata.length && $("#exampleDataList").val() != "")
            alert("搜查不到結果");
        else {
            if (cdata[i][1] == $("#exampleDataList").val()) {
                map.getView().animate({ center: ol.proj.fromLonLat([parseFloat(cdata[i][7]), parseFloat(cdata[i][6])]), zoom: 14, duration: 2000 });

                fillHtmlContent('#villageNo', i, 0);
                fillHtmlContent('#villageName', i, 1);
                fillHtmlContent('#villageTime', i, 3);
                fillHtmlContent('#villageAddress', i, 2);
                fillHtmlContent('#villageType', i, 4);
                fillHtmlContent('#villageScale', i, 5);
                fillHtmlContent('#villageContent', i, 8);
                fillHtmlContent('#villageHistory', i, 9);
                fillHtmlContent('#villageSpecial', i, 10);

                $('#villageRefernce').children().remove();
                $('#villageRefernce').html("")
                for (j = 0; j < cdata[i][11].length; j++) {
                    if (cdata[i][11][j] != "--") {
                        if (j == 0) content = "<a href=\"" + cdata[i][12][j] + "\">" + cdata[i][11][j] + "</a>";
                        else content = "、<a href=\"" + cdata[i][12][j] + "\">" + cdata[i][11][j] + "</a>";
                        $('#11').css('display', 'block');
                        $('#villageRefernce').append(content);
                    }
                    else $('#11').css('display', 'none');
                }
                $("#staticBackdropLabel").html(cdata[i][1] + "（" + cdata[i][3] + "）");
                $("#launch").click();
                break;
            }
        }
    }
});

$("#DataSearch").change(function () {
    let searchWord = $("#DataSearch").val();
    let check = [];
    console.log('searchWord: ', searchWord);

    for (i = 0; i < cdata.length; i++) {
        if (cdata[i][1].includes(searchWord) || cdata[i][2].includes(searchWord) || cdata[i][4].includes(searchWord) ||
            cdata[i][8].includes(searchWord) || cdata[i][9].includes(searchWord) || cdata[i][10].includes(searchWord) || cdata[i][11].includes(searchWord)) {
            check.push(1);
        }
        else check.push(0);
    }
    checkArray = check;
    showVal();
});

function clearSearch() {
    let check = [];
    for (i = 0; i < cdata.length; i++) {
        check.push(1);
    }
    checkArray = check;
    $("#DataSearch").val("");
    showVal();
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById("valBox")) {
        document.getElementById("valBox").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
