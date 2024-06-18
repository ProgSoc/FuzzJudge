import "./app.css";
import App from "./App.svelte";
import { writable, type Writable } from "svelte/store";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
