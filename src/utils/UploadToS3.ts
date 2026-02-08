interface FilLe {
  uri: string | undefined | null;
  type: string;
  name: string | undefined;
}

export const UploadToS3 = async (image: FilLe, url: string) => {
  try {
    if (!image.uri) return;
    console.log(image.uri)
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const result = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    return url.split("?")[0];
  } catch (error) {
    console.error("Error uploading image", JSON.stringify(error));
    throw error;
  }
};
