/*
.dynamic-form-field.dynamic-form-field--field_26 {
    display: none;
}
*/

var observerConfig = {
  attributes: false,
  childList: true,
  characterData: false
};

const PARCEL_LOCKER_INPUT_ID = "field_26Input";

function onShippingLoad(callback) {
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOMContentLoaded");

    var mainNode = document.querySelector("#appBody");

    var mainObserver = new MutationObserver(function(mutations) {
      //observe ensure this callback was called just once,
      //no matter how many mutations to mainNode were made
      //otherwide we'd attach shippingObserver multiple times
      mainObserver.disconnect();
      console.log("Mutated: #appBody");
      var shippingNode = document.querySelector("[checkout-step=shipping]");
      var shippingObserver = new MutationObserver(function(mutations) {
        console.log("Mutated: [checkout-step=shipping]");
        if (
          mutations[0].removedNodes.length > 0 && //that marks end of animation
          document.getElementById("checkout-shipping-options")
        ) {
          callback();
        }
      });
      shippingObserver.observe(shippingNode, observerConfig);
    });
    mainObserver.observe(mainNode, observerConfig);
  });
}

function onShippingOptionsLoad(callback) {
  function handleShippingOptions() {
    tryFire();

    let list = shippingOptions.querySelector("shipping-options-list ul");
    if (list) {
      let listObserver = new MutationObserver(function(mutations) {
        tryFire();
      });
      listObserver.observe(list, observerConfig);
    }
  }

  function tryFire() {
    if (document.querySelector(".shippingOption-desc")) {
      callback();
    }
  }

  const shippingOptions = document.querySelector("shipping-options");

  if (shippingOptions.querySelector("shipping-options-list ul")) {
    handleShippingOptions();
  }

  let observer = new MutationObserver(function(mutations) {
    handleShippingOptions();
  });
  observer.observe(shippingOptions, observerConfig);
}

function initializeUI() {
  var form = document.getElementById("inPostForm");
  if (!form) {
    document
      .getElementById("checkout-shipping-options")
      .insertAdjacentHTML(
        "afterend",
        '<fieldset id="inPostForm" class="form-fieldset" style="display:none"> \
          <legend class="form-legend optimizedCheckout-headingSecondary"> \
            Paczkomat \
          </legend> \
          <div class="form-body form-field--error"> \
            <a id="choosePaczkomatLink" href="javascript:void(0)">\
              Wybierz paczkomat\
            </a> \
            <span id="paczkomatRequiredWarning" style="display:none" class="form-inlineMessage">\
              Paczkomat jest wymagany. \
            </span>\
          </div> \
        </fieldset>'
      );
  }
}

function toggleRequiredWarning(paczkomatInput) {
  document.getElementById(
    "paczkomatRequiredWarning"
  ).style.cssText = !paczkomatInput.value ? "" : "display:none";
}

function updateLinkText(paczkomatInput) {
  var linkContent = paczkomatInput.value
    ? paczkomatInput.value
    : "Wybierz paczkomat";
  var link = document.getElementById("choosePaczkomatLink");
  link.innerText = linkContent;
}

function inPostRadio() {
  let paczkomatOptionDiv = Array.prototype.find.call(
    document.querySelectorAll(".shippingOption-desc"),
    function(el) {
      return (
        el.textContent.includes("Paczkomat") ||
        el.textContent.includes("Parcel locker")
      );
    }
  );
  if (!paczkomatOptionDiv) {
    return null;
  }
  var paczkomatOption = findAncestor(
    paczkomatOptionDiv,
    ".form-checklist-header"
  );
  return paczkomatOption.querySelector("input");
}

function toggleInPostForm() {
  let radio = inPostRadio();
  document.getElementById("inPostForm").style.cssText =
    radio && radio.checked ? "" : "display:none";
}

onShippingLoad(function() {
  initializeUI();
  var paczkomatInput = document.getElementById("field_26Input");
  updateLinkText(paczkomatInput);

  var link = document.getElementById("choosePaczkomatLink");
  link.addEventListener("click", function() {
    console.log("Link click");
    easyPack.modalMap(
      function(point) {
        this.close();
        var chosenPaczkomat = point.name + ": " + point.location_description;
        paczkomatInput.value = chosenPaczkomat;
        fireChange(paczkomatInput);
        link.innerText = chosenPaczkomat;

        toggleRequiredWarning(paczkomatInput);
      },
      { width: 500, height: 600 }
    );
  });

  onShippingOptionsLoad(function() {
    console.log("Shipping options load");
    toggleInPostForm();
  });
  let continueButton = document.getElementById("checkout-shipping-continue");
  continueButton.addEventListener(
    "click",
    function(event) {
      console.log("Button click");
      if (inPostRadio().checked && !paczkomatInput.value) {
        toggleRequiredWarning(paczkomatInput);
        event.stopPropagation();
        event.preventDefault();
      }
    },
    true
  );
});

function fireChange(node) {
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("change", true, true);
  node.dispatchEvent(evt);
}

function findAncestor(el, sel) {
  while (
    (el = el.parentElement) &&
    !(el.matches || el.matchesSelector).call(el, sel)
  );
  return el;
}

window.easyPackAsyncInit = function() {
  easyPack.init({});
};
