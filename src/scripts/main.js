var colourArray = ["#52bc69", "#d65775"/*"#ed5a7d"*/, "#2ebbd1", "#d9513c", "#fec515", "#4b65ba", "#ff8a27", "#a7d41e"]; // green, pink, blue, red, yellow, indigo, orange, lime

function disableScroll() {
    $('html').css('overflow', 'hidden');
}

function enableScroll() {
    $('html').css('overflow', 'visible');
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function getColours() {
    var generatedColours = new Array();
    while (generatedColours.length < 4) {
        var n = (Math.floor(Math.random() * colourArray.length));
        if ($.inArray(n, generatedColours) == -1)
            generatedColours.push(n);
    }
    return generatedColours;
}

function isOn(value, position) {
    return (value >> position) & 1 === 1;
}

function customAlert(msg) {
    $('#custom-alert p').html(msg);
    var m = -1 * ($('#custom-alert').outerHeight() / 2);
    $('#custom-alert').css('margin-top', m + 'px');
    $('#dark-overlay').fadeIn(function () {
        $('#custom-alert').fadeIn(function () {
            setTimeout(function () {
                $('#custom-alert').fadeOut(function () {
                    $('#dark-overlay').fadeOut();
                });
            }, 1000);
        });
    });
}

function showLoadingScreen() {
    $('#loading-overlay').show();
    $('#loading-message').show();
}

function hideLoadingScreen() {
    $('#loading-overlay').hide();
}

function commonAction(retval, msg) {
    //setTimeout(function() {
    if (retval) { // mode == "exploration" && // now not only for exploration mode, but check if this opens other problems
        $('#current-action').show();
        $('#current-action').html(mode == "exploration" ? msg : ("e-Lecture Example (auto play until done)<br>" + msg));
        $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
        triggerRightPanels();
        isPlaying = true;
    }
    //}, 500);
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable)
            return decodeURIComponent(pair[1]);
    }
    return "";
}

var generatedColours = getColours();
var surpriseColour = colourArray[generatedColours[0]];
var colourTheSecond = colourArray[generatedColours[1]];
var colourTheThird = colourArray[generatedColours[2]];
var colourTheFourth = colourArray[generatedColours[3]];

$(function () {
    $('.links').css('background', surpriseColour);
    $('.right-links').css('background', surpriseColour);

    $('.colour').css("color", surpriseColour); // name
    $('h4').css("background-color", surpriseColour); // about, contact us etc. button background

    // title
    $('#title a').click(function () {
        $('#title a').removeClass('selected-viz');
        $(this).addClass('selected-viz');
        // temporary quick fix for Google Chrome Aug 2016 issue...
        setTimeout(function () {
            document.body.style.zoom = "100.1%";
        }, 100); // force resize/redraw...
        setTimeout(function () {
            document.body.style.zoom = "100%";
        }, 600);
    });

    // overlays stuffs
    $('#trigger-about').click(function () {
        if ($(window).width() > 600) {
            $('#dark-overlay').fadeIn(function () {
                $('#about').fadeIn();
            });
        }
        else
            alert('Sorry, this dialog is too big. Please load it on bigger screen');
    });

    $('#trigger-team').click(function () {
        if ($(window).width() > 600) {
            $('#dark-overlay').fadeIn(function () {
                $('#team').fadeIn();
            });
        }
        else
            alert('Sorry, this dialog is too big. Please load it on bigger screen');
    });

    $('#trigger-terms').click(function () {
        if ($(window).width() > 600) {
            $('#dark-overlay').fadeIn(function () {
                $('#termsofuse').fadeIn();
            });
        }
        else
            alert('Sorry, this dialog is too big. Please load it on bigger screen');
    });

    $('.close-overlay').click(function () {
        $('.overlays').fadeOut(function () {
            $('#dark-overlay').fadeOut();
        });
    });

    $('#dark-overlay').click(function () {
        $('.overlays').fadeOut();
        $('#dark-overlay').fadeOut();
    });


});


