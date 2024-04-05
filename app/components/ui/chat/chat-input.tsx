import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import UploadImagePreview from "../upload-image-preview";
import { ChatHandler } from "./chat.interface";
import { QuestionCard } from "../question-card";
import { ButtonLoading } from "../loading-button";

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
  > & {
    multiModal?: boolean;
  },
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(true);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (imageUrl) {
      props.handleSubmit(e, {
        data: { imageUrl: imageUrl },
      });
      setImageUrl(null);
      setShowButtons(false);
      return;
    }
    props.handleSubmit(e);
    setShowButtons(false);
  };

  const onRemovePreviewImage = () => setImageUrl(null);

  const handleUploadImageFile = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    setImageUrl(base64);
  };

  // const handleUploadFile = async (file: File) => {
  //   try {
  //     if (props.multiModal && file.type.startsWith("image/")) {
  //       return await handleUploadImageFile(file);
  //     }
  //     props.onFileUpload?.(file);
  //   } catch (error: any) {
  //     props.onFileError?.(error.message);
  //   }
  // };
  const handleQuestionClick = (question: string) => {
    props.handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>);
    setShowButtons(false);

    // Trigger form submission after a short delay
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100); // Adjust the delay as needed
  };

  const handleButtonsHidden = () => {
    setShowButtons(false);
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl --muted-foreground p-4 shadow-2xl shadow-muted-foreground/40 space-y-4">
      {showButtons && (
        <QuestionCard
          onQuestionClick={handleQuestionClick}
          onButtonsHidden={handleButtonsHidden}
        />
      )}
      {imageUrl && <UploadImagePreview url={imageUrl} onRemove={onRemovePreviewImage} />}
      <div className="flex w-full items-start justify-between gap-4">
        <Input
          autoFocus
          name="message"
          placeholder="Type a message"
          className="flex-1 --muted --primary-foreground" // Use dynamic color variables
          value={props.input}
          onChange={props.handleInputChange}
        />
        {/* <FileUploader
          onFileUpload={handleUploadFile}
          onFileError={props.onFileError}
        /> */}
        {props.isLoading ? (
          <ButtonLoading />
        ) : (
          <Button type="submit" className="--background --primary-foreground px-6"> 
            Send
          </Button>
        )}
      </div>
    </form>
  );
}
