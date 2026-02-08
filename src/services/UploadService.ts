import { GetHeader, ToastCall } from "../utils/Helpers";
import { HttpService } from "../services";

interface File {
    uri: string;
    type: string;
    name: string;
}

export const getPresignedUrl = async (fileName: string, sessionToken: string, tokenAuthApi: string) => {
    try {
        const host = process.env.APP_BASE_API;
        const url: string = `/api/generate-presigned-url/${fileName}/${sessionToken}`;
        const headers = GetHeader(tokenAuthApi, "application/json");
        const response = await HttpService("get", host, url, {}, headers);

        return response.url; // URL prefirmada
    } catch (error) {
        console.error("Error obteniendo URL prefirmada: ", error);
        throw error;
    }
};

export const uploadToS3 = async (fileUri: string, url: string, fileType: string) => {
    try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        await fetch(url, {
            method: "PUT",
            body: blob,
            headers: {
                "Content-Type": fileType,
            },
        });

        return url.split("?")[0];
    } catch (error) {
        console.error("Error uploading file to S3", JSON.stringify(error));
        throw error;
    }
};
