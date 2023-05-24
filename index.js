let click = 0;
let pairs = 0;
let matchedPairs = 0;
let timerInterval = null;
let time = 0;
let firstCard;
let secondCard;
let difficultyPairs = 3;

$(document).ready(function () {
  $("#novice, #intermediate, #advanced").on("click", function () {
    difficultyPairs = $(this).data("pairs");
    $("#grid").removeClass().addClass($(this).attr("id"));
  });

  $("#start").on("click", function () {
    $(this).hide();
    $("#difficulty").hide();

    fetch('https://pokeapi.co/api/v2/pokemon?limit=150')
      .then(response => response.json())
      .then(data => {
        let allPokemon = data.results;
        let randomPokemon = [];

        for (let i = 0; i < difficultyPairs; i++) {
          let randomIndex = Math.floor(Math.random() * allPokemon.length);
          randomPokemon.push(allPokemon[randomIndex]);
        }

        Promise.all(
          randomPokemon.map((pokemon, index) =>
            fetch(pokemon.url)
              .then(response => response.json())
              .then(pokemonData => {
                for (let i = 0; i < 2; i++) {
                  let card = `
                    <div class="card">
                      <img id="img${index * 2 + i + 1}" class="front_face" src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
                      <img class="back_face" src="back.webp" alt="">
                    </div>
                  `;
                  $("#grid").append(card);
                }
              })
          )
        ).then(() => {
          shuffleCards();

          pairs = $(".card").length / 2;
          $("#remainingpairs").text(`Remaining Pairs: ${pairs}`);

          $("#game").show();
          setup();
          startTimer();
        });
      });
  });

  const startTimer = () => {
    timerInterval = setInterval(() => {
      time++;
      $("#time").text("Time Elapsed: " + time);
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    time = 0;
    $("#timer").text(time);
  };

  const shuffleCards = () => {
    let cards = $("#grid").children();
    cards.sort(() => Math.random() - 0.5);
    $("#grid").empty().append(cards);
  };

  const setup = () => {
    firstCard = undefined;
    secondCard = undefined;

    $(".card:not(.matched)").on("click", function () {
      if (!$(this).hasClass("flip")) {
        click++;
        $("#click").text(`Total Clicks: ${click}`);
      }

      if (firstCard && firstCard.id === $(this).find(".front_face")[0].id) {
        return;
      }

      $(this).toggleClass("flip");

      if (!firstCard) {
        firstCard = $(this).find(".front_face")[0];
      } else {
        secondCard = $(this).find(".front_face")[0];

        $(".card").off("click");

        setTimeout(() => {
          if (firstCard.src == secondCard.src) {
            matchedPairs++;
            $("#pairs").text(`Matched Pairs: ${matchedPairs}`);
            $("#remainingpairs").text(`Remaining Pairs: ${pairs - matchedPairs}`);
            $(`#${firstCard.id}, #${secondCard.id}`).parent().addClass("matched");
            if ($(".card.matched").length === $(".card").length) {
              alert("You're a champion!");
              resetGame();
            }
          } else {
            $(`#${firstCard.id}, #${secondCard.id}`).parent().toggleClass("flip");
          }
          firstCard = undefined;
          secondCard = undefined;
          setup();
        }, 800);
      }
    });

    function resetGame() {
      $(".card").off("click").removeClass("flip matched");
      firstCard = undefined;
      secondCard = undefined;
      matchedPairs = 0;
      click = 0;
      pairs = 0;
      $("#click").text(`Total Clicks: ${click}`);
      $("#pairs").text(`Matched Pairs: ${matchedPairs}`);
      $("#remainingpairs").text(`Remaining Pairs: ${pairs - matchedPairs}`);
      $("#grid").empty();
      $("#game").hide();
      $("#start").show();
      $("#difficulty").show();
      resetTimer();
    }
    
    $("#reset").on("click", resetGame);
  };
    

  function setLightMode() {
    $(".back_face").removeClass("black").addClass("white");
  }
  
  function setDarkMode() {
    $(".back_face").removeClass("white").addClass("black");
  }
  
  function applyPowerUp() {
    $(".card:not(.flip)").addClass("temp-flip flip");
    setTimeout(() => {
      $(".card.temp-flip").removeClass("temp-flip flip");
    }, 1500);
  }
  
  $("#lightmode").on("click", setLightMode);
  $("#darkmode").on("click", setDarkMode);
  $("#powerup").on("click", applyPowerUp);

  $(document).ready(setup);
});