var GraphColoring = function () {
    var self = this;
    var gw = new GraphWidget();

    var iVL = {};
    var iEL = {};
    var amountVertex = 0;
    var amountEdge = 0;

    this.getiVL = function () {
        return iVL;
    }
    this.getiEL = function () {
        return iEL;
    } // TODO: REMOVE ME

    this.getGraphWidget = function () {
        return gw;
    }

    fixJSON = function () {
        amountVertex = 0;
        amountEdge = 0;
        for (var key in iVL) amountVertex++;
        for (var key in iEL) amountEdge++;
    }

    takeJSON = function (graph) {

        if (graph == null) return;
        graph = JSON.parse(graph);
        iVL = graph["vl"];
        iEL = graph["el"];
        fixJSON();
    }

    statusChecking = function () {
        $("#draw-status p").html("Put several points on the plane.");
    }

    warnChecking = function () {
        var warn = "";
        if (amountVertex >= 17) warn += "Too much vertex on screen, consider drawing smaller graph. ";
        if (warn == "") $("#draw-warn p").html("No Warning");
        else $("#draw-warn p").html(warn);
    }

    errorChecking = function () {
        var error = "";
        if (amountVertex == 0) {
            $("#draw-err p").html("Graph cannot be empty. ");
            return;
        }

        if (error == "") $("#draw-err p").html("No Error");
        else $("#draw-err p").html(error);
    }


    var intervalID;

    this.startLoop = function () {
        intervalID = setInterval(function () {
            takeJSON(JSONresult);
            warnChecking();
            errorChecking();
            statusChecking();
        }, 100);
    }

    this.stopLoop = function () {
        clearInterval(intervalID);
    }

    function createCompleteEdgeList(iVL) {
        var n = 0;
        for (var key in iVL) {
            n++;
        }
        var ret = {};
        var edgeCounter = 0;
        for (var i = 0; i < n; i++) {
            for (var j = i + 1; j < n; j++) {
                var edge = {
                    u: i,
                    v: j,
                    w: Math.round(Math.hypot(iVL[i]['x'] - iVL[j]['x'], iVL[i]['y'] - iVL[j]['y']) / 10)
                }
                ret[edgeCounter++] = edge;
            }
        }
        return ret;
    }

    this.draw = function () {
        if ($("#draw-err p").html() != "No Error")
            return false;
        if ($("#submit").is(':checked'))
            this.submit(JSONresult);
        if ($("#copy").is(':checked'))
            window.prompt("Copy to clipboard:", JSONresult);

        if (jQuery.isEmptyObject(iEL)) iEL = createCompleteEdgeList(iVL);
        graph = createState({iVL: iVL, iEL: iEL});
        gw.updateGraph(graph, 500);

        return true;
    }

    this.importjson = function (text) {
        takeJSON(text);
        statusChecking();
        graph = createState(iVL, iEL);
        gw.updateGraph(graph, 500);
    }

    this.getV = function () {
        return amountVertex;
    }

    this.examples = function (id) {
        iVL = getExampleGraph(id, VL);
        iEL = getExampleGraph(id, EL);
        fixJSON();
        var newState = createState({iVL: iVL, iEL: iEL});
        gw.updateGraph(newState, 500);
        return true;
    }

    function nextPermutation(arr) {
        function swap(i, j) {
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }

        function reverse(i, j) {
            while (i < j) {
                swap(i, j);
                i++;
                j--;
            }
        }

        var i = arr.length - 1;
        while (i > 0 && arr[i - 1] >= arr[i]) {
            i--;
        }
        if (i <= 0) return false;
        var j = arr.length - 1;
        while (arr[j] <= arr[i - 1]) {
            j--;
        }
        swap(i - 1, j);
        j = arr.length - 1;
        reverse(i, j);
        return true;
    }

    function bitmaskToString(bitmask) {
        // safety measure
        bitmask = parseInt(bitmask);
        var bits = [];
        do {
            bits.push(bitmask % 2);
            bitmask >>= 1;
        } while (bitmask > 0);
        return bits.reverse().join('');
    }

    // TODO: Preprocess to obtain O(1) query?
    function getEdgeKey(u, v) {
        u = parseInt(u);
        v = parseInt(v);
        for (var key in iEL) {
            var eu = iEL[key]['u'];
            var ev = iEL[key]['v'];
            if ((eu === u && ev === v) ||
                (ev === u && eu === v)) {
                return key;
            }
        }
        return -1;
    }

    function fixEdgeDirection(edgeKey, u, v) {
        if (iEL[edgeKey]['u'] !== u) {
            var t = iEL[edgeKey]['u'];
            iEL[edgeKey]['u'] = iEL[edgeKey]['v'];
            iEL[edgeKey]['v'] = t;
            return true;
        }
        return false;
    }

    var colorList = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen", "Black", "BlanchedAlmond", "Blue"];

    function processEnding(iVL, iEL, sourceVertex, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey, baseStatus, d) {
        actual_d = RunBellmanFord(iVL, iEL, sourceVertex);
        var GotWA = false;
        for (var key in iVL)
            if (d[key] != actual_d[key])
                GotWA = true;
        var last_cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey});
        for (var key in iVL)
            if (d[key] != actual_d[key]) {
                last_cs["vl"][key]["extratext"] = last_cs["vl"][key]["extratext"] + " => " + actual_d[key];
                last_cs["vl"][key]["state"] = VERTEX_RED_FILL;
                for (var key2 in iEL) {
                    var u = iEL[key2]["u"], v = iEL[key2]["v"];
                    if (v == key)
                        last_cs["el"][key2]["state"] = EDGE_GREY; // the predecessor information is also invalid
                }
            }
        last_cs["status"] = baseStatus;
        last_cs["status"] += 'This is the SSSP spanning tree from source vertex ' + sourceVertex + ".";
        return last_cs;
    }


    this.welshPowell = function () {
        var cs, stateList = [];
        var permutation = [];

        var parent = [];

        var edgeHighlighted = {};
        var vertexHighlighted = {0: true};
        var tour = [];
        var minimumTourCost = 1000 * 1000 * 1000;

        function algo(u, bitmask, costSoFar) {

            tour.push(u);
            cs = createState({
                iVL: iVL,
                iEL: iEL
            });
            cs['status'] = 'sort vertices according to degree values';
            cs['lineNo'] = 2;
            stateList.push(cs);

            function getEdgeBetween(node1, nodeId) {

                var nodeIndex = node1.neighbors.indexOf(parseInt(nodeId));

                var result = (nodeIndex == -1) ? null : nodeId;

                return result;
            }

            function sortVertices(b, a) {
                return a.neighbors.length < b.neighbors.length ? 1 : a.neighbors.length == b.neighbors.length ? 0 : -1;
            }

            // ------- STEP 1 -----------
            // the algorithm requires the use of a sorted list using
            // degree values for sorting them.
            var theGraph = [];
            for (var obj in iVL) {
                var arr = [];

                for (var edg in iEL) {
                    if (iEL[edg].v == obj) {
                        arr.push(iEL[edg].u);
                    } else if (iEL[edg].u == obj) {
                        arr.push(iEL[edg].v);
                    }
                }
                theGraph.push(arr);
            }
            var heap = [];
            var sortedNodes = [];
            for (var j in theGraph) {
                if (!theGraph.hasOwnProperty(j)) {
                    continue;
                }
                heap.push({node: j, neighbors: theGraph[j]});
            }

            sortedNodes = heap.sort(sortVertices);

            heap = null;

            // ------ STEP 2 --------
            // color initialization

            var nbColors = 0;

            var nodeColors = {};

            // ------- STEP 3 --------
            var currentIteration = 0;
            while (sortedNodes.length > 0) {
                //Node root = sortedNodes.poll();
                var root = sortedNodes.shift();
                //LinkedList<Node> myGroup = new LinkedList<Node>();
                var myGroup = [];
                //myGroup.add(root);
                myGroup.push(root);
                vertexHighlighted = [];
                //root.addAttribute(attributeName, nbColors);
                root['color'] = nbColors;
                nodeColors[root.node] = {'color': nbColors};
                tour.push(u);
                vertexHighlighted[root.node] = true;
                iVL[root.node].extratext = colorList[nbColors];
                cs = createState({
                    iVL: iVL,
                    iEL: iEL,
                    vertexHighlighted: vertexHighlighted,
                    edgeHighlighted: edgeHighlighted,
                    edgeAnimated: []
                });
                cs['status'] = 'set root node for current iteration (' + currentIteration + '), selected node: ' + root.node;
                cs['lineNo'] = 3;
                stateList.push(cs);
                currentIteration++;
                edgeHighlighted = [];

                for (var i = 0; i < sortedNodes.length;) {
                    var p = sortedNodes[i];
                    var conflict = false;
                    for (j = 0; !conflict && j < myGroup.length; j++) {
                        var edgeKey = getEdgeKey(root.node, p.node);
                        if (edgeKey != -1) {
                            tour.push(u);
                            edgeHighlighted[edgeKey] = true;
                            cs = createState({
                                iVL: iVL,
                                iEL: iEL,
                                vertexHighlighted: vertexHighlighted,
                                edgeHighlighted: edgeHighlighted,
                                edgeAnimated: edgeKey != -1 ? edgeKey : []
                            });
                            cs['status'] = 'iterate over node (' + root.node + ') edges, current edge: from (' + root.node + ') to (' + p.node + ') , and check for color conflicts';
                            cs['lineNo'] = [4, 5];
                            stateList.push(cs);
                        }
                        conflict = getEdgeBetween(p, myGroup[j].node) != null;
                    }

                    if (conflict) {
                        i++;
                    } else {
                        p['color'] = nbColors;
                        nodeColors[p.node] = {'color': nbColors};
                        myGroup.push(p);
                        sortedNodes.splice(i, 1);

                        tour.push(u);
                        iVL[p.node].extratext = colorList[nbColors];
                        cs = createState({
                            iVL: iVL,
                            iEL: iEL,
                            vertexHighlighted: vertexHighlighted,
                            edgeHighlighted: edgeHighlighted,
                            edgeAnimated: []
                        });
                        cs['status'] = 'set color: ' + colorList[nbColors] + ' to node: ' + p.node + (sortedNodes.length == 0 ? ', all edges visited:  iteration skipped' : '');
                        cs['lineNo'] = 6;
                        stateList.push(cs);
                    }
                }

                myGroup = [];
                nbColors++;
            }

            this.chromaticNumber = nbColors;
            return nbColors;
        }

        var result = algo(0, 1, 0);

        cs = createState({
            iVL: iVL,
            iEL: iEL
        });
        cs['status'] = 'The chromatic number  ' + result;
        cs['lineNo'] = 7;
        stateList.push(cs);

        for (var i = 0; i < amountVertex; i++) iVL[i]['extratext'] = '';
        console.log(stateList);
        populatePseudocode('welshPowell');
        gw.startAnimation(stateList);
        return true;
    }
    this.bfs = function (sourceVertex) {
        var notVisited = {}, vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, vertexTraversing = {},
            treeEdge = {}, backEdge = {}, forwardEdge = {}, crossEdge = {};
        var stateList = [];
        var key, i, cs;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#bfs-err').html('There is no graph to run this on. Please select an example graph first');
            return false;
        }

        if (sourceVertex >= amountVertex || sourceVertex < 0) { // source vertex not in range
            $('#bfs-err').html('This vertex does not exist in the graph. Please select another source vertex');
            return false;
        }

        var p = {}, d = {};
        for (var i = 0; i < amountVertex; i++) {
            p[i] = -1;
            d[i] = 999;
        }
        d[sourceVertex] = 0;
        for (var key in iVL) iVL[key]["extratext"] = "";
        iVL[sourceVertex]["extratext"] = "source";

        var q = []; //, EdgeProcessed = 0;
        q.push(sourceVertex);
        p[sourceVertex] = -2;
        vertexHighlighted[sourceVertex] = true;
        cs = createState({
            iVL,
            iEL,
            vertexHighlighted,
            edgeHighlighted,
            vertexTraversed,
            vertexTraversing,
            treeEdge,
            backEdge,
            crossEdge,
            forwardEdge
        });
        cs["status"] = 'Start from source s = {sourceVertex}.<br>Set Q = {{sourceVertex}}.'.replace("{sourceVertex}", sourceVertex); // d[" + sourceVertex + "] = 0,
        cs["lineNo"] = 1;
        stateList.push(cs);
        delete vertexHighlighted[sourceVertex];

        while (q.length > 0) {
            delete vertexTraversing[q[0]];
            vertexHighlighted[q[0]] = true;
            cs = createState({
                iVL,
                iEL,
                vertexHighlighted,
                edgeHighlighted,
                vertexTraversed,
                vertexTraversing,
                treeEdge,
                backEdge,
                crossEdge,
                forwardEdge
            });
            cs["status"] = 'The queue is now {{queue}}.<br>Exploring neighbors of vertex u = {neighbors}.'.replace("{queue}", q).replace("neighbors", q[0]);
            cs["lineNo"] = [2, 3];
            stateList.push(cs);

            var f = q.shift();
            vertexTraversed[f] = true;

            var neighbors = [];
            for (var j = 0; j < amountEdge; j++) if (iEL[j]["u"] == f) neighbors.push(j);
            neighbors.sort(function (a, b) {
                return iEL[a]["v"] - iEL[b]["v"]
            });

            while (neighbors.length > 0) {
                var j = neighbors.shift();
                var u = iEL[j]["u"], v = iEL[j]["v"];
                for (var key in iVL) delete vertexHighlighted[key];
                for (var key in iEL) delete edgeHighlighted[key];
                if (u == f) { // outgoing edge from vertex u
                    //EdgeProcessed++;
                    //var thisStatus = 'relax(' + u + ', ' + v + ', 1), #edge_processed = ' + EdgeProcessed + '.';
                    edgeHighlighted[j] = true;
                    for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) edgeHighlighted[key] = true;
                    cs = createState({
                        iVL,
                        iEL,
                        vertexHighlighted,
                        edgeHighlighted,
                        vertexTraversed,
                        vertexTraversing,
                        treeEdge,
                        backEdge,
                        crossEdge,
                        forwardEdge
                    });
                    cs["status"] = 'Try edge {u} → {v}'.replace("{u}", u).replace("{v}", v);
                    cs["lineNo"] = 3;
                    cs["el"][j]["animateHighlighted"] = true;
                    stateList.push(cs);

                    if (d[v] == 999) {
                        d[v] = d[u] + 1;
                        p[v] = u;
                        treeEdge[j] = true;
                        for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) treeEdge[key] = true;
                        q.push(v);
                        vertexTraversing[v] = true;
                        cs = createState({
                            iVL,
                            iEL,
                            vertexHighlighted,
                            edgeHighlighted,
                            vertexTraversed,
                            vertexTraversing,
                            treeEdge,
                            backEdge,
                            crossEdge,
                            forwardEdge
                        });
                        cs["status"] = 'Try edge {u} → {v}<br>Vertex {v} is unvisited, we have a <font color="red">tree edge</font>.'.replace("{u}", u).replace("{v}", v);
                        cs["lineNo"] = 4;
                    }
                    else {
                        var grey_it = true;
                        for (var key in iEL) if ((iEL[key]["u"] == v && iEL[key]["v"] == u) && treeEdge[key]) grey_it = false;
                        if (grey_it) {
                            forwardEdge[j] = true; // use grey to signify non-tree edge
                            for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) forwardEdge[key] = true;
                        }
                        cs = createState({
                            iVL,
                            iEL,
                            vertexHighlighted,
                            edgeHighlighted,
                            vertexTraversed,
                            vertexTraversing,
                            treeEdge,
                            backEdge,
                            crossEdge,
                            forwardEdge
                        });
                        cs["status"] = 'Try edge {u} → {v}<br>Vertex {v} is explored, we ignore this <font color="grey">non-tree edge</font>.'.replace("{u}", u).replace("{v}", v);
                        cs["lineNo"] = 5;
                    }
                    stateList.push(cs);
                }
            }
            delete vertexHighlighted[u];
        }

        for (var key in iVL) delete vertexHighlighted[key];
        for (var key in iEL) delete edgeHighlighted[key];
        vertexHighlighted[sourceVertex] = true;
        cs = createState({
            iVL,
            iEL,
            vertexHighlighted,
            edgeHighlighted,
            vertexTraversed,
            vertexTraversing,
            treeEdge,
            backEdge,
            crossEdge,
            forwardEdge
        });
        cs["status"] = 'BFS({sourceVertex}) is completed.'.replace("{sourceVertex}", sourceVertex);
        stateList.push(cs);

        populatePseudocode('bfs');
        gw.startAnimation(stateList);
        return true;
    }
    this.dfs = function (sourceVertex) {
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, vertexTraversing = {}, treeEdge = {},
            backEdge = {}, forwardEdge = {}, crossEdge = {};
        var stateList = [];
        var cs;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#dfs-err').html('There is no graph to run this on. Please select an example graph first');
            return false;
        }

        if (sourceVertex >= amountVertex || sourceVertex < 0) { // source vertex not in range
            $('#dfs-err').html('This vertex does not exist in the graph. Please select another source vertex');
            return false;
        }

        var UNVISITED = 0, EXPLORED = 1, VISITED = 2;
        var p = {}, num = {}, Count = 0; // low = {},
        for (var i = 0; i < amountVertex; i++) {
            p[i] = -1;
            num[i] = UNVISITED;
        }
        p[sourceVertex] = -2;
        for (var key in iVL) iVL[key]["extratext"] = "";
        iVL[sourceVertex]["extratext"] = "source";

        function dfsRecur(u) {
            vertexHighlighted[u] = true;
            cs = createState({
                iVL,
                iEL,
                vertexHighlighted,
                edgeHighlighted,
                vertexTraversed,
                vertexTraversing,
                treeEdge,
                backEdge,
                crossEdge,
                forwardEdge
            });
            cs["status"] = "DFS(" + u + ")";
            cs["lineNo"] = 1;
            stateList.push(cs);

            delete vertexHighlighted[u];
            vertexTraversing[u] = true;
            num[u] = EXPLORED; // low[u] = ++Count;

            var neighbors = [];
            for (var j = 0; j < amountEdge; j++) if (iEL[j]["u"] == u) neighbors.push(j);
            neighbors.sort(function (a, b) {
                return iEL[a]["v"] - iEL[b]["v"]
            });

            while (neighbors.length > 0) {
                var j = neighbors.shift();
                var u = iEL[j]["u"], v = iEL[j]["v"];
                edgeHighlighted[j] = true;
                for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) edgeHighlighted[key] = true;
                cs = createState({
                    iVL,
                    iEL,
                    vertexHighlighted,
                    edgeHighlighted,
                    vertexTraversed,
                    vertexTraversing,
                    treeEdge,
                    backEdge,
                    crossEdge,
                    forwardEdge
                });
                cs["status"] = 'Try edge {u} → {v}'.replace("{u}", u).replace("{v}", v);
                cs["lineNo"] = 2;
                cs["el"][j]["animateHighlighted"] = true;
                stateList.push(cs);

                for (var key in iVL) delete vertexHighlighted[key];
                for (var key in iEL) delete edgeHighlighted[key];

                if (num[v] == UNVISITED) {
                    vertexTraversing[v] = true;
                    treeEdge[j] = true;
                    for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) treeEdge[key] = true;
                    cs = createState({
                        iVL,
                        iEL,
                        vertexHighlighted,
                        edgeHighlighted,
                        vertexTraversed,
                        vertexTraversing,
                        treeEdge,
                        backEdge,
                        crossEdge,
                        forwardEdge
                    });
                    cs["lineNo"] = [3];
                    cs["status"] = 'Try edge {u} → {v}<br>Vertex {v} is unvisited, we have a <font color="red">tree edge</font>.'.replace("{u}", u).replace("{v}", v);
                    stateList.push(cs);

                    p[v] = u;
                    dfsRecur(v);

                    vertexHighlighted[u] = true;
                    delete vertexHighlighted[v];
                    cs = createState({
                        iVL,
                        iEL,
                        vertexHighlighted,
                        edgeHighlighted,
                        vertexTraversed,
                        vertexTraversing,
                        treeEdge,
                        backEdge,
                        crossEdge,
                        forwardEdge
                    });
                    cs["status"] = 'Finish DFS({v}), backtrack to DFS({u}).'.replace("{u}", u).replace("{v}", v);
                    cs["lineNo"] = 1;
                    stateList.push(cs);
                }
                else if (num[v] == EXPLORED) {
                    if (p[u] != v) {
                        backEdge[j] = true;
                        for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) backEdge[key] = true;
                    }
                    cs = createState({
                        iVL,
                        iEL,
                        vertexHighlighted,
                        edgeHighlighted,
                        vertexTraversed,
                        vertexTraversing,
                        treeEdge,
                        backEdge,
                        crossEdge,
                        forwardEdge
                    });
                    var thisStatus = 'Try edge {u} → {v}<br>Vertex {v} is explored, we have a '.replace("{u}", u).replace("{v}", v);
                    if (p[u] == v)
                        thisStatus = thisStatus + '<font color="blue">bidirectional edge</font> (a trivial cycle).';
                    else
                        thisStatus = thisStatus + '<font color="blue">back edge</font> (a true cycle).';
                    cs["status"] = thisStatus;
                    cs["lineNo"] = 4;
                    stateList.push(cs);
                }
                else if (num[v] == VISITED) {
                    forwardEdge[j] = true;
                    for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) forwardEdge[key] = true;
                    cs = createState({
                        iVL,
                        iEL,
                        vertexHighlighted,
                        edgeHighlighted,
                        vertexTraversed,
                        vertexTraversing,
                        treeEdge,
                        backEdge,
                        crossEdge,
                        forwardEdge
                    });
                    cs["status"] = 'Try edge {u} → {v}<br>Vertex {v} is visited, we have a <font color="grey">forward/cross edge</font>.'.replace("{u}", u).replace("{v}", v);
                    cs["lineNo"] = 5;
                    stateList.push(cs);
                }
            }
            num[u] = VISITED;
            vertexTraversed[u] = true;
            delete vertexTraversing[u];
        }

        dfsRecur(sourceVertex);

        cs = createState({
            iVL,
            iEL,
            vertexHighlighted,
            edgeHighlighted,
            vertexTraversed,
            vertexTraversing,
            treeEdge,
            backEdge,
            crossEdge,
            forwardEdge
        });
        cs["status"] = 'DFS({sourceVertex}) is completed.'.replace("{sourceVertex}", sourceVertex);
        cs["lineNo"] = 0;
        stateList.push(cs);

        populatePseudocode('dfs');
        gw.startAnimation(stateList);
        return true;
    }
    this.kruskal = function () {
        var i, key, totalWeight = 0, cs;
        var stateList = [], sortedArray = [];
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeQueued = {};
        var tempUfds = new UfdsHelper();

        if (amountVertex == 0) { // error check, no graph (maybe via empty JSON or faulty db)
            $('#kruskals-err').html("There is no graph to run this on. Please select an example graph first.");
            return false;
        }

        for (key in iVL) tempUfds.insert(key);

        for (key in iEL) {
            edgeQueued[key] = true;
            sortedArray.push(new ObjectPair(parseInt(iEL[key]["w"]), parseInt(key)));
        }
        sortedArray.sort(ObjectPair.compare);

        function sortedArrayToString() {
            var ansStr = "";
            var maxLength = Math.min(sortedArray.length, 9);
            for (var i = 0; i < maxLength; i++) {
                var thisEdgeId = sortedArray[i].getSecond();
                ansStr += "(" + iEL[thisEdgeId]["w"] + ",(" + iEL[thisEdgeId]["u"] + "," + iEL[thisEdgeId]["v"] + "))";
                if (i < (maxLength - 1)) ansStr += ", ";
            }
            if (sortedArray.length > 10) ansStr += " ...";
            return ansStr;
        }

        cs = createState({iVL, iEL});
        cs["status"] = "Edges are sorted in increasing order of weight: " + sortedArrayToString() + ".";
        cs["lineNo"] = [1, 2];
        stateList.push(cs);

        numTaken = 0;
        while (sortedArray.length > 0) {
            cs = createState({
                iVL,
                iEL,
                vertexHighlighted,
                edgeHighlighted,
                vertexTraversed,
                edgeTraversed,
                edgeQueued
            });
            cs["status"] = "The remaining edge(s) is/are " + sortedArrayToString() + ".";
            cs["lineNo"] = 3;
            stateList.push(cs);

            var dequeuedEdge = sortedArray.shift();
            var dequeuedEdgeId = dequeuedEdge.getSecond();
            var u = iEL[dequeuedEdgeId]["u"], v = iEL[dequeuedEdgeId]["v"], w = parseInt(iEL[dequeuedEdgeId]["w"]);

            edgeHighlighted[dequeuedEdgeId] = true;
            vertexHighlighted[u] = true;
            vertexHighlighted[v] = true;

            cs = createState({
                iVL,
                iEL,
                vertexHighlighted,
                edgeHighlighted,
                vertexTraversed,
                edgeTraversed,
                edgeQueued
            });
            cs["status"] = "Checking if a cycle will appear if we add this edge: (" + w + ",(" + u + "," + v + ")).";
            cs["lineNo"] = 4;
            stateList.push(cs);

            var noCycle = false;
            if (!tempUfds.isSameSet(u, v)) {
                noCycle = true;
                tempUfds.unionSet(u, v);
                edgeTraversed[dequeuedEdgeId] = true;
                vertexTraversed[u] = true;
                vertexTraversed[v] = true;
                totalWeight += w;
            }

            delete edgeHighlighted[dequeuedEdgeId];
            delete edgeQueued[dequeuedEdgeId]
            delete vertexHighlighted[u];
            delete vertexHighlighted[v];

            cs = createState({
                iVL,
                iEL,
                vertexHighlighted,
                edgeHighlighted,
                vertexTraversed,
                edgeTraversed,
                edgeQueued
            });
            if (noCycle) {
                cs["status"] = "Adding that edge will not form a cycle, so we add it to T. The current weight of T is " + totalWeight + ".";
                cs["lineNo"] = 5;
                numTaken++;
            }
            else {
                cs["status"] = " that edge will form a cycle, so we ignore it. The current weight of T remains at " + totalWeight + ".";
                cs["lineNo"] = 6;
            }
            stateList.push(cs);

            if (noCycle && (numTaken == amountVertex - 1)) {
                cs = createState({
                    iVL,
                    iEL,
                    vertexHighlighted,
                    edgeHighlighted,
                    vertexTraversed,
                    edgeTraversed,
                    edgeQueued
                });
                cs["status"] = (amountVertex - 1) + " edges have been taken by Kruskal&#39;s, so the MST has been found.<br>An optimized version of Kruskal&#39;s algorithm can stop here."; // the animation will still run until the end
                cs["lineNo"] = 5;
                stateList.push(cs);
            }
        }

        cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued});
        cs["status"] = "The highlighted vertices and edges form an MST with weight = " + totalWeight + ".<br><b><a href=\"https://cpbook.net/#downloads\" target=\"_blank\">ch4_03_kruskal_prim.cpp/java, ch4.zip, CP3</a></b>.";
        cs["lineNo"] = 7;
        stateList.push(cs);

        populatePseudocode('kruskal');
        gw.startAnimation(stateList);
        return true;
    }
    this.dijkstra = function (sourceVertex) {
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeGrey = {};
        var stateList = [];
        var key, i, cs;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#dijkstra-err').html('There is no graph to run this on. Please select an example graph first.');
            return false;
        }

        if (sourceVertex >= amountVertex || sourceVertex < 0) { // source vertex not in range
            $('#dijkstra-err').html('This vertex does not exist in the graph. Please select another source vertex.');
            return false;
        }

        isCorrect = !HasNegativeWeight(iVL, iEL);
        if (!isCorrect) {
            cs = createState({iVL, iEL});
            cs["status"] = "Error";
            cs["lineNo"] = 1;
            stateList.push(cs);
        }


        var d = {}, p = {};
        for (var i = 0; i < amountVertex; i++) {
            d[i] = 999;
            p[i] = -1;
            iVL[i]["state"] = VERTEX_DEFAULT;
            iVL[i]["extratext"] = "Inf";
        }
        d[sourceVertex] = 0;

        vertexTraversed[sourceVertex] = true;
        iVL[sourceVertex]["extratext"] = "source, 0";

        var pq = [], done = [];
        var EdgeProcessed = 0;

        for (var i = 0; i < amountVertex; i++)
            if (i == sourceVertex) pq.push(new ObjectPair(0, i));
            else pq.push(new ObjectPair(999, i));

        function ShowPQ() {
            if (pq.length == 0) return "{}";
            var result = "";
            if (pq.length > 1) result += ", (" + pq[1].getFirst() + "," + pq[1].getSecond() + ")";
            if (pq.length > 2) result += ", (" + pq[2].getFirst() + "," + pq[2].getSecond() + ")";
            if (pq.length > 3) result += ", ...";
            return result + "}";
        }

        cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey});
        cs["status"] = sourceVertex + ' is the source vertex.<br>Set p[v] = -1, d[v] = Inf, but d[' + sourceVertex + '] = 0, PQ = ' + ShowPQ() + ".";
        cs["lineNo"] = 2;
        stateList.push(cs);

        while (pq.length > 0) {
            pq.sort(ObjectPair.compare); // sort by distance, then by vertex number, lousy O(n log n) PQ update


            var curFront = pq[0].getSecond();
            done.push(curFront);

            var newStatus = 'The current priority queue ' + ShowPQ();
            var frontitem = pq.shift(); // front most item
            var dist = frontitem.getFirst(); // not used in original dijkstra
            var f = frontitem.getSecond();
            vertexHighlighted[f] = true;


            newStatus += '.<br>Exploring neighbors of vertex u = ' + f + ", d[u] = " + d[f] + ".";
            vertexTraversed[curFront] = true; // only re-highlight here
            cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey});
            cs["vl"][f]["state"] = VERTEX_GREEN_FILL;
            cs["lineNo"] = 3;
            cs["status"] = newStatus;
            stateList.push(cs);


            var neighbors = [];
            for (var j = 0; j < amountEdge; j++) if (iEL[j]["u"] == f) neighbors.push(j);
            neighbors.sort(function (a, b) {
                return iEL[a]["v"] - iEL[b]["v"]
            });

            while (neighbors.length > 0) {
                var j = neighbors.shift();
                var u = iEL[j]["u"], v = iEL[j]["v"], w = iEL[j]["w"];

                vertexTraversed[v] = true;
                EdgeProcessed++;
                var thisStatus = 'relax(' + u + ',' + v + ',' + w + '), #edge_processed = ' + EdgeProcessed;

                if ((d[u] != 999) && (w != 999) && (d[u] + w < d[v])) {
                    d[v] = d[u] + w;
                    for (var k = 0; k < pq.length; k++) // lousy O(n) PQ update, but it works for this animation (only for version 1)
                        if (pq[k].getSecond() == v) {
                            pq.splice(k, 1);
                            break;
                        }

                    edgeHighlighted[j] = true;
                    for (var key in iEL) if (iEL[key]["u"] == v && iEL[key]["v"] == u) edgeHighlighted[key] = true;

                    if ((p[v] != -1) && (p[v] != u)) { // it has a parent before and its parent is not u
                        for (var k = 0; k < amountEdge; k++)
                            if (iEL[k]["u"] == p[v] && iEL[k]["v"] == v) {
                                delete edgeHighlighted[k];
                                edgeGrey[k] = true; // now make it "grey"
                            }
                            else if (iEL[k]["u"] == v && iEL[k]["v"] == p[v] && edgeHighlighted[k])
                                delete edgeHighlighted[k];
                    }

                    delete edgeGrey[j]; // just in case the update is on the same edge
                    p[v] = u; // now update parent information
                    iVL[v]["extratext"] = d[v];

                    var canRelaxThis = true;
                    for (var k = 0; k < done.length; k++)
                        if (done[k] == v) {
                            canRelaxThis = false;
                            break;
                        }


                    pq.sort(ObjectPair.compare);
                    thisStatus = thisStatus + ".<br>d[" + v + "] = d[" + u + "]+w(" + u + "," + v + ") = " + d[u] + "+" + w + " = " + d[v] + ", p[" + v + "] = " + p[v] + ", PQ = " + ShowPQ() + ".";
                }
                else {
                    thisStatus = thisStatus + ".<br>d[" + u + "]+w(" + u + "," + v + ") > d[" + v + "], i.e. " + (d[u] == 999 ? "Inf" : d[u]) + "+" + w + " &gt; " + (d[v] == 999 ? "Inf" : d[v]) + ", so there is no change.";
                    edgeGrey[j] = true; // make this grey
                }

                cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey});
                cs["status"] = thisStatus;
                cs["lineNo"] = [4, 5];
                cs["vl"][u]["state"] = VERTEX_GREEN_FILL;
                cs["el"][j]["animateHighlighted"] = true;
                stateList.push(cs);
            }

            cs = createState({iVL, iEL, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey});
            cs["status"] = 'd[' + f + '] = ' + d[f] + ' is final as all outgoing edges of this vertex has been processed.';
            cs["lineNo"] = [4, 5];


            stateList.push(cs);
        }

        stateList.push(processEnding(iVL, iEL, sourceVertex, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeGrey, "#edge_processed = " + EdgeProcessed + ", O((V+E) log V) = " + Math.ceil((amountVertex + amountEdge) * Math.log(amountVertex) / Math.log(2.0)) + ".<br>", d));

        populatePseudocode('dijkstra');

        gw.startAnimation(stateList);
        return true;
    }

    this.rlf = function () {
        var n;
        var a = [];
        var color = [];
        var degree = [];
        var NN = [];
        var NNCount;
        var unprocessed;
        var cs;
        var stateList = [];

        function MaxDegreeVertex() {
            var max = -1;
            var max_i;
            for (var i = 0; i < n; i++)
                if (color[i] == 0)
                    if (degree[i] > max) {
                        max = degree[i];
                        max_i = i;
                    }
            return max_i;
        }

        function UpdateNN(ColorNumber) {
            NNCount = 0;
            for (var i = 0; i < n; i++)
                if (color[i] == 0) {
                    NN[NNCount] = i;
                    NNCount++;
                }
            for (var i = 0; i < n; i++)
                if (color[i] == ColorNumber)
                    for (var j = 0; j < NNCount; j++)
                        while (a[i][NN[j]] == 1) {
                            NN[j] = NN[NNCount - 1];
                            NNCount--;
                        }
        }

        function scannedInit(scanned) {
            for (var i = 0; i < n; i++)
                scanned[i] = 0;
            return scanned;
        }

        function FindSuitableY(ColorNumber, VerticesInCommon) {
            var temp, tmp_y, y;
            var scanned = [];
            VerticesInCommon = 0;
            for (var i = 0; i < NNCount; i++) {
                tmp_y = NN[i];
                temp = 0;
                scanned = scannedInit(scanned);
                for (var x = 0; x < n; x++)
                    if (color[x] == ColorNumber)
                        for (var k = 0; k < n; k++)
                            if (color[k] == 0 && scanned[k] == 0)
                                if (a[x][k] == 1 && a[tmp_y][k] == 1) {
                                    temp++;
                                    scanned[k] = 1;
                                }
                if (temp > VerticesInCommon) {
                    VerticesInCommon = temp;
                    y = tmp_y;
                }
            }
            return y;
        }

        function MaxDegreeInNN() {
            var tmp_y;
            var temp, max = 0;
            for (var i = 0; i < NNCount; i++) {
                temp = 0;
                for (var j = 0; j < n; j++)
                    if (color[NN[j]] == 0 && a[i][NN[j]] == 1)
                        temp++;
                if (temp > max) {
                    max = temp;
                    tmp_y = NN[i];
                }
            }
            return tmp_y;
        }

        function Coloring() {
            var x, y;
            var ColorNumber = 0;
            var VerticesInCommon = 0;
            color[2] = 1;
            while (unprocessed > 0) {
                x = MaxDegreeVertex();
                ColorNumber++;
                color[x] = ColorNumber;
                unprocessed--;
                UpdateNN(ColorNumber);
                while (NNCount > 0) {
                    y = FindSuitableY(ColorNumber, VerticesInCommon);
                    if (VerticesInCommon == 0)
                        y = MaxDegreeInNN();
                    color[y] = ColorNumber;
                    unprocessed--;
                    UpdateNN(ColorNumber);
                }
            }
        }

        function prepareInput() {
            n = Object.keys(iVL).length;
            for (var i = 0; i < n; i++) {
                a[i] = [];
                for (var j = 0; j < n; j++)
                    a[i][j] = 0;
            }

            for (i in iEL) {
                console.log(iEL[i]);
                a[iEL[i].u][iEL[i].v] = 1;
                a[iEL[i].v][iEL[i].u] = 1;

            }
            console.log(JSON.stringify(a));

        }

        function init() {
            color = [];
            degree = [];
            for (var i = 0; i < n; i++) {
                color[i] = 0;
                degree[i] = 0;
                for (var j = 0; j < n; j++)
                    if (a[i][j] == 1)
                        degree[i]++;
            }
            NNCount = 0;
            unprocessed = n;
        }

        prepareInput();
        init();
        Coloring();
        console.log(color);

        for (let i in color) {
            console.log(i);
            if (iVL[i])
                iVL[i].extratext = colorList[color[i]];
        }
        for (let i in iVL) {
            iVL[i].extratext = iVL[i].extratext || colorList[color[0]];
        }
        console.log(iVL);
        cs = createState({iVL, iEL});
        cs["status"] = 'Number of colors is ' + color.length;
        cs["lineNo"] = 0;
        stateList.push(cs);
        console.log(stateList);
        for (var i = 0; i < amountVertex; i++) iVL[i]['extratext'] = '';

        console.log(color);
        populatePseudocode('RLF');
        gw.startAnimation(stateList);

        return true;
    }
    this.parallel = function () {
        var data = '';
        var cs;
        var stateList = [];

        for (i in iEL) {
            data += iEL[i].u + ' ' + iEL[i].v + ' ';
        }
        data = data.slice(0, -1);
        console.log(data);

        function postMethod() {
            $.post("http://localhost:9000/api/color", {"data": data}, function (result) {

                try {
                    console.log(result);
                    let obj = JSON.parse(result);
                    console.log(obj);
                    cs = createState({iVL, iEL});
                    cs["status"] = 'Send graph to backend';
                    cs["lineNo"] = 0;
                    stateList.push(cs);
                    for (let i in obj.states) {
                        cs = createState({iVL, iEL});
                        cs["status"] = obj.states[i].status;
                        cs["lineNo"] = obj.states[i].lineNo;
                        stateList.push(cs);
                    }
                    for (let i in obj.colors) {
                        iVL[i].extratext = colorList[obj.colors[i]];
                    }
                    for (let i in iVL) {
                        iVL[i].extratext = iVL[i].extratext || colorList[0];
                    }
                    console.log(iVL);
                    cs = createState({iVL, iEL});
                    cs["status"] = 'Number of colors is ' + obj.max + ", seq time: " + obj.seqTime + " msec , parallel time: " + obj.time + " msec" + ", cores: " + obj.cores;
                    cs["lineNo"] = 0;
                    stateList.push(cs);
                    console.log(stateList);
                    for (var i = 0; i < amountVertex; i++) iVL[i]['extratext'] = '';

                    $('#progress-bar').slider("option", "max", stateList.length - 1);

                    populatePseudocode('parallel');
                    gw.startAnimation(stateList, 1000);
                } catch (e) {
                    console.log(e);
                    setTimeout(postMethod, 500);
                }
            }).fail(function () {
                alert("Connection Error");
            });
        }

        postMethod();
        return true;
    }

    function createState(options) {
        var iVLObject = options["iVL"];
        var iELObject = options["iEL"];
        var vertexHighlighted = options["vertexHighlighted"];
        var edgeHighlighted = options["edgeHighlighted"];
        var vertexTraversed = options["vertexTraversed"];
        var edgeTraversed = options["edgeTraversed"];
        var edgeQueued = options["edgeQueued"];
        var edgeCovered = options["edgeCovered"];
        var vertexCovered = options["vertexCovered"];
        var vertexGreyed = options["vertexGreyed"];
        var edgeAnimated = options["edgeAnimated"];

        var isDefaultGrey = true;
        if ((vertexHighlighted == null) && (edgeHighlighted == null) && (vertexTraversed == null) && (edgeTraversed == null) && (edgeQueued == null) && (vertexGreyed == null))
            isDefaultGrey = false;
        if (vertexHighlighted == null) vertexHighlighted = {};
        if (edgeHighlighted == null) edgeHighlighted = {};
        if (vertexTraversed == null) vertexTraversed = {};
        if (edgeTraversed == null) edgeTraversed = {};
        if (edgeQueued == null) edgeQueued = {};
        if (vertexGreyed == null) vertexGreyed = {};
        if (edgeAnimated == null) edgeAnimated = [];

        var key;
        var state = {
            "vl": {},
            "el": {}
        };

        if (isDefaultGrey) {
            for (key in iVLObject) {
                state["vl"][key] = {};
                state["vl"][key]["cx"] = iVLObject[key]["x"];
                state["vl"][key]["cy"] = iVLObject[key]["y"];
                state["vl"][key]["text"] = key;
                state["vl"][key]["state"] = VERTEX_GREY_OUTLINE;
                state["vl"][key]["extratext"] = iVLObject[key]["extratext"];
            }
            for (key in iELObject) {
                state["el"][key] = {};
                state["el"][key]["vertexA"] = iELObject[key]["u"];
                state["el"][key]["vertexB"] = iELObject[key]["v"];
                state["el"][key]["type"] = EDGE_TYPE_UDE;
                state["el"][key]["weight"] = iELObject[key]["w"];
                state["el"][key]["state"] = EDGE_GREY;
                state["el"][key]["displayWeight"] = false;
                state["el"][key]["animateHighlighted"] = false;
            }
        }
        else {
            for (key in iVLObject) {
                state["vl"][key] = {};
                state["vl"][key]["cx"] = iVLObject[key]["x"];
                state["vl"][key]["cy"] = iVLObject[key]["y"];
                state["vl"][key]["text"] = key;
                state["vl"][key]["state"] = VERTEX_DEFAULT;
                state["vl"][key]["extratext"] = iVLObject[key]["extratext"];
            }
            for (key in iELObject) {
                state["el"][key] = {};
                state["el"][key]["vertexA"] = iELObject[key]["u"];
                state["el"][key]["vertexB"] = iELObject[key]["v"];
                state["el"][key]["type"] = EDGE_TYPE_UDE;
                state["el"][key]["weight"] = iELObject[key]["w"];
                state["el"][key]["state"] = EDGE_DEFAULT;
                state["el"][key]["displayWeight"] = false;
                state["el"][key]["animateHighlighted"] = false;
            }
        }

        for (key in edgeAnimated) {
            var edgeKey = edgeAnimated[key];
            state["el"][edgeKey]["animateHighlighted"] = true;
        }

        for (key in edgeQueued) {
            key1 = state["el"][key]["vertexA"];
            key2 = state["el"][key]["vertexB"]
            state["vl"][key1]["state"] = VERTEX_DEFAULT;
            state["vl"][key2]["state"] = VERTEX_DEFAULT;
            state["el"][key]["state"] = EDGE_DEFAULT;
        }

        for (key in iVL) {
            if (vertexGreyed[key] === undefined) {
                state["vl"][key]["state"] = VERTEX_DEFAULT;
            }
        }

        for (key in edgeCovered) state["el"][key]["state"] = EDGE_BLUE;
        for (key in vertexCovered) state["vl"][key]["state"] = VERTEX_BLUE_FILL;
        for (key in vertexHighlighted) state["vl"][key]["state"] = VERTEX_HIGHLIGHTED; // VERTEX_BLUE_FILL;
        for (key in edgeHighlighted) state["el"][key]["state"] = EDGE_HIGHLIGHTED; // EDGE_BLUE;
        for (key in vertexTraversed) state["vl"][key]["state"] = VERTEX_TRAVERSED; // VERTEX_GREEN_FILL;
        for (key in edgeTraversed) state["el"][key]["state"] = EDGE_TRAVERSED; // EDGE_GREEN;

        return state;
    }

    function populatePseudocode(act) {
        var codes = [];
        switch (act) {
            case 'welshPowell':
                codes.push('function welshPowell(Graph)');
                codes.push('&nbsp;sort vertices according to degree values');
                codes.push('&nbsp;set root node & add color');
                codes.push('&nbsp;iterate over each node and its unvisited edges');
                codes.push('&nbsp;&nbsp;check for conflicts');
                codes.push('&nbsp;&nbsp;add color if there is a conflict');
                codes.push('&nbsp;return number_Of_Colors');
                codes.push('');
                break;
            case 'bfs':
                codes.push('BFS(u), Q = {u}');
                codes.push('while !Q.empty // Q is a normal queue');
                codes.push('&nbsp;&nbsp;for each neighbor v of u = Q.front, Q.pop');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;if v is unvisited, tree edge, Q.push(v)');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;else if v is visited, we ignore this edge');
                codes.push('');
                break;
            case 'dfs':
                codes.push('DFS(u)');
                codes.push('for each neighbor v of u');
                codes.push('&nbsp;&nbsp;if v is unvisited, tree edge, DFS(v)');
                codes.push('&nbsp;&nbsp;else if v is explored, bidirectional/back edge');
                codes.push('&nbsp;&nbsp;else if v is visited, forward/cross edge');
                codes.push('');
                break;
            case 'kruskal':
                codes.push("Sort E edges by increasing weight");
                codes.push('T = {}');
                codes.push('for (i = 0; i &lt; edgeList.length; i++)');
                codes.push("&nbsp;&nbsp;if adding e = edgelist[i] does not form a cycle");
                codes.push("&nbsp;&nbsp;&nbsp;&nbsp;add e to T");
                codes.push("&nbsp;&nbsp;else ignore e");
                break;
            case 'dijkstra':
                codes.push('show warning if the graph has -ve weight edge');
                codes.push('initSSSP, pre-populate PQ');
                codes.push('while !PQ.empty() // PQ is a Priority Queue');
                codes.push('&nbsp;&nbsp;for each neighbor v of u = PQ.front(), PQ.pop()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;relax(u, v, w(u, v)) + update PQ');
                codes.push('');
                break;
            case 'RLF':
                codes.push('k ← 0');
                codes.push('while G contains uncolored vertices do');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp; Let U be the set of uncolored vertices');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp; Set k ← k + 1');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp; Choose a vertex v ∈ U with largest value AU (v)');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp; Construct Cv and assign color k to all vertices ');
                codes.push('return k');
                break;
            case 'parallel':
                codes.push('get vertex set');
                codes.push('while vertexSet.size()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;     parallelFor(lb,ub) start()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; run()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;     parallelFor(lb,ub) start()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; run()');
                codes.push('&nbsp;&nbsp;&nbsp;&nbsp; get new vertex set');
                break;
            default:
                alert("WRONG POPULATE PSEUDOCODE");
        }
        for (var i = 0; i < codes.length; i++) {
            $('#code' + (i + 1)).html(codes[i]);
        }
    }
}


