

export class Clock {
    #start: Date;
    #freeze: Date;
    #stop: Date;

    constructor(config: unknown | undefined) {
        this.#start = new Date(Object(config)?.start);
        this.#freeze = new Date(Object(config)?.freeze);
        this.#stop = new Date(Object(config)?.stop);
        if (!(this.#start && this.#freeze && this.#stop)) {
            throw "Timing config in comp file does not contain all fields"
        }
        if (this.#freeze < this.#start || this.#stop < this.#start) {
            throw "Timing config in comp file has out of order times"
        }
    }

    times_json(): string {
        const obj = {start: this.#start, freeze: this.#freeze, stop: this.#stop};
        return JSON.stringify(obj);
    }

    protected(_ctx: Request) {
        // TODO
    }
}