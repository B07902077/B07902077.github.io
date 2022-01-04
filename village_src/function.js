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
readTextFile("village_src/village.txt")
var data = readget.split('\n');
// console.log('data: ', data);
var cdata = [];
var checkArray = [];
console.log("edit0104")
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
    return Math.pow(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2), 1 / 2)
}

function showVal(newVal) {
    if (document.getElementById("flexCheckDefault").checked) {
        var com = parseInt(newVal) + parseInt($("#inputyear").val());
        document.getElementById("valBox").innerHTML = "建立時間：" + newVal + "~" + com;
        for (i = 0; i < markbox.length; i++) {
            if ((markbox[i].year > com || markbox[i].year < newVal) && markbox[i].shown == 1)
                markbox[i].delete();
            else if (checkArray[i] == 0 && markbox[i].shown == 1)
                markbox[i].delete();
            else if (markbox[i].year >= newVal && markbox[i].year <= com && checkArray[i] == 1 && markbox[i].shown == 0)
                markbox[i].create();
        }
    } else {
        document.getElementById("valBox").innerHTML = "時間：至 " + newVal;
        for (i = 0; i < markbox.length; i++) {
            if (markbox[i].year > newVal && markbox[i].shown == 1) {
                markbox[i].delete();
            }
            else if (checkArray[i] == 0 && markbox[i].shown == 1) {
                markbox[i].delete();
            }
            else if (markbox[i].year <= newVal && checkArray[i] == 1 && markbox[i].shown == 0) {
                markbox[i].create();
            }
        }
    }

}
$('#flexCheckDefault').change(function () {
    showVal($("#exslider").val())
});
$("#inputyear").on('input', function () {
    showVal($("#exslider").val())
});
$("#launch").hide()
var ken = '<datalist id="datalistOptions">';
var namelist = ['', ''];
var bookkendata = "";
var arrowtext = "";

for (i = 0; i < cdata.length; i++) {
    ken += '\n<option id="searchinput' + i + '" value="' + cdata[i][1] + '">'; //名稱
    var pos = [parseFloat(cdata[i][7]), parseFloat(cdata[i][6])]; //經緯度
    var mark = new mapMark(pos, parseInt(cdata[i][3]), data[i][0]); //年代
    mark.addEvtClick(function (coordinate) {
        var pos = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        var distance = 1;
        var min_index = 0;
        console.log("id:", id);
        for (j = 0; j < markbox.length; j++) {
            if (getdp(markbox[j].pos, pos) < distance) {
                distance = getdp(markbox[j].pos, pos);
                min_index = j;
            }
        }
        $('#villageNo').html(cdata[min_index][0]);
        $('#villageName').html(cdata[min_index][1]);
        $('#villageTime').html(cdata[min_index][3]);
        $('#villageAddress').html(cdata[min_index][2]);
        $('#villageType').html(cdata[min_index][4]);
        $('#villageScale').html(cdata[min_index][5]);
        $('#villageContent').html(cdata[min_index][8]);
        $('#villageHistory').html(cdata[min_index][9]);
        $('#villageSpecial').html(cdata[min_index][10]);
        $('#villageRefernce').children().remove();
        $('#villageRefernce').html("")
        for (j = 0; j < cdata[min_index][11].length; j++) {
            if (j == 0) content = "<a href=\"" + cdata[min_index][12][j] + "\">" + cdata[min_index][11][j] + "</a>";
            else content = "、<a href=\"" + cdata[min_index][12][j] + "\">" + cdata[min_index][11][j] + "</a>";
            $('#villageRefernce').append(content);
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
                        duration: 250
                    },
                    offset: [10, -20]
                }));
                map.addOverlay(popOverlay);
                var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
                var pos = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                var mind = 100;
                for (j = 0; j < markbox.length; j++) {
                    var d = getdp(markbox[j].pos, pos);
                    if (d < mind) {
                        $("#popup-content").html(cdata[j][1] + "（" + cdata[j][3] + "）");
                        mind = d;
                    }
                }
                popOverlay.setPosition(coordinate);
                closer.onclick = function () {
                    popOverlay.setPosition(undefined);
                    closer.blur();
                    return false;
                };
            }
        } else {
            mark.hover = 0;
            //$("#hintbox").hide()
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
                $('#villageNo').html(cdata[i][0]);
                $('#villageName').html(cdata[i][1]);
                $('#villageTime').html(cdata[i][3]);
                $('#villageAddress').html(cdata[i][2]);
                $('#villageType').html(cdata[i][4]);
                $('#villageScale').html(cdata[i][5]);
                $('#villageContent').html(cdata[i][8]);
                $('#villageHistory').html(cdata[i][9]);
                $('#villageSpecial').html(cdata[i][10]);
                console.log(cdata[i][1]);
                console.log(cdata[i][11].length);
                $('#villageRefernce').children().remove();
                $('#villageRefernce').html("")
                for (j = 0; j < cdata[i][11].length; j++) {
                    if (j == 0) content = "<a href=\"" + cdata[i][12][j] + "\">" + cdata[i][11][j] + "</a>";
                    else content = "、<a href=\"" + cdata[i][12][j] + "\">" + cdata[i][11][j] + "</a>";
                    $('#villageRefernce').append(content);
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
        // console.log(cdata[i][4]);
        // 目前只搜尋 cdata[i][4]]、cdata[i][5]，應再新增其他欄位的搜尋。
        if (cdata[i][1].includes(searchWord) || cdata[i][2].includes(searchWord) || cdata[i][4].includes(searchWord) ||
            cdata[i][8].includes(searchWord) || cdata[i][9].includes(searchWord) || cdata[i][10].includes(searchWord) || cdata[i][11].includes(searchWord)) {
            check.push(1);
        }
        else check.push(0);
    }
    checkArray = check;
    console.log('check: ', check);
    console.log('checkArray: ', checkArray);
    showVal($("#exslider").val());
});

function clearSearch() {
    let check = [];
    for (i = 0; i < cdata.length; i++) {
        check.push(1);
    }
    checkArray = check;
    $("#DataSearch").val("");
    showVal($("#exslider").val());
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
