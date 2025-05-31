import { client } from "./gql/client";

export function setupCounter(element: HTMLButtonElement) {
	client
		.GetMe()
		.then((res) => {
			console.log("me", res.data.me);
		})
		.catch((err) => {
			console.error("Error fetching user data:", err);
		});
	let counter = 0;
	const setCounter = (count: number) => {
		counter = count;
		element.innerHTML = `count is ${counter}`;
	};
	element.addEventListener("click", () => setCounter(counter + 1));
	setCounter(0);
}
