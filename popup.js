async function getActiveData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("button", (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items.button);
    });
  });
}

window.onload = async function () {
  var active = await getActiveData();

  if (active === false) {
    icon.classList.remove("fa-stop-circle");
    icon.classList.add("fa-play-circle");
  } else {
    icon.classList.remove("fa-play-circle");
    icon.classList.add("fa-stop-circle");
  }
};

async function start() {
  await chrome.storage.sync.set({ button: true });

  var active = await getActiveData();
  let icon = document.getElementById("icon");

  icon.classList.remove("fa-stop-circle");
  icon.classList.add("fa-play-circle");

  if (active) {
    icon.classList.remove("fa-play-circle");
    icon.classList.add("fa-stop-circle");
    await chrome.storage.sync.set({ button: false });

    chrome.tabs.query({ active: true }, async function (tabs) {
      let tab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          function: init,
        },
        async (results) => {
          const message = new Promise((resolve) => {
            const listener = (request) => {
              chrome.runtime.onMessage.removeListener(listener);
              resolve(request);
            };
            chrome.runtime.onMessage.addListener(listener);
          });

          const result = await message;

          icon.classList.remove("fa-stop-circle");
          icon.classList.add("fa-play-circle");
          await chrome.storage.sync.set({ button: false });
        }
      );
    });
  }
}

async function init() {
  const url = window.location.href.split("/");

  if (url[2] === "app.zodiacs.me") {
    const content = document.getElementsByClassName("ant-card-body");

    const carslenght =
      content[0].children[1].children[1].children[0].children.length;

    // Transforma a quantidade de carros em array
    const cars = Array.from(Array(carslenght).keys());

    /**
     * Executa um loop de acordo com a quantidade de carros existentes
     */
    await cars.reduce(async (previousPromise, index) => {
      await previousPromise;

      const currentCar =
        content[0].children[1].children[1].children[0].children[index];

      //Seleciona o carro
      currentCar.click();

      const textRacing =
        content[0].children[0].children[0].children[4].textContent.split(" ");

      const currentRacing = textRacing[1].split("/")[0];

      if (currentRacing < 12) {
        // Transforma a quantidade restante de corridas em array
        const racesLeft = Array.from(Array(12 - currentRacing).keys());

        /**
         * Executa um lop de acordo com a quantidade de corridas existente para o carro selecionado
         */
        await racesLeft.reduce(async (previousPromiseRace, indexRace) => {
          await previousPromiseRace;

          //Clica no botão Start Race
          document.getElementsByClassName("btn-green")[0].click();

          /**
           * Aguarda o tempo de execução da corrida e clica no botão para obter a recompensa
           */
          await new Promise(function (resolve) {
            let buttonClaim = document.createElement("div");
            buttonClaim = document.getElementsByClassName("btn-yellow");

            const clickClaimTimer = setInterval(async () => {
              if (buttonClaim.length > 0) {
                buttonClaim[0].click();

                clearInterval(clickClaimTimer);

                /**
                 * Aguarda o tempo para exibir o modal de recompensa e clica no botão para receber a recompensa
                 */
                await new Promise(function () {
                  let receiverClaim = document.createElement("div");
                  receiverClaim =
                    document.getElementsByClassName("ant-btn-success");

                  const receiverClaimTimer = setInterval(async () => {
                    if (receiverClaim.length > 0) {
                      // Clica no botão para receber a recompensa
                      receiverClaim[0].click();
                      clearInterval(receiverClaimTimer);

                      if (indexRace < 12) {
                        /**
                         * Aguarda para fechar o modal de recompensa e seleciona novamente o mesmo carro
                         */
                        await new Promise(function () {
                          setTimeout(() => {
                            const currentCar =
                              content[0].children[1].children[1].children[0]
                                .children[index];
                            currentCar.click();
                            resolve();
                          }, 1000);
                        });
                      }
                    }
                  }, 2000);
                });
              }
            }, 1000);
          });
        }, Promise.resolve());
      }
    }, Promise.resolve());

    alert("Completado com sucesso!");
    chrome.runtime.sendMessage(true);
  } else {
    alert("Por favor, abra a aba com o zodiacs!");
    chrome.runtime.sendMessage(true);
  }
}

document.getElementById("icon").addEventListener("click", start);
