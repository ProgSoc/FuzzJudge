import { client } from "./gql/client";

export function setupCounter(element: HTMLButtonElement) {
	const me = client.GetMe();
	console.log("me", me);
	let counter = 0;
	const setCounter = (count: number) => {
		counter = count;
		element.innerHTML = `count is ${counter}`;
	};
	element.addEventListener("click", () => setCounter(counter + 1));
	setCounter(0);
}
