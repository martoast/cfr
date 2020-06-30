class CFR {
  constructor() {
    this.best = [1, 2, 0];
    this.actions = 3;
  }

  normalize(strategy) {
    let normalizingSum = strategy.reduce((t, v) => t + v);
    if (normalizingSum > 0) {
      strategy = strategy.map(action => {
        return action / normalizingSum;
      });
    } else {
      strategy = new Array(strategy.length);
      strategy.fill(1 / strategy.length);
    }
    return strategy;
  }

  getStrategy(regretSum) {
    let strategy = regretSum.map(val => (val < 0 ? 0 : val));
    return this.normalize(strategy);
  }

  getAction(strat) {
    let r = Math.random();
    let cumulativeProbability = 0;
    for (var i = 0; i < this.actions; i++) {
      cumulativeProbability += strat[i];
      if (r < cumulativeProbability) {
        break;
      }
    }
    return i;
  }

  innerTrain(regretSum, stratSum, oppStrategy) {
    let strategy = this.getStrategy(regretSum);
    strategy.forEach((val, index, arr) => {
      stratSum[index] += val;
    });
    let myAction = this.getAction(strategy);
    let otherAction = this.getAction(oppStrategy);
    let actionUtil = new Array(this.actions);
    actionUtil[otherAction] = 0;
    actionUtil[this.best[otherAction]] = 1;
    actionUtil[actionUtil.findIndex(e => e === undefined)] = -1;
    actionUtil.forEach((val, index, arr) => {
      regretSum[index] += val - arr[myAction];
    });
    return [regretSum, stratSum];
  }

  train(oppStrategy, iterations) {
    let stratSum = Array.from({ length: this.actions }, () => 0);

    let regretSum = Array.from({ length: this.actions }, () => 0);
    for (let i = 0; i < iterations; i++) {
      [regretSum, stratSum] = this.innerTrain(regretSum, stratSum, oppStrategy);
    }
    return this.normalize(stratSum);
  }

  train2p(oiterations, iterations) {
    let stratSump1 = Array.from({ length: this.actions }, () => 0);
    let stratSump2 = Array.from({ length: this.actions }, () => 0);

    for (var j = 0; j < oiterations; j++) {
      let regretSump1 = Array.from({ length: this.actions }, () => 0);
      let regretSump2 = Array.from({ length: this.actions }, () => 0);

      for (var k = 0; k < iterations; k++) {
        [regretSump1, stratSump1] = this.innerTrain(
          regretSump1,
          stratSump1,
          this.normalize(stratSump2)
        );
      }

      for (var i = 0; i < iterations; i++) {
        [regretSump2, stratSump2] = this.innerTrain(
          regretSump2,
          stratSump2,
          this.normalize(stratSump1)
        );
      }
      console.log(this.normalize(stratSump1), this.normalize(stratSump2));
    }

    return [this.normalize(stratSump1), this.normalize(stratSump2)];
  }
}

const cfr = new CFR();
//console.log("Strategy found", cfr.train([0.8, 0.1, 0.1], 1000))
console.log("Strategy found", cfr.train2p(10000, 10000));
