var h4p = require("feeles-ide").h4p;

// Feeles を起動する
h4p({
  jsonURL: "make-rpg.json",
  rootElement: document.querySelector('h4p__app')
});

if (process.env.NODE_ENV === "production") {
  // Offline plugin
  require("offline-plugin/runtime").install();
}
