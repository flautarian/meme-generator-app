import initMemeDecorations from "./initMemeDecorations";
import InitMemes from "./InitMemes";
import documentUploadOption from "./documentUploadOption";

export const Utils = {
    getRandomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getInitMemes: () => {
        return InitMemes;
    },
    getInitMemeDecorations: () => {
        return initMemeDecorations;
    },
    getDocumentUploadOption: () => {
        return documentUploadOption;
    },
    checkIfImgLoadedFromUser: (str) => {
        if(!str || typeof str !== "string")
            return false;
        return str.startsWith("data:image");
    }
}