// GraphColoring Actions
var actionsWidth = 150;
var statusCodetraceWidth = 430;

var isExamplesOpen = false, isWelshPowellOpen = false, isDPOpen = false, isApproximationOpen = false;

function openExamples() {
    if (!isExamplesOpen) {
        $('.examples').fadeIn('fast');
        isExamplesOpen = true;
    }
}

function closeExamples() {
    if (isExamplesOpen) {
        $('.examples').fadeOut('fast');
        isExamplesOpen = false;
    }
}

function openWelshPowell() {
    if (!isWelshPowellOpen) {
        $('.prims').fadeIn('fast');
        isWelshPowellOpen = true;
    }
}

function closeWelshPowell() {
    if (isWelshPowellOpen) {
        $('.welshPowell').fadeOut('fast');
        $('#welshPowell-err').html("");
        isWelshPowellOpen = false;
    }
}

function closeAll() {
    closeExamples();
    closeWelshPowell();
    $('.action-menu-pullout').fadeOut('fast');
}


function hideEntireActionsPanel() {
    closeAll();
    hideActionsPanel();
}


// local
write(true, false);
var mw, gw, randomGraphID;
//  ON LOAD
$(function () {
    $('#play').hide();
    mw = new GraphColoring();
    gw = mw.getGraphWidget();
    var options = [K5];
    mw.examples(options[Math.floor(Math.random() * 1)]);
    randomGraphID = -1;

    var graphJSON = getQueryVariable("create");
    if (graphJSON.length > 0) {
        importjson(graphJSON);
        window.history.pushState("object or string", "Title", window.location.href.split('?')[0]);
    }

    $('#draw').click(function () {
        closeAll();
    });

    $('#examples').click(function () {
        closeAll();
        openExamples();
    })
    $('#bfs').click(function () {
        closeAll();
        $('.bfs').fadeIn('fast');
    });
    $('#dfs').click(function () {
        closeAll();
        $('.dfs').fadeIn('fast');
    });
    $('#dijkstra').click(function () {
        closeAll();
        $('.dijkstra').fadeIn('fast');
    });
    $('#welshPowell').click(function () {
        closeAll();
        openWelshPowell();
    });
});

