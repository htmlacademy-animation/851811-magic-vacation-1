class PrizeAmountCountdown {
  constructor({element, amount, firstAmount = 1}) {
    this.animationDuration = 1000; // 1 секунда
    this.timePerFrame = 1000 / 12; // 12 кадров в секунду
    this.element = element;

    this.amount = amount;
    this.increment = this.amount / (this.animationDuration / this.timePerFrame);
    this.firstAmount = firstAmount;
    this.previousAmount = this.firstAmount;
    this.count = 0;

    this.startTime = null;
    this.lastFrameUpdateTime = null;
    this.timePassedSinceLastUpdate = null;

    this.animationRequest = null;

    this.draw = this.draw.bind(this);
  }

  startCountdown() {
    this.animationRequest = requestAnimationFrame(this.draw);
  }

  endCountdown() {
    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
      this.previousAmount = this.firstAmount;
      this.count = 0;
      this.startTime = null;
      this.lastFrameUpdateTime = null;
      this.timePassedSinceLastUpdate = null;
      this.updateValues(this.amount);
    }
  }

  draw(currentTime) {
    if (!this.lastFrameUpdateTime) {
      this.lastFrameUpdateTime = currentTime;
    }
    if (!this.startTime) {
      this.startTime = currentTime;
    }

    this.timePassedSinceLastUpdate = currentTime - this.lastFrameUpdateTime;

    if (currentTime - this.startTime >= this.animationDuration) {
      this.endCountdown();
      return;
    }

    if (this.timePassedSinceLastUpdate > this.timePerFrame) {
      this.lastFrameUpdateTime = currentTime;

      const currentAmount = this.getAmount();
      if (currentAmount <= this.amount) {
        this.updateValues(currentAmount);
        this.previousAmount = currentAmount;
        this.count++;
      }
    }

    if (this.animationRequest) {
      requestAnimationFrame(this.draw);
    }
  }

  getAmount() {
    return this.count === 0 ? this.firstAmount : Math.ceil(this.previousAmount + this.increment);
  }

  updateValues(amount) {
    this.element.innerHTML = amount;
  }
}

export default PrizeAmountCountdown;
