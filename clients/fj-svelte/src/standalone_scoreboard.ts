import "./app.css";
import StandaloneScoreboard from "./StandaloneScoreboard.svelte";

const app = new StandaloneScoreboard({
  target: document.getElementById("app")!,
});

export default app;