function importjson(text) {
    if (isPlaying) stop();
    if (mode == "exploration") {
        mw.importjson(text);
        closeExamples();
        isPlaying = false;
    }
}

function drawGraph() {
    if (isPlaying) stop();

    $('#dark-overlay').fadeIn(function () {
        $('#drawgraph').fadeIn();
    });
    mw.startLoop();
    isPlaying = false;

}

function drawDone() {
    if (!mw.draw()) return false;
    mw.stopLoop();
    $('#drawgraph').fadeOut();
    $('#dark-overlay').fadeOut();
}

function drawCancel() {
    mw.stopLoop();
    $('#drawgraph').fadeOut();
    $('#dark-overlay').fadeOut();
}

function example(id) {
    if (isPlaying) stop();
    setTimeout(function () {
        if ((mode == "exploration") && mw.examples(id)) {
            $('#progress-bar').slider("option", "max", 0);
            closeExamples();
            isPlaying = false;
        }
    }, 500);
}

function welshPowell() {
    if (isPlaying) stop();
    commonAction(mw.welshPowell(), 'WelshPowell');
}

function bfs() {
    if (isPlaying) stop();
    var input = parseInt($('#bfs-v').val());
    commonAction(mw.bfs(input), "BFS(" + input + ")");
    setTimeout(function () {
        $("#dfs-v").val(1 + Math.floor(Math.random() * mw.getV()));
    }, 500);
}

function dfs() {
    if (isPlaying) stop();
    var input = parseInt($('#dfs-v').val());
    commonAction(mw.dfs(input), "DFS(" + input + ")");
    setTimeout(function () {
        $("#dfs-v").val(1 + Math.floor(Math.random() * mw.getV()));
    }, 500);
}

function kruskal() {
    if (isPlaying) stop();
    commonAction(mw.kruskal(), "Kruskal&#39;s Algorithm");
}

function dijkstra() {
    if (isPlaying) stop();
    var input = parseInt($('#dijkstra-v').val());
    commonAction(mw.dijkstra(input,), ("OriginalDijkstra(" + input + ")"));
    setTimeout(function () {
        $("#dijkstra-v").val(1 + Math.floor(Math.random() * mw.getV()));
    }, 500);
}


function rlf() {
    if (isPlaying) stop();
    commonAction(mw.rlf(), "RLF");
}

function parallel() {
    if (isPlaying) stop();
    commonAction(mw.parallel(), "Parallel");
}