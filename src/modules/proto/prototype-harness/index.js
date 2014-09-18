var renderOncePType = require('@grid/proto/render-once');
var addRemovePType = require('@grid/proto/add-remove');

module.exports =
    angular.module('prototype-harness', [
        require('../../../../tmp/templates').name
    ])
        .directive('prototypeHarness', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'prototype-harness.html',
                link: function ($scope, elem) {
                    $scope.ptypeModel = {
                        rows: 1000,
                        cols: 100,
                        buffer: 50,
                        debounce: 500
                    };

                    var isChrome = navigator.userAgent.has('Chrome');

                    $scope.rebuild = function () {
                        if (currentPType) {
                            currentPType.setDimensions($scope.ptypeModel.rows, $scope.ptypeModel.cols);
                            currentPType.rebuild();
                        }
                    };

                    var currentPType, $container;
                    $scope.currentTest;

                    function resetContainer() {
                        if ($container) {
                            $container.remove();
                        }
                        $container = $('<div class="prototype-container"/>');
                        elem.append($container);
                    }

                    $scope.tests = [
                        {
                            name: 'Build Once Text Nodes',
                            ptype: renderOncePType,
                            opts: {useTextNodes: true, precreatedTextNodes: true}
                        },
                        {
                            name: 'Build Once Text Nodes Not Precreated',
                            ptype: renderOncePType,
                            opts: {useTextNodes: true, precreatedTextNodes: false}
                        }, {
                            name: 'Build Once Html',
                            ptype: renderOncePType,
                            opts: {useTextNodes: false}
                        }, {
                            name: 'Build Once Html Text Only',
                            ptype: renderOncePType,
                            opts: {useTextNodes: false, htmlOnlyText: true}
                        },
                        {
                            name: 'Add Remove',
                            ptype: addRemovePType,
                            opts: {useScroller: true},
                            prebuild: populateAddRemoveOpts
                        },
                        {
                            name: 'Add Remove No Scroller',
                            ptype: addRemovePType,
                            opts: {useScroller: false},
                            prebuild: populateAddRemoveOpts
                        }
                    ];

                    function populateAddRemoveOpts(test) {
                        var opts = test.opts;
                        opts.buffer = $scope.ptypeModel.buffer;
                        opts.debounce = $scope.ptypeModel.debounce;
                    }

                    $scope.buildTest = function (test) {
                        resetContainer();

                        if (test.prebuild) {
                            test.prebuild(test);
                        }
                        var ptype = test.ptype($container);
                        ptype.setOptions(test.opts);
                        currentPType = ptype;
                        $scope.currentTest = test;

                        $scope.rebuild();
                    };

                    var scroll = [-3, -30, -39, -57, -62, -159, -306, -459, -594, -615, -615, -600, -576, -549, -516, -488, -453, -423, -393, -366, -333, -312, -288, -261, -243, -219, -198, -183, -165, -150, -135, -125, -114, -102, -96, -90, -78, -72, -69, -62, -57, -54, -48, -45, -39, -36, -33, -33, -30, -27, -24, -21, -21, -18, -18, -15, -15, -15, -12, -12, -12, -9, -9, -9, -6, -6, -6, -6, -6, -6, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3, -30, -39, -57, -62, -159, -306, -459, -594, -615, -615, -600, -576, -549, -516, -488, -453, -423, -393, -366, -333, -312, -288, -261, -243, -219, -198, -183, -165, -150, -135, -125, -114, -102, -96, -90, -78, -72, -69, -62, -57, -54, -48, -45, -39, -36, -33, -33, -30, -27, -24, -21, -21, -18, -18, -15, -15, -15, -12, -12, -12, -9, -9, -9, -6, -6, -6, -6, -6, -6, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3];
                    var reverseScroll = scroll.map(function (delta) {
                        return delta * -1;
                    });
                    var scrollAmounts = scroll.include(reverseScroll);
                    var currentScrollIndex = -1;

                    function nextScroll() {
                        if (currentScrollIndex + 1 < scrollAmounts.length) {
                            currentScrollIndex++;
                            var delta = scrollAmounts[currentScrollIndex];
                            if ($scope.currentTest.ptype === renderOncePType) {
                                var mweDelta = delta;
                                var mwe = jQuery.Event("mousewheel", {
                                    originalEvent: {
                                        wheelDelta: mweDelta,
                                        wheelDeltaY: mweDelta,
                                        wheelDeltaX: 0
                                    }
                                });
                                var weDelta = -1 * delta;
                                var we = jQuery.Event("wheel", {originalEvent: {deltaY: weDelta, deltaX: 0}});
                                if (!isChrome) {
                                    $container.trigger(we);
                                } else {
                                    $container.trigger(mwe);
                                }
                            } else {
                                //$container.scrollTop($container.scrollTop() + delta);
                            }
                            setTimeout(nextScroll, 1);

                        } else {
                            currentScrollIndex = -1;
                            doneScrolling();
                        }
                    }

                    function doneScrolling() {
                        setTimeout(runNextTest, 500);
                    }

                    function runNextTest() {
                        var index = $scope.tests.indexOf($scope.currentTest);
                        if (index + 1 < $scope.tests.length) {
                            var nextTest = $scope.tests[index + 1];
                            $scope.buildTest(nextTest);
                            var phase = $scope.$$phase;
                            if (!(phase === '$apply' || phase === '$digest')) {
                                $scope.$digest();
                            }
                            nextScroll();

                        }
                    }

                    $scope.automateAllTests = function () {
                        runNextTest();
                    };
                }
            };
        })
;