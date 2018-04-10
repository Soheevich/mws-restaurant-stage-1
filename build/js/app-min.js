/* eslint-env browser */

// My first attempt with MVC pattern
(function autorun() {
  /* =================
  MODEL
  ================== */
  const model = (function modelAutorun() {
    const deck = [];
    let cardNames;
    let randomCards = [];
    let score = 0;
    let openedPairs = 0;
    let numberOfPairs;

    return {
      // Creating an array of objects, every object contains:
      // cardName -> an id of the card (Ace-Hearts)
      // title -> full name of the card (Ace of Hearts) for alt attribute
      // src -> source of the image for this card
      init(totalPairs) {
        numberOfPairs = totalPairs;
        cardNames = this.createCardNamesArray();
        cardNames.forEach((cardName) => {
          const title = cardName.split('-').join(' of ');
          const src = this.createCardFilenames(cardName);
          const temporaryCard = this.createCard(cardName, title, src);

          deck.push(temporaryCard);
        });
      },

      reset() {
        randomCards = [];
        score = 0;
        openedPairs = 0;
      },

      getRandomCards() {
        return randomCards;
      },

      getScore() {
        return score;
      },

      createCard(dataId, alt, src) {
        return { dataId, alt, src };
      },

      // Card array could be created manually though
      createCardNamesArray() {
        return (function idArray() {
          const array = [];
          const suites = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
          suites.forEach((suite) => {
            for (let i = 1; i < 14; i += 1) {
              switch (i) {
                case 1:
                  array.push(`Ace-${suite}`);
                  break;
                case 11:
                  array.push(`Jack-${suite}`);
                  break;
                case 12:
                  array.push(`Queen-${suite}`);
                  break;
                case 13:
                  array.push(`King-${suite}`);
                  break;
                default:
                  array.push(`${i}-${suite}`);
                  break;
              }
            }
          });

          return array;
        }());
      },

      createCardFilenames(inputName) {
        const outputFilename = `images/${inputName}.svg`;
        return outputFilename;
      },

      makeRandomNumber(max) {
        return Math.floor(Math.random() * (max));
      },

      // This method takes needed number of pairs and then creates an array of random card indexes
      // Then it shuffles this array
      makeRandomPairs(number) {
        const totalPairs = number * 2;
        const tempArray = [];

        while (tempArray.length < totalPairs) {
          const tempRandomCardIndex = this.makeRandomNumber(52);

          if (!tempArray.includes(tempRandomCardIndex)) {
            tempArray.push(tempRandomCardIndex, tempRandomCardIndex);
          }
        }

        for (let i = tempArray.length - 1; i > 0; i -= 1) {
          const j = this.makeRandomNumber(i + 1);
          const temp = tempArray[i];
          tempArray[i] = tempArray[j];
          tempArray[j] = temp;
        }

        tempArray.forEach((cardIndex) => {
          randomCards.push(deck[cardIndex]);
        });
      },

      countingScore(action) {
        if (action === 'plus') {
          openedPairs += 1;
          score += (numberOfPairs - openedPairs) * 42;

          if (openedPairs === numberOfPairs) {
            controller.win();
          }
        } else if (action === 'minus') {
          score -= openedPairs * 42;
        }
      },
    };
  }());


  /* =================
  VIEW
  ================== */
  const view = (function viewAutorun() {
    const mainBoard = document.querySelector('.main__board');
    const audio = document.querySelector('audio');
    let scoreSpan;

    return {
      // Building the starting screen
      init() {
        const img = this.createElement('img', {
          className: 'main__start-image',
          src: 'images/StartGame.png',
        });
        const title = this.createElement(
          'h1',
          { className: 'main__title' },
          'memory game',
        );
        const button = this.createElement(
          'button',
          { className: 'main__new-game', dataTid: 'NewGame-startGame' },
          'Начать игру',
        );
        const article = this.createElement('article', { className: 'main__start-screen', dataTid: 'App' }, img, title, button);

        button.addEventListener('click', controller.newGame);

        mainBoard.appendChild(article);
      },

      reset() {
        const mainCards = document.querySelector('.main__cards');

        mainCards.remove();
      },

      // Removing the previous screen and building the final screen
      win(score) {
        const mainControls = document.querySelector('.main__controls');
        const mainCards = document.querySelector('.main__cards');

        mainControls.remove();
        mainCards.remove();

        const img = this.createElement('img', {
          className: 'main__win-image',
          src: 'images/Group 2.png',
        });
        const title = this.createElement(
          'p',
          { className: 'main__win-title' },
          'Поздравляем!',
        );
        const titleSecond = this.createElement(
          'p',
          { className: 'main__win-title' },
          `Ваш итоговый счет: ${score}`,
        );
        const button = this.createElement(
          'button',
          { className: 'main__win-new-game', dataTid: 'EndGame-retryGame' },
          'Ещё раз',
        );
        const article = this.createElement(
          'article',
          { className: 'main__win-screen' },
          img,
          title,
          titleSecond,
          button,
        );

        button.addEventListener('click', controller.newGame);

        mainBoard.appendChild(article);
      },

      // Method to create any html element and append children to it
      createElement(tag, attrs, ...children) {
        const element = document.createElement(tag);

        // Adding attributes to the element
        Object.keys(attrs).forEach((key) => {
          if (key === 'dataId') {
            element.dataset.id = attrs[key];
          } else if (key === 'dataTid') {
            element.dataset.tid = attrs[key];
          } else {
            element[key] = attrs[key];
          }
        });

        // Appending children
        children.forEach((child) => {
          let tempChild = child;
          if (typeof tempChild === 'string') {
            tempChild = document.createTextNode(child);
          }
          element.appendChild(tempChild);
        });

        return element;
      },

      // This method launches every new game
      // If this is the first launch (or launch after a won game) - it removes the previous screen
      // If this is restarting the second screen, it removes only cards and make a new ones
      // Also I didn't find a normal card's back image so I had to draw it by myself
      newGame(cardsArray, startTime) {
        const startScreen = document.querySelector('.main__start-screen');
        const winScreen = document.querySelector('.main__win-screen');
        const fragment = document.createDocumentFragment();

        if (!document.querySelector('.main__controls')) {
          const resetGameButton = this.createElement(
            'span',
            { className: 'controls__new-game', dataTid: 'Menu-newGame' },
            'Начать заново',
          );
          const scoreTitle = this.createElement(
            'span',
            { className: 'controls__title' },
            'Очки: ',
          );
          const score = this.createElement(
            'span',
            { className: 'controls__score', dataTid: 'Menu-scores' },
          );
          const scoreWrapper = this.createElement(
            'div',
            { className: 'controls__wrapper' },
            scoreTitle,
            score,
          );
          const controls = this.createElement(
            'section',
            { className: 'main__controls' },
            resetGameButton,
            scoreWrapper,
          );

          resetGameButton.addEventListener('click', controller.resetGame);
          fragment.appendChild(controls);
        }

        if (startScreen) startScreen.remove();
        if (winScreen) winScreen.remove();

        const mainCardsGrid = this.createElement(
          'div',
          { className: 'main__cards-grid', dataTid: 'Deck' },
        );
        cardsArray.forEach((card) => {
          const tempCard = this.addCard(card.dataId, card.alt, card.src);

          mainCardsGrid.appendChild(tempCard);
        });
        const mainCards = this.createElement(
          'section',
          { className: 'main__cards' },
          mainCardsGrid,
        );

        fragment.appendChild(mainCards);
        mainBoard.appendChild(fragment);
        scoreSpan = document.querySelector('.controls__score');

        // Show all cards at the start of every new game
        // Add click event listeners to every card
        document.querySelectorAll('.main__card').forEach((card) => {
          card.addEventListener('click', controller.onCardClick);

          setTimeout(() => {
            card.classList.add('card__flipped');
            setTimeout(() => {
              card.classList.remove('card__flipped');
            }, startTime);
          }, 100);
        });

        // Play audio on opening all of the cards
        this.cardFlipAudio();
        setTimeout(() => {
          this.cardFlipAudio();
        }, startTime);
      },

      addCard(dataId, alt, src) {
        const cardBackIcon = this.createElement(
          'img',
          {
            src: 'images/card_back.svg',
            alt: 'Back of the card',
          },
        );
        const cardBack = this.createElement(
          'div',
          { className: 'card__back', dataTid: 'Card-flipped' },
          cardBackIcon,
        );
        const cardFrontIcon = this.createElement(
          'img',
          {
            className: 'card__icon',
            dataId,
            src,
            alt,
          },
        );
        const cardFront = this.createElement(
          'div',
          { className: 'card__front' },
          cardFrontIcon,
        );
        const mainCard = this.createElement(
          'div',
          { className: 'main__card', dataTid: 'Card' },
          cardBack,
          cardFront,
        );
        const mainCardWrapper = this.createElement(
          'div',
          { className: 'main__card-wrapper' },
          mainCard,
        );

        return mainCardWrapper;
      },

      // Audio
      cardFlipAudio() {
        audio.currentTime = 0;
        audio.play();
      },

      // Open clicked card
      openCard(event) {
        event.target.classList.add('card__flipped');
        this.cardFlipAudio();
      },

      noEventsOnCard(card) {
        card.classList.add('card__no-events');
      },

      // Fade out selected pair
      fadeOutPair(cardOne, cardTwo) {
        cardOne.parentNode.classList.add('fade-out');
        cardTwo.parentNode.classList.add('fade-out');
      },

      // Shake animation
      addShake(cardOne, cardTwo) {
        cardOne.classList.add('shake');
        cardTwo.classList.add('shake');
      },

      removeShake(cardOne, cardTwo) {
        cardOne.classList.remove('shake');
        cardTwo.classList.remove('shake');
      },

      // Close wrong pair
      closeBothCards(cardOne, cardTwo) {
        cardOne.classList.remove('card__flipped', 'card__no-events');
        cardTwo.classList.remove('card__flipped');
        this.cardFlipAudio();
      },

      // Print total score
      printScore(number) {
        scoreSpan.textContent = number;
      },
    };
  }());


  /* =================
  CONTROLLER
  ================== */
  const controller = (function controllerAutorun() {
    // ============
    // Total number of shown pairs of cards can be changed
    // Remember to change main.scss => .main__board => grid size
    // ============
    const numberOfPairs = 9;
    const startTime = 5000; // time to show cards at the start of the game
    const animationTime = 500;
    let activeCard = null;
    let activeCardId = null;
    let canClick = true; // to prevent clicking on another cards while animation

    return {
      init() {
        model.init(numberOfPairs);
        view.init(animationTime);
      },

      // Creates a new game
      // Disables clicking on cards while they are open at the start of every game
      newGame() {
        canClick = false;
        model.reset();
        model.makeRandomPairs(numberOfPairs);
        view.newGame(model.getRandomCards(), startTime);
        view.printScore(model.getScore());

        setTimeout(() => {
          canClick = true;
        }, startTime + (animationTime * 1.5));
      },

      resetGame() {
        model.reset();
        view.reset();
        view.printScore(model.getScore());
        model.makeRandomPairs(numberOfPairs);
        view.newGame(model.getRandomCards(), startTime);

        activeCard = null;
        activeCardId = null;
        canClick = true;
      },

      onCardClick(event) {
        const clickedCard = event.target;
        const clickedCardId = clickedCard.querySelector('.card__icon').dataset.id;

        if (activeCard && canClick) {
          view.openCard(event);

          // Found a pair
          if (activeCardId === clickedCardId) {
            canClick = false;
            model.countingScore('plus');

            setTimeout(() => {
              view.fadeOutPair(activeCard, clickedCard);
              activeCard = null;

              setTimeout(() => {
                canClick = true;
              }, animationTime - 200);
            }, animationTime);

          // Wrong pair, remove selection from the both cards
          } else {
            canClick = false;
            model.countingScore('minus');

            // Timeouts to give some time to animations to play
            // Some animations interacts with each other, so I had to divide them
            setTimeout(() => {
              view.addShake(activeCard, clickedCard);
              setTimeout(() => {
                view.removeShake(activeCard, clickedCard);

                setTimeout(() => {
                  view.closeBothCards(activeCard, clickedCard);
                  activeCard = null;

                  setTimeout(() => {
                    canClick = true;
                  }, animationTime - 200);
                }, 100);
              }, animationTime + 200);
            }, animationTime);
          }

        // Mark a card as selected one
        } else if (canClick) {
          view.openCard(event);
          activeCard = clickedCard;
          view.noEventsOnCard(activeCard);
          activeCardId = activeCard.querySelector('.card__icon').dataset.id;
          canClick = false;

          setTimeout(() => {
            canClick = true;
          }, animationTime - 300);
        }

        view.printScore(model.getScore());
      },

      win() {
        setTimeout(() => {
          view.win(model.getScore());
        }, (animationTime * 2.5));
      },
    };
  }());

  // Initializes the whole program
  controller.init();
}());


// Sounds author is www.kenney.nl
