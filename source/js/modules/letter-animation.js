class LetterAnimation {
  constructor({element, duration, activationClass, wordClass, letterClass, transitionProperty}) {
    this._TIME_SPACE = 100;

    this._element = element;
    this._duration = duration;
    this._activationClass = activationClass;
    this._wordClass = wordClass;
    this._letterClass = letterClass;
    this._transitionProperty = transitionProperty;

    this.prepareText();
  }

  createLetter(letter) {
    const span = document.createElement(`span`);
    span.textContent = letter;

    const timeOffset = Math.random() * this._duration;
    span.style.transition = `${this._transitionProperty} ${this._duration}ms ease ${timeOffset}ms`;
    return span;
  }

  prepareText() {
    if (!this._element) {
      return;
    }

    const text = this._element.textContent.trim().split(` `).filter((letter) => letter !== ``);

    const content = text.reduce((fragmentParent, word, index) => {
      const wordElement = Array.from(word).reduce((fragment, letter) => {
        const letterElement = this.createLetter(letter);
        letterElement.classList.add(this._letterClass);

        fragment.appendChild(letterElement);
        return fragment;
      }, document.createDocumentFragment());

      const wordContainer = document.createElement(`span`);
      wordContainer.classList.add(this._wordClass);
      wordContainer.appendChild(wordElement);

      if (index !== text.length - 1) {
        wordContainer.appendChild(document.createTextNode(` `));
      }

      fragmentParent.appendChild(wordContainer);
      return fragmentParent;
    }, document.createDocumentFragment());

    this._element.innerHTML = ``;
    this._element.appendChild(content);
  }

  runAnimation() {
    if (!this._element) {
      return;
    }

    this._element.classList.add(this._activationClass);
  }

  destroyAnimation() {
    this._element.classList.remove(this._activationClass);
  }
}

export default LetterAnimation;
