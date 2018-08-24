(function() {
  "use strict";

  var app = angular.module("App", []);
  app.controller("bowling", function($scope) {
    let vm = this;
    $scope.frames = [];

    vm.numOfBowl = 1; // each frame has max numb of bowls 2 .. except frame #9 - (3)
    $scope.currentFrame = 0; // set default frame #1
    vm.numberOfPins = 11; // there are only 10 pins.  put extra 1 for ramdom...
    $scope.isGameOver = false;
    $scope.pinKnockDown = 0;
    vm.totalScores = 0;

    vm.setFrames = () => {
      $scope.frames = [];
      $scope.finalScore = 0;
      $scope.currentFrame = 0;
      vm.numOfBowl = 1;
      vm.totalScores = 0;
      $scope.pinKnockDown = 0;
      $scope.isGameOver = false;
      for (let i = 0; i < 11; i++) {
        let tempFrame;
        if (i < 10) {
          tempFrame = {
            id: i,
            ball1: null,
            ball2: null,
            scores: null,
            isStrike: false,
            isSpare: false,
          };
          if (i === 9) {
            tempFrame.ball3 = null;
          }
        } else {
          tempFrame = {
            id: "Total:",
            ball1: null,
            ball2: null,
            totalScores: null,
            isStrike: false,
            isSpare: false,
          };
        }

        $scope.frames.push(tempFrame);
      }
    };

    // return ramdom numbers
    vm.ramdomBowlingPin = max => {
      return Math.floor(Math.random() * Math.floor(max));
    };

    // Start a new Game
    vm.newGame = () => {
      vm.setFrames();
    };

    // Click bowling button
    vm.bowl = () => {
      $scope.pinKnockDown = vm.ramdomBowlingPin(vm.numberOfPins);

      // set scores for each frame
      if (vm.numOfBowl === 1) {
        $scope.frames[$scope.currentFrame].ball1 = $scope.pinKnockDown;

        if ($scope.pinKnockDown > 9) {
          // strike...
          $scope.frames[$scope.currentFrame].isStrike = true;
          if ($scope.currentFrame !== 9) {
            vm.numOfBowl = 3;
          } else {
          }
        } else {
          vm.numberOfPins -= $scope.pinKnockDown;
        }
      } else if (vm.numOfBowl === 2) {
        let tempBall1 = $scope.frames[$scope.currentFrame].ball1;
        $scope.frames[$scope.currentFrame].ball2 = $scope.pinKnockDown;
        if (tempBall1 + $scope.pinKnockDown === 10) {
          $scope.frames[$scope.currentFrame].isSpare = true;
        }
        vm.numberOfPins -= $scope.pinKnockDown;
      } else {
        $scope.frames[$scope.currentFrame].ball3 = $scope.pinKnockDown;
      }

      vm.calculateScores($scope.currentFrame, vm.numOfBowl, callback => {
        vm.numOfBowl += 1;
        vm.checkNumberOfBowl();
        if ($scope.currentFrame > 9) {
          // disable bowl button.
          $scope.isGameOver = true;
          console.log("game over....");
        }
      });
    };

    vm.checkNumberOfBowl = () => {
      if (vm.numOfBowl > 2) {
        if ($scope.currentFrame === 9) {
          let tempData = $scope.frames[$scope.currentFrame];

          if (tempData.ball1 > 9) {
            vm.numberOfPins = 11;
            if (tempData.ball2 < 9) {
              vm.numberOfPins -= tempData.ball2;
            }
            if (tempData.ball3 !== null) {
              vm.resetNewFrame();
            }
          } else {
            if (tempData.ball1 + tempData.ball2 > 9) {
              vm.numberOfPins = 11;
              if (tempData.ball3 !== null) {
                vm.resetNewFrame();
              }
            } else {
              vm.resetNewFrame();
            }
          }
        } else {
          vm.resetNewFrame();
        }
      }
    };

    vm.resetNewFrame = () => {
      $scope.currentFrame++;
      vm.numOfBowl = 1;
      vm.numberOfPins = 11;
    };

    vm.calculateScores = (currentFrame, numBall, callback) => {
      let preFrame1;
      let preFrame2;
      let scores = 0;
      let currentDataFrame = $scope.frames[currentFrame];

      // if the current frame is 1 then don't need to check isSpare or isStrike
      if (currentFrame > 0) {
        preFrame1 = $scope.frames[currentFrame - 1];

        if (vm.checkStrike(currentDataFrame)) {
          // Strike  (strike strike strike)
          if (vm.checkStrike(preFrame1)) {
            if (currentFrame > 1) {
              preFrame2 = $scope.frames[currentFrame - 2];
              if (vm.checkStrike(preFrame2)) {
                scores =
                  currentDataFrame.ball1 + preFrame1.ball1 + preFrame2.ball1;
                vm.setScores(preFrame2, scores);
              }
            }
          } else if (vm.checkSpare(preFrame1)) {
            scores = currentDataFrame.ball1 + preFrame1.ball1 + preFrame1.ball2;
            vm.setScores(preFrame1, scores);
          }
        } else if (vm.checkSpare(currentDataFrame)) {
          if (vm.checkStrike(preFrame1)) {
            if (currentFrame > 1) {
              preFrame2 = $scope.frames[currentFrame - 2];
              if (vm.checkStrike(preFrame2)) {
                scores =
                  currentDataFrame.ball1 +
                  currentDataFrame.ball2 +
                  preFrame1.ball1 +
                  preFrame2.ball1;
                vm.setScores(preFrame2, scores);
              }
            }
            scores =
              currentDataFrame.ball1 + currentDataFrame.ball2 + preFrame1.ball1;
            vm.setScores(preFrame1, scores);
          }
        } else {
          // just knock out pin
          if (numBall === 1) {
            if (vm.checkSpare(preFrame1)) {
              scores =
                preFrame1.ball1 + preFrame1.ball2 + currentDataFrame.ball1;
              vm.setScores(preFrame1, scores);
            }
          } else if (numBall === 2) {
            if (vm.checkStrike(preFrame1)) {
              if (currentFrame > 1) {
                preFrame2 = $scope.frames[currentFrame - 2];
                if (vm.checkStrike(preFrame2)) {
                  scores =
                    preFrame1.ball1 +
                    preFrame2.ball1 +
                    currentDataFrame.ball1 +
                    currentDataFrame.ball2;
                  vm.setScores(preFrame2, scores);
                }
              }
              scores =
                currentDataFrame.ball1 +
                currentDataFrame.ball2 +
                preFrame1.ball1 +
                preFrame1.ball2;
              vm.setScores(preFrame1, scores);
            }
            scores = currentDataFrame.ball1 + currentDataFrame.ball2;
            vm.setScores(currentDataFrame, scores);
          } else if (numBall === 3) {
            scores =
              currentDataFrame.ball1 +
              currentDataFrame.ball2 +
              currentDataFrame.ball3;
            vm.setScores(currentDataFrame, scores);
          }
        }

        if (currentFrame === 9) {
          scores =
            currentDataFrame.ball1 +
            currentDataFrame.ball2 +
            currentDataFrame.ball3;
          vm.setScores(currentDataFrame, scores);
        }
      } else {
        if (!currentDataFrame.isSpare || !currentDataFrame.isStrike) {
          if (currentDataFrame.ball2 !== null) {
            scores = currentDataFrame.ball1 + currentDataFrame.ball2;
            vm.setScores(currentDataFrame, scores);
          }
        }
      }
      callback();
    };

    vm.checkStrike = frame => {
      return frame.ball1 > 9;
    };
    vm.checkSpare = frame => {
      return frame.ball1 + frame.ball2 > 9;
    };

    vm.setScores = (frame, score) => {
      frame.scores = score;
      vm.totalScores += score;
      $scope.frames[10].scores = vm.totalScores;
    };

    vm.newGame();
  });
})(); // end function
