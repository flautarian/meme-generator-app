import InitMemes from "./InitMemes";

export const Utils = {
    getRandomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getInitMemes: () => {
        return InitMemes;
    }
}
